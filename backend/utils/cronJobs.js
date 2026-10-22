const cron = require('node-cron');
const Member = require('../models/Member');

// Function to update status for all members based on endDate
const runExpiryCheckNow = async () => {
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

    console.log(
      `⏰ [Daily 12:00 AM Cron] Status sync complete: ${expiredResult.modifiedCount} Expired, ${expiringResult.modifiedCount} Expiring_Soon, ${activeResult.modifiedCount} Active.`
    );
  } catch (error) {
    console.error('❌ Error updating member statuses:', error.message);
  }
};

// Daily midnight cron: 00:00 (12:00 AM)
const initCronJobs = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('⏰ [12:00 AM] Running Auto-Expiry Status Updater...');
    await runExpiryCheckNow();
  });
  console.log('📅 Auto-Expiry Status Updater Cron scheduled for daily 12:00 AM.');
};

module.exports = {
  initCronJobs,
  runExpiryCheckNow,
};
