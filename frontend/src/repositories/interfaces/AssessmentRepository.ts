import { Assessment } from '../../models/Assessment';

export interface AssessmentRepository {
  findAll(): Promise<Assessment[]>;
  findById(id: string, invitationToken?: string): Promise<Assessment | null>;
  findByInvitationId(invitationId: string): Promise<Assessment | null>;
  findByInvitationIds(ids: string[]): Promise<Assessment[]>;
  create(data: CreateAssessment): Promise<Assessment>;
  update(id: string, assessment: Partial<Assessment>, invitationToken?: string): Promise<Assessment>;
}

export type CreateAssessment = {
  invitationId: string;
  templateId: string;
};
