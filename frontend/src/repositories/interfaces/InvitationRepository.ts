import { ExamInvitation } from '../../models/ExamInvitation';
import type { CreateEntity } from '../../models/types';

export interface InvitationRepository {
  findAll(): Promise<ExamInvitation[]>;
  findById(id: string): Promise<ExamInvitation | null>;
  findByToken(token: string): Promise<ExamInvitation | null>;
  findByCandidateEmail(email: string): Promise<ExamInvitation[]>;
  validate(token: string, accessCode: string): Promise<ExamInvitation>;
  create(invitation: CreateInvitation): Promise<ExamInvitation>;
  update(id: string, invitation: Partial<ExamInvitation>): Promise<ExamInvitation>;
  delete(id: string): Promise<void>;
}

export type CreateInvitation = CreateEntity<Omit<ExamInvitation, 'token' | 'accessCode' | 'used' | 'createdAt'>>;
