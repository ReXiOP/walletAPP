
export interface Transaction {
  id: string;
  date: string; // ISO string format (e.g., "2023-10-26")
  description: string;
  amount: number;
  category: string; // Changed from CategoryName to string
  type: 'income' | 'expense';
}

export interface Budget {
  id: string;
  category: string; // Changed from CategoryName to string
  amount: number;
}

export interface AppCategory {
  id: string;
  name: string;
  iconKey: string; // Key for the iconMap in CategoryIcon.tsx
  isUserDefined?: boolean;
}

// Represents the original set of categories, now used for defaults.
export const DEFAULT_CATEGORIES_DATA: Omit<AppCategory, 'id' | 'isUserDefined'>[] = [
  { name: "Salary", iconKey: "Briefcase" },
  { name: "Food", iconKey: "Utensils" },
  { name: "Transport", iconKey: "Car" },
  { name: "Shopping", iconKey: "ShoppingCart" },
  { name: "Utilities", iconKey: "Lightbulb" },
  { name: "Entertainment", iconKey: "Smile" },
  { name: "Healthcare", iconKey: "HeartPulse" },
  { name: "Housing", iconKey: "Home" },
  { name: "Education", iconKey: "BookOpen" },
  { name: "Gifts", iconKey: "Gift" },
  { name: "Other", iconKey: "Package" },
] as const;

// CategoryName is now just a string, as categories can be user-defined.
export type CategoryName = string;

// This constant is kept for convenience if direct access to default names is needed, but AppContext will manage the live list.
export const DEFAULT_CATEGORY_NAMES = DEFAULT_CATEGORIES_DATA.map(c => c.name);

