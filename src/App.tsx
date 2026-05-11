import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { RouteDetail } from './pages/RouteDetail';
import { RoutesList } from './pages/RoutesList';
import { Alerts } from './pages/Alerts';
import { Estimator } from './pages/Estimator';

import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/routes" element={<RoutesList />} />
          <Route path="/routes/:routeId" element={<RouteDetail />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/estimator" element={<Estimator />} />
          
          {/* Missing pages placeholders */}
          <Route path="/fleet" element={<div className="p-20 text-center opacity-50 uppercase tracking-widest font-label-caps">Fleet Status Module Coming Soon</div>} />
          <Route path="/reports" element={<div className="p-20 text-center opacity-50 uppercase tracking-widest font-label-caps">Advanced Reporting Module Coming Soon</div>} />
          <Route path="/support" element={<div className="p-20 text-center opacity-50 uppercase tracking-widest font-label-caps">Operational Support Portal</div>} />
          <Route path="/docs" element={<div className="p-20 text-center opacity-50 uppercase tracking-widest font-label-caps">Documentation & API Reference</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
