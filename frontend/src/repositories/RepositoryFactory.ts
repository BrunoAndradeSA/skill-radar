import type { ThemeRepository } from './interfaces/ThemeRepository';
import type { CompetencyRepository } from './interfaces/CompetencyRepository';
import type { QuestionRepository } from './interfaces/QuestionRepository';
import type { TemplateRepository } from './interfaces/TemplateRepository';
import type { InvitationRepository } from './interfaces/InvitationRepository';
import type { AssessmentRepository } from './interfaces/AssessmentRepository';
import type { CandidateRepository } from './interfaces/CandidateRepository';
import type { AuthRepository } from './interfaces/AuthRepository';
import type { SelectionProcessRepository } from './interfaces/SelectionProcessRepository';
import { MockThemeRepository } from './mock/MockThemeRepository';
import { MockCompetencyRepository } from './mock/MockCompetencyRepository';
import { MockQuestionRepository } from './mock/MockQuestionRepository';
import { MockTemplateRepository } from './mock/MockTemplateRepository';
import { MockInvitationRepository } from './mock/MockInvitationRepository';
import { MockAssessmentRepository } from './mock/MockAssessmentRepository';
import { MockCandidateRepository } from './mock/MockCandidateRepository';
import { MockAuthRepository } from './mock/MockAuthRepository';
import { MockSelectionProcessRepository } from './mock/MockSelectionProcessRepository';
import { ApiThemeRepository } from './api/ApiThemeRepository';
import { ApiCompetencyRepository } from './api/ApiCompetencyRepository';
import { ApiQuestionRepository } from './api/ApiQuestionRepository';
import { ApiTemplateRepository } from './api/ApiTemplateRepository';
import { ApiInvitationRepository } from './api/ApiInvitationRepository';
import { ApiAssessmentRepository } from './api/ApiAssessmentRepository';
import { ApiCandidateRepository } from './api/ApiCandidateRepository';
import { ApiAuthRepository } from './api/ApiAuthRepository';
import { ApiSelectionProcessRepository } from './api/ApiSelectionProcessRepository';

const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === 'true';

export class RepositoryFactory {
  static getThemeRepository(): ThemeRepository {
    return MOCK_MODE
      ? new MockThemeRepository()
      : new ApiThemeRepository();
  }

  static getCompetencyRepository(): CompetencyRepository {
    return MOCK_MODE
      ? new MockCompetencyRepository()
      : new ApiCompetencyRepository();
  }

  static getQuestionRepository(): QuestionRepository {
    return MOCK_MODE
      ? new MockQuestionRepository()
      : new ApiQuestionRepository();
  }

  static getTemplateRepository(): TemplateRepository {
    return MOCK_MODE
      ? new MockTemplateRepository()
      : new ApiTemplateRepository();
  }

  static getInvitationRepository(): InvitationRepository {
    return MOCK_MODE
      ? new MockInvitationRepository()
      : new ApiInvitationRepository();
  }

  static getAssessmentRepository(): AssessmentRepository {
    return MOCK_MODE
      ? new MockAssessmentRepository()
      : new ApiAssessmentRepository();
  }

  static getCandidateRepository(): CandidateRepository {
    return MOCK_MODE
      ? new MockCandidateRepository()
      : new ApiCandidateRepository();
  }

  static getAuthRepository(): AuthRepository {
    return MOCK_MODE
      ? new MockAuthRepository()
      : new ApiAuthRepository();
  }

  static getSelectionProcessRepository(): SelectionProcessRepository {
    return MOCK_MODE
      ? new MockSelectionProcessRepository()
      : new ApiSelectionProcessRepository();
  }
}
