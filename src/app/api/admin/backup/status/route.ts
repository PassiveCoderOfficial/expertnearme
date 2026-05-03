import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getSetting, setSetting } from '@/lib/settings';

// POST: workflow reports status
// GET: admin panel reads status
export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const keys = ['backup_last_run', 'backup_last_status', 'backup_last_db_size',
    'backup_last_storage_size', 'backup_last_code_size', 'backup_last_error'];

  const entries = await Promise.all(
    keys.map(async (k) => [k, await getSetting(k)] as [string, string | null])
  );
  return NextResponse.json(Object.fromEntries(entries));
}

export async function POST(req: NextRequest) {
  // Secured by CRON_SECRET (same as blog scheduler)
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const updates: Record<string, string> = {
    backup_last_run: new Date().toISOString(),
    backup_last_status: body.status ?? 'unknown',
  };
  if (body.db_size) updates.backup_last_db_size = body.db_size;
  if (body.storage_size) updates.backup_last_storage_size = body.storage_size;
  if (body.code_size) updates.backup_last_code_size = body.code_size;
  if (body.error) updates.backup_last_error = body.error;
  else updates.backup_last_error = '';

  await Promise.all(Object.entries(updates).map(([k, v]) => setSetting(k, v)));
  return NextResponse.json({ ok: true });
}
