export interface AssessmentAnswer {
  questionId: string;
  selectedAlternativeId?: string;
  timeSpentSeconds: number;
  isCorrect?: boolean;
}
