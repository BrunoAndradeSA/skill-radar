import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { ChevronLeft, ChevronRight, CheckCircle, Clock, AlertTriangle, Monitor } from 'lucide-react';
import { useExamSession, useExamTemplate } from '../../hooks/useExam';
import { MarkdownRenderer } from '../../components/MarkdownRenderer';
import { SecurityMonitoringService } from '../../services/security-monitoring.service';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const ExamPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const assessmentId = searchParams.get('assessment');
  const token = sessionStorage.getItem('exam_token');
  const {
    assessment,
    templateId,
    currentIndex,
    currentQuestion,
    questions,
    progress,
    answers,
    setAnswer,
    setCurrentIndex,
    submitExam,
    isSubmitting,
    terminateExam,
  } = useExamSession(assessmentId, token ?? undefined);

  const { data: template } = useExamTemplate(templateId);

  const [warningOpen, setWarningOpen] = useState(false);
  const [terminated, setTerminated] = useState(false);
  const [terminationReason, setTerminationReason] = useState<'focus' | 'automation' | null>(null);
  const [expired, setExpired] = useState(false);
  const [violations, setViolations] = useState(0);
  const violationsRef = useRef(0);
  const securityRef = useRef<SecurityMonitoringService | null>(null);

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const hasSubmittedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!assessment?.timing?.startTime || !template?.durationMinutes) return;

    const startMs = new Date(assessment.timing.startTime).getTime();
    const durationMs = template.durationMinutes * 60 * 1000;
    const endMs = startMs + durationMs;

    const tick = () => {
      const remaining = Math.max(0, Math.round((endMs - Date.now()) / 1000));
      setTimeRemaining(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        setExpired(true);
      }
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [assessment?.timing?.startTime, template?.durationMinutes]);

  useEffect(() => {
    if (expired && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      submitExam(violationsRef.current);
    }
  }, [expired, submitExam]);

  useEffect(() => {
    if (terminated) {
      terminateExam(violationsRef.current);
    }
  }, [terminated, terminateExam]);

  useEffect(() => {
    const security = new SecurityMonitoringService({ maxViolations: 2, autoTerminate: true });
    security.onFocusLossCallback((v) => {
      violationsRef.current = v;
      setViolations(v);
      if (v < 2) setWarningOpen(true);
    });
    security.onTerminateCallback(() => {
      setTerminationReason('focus');
      setTerminated(true);
    });
    security.onAutomationDetectedCallback(() => {
      setTerminationReason('automation');
      setTerminated(true);
    });
    security.start();
    securityRef.current = security;
    return () => security.stop();
  }, []);

  const prevIndexRef = useRef(currentIndex);

  useEffect(() => {
    if (prevIndexRef.current !== currentIndex) {
      securityRef.current?.recordInteraction('navigate');
      prevIndexRef.current = currentIndex;
    }
  }, [currentIndex]);

  const handleAnswer = (questionId: string, alternativeId: string) => {
    securityRef.current?.recordInteraction('answer');
    setAnswer(questionId, alternativeId);
  };

  const allAnswered = useMemo(() => questions.every((q) => answers[q.id]), [questions, answers]);
  const touchStartX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < questions.length - 1) setCurrentIndex((i) => i + 1);
      else if (diff < 0 && currentIndex > 0) setCurrentIndex((i) => i - 1);
    }
  };

  if (terminated || expired) {
    const isExpired = expired;
    const isAutomation = terminationReason === 'automation';
    let title: string;
    let description: string;
    let icon: React.ReactNode;
    let bgClass: string;

    if (isExpired) {
      title = 'Tempo Esgotado';
      description = 'O tempo do exame se esgotou. Seu exame foi finalizado automaticamente.';
      icon = <Clock size={32} className="text-amber-600 dark:text-amber-400" />;
      bgClass = 'bg-amber-100 dark:bg-amber-900/30';
    } else if (isAutomation) {
      title = 'Exame Encerrado';
      description = 'Detectamos o uso de ferramentas de automação durante o exame. Seu exame foi encerrado por violação das regras.';
      icon = <Monitor size={32} className="text-purple-600 dark:text-purple-400" />;
      bgClass = 'bg-purple-100 dark:bg-purple-900/30';
    } else {
      title = 'Exame Encerrado';
      description = 'Você excedeu o número máximo de perdas de foco permitidas. Seu exame foi encerrado.';
      icon = <AlertTriangle size={32} className="text-red-600 dark:text-red-400" />;
      bgClass = 'bg-red-100 dark:bg-red-900/30';
    }

    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md glass rounded-2xl p-8 md:p-10 animate-scale-in">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse ${bgClass}`}>
            {icon}
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <CircularProgress size={16} />
            <span>Redirecionando para o resultado...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center text-gray-400">Carregando...</div>
      </div>
    );
  }

  const selectedValue = answers[currentQuestion.id] || '';
  const isLast = currentIndex === questions.length - 1;
  const isLowTime = timeRemaining !== null && timeRemaining <= 60;

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-4 md:p-6"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Questão {currentIndex + 1} de {questions.length}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {Object.keys(answers).length} de {questions.length} respondidas
            </span>
            {timeRemaining !== null && (
              <span
                className={`flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-md ${
                  isLowTime
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Clock size={15} />
                {formatTime(timeRemaining)}
              </span>
            )}
          </div>
        </div>
        <LinearProgress variant="determinate" value={progress}
          sx={{ height: 6, borderRadius: 3, bgcolor: 'var(--color-border)' }} />
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-1.5">
          {questions.map((q, i) => {
            const isCurrent = i === currentIndex;
            const isAnswered = !!answers[q.id];
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-11 h-11 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isCurrent
                    ? 'ring-2 ring-[var(--color-accent)] ring-offset-2 dark:ring-offset-[var(--color-paper-dark)] bg-[var(--color-accent)] text-white'
                    : isAnswered
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                aria-label={`Ir para questão ${i + 1}${answers[q.id] ? ' (respondida)' : ''}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[var(--color-paper)] dark:bg-[var(--color-paper-dark)] rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
            {currentQuestion.type}
          </span>
          <span className="text-xs font-medium px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {currentQuestion.seniority}
          </span>
        </div>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <MarkdownRenderer content={currentQuestion.text} />
        </div>
      </div>

      <div className="bg-[var(--color-paper)] dark:bg-[var(--color-paper-dark)] rounded-xl border border-[var(--color-border)] dark:border-[var(--color-border-dark)] p-5">
        <FormControl component="fieldset" fullWidth>
          <RadioGroup value={selectedValue} onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}>
            {currentQuestion.alternatives.map((alt) => (
              <FormControlLabel
                key={alt.id}
                value={alt.id}
                control={<Radio />}
                label={<MarkdownRenderer content={alt.text} />}
                sx={{
                  mb: 1,
                  p: 1.5,
                  border: 1,
                  borderColor: selectedValue === alt.id ? 'primary.main' : 'divider',
                  borderRadius: 2,
                  bgcolor: selectedValue === alt.id ? 'action.selected' : 'transparent',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          startIcon={<ChevronLeft size={18} />}
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex((i) => i - 1)}
          sx={{ borderRadius: 2 }}
        >
          Anterior
        </Button>
        <div className="flex gap-2">
          {isLast ? (
            <Button
              variant="contained"
              color="success"
              endIcon={<CheckCircle size={18} />}
              onClick={() => submitExam(violationsRef.current)}
              disabled={isSubmitting || !allAnswered}
              sx={{ borderRadius: 2 }}
            >
              {isSubmitting ? 'Entregando...' : 'Finalizar Exame'}
            </Button>
          ) : (
            <Button
              variant="contained"
              endIcon={<ChevronRight size={18} />}
              onClick={() => setCurrentIndex((i) => i + 1)}
              sx={{ borderRadius: 2 }}
            >
              Próxima
            </Button>
          )}
        </div>
      </div>

      <Dialog open={warningOpen} onClose={() => setWarningOpen(false)}
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          Atenção
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Você perdeu o foco do exame. Evite trocar de aba ou minimizar a janela.
          </Alert>
          <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            {2 - violations} aviso(s) restante(s) antes do encerramento automático.
          </div>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setWarningOpen(false)} variant="contained" sx={{ borderRadius: 2 }}>Continuar</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ExamPage;
