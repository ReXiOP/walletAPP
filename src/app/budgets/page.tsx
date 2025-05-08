
'use client';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BudgetForm } from '@/components/forms/BudgetForm';
import { useAppData } from '@/contexts/AppDataContext';
import type { Budget } from '@/types';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { CategoryIcon, getCategoryByName } from '@/components/shared/CategoryIcon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function BudgetsPage() {
  const { budgets, deleteBudget, getCategorySpentAmount, isLoaded, appCategories } = useAppData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined);

  const handleAdd = () => {
    setEditingBudget(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingBudget(undefined);
  };

  const budgetsWithSpent = useMemo(() => {
    return budgets.map(budget => {
      const spent = getCategorySpentAmount(budget.category);
      const progress = budget.amount > 0 ? (Math.abs(spent) / budget.amount) * 100 : 0;
      const categoryDetails = getCategoryByName(appCategories, budget.category);
      return { ...budget, spent: Math.abs(spent), progress: Math.min(progress, 100), iconKey: categoryDetails?.iconKey || 'Package' }; // Cap progress at 100%
    }).sort((a, b) => a.category.localeCompare(b.category));
  }, [budgets, getCategorySpentAmount, appCategories]);

  if (!isLoaded) {
    return (
       <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <Skeleton className="h-6 w-24 mb-1" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
                 <div className="flex justify-end space-x-2 mt-4">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-primary">Budgets</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-5 w-5" /> Set New Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{editingBudget ? 'Edit Budget' : 'Set New Budget'}</DialogTitle>
            </DialogHeader>
            <BudgetForm budget={editingBudget} onClose={closeForm} />
          </DialogContent>
        </Dialog>
      </div>
      
      {budgetsWithSpent.length === 0 ? (
         <Card className="shadow-lg">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No budgets set yet. Click "Set New Budget" to start tracking your spending goals!</p>
            </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-15rem)] md:h-auto"> {/* Adjust height as needed */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {budgetsWithSpent.map((budget) => (
              <Card key={budget.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <CategoryIcon iconKey={budget.iconKey} className="h-6 w-6 text-primary" />
                        {budget.category}
                      </CardTitle>
                      <CardDescription>Target: ${budget.amount.toFixed(2)}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Progress value={budget.progress} className="w-full h-3 mb-2" 
                    indicatorClassName={
                        budget.progress > 90 ? 'bg-destructive' : 
                        budget.progress > 70 ? 'bg-yellow-500' : 
                        'bg-primary'
                    } 
                  />
                  <div className="text-sm text-muted-foreground">
                    Spent: <span className={`font-semibold ${budget.spent > budget.amount ? 'text-destructive' : 'text-foreground'}`}>${budget.spent.toFixed(2)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Remaining: <span className={`font-semibold ${budget.amount - budget.spent < 0 ? 'text-destructive' : 'text-foreground'}`}>
                      ${(budget.amount - budget.spent).toFixed(2)}
                      </span>
                  </div>
                </CardContent>
                <div className="flex justify-end space-x-1 p-4 border-t">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(budget)} className="text-primary hover:text-primary/80">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete this budget.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteBudget(budget.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
