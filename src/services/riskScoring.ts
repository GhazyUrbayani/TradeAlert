import { doc, updateDoc, addDoc, collection, serverTimestamp, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { TradeRoute, RiskLevel, Trend, DisruptionType, Severity } from '../types';

/**
 * Phase 1: MOCK DATA LAYER
 * Simulates a realistic random walk for risk scoring during a demo.
 */
export async function generateLiveRiskUpdate(route: TradeRoute): Promise<TradeRoute> {
  const currentScore = route.riskScore;
  
  // Realistic random walk: ±8 points
  const variance = Math.floor(Math.random() * 17) - 8;
  const nextScore = Math.max(0, Math.min(100, currentScore + variance));
  
  // Independent sub-score variances: ±5 points
  const nextPortCongestion = Math.max(0, Math.min(100, route.portCongestionRisk + (Math.floor(Math.random() * 11) - 5)));
  const nextWeather = Math.max(0, Math.min(100, route.weatherRisk + (Math.floor(Math.random() * 11) - 5)));
  const nextFreight = Math.max(0, Math.min(100, route.freightRateRisk + (Math.floor(Math.random() * 11) - 5)));
  
  // Recalculate Risk Level
  let nextLevel: RiskLevel = 'Safe';
  if (nextScore >= 70) nextLevel = 'Critical';
  else if (nextScore >= 40) nextLevel = 'Warning';
  
  // Trend calculation: Compare to yesterday's data if available
  let nextTrend: Trend = 'stable';
  const historyQuery = query(
    collection(db, 'riskHistory'),
    where('routeId', '==', route.id),
    orderBy('date', 'desc'),
    limit(2)
  );
  
  const historySnap = await getDocs(historyQuery);
  if (historySnap.docs.length >= 1) {
    const prevScore = historySnap.docs[0].data().riskScore;
    if (nextScore > prevScore + 3) nextTrend = 'up';
    else if (nextScore < prevScore - 3) nextTrend = 'down';
  }

  const updatedData = {
    riskScore: nextScore,
    portCongestionRisk: nextPortCongestion,
    weatherRisk: nextWeather,
    freightRateRisk: nextFreight,
    riskLevel: nextLevel,
    trend: nextTrend,
    lastUpdated: serverTimestamp(),
  };

  // Update Firestore
  const routeRef = doc(db, 'tradeRoutes', route.id);
  await updateDoc(routeRef, updatedData);

  // Append history record
  await addDoc(collection(db, 'riskHistory'), {
    routeId: route.id,
    date: new Date().toISOString().split('T')[0],
    riskScore: nextScore
  });

  // Check for auto-alert generation
  if (currentScore < 70 && nextScore >= 70) {
    await generateAutoAlert(route, nextScore, { port: nextPortCongestion, weather: nextWeather, freight: nextFreight });
  }

  return { ...route, ...updatedData };
}

async function generateAutoAlert(route: TradeRoute, score: number, subscores: { port: number, weather: number, freight: number }) {
  // Infer disruption type from highest sub-score
  let type: DisruptionType = 'Port Congestion';
  if (subscores.weather > subscores.port && subscores.weather > subscores.freight) type = 'Weather';
  if (subscores.freight > subscores.port && subscores.freight > subscores.weather) type = 'Rate Spike';

  const severity: Severity = score >= 85 ? 'Critical' : 'High';

  await addDoc(collection(db, 'alerts'), {
    routeId: route.id,
    routeLabel: `${route.origin} → ${route.destination}`,
    disruptionType: type,
    severity: severity,
    affectedWindowStart: new Date().toISOString(),
    affectedWindowEnd: new Date(Date.now() + 86400000 * 3).toISOString(), // 3 day window
    description: `Automated risk escalation detected on the ${route.origin} corridor. AI models indicate a ${type} probability spike.`,
    status: 'New',
    createdAt: serverTimestamp()
  });
}

/**
 * Phase 2: REAL API LAYER (Commented out for future implementation)
 * 
 * Example integration logic for production:
 * 
 * async function fetchRealRiskSignals(origin: string, destination: string) {
 *   // 1. MarineTraffic API: Port Congestion Proxy
 *   // Documentation: https://www.marinetraffic.com/en/ais-api-services/
 *   // Endpoint: GET https://services.marinetraffic.com/api/expectedarrivals/v2/KEY/portid:123
 *   // Logic: Calculate ratio of expected vs historical arrivals.
 *   
 *   // 2. Freightos Baltic Index (FBX): Rate Pulse
 *   // Documentation: https://fbx.freightos.com/
 *   // Endpoint: GET https://api.freightos.com/v1/fbx-daily?lane=SEA-USWC
 *   // Logic: Compare daily rate against 30-day moving average.
 *   
 *   // 3. OpenWeather Marine Forecast
 *   // Documentation: https://openweathermap.org/api/marine-forecast
 *   // Endpoint: GET https://api.openweathermap.org/data/2.5/marine/forecast?lat=...&lon=...
 *   // Logic: Score based on wave height > 4m and wind speed > 30kts.
 *   
 *   // Weighted Aggregation:
 *   // const score = (portSignal * 0.45) + (rateSignal * 0.30) + (weatherSignal * 0.25);
 *   // return score;
 * }
 */
