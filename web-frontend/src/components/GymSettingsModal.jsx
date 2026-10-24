import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Phone, User, CreditCard, MapPin, Check, Save, QrCode, Upload } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';

const GymSettingsModal = ({ isOpen, onClose }) => {
  const { gym, updateProfile } = useAuth();
  const [gymName, setGymName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiQrCodeUrl, setUpiQrCodeUrl] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (gym) {
      setGymName(gym.gymName || '');
      setOwnerName(gym.ownerName || gym.name || '');
      setPhone(gym.phone || '');
      setUpiId(gym.upiId || '');
      setUpiQrCodeUrl(gym.upiQrCodeUrl || '');
      setAddress(gym.address || '');
      setMessage('');
      setError('');
    }
  }, [gym, isOpen]);

  if (!isOpen) return null;

  const handleQrUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG).');
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
    setMessage('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit gym phone number.');
      return;
    }

    setLoading(true);
    const res = await updateProfile({
      gymName: gymName.trim(),
      ownerName: ownerName.trim(),
      phone: cleanPhone.slice(-10),
      upiId: upiId.trim(),
      upiQrCodeUrl,
      address: address.trim(),
    });

    setLoading(false);
    if (res.success) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00F59B', '#10B981'],
      });
      setMessage('✅ Gym Profile, Phone Number & QR Code updated successfully!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } else {
      setError(res.message || 'Failed to update gym profile.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="glass-panel-neon w-full max-w-lg rounded-2xl p-4 sm:p-6 relative text-slate-100 shadow-2xl max-h-[92vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-dark-700">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-neon-green/20 text-neon-green flex items-center justify-center">
              <Dumbbell className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight font-['Outfit']">
                Gym Profile & Settings
              </h2>
              <p className="text-xs text-slate-400">
                Configure official phone number, UPI QR scanner, and gym branding
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <Check className="h-4 w-4" />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
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
                Owner / Manager Name <span className="text-neon-green">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Vikram Rajput"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Official Gym Phone / WhatsApp Number <span className="text-neon-green">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neon-green" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 98201 11223 (10 digits)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-semibold text-neon-green"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Used in member WhatsApp renewal reminders & public portal receipts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                UPI ID (For Member Dues)
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. ironparadise@okaxis"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium font-mono text-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gym Location / Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Link Road, Andheri West"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium"
                />
              </div>
            </div>
          </div>

          {/* UPI QR Code Scanner Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <QrCode className="h-3.5 w-3.5 text-neon-green" />
                UPI QR Scanner Image
              </span>
              {upiQrCodeUrl && (
                <span className="text-[10px] text-emerald-400 font-bold">✓ Active QR</span>
              )}
            </label>

            {upiQrCodeUrl ? (
              <div className="p-3 rounded-xl bg-dark-900 border border-dark-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={upiQrCodeUrl}
                    alt="Gym UPI QR"
                    className="h-14 w-14 rounded-lg object-contain bg-white p-1 border border-dark-600"
                  />
                  <div>
                    <p className="text-xs font-semibold text-white">Custom UPI QR Uploaded</p>
                    <p className="text-[10px] text-slate-400">
                      Displayed on public portal & Udhaari clearance
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
                  Upload Official UPI QR Image
                </span>
                <span className="text-[10px] text-slate-500">
                  GPay, PhonePe, Paytm, or BHIM QR scanner image
                </span>
              </label>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-dark-700/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-dark-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-neon-green hover:bg-neon-glow text-dark-950 shadow-neon-green flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Saving Changes...' : 'Save Gym Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GymSettingsModal;
