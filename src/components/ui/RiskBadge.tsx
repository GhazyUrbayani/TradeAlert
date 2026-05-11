import React from 'react';
import { cn } from '../../lib/utils';
import { RiskLevel } from '../../types';

interface RiskBadgeProps {
  level: RiskLevel;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, className }) => {
  const colors = {
    Critical: 'text-error bg-error/10 border-error/20',
    Warning: 'text-tertiary bg-tertiary/10 border-tertiary/20',
    Safe: 'text-secondary bg-secondary/10 border-secondary/20',
  };

  return (
    <span className={cn(
      "font-label-caps text-label-caps px-2 py-0.5 rounded border uppercase tracking-wider",
      colors[level],
      className
    )}>
      {level}
    </span>
  );
};
