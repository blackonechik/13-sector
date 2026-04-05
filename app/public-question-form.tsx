'use client';

import { FormEvent, useState, useTransition } from 'react';
import { Button, Input, Label, TextField } from '@heroui/react';
import { SubmissionSettings } from '@/lib/types';

export function PublicQuestionForm({ settings }: { settings: SubmissionSettings }) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');
  const [author, setAuthor] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startLabel = settings.submissionsStartAt
    ? new Date(settings.submissionsStartAt).toLocaleString('ru-RU')
    : null;
  const endLabel = settings.submissionsEndAt
    ? new Date(settings.submissionsEndAt).toLocaleString('ru-RU')
    : null;

  const availabilityLabel = settings.acceptingQuestions
    ? 'Прием вопросов открыт'
    : 'Прием вопросов сейчас закрыт';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/public/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, answer, author, city }),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          setError(payload?.error ?? 'Не удалось отправить вопрос.');
          return;
        }

        setText('');
        setAnswer('');
        setAuthor('');
        setCity('');
        setMessage('Спасибо! Вопрос отправлен и ждет проверки администратором.');
      } catch {
        setError('Сервер недоступен. Попробуйте еще раз.');
      }
    });
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
        <h2
          className="text-2xl font-black uppercase text-white sm:text-3xl"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Форма для отправки вопроса
        </h2>
        <p className="text-sm text-[var(--muted)]">{availabilityLabel}</p>
        {(startLabel || endLabel) && (
          <p className="text-xs text-[var(--muted)]">
            {startLabel ? `С: ${startLabel}` : 'С: сразу'} {endLabel ? `• До: ${endLabel}` : ''}
          </p>
        )}

        {!message ? (
          <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
            <TextField className="w-full" name="question">
              <Label>Ваш вопрос</Label>
              <Input
                aria-label="Ваш вопрос"
                placeholder="Сколько дней в году?"
                value={text}
                onChange={(event) => setText(event.target.value)}
                disabled={!settings.acceptingQuestions || isPending}
              />
            </TextField>
            <TextField className="w-full" name="answer">
              <Label>Ответ</Label>
              <Input
                aria-label="Ответ"
                placeholder="365 дней"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                disabled={!settings.acceptingQuestions || isPending}
              />
            </TextField>
            <TextField className="w-full" name="author">
              <Label>Ваше имя</Label>
              <Input
                aria-label="Имя автора"
                placeholder="Иван"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                disabled={!settings.acceptingQuestions || isPending}
              />
            </TextField>
            <TextField className="w-full" name="city">
              <Label>Ваш город</Label>
              <Input
                aria-label="Город"
                placeholder="Москва"
                value={city}
                onChange={(event) => setCity(event.target.value)}
                disabled={!settings.acceptingQuestions || isPending}
              />
            </TextField>
            <Button
              type="submit"
              className="min-h-12 w-full bg-[var(--accent)] font-semibold text-[#16120d]"
              isDisabled={!settings.acceptingQuestions || isPending || !text.trim() || !answer.trim() || !author.trim() || !city.trim()}
            >
              {isPending ? 'Отправка...' : 'Отправить вопрос'}
            </Button>
          </form>
        ) : (
          <div className="rounded-2xl border border-[#345d42] bg-[#0f1f15] px-4 py-5 text-center sm:px-5 sm:py-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-[#5bb179] bg-[#183222] text-2xl text-[#8ad3a0]">
              ✓
            </div>
            <p className="text-2xl font-black text-[#c9f3d8]">Успешно!</p>
            <p className="mt-2 text-sm text-[#9cd8b0]">
              Ваш вопрос отправлен и будет проверен администратором
            </p>
          </div>
        )}
        {error && <p className="text-sm text-[#f3b7ab]">{error}</p>}
    </div>
  );
}
