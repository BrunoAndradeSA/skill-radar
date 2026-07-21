import { Assessment } from '../models/Assessment';
import type { AssessmentAnswer } from '../models/AssessmentAnswer';
import { AssessmentRepository } from '../repositories/interfaces/AssessmentRepository';
import { NotFoundError } from '../models/errors';

export class AssessmentService {
  constructor(
    private readonly assessmentRepository: AssessmentRepository,
  ) {}

  async getAllAssessments(): Promise<Assessment[]> {
    return this.assessmentRepository.findAll();
  }

  async getAssessmentById(id: string, invitationToken?: string): Promise<Assessment | null> {
    return this.assessmentRepository.findById(id, invitationToken);
  }

  async getAssessmentByInvitationId(invitationId: string): Promise<Assessment | null> {
    return this.assessmentRepository.findByInvitationId(invitationId);
  }

  async getAssessmentsByInvitationIds(ids: string[]): Promise<Assessment[]> {
    return this.assessmentRepository.findByInvitationIds(ids);
  }

  async startAssessment(invitationId: string, templateId: string): Promise<Assessment> {
    return this.assessmentRepository.create({ invitationId, templateId });
  }

  async submitAssessment(id: string, answers?: AssessmentAnswer[], violationsCount?: number, invitationToken?: string): Promise<Assessment> {
    const assessment = await this.assessmentRepository.update(id, {
      status: 'FINISHED',
      answers: answers ?? [],
      securityMetrics: { focusLostCount: violationsCount ?? 0, isTerminated: false },
    }, invitationToken);

    if (!assessment) throw new NotFoundError('Avaliação', id);

    return assessment;
  }

  async terminateAssessment(id: string, violationsCount: number = 2, invitationToken?: string): Promise<Assessment> {
    return this.assessmentRepository.update(id, {
      status: 'TERMINATED',
      securityMetrics: { focusLostCount: violationsCount, isTerminated: true },
    }, invitationToken);
  }

  async rejectAssessment(invitationId: string, templateId: string, invitationToken?: string): Promise<Assessment> {
    const assessment = await this.assessmentRepository.create({ invitationId, templateId });
    return this.assessmentRepository.update(assessment.id, { status: 'REJECTED' }, invitationToken);
  }
}
