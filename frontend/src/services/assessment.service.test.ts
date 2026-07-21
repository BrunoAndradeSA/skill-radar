import { describe, it, expect } from 'vitest';
import { AssessmentService } from './assessment.service';
import { createMockAssessmentRepository, sampleAssessment } from '../test/mocks';

describe('AssessmentService', () => {
  describe('startAssessment', () => {
    it('cria assessment sem marcar convite manualmente (backend faz isso)', async () => {
      const assessmentRepo = createMockAssessmentRepository();
      const service = new AssessmentService(assessmentRepo);

      assessmentRepo.create.mockResolvedValue(sampleAssessment);

      const result = await service.startAssessment('inv1', 'tpl1');
      expect(result.id).toBe('1');
    });
  });

  describe('submitAssessment', () => {
    it('atualiza status e retorna assessment sem GET extra', async () => {
      const assessmentRepo = createMockAssessmentRepository();
      const service = new AssessmentService(assessmentRepo);

      assessmentRepo.update.mockResolvedValue({
        ...sampleAssessment,
        status: 'FINISHED' as const,
        answers: [],
        securityMetrics: { focusLostCount: 0, isTerminated: false },
      });

      const result = await service.submitAssessment('1', [], 0, 'tok');
      expect(result.status).toBe('FINISHED');
      expect(assessmentRepo.update).toHaveBeenCalledTimes(1);
      expect(assessmentRepo.findById).not.toHaveBeenCalled();
      expect(assessmentRepo.update).toHaveBeenCalledWith('1', {
        status: 'FINISHED',
        answers: [],
        securityMetrics: { focusLostCount: 0, isTerminated: false },
      }, 'tok');
    });
  });

  describe('submitAssessment', () => {
    it('funciona sem invitationToken', async () => {
      const assessmentRepo = createMockAssessmentRepository();
      const service = new AssessmentService(assessmentRepo);

      assessmentRepo.update.mockResolvedValue({ ...sampleAssessment, status: 'FINISHED' as const });

      const result = await service.submitAssessment('1');
      expect(result.status).toBe('FINISHED');
      expect(assessmentRepo.update).toHaveBeenCalledWith('1', expect.any(Object), undefined);
    });
  });

  describe('terminateAssessment', () => {
    it('atualiza status para TERMINATED', async () => {
      const assessmentRepo = createMockAssessmentRepository();
      const service = new AssessmentService(assessmentRepo);

      assessmentRepo.update.mockResolvedValue({
        ...sampleAssessment,
        status: 'TERMINATED' as const,
        securityMetrics: { focusLostCount: 3, isTerminated: true },
      });

      const result = await service.terminateAssessment('1', 3, 'tok');
      expect(result.status).toBe('TERMINATED');
      expect(assessmentRepo.update).toHaveBeenCalledWith('1', {
        status: 'TERMINATED',
        securityMetrics: { focusLostCount: 3, isTerminated: true },
      }, 'tok');
    });
  });

  describe('terminateAssessment', () => {
    it('funciona sem invitationToken', async () => {
      const assessmentRepo = createMockAssessmentRepository();
      const service = new AssessmentService(assessmentRepo);

      assessmentRepo.update.mockResolvedValue({ ...sampleAssessment, status: 'TERMINATED' as const });

      const result = await service.terminateAssessment('1');
      expect(result.status).toBe('TERMINATED');
      expect(assessmentRepo.update).toHaveBeenCalledWith('1', expect.any(Object), undefined);
    });
  });

  describe('getAllAssessments', () => {
    it('delega para o repositório', async () => {
      const assessmentRepo = createMockAssessmentRepository();
      const service = new AssessmentService(assessmentRepo);

      assessmentRepo.findAll.mockResolvedValue([sampleAssessment]);
      const result = await service.getAllAssessments();
      expect(result).toHaveLength(1);
    });
  });
});
