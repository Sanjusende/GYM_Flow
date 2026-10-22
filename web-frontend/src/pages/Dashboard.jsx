import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import StatCard from '../components/StatCard';
import {
  Users,
  AlertTriangle,
  UserX,
  IndianRupee,
  TrendingUp,
  MessageSquare,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';

const Dashboard = ({
  gym,
  onNavigateToMembers,
  onOpenAddModal,
  onOpenRenewModal,
  onOpenClearDueModal,
}) => {
  const [data, setData] = useState({
    activeCount: 0,
    expiringSoonCount: 0,
    expiredCount: 0,
    totalPendingDues: 0,
    monthlyRevenue: 0,
    expiringSoonMembers: [],
    expiredMembers: [],
    pendingDueMembers: [],
    recentPayments: [],
  });
  const [activeTab, setActiveTab] = useState('EXPIRING'); // 'EXPIRING' | 'EXPIRED' | 'UDHAARI'
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/dashboard/stats');
      if (res.data.success) {
        setData({
          activeCount: res.data.activeCount ?? res.data.stats?.activeMembers ?? 0,
          expiringSoonCount: res.data.expiringSoonCount ?? res.data.stats?.expiringMembers ?? 0,
          expiredCount: res.data.expiredCount ?? res.data.stats?.expiredMembers ?? 0,
          totalPendingDues: res.data.totalPendingDues ?? res.data.stats?.totalUdhaari ?? 0,
          monthlyRevenue: res.data.monthlyRevenue ?? res.data.stats?.monthRevenue ?? 0,
          expiringSoonMembers: res.data.expiringSoonMembers || res.data.expiringList || [],
          expiredMembers: res.data.expiredMembers || res.data.expiredList || [],
          pendingDueMembers: res.data.pendingDueMembers || res.data.udhaariList || [],
          recentPayments: res.data.recentPayments || [],
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getWhatsAppReminderUrl = (member, type) => {
    const cleanPhone = (member.phone || '').replace(/\D/g, '').slice(-10);
    const gymName = gym?.gymName || 'Iron Paradise Fitness';
    const upiId = gym?.upiId || 'ironparadise@okaxis';
    const expiryDateStr = new Date(member.endDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    let msg = '';
    if (type === 'due') {
      msg = `Namaste ${member.name} ji! 🙏\n` +
        `Gentle reminder from *${gymName}*:\n` +
        `Aapka gym fees balance: *₹${member.dueAmount}* pending hai.\n\n` +
        `Aap direct UPI se pay kar sakte hain:\n` +
        `👉 UPI ID: *${upiId}*\n\n` +
        `Payment ke baad confirm karein. Thank you! 💪`;
    } else if (type === 'expiring') {
      msg = `Namaste ${member.name} ji! 🏋️‍♂️\n` +
        `Aapki *${gymName}* ki membership *${member.diffDays} dino me expire* hone wali hai (${expiryDateStr}).\n\n` +
        `Apna workout routine continue rakhne ke liye time se renew karayein.\n` +
        `👉 UPI ID: *${upiId}*\n\n` +
        `Best regards,\nTeam ${gymName}`;
    } else {
      msg = `Namaste ${member.name} ji! 💪\n` +
        `Hum aapko *${gymName}* me miss kar rahe hain! Aapki membership ${expiryDateStr} ko expire ho gayi thi.\n\n` +
        `Is hafte renew karayein aur updated Indian Gym Diet Plan paayein!\n` +
        `Team ${gymName}`;
    }

    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  const currentMembersList =
    activeTab === 'EXPIRING'
      ? data.expiringSoonMembers
      : activeTab === 'EXPIRED'
        ? data.expiredMembers
        : data.pendingDueMembers;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-white font-['Outfit']">
              {gym?.gymName || 'Iron Paradise Fitness'} 👋
            </h1>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-neon-green/20 text-neon-green border border-neon-green/30">
              Live Control Panel
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Owner: <span className="text-slate-200 font-semibold">{gym?.ownerName || gym?.name || 'Admin'}</span> • UPI: <span className="text-neon-cyan font-mono">{gym?.upiId || 'gym@upi'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToMembers('Udhaari')}
            className="px-3.5 py-2.5 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500 text-amber-400 hover:text-dark-950 border border-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <IndianRupee className="h-4 w-4" />
            Udhaari Book (₹{data.totalPendingDues})
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green flex items-center gap-1.5 transition-all active:scale-95"
          >
            <PlusCircle className="h-4 w-4" />
            Add Member (10s)
          </button>
        </div>
      </div>

      {/* Top 5 KPI StatCards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Members"
          value={data.activeCount}
          subtext="Regular Lifters"
          icon={Users}
          variant="emerald"
          onClick={() => onNavigateToMembers('Active')}
        />

        <StatCard
          title="Expiring (5d)"
          value={data.expiringSoonCount}
          subtext="Needs Renewal Followup"
          icon={AlertTriangle}
          variant="amber"
          onClick={() => setActiveTab('EXPIRING')}
        />

        <StatCard
          title="Expired"
          value={data.expiredCount}
          subtext="Win-back Candidates"
          icon={UserX}
          variant="rose"
          onClick={() => setActiveTab('EXPIRED')}
        />

        <StatCard
          title="Total Udhaari"
          value={`₹${data.totalPendingDues}`}
          subtext="Pending Unpaid Dues"
          icon={IndianRupee}
          variant="rose"
          onClick={() => setActiveTab('UDHAARI')}
        />

        <StatCard
          title="Month Collection"
          value={`₹${data.monthlyRevenue}`}
          subtext="Cash & UPI Revenue"
          icon={TrendingUp}
          variant="cyan"
          onClick={() => { }}
        />
      </div>

      {/* 3 Alert Tabs (*Expiring Soon*, *Expired*, *Pending Udhaari*) */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-dark-700">
          <div>
            <h2 className="text-base font-extrabold text-white font-['Outfit']">
              Priority Member Action Center
            </h2>
            <p className="text-xs text-slate-400">
              1-Click WhatsApp follow-ups with pre-filled Hinglish messages & UPI ID
            </p>
          </div>

          {/* Segmented Alert Tabs */}
          <div className="flex items-center gap-1.5 bg-dark-900 p-1.5 rounded-xl border border-dark-700">
            <button
              onClick={() => setActiveTab('EXPIRING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'EXPIRING'
                  ? 'bg-amber-500 text-dark-950 shadow'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Expiring Soon ({data.expiringSoonMembers.length})
            </button>

            <button
              onClick={() => setActiveTab('EXPIRED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'EXPIRED'
                  ? 'bg-rose-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Expired ({data.expiredMembers.length})
            </button>

            <button
              onClick={() => setActiveTab('UDHAARI')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'UDHAARI'
                  ? 'bg-cyan-500 text-dark-950 shadow'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Pending Udhaari ({data.pendingDueMembers.length})
            </button>
          </div>
        </div>

        {/* Members List for the active alert tab */}
        <div className="space-y-3">
          {currentMembersList.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              🎉 No members in this section! Everything is up to date.
            </div>
          ) : (
            currentMembersList.slice(0, 10).map((m) => (
              <div
                key={m._id}
                className="p-4 rounded-xl bg-dark-900 border border-dark-700/80 hover:border-dark-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100">{m.name}</span>
                    <span className="text-xs text-slate-400 font-mono">📱 {m.phone}</span>
                    {m.dueAmount > 0 && (
                      <span className="text-[11px] font-black text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30">
                        ₹{m.dueAmount} Udhaari
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Plan: <span className="text-slate-300 font-medium">{m.planName}</span> •{' '}
                    {m.diffDays < 0 ? (
                      <span className="text-rose-400 font-semibold">
                        Expired {Math.abs(m.diffDays)} days ago
                      </span>
                    ) : (
                      <span className="text-amber-400 font-semibold">
                        Expires in {m.diffDays} days ({new Date(m.endDate).toLocaleDateString('en-IN')})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Zero-Cost 1-Click WhatsApp Button */}
                  <a
                    href={getWhatsAppReminderUrl(
                      m,
                      activeTab === 'UDHAARI' ? 'due' : activeTab === 'EXPIRING' ? 'expiring' : 'expired'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <MessageSquare className="h-3.5 w-3.5 fill-dark-950" />
                    <span>WhatsApp Reminder</span>
                  </a>

                  {/* 1-Click Renew */}
                  <button
                    onClick={() => onOpenRenewModal(m)}
                    className="p-2 rounded-xl bg-dark-800 hover:bg-neon-green/20 text-slate-300 hover:text-neon-green border border-dark-700 transition-colors text-xs"
                    title="1-Click Renew"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>

                  {/* Settle Due if pending */}
                  {m.dueAmount > 0 && (
                    <button
                      onClick={() => onOpenClearDueModal(m)}
                      className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold text-xs"
                    >
                      Clear Due
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
