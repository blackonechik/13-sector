import { NextRequest, NextResponse } from 'next/server';
import { createQuestion, listQuestions } from '@/lib/questions';
import { requireAdminApi, jsonError } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  void _request;
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const questions = await listQuestions();
  return NextResponse.json({ questions });
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null) as {
    text?: string;
    answer?: string;
    author?: string;
    city?: string;
    status?: 'pending' | 'approved' | 'rejected';
  } | null;

  if (!body?.text?.trim() || !body?.answer?.trim() || !body?.author?.trim() || !body?.city?.trim()) {
    return jsonError('Нужно заполнить вопрос, ответ, имя и город.');
  }

  const question = await createQuestion({
    text: body.text,
    answer: body.answer,
    author: body.author,
    city: body.city,
    status: body.status ?? 'approved',
  });

  return NextResponse.json({ question }, { status: 201 });
}
