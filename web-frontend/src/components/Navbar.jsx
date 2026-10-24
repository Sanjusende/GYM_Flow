import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  CreditCard,
  UserCheck,
  LogOut,
  Plus,
  Settings,
} from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, onOpenAddModal, onOpenGymSettings, onOpenUpgrade }) => {
  const { gym, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'plans', label: 'Plans', icon: CreditCard },
    { id: 'portal', label: 'Portal', icon: UserCheck },
  ];

  const subStatus = gym?.subscriptionStatus || 'trial';

  return (
    <>
      {/* Top Navbar */}
      <nav className="glass-panel sticky top-0 z-40 border-b border-dark-700/60 bg-dark-900/90 backdrop-blur-md px-3 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Brand & Gym Name */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green shrink-0 shadow-neon-green/20">
              <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-['Outfit']">
                  Gym<span className="text-neon-green">Flow</span>
                </span>
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  title="Click to view subscription plan details"
                  className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0 transition-transform hover:scale-105 active:scale-95 ${
                    subStatus === 'active'
                      ? 'bg-neon-green/10 text-neon-green border-neon-green/30'
                      : subStatus === 'expired'
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}
                >
                  {subStatus === 'active' ? 'PRO' : subStatus === 'expired' ? 'EXPIRED' : 'TRIAL'}
                </button>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate max-w-[140px] sm:max-w-[280px]">
                {gym?.gymName || 'Fitness Club'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1.5 bg-dark-950/70 p-1.5 rounded-xl border border-dark-700/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-neon-green text-dark-950 font-semibold shadow-md'
                      : 'text-slate-300 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Quick Add Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-neon-green to-emerald-500 hover:from-emerald-400 hover:to-neon-green text-dark-950 font-black px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm transition-all shadow-neon-green/20 shadow-md active:scale-95"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span className="hidden sm:inline">Add Member (10s)</span>
              <span className="sm:hidden font-bold">Add</span>
            </button>

            {/* Gym Settings Button */}
            {onOpenGymSettings && (
              <button
                onClick={onOpenGymSettings}
                title="Gym Settings & UPI QR"
                className="p-2 sm:p-2.5 rounded-xl border border-dark-700 hover:border-dark-600 text-slate-400 hover:text-neon-green hover:bg-dark-800 transition-colors"
              >
                <Settings className="h-4 w-4" />
              </button>
            )}

            {/* Logout Button */}
            <button
              onClick={logout}
              title="Logout"
              className="p-2 sm:p-2.5 rounded-xl border border-dark-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar (Fixed for Mobile Screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-dark-950/95 backdrop-blur-xl border-t border-dark-800 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
                isActive
                  ? 'text-neon-green font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  isActive ? 'bg-neon-green/15 text-neon-green' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 h-1 w-5 bg-neon-green rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default Navbar;
