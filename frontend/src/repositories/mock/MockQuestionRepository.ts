import { Question } from '../../models/Question';
import { QuestionRepository } from '../interfaces/QuestionRepository';
import { seedMockData } from '../../mocks/seed';
import { NotFoundError } from '../../models/errors';
import type { QuestionFilter } from '../../models/types';

export class MockQuestionRepository implements QuestionRepository {
  private getQuestions(): Question[] {
    seedMockData();
    const data = localStorage.getItem('mock_questions');
    return data ? JSON.parse(data) : [];
  }

  private saveQuestions(items: Question[]): void {
    localStorage.setItem('mock_questions', JSON.stringify(items));
  }

  async findAll(filters?: QuestionFilter): Promise<Question[]> {
    let items = this.getQuestions();
    
    if (filters) {
      if (filters.themeId) items = items.filter((q) => q.themeId === filters.themeId);
      if (filters.seniority) items = items.filter((q) => q.seniority === filters.seniority);
      if (filters.type) items = items.filter((q) => q.type === filters.type);
    }
    
    return items;
  }

  async findById(id: string): Promise<Question | null> {
    const items = this.getQuestions();
    return items.find((q) => q.id === id) || null;
  }

  async create(question: Omit<Question, 'id'>): Promise<Question> {
    const items = this.getQuestions();
    const newItem: Question = { ...question, id: crypto.randomUUID() };
    items.push(newItem);
    this.saveQuestions(items);
    return newItem;
  }

  async update(id: string, question: Omit<Question, 'id'>): Promise<Question> {
    const items = this.getQuestions();
    const index = items.findIndex((q) => q.id === id);
    if (index === -1) throw new NotFoundError('Questão', id);
    
    items[index] = { ...question, id };
    this.saveQuestions(items);
    return items[index];
  }

  async delete(id: string): Promise<void> {
    const items = this.getQuestions();
    const filtered = items.filter((q) => q.id !== id);
    this.saveQuestions(filtered);
  }
}
