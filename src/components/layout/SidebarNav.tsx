
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListChecks, PieChart, Settings, Info, Download, Upload, ListOrdered } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { useAppData } from '@/contexts/AppDataContext';
import React from 'react';

const mainNavItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: ListChecks },
  { href: '/budgets', label: 'Budgets', icon: PieChart },
  { href: '/categories', label: 'Categories', icon: ListOrdered },
];

const utilityNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/about', label: 'About', icon: Info },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { exportData, importData } = useAppData();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importData(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <nav className="flex flex-col h-full">
      <SidebarMenu className="flex-grow">
        {mainNavItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname === item.href}
                className="w-full"
                tooltip={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      
      <SidebarMenu className="mt-auto border-t pt-2">
        <SidebarMenuItem>
            <SidebarMenuButton
              onClick={exportData}
              className="w-full"
              tooltip="Export Data"
            >
              <Download className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Export Data</span>
            </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleImportClick}
              className="w-full"
              tooltip="Import Data"
            >
              <Upload className="h-5 w-5" />
              <span className="group-data-[collapsible=icon]:hidden">Import Data</span>
            </SidebarMenuButton>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
        </SidebarMenuItem>
         {utilityNavItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname === item.href}
                className="w-full"
                tooltip={item.label}
              >
                <item.icon className="h-5 w-5" />
                <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
