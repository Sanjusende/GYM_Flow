const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  createOrder,
  verifyPayment,
  getSubscriptionStatus,
} = require('../controllers/paymentController');

// All payment routes require gym owner authentication
router.use(authMiddleware);

// Generate Razorpay Order
router.post('/create-order', createOrder);

// Verify Razorpay payment signature & activate subscription (supports /verify and /verify-payment)
router.post('/verify', verifyPayment);
router.post('/verify-payment', verifyPayment);

// Get current subscription status
router.get('/subscription', getSubscriptionStatus);

module.exports = router;
