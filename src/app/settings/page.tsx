'use client';
import React from 'react';
import { useCustomTheme } from '@/contexts/ThemeContext';
import { useAppData } from '@/contexts/AppDataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Download, Upload, Moon, Sun, Laptop } from 'lucide-react';

export default function SettingsPage() {
  const { themeSetting, setThemeSetting } = useCustomTheme();
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
    <div className="space-y-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-primary">Settings</h1>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={themeSetting}
            onValueChange={(value) => setThemeSetting(value as 'light' | 'dark' | 'system')}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              { value: 'light', label: 'Light', icon: Sun },
              { value: 'dark', label: 'Dark', icon: Moon },
              { value: 'system', label: 'System', icon: Laptop },
            ].map(item => (
              <Label
                key={item.value}
                htmlFor={`theme-${item.value}`}
                className={`flex flex-col items-center justify-center rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer
                  ${themeSetting === item.value ? 'border-primary bg-accent text-accent-foreground' : 'border-muted'}`}
              >
                <RadioGroupItem value={item.value} id={`theme-${item.value}`} className="sr-only" />
                <item.icon className="mb-2 h-6 w-6" />
                {item.label}
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export your financial data or import existing data.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-4">
          <Button onClick={exportData} className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
            <Download className="mr-2 h-5 w-5" /> Export Data
          </Button>
          <Button onClick={handleImportClick} variant="outline" className="w-full sm:w-auto">
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
    </div>
  );
}
