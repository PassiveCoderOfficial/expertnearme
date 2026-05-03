import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSetting, setSetting } from '@/lib/settings';

const DEFAULTS = {
  backup_enabled: 'true',
  backup_hourly_keep: '4',
  backup_daily_keep: '6',
  backup_include_code: 'true',
  backup_include_db: 'true',
  backup_include_storage: 'true',
};

export async function GET() {
  const entries = await Promise.all(
    Object.entries(DEFAULTS).map(async ([key, def]) => {
      const val = await getSetting(key);
      return [key, val ?? def] as [string, string];
    })
  );
  return NextResponse.json(Object.fromEntries(entries));
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated || session.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const allowed = Object.keys(DEFAULTS);
  await Promise.all(
    Object.entries(body)
      .filter(([k]) => allowed.includes(k))
      .map(([k, v]) => setSetting(k, String(v)))
  );

  const entries = await Promise.all(
    Object.entries(DEFAULTS).map(async ([key, def]) => {
      const val = await getSetting(key);
      return [key, val ?? def] as [string, string];
    })
  );
  return NextResponse.json(Object.fromEntries(entries));
}
