const express = require('express');
const router = express.Router();
const {
  getMembers,
  addMember,
  renewMember,
  clearDue,
  deleteMember,
} = require('../controllers/memberController');
const { generateDietPlan } = require('../controllers/aiDietController');
const authMiddleware = require('../middlewares/authMiddleware');
const { aiLimiter } = require('../middlewares/rateLimiter');

// All member routes require auth
router.use(authMiddleware);

router.get('/', getMembers);
router.post('/', addMember);
router.delete('/:id', deleteMember);

// 1-Click Plan Renewal (Supports both PUT and POST)
router.put('/:id/renew', renewMember);
router.post('/:id/renew', renewMember);

// Clear Pending Udhaari Due (Supports both PUT and POST)
router.put('/:id/clear-due', clearDue);
router.post('/:id/clear-due', clearDue);

// AI Indian Gym Diet Plan Generation
router.post('/:id/ai-diet', aiLimiter, generateDietPlan);
router.post('/:id/diet', aiLimiter, generateDietPlan);
router.post('/ai-diet', aiLimiter, generateDietPlan);

module.exports = router;
