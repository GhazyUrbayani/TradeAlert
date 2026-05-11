import React from 'react';
import { Route, Map as MapIcon, DollarSign } from 'lucide-react';
import { RiskBadge } from './RiskBadge';

interface AlternativeRoute {
  name: string;
  risk: number;
  costDelta: string;
}

export const AlternativeRoutesTable: React.FC = () => {
  const alternatives: AlternativeRoute[] = [
    { name: 'Jakarta (CGK)', risk: 52, costDelta: '+$450' },
    { name: 'Makassar (UPG)', risk: 65, costDelta: '-$120' },
  ];

  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl flex flex-col overflow-hidden">
      <div className="p-4 border-b border-outline-variant/50">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">Alternative Routes</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Comparative risk and cost analysis</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-highest/50 font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant/50">
            <tr>
              <th className="py-3 px-4 font-normal">Via Route</th>
              <th className="py-3 px-4 font-normal text-right">Risk</th>
              <th className="py-3 px-4 font-normal text-right">Cost Delta</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm divide-y divide-outline-variant/30">
            {alternatives.map((alt) => (
              <tr key={alt.name} className="hover:bg-surface-container-high transition-colors group cursor-pointer">
                <td className="py-3 px-4 text-on-surface flex items-center gap-2">
                  <Route size={16} className="text-outline-variant" />
                  {alt.name}
                </td>
                <td className="py-3 px-4 text-right">
                  <span className="bg-tertiary/10 text-tertiary border border-tertiary/20 px-2 py-0.5 rounded font-mono-data">
                    {alt.risk}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <span className={`font-mono-data ${alt.costDelta.startsWith('+') ? 'text-error' : 'text-secondary'}`}>
                    {alt.costDelta}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
