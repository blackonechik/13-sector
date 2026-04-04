import { getSubmissionSettings } from '@/lib/questions';
import { PublicQuestionForm } from '@/app/public-question-form';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const settings = await getSubmissionSettings();

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-6 py-12">
      <section className="panel gold-frame relative w-full max-w-5xl overflow-hidden rounded-[2rem] px-8 py-10 sm:px-12 sm:py-14">
        <div className="ornament opacity-50" />
        <div className="relative flex gap-10 flex-col">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.45em] text-[var(--accent-soft)]">
                Интеллектуальная игра
              </p>
              <h1
                className="text-5xl font-black uppercase leading-[0.9] text-white sm:text-7xl"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Что? Где? Когда?
              </h1>
            </div>
          </div>

          <PublicQuestionForm settings={settings} />
        </div>
      </section>
    </main>
  );
}
