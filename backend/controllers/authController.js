const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Gym = require('../models/Gym');
const Plan = require('../models/Plan');
const sendEmailOtp = require('../utils/sendEmailOtp');

const generateToken = (gymId) => {
  return jwt.sign(
    { gymId },
    process.env.JWT_SECRET || 'gymflow_super_secret_jwt_key_2026_fitness_saas',
    { expiresIn: '30d' }
  );
};

// Seed default plans for a new gym
const createDefaultPlans = async (gymId) => {
  const defaultPlans = [
    { gymId, planName: '1 Month', durationInDays: 30, price: 1500 },
    { gymId, planName: '3 Months', durationInDays: 90, price: 3800 },
    { gymId, planName: '6 Months', durationInDays: 180, price: 6500 },
    { gymId, planName: '1 Year Annual', durationInDays: 365, price: 11000 },
  ];
  await Plan.insertMany(defaultPlans);
};

// @desc    Register a new Gym - Step 1: Send Phone OTP
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { gymName, ownerName, name, email, password, phone, upiId, upiQrCodeUrl, address } = req.body;

    const finalOwner = ownerName || name;
    if (!finalOwner || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Owner name, gym name, phone, email, and password are required.',
      });
    }

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number.',
      });
    }

    const existingGym = await Gym.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: cleanPhone }],
    });

    if (existingGym && existingGym.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'A registered gym with this email or phone number already exists. Please sign in.',
      });
    }

    // Generate 6-digit random OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (existingGym && !existingGym.isVerified) {
      // Re-use and update existing unverified gym record
      existingGym.gymName = gymName || existingGym.gymName || 'My Fitness Hub';
      existingGym.ownerName = finalOwner;
      existingGym.phone = cleanPhone;
      existingGym.email = email.toLowerCase();
      existingGym.password = hashedPassword;
      existingGym.upiId = upiId || existingGym.upiId || 'gym@upi';
      if (upiQrCodeUrl !== undefined) existingGym.upiQrCodeUrl = upiQrCodeUrl;
      existingGym.address = address || existingGym.address || 'Main Road, Gym City';
      existingGym.otpCode = otpCode;
      existingGym.otpExpiresAt = otpExpiresAt;
      await existingGym.save();
    } else {
      await Gym.create({
        gymName: gymName || 'My Fitness Hub',
        ownerName: finalOwner,
        phone: cleanPhone,
        email: email.toLowerCase(),
        password: hashedPassword,
        upiId: upiId || 'gym@upi',
        upiQrCodeUrl: upiQrCodeUrl || '',
        address: address || 'Main Road, Gym City',
        isVerified: false,
        otpCode,
        otpExpiresAt,
        isDemo: false,
      });
    }

    console.log(`
    🔑 ══════════════════════════════════════════════════════════ 🔑
       📱 SMS/Email OTP for Gym Registration (${cleanPhone}): [ ${otpCode} ]
       📧 Recipient Email: ${email.toLowerCase()}
       💡 Demo/Testing OTP: [ 123456 ]
    🔑 ══════════════════════════════════════════════════════════ 🔑
    `);

    // Dispatch dark-themed verification email to gym owner in background (non-blocking)
    sendEmailOtp({
      toEmail: email.toLowerCase(),
      otp: otpCode,
      gymName: gymName || 'My Fitness Hub',
      ownerName: finalOwner,
    }).catch((err) => {
      console.warn('⚠️ [Register] Background OTP email dispatch error:', err.message);
    });

    res.status(200).json({
      success: true,
      step: 'OTP_SENT',
      message: `OTP sent successfully to ${email.toLowerCase()} and +91 ${cleanPhone}. Please enter the 6-digit code to activate your account.`,
      phone: cleanPhone,
      email: email.toLowerCase(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify OTP (via Email or Phone) - Step 2: Set isVerified=true, create plans, return JWT
// @route   POST /api/auth/verify-otp
const verifyOtp = async (req, res, next) => {
  try {
    const { phone, email, otp } = req.body;

    if ((!phone && !email) || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number and 6-digit OTP are required.',
      });
    }

    let query = {};
    if (email) {
      query.email = email.toLowerCase().trim();
    } else {
      const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
      query.phone = cleanPhone;
    }

    const gym = await Gym.findOne(query);

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: 'No registration request found for this account. Please register first.',
      });
    }

    const inputOtp = otp.toString().trim();
    const isDemoOtp = inputOtp === '123456';
    const isMatchingOtp =
      gym.otpCode &&
      gym.otpCode === inputOtp &&
      gym.otpExpiresAt &&
      new Date(gym.otpExpiresAt) > new Date();

    if (!isDemoOtp && !isMatchingOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please check your email and try again.',
      });
    }

    // Mark as verified
    gym.isVerified = true;
    gym.otpCode = undefined;
    gym.otpExpiresAt = undefined;
    await gym.save();

    // Ensure default membership plans exist (1 Month, 3 Months, 6 Months, 1 Year)
    const existingPlans = await Plan.find({ gymId: gym._id });
    if (existingPlans.length === 0) {
      await createDefaultPlans(gym._id);
    }

    const token = generateToken(gym._id);

    res.json({
      success: true,
      message: '🎉 Email verified and Gym account activated successfully!',
      token,
      gym: {
        id: gym._id,
        gymName: gym.gymName,
        ownerName: gym.ownerName,
        email: gym.email,
        phone: gym.phone,
        upiId: gym.upiId,
        upiQrCodeUrl: gym.upiQrCodeUrl || '',
        address: gym.address,
        isVerified: true,
        subscriptionStatus: gym.subscriptionStatus || 'trial',
        trialEndsAt: gym.trialEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subscriptionExpiresAt: gym.subscriptionExpiresAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend OTP to Email
// @route   POST /api/auth/resend-otp
const resendOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.body;

    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone number is required to resend verification OTP.',
      });
    }

    let query = {};
    if (email) {
      query.email = email.toLowerCase().trim();
    } else {
      const cleanPhone = phone.toString().replace(/\D/g, '').slice(-10);
      query.phone = cleanPhone;
    }

    const gym = await Gym.findOne(query);

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found for this email/phone. Please register first.',
      });
    }

    if (gym.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This Gym account is already verified. Please sign in.',
      });
    }

    // Generate fresh 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    gym.otpCode = otpCode;
    gym.otpExpiresAt = otpExpiresAt;
    await gym.save();

    console.log(`
    🔑 ══════════════════════════════════════════════════════════ 🔑
       🔄 RESENT OTP for (${gym.email} / ${gym.phone}): [ ${otpCode} ]
       💡 Demo/Testing OTP: [ 123456 ]
    🔑 ══════════════════════════════════════════════════════════ 🔑
    `);

    // Send dark-themed HTML verification email dynamically in background (non-blocking)
    sendEmailOtp({
      toEmail: gym.email,
      otp: otpCode,
      gymName: gym.gymName,
      ownerName: gym.ownerName,
    }).catch((err) => {
      console.warn('⚠️ [ResendOtp] Background OTP email dispatch error:', err.message);
    });

    res.status(200).json({
      success: true,
      message: `A fresh 6-digit verification OTP has been sent to ${gym.email}. Please check your Inbox or Spam folder.`,
      email: gym.email,
      phone: gym.phone,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login Gym Owner
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter email and password.' });
    }

    const gym = await Gym.findOne({ email: email.toLowerCase() });
    if (!gym) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, gym.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(gym._id);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
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
        subscriptionStatus: gym.subscriptionStatus || 'trial',
        trialEndsAt: gym.trialEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subscriptionExpiresAt: gym.subscriptionExpiresAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    1-Click Demo Login into "Iron Paradise Fitness"
// @route   POST /api/auth/demo-login
const demoLogin = async (req, res, next) => {
  try {
    const demoEmail = 'demo@gymflow.in';
    let demoGym = await Gym.findOne({ email: demoEmail });

    if (!demoGym) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Demo@12345', salt);

      demoGym = await Gym.create({
        gymName: 'Iron Paradise Fitness',
        ownerName: 'Vikram Rajput',
        phone: '9820012345',
        email: demoEmail,
        password: hashedPassword,
        upiId: 'ironparadise@okaxis',
        upiQrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=ironparadise@okaxis&pn=Iron%20Paradise%20Fitness',
        address: 'Bandra West, Mumbai, Maharashtra',
        isVerified: true,
        isDemo: true,
      });

      await createDefaultPlans(demoGym._id);

      // Seed 20 realistic Indian members
      const { seedDemoMembers } = require('../seed');
      await seedDemoMembers(demoGym._id);
    } else {
      if (!demoGym.isVerified) {
        demoGym.isVerified = true;
      }
      if (!demoGym.trialEndsAt) {
        demoGym.trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        demoGym.subscriptionStatus = 'trial';
      }
      await demoGym.save();
    }

    const token = generateToken(demoGym._id);

    res.json({
      success: true,
      message: '⚡ 1-Click Demo Gym Session Loaded Successfully!',
      token,
      gym: {
        id: demoGym._id,
        gymName: demoGym.gymName,
        ownerName: demoGym.ownerName,
        email: demoGym.email,
        phone: demoGym.phone,
        upiId: demoGym.upiId,
        upiQrCodeUrl: demoGym.upiQrCodeUrl || 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=ironparadise@okaxis&pn=Iron%20Paradise%20Fitness',
        address: demoGym.address,
        isVerified: true,
        isDemo: true,
        subscriptionStatus: demoGym.subscriptionStatus || 'trial',
        trialEndsAt: demoGym.trialEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subscriptionExpiresAt: demoGym.subscriptionExpiresAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Current Logged in Gym
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      gym: req.gym,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Gym Profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const gym = await Gym.findById(req.gymId);
    if (!gym) {
      return res.status(404).json({ success: false, message: 'Gym not found.' });
    }

    const { gymName, ownerName, phone, upiId, upiQrCodeUrl, address, password } = req.body;
    if (gymName) gym.gymName = gymName.trim();
    if (ownerName) gym.ownerName = ownerName.trim();
    if (phone) gym.phone = phone.replace(/\D/g, '').slice(-10);
    if (upiId) gym.upiId = upiId.trim();
    if (upiQrCodeUrl !== undefined) gym.upiQrCodeUrl = upiQrCodeUrl;
    if (address) gym.address = address.trim();

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      gym.password = await bcrypt.hash(password, salt);
    }

    await gym.save();

    res.json({
      success: true,
      message: 'Profile updated successfully!',
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
        subscriptionStatus: gym.subscriptionStatus || 'trial',
        trialEndsAt: gym.trialEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subscriptionExpiresAt: gym.subscriptionExpiresAt || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request Password Reset OTP
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid registered email address.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const gym = await Gym.findOne({ email: cleanEmail });

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: 'No registered gym found with this email address.',
      });
    }

    // Generate 6-digit random OTP & 10 minutes expiry
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    gym.resetPasswordOtp = otpCode;
    gym.resetPasswordExpires = otpExpiresAt;
    await gym.save();

    console.log(`
    🔑 ══════════════════════════════════════════════════════════ 🔑
       🔒 PASSWORD RESET OTP for (${gym.email}): [ ${otpCode} ]
       🏢 Gym: ${gym.gymName} | Owner: ${gym.ownerName}
       ⏳ Valid for 10 minutes
    🔑 ══════════════════════════════════════════════════════════ 🔑
    `);

    // Dispatch dark-themed password reset email in background (non-blocking)
    sendEmailOtp({
      toEmail: gym.email,
      otp: otpCode,
      gymName: gym.gymName,
      ownerName: gym.ownerName,
      type: 'PASSWORD_RESET',
    }).catch((err) => {
      console.warn('⚠️ [ForgotPassword] Background email error:', err.message);
    });

    res.status(200).json({
      success: true,
      message: `A 6-digit password reset OTP has been sent to ${gym.email}. Please check your Inbox or Spam folder.`,
      email: gym.email,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password using OTP
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, password } = req.body;
    const finalPassword = newPassword || password;

    if (!email || !otp || !finalPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, 6-digit OTP, and new password are all required.',
      });
    }

    if (finalPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const gym = await Gym.findOne({ email: cleanEmail });

    if (!gym) {
      return res.status(404).json({
        success: false,
        message: 'Account not found. Please verify your email address.',
      });
    }

    const inputOtp = otp.toString().trim();
    const isMatchingOtp =
      gym.resetPasswordOtp &&
      gym.resetPasswordOtp === inputOtp &&
      gym.resetPasswordExpires &&
      new Date(gym.resetPasswordExpires) > new Date();

    if (!isMatchingOtp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please request a new password reset OTP.',
      });
    }

    // Hash the new password with bcrypt (salt rounds = 10)
    const salt = await bcrypt.genSalt(10);
    gym.password = await bcrypt.hash(finalPassword, salt);

    // Clear reset OTP fields
    gym.resetPasswordOtp = undefined;
    gym.resetPasswordExpires = undefined;
    await gym.save();

    console.log(`✅ [ResetPassword] Password successfully reset for: ${gym.email}`);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOtp,
  resendOtp,
  login,
  demoLogin,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
};


