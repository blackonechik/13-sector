import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionSettings, updateSubmissionSettings } from '@/lib/questions';
import { requireAdminApi } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  void _request;
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const settings = await getSubmissionSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(request: NextRequest) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null) as {
    submissionsEnabled?: boolean;
    submissionsStartAt?: string | null;
    submissionsEndAt?: string | null;
  } | null;

  const current = await getSubmissionSettings();
  const settings = await updateSubmissionSettings({
    submissionsEnabled: body?.submissionsEnabled ?? current.submissionsEnabled,
    submissionsStartAt: body?.submissionsStartAt ?? current.submissionsStartAt,
    submissionsEndAt: body?.submissionsEndAt ?? current.submissionsEndAt,
  });

  return NextResponse.json({ settings });
}
