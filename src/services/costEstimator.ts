import { TradeRoute, CargoType } from '../types';

export interface EstimationResult {
  delayRiskDays: number;
  surcharge: number;
  cashFlowImpact: number;
  riskAdjustedCost: number;
  baselineCost: number;
  costDelta: number;
  costDeltaPercentage: number;
  timingAssessment: {
    status: 'optimal' | 'early' | 'high-risk';
    message: string;
    recommendation?: number;
  };
}

const baseDelayDays: Record<CargoType, number> = {
  'Perishable': 3,
  'Electronics': 5,
  'General Cargo': 7,
  'Textile': 7,
  'Raw Material': 10
};

const surchargeRate: Record<string, number> = {
  'Critical': 0.035,
  'Warning': 0.018,
  'Safe': 0.006
};

export function estimateCostImpact(
  route: TradeRoute,
  cargoValue: number,
  shipmentDate: string,
  cargoType: CargoType
): EstimationResult {
  // Step 1: Base delay risk
  const delayRiskDays = (route.riskScore / 100) * baseDelayDays[cargoType];

  // Step 2: Surcharge estimate
  const rate = surchargeRate[route.riskLevel] || 0.006;
  const surcharge = cargoValue * rate;

  // Step 3: Cash flow impact
  const cashFlowImpact = cargoValue * (delayRiskDays / 365) * 0.12;

  // Step 4: Risk-adjusted total cost
  const baselineCost = cargoValue;
  const riskAdjustedCost = cargoValue + surcharge + cashFlowImpact;
  const costDelta = riskAdjustedCost - baselineCost;
  const costDeltaPercentage = (costDelta / baselineCost) * 100;

  // Step 5: Recommended window assessment
  const shipment = new Date(shipmentDate);
  const start = new Date(route.recommendedDepartureStart);
  const end = new Date(route.recommendedDepartureEnd);

  let timingStatus: 'optimal' | 'early' | 'high-risk' = 'optimal';
  let timingMessage = '✅ Optimal timing';
  let recommendation: number | undefined;

  if (shipment >= start && shipment <= end) {
    timingStatus = 'optimal';
    timingMessage = '✅ Optimal timing';
  } else if (shipment < start) {
    const diffDays = Math.ceil((start.getTime() - shipment.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 7) {
      timingStatus = 'early';
      timingMessage = `⚠️ Early — consider delaying ${diffDays} days`;
      recommendation = diffDays;
    } else {
      timingStatus = 'high-risk';
      timingMessage = `🔴 High risk — delay by ${diffDays} days recommended`;
      recommendation = diffDays;
    }
  } else {
    // After window
    timingStatus = 'high-risk';
    timingMessage = '🔴 High risk — outside recommended window';
  }

  return {
    delayRiskDays: Number(delayRiskDays.toFixed(1)),
    surcharge: Number(surcharge.toFixed(2)),
    cashFlowImpact: Number(cashFlowImpact.toFixed(2)),
    riskAdjustedCost: Number(riskAdjustedCost.toFixed(2)),
    baselineCost: cargoValue,
    costDelta: Number(costDelta.toFixed(2)),
    costDeltaPercentage: Number(costDeltaPercentage.toFixed(1)),
    timingAssessment: {
      status: timingStatus,
      message: timingMessage,
      recommendation
    }
  };
}
