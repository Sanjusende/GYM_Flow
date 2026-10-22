const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema(
  {
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Gym',
      required: true,
      index: true,
    },
    planName: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
      // e.g., '1 Month', '3 Months', '6 Months', '1 Year'
    },
    durationInDays: {
      type: Number,
      required: [true, 'Duration in days is required'],
      default: 30,
    },
    price: {
      type: Number,
      required: [true, 'Plan price is required'],
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Plan', PlanSchema);
