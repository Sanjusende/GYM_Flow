import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import { loadRazorpayScript } from '../utils/razorpay';
import confetti from 'canvas-confetti';
import {
  X,
  Zap,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  AlertTriangle,
  Lock,
  ArrowRight,
  Loader2,
} from 'lucide-react';

const UpgradePlanModal = ({ isOpen, onClose, onPaymentSuccess }) => {
  const { gym, updateGymSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Calculate days remaining in free trial
  const getTrialDaysRemaining = () => {
    if (!gym?.trialEndsAt) return 0;
    const diff = new Date(gym.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const isExpired =
    gym?.subscriptionStatus === 'expired' ||
    (gym?.subscriptionStatus === 'trial' && getTrialDaysRemaining() <= 0);

  const daysLeft = getTrialDaysRemaining();

  /**
   * Razorpay Checkout Flow:
   * Always opens the real Razorpay modal with UPI, Cards, NetBanking, and Wallets.
   */
  const handlePayment = async () => {
    try {
      setErrorMsg('');
      setLoading(true);

      // 1. Ensure Razorpay Checkout SDK is loaded
      const sdkReady = await loadRazorpayScript();
      if (!sdkReady) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      // 2. Request backend order creation
      const orderRes = await axiosInstance.post('/payment/create-order');
      if (!orderRes.data.success) {
        throw new Error(orderRes.data.message || 'Failed to initialize subscription order.');
      }

      const { order, key, plan } = orderRes.data;

      // 3. Resolve Razorpay Public Key (never secret)
      const razorpayKey =
        orderRes.data.key ||
        import.meta.env.VITE_RAZORPAY_KEY_ID ||
        'rzp_test_TrnCiE9i67RID6';

      const orderId = orderRes.data.order_id || orderRes.data.order?.id;

      // 4. Configure Standard Razorpay Checkout Options
      const options = {
        key: razorpayKey,
        amount: orderRes.data.amount || order?.amount || 99900,
        currency: orderRes.data.currency || order?.currency || 'INR',
        name: 'GymFlow SaaS',
        description: plan?.name || 'Pro Monthly Gym Management Subscription',
        image: 'https://cdn-icons-png.flaticon.com/512/2964/2964514.png',
        ...(orderId ? { order_id: orderId } : {}),
        prefill: {
          name: gym?.ownerName || gym?.gymName || '',
          email: gym?.email || '',
          contact: gym?.phone || '',
        },
        theme: {
          color: '#00F59B', // GymFlow signature Neon Green
        },
        modal: {
          backdropclose: false,
          ondismiss: () => {
            setLoading(false);
            console.log('Razorpay modal closed by user');
          },
        },
        handler: async (response) => {
          try {
            setVerifying(true);

            // 5. Send verification payload (all three fields) to backend
            const verifyRes = await axiosInstance.post('/payment/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              confetti({
                particleCount: 140,
                spread: 85,
                origin: { y: 0.6 },
                colors: ['#00F59B', '#10B981', '#3B82F6', '#F59E0B'],
              });

              if (verifyRes.data.gym) {
                updateGymSession(verifyRes.data.gym);
              }

              onPaymentSuccess?.(verifyRes.data.gym);
              onClose();
            } else {
              setErrorMsg(verifyRes.data.message || 'Payment signature verification failed.');
            }
          } catch (err) {
            console.error('Payment verification failed:', err);
            setErrorMsg(
              err.response?.data?.message || 'Server verification failed. Please contact support.'
            );
          } finally {
            setVerifying(false);
            setLoading(false);
          }
        },
      };

      // 6. Open Razorpay Checkout Window
      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', (response) => {
        setErrorMsg(`Payment Failed: ${response.error?.description || 'Transaction was declined.'}`);
        setLoading(false);
      });

      paymentObject.open();
    } catch (err) {
      console.error('Payment initialization error:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to open Razorpay checkout modal.');
      setLoading(false);
    }
  };

  const handleInstantTestUpgrade = async () => {
    try {
      setErrorMsg('');
      setVerifying(true);

      const fakePaymentId = `pay_test_${Date.now()}`;
      const verifyRes = await axiosInstance.post('/payment/verify-payment', {
        razorpay_payment_id: fakePaymentId,
      });

      if (verifyRes.data.success) {
        confetti({
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#00F59B', '#10B981', '#3B82F6', '#F59E0B'],
        });

        if (verifyRes.data.gym) {
          updateGymSession(verifyRes.data.gym);
        }

        onPaymentSuccess?.(verifyRes.data.gym);
        onClose();
      } else {
        setErrorMsg(verifyRes.data.message || 'Verification failed.');
      }
    } catch (err) {
      console.error('Test upgrade failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to activate test subscription.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-dark-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-neon-green/30 bg-dark-900/95 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-neon-green/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-neon-cyan/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        {!isExpired && (
          <button
            onClick={onClose}
            disabled={loading || verifying}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-dark-800 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-bold tracking-wide">
            <Zap className="h-3.5 w-3.5 fill-neon-green" />
            GYMFLOW PRO SUBSCRIPTION
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
            {isExpired ? 'Subscription Expired' : 'Upgrade to GymFlow Pro'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
            {isExpired
              ? 'Your 30-day free trial has expired. Upgrade to the monthly plan for ₹999/month to unlock uninterrupted access.'
              : `You are currently on a 30-day free trial (${daysLeft} days remaining). Upgrade anytime to guarantee uninterrupted service.`}
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mt-6 p-5 rounded-2xl bg-gradient-to-b from-dark-800/90 to-dark-800/40 border border-dark-700 relative">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-xs font-bold text-neon-green tracking-wider uppercase">
                Pro Monthly Plan
              </span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
                  ₹999
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ month</span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
                Flat Pricing • No Hidden Fees
              </span>
              <p className="text-[10px] text-slate-400 mt-1">Cancel anytime</p>
            </div>
          </div>

          {/* Features Included */}
          <div className="mt-4 pt-4 border-t border-dark-700/80 space-y-2.5">
            {[
              'Unlimited Gym Members & Batch Scheduling',
              '1-Click WhatsApp Automated Fee Expiry Reminders',
              'Integrated UPI QR Code & Direct Bank Payments',
              'Gemini AI Indian Gym Diet Plan Generator',
              'Branded Member Self-Service Portal Access',
              'Automated Daily Cloud Backups & Zero Downtime',
            ].map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-slate-200">
                <CheckCircle2 className="h-4 w-4 text-neon-green shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Error message display */}
        {errorMsg && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 space-y-2.5">
          <button
            onClick={handlePayment}
            disabled={loading || verifying}
            className="w-full py-3.5 px-4 rounded-xl font-extrabold text-sm bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading || verifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{verifying ? 'Verifying Payment...' : 'Opening Razorpay Checkout...'}</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Pay ₹999 with Razorpay (UPI / Cards)</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* 1-Click Instant Upgrade for Testing/Demo */}
          <button
            type="button"
            onClick={handleInstantTestUpgrade}
            disabled={loading || verifying}
            className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-dark-800 hover:bg-dark-750 text-neon-green border border-neon-green/30 hover:border-neon-green/60 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
          >
            <Zap className="h-3.5 w-3.5 fill-neon-green" />
            <span>⚡ 1-Click Instant Upgrade (Test / Demo Mode)</span>
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-500">
          <div className="flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-neon-green" />
            <span>256-bit Razorpay Encryption</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3.5 w-3.5 text-neon-cyan" />
            <span>UPI, Cards, NetBanking Supported</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePlanModal;
