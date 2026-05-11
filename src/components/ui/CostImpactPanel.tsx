import React from 'react';
import { AlertCircle, TrendingUp, Info, ChevronRight, ArrowDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../../lib/utils';
import { EstimationResult } from '../../services/costEstimator';

interface Props {
  results: EstimationResult;
}

export const CostImpactPanel: React.FC<Props> = ({ results }) => {
  const chartData = [
    { name: 'Baseline', cost: results.baselineCost },
    { name: 'Risk-Adjusted', cost: results.riskAdjustedCost }
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Timing Alert */}
      <div className={cn(
        "backdrop-blur-md border rounded-lg p-4 flex items-start gap-4",
        results.timingAssessment.status === 'optimal' ? "bg-primary/5 border-primary/30" : 
        results.timingAssessment.status === 'early' ? "bg-warning-container/10 border-warning/30" : 
        "bg-error-container/10 border-error/30"
      )}>
        <AlertCircle className={cn(
          results.timingAssessment.status === 'optimal' ? "text-primary" : 
          results.timingAssessment.status === 'early' ? "text-warning" : 
          "text-error",
          "mt-0.5"
        )} size={20} />
        <div>
          <h4 className={cn(
            "font-body-md text-body-md font-bold",
            results.timingAssessment.status === 'optimal' ? "text-primary" : 
            results.timingAssessment.status === 'early' ? "text-warning" : 
            "text-error"
          )}>
            Departure Timing Assessment
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {results.timingAssessment.message}. Shipping conditions are {results.timingAssessment.status === 'optimal' ? 'favorable' : 'volatile'} for this window.
          </p>
        </div>
      </div>

      {/* Bento Grid KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface-container border border-outline-variant rounded-lg p-5 flex flex-col relative overflow-hidden group hover:border-outline transition-colors">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2 block">Estimated Delay Risk</span>
          <div className="flex items-end gap-3 mt-auto">
            <span className="font-display-lg text-display-lg text-error">{results.delayRiskDays}</span>
            <span className="font-body-md text-body-md text-on-surface-variant mb-2">Days</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={14} className="text-error" />
            <span className="font-mono-data text-mono-data text-error">Impacted by current score</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-1 bg-error/50"></div>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-lg p-5 flex flex-col relative overflow-hidden group hover:border-outline transition-colors">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2 block">Potential Surcharge</span>
          <div className="flex items-end gap-3 mt-auto">
            <span className="font-display-lg text-display-lg text-tertiary">${results.surcharge.toLocaleString()}</span>
            <span className="font-body-md text-body-md text-on-surface-variant mb-2">USD</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Info size={14} className="text-on-surface-variant" />
            <span className="font-mono-data text-mono-data text-on-surface-variant">Congestion & Premium adjusted</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-1 bg-tertiary/50"></div>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-lg p-5 flex flex-col relative overflow-hidden group hover:border-outline transition-colors">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2 block">Cash Flow Impact</span>
          <div className="flex items-end gap-3 mt-auto">
            <span className="font-display-lg text-display-lg text-error">-${results.cashFlowImpact.toLocaleString()}</span>
            <span className="font-body-md text-body-md text-on-surface-variant mb-2">USD</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <ArrowDown size={14} className="text-error" />
            <span className="font-mono-data text-mono-data text-error">Cost of capital (12% APR)</span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-1 bg-error/50"></div>
        </div>

        <div className="bg-surface-container border border-primary/30 rounded-lg p-5 flex flex-col relative overflow-hidden group hover:border-primary/60 transition-colors bg-gradient-to-br from-surface-container to-primary/5">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-2 block">Risk-Adjusted Cost</span>
          <div className="flex items-end gap-3 mt-auto">
            <span className="font-display-lg text-display-lg text-primary">${results.riskAdjustedCost.toLocaleString()}</span>
            <span className="font-body-md text-body-md text-on-surface-variant mb-2">USD total</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Info size={14} className="text-on-surface-variant" />
            <span className="font-mono-data text-mono-data text-on-surface-variant">
              +{results.costDeltaPercentage}% delta from baseline
            </span>
          </div>
          <div className="absolute top-0 right-0 w-16 h-1 bg-primary"></div>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="bg-surface-container border border-outline-variant rounded-lg p-6">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Cost Breakdown Comparison</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-outline rounded-sm"></div>
              <span className="text-[10px] uppercase font-label-caps text-on-surface-variant tracking-wider">Baseline</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-primary rounded-sm"></div>
              <span className="text-[10px] uppercase font-label-caps text-on-surface-variant tracking-wider">Adjusted</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Inter' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontFamily: 'Inter' }}
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ 
                  backgroundColor: '#1C1B1F', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
              />
              <Bar dataKey="cost" radius={[4, 4, 0, 0]} barSize={60}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#49454F' : '#3B82F6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
