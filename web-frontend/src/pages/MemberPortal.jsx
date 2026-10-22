import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  Phone,
  Search,
  Sparkles,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  IndianRupee,
  Printer,
  ArrowRight,
  Dumbbell,
  RefreshCw,
  Copy,
  Check,
  QrCode,
} from 'lucide-react';

const MemberPortal = () => {
  const [phone, setPhone] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dietLoading, setDietLoading] = useState(false);
  const [error, setError] = useState('');
  const [upiCopied, setUpiCopied] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('Muscle Gain');
  const [selectedDietType, setSelectedDietType] = useState('Non-Veg');
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    const clean = phone.replace(/\D/g, '').slice(-10);

    if (clean.length < 10) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get(`/public/member/${clean}`);
      if (res.data.success) {
        setMemberData(res.data);
      }
    } catch (err) {
      setMemberData(null);
      setError(
        err.response?.data?.message ||
          'No gym membership found for this phone number. Please check with your gym reception.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDiet = async (forceRefresh = false) => {
    if (!memberData?.member?.id) return;

    setDietLoading(true);
    try {
      const res = await axiosInstance.post(
        `/public/member/${memberData.member.id}/diet`,
        {
          goal: selectedGoal,
          dietType: selectedDietType,
          forceRefresh,
        }
      );

      if (res.data.success && res.data.dietPlan) {
        setMemberData((prev) => ({
          ...prev,
          member: {
            ...prev.member,
            aiDietPlan: res.data.dietPlan,
          },
        }));
      }
    } catch (err) {
      console.error('Diet generation error', err);
    } finally {
      setDietLoading(false);
    }
  };

  const member = memberData?.member;
  const gym = memberData?.gym;
  const payments = memberData?.payments || [];

  const copyDiet = () => {
    if (member?.aiDietPlan?.generatedPlan) {
      navigator.clipboard.writeText(member.aiDietPlan.generatedPlan);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 animate-fade-in w-full px-2 sm:px-0">
      {/* Header Banner */}
      <div className="text-center py-6 no-print">
        <div className="inline-flex p-3 rounded-2xl bg-neon-green/10 text-neon-green border border-neon-green/30 mb-3">
          <Dumbbell className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-black text-white font-['Outfit'] tracking-tight">
          Public Member Self-Service Portal
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
          Enter your 10-digit registered phone number to check membership validity, fee receipts, and generate your 7-day Indian Diet Chart.
        </p>

        {/* 10-Digit Phone Search Form */}
        <form onSubmit={handleSearch} className="mt-6 max-w-md mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="tel"
              required
              placeholder="Enter 10-digit Phone No. (e.g. 9820111223)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-sm glass-input font-medium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-xl text-sm font-bold bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {loading ? 'Checking...' : 'Check'}
          </button>
        </form>

        {error && (
          <div className="mt-4 max-w-md mx-auto p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}
      </div>

      {/* Member Details Found */}
      {member && (
        <div className="space-y-6">
          {/* Digital Membership Pass Card */}
          <div className="glass-panel-neon p-6 sm:p-8 rounded-3xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-700/80 pb-6">
              <div>
                <span className="text-[11px] font-bold text-neon-green uppercase tracking-wider">
                  {gym?.gymName || 'Iron Paradise Fitness'}
                </span>
                <h2 className="text-2xl font-black text-white font-['Outfit'] mt-0.5">
                  {member.name}
                </h2>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>📱 {member.phone}</span>
                  <span>•</span>
                  <span>Plan: {member.planName}</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="self-start sm:self-auto">
                {member.status === 'Active' && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    ACTIVE ({member.diffDays} Days Left)
                  </span>
                )}
                {member.status === 'Expiring_Soon' && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" />
                    EXPIRING IN {member.diffDays} DAYS
                  </span>
                )}
                {member.status === 'Expired' && (
                  <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5">
                    <XCircle className="h-4 w-4" />
                    MEMBERSHIP EXPIRED
                  </span>
                )}
              </div>
            </div>

            {/* Validity Timeline */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-6 border-b border-dark-700/80">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Started On</span>
                <div className="text-base font-bold text-slate-200 mt-1">
                  {new Date(member.startDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Valid Until</span>
                <div className="text-base font-bold text-neon-green mt-1">
                  {new Date(member.endDate).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase">
                  Pending Udhaari (Due)
                </span>
                <div
                  className={`text-base font-black mt-1 ${
                    member.dueAmount > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  ₹{member.dueAmount}{' '}
                  {member.dueAmount === 0 && <span className="text-xs font-medium">✓ Fully Cleared</span>}
                </div>
              </div>
            </div>

            {/* UPI Payment & QR Code Scanner CTA if dueAmount > 0 */}
            {member.dueAmount > 0 && (
              <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-rose-500/10 via-dark-900 to-dark-900 border border-rose-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-dark-700/80 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400">
                      <IndianRupee className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Outstanding Fee Due: <span className="text-rose-400 font-extrabold font-mono">₹{member.dueAmount}</span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        Scan the official Gym UPI QR code below with GPay, PhonePe, Paytm, or BHIM
                      </p>
                    </div>
                  </div>

                  {memberData?.upiDeepLink && (
                    <a
                      href={memberData.upiDeepLink}
                      className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-neon-green text-dark-950 shadow-neon-green flex items-center justify-center gap-1.5 self-start sm:self-auto transition-transform active:scale-95"
                    >
                      <span>Pay ₹{member.dueAmount} via UPI App</span>
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {/* QR Scanner Display Card */}
                <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-dark-950/80 border border-dark-700">
                  <div className="relative group shrink-0">
                    <div className="p-2 rounded-2xl bg-white border-2 border-neon-green/50 shadow-neon-green/20 shadow-lg">
                      <img
                        src={
                          gym?.upiQrCodeUrl ||
                          `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
                            `upi://pay?pa=${gym?.upiId || 'ironparadise@okaxis'}&pn=${encodeURIComponent(
                              gym?.gymName || 'GymFlow'
                            )}&am=${member.dueAmount}&cu=INR`
                          )}`
                        }
                        alt="Gym UPI QR Code"
                        className="h-36 w-36 object-contain rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-neon-green/10 text-neon-green border border-neon-green/30">
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Official UPI Payment QR</span>
                    </div>

                    <h5 className="text-sm font-extrabold text-white">
                      Instant Receipt & Clearance
                    </h5>
                    <p className="text-xs text-slate-400 max-w-md">
                      Scan this QR code using any UPI app to transfer <strong className="text-white">₹{member.dueAmount}</strong> directly to gym account.
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                      <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1.5 rounded-lg border border-cyan-500/30">
                        {gym?.upiId || 'ironparadise@okaxis'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(gym?.upiId || 'ironparadise@okaxis');
                          setUpiCopied(true);
                          setTimeout(() => setUpiCopied(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-dark-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        {upiCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        {upiCopied ? 'Copied UPI!' : 'Copy UPI'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Gemini AI 7-Day Indian Gym Diet Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Sparkles className="h-5 w-5 fill-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-['Outfit']">
                    Gemini 2.5 Flash 7-Day Indian Diet Plan
                  </h3>
                  <p className="text-xs text-slate-400">
                    Budget-friendly Indian bodybuilding & fat loss chart (Paneer, Soya, Dal, Oats, Eggs, Roti)
                  </p>
                </div>
              </div>

              {member.aiDietPlan && (
                <div className="flex items-center gap-2 no-print">
                  <button
                    onClick={copyDiet}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-dark-800 text-slate-300 hover:text-white border border-dark-700 flex items-center gap-1.5"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-dark-800 hover:bg-dark-700 text-slate-200 border border-dark-700 flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print PDF
                  </button>
                </div>
              )}
            </div>

            {/* Diet Generator Controls if not yet generated or want to re-customize */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-dark-900 rounded-2xl border border-dark-700 no-print">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fitness Goal</label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input font-medium bg-dark-950"
                >
                  <option value="Muscle Gain">Muscle Gain & Bulking</option>
                  <option value="Fat Loss & Lean Muscle">Fat Loss & Toning</option>
                  <option value="Strength Training">Pure Strength</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Dietary Preference</label>
                <select
                  value={selectedDietType}
                  onChange={(e) => setSelectedDietType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs glass-input font-medium bg-dark-950"
                >
                  <option value="Pure Veg">Pure Veg (Paneer, Soya, Dal, Sprouts)</option>
                  <option value="Eggetarian">Eggetarian (Eggs + Veg)</option>
                  <option value="Non-Veg">Non-Veg (Chicken, Eggs, Fish)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => handleGenerateDiet(true)}
                  disabled={dietLoading}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-dark-950 shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${dietLoading ? 'animate-spin' : ''}`} />
                  {dietLoading ? 'Cooking with AI...' : (member.aiDietPlan ? 'Regenerate Diet' : 'Generate Diet Chart')}
                </button>
              </div>
            </div>

            {/* Diet Plan Output */}
            {member.aiDietPlan?.generatedPlan ? (
              <div className="p-5 rounded-2xl bg-dark-900 border border-dark-700 text-xs sm:text-sm font-mono whitespace-pre-wrap leading-relaxed text-slate-200">
                {member.aiDietPlan.generatedPlan}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Select your fitness goal and diet preference above, then click <strong>"Generate Diet Chart"</strong>!
              </div>
            )}
          </div>

          {/* Payment Receipts History */}
          <div className="glass-panel p-6 rounded-3xl border border-dark-700 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-neon-green" />
              Official Payment Receipts & History
            </h3>

            <div className="space-y-2">
              {payments.length === 0 ? (
                <p className="text-xs text-slate-500 py-3">No payment records found.</p>
              ) : (
                payments.map((p) => (
                  <div
                    key={p._id}
                    className="p-3.5 rounded-xl bg-dark-900 border border-dark-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-200">
                        {p.remarks || 'Membership Payment'}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(p.paymentDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}{' '}
                        • Paid via <span className="font-semibold text-slate-300">{p.paymentMode}</span>
                      </div>
                    </div>
                    <div className="text-sm font-black text-emerald-400 font-['Outfit']">
                      ₹{p.amount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberPortal;
