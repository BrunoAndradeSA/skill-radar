import { useQuery } from '@tanstack/react-query';
import { AssessmentService } from '../services/assessment.service';
import { RepositoryFactory } from '../repositories/RepositoryFactory';

const assessmentService = new AssessmentService(
  RepositoryFactory.getAssessmentRepository(),
);

export function useAssessments() {
  return useQuery({
    queryKey: ['assessments'],
    queryFn: () => assessmentService.getAllAssessments(),
    staleTime: 30 * 1000,
  });
}

export function useAssessmentsByInvitationIds(ids: string[]) {
  return useQuery({
    queryKey: ['assessments', 'byInvitationIds', ids],
    queryFn: () => assessmentService.getAssessmentsByInvitationIds(ids),
    enabled: ids.length > 0,
    staleTime: 30 * 1000,
  });
}
