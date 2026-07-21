import { AssessmentStatus } from './enums/AssessmentStatus';
import { ExamTiming } from './ExamTiming';
import { ExamSecurityMetrics } from './ExamSecurityMetrics';
import { AssessmentAnswer } from './AssessmentAnswer';
import { Question } from './Question';

export interface Assessment {
  id: string;
  invitationId: string;
  templateId: string;
  status: AssessmentStatus;
  questions: Question[]; // As questões sorteadas e embaralhadas para esta avaliação
  answers: AssessmentAnswer[];
  timing: ExamTiming;
  securityMetrics: ExamSecurityMetrics;
  score?: number; // Calculado no final
  percentage?: number; // Calculado no final
}
