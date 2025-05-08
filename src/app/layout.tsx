
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Corrected font import
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
  SidebarInset,
  SidebarFooter,
  SidebarRail
} from '@/components/ui/sidebar';

const geistSans = Geist({ // Corrected font function call
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Corrected font function call
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'BudgetZen - Budgeting & Expense Management',
  description: 'Modern app for managing your finances with ease.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CustomThemeProvider>
          <AppDataProvider>
            <SidebarProvider>
              <Sidebar collapsible="icon" variant="sidebar" side="left">
                <SidebarHeader className="p-2">
                  {/* Placeholder for logo/app name in sidebar if needed, or keep it clean */}
                  {/* <h2 className="text-lg font-semibold text-sidebar-primary group-data-[collapsible=icon]:hidden">BZ</h2> */}
                </SidebarHeader>
                <SidebarContent className="p-0">
                  <SidebarNav />
                </SidebarContent>
                <SidebarFooter>
                  {/* Optional: Footer content like settings or user profile */}
                </SidebarFooter>
                <SidebarRail />
              </Sidebar>
              <SidebarInset>
                <AppHeader />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                  {children}
                </main>
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </AppDataProvider>
        </CustomThemeProvider>
      </body>
    </html>
  );
}
