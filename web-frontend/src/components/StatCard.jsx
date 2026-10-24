import React from 'react';

const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  variant = 'emerald', // emerald | amber | rose | cyan
  onClick,
}) => {
  const variantStyles = {
    emerald: {
      border: 'hover:border-neon-green/50',
      glow: 'shadow-neon-green/10',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      valueColor: 'text-emerald-400',
    },
    amber: {
      border: 'hover:border-amber-500/50',
      glow: 'shadow-neon-amber/10',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      valueColor: 'text-amber-400',
    },
    rose: {
      border: 'hover:border-rose-500/50',
      glow: 'shadow-neon-rose/10',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      valueColor: 'text-rose-400',
    },
    cyan: {
      border: 'hover:border-cyan-500/50',
      glow: 'shadow-cyan-500/10',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
      badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      valueColor: 'text-cyan-400',
    },
  };

  const style = variantStyles[variant] || variantStyles.emerald;

  return (
    <div
      onClick={onClick}
      className={`glass-panel p-4 sm:p-5 rounded-2xl transition-all duration-300 ${style.border} ${
        onClick ? 'cursor-pointer hover:-translate-y-1' : ''
      } relative overflow-hidden group`}
    >
      {/* Background radial highlight */}
      <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500 pointer-events-none" />

      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 truncate max-w-[120px]">
          {title}
        </span>
        <div className={`p-2 sm:p-2.5 rounded-xl ${style.iconBg} shrink-0`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-2xl sm:text-3xl font-black tracking-tight font-['Outfit'] truncate ${style.valueColor}`}>
          {value}
        </span>
      </div>

      {subtext && (
        <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[11px] sm:text-xs text-slate-400 border-t border-dark-700/60 pt-2 sm:pt-2.5">
          <span className="truncate">{subtext}</span>
          {onClick && (
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-300 group-hover:text-neon-green transition-colors flex items-center gap-0.5 shrink-0 ml-1">
              View →
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
