'use client';

import { FormEvent, useState, useTransition } from 'react';
import { Button, Card, Input, TextArea } from '@heroui/react';
import { SubmissionSettings } from '@/lib/types';

export function PublicQuestionForm({ settings }: { settings: SubmissionSettings }) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState('');
  const [answer, setAnswer] = useState('');
  const [author, setAuthor] = useState('');
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
          body: JSON.stringify({ text, answer, author }),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          setError(payload?.error ?? 'Не удалось отправить вопрос.');
          return;
        }

        setText('');
        setAnswer('');
        setAuthor('');
        setMessage('Спасибо! Вопрос отправлен и ждет проверки администратором.');
      } catch {
        setError('Сервер недоступен. Попробуйте еще раз.');
      }
    });
  };

  return (
    <Card className="panel rounded-[2rem] border border-white/10 bg-[var(--surface-strong)]">
      <Card.Header className="flex-col items-start gap-3 px-6 pt-6 sm:px-8">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--accent-soft)]">
          Форма участника
        </p>
        <h2
          className="text-3xl font-black uppercase text-white"
          style={{ fontFamily: 'var(--font-playfair)' }}
        >
          Отправить вопрос
        </h2>
        <p className="text-sm text-[var(--muted)]">{availabilityLabel}</p>
        {(startLabel || endLabel) && (
          <p className="text-xs text-[var(--muted)]">
            {startLabel ? `С: ${startLabel}` : 'С: сразу'} {endLabel ? `• До: ${endLabel}` : ''}
          </p>
        )}
      </Card.Header>
      <Card.Content className="space-y-3 px-6 pb-6 sm:px-8 sm:pb-8">
        <form onSubmit={handleSubmit} className="space-y-3">
          <TextArea
            aria-label="Ваш вопрос"
            placeholder="Напишите формулировку вопроса"
            rows={4}
            value={text}
            onChange={(event) => setText(event.target.value)}
            disabled={!settings.acceptingQuestions || isPending}
            className="w-full"
          />
          <TextArea
            aria-label="Ответ"
            placeholder="Напишите правильный ответ"
            rows={3}
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            disabled={!settings.acceptingQuestions || isPending}
            className="w-full"
          />
          <Input
            aria-label="Имя автора"
            placeholder="Ваше имя (по желанию)"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            disabled={!settings.acceptingQuestions || isPending}
            className="w-full"
          />
          <Button
            type="submit"
            className="min-h-12 w-full bg-[var(--accent)] font-semibold text-[#16120d]"
            isDisabled={!settings.acceptingQuestions || isPending || !text.trim() || !answer.trim()}
          >
            {isPending ? 'Отправка...' : 'Отправить вопрос'}
          </Button>
        </form>
        {message && <p className="text-sm text-[#8ad3a0]">{message}</p>}
        {error && <p className="text-sm text-[#f3b7ab]">{error}</p>}
      </Card.Content>
    </Card>
  );
}
