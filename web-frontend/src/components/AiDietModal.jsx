import React, { useState, useEffect } from 'react';
import { X, Sparkles, MessageSquare, Printer, Copy, Check, RefreshCw } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';

const AiDietModal = ({ isOpen, onClose, member, gym }) => {
  const [goal, setGoal] = useState('Muscle Gain');
  const [dietaryPreference, setDietaryPreference] = useState('Non-Vegetarian');
  const [calories, setCalories] = useState(2200);
  const [dietText, setDietText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setGoal(member?.aiDietCache?.goal || member?.aiDietPlan?.goal || 'Muscle Gain');
      setDietaryPreference(
        member?.aiDietCache?.dietaryPreference ||
          (member?.aiDietPlan?.dietType === 'Pure Veg' ? 'Pure Vegetarian' : member?.aiDietPlan?.dietType) ||
          'Non-Vegetarian'
      );
      setCalories(member?.aiDietCache?.calories || 2200);
      setDietText(member?.aiDietCache?.dietText || member?.aiDietPlan?.generatedPlan || '');
      setError('');
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axiosInstance.post(`/members/${member._id}/ai-diet`, {
        memberId: member._id,
        goal,
        dietaryPreference,
        calories: Number(calories),
      });

      if (res.data.success && (res.data.diet || res.data.dietPlan)) {
        const text = res.data.diet?.dietText || res.data.dietPlan?.generatedPlan;
        setDietText(text);
      }
    } catch (err) {
      console.error('Diet generation failed', err);
      setError(err.response?.data?.message || err.message || 'Failed to generate diet chart. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(dietText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = (member.phone || '').replace(/\D/g, '').slice(-10);
  const whatsappUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
    `Hello ${member.name}! Here is your personalized Indian Gym Diet Chart from ${gym?.gymName || 'GymFlow'}:\n\n` +
      dietText
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="glass-panel-neon w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden text-slate-100 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-dark-700/60 bg-dark-950/60">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="h-5 w-5 fill-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-tight font-['Outfit']">
                Gemini 2.5 Flash Indian Diet Generator
              </h2>
              <p className="text-xs text-slate-400">
                Custom meal plan for <span className="text-white font-semibold">{member.name}</span>
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

        {/* Configuration Bar */}
        <div className="p-4 bg-dark-900/90 border-b border-dark-700/60 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input bg-dark-950"
            >
              <option value="Muscle Gain">Muscle Gain</option>
              <option value="Fat Loss & Toning">Fat Loss</option>
              <option value="Lean Bulking">Lean Bulking</option>
              <option value="Strength Training">Strength</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Diet Preference</label>
            <select
              value={dietaryPreference}
              onChange={(e) => setDietaryPreference(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input bg-dark-950"
            >
              <option value="Pure Vegetarian">Pure Vegetarian</option>
              <option value="Eggetarian">Eggetarian</option>
              <option value="Non-Vegetarian">Non-Vegetarian</option>
              <option value="Vegan">Vegan</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Calories</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg text-xs glass-input font-semibold"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Cooking...' : 'Regenerate'}
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {dietText ? (
            <div className="p-4 rounded-xl bg-dark-950/80 border border-dark-700/80 whitespace-pre-wrap text-sm leading-relaxed font-mono text-slate-200 selection:bg-indigo-500">
              {dietText}
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <Sparkles className="h-10 w-10 text-indigo-400 mx-auto animate-pulse" />
              <p className="text-sm font-medium">No diet plan generated for this member yet.</p>
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 inline-flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate Gemini Indian Diet Plan Now
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {dietText && (
          <div className="p-4 border-t border-dark-700/60 bg-dark-950/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-dark-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied!' : 'Copy Plan'}
              </button>

              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-slate-300 hover:text-white border border-dark-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Printer className="h-3.5 w-3.5" />
                Print / PDF
              </button>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-dark-950 shadow-neon-green flex items-center gap-1.5 transition-all"
            >
              <MessageSquare className="h-4 w-4" />
              Send Diet on WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiDietModal;
