export interface Question {
  id: string;
  text: string;
  answer: string;
  author?: string;
  date?: Date;
  used: boolean;
}

export type GameState = 'waiting' | 'selecting' | 'question' | 'answer' | 'finished';

export interface GameContext {
  questions: Question[];
  currentQuestion: Question | null;
  gameState: GameState;
  selectedIndex: number | null;
}
