import React from 'react';
import { cn } from '../../lib/utils';

interface SubScoreBarProps {
  label: string;
  score: number;
  icon: React.ReactNode;
  variant?: 'error' | 'tertiary' | 'secondary';
  className?: string;
}

export const SubScoreBar: React.FC<SubScoreBarProps> = ({ label, score, icon, variant = 'error', className }) => {
  const variantColors = {
    error: 'bg-error text-error',
    tertiary: 'bg-tertiary text-tertiary',
    secondary: 'bg-secondary text-secondary',
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-end mb-2">
        <span className="font-body-sm text-body-sm text-on-surface flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className={cn("font-mono-data text-mono-data", variantColors[variant].split(' ')[1])}>
          {score.toFixed(0)}%
        </span>
      </div>
      <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
        <div 
          className={cn("h-full rounded-full transition-all duration-500", variantColors[variant].split(' ')[0])} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
};
