import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(countries);
  } catch (error) {
    console.error('Error fetching countries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch countries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name, active, landingContent, currency, timezone, phoneCode, flagEmoji, metaTitle, metaDesc } = body;

    if (!code || !name) {
      return NextResponse.json(
        { error: 'Code and name are required' },
        { status: 400 }
      );
    }

    const existing = await prisma.country.findUnique({
      where: { code: code.toLowerCase() },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Country with this code already exists' },
        { status: 400 }
      );
    }

    const country = await prisma.country.create({
      data: {
        code: code.toLowerCase(),
        name,
        active: active ?? true,
        landingContent,
        currency,
        timezone,
        phoneCode,
        flagEmoji,
        metaTitle,
        metaDesc,
      },
    });

    return NextResponse.json(country, { status: 201 });
  } catch (error) {
    console.error('Error creating country:', error);
    return NextResponse.json(
      { error: 'Failed to create country' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json(
        { error: 'Country code is required' },
        { status: 400 }
      );
    }

    const country = await prisma.country.delete({
      where: { code: code.toLowerCase() },
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