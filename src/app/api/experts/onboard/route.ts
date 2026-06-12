import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendExpertWelcome } from '@/lib/email';

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'expert';
}

async function uniqueSlug(base: string, countryCode: string): Promise<string> {
  let slug = slugify(base);
  let n = 0;
  while (true) {
    const candidate = n === 0 ? slug : `${slug}-${n}`;
    const exists = await prisma.expert.findFirst({ where: { countryCode, profileLink: candidate } });
    if (!exists) return candidate;
    n++;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email    = (body.email    ?? '').trim().toLowerCase();
    const password = (body.password ?? '').trim();
    const name     = (body.name     ?? '').trim();
    const countryCode = (body.countryCode ?? '').trim().toLowerCase();

    if (!email || !password || !name || !countryCode) {
      return NextResponse.json(
        { error: 'Email, password, name and country are required.' },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    // Check country is active
    const country = await prisma.country.findFirst({ where: { code: countryCode, active: true } });
    if (!country) {
      return NextResponse.json({ error: 'Selected country is not supported.' }, { status: 400 });
    }

    // Prevent duplicate user accounts
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    const isBusiness   = Boolean(body.isBusiness);
    const businessName = (body.businessName ?? '').trim() || null;
    const phone        = (body.phone        ?? '').trim() || null;
    const whatsapp     = (body.whatsapp     ?? '').trim() || null;
    const bio          = (body.bio          ?? '').trim() || null;
    const shortDesc    = (body.shortDesc    ?? '').trim() || null;
    const webAddress   = (body.webAddress   ?? '').trim() || null;
    const categoryIds: number[] = Array.isArray(body.categoryIds) ? body.categoryIds.map(Number).filter(Boolean) : [];

    const hashedPassword = await bcrypt.hash(password, 10);
    const displayName    = businessName || name;
    const slug           = await uniqueSlug(displayName, countryCode);

    // Create user account
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'EXPERT',
        roles: ['EXPERT'],
        activeRole: 'EXPERT',
        defaultRole: 'EXPERT',
        verified: true,
      },
    });

    // Check for an existing founding-expert placeholder (created by LS webhook)
    const placeholder = await prisma.expert.findUnique({ where: { email } });

    let expert;
    if (placeholder) {
      // Upgrade the placeholder with full profile data
      expert = await prisma.expert.update({
        where: { email },
        data: {
          name: displayName,
          phone,
          whatsapp,
          isBusiness,
          businessName,
          countryCode,
          bio,
          shortDesc,
          webAddress,
          profileLink: placeholder.profileLink ?? slug,
        },
      });
    } else {
      expert = await prisma.expert.create({
        data: {
          name: displayName,
          email,
          phone,
          whatsapp,
          isBusiness,
          businessName,
          countryCode,
          bio,
          shortDesc,
          webAddress,
          profileLink: slug,
        },
      });
    }

    // Link selected categories
    for (const catId of categoryIds) {
      try {
        await prisma.expertCategory.create({ data: { expertId: expert.id, categoryId: catId } });
      } catch {
        // ignore duplicates
      }
    }

    // Attribute to referring agent if a referral code was carried through
    const ref = (body.ref ?? '').trim();
    if (ref) {
      try {
        const referral = await prisma.agentReferral.findUnique({ where: { referralCode: ref } });
        if (referral && referral.referrerId !== user.id) {
          await prisma.agentReferral.update({
            where: { id: referral.id },
            data: {
              referredUserId: referral.referredUserId ?? user.id,
              referredExpertId: referral.referredExpertId ?? expert.id,
              status: referral.status === 'PENDING' ? 'ACTIVE' : referral.status,
            },
          });
        }
      } catch (e) {
        console.error('referral attribution failed', e);
      }
    }

    sendExpertWelcome(email, displayName).catch(() => {});

    // Auto-login: issue JWT same as login route
    const token = jwt.sign(
      { userId: user.id, role: 'EXPERT', activeRole: 'EXPERT', roles: ['EXPERT'], email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookieOpts = { httpOnly: true, path: '/', sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7 };
    const res = NextResponse.json({
      ok: true,
      slug:        expert.profileLink,
      countryCode: expert.countryCode,
      expertId:    expert.id,
    });
    res.cookies.set({ name: 'token',  value: token,             ...cookieOpts });
    res.cookies.set({ name: 'userId', value: String(user.id),   ...cookieOpts });
    res.cookies.set({ name: 'email',  value: user.email,        ...cookieOpts });
    res.cookies.set({ name: 'role',   value: 'EXPERT',          ...cookieOpts });
    return res;
  } catch (err) {
    console.error('Onboard error:', err);
    const msg = err instanceof Error ? err.message : 'Registration failed. Please try again.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
