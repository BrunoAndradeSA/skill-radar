import { Seniority } from './enums/Seniority';
import { ExamTemplateTheme } from './ExamTemplateTheme';

export interface ExamTemplate {
  id: string;
  name: string;
  description?: string;
  seniority: Seniority;
  durationMinutes: number;
  isCertification: boolean;
  themes: ExamTemplateTheme[];
}
