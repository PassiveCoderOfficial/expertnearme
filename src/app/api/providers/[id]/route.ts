// src/app/api/providers/[id]/route.ts

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// PUT /api/providers/[id] → update provider
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  try {
    const { name, email, phone, categories } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const provider = await prisma.provider.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        categories: {
          deleteMany: {}, // remove old links
          create: categories?.map((catId: number) => ({
            category: { connect: { id: catId } },
          })) || [],
        },
      },
      include: {
        categories: { include: { category: true } },
      },
    });

    return NextResponse.json(provider);
  } catch (err: any) {
    console.error('PUT /providers/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update provider' }, { status: 500 });
  }
}

// DELETE /api/providers/[id] → delete provider
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = Number(params.id);

  try {
    await prisma.provider.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('DELETE /providers/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete provider' }, { status: 500 });
  }
}
