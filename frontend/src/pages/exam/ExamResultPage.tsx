import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import { CheckCircle, XCircle } from 'lucide-react';
import { useExamSession } from '../../hooks/useExam';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';
import type { Alternative } from '../../models/Alternative';

function getQuestionId(q: { id: string; questionId?: string }): string {
  return q.questionId || q.id;
}

function buildGapsByTheme(
  questions: { id: string; questionId?: string; themeId: string; text: string; themeName?: string }[],
  answers: { questionId: string; isCorrect?: boolean }[],
) {
  const gapMap = new Map<string, { themeId: string; themeName: string; wrongCount: number; totalCount: number }>();

  for (const q of questions) {
    const name = q.themeName || q.themeId;
    if (!gapMap.has(q.themeId)) {
      gapMap.set(q.themeId, { themeId: q.themeId, themeName: name, wrongCount: 0, totalCount: 0 });
    }
    const entry = gapMap.get(q.themeId)!;
    entry.totalCount++;
    const answer = answers.find((a) => a.questionId === getQuestionId(q));
    if (!answer?.isCorrect) {
      entry.wrongCount++;
    }
  }

  return Array.from(gapMap.values()).sort((a, b) => b.wrongCount / b.totalCount - a.wrongCount / a.totalCount);
}

const ExamResultPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get('id');
  const token = sessionStorage.getItem('exam_token');
  const { assessment, questions } = useExamSession(assessmentId, token ?? undefined);
  const total = questions.length;
  const timing = assessment?.timing;
  const security = assessment?.securityMetrics;

  /* eslint-disable react-hooks/preserve-manual-memoization */
  const answerMap = useMemo(() => {
    const map = new Map<string, { questionId: string; isCorrect?: boolean; selectedAlternativeId?: string; timeSpentSeconds?: number }>();
    for (const a of assessment?.answers ?? []) map.set(a.questionId, a);
    return map;
  }, [assessment?.answers]);

  const correctAltMap = useMemo(() => {
    const map = new Map<string, Alternative>();
    for (const q of questions) {
      const correct = q.alternatives.find((a) => a.isCorrect);
      if (correct) map.set(q.id, correct);
    }
    return map;
  }, [questions]);

  const correctCount = useMemo(
    () => assessment?.answers?.filter((a) => a.isCorrect).length || 0,
    [assessment?.answers],
  );

  const percentage = assessment?.percentage ?? 0;

  const duration = useMemo(
    () => timing?.endTime && timing?.startTime
      ? Math.round((new Date(timing.endTime).getTime() - new Date(timing.startTime).getTime()) / 60000)
      : 0,
    [timing?.endTime, timing?.startTime],
  );

  const gaps = useMemo(
    () => buildGapsByTheme(questions, assessment?.answers || []),
    [questions, assessment?.answers],
  );
  /* eslint-enable react-hooks/preserve-manual-memoization */

  if (!assessment) return <div className="flex justify-center py-12"><CircularProgress /></div>;

  return (
    <div className="max-w-4xl mx-auto w-full p-4 md:p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 font-heading">Resultado da Avaliação</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="dash-stat-card text-center">
          <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">{percentage}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Percentual de Acertos</div>
        </div>

        <div className="dash-stat-card text-center">
          <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">{correctCount}/{total}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Acertos</div>
        </div>

        <div className="dash-stat-card text-center">
          <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">{duration}min</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Tempo</div>
        </div>

        <div className="dash-stat-card text-center">
          <div className={`text-4xl font-bold ${(security?.focusLostCount ?? 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {security?.focusLostCount ?? 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Perdas de Foco</div>
        </div>
      </div>

      {gaps.length > 0 && gaps.some((g) => g.wrongCount > 0) && (
        <div className="glass-panel p-5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 font-heading mb-4">Gaps por Tema</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {gaps.filter((g) => g.wrongCount > 0).map((g, idx) => {
              const errorRate = Math.round((g.wrongCount / g.totalCount) * 100);
              return (
                <div key={g.themeId ?? `gap-${idx}`} className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 p-4">
                  <div className="text-sm font-semibold text-gray-800 dark:text-gray-100">{g.themeName}</div>
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{g.wrongCount}/{g.totalCount}</div>
                  <div className="text-xs text-red-600 dark:text-red-400/80">{errorRate}% de erro</div>
                  <div className="mt-2 w-full h-2 rounded-full bg-red-200 dark:bg-red-900/40 overflow-hidden">
                    <div className="h-full rounded-full bg-red-500 dark:bg-red-500" style={{ width: `${errorRate}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 font-heading">Revisão das Questões</h2>

      <div className="space-y-4">
        {questions.map((q, i) => {
          const answer = answerMap.get(getQuestionId(q));
          const correctAlt = correctAltMap.get(q.id);
          const selectedAlt = answer?.selectedAlternativeId
            ? q.alternatives.find((a) => a.id === answer.selectedAlternativeId)
            : null;
          const isCorrect = answer?.isCorrect;
          const themeName = (q as { themeName?: string }).themeName || q.themeId;

          return (
            <div
              key={q.id}
              className={`rounded-xl border-l-4 p-5 bg-[var(--color-paper)] dark:bg-[var(--color-paper-dark)] ${
                isCorrect
                  ? 'border-l-emerald-500'
                  : 'border-l-red-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Questão {i + 1}</span>
                  <Chip label={themeName} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
                </div>
                <Chip
                  icon={isCorrect ? <CheckCircle size={15} /> : <XCircle size={15} />}
                  label={isCorrect ? 'Correta' : 'Errada'}
                  color={isCorrect ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                />
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
                <MarkdownRenderer content={q.text} />
              </div>
              <div className="border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] pt-3 space-y-1 text-sm">
                <div className={isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}>
                  Sua resposta: {selectedAlt?.text || 'Não respondida'}
                </div>
                {!isCorrect && (
                  <div className="text-emerald-700 dark:text-emerald-300">
                    Resposta correta: {correctAlt?.text}
                  </div>
                )}
              </div>
              {q.explanation && (
                <div className="mt-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-[var(--color-border)] dark:border-[var(--color-border-dark)]">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Explicação:</span>
                  <div className="mt-1 prose prose-sm dark:prose-invert max-w-none">
                    <MarkdownRenderer content={q.explanation} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExamResultPage;