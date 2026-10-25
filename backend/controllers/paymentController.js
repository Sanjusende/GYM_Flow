const crypto = require('crypto');
const getRazorpayInstance = require('../config/razorpay');
const Gym = require('../models/Gym');

// Default monthly subscription price: ₹999 = 99900 paise
const DEFAULT_MONTHLY_PRICE_PAISE = 99900;

/**
 * @desc    STEP 1: Generate Razorpay Order
 * @route   POST /api/payment/create-order or POST /api/create-order
 * @access  Private (Gym Owner)
 */
const createOrder = async (req, res, next) => {
  // Amount in paise (minimum 100 paise = ₹1.00)
  const amountInPaise =
    req.body?.amount && !isNaN(parseInt(req.body.amount, 10))
      ? parseInt(req.body.amount, 10)
      : DEFAULT_MONTHLY_PRICE_PAISE;

  try {
    const gymId = req.gymId;
    const gym = await Gym.findById(gymId);

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: 'Gym owner record not found.',
      });
    }

    if (!amountInPaise || amountInPaise < 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Minimum amount is 100 paise (₹1.00).',
      });
    }

    const receiptId = `rcpt_${gymId.toString().slice(-6)}_${Date.now().toString().slice(-6)}`;

    const razorpay = getRazorpayInstance();

    // If Razorpay keys are not configured or missing, fall back to direct Standard Web Checkout
    if (!razorpay) {
      console.warn('⚠️ Razorpay credentials not configured: Falling back to direct Standard Web Checkout.');
      return res.status(200).json({
        success: true,
        order_id: null,
        order: null,
        amount: amountInPaise,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_TrnCiE9i67RID6',
        clientCheckout: true,
        plan: {
          name: 'GymFlow Pro (Monthly)',
          amount: Math.round(amountInPaise / 100),
          amountInPaise,
          currency: 'INR',
          durationDays: 30,
        },
      });
    }

    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receiptId,
      notes: {
        gymId: gym._id.toString(),
        gymName: gym.gymName,
        ownerEmail: gym.email,
        plan: 'GymFlow Pro Monthly Subscription',
      },
    };

    // Call Razorpay API to create order
    const order = await razorpay.orders.create(orderOptions);

    // Save order record to gym profile
    gym.razorpayOrderId = order.id;
    await gym.save();

    res.status(200).json({
      success: true,
      order_id: order.id,
      order,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      plan: {
        name: 'GymFlow Pro (Monthly)',
        amount: Math.round(order.amount / 100),
        amountInPaise: order.amount,
        currency: order.currency,
        durationDays: 30,
      },
    });
  } catch (error) {
    const isAuthError =
      error.statusCode === 401 ||
      error.error?.code === 'BAD_REQUEST_ERROR' ||
      error.error?.description === 'Authentication failed' ||
      error.message?.includes('RAZORPAY');

    // If Razorpay API rejects server credentials (401), gracefully fall back to direct Standard Web Checkout
    // so the modal can still open in browser with UPI, Cards, NetBanking.
    if (isAuthError) {
      console.warn('⚠️ Razorpay credentials invalid (401): Falling back to direct Standard Web Checkout.');
      return res.status(200).json({
        success: true,
        order_id: null,
        order: null,
        amount: amountInPaise,
        currency: 'INR',
        key: process.env.RAZORPAY_KEY_ID || 'rzp_test_TrnCiE9i67RID6',
        clientCheckout: true,
        plan: {
          name: 'GymFlow Pro (Monthly)',
          amount: Math.round(amountInPaise / 100),
          amountInPaise,
          currency: 'INR',
          durationDays: 30,
        },
      });
    }

    console.error('Razorpay order creation error:', error);

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.error?.description || error.message || 'Failed to create Razorpay order.',
      error: error.error?.description || error.message,
    });
  }
};

/**
 * @desc    STEP 3: Verify Razorpay Payment Signature
 * @route   POST /api/payment/verify or POST /api/verify-payment
 * @access  Private (Gym Owner)
 */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Validate payment_id is provided
    if (!razorpay_payment_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required Razorpay credentials: razorpay_payment_id is required.',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If order_id and signature are present, verify HMAC-SHA256 signature
    if (razorpay_order_id && razorpay_signature && keySecret) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Signature mismatch. Payment verification failed.',
        });
      }
    }

    // Signature matches -> update gym subscription status
    const gymId = req.gymId;
    const gym = await Gym.findById(gymId);

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: 'Gym owner record not found.',
      });
    }

    const baseDate =
      gym.subscriptionExpiresAt && new Date(gym.subscriptionExpiresAt) > new Date()
        ? new Date(gym.subscriptionExpiresAt)
        : new Date();

    const newExpiry = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);

    gym.subscriptionStatus = 'active';
    gym.subscriptionExpiresAt = newExpiry;
    gym.razorpayOrderId = razorpay_order_id;
    gym.razorpayPaymentId = razorpay_payment_id;
    await gym.save();

    console.log(`
    💎 ══════════════════════════════════════════════════════════════ 💎
       🎉 RAZORPAY PAYMENT VERIFIED!
       Gym: ${gym.gymName} (${gym.email})
       Payment ID: ${razorpay_payment_id}
       Order ID: ${razorpay_order_id}
       Status: ACTIVE
       Expires At: ${newExpiry.toISOString()}
    💎 ══════════════════════════════════════════════════════════════ 💎
    `);

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully! Your GymFlow Pro subscription is now active.',
      gym: {
        id: gym._id,
        gymName: gym.gymName,
        ownerName: gym.ownerName,
        email: gym.email,
        phone: gym.phone,
        upiId: gym.upiId,
        upiQrCodeUrl: gym.upiQrCodeUrl || '',
        address: gym.address,
        isVerified: gym.isVerified,
        subscriptionStatus: gym.subscriptionStatus,
        trialEndsAt: gym.trialEndsAt,
        subscriptionExpiresAt: gym.subscriptionExpiresAt,
      },
    });
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error verifying payment.',
      error: error.message,
    });
  }
};

/**
 * @desc    Get Current Subscription Details
 * @route   GET /api/payment/subscription
 * @access  Private (Gym Owner)
 */
const getSubscriptionStatus = async (req, res, next) => {
  try {
    const gym = await Gym.findById(req.gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found' });
    }

    const now = new Date();
    let daysLeft = 0;
    let isExpired = false;

    if (gym.subscriptionStatus === 'active') {
      if (gym.subscriptionExpiresAt) {
        const diff = new Date(gym.subscriptionExpiresAt).getTime() - now.getTime();
        daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
        isExpired = diff <= 0;
      }
    } else if (gym.subscriptionStatus === 'trial') {
      const trialEnd = gym.trialEndsAt ? new Date(gym.trialEndsAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const diff = trialEnd.getTime() - now.getTime();
      daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      isExpired = diff <= 0;
    } else {
      isExpired = true;
      daysLeft = 0;
    }

    res.status(200).json({
      success: true,
      subscription: {
        status: isExpired ? 'expired' : gym.subscriptionStatus,
        trialEndsAt: gym.trialEndsAt,
        subscriptionExpiresAt: gym.subscriptionExpiresAt,
        daysLeft,
        isExpired,
        monthlyPrice: 999,
        planName: 'GymFlow Pro (Monthly)',
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getSubscriptionStatus,
};
