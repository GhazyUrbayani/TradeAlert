import React, { useEffect, useState } from 'react';
import { NavLink, Link, Outlet } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, logout } from '../config/firebase';
import { 
  BarChart3, 
  Map as MapIcon, 
  Bell, 
  Search, 
  User as UserIcon, 
  AlertTriangle, 
  Route, 
  Ship, 
  FileText, 
  HelpCircle,
  Terminal,
  LogOut
} from 'lucide-react';
import { cn } from '../lib/utils';

export const Layout: React.FC = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col antialiased">
      {/* TopAppBar */}
      <header className="flex justify-between items-center w-full px-gutter h-16 z-50 bg-surface-container-lowest border-b border-outline-variant fixed top-0 left-0">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-headline-sm text-headline-sm font-bold text-primary tracking-tight">
            TradeAlert SEA
          </Link>
          <nav className="hidden md:flex gap-6 items-center h-full pt-1">
            <NavLink to="/dashboard" className={({ isActive }) => cn(
              "font-body-md text-body-md transition-colors pb-1",
              isActive ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
            )}>Dashboard</NavLink>
            <NavLink to="/routes" className={({ isActive }) => cn(
              "font-body-md text-body-md transition-colors pb-1",
              isActive ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
            )}>Routes</NavLink>
            <NavLink to="/alerts" className={({ isActive }) => cn(
              "font-body-md text-body-md transition-colors pb-1",
              isActive ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
            )}>Alerts</NavLink>
            <NavLink to="/estimator" className={({ isActive }) => cn(
              "font-body-md text-body-md transition-colors pb-1",
              isActive ? "text-primary border-b-2 border-primary" : "text-on-surface-variant hover:text-primary"
            )}>Estimator</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <button className="text-on-surface-variant hover:text-primary transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <div className="flex items-center gap-3 ml-2 pl-4 border-l border-outline-variant">
                <div className="text-right hidden sm:block">
                  <div className="font-label-caps text-[10px] leading-tight text-on-surface">{user.displayName || 'Exporter'}</div>
                  <div className="font-label-caps text-[9px] leading-tight text-on-surface-variant opacity-60">Verified Cluster</div>
                </div>
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}&background=3B82F6&color=fff`} 
                  alt="Profile" 
                  className="w-8 h-8 rounded-full border border-outline-variant"
                />
                <button 
                  onClick={logout}
                  className="text-on-surface-variant hover:text-error transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="font-label-caps text-[10px] text-on-surface-variant tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
              SECURE SESSION INACTIVE
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 pt-16 h-full overflow-hidden">
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col border-r border-outline-variant py-stack_lg bg-surface-container fixed left-0 top-16 h-[calc(100vh-16px)] w-sidebar_width z-40">
          <div className="px-4 pb-6 mb-6 border-b border-outline-variant">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden">
                <Terminal className="text-primary" size={20} />
              </div>
              <div>
                <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Command Center</h2>
                <p className="font-label-caps text-label-caps text-on-surface-variant">Operational Intelligence</p>
              </div>
            </div>
            <div className="bg-secondary-container/10 border border-secondary/30 rounded px-3 py-2 mt-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_rgba(78,222,163,0.8)]"></span>
              <span className="font-label-caps text-label-caps text-secondary">System Status: Optimal</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 space-y-1 font-label-caps text-label-caps">
            <NavLink to="/dashboard" className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
              isActive ? "bg-secondary-container/10 text-secondary border-l-4 border-secondary" : "text-on-surface-variant hover:bg-surface-container-high"
            )}>
              <MapIcon size={18} /> Global Overview
            </NavLink>
            <NavLink to="/alerts" className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
              isActive ? "bg-secondary-container/10 text-secondary border-l-4 border-secondary" : "text-on-surface-variant hover:bg-surface-container-high"
            )}>
              <AlertTriangle size={18} /> Risk Monitor
            </NavLink>
            <NavLink to="/routes" className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
              isActive ? "bg-secondary-container/10 text-secondary border-l-4 border-secondary" : "text-on-surface-variant hover:bg-surface-container-high"
            )}>
              <Route size={18} /> Lane Analysis
            </NavLink>
            <NavLink to="/fleet" className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
              isActive ? "bg-secondary-container/10 text-secondary border-l-4 border-secondary" : "text-on-surface-variant hover:bg-surface-container-high"
            )}>
              <Ship size={18} /> Fleet Status
            </NavLink>
            <NavLink to="/reports" className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-md transition-colors",
              isActive ? "bg-secondary-container/10 text-secondary border-l-4 border-secondary" : "text-on-surface-variant hover:bg-surface-container-high"
            )}>
              <BarChart3 size={18} /> Reports
            </NavLink>
          </nav>

          <div className="px-2 pt-4 border-t border-outline-variant mt-auto font-label-caps text-label-caps mb-4">
            <Link to="/support" className="flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high transition-colors">
              <HelpCircle size={18} /> Support
            </Link>
            <Link to="/docs" className="flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high transition-colors">
              <FileText size={18} /> Documentation
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto lg:ml-sidebar_width bg-background p-container_margin">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
