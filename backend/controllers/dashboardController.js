const Member = require('../models/Member');
const Payment = require('../models/Payment');

// @desc    Get Dashboard 4 KPIs + Actionable Lists
// @route   GET /api/dashboard/stats
const getDashboardStats = async (req, res, next) => {
  try {
    const gymId = req.gymId;
    const now = new Date();

    // End of 5 days from now
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(now.getDate() + 5);

    // Strictly multi-tenant isolated query
    const allMembers = await Member.find({ gymId }).lean();

    let activeCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let totalPendingDues = 0;

    const expiringSoonMembers = [];
    const expiredMembers = [];
    const pendingDueMembers = [];

    allMembers.forEach((m) => {
      const end = new Date(m.endDate);
      const diffMs = end - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      // Calculate pending udhaari
      if (m.dueAmount && m.dueAmount > 0) {
        totalPendingDues += m.dueAmount;
        pendingDueMembers.push({
          ...m,
          diffDays,
        });
      }

      // Categorize status
      if (diffDays < 0) {
        expiredCount++;
        expiredMembers.push({
          ...m,
          diffDays: Math.abs(diffDays),
          status: 'Expired',
        });
      } else if (diffDays <= 5) {
        expiringSoonCount++;
        expiringSoonMembers.push({
          ...m,
          diffDays,
          status: 'Expiring_Soon',
        });
      } else {
        activeCount++;
      }
    });

    // Sort arrays
    expiringSoonMembers.sort((a, b) => a.diffDays - b.diffDays);
    expiredMembers.sort((a, b) => a.diffDays - b.diffDays);
    pendingDueMembers.sort((a, b) => b.dueAmount - a.dueAmount);

    // Revenue this month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const paymentsThisMonth = await Payment.find({
      gymId,
      paymentDate: { $gte: startOfMonth },
    }).lean();

    const monthlyRevenue = paymentsThisMonth.reduce(
      (acc, curr) => acc + (curr.amount || 0),
      0
    );

    // Recent payments
    const recentPayments = await Payment.find({ gymId })
      .sort({ paymentDate: -1 })
      .limit(6)
      .lean();

    res.json({
      success: true,
      // Exact required KPI keys
      activeCount,
      expiringSoonCount,
      expiredCount,
      totalPendingDues,
      monthlyRevenue,
      totalMembers: allMembers.length,
      // Exact required array keys
      expiringSoonMembers,
      expiredMembers,
      pendingDueMembers,
      // Backwards-compatible aliases
      stats: {
        activeMembers: activeCount,
        expiringMembers: expiringSoonCount,
        expiredMembers: expiredCount,
        totalUdhaari: totalPendingDues,
        monthRevenue: monthlyRevenue,
        totalMembers: allMembers.length,
      },
      expiringList: expiringSoonMembers,
      expiredList: expiredMembers,
      udhaariList: pendingDueMembers,
      recentPayments,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
};
