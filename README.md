# TradeAlert SEA - Supply Chain Risk Monitoring

TradeAlert SEA is a real-time risk assessment dashboard for regional trade corridors in Southeast Asia. It employs AI-powered simulation models to estimate port congestion, weather disruptions, and freight rate spikes.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Firebase**
   - Create a project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore and Authentication (Google Login)
   - Copy your Web Connection configuration and paste it into `/src/config/firebase.ts`

3. **Local Development**
   ```bash
   npm run dev
   ```

## Database Initialization

Seed the Firestore database with initial regional corridors and mock alerts:
```bash
npx ts-node scripts/seedFirestore.ts
```

## Production Deployment

This app is optimized for Firebase Hosting.

1. **Build and Deploy**
   ```bash
   npm run deploy
   ```

Live Demo: [https://tradealert-sea.web.app](https://tradealert-sea.web.app)
