import { ExamInvitation } from '../models/ExamInvitation';
import { InvitationRepository, CreateInvitation } from '../repositories/interfaces/InvitationRepository';
import { ValidationError } from '../models/errors';

export class InvitationService {
  constructor(private readonly invitationRepository: InvitationRepository) {}

  async getAllInvitations(): Promise<ExamInvitation[]> {
    return this.invitationRepository.findAll();
  }

  async getInvitationById(id: string): Promise<ExamInvitation | null> {
    return this.invitationRepository.findById(id);
  }

  async getInvitationByToken(token: string): Promise<ExamInvitation | null> {
    return this.invitationRepository.findByToken(token);
  }

  async findInvitationsByEmail(email: string): Promise<ExamInvitation[]> {
    return this.invitationRepository.findByCandidateEmail(email);
  }

  async validateToken(token: string, accessCode: string): Promise<ExamInvitation> {
    return this.invitationRepository.validate(token, accessCode);
  }

  async createInvitation(invitation: CreateInvitation): Promise<ExamInvitation> {
    if (!invitation.candidateName?.trim()) throw new ValidationError('O nome do candidato é obrigatório');
    if (!invitation.candidateEmail?.trim()) throw new ValidationError('O email do candidato é obrigatório');
    if (!invitation.templateId) throw new ValidationError('O ID do template é obrigatório');

    return this.invitationRepository.create(invitation);
  }

  async markAsUsed(id: string): Promise<void> {
    await this.invitationRepository.update(id, { used: true });
  }
}
