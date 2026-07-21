import { themes } from './data/themes';
import { competencies } from './data/competencies';
import { questions } from './data/questions';
import { templates } from './data/templates';
import { invitations } from './data/invitations';
import { users } from './data/users';
import { selectionProcesses } from './data/selection-processes';

const SEED_FLAG = 'mock_seeded';

export function seedMockData(): void {
  if (localStorage.getItem(SEED_FLAG)) return;

  localStorage.setItem('mock_themes', JSON.stringify(themes));
  localStorage.setItem('mock_competencies', JSON.stringify(competencies));
  localStorage.setItem('mock_questions', JSON.stringify(questions));
  localStorage.setItem('mock_templates', JSON.stringify(templates));
  localStorage.setItem('mock_invitations', JSON.stringify(invitations));
  localStorage.setItem('mock_selection_processes', JSON.stringify(selectionProcesses));
  localStorage.setItem('mock_users', JSON.stringify(users));
  localStorage.setItem('mock_candidates', JSON.stringify(users));
  localStorage.setItem(SEED_FLAG, 'true');
}

export function clearMockData(): void {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith('mock_'));
  keys.forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem(SEED_FLAG);
}
