import { NextResponse } from 'next/server';
import { isAuthenticatedAdmin } from '@/lib/auth';

export async function requireAdminApi() {
  const authenticated = await isAuthenticatedAdmin();

  if (!authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
