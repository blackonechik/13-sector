'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@heroui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameSnapshot } from '@/lib/types';

const envelopeCount = 24;
const selectionDurationMs = 4300;

const emptySnapshot: GameSnapshot = {
  questions: [],
  currentQuestion: null,
  currentQuestionId: null,
  gameState: 'waiting',
  selectedIndex: null,
  totals: {
    submitted: 0,
  },
};

export function DisplayClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [snapshot, setSnapshot] = useState<GameSnapshot>(emptySnapshot);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [highlightedPreviewIndex, setHighlightedPreviewIndex] = useState(0);
  const [selectionFocused, setSelectionFocused] = useState(false);

  const fetchSnapshot = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/game', { cache: 'no-store' });
      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { snapshot: GameSnapshot };
      setSnapshot(payload.snapshot);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const runAction = useCallback((action: 'pick' | 'reveal' | 'answer' | 'next') => {
    startTransition(async () => {
      const response = await fetch('/api/admin/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) {
        return;
      }

      const payload = (await response.json()) as { snapshot: GameSnapshot };
      setSnapshot(payload.snapshot);
    });
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      void document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    void fetchSnapshot();
    const interval = setInterval(() => {
      void fetchSnapshot();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchSnapshot]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
        case 'Enter':
          if (snapshot.gameState === 'question') runAction('answer');
          else if (snapshot.gameState === 'answer') runAction('next');
          else if (snapshot.gameState === 'waiting') runAction('pick');
          break;
        case 'KeyR':
          if (snapshot.gameState === 'waiting' || snapshot.gameState === 'finished') runAction('pick');
          break;
        case 'KeyA':
          if (snapshot.gameState === 'question') runAction('answer');
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyC':
          // reset flow removed: shown questions must not reappear automatically
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [runAction, snapshot.gameState, toggleFullscreen]);

  useEffect(() => {
    if (snapshot.gameState !== 'selecting') {
      return;
    }

    const revealTimeout = setTimeout(() => {
      runAction('reveal');
    }, selectionDurationMs);

    return () => clearTimeout(revealTimeout);
  }, [snapshot.gameState, runAction]);

  useEffect(() => {
    if (snapshot.gameState !== 'selecting') return;

    const finalIndex = snapshot.selectedIndex !== null ? snapshot.selectedIndex % envelopeCount : 0;
    const timeouts: Array<ReturnType<typeof setTimeout>> = [];
    const stepCount = envelopeCount * 2 + finalIndex + 1;
    const slowdownStartStep = Math.max(0, stepCount - 10);

    timeouts.push(
      setTimeout(() => {
        setSelectionFocused(false);
        setHighlightedPreviewIndex(0);
      }, 0)
    );

    let elapsed = 0;
    for (let step = 0; step < stepCount; step += 1) {
      const slowdownProgress =
        step < slowdownStartStep
          ? 0
          : (step - slowdownStartStep) / Math.max(stepCount - slowdownStartStep - 1, 1);
      const delay = 220 + slowdownProgress * 220;
      elapsed += delay;
      const timeout = setTimeout(() => {
        setHighlightedPreviewIndex(step % envelopeCount);
      }, elapsed);
      timeouts.push(timeout);
    }

    const focusTimeout = setTimeout(() => {
      setHighlightedPreviewIndex(finalIndex);
      setSelectionFocused(true);
    }, elapsed + 320);
    timeouts.push(focusTimeout);

    return () => {
      for (const timeout of timeouts) {
        clearTimeout(timeout);
      }
    };
  }, [snapshot.gameState, snapshot.selectedIndex]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSelectionFocused(false);
    }, 0);

    return () => clearTimeout(timeout);
  }, [snapshot.gameState]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const hasNoQuestions = snapshot.questions.length === 0;

  return (
    <main className="app-shell relative flex h-screen w-full items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(181,138,70,0.18),_transparent_30%),linear-gradient(180deg,_rgba(255,255,255,0.02),_transparent_35%)]" />
      <AnimatePresence mode="wait" initial={false}>
        {hasNoQuestions && !isLoading && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
          >
            <div className="panel gold-frame relative w-full max-w-3xl overflow-hidden rounded-[2.2rem] px-8 py-12 text-center sm:px-12 sm:py-16">
              <div className="ornament opacity-45" />
              <div className="relative">
                <p className="text-sm uppercase tracking-[0.42em] text-[var(--accent-soft)]">
                  Режим показа
                </p>
                <h1
                  className="mt-5 text-4xl font-black uppercase text-white sm:text-6xl"
                  style={{ fontFamily: 'var(--font-playfair)' }}
                >
                  Одобренных вопросов пока нет
                </h1>
              </div>
            </div>
          </motion.div>
        )}

        {!hasNoQuestions && snapshot.gameState === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
          >
            <div className="mt-10 text-center">
              <p className="text-sm uppercase tracking-[0.45em] text-[var(--accent-soft)]">
                Интеллектуальный клуб
              </p>
              <h1
                className="mt-4 text-5xl font-black uppercase text-white sm:text-7xl"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Что? Где? Когда?
              </h1>
              <p
                className="mt-4 text-2xl font-black uppercase text-[var(--accent-soft)] sm:text-3xl"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                13 сектор
              </p>
            </div>
          </motion.div>
        )}

        {!hasNoQuestions && snapshot.gameState === 'selecting' && (
          <motion.div
            key="selecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
          >
            <QuestionSelectionStage
              highlightedIndex={highlightedPreviewIndex}
              selectionFocused={selectionFocused}
            />
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mt-10 text-center">
              <h2
                className="text-3xl font-black uppercase text-[var(--accent-soft)] sm:text-5xl"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Всего прислано: {snapshot.totals.submitted}
              </h2>
            </motion.div>
          </motion.div>
        )}

        {!hasNoQuestions && snapshot.gameState === 'question' && snapshot.currentQuestion && (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10"
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-5xl"
            >
              <QuestionRevealCard
                key={snapshot.currentQuestion.id}
                author={snapshot.currentQuestion.author}
                city={snapshot.currentQuestion.city}
                question={snapshot.currentQuestion.text}
              />
            </motion.div>
          </motion.div>
        )}

        {!hasNoQuestions && snapshot.gameState === 'answer' && snapshot.currentQuestion && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 py-10"
          >
            <motion.div
              initial={{ y: 32, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-5xl space-y-5"
            >
              <Card className="panel rounded-[1.6rem] border border-white/8 bg-white/4">
                <Card.Content className="px-6 py-5 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Вопрос</p>
                  <p className="mt-3 text-xl font-semibold text-white sm:text-2xl">
                    {snapshot.currentQuestion.text}
                  </p>
                </Card.Content>
              </Card>

              <Card className="panel gold-frame overflow-hidden rounded-[2.2rem] border border-[var(--border)] bg-[linear-gradient(180deg,_rgba(181,138,70,0.14),_rgba(12,15,22,0.95))]">
                <Card.Content className="relative px-8 py-10 sm:px-12 sm:py-14">
                  <div className="ornament opacity-40" />
                  <div className="relative text-center">
                    <p className="text-sm uppercase tracking-[0.42em] text-[var(--accent-soft)]">Ответ</p>
                    <h2
                      className="mt-5 text-4xl font-black leading-tight text-white sm:text-6xl"
                      style={{ fontFamily: 'var(--font-playfair)' }}
                    >
                      {snapshot.currentQuestion.answer}
                    </h2>
                  </div>
                </Card.Content>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {!hasNoQuestions && snapshot.gameState === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6"
          >
            <div className="mt-10 text-center">
              <p className="text-sm uppercase tracking-[0.45em] text-[var(--accent-soft)]">Финал игры</p>
              <h1
                className="mt-4 text-5xl font-black uppercase text-white sm:text-7xl"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Все вопросы сыграны
              </h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-0 right-0 z-50 flex justify-center gap-3 px-4">
        {!hasNoQuestions && snapshot.gameState === 'waiting' && (
          <Button size="lg" onPress={() => runAction('pick')} className="min-h-13 rounded-full bg-[var(--accent)] px-8 font-semibold text-[#16120d]">
            Выбрать вопрос
          </Button>
        )}
        {!hasNoQuestions && snapshot.gameState === 'question' && (
          <Button size="lg" onPress={() => runAction('answer')} className="min-h-13 rounded-full bg-[var(--accent)] px-8 font-semibold text-[#16120d]">
            Показать ответ
          </Button>
        )}
        {!hasNoQuestions && snapshot.gameState === 'answer' && (
          <Button size="lg" onPress={() => runAction('next')} className="min-h-13 rounded-full bg-[var(--accent)] px-8 font-semibold text-[#16120d]">
            Следующий вопрос
          </Button>
        )}
        {!hasNoQuestions && snapshot.gameState === 'finished' && (
          <Button size="lg" isDisabled className="min-h-13 rounded-full bg-white/8 px-8 font-semibold text-white/70">
            Все вопросы сыграны
          </Button>
        )}

        <Button
          size="lg"
          isIconOnly
          variant="ghost"
          onPress={toggleFullscreen}
          isDisabled={isPending}
          className="min-h-13 min-w-13 rounded-full border border-white/10 bg-white/6 text-white hover:bg-white/10"
        >
          {isFullscreen ? '×' : '⛶'}
        </Button>
      </div>

      <Button
        onPress={() => {
          if (window.history.length > 1) {
            router.back();
            return;
          }

          router.push('/admin');
        }}
        className="absolute left-6 top-6 z-[70] inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white transition hover:bg-white/10"
      >
        Назад
      </Button>
    </main>
  );
}

function QuestionSelectionStage({
  highlightedIndex,
  selectionFocused,
}: {
  highlightedIndex: number;
  selectionFocused: boolean;
}) {
  const envelopes = Array.from({ length: envelopeCount }, (_, index) => ({
    id: `envelope-${index}`,
    layer: index % 3,
    delay: (index % 6) * 0.07,
  }));
  const activeEnvelopeIndex = highlightedIndex % envelopes.length;

  return (
    <div className="relative flex w-full max-w-7xl justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(181,138,70,0.14)_0%,_transparent_60%)] blur-3xl" />
      <div className="grid w-full gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {envelopes.map((envelope, index) => {
          const isHighlighted = index === activeEnvelopeIndex;
          const verticalShift = envelope.layer * 18;
          const envelopeLayoutId = isHighlighted ? 'selected-envelope' : undefined;

          return (
            <motion.div
              key={envelope.id}
              initial={{ opacity: 0.38, y: verticalShift + 18, scale: 0.9 }}
              animate={{
                opacity: selectionFocused
                  ? isHighlighted
                    ? 0
                    : 0.14 + envelope.layer * 0.08
                  : isHighlighted
                    ? 1
                    : 0.32 + envelope.layer * 0.12,
                y: isHighlighted ? -26 : verticalShift,
                scale: isHighlighted ? 1.1 : 0.9 + envelope.layer * 0.04,
                rotate: isHighlighted ? 0 : (index % 2 === 0 ? -2.5 : 2.5),
              }}
              transition={{ duration: 0.62, ease: [0.2, 0.8, 0.2, 1], delay: envelope.delay }}
              className="flex justify-center"
            >
              <EnvelopeCard
                docketLabel={`Вопрос ${String(index + 1).padStart(2, '0')}`}
                highlighted={isHighlighted}
                layoutId={envelopeLayoutId}
              />
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectionFocused && (
          <motion.div
            key="focus-envelope"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.18, 0.82, 0.2, 1] }}
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
          >
            <EnvelopeCard
              docketLabel={`Вопрос ${String(activeEnvelopeIndex + 1).padStart(2, '0')}`}
              highlighted
              layoutId="selected-envelope"
              className="w-[13.5rem] max-w-none"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function EnvelopeCard({
  highlighted = false,
  docketLabel,
  layoutId,
  className = '',
}: {
  highlighted?: boolean;
  docketLabel: string;
  layoutId?: string;
  className?: string;
}) {
  return (
    <motion.div
      layoutId={layoutId}
      className={`relative h-40 w-full max-w-[11rem] overflow-hidden rounded-[1.4rem] ${highlighted
        ? 'shadow-[0_0_42px_rgba(181,138,70,0.32)]'
        : 'shadow-[0_12px_40px_rgba(0,0,0,0.2)]'
        } ${className}`}
    >
      <div
        className={`absolute inset-0 rounded-[1.4rem] border ${highlighted ? 'border-[#f3d39e]' : 'border-white/8'
          } bg-[linear-gradient(180deg,_rgba(44,32,16,0.98),_rgba(16,12,7,0.98))]`}
      />
      <div className="absolute inset-[1px] rounded-[1.35rem] bg-[linear-gradient(135deg,_rgba(181,138,70,0.28),_rgba(255,255,255,0.03)_45%,_rgba(181,138,70,0.08))]" />
      <div className="absolute left-4 right-4 top-4 h-px bg-[linear-gradient(90deg,_transparent,_rgba(243,211,158,0.55),_transparent)]" />
      <div className="absolute bottom-4 left-4 right-4 h-px bg-[linear-gradient(90deg,_transparent,_rgba(243,211,158,0.35),_transparent)]" />
      <div className="absolute inset-x-0 top-[48%] h-px bg-white/8" />
      <div className="absolute left-1/2 top-[48%] h-12 w-12 -translate-x-1/2 -translate-y-1/2 rotate-45 border border-[rgba(243,211,158,0.28)] bg-[rgba(181,138,70,0.08)]" />
      <div className="absolute left-1/2 top-[48%] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-soft)]/80 shadow-[0_0_18px_rgba(243,211,158,0.6)]" />

      <div className="relative flex h-full flex-col justify-between px-5 py-5">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[var(--accent-soft)]/85">Вопрос</p>
        <div className="space-y-2">
          <div className="h-2 rounded-full bg-white/10" />
          <div className="h-2 w-4/5 rounded-full bg-white/8" />
          <div className="h-2 w-2/3 rounded-full bg-white/7" />
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">{docketLabel}</p>
      </div>
    </motion.div>
  );
}

function QuestionRevealCard({
  author,
  city,
  question,
}: {
  author: string;
  city: string;
  question: string;
}) {
  const [textVisible, setTextVisible] = useState(false);
  const authorLine = city.trim() ? `${author} (г. ${city})` : author;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setTextVisible(true);
    }, 1200);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="panel gold-frame relative overflow-hidden rounded-[2.2rem] border border-white/8 bg-[var(--surface-strong)]">
      <div className="ornament opacity-45" />
      <div className="relative px-8 py-10 sm:px-12 sm:py-14">
        <motion.div
          initial={{ y: 38, scale: 0.88 }}
          animate={{ y: 0, scale: 1 }}
          transition={{ duration: 0.9, ease: [0.18, 0.82, 0.2, 1] }}
          className="mx-auto max-w-xl"
        >
          <div>
            <AnimatePresence>
              {textVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="space-y-6 text-center"
                >
                  <p
                    className="mt-1 text-2xl font-black uppercase text-[var(--accent-soft)] sm:text-3xl"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    Вопрос:
                  </p>
                  <h2
                    className="text-4xl font-black leading-tight text-white sm:text-6xl"
                    style={{ fontFamily: 'var(--font-playfair)' }}
                  >
                    {question}
                  </h2>
                  <p className="text-base text-[var(--muted)] sm:text-xl">
                    <span className="text-white">{authorLine}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
