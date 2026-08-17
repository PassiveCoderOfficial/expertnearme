import { prisma } from "@/lib/db";
import { Resend } from "resend";
import type { ResolvedChannel } from "./engine";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://expertnear.me";

type DeliverArgs = {
  channel: ResolvedChannel;
  lead: { id: number; name: string; email: string | null; buyerUserId: number | null };
  expert: { id: number; name: string; email: string; businessName: string | null };
  settings: { fromName: string | null; replyToEmail: string | null };
  subject: string | null;
  body: string;
};

export type DeliverResult = {
  ok: boolean;
  chatMessageId?: number;
  error?: string;
};

export async function deliver(args: DeliverArgs): Promise<DeliverResult> {
  try {
    return args.channel === "IN_APP" ? await deliverInApp(args) : await deliverEmail(args);
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Send through the existing conversation system, authored by the expert's own
 * user account. The buyer sees a normal message from the business — replying
 * is one tap and lands in the expert's inbox.
 */
async function deliverInApp(args: DeliverArgs): Promise<DeliverResult> {
  const { lead, expert, body } = args;
  if (!lead.buyerUserId) return { ok: false, error: "lead has no linked user" };

  // Expert and User are linked by shared email throughout this codebase.
  const expertUser = await prisma.user.findUnique({
    where: { email: expert.email },
    select: { id: true },
  });
  if (!expertUser) return { ok: false, error: "no user account for expert" };
  if (expertUser.id === lead.buyerUserId) return { ok: false, error: "self-message" };

  const [p1, p2] =
    expertUser.id < lead.buyerUserId
      ? [expertUser.id, lead.buyerUserId]
      : [lead.buyerUserId, expertUser.id];

  const conv = await prisma.conversation.upsert({
    where: { participant1_participant2: { participant1: p1, participant2: p2 } },
    update: { updatedAt: new Date() },
    create: { participant1: p1, participant2: p2 },
  });

  const message = await prisma.message.create({
    data: { conversationId: conv.id, senderId: expertUser.id, content: body },
  });

  await prisma.notification.create({
    data: {
      userId: lead.buyerUserId,
      title: "New Message",
      message: `${expert.businessName || expert.name} sent you a message.`,
      type: "message",
      link: "/dashboard/messages",
    },
  });

  return { ok: true, chatMessageId: message.id };
}

async function deliverEmail(args: DeliverArgs): Promise<DeliverResult> {
  const { lead, expert, settings, subject, body } = args;
  if (!lead.email) return { ok: false, error: "lead has no email" };
  if (!resend) return { ok: false, error: "RESEND_API_KEY not configured" };

  const senderName = settings.fromName || expert.businessName || expert.name;
  const replyTo = settings.replyToEmail || expert.email;
  const unsubUrl = `${APP_URL}/api/follow-ups/unsubscribe?email=${encodeURIComponent(lead.email)}`;

  const { error } = await resend.emails.send({
    from: `${senderName} via ExpertNear.Me <hello@expertnear.me>`,
    replyTo,
    to: lead.email,
    subject: subject || `Following up — ${senderName}`,
    html: emailShell({ body, senderName, unsubUrl }),
    headers: {
      // One-click unsubscribe keeps deliverability intact and is required by
      // bulk-sender rules at Gmail and Yahoo.
      "List-Unsubscribe": `<${unsubUrl}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  });

  if (error) return { ok: false, error: error.message || "resend error" };
  return { ok: true };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function emailShell({
  body,
  senderName,
  unsubUrl,
}: {
  body: string;
  senderName: string;
  unsubUrl: string;
}): string {
  const paragraphs = escapeHtml(body)
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="font-size:15px;color:#334155;line-height:1.65;margin:0 0 16px">${p.replace(
          /\n/g,
          "<br/>"
        )}</p>`
    )
    .join("");

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#1e293b">
      ${paragraphs}
      <p style="font-size:14px;color:#475569;margin:24px 0 0">— ${escapeHtml(senderName)}</p>
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0 16px"/>
      <p style="font-size:12px;color:#94a3b8;margin:0;line-height:1.5">
        You're receiving this because you enquired with ${escapeHtml(senderName)}.
        <a href="${unsubUrl}" style="color:#94a3b8">Unsubscribe</a>
      </p>
    </div>
  `;
}
