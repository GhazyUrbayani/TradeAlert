import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { TradeRoute, CargoType } from '../../types';
import { Settings, Calculator } from 'lucide-react';

interface FormValues {
  routeId: string;
  cargoValue: string;
  shipmentDate: string;
  cargoType: CargoType;
}

export const CostEstimatorForm: React.FC<{ onSimulate: (data: any) => void }> = ({ onSimulate }) => {
  const { register, handleSubmit, setValue } = useForm<FormValues>();
  const [routes, setRoutes] = useState<TradeRoute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const q = query(collection(db, 'tradeRoutes'), orderBy('origin'));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as TradeRoute));
        setRoutes(data);
        if (data.length > 0) {
          setValue('routeId', data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch routes for estimator:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoutes();
  }, [setValue]);

  const onSubmit = (data: FormValues) => {
    const selectedRoute = routes.find(r => r.id === data.routeId);
    if (!selectedRoute) return;

    onSimulate({
      route: selectedRoute,
      cargoValue: Number(data.cargoValue.replace(/,/g, '')),
      shipmentDate: data.shipmentDate,
      cargoType: data.cargoType
    });
  };

  return (
    <div className="bg-surface-container border border-outline-variant rounded-lg p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="text-primary" size={20} />
        <h2 className="font-headline-md text-headline-md text-on-surface">Simulation Parameters</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-wider">Select Route</label>
          <div className="relative">
            <select 
              {...register('routeId', { required: true })}
              disabled={loading}
              className="w-full bg-surface-container-lowest border border-outline-variant text-body-md text-on-surface rounded p-3 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <option>Loading corridors...</option>
              ) : (
                routes.map(r => (
                  <option key={r.id} value={r.id}>{r.origin} → {r.destination}</option>
                ))
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-wider">Cargo Value (USD)</label>
          <div className="relative">
            <span className="font-mono-data text-mono-data text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2">$</span>
            <input 
              {...register('cargoValue', { required: true })}
              className="w-full bg-surface-container-lowest border border-outline-variant text-body-md font-mono-data text-on-surface rounded p-3 pl-8 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
              type="text" 
              placeholder="850,000"
              defaultValue="100,000"
            />
          </div>
        </div>

        <div>
          <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-wider">Shipment Date</label>
          <div className="relative">
            <input 
              {...register('shipmentDate', { required: true })}
              className="w-full bg-surface-container-lowest border border-outline-variant text-body-md text-on-surface rounded p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors [color-scheme:dark]" 
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div>
          <label className="font-label-caps text-label-caps text-on-surface-variant mb-2 block uppercase tracking-wider">Cargo Type</label>
          <div className="relative">
            <select 
              {...register('cargoType', { required: true })}
              className="w-full bg-surface-container-lowest border border-outline-variant text-body-md text-on-surface rounded p-3 appearance-none focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors cursor-pointer"
            >
              <option value="General Cargo">General Cargo</option>
              <option value="Perishable">Perishables</option>
              <option value="Electronics">Electronics & Tech</option>
              <option value="Textile">Textiles</option>
              <option value="Raw Material">Raw Materials</option>
            </select>
          </div>
        </div>

        <div className="mt-2 pt-4 border-t border-outline-variant">
          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-3 rounded hover:bg-primary-container transition-colors shadow-lg flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50"
          >
            <Calculator size={18} />
            Run Simulation
          </button>
        </div>
      </form>
    </div>
  );
};
