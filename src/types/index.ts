/**
 * Data types for TradeAlert SEA
 */

export type RiskLevel = 'Critical' | 'Warning' | 'Safe';
export type Trend = 'up' | 'down' | 'stable';
export type DisruptionType = 'Port Congestion' | 'Weather' | 'Rate Spike' | 'Strike' | 'Capacity Shortage';
export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AlertStatus = 'New' | 'Acknowledged' | 'Resolved';

export type CargoType = 'General Cargo' | 'Perishable' | 'Electronics' | 'Textile' | 'Raw Material';

export interface TradeRoute {
  id: string;
  origin: string;
  destination: string;
  riskScore: number;
  portCongestionRisk: number;
  weatherRisk: number;
  freightRateRisk: number;
  riskLevel: RiskLevel;
  trend: Trend;
  recommendedDepartureStart: string;
  recommendedDepartureEnd: string;
  recommendedConfidence: number;
  lastUpdated: any; // Firestore Timestamp
}

export interface Alert {
  id: string;
  routeId: string;
  routeLabel: string;
  disruptionType: DisruptionType;
  severity: Severity;
  affectedWindowStart: string;
  affectedWindowEnd: string;
  description: string;
  status: AlertStatus;
  createdAt: any; // Firestore Timestamp
}

export interface RiskHistory {
  id?: string;
  routeId: string;
  date: string;
  riskScore: number;
}
