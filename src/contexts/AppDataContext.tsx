
'use client';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction, Budget, AppCategory } from '@/types';
import { DEFAULT_CATEGORIES_DATA } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface AppDataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  appCategories: AppCategory[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  editBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  addAppCategory: (name: string, iconKey: string) => void;
  deleteAppCategory: (id: string) => void; // Only for user-defined categories
  getCategorySpentAmount: (categoryName: string) => number;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  exportData: () => void;
  importData: (file: File) => void;
  isLoaded: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const getDefaultAppCategories = (): AppCategory[] => {
  return DEFAULT_CATEGORIES_DATA.map(cat => ({
    ...cat,
    id: crypto.randomUUID(),
    isUserDefined: false,
  }));
};

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [appCategories, setAppCategories] = useState<AppCategory[]>(getDefaultAppCategories());
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedTransactions = localStorage.getItem('budgetzen-transactions');
    if (storedTransactions) {
      setTransactions(JSON.parse(storedTransactions));
    }
    const storedBudgets = localStorage.getItem('budgetzen-budgets');
    if (storedBudgets) {
      setBudgets(JSON.parse(storedBudgets));
    }
    const storedAppCategories = localStorage.getItem('budgetzen-appCategories');
    if (storedAppCategories) {
      const parsedCategories: AppCategory[] = JSON.parse(storedAppCategories);
      // Ensure default categories are present if not in stored data or if structure changed
      const defaultCategoryNames = new Set(DEFAULT_CATEGORIES_DATA.map(dc => dc.name));
      const storedUserCategories = parsedCategories.filter(pc => pc.isUserDefined);
      const currentDefaults = getDefaultAppCategories();
      const finalCategories = [...currentDefaults.filter(dc => !parsedCategories.find(pc => pc.name === dc.name && !pc.isUserDefined)), ...parsedCategories.filter(pc => defaultCategoryNames.has(pc.name) && !pc.isUserDefined), ...storedUserCategories];
      setAppCategories(finalCategories.sort((a,b) => a.name.localeCompare(b.name)));
    } else {
      setAppCategories(getDefaultAppCategories().sort((a,b) => a.name.localeCompare(b.name)));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('budgetzen-transactions', JSON.stringify(transactions));
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('budgetzen-budgets', JSON.stringify(budgets));
    }
  }, [budgets, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('budgetzen-appCategories', JSON.stringify(appCategories));
    }
  }, [appCategories, isLoaded]);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: crypto.randomUUID() }].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    toast({ title: "Transaction added", description: `${transaction.description} for $${Math.abs(transaction.amount).toFixed(2)}` });
  }, [toast]);

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
    toast({ title: "Budget added", description: `Budget for ${budget.category} set to $${budget.amount.toFixed(2)}` });
  }, [budgets, toast]);

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
      .reduce((sum, t) => sum + Math.abs(t.amount), 0); // Ensure using absolute amount for expenses
  }, [transactions]);

  const addAppCategory = useCallback((name: string, iconKey: string) => {
    if (appCategories.some(cat => cat.name.toLowerCase() === name.toLowerCase())) {
      toast({ title: "Error", description: `Category "${name}" already exists.`, variant: "destructive" });
      return;
    }
    const newCategory: AppCategory = { id: crypto.randomUUID(), name, iconKey, isUserDefined: true };
    setAppCategories(prev => [...prev, newCategory].sort((a,b) => a.name.localeCompare(b.name)));
    toast({ title: "Category added", description: `Category "${name}" created.` });
  }, [appCategories, toast]);

  const deleteAppCategory = useCallback((id: string) => {
    const categoryToDelete = appCategories.find(cat => cat.id === id);
    if (!categoryToDelete || !categoryToDelete.isUserDefined) {
      toast({ title: "Error", description: "Cannot delete default categories.", variant: "destructive" });
      return;
    }
    // Check if category is in use by transactions or budgets
    if (transactions.some(t => t.category === categoryToDelete.name) || budgets.some(b => b.category === categoryToDelete.name)) {
        toast({ title: "Error", description: `Category "${categoryToDelete.name}" is in use and cannot be deleted.`, variant: "destructive" });
        return;
    }
    setAppCategories(prev => prev.filter(cat => cat.id !== id));
    toast({ title: "Category deleted", description: `Category "${categoryToDelete.name}" removed.` });
  }, [appCategories, transactions, budgets, toast]);


  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0); // Expenses are negative
  const currentBalance = totalIncome + totalExpenses; // Since expenses are negative, this becomes income - abs(expenses)

  const exportData = useCallback(() => {
    const data = JSON.stringify({ transactions, budgets, appCategories }, null, 2);
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
  }, [transactions, budgets, appCategories, toast]);

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions && Array.isArray(data.transactions)) {
          setTransactions(data.transactions.sort((a:Transaction,b:Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } else {
          setTransactions([]); // Clear if not present or invalid
        }
        if (data.budgets && Array.isArray(data.budgets)) {
          setBudgets(data.budgets.sort((a:Budget,b:Budget) => a.category.localeCompare(b.category)));
        } else {
          setBudgets([]); // Clear
        }
        if (data.appCategories && Array.isArray(data.appCategories)) {
           const importedCategories: AppCategory[] = data.appCategories;
           // Merge with defaults: ensure defaults are preserved, user-defined are added/updated
            const defaultCats = getDefaultAppCategories();
            const userDefinedImported = importedCategories.filter(ic => ic.isUserDefined);
            const baseCategories = defaultCats.map(dc => {
                const foundImportedDefault = importedCategories.find(ic => ic.name === dc.name && !ic.isUserDefined);
                return foundImportedDefault || dc;
            });
            const finalCategories = [...baseCategories, ...userDefinedImported.filter(udc => !baseCategories.find(bc => bc.name === udc.name))];
            setAppCategories(finalCategories.sort((a,b) => a.name.localeCompare(b.name)));
        } else {
           setAppCategories(getDefaultAppCategories().sort((a,b) => a.name.localeCompare(b.name)));
        }
        toast({ title: "Data Imported", description: "Your data has been successfully imported." });
      } catch (error) {
        toast({ title: "Import Error", description: "Failed to parse file or invalid format.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  }, [toast]);

  if (!isLoaded) {
    return null; 
  }

  return (
    <AppDataContext.Provider value={{ 
      transactions, budgets, appCategories,
      addTransaction, editTransaction, deleteTransaction,
      addBudget, editBudget, deleteBudget,
      addAppCategory, deleteAppCategory,
      getCategorySpentAmount,
      totalIncome, totalExpenses, currentBalance,
      exportData, importData,
      isLoaded
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
