import { Competency } from '../../models/Competency';
import { BaseRepository } from './BaseRepository';

export interface CompetencyRepository extends BaseRepository<Competency> {
  findAll(themeId?: string): Promise<Competency[]>;
}
