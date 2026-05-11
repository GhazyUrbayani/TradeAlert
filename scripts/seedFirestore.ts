import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { createRequire } from 'module';
import fs from 'fs';

const require = createRequire(import.meta.url);

// Load environment variables from .env
dotenv.config();

/**
 * ADMIN SEED SCRIPT (Node.js)
 * 
 * Usage: npx ts-node scripts/seedFirestore.ts
 * 
 * This script bypasses Firestore rules and seeds the database directly.
 * It requires a service account JSON file.
 * 1. Go to Firebase Console > Project Settings > Service Accounts.
 * 2. Click "Generate new private key".
 * 3. Save it as 'service-account.json' in the root directory.
 */

const serviceAccountPath = join(process.cwd(), 'service-account.json');

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

async function seed() {
  try {
    if (!fs.existsSync(serviceAccountPath)) {
      console.error(`Error: Service account file not found at ${serviceAccountPath}`);
      console.log("Please download your service account JSON from Firebase Console and save it as 'service-account.json'.");
      process.exit(1);
    }
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();

    console.log("Seeding Firestore (Admin Mode)...");
    const batch = db.batch();

    const routesCol = db.collection('tradeRoutes');
    const alertsCol = db.collection('alerts');
    const historyCol = db.collection('riskHistory');

    const routesWithIds: { id: string, data: any }[] = [];

    // 1. Create Routes
    for (const r of routesData) {
      const docRef = routesCol.doc();
      batch.set(docRef, {
        ...r,
        recommendedDepartureStart: new Date(Date.now() + 86400000 * 2).toISOString(),
        recommendedDepartureEnd: new Date(Date.now() + 86400000 * 4).toISOString(),
        recommendedConfidence: 85 + Math.random() * 10,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });
      routesWithIds.push({ id: docRef.id, data: r });
      console.log(`Added route: ${r.origin} -> ${r.destination}`);
    }

    // 2. Add History
    for (const rWithId of routesWithIds) {
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        const score = Math.max(0, Math.min(100, rWithId.data.riskScore + (Math.random() * 30 - 15)));
        
        const historyDocRef = historyCol.doc();
        batch.set(historyDocRef, {
          routeId: rWithId.id,
          date: date.toISOString().split('T')[0],
          riskScore: score
        });
      }
    }

    // 3. Add Alerts
    const alertTypes = ["Port Congestion", "Weather", "Rate Spike", "Strike", "Capacity Shortage"];
    const severities = ["Critical", "High", "Medium", "Low"];

    for (let i = 0; i < 10; i++) {
      const randomRoute = routesWithIds[Math.floor(Math.random() * routesWithIds.length)];
      const alertDocRef = alertsCol.doc();
      batch.set(alertDocRef, {
        routeId: randomRoute.id,
        routeLabel: `${randomRoute.data.origin} → ${randomRoute.data.destination}`,
        disruptionType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        affectedWindowStart: new Date().toISOString(),
        affectedWindowEnd: new Date(Date.now() + 86400000 * 3).toISOString(),
        description: "Initial disruption data provided via system initialization.",
        status: i < 3 ? "New" : "Acknowledged",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    console.log("Seeding complete successfully.");
    process.exit(0);

  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
}

seed();
