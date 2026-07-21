export type Entity = { id: string };
export type CreateEntity<T extends Entity> = Omit<T, 'id'>;
export type UpdateEntity<T extends Entity> = Partial<Omit<T, 'id'>>;

import type { Seniority } from './enums/Seniority';
import type { QuestionType } from './enums/QuestionType';

export type QuestionFilter = {
  themeId?: string;
  seniority?: Seniority;
  type?: QuestionType;
};
