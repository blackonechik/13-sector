'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card, Chip, Input, TextArea } from '@heroui/react';
import { Question, QuestionStatus, SubmissionSettings } from '@/lib/types';

type NewQuestionForm = {
  text: string;
  answer: string;
  author: string;
  status: QuestionStatus;
};

function toDatetimeLocal(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value: string) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export function AdminPanelClient() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [settings, setSettings] = useState<SubmissionSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [newQuestion, setNewQuestion] = useState<NewQuestionForm>({
    text: '',
    answer: '',
    author: '',
    status: 'approved',
  });
  const [windowStart, setWindowStart] = useState('');
  const [windowEnd, setWindowEnd] = useState('');

  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [questionsResponse, settingsResponse] = await Promise.all([
        fetch('/api/admin/questions', { cache: 'no-store' }),
        fetch('/api/admin/settings', { cache: 'no-store' }),
      ]);

      if (questionsResponse.status === 401 || settingsResponse.status === 401) {
        router.push('/login?next=/admin');
        return;
      }

      if (!questionsResponse.ok || !settingsResponse.ok) {
        throw new Error('Не удалось загрузить данные.');
      }

      const questionsPayload = await questionsResponse.json() as { questions: Question[] };
      const settingsPayload = await settingsResponse.json() as { settings: SubmissionSettings };
      setQuestions(questionsPayload.questions);
      setSettings(settingsPayload.settings);
      setWindowStart(toDatetimeLocal(settingsPayload.settings.submissionsStartAt));
      setWindowEnd(toDatetimeLocal(settingsPayload.settings.submissionsEndAt));
    } catch {
      setError('Ошибка загрузки данных админ-панели.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const stats = useMemo(() => {
    const approved = questions.filter((question) => question.status === 'approved');
    const pending = questions.filter((question) => question.status === 'pending');
    const used = approved.filter((question) => question.used);
    return {
      total: questions.length,
      approved: approved.length,
      pending: pending.length,
      used: used.length,
    };
  }, [questions]);

  const handleCreateQuestion = () => {
    setNotice(null);
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newQuestion),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          setError(payload?.error ?? 'Не удалось добавить вопрос.');
          return;
        }

        setNewQuestion({ text: '', answer: '', author: '', status: 'approved' });
        setNotice('Вопрос добавлен.');
        await refreshData();
      } catch {
        setError('Сервер недоступен.');
      }
    });
  };

  const handleUpdateQuestion = (id: string, patch: Partial<Question>) => {
    setNotice(null);
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/questions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          setError(payload?.error ?? 'Не удалось обновить вопрос.');
          return;
        }

        await refreshData();
      } catch {
        setError('Не удалось обновить вопрос.');
      }
    });
  };

  const handleDeleteQuestion = (id: string) => {
    setNotice(null);
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          setError(payload?.error ?? 'Не удалось удалить вопрос.');
          return;
        }

        await refreshData();
      } catch {
        setError('Не удалось удалить вопрос.');
      }
    });
  };

  const handleSettingsSave = () => {
    if (!settings) return;

    setNotice(null);
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionsEnabled: settings.submissionsEnabled,
            submissionsStartAt: fromDatetimeLocal(windowStart),
            submissionsEndAt: fromDatetimeLocal(windowEnd),
          }),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          setError(payload?.error ?? 'Не удалось сохранить настройки.');
          return;
        }

        setNotice('Настройки приема вопросов сохранены.');
        await refreshData();
      } catch {
        setError('Ошибка сохранения настроек.');
      }
    });
  };

  const handleLogout = () => {
    startTransition(async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    });
  };

  return (
    <main className="app-shell min-h-screen px-5 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="panel gold-frame relative overflow-hidden rounded-[2rem] px-6 py-7 sm:px-8">
          <div className="ornament opacity-45" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.4em] text-[var(--accent-soft)]">
                Панель ведущего
              </p>
              <h1
                className="text-4xl font-black uppercase text-white sm:text-5xl"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Управление вопросами
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Модерируйте входящие вопросы, настраивайте окно приема и запускайте режим показа.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/6"
              >
                Публичная форма
              </Link>
              <Link
                href="/display"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[#16120d] transition hover:bg-[#c79a54]"
              >
                Режим показа
              </Link>
              <Button
                variant="ghost"
                onPress={handleLogout}
                className="min-h-12 border border-white/10 text-white hover:bg-white/6"
                isDisabled={isPending}
              >
                Выйти
              </Button>
            </div>
          </div>
        </header>

        {(error || notice) && (
          <div className={`rounded-2xl border px-5 py-3 text-sm ${error ? 'border-[#6e2f28] text-[#f3b7ab]' : 'border-[#375840] text-[#9ee3af]'}`}>
            {error ?? notice}
          </div>
        )}

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="panel rounded-[1.75rem] border border-white/8 bg-[var(--surface-strong)]">
            <Card.Header className="flex flex-col items-start gap-2 px-6 pt-6">
              <Card.Title className="text-2xl font-bold text-white">Новый вопрос</Card.Title>
              <Card.Description className="text-sm text-[var(--muted)]">
                Добавьте вопрос вручную сразу в систему.
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4 px-6 pb-6">
              <TextArea
                aria-label="Текст вопроса"
                placeholder="Введите формулировку вопроса"
                value={newQuestion.text}
                onChange={(event) =>
                  setNewQuestion((previous) => ({ ...previous, text: event.target.value }))
                }
                rows={4}
                className="w-full"
              />
              <TextArea
                aria-label="Правильный ответ"
                placeholder="Введите правильный ответ"
                value={newQuestion.answer}
                onChange={(event) =>
                  setNewQuestion((previous) => ({ ...previous, answer: event.target.value }))
                }
                rows={3}
                className="w-full"
              />
              <Input
                aria-label="Автор"
                placeholder="Автор вопроса, если нужен"
                value={newQuestion.author}
                onChange={(event) =>
                  setNewQuestion((previous) => ({ ...previous, author: event.target.value }))
                }
                className="w-full"
              />
              <label className="block space-y-2 text-sm text-[var(--muted)]">
                <span>Статус</span>
                <select
                  aria-label="Статус вопроса"
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-[#141925] px-3 text-white outline-none focus:border-[var(--accent)]"
                  value={newQuestion.status}
                  onChange={(event) =>
                    setNewQuestion((previous) => ({
                      ...previous,
                      status: event.target.value as QuestionStatus,
                    }))
                  }
                >
                  <option value="approved">Сразу допустить в игру</option>
                  <option value="pending">Оставить на модерации</option>
                  <option value="rejected">Отклонить</option>
                </select>
              </label>

              <Button
                onPress={handleCreateQuestion}
                className="min-h-12 w-full bg-[var(--accent)] font-semibold text-[#16120d]"
                isDisabled={!newQuestion.text.trim() || !newQuestion.answer.trim() || isPending}
              >
                {isPending ? 'Сохраняю...' : 'Добавить вопрос'}
              </Button>
            </Card.Content>
          </Card>

          <Card className="panel rounded-[1.75rem] border border-white/8 bg-[var(--surface-strong)]">
            <Card.Header className="flex flex-col items-start gap-2 px-6 pt-6">
              <Card.Title className="text-2xl font-bold text-white">Прием вопросов</Card.Title>
              <Card.Description className="text-sm text-[var(--muted)]">
                Управляйте доступностью публичной формы.
              </Card.Description>
            </Card.Header>
            <Card.Content className="space-y-4 px-6 pb-6">
              <div className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3">
                <div>
                  <p className="text-sm text-white">Ручной переключатель</p>
                  <p className="text-xs text-[var(--muted)]">
                    {settings?.acceptingQuestions ? 'Форма открыта' : 'Форма закрыта'}
                  </p>
                </div>
                <Button
                  size="sm"
                  onPress={() =>
                    setSettings((previous) =>
                      previous ? { ...previous, submissionsEnabled: !previous.submissionsEnabled } : previous
                    )
                  }
                  className="bg-[var(--accent)] text-[#16120d]"
                  isDisabled={!settings}
                >
                  {settings?.submissionsEnabled ? 'Отключить' : 'Включить'}
                </Button>
              </div>

              <label className="block space-y-2 text-sm text-[var(--muted)]">
                <span>Начало приема</span>
                <Input
                  type="datetime-local"
                  value={windowStart}
                  onChange={(event) => setWindowStart(event.target.value)}
                />
              </label>
              <label className="block space-y-2 text-sm text-[var(--muted)]">
                <span>Окончание приема</span>
                <Input
                  type="datetime-local"
                  value={windowEnd}
                  onChange={(event) => setWindowEnd(event.target.value)}
                />
              </label>
              <Button
                onPress={handleSettingsSave}
                className="min-h-12 w-full bg-[var(--accent)] font-semibold text-[#16120d]"
                isDisabled={!settings || isPending}
              >
                {isPending ? 'Сохраняю...' : 'Сохранить настройки приема'}
              </Button>
            </Card.Content>
          </Card>
        </section>

        <section className="grid gap-4 sm:grid-cols-4">
          <StatCard label="Всего" value={stats.total} hint="Всех вопросов в базе" />
          <StatCard label="Одобрено" value={stats.approved} hint="Участвуют в игре" />
          <StatCard label="На модерации" value={stats.pending} hint="Ожидают решения" />
          <StatCard label="Сыграно" value={stats.used} hint="Уже показаны" />
        </section>

        <section className="panel gold-frame overflow-hidden rounded-[2rem]">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
            <div>
              <h2 className="text-2xl font-bold text-white">Список вопросов</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Здесь отображаются и публичные, и добавленные вручную вопросы.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center text-[var(--muted)]">Загрузка...</div>
          ) : questions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/8 text-left text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                    <th className="px-6 py-4">№</th>
                    <th className="px-6 py-4">Вопрос</th>
                    <th className="px-6 py-4">Ответ</th>
                    <th className="px-6 py-4">Автор</th>
                    <th className="px-6 py-4">Статус</th>
                    <th className="px-6 py-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, index) => (
                    <tr key={question.id} className="border-b border-white/6 align-top">
                      <td className="px-6 py-5 text-sm text-[var(--muted)]">{index + 1}</td>
                      <td className="px-6 py-5 text-sm leading-6 text-white">{question.text}</td>
                      <td className="px-6 py-5 text-sm leading-6 text-[#d7dced]">{question.answer}</td>
                      <td className="px-6 py-5 text-sm text-[var(--muted)]">{question.author || '—'}</td>
                      <td className="px-6 py-5">
                        <Chip
                          variant="soft"
                          className={
                            question.status === 'approved'
                              ? 'bg-[#342916] text-[#f2ddb1]'
                              : question.status === 'pending'
                                ? 'bg-[#1f2e45] text-[#b9d6ff]'
                                : 'bg-[#4a1f1a] text-[#f3b7ab]'
                          }
                        >
                          {question.status === 'approved'
                            ? question.used
                              ? 'Одобрен • Сыгран'
                              : 'Одобрен'
                            : question.status === 'pending'
                              ? 'Модерация'
                              : 'Отклонен'}
                        </Chip>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="border border-white/10 text-white hover:bg-white/6"
                            onPress={() => handleUpdateQuestion(question.id, { status: 'approved' })}
                          >
                            Одобрить
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="border border-white/10 text-white hover:bg-white/6"
                            onPress={() => handleUpdateQuestion(question.id, { status: 'rejected' })}
                          >
                            Отклонить
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="border border-[#6e2f28] text-[#f3b7ab] hover:bg-[#4a1f1a]"
                            onPress={() => handleDeleteQuestion(question.id)}
                          >
                            Удалить
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center text-[var(--muted)]">
              Вопросов пока нет.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <Card className="panel rounded-[1.75rem] border border-white/8 bg-[var(--surface-strong)]">
      <Card.Content className="space-y-3 px-6 py-6">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">{label}</p>
        <p className="text-4xl font-black text-white">{value}</p>
        <p className="text-sm text-[var(--muted)]">{hint}</p>
      </Card.Content>
    </Card>
  );
}
