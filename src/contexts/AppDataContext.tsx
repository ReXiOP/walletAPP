
'use client';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction, Budget, AppCategory } from '@/types';
import { DEFAULT_CATEGORIES_DATA, PREDEFINED_COLOR_PALETTES } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';

interface AppSettings {
  currency: string;
  dateFormat: string;
  colorPalette: string; // ID of the ColorPaletteDefinition
}

interface AppDataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  appCategories: AppCategory[];
  settings: AppSettings;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  editBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  addAppCategory: (name: string, iconKey: string) => AppCategory | undefined;
  deleteAppCategory: (id: string) => void;
  getCategorySpentAmount: (categoryName: string) => number;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  exportData: () => void;
  importData: (file: File) => void;
  isLoaded: boolean;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetAllData: () => void;
  formatCurrency: (amount: number) => string;
  formatDisplayDate: (dateString: string) => string;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const getDefaultAppCategories = (): AppCategory[] => {
  return DEFAULT_CATEGORIES_DATA.map(cat => ({
    ...cat,
    id: crypto.randomUUID(),
    isUserDefined: false,
  })).sort((a,b) => a.name.localeCompare(b.name));
};

const defaultSettings: AppSettings = {
  currency: 'USD',
  dateFormat: 'MMM dd, yyyy',
  colorPalette: PREDEFINED_COLOR_PALETTES[0].id, // Default to the first predefined palette
};

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [appCategories, setAppCategories] = useState<AppCategory[]>(getDefaultAppCategories());
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedTransactions = localStorage.getItem('budgetzen-transactions');
    if (storedTransactions) setTransactions(JSON.parse(storedTransactions));
    
    const storedBudgets = localStorage.getItem('budgetzen-budgets');
    if (storedBudgets) setBudgets(JSON.parse(storedBudgets));
    
    const storedSettings = localStorage.getItem('budgetzen-settings');
    if (storedSettings) {
      const parsedSettings = JSON.parse(storedSettings);
      // Ensure all default keys are present, merge with stored values
      setSettings(prev => ({ ...defaultSettings, ...prev, ...parsedSettings }));
    } else {
      setSettings(defaultSettings);
    }

    const storedAppCategories = localStorage.getItem('budgetzen-appCategories');
    if (storedAppCategories) {
      const parsedCategories: AppCategory[] = JSON.parse(storedAppCategories);
      const defaultCategoryNames = new Set(DEFAULT_CATEGORIES_DATA.map(dc => dc.name));
      const storedUserCategories = parsedCategories.filter(pc => pc.isUserDefined);
      const currentDefaults = getDefaultAppCategories(); // These will have fresh UUIDs if needed
      
      let finalCategories = [...currentDefaults];
      parsedCategories.forEach(pc => {
        if (!pc.isUserDefined && defaultCategoryNames.has(pc.name)) {
          const index = finalCategories.findIndex(fc => fc.name === pc.name && !fc.isUserDefined);
          if (index !== -1) finalCategories[index] = pc;
          else finalCategories.push(pc);
        }
      });
      finalCategories = [...finalCategories.filter(fc => !fc.isUserDefined), ...storedUserCategories];
      const uniqueCategories = Array.from(new Map(finalCategories.map(cat => [cat.name, cat])).values());
      setAppCategories(uniqueCategories.sort((a, b) => a.name.localeCompare(b.name)));

    } else {
      setAppCategories(getDefaultAppCategories());
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => { if (isLoaded) localStorage.setItem('budgetzen-transactions', JSON.stringify(transactions)); }, [transactions, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('budgetzen-budgets', JSON.stringify(budgets)); }, [budgets, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('budgetzen-appCategories', JSON.stringify(appCategories)); }, [appCategories, isLoaded]);
  useEffect(() => { if (isLoaded) localStorage.setItem('budgetzen-settings', JSON.stringify(settings)); }, [settings, isLoaded]);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    toast({ title: "Settings Updated" });
  }, [toast]);

  const formatCurrency = useCallback((amount: number) => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: settings.currency }).format(amount);
    } catch (e) {
      return `${settings.currency} ${amount.toFixed(2)}`;
    }
  }, [settings.currency]);

  const formatDisplayDate = useCallback((dateString: string) => {
    try {
      return format(parseISO(dateString), settings.dateFormat);
    } catch (e) {
      return dateString; 
    }
  }, [settings.dateFormat]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: crypto.randomUUID() }].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    toast({ title: "Transaction added", description: `${transaction.description} for ${formatCurrency(Math.abs(transaction.amount))}` });
  }, [toast, formatCurrency]);

  const editTransaction = useCallback((updatedTransaction: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    toast({ title: "Transaction updated" });
  }, [toast]);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    toast({ title: "Transaction deleted" });
  }, [toast]);

  const addBudget = useCallback((budget: Omit<Budget, 'id'>) => {
    if (budgets.some(b => b.category === budget.category)) {
      toast({ title: "Error", description: `Budget for ${budget.category} already exists. Edit existing budget.`, variant: "destructive" });
      return;
    }
    setBudgets(prev => [...prev, { ...budget, id: crypto.randomUUID() }].sort((a,b) => a.category.localeCompare(b.category)));
    toast({ title: "Budget added", description: `Budget for ${budget.category} set to ${formatCurrency(budget.amount)}` });
  }, [budgets, toast, formatCurrency]);

  const editBudget = useCallback((updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b).sort((a,b) => a.category.localeCompare(b.category)));
    toast({ title: "Budget updated" });
  }, [toast]);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
    toast({ title: "Budget deleted" });
  }, [toast]);
  
  const getCategorySpentAmount = useCallback((categoryName: string): number => {
    return transactions
      .filter(t => t.category === categoryName && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions]);

  const addAppCategory = useCallback((name: string, iconKey: string): AppCategory | undefined => {
    if (appCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: "Error", description: `Category "${name}" already exists.`, variant: "destructive" });
      return undefined;
    }
    const newCategory: AppCategory = { id: crypto.randomUUID(), name, iconKey, isUserDefined: true };
    setAppCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: "Category added", description: `Category "${name}" created.` });
    return newCategory;
  }, [appCategories, toast]);

  const deleteAppCategory = useCallback((id: string) => {
    const categoryToDelete = appCategories.find(cat => cat.id === id);
    if (!categoryToDelete || !categoryToDelete.isUserDefined) {
      toast({ title: "Error", description: "Cannot delete default categories.", variant: "destructive" });
      return;
    }
    if (transactions.some(t => t.category === categoryToDelete.name) || budgets.some(b => b.category === categoryToDelete.name)) {
        toast({ title: "Error", description: `Category "${categoryToDelete.name}" is in use and cannot be deleted.`, variant: "destructive" });
        return;
    }
    setAppCategories(prev => prev.filter(cat => cat.id !== id));
    toast({ title: "Category deleted", description: `Category "${categoryToDelete.name}" removed.` });
  }, [appCategories, transactions, budgets, toast]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalIncome + totalExpenses;

  const exportData = useCallback(() => {
    const data = JSON.stringify({ transactions, budgets, appCategories, settings }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budgetzen_data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Data Exported", description: "Your data has been downloaded." });
  }, [transactions, budgets, appCategories, settings, toast]);

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setTransactions(data.transactions && Array.isArray(data.transactions) ? data.transactions.sort((a:Transaction,b:Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []);
        setBudgets(data.budgets && Array.isArray(data.budgets) ? data.budgets.sort((a:Budget,b:Budget) => a.category.localeCompare(b.category)) : []);
        
        const importedSettings = data.settings || {};
        // Ensure all default keys are present when merging imported settings
        setSettings(prev => ({...defaultSettings, ...prev, ...importedSettings}));
        
        if (data.appCategories && Array.isArray(data.appCategories)) {
           const importedCategories: AppCategory[] = data.appCategories;
            const defaultCats = getDefaultAppCategories(); 
            const userDefinedImported = importedCategories.filter(ic => ic.isUserDefined);
            
            let finalCategories = [...defaultCats];

            importedCategories.forEach(importedCat => {
                if (!importedCat.isUserDefined) {
                    const existingDefaultIndex = finalCategories.findIndex(dc => dc.name === importedCat.name && !dc.isUserDefined);
                    if (existingDefaultIndex !== -1) {
                        finalCategories[existingDefaultIndex] = { ...defaultCats.find(dc => dc.name === importedCat.name)!, ...importedCat }; 
                    } else {
                        finalCategories.push(importedCat);
                    }
                }
            });
            
            const userCategoriesToAdd = userDefinedImported.filter(udc => !finalCategories.some(fc => fc.name === udc.name));
            finalCategories = [...finalCategories, ...userCategoriesToAdd];
            
            const categoryMap = new Map<string, AppCategory>();
            finalCategories.forEach(cat => {
                const existing = categoryMap.get(cat.name);
                if (!existing || (cat.isUserDefined && !existing.isUserDefined) || (importedCategories.some(ic => ic.id === cat.id) && !defaultCats.some(dc => dc.id === existing.id) )) {
                    categoryMap.set(cat.name, cat);
                }
            });

            setAppCategories(Array.from(categoryMap.values()).sort((a,b) => a.name.localeCompare(b.name)));
        } else {
           setAppCategories(getDefaultAppCategories());
        }
        toast({ title: "Data Imported", description: "Your data has been successfully imported." });
      } catch (error) {
        console.error("Import error:", error);
        toast({ title: "Import Error", description: "Failed to parse file or invalid format.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  }, [toast]);

  const resetAllData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setAppCategories(getDefaultAppCategories());
    setSettings(defaultSettings); 
    toast({ title: "Application Reset", description: "All your data has been reset." });
  }, [toast]);


  if (!isLoaded) {
    return null; 
  }

  return (
    <AppDataContext.Provider value={{ 
      transactions, budgets, appCategories, settings,
      addTransaction, editTransaction, deleteTransaction,
      addBudget, editBudget, deleteBudget,
      addAppCategory, deleteAppCategory,
      getCategorySpentAmount,
      totalIncome, totalExpenses, currentBalance,
      exportData, importData,
      isLoaded, updateSettings, resetAllData,
      formatCurrency, formatDisplayDate
    }}>
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
};

    