
'use client';
import React from 'react';
import { useCustomTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react'; 
import { SidebarTrigger } from '@/components/ui/sidebar'; 

export function AppHeader() {
  const { effectiveTheme, toggleEffectiveTheme } = useCustomTheme();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between w-full p-3 sm:p-4 border-b border-border/60 bg-gradient-to-r from-background to-muted/30 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        <SidebarTrigger className="md:hidden" />
        
        <div className="flex items-center gap-2">
            <svg width="30" height="30" viewBox="0 0 100 100" className="text-primary shrink-0">
            <rect width="100" height="100" rx="20" fill="currentColor"/>
            <circle cx="35" cy="35" r="15" fill="hsl(var(--primary-foreground))"/>
            <line x1="35" y1="50" x2="35" y2="75" stroke="hsl(var(--primary-foreground))" strokeWidth="10" strokeLinecap="round"/>
            <line x1="65" y1="25" x2="65" y2="75" stroke="hsl(var(--primary-foreground))" strokeWidth="10" strokeLinecap="round"/>
            <line x1="50" y1="65" x2="80" y2="65" stroke="hsl(var(--primary-foreground))" strokeWidth="10" strokeLinecap="round"/>
            </svg>
            <h1 className="text-lg sm:text-xl font-bold text-primary tracking-tight">S-Wallet</h1>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleEffectiveTheme} 
        aria-label="Toggle theme"
        className="rounded-full hover:bg-accent/50 transition-colors"
      >
        {effectiveTheme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
      </Button>
    </header>
  );
}
