import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Dumbbell,
  LayoutDashboard,
  Users,
  CreditCard,
  UserCheck,
  LogOut,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, onOpenAddModal }) => {
  const { gym, logout } = useAuth();

  return (
    <nav className="glass-panel sticky top-0 z-40 border-b border-dark-700/60 bg-dark-900/90 backdrop-blur-md px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand & Gym Name */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green shadow-neon-green/20">
            <Dumbbell className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white font-['Outfit']">
                Gym<span className="text-neon-green">Flow</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neon-green/10 text-neon-green border border-neon-green/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate max-w-[200px] sm:max-w-[280px]">
              {gym?.gymName || 'Fitness Club'}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <div className="hidden md:flex items-center gap-1.5 bg-dark-950/70 p-1.5 rounded-xl border border-dark-700/60">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'dashboard'
              ? 'bg-neon-green text-dark-950 font-semibold shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-dark-800'
              }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'members'
              ? 'bg-neon-green text-dark-950 font-semibold shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-dark-800'
              }`}
          >
            <Users className="h-4 w-4" />
            Members
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'plans'
              ? 'bg-neon-green text-dark-950 font-semibold shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-dark-800'
              }`}
          >
            <CreditCard className="h-4 w-4" />
            Plans
          </button>

          <button
            onClick={() => setActiveTab('portal')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'portal'
              ? 'bg-neon-green text-dark-950 font-semibold shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-dark-800'
              }`}
          >
            <UserCheck className="h-4 w-4" />
            Member Portal
          </button>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 bg-gradient-to-r from-neon-green to-neon-emerald hover:from-neon-glow hover:to-neon-green text-dark-950 font-bold px-3.5 py-2 rounded-xl text-sm transition-all shadow-neon-green/30 shadow-lg active:scale-95"
          >
            <PlusCircle className="h-4 w-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Add Member (10s)</span>
            <span className="sm:hidden">Add</span>
          </button>

          <button
            onClick={logout}
            title="Logout"
            className="p-2.5 rounded-xl border border-dark-700 hover:border-red-500/40 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
