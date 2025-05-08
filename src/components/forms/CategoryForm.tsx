
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
import { useAppData } from '@/contexts/AppDataContext';
import { AVAILABLE_ICONS, CategoryIcon } from '@/components/shared/CategoryIcon'; // Assuming CategoryIcon exports AVAILABLE_ICONS
import { ScrollArea } from '../ui/scroll-area';

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required.").max(50, "Category name is too long."),
  iconKey: z.string().min(1, "Icon is required."),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  onClose?: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ onClose }) => {
  const { addAppCategory } = useAppData();
  const iconKeys = Object.keys(AVAILABLE_ICONS);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: '',
      iconKey: iconKeys.length > 0 ? iconKeys[0] : '',
    },
  });

  const onSubmit = (data: CategoryFormValues) => {
    addAppCategory(data.name, data.iconKey);
    onClose?.();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-1">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Investments" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iconKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      {field.value && <CategoryIcon iconKey={field.value} className="h-5 w-5" />}
                      <SelectValue placeholder="Select an icon" />
                    </div>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <ScrollArea className="h-[200px]">
                    {iconKeys.map(iconKey => (
                      <SelectItem key={iconKey} value={iconKey}>
                        <div className="flex items-center gap-2">
                          <CategoryIcon iconKey={iconKey} className="h-5 w-5" />
                          {iconKey}
                        </div>
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
            Add Category
          </Button>
        </div>
      </form>
    </Form>
  );
};
