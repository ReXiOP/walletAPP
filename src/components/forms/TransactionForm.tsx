
'use client';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Transaction } from '@/types';
import { useAppData } from '@/contexts/AppDataContext';
import { ScrollArea } from '../ui/scroll-area';

const transactionFormSchema = z.object({
  date: z.date({
    required_error: "A date is required.",
  }),
  description: z.string().min(1, "Description is required.").max(100, "Description is too long."),
  amount: z.coerce.number().positive("Amount must be positive."),
  category: z.string().min(1, "Category is required."), // Now a string
  type: z.enum(['income', 'expense'], {
    required_error: "Type is required.",
  }),
});

type TransactionFormValues = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
  transaction?: Transaction;
  initialType?: 'income' | 'expense';
  onClose?: () => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, initialType, onClose }) => {
  const { addTransaction, editTransaction, appCategories } = useAppData();

  const defaultCategory = appCategories.find(c => c.name === 'Other')?.name || (appCategories.length > 0 ? appCategories[0].name : '');

  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: transaction 
      ? { 
          ...transaction, 
          date: new Date(transaction.date),
          amount: Math.abs(transaction.amount) 
        } 
      : {
          date: new Date(),
          description: '',
          amount: 0,
          type: initialType || 'expense',
          category: initialType === 'income' 
            ? (appCategories.find(c => c.name === 'Salary')?.name || defaultCategory)
            : (appCategories.find(c => c.name === 'Food')?.name || defaultCategory),
        },
  });

  useEffect(() => {
    if (!transaction && initialType) {
      const categoryForType = initialType === 'income' 
        ? (appCategories.find(c => c.name === 'Salary')?.name || defaultCategory)
        : (appCategories.find(c => c.name === 'Food')?.name || defaultCategory);
      form.reset({
        date: new Date(),
        description: '',
        amount: 0,
        type: initialType,
        category: categoryForType,
      });
    }
  }, [initialType, transaction, form, appCategories, defaultCategory]);

  const onSubmit = (data: TransactionFormValues) => {
    const finalAmount = data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount);
    
    const transactionData = {
      ...data,
      date: format(data.date, 'yyyy-MM-dd'), // Store date as YYYY-MM-DD string
      amount: finalAmount
    };

    if (transaction) {
      editTransaction({ ...transactionData, id: transaction.id });
    } else {
      addTransaction(transactionData);
    }
    onClose?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Groceries, Salary" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} step="0.01" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                  {appCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          {onClose && <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {transaction ? 'Save Changes' : 'Add Transaction'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
