
'use client';
import React from 'react';
import { useCustomTheme } from '@/contexts/ThemeContext';
import { useAppData } from '@/contexts/AppDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Download, Upload, Moon, Sun, Laptop, DollarSign, CalendarDays, Trash2, Settings as SettingsIcon, Palette, AlertTriangle, Paintbrush } from 'lucide-react';
import { PREDEFINED_COLOR_PALETTES, type ColorPaletteDefinition } from '@/types';

const CURRENCIES = [
  { value: 'USD', label: 'USD ($) - US Dollar' },
  { value: 'EUR', label: 'EUR (€) - Euro' },
  { value: 'GBP', label: 'GBP (£) - British Pound' },
  { value: 'JPY', label: 'JPY (¥) - Japanese Yen' },
  { value: 'INR', label: 'INR (₹) - Indian Rupee' },
  { value: 'CAD', label: 'CAD (C$) - Canadian Dollar' },
  { value: 'AUD', label: 'AUD (A$) - Australian Dollar' },
  { value: 'CHF', label: 'CHF (Fr) - Swiss Franc' },
  { value: 'CNY', label: 'CNY (¥) - Chinese Yuan Renminbi' },
  { value: 'SEK', label: 'SEK (kr) - Swedish Krona' },
  { value: 'NZD', label: 'NZD ($) - New Zealand Dollar' },
  { value: 'BRL', label: 'BRL (R$) - Brazilian Real' },
  { value: 'ZAR', label: 'ZAR (R) - South African Rand' },
];

const DATE_FORMATS = [
  { value: 'MMM dd, yyyy', label: 'Default (Oct 26, 2023)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (10/26/2023)' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (26/10/2023)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2023-10-26)' },
];

export default function SettingsPage() {
  const { themeSetting, setThemeSetting } = useCustomTheme();
  const { exportData, importData, settings, updateSettings, resetAllData } = useAppData();
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
    <div className="space-y-8 max-w-3xl mx-auto">
      <header className="flex items-center gap-2 mb-8">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary">Application Settings</h1>
      </header>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-accent" />Appearance</CardTitle>
          <CardDescription>Customize the look and feel of BudgetZen.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-sm font-medium mb-2 block">Theme Mode</Label>
            <RadioGroup
              value={themeSetting}
              onValueChange={(value) => setThemeSetting(value as 'light' | 'dark' | 'system')}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              {[
                { value: 'light', label: 'Light Mode', icon: Sun },
                { value: 'dark', label: 'Dark Mode', icon: Moon },
                { value: 'system', label: 'System Default', icon: Laptop },
              ].map(item => (
                <Label
                  key={item.value}
                  htmlFor={`theme-${item.value}`}
                  className={`flex flex-col items-center justify-center rounded-lg border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all
                    ${themeSetting === item.value ? 'border-primary bg-accent text-accent-foreground shadow-md scale-105' : 'border-muted'}`}
                >
                  <RadioGroupItem value={item.value} id={`theme-${item.value}`} className="sr-only" />
                  <item.icon className="mb-2 h-7 w-7" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="color-palette-select" className="text-sm font-medium mb-2 block flex items-center"><Paintbrush className="mr-2 h-4 w-4"/>Color Palette</Label>
            <Select
              value={settings.colorPalette}
              onValueChange={(value) => updateSettings({ colorPalette: value })}
            >
              <SelectTrigger id="color-palette-select" className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select color palette" />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_COLOR_PALETTES.map((palette: ColorPaletteDefinition) => (
                  <SelectItem key={palette.id} value={palette.id}>
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        <span className="w-4 h-4 rounded-full border border-card" style={{ backgroundColor: `hsl(${palette.light.primary.split(' ').slice(0,1)}, ${palette.light.primary.split(' ')[1]}, ${palette.light.primary.split(' ')[2]})` }}></span>
                        <span className="w-4 h-4 rounded-full border border-card" style={{ backgroundColor: `hsl(${palette.light.accent.split(' ').slice(0,1)}, ${palette.light.accent.split(' ')[1]}, ${palette.light.accent.split(' ')[2]})` }}></span>
                      </div>
                      {palette.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Choose a color scheme for primary and accent elements.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center"><DollarSign className="mr-2 h-5 w-5 text-accent" />Regional Settings</CardTitle>
          <CardDescription>Choose your preferred currency and date display format.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="currency-select" className="text-sm font-medium mb-2 block">Currency</Label>
            <Select
              value={settings.currency}
              onValueChange={(value) => updateSettings({ currency: value })}
            >
              <SelectTrigger id="currency-select" className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">This will affect how monetary values are displayed.</p>
          </div>
          <div>
            <Label htmlFor="date-format-select" className="text-sm font-medium mb-2 block">Date Format</Label>
            <Select
              value={settings.dateFormat}
              onValueChange={(value) => updateSettings({ dateFormat: value })}
            >
              <SelectTrigger id="date-format-select" className="w-full sm:w-[280px]">
                <SelectValue placeholder="Select date format" />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map(df => <SelectItem key={df.value} value={df.value}>{df.label}</SelectItem>)}
              </SelectContent>
            </Select>
             <p className="text-xs text-muted-foreground mt-1">Choose how dates appear throughout the app.</p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center"><Upload className="mr-2 h-5 w-5 text-accent" />Data Management</CardTitle>
          <CardDescription>Export your financial data or import existing data.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button onClick={exportData} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-transform hover:scale-105">
            <Download className="mr-2 h-5 w-5" /> Export Data
          </Button>
          <Button onClick={handleImportClick} variant="outline" className="w-full transition-transform hover:scale-105 hover:bg-accent/20">
            <Upload className="mr-2 h-5 w-5" /> Import Data
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </CardContent>
      </Card>

      <Card className="border-destructive/50 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive"><AlertTriangle className="mr-2 h-5 w-5" />Danger Zone</CardTitle>
          <CardDescription>Proceed with caution. These actions are irreversible.</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto transition-transform hover:scale-105">
                <Trash2 className="mr-2 h-5 w-5" /> Reset All Application Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete all your transactions, budgets, custom categories, and reset all settings to their defaults.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={resetAllData} className="bg-destructive hover:bg-destructive/90">
                  Yes, reset everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
           <p className="text-xs text-muted-foreground mt-2">This includes transactions, budgets, custom categories, and all settings.</p>
        </CardContent>
      </Card>
    </div>
  );
}

    