import React from 'react';
import {
  MessageSquare,
  RefreshCw,
  IndianRupee,
  Sparkles,
  Phone,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';

const MemberTable = ({
  members = [],
  gym,
  onRenew,
  onClearDue,
  onViewDiet,
  onSearchChange,
  activeFilter,
  onFilterChange,
  searchQuery,
}) => {
  // Zero-Cost 1-Click WhatsApp Reminder with polite Hinglish message
  const getWhatsAppLink = (member) => {
    const cleanPhone = (member.phone || '').replace(/\D/g, '').slice(-10);
    const gymName = gym?.gymName || 'Iron Paradise Fitness';
    const upiId = gym?.upiId || 'ironparadise@okaxis';
    const expiryDateStr = new Date(member.endDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    let message = '';

    if (member.dueAmount > 0 && member.status === 'Expired') {
      message = `Namaste ${member.name} ji! 🙏\n` +
        `Aapki *${gymName}* ki gym membership expire ho chuki hai (${expiryDateStr}).\n` +
        `Aapka pending balance: *₹${member.dueAmount}* baaki hai.\n\n` +
        `Aap workout continue rakhne ke liye fees directly UPI se pay kar sakte hain:\n` +
        `👉 UPI ID: *${upiId}*\n\n` +
        `Fees pay karne ke baad receipt front desk pe dikha dein. Thank you!\n` +
        `Team ${gymName} 🏋️‍♂️`;
    } else if (member.dueAmount > 0) {
      message = `Namaste ${member.name} ji! 🙏\n` +
        `Gentle reminder from *${gymName}*:\n` +
        `Aapka gym fees balance: *₹${member.dueAmount}* pending hai.\n\n` +
        `Aap reception pe ya direct UPI se pay kar sakte hain:\n` +
        `👉 UPI ID: *${upiId}*\n\n` +
        `Have a great workout today! 💪`;
    } else if (member.status === 'Expiring_Soon' || member.diffDays <= 5) {
      message = `Namaste ${member.name} ji! 🏋️‍♂️\n` +
        `Aapki *${gymName}* ki membership agle *${member.diffDays} dino me expire* hone wali hai (Valid till: ${expiryDateStr}).\n\n` +
        `Apna workout routine uninterrupted rakhne ke liye aaj hi renew karayein.\n` +
        `👉 UPI ID: *${upiId}*\n\n` +
        `Best regards,\nTeam ${gymName}`;
    } else if (member.status === 'Expired') {
      message = `Namaste ${member.name} ji! 💪\n` +
        `Hum aapko *${gymName}* me miss kar rahe hain! Aapki membership ${expiryDateStr} ko expire ho gayi thi.\n\n` +
        `Is hafte renew karayein aur apna updated Indian Diet Chart free paayein!\n` +
        `Best regards,\nTeam ${gymName}`;
    } else {
      message = `Hello ${member.name} ji! 👋\n` +
        `Greetings from *${gymName}*! Workout me consistency banaye rakhein. Kisi bhi workout chart ya diet advice ke liye reception pe contact karein! 💪`;
    }

    return `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const getStatusBadge = (status, diffDays) => {
    if (status === 'Expired' || diffDays < 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
          <XCircle className="h-3 w-3" />
          Expired ({Math.abs(diffDays)}d ago)
        </span>
      );
    }
    if (status === 'Expiring_Soon' || diffDays <= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="h-3 w-3" />
          Expiring in {diffDays}d
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
        <CheckCircle2 className="h-3 w-3" />
        Active ({diffDays}d left)
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search member by name or 10-digit phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm glass-input font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'Active', label: 'Active' },
            { id: 'Expiring_Soon', label: 'Expiring Soon' },
            { id: 'Expired', label: 'Expired' },
            { id: 'Udhaari', label: 'Pending Udhaari' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeFilter === tab.id
                  ? 'bg-neon-green text-dark-950 shadow-neon-green'
                  : 'bg-dark-800 text-slate-300 hover:bg-dark-700 hover:text-white border border-dark-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-dark-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-dark-950/80 text-slate-400 text-xs uppercase tracking-wider border-b border-dark-700">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Member</th>
                <th className="py-3.5 px-4 font-semibold">Plan</th>
                <th className="py-3.5 px-4 font-semibold">Status / Expiry</th>
                <th className="py-3.5 px-4 font-semibold">Fee & Udhaari</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/60">
              {members.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="text-base font-semibold">No members found.</p>
                    <p className="text-xs text-slate-500 mt-1">Try another search keyword or filter tab.</p>
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr
                    key={member._id}
                    className="hover:bg-dark-700/30 transition-colors group"
                  >
                    {/* Member Column */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-dark-700 border border-dark-600 flex items-center justify-center font-bold text-slate-200">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            {member.name}
                            {member.gender && (
                              <span className="text-[10px] text-slate-400">
                                ({member.gender === 'Male' ? 'M' : 'F'})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone className="h-3 w-3 text-slate-500" />
                            {member.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Plan Column */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{member.planName || 'General'}</div>
                      <div className="text-xs text-slate-400">
                        Since {new Date(member.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Status Column */}
                    <td className="py-3.5 px-4">
                      <div>{getStatusBadge(member.status, member.diffDays)}</div>
                      <div className="text-xs text-slate-400 mt-1">
                        Valid till: {new Date(member.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Fee & Udhaari Column */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">
                        Paid: ₹{member.paidAmount}
                      </div>
                      {member.dueAmount > 0 ? (
                        <div className="inline-flex items-center gap-1 text-xs font-black text-rose-400 bg-rose-500/15 px-2 py-0.5 rounded border border-rose-500/30 mt-0.5">
                          Udhaari: ₹{member.dueAmount}
                        </div>
                      ) : (
                        <div className="text-xs text-emerald-400 font-bold mt-0.5">
                          ✓ Cleared
                        </div>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* 1-Click WhatsApp Button (Zero Cost) */}
                        <a
                          href={getWhatsAppLink(member)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Send WhatsApp Reminder"
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-dark-950 font-extrabold transition-all flex items-center gap-1.5 text-xs shadow-sm"
                        >
                          <MessageSquare className="h-3.5 w-3.5 fill-dark-950" />
                          <span>WhatsApp</span>
                        </a>

                        {/* 1-Click Renew */}
                        <button
                          onClick={() => onRenew(member)}
                          title="1-Click Renew Plan"
                          className="p-2 rounded-xl bg-dark-800 hover:bg-neon-green/20 text-slate-300 hover:text-neon-green border border-dark-700 transition-all text-xs"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>

                        {/* Clear Due Button (if Udhaari > 0) */}
                        {member.dueAmount > 0 && (
                          <button
                            onClick={() => onClearDue(member)}
                            title="Clear Udhaari / Settle Due"
                            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-950 font-bold transition-all text-xs flex items-center gap-1"
                          >
                            <IndianRupee className="h-3.5 w-3.5" />
                            <span>Clear</span>
                          </button>
                        )}

                        {/* AI Diet Button */}
                        <button
                          onClick={() => onViewDiet(member)}
                          title="Generate / View AI Indian Diet"
                          className="p-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500 text-cyan-400 hover:text-dark-950 border border-cyan-500/30 transition-all text-xs"
                        >
                          <Sparkles className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MemberTable;
