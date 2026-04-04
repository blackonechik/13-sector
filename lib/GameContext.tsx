'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  startTransition,
  ReactNode,
} from 'react';
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

const STORAGE_KEY = 'chgk-game-state-v2';
const CHANNEL_NAME = 'chgk-game-sync';
const SELECTION_DURATION_MS = 4300;

type StoredGameState = {
  questions: Question[];
  currentQuestionId: string | null;
  gameState: GameState;
  selectedIndex: number | null;
};

const createInitialState = (): StoredGameState => ({
  questions: [],
  currentQuestionId: null,
  gameState: 'waiting',
  selectedIndex: null,
});

function sanitizeQuestions(value: unknown): Question[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') {
      return [];
    }

    const question = item as Partial<Question>;
    if (
      typeof question.id !== 'string' ||
      typeof question.text !== 'string' ||
      typeof question.answer !== 'string'
    ) {
      return [];
    }

    return [{
      id: question.id,
      text: question.text,
      answer: question.answer,
      author: typeof question.author === 'string' && question.author.trim() ? question.author : undefined,
      createdAt: typeof question.createdAt === 'string' ? question.createdAt : undefined,
      used: Boolean(question.used),
    }];
  });
}

function parseStoredState(value: string | null): StoredGameState | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as Partial<StoredGameState>;
    const questions = sanitizeQuestions(parsed.questions);

    return {
      questions,
      currentQuestionId:
        typeof parsed.currentQuestionId === 'string' &&
        questions.some((question) => question.id === parsed.currentQuestionId)
          ? parsed.currentQuestionId
          : null,
      gameState:
        parsed.gameState &&
        ['waiting', 'selecting', 'question', 'answer', 'finished'].includes(parsed.gameState)
          ? parsed.gameState
          : 'waiting',
      selectedIndex: typeof parsed.selectedIndex === 'number' ? parsed.selectedIndex : null,
    };
  } catch {
    return null;
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StoredGameState>(createInitialState);
  const selectionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  const syncState = useCallback((nextState: StoredGameState) => {
    setState(nextState);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
    }

    channelRef.current?.postMessage(nextState);
  }, []);

  const updateState = useCallback(
    (updater: (previousState: StoredGameState) => StoredGameState) => {
      setState((previousState) => {
        const nextState = updater(previousState);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
        }

        channelRef.current?.postMessage(nextState);
        return nextState;
      });
    },
    []
  );

  useEffect(() => {
    const storedState = parseStoredState(window.localStorage.getItem(STORAGE_KEY));
    const initialState = storedState ?? createInitialState();

    startTransition(() => {
      setState(initialState);
    });

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) {
        return;
      }

      const nextState = parseStoredState(event.newValue);
      if (!nextState) {
        return;
      }

      startTransition(() => {
        setState(nextState);
      });
    };

    const handleMessage = (event: MessageEvent<StoredGameState>) => {
      startTransition(() => {
        setState(event.data);
      });
    };

    window.addEventListener('storage', handleStorage);
    channel.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      channel.removeEventListener('message', handleMessage);
      channel.close();
      channelRef.current = null;

      if (selectionTimeoutRef.current) {
        clearTimeout(selectionTimeoutRef.current);
      }
    };
  }, []);

  const questions = state.questions;
  const currentQuestion = useMemo(
    () => questions.find((question) => question.id === state.currentQuestionId) ?? null,
    [questions, state.currentQuestionId]
  );
  const gameState = state.gameState;
  const selectedIndex = state.selectedIndex;

  const addQuestion = useCallback((question: Omit<Question, 'id' | 'used'>) => {
    const newQuestion: Question = {
      ...question,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      used: false,
    };
    updateState((previousState) => ({
      ...previousState,
      questions: [...previousState.questions, newQuestion],
    }));
  }, [updateState]);

  const removeQuestion = useCallback((id: string) => {
    updateState((previousState) => {
      const nextQuestions = previousState.questions.filter((question) => question.id !== id);
      const isCurrentQuestionRemoved = previousState.currentQuestionId === id;
      const hasAvailableQuestions = nextQuestions.some((question) => !question.used);

      return {
        questions: nextQuestions,
        currentQuestionId: isCurrentQuestionRemoved ? null : previousState.currentQuestionId,
        gameState: nextQuestions.length === 0
          ? 'waiting'
          : isCurrentQuestionRemoved
            ? hasAvailableQuestions
              ? 'waiting'
              : 'finished'
            : previousState.gameState,
        selectedIndex: isCurrentQuestionRemoved ? null : previousState.selectedIndex,
      };
    });
  }, [updateState]);

  const updateQuestion = useCallback((id: string, updates: Partial<Question>) => {
    updateState((previousState) => ({
      ...previousState,
      questions: previousState.questions.map((question) =>
        question.id === id ? { ...question, ...updates } : question
      ),
    }));
  }, [updateState]);

  const pickQuestion = useCallback(() => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    const availableQuestions = questions.filter(q => !q.used);

    if (availableQuestions.length === 0) {
      updateState((previousState) => ({
        ...previousState,
        gameState: 'finished',
        currentQuestionId: null,
        selectedIndex: null,
      }));
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const selected = availableQuestions[randomIndex];
    const absoluteIndex = questions.findIndex((question) => question.id === selected.id);

    syncState({
      questions,
      currentQuestionId: selected.id,
      gameState: 'selecting',
      selectedIndex: absoluteIndex,
    });

    selectionTimeoutRef.current = setTimeout(() => {
      updateState((previousState) => {
        if (previousState.currentQuestionId !== selected.id) {
          return previousState;
        }

        return {
          ...previousState,
          gameState: 'question',
        };
      });
    }, SELECTION_DURATION_MS);
  }, [questions, syncState, updateState]);

  const showAnswer = useCallback(() => {
    if (gameState !== 'question' || !currentQuestion) {
      return;
    }

    updateState((previousState) => ({
      ...previousState,
      gameState: 'answer',
      questions: previousState.questions.map((question) =>
        question.id === currentQuestion.id ? { ...question, used: true } : question
      ),
    }));
  }, [currentQuestion, gameState, updateState]);

  const nextQuestion = useCallback(() => {
    updateState((previousState) => ({
      ...previousState,
      currentQuestionId: null,
      gameState: previousState.questions.some((question) => !question.used) ? 'waiting' : 'finished',
      selectedIndex: null,
    }));
  }, [updateState]);

  const resetGame = useCallback(() => {
    if (selectionTimeoutRef.current) {
      clearTimeout(selectionTimeoutRef.current);
    }

    updateState((previousState) => ({
      questions: previousState.questions.map((question) => ({ ...question, used: false })),
      currentQuestionId: null,
      gameState: 'waiting',
      selectedIndex: null,
    }));
  }, [updateState]);

  const setGameState = useCallback((nextGameState: GameState) => {
    updateState((previousState) => ({
      ...previousState,
      gameState: nextGameState,
    }));
  }, [updateState]);

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
