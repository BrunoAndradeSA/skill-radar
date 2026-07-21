import type { Assessment } from '../../models/Assessment';
import { AssessmentRepository, CreateAssessment } from '../interfaces';
import { axiosInstance } from '../../api/axiosInstance';

export class ApiAssessmentRepository implements AssessmentRepository {
  async findAll(): Promise<Assessment[]> {
    const response = await axiosInstance.get('/assessments');
    return response.data;
  }

  async findById(id: string, invitationToken?: string): Promise<Assessment | null> {
    const config = invitationToken
      ? { headers: { 'X-Invitation-Token': invitationToken } }
      : undefined;
    const response = await axiosInstance.get(`/assessments/${id}`, config);
    return response.data;
  }

  async findByInvitationId(invitationId: string): Promise<Assessment | null> {
    const response = await axiosInstance.get(`/assessments/invitation/${invitationId}`);
    return response.data;
  }

  async findByInvitationIds(ids: string[]): Promise<Assessment[]> {
    if (ids.length === 0) return [];
    const response = await axiosInstance.get('/assessments', { params: { invitation_ids: ids.join(',') } });
    const allAssessments: Assessment[] = response.data;
    const idSet = new Set(ids);
    return allAssessments.filter((a) => idSet.has(a.invitationId));
  }

  async create(data: CreateAssessment): Promise<Assessment> {
    const response = await axiosInstance.post('/assessments', data);
    return response.data;
  }

  async update(id: string, assessment: Partial<Assessment>, invitationToken?: string): Promise<Assessment> {
    const response = await axiosInstance.patch(`/assessments/${id}`, assessment, {
      headers: invitationToken ? { 'X-Invitation-Token': invitationToken } : undefined,
    });
    return response.data;
  }
}
