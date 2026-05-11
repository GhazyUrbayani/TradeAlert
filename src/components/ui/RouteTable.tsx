import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, MoreVertical } from 'lucide-react';
import { TradeRoute } from '../../types';
import { RiskBadge } from './RiskBadge';
import { TrendArrow } from './TrendArrow';
import { cn } from '../../lib/utils';

interface RouteTableProps {
  routes: TradeRoute[];
  limit?: number;
}

export const RouteTable: React.FC<RouteTableProps> = ({ routes, limit }) => {
  const navigate = useNavigate();
  const displayRoutes = limit ? routes.slice(0, limit) : routes;

  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant bg-surface-container-high/50 font-label-caps text-label-caps text-on-surface-variant">
              <th className="py-3 px-4 font-semibold">Route</th>
              <th className="py-3 px-4 font-semibold text-center">Risk Score</th>
              <th className="py-3 px-4 font-semibold">Risk Level</th>
              <th className="py-3 px-4 font-semibold text-center">Trend</th>
              <th className="py-3 px-4 font-semibold">Recommended Action</th>
              <th className="py-3 px-4 font-semibold">Last Updated</th>
              <th className="py-3 px-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="font-mono-data text-body-sm divide-y divide-outline-variant/30">
            {displayRoutes.map((route) => (
              <tr 
                key={route.id} 
                onClick={() => navigate(`/routes/${route.id}`)}
                className="hover:bg-surface-container-high/30 transition-colors group cursor-pointer"
              >
                <td className="py-3 px-4 flex items-center gap-2">
                  <span className="text-on-surface">{route.origin.split(',')[0]}</span>
                  <ArrowRight size={14} className="text-outline-variant" />
                  <span className="text-on-surface">{route.destination}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={cn(
                    "inline-flex items-center justify-center w-8 h-8 rounded border",
                    route.riskScore >= 70 ? 'border-error text-error bg-error/10' : 
                    route.riskScore >= 40 ? 'border-tertiary text-tertiary bg-tertiary/10' : 
                    'border-secondary text-secondary bg-secondary/10'
                  )}>
                    {route.riskScore.toFixed(0)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <RiskBadge level={route.riskLevel} />
                </td>
                <td className="py-3 px-4 text-center">
                  <TrendArrow trend={route.trend} />
                </td>
                <td className="py-3 px-4 text-on-surface-variant">
                  {route.riskLevel === 'Critical' ? 'Reroute via Jakarta' : 
                   route.riskLevel === 'Warning' ? 'Buffer Inventory (+2 days)' : 
                   'Maintain Current Ops'}
                </td>
                <td className="py-3 px-4 text-outline-variant italic">
                  {route.lastUpdated?.seconds ? new Date(route.lastUpdated.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2 mins ago'}
                </td>
                <td className="py-3 px-4 text-right">
                  <button className="text-primary hover:text-primary-fixed opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {limit && routes.length > limit && (
        <div className="p-3 border-t border-outline-variant flex justify-center">
          <button 
            onClick={() => navigate('/dashboard')}
            className="font-label-caps text-label-caps text-primary hover:text-primary-fixed transition-colors"
          >
            View All Routes
          </button>
        </div>
      )}
    </div>
  );
};
