import Link from 'next/link';
import { getSubmissionSettings } from '@/lib/questions';
import { PublicQuestionForm } from '@/app/public-question-form';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const settings = await getSubmissionSettings();

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-6 py-12">
      <section className="panel gold-frame relative w-full max-w-5xl overflow-hidden rounded-[2rem] px-8 py-10 sm:px-12 sm:py-14">
        <div className="ornament opacity-50" />
        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.45em] text-[var(--accent-soft)]">
                Интеллектуальная игра
              </p>
              <h1
                className="text-5xl font-black uppercase leading-[0.9] text-white sm:text-7xl"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Что
                <br />
                Где
                <br />
                Когда
              </h1>
              <p className="max-w-2xl text-base leading-7 text-[var(--muted)] sm:text-lg">
                Оставьте вопрос для игры. Администратор получит его в панели и сможет
                подтвердить для показа в раунде.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-[#f7f1e4] sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                Вопросы попадают в PostgreSQL
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                Админ решает, какие вопросы допустить
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                Приём можно открыть по расписанию
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                Режим показа доступен только администратору
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex min-h-14 flex-1 items-center justify-center rounded-full bg-[var(--accent)] px-7 text-base font-semibold text-[#16120d] transition hover:-translate-y-0.5 hover:bg-[#c79a54]"
              >
                Войти как администратор
              </Link>
              <Link
                href="/admin"
                className="inline-flex min-h-14 flex-1 items-center justify-center rounded-full border border-[var(--border)] bg-white/6 px-7 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Панель управления
              </Link>
            </div>
          </div>

          <PublicQuestionForm settings={settings} />
        </div>
      </section>
    </main>
  );
}
