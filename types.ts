export enum Difficulty {
  Bachelor = 'Bachelor',
  Master = 'Master',
  Fougnies = 'Monsieur Fougnies'
}

export enum AppState {
  Onboarding = 'ONBOARDING',
  GeneratingQuiz = 'GENERATING_QUIZ',
  Quiz = 'QUIZ',
  AnalyzingResults = 'ANALYZING_RESULTS',
  Results = 'RESULTS'
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correct: number; // Index 0-3
}

export interface QuizData {
  questions: QuizQuestion[];
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface FeedbackData {
  feedback: string;
  flashcards: Flashcard[];
}

export interface UserAnswers {
  [questionId: number]: number; // Maps question ID to selected option index
}

export interface UserProfile {
  name: string;
  difficulty: Difficulty;
  content: string; // The parsed text from HTML
}

export interface AppActions {
  playAudio: (type: 'intro' | 'correct' | 'wrong' | 'win' | 'click') => void;
  toggleMute: () => void;
  isMuted: boolean;
}