const Plan = require('../models/Plan');

// @desc    Get all plans for gym (Multi-tenant isolated)
// @route   GET /api/plans
const getPlans = async (req, res, next) => {
  try {
    const gymId = req.gymId || req.gym?.id;
    const plans = await Plan.find({ gymId, isActive: true }).sort({ durationInDays: 1 });
    res.json({
      success: true,
      plans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new plan
// @route   POST /api/plans
const createPlan = async (req, res, next) => {
  try {
    const gymId = req.gymId || req.gym?.id;
    const { planName, name, durationInDays, durationMonths, price } = req.body;

    const finalName = planName || name;
    const finalDays = durationInDays ? Number(durationInDays) : (durationMonths ? Number(durationMonths) * 30 : 30);

    if (!finalName || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Plan name and price are required.',
      });
    }

    const plan = await Plan.create({
      gymId,
      planName: finalName,
      durationInDays: finalDays,
      price: Number(price),
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: 'Plan created successfully!',
      plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update plan
// @route   PUT /api/plans/:id
const updatePlan = async (req, res, next) => {
  try {
    const gymId = req.gymId || req.gym?.id;
    const { planName, name, durationInDays, durationMonths, price, isActive } = req.body;

    const plan = await Plan.findOne({ _id: req.params.id, gymId });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    if (planName || name) plan.planName = planName || name;
    if (durationInDays !== undefined) plan.durationInDays = Number(durationInDays);
    else if (durationMonths !== undefined) plan.durationInDays = Number(durationMonths) * 30;
    if (price !== undefined) plan.price = Number(price);
    if (isActive !== undefined) plan.isActive = Boolean(isActive);

    await plan.save();

    res.json({
      success: true,
      message: 'Plan updated successfully!',
      plan,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete plan
// @route   DELETE /api/plans/:id
const deletePlan = async (req, res, next) => {
  try {
    const gymId = req.gymId || req.gym?.id;
    const plan = await Plan.findOneAndDelete({ _id: req.params.id, gymId });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    res.json({
      success: true,
      message: 'Plan removed successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
};

