import { vi } from 'vitest';
import type { ThemeRepository } from '../repositories/interfaces/ThemeRepository';
import type { CompetencyRepository } from '../repositories/interfaces/CompetencyRepository';
import type { QuestionRepository } from '../repositories/interfaces/QuestionRepository';
import type { TemplateRepository } from '../repositories/interfaces/TemplateRepository';
import type { InvitationRepository } from '../repositories/interfaces/InvitationRepository';
import type { AssessmentRepository } from '../repositories/interfaces/AssessmentRepository';
import type { CandidateRepository } from '../repositories/interfaces/CandidateRepository';
import type { AuthRepository } from '../repositories/interfaces/AuthRepository';
import type { SelectionProcessRepository } from '../repositories/interfaces/SelectionProcessRepository';
import type { Theme } from '../models/Theme';
import type { Competency } from '../models/Competency';
import type { Question } from '../models/Question';
import type { ExamTemplate } from '../models/ExamTemplate';
import type { ExamInvitation } from '../models/ExamInvitation';
import type { Assessment } from '../models/Assessment';
import type { Candidate } from '../models/Candidate';
import type { User } from '../models/User';

export function createMockThemeRepository(): ThemeRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

export function createMockCompetencyRepository(): CompetencyRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

export function createMockQuestionRepository(): QuestionRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

export function createMockTemplateRepository(): TemplateRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

export function createMockInvitationRepository(): InvitationRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByToken: vi.fn(),
    findByCandidateEmail: vi.fn(),
    validate: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

export function createMockAssessmentRepository(): AssessmentRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByInvitationId: vi.fn(),
    findByInvitationIds: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
}

export function createMockCandidateRepository(): CandidateRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
}

export function createMockSelectionProcessRepository(): SelectionProcessRepository {
  return {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    addCandidates: vi.fn(),
    getRankings: vi.fn(),
    delete: vi.fn(),
  };
}

export function createMockAuthRepository(): AuthRepository {
  return {
    login: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  };
}

export const sampleTheme: Theme = { id: '1', name: 'Frontend' };
export const sampleCompetency: Competency = { id: '1', themeId: '1', name: 'React' };
export const sampleQuestion: Question = {
  id: '1',
  themeId: '1',
  competencyIds: ['1'],
  type: 'MULTIPLE_CHOICE',
  seniority: 'Pleno',
  text: 'O que é React?',
  alternatives: [
    { id: 'a1', text: 'Uma biblioteca', isCorrect: true },
    { id: 'a2', text: 'Um framework', isCorrect: false },
  ],
};
export const sampleTemplate: ExamTemplate = {
  id: '1',
  name: 'Template Padrão',
  seniority: 'Pleno',
  durationMinutes: 60,
  isCertification: false,
  themes: [{ themeId: '1', questionCount: 5 }],
};
export const sampleInvitation: ExamInvitation = {
  id: '1',
  templateId: '1',
  candidateName: 'João',
  candidateEmail: 'joao@teste.com',
  token: 'abc123',
  accessCode: 'XYZ789',
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
  used: false,
  createdAt: new Date().toISOString(),
  isExternal: false,
};
export const sampleAssessment: Assessment = {
  id: '1',
  invitationId: '1',
  templateId: '1',
  status: 'IN_PROGRESS',
  questions: [sampleQuestion],
  answers: [],
  timing: { startTime: new Date().toISOString(), durationSeconds: 0 },
  securityMetrics: { focusLostCount: 0, isTerminated: false },
};
export const sampleCandidate: Candidate = {
  id: '1',
  name: 'João Silva',
  email: 'joao@teste.com',
  cargo: 'Desenvolvedor',
  setor: 'Desenvolvimento',
  nivel: 'Pleno',
  squad: 'Squad 1',
};
export const sampleUser: User = {
  id: '1',
  name: 'Admin',
  email: 'admin@admin.com',
  roles: ['ADMIN'],
  enabled: true,
};
