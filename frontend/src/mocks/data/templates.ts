import type { ExamTemplate } from '../../models/ExamTemplate';

export const templates: ExamTemplate[] = [
  {
    id: 'template-erp-junior',
    name: 'Desenvolvedor ERP Junior',
    description: 'Avaliação para desenvolvedor ERP com foco em Java, PL/SQL e Git.',
    seniority: 'Júnior',
    durationMinutes: 60,
    isCertification: true,
    themes: [
      { themeId: 'theme-java', questionCount: 10, competencyIds: ['comp-java-oop', 'comp-java-streams'] },
      { themeId: 'theme-oracleplsql', questionCount: 15, competencyIds: ['comp-plsql-queries', 'comp-plsql-programming'] },
      { themeId: 'theme-git', questionCount: 5 }
    ]
  },
  {
    id: 'template-fullstack-mid',
    name: 'Desenvolvedor Full Stack Mid-Level',
    description: 'Avaliação completa para desenvolvedor full stack com Python, FastAPI, Docker e Clean Code.',
    seniority: 'Pleno',
    durationMinutes: 90,
    isCertification: true,
    themes: [
      { themeId: 'theme-python', questionCount: 8, competencyIds: ['comp-python-syntax', 'comp-python-functional', 'comp-python-async'] },
      { themeId: 'theme-fastapi', questionCount: 7, competencyIds: ['comp-fastapi-core', 'comp-fastapi-advanced'] },
      { themeId: 'theme-docker', questionCount: 5, competencyIds: ['comp-docker-images', 'comp-docker-compose'] },
      { themeId: 'theme-cleancode', questionCount: 5, competencyIds: ['comp-clean-solid', 'comp-clean-smells'] }
    ]
  }
];
