import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.authenticated || !['SUPER_ADMIN', 'ADMIN'].includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { run_code = true, run_db = true, run_storage = true } = await req.json().catch(() => ({}));

  const owner = process.env.GH_OWNER;
  const repo = process.env.GH_REPO;
  const token = process.env.GH_PAT;

  if (!owner || !repo || !token) {
    return NextResponse.json({ error: 'GitHub dispatch not configured' }, { status: 503 });
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/workflows/backup.yml/dispatches`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ref: 'main',
      inputs: { run_code: String(run_code), run_db: String(run_db), run_storage: String(run_storage) },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `GitHub API error: ${text}` }, { status: 502 });
  }

  return NextResponse.json({ ok: true, message: 'Backup workflow triggered' });
}
