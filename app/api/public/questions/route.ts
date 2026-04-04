import { NextRequest, NextResponse } from 'next/server';
import { createQuestion, getSubmissionSettings } from '@/lib/questions';
import { jsonError } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    text?: string;
    answer?: string;
    author?: string;
  } | null;

  if (!body?.text?.trim() || !body?.answer?.trim()) {
    return jsonError('Нужно заполнить вопрос и ответ.');
  }

  const settings = await getSubmissionSettings();
  if (!settings.acceptingQuestions) {
    return jsonError('Приём вопросов сейчас закрыт.', 403);
  }

  const question = await createQuestion({
    text: body.text,
    answer: body.answer,
    author: body.author,
    status: 'pending',
  });

  return NextResponse.json({ ok: true, question }, { status: 201 });
}
