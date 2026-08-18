import { prisma } from "@/lib/db";
import type {
  FollowUpChannel,
  FollowUpTrigger,
  EnrollmentStopReason,
  Lead,
} from "@prisma/client";
import { deliver } from "./deliver";
import { renderTemplate } from "./template";

// A lead is only ever in one sequence per trigger. Enrollment is idempotent:
// the unique (leadId, sequenceId) constraint makes double-enrolment a no-op
// rather than a duplicate message stream.

export type ResolvedChannel = Exclude<FollowUpChannel, "AUTO">;

/**
 * Decide how to reach a lead. IN_APP wins when the lead is a known ENM user,
 * because replies land in the expert's inbox and reply-detection is exact.
 * Form-captured leads have no account, so they fall back to email.
 * Returns null when there is no usable channel at all.
 */
export function resolveChannel(
  lead: Pick<Lead, "buyerUserId" | "email">,
  preferred: FollowUpChannel,
  emailFallback: boolean
): ResolvedChannel | null {
  if (preferred === "IN_APP") return lead.buyerUserId ? "IN_APP" : null;
  if (preferred === "EMAIL") return lead.email ? "EMAIL" : null;
  // AUTO
  if (lead.buyerUserId) return "IN_APP";
  if (emailFallback && lead.email) return "EMAIL";
  return null;
}

/** Quiet hours are the business's, not ours — never message a buyer at 3am. */
export function isWithinQuietHours(
  now: Date,
  start: number | null,
  end: number | null,
  timezone: string | null
): boolean {
  if (start == null || end == null) return false;
  let hour: number;
  try {
    hour = Number(
      new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: timezone || "UTC",
      }).format(now)
    );
  } catch {
    hour = now.getUTCHours();
  }
  // Window wraps midnight (e.g. 21 → 8)
  return start > end ? hour >= start || hour < end : hour >= start && hour < end;
}

/**
 * Enrol a lead into every active sequence matching a trigger.
 * Safe to call repeatedly — existing enrolments are skipped.
 */
export async function enrollLead(
  leadId: number,
  trigger: FollowUpTrigger
): Promise<number> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, expertId: true, repliedAt: true, status: true },
  });
  if (!lead) return 0;

  // Review requests and reactivation fire *because* the lead converted, so they
  // are exempt from the resolved-lead guard that stops chase sequences.
  const afterConversion = trigger === "POST_BOOKING" || trigger === "REACTIVATION";
  if (!afterConversion) {
    if (lead.repliedAt) return 0;
    if (["BOOKED", "LOST"].includes(lead.status)) return 0;
  } else if (lead.status === "LOST") {
    return 0;
  }

  const settings = await prisma.followUpSettings.findUnique({
    where: { expertId: lead.expertId },
  });
  if (!settings?.enabled) return 0;

  // Expert's own sequences take precedence; system templates are the fallback.
  const own = await prisma.followUpSequence.findMany({
    where: { expertId: lead.expertId, trigger, active: true },
    include: { steps: { where: { active: true }, orderBy: { stepOrder: "asc" } } },
  });
  const sequences = own.length
    ? own
    : await prisma.followUpSequence.findMany({
        where: { expertId: null, isSystem: true, trigger, active: true },
        include: { steps: { where: { active: true }, orderBy: { stepOrder: "asc" } } },
      });

  let created = 0;
  for (const seq of sequences) {
    if (!seq.steps.length) continue;
    const firstStep = seq.steps[0];
    const nextRunAt = new Date(Date.now() + firstStep.delayHours * 3600_000);
    try {
      await prisma.followUpEnrollment.create({
        data: {
          leadId: lead.id,
          sequenceId: seq.id,
          expertId: lead.expertId,
          status: "ACTIVE",
          currentStep: 0,
          nextRunAt,
        },
      });
      created++;
    } catch {
      // Unique constraint — already enrolled. Intentionally silent.
    }
  }
  return created;
}

/**
 * Hard-stop active sequences for a lead. By default this spares post-conversion
 * sequences (review ask, reactivation) — a buyer replying to a chase message
 * should not cancel the review request that follows the finished job.
 * Pass `includePostConversion` for unsubscribe and other absolute stops.
 */
