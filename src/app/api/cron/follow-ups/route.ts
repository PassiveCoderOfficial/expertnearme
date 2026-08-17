import { NextRequest, NextResponse } from "next/server";
import { processDueEnrollments, enrollDormantLeads } from "@/lib/follow-up/engine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Hourly. Sends everything due, then sweeps for newly-dormant past customers.
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();
  try {
    const sent = await processDueEnrollments(200);
    const dormant = await enrollDormantLeads(100);

    return NextResponse.json({
      ok: true,
      at: startedAt.toISOString(),
      ms: Date.now() - startedAt.getTime(),
      ...sent,
      dormantEnrolled: dormant.enrolled,
    });
  } catch (err) {
    console.error("follow-up cron failed:", err);
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "unknown" },
      { status: 500 }
    );
  }
}
