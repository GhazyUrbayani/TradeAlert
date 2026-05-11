import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RiskHistory } from '../../types';

interface RiskTrendChartProps {
  data: RiskHistory[];
  height?: number;
}

export const RiskTrendChart: React.FC<RiskTrendChartProps> = ({ data, height = 200 }) => {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ffb4ab" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ffb4ab" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#273647" />
          <XAxis 
            dataKey="date" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#c2c6d6', fontSize: 10 }}
            tickFormatter={(val) => new Date(val).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          />
          <YAxis 
            domain={[0, 100]} 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#c2c6d6', fontSize: 10 }} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1c2b3c', border: '1px solid #424754', borderRadius: '8px' }}
            itemStyle={{ color: '#ffb4ab' }}
            labelStyle={{ color: '#d4e4fa', marginBottom: '4px' }}
          />
          <Area 
            type="monotone" 
            dataKey="riskScore" 
            stroke="#ffb4ab" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#riskGradient)" 
            dot={{ r: 3, fill: '#ffb4ab', strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
