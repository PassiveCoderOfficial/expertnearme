import { prisma } from "@/lib/db";
import type { FollowUpTrigger } from "@prisma/client";

// System sequence templates. Cloned per-expert on first edit; never edited in place.
// Copy is deliberately plain and short — it should read like the owner typed it
// on a phone between jobs, not like marketing automation.

type StepSeed = {
  stepOrder: number;
  delayHours: number;
  subject: string;
  body: string;
};

type SequenceSeed = {
  key: string;
  name: string;
  description: string;
  trigger: FollowUpTrigger;
  dormantAfterDays?: number;
  steps: StepSeed[];
};

export const SYSTEM_SEQUENCES: SequenceSeed[] = [
  {
    key: "new-lead-nudge",
    name: "New enquiry follow-up",
    description:
      "Four polite nudges over three weeks for enquiries that never got a reply. Stops the moment they respond.",
    trigger: "NEW_LEAD",
    steps: [
      {
        stepOrder: 0,
        delayHours: 24,
        subject: "Following up on your enquiry",
        body: `Hi {{name}},

I wanted to make sure you saw my earlier reply about your enquiry.

Are you still looking to get this sorted? Happy to answer any questions or give you a rough price.

Just reply to this message and I'll get back to you.`,
      },
      {
        stepOrder: 1,
        delayHours: 72,
        subject: "Still need a hand?",
        body: `Hi {{name}},

Checking in once more — are you still looking for help with this?

If the timing isn't right, no problem at all. Just let me know and I'll leave you to it.`,
      },
      {
        stepOrder: 2,
        delayHours: 168,
        subject: "Anything I can help with?",
        body: `Hi {{name}},

I haven't heard back, so I'll assume you're sorted for now.

If anything changes, or you'd like a quote later on, just reply here. I'll keep your details on file.`,
      },
      {
        stepOrder: 3,
        delayHours: 504,
        subject: "Closing this off",
        body: `Hi {{name}},

Last message from me on this one — I'll close the enquiry off.

If you need anything in future, you know where to find me.

All the best.`,
      },
    ],
  },
  {
    key: "dormant-reactivation",
    name: "Past customer reactivation",
    description:
      "Reaches customers who haven't been in touch for six months. This is the cheapest revenue available — people who already know and trust the business.",
    trigger: "REACTIVATION",
    dormantAfterDays: 180,
    steps: [
      {
        stepOrder: 0,
        delayHours: 0,
        subject: "It's been a while",
        body: `Hi {{name}},

It's been a while since we worked together — I hope everything's still holding up well.

If anything needs looking at, or you've got something new coming up, just reply here. Happy to sort it for you.`,
      },
      {
        stepOrder: 1,
        delayHours: 336,
        subject: "Still here if you need me",
        body: `Hi {{name}},

Just a quick note to say I'm still around if you need anything.

Reply any time — no obligation.`,
      },
    ],
  },
  {
    key: "post-booking-review",
    name: "Review request",
    description:
      "Asks for a review right after a completed job, while the customer is still pleased. Reviews drive local ranking, which drives more enquiries.",
    trigger: "POST_BOOKING",
    steps: [
      {
        stepOrder: 0,
        delayHours: 48,
        subject: "How did we do?",
        body: `Hi {{name}},

Thanks again for your business — it was good working with you.

If you've got a spare minute, a short review would genuinely help. It's the main way people find me.

And if anything wasn't right, reply here first and I'll put it straight.`,
      },
      {
        stepOrder: 1,
        delayHours: 168,
        subject: "A quick favour",
        body: `Hi {{name}},

No worries if you've been busy — just a gentle reminder about leaving a review if you were happy with the work.

Thanks either way.`,
      },
    ],
  },
];

/** Idempotent — safe to run on every deploy. */
export async function seedSystemSequences(): Promise<{ created: number; existing: number }> {
  let created = 0;
  let existing = 0;

  for (const seed of SYSTEM_SEQUENCES) {
    const found = await prisma.followUpSequence.findFirst({
      where: { expertId: null, isSystem: true, name: seed.name },
    });
    if (found) {
      existing++;
      continue;
    }
    await prisma.followUpSequence.create({
      data: {
        expertId: null,
        name: seed.name,
        description: seed.description,
        trigger: seed.trigger,
        isSystem: true,
        active: true,
        dormantAfterDays: seed.dormantAfterDays ?? null,
        steps: {
          create: seed.steps.map((s) => ({
            stepOrder: s.stepOrder,
            delayHours: s.delayHours,
            channel: "AUTO" as const,
            subject: s.subject,
            body: s.body,
            active: true,
          })),
        },
      },
    });
    created++;
  }

  return { created, existing };
}
