import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Public — no auth. Returns expert info + bookable services for the widget iframe.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const expert = await prisma.expert.findFirst({
    where: { profileLink: slug, profileVisible: true, verified: true },
    select: {
      id: true,
      name: true,
      businessName: true,
      profilePicture: true,
      countryCode: true,
      allowBooking: true,
      urgentBooking: true,
      urgentFeePercent: true,
      services: {
        where: { availableForBooking: true },
        select: { id: true, name: true, description: true, price: true, rateUnit: true, duration: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!expert) return NextResponse.json({ error: 'Expert not found' }, { status: 404 });
  if (!expert.allowBooking) return NextResponse.json({ error: 'Bookings not enabled' }, { status: 403 });

  return NextResponse.json({ expert }, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
