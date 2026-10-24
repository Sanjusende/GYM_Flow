import React, { useState, useEffect } from 'react';
import { X, RefreshCw, IndianRupee, QrCode } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

const RenewModal = ({
  isOpen,
  onClose,
  member,
  plans = [],
  onRenewSuccess,
  onClearDueSuccess,
  initialMode = 'renew',
}) => {
  const { gym } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [totalFee, setTotalFee] = useState(1500);
  const [paidAmount, setPaidAmount] = useState(1500);
  const [clearAmount, setClearAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [showQr, setShowQr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setMode(initialMode);
      setClearAmount(member.dueAmount || 0);

      const targetPlanId = member.currentPlan?._id || member.currentPlan || member.planId;
      const currentPlan = plans.find((p) => p._id === targetPlanId) || plans[0];
      if (currentPlan) {
        setSelectedPlanId(currentPlan._id);
        setTotalFee(currentPlan.price);
        setPaidAmount(currentPlan.price);
      }
    }
  }, [member, initialMode, plans]);

  const handlePlanChange = (planId) => {
    setSelectedPlanId(planId);
    const plan = plans.find((p) => p._id === planId);
    if (plan) {
      setTotalFee(plan.price);
      setPaidAmount(plan.price);
    }
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onRenewSuccess(member._id, {
        planId: selectedPlanId,
        currentPlan: selectedPlanId,
        totalFee: Number(totalFee),
        paidAmount: Number(paidAmount || 0),
        paymentMode,
      });

      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669'],
      });

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Renewal failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearDueSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const amt = Number(clearAmount);
    if (!amt || amt <= 0) {
      setError('Please enter a valid clearance amount.');
      return;
    }
    if (amt > member.dueAmount) {
      setError(`Amount cannot exceed pending due of ₹${member.dueAmount}`);
      return;
    }

    setLoading(true);
    try {
      await onClearDueSuccess(member._id, {
        amount: amt,
        paymentMode,
      });

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B'],
      });

      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Due clearance failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !member) return null;

  const currentEndDate = new Date(member.endDate);
  const isCurrentlyExpired = currentEndDate < new Date();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="glass-panel-neon w-full max-w-md rounded-2xl p-4 sm:p-6 relative max-h-[92vh] overflow-y-auto text-slate-100 shadow-2xl my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-700">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight font-['Outfit']">
              {mode === 'renew' ? '1-Click Membership Renewal' : 'Clear Udhaari / Due'}
            </h2>
            <p className="text-xs text-slate-400">
              Member: <span className="text-white font-bold">{member.name}</span> ({member.phone})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 p-1.5 my-4 bg-dark-900 rounded-xl border border-dark-700 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setMode('renew')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'renew'
                ? 'bg-neon-green text-dark-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Renew Plan
          </button>
          <button
            type="button"
            onClick={() => setMode('clear-due')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              mode === 'clear-due'
                ? 'bg-amber-500 text-dark-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <IndianRupee className="h-3.5 w-3.5" />
            Clear Udhaari (₹{member.dueAmount})
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* RENEW FORM */}
        {mode === 'renew' && (
          <form onSubmit={handleRenewSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-dark-900 border border-dark-700 text-xs text-slate-300 flex items-center justify-between">
              <span>Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded ${
                  isCurrentlyExpired
                    ? 'bg-rose-500/10 text-rose-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}
              >
                {isCurrentlyExpired ? 'Expired' : 'Active'} (Valid till{' '}
                {currentEndDate.toLocaleDateString('en-IN')})
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Select Renewal Package
              </label>
              <select
                value={selectedPlanId}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-medium bg-dark-900"
              >
                {plans.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.planName || p.name} ({p.durationInDays || 30} Days) — ₹{p.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Plan Fee (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={totalFee}
                  onChange={(e) => setTotalFee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm glass-input font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Paid Now (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm glass-input font-bold text-neon-green"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400">Payment Mode:</span>
              <div className="flex items-center gap-1.5">
                {['UPI', 'Cash'].map((pm) => (
                  <button
                    key={pm}
                    type="button"
                    onClick={() => {
                      setPaymentMode(pm);
                      if (pm !== 'UPI') setShowQr(false);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      paymentMode === pm
                        ? 'bg-neon-green text-dark-950'
                        : 'bg-dark-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {pm}
                  </button>
                ))}
              </div>
            </div>

            {paymentMode === 'UPI' && (
              <div className="p-3 bg-dark-900/80 rounded-xl border border-dark-700 text-center">
                <button
                  type="button"
                  onClick={() => setShowQr(!showQr)}
                  className="w-full py-1.5 text-xs font-semibold text-neon-green hover:underline flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  {showQr ? 'Hide UPI QR Scanner' : 'Show Member UPI QR Code'}
                </button>
                {showQr && (
                  <div className="mt-3 flex flex-col items-center justify-center animate-fade-in">
                    {gym?.upiQrCodeUrl || gym?.upiId ? (
                      <>
                        <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-200">
                          <img
                            src={
                              gym.upiQrCodeUrl ||
                              `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                `upi://pay?pa=${gym.upiId}&pn=${encodeURIComponent(gym.gymName || 'Gym')}&am=${paidAmount}&cu=INR`
                              )}`
                            }
                            alt="Gym UPI QR Code"
                            className="w-36 h-36 object-contain"
                          />
                        </div>
                        {gym.upiId && (
                          <p className="text-[11px] text-slate-400 mt-2">
                            UPI ID: <span className="text-white font-mono font-semibold">{gym.upiId}</span>
                          </p>
                        )}
                        <p className="text-[10px] text-slate-500 mt-0.5">Member can scan with GPay, PhonePe, Paytm</p>
                      </>
                    ) : (
                      <p className="text-xs text-slate-400 py-2">
                        No UPI ID or QR configured. Add one in <strong className="text-white">Gym Settings</strong>.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                {loading ? 'Renewing...' : '1-Click Renew Now'}
              </button>
            </div>
          </form>
        )}

        {/* CLEAR DUE FORM */}
        {mode === 'clear-due' && (
          <form onSubmit={handleClearDueSubmit} className="space-y-4">
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center">
              <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                Total Pending Udhaari
              </span>
              <div className="text-3xl font-black text-amber-400 mt-1 font-['Outfit']">
                ₹{member.dueAmount}
              </div>
            </div>

            {member.dueAmount <= 0 ? (
              <div className="text-center py-6 text-slate-400 text-sm">
                ✓ Member has no pending dues!
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Clearance Amount (₹)
                  </label>
                  <input
                    type="number"
                    max={member.dueAmount}
                    min="1"
                    value={clearAmount}
                    onChange={(e) => setClearAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-lg font-bold glass-input text-amber-400"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setClearAmount(member.dueAmount)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-bold bg-dark-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-400 border border-dark-700"
                  >
                    Clear All (₹{member.dueAmount})
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-slate-400">Payment Mode:</span>
                  <div className="flex items-center gap-1.5">
                    {['UPI', 'Cash'].map((pm) => (
                      <button
                        key={pm}
                        type="button"
                        onClick={() => {
                          setPaymentMode(pm);
                          if (pm !== 'UPI') setShowQr(false);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          paymentMode === pm
                            ? 'bg-amber-500 text-dark-950'
                            : 'bg-dark-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {pm}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMode === 'UPI' && (
                  <div className="p-3 bg-dark-900/80 rounded-xl border border-dark-700 text-center">
                    <button
                      type="button"
                      onClick={() => setShowQr(!showQr)}
                      className="w-full py-1.5 text-xs font-semibold text-amber-400 hover:underline flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      {showQr ? 'Hide UPI QR Scanner' : 'Show Member UPI QR Code'}
                    </button>
                    {showQr && (
                      <div className="mt-3 flex flex-col items-center justify-center animate-fade-in">
                        {gym?.upiQrCodeUrl || gym?.upiId ? (
                          <>
                            <div className="p-2 bg-white rounded-xl shadow-lg border border-slate-200">
                              <img
                                src={
                                  gym.upiQrCodeUrl ||
                                  `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                                    `upi://pay?pa=${gym.upiId}&pn=${encodeURIComponent(gym.gymName || 'Gym')}&am=${clearAmount}&cu=INR`
                                  )}`
                                }
                                alt="Gym UPI QR Code"
                                className="w-36 h-36 object-contain"
                              />
                            </div>
                            {gym.upiId && (
                              <p className="text-[11px] text-slate-400 mt-2">
                                UPI ID: <span className="text-white font-mono font-semibold">{gym.upiId}</span>
                              </p>
                            )}
                            <p className="text-[10px] text-slate-500 mt-0.5">Member can scan with GPay, PhonePe, Paytm</p>
                          </>
                        ) : (
                          <p className="text-xs text-slate-400 py-2">
                            No UPI ID or QR configured. Add one in <strong className="text-white">Gym Settings</strong>.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-dark-950 shadow-neon-amber flex items-center gap-1.5 transition-all"
                  >
                    <IndianRupee className="h-4 w-4" />
                    {loading ? 'Recording...' : `Settle ₹${clearAmount}`}
                  </button>
                </div>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default RenewModal;
