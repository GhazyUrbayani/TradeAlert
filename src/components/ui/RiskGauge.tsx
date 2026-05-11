import React from 'react';
import { cn } from '../../lib/utils';

interface RiskGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ score, size = 'md', className }) => {
  const dimensions = {
    sm: 'w-32 h-16',
    md: 'w-48 h-24',
    lg: 'w-64 h-32',
  }[size];

  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const radius = 40;
  const circumference = Math.PI * radius; // Half circle
  const dashOffset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? '#ffb4ab' : score >= 40 ? '#ffb786' : '#4edea3';

  return (
    <div className={cn("relative flex flex-col items-center justify-center", dimensions, className)}>
      <svg className="w-full h-full drop-shadow-md" viewBox="0 0 100 50">
        <path
          d="M 10,50 A 40,40 0 0,1 90,50"
          fill="none"
          stroke="#1c2b3c"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
        />
        <path
          d="M 10,50 A 40,40 0 0,1 90,50"
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          style={{ 
            strokeDashoffset: dashOffset,
            transition: 'stroke-dashoffset 1.5s ease-out',
            filter: `drop-shadow(0 0 8px ${color}66)`
          }}
        />
      </svg>
      <div className="absolute bottom-0 left-0 w-full flex flex-col items-center justify-end h-full pb-2">
        <span className={cn(
          "font-bold leading-none text-on-surface",
          size === 'sm' ? 'text-xl' : size === 'md' ? 'text-4xl' : 'text-5xl'
        )}>
          {score.toFixed(0)}
        </span>
        <span className="font-label-caps text-label-caps tracking-widest mt-1 opacity-60">
          {score >= 70 ? 'CRITICAL' : score >= 40 ? 'WARNING' : 'SAFE'}
        </span>
      </div>
    </div>
  );
};
