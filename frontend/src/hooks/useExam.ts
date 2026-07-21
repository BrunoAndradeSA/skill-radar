import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { AssessmentService } from '../services/assessment.service';
import { TemplateService } from '../services/template.service';
import { InvitationService } from '../services/invitation.service';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import type { AssessmentAnswer } from '../models/AssessmentAnswer';

function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const assessmentService = new AssessmentService(
  RepositoryFactory.getAssessmentRepository(),
);
const invitationService = new InvitationService(RepositoryFactory.getInvitationRepository());

export function useExamAccess() {
  const validate = useMutation({
    mutationFn: ({ token, accessCode }: { token: string; accessCode: string }) =>
      invitationService.validateToken(token, accessCode),
  });

  return {
    validate: validate.mutateAsync,
    invitation: validate.data,
    isLoading: validate.isPending,
    error: validate.error,
  };
}

export function useExamStart() {
  const navigate = useNavigate();

  const start = useMutation({
    mutationFn: (params: { invitationId: string; templateId: string; invitationToken?: string }) => {
      void params.invitationToken;
      return assessmentService.startAssessment(params.invitationId, params.templateId);
    },
    onSuccess: (assessment) => {
      navigate(`/exam/start?assessment=${assessment.id}`);
    },
  });

  return { start: start.mutate, isLoading: start.isPending };
}

const templateService = new TemplateService(RepositoryFactory.getTemplateRepository());

export function useExamTemplate(templateId: string | null) {
  return useQuery({
    queryKey: ['examTemplate', templateId],
    queryFn: () => templateService.getTemplateById(templateId!),
    enabled: !!templateId,
    staleTime: 30 * 1000,
  });
}

export function useExamReject() {
  const navigate = useNavigate();

  const reject = useMutation({
    mutationFn: ({ invitationId, templateId }: { invitationId: string; templateId: string }) =>
      assessmentService.rejectAssessment(invitationId, templateId),
    onSuccess: () => {
      navigate('/');
    },
  });

  return { reject: reject.mutate, isRejecting: reject.isPending };
}

export function useExamSession(assessmentId: string | null, invitationToken?: string) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const assessmentIdRef = useRef(assessmentId);
  const invitationTokenRef = useRef(invitationToken);
  const answersRef = useRef(answers);
  useEffect(() => { assessmentIdRef.current = assessmentId; }, [assessmentId]);
  useEffect(() => { invitationTokenRef.current = invitationToken; }, [invitationToken]);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const { data: assessment } = useQuery({
    queryKey: ['exam', assessmentId],
    queryFn: () => assessmentService.getAssessmentById(assessmentId!, invitationToken),
    enabled: !!assessmentId,
  });

  const setAnswer = useCallback((questionId: string, alternativeId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: alternativeId }));
  }, []);

  const submit = useMutation({
    mutationFn: async (violationsCount?: number) => {
      const id = assessmentIdRef.current;
      if (!id) return;
      const currentAnswers = answersRef.current;
      const currentQuestions = questionsRef.current;
      const answerList: AssessmentAnswer[] = currentQuestions
        .filter((q) => currentAnswers[q.id])
        .map((q) => ({
          questionId: (q as { questionId?: string }).questionId || q.id,
          selectedAlternativeId: currentAnswers[q.id],
          timeSpentSeconds: 0,
        }));
      await assessmentService.submitAssessment(id, answerList, violationsCount, invitationTokenRef.current);
    },
    onSuccess: () => {
      const id = assessmentIdRef.current;
      queryClient.invalidateQueries({ queryKey: ['exam', id] });
      navigate(`/exam/result?id=${id}`);
    },
    onError: () => {
      // Do not navigate on error — let the UI show the error state
    },
  });

  const terminate = useMutation({
    mutationFn: async (violationsCount: number) => {
      const id = assessmentIdRef.current;
      if (!id) return;
      await assessmentService.terminateAssessment(id, violationsCount, invitationTokenRef.current);
    },
    onSuccess: () => {
      const id = assessmentIdRef.current;
      queryClient.invalidateQueries({ queryKey: ['exam', id] });
      navigate(`/exam/result?id=${id}`);
    },
    onError: () => {
      // Do not navigate on error
    },
  });

  const questions = useMemo(() => {
    if (!assessment?.questions) return [];
    return assessment.questions.map((q) => ({
      ...q,
      alternatives: shuffleArray([...q.alternatives]),
    }));
  }, [assessment]);
  const questionsRef = useRef(questions);
  useEffect(() => { questionsRef.current = questions; }, [questions]);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return {
    assessment,
    templateId: assessment?.templateId ?? null,
    questions,
    currentIndex,
    currentQuestion,
    progress,
    answers,
    setAnswer,
    setCurrentIndex,
    submitExam: (violationsCount?: number) => submit.mutate(violationsCount),
    isSubmitting: submit.isPending,
    terminateExam: (violationsCount: number) => terminate.mutate(violationsCount),
  };
}
