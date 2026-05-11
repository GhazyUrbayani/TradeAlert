import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { BarChart, AlertCircle, Zap, LogIn, RefreshCw } from 'lucide-react';
import { db, auth, signInWithGoogle } from '../config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import toast from 'react-hot-toast';
import { generateLiveRiskUpdate } from '../services/riskScoring';
import { TradeRoute, Alert } from '../types';
import { KPICard } from '../components/ui/KPICard';
import { RouteTable } from '../components/ui/RouteTable';
import { AlertCard } from '../components/ui/AlertCard';
import { useStore } from '../store/useStore';
import { seedFirestore } from '../lib/seed';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { routes, alerts, setRoutes, setAlerts } = useStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      if (routes.length > 0) {
        setRefreshing(true);
        try {
          for (const route of routes) {
            const updated = await generateLiveRiskUpdate(route);
            if (route.riskScore < 70 && updated.riskScore >= 70) {
              toast.error(`⚠️ New Critical Alert: ${route.origin} → ${route.destination}`, {
                duration: 6000,
              });
            }
          }
          setLastRefreshed(new Date());
          toast.success("Intelligence feed updated", { id: 'refresh' });
        } catch (err) {
          console.error("Refresh failed:", err);
        } finally {
          setRefreshing(false);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(refreshInterval);
  }, [routes]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, []);

  useEffect(() => {
    // Safety timeout to prevent infinite loading screen
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        console.warn("Loading timeout reached. Forcing UI render.");
      }
    }, 8000);

    // Only fetch data - no strict user check needed for display due to public rules
    setLoading(true);
    const routesPath = 'tradeRoutes';
    const alertsPath = 'alerts';

    const routesQuery = query(collection(db, routesPath));
    const alertsQuery = query(collection(db, alertsPath), orderBy('createdAt', 'desc'), limit(5));

    const unsubRoutes = onSnapshot(routesQuery, (snapshot) => {
      const routesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TradeRoute));
      setRoutes(routesData);
      setLoading(false);
    }, (error) => {
      console.warn("Firestore access restricted, possibly not seeded yet.");
      setLoading(false);
    });

    const unsubAlerts = onSnapshot(alertsQuery, (snapshot) => {
      const alertsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
      setAlerts(alertsData);
    }, (error) => {
      console.warn("Alerts fetch error:", error);
    });

    return () => {
      clearTimeout(timeout);
      unsubRoutes();
      unsubAlerts();
    };
  }, []); // Remove user dependency to allow guest load

  const criticalRoutes = routes.filter(r => r.riskLevel === 'Critical').length;
  const warningRoutes = routes.filter(r => r.riskLevel === 'Warning').length;

  const isAdminUser = user?.email === 'ghazyurbayani@gmail.com';

  const [search, setSearch] = useState('');

  const filteredRoutes = routes.filter(r => 
    r.origin.toLowerCase().includes(search.toLowerCase()) || 
    r.destination.toLowerCase().includes(search.toLowerCase())
  );

  const handleAnalyzeAlert = (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert?.routeId) {
      navigate(`/routes/${alert.routeId}`);
    }
  };

  if (loading && routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-body-md">Initializing Trade Intelligence...</p>
      </div>
    );
  }

  // If still no routes after loading, show a welcome/seed prompt for the admin
  if (!loading && routes.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <Zap className="text-primary" size={40} />
          </div>
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface">Welcome to TradeAlert SEA</h1>
            <p className="font-body-lg text-on-surface-variant max-w-lg mx-auto mt-2">
              The intelligence platform is ready. Guests can view disruption data once the administrator completes the initial regional corridor seeding.
            </p>
          </div>
          <div className="flex gap-4">
             {!user ? (
               <button onClick={() => signInWithGoogle()} className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-caps text-label-caps hover:brightness-110 transition-all shadow-lg active:scale-95">Admin Login</button>
             ) : isAdminUser ? (
               <button onClick={() => seedFirestore()} className="px-8 py-3 bg-secondary text-on-secondary rounded-lg font-label-caps text-label-caps hover:brightness-110 transition-all shadow-lg animate-pulse active:scale-95">Seed Data Corridors</button>
             ) : (
               <div className="p-4 bg-surface-container rounded-lg border border-outline-variant text-on-surface-variant font-body-sm italic">
                  Database empty. Please ask the administrator ({'ghazyurbayani@gmail.com'}) to initialize the data.
               </div>
             )}
          </div>
        </div>
      );
  }

  return (
    <div className="space-y-stack_lg">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface">Regional Dashboard</h1>
          <div className="flex items-center gap-2 text-on-surface-variant">
            <p className="font-body-lg text-body-lg">Real-time supply chain risk assessment for Southeast Asia.</p>
            <span className="text-secondary opacity-30 text-[10px]">•</span>
            <div className="flex items-center gap-1 font-label-caps text-[11px] uppercase tracking-wider text-secondary">
              <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
              Refreshed: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        {isAdminUser && (
          <button 
            onClick={() => seedFirestore()}
            className="text-xs text-on-surface-variant hover:text-primary transition-colors italic underline"
          >
            Manage Data (Seed)
          </button>
        )}
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-stack_md relative">
        {refreshing && (
           <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
           </div>
        )}
        <KPICard 
          label="Active Trade Lanes Monitored" 
          value={routes.length} 
          delta="+2 from last week" 
          icon={BarChart}
          variant="primary"
          sparkline={
            <svg className="w-full h-full stroke-primary fill-none stroke-2" preserveAspectRatio="none" viewBox="0 0 100 30">
              <path d="M0,30 L10,25 L20,28 L30,20 L40,22 L50,15 L60,18 L70,10 L80,12 L90,5 L100,2" />
            </svg>
          }
        />
        <KPICard 
          label="High-Risk Routes Today" 
          value={criticalRoutes + warningRoutes} 
          delta={`${criticalRoutes} Critical, ${warningRoutes} Warning`}
          icon={AlertCircle}
          variant="error"
        />
        <KPICard 
          label="Avg Risk Score This Week" 
          value="32" 
          delta="Stable" 
          icon={Zap}
          variant="secondary"
          sparkline={
            <svg className="w-full h-full stroke-secondary fill-none stroke-2" preserveAspectRatio="none" viewBox="0 0 100 30">
              <path d="M0,15 L20,16 L40,14 L60,15 L80,14 L100,15" />
            </svg>
          }
        />
      </div>

      {/* Main Layout: Table + Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-stack_lg">
        <div className="xl:col-span-3 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface">Trade Lane Risk Monitor</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Dynamic disruption monitoring across regional corridors.</p>
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Search routes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-surface-container border border-outline-variant rounded font-body-sm text-body-sm text-on-surface px-3 py-1.5 focus:border-primary outline-none w-64"
              />
            </div>
          </div>
          <RouteTable routes={filteredRoutes} limit={6} />
        </div>

        <div className="xl:col-span-1 space-y-4">
          <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2 border-b border-outline-variant pb-2">
            <AlertCircle className="text-error" size={18} /> Top Alerts
          </h3>
          <div className="space-y-3">
            {alerts.length > 0 ? alerts.map(alert => (
              <AlertCard key={alert.id} alert={alert} onAnalyze={handleAnalyzeAlert} />
            )) : (
              <p className="text-on-surface-variant font-body-sm italic">No active alerts detected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
