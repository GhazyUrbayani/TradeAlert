import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, auth, signInWithGoogle } from '../config/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { Alert } from '../types';
import { AlertCard } from '../components/ui/AlertCard';
import { Filter, Download, CheckCircle, Ship, Clock, AlertTriangle, ChevronRight, Zap, LogIn, ExternalLink } from 'lucide-react';
import { cn } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    setLoading(true);
    const alertsPath = 'alerts';
    const q = query(collection(db, alertsPath), orderBy('createdAt', 'desc'));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Alert));
      setAlerts(data);
      if (data.length > 0 && !selectedAlertId) setSelectedAlertId(data[0].id);
      setLoading(false);
    }, (error) => {
      console.warn("Alerts restricted:", error);
      setLoading(false);
    });
    
    return () => unsub();
  }, []); // Remove user dependency

  const handleAnalyze = (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (alert?.routeId) {
      navigate(`/routes/${alert.routeId}`);
    }
  };

  if (loading && alerts.length === 0) return (
    <div className="flex flex-col items-center justify-center col-span-12 h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-body-md tracking-widest uppercase">Fetching Regional Bulletin...</p>
    </div>
  );

  const selectedAlert = alerts.find(a => a.id === selectedAlertId);

  return (
    <div className="space-y-stack_lg">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface">Active Disruptions</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Monitoring {alerts.filter(a => a.status === 'New').length} unresolved alerts across your trade lanes.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 font-label-caps text-label-caps border border-outline-variant rounded text-on-surface hover:bg-surface-container-high transition-colors flex items-center gap-2">
            <Download size={14} /> Export Report
          </button>
          <button className="px-4 py-2 font-label-caps text-label-caps bg-primary text-on-primary rounded shadow-lg hover:brightness-110 transition-all flex items-center gap-2">
            <CheckCircle size={14} /> Mark All Read
          </button>
        </div>
      </div>

      <div className="flex gap-4 bg-surface-container p-2 rounded border border-outline-variant">
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-background rounded border border-outline-variant">
          <Filter size={14} className="text-on-surface-variant" />
          <span className="font-label-caps text-label-caps text-on-surface-variant">Severity:</span>
          <select className="bg-transparent border-none text-on-surface font-body-sm text-body-sm focus:ring-0 p-0 pr-6 appearance-none cursor-pointer">
            <option>All Critical & Warning</option>
            <option>Critical Only</option>
          </select>
        </div>
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-background rounded border border-outline-variant">
          <span className="font-label-caps text-label-caps text-on-surface-variant">Status:</span>
          <select className="bg-transparent border-none text-on-surface font-body-sm text-body-sm focus:ring-0 p-0 pr-6 appearance-none cursor-pointer">
            <option>Unresolved</option>
            <option>Acknowledged</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-stack_lg h-[calc(100vh-280px)]">
        <div className="col-span-12 xl:col-span-7 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
          {alerts.map(alert => (
            <div 
              key={alert.id}
              onClick={() => setSelectedAlertId(alert.id)}
              className={cn(
                "transition-all cursor-pointer",
                selectedAlertId === alert.id ? "scale-[1.01]" : "opacity-80 hover:opacity-100"
              )}
            >
              <AlertCard alert={alert} onAnalyze={handleAnalyze} />
            </div>
          ))}
          {loading && <p className="text-center py-8 text-on-surface-variant italic">Scanning regional corridors...</p>}
        </div>

        <div className="hidden xl:block xl:col-span-5">
          {selectedAlert ? (
            <div className="sticky top-0 bg-surface-container-high border border-outline-variant rounded-xl flex flex-col h-full shadow-2xl">
              <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-highest rounded-t-xl">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={cn("text-xl", selectedAlert.severity === 'Critical' ? 'text-error' : 'text-tertiary')} size={20} />
                  <h2 className="font-headline-md text-headline-md text-on-surface">Incident Details</h2>
                </div>
                <button 
                  onClick={() => handleAnalyze(selectedAlert.id)}
                  className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors"
                  title="View Route Detail"
                >
                  <ExternalLink size={20} />
                </button>
              </div>
              <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6 custom-scrollbar">
                <div>
                  <div className={cn("font-label-caps text-label-caps mb-1", selectedAlert.severity === 'Critical' ? 'text-error' : 'text-tertiary')}>
                    {selectedAlert.severity} Disruption
                  </div>
                  <h3 className="font-display-lg text-2xl leading-tight text-on-surface mb-2">{selectedAlert.disruptionType}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">Location: <span className="text-on-surface">{selectedAlert.routeLabel}</span></p>
                </div>

                <div className="h-40 w-full rounded-lg border border-outline-variant bg-surface-container-low overflow-hidden relative">
                    <img 
                        src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800" 
                        alt="Disruption" 
                        className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent" />
                    <div className="absolute bottom-3 left-3 bg-surface/80 backdrop-blur-md border border-outline-variant px-3 py-1.5 rounded font-mono-data text-xs text-error flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span> 45 Vessels at Anchor
                    </div>
                </div>

                <div>
                  <h4 className="font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant pb-2 mb-3">Intelligence Brief</h4>
                  <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                    {selectedAlert.description} Immediate impact on transit times as berth utilization exceeds 95%. SME clusters are advised to prioritize essential cargo and consider short-sea alternatives where feasible.
                  </p>
                </div>

                <div>
                  <h4 className="font-label-caps text-label-caps text-on-surface-variant border-b border-outline-variant pb-2 mb-3">Impacted Fleet (Projected)</h4>
                  <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center p-3 rounded bg-surface-container border border-outline-variant">
                        <div className="flex items-center gap-3">
                          <Ship className="text-on-surface-variant" size={18} />
                          <div>
                            <div className="font-body-sm text-body-sm text-on-surface font-semibold">Evergreen Apex</div>
                            <div className="font-label-caps text-label-caps text-on-surface-variant mt-0.5">Voyage 042E</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono-data text-mono-data text-error">ETA +12 Days</div>
                          <div className="font-label-caps text-label-caps text-on-surface-variant">Anchored</div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-outline-variant bg-surface-container flex gap-3 rounded-b-xl">
                <button 
                  onClick={() => handleAnalyze(selectedAlert.id)}
                  className="flex-1 py-3 font-label-caps text-label-caps bg-primary text-on-primary rounded shadow-lg hover:brightness-110 transition-all font-bold flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} /> Analyze Impact
                </button>
                <button className="flex-1 py-3 font-label-caps text-label-caps border border-outline-variant text-on-surface rounded hover:bg-surface-container-high transition-colors font-bold">
                  Acknowledge
                </button>
              </div>
            </div>
          ) : (
             <div className="flex items-center justify-center h-full border border-dashed border-outline-variant rounded-xl opacity-50">
               <p className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant text-center px-8">
                 Select an alert notification to view satellite telemetry and operational intelligence.
               </p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
