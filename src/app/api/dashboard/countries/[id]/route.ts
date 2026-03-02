import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const country = await prisma.country.findUnique({
      where: { code: id.toLowerCase() },
    });

    if (!country) {
      return NextResponse.json(
        { error: 'Country not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(country);
  } catch (error) {
    console.error('Error fetching country:', error);
    return NextResponse.json(
      { error: 'Failed to fetch country' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const body = await request.json();
    const { name, active, landingContent, currency, timezone, phoneCode, flagEmoji, metaTitle, metaDesc } = body;
    const { id } = await params;

    const updated = await prisma.country.update({
      where: { code: id.toLowerCase() },
      data: {
        name,
        active: active === undefined ? undefined : Boolean(active),
        landingContent,
        currency,
        timezone,
        phoneCode,
        flagEmoji,
        metaTitle,
        metaDesc,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating country:', error);
    return NextResponse.json(
      { error: 'Failed to update country' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const country = await prisma.country.delete({
      where: { code: id.toLowerCase() },
    });

    return NextResponse.json(
      { message: 'Country deleted successfully', country },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting country:', error);
    return NextResponse.json(
      { error: 'Failed to delete country' },
      { status: 500 }
    );
  }
}
