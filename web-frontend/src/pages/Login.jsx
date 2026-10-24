import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import {
  Dumbbell,
  Zap,
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  ShieldCheck,
  QrCode,
  Upload,
  X,
  KeyRound,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

const Login = () => {
  const { login, register, verifyOtp, resendOtp, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [step, setStep] = useState('AUTH'); // 'AUTH' | 'OTP'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gymName, setGymName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiQrCodeUrl, setUpiQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // OTP state
  const [otp, setOtp] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('');

  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setUpiQrCodeUrl(reader.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isRegister) {
      const res = await register({
        name,
        gymName,
        email: email.trim().toLowerCase(),
        password,
        phone,
        upiId,
        upiQrCodeUrl,
      });

      if (res.success && res.step === 'OTP_SENT') {
        const cleanMobile = res.phone || phone.replace(/\D/g, '').slice(-10);
        const targetEmail = res.email || email.trim().toLowerCase();
        setOtpPhone(cleanMobile);
        setOtpEmail(targetEmail);
        setDevOtp(res.devOtp || '');
        setOtpSuccessMsg(`We have sent a 6-digit verification OTP to ${targetEmail}. Please check your Inbox or Spam folder.`);
        setStep('OTP');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } else {
      const res = await login(email, password);
      if (!res.success) setError(res.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification OTP.');
      return;
    }

    setOtpLoading(true);
    const res = await verifyOtp({ email: otpEmail || email.trim().toLowerCase(), phone: otpPhone }, otp.trim());
    if (!res.success) {
      setError(res.message || 'OTP verification failed. Please try again.');
    }
    setOtpLoading(false);
  };

  const handleResendOtp = async () => {
    setError('');
    setResendLoading(true);
    const res = await resendOtp({ email: otpEmail || email.trim().toLowerCase(), phone: otpPhone });
    if (res.success) {
      setDevOtp(res.devOtp || '');
      setOtpSuccessMsg(`We have sent a 6-digit verification OTP to ${res.email || otpEmail}. Please check your Inbox or Spam folder.`);
    } else {
      setError(res.message || 'Failed to resend verification OTP.');
    }
    setResendLoading(false);
  };

  const handleDemo = async () => {
    setError('');
    setDemoLoading(true);
    const res = await demoLogin();
    if (!res.success) setError(res.message);
    setDemoLoading(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-neon-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-neon-green/20 to-emerald-500/30 border border-neon-green/40 text-neon-green mb-4 shadow-neon-green">
            <Dumbbell className="h-8 w-8 stroke-[2.2]" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white font-['Outfit']">
            Gym<span className="text-neon-green">Flow</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-medium">
            Next-Gen Multi-Tenant Gym Management OS
          </p>
        </div>

        {/* 1-Click Demo Login Hero Banner */}
        <div className="mb-6">
          <button
            type="button"
            onClick={handleDemo}
            disabled={demoLoading}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-neon-green via-neon-emerald to-emerald-500 hover:from-neon-glow hover:to-neon-green text-dark-950 font-black shadow-neon-green shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-98 disabled:opacity-75 group"
          >
            <Zap className="h-6 w-6 fill-dark-950 animate-bounce" />
            <div className="text-left">
              <div className="text-base font-extrabold tracking-tight">
                {demoLoading ? 'Launching Demo Gym...' : '⚡ 1-Click Demo Login'}
              </div>
              <div className="text-[11px] font-bold text-dark-900/80 uppercase tracking-wider">
                Instant Access with 20 Realistic Indian Members
              </div>
            </div>
            <ArrowRight className="h-5 w-5 ml-auto stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="h-px bg-dark-700/80 flex-1" />
          <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
            or continue with credentials
          </span>
          <div className="h-px bg-dark-700/80 flex-1" />
        </div>

        {/* Auth or OTP Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-dark-700/60 shadow-glass">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {step === 'OTP' ? (
            /* ──────── STEP 2: 6-DIGIT OTP VERIFICATION SCREEN ──────── */
            <div className="space-y-5 animate-fade-in">
              <div className="text-center space-y-1.5">
                <div className="inline-flex p-3 rounded-2xl bg-neon-green/10 text-neon-green border border-neon-green/30 mb-1">
                  <Mail className="h-6 w-6 text-neon-green" />
                </div>
                <h2 className="text-xl font-black text-white font-['Outfit']">
                  Verify Email Address
                </h2>
                <p className="text-xs text-slate-400">
                  We have sent a 6-digit verification OTP to{' '}
                  <span className="text-neon-green font-bold font-mono">{otpEmail || email}</span>
                </p>
              </div>

              {/* Informative alert box for Inbox / Spam */}
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                <span className="leading-relaxed">
                  We have sent a 6-digit verification OTP to <strong className="text-white">{otpEmail || email}</strong>. Please check your <span className="underline text-neon-green font-bold">Inbox</span> or <span className="underline text-amber-300 font-bold">Spam folder</span>.
                </span>
              </div>


              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 text-center">
                    Enter 6-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    autoFocus
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="• • • • • •"
                    className="w-full py-3.5 rounded-xl text-2xl font-black text-center font-mono tracking-[0.4em] glass-input text-neon-green placeholder:tracking-widest"
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpLoading || otp.length < 6}
                  className="w-full py-3.5 rounded-xl text-sm font-bold bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {otpLoading ? 'Verifying OTP...' : 'Verify Email & Activate GymOS'}
                </button>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('AUTH');
                      setError('');
                    }}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ← Edit Details
                  </button>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    className="text-neon-green hover:underline font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3 w-3 ${resendLoading ? 'animate-spin' : ''}`} />
                    {resendLoading ? 'Sending fresh OTP...' : 'Resend OTP to Email'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ──────── STEP 1: AUTH CREDENTIALS / REGISTRATION FORM ──────── */
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Owner Name <span className="text-neon-green">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Vikram Rajput"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Owner Mobile Number (10 digits) <span className="text-neon-green">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 98201 11223"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Gym Name <span className="text-neon-green">*</span>
                    </label>
                    <div className="relative">
                      <Dumbbell className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={gymName}
                        onChange={(e) => setGymName(e.target.value)}
                        placeholder="e.g. Iron Paradise Fitness"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      UPI ID (For Member Dues Collection)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="e.g. ironparadise@okaxis"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm glass-input font-medium font-mono text-cyan-400"
                    />
                  </div>

                  {/* UPI QR Code Scanner Upload */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <QrCode className="h-3.5 w-3.5 text-neon-green" />
                        UPI QR Scanner Image (Optional)
                      </span>
                      {upiQrCodeUrl && (
                        <span className="text-[10px] text-emerald-400 font-bold">✓ Uploaded</span>
                      )}
                    </label>

                    {upiQrCodeUrl ? (
                      <div className="p-3 rounded-xl bg-dark-900 border border-dark-700 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={upiQrCodeUrl}
                            alt="UPI QR Scanner Preview"
                            className="h-12 w-12 rounded-lg object-contain bg-white p-1 border border-dark-600"
                          />
                          <div>
                            <p className="text-xs font-semibold text-white">UPI QR Code Ready</p>
                            <p className="text-[10px] text-slate-400">
                              Members will scan this image to pay dues
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUpiQrCodeUrl('')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove QR Image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-dark-700 hover:border-neon-green/50 rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-colors bg-dark-900/50 group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleQrUpload}
                          className="hidden"
                        />
                        <Upload className="h-5 w-5 text-slate-500 group-hover:text-neon-green transition-colors mb-1" />
                        <span className="text-xs font-medium text-slate-300 group-hover:text-white">
                          Click to upload QR Scanner Image
                        </span>
                        <span className="text-[10px] text-slate-500">
                          GPay, PhonePe, Paytm, BHIM QR (PNG/JPG)
                        </span>
                      </label>
                    )}
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address {isRegister && <span className="text-slate-400 font-normal">(6-digit OTP will be sent here)</span>} <span className="text-neon-green">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="owner@yourgym.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Password <span className="text-neon-green">*</span>
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setError('');
                      }}
                      className="text-xs text-neon-green hover:underline font-semibold transition-colors"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold bg-dark-800 hover:bg-dark-700 text-white border border-dark-600 transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
              >
                {loading
                  ? 'Processing...'
                  : isRegister
                    ? 'Proceed to OTP Verification →'
                    : 'Sign In to Dashboard'}
              </button>
            </form>
          )}

          {/* Toggle Register / Login */}
          {step === 'AUTH' && (
            <div className="mt-6 text-center text-xs text-slate-400">
              {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                }}
                className="font-bold text-neon-green hover:underline ml-1"
              >
                {isRegister ? 'Sign In' : 'Register Gym'}
              </button>
            </div>
          )}
        </div>

        {/* Security / Multi-Tenant reassurance */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Multi-Tenant Encrypted • 100% Data Isolation</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        initialEmail={email}
        onSuccess={(resetEmail) => {
          setEmail(resetEmail);
          setPassword('');
        }}
      />
    </div>
  );
};

export default Login;
