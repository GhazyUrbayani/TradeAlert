import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { TradeRoute } from '../types';
import { RouteTable } from '../components/ui/RouteTable';
import { Search, Ship, Filter, Download, Plus } from 'lucide-react';
import { seedFirestore } from '../lib/seed';

export const RoutesList: React.FC = () => {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<TradeRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'tradeRoutes'), orderBy('origin'));
    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TradeRoute));
      setRoutes(data);
      setLoading(false);
    }, (error) => {
      console.warn("Routes restricted:", error);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredRoutes = routes.filter(r => 
    r.origin.toLowerCase().includes(search.toLowerCase()) || 
    r.destination.toLowerCase().includes(search.toLowerCase())
  );

  const isAdminUser = auth.currentUser?.email === 'ghazyurbayani@gmail.com';

  if (loading && routes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-on-surface-variant font-body-md">Optimizing Data Streams...</p>
      </div>
    );
  }

  return (
    <div className="space-y-stack_lg">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface">Regional Trade Corridors</h1>
          <p className="font-body-lg text-on-surface-variant">Comprehensive directory of monitored lanes and their current risk status.</p>
        </div>
        <div className="flex gap-2">
          <button 
             onClick={() => alert("Generating corridor report PDF...")}
             className="flex items-center gap-2 px-4 py-2 bg-surface-container border border-outline-variant rounded font-label-caps text-label-caps text-on-surface hover:bg-surface-container-high hover:border-outline focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
          >
             <Download size={14} /> Export Report
          </button>
          {isAdminUser && (
            <button 
               onClick={() => seedFirestore()}
               className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded font-label-caps text-label-caps hover:brightness-110 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
               <Plus size={14} /> New Manual Entry
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface p-6 rounded-xl border border-outline-variant shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
            <input 
              type="text" 
              placeholder="Search by port, country, or region..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded font-body-md text-on-surface focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
             <button 
                onClick={() => setSearch('')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-label-caps text-[10px] cursor-pointer hover:bg-primary/20 transition-colors"
             >
                <Ship size={12} /> All Lanes
             </button>
             <button 
                onClick={() => alert("Filter: Priority Lanes coming soon")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-surface-container-high text-on-surface-variant border border-transparent hover:border-outline-variant font-label-caps text-[10px] cursor-pointer transition-all"
             >
                <Filter size={12} /> Priority Only
             </button>
          </div>
        </div>

        {filteredRoutes.length > 0 ? (
          <RouteTable routes={filteredRoutes} />
        ) : (
          <div className="py-20 text-center space-y-4">
             <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto">
                <Ship className="text-outline" size={32} />
             </div>
             <div>
                <p className="text-on-surface font-headline-sm">No Corridors Found</p>
                <p className="text-on-surface-variant font-body-md">Try searching for a different port or seed the database.</p>
             </div>
             <button onClick={() => seedFirestore()} className="px-6 py-2 bg-primary text-on-primary rounded font-label-caps text-label-caps">Seed Koridor</button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
            <h4 className="font-label-caps text-label-caps text-primary mb-2">Network Health</h4>
            <div className="text-headline-lg font-display-lg text-on-surface">98.2%</div>
            <p className="text-body-sm text-on-surface-variant mt-1">Operational across monitored corridors.</p>
         </div>
         <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
            <h4 className="font-label-caps text-label-caps text-secondary mb-2">Avg Port Dwell</h4>
            <div className="text-headline-lg font-display-lg text-on-surface">4.2 Days</div>
            <p className="text-body-sm text-on-surface-variant mt-1">Decreased 0.5d from last period.</p>
         </div>
         <div className="p-6 bg-surface-container-low rounded-xl border border-outline-variant">
            <h4 className="font-label-caps text-label-caps text-error mb-2">High Congestion</h4>
            <div className="text-headline-lg font-display-lg text-on-surface">3 Sectors</div>
            <p className="text-body-sm text-on-surface-variant mt-1">Requires immediate attention.</p>
         </div>
      </div>
    </div>
  );
};
