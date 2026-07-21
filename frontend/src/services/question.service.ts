import { Question } from '../models/Question';
import { QuestionRepository } from '../repositories/interfaces/QuestionRepository';
import { ValidationError } from '../models/errors';
import type { QuestionFilter } from '../models/types';

export class QuestionService {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async getAllQuestions(filters?: QuestionFilter): Promise<Question[]> {
    return this.questionRepository.findAll(filters);
  }

  async getQuestionById(id: string): Promise<Question | null> {
    return this.questionRepository.findById(id);
  }

  async createQuestion(question: Omit<Question, 'id'>): Promise<Question> {
    this.validateQuestion(question);
    return this.questionRepository.create(question);
  }

  async updateQuestion(id: string, question: Omit<Question, 'id'>): Promise<Question> {
    this.validateQuestion(question);
    return this.questionRepository.update(id, question);
  }

  async deleteQuestion(id: string): Promise<void> {
    return this.questionRepository.delete(id);
  }

  private validateQuestion(question: Omit<Question, 'id'>): void {
    if (!question.text?.trim()) throw new ValidationError('O texto da questão é obrigatório');
    if (!question.competencyIds || question.competencyIds.length === 0) {
      throw new ValidationError('Selecione ao menos uma competência para a questão');
    }
    if (!question.alternatives || question.alternatives.length < 2) {
      throw new ValidationError('A questão precisa ter pelo menos 2 alternativas');
    }
    const correctCount = question.alternatives.filter((a) => a.isCorrect).length;
    if (correctCount !== 1) {
      throw new ValidationError('A questão precisa ter exatamente uma alternativa correta');
    }
  }
}
