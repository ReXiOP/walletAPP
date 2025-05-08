
'use client'; // Required for useState and useEffect
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { CustomThemeProvider } from '@/contexts/ThemeContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { AppHeader } from '@/components/layout/AppHeader';
import { SidebarNav } from '@/components/layout/SidebarNav';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarRail
} from '@/components/ui/sidebar';
import React, { useState, useEffect } from 'react';
import SplashScreen from '@/components/layout/SplashScreen';

const geistSans = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// Note: The 'metadata' export was removed from here because this is a Client Component.
// Static metadata should be exported from Server Components (e.g., page.tsx or a server layout.tsx).
// If global metadata is needed and this root layout must remain a client component,
// consider adding metadata to individual page.tsx files that are Server Components,
// or explore Next.js's generateMetadata for more dynamic scenarios in Server Components.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showSplashScreen, setShowSplashScreen] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplashScreen(false);
    }, 2500); // Show splash for 2.5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (showSplashScreen) {
    return (
      <html lang="en" suppressHydrationWarning>
        <head>
            {/* Basic metadata can be placed directly in head for client root layouts if needed, but Next.js prefers 'metadata' export from server components */}
            <title>S-Wallet - Smart Finance Manager</title>
            <meta name="description" content="Modern, intuitive app for managing your personal finances with S-Wallet." />
            <link rel="manifest" href="/manifest.json" />
            <meta name="theme-color" content="#008080" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-hidden`}>
          <SplashScreen />
        </body>
      </html>
    );
  }

  return (
    <html lang="en" suppressHydrationWarning>
       <head>
            <title>S-Wallet - Smart Finance Manager</title>
            <meta name="description" content="Modern, intuitive app for managing your personal finances with S-Wallet." />
            <link rel="manifest" href="/manifest.json" />
            <meta name="theme-color" content="#008080" />
            <meta name="apple-mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-hidden`}>
        <AppDataProvider>
          <CustomThemeProvider>
            <SidebarProvider> 
              <div className="flex h-screen w-screen fixed inset-0"> 
                <Sidebar 
                  collapsible="icon" 
                  variant="sidebar" 
                  side="left" 
                  className="hidden md:flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out"
                  style={{ ['--sidebar-width' as string]: '250px', ['--sidebar-width-icon' as string]: '60px' }}
                >
                  <SidebarHeader className="p-3 border-b border-sidebar-border">
                  </SidebarHeader>
                  <SidebarContent className="flex-grow p-2 overflow-y-auto">
                    <SidebarNav />
                  </SidebarContent>
                  <SidebarFooter className="p-2 border-t border-sidebar-border">
                  </SidebarFooter>
                  <SidebarRail className="group-data-[collapsible=icon]:opacity-100 opacity-0 transition-opacity duration-300" />
                </Sidebar>

                <div className="flex flex-col flex-1 overflow-hidden">
                  <AppHeader />
                  <main className="flex-1 p-4 sm:p-6 overflow-y-auto bg-background"> 
                    {children}
                  </main>
                </div>
              </div>
            </SidebarProvider>
            <Toaster />
          </CustomThemeProvider>
        </AppDataProvider>
      </body>
    </html>
  );
}
