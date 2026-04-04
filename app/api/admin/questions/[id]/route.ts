import { NextRequest, NextResponse } from 'next/server';
import { deleteQuestion, updateQuestion } from '@/lib/questions';
import { jsonError, requireAdminApi } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  context: RouteContext<'/api/admin/questions/[id]'>
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null) as {
    text?: string;
    answer?: string;
    author?: string | null;
    status?: 'pending' | 'approved' | 'rejected';
    used?: boolean;
  } | null;

  const { id } = await context.params;
  const question = await updateQuestion(id, body ?? {});

  if (!question) {
    return jsonError('Вопрос не найден.', 404);
  }

  return NextResponse.json({ question });
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext<'/api/admin/questions/[id]'>
) {
  void _request;
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const { id } = await context.params;
  await deleteQuestion(id);
  return NextResponse.json({ ok: true });
}
