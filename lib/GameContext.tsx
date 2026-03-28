'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Question, GameState, GameContext as IGameContext } from './types';

interface GameContextType extends IGameContext {
  addQuestion: (question: Omit<Question, 'id' | 'used'>) => void;
  removeQuestion: (id: string) => void;
  updateQuestion: (id: string, question: Partial<Question>) => void;
  pickQuestion: () => void;
  showAnswer: () => void;
  nextQuestion: () => void;
  resetGame: () => void;
  setGameState: (state: GameState) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const addQuestion = useCallback((question: Omit<Question, 'id' | 'used'>) => {
    const newQuestion: Question = {
      ...question,
      id: Date.now().toString(),
      used: false,
    };
    setQuestions(prev => [...prev, newQuestion]);
  }, []);

  const removeQuestion = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    setQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, ...updates } : q))
    );
  }, []);

  const pickQuestion = useCallback(() => {
    const availableQuestions = questions.filter(q => !q.used);
    
    if (availableQuestions.length === 0) {
      setGameState('finished');
      return;
    }

    // Анимация выбора
    setGameState('selecting');
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selected = availableQuestions[randomIndex];
    
    // Имитируем анимацию
    setTimeout(() => {
      setCurrentQuestion(selected);
      setGameState('question');
    }, 2000);
  }, [questions]);

  const showAnswer = useCallback(() => {
    if (gameState === 'question' || gameState === 'answer') {
      setGameState('answer');
      if (currentQuestion) {
        updateQuestion(currentQuestion.id, { used: true });
      }
    }
  }, [gameState, currentQuestion, updateQuestion]);

  const nextQuestion = useCallback(() => {
    setCurrentQuestion(null);
    setGameState('waiting');
    setSelectedIndex(null);
  }, []);

  const resetGame = useCallback(() => {
    setQuestions(prev => prev.map(q => ({ ...q, used: false })));
    setCurrentQuestion(null);
    setGameState('waiting');
    setSelectedIndex(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        questions,
        currentQuestion,
        gameState,
        selectedIndex,
        addQuestion,
        removeQuestion,
        updateQuestion,
        pickQuestion,
        showAnswer,
        nextQuestion,
        resetGame,
        setGameState,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}
