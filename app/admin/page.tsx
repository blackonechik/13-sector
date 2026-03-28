'use client';

import { useState } from 'react';
import {
  Button,
  Card,
  Input,
  TextArea,
  Dialog,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Link,
  Label,
} from '@heroui/react';
import { useGame } from '@/lib/GameContext';

export default function AdminPanel() {
  const { questions, addQuestion, removeQuestion, resetGame } = useGame();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">13 Сектор</h1>
          <p className="text-gray-600">Панель управления вопросами</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8 flex-wrap">
          <Button variant="primary" size="lg" onPress={() => setIsModalOpen(true)}>
            + Добавить вопрос
          </Button>
          <Button
            variant="secondary"
            size="lg"
            as={Link}
            href="/display"
            target="_blank"
          >
            🎮 Запустить режим показа
          </Button>
          <Button variant="tertiary" size="lg" onPress={resetGame}>
            ↻ Сбросить использованные
          </Button>
        </div>

        {/* Statistics */}
        <Card>
          <Card.Section className="flex-row gap-8 py-6 px-6">
            <div>
              <p className="text-gray-600 text-sm">Всего вопросов</p>
              <p className="text-3xl font-bold text-blue-600">{questions.length}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Использовано</p>
              <p className="text-3xl font-bold text-orange-600">
                {questions.filter(q => q.used).length}
              </p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Доступно</p>
              <p className="text-3xl font-bold text-green-600">
                {questions.filter(q => !q.used).length}
              </p>
            </div>
          </Card.Section>
        </Card>

        {/* Questions Table */}
        {questions.length > 0 ? (
          <Card className="mt-8">
            <Card.Header className="flex justify-between items-center px-6 py-4">
              <h2 className="text-xl font-semibold">Список вопросов</h2>
            </Card.Header>
            <Card.Section>
              <Table aria-label="Таблица вопросов" className="bg-transparent">
                <TableHeader>
                  <TableColumn>№</TableColumn>
                  <TableColumn>Вопрос</TableColumn>
                  <TableColumn>Ответ</TableColumn>
                  <TableColumn>Автор</TableColumn>
                  <TableColumn>Статус</TableColumn>
                  <TableColumn>Действия</TableColumn>
                </TableHeader>
                <TableBody>
                  {questions.map((q, idx) => (
                    <TableRow key={q.id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="line-clamp-2">{q.text}</p>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="line-clamp-2 text-gray-600">{q.answer}</p>
                      </TableCell>
                      <TableCell>{q.author || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          variant="flat"
                          color={q.used ? 'default' : 'success'}
                          size="sm"
                        >
                          {q.used ? 'Использован' : 'Доступен'}
                        </Chip>
                      </TableCell>
                      <TableCell>
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => removeQuestion(q.id)}
                        >
                          🗑️
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Body className="text-center py-16">
              <p className="text-gray-500 text-lg">Вопросы не загружены</p>
              <Button color="primary" onPress={onOpen} className="mt-4">
                Добавить первый вопрос
              </Button>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Modal for adding question */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <Modal.Content>
          {(onClose) => (
            <>
              <Modal.Header className="flex flex-col gap-1">
                Добавить новый вопрос
              </Modal.Header>
              <Modal.Body>
                <Textarea
                  label="Вопрос"
                  placeholder="Введите текст вопроса"
                  value={newQuestion.text}
                  onValueChange={(text) =>
                    setNewQuestion(prev => ({ ...prev, text }))
                  }
                  minRows={3}
                />
                <Textarea
                  label="Ответ"
                  placeholder="Введите правильный ответ"
                  value={newQuestion.answer}
                  onValueChange={(answer) =>
                    setNewQuestion(prev => ({ ...prev, answer }))
                  }
                  minRows={2}
                />
                <Input
                  label="Автор (опционально)"
                  placeholder="Имя автора вопроса"
                  value={newQuestion.author}
                  onValueChange={(author) =>
                    setNewQuestion(prev => ({ ...prev, author }))
                  }
                />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  color="danger"
                  variant="light"
                  onPress={onClose}
                >
                  Отмена
                </Button>
                <Button
                  color="primary"
                  onPress={handleAddQuestion}
                >
                  Добавить
                </Button>
              </Modal.Footer>
            </>
          )}
        </Modal.Content>
      </Modal>
    </div>
  );
}
