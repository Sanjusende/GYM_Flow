import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Plans from './pages/Plans';
import MemberPortal from './pages/MemberPortal';
import Login from './pages/Login';
import AddMemberModal from './components/AddMemberModal';
import RenewModal from './components/RenewModal';
import AiDietModal from './components/AiDietModal';
import GymSettingsModal from './components/GymSettingsModal';
import axiosInstance from './api/axiosInstance';

export function App() {
  const { isAuthenticated, gym, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [plans, setPlans] = useState([]);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isGymSettingsOpen, setIsGymSettingsOpen] = useState(false);
  const [renewTarget, setRenewTarget] = useState(null);
  const [renewMode, setRenewMode] = useState('renew');
  const [dietTarget, setDietTarget] = useState(null);
  const [membersFilter, setMembersFilter] = useState('ALL');

  // Load plans for modals
  const fetchPlans = async () => {
    if (isAuthenticated) {
      try {
        const res = await axiosInstance.get('/plans');
        if (res.data.success) {
          setPlans(res.data.plans);
        }
      } catch (err) {
        console.error('Failed to fetch plans', err);
      }
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-neon-green/30 border-t-neon-green rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading GymFlow Ecosystem...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show Login or public Member Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark-950 text-slate-100 flex flex-col">
        {/* Public Top Bar */}
        <header className="p-4 border-b border-dark-800/80 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-xl tracking-tight text-white font-['Outfit']">
              Gym<span className="text-neon-green">Flow</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab(activeTab === 'portal' ? 'login' : 'portal')}
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl border border-dark-700 hover:border-neon-green/40 text-slate-300 hover:text-neon-green transition-all"
            >
              {activeTab === 'portal' ? 'Gym Owner Login' : '📱 Member Self-Service'}
            </button>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          {activeTab === 'portal' ? <MemberPortal /> : <Login />}
        </main>
      </div>
    );
  }

  // Handlers for Member actions
  const handleMemberAdded = async (memberData) => {
    const res = await axiosInstance.post('/members', memberData);
    if (res.data.success) {
      setActiveTab('members');
    }
  };

  const handleRenewSuccess = async (memberId, payload) => {
    await axiosInstance.post(`/members/${memberId}/renew`, payload);
  };

  const handleClearDueSuccess = async (memberId, payload) => {
    await axiosInstance.post(`/members/${memberId}/clear-due`, payload);
  };

  const handleNavigateToMembersWithFilter = (filter) => {
    setMembersFilter(filter);
    setActiveTab('members');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddOpen(true)}
        onOpenGymSettings={() => setIsGymSettingsOpen(true)}
      />

      {/* Main Content Area (extra bottom padding on mobile for fixed bottom bar) */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-3 sm:px-8 pt-4 pb-24 md:pb-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            gym={gym}
            onNavigateToMembers={handleNavigateToMembersWithFilter}
            onOpenAddModal={() => setIsAddOpen(true)}
            onOpenGymSettings={() => setIsGymSettingsOpen(true)}
            onOpenRenewModal={(m) => {
              setRenewTarget(m);
              setRenewMode('renew');
            }}
            onOpenClearDueModal={(m) => {
              setRenewTarget(m);
              setRenewMode('clear-due');
            }}
          />
        )}

        {activeTab === 'members' && (
          <Members
            gym={gym}
            initialFilter={membersFilter}
            onOpenAddModal={() => setIsAddOpen(true)}
            onOpenRenewModal={(m) => {
              setRenewTarget(m);
              setRenewMode('renew');
            }}
            onOpenClearDueModal={(m) => {
              setRenewTarget(m);
              setRenewMode('clear-due');
            }}
            onViewDiet={(m) => setDietTarget(m)}
          />
        )}

        {activeTab === 'plans' && <Plans />}

        {activeTab === 'portal' && <MemberPortal />}
      </main>

      {/* Fast 10s Member Entry Modal */}
      <AddMemberModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onMemberAdded={handleMemberAdded}
        plans={plans}
      />

      {/* 1-Click Renew & Due Settlement Modal */}
      <RenewModal
        isOpen={!!renewTarget}
        onClose={() => setRenewTarget(null)}
        member={renewTarget}
        plans={plans}
        initialMode={renewMode}
        onRenewSuccess={handleRenewSuccess}
        onClearDueSuccess={handleClearDueSuccess}
      />

      {/* Gemini AI Indian Diet Modal */}
      <AiDietModal
        isOpen={!!dietTarget}
        onClose={() => setDietTarget(null)}
        member={dietTarget}
        gym={gym}
      />

      {/* Gym Settings & UPI QR Modal */}
      <GymSettingsModal
        isOpen={isGymSettingsOpen}
        onClose={() => setIsGymSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
