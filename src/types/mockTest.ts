export interface MockTestResponse {
  questionId: string;
  selectedAnswer: string[];  // ["New Delhi"] — actual values
  isCorrect: boolean;
  timeTaken: number;         // seconds spent on this question
}

export interface MockTest {
  id: string;
  examinationId: string;
  examinationName: string;   // denormalized for quick reads
  userId: string;
  responses: MockTestResponse[];
  totalQuestions: number;
  totalScore: number;        // max possible score (= totalQuestions)
  obtainedScore: number;
  status: 'in-progress' | 'completed';
  startedAt: string;
  completedAt?: string;
  createdAt: string;
}
