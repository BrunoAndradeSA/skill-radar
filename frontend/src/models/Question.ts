import { Seniority } from './enums/Seniority';
import { QuestionType } from './enums/QuestionType';
import { Alternative } from './Alternative';

export interface Question {
  id: string;
  themeId: string;
  competencyIds: string[];
  type: QuestionType;
  seniority: Seniority;
  text: string;
  alternatives: Alternative[];
  explanation?: string;
}
