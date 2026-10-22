const jwt = require('jsonwebtoken');
const Gym = require('../models/Gym');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'gymflow_super_secret_jwt_key_2026_fitness_saas'
    );

    const gym = await Gym.findById(decoded.gymId).select('-password');
    if (!gym) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or Gym account no longer exists.',
      });
    }

    // Bind tenant context to request
    req.gymId = gym._id;
    req.gym = gym;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      error: error.message,
    });
  }
};

module.exports = authMiddleware;