export async function stopEnrollments(
  leadId: number,
  reason: EnrollmentStopReason,
  includePostConversion = false
): Promise<number> {
  const res = await prisma.followUpEnrollment.updateMany({
    where: {
      leadId,
      status: "ACTIVE",
      ...(includePostConversion
        ? {}
        : { sequence: { trigger: { in: ["NEW_LEAD", "DORMANT_LEAD"] } } }),
    },
    data: {
      status: "STOPPED",
      stopReason: reason,
      nextRunAt: null,
      completedAt: new Date(),
    },
  });
  return res.count;
}

/**
 * Called when a buyer replies. Stops sequences and records attribution:
 * if an automated message went out before the reply, the recovery is credited
 * to that sequence. This is what powers the recovered-revenue number.
 */
export async function markLeadReplied(leadId: number): Promise<void> {
  const now = new Date();
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { repliedAt: true, value: true },
  });
  if (!lead || lead.repliedAt) return;

  await prisma.lead.update({
    where: { id: leadId },
    data: { repliedAt: now },
  });

  const active = await prisma.followUpEnrollment.findMany({
    where: {
      leadId,
      status: "ACTIVE",
      // A reply ends the chase, not the review ask.
      sequence: { trigger: { in: ["NEW_LEAD", "DORMANT_LEAD"] } },
    },
    include: {
      messages: { where: { status: "SENT" }, orderBy: { sentAt: "desc" }, take: 1 },
    },
  });

  for (const e of active) {
    const touched = e.messages.length > 0;
    await prisma.followUpEnrollment.update({
      where: { id: e.id },
      data: {
        status: "STOPPED",
        stopReason: "REPLIED",
        nextRunAt: null,
        completedAt: now,
        // Only credit a recovery when the engine actually sent something first.
        ...(touched ? { recoveredAt: now, recoveredValue: lead.value ?? null } : {}),
      },
    });
  }
}

/**
 * Called when a job is finished. Stops any chase sequence still running and
 * enrols the customer into the review request — reviews drive local ranking,
 * which is what generates the next month's enquiries.
 */
export async function onBookingCompleted(bookingId: number): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, expertId: true, clientId: true, completedAt: true },
  });
  if (!booking) return;

  const now = new Date();
  if (!booking.completedAt) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { completedAt: now },
    });
  }

  // Prefer the lead already linked to this booking; otherwise fall back to the
  // most recent lead from the same buyer for this expert.
  let lead = await prisma.lead.findFirst({
    where: { bookingId },
    select: { id: true },
  });
  if (!lead) {
    lead = await prisma.lead.findFirst({
      where: { expertId: booking.expertId, buyerUserId: booking.clientId },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
    if (lead) {
      await prisma.lead.update({ where: { id: lead.id }, data: { bookingId } });
    }
  }
  if (!lead) return;

  // A finished job ends the chase; the review ask is a separate sequence.
  await prisma.followUpEnrollment.updateMany({
    where: {
      leadId: lead.id,
      status: "ACTIVE",
      sequence: { trigger: { in: ["NEW_LEAD", "DORMANT_LEAD"] } },
    },
    data: { status: "STOPPED", stopReason: "BOOKED", nextRunAt: null, completedAt: now },
  });

  await prisma.lead.update({
    where: { id: lead.id },
    data: { status: "BOOKED", repliedAt: null },
  });

  await enrollLead(lead.id, "POST_BOOKING");
}

/**
 * Credit a conversion to the follow-up engine when it had actually sent a
 * message to that lead. Attribution is deliberately conservative: no sent
 * message means no credit, so the recovered-revenue figure never flatters
 * itself with conversions the engine had no part in.
 */
export async function creditRecovery(leadId: number): Promise<boolean> {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { value: true },
  });
  if (!lead) return false;

  const enrollment = await prisma.followUpEnrollment.findFirst({
    where: { leadId, messages: { some: { status: "SENT" } } },
    orderBy: { enrolledAt: "desc" },
    select: { id: true, recoveredAt: true },
  });
  if (!enrollment || enrollment.recoveredAt) return false;

  await prisma.followUpEnrollment.update({
    where: { id: enrollment.id },
    data: { recoveredAt: new Date(), recoveredValue: lead.value ?? null },
  });
  return true;
}

