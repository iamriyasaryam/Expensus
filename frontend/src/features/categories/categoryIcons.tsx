import React from 'react';
import {
  ShoppingCart,
  Utensils,
  Home,
  Car,
  Tv,
  HeartPulse,
  Gift,
  Plane,
  Coffee,
  Briefcase,
  Book,
  Tag,
  Zap,
  Music,
  Shield,
  Smartphone,
  GraduationCap,
  Sparkles,
  LucideProps,
} from 'lucide-react';

export interface IconOption {
  id: string;
  name: string;
  icon: React.ComponentType<LucideProps>;
}

export const CATEGORY_ICONS: IconOption[] = [
  { id: 'shopping-cart', name: 'Shopping', icon: ShoppingCart },
  { id: 'utensils', name: 'Food & Dining', icon: Utensils },
  { id: 'coffee', name: 'Coffee & Drinks', icon: Coffee },
  { id: 'home', name: 'Housing & Rent', icon: Home },
  { id: 'car', name: 'Transport & Auto', icon: Car },
  { id: 'plane', name: 'Travel & Flights', icon: Plane },
  { id: 'tv', name: 'Entertainment', icon: Tv },
  { id: 'music', name: 'Music & Audio', icon: Music },
  { id: 'heart-pulse', name: 'Health & Medical', icon: HeartPulse },
  { id: 'gift', name: 'Gifts & Charity', icon: Gift },
  { id: 'briefcase', name: 'Work & Business', icon: Briefcase },
  { id: 'graduation-cap', name: 'Education', icon: GraduationCap },
  { id: 'book', name: 'Books & Learning', icon: Book },
  { id: 'zap', name: 'Utilities & Bills', icon: Zap },
  { id: 'smartphone', name: 'Tech & Telecom', icon: Smartphone },
  { id: 'shield', name: 'Insurance & Taxes', icon: Shield },
  { id: 'sparkles', name: 'Personal Care', icon: Sparkles },
  { id: 'tag', name: 'General', icon: Tag },
];

export const CATEGORY_COLORS = [
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#EF4444', name: 'Red' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#F59E0B', name: 'Amber' },
  { hex: '#14B8A6', name: 'Teal' },
  { hex: '#64748B', name: 'Slate' },
];

export const CategoryIcon: React.FC<{
  iconName?: string | null;
  className?: string;
  size?: number;
}> = ({ iconName, className = 'w-4 h-4', size }) => {
  const option = CATEGORY_ICONS.find((i) => i.id === iconName);
  const IconComponent = option ? option.icon : Tag;
  return <IconComponent className={className} size={size} />;
};
