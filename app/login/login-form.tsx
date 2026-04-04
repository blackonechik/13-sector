'use client';

import { FormEvent, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@heroui/react';

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) {
          setError(payload?.error ?? 'Ошибка авторизации.');
          return;
        }

        router.push(next);
        router.refresh();
      } catch {
        setError('Сервер недоступен.');
      }
    });
  };

  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-6 py-12">
      <Card className="panel gold-frame w-full max-w-lg rounded-[2rem] border border-white/10 bg-[var(--surface-strong)]">
        <Card.Header className="flex-col items-start gap-3 px-7 pt-7">
          <p className="text-xs uppercase tracking-[0.35em] text-[var(--accent-soft)]">
            Только для администратора
          </p>
          <h1
            className="text-4xl font-black uppercase text-white"
            style={{ fontFamily: 'var(--font-playfair)' }}
          >
            Вход в панель
          </h1>
        </Card.Header>
        <Card.Content className="px-7 pb-8">
          <form onSubmit={handleSubmit} className="space-y-3 flex flex-col gap-2">
            <Input
              aria-label="Логин"
              placeholder="Логин"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              disabled={isPending}
            />
            <Input
              aria-label="Пароль"
              placeholder="Пароль"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isPending}
            />
            <Button
              type="submit"
              className="min-h-12 w-full bg-[var(--accent)] font-semibold text-[#16120d]"
              isDisabled={!username.trim() || !password.trim() || isPending}
            >
              {isPending ? 'Вход...' : 'Войти'}
            </Button>
          </form>
          {error && <p className="mt-3 text-sm text-[#f3b7ab]">{error}</p>}
        </Card.Content>
      </Card>
    </main>
  );
}
