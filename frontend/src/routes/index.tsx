/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter, Navigate, useParams } from 'react-router-dom';
import { SuspenseRoute } from '../components/SuspenseRoute';
import AuthLayout from '../layouts/AuthLayout';
import CandidateLayout from '../layouts/CandidateLayout';
import AdminLayout from '../layouts/AdminLayout';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/admin/DashboardPage'));
const ThemesPage = lazy(() => import('../pages/admin/themes/ThemesPage'));
const CompetenciesPage = lazy(() => import('../pages/admin/competencies/CompetenciesPage'));
const QuestionsPage = lazy(() => import('../pages/admin/questions/QuestionsPage'));
const TemplatesPage = lazy(() => import('../pages/admin/templates/TemplatesPage'));
const InvitationsPage = lazy(() => import('../pages/admin/invitations/InvitationsPage'));
const AssessmentsPage = lazy(() => import('../pages/admin/assessments/AssessmentsPage'));
const CandidatesPage = lazy(() => import('../pages/admin/candidates/CandidatesPage'));
const SelectionProcessesPage = lazy(() => import('../pages/admin/selection-processes/SelectionProcessesPage'));
const CandidateDetailPage = lazy(() => import('../pages/admin/candidates/CandidateDetailPage'));
const ExamAccessPage = lazy(() => import('../pages/exam/ExamAccessPage'));
const ExamRulesPage = lazy(() => import('../pages/exam/ExamRulesPage'));
const ExamPage = lazy(() => import('../pages/exam/ExamPage'));
const ExamResultPage = lazy(() => import('../pages/exam/ExamResultPage'));

function UserRedirect() {
  const { id } = useParams();
  return <Navigate to={`/admin/candidates/${id}`} replace />;
}

function UsersRedirect() {
  return <Navigate to="/admin/candidates" replace />;
}

const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: '/login',
        element: <SuspenseRoute><LoginPage /></SuspenseRoute>,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        path: '',
        element: <Navigate to="/admin/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <SuspenseRoute><DashboardPage /></SuspenseRoute>,
      },
      {
        path: 'themes',
        element: <SuspenseRoute><ThemesPage /></SuspenseRoute>,
      },
      {
        path: 'competencies',
        element: <SuspenseRoute><CompetenciesPage /></SuspenseRoute>,
      },
      {
        path: 'questions',
        element: <SuspenseRoute><QuestionsPage /></SuspenseRoute>,
      },
      {
        path: 'templates',
        element: <SuspenseRoute><TemplatesPage /></SuspenseRoute>,
      },
      {
        path: 'invitations',
        element: <SuspenseRoute><InvitationsPage /></SuspenseRoute>,
      },
      {
        path: 'selection-processes',
        element: <SuspenseRoute><SelectionProcessesPage /></SuspenseRoute>,
      },
      {
        path: 'assessments',
        element: <SuspenseRoute><AssessmentsPage /></SuspenseRoute>,
      },
      {
        path: 'users',
        element: <UsersRedirect />,
      },
      {
        path: 'candidates',
        element: <SuspenseRoute><CandidatesPage /></SuspenseRoute>,
      },
      {
        path: 'users/:id',
        element: <UserRedirect />,
      },
      {
        path: 'candidates/:id',
        element: <SuspenseRoute><CandidateDetailPage /></SuspenseRoute>,
      },
    ],
  },
  {
    path: '/exam',
    element: <CandidateLayout />,
    children: [
      {
        path: ':token',
        element: <SuspenseRoute><ExamAccessPage /></SuspenseRoute>,
      },
      {
        path: 'rules',
        element: <SuspenseRoute><ExamRulesPage /></SuspenseRoute>,
      },
      {
        path: 'start',
        element: <SuspenseRoute><ExamPage /></SuspenseRoute>,
      },
      {
        path: 'result',
        element: <SuspenseRoute><ExamResultPage /></SuspenseRoute>,
      },
    ],
  },
  {
    path: '*',
    element: <SuspenseRoute><NotFoundPage /></SuspenseRoute>,
  },
]);
