import React, { useMemo, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import {
  Plus, Briefcase, Users, Eye, ChevronDown, ChevronUp,
  Trash2, CheckCircle, XCircle, Minus,
  User, Trophy, AlertTriangle,
} from 'lucide-react';
import { EmptyState } from '../../../components/EmptyState';
import { useSelectionProcesses, useSelectionProcessMutations, useSelectionProcessRankings } from '../../../hooks/useSelectionProcesses';
import { useTemplates } from '../../../hooks/useTemplates';
import { useAssessments } from '../../../hooks/useAssessments';
import { useInvitations } from '../../../hooks/useInvitations';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { useFormGuard } from '../../../hooks/useFormGuard';
import type { SelectionProcess } from '../../../models/SelectionProcess';
import type { Assessment } from '../../../models/Assessment';
import type { ExamInvitation } from '../../../models/ExamInvitation';

const CARGO_OPTIONS = ['Desenvolvedor', 'QA', 'Service Desk'];
const SETOR_OPTIONS = ['Desenvolvimento', 'Service Desk'];
const SQUAD_OPTIONS = ['Squad 1', 'Squad 2', 'Squad 3'];
const NIVEL_OPTIONS = ['Trainee', 'Júnior', 'Pleno', 'Sênior'];

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

function buildGaps(assessment: Assessment) {
  const gapMap = new Map<string, { themeName: string; wrongCount: number; totalCount: number }>();
  for (const q of assessment.questions) {
    const themeName = (q as { themeName?: string }).themeName || q.themeId;
    if (!gapMap.has(q.themeId)) {
      gapMap.set(q.themeId, { themeName, wrongCount: 0, totalCount: 0 });
    }
    const entry = gapMap.get(q.themeId)!;
    entry.totalCount++;
    const qid = (q as { questionId?: string }).questionId || q.id;
    const answer = assessment.answers.find((a) => a.questionId === qid);
    if (!answer?.isCorrect) {
      entry.wrongCount++;
    }
  }
  return Array.from(gapMap.values()).filter((g) => g.totalCount > 0);
}

const AssessmentDetailDialog: React.FC<{
  assessment: Assessment;
}> = ({ assessment }) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const gaps = useMemo(() => buildGaps(assessment), [assessment]);

  function toggleQuestion(index: number) {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="dash-stat-card text-center">
          <span className="text-xs text-gray-500">Status</span>
          <div><Chip label={statusLabels[assessment.status]} color={statusColors[assessment.status]} size="small" /></div>
        </div>
        <div className="dash-stat-card text-center">
          <span className="text-xs text-gray-500">Acertos</span>
          <div className="font-semibold">
            {assessment.score != null ? `${assessment.score}/${assessment.questions.length}` : '-'}
          </div>
          {assessment.percentage != null && <div className="text-xs text-gray-500">{assessment.percentage}%</div>}
        </div>
      </div>

      {gaps.length > 0 && (
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gaps por Tema</span>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {gaps.map((g) => {
              const errorRate = g.totalCount > 0 ? Math.round((g.wrongCount / g.totalCount) * 100) : 0;
              return (
                <div key={g.themeName} className={`rounded-xl border p-3 ${
                  g.wrongCount > 0
                    ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20'
                    : 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                }`}>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{g.themeName}</div>
                  <div className="text-lg font-bold">{g.wrongCount}/{g.totalCount}</div>
                  <div className="text-xs text-gray-500">{errorRate}% de erro</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {assessment.questions.length > 0 && (
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Questões</span>
          <div className="space-y-1.5 mt-2">
            {assessment.questions.map((q, i) => {
              const qid = (q as { questionId?: string }).questionId || q.id;
              const answer = assessment.answers.find((a) => a.questionId === qid);
              const selectedAlt = q.alternatives.find((a) => a.id === answer?.selectedAlternativeId);
              const correctAlt = q.alternatives.find((a) => a.isCorrect === true);
              const isAnswered = answer != null && answer.selectedAlternativeId != null;
              const isCorrect = answer?.isCorrect ?? null;
              const isExpanded = expandedQuestions.has(i);

              return (
                <div key={q.id} onClick={() => toggleQuestion(i)}
                  className={`rounded-xl border-l-4 p-3 cursor-pointer transition-all duration-150 ${
                    !isAnswered ? 'border-l-gray-400 bg-gray-50/50 dark:bg-gray-800/20 dark:border-l-gray-600'
                      : isCorrect ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
                  }`}>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {!isAnswered ? <Minus size={14} className="text-gray-400" />
                        : isCorrect ? <CheckCircle size={14} className="text-emerald-600" />
                          : <XCircle size={14} className="text-red-600" />}
                    </span>
                    <span className="font-medium text-gray-700 dark:text-gray-300 flex-shrink-0">{i + 1}.</span>
                    <span className="text-gray-600 dark:text-gray-400 leading-relaxed min-w-0 flex-1">
                      {isExpanded ? q.text : q.text.length > 80 ? q.text.slice(0, 80) + '\u2026' : q.text}
                    </span>
                    <span className="flex-shrink-0 text-gray-400">
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                      <div className="text-gray-700 dark:text-gray-300 leading-relaxed">{q.text}</div>
                      <div className={!isAnswered ? 'text-gray-400' : isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                        <span className="font-medium">Resposta: </span>
                        {!isAnswered ? 'Não respondida' : selectedAlt?.text ?? 'Alternativa não encontrada'}
                      </div>
                      {isAnswered && !isCorrect && correctAlt && (
                        <div className="text-emerald-700">
                          <span className="font-medium">Resposta correta: </span>{correctAlt.text}
                        </div>
                      )}
                      {q.explanation && !isCorrect && (
                        <div className="text-gray-500 dark:text-gray-400 italic">
                          <span className="font-medium not-italic">Explicação: </span>{q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="text-sm text-gray-500">
        Início: {assessment.timing?.startTime ? new Date(assessment.timing.startTime).toLocaleString() : '-'}
        {assessment.timing?.endTime && <> | Fim: {new Date(assessment.timing.endTime).toLocaleString()}</>}
      </div>
    </div>
  );
};

const SelectionProcessesPage: React.FC = () => {
  const { data: processes, isLoading, error } = useSelectionProcesses();
  const { data: templates } = useTemplates();
  const { data: allAssessments } = useAssessments();
  const { data: invitations } = useInvitations();
  const mutations = useSelectionProcessMutations();

  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addCandidatesOpen, setAddCandidatesOpen] = useState(false);
  const [detailAssessment, setDetailAssessment] = useState<Assessment | null>(null);

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [cargo, setCargo] = useState('');
  const [nivel, setNivel] = useState('');
  const [setor, setSetor] = useState('');
  const [squad, setSquad] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [candidates, setCandidates] = useState<{ name: string; email: string }[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');

  const formGuard = useFormGuard();
  const addCandGuard = useFormGuard();

  const [addCandName, setAddCandName] = useState('');
  const [addCandEmail, setAddCandEmail] = useState('');

  const { data: rankings, isLoading: rankingsLoading } = useSelectionProcessRankings(expandedId);

  const assessmentMap = useMemo(() => {
    if (!allAssessments) return new Map<string, Assessment>();
    return new Map(allAssessments.map((a) => [a.id, a]));
  }, [allAssessments]);

  const invitationMap = useMemo(() => {
    if (!invitations) return new Map<string, ExamInvitation>();
    return new Map(invitations.map((inv) => [inv.id, inv]));
  }, [invitations]);

  const resetForm = () => {
    setName('');
    setStartDate('');
    setEndDate('');
    setCargo('');
    setNivel('');
    setSetor('');
    setSquad('');
    setTemplateId('');
    setCandidates([]);
    setCandidateName('');
    setCandidateEmail('');
  };

  const closeCreateDialog = () => {
    setOpen(false);
    formGuard.setIsDirty(false);
  };

  const closeAddCandDialog = () => {
    setAddCandidatesOpen(false);
    addCandGuard.setIsDirty(false);
  };

  const handleAddCandidate = () => {
    if (!candidateName.trim() || !candidateEmail.trim()) return;
    setCandidates([...candidates, { name: candidateName.trim(), email: candidateEmail.trim() }]);
    setCandidateName('');
    setCandidateEmail('');
  };

  const handleRemoveCandidate = (idx: number) => {
    setCandidates(candidates.filter((_, i) => i !== idx));
  };

  const handleCreateSave = () => {
    if (!name.trim() || !templateId || !startDate || !endDate || !cargo || !nivel || !setor || !squad) return;
    mutations.create.mutate({
      name: name.trim(),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      cargo,
      nivel,
      setor,
      squad,
      templateId,
      candidates,
    }, {
      onSuccess: () => {
        closeCreateDialog();
        resetForm();
      },
    });
  };

  const handleAddCandidatesSave = () => {
    if (!expandedId || !addCandName.trim() || !addCandEmail.trim()) return;
    mutations.addCandidates.mutate({
      id: expandedId,
      candidates: [{ name: addCandName.trim(), email: addCandEmail.trim() }],
    }, {
      onSuccess: () => {
        closeAddCandDialog();
        setAddCandName('');
        setAddCandEmail('');
      },
    });
  };

  const isWithinValidity = (process: SelectionProcess) => {
    const now = new Date();
    return now >= new Date(process.startDate) && now <= new Date(process.endDate);
  };

  const isExpired = (process: SelectionProcess) => {
    return new Date() > new Date(process.endDate);
  };

  if (isLoading) return <div className="flex justify-center py-12"><CircularProgress /></div>;
  if (error) return <Alert severity="error" sx={{ borderRadius: 2 }}>Erro ao carregar processos seletivos</Alert>;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">
            Processos Seletivos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Gerencie processos seletivos e acompanhe o ranking dos candidatos
          </p>
        </div>
        <Button variant="contained" startIcon={<Plus size={18} />} onClick={() => { resetForm(); formGuard.setIsDirty(false); setOpen(true); }} sx={{ borderRadius: 2 }}>
          Novo Processo
        </Button>
      </div>

      <div className="space-y-3">
        {(!processes || processes.length === 0) ? (
          <div className="flex justify-center">
            <EmptyState icon={Briefcase} title="Nenhum processo seletivo" description="Crie um processo seletivo para começar." />
          </div>
        ) : (
          processes.map((process) => (
            <div key={process.id} className="glass-panel overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors"
                onClick={() => setExpandedId(expandedId === process.id ? null : process.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-sm">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 dark:text-gray-100">{process.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {process.cargo} - {process.nivel} | {process.totalInvitations} candidatos, {process.totalFinished} concluídos
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isExpired(process) ? (
                    <Chip label="Encerrado" color="default" size="small" variant="outlined" />
                  ) : isWithinValidity(process) ? (
                    <Chip label="Em andamento" color="success" size="small" variant="outlined" />
                  ) : (
                    <Chip label="Agendado" color="info" size="small" variant="outlined" />
                  )}
                  <span className="text-gray-400">
                    {expandedId === process.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </span>
                </div>
              </div>

              {expandedId === process.id && (
                <div className="border-t border-gray-100 dark:border-gray-800">
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="dash-stat-card text-center">
                        <span className="text-xs text-gray-500">Período</span>
                        <div className="font-semibold text-sm">
                          {new Date(process.startDate).toLocaleDateString()} - {new Date(process.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="dash-stat-card text-center">
                        <span className="text-xs text-gray-500">Cargo</span>
                        <div className="font-semibold text-sm">{process.cargo}</div>
                      </div>
                      <div className="dash-stat-card text-center">
                        <span className="text-xs text-gray-500">Nível</span>
                        <div className="font-semibold text-sm">{process.nivel}</div>
                      </div>
                      <div className="dash-stat-card text-center">
                        <span className="text-xs text-gray-500">Squad / Setor</span>
                        <div className="font-semibold text-sm">{process.squad} / {process.setor}</div>
                      </div>
                    </div>

                    {isWithinValidity(process) && (
                      <div className="flex justify-end">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<User size={14} />}
                          onClick={() => { setAddCandidatesOpen(true); setAddCandName(''); setAddCandEmail(''); }}
                          sx={{ borderRadius: 2 }}
                        >
                          Adicionar Candidato
                        </Button>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy size={16} className="text-amber-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ranking</span>
                      </div>
                      {rankingsLoading ? (
                        <div className="flex justify-center py-4"><CircularProgress size={24} /></div>
                      ) : rankings && rankings.length > 0 ? (
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Candidato</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Nota</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>%</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Código</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Link</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Ação</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rankings.map((r, i) => (
                                <TableRow key={r.invitationId} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                                  <TableCell className="font-bold text-gray-500">{i + 1}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-2">
                                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs shadow-sm">
                                        <Users size={12} />
                                      </div>
                                      {r.candidateName}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-500">{r.candidateEmail}</TableCell>
                                  <TableCell className="font-semibold">{r.score != null ? r.score : '-'}</TableCell>
                                  <TableCell className="font-semibold">{r.percentage != null ? `${r.percentage}%` : '-'}</TableCell>
                                  <TableCell className="text-sm text-gray-500">
                                    {invitationMap.get(r.invitationId)?.accessCode ?? '-'}
                                  </TableCell>
                                  <TableCell>
                                    {(() => {
                                      const invite = invitationMap.get(r.invitationId);
                                      if (!invite?.token) return <span className="text-sm text-gray-400">-</span>;
                                      const link = `${window.location.origin}/exam/${invite.token}`;
                                      return (
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          onClick={() => {
                                            navigator.clipboard.writeText(link);
                                            setCopiedId(r.invitationId);
                                            setTimeout(() => setCopiedId(null), 2000);
                                          }}
                                          sx={{ borderRadius: 2, fontSize: '0.75rem', textTransform: 'none' }}
                                        >
                                          {copiedId === r.invitationId ? 'Copiado' : 'Copiar link'}
                                        </Button>
                                      );
                                    })()}
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={statusLabels[r.status || 'NOT_STARTED'] || r.status} color={statusColors[r.status || 'NOT_STARTED']} size="small" variant="outlined" />
                                  </TableCell>
                                  <TableCell>
                                    {r.assessmentId && (
                                      <IconButton size="small" onClick={() => {
                                        const assessment = assessmentMap.get(r.assessmentId!);
                                        if (assessment) setDetailAssessment(assessment);
                                      }} className="text-gray-400 hover:text-teal-600">
                                        <Eye size={16} />
                                      </IconButton>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      ) : (
                        <EmptyState icon={Trophy} title="Nenhum dado no ranking" description="Adicione candidatos ao processo para que o ranking seja exibido." />
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={open} onClose={() => formGuard.guardAction(closeCreateDialog)} maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Novo Processo Seletivo</DialogTitle>
        <DialogContent>
          {mutations.create.error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.85rem' }}>
              {mutations.create.error instanceof Error ? mutations.create.error.message : 'Erro ao criar processo'}
            </Alert>
          )}

          <TextField fullWidth label="Nome do Processo" value={name} onChange={(e) => { setName(e.target.value); formGuard.setIsDirty(true); }} margin="normal" required />
          <div className="grid grid-cols-2 gap-3">
            <TextField fullWidth type="date" label="Data de Início" value={startDate} onChange={(e) => { setStartDate(e.target.value); formGuard.setIsDirty(true); }} margin="normal" required
              slotProps={{ inputLabel: { shrink: true } }} />
            <TextField fullWidth type="date" label="Data de Término" value={endDate} onChange={(e) => { setEndDate(e.target.value); formGuard.setIsDirty(true); }} margin="normal" required
              slotProps={{ inputLabel: { shrink: true } }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormControl fullWidth margin="normal">
              <InputLabel>Cargo</InputLabel>
              <Select value={cargo} label="Cargo" onChange={(e) => { setCargo(e.target.value); formGuard.setIsDirty(true); }} required>
                {CARGO_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Nível</InputLabel>
              <Select value={nivel} label="Nível" onChange={(e) => { setNivel(e.target.value); formGuard.setIsDirty(true); }} required>
                {NIVEL_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Setor</InputLabel>
              <Select value={setor} label="Setor" onChange={(e) => { setSetor(e.target.value); formGuard.setIsDirty(true); }} required>
                {SETOR_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth margin="normal">
              <InputLabel>Squad</InputLabel>
              <Select value={squad} label="Squad" onChange={(e) => { setSquad(e.target.value); formGuard.setIsDirty(true); }} required>
                {SQUAD_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
          <FormControl fullWidth margin="normal">
            <InputLabel>Template</InputLabel>
            <Select value={templateId} label="Template" onChange={(e) => { setTemplateId(e.target.value); formGuard.setIsDirty(true); }} required>
              {templates?.map((t) => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
            </Select>
          </FormControl>

          <div className="mt-4">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Candidatos</span>
            <div className="flex gap-2 mt-1">
              <TextField size="small" placeholder="Nome" value={candidateName} onChange={(e) => { setCandidateName(e.target.value); formGuard.setIsDirty(true); }} sx={{ flex: 1 }} />
              <TextField size="small" placeholder="Email" value={candidateEmail} onChange={(e) => { setCandidateEmail(e.target.value); formGuard.setIsDirty(true); }} sx={{ flex: 1 }} />
              <Button variant="outlined" size="small" onClick={handleAddCandidate} sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}>
                Adicionar
              </Button>
            </div>
            {candidates.length > 0 && (
              <div className="mt-2 space-y-1">
                {candidates.map((c, i) => (
                  <div key={i} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800/30 rounded-lg px-3 py-1.5">
                    <span>{c.name} - {c.email}</span>
                    <IconButton size="small" onClick={() => handleRemoveCandidate(i)} sx={{ color: 'error.main' }}>
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => formGuard.guardAction(closeCreateDialog)} sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleCreateSave} variant="contained"
            disabled={!name.trim() || !templateId || !startDate || !endDate || !cargo || !nivel || !setor || !squad || mutations.create.isPending}
            sx={{ borderRadius: 2 }}>
            {mutations.create.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Candidates Dialog */}
      <Dialog open={addCandidatesOpen} onClose={() => addCandGuard.guardAction(closeAddCandDialog)} maxWidth="sm" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Adicionar Candidato</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Nome" value={addCandName} onChange={(e) => { setAddCandName(e.target.value); addCandGuard.setIsDirty(true); }} margin="normal" required />
          <TextField fullWidth label="Email" value={addCandEmail} onChange={(e) => { setAddCandEmail(e.target.value); addCandGuard.setIsDirty(true); }} margin="normal" required />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => addCandGuard.guardAction(closeAddCandDialog)} sx={{ borderRadius: 2 }}>Cancelar</Button>
          <Button onClick={handleAddCandidatesSave} variant="contained"
            disabled={!addCandName.trim() || !addCandEmail.trim() || mutations.addCandidates.isPending}
            sx={{ borderRadius: 2 }}>
            {mutations.addCandidates.isPending ? 'Salvando...' : 'Adicionar'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={formGuard.confirmOpen}
        title="Descartar alterações?"
        message="Há alterações não salvas. Deseja descartá-las?"
        confirmLabel="Descartar"
        onConfirm={formGuard.handleConfirm}
        onCancel={formGuard.handleCancel}
        icon={AlertTriangle}
        severity="warning"
      />

      <ConfirmDialog
        open={addCandGuard.confirmOpen}
        title="Descartar alterações?"
        message="Há alterações não salvas. Deseja descartá-las?"
        confirmLabel="Descartar"
        onConfirm={addCandGuard.handleConfirm}
        onCancel={addCandGuard.handleCancel}
        icon={AlertTriangle}
        severity="warning"
      />

      {/* Assessment Detail Dialog */}
      <Dialog open={!!detailAssessment} onClose={() => setDetailAssessment(null)} maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Detalhes da Avaliação</DialogTitle>
        <DialogContent>
          {detailAssessment && (
            <AssessmentDetailDialog
              assessment={detailAssessment}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDetailAssessment(null)} sx={{ borderRadius: 2 }}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SelectionProcessesPage;
