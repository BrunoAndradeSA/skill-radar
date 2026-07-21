import type { CandidateInput, RankingItem, SelectionProcess } from '../../models/SelectionProcess';
import type { ExamInvitation } from '../../models/ExamInvitation';
import type { Assessment } from '../../models/Assessment';
import type { CreateSelectionProcess, SelectionProcessRepository } from '../interfaces/SelectionProcessRepository';

function getFromStorage<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export class MockSelectionProcessRepository implements SelectionProcessRepository {
  private storageKey = 'mock_selection_processes';

  async findAll(): Promise<SelectionProcess[]> {
    return getFromStorage<SelectionProcess>(this.storageKey);
  }

  async findById(id: string): Promise<SelectionProcess | null> {
    const items = getFromStorage<SelectionProcess>(this.storageKey);
    return items.find((p) => p.id === id) ?? null;
  }

  async create(data: CreateSelectionProcess): Promise<SelectionProcess> {
    const items = getFromStorage<SelectionProcess>(this.storageKey);
    const now = new Date().toISOString();
    const newItem: SelectionProcess = {
      id: crypto.randomUUID(),
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      cargo: data.cargo,
      nivel: data.nivel,
      setor: data.setor,
      squad: data.squad,
      templateId: data.templateId,
      totalInvitations: data.candidates.length,
      totalFinished: 0,
      createdAt: now,
      updatedAt: now,
    };
    items.push(newItem);

    const invitations = getFromStorage<ExamInvitation>('mock_invitations');
    for (const c of data.candidates) {
      const inv: ExamInvitation = {
        id: crypto.randomUUID(),
        templateId: data.templateId,
        selectionProcessId: newItem.id,
        candidateName: c.name,
        candidateEmail: c.email,
        cargo: data.cargo,
        squad: data.squad,
        setor: data.setor,
        nivel: data.nivel,
        token: crypto.randomUUID(),
        accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        expiresAt: data.endDate,
        used: false,
        createdAt: now,
        isExternal: true,
      };
      invitations.push(inv);
    }
    saveToStorage('mock_invitations', invitations);
    saveToStorage(this.storageKey, items);
    return newItem;
  }

  async addCandidates(id: string, candidates: CandidateInput[]): Promise<SelectionProcess> {
    const items = getFromStorage<SelectionProcess>(this.storageKey);
    const idx = items.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Processo seletivo não encontrado');

    const process = items[idx];
    const invitations = getFromStorage<ExamInvitation>('mock_invitations');
    const now = new Date().toISOString();

    for (const c of candidates) {
      const inv: ExamInvitation = {
        id: crypto.randomUUID(),
        templateId: process.templateId,
        selectionProcessId: process.id,
        candidateName: c.name,
        candidateEmail: c.email,
        cargo: process.cargo,
        squad: process.squad,
        setor: process.setor,
        nivel: process.nivel,
        token: crypto.randomUUID(),
        accessCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        expiresAt: process.endDate,
        used: false,
        createdAt: now,
        isExternal: true,
      };
      invitations.push(inv);
    }
    saveToStorage('mock_invitations', invitations);

    process.totalInvitations += candidates.length;
    process.updatedAt = now;
    items[idx] = process;
    saveToStorage(this.storageKey, items);
    return process;
  }

  async getRankings(id: string): Promise<RankingItem[]> {
    const invitations = getFromStorage<ExamInvitation>('mock_invitations');
    const processInvitations = invitations.filter((i) => i.selectionProcessId === id);

    const assessments = getFromStorage<Assessment>('mock_assessments');
    const rankings: RankingItem[] = processInvitations.map((inv) => {
      const assessment = assessments.find((a) => a.invitationId === inv.id);
      return {
        invitationId: inv.id,
        candidateName: inv.candidateName,
        candidateEmail: inv.candidateEmail,
        assessmentId: assessment?.id,
        score: assessment?.score ?? undefined,
        percentage: assessment?.percentage ?? undefined,
        status: assessment?.status,
        finished: assessment?.status === 'FINISHED' || assessment?.status === 'TERMINATED',
      };
    });

    rankings.sort((a, b) => {
      if (a.finished && !b.finished) return -1;
      if (!a.finished && b.finished) return 1;
      if (a.finished && b.finished) return (b.score ?? 0) - (a.score ?? 0);
      if (a.status === 'IN_PROGRESS' && b.status !== 'IN_PROGRESS') return -1;
      if (a.status !== 'IN_PROGRESS' && b.status === 'IN_PROGRESS') return 1;
      return 0;
    });

    return rankings;
  }

  async delete(id: string): Promise<void> {
    const items = getFromStorage<SelectionProcess>(this.storageKey);
    saveToStorage(
      this.storageKey,
      items.filter((p) => p.id !== id),
    );
  }
}
