import React, { useMemo, useState } from 'react';


import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import { Eye, ClipboardList } from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import AssessmentDetailDialog from '../../../components/AssessmentDetailDialog';
import { useAssessments } from '../../../hooks/useAssessments';
import { useInvitations } from '../../../hooks/useInvitations';
import type { Assessment } from '../../../models/Assessment';
import type { ExamInvitation } from '../../../models/ExamInvitation';

const statusLabels: Record<string, string> = {
  NOT_STARTED: 'Não Iniciada',
  IN_PROGRESS: 'Em Andamento',
  FINISHED: 'Finalizada',
  TERMINATED: 'Encerrada',
};

const statusColors: Record<string, 'default' | 'info' | 'success' | 'error'> = {
  NOT_STARTED: 'default',
  IN_PROGRESS: 'info',
  FINISHED: 'success',
  TERMINATED: 'error',
};

function buildInvitationMap(invitations: ExamInvitation[]): Map<string, ExamInvitation> {
  return new Map(invitations.map((i) => [i.id, i]));
}



const AssessmentsPage: React.FC = () => {
  const { data: assessments, isLoading, error } = useAssessments();
  const { data: invitations } = useInvitations();
  const [detail, setDetail] = useState<Assessment | null>(null);

  const invitationMap = useMemo(() => invitations ? buildInvitationMap(invitations) : new Map(), [invitations]);
  const [filterCandidato, setFilterCandidato] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDateStart, setFilterDateStart] = useState('');
  const [filterDateEnd, setFilterDateEnd] = useState('');

  const filteredAssessments = useMemo(() => {
    if (!assessments) return [];
    return assessments.filter((a) => {
      const inv = invitationMap.get(a.invitationId);
      if (inv?.selectionProcessId) return false;
      const q = filterCandidato.toLowerCase();
      if (filterCandidato && !inv?.candidateName?.toLowerCase().includes(q) && !inv?.candidateEmail?.toLowerCase().includes(q)) return false;
      if (filterStatus && a.status !== filterStatus) return false;
      if (filterDateStart && a.timing?.startTime && new Date(a.timing.startTime) < new Date(filterDateStart)) return false;
      if (filterDateEnd && a.timing?.startTime) {
        const end = new Date(filterDateEnd);
        end.setDate(end.getDate() + 1);
        if (new Date(a.timing.startTime) >= end) return false;
      }
      return true;
    });
  }, [assessments, invitationMap, filterCandidato, filterStatus, filterDateStart, filterDateEnd]);

  if (isLoading) return <div className="flex justify-center py-12"><CircularProgress /></div>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Erro ao carregar avaliações</Alert>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">Avaliações</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Acompanhe as avaliações realizadas</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <TextField size="small" placeholder="Candidato" value={filterCandidato} onChange={(e) => setFilterCandidato(e.target.value)} sx={{ minWidth: 150 }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="NOT_STARTED">Não Iniciada</MenuItem>
            <MenuItem value="IN_PROGRESS">Em Andamento</MenuItem>
            <MenuItem value="FINISHED">Finalizada</MenuItem>
            <MenuItem value="TERMINATED">Encerrada</MenuItem>
          </Select>
        </FormControl>
        <TextField size="small" type="date" label="Data início" value={filterDateStart} onChange={(e) => setFilterDateStart(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150 }} />
        <TextField size="small" type="date" label="Data fim" value={filterDateEnd} onChange={(e) => setFilterDateEnd(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 150 }} />
      </div>

      {/* Desktop: tabela */}
      <div className="hidden md:block">
        {filteredAssessments.length === 0 ? (
          <div className="flex justify-center">
            <EmptyState icon={ClipboardList} title="Nenhuma avaliação encontrada" description="As avaliações aparecerão aqui após os candidatos realizarem seus exames." />
          </div>
        ) : (
          <div className="glass-panel overflow-hidden">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Candidato</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cargo</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Squad</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Setor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Acertos</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Viol. Foco</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Data</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssessments.map((a) => {
                    const inv = invitationMap.get(a.invitationId);
                    return (
                      <TableRow key={a.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-sm">
                              <ClipboardList size={14} />
                            </div>
                            {inv?.candidateName || a.invitationId}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{inv?.cargo || '-'}</TableCell>
                        <TableCell className="text-sm">{inv?.squad || '-'}</TableCell>
                        <TableCell className="text-sm">{inv?.setor || '-'}</TableCell>
                        <TableCell className="font-semibold">
                          {a.score != null && a.questions.length
                            ? `${a.score}/${a.questions.length}`
                            : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip label={statusLabels[a.status] || a.status} color={statusColors[a.status]} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell className="text-sm">{a.securityMetrics?.focusLostCount ?? 0}</TableCell>
                        <TableCell className="text-sm text-gray-500">
                          {a.timing?.startTime ? new Date(a.timing.startTime).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => setDetail(a)}
                            className="text-gray-400 hover:text-teal-600">
                            <Eye size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>

      {/* Mobile: cards */}
      <div className="block md:hidden space-y-3">
        {filteredAssessments.length === 0 ? (
          <div className="flex justify-center">
            <EmptyState icon={ClipboardList} title="Nenhuma avaliação encontrada" description="As avaliações aparecerão aqui após os candidatos realizarem seus exames." />
          </div>
        ) : (
          filteredAssessments.map((a) => {
            const inv = invitationMap.get(a.invitationId);
            return (
              <div key={a.id} className="glass-panel p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <ClipboardList size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-800 dark:text-gray-100 truncate text-sm">
                    {inv?.candidateName || a.invitationId}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Chip label={statusLabels[a.status] || a.status} color={statusColors[a.status]} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />
                    <span className="text-xs text-gray-500">
                      {a.score != null && a.questions.length ? `${a.score}/${a.questions.length}` : '-'}
                    </span>
                    {a.securityMetrics?.focusLostCount ? (
                      <span className="text-xs text-amber-600">{a.securityMetrics.focusLostCount} viol.</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {a.timing?.startTime ? new Date(a.timing.startTime).toLocaleDateString() : '-'}
                  </div>
                </div>
                <IconButton size="small" onClick={() => setDetail(a)} sx={{ color: 'text.secondary' }}>
                  <Eye size={18} />
                </IconButton>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!detail} onClose={() => setDetail(null)} maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Detalhes da Avaliação</DialogTitle>
        <DialogContent>
          {detail && (
            <AssessmentDetailDialog
              assessment={detail}
              invitationMap={invitationMap}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetail(null)} sx={{ borderRadius: 2 }}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AssessmentsPage;
