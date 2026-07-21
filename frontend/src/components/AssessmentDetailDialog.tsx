import React, { useMemo, useState } from 'react';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { CheckCircle, XCircle, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import type { Assessment } from '../models/Assessment';
import type { ExamInvitation } from '../models/ExamInvitation';

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
  invitationMap: Map<string, ExamInvitation>;
}> = ({ assessment, invitationMap }) => {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());
  const detailGaps = useMemo(() => buildGaps(assessment), [assessment]);
  const inv = invitationMap.get(assessment.invitationId);

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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="dash-stat-card text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Candidato</span>
          <div className="font-semibold text-gray-800 dark:text-gray-100">{inv?.candidateName || assessment.invitationId}</div>
          {inv?.cargo && <div className="text-xs text-gray-500">{inv.cargo}</div>}
        </div>
        <div className="dash-stat-card text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Status</span>
          <div><Chip label={statusLabels[assessment.status]} color={statusColors[assessment.status]} size="small" /></div>
        </div>
        <div className="dash-stat-card text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Acertos</span>
          <div className="font-semibold text-gray-800 dark:text-gray-100">
            {assessment.score != null ? `${assessment.score}/${assessment.questions.length}` : '-'}
          </div>
          {assessment.percentage != null && <div className="text-xs text-gray-500">{assessment.percentage}% de acertos</div>}
        </div>
        <div className="dash-stat-card text-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">Perdas de Foco</span>
          <div className="font-semibold text-gray-800 dark:text-gray-100">{assessment.securityMetrics?.focusLostCount ?? 0}</div>
        </div>
      </div>

      {inv?.cargo || inv?.squad || inv?.setor ? (
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
          {inv?.cargo && <span>Cargo: <strong>{inv.cargo}</strong></span>}
          {inv?.squad && <span>Squad: <strong>{inv.squad}</strong></span>}
          {inv?.setor && <span>Setor: <strong>{inv.setor}</strong></span>}
        </div>
      ) : null}

      {detailGaps.length > 0 && (
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Gaps por Tema</span>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {detailGaps.map((g) => {
              const errorRate = g.totalCount > 0 ? Math.round((g.wrongCount / g.totalCount) * 100) : 0;
              return (
                <div key={g.themeName} className={`rounded-xl border p-3 ${
                  g.wrongCount > 0
                    ? 'border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20'
                    : 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20'
                }`}>
                  <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{g.themeName}</div>
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{g.wrongCount}/{g.totalCount}</div>
                  <div className="text-xs text-gray-500">{errorRate}% de erro</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {assessment.questions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Questões</span>
            {assessment.score != null && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {assessment.score} de {assessment.questions.length} corretas
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {assessment.questions.map((q, i) => {
              const qid = (q as { questionId?: string }).questionId || q.id;
              const answer = assessment.answers.find((a) => a.questionId === qid);
              const selectedAlt = q.alternatives.find((a) => a.id === answer?.selectedAlternativeId);
              const correctAlt = q.alternatives.find((a) => a.isCorrect === true);
              const isAnswered = answer != null && answer.selectedAlternativeId != null;
              const isCorrect = answer?.isCorrect ?? null;
              const isExpanded = expandedQuestions.has(i);

              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestion(i)}
                  className={`rounded-xl border-l-4 p-3 cursor-pointer transition-all duration-150 ${
                    !isAnswered
                      ? 'border-l-gray-400 bg-gray-50/50 dark:bg-gray-800/20 dark:border-l-gray-600'
                      : isCorrect
                        ? 'border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                        : 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {!isAnswered ? (
                        <Minus size={14} className="text-gray-400" />
                      ) : isCorrect ? (
                        <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XCircle size={14} className="text-red-600 dark:text-red-400" />
                      )}
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

                      <div className={
                        !isAnswered
                          ? 'text-gray-400'
                          : isCorrect
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-red-700 dark:text-red-300'
                      }>
                        <span className="font-medium">Resposta: </span>
                        {!isAnswered
                          ? 'Não respondida'
                          : selectedAlt?.text ?? 'Alternativa não encontrada'}
                      </div>

                      {isAnswered && !isCorrect && correctAlt && (
                        <div className="text-emerald-700 dark:text-emerald-300">
                          <span className="font-medium">Resposta correta: </span>
                          {correctAlt.text}
                        </div>
                      )}

                      {q.explanation && !isCorrect && (
                        <div className="text-gray-500 dark:text-gray-400 italic">
                          <span className="font-medium not-italic">Explicação: </span>
                          {q.explanation}
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

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Início: {assessment.timing?.startTime ? new Date(assessment.timing.startTime).toLocaleString() : '-'}
        {assessment.timing?.endTime && <> | Fim: {new Date(assessment.timing.endTime).toLocaleString()}</>}
      </div>

      {assessment.securityMetrics?.isTerminated && (
        <Alert severity="warning" sx={{ borderRadius: 2 }}>Avaliação encerrada por segurança</Alert>
      )}
    </div>
  );
};

export default AssessmentDetailDialog;
