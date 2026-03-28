'use client';

import { useEffect, useState } from 'react';
import { Button, Card } from '@heroui/react';
import { useGame } from '@/lib/GameContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function DisplayScreen() {
  const { questions, currentQuestion, gameState, pickQuestion, showAnswer, nextQuestion, resetGame } = useGame();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
        case 'Enter':
          if (gameState === 'question') {
            showAnswer();
          } else if (gameState === 'answer') {
            nextQuestion();
          } else if (gameState === 'waiting') {
            pickQuestion();
          }
          break;
        case 'KeyR':
          pickQuestion();
          break;
        case 'KeyA':
          if (gameState === 'question') showAnswer();
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyC':
          resetGame();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, pickQuestion, showAnswer, nextQuestion, resetGame]);

  // Simulate card selection animation
  useEffect(() => {
    if (gameState === 'selecting') {
      const interval = setInterval(() => {
        setSelectedCards(prev => [
          ...prev,
          Math.floor(Math.random() * Math.min(questions.length, 12))
        ]);
      }, 100);

      return () => clearInterval(interval);
    } else {
      setSelectedCards([]);
    }
  }, [gameState, questions.length]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Waiting State */}
        {gameState === 'waiting' && (
          <motion.div
            key="waiting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="text-center"
            >
              <h1 className="text-7xl font-black text-white mb-4">13 СЕКТОР</h1>
              <p className="text-2xl text-purple-300">Нажмите на кнопку для выбора вопроса</p>
              <p className="text-lg text-purple-400 mt-8">Space для старта</p>
            </motion.div>
          </motion.div>
        )}

        {/* Selecting State - Card Animation */}
        {gameState === 'selecting' && (
          <motion.div
            key="selecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center p-8"
          >
            <div className="grid grid-cols-4 gap-4 max-w-4xl">
              {Array.from({ length: 12 }).map((_, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    scale: selectedCards.includes(idx) ? 1.1 : 1,
                    backgroundColor: selectedCards.includes(idx)
                      ? '#a78bfa'
                      : '#475569',
                  }}
                  transition={{ duration: 0.1 }}
                  className="aspect-square rounded-lg cursor-pointer shadow-lg border-4 border-purple-500"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Question State */}
        {gameState === 'question' && currentQuestion && (
          <motion.div
            key="question"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl w-full"
            >
              <Card className="bg-gradient-to-br from-blue-600 to-purple-600 border-4 border-yellow-400 shadow-2xl">
                <Card.Body className="p-12 text-center">
                  <p className="text-xl text-blue-100 mb-6">Вопрос</p>
                  <h2 className="text-6xl font-black text-white mb-8 leading-tight">
                    {currentQuestion.text}
                  </h2>
                  {currentQuestion.author && (
                    <p className="text-xl text-blue-200">
                      Автор: <span className="font-semibold">{currentQuestion.author}</span>
                    </p>
                  )}
                </CardBody>
              </Card>

              <p className="text-center text-white text-xl mt-8">
                Нажмите Space или кнопку для показа ответа
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Answer State */}
        {gameState === 'answer' && currentQuestion && (
          <motion.div
            key="answer"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex flex-col items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-4xl w-full"
            >
              {/* Question Card Mini */}
              <Card className="bg-slate-700 bg-opacity-50 border-2 border-slate-500 mb-6">
                <Card.Body className="p-6 text-center">
                  <p className="text-sm text-slate-300">Вопрос:</p>
                  <p className="text-2xl font-semibold text-white">
                    {currentQuestion.text}
                  </p>
                </Card.Body>
              </Card>

              {/* Answer Card */}
              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-4 border-yellow-300 shadow-2xl">
                <Card.Body className="p-12 text-center">
                  <p className="text-2xl text-green-100 mb-6 font-semibold">ОТВЕТ</p>
                  <h2 className="text-5xl font-black text-white leading-tight">
                    {currentQuestion.answer}
                  </h2>
                </Card.Body>
              </Card>

              <p className="text-center text-white text-xl mt-8">
                Нажмите Space для следующего вопроса
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Finished State */}
        {gameState === 'finished' && (
          <motion.div
            key="finished"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
              }}
              className="text-center"
            >
              <h1 className="text-6xl font-black text-yellow-300 mb-4">🎉</h1>
              <p className="text-5xl font-black text-white mb-8">
                Путь завершён!
              </p>
              <p className="text-2xl text-purple-300">
                Все вопросы использованы
              </p>
              <p className="text-lg text-purple-400 mt-8">Нажмите C для сброса</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel - Always Visible */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-50">
        {gameState === 'waiting' && (
          <Button
            size="lg"
            color="primary"
            className="px-8 py-6 text-lg font-semibold"
            onPress={pickQuestion}
          >
            🎲 Выбрать вопрос (Space)
          </Button>
        )}

        {gameState === 'question' && (
          <Button
            size="lg"
            color="success"
            className="px-8 py-6 text-lg font-semibold"
            onPress={showAnswer}
          >
            ✓ Показать ответ (Space)
          </Button>
        )}

        {gameState === 'answer' && (
          <Button
            size="lg"
            color="primary"
            className="px-8 py-6 text-lg font-semibold"
            onPress={nextQuestion}
          >
            → Следующий вопрос (Space)
          </Button>
        )}

        {gameState === 'finished' && (
          <Button
            size="lg"
            color="warning"
            className="px-8 py-6 text-lg font-semibold"
            onPress={resetGame}
          >
            ↻ Начать заново (C)
          </Button>
        )}

        {/* Fullscreen button */}
        <Button
          size="lg"
          isIconOnly
          variant="bordered"
          className="text-white"
          onPress={toggleFullscreen}
        >
          {isFullscreen ? '⛶' : '⛶'}
        </Button>
      </div>

      {/* Info Panel - Top Right */}
      <div className="absolute top-8 right-8 bg-black bg-opacity-60 rounded-lg p-4 text-white">
        <p className="text-sm text-gray-300">Доступно вопросов</p>
        <p className="text-3xl font-bold text-green-400">
          {questions.filter(q => !q.used).length}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Использовано: {questions.filter(q => q.used).length}
        </p>
      </div>

      {/* Keyboard Hints for Demo */}
      <div className="absolute top-8 left-8 bg-black bg-opacity-60 rounded-lg p-4 text-white max-w-xs">
        <p className="text-sm font-semibold mb-2">Горячие клавиши:</p>
        <p className="text-xs text-gray-300">Space - действие</p>
        <p className="text-xs text-gray-300">R - новый вопрос</p>
        <p className="text-xs text-gray-300">A - показать ответ</p>
        <p className="text-xs text-gray-300">F - полноэкран</p>
        <p className="text-xs text-gray-300">C - сброс</p>
      </div>
    </div>
  );
}
