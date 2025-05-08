
'use client';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { useAppData } from '@/contexts/AppDataContext';
import type { Transaction } from '@/types';
import { PlusCircle, MinusCircle, Edit, Trash2, ArrowUpDown, Filter } from 'lucide-react';
import { CategoryIcon, getCategoryByName } from '@/components/shared/CategoryIcon';
import { parseISO } from 'date-fns'; // format is now handled by context
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Card, CardContent } from '@/components/ui/card';

export default function TransactionsPage() {
  const { transactions, deleteTransaction, isLoaded, appCategories, formatCurrency, formatDisplayDate } = useAppData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
  const [formInitialType, setFormInitialType] = useState<'income' | 'expense'>('expense');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Transaction | null; direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
  const [categoryFilter, setCategoryFilter] = useState<Set<string>>(new Set());

  const openForm = (type: 'income' | 'expense', transaction?: Transaction) => {
    setEditingTransaction(transaction);
    setFormInitialType(type);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTransaction(undefined);
  };
  
  const requestSort = (key: keyof Transaction) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const toggleCategoryFilter = (categoryName: string) => {
    setCategoryFilter(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
  };

  const filteredAndSortedTransactions = useMemo(() => {
    let sortableItems = [...transactions];

    if (searchTerm) {
      sortableItems = sortableItems.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter.size > 0) {
      sortableItems = sortableItems.filter(transaction => categoryFilter.has(transaction.category));
    }

    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (sortConfig.key === 'date') {
          comparison = new Date(valA as string).getTime() - new Date(valB as string).getTime();
        } else {
          comparison = (valA as string).localeCompare(valB as string);
        }
        
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [transactions, searchTerm, sortConfig, categoryFilter]);

  const getSortIndicator = (key: keyof Transaction) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? '🔼' : '🔽';
    }
    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50 group-hover:opacity-100" />;
  };

  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  {[...Array(5)].map((_, i) => <TableHead key={i}><Skeleton className="h-5 w-full" /></TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(5)].map((_, j) => <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>)}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-3xl font-bold text-primary">Transactions</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? 'Edit Transaction' : (formInitialType === 'income' ? 'Add New Income' : 'Add New Expense')}</DialogTitle>
            </DialogHeader>
            <TransactionForm transaction={editingTransaction} initialType={formInitialType} onClose={closeForm} />
          </DialogContent>
        </Dialog>
        <div className="flex gap-2">
          <Button onClick={() => openForm('income')} className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg transition-shadow">
            <PlusCircle className="mr-2 h-5 w-5" /> Add Income
          </Button>
          <Button onClick={() => openForm('expense')} className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-shadow">
            <MinusCircle className="mr-2 h-5 w-5" /> Add Expense
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <Input
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm shadow-sm focus:shadow-md transition-shadow"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto shadow-sm hover:shadow-md transition-shadow">
              <Filter className="mr-2 h-4 w-4" /> Filter by Category
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="shadow-lg">
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="h-[200px]">
              {appCategories.map(category => (
                <DropdownMenuCheckboxItem
                  key={category.id}
                  checked={categoryFilter.has(category.name)}
                  onCheckedChange={() => toggleCategoryFilter(category.name)}
                >
                  {category.name}
                </DropdownMenuCheckboxItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {filteredAndSortedTransactions.length === 0 && !searchTerm && categoryFilter.size === 0 ? (
         <Card className="shadow-lg">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No transactions recorded yet. Click "Add Income" or "Add Expense" to get started!</p>
            </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg overflow-hidden">
          <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-24rem)] md:h-auto"> 
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="group cursor-pointer hover:bg-muted/50 p-3" onClick={() => requestSort('date')}>Date {getSortIndicator('date')}</TableHead>
                  <TableHead className="group cursor-pointer hover:bg-muted/50 p-3" onClick={() => requestSort('description')}>Description {getSortIndicator('description')}</TableHead>
                  <TableHead className="text-right group cursor-pointer hover:bg-muted/50 p-3" onClick={() => requestSort('amount')}>Amount {getSortIndicator('amount')}</TableHead>
                  <TableHead className="group cursor-pointer hover:bg-muted/50 p-3" onClick={() => requestSort('category')}>Category {getSortIndicator('category')}</TableHead>
                  <TableHead className="text-center p-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTransactions.map((transaction) => {
                  const categoryDetails = getCategoryByName(appCategories, transaction.category);
                  const iconKey = categoryDetails?.iconKey || 'Package';
                  return (
                    <TableRow key={transaction.id} className="hover:bg-muted/20 transition-colors duration-150">
                      <TableCell className="p-3">{formatDisplayDate(transaction.date)}</TableCell>
                      <TableCell className="font-medium p-3">{transaction.description}</TableCell>
                      <TableCell className={`text-right font-semibold p-3 ${transaction.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                      </TableCell>
                      <TableCell className="p-3">
                        <div className="flex items-center gap-2">
                          <CategoryIcon iconKey={iconKey} className="h-5 w-5 text-muted-foreground" />
                          {transaction.category}
                        </div>
                      </TableCell>
                      <TableCell className="text-center p-3">
                        <Button variant="ghost" size="icon" onClick={() => openForm(transaction.type, transaction)} className="text-primary hover:text-primary/80 transition-colors">
                          <Edit className="h-4 w-4" />
                        </Button>
                         <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this transaction.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteTransaction(transaction.id)} className="bg-destructive hover:bg-destructive/90">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
                 {filteredAndSortedTransactions.length === 0 && (searchTerm || categoryFilter.size > 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground p-4">
                      No transactions match your current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
