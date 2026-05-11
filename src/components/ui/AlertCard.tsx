import React from 'react';
import { AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { Alert } from '../../types';
import { cn } from '../../lib/utils';

interface AlertCardProps {
  alert: Alert;
  onAnalyze?: (id: string) => void;
  className?: string;
}

export const AlertCard: React.FC<AlertCardProps> = ({ alert, onAnalyze, className }) => {
  const severityColors = {
    Critical: 'border-error text-error bg-error/10',
    High: 'border-error text-error bg-error/10',
    Medium: 'border-tertiary text-tertiary bg-tertiary/10',
    Low: 'border-secondary text-secondary bg-secondary/10',
  };

  const borderLeft = {
    Critical: 'bg-error',
    High: 'bg-error',
    Medium: 'bg-tertiary',
    Low: 'bg-secondary',
  }[alert.severity];

  return (
    <div className={cn(
      "bg-surface-container border border-outline-variant rounded-lg p-4 relative overflow-hidden backdrop-blur-md transition-all hover:border-outline",
      className
    )}>
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", borderLeft)}></div>
      <div className="flex justify-between items-start mb-2">
        <span className={cn("font-label-caps text-label-caps px-2 py-0.5 rounded", severityColors[alert.severity])}>
          {alert.severity}
        </span>
        <span className="font-mono-data text-mono-data text-on-surface-variant text-xs flex items-center gap-1">
          <Clock size={12} />
          {new Date(alert.createdAt?.seconds * 1000 || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <h4 className="font-body-md text-body-md font-semibold text-on-surface mb-1">{alert.routeLabel}</h4>
      <div className="flex items-center gap-1.5 text-on-surface-variant font-body-sm text-body-sm mb-2">
        <AlertTriangle size={14} className={cn(alert.severity === 'Critical' ? 'text-error' : 'text-tertiary')} />
        {alert.disruptionType}
      </div>
      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">{alert.description}</p>
      {onAnalyze && (
        <button 
          onClick={() => onAnalyze(alert.id)}
          className={cn(
            "mt-3 font-label-caps text-label-caps border px-3 py-1.5 rounded transition-colors w-full text-center flex items-center justify-center gap-1",
            alert.severity === 'Critical' ? 'text-error border-error/30 hover:bg-error/10' : 'text-primary border-primary/30 hover:bg-primary/10'
          )}
        >
          Analyze Impact <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
};
