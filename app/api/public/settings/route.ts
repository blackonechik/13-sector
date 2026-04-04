import { NextResponse } from 'next/server';
import { getSubmissionSettings } from '@/lib/questions';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getSubmissionSettings();
  return NextResponse.json({ settings });
}
