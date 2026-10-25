const Razorpay = require('razorpay');

/**
 * Returns a configured Razorpay instance using environment variables.
 * Returns null if RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is not configured.
 */
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

module.exports = getRazorpayInstance;
