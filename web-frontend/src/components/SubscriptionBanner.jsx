import React from 'react';
import { Sparkles, AlertTriangle, Clock, ArrowRight, ShieldCheck } from 'lucide-react';

const SubscriptionBanner = ({ gym, onOpenUpgrade }) => {
  if (!gym) return null;

  const now = new Date();
  const trialEnds = gym.trialEndsAt ? new Date(gym.trialEndsAt) : null;
  const subExpires = gym.subscriptionExpiresAt ? new Date(gym.subscriptionExpiresAt) : null;

  // Calculate days left
  let daysLeft = 0;
  let status = gym.subscriptionStatus || 'trial';

  if (status === 'active') {
    if (subExpires) {
      const diff = subExpires.getTime() - now.getTime();
      daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      if (diff <= 0) status = 'expired';
    }
  } else if (status === 'trial') {
    if (trialEnds) {
      const diff = trialEnds.getTime() - now.getTime();
      daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      if (diff <= 0) status = 'expired';
    }
  }

  // Active status display
  if (status === 'active') {
    const formattedExpiry = subExpires
      ? subExpires.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Lifetime';

    return (
      <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fade-in">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div className="text-xs">
            <span className="font-extrabold text-emerald-300">GymFlow Pro Active</span>
            <span className="text-slate-300 ml-1.5">
              • Full access unlocked until <strong className="text-white">{formattedExpiry}</strong> ({daysLeft} days remaining)
            </span>
          </div>
        </div>

        <button
          onClick={onOpenUpgrade}
          className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 self-start sm:self-auto hover:underline"
        >
          <span>Extend Subscription</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    );
  }

  // Expired status display
  if (status === 'expired') {
    return (
      <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white">
              🚨 30-Day Free Trial Expired
            </h4>
            <p className="text-[11px] sm:text-xs text-rose-200/90 mt-0.5">
              Adding new members, renewals, and automated WhatsApp features are temporarily locked. Upgrade to Pro for ₹999/month.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUpgrade}
          className="px-4 py-2 rounded-xl text-xs font-black bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 shrink-0"
        >
          <span>Upgrade to Pro Now</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  // Trial status display
  return (
    <div className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-neon-green/10 via-neon-cyan/10 to-dark-800 border border-neon-green/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 animate-fade-in">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-xl bg-neon-green/20 text-neon-green shrink-0">
          <Clock className="h-4 w-4" />
        </div>
        <div className="text-xs">
          <span className="font-extrabold text-white">⏳ 30-Day Free Trial:</span>
          <span className="text-slate-300 ml-1.5">
            You have <strong className="text-neon-green">{daysLeft} days remaining</strong>. Upgrade to GymFlow Pro (₹999/mo) anytime for uninterrupted access.
          </span>
        </div>
      </div>

      <button
        onClick={onOpenUpgrade}
        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-neon-green/20 hover:bg-neon-green text-neon-green hover:text-dark-950 border border-neon-green/40 flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto shrink-0"
      >
        <Sparkles className="h-3.5 w-3.5" />
        <span>Upgrade to Pro (₹999)</span>
      </button>
    </div>
  );
};

export default SubscriptionBanner;
