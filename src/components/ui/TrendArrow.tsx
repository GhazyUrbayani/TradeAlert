import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Trend } from '../../types';

interface TrendArrowProps {
  trend: Trend;
  className?: string;
}

export const TrendArrow: React.FC<TrendArrowProps> = ({ trend, className }) => {
  if (trend === 'up') return <TrendingUp className={cn("text-error", className)} size={20} />;
  if (trend === 'down') return <TrendingDown className={cn("text-secondary", className)} size={20} />;
  return <Minus className={cn("text-on-surface-variant", className)} size={20} />;
};
