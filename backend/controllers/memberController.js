const Member = require('../models/Member');
const Plan = require('../models/Plan');
const Payment = require('../models/Payment');

// Helper to determine status from date
const computeStatus = (endDate) => {
  const now = new Date();
  const diffDays = Math.ceil((new Date(endDate) - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 5) return 'Expiring_Soon';
  return 'Active';
};

// @desc    Get all members with search & filter (Multi-tenant isolated)
// @route   GET /api/members
const getMembers = async (req, res, next) => {
  try {
    const gymId = req.gymId || req.gym?.id;
    const { search, filter, sort } = req.query;

    const query = { gymId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    if (filter === 'Active' || filter === 'ACTIVE') {
      query.endDate = { $gt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) };
    } else if (filter === 'Expiring_Soon' || filter === 'EXPIRING') {
      const now = new Date();
      const fiveDays = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      query.endDate = { $gte: now, $lte: fiveDays };
    } else if (filter === 'Expired' || filter === 'EXPIRED') {
      query.endDate = { $lt: new Date() };
    } else if (filter === 'Udhaari' || filter === 'UDHAARI') {
      query.dueAmount = { $gt: 0 };
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'endDate_asc') sortOptions = { endDate: 1 };
    if (sort === 'dueAmount_desc') sortOptions = { dueAmount: -1 };
    if (sort === 'name_asc') sortOptions = { name: 1 };

    const members = await Member.find(query)
      .populate('currentPlan')
      .sort(sortOptions)
      .lean();

    const formatted = members.map((m) => {
      const currentStatus = computeStatus(m.endDate);
      const diffDays = Math.ceil((new Date(m.endDate) - new Date()) / (1000 * 60 * 60 * 24));
      return {
        ...m,
        status: currentStatus,
        diffDays,
      };
    });

    res.json({
      success: true,
      count: formatted.length,
      members: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add Member (endDate = startDate + plan.durationInDays, dueAmount = plan.price - paidAmount)
// @route   POST /api/members
const addMember = async (req, res, next) => {
  try {
    const gymId = req.gymId || req.gym?.id;
    const {
      name,
      phone,
      gender,
      currentPlan,
      planId,
      startDate,
      paidAmount,
      totalFee,
      paymentMode,
    } = req.body;

    const targetPlanId = currentPlan || planId;
    if (!name || !phone || !targetPlanId) {
      return res.status(400).json({
        success: false,
        message: 'Name, phone, and membership plan are required.',
      });
    }

    // Strict multi-tenant isolation
    const plan = await Plan.findOne({ _id: targetPlanId, gymId });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Selected plan not found for this gym.' });
    }

    const start = startDate ? new Date(startDate) : new Date();
    // Auto calculate: endDate = startDate + plan.durationInDays
    const durationDays = plan.durationInDays || 30;
    const end = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const price = totalFee !== undefined ? Number(totalFee) : plan.price;
    const paid = Number(paidAmount || 0);
    // Auto calculate: dueAmount = plan.price - paidAmount
    const due = Math.max(0, price - paid);

    const newMember = await Member.create({
      gymId,
      name,
      phone,
      gender: gender || 'Male',
      currentPlan: plan._id,
      planName: plan.planName,
      startDate: start,
      endDate: end,
      status: computeStatus(end),
      paidAmount: paid,
      dueAmount: due,
    });

    // Automatically create a Payment record
    if (paid > 0) {
      await Payment.create({
        gymId,
        memberId: newMember._id,
        amount: paid,
        paymentMode: paymentMode || 'UPI',
        remarks: `Registration fee for ${plan.planName}`,
        paymentDate: start,
      });
    }

    res.status(201).json({
      success: true,
      message: '⚡ Member registered successfully in 10 seconds!',
      member: newMember,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    1-Click Plan Renewal
// @route   PUT /api/members/:id/renew or POST /api/members/:id/renew
const renewMember = async (req, res, next) => {
  try {
    const gymId = req.gymId || req.gym?.id;
    const { planId, currentPlan, paidAmount, paymentMode } = req.body;

    const member = await Member.findOne({ _id: req.params.id, gymId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const targetPlanId = currentPlan || planId || member.currentPlan;
    const plan = await Plan.findOne({ _id: targetPlanId, gymId });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    const now = new Date();
    // If currently active, extend from existing endDate; if expired, start from today
    const currentEnd = new Date(member.endDate);
    const newStart = currentEnd > now ? currentEnd : now;
    const durationDays = plan.durationInDays || 30;
    const newEnd = new Date(newStart.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const renewalPrice = plan.price;
    const paid = Number(paidAmount !== undefined ? paidAmount : plan.price);
    const addedDue = Math.max(0, renewalPrice - paid);

    member.currentPlan = plan._id;
    member.planName = plan.planName;
    member.startDate = newStart;
    member.endDate = newEnd;
    member.status = computeStatus(newEnd);
    member.paidAmount += paid;
    member.dueAmount += addedDue;

    await member.save();

    if (paid > 0) {
      await Payment.create({
        gymId,
        memberId: member._id,
        amount: paid,
        paymentMode: paymentMode || 'UPI',
        remarks: `Renewal for ${plan.planName} (${durationDays} days)`,
        paymentDate: new Date(),
      });
    }

    res.json({
      success: true,
      message: `🎉 Membership renewed until ${newEnd.toLocaleDateString('en-IN')}!`,
      member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear / Settle Pending Udhaari Due
// @route   PUT /api/members/:id/clear-due or POST /api/members/:id/clear-due
const clearDue = async (req, res, next) => {
  try {
    const gymId = req.gymId || req.gym?.id;
    const { amount, paymentMode, remarks } = req.body;

    const member = await Member.findOne({ _id: req.params.id, gymId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    const payAmount = Number(amount);
    if (!payAmount || payAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please enter a valid amount.' });
    }

    if (payAmount > member.dueAmount) {
      return res.status(400).json({
        success: false,
        message: `Amount exceeds pending due of ₹${member.dueAmount}`,
      });
    }

    member.dueAmount = Math.max(0, member.dueAmount - payAmount);
    member.paidAmount += payAmount;
    await member.save();

    await Payment.create({
      gymId,
      memberId: member._id,
      amount: payAmount,
      paymentMode: paymentMode || 'UPI',
      remarks: remarks || `Udhaari clearance of ₹${payAmount}`,
      paymentDate: new Date(),
    });

    res.json({
      success: true,
      message: `✅ ₹${payAmount} cleared successfully. Remaining due: ₹${member.dueAmount}`,
      remainingDue: member.dueAmount,
      member,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete Member
// @route   DELETE /api/members/:id
const deleteMember = async (req, res, next) => {
  try {
    const gymId = req.gymId || req.gym?.id;
    const member = await Member.findOneAndDelete({ _id: req.params.id, gymId });
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    await Payment.deleteMany({ memberId: member._id, gymId });

    res.json({
      success: true,
      message: 'Member and payment history removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMembers,
  addMember,
  renewMember,
  clearDue,
  deleteMember,
};
