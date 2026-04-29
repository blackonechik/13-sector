import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности | 13 Sector',
  description: 'Политика конфиденциальности для публичной формы вопросов.',
};

export default function PrivacyPage() {
  return (
    <main className="app-shell min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <section className="panel gold-frame mx-auto w-full max-w-4xl rounded-[2rem] px-5 py-7 sm:px-8 sm:py-10">
        <div className="ornament opacity-40" />
        <div className="relative space-y-8">
          <header className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-accent-soft">Правовые документы</p>
            <h1 className="text-4xl font-black uppercase text-white sm:text-5xl" style={{ fontFamily: 'var(--font-playfair)' }}>
              Политика конфиденциальности
            </h1>
            <p className="max-w-3xl text-sm leading-7 text-muted sm:text-base">
              Этот документ описывает, какие данные собираются через публичную форму вопросов и как они используются.
            </p>
          </header>

          <div className="space-y-5 text-sm leading-7 text-foreground">
            <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Оператор</h2>
              <p>
                Оператором обработки персональных данных является владелец сайта 13 Sector. Перед публикацией укажите
                реальные реквизиты оператора, если сайт используется в рабочем режиме.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Какие данные собираются</h2>
              <p>Через форму собираются имя, город, текст вопроса и ответ, а также факт согласия с обработкой данных.</p>
            </section>

            <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Цели обработки</h2>
              <p>
                Данные используются для приёма, модерации и публикации вопросов в рамках игры, а также для связи по
                вопросу, если это потребуется организатору.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Срок хранения</h2>
              <p>
                Данные хранятся до достижения цели обработки, удаления заявки или отзыва согласия, если иное не
                требуется по закону.
              </p>
            </section>

            <section className="space-y-2 rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-lg font-semibold text-white">Права пользователя</h2>
              <p>
                Пользователь может запросить уточнение, удаление или отзыв согласия через администратора сайта. Для
                реальной публикации добавьте контактный адрес оператора.
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
                href="/personal-data-consent"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-medium text-white"
              >
                Согласие на обработку данных
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}