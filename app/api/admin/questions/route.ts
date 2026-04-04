import { NextRequest, NextResponse } from 'next/server';
import { createQuestion, listQuestions } from '@/lib/questions';
import { requireAdminApi, jsonError } from '@/lib/guards';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdminApi(request);
  if (unauthorized) {
    return unauthorized;
  }

  const questions = await listQuestions();
  return NextResponse.json({ questions });
}

export async function POST(request: NextRequest) {
  const unauthorized = await requireAdminApi(request);
  if (unauthorized) {
    return unauthorized;
  }

  const body = await request.json().catch(() => null) as {
    text?: string;
    answer?: string;
    author?: string;
    status?: 'pending' | 'approved' | 'rejected';
  } | null;

  if (!body?.text?.trim() || !body?.answer?.trim()) {
    return jsonError('Нужно заполнить вопрос и ответ.');
  }

  const question = await createQuestion({
    text: body.text,
    answer: body.answer,
    author: body.author,
    status: body.status ?? 'approved',
  });

  return NextResponse.json({ question }, { status: 201 });
}
