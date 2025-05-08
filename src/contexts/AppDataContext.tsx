
'use client';
import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction, Budget, CategoryName } from '@/types';
import { useToast } from "@/hooks/use-toast";

interface AppDataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  editTransaction: (transaction: Transaction) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (budget: Omit<Budget, 'id'>) => void;
  editBudget: (budget: Budget) => void;
  deleteBudget: (id: string) => void;
  getCategorySpentAmount: (category: CategoryName) => number;
  totalIncome: number;
  totalExpenses: number;
  currentBalance: number;
  exportData: () => void;
  importData: (file: File) => void;
  isLoaded: boolean;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
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

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => [...prev, { ...transaction, id: crypto.randomUUID() }].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    toast({ title: "Transaction added", description: `${transaction.description} for $${transaction.amount.toFixed(2)}` });
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
  
  const getCategorySpentAmount = useCallback((category: CategoryName): number => {
    return transactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const currentBalance = totalIncome - totalExpenses;

  const exportData = useCallback(() => {
    const data = JSON.stringify({ transactions, budgets }, null, 2);
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
  }, [transactions, budgets, toast]);

  const importData = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.transactions && Array.isArray(data.transactions) && data.budgets && Array.isArray(data.budgets)) {
          setTransactions(data.transactions.sort((a:Transaction,b:Transaction) => new Date(b.date).getTime() - new Date(a.date).getTime()));
          setBudgets(data.budgets.sort((a:Budget,b:Budget) => a.category.localeCompare(b.category)));
          toast({ title: "Data Imported", description: "Your data has been successfully imported." });
        } else {
          toast({ title: "Import Error", description: "Invalid file format.", variant: "destructive" });
        }
      } catch (error) {
        toast({ title: "Import Error", description: "Failed to parse file.", variant: "destructive" });
      }
    };
    reader.readAsText(file);
  }, [toast]);


  // Render children only after data is loaded to prevent hydration issues if children depend on this data
  if (!isLoaded) {
    return null; 
  }

  return (
    <AppDataContext.Provider value={{ 
      transactions, budgets, 
      addTransaction, editTransaction, deleteTransaction,
      addBudget, editBudget, deleteBudget,
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
