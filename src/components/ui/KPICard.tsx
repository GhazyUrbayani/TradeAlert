import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  delta?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'error' | 'secondary' | 'tertiary';
  sparkline?: React.ReactNode;
  className?: string;
}

export const KPICard: React.FC<KPICardProps> = ({ 
  label, 
  value, 
  delta, 
  icon: Icon, 
  variant = 'primary', 
  sparkline,
  className 
}) => {
  const variantColors = {
    primary: 'text-primary border-primary/20 hover:border-primary/50',
    error: 'text-error border-error/20 hover:border-error/50',
    secondary: 'text-secondary border-secondary/20 hover:border-secondary/50',
    tertiary: 'text-tertiary border-tertiary/20 hover:border-tertiary/50',
  };

  return (
    <div className={cn(
      "bg-surface-container border rounded-lg p-5 flex flex-col justify-between h-32 relative overflow-hidden group transition-colors",
      variantColors[variant],
      className
    )}>
      <div className="flex justify-between items-start z-10">
        <span className="font-body-sm text-body-sm text-on-surface-variant">{label}</span>
        <Icon className={cn("text-xl opacity-80", variantColors[variant].split(' ')[0])} size={20} />
      </div>
      <div className="flex items-end gap-3 z-10">
        <span className="font-display-lg text-display-lg text-on-surface">{value}</span>
        {delta && (
          <span className={cn(
            "font-body-sm text-body-sm flex items-center mb-1",
            delta.includes('+') ? 'text-error' : 'text-secondary'
          )}>
            {delta}
          </span>
        )}
      </div>
      {sparkline && (
        <div className="absolute bottom-0 left-0 w-full h-1/3 opacity-20 pointer-events-none flex items-end">
          {sparkline}
        </div>
      )}
    </div>
  );
};
