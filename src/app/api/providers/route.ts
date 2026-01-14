/**
 * src/app/api/providers/route.ts
 *
 * Purpose:
 * --------
 * Handle creation of new providers via POST /api/providers.
 *
 * Behavior:
 * ---------
 * - Accepts provider details (name, email, phone)
 * - Accepts an array of category IDs to link the provider to
 * - Validates required fields
 * - Ensures email is unique
 * - Creates provider and links to categories via join table
 *
 * Notes for future developers:
 * ----------------------------
 * - PrismaClient is instantiated here for simplicity; consider a shared singleton in production.
 * - Linking is done via ProviderCategory join table.
 * - Error messages are explicit for frontend feedback.
 */

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { name, email, phone, categories } = await req.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 });
    }

    // Ensure email is unique
    const existing = await prisma.provider.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Provider with this email already exists' }, { status: 409 });
    }

    // Create provider
    const provider = await prisma.provider.create({
      data: {
        name,
        email,
        phone,
        categories: {
          create: (categories ?? []).map((catId: number) => ({
            category: { connect: { id: catId } },
          })),
        },
      },
      include: {
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json(provider, { status: 201 });
  } catch (err: any) {
    console.error('POST /providers error:', err);
    return NextResponse.json({ error: 'Failed to create provider' }, { status: 500 });
  }
}
