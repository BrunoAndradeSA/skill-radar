import React from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { Moon, Sun, LogOut, Menu, LayoutDashboard, Palette, Brain, CircleHelp, FileText, Mail, ClipboardList, UserCheck, Briefcase } from 'lucide-react';
import { useThemeMode } from '../hooks/useThemeMode';
import { useUserStore } from '../store/useUserStore';
import { FeatureFlagService } from '../feature-flags/FeatureFlagService';
import { SnackbarProvider } from '../hooks/useSnackbar';

const navItems = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Temas', path: '/admin/themes', icon: Palette },
  { label: 'Competências', path: '/admin/competencies', icon: Brain },
  { label: 'Questões', path: '/admin/questions', icon: CircleHelp },
  { label: 'Templates', path: '/admin/templates', icon: FileText },
  { label: 'Candidatos', path: '/admin/candidates', icon: UserCheck },
  { label: 'Processos Seletivos', path: '/admin/selection-processes', icon: Briefcase },
  { label: 'Convites', path: '/admin/invitations', icon: Mail },
  { label: 'Avaliações', path: '/admin/assessments', icon: ClipboardList },
];

function SidebarContent({
  sidebarOpen,
  onNavigate,
  onLogout,
  user,
  location,
}: {
  sidebarOpen: boolean;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  user: { name: string } | null;
  location: { pathname: string };
}) {
  return (
    <div className="h-full border-r border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-paper)]/60 dark:bg-[var(--color-paper-dark)]/50 backdrop-blur-xl flex flex-col">
      <div className={`flex items-center h-16 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex-shrink-0 ${sidebarOpen ? 'gap-3 px-5' : 'justify-center'}`}>
        <img src="/favicon.svg" alt="Skill Radar" className="w-8 h-8 flex-shrink-0" />
        {sidebarOpen && (
          <span className="font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap font-heading tracking-tight">
            Skill Radar
          </span>
        )}
      </div>

      <nav className={`flex-1 space-y-0.5 overflow-y-auto min-h-0 ${sidebarOpen ? 'p-3' : 'p-2'}`}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`sidebar-link w-full transition-all duration-200 ${
                sidebarOpen ? 'text-left px-4' : 'justify-center px-0'
              } ${isActive ? 'active' : ''}`}
              title={!sidebarOpen ? item.label : undefined}
              aria-label={item.label}
            >
              <Icon size={20} className="flex-shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className={`border-t border-[var(--color-border)] dark:border-[var(--color-border-dark)] flex-shrink-0 ${sidebarOpen ? 'p-3' : 'p-2'}`}>
        {sidebarOpen && user && (
          <div className="px-4 pb-2 text-xs text-gray-400 dark:text-gray-500 truncate font-medium">
            {user.name}
          </div>
        )}
        <button
          onClick={onLogout}
          className={`sidebar-link w-full transition-all duration-200 ${sidebarOpen ? 'text-left px-4' : 'justify-center px-0'}`}
          title={!sidebarOpen ? 'Sair' : undefined}
          aria-label="Sair"
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
}

const AdminLayout: React.FC = () => {
  const { mode, toggleTheme } = useThemeMode();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useUserStore((s) => s.user);
  const isAuthenticated = useUserStore((s) => s.isAuthenticated);
  const logout = useUserStore((s) => s.logout);
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const authEnabled = FeatureFlagService.getFlag('enableAuthentication');
  if (authEnabled && (!isAuthenticated || !user?.roles?.includes('ADMIN'))) {
    return <Navigate to="/login" replace />;
  }

  const handleNavigate = (path: string) => {
    navigate(path);
    if (!isDesktop) setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebar = (
    <SidebarContent
      sidebarOpen={sidebarOpen}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      user={user}
      location={location}
    />
  );

  return (
    <div className="h-screen flex bg-[var(--color-surface)] dark:bg-[var(--color-surface-dark)] transition-colors duration-300 overflow-hidden">
      {/* Mobile: Drawer (temporary) */}
      {!isDesktop && (
        <Drawer
          variant="temporary"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 256,
              bgcolor: 'transparent',
              borderRight: 'none',
              boxShadow: 'none',
            },
          }}
        >
          <SidebarContent
            sidebarOpen={true}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            user={user}
            location={location}
          />
        </Drawer>
      )}

      {/* Desktop: inline sidebar */}
      {isDesktop && (
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-[68px]'
          } transition-all duration-300 ease-in-out flex-shrink-0 overflow-hidden`}
        >
          {sidebar}
        </aside>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-[var(--color-border)] dark:border-[var(--color-border-dark)] bg-[var(--color-paper)]/50 dark:bg-[var(--color-paper-dark)]/40 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label={sidebarOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-1">
            <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo escuro'}>
              <IconButton onClick={toggleTheme} size="small">
                {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </IconButton>
            </Tooltip>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto min-h-0">
          <div className="animate-fade-in">
            <SnackbarProvider>
              <Outlet />
            </SnackbarProvider>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
