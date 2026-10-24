import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react';

const ForgotPasswordModal = ({ isOpen, onClose, initialEmail = '', onSuccess }) => {
  const { forgotPassword, resetPassword } = useAuth();

  const [step, setStep] = useState('EMAIL'); // 'EMAIL' | 'RESET' | 'SUCCESS'
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }

    setLoading(true);
    const res = await forgotPassword(email.trim().toLowerCase());
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`We have sent a 6-digit reset OTP to ${email.trim().toLowerCase()}.`);
      setStep('RESET');
    } else {
      setError(res.message || 'Failed to send OTP. Please check your email.');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setResendLoading(true);
    const res = await forgotPassword(email.trim().toLowerCase());
    setResendLoading(false);

    if (res.success) {
      setSuccessMsg('A fresh 6-digit reset OTP has been sent to your email.');
    } else {
      setError(res.message || 'Failed to resend OTP.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    setLoading(true);
    const res = await resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
    setLoading(false);

    if (res.success) {
      setStep('SUCCESS');
      if (onSuccess) {
        onSuccess(email.trim().toLowerCase());
      }
    } else {
      setError(res.message || 'Password reset failed. Please verify your OTP.');
    }
  };

  const handleClose = () => {
    setError('');
    setSuccessMsg('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setStep('EMAIL');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
        {/* Top Glow Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-neon-green via-emerald-400 to-cyan-500" />

        {/* Modal Header */}
        <div className="p-6 pb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">
                {step === 'SUCCESS' ? 'Password Reset Complete' : 'Reset Account Password'}
              </h3>
              <p className="text-xs text-slate-400">
                {step === 'EMAIL' && 'Enter your registered email to receive an OTP code'}
                {step === 'RESET' && 'Verify 6-digit OTP and choose a new password'}
                {step === 'SUCCESS' && 'Your credentials have been securely updated'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 pt-2 space-y-4">
          {/* Error Banner */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Success / Info Banner */}
          {successMsg && step !== 'SUCCESS' && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-start gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 'EMAIL' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Gym Owner Email <span className="text-neon-green">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@yourgym.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  We'll send a 6-digit verification code valid for 10 minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Sending Reset OTP...
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: Enter OTP & New Password */}
          {step === 'RESET' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Recipient Notice */}
              <div className="p-2.5 rounded-xl bg-dark-800 border border-dark-700 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Target: <strong className="text-neon-green font-mono">{email}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep('EMAIL');
                    setError('');
                  }}
                  className="text-xs text-slate-400 hover:text-white underline font-semibold"
                >
                  Change
                </button>
              </div>

              {/* 6-digit OTP */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                  Enter 6-Digit Reset Code
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  autoFocus
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  className="w-full py-3 rounded-xl text-2xl font-black text-center font-mono tracking-[0.4em] glass-input text-neon-green placeholder:tracking-widest"
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Password <span className="text-neon-green">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm glass-input font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Confirm New Password <span className="text-neon-green">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm glass-input font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6 || newPassword.length < 6}
                className="w-full py-3 rounded-xl text-sm font-bold bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Set New Password & Confirm</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep('EMAIL');
                    setError('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  ← Back to Email
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className="text-neon-green hover:underline font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${resendLoading ? 'animate-spin' : ''}`} />
                  {resendLoading ? 'Resending...' : 'Resend Code'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: SUCCESS STATE */}
          {step === 'SUCCESS' && (
            <div className="text-center py-4 space-y-4">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Password Updated!</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Your GymFlow account password has been reset successfully. You can now sign in with your new password.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-3 rounded-xl text-sm font-bold bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green transition-all"
              >
                Sign In Now →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
