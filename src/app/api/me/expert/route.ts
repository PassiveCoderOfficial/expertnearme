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
                     'linkedinUrl', 'instagramUrl', 'twitterUrl', 'facebookUrl'];
    for (const key of strings) {
      if (key in body) updateData[key] = (body[key] ?? '').trim() || null;
    }
    if ('isBusiness'  in body) updateData.isBusiness  = Boolean(body.isBusiness);
    if ('featured'    in body) updateData.featured    = Boolean(body.featured);
    if ('latitude'    in body) updateData.latitude    = body.latitude  != null ? Number(body.latitude)  : null;
    if ('longitude'   in body) updateData.longitude   = body.longitude != null ? Number(body.longitude) : null;

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
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
