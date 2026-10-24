import React, { useState, useEffect } from 'react';
import { X, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

const AddMemberModal = ({ isOpen, onClose, onMemberAdded, plans = [] }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('Male');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [totalFee, setTotalFee] = useState(1500);
  const [paidAmount, setPaidAmount] = useState(1500);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0]._id);
      setTotalFee(plans[0].price);
      setPaidAmount(plans[0].price);
    }
  }, [plans]);

  const handlePlanChange = (planId) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p._id === planId);
    if (plan) {
      setTotalFee(plan.price);
      setPaidAmount(plan.price);
    }
  };

  const dueAmount = Math.max(0, Number(totalFee) - Number(paidAmount || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Member name is required.');
      return;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }
    if (!selectedPlanId) {
      setError('Please select a membership plan.');
      return;
    }

    setLoading(true);
    try {
      await onMemberAdded({
        name: name.trim(),
        phone: cleanPhone.slice(-10),
        gender,
        currentPlan: selectedPlanId,
        planId: selectedPlanId,
        totalFee: Number(totalFee),
        paidAmount: Number(paidAmount || 0),
        paymentMode,
        startDate,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#00F59B'],
      });

      setName('');
      setPhone('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="glass-panel-neon w-full max-w-lg rounded-2xl p-4 sm:p-6 relative max-h-[92vh] overflow-y-auto text-slate-100 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-700">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-neon-green/20 text-neon-green flex items-center justify-center">
              <Zap className="h-5 w-5 fill-neon-green" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight font-['Outfit'] flex items-center gap-2">
                Fast Member Entry
                <span className="text-[10px] font-bold bg-neon-green/10 text-neon-green px-2 py-0.5 rounded-full border border-neon-green/30">
                  ⚡ 10 SECONDS
                </span>
              </h2>
              <p className="text-xs text-slate-400">Quickly register member and create initial receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Full Name <span className="text-neon-green">*</span>
              </label>
              <input
                type="text"
                required
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Phone Number <span className="text-neon-green">*</span>
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 98201 11223"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-medium bg-dark-900"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Membership Plan <span className="text-neon-green">*</span>
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-sm glass-input font-medium bg-dark-900"
              >
                {plans.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.planName || p.name} ({p.durationInDays || 30} Days) — ₹{p.price}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing & Udhaari Box */}
          <div className="p-3.5 rounded-xl bg-dark-950/70 border border-dark-700 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Plan Price (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={totalFee}
                  onChange={(e) => setTotalFee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm glass-input font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Paid Now (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm glass-input font-bold text-neon-green"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                  Pending Due (Udhaari)
                </label>
                <div
                  className={`px-3 py-2 rounded-lg text-sm font-bold border ${
                    dueAmount > 0
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  ₹{dueAmount}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-dark-800">
              <span className="text-xs text-slate-400 font-medium">Payment Mode:</span>
              <div className="flex items-center gap-1.5">
                {['UPI', 'Cash'].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMode(mode)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      paymentMode === mode
                        ? 'bg-neon-green text-dark-950'
                        : 'bg-dark-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 fill-dark-950" />
              {loading ? 'Adding...' : 'Save Member (⚡ 10s)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
