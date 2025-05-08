
import React from 'react';
import { 
  Utensils, Car, ShoppingCart, Lightbulb, Smile, HeartPulse, 
  Briefcase, Package, Home, BookOpen, Gift, LucideProps, LucideIcon,
  DollarSign, BarChart, Banknote, Settings, Palette, ShieldCheck, HelpCircle, ArrowRightLeft
} from 'lucide-react';
import type { AppCategory } from '@/types';

// IconMap keys should match iconKey in AppCategory
export const AVAILABLE_ICONS: Record<string, LucideIcon> = {
  Briefcase,
  Utensils,
  Car,
  ShoppingCart,
  Lightbulb,
  Smile,
  HeartPulse,
  Home,
  BookOpen,
  Gift,
  Package, // Default/Other
  DollarSign,
  BarChart,
  Banknote,
  Settings,
  Palette,
  ShieldCheck,
  HelpCircle,
  ArrowRightLeft,
};

interface CategoryIconProps extends LucideProps {
  iconKey: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ iconKey, ...props }) => {
  const IconComponent = AVAILABLE_ICONS[iconKey] || Package; // Default to Package icon if key not found
  return <IconComponent {...props} />;
};

// Helper to get an AppCategory object by its name from a list of categories
export const getCategoryByName = (categories: AppCategory[], categoryName: string): AppCategory | undefined => {
  return categories.find(c => c.name === categoryName);
};
