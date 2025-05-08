
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

const geistSans = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BudgetZen - Smart Finance Manager',
  description: 'Modern, intuitive app for managing your personal finances with ease and style.',
  manifest: '/manifest.json', 
  themeColor: '#008080', 
  appleWebAppCapable: 'yes',
  appleWebAppStatusBarStyle: 'black-translucent',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground overflow-hidden`}>
        <AppDataProvider> {/* AppDataProvider now wraps CustomThemeProvider */}
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

    