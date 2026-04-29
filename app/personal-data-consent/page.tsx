import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Согласие на обработку персональных данных | 13 Sector',
  description: 'Текст согласия на обработку персональных данных для публичной формы вопросов.',
};

export default function PersonalDataConsentPage() {
  return (
    <main className="app-shell min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <section className="panel gold-frame mx-auto w-full max-w-4xl rounded-[2rem] px-5 py-7 sm:px-8 sm:py-10">
        <div className="ornament opacity-40" />
        <div className="relative space-y-8">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-accent-soft">Правовые документы</p>
            <h1 className="text-4xl font-black uppercase text-white sm:text-5xl" style={{ fontFamily: 'var(--font-playfair)' }}>
              Согласие на обработку персональных данных
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
              Этот текст используется в публичной форме сбора вопросов и подтверждается чекбоксом перед отправкой.
            </p>
          </header>

          <div className="space-y-5 text-sm leading-7 text-foreground">
            <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Что подтверждает пользователь</h2>
              <p>
                Нажимая отправку формы, пользователь подтверждает своё согласие на обработку имени, города, текста
                вопроса, текста ответа и факта согласия.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Цель обработки</h2>
              <p>
                Данные обрабатываются для приёма и модерации вопроса, проведения игры и возможной обратной связи по
                заявке.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Действие согласия</h2>
              <p>
                Согласие действует до достижения цели обработки или до его отзыва. Отзыв возможен через администратора
                сайта или контактные данные оператора.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Важно для запуска в продакшене</h2>
              <p>
                Для фактического соответствия закону РФ добавьте реальные реквизиты оператора, контакт для связи и при
                необходимости отдельную форму отзыва согласия.
              </p>
            </section>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-5 text-sm font-semibold text-[#16120d]"
              >
                Вернуться к форме
              </Link>
              <Link
                href="/privacy"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-medium text-white"
              >
                Политика конфиденциальности
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}