'use client';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type ThemeSetting = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  themeSetting: ThemeSetting;
  effectiveTheme: EffectiveTheme;
  setThemeSetting: (theme: ThemeSetting) => void;
  toggleEffectiveTheme: () => void; // For the header button to switch between light/dark
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeSetting, setThemeSettingState] = useState<ThemeSetting>('system');
  const [effectiveTheme, setEffectiveThemeState] = useState<EffectiveTheme>('light');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem('budgetzen-theme') as ThemeSetting | null;
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    let initialSetting: ThemeSetting = 'system';
    if (storedTheme) {
      initialSetting = storedTheme;
    }
    setThemeSettingState(initialSetting);

    if (initialSetting === 'system') {
      setEffectiveThemeState(systemPrefersDark ? 'dark' : 'light');
    } else {
      setEffectiveThemeState(initialSetting);
    }
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentEffectiveTheme: EffectiveTheme = 'light';

    if (themeSetting === 'system') {
      currentEffectiveTheme = systemPrefersDark ? 'dark' : 'light';
    } else {
      currentEffectiveTheme = themeSetting;
    }
    setEffectiveThemeState(currentEffectiveTheme);

    if (currentEffectiveTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('budgetzen-theme', themeSetting);

    // Listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeSetting === 'system') {
        const newEffectiveTheme = mediaQuery.matches ? 'dark' : 'light';
        setEffectiveThemeState(newEffectiveTheme);
        if (newEffectiveTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);

  }, [themeSetting, isMounted]);

  const setThemeSetting = useCallback((newThemeSetting: ThemeSetting) => {
    if (!isMounted) return;
    setThemeSettingState(newThemeSetting);
  }, [isMounted]);

  const toggleEffectiveTheme = useCallback(() => {
    if (!isMounted) return;
    // This toggle will switch between light and dark, and set the preference explicitly
    setThemeSettingState(prevSetting => {
        const currentSystemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentActualTheme = themeSetting === 'system' 
            ? (currentSystemPrefersDark ? 'dark' : 'light') 
            : themeSetting;
      
        return currentActualTheme === 'light' ? 'dark' : 'light';
    });
  }, [isMounted, themeSetting]);


  if (!isMounted) {
    return null; 
  }

  return (
    <ThemeContext.Provider value={{ themeSetting, effectiveTheme, setThemeSetting, toggleEffectiveTheme }}>
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
