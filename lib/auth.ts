import { cookies } from 'next/headers';
import { getAdminCredentials, getSessionSecret } from '@/lib/env';

const COOKIE_NAME = 'admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 12;

type SessionPayload = {
  u: string;
  e: number;
};

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('');
}

async function signPayload(payload: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSessionSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return toHex(signature);
}

export async function createSessionToken() {
  const { username } = getAdminCredentials();
  const payload = encodeURIComponent(JSON.stringify({
    u: username,
    e: Date.now() + SESSION_TTL_MS,
  } satisfies SessionPayload));
  const signature = await signPayload(payload);

  return `${payload}.${signature}`;
}

export async function verifySessionToken(token?: string | null) {
  if (!token) {
    return false;
  }

  const [payload, signature] = token.split('.');
  if (!payload || !signature) {
    return false;
  }

  const expectedSignature = await signPayload(payload);
  if (expectedSignature !== signature) {
    return false;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(payload)) as SessionPayload;
    const { username } = getAdminCredentials();

    return parsed.u === username && Number.isFinite(parsed.e) && parsed.e > Date.now();
  } catch {
    return false;
  }
}

export async function isAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  const token = await createSessionToken();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
