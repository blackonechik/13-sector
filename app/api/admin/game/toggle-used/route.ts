import { NextRequest, NextResponse } from 'next/server';
import { toggleQuestionUsed } from '@/lib/questions';
import { jsonError, requireAdminApi } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null) as {
    questionId?: string;
  } | null;

  if (!body?.questionId) {
    return jsonError('Не передан ID вопроса.');
  }

  const question = await toggleQuestionUsed(body.questionId);

  if (!question) {
    return jsonError('Вопрос не найден.', 404);
  }

  return NextResponse.json({ question });
}
