import { Question } from '../../models/Question';
import { BaseRepository } from './BaseRepository';
import { QuestionFilter } from '../../models/types';

export interface QuestionRepository extends BaseRepository<Question> {
  findAll(filters?: QuestionFilter): Promise<Question[]>;
}
