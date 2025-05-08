
'use client';
import React from 'react';
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
import type { Budget, CategoryName } from '@/types';
import { CATEGORIES } from '@/types';
import { useAppData } from '@/contexts/AppDataContext';

const budgetFormSchema = z.object({
  category: z.enum(CATEGORIES.map(c => c.name) as [CategoryName, ...CategoryName[]], {
    required_error: "Category is required.",
  }),
  amount: z.coerce.number().positive("Amount must be positive."),
});

type BudgetFormValues = z.infer<typeof budgetFormSchema>;

interface BudgetFormProps {
  budget?: Budget;
  onClose?: () => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({ budget, onClose }) => {
  const { addBudget, editBudget } = useAppData();

  const form = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: budget || {
      amount: 0,
    },
  });

  const onSubmit = (data: BudgetFormValues) => {
    if (budget) {
      editBudget({ ...data, id: budget.id });
    } else {
      addBudget(data);
    }
    onClose?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!budget}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat.name} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Amount</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          {onClose && <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>}
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            {budget ? 'Save Changes' : 'Set Budget'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
