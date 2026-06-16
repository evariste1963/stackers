import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { darkColors, lightColors, type ThemeColors, type ThemeMode } from '@/styles/themes';
import { getThemeSetting, updateThemeSetting } from '@/services/settingsService';

interface ThemeContextType {
  colors: ThemeColors;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  colors: darkColors,
  theme: 'dark',
  setTheme: async () => {},
  toggleTheme: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    getThemeSetting().then(setThemeState).catch(() => {});
  }, []);

  const setTheme = useCallback(async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    await updateThemeSetting(newTheme).catch(console.error);
  }, []);

  const toggleTheme = useCallback(async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    await setTheme(next);
  }, [theme, setTheme]);

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ colors, theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
