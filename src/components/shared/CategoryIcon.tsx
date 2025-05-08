
import React from 'react';
import { Utensils, Car, ShoppingCart, Lightbulb, Smile, HeartPulse, Briefcase, Package, Home, BookOpen, Gift, LucideProps, LucideIcon } from 'lucide-react';
import type { CategoryName, CATEGORIES } from '@/types';

const iconMap: Record<CategoryName, LucideIcon> = {
  "Salary": Briefcase,
  "Food": Utensils,
  "Transport": Car,
  "Shopping": ShoppingCart,
  "Utilities": Lightbulb,
  "Entertainment": Smile,
  "Healthcare": HeartPulse,
  "Housing": Home,
  "Education": BookOpen,
  "Gifts": Gift,
  "Other": Package,
};

interface CategoryIconProps extends LucideProps {
  category: CategoryName;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ category, ...props }) => {
  const IconComponent = iconMap[category] || Package; // Default to Package icon if not found
  return <IconComponent {...props} />;
};

export const getCategoryIconByName = (categoryName: CategoryName): LucideIcon => {
  return iconMap[categoryName] || Package;
}
