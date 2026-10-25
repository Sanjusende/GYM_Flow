const mongoose = require('mongoose');

const GymSchema = new mongoose.Schema(
  {
    gymName: {
      type: String,
      required: [true, 'Gym name is required'],
      trim: true,
      default: 'Iron Paradise Fitness',
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    upiId: {
      type: String,
      trim: true,
      default: 'ironparadise@okaxis',
    },
    address: {
      type: String,
      default: 'Bandra West, Mumbai, Maharashtra',
    },
    upiQrCodeUrl: {
      type: String,
      default: '',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otpCode: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    resetPasswordOtp: {
      type: String,
    },
    resetPasswordExpires: {
      type: Date,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
    // Subscription & Monetization fields
    subscriptionStatus: {
      type: String,
      enum: ['trial', 'active', 'expired'],
      default: 'trial',
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },
    razorpayOrderId: {
      type: String,
      default: '',
    },
    razorpayPaymentId: {
      type: String,
      default: '',
    },
    razorpaySubscriptionId: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Gym', GymSchema);
