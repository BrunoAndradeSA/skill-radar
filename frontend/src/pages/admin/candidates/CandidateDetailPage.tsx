import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { ClipboardList, BarChart3, Eye } from 'lucide-react';
import { StatusChip } from '../../../components/StatusChip';
import { EmptyState } from '../../../components/EmptyState';
import AssessmentDetailDialog from '../../../components/AssessmentDetailDialog';
import { useCandidateById } from '../../../hooks/useCandidates';
import { useInvitationsByEmail } from '../../../hooks/useInvitations';
import { useAssessmentsByInvitationIds } from '../../../hooks/useAssessments';
import { useThemes } from '../../../hooks/useThemes';
import type { Assessment } from '../../../models/Assessment';
import type { ExamInvitation } from '../../../models/ExamInvitation';

function buildThemeStats(assessments: Assessment[], themeMap: Map<string, string>) {
  const stats = new Map<string, { correct: number; total: number }>();

  for (const a of assessments) {
    if (a.status !== 'FINISHED') continue;
    for (const q of a.questions) {
      const tName = themeMap.get(q.themeId) || q.themeId;
      if (!stats.has(tName)) stats.set(tName, { correct: 0, total: 0 });
      const entry = stats.get(tName)!;
      entry.total++;
      const qid = (q as { questionId?: string }).questionId || q.id;
      const ans = a.answers.find((x) => x.questionId === qid);
      if (ans?.isCorrect) entry.correct++;
    }
  }

  return Array.from(stats.entries()).map(([theme, s]) => ({
    theme,
    correct: s.correct,
    total: s.total,
    rate: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
  }));
}

const CandidateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: candidate, isLoading: candidateLoading } = useCandidateById(id || null);
  const { data: themes } = useThemes();
  const { data: candidateInvitations, isFetched: invitationsFetched } = useInvitationsByEmail(candidate?.email ?? null);
  const [detailAssessment, setDetailAssessment] = useState<Assessment | null>(null);
  const invitationIds = useMemo(
    () => candidateInvitations?.map((inv) => inv.id) || [],
    [candidateInvitations],
  );
  const invitationsReady = invitationsFetched && invitationIds.length > 0;
  const { data: candidateAssessments } = useAssessmentsByInvitationIds(invitationsReady ? invitationIds : []);
  const themeMap = useMemo(
    () => new Map(themes?.map((t) => [t.id, t.name]) || []),
    [themes],
  );
  const invitationMap = useMemo(
    () => new Map(candidateInvitations?.map((i) => [i.id, i as ExamInvitation]) || []),
    [candidateInvitations],
  );
  const finished = useMemo(
    () => candidateAssessments?.filter((a) => a.status === 'FINISHED') || [],
    [candidateAssessments],
  );
  const themeStats = useMemo(
    () => buildThemeStats(finished, themeMap),
    [finished, themeMap],
  );
  const sorted = useMemo(
    () => [...themeStats].sort((a, b) => a.rate - b.rate),
    [themeStats],
  );

  const examResults = useMemo(() => {
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return finished
      .filter((a) => a.percentage != null)
      .map((a) => {
        const d = a.timing?.startTime ? new Date(a.timing.startTime) : null;
        return {
          id: a.id,
          percentage: a.percentage ?? 0,
          dateLabel: d ? `${months[d.getMonth()]}/${d.getFullYear()}` : '-',
          sortKey: d ? d.getTime() : 0,
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey);
  }, [finished]);

  const avgPercentage = useMemo(() => {
    if (examResults.length === 0) return 0;
    return Math.round(examResults.reduce((s, r) => s + r.percentage, 0) / examResults.length);
  }, [examResults]);

  if (candidateLoading) return <div className="flex justify-center py-12"><CircularProgress /></div>;
  if (!candidate) return <Alert severity="error" sx={{ borderRadius: 2 }}>Candidato não encontrado</Alert>;

  return (
    <div className="space-y-6 max-w-4xl">
      <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
        <button onClick={() => navigate('/admin/candidates')} className="hover:text-[var(--color-accent)] transition-colors">Candidatos</button>
        <span>/</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{candidate.name}</span>
      </nav>

      <div className="glass-panel p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white font-bold text-xl shadow-sm">
            {candidate.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading">{candidate.name}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{candidate.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <Chip label={candidate.cargo} color="primary" size="small" variant="outlined" />
          <Chip label={candidate.setor} color="info" size="small" variant="outlined" />
          <Chip label={candidate.nivel} color="success" size="small" variant="outlined" />
          <Chip label={candidate.squad} color="warning" size="small" variant="outlined" />
        </div>
      </div>

      {themeStats.length > 0 && (
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-heading">Forças & Gaps</h2>
            <span className="text-xs text-gray-400">Geral de {finished.length} exame(s)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sorted.map((s) => {
              const isGap = s.rate < 70;
              return (
                <div
                  key={s.theme}
                  className={`rounded-xl border p-4 transition-shadow hover:shadow-md ${
                    isGap
                      ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20'
                      : 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{s.theme}</div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      isGap
                        ? 'bg-red-200 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                        : 'bg-emerald-200 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    }`}>
                      {isGap ? 'Gap' : 'Força'}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-2xl font-bold ${
                      isGap ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {s.rate}%
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {s.correct}/{s.total} acertos
                    </span>
                  </div>
                  <div className="mt-2 w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isGap ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${s.rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {examResults.length > 0 && (
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BarChart3 size={18} className="text-gray-500 dark:text-gray-400" />
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-heading">Resultados por Exame</h2>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{examResults.length} exame(s)</span>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Média: {avgPercentage}%</span>
            </div>
          </div>

          {(() => {
            const barAreaHeight = 140;
            const n = examResults.length;
            const slotWidth = 80;
            const chartWidth = n * slotWidth;
            return (
              <div className="overflow-x-auto scrollbar-thin">
                <div className="relative" style={{ minWidth: `${chartWidth}px`, width: '100%', height: `${barAreaHeight + 36}px` }}>
                {/* Trend line SVG */}
                {n >= 2 && (
                  <svg
                    className="absolute inset-x-0 top-0 w-full pointer-events-none"
                    style={{ height: `${barAreaHeight}px` }}
                    viewBox={`0 0 ${n * 100} ${barAreaHeight}`}
                    preserveAspectRatio="none"
                  >
                    <polyline
                      points={examResults.map((r, i) => {
                        const cx = (i + 0.5) * 100;
                        const cy = ((100 - r.percentage) / 100) * barAreaHeight;
                        return `${cx},${cy}`;
                      }).join(' ')}
                      fill="none"
                      stroke="var(--color-accent, #14b8a6)"
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {examResults.map((r, i) => {
                      const cx = (i + 0.5) * 100;
                      const cy = ((100 - r.percentage) / 100) * barAreaHeight;
                      return (
                        <circle key={r.id} cx={cx} cy={cy} r={4} fill="white" stroke="var(--color-accent, #14b8a6)" strokeWidth={2} />
                      );
                    })}
                  </svg>
                )}

                {/* Bars */}
                <div className="absolute inset-x-0 bottom-[36px] flex items-end justify-around" style={{ height: `${barAreaHeight}px` }}>
                  {examResults.map((r) => {
                    const isGood = r.percentage >= 70;
                    return (
                      <div key={r.id} className="flex flex-col items-center gap-0.5">
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{r.percentage}%</span>
                        <div
                          className={`w-8 rounded-t transition-all duration-500 ${isGood ? 'bg-emerald-500' : 'bg-red-500'}`}
                          style={{ height: `${(r.percentage / 100) * barAreaHeight}px` }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Date labels */}
                <div className="absolute inset-x-0 bottom-0 flex justify-around">
                  {examResults.map((r) => (
                    <span key={r.id} className="text-xs text-gray-400">{r.dateLabel}</span>
                  ))}
                </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      <div className="glass-panel p-5">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-heading mb-3">Exames Realizados</h2>
        {finished.length === 0 ? (
          <EmptyState title="Nenhum exame realizado ainda" description="Este candidato ainda não finalizou nenhuma avaliação." />
        ) : (
          <div className="space-y-3">
            {finished.map((a) => (
              <div key={a.id} className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-sm">
                    <ClipboardList size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {a.score}/{a.questions.length} acertos ({a.percentage}%)
                    </div>
                    <div className="text-xs text-gray-500">
                      {a.timing?.startTime ? new Date(a.timing.startTime).toLocaleDateString() : '-'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusChip status={a.status} size="small" />
                  <button
                    onClick={() => setDetailAssessment(a)}
                    className="p-2 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-950/30 transition-colors"
                    title="Visualizar avaliação"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!detailAssessment} onClose={() => setDetailAssessment(null)} maxWidth="md" fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 600 }}>Detalhes da Avaliação</DialogTitle>
        <DialogContent>
          {detailAssessment && (
            <AssessmentDetailDialog
              assessment={detailAssessment}
              invitationMap={invitationMap}
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

export default CandidateDetailPage;
