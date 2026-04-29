import { NextRequest, NextResponse } from 'next/server';
import { createQuestion, getSubmissionSettings } from '@/lib/questions';
import { jsonError } from '@/lib/guards';
import { QUESTION_ANSWER_MAX_LENGTH, QUESTION_TEXT_MAX_LENGTH } from '@/lib/question-limits';

export const dynamic = 'force-dynamic';
const CONSENT_POLICY_VERSION = '2026-04-29';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    text?: string;
    answer?: string;
    author?: string;
    city?: string;
    consentAccepted?: boolean;
  } | null;

  if (!body?.text?.trim() || !body?.answer?.trim() || !body?.author?.trim() || !body?.city?.trim()) {
    return jsonError('Нужно заполнить вопрос, ответ, имя и город.');
  }

  if (body.text.trim().length > QUESTION_TEXT_MAX_LENGTH) {
    return jsonError(`Текст вопроса не должен превышать ${QUESTION_TEXT_MAX_LENGTH} символов.`);
  }

  if (body.answer.trim().length > QUESTION_ANSWER_MAX_LENGTH) {
    return jsonError(`Ответ не должен превышать ${QUESTION_ANSWER_MAX_LENGTH} символов.`);
  }

  if (!body.consentAccepted) {
    return jsonError('Нужно согласиться с политикой конфиденциальности и обработкой персональных данных.');
  }

  const settings = await getSubmissionSettings();
  if (!settings.acceptingQuestions) {
    return jsonError('Приём вопросов сейчас закрыт.', 403);
  }

  const question = await createQuestion({
    text: body.text,
    answer: body.answer,
    author: body.author,
    city: body.city,
    status: 'pending',
    consentAcceptedAt: new Date().toISOString(),
    consentPolicyVersion: CONSENT_POLICY_VERSION,
  });

  return NextResponse.json({ ok: true, question }, { status: 201 });
}
