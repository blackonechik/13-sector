'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button, Card, Chip, Input, TextArea } from '@heroui/react';
import { useGame } from '@/lib/GameContext';

export default function AdminPanel() {
  const { questions, addQuestion, removeQuestion, resetGame } = useGame();
  const [newQuestion, setNewQuestion] = useState({
    text: '',
    answer: '',
    author: '',
  });

  const handleAddQuestion = () => {
    if (newQuestion.text.trim() && newQuestion.answer.trim()) {
      addQuestion({
        text: newQuestion.text,
        answer: newQuestion.answer,
        author: newQuestion.author || undefined,
      });
      setNewQuestion({ text: '', answer: '', author: '' });
    }
  };

  const usedCount = questions.filter((question) => question.used).length;
  const availableCount = questions.length - usedCount;

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
                Что Где Когда
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-[var(--muted)] sm:text-base">
                Добавляйте вопросы, управляйте пулом и открывайте режим показа на отдельном
                экране. Все изменения синхронизируются между вкладками автоматически.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-medium text-white transition hover:bg-white/6"
              >
                На главную
              </Link>
              <Link
                href="/display"
                target="_blank"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-[#16120d] transition hover:bg-[#c79a54]"
              >
                Открыть режим показа
              </Link>
            </div>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="panel rounded-[1.75rem] border border-white/8 bg-[var(--surface-strong)]">
            <Card.Header className="flex flex-col items-start gap-2 px-6 pt-6">
              <Card.Title className="text-2xl font-bold text-white">Новый вопрос</Card.Title>
              <Card.Description className="text-sm text-[var(--muted)]">
                Поля ниже обновляют общий пул вопросов сразу после добавления.
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

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button
                  onPress={handleAddQuestion}
                  className="min-h-12 flex-1 bg-[var(--accent)] font-semibold text-[#16120d]"
                >
                  Добавить вопрос
                </Button>
                <Button
                  variant="ghost"
                  onPress={resetGame}
                  className="min-h-12 flex-1 border border-white/10 text-white hover:bg-white/6"
                >
                  Сбросить отметки использования
                </Button>
              </div>
            </Card.Content>
          </Card>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="panel rounded-[1.75rem] border border-white/8 bg-[var(--surface-strong)]">
              <Card.Content className="space-y-3 px-6 py-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Всего</p>
                <p className="text-4xl font-black text-white">{questions.length}</p>
                <p className="text-sm text-[var(--muted)]">Вопросов в общей базе</p>
              </Card.Content>
            </Card>

            <Card className="panel rounded-[1.75rem] border border-white/8 bg-[var(--surface-strong)]">
              <Card.Content className="space-y-3 px-6 py-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">В игре</p>
                <p className="text-4xl font-black text-[var(--accent-soft)]">{availableCount}</p>
                <p className="text-sm text-[var(--muted)]">Ещё доступны к показу</p>
              </Card.Content>
            </Card>

            <Card className="panel rounded-[1.75rem] border border-white/8 bg-[var(--surface-strong)]">
              <Card.Content className="space-y-3 px-6 py-6">
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted)]">Сыграно</p>
                <p className="text-4xl font-black text-[#d96852]">{usedCount}</p>
                <p className="text-sm text-[var(--muted)]">Уже были открыты в показе</p>
              </Card.Content>
            </Card>
          </div>
        </section>

        <section className="panel gold-frame overflow-hidden rounded-[2rem]">
          <div className="flex items-center justify-between border-b border-white/8 px-6 py-5">
            <div>
              <h2 className="text-2xl font-bold text-white">Пул вопросов</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Можно сразу удалять лишние позиции. Пул вопросов берётся из localStorage и
                обновляется между вкладками автоматически.
              </p>
            </div>
          </div>

          {questions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/8 text-left text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                    <th className="px-6 py-4">№</th>
                    <th className="px-6 py-4">Вопрос</th>
                    <th className="px-6 py-4">Ответ</th>
                    <th className="px-6 py-4">Автор</th>
                    <th className="px-6 py-4">Статус</th>
                    <th className="px-6 py-4 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((question, index) => (
                    <tr key={question.id} className="border-b border-white/6 align-top">
                      <td className="px-6 py-5 text-sm text-[var(--muted)]">{index + 1}</td>
                      <td className="px-6 py-5 text-sm leading-6 text-white">
                        {question.text}
                      </td>
                      <td className="px-6 py-5 text-sm leading-6 text-[#d7dced]">
                        {question.answer}
                      </td>
                      <td className="px-6 py-5 text-sm text-[var(--muted)]">
                        {question.author || '—'}
                      </td>
                      <td className="px-6 py-5">
                        <Chip
                          color={question.used ? 'danger' : 'accent'}
                          variant="soft"
                          className={question.used ? 'bg-[#4a1f1a] text-[#f3b7ab]' : 'bg-[#342916] text-[#f2ddb1]'}
                        >
                          {question.used ? 'Сыгран' : 'Готов'}
                        </Chip>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Button
                          variant="ghost"
                          onPress={() => removeQuestion(question.id)}
                          className="border border-white/10 text-white hover:bg-white/6"
                        >
                          Удалить
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-16 text-center text-[var(--muted)]">
              Вопросов пока нет. Добавьте первый вопрос в форму выше.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
