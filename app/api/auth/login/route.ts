import { NextRequest, NextResponse } from 'next/server';
import { setAdminSessionCookie } from '@/lib/auth';
import { getAdminCredentials } from '@/lib/env';
import { jsonError } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    username?: string;
    password?: string;
  } | null;

  if (!body?.username || !body?.password) {
    return jsonError('Укажите логин и пароль.');
  }

  const credentials = getAdminCredentials();
  if (body.username !== credentials.username || body.password !== credentials.password) {
    return jsonError('Неверный логин или пароль.', 401);
  }

  await setAdminSessionCookie();

  return NextResponse.json({ ok: true });
}
