import { describe, it, expect } from 'vitest';
import { QuestionService } from './question.service';
import { createMockQuestionRepository } from '../test/mocks';
import { ValidationError } from '../models/errors';
import type { Question } from '../models/Question';

function validQuestion(): Omit<Question, 'id'> {
  return {
    themeId: '1',
    competencyIds: ['1'],
    type: 'MULTIPLE_CHOICE',
    seniority: 'Pleno',
    text: 'O que é React?',
    alternatives: [
      { id: 'a1', text: 'Uma biblioteca', isCorrect: true },
      { id: 'a2', text: 'Um framework', isCorrect: false },
    ],
  };
}

describe('QuestionService', () => {
  describe('createQuestion', () => {
    it('cria questão com dados válidos', async () => {
      const repo = createMockQuestionRepository();
      const service = new QuestionService(repo);
      const input = validQuestion();
      repo.create.mockResolvedValue({ id: '1', ...input });

      const result = await service.createQuestion(input);
      expect(result.text).toBe(input.text);
    });

    it('rejeita questão sem texto', async () => {
      const repo = createMockQuestionRepository();
      const service = new QuestionService(repo);
      await expect(service.createQuestion({ ...validQuestion(), text: '' })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita questão sem competências', async () => {
      const repo = createMockQuestionRepository();
      const service = new QuestionService(repo);
      await expect(service.createQuestion({ ...validQuestion(), competencyIds: [] })).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita questão com menos de 2 alternativas', async () => {
      const repo = createMockQuestionRepository();
      const service = new QuestionService(repo);
      await expect(
        service.createQuestion({
          ...validQuestion(),
          alternatives: [{ id: 'a1', text: 'Única', isCorrect: true }],
        }),
      ).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita questão sem alternativa correta', async () => {
      const repo = createMockQuestionRepository();
      const service = new QuestionService(repo);
      await expect(
        service.createQuestion({
          ...validQuestion(),
          alternatives: [
            { id: 'a1', text: 'Errada 1', isCorrect: false },
            { id: 'a2', text: 'Errada 2', isCorrect: false },
          ],
        }),
      ).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });

    it('rejeita questão com múltiplas alternativas corretas', async () => {
      const repo = createMockQuestionRepository();
      const service = new QuestionService(repo);
      await expect(
        service.createQuestion({
          ...validQuestion(),
          alternatives: [
            { id: 'a1', text: 'Correta 1', isCorrect: true },
            { id: 'a2', text: 'Correta 2', isCorrect: true },
          ],
        }),
      ).rejects.toThrow(ValidationError);
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('updateQuestion', () => {
    it('valida antes de atualizar', async () => {
      const repo = createMockQuestionRepository();
      const service = new QuestionService(repo);
      await expect(service.updateQuestion('1', { ...validQuestion(), text: '' })).rejects.toThrow(ValidationError);
      expect(repo.update).not.toHaveBeenCalled();
    });
  });
});
