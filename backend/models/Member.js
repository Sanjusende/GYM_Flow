const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      index: true,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'MALE', 'FEMALE'],
      default: 'Male',
    },
    currentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    planName: {
      type: String,
      default: '1 Month General',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
      index: true,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'Expiring_Soon', 'Expired', 'ACTIVE', 'EXPIRING', 'EXPIRED'],
      default: 'Active',
      index: true,
    },
    aiDietPlan: {
      goal: { type: String, default: 'Muscle Gain' },
      dietType: { type: String, default: 'Non-Veg' },
      generatedPlan: { type: String, default: '' },
      lastUpdated: { type: Date },
    },
    aiDietCache: {
      goal: { type: String },
      dietaryPreference: { type: String },
      calories: { type: Number },
      dietText: { type: String },
      generatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Compound index for high performance dashboard queries
MemberSchema.index({ gymId: 1, status: 1, endDate: 1 });

module.exports = mongoose.model('Member', MemberSchema);
