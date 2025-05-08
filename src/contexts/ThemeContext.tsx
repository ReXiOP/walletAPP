
'use client';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';
interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('budgetzen-theme') as Theme | null;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (storedTheme) {
      setThemeState(storedTheme);
    } else {
      setThemeState(prefersDark ? 'dark' : 'light');
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('budgetzen-theme', theme);
  }, [theme, isMounted]);

  const toggleTheme = useCallback(() => {
    if (!isMounted) return;
    setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, [isMounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    if (!isMounted) return;
    setThemeState(newTheme);
  }, [isMounted]);

  if (!isMounted) {
    // Avoid rendering children until theme is determined to prevent flash/mismatch
    return null; 
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useCustomTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useCustomTheme must be used within a CustomThemeProvider');
  }
  return context;
};
