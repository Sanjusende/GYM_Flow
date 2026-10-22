import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import MemberTable from '../components/MemberTable';
import { Users, Plus, Download, RefreshCw } from 'lucide-react';

const Members = ({
  gym,
  initialFilter = 'ALL',
  onOpenAddModal,
  onOpenRenewModal,
  onOpenClearDueModal,
  onViewDiet,
}) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setActiveFilter(initialFilter);
  }, [initialFilter]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/members', {
        params: {
          search: searchQuery,
          filter: activeFilter === 'ALL' ? undefined : activeFilter,
        },
      });
      if (res.data.success) {
        setMembers(res.data.members);
      }
    } catch (err) {
      console.error('Failed to fetch members', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers();
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white font-['Outfit'] flex items-center gap-2">
            <Users className="h-6 w-6 text-neon-green" />
            Members Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage registrations, 1-click renewals, WhatsApp reminders, and Udhaari balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchMembers}
            className="p-2.5 rounded-xl border border-dark-700 hover:border-dark-600 bg-dark-800 text-slate-300 hover:text-white transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add Member (10s)
          </button>
        </div>
      </div>

      {/* Member Table Component */}
      <MemberTable
        members={members}
        gym={gym}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onRenew={onOpenRenewModal}
        onClearDue={onOpenClearDueModal}
        onViewDiet={onViewDiet}
      />
    </div>
  );
};

export default Members;
