import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QuestionService } from '../services/question.service';
import { RepositoryFactory } from '../repositories/RepositoryFactory';
import type { Question } from '../models/Question';
import type { QuestionFilter } from '../models/types';
import { useSnackbar } from './useSnackbar';

const questionService = new QuestionService(RepositoryFactory.getQuestionRepository());

export function useQuestions(filters?: QuestionFilter) {
  return useQuery({
    queryKey: ['questions', filters],
    queryFn: () => questionService.getAllQuestions(filters),
    staleTime: 30 * 1000,
  });
}

export function useQuestionMutations() {
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbar();

  const create = useMutation({
    mutationFn: (q: Omit<Question, 'id'>) => questionService.createQuestion(q),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      showSnackbar('Questão criada', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao criar questão', 'error');
    },
  });

  const update = useMutation({
    mutationFn: ({ id, question }: { id: string; question: Omit<Question, 'id'> }) =>
      questionService.updateQuestion(id, question),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      showSnackbar('Questão atualizada', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao atualizar questão', 'error');
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => questionService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      showSnackbar('Questão removida', 'success');
    },
    onError: (error) => {
      showSnackbar(error instanceof Error ? error.message : 'Erro ao remover questão', 'error');
    },
  });

  return { create, update, remove };
}
