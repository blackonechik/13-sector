import Link from 'next/link';

export default function Home() {
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
                Тёмная студийная панель для ведущего и отдельный экран показа с эффектным
                выбором вопроса, крупной типографикой и управлением в один клик.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-[#f7f1e4] sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                13 стартовых вопросов уже добавлены
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                Админка и экран показа синхронизируются между вкладками
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                Полноэкранный режим и горячие клавиши для ведущего
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/4 px-4 py-3">
                Живое анимированное открытие вопроса в стиле ТВ-студии
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/admin"
                className="inline-flex min-h-14 flex-1 items-center justify-center rounded-full bg-[var(--accent)] px-7 text-base font-semibold text-[#16120d] transition hover:-translate-y-0.5 hover:bg-[#c79a54]"
              >
                Открыть админ-панель
              </Link>
              <Link
                href="/display"
                target="_blank"
                className="inline-flex min-h-14 flex-1 items-center justify-center rounded-full border border-[var(--border)] bg-white/6 px-7 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10"
              >
                Запустить режим показа
              </Link>
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-md items-center justify-center">
            <div className="absolute h-72 w-72 rounded-full border border-[var(--border)] bg-[radial-gradient(circle,_rgba(181,138,70,0.25)_0%,_rgba(10,12,17,0)_70%)] blur-2xl" />
            <div className="panel gold-frame relative flex aspect-square w-full max-w-[22rem] items-center justify-center rounded-full">
              <div className="absolute inset-4 rounded-full border border-white/10" />
              <div className="absolute inset-10 rounded-full border border-[var(--border)]" />
              <div className="absolute h-2 w-2 rounded-full bg-[var(--accent-soft)] shadow-[0_0_24px_rgba(229,199,142,0.9)]" />
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-soft)]">
                  Студийный режим
                </p>
                <p
                  className="mt-3 text-3xl font-black uppercase text-white"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  13 сектор
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
