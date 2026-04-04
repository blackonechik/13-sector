import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionSettings, updateSubmissionSettings } from '@/lib/questions';
import { requireAdminApi } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApi(request);
  if (unauthorized) {
    return unauthorized;
  }

  const settings = await getSubmissionSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const unauthorized = await requireAdminApi(request);
  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null) as {
    submissionsEnabled?: boolean;
    submissionsStartAt?: string | null;
    submissionsEndAt?: string | null;
  } | null;

  const settings = await updateSubmissionSettings({
    submissionsEnabled: Boolean(body?.submissionsEnabled),
    submissionsStartAt: body?.submissionsStartAt ?? null,
    submissionsEndAt: body?.submissionsEndAt ?? null,
  });

  return NextResponse.json({ settings });
}
