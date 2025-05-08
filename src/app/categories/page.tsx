
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CategoryForm } from '@/components/forms/CategoryForm';
import { useAppData } from '@/contexts/AppDataContext';
import type { AppCategory } from '@/types';
import { PlusCircle, Trash2 } from 'lucide-react';
import { CategoryIcon } from '@/components/shared/CategoryIcon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoriesPage() {
  const { appCategories, deleteAppCategory, isLoaded } = useAppData();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleAdd = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  if (!isLoaded) {
    return (
       <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="shadow-lg">
              <CardHeader className="items-center p-4">
                <Skeleton className="h-10 w-10 rounded-full mb-2" />
                <Skeleton className="h-5 w-20" />
              </CardHeader>
              <CardContent className="p-4 border-t flex justify-center">
                 <Skeleton className="h-8 w-8" />
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
        <h2 className="text-3xl font-bold text-primary">Manage Categories</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm onClose={closeForm} />
          </DialogContent>
        </Dialog>
      </div>
      
      {appCategories.length === 0 ? (
         <Card className="shadow-lg">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No categories found. Click "Add New Category" to create your first one!</p>
            </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[calc(100vh-15rem)] md:h-auto">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {appCategories.map((category) => (
              <Card key={category.id} className="shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col text-center">
                <CardHeader className="items-center p-4 flex-grow">
                  <CategoryIcon iconKey={category.iconKey} className="h-10 w-10 text-primary mb-2" />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </CardHeader>
                {category.isUserDefined && (
                  <CardContent className="p-2 border-t flex justify-center">
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
                            This action cannot be undone. This will permanently delete the category "{category.name}".
                            You can only delete categories that are not currently used in any transactions or budgets.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteAppCategory(category.id)} className="bg-destructive hover:bg-destructive/90">
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                )}
                 {!category.isUserDefined && (
                     <CardContent className="p-2 border-t flex justify-center h-[40px]">
                        <span className="text-xs text-muted-foreground italic">Default</span>
                    </CardContent>
                 )}
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
