export interface SelectionProcess {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  cargo: string;
  nivel: string;
  setor: string;
  squad: string;
  templateId: string;
  totalInvitations: number;
  totalFinished: number;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateInput {
  name: string;
  email: string;
}

export interface RankingItem {
  invitationId: string;
  candidateName: string;
  candidateEmail: string;
  assessmentId?: string;
  score?: number;
  percentage?: number;
  status?: string;
  finished: boolean;
}
