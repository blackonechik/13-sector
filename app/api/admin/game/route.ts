import { NextRequest, NextResponse } from 'next/server';
import { getGameSnapshot, runGameAction } from '@/lib/questions';
import { jsonError, requireAdminApi } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  void _request;
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const snapshot = await getGameSnapshot();
  return NextResponse.json({ snapshot });
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null) as {
    action?: 'pick' | 'reveal' | 'answer' | 'next';
  } | null;

  if (!body?.action) {
    return jsonError('Не передано действие.');
  }

  const snapshot = await runGameAction(body.action);
  return NextResponse.json({ snapshot });
}
