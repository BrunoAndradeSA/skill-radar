import type { SelectionProcess } from '../../models/SelectionProcess';

export const selectionProcesses: SelectionProcess[] = [
  {
    id: 'sel-proc-001',
    name: 'Processo Seletivo DEV 2026.2',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cargo: 'Desenvolvedor',
    nivel: 'Pleno',
    setor: 'Desenvolvimento',
    squad: 'Squad 1',
    templateId: 'template-fullstack-mid',
    totalInvitations: 2,
    totalFinished: 0,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'sel-proc-002',
    name: 'Processo QA 2026.1',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    cargo: 'QA',
    nivel: 'Júnior',
    setor: 'Desenvolvimento',
    squad: 'Squad 2',
    templateId: 'template-erp-junior',
    totalInvitations: 1,
    totalFinished: 1,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
