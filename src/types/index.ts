
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

// Color Palette Types
interface ColorSet {
  primary: string; // HSL string e.g., "200 90% 45%"
  accent: string;
}

export interface ColorPaletteDefinition {
  name: string; // User-facing name
  id: string;   // Identifier
  light: ColorSet;
  dark: ColorSet;
}

export const PREDEFINED_COLOR_PALETTES: ColorPaletteDefinition[] = [
  {
    name: "Cool Blue & Orange (Default)",
    id: "cool_blue_orange",
    light: { primary: "200 90% 45%", accent: "30 90% 55%" },
    dark: { primary: "200 80% 55%", accent: "30 80% 60%" },
  },
  {
    name: "Forest Green & Amber",
    id: "forest_green_amber",
    light: { primary: "120 39% 41%", accent: "35 100% 58%" },
    dark: { primary: "120 45% 55%", accent: "35 90% 65%" },
  },
  {
    name: "Royal Purple & Gold",
    id: "royal_purple_gold",
    light: { primary: "258 56% 57%", accent: "45 100% 51%" },
    dark: { primary: "258 60% 65%", accent: "45 90% 60%" },
  },
  {
    name: "Crimson Red & Slate Blue",
    id: "crimson_slate",
    light: { primary: "348 83% 47%", accent: "215 28% 47%" },
    dark: { primary: "348 75% 60%", accent: "215 35% 60%" },
  },
  {
    name: "Teal & Coral",
    id: "teal_coral",
    light: { primary: "175 72% 38%", accent: "16 100% 66%" },
    dark: { primary: "175 65% 50%", accent: "16 90% 70%" },
  },
];

    