import type { ExamInvitation } from '../../models/ExamInvitation';
import { InvitationRepository, CreateInvitation } from '../interfaces';
import { axiosInstance } from '../../api/axiosInstance';

export class ApiInvitationRepository implements InvitationRepository {
  async findAll(): Promise<ExamInvitation[]> {
    const response = await axiosInstance.get('/invitations');
    return response.data;
  }

  async findById(id: string): Promise<ExamInvitation | null> {
    const response = await axiosInstance.get(`/invitations/${id}`);
    return response.data;
  }

  async findByToken(token: string): Promise<ExamInvitation | null> {
    const response = await axiosInstance.get(`/invitations/token/${token}`);
    return response.data;
  }

  async findByCandidateEmail(email: string): Promise<ExamInvitation[]> {
    const response = await axiosInstance.get('/invitations', { params: { email } });
    const allInvitations: ExamInvitation[] = response.data;
    return allInvitations.filter((i) => i.candidateEmail === email);
  }

  async validate(token: string, accessCode: string): Promise<ExamInvitation> {
    const response = await axiosInstance.post('/invitations/validate', { token, accessCode });
    return response.data;
  }

  async create(invitation: CreateInvitation): Promise<ExamInvitation> {
    const response = await axiosInstance.post('/invitations', invitation);
    return response.data;
  }

  async update(id: string, invitation: Partial<ExamInvitation>): Promise<ExamInvitation> {
    const response = await axiosInstance.patch(`/invitations/${id}`, invitation);
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await axiosInstance.delete(`/invitations/${id}`);
  }
}
