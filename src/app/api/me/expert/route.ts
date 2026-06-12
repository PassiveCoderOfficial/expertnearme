import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const expert = await prisma.expert.findUnique({
      where: { email: session.email },
      include: {
        categories: { include: { category: true } },
        services:   true,
        portfolio:  true,
      },
    });

    if (!expert) {
      return NextResponse.json({ expert: null });
    }

    return NextResponse.json({ ok: true, expert });
  } catch (err) {
    console.error('GET /api/me/expert:', err);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const existing = await prisma.expert.findUnique({ where: { email: session.email } });
    if (!existing) {
      return NextResponse.json({ error: 'Expert profile not found.' }, { status: 404 });
    }

    const body = await request.json();

    const updateData: Record<string, unknown> = {};
    const strings = ['name', 'businessName', 'contactPerson', 'phone', 'whatsapp',
                     'bio', 'shortDesc', 'webAddress', 'officeAddress',
                     'profilePicture', 'coverPhoto', 'mapLocation',
                     'linkedinUrl', 'instagramUrl', 'twitterUrl', 'facebookUrl',
                     'serviceTitle', 'responseTime', 'startingRateUnit',
                     'videoIntroUrl', 'ctaLabel', 'ctaUrl', 'tiktokUrl', 'youtubeUrl'];
    for (const key of strings) {
      if (key in body) updateData[key] = (body[key] ?? '').trim() || null;
    }
    if ('isBusiness'         in body) updateData.isBusiness         = Boolean(body.isBusiness);
    if ('featured'           in body) updateData.featured           = Boolean(body.featured);
    if ('profileVisible'     in body) updateData.profileVisible     = Boolean(body.profileVisible);
    if ('allowBooking'       in body) updateData.allowBooking       = Boolean(body.allowBooking);
    if ('urgentBooking'      in body) updateData.urgentBooking      = Boolean(body.urgentBooking);
    if ('blockSlotAfterBooking' in body) updateData.blockSlotAfterBooking = Boolean(body.blockSlotAfterBooking);
    if ('latitude'           in body) updateData.latitude           = body.latitude  != null ? Number(body.latitude)  : null;
    if ('longitude'          in body) updateData.longitude          = body.longitude != null ? Number(body.longitude) : null;
    if ('yearsOfExperience'  in body) updateData.yearsOfExperience  = body.yearsOfExperience != null ? Number(body.yearsOfExperience) : null;
    if ('startingRate'       in body) updateData.startingRate       = body.startingRate != null ? Number(body.startingRate) : null;
    if ('clientsServed'      in body) updateData.clientsServed      = body.clientsServed != null ? Number(body.clientsServed) : null;
    if ('projectMinimum'     in body) updateData.projectMinimum     = body.projectMinimum != null ? Number(body.projectMinimum) : null;
    if ('urgentFeePercent'   in body) updateData.urgentFeePercent   = body.urgentFeePercent != null ? Number(body.urgentFeePercent) : 50;
    const validStatuses = ['AVAILABLE', 'AWAY', 'BUSY', 'VACATION'];
    if ('availabilityStatus' in body && validStatuses.includes(body.availabilityStatus)) {
      updateData.availabilityStatus = body.availabilityStatus;
    }

    const expert = await prisma.expert.update({
      where: { email: session.email },
      data: updateData,
    });

    // Sync categories if provided
    if (Array.isArray(body.categoryIds)) {
      await prisma.expertCategory.deleteMany({ where: { expertId: expert.id } });
      for (const catId of body.categoryIds.map(Number).filter(Boolean)) {
        try {
          await prisma.expertCategory.create({ data: { expertId: expert.id, categoryId: catId } });
        } catch {}
      }
    }

    return NextResponse.json({ ok: true, expert });
  } catch (err) {
    console.error('PATCH /api/me/expert:', err);
    const diag = new URL(request.url).searchParams.get('__diag') === 'enm2026' && err instanceof Error
      ? { name: err.name, message: String(err.message).slice(0, 800) }
      : undefined;
    return NextResponse.json({ error: 'Failed to update profile', diag }, { status: 500 });
  }
}
