import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Suppression is global and unauthenticated by design: an unsubscribe link must
// work in one click from any mail client, with no login. Worst case someone
// suppresses an address they don't own, which fails safe (fewer messages sent).
async function suppress(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return false;

  await prisma.followUpSuppression.upsert({
    where: { email: normalized },
    update: {},
    create: { email: normalized, reason: "unsubscribed" },
  });

  // Stop anything already in flight for this address.
  const leads = await prisma.lead.findMany({
    where: { email: { equals: normalized, mode: "insensitive" } },
    select: { id: true },
  });
  if (leads.length) {
    await prisma.followUpEnrollment.updateMany({
      where: { leadId: { in: leads.map((l) => l.id) }, status: "ACTIVE" },
      data: {
        status: "STOPPED",
        stopReason: "UNSUBSCRIBED",
        nextRunAt: null,
        completedAt: new Date(),
      },
    });
  }
  return true;
}

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "";
  const ok = await suppress(email);

  return new NextResponse(
    `<!doctype html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Unsubscribed</title></head>
     <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:80px auto;padding:0 24px;color:#1e293b">
       <h1 style="font-size:22px;margin:0 0 12px">${ok ? "You're unsubscribed" : "Invalid link"}</h1>
       <p style="font-size:15px;color:#475569;line-height:1.6">${
         ok
           ? "You won't receive any more follow-up messages. Replies to an existing conversation still reach the business directly."
           : "That unsubscribe link was missing a valid email address."
       }</p>
     </body></html>`,
    { status: ok ? 200 : 400, headers: { "content-type": "text/html; charset=utf-8" } }
  );
}

// Gmail/Yahoo one-click unsubscribe posts to the same URL.
export async function POST(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email") || "";
  const ok = await suppress(email);
  return NextResponse.json({ ok }, { status: ok ? 200 : 400 });
}
