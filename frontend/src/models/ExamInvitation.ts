export interface ExamInvitation {
  id: string;
  templateId: string;
  candidateId?: string;
  selectionProcessId?: string;
  candidateName: string;
  candidateEmail: string;
  cargo?: string;
  squad?: string;
  setor?: string;
  nivel?: string;
  token: string;
  accessCode: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
  isExternal: boolean;
}
