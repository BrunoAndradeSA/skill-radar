import { ExamInvitation } from '../../models/ExamInvitation';
import { InvitationRepository, CreateInvitation } from '../interfaces/InvitationRepository';
import { seedMockData } from '../../mocks/seed';
import { NotFoundError, InvitationError } from '../../models/errors';

export class MockInvitationRepository implements InvitationRepository {
  private getInvitations(): ExamInvitation[] {
    seedMockData();
    const data = localStorage.getItem('mock_invitations');
    return data ? JSON.parse(data) : [];
  }

  private saveInvitations(items: ExamInvitation[]): void {
    localStorage.setItem('mock_invitations', JSON.stringify(items));
  }

  async findAll(): Promise<ExamInvitation[]> {
    return this.getInvitations();
  }

  async findById(id: string): Promise<ExamInvitation | null> {
    const items = this.getInvitations();
    return items.find((i) => i.id === id) || null;
  }

  async findByToken(token: string): Promise<ExamInvitation | null> {
    const items = this.getInvitations();
    return items.find((i) => i.token === token) || null;
  }

  async findByCandidateEmail(email: string): Promise<ExamInvitation[]> {
    const items = this.getInvitations();
    return items.filter((i) => i.candidateEmail === email);
  }

  async validate(token: string, accessCode: string): Promise<ExamInvitation> {
    const items = this.getInvitations();
    const invitation = items.find((i) => i.token === token);
    if (!invitation) throw new InvitationError('Token inválido');
    if (invitation.accessCode !== accessCode) throw new InvitationError('Código de acesso inválido');
    if (invitation.used) throw new InvitationError('O convite já foi utilizado');
    if (new Date(invitation.expiresAt) < new Date()) throw new InvitationError('O convite expirou');
    return invitation;
  }

  async create(invitation: CreateInvitation): Promise<ExamInvitation> {
    const items = this.getInvitations();
    const newItem: ExamInvitation = {
      ...invitation,
      isExternal: invitation.isExternal ?? false,
      id: crypto.randomUUID(),
      token: crypto.randomUUID(),
      accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      used: false,
      createdAt: new Date().toISOString(),
    };
    items.push(newItem);
    this.saveInvitations(items);
    return newItem;
  }

  async update(id: string, invitation: Partial<ExamInvitation>): Promise<ExamInvitation> {
    const items = this.getInvitations();
    const index = items.findIndex((i) => i.id === id);
    if (index === -1) throw new NotFoundError('Convite', id);
    
    items[index] = { ...items[index], ...invitation };
    this.saveInvitations(items);
    return items[index];
  }

  async delete(id: string): Promise<void> {
    const items = this.getInvitations();
    const filtered = items.filter((i) => i.id !== id);
    this.saveInvitations(filtered);
  }
}
