import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Anchor, CloudRain, TrendingUp, Info, Zap, Calendar, Ship, LogIn } from 'lucide-react';
import { db, auth, signInWithGoogle } from '../config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { TradeRoute, RiskHistory } from '../types';
import { RiskGauge } from '../components/ui/RiskGauge';
import { SubScoreBar } from '../components/ui/SubScoreBar';
import { RiskTrendChart } from '../components/ui/RiskTrendChart';
import { AlternativeRoutesTable } from '../components/ui/AlternativeRoutesTable';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { getAIInsight } from '../services/geminiService';

export const RouteDetail: React.FC = () => {
  const { routeId } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState<TradeRoute | null>(null);
  const [history, setHistory] = useState<RiskHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiInsight, setAiInsight] = useState<string>('Generating AI intelligence report...');
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!routeId) return;

    setLoading(true);
    const routesPath = `tradeRoutes/${routeId}`;
    const historyPath = 'riskHistory';

    const fetchRoute = async () => {
      try {
        const docRef = doc(db, 'tradeRoutes', routeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const routeData = { id: docSnap.id, ...docSnap.data() } as TradeRoute;
          setRoute(routeData);
          // Fetch AI insight once route is loaded
          const insight = await getAIInsight(routeData);
          setAiInsight(insight);
        }
      } catch (error) {
        console.error("Error fetching route:", error);
      } finally {
        setLoading(false);
      }
    };

    const historyQuery = query(
      collection(db, historyPath),
      where('routeId', '==', routeId),
      orderBy('date', 'asc')
    );

    const unsubHistory = onSnapshot(historyQuery, (snapshot) => {
      const historyData = snapshot.docs.map(doc => doc.data() as RiskHistory);
      setHistory(historyData);
    }, (error) => {
      console.warn("History fetch restricted:", error);
    });

    fetchRoute();
    return () => unsubHistory();
  }, [routeId]); // Remove user dependency

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-body-md">Analyzing Maritime Telemetry...</p>
    </div>
  );
  if (!route) return <div>Route not found.</div>;

  return (
    <div className="space-y-stack_lg">
      <header className="mb-stack_lg flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors mb-4 font-label-caps text-label-caps"
          >
            <ArrowLeft size={14} /> Back to Fleet Overview
          </button>
          <div className="flex items-center gap-3 text-on-surface-variant mb-2 font-label-caps text-label-caps">
            <span>ROUTE ID: {route.id.slice(0, 8).toUpperCase()}</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            {route.riskLevel === 'Critical' && (
              <span className="text-error flex items-center gap-1">
                <Info size={14} /> HIGH RISK DETECTED
              </span>
            )}
          </div>
          <h1 className="font-headline-md text-headline-md text-on-surface flex items-center gap-3">
            {route.origin.split(',')[0]}
            <span className="text-outline-variant">→</span>
            {route.destination}
          </h1>
        </div>
        <div className="flex gap-4">
          <div className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-right">
            <div className="font-label-caps text-label-caps text-on-surface-variant mb-1">Distance</div>
            <div className="font-mono-data text-mono-data text-on-surface">1,350<span className="text-outline-variant text-xs ml-1">km</span></div>
          </div>
          <div className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 text-right">
            <div className="font-label-caps text-label-caps text-on-surface-variant mb-1">Est. Transit</div>
            <div className="font-mono-data text-mono-data text-on-surface">2.5<span className="text-outline-variant text-xs ml-1">Days</span></div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-stack_lg">
        {/* Risk Analysis Column */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-stack_lg">
          <div className="bg-surface-container border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row gap-8 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 ${route.riskLevel === 'Critical' ? 'bg-error/5' : 'bg-primary/5'} rounded-full blur-[80px] pointer-events-none`}></div>
            
            <div className="flex-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-outline-variant/30 pb-6 md:pb-0 md:pr-8">
              <div className="font-label-caps text-label-caps text-on-surface-variant mb-4">Aggregate Risk Score</div>
              <RiskGauge score={route.riskScore} size="lg" />
            </div>

            <div className="flex-[1.5] flex flex-col justify-center gap-5">
              <SubScoreBar 
                label="Port Congestion Risk" 
                score={route.portCongestionRisk} 
                icon={<Anchor size={16} />} 
                variant="error" 
              />
              <SubScoreBar 
                label="Weather Risk" 
                score={route.weatherRisk} 
                icon={<CloudRain size={16} />} 
                variant="tertiary" 
              />
              <SubScoreBar 
                label="Freight Rate Volatility" 
                score={route.freightRateRisk} 
                icon={<TrendingUp size={16} />} 
                variant="tertiary" 
              />
            </div>
          </div>

          <div className="bg-surface-container border border-outline-variant rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Risk Score Trend</h3>
              <div className="flex gap-2 font-label-caps text-label-caps text-on-surface-variant text-xs">
                <button className="px-2 py-1 bg-surface-container-highest rounded text-on-surface">30D</button>
                <button className="px-2 py-1 hover:text-on-surface transition-colors">90D</button>
              </div>
            </div>
            <RiskTrendChart data={history} />
          </div>
        </div>

        {/* Strategy Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-stack_lg">
          <div className="bg-surface-container-high border-t-2 border-t-secondary border border-outline-variant rounded-xl p-6 shadow-xl relative overflow-hidden">
             <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-secondary font-label-caps text-label-caps">
                <Zap size={16} fill="currentColor" />
                OPTIMAL STRATEGY
              </div>
              <div className="bg-secondary/10 text-secondary border border-secondary/20 px-2 py-1 rounded text-[10px] font-mono-data flex items-center gap-1 uppercase">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
                {route.recommendedConfidence.toFixed(0)}% Confidence
              </div>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">Recommended Departure Window</h3>
            <div className="bg-surface-container-lowest border border-outline-variant/30 px-4 py-3 rounded-lg mb-4">
                <div className="font-label-caps text-label-caps text-primary flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                    AI SITUATION REPORT
                </div>
                <p className="font-body-sm text-xs italic text-on-surface-variant leading-relaxed">
                    "{aiInsight}"
                </p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-4 my-4 flex items-center justify-between">
              <div className="font-display-lg text-headline-md text-on-surface tracking-tight flex items-center gap-3">
                <Calendar className="text-secondary opacity-60" size={20} />
                {new Date(route.recommendedDepartureStart).toLocaleDateString([], { month: 'short', day: 'numeric' })} - {new Date(route.recommendedDepartureEnd).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </div>
              <div className="text-right">
                <div className="font-label-caps text-label-caps text-on-surface-variant">Est. Arrival</div>
                <div className="font-mono-data text-mono-data text-on-surface">Nov 15 - 17</div>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 leading-relaxed">
              Based on AI analytics, delaying departure by 48 hours avoids peak port congestion at {route.origin.split(',')[0]} and bypasses an incoming low-pressure system in the Java Sea.
            </p>
            <button className="w-full bg-secondary text-on-secondary hover:brightness-110 transition-all py-3 rounded-lg font-body-sm font-semibold flex justify-center items-center gap-2 shadow-lg">
              Acknowledge & Reschedule
              <Ship size={18} />
            </button>
          </div>

          <AlternativeRoutesTable />
        </div>
      </div>
    </div>
  );
};
