export interface Question {
  id: string;
  text: string;
  answer: string;
  author?: string | null;
  createdAt: string;
  updatedAt: string;
  used: boolean;
  status: QuestionStatus;
}

export type GameState = 'waiting' | 'selecting' | 'question' | 'answer' | 'finished';
export type QuestionStatus = 'pending' | 'approved' | 'rejected';

export interface SubmissionSettings {
  submissionsEnabled: boolean;
  submissionsStartAt: string | null;
  submissionsEndAt: string | null;
  acceptingQuestions: boolean;
}

export interface GameSnapshot {
  questions: Question[];
  currentQuestion: Question | null;
  currentQuestionId: string | null;
  gameState: GameState;
  selectedIndex: number | null;
  totals: {
    submitted: number;
  };
}

export interface AdminQuestionPayload {
  text: string;
  answer: string;
  author?: string;
  status?: QuestionStatus;
}
