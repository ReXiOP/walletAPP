'use client';
import React from 'react';
import { useCustomTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function AppHeader() {
  const { effectiveTheme, toggleEffectiveTheme } = useCustomTheme();

  return (
    <div className="flex items-center justify-between w-full p-4 border-b">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <svg width="32" height="32" viewBox="0 0 100 100" className="text-primary">
          <rect width="100" height="100" rx="20" fill="currentColor"/>
          <circle cx="35" cy="35" r="15" fill="hsl(var(--primary-foreground))"/>
          <line x1="35" y1="50" x2="35" y2="75" stroke="hsl(var(--primary-foreground))" strokeWidth="10" strokeLinecap="round"/>
          <line x1="65" y1="25" x2="65" y2="75" stroke="hsl(var(--primary-foreground))" strokeWidth="10" strokeLinecap="round"/>
          <line x1="50" y1="65" x2="80" y2="65" stroke="hsl(var(--primary-foreground))" strokeWidth="10" strokeLinecap="round"/>
        </svg>
        <h1 className="text-xl font-bold text-primary">BudgetZen</h1>
      </div>
      <Button variant="ghost" size="icon" onClick={toggleEffectiveTheme} aria-label="Toggle theme">
        {effectiveTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </Button>
    </div>
  );
}
