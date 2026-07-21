import { Assessment } from '../../models/Assessment';
import { AssessmentRepository, CreateAssessment } from '../interfaces/AssessmentRepository';
import { NotFoundError } from '../../models/errors';
import type { Question } from '../../models/Question';
import type { ExamTemplate } from '../../models/ExamTemplate';
import { seedMockData } from '../../mocks/seed';

export class MockAssessmentRepository implements AssessmentRepository {
  private getAssessments(): Assessment[] {
    const data = localStorage.getItem('mock_assessments');
    return data ? JSON.parse(data) : [];
  }

  private saveAssessments(items: Assessment[]): void {
    localStorage.setItem('mock_assessments', JSON.stringify(items));
  }

  private getFromStorage<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  async findAll(): Promise<Assessment[]> {
    return this.getAssessments();
  }

  async findById(id: string, _invitationToken?: string): Promise<Assessment | null> {
    void _invitationToken;
    const items = this.getAssessments();
    return items.find((a) => a.id === id) || null;
  }

  async findByInvitationId(invitationId: string): Promise<Assessment | null> {
    const items = this.getAssessments();
    return items.find((a) => a.invitationId === invitationId) || null;
  }

  async findByInvitationIds(ids: string[]): Promise<Assessment[]> {
    const items = this.getAssessments();
    const idSet = new Set(ids);
    return items.filter((a) => idSet.has(a.invitationId));
  }

  async create(data: CreateAssessment): Promise<Assessment> {
    seedMockData();
    const items = this.getAssessments();
    const templates = this.getFromStorage<ExamTemplate>('mock_templates');
    const allQuestions = this.getFromStorage<Question>('mock_questions');

    const template = templates.find((t) => t.id === data.templateId);

    const selected: Question[] = [];
    if (template) {
      for (const themeDist of template.themes) {
        let pool = allQuestions.filter(
          (q) => q.themeId === themeDist.themeId && q.seniority === template.seniority,
        );
        if (themeDist.competencyIds && themeDist.competencyIds.length > 0) {
          pool = pool.filter((q) =>
            q.competencyIds.some((c) => themeDist.competencyIds!.includes(c)),
          );
        }
        const shuffled = pool.sort(() => Math.random() - 0.5);
        selected.push(...shuffled.slice(0, themeDist.questionCount));
      }
    }

    const newItem: Assessment = {
      id: crypto.randomUUID(),
      invitationId: data.invitationId,
      templateId: data.templateId,
      status: 'IN_PROGRESS',
      questions: selected.sort(() => Math.random() - 0.5),
      answers: [],
      timing: { startTime: new Date().toISOString(), durationSeconds: 0 },
      securityMetrics: { focusLostCount: 0, isTerminated: false },
    };
    items.push(newItem);
    this.saveAssessments(items);
    return newItem;
  }

  async update(id: string, assessment: Partial<Assessment>, invitationToken?: string): Promise<Assessment> {
    void invitationToken;
    const items = this.getAssessments();
    const index = items.findIndex((a) => a.id === id);
    if (index === -1) throw new NotFoundError('Avaliação', id);
    
    items[index] = { ...items[index], ...assessment };
    this.saveAssessments(items);
    return items[index];
  }
}