/**
 * Process one due enrollment: send the current step, then schedule the next.
 * Returns what happened, for cron reporting.
 */
export async function runEnrollment(enrollmentId: number): Promise<
  "sent" | "skipped" | "completed" | "stopped" | "failed"
> {
  const enrollment = await prisma.followUpEnrollment.findUnique({
    where: { id: enrollmentId },
    include: {
      lead: true,
      sequence: {
        include: { steps: { where: { active: true }, orderBy: { stepOrder: "asc" } } },
      },
      expert: {
        select: { id: true, name: true, email: true, businessName: true },
      },
    },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") return "stopped";

  const { lead, sequence, expert } = enrollment;

  // Re-check stop conditions — state may have changed since scheduling.
  // Post-conversion sequences (review ask, reactivation) are exempt: they exist
  // precisely because the lead already converted.
  const afterConversion =
    sequence.trigger === "POST_BOOKING" || sequence.trigger === "REACTIVATION";

  if (lead.status === "LOST") {
    await stopEnrollments(lead.id, "LOST");
    return "stopped";
  }
  if (!afterConversion) {
    if (lead.repliedAt) {
      await stopEnrollments(lead.id, "REPLIED");
      return "stopped";
    }
    if (lead.status === "BOOKED") {
      await stopEnrollments(lead.id, "BOOKED");
      return "stopped";
    }
  }

  const settings = await prisma.followUpSettings.findUnique({
    where: { expertId: enrollment.expertId },
  });
  if (!settings?.enabled) {
    await stopEnrollments(lead.id, "SEQUENCE_DISABLED");
    return "stopped";
  }

  const step = sequence.steps[enrollment.currentStep];
  if (!step) {
    await prisma.followUpEnrollment.update({
      where: { id: enrollment.id },
      data: { status: "COMPLETED", nextRunAt: null, completedAt: new Date() },
    });
    return "completed";
  }

  // Respect the cap even if a sequence has more steps than the expert allows.
  const sentCount = await prisma.followUpMessage.count({
    where: { enrollment: { leadId: lead.id }, status: "SENT" },
  });
  if (sentCount >= settings.maxMessagesPerLead) {
    await prisma.followUpEnrollment.update({
      where: { id: enrollment.id },
      data: { status: "COMPLETED", nextRunAt: null, completedAt: new Date() },
    });
    return "completed";
  }

  // Quiet hours: defer rather than drop.
  const now = new Date();
  if (isWithinQuietHours(now, settings.quietHoursStart, settings.quietHoursEnd, settings.timezone)) {
    await prisma.followUpEnrollment.update({
      where: { id: enrollment.id },
      data: { nextRunAt: new Date(now.getTime() + 3600_000) },
    });
    return "skipped";
  }

  const channel = resolveChannel(
    lead,
    step.channel === "AUTO" ? settings.preferredChannel : step.channel,
    settings.emailFallback
  );
  if (!channel) {
    await prisma.followUpEnrollment.update({
      where: { id: enrollment.id },
      data: {
        status: "STOPPED",
        stopReason: "NO_CONTACT_METHOD",
        nextRunAt: null,
        completedAt: now,
      },
    });
    return "stopped";
  }

  // Global suppression — an unsubscribe applies everywhere, not per-expert.
  if (channel === "EMAIL" && lead.email) {
    const suppressed = await prisma.followUpSuppression.findUnique({
      where: { email: lead.email.toLowerCase() },
    });
    if (suppressed) {
      await prisma.followUpEnrollment.update({
        where: { id: enrollment.id },
        data: {
          status: "STOPPED",
          stopReason: "UNSUBSCRIBED",
          nextRunAt: null,
          completedAt: now,
        },
      });
      return "stopped";
    }
  }

  const vars = {
    name: lead.name,
    expertName: expert.name,
    businessName: expert.businessName || expert.name,
    message: lead.message || "",
  };
  const subject = step.subject ? renderTemplate(step.subject, vars) : null;
  const body = renderTemplate(step.body, vars);

  // Claim the step first. The unique (enrollmentId, stepId) constraint means a
  // concurrent cron run cannot send the same step twice.
  let messageRow;
  try {
    messageRow = await prisma.followUpMessage.create({
      data: {
        enrollmentId: enrollment.id,
        stepId: step.id,
        channel,
        toAddress: channel === "EMAIL" ? lead.email : null,
        subject,
        body,
        status: "PENDING",
      },
    });
  } catch {
    return "skipped"; // already claimed by another run
  }

  const result = await deliver({
    channel,
    lead,
    expert,
    settings,
    subject,
    body,
  });

  const hasNextStep = enrollment.currentStep + 1 < sequence.steps.length;
  const nextStep = hasNextStep ? sequence.steps[enrollment.currentStep + 1] : null;

  if (result.ok) {
    await prisma.$transaction([
      prisma.followUpMessage.update({
        where: { id: messageRow.id },
        data: { status: "SENT", sentAt: now, chatMessageId: result.chatMessageId ?? null },
      }),
      prisma.lead.update({
        where: { id: lead.id },
        data: {
          lastContactAt: now,
          // First automated touch moves a NEW lead to CONTACTED.
          ...(lead.status === "NEW" ? { status: "CONTACTED" as const } : {}),
        },
      }),
      prisma.followUpEnrollment.update({
        where: { id: enrollment.id },
        data: nextStep
          ? {
              currentStep: enrollment.currentStep + 1,
              // Delays are measured from enrolment, so schedule off enrolledAt.
              nextRunAt: new Date(
                enrollment.enrolledAt.getTime() + nextStep.delayHours * 3600_000
              ),
            }
          : { status: "COMPLETED", nextRunAt: null, completedAt: now },
      }),
    ]);
    return "sent";
  }

  await prisma.followUpMessage.update({
    where: { id: messageRow.id },
    data: { status: "FAILED", error: result.error?.slice(0, 500) ?? "unknown" },
  });
  // A failed send shouldn't wedge the sequence — retry this step in an hour.
  await prisma.followUpEnrollment.update({
    where: { id: enrollment.id },
    data: { nextRunAt: new Date(now.getTime() + 3600_000) },
  });
  return "failed";
}

/** Find and run everything that is due. Called by cron. */
export async function processDueEnrollments(limit = 100) {
  const due = await prisma.followUpEnrollment.findMany({
    where: { status: "ACTIVE", nextRunAt: { lte: new Date() } },
    select: { id: true },
    orderBy: { nextRunAt: "asc" },
    take: limit,
  });

  const tally = { sent: 0, skipped: 0, completed: 0, stopped: 0, failed: 0 };
  for (const { id } of due) {
    try {
      tally[await runEnrollment(id)]++;
    } catch (err) {
      tally.failed++;
      console.error(`follow-up enrollment ${id} failed:`, err);
    }
  }
  return { due: due.length, ...tally };
}

/**
 * Reactivation: enrol past customers who have gone quiet.
 * This is the feature that pays for the subscription — it mines contacts the
 * business already has rather than requiring new lead volume.
 */
export async function enrollDormantLeads(limit = 200) {
  const sequences = await prisma.followUpSequence.findMany({
    where: { trigger: "REACTIVATION", active: true },
    select: { id: true, expertId: true, dormantAfterDays: true },
  });

  let enrolled = 0;
  for (const seq of sequences) {
    const days = seq.dormantAfterDays ?? 180;
    const cutoff = new Date(Date.now() - days * 86_400_000);

    const leads = await prisma.lead.findMany({
      where: {
        ...(seq.expertId ? { expertId: seq.expertId } : {}),
        status: { in: ["BOOKED", "QUALIFIED"] },
        OR: [{ lastContactAt: { lte: cutoff } }, { lastContactAt: null, createdAt: { lte: cutoff } }],
        followUpEnrollments: { none: { sequenceId: seq.id } },
        expert: { followUpSettings: { enabled: true } },
      },
      select: { id: true },
      take: limit,
    });

    for (const lead of leads) {
      enrolled += await enrollLead(lead.id, "REACTIVATION");
    }
  }
  return { enrolled };
}
