import { NextRequest, NextResponse } from 'next/server';
import { getGameSnapshot, resetGameState, runGameAction } from '@/lib/questions';
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
    action?: 'pick' | 'reveal' | 'answer' | 'next' | 'reset';
  } | null;

  if (!body?.action) {
    return jsonError('Не передано действие.');
  }

  if (body.action === 'reset') {
    const snapshot = await resetGameState();
    return NextResponse.json({ snapshot });
  }

  const snapshot = await runGameAction(body.action);
  return NextResponse.json({ snapshot });
}
