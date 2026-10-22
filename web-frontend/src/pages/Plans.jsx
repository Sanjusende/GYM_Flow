import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { CreditCard, Plus, Clock, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planName, setPlanName] = useState('');
  const [durationInDays, setDurationInDays] = useState(30);
  const [price, setPrice] = useState(1500);
  const [submitting, setSubmitting] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/plans');
      if (res.data.success) {
        setPlans(res.data.plans);
      }
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await axiosInstance.post('/plans', {
        planName,
        durationInDays: Number(durationInDays),
        price: Number(price),
      });

      if (res.data.success) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
        });
        setPlanName('');
        setIsModalOpen(false);
        fetchPlans();
      }
    } catch (err) {
      console.error('Failed to create plan', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await axiosInstance.delete(`/plans/${planId}`);
      fetchPlans();
    } catch (err) {
      console.error('Failed to delete plan', err);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white font-['Outfit'] flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-neon-green" />
            Gym Membership Plans
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure 1 Month (30d), 3 Months (90d), 6 Months (180d), and Annual packages.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl text-xs font-bold bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green flex items-center gap-2 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          Create New Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="glass-panel p-6 rounded-2xl border border-dark-700 hover:border-neon-green/40 transition-all flex flex-col justify-between group relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-dark-900 text-slate-300 border border-dark-700 flex items-center gap-1.5">
                  <Clock className="h-3 w-3 text-neon-green" />
                  {plan.durationInDays || 30} Days
                </span>

                <button
                  onClick={() => handleDeletePlan(plan._id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all"
                  title="Delete Plan"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <h3 className="text-lg font-bold text-white font-['Outfit']">{plan.planName || plan.name}</h3>

              <div className="my-5 flex items-baseline gap-1">
                <span className="text-3xl font-black text-neon-green font-['Outfit']">
                  ₹{plan.price}
                </span>
                <span className="text-xs text-slate-500">/ {plan.durationInDays || 30}d</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel-neon w-full max-w-md rounded-2xl p-6 text-slate-100 shadow-2xl">
            <h2 className="text-lg font-extrabold tracking-tight font-['Outfit'] mb-1">
              Create Membership Plan
            </h2>
            <p className="text-xs text-slate-400 mb-4">Add a new gym package duration and price</p>

            <form onSubmit={handleCreatePlan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3 Months Transformation"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={durationInDays}
                    onChange={(e) => setDurationInDays(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-sm glass-input font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-sm glass-input font-bold text-neon-green"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-neon-green text-dark-950 shadow-neon-green"
                >
                  {submitting ? 'Creating...' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Plans;
