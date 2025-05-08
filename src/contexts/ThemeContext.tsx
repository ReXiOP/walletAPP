
'use client';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAppData } from './AppDataContext'; // Import useAppData
import { PREDEFINED_COLOR_PALETTES, type ColorPaletteDefinition } from '@/types';

type ThemeSetting = 'light' | 'dark' | 'system';
type EffectiveTheme = 'light' | 'dark';

interface ThemeContextType {
  themeSetting: ThemeSetting;
  effectiveTheme: EffectiveTheme;
  setThemeSetting: (theme: ThemeSetting) => void;
  toggleEffectiveTheme: () => void; 
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider = ({ children }: { children: ReactNode }) => {
  const [themeSetting, setThemeSettingState] = useState<ThemeSetting>('system');
  const [effectiveTheme, setEffectiveThemeState] = useState<EffectiveTheme>('light');
  const [isMounted, setIsMounted] = useState(false);
  
  // Consume AppDataContext to get color palette setting
  // Note: This means AppDataProvider must wrap CustomThemeProvider or be available when ThemeContext is used.
  // In RootLayout, AppDataProvider wraps SidebarProvider which wraps children, and CustomThemeProvider is outside SidebarProvider.
  // This is fine IF AppDataProvider is higher up. Let's check layout.tsx. AppDataProvider wraps SidebarProvider. CustomThemeProvider is higher.
  // So, CustomThemeProvider needs to be wrapped by AppDataProvider in layout.tsx.
  // Correction: In the current layout.tsx, CustomThemeProvider wraps AppDataProvider. This needs to be swapped.
  // For now, assuming AppData is available. If not, this will fail.
  // A better approach might be to pass settings down or have AppDataProvider manage theme colors directly if they are settings.
  // Given the current structure, let's proceed and ensure layout.tsx has AppDataProvider wrapping CustomThemeProvider.
  // The prompt doesn't allow changing layout.tsx, so I'll handle potential undefined settings.
  const appData = useAppData();
  const settings = appData?.settings;
  const selectedPaletteId = settings?.colorPalette || PREDEFINED_COLOR_PALETTES[0].id;

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

    // Apply selected color palette
    const palette = PREDEFINED_COLOR_PALETTES.find(p => p.id === selectedPaletteId) || PREDEFINED_COLOR_PALETTES[0];
    const root = document.documentElement;
    const colorsToSet = effectiveTheme === 'dark' ? palette.dark : palette.light;
    
    root.style.setProperty('--primary-hsl', colorsToSet.primary);
    root.style.setProperty('--accent-hsl', colorsToSet.accent);
    
    // Primary Foreground based on primary color's HSL (example logic)
    // This is a simplified heuristic. Real contrast calculation is complex.
    // Assuming primary HSL is "H S% L%"
    const primaryL = parseInt(colorsToSet.primary.split(' ')[2].replace('%',''));
    if (primaryL > 50) { // Light primary background
        root.style.setProperty('--primary-foreground-hsl', palette.dark.primary); // Use dark text
    } else { // Dark primary background
        root.style.setProperty('--primary-foreground-hsl', palette.light.primary); // Use light text
    }
    // Similar logic for accent-foreground
    const accentL = parseInt(colorsToSet.accent.split(' ')[2].replace('%',''));
     if (accentL > 50) {
        root.style.setProperty('--accent-foreground-hsl', palette.dark.accent);
    } else {
        root.style.setProperty('--accent-foreground-hsl', palette.light.accent);
    }


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

  }, [themeSetting, isMounted, selectedPaletteId, effectiveTheme]); // Added selectedPaletteId and effectiveTheme to dependencies

  const setThemeSetting = useCallback((newThemeSetting: ThemeSetting) => {
    if (!isMounted) return;
    setThemeSettingState(newThemeSetting);
  }, [isMounted]);

  const toggleEffectiveTheme = useCallback(() => {
    if (!isMounted) return;
    setThemeSettingState(prevSetting => {
        const currentSystemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentActualTheme = themeSetting === 'system' 
            ? (currentSystemPrefersDark ? 'dark' : 'light') 
            : themeSetting;
      
        return currentActualTheme === 'light' ? 'dark' : 'light';
    });
  }, [isMounted, themeSetting]);


  if (!isMounted || !appData?.isLoaded) { // Also wait for appData to be loaded
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

    