import { collection, addDoc, serverTimestamp, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { handleFirestoreError, OperationType } from './firestoreErrorHandler';

const routesData = [
  { origin: "Surabaya, Indonesia", destination: "Singapore", riskScore: 72, portCongestionRisk: 80, weatherRisk: 45, freightRateRisk: 65, riskLevel: "Critical", trend: "up" },
  { origin: "Jakarta, Indonesia", destination: "Port Klang, Malaysia", riskScore: 45, portCongestionRisk: 50, weatherRisk: 30, freightRateRisk: 55, riskLevel: "Warning", trend: "up" },
  { origin: "Surabaya, Indonesia", destination: "Guangzhou, China", riskScore: 85, portCongestionRisk: 90, weatherRisk: 60, freightRateRisk: 78, riskLevel: "Critical", trend: "up" },
  { origin: "Makassar, Indonesia", destination: "Manila, Philippines", riskScore: 38, portCongestionRisk: 35, weatherRisk: 50, freightRateRisk: 28, riskLevel: "Safe", trend: "down" },
  { origin: "Jakarta, Indonesia", destination: "Ho Chi Minh City, Vietnam", riskScore: 55, portCongestionRisk: 48, weatherRisk: 65, freightRateRisk: 50, riskLevel: "Warning", trend: "stable" },
  { origin: "Medan, Indonesia", destination: "Penang, Malaysia", riskScore: 28, portCongestionRisk: 25, weatherRisk: 35, freightRateRisk: 22, riskLevel: "Safe", trend: "down" },
  { origin: "Jakarta, Indonesia", destination: "Bangkok, Thailand", riskScore: 61, portCongestionRisk: 55, weatherRisk: 70, freightRateRisk: 55, riskLevel: "Warning", trend: "up" },
  { origin: "Surabaya, Indonesia", destination: "Kaohsiung, Taiwan", riskScore: 67, portCongestionRisk: 70, weatherRisk: 55, freightRateRisk: 60, riskLevel: "Warning", trend: "stable" },
];

export async function seedFirestore() {
  const routesCol = collection(db, 'tradeRoutes');
  const alertsCol = collection(db, 'alerts');
  const historyCol = collection(db, 'riskHistory');

  try {
    const snapshot = await getDocs(routesCol);
    if (!snapshot.empty) {
      console.log("Firestore already seeded.");
      return;
    }

    console.log("Seeding Firestore (Optimized)...");
    const batch = writeBatch(db);

    const routesWithIds: { id: string, data: any }[] = [];

    // 1. Create Routes
    for (const r of routesData) {
      // addDoc is needed because we need the returned ID
      const routeRef = await addDoc(routesCol, {
        ...r,
        recommendedDepartureStart: new Date(Date.now() + 86400000 * 2).toISOString(),
        recommendedDepartureEnd: new Date(Date.now() + 86400000 * 4).toISOString(),
        recommendedConfidence: 85 + Math.random() * 10,
        lastUpdated: serverTimestamp(),
      });
      routesWithIds.push({ id: routeRef.id, data: r });
    }

    // 2. Batch Create History
    for (const rWithId of routesWithIds) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const score = Math.max(0, Math.min(100, rWithId.data.riskScore + (Math.random() * 30 - 15)));
        
        const historyDocRef = doc(historyCol);
        batch.set(historyDocRef, {
          routeId: rWithId.id,
          date: date.toISOString().split('T')[0],
          riskScore: score
        });
      }
    }

    // 3. Batch Create Alerts
    const alertTypes = ["Port Congestion", "Weather", "Rate Spike", "Strike", "Capacity Shortage"];
    const severities = ["Critical", "High", "Medium", "Low"] as const;

    for (let i = 0; i < 10; i++) {
      const randomRoute = routesWithIds[Math.floor(Math.random() * routesWithIds.length)];
      
      const alertDocRef = doc(alertsCol);
      batch.set(alertDocRef, {
        routeId: randomRoute.id,
        routeLabel: `${randomRoute.data.origin} → ${randomRoute.data.destination}`,
        disruptionType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        affectedWindowStart: new Date().toISOString(),
        affectedWindowEnd: new Date(Date.now() + 86400000 * 3).toISOString(),
        description: "Disruption detected due to abnormal operational patterns in the corridor.",
        status: i < 3 ? "New" : "Acknowledged",
        createdAt: serverTimestamp(),
      });
    }

    await batch.commit();
    console.log("Seeding complete.");
    window.location.reload(); // Reload to refresh data
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seeding');
  }
}
