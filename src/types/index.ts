
export interface Transaction {
  id: string;
  date: string; // ISO string format (e.g., "2023-10-26")
  description: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
}

export const CATEGORIES = [
  { name: "Salary", icon: "Briefcase" },
  { name: "Food", icon: "Utensils" },
  { name: "Transport", icon: "Car" },
  { name: "Shopping", icon: "ShoppingCart" },
  { name: "Utilities", icon: "Lightbulb" },
  { name: "Entertainment", icon: "Smile" },
  { name: "Healthcare", icon: "HeartPulse" },
  { name: "Housing", icon: "Home" },
  { name: "Education", icon: "BookOpen" },
  { name: "Gifts", icon: "Gift" },
  { name: "Other", icon: "Package" },
] as const;

export type CategoryName = typeof CATEGORIES[number]['name'];
