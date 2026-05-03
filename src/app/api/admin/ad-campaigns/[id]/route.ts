import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "ADMIN"]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const campaign = await prisma.adCampaign.findUnique({
      where: { id: Number(id) },
      include: {
        expert: {
          select: {
            id: true,
            name: true,
            profileLink: true,
            profilePicture: true,
          },
        },
        placement: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ campaign });
  } catch (err) {
    console.error("GET /api/admin/ad-campaigns/[id] error:", err);
    return NextResponse.json({ error: "Failed to fetch campaign" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaignId = Number(id);

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "impression") {
      const updated = await prisma.adCampaign.update({
        where: { id: campaignId },
        data: { impressions: { increment: 1 } },
        select: { id: true, impressions: true },
      });
      return NextResponse.json({ ok: true, impressions: updated.impressions });
    }

    if (action === "click") {
      const updated = await prisma.adCampaign.update({
        where: { id: campaignId },
        data: { clicks: { increment: 1 } },
        select: { id: true, clicks: true },
      });
      return NextResponse.json({ ok: true, clicks: updated.clicks });
    }

    const session = await getSession();
    if (!session?.authenticated || !ADMIN_ROLES.has(session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const existing = await prisma.adCampaign.findUnique({ where: { id: campaignId } });
    if (!existing) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (action === "approve") {
      const updated = await prisma.adCampaign.update({
        where: { id: campaignId },
        data: {
          status: "ACTIVE",
          approvedBy: session.userId,
          approvedAt: new Date(),
        },
      });
      return NextResponse.json({ campaign: updated });
    }

    if (action === "reject") {
      const updated = await prisma.adCampaign.update({
        where: { id: campaignId },
        data: {
          status: "CANCELLED",
          adminNote: body.adminNote ?? existing.adminNote,
        },
      });
      return NextResponse.json({ campaign: updated });
    }

    const { status, adminNote } = body;
    const updated = await prisma.adCampaign.update({
      where: { id: campaignId },
      data: {
        ...(status && { status }),
        ...(adminNote !== undefined && { adminNote: adminNote || null }),
      },
    });

    return NextResponse.json({ campaign: updated });
  } catch (err) {
    console.error("PATCH /api/admin/ad-campaigns/[id] error:", err);
    return NextResponse.json({ error: "Failed to update campaign" }, { status: 500 });
  }
}
