const cron = require('node-cron');
const Member = require('../models/Member');

/**
 * Updates status for all members based on endDate:
 * 1. 'Expired' if endDate < today
 * 2. 'Expiring_Soon' if endDate is within next 5 days
 * 3. 'Active' if endDate > today + 5 days
 */
const updateMemberStatuses = async () => {
  try {
    const now = new Date();
    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(now.getDate() + 5);

    // 1. Expired if endDate < today
    const expiredResult = await Member.updateMany(
      {
        endDate: { $lt: now },
        status: { $ne: 'Expired' },
      },
      { $set: { status: 'Expired' } }
    );

    // 2. Expiring_Soon if endDate <= today + 5 days
    const expiringResult = await Member.updateMany(
      {
        endDate: { $gte: now, $lte: fiveDaysFromNow },
        status: { $ne: 'Expiring_Soon' },
      },
      { $set: { status: 'Expiring_Soon' } }
    );

    // 3. Active if endDate > today + 5 days
    const activeResult = await Member.updateMany(
      {
        endDate: { $gt: fiveDaysFromNow },
        status: { $ne: 'Active' },
      },
      { $set: { status: 'Active' } }
    );

    const summary = {
      expiredCount: expiredResult.modifiedCount || 0,
      expiringCount: expiringResult.modifiedCount || 0,
      activeCount: activeResult.modifiedCount || 0,
      totalUpdated:
        (expiredResult.modifiedCount || 0) +
        (expiringResult.modifiedCount || 0) +
        (activeResult.modifiedCount || 0),
      timestamp: new Date().toISOString(),
      istTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    };

    console.log(
      `⏰ [12:00 AM IST Cron] Status sync complete: ${summary.expiredCount} Expired, ${summary.expiringCount} Expiring_Soon, ${summary.activeCount} Active.`
    );

    return summary;
  } catch (error) {
    console.error('❌ Error updating member statuses:', error.message);
    throw error;
  }
};

/**
 * Initializes node-cron for daily midnight (00:00 IST / Asia/Kolkata).
 * Explicit timezone configuration ensures Render's UTC server fires at 12:00 AM IST.
 */
const initCronJobs = () => {
  cron.schedule(
    '0 0 * * *',
    async () => {
      console.log('⏰ [12:00 AM IST] Running Auto-Expiry Status Updater...');
      await updateMemberStatuses();
    },
    {
      scheduled: true,
      timezone: 'Asia/Kolkata',
    }
  );
  console.log('📅 Auto-Expiry Status Updater Cron scheduled for daily 12:00 AM IST (Asia/Kolkata).');
};

module.exports = {
  initCronJobs,
  updateMemberStatuses,
  runExpiryCheckNow: updateMemberStatuses,
};
