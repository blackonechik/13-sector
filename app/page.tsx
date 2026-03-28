'use client';

import { Button, Card, Link } from '@heroui/react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full bg-slate-800 border-2 border-purple-500">
        <Card.Body className="gap-8 p-8">
          <div className="text-center">
            <h1 className="text-5xl font-black text-white mb-2">
              13 СЕКТОР
            </h1>
            <p className="text-xl text-purple-300">
              Система управления вопросами для интеллектуальной игры
            </p>
          </div>

          <div className="space-y-3 text-gray-300">
            <p>✓ Управление вопросами и ответами</p>
            <p>✓ Красивая анимация выбора</p>
            <p>✓ Полноэкранный режим показа</p>
            <p>✓ Горячие клавиши для ведущего</p>
          </div>

          <div className="flex gap-4 flex-col sm:flex-row">
            <Button
              as={Link}
              href="/admin"
              color="primary"
              size="lg"
              className="flex-1"
            >
              📊 Админ-панель
            </Button>
            <Button
              as={Link}
              href="/display"
              target="_blank"
              color="success"
              size="lg"
              className="flex-1"
            >
              🎮 Режим показа
            </Button>
          </div>

          <p className="text-sm text-gray-500 text-center">
            Откройте админ-панель, добавьте вопросы, затем запустите режим показа
          </p>
        </Card.Body>
      </Card>
    </div>
  );
}
