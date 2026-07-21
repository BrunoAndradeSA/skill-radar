import { createContext, useContext } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeModeContextProps {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

export const ThemeModeContext = createContext<ThemeModeContextProps>({
  mode: 'light',
  toggleTheme: () => {},
  setMode: () => {},
});

export const useThemeMode = () => useContext(ThemeModeContext);
