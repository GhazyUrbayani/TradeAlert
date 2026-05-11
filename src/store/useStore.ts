import { create } from 'zustand';
import { TradeRoute, Alert } from '../types';

interface AppState {
  routes: TradeRoute[];
  alerts: Alert[];
  selectedRouteId: string | null;
  setRoutes: (routes: TradeRoute[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setSelectedRouteId: (id: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  routes: [],
  alerts: [],
  selectedRouteId: null,
  setRoutes: (routes) => set({ routes }),
  setAlerts: (alerts) => set({ alerts }),
  setSelectedRouteId: (id) => set({ selectedRouteId: id }),
}));
