export enum TestType {
  MULTIPLE_CHOICE = 'multiple_choice',
  SHORT_ANSWER = 'short_answer',
  LONG_ANSWER = 'long_answer',
  MIXED = 'mixed',
}

export interface Question {
  id: number;
  test_id: number;
  question_text: string;
  question_type: TestType;
  options?: string[];
  correct_answer: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Test {
  id: number;
  document_id: number;
  title: string;
  description: string;
  test_type: TestType;
  num_questions: number;
  questions: Question[];
  created_at: string;
  updated_at: string;
}

export interface TestResult {
  id: number;
  test_id: number;
  user_id: number;
  score: number;
  max_score: number;
  answers: {
    question_id: number;
    user_answer: string;
    is_correct: boolean;
    points_earned: number;
  }[];
  created_at: string;
  updated_at: string;
} 