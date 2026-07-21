import React, { useMemo, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Users, GraduationCap, HelpCircle, AlertTriangle, Download } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import { useAssessments } from '../../hooks/useAssessments';
import { useInvitations } from '../../hooks/useInvitations';
import { useThemes } from '../../hooks/useThemes';
import type { Assessment } from '../../models/Assessment';

type GroupBy = 'cargo' | 'nivel' | 'squad' | 'setor';

interface ThemeStat {
  theme: string;
  correct: number;
  total: number;
  rate: number;
}

const statusLabels: Record<string, string> = {
  NOT_STARTED: 'Não Iniciada',
  IN_PROGRESS: 'Em Andamento',
  FINISHED: 'Finalizada',
  TERMINATED: 'Encerrada',
  REJECTED: 'Rejeitada',
};

const statusColors: Record<string, string> = {
  NOT_STARTED: 'bg-gray-400',
  IN_PROGRESS: 'bg-blue-500',
  FINISHED: 'bg-emerald-500',
  TERMINATED: 'bg-red-500',
  REJECTED: 'bg-amber-500',
};

function buildGroupedStats(
  assessments: Assessment[],
  invitations: { id: string; candidateId?: string; cargo?: string; nivel?: string; squad?: string; setor?: string }[],
  groupBy: GroupBy,
  groupValue: string,
  themeMap: Map<string, string>,
): ThemeStat[] {
  const invIds = new Set(
    invitations
      .filter((inv) => {
        const val = inv[groupBy as keyof typeof inv] as string | undefined;
        return val === groupValue;
      })
      .map((inv) => inv.id),
  );

  const stats = new Map<string, { correct: number; total: number }>();

  for (const a of assessments) {
    if (a.status !== 'FINISHED') continue;
    if (!invIds.has(a.invitationId)) continue;

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

  return Array.from(stats.entries())
    .map(([theme, s]) => ({
      theme,
      correct: s.correct,
      total: s.total,
      rate: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    }))
    .sort((a, b) => a.rate - b.rate);
}

function buildOverallThemeStats(
  assessments: Assessment[],
  themeMap: Map<string, string>,
): ThemeStat[] {
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

  return Array.from(stats.entries())
    .map(([theme, s]) => ({
      theme,
      correct: s.correct,
      total: s.total,
      rate: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0,
    }))
    .sort((a, b) => a.rate - b.rate);
}

function uniqueValues(
  invitations: { cargo?: string; nivel?: string; squad?: string; setor?: string }[],
  key: GroupBy,
): string[] {
  const vals = new Set(
    invitations
      .map((inv) => inv[key as keyof typeof inv] as string | undefined)
      .filter((v): v is string => !!v),
  );
  return Array.from(vals).sort();
}

const DashboardPage: React.FC = () => {
  const { data: allAssessments, isLoading, error } = useAssessments();
  const { data: invitations } = useInvitations();
  const { data: themes } = useThemes();

  const assessments = useMemo(() => {
    if (!allAssessments || !invitations) return [];
    const internalInvIds = new Set(
      invitations.filter((i) => !i.isExternal).map((i) => i.id),
    );
    return allAssessments.filter((a) => internalInvIds.has(a.invitationId));
  }, [allAssessments, invitations]);

  const [groupBy, setGroupBy] = useState<GroupBy>('cargo');
  const [groupValue, setGroupValue] = useState('');

  const themeMap = useMemo(() => new Map(themes?.map((t) => [t.id, t.name]) ?? []), [themes]);

  const groups = useMemo(() => uniqueValues(invitations || [], groupBy), [invitations, groupBy]);

  const displayedGroupValue = groupValue || groups[0] || '';

  const themeStats = useMemo(
    () =>
      displayedGroupValue
        ? buildGroupedStats(assessments || [], invitations || [], groupBy, displayedGroupValue, themeMap)
        : [],
    [assessments, invitations, groupBy, displayedGroupValue, themeMap],
  );

  const aggregateStats = useMemo(() => {
    const finished = assessments?.filter((a) => a.status === 'FINISHED') || [];
    const avg = finished.length
      ? Math.round(finished.reduce((acc, a) => acc + (a.percentage || 0), 0) / finished.length)
      : 0;
    const totalQuestions = finished.reduce((acc, a) => acc + (a.questions?.length || 0), 0);
    const terminated = assessments?.filter((a) => a.status === 'TERMINATED').length || 0;
    const total = assessments?.length || 0;
    return { total, avg, totalQuestions, terminated };
  }, [assessments]);

  const statusDistribution = useMemo(() => {
    if (!assessments) return [];
    const counts: Record<string, number> = {};
    for (const a of assessments) {
      counts[a.status] = (counts[a.status] || 0) + 1;
    }
    return Object.entries(counts)
      .map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / assessments.length) * 100),
        label: statusLabels[status] || status,
        color: statusColors[status] || 'bg-gray-400',
      }))
      .sort((a, b) => b.count - a.count);
  }, [assessments]);

  const overallThemeStats = useMemo(
    () => buildOverallThemeStats(assessments || [], themeMap),
    [assessments, themeMap],
  );

  const topStrengths = useMemo(
    () => overallThemeStats.filter((s) => s.total > 0).slice(-5).reverse(),
    [overallThemeStats],
  );

  const topGaps = useMemo(
    () => overallThemeStats.filter((s) => s.total > 0).slice(0, 5),
    [overallThemeStats],
  );

  const scoreHistogram = useMemo(() => {
    if (!assessments) return [];
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      label: `${i * 10}-${(i + 1) * 10}%`,
      min: i * 10,
      max: (i + 1) * 10,
      count: 0,
    }));
    for (const a of assessments) {
      if (a.status !== 'FINISHED' || a.percentage == null) continue;
      const idx = Math.min(Math.floor(a.percentage / 10), 9);
      buckets[idx].count++;
    }
    const maxCount = Math.max(...buckets.map((b) => b.count), 1);
    const barMaxPx = 100;
    return buckets.map((b) => ({
      ...b,
      barHeight: Math.max(Math.round((b.count / maxCount) * barMaxPx), b.count > 0 ? 4 : 0),
    }));
  }, [assessments]);

  const violationStats = useMemo(() => {
    if (!assessments) return [];
    const raw = [
      { label: '0', min: 0, max: 0, count: 0, color: 'bg-emerald-500' },
      { label: '1', min: 1, max: 1, count: 0, color: 'bg-amber-500' },
      { label: '2', min: 2, max: 2, count: 0, color: 'bg-orange-500' },
      { label: '3+', min: 3, max: Infinity, count: 0, color: 'bg-red-500' },
    ];
    for (const a of assessments) {
      const v = a.securityMetrics?.focusLostCount ?? 0;
      const bucket = raw.find((b) => v >= b.min && v <= b.max) || raw[raw.length - 1];
      bucket.count++;
    }
    const maxCount = Math.max(...raw.map((b) => b.count), 1);
    const barMaxPx = 80;
    return raw.map((b) => ({
      ...b,
      pct: Math.round((b.count / maxCount) * 100),
      barHeight: Math.max(Math.round((b.count / maxCount) * barMaxPx), b.count > 0 ? 4 : 0),
    }));
  }, [assessments]);

  const exportCSV = () => {
    if (!assessments) return;
    const header = 'Candidato,Email,Data,Nota,Percentual,Tempo (s),Violacoes\n';
    const rows = assessments
      .filter((a) => a.status === 'FINISHED')
      .map((a) => {
        const timing = a.timing;
        const duration = timing?.endTime
          ? Math.round((new Date(timing.endTime).getTime() - new Date(timing.startTime).getTime()) / 1000)
          : 0;
        return `${a.invitationId},${a.invitationId},${timing?.startTime || ''},${a.score || 0},${a.percentage || 0}%,${duration},${a.securityMetrics?.focusLostCount || 0}`;
      })
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'skill-radar-resultados.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Erro ao carregar dashboard
      </Alert>
    );
  }

  const strengths = themeStats.filter((s) => s.rate >= 70);
  const gaps = themeStats.filter((s) => s.rate < 70);

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Visão geral de forças e gaps</p>
        </div>
        <Button variant="outlined" onClick={exportCSV} startIcon={<Download size={18} />} sx={{ borderRadius: 2, fontSize: '0.85rem' }}>
          Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        <div className="dash-stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/15">
              <Users size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{aggregateStats.total}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">Total de Avaliações</div>
            </div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/15">
              <GraduationCap size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{aggregateStats.avg}%</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">Média Geral</div>
            </div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/15">
              <HelpCircle size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{aggregateStats.totalQuestions}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">Questões Avaliadas</div>
            </div>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white shadow-lg shadow-red-500/15">
              <AlertTriangle size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">{aggregateStats.terminated}</div>
              <div className="text-xs text-gray-400 dark:text-gray-500 font-medium">Encerradas</div>
            </div>
          </div>
        </div>
      </div>

      {/* Row: Status Distribution + Focus Violations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">Distribuição por Status</h3>
          <p className="text-xs text-gray-400">{assessments?.length || 0} avaliações no total</p>
          {statusDistribution.length === 0 ? (
            <EmptyState icon={Users} title="Nenhuma avaliação" description="Os dados aparecerão após os candidatos realizarem os exames." />
          ) : (
            <div className="space-y-3">
              <div className="flex h-6 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                {statusDistribution.map((s) => (
                  <div
                    key={s.status}
                    className={`h-full transition-all duration-700 ${s.color}`}
                    style={{ width: `${s.percentage}%` }}
                    title={`${s.label}: ${s.count} (${s.percentage}%)`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                {statusDistribution.map((s) => (
                  <div key={s.status} className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${s.color}`} />
                    <span className="text-gray-500 dark:text-gray-400 flex-1">{s.label}</span>
                    <span className="font-medium text-gray-800 dark:text-gray-100">{s.count}</span>
                    <span className="text-gray-400 w-8 text-right">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="glass-panel p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">Violações de Foco</h3>
          <p className="text-xs text-gray-400">Distribuição de perdas de foco por avaliação</p>
          {violationStats.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="Nenhuma violação registrada" description="Dados aparecerão após avaliações em andamento." />
          ) : (
            <div className="space-y-2 pt-1">
              {violationStats.map((v) => (
                <div key={v.label} className="flex items-center gap-3">
                  <span className="w-5 text-right text-xs font-medium text-gray-600 dark:text-gray-400 flex-shrink-0">{v.label}</span>
                  <div className="flex-1 h-5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${v.color}`}
                      style={{ width: `${v.pct}%` }}
                      title={`${v.count} avaliações`}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-medium text-gray-800 dark:text-gray-100 flex-shrink-0">{v.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Score Histogram */}
      <div className="glass-panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">Distribuição de Notas</h3>
          <span className="text-xs text-gray-400">
            {assessments?.filter((a) => a.status === 'FINISHED').length || 0} avaliações finalizadas
          </span>
        </div>
        {scoreHistogram.length === 0 || scoreHistogram.every((b) => b.count === 0) ? (
          <EmptyState icon={HelpCircle} title="Nenhuma nota registrada" description="Dados aparecerão após avaliações finalizadas." />
        ) : (
          <div className="flex items-end gap-1" style={{ height: 140 }}>
            {scoreHistogram.map((b) => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-0.5 justify-end h-full">
                <span className="text-[10px] text-gray-400 leading-none">{b.count || ''}</span>
                <div
                  className="w-full rounded-t bg-gradient-to-t from-blue-600 to-blue-400 transition-all duration-700"
                  style={{ height: `${b.barHeight}px` }}
                />
                <span className="text-[10px] text-gray-500 leading-none pt-0.5">{b.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Row: Top Forças + Top Gaps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-300 font-heading tracking-tight">Forças</h3>
          </div>
          <p className="text-xs text-gray-400">Temas com maior taxa de acerto</p>
          {topStrengths.length === 0 ? (
            <EmptyState icon={GraduationCap} title="Nenhuma força identificada" description="Aguardando avaliações finalizadas." />
          ) : (
            <div className="space-y-2">
              {topStrengths.map((s, i) => (
                <div key={s.theme} className="flex items-center gap-2 text-sm">
                  <span className="text-xs font-medium text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 truncate text-gray-700 dark:text-gray-300">{s.theme}</div>
                  <div className="w-20 h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${s.rate}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex-shrink-0">{s.rate}%</span>
                  <span className="text-[10px] text-gray-400 w-10 text-right flex-shrink-0">{s.correct}/{s.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass-panel p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <h3 className="text-sm font-bold text-red-700 dark:text-red-300 font-heading tracking-tight">Gaps</h3>
          </div>
          <p className="text-xs text-gray-400">Temas com menor taxa de acerto</p>
          {topGaps.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="Nenhum gap identificado" description="Aguardando avaliações finalizadas." />
          ) : (
            <div className="space-y-2">
              {topGaps.map((s, i) => (
                <div key={s.theme} className="flex items-center gap-2 text-sm">
                  <span className="text-xs font-medium text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                  <div className="flex-1 truncate text-gray-700 dark:text-gray-300">{s.theme}</div>
                  <div className="w-20 h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0">
                    <div className="h-full rounded-full bg-red-500 transition-all duration-700" style={{ width: `${s.rate}%` }} />
                  </div>
                  <span className="w-8 text-right text-xs font-semibold text-red-700 dark:text-red-300 flex-shrink-0">{s.rate}%</span>
                  <span className="text-[10px] text-gray-400 w-10 text-right flex-shrink-0">{s.correct}/{s.total}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Existing: Group theme stats */}
      <div className="glass-panel p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-heading tracking-tight">Forças e Gaps por Grupo</h2>
          <div className="flex gap-3">
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Agrupar por</InputLabel>
              <Select value={groupBy} label="Agrupar por" onChange={(e) => { setGroupBy(e.target.value as GroupBy); setGroupValue(''); }}>
                <MenuItem value="cargo">Cargo</MenuItem>
                <MenuItem value="nivel">Nível</MenuItem>
                <MenuItem value="squad">Squad</MenuItem>
                <MenuItem value="setor">Setor</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Valor</InputLabel>
              <Select value={displayedGroupValue} label="Valor" onChange={(e) => setGroupValue(e.target.value)}>
                {groups.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </Select>
            </FormControl>
          </div>
        </div>

        {themeStats.length === 0 ? (
          <EmptyState title="Nenhum dado disponível" description="Selecione um grupo diferente ou aguarde novas avaliações." />
        ) : (
          <div className="space-y-6">
            <div>
              {themeStats.map((s) => {
                const barColor = s.rate >= 70 ? 'bg-emerald-500' : 'bg-red-500';
                const labelColor = s.rate >= 70 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300';
                return (
                  <div key={s.theme} className="flex items-center gap-3 py-2">
                    <div className="w-24 md:w-40 text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-shrink-0">{s.theme}</div>
                    <div className="flex-1 h-5 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <div
                        className={`h-full rounded-full ${barColor} transition-all duration-500`}
                        style={{ width: `${s.rate}%` }}
                      />
                    </div>
                    <div className={`w-14 md:w-20 text-right text-sm font-semibold flex-shrink-0 ${labelColor}`}>{s.rate}%</div>
                    <div className="w-12 md:w-16 text-right text-xs text-gray-400 flex-shrink-0">{s.correct}/{s.total}</div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 text-center">
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{strengths.length}</div>
                <div className="text-xs text-emerald-600 dark:text-emerald-400/80 mt-1">Forças (≥ 70% acertos)</div>
              </div>
              <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-4 text-center">
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{gaps.length}</div>
                <div className="text-xs text-red-600 dark:text-red-400/80 mt-1">Gaps (&lt; 70% acertos)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
