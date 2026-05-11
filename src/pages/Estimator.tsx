import React, { useState } from 'react';
import { CostEstimatorForm } from '../components/ui/CostEstimatorForm';
import { CostImpactPanel } from '../components/ui/CostImpactPanel';
import { RefreshCcw, Download, Ship } from 'lucide-react';
import { estimateCostImpact, EstimationResult } from '../services/costEstimator';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Estimator: React.FC = () => {
  const [simulating, setSimulating] = useState(false);
  const [results, setResults] = useState<EstimationResult | null>(null);
  const [lastParams, setLastParams] = useState<any>(null);

  const handleSimulate = (data: any) => {
    setSimulating(true);
    setLastParams(data);
    
    // Mimic API/Calculation delay
    setTimeout(() => {
      const result = estimateCostImpact(data.route, data.cargoValue, data.shipmentDate, data.cargoType);
      setResults(result);
      setSimulating(false);
    }, 1200);
  };

  const handleDownloadPDF = () => {
    if (!results || !lastParams) return;

    const doc = new jsPDF();
    const route = lastParams.route;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(59, 130, 246); // Primary blue
    doc.text('TradeAlert SEA', 14, 20);
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Cost Impact Simulation Report', 14, 30);

    // Params Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Shipment Parameters', 14, 45);
    
    autoTable(doc, {
      startY: 50,
      head: [['Parameter', 'Value']],
      body: [
        ['Route', `${route.origin} to ${route.destination}`],
        ['Cargo Value', `$${lastParams.cargoValue.toLocaleString()} USD`],
        ['Cargo Type', lastParams.cargoType],
        ['Shipment Date', lastParams.shipmentDate],
        ['Risk Score', `${route.riskScore} (${route.riskLevel})`],
      ],
      theme: 'striped',
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Results Section
    const nextY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Cost Analysis Results', 14, nextY);

    autoTable(doc, {
      startY: nextY + 5,
      head: [['Metric', 'Estimate']],
      body: [
        ['Estimated Delay Risk', `${results.delayRiskDays} Days`],
        ['Potential Surcharges', `$${results.surcharge.toLocaleString()} USD`],
        ['Cash Flow Impact', `$${results.cashFlowImpact.toLocaleString()} USD`],
        ['Risk-Adjusted Total Cost', `$${results.riskAdjustedCost.toLocaleString()} USD`],
        ['Baseline Cost', `$${results.baselineCost.toLocaleString()} USD`],
        ['Total Cost Delta', `+$${results.costDelta.toLocaleString()} (+${results.costDeltaPercentage}%)`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [244, 67, 54] } // Error color for results
    });

    // Assessment
    const assessmentY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Operational Recommendation', 14, assessmentY);
    doc.setFontSize(10);
    doc.text(results.timingAssessment.message, 14, assessmentY + 8);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on ${new Date().toLocaleString()} by TradeAlert SEA Intelligence Engine.`, 14, 285);

    doc.save(`TradeAlert_Estimate_${route.origin}_${lastParams.shipmentDate}.pdf`);
  };

  return (
    <div className="space-y-stack_lg">
      <header className="mb-stack_lg flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface mb-1">Cost Impact Estimator</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant text-balance max-w-2xl">
            Simulate risk-adjusted operational costs for active shipping lanes based on multi-factor disruption models.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {results && (
            <button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded font-label-caps text-label-caps text-on-surface hover:bg-surface-container-high transition-all"
            >
              <Download size={14} /> Export PDF
            </button>
          )}
          <div className="flex items-center gap-2 text-on-surface-variant font-mono-data text-xs bg-surface-container px-3 py-1.5 rounded border border-outline-variant">
            <RefreshCcw size={12} className={simulating ? 'animate-spin text-primary' : ''} />
            <span>Logic v2.4.1</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-stack_lg items-start">
        <div className="xl:col-span-4">
          <CostEstimatorForm onSimulate={handleSimulate} />
        </div>

        <div className="xl:col-span-8">
          {simulating ? (
             <div className="flex flex-col items-center justify-center p-20 bg-surface-container border border-outline-variant rounded-xl border-dashed">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-label-caps text-label-caps text-primary tracking-widest animate-pulse">Running Monte Carlo Disruption Simulation...</p>
                <p className="text-body-sm text-on-surface-variant mt-2">Integrating regional port congestion & fuel index feeds</p>
             </div>
          ) : results ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
               <CostImpactPanel results={results} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-24 bg-surface-container border border-outline-variant rounded-xl opacity-50 border-dashed">
              <div className="w-16 h-16 bg-surface-container-highest rounded-full flex items-center justify-center mb-6">
                <Ship className="text-outline" size={32} />
              </div>
              <p className="font-label-caps text-label-caps text-on-surface-variant text-center max-w-sm uppercase tracking-widest leading-loose">
                Configure voyage parameters and shipment dates to estimate risk premiums and operational surcharges.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
