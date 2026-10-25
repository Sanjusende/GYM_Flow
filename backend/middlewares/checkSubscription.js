const Gym = require('../models/Gym');

/**
 * Express middleware: checkSubscription
 * Ensures gym owner has an active subscription or valid free trial.
 * If expired, updates status to 'expired' and returns 403 Forbidden.
 */
const checkSubscription = async (req, res, next) => {
  try {
    const gymId = req.gymId || (req.gym && req.gym._id);
    if (!gymId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Gym owner authentication required.',
      });
    }

    let gym = req.gym;
    if (!gym || !gym.subscriptionStatus) {
      gym = await Gym.findById(gymId);
      if (!gym) {
        return res.status(404).json({
          success: false,
          message: 'Gym owner account not found.',
        });
      }
      req.gym = gym;
    }

    const now = new Date();

    // Gracefully handle legacy records without trial date
    if (!gym.trialEndsAt) {
      gym.trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      gym.subscriptionStatus = gym.subscriptionStatus || 'trial';
      await gym.save();
    }

    // Active subscription check
    if (gym.subscriptionStatus === 'active') {
      // If expiration date is set and has passed, mark as expired
      if (gym.subscriptionExpiresAt && new Date(gym.subscriptionExpiresAt) < now) {
        gym.subscriptionStatus = 'expired';
        await gym.save();
        return res.status(403).json({
          success: false,
          subscriptionStatus: 'expired',
          upgradeRequired: true,
          message: 'Your active subscription has expired. Please upgrade or renew your plan to continue using GymFlow SaaS.',
        });
      }
      return next();
    }

    // Trial check
    if (gym.subscriptionStatus === 'trial') {
      if (new Date(gym.trialEndsAt) >= now) {
        return next();
      } else {
        gym.subscriptionStatus = 'expired';
        await gym.save();
        return res.status(403).json({
          success: false,
          subscriptionStatus: 'expired',
          upgradeRequired: true,
          message: 'Your 30-day free trial has expired. Please upgrade your plan to unlock full access to GymFlow SaaS.',
        });
      }
    }

    // Explicitly expired status
    return res.status(403).json({
      success: false,
      subscriptionStatus: 'expired',
      upgradeRequired: true,
      message: 'Your subscription is expired. Please upgrade to continue accessing all GymFlow features.',
    });
  } catch (error) {
    console.error('Subscription verification middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error verifying subscription status.',
      error: error.message,
    });
  }
};

module.exports = checkSubscription;
