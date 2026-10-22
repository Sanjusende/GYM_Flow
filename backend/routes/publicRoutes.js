const express = require('express');
const router = express.Router();
const {
  getMemberByPhone,
  generateMemberDiet,
} = require('../controllers/publicPortalController');
const { aiLimiter } = require('../middlewares/rateLimiter');

// Public Member Phone Check (No auth required)
router.get('/member/:phone', getMemberByPhone);

// Public 7-Day Indian Gym Diet Plan (Cached in member.aiDietPlan for 7 days)
router.post('/member/:id/diet', aiLimiter, generateMemberDiet);

module.exports = router;
