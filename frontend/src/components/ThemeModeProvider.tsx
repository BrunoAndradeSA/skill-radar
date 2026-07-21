import React, { useState, useMemo, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeModeContext, type ThemeMode } from '../hooks/useThemeMode';
import { lightTheme, darkTheme } from '../utils/theme';

function getInitialMode(): ThemeMode {
  const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
  if (savedMode === 'light' || savedMode === 'dark') return savedMode;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const initial = getInitialMode();
    document.documentElement.classList.toggle('dark', initial === 'dark');
    return initial;
  });

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('themeMode', newMode);
    document.documentElement.classList.toggle('dark', newMode === 'dark');
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(mode === 'light' ? 'dark' : 'light');
  }, [mode, setMode]);

  const contextValue = useMemo(() => ({ mode, toggleTheme, setMode }), [mode, toggleTheme, setMode]);
  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};
