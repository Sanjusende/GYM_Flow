const Member = require('../models/Member');
const Payment = require('../models/Payment');
const Gym = require('../models/Gym');

// Helper to determine status
const computeStatus = (endDate) => {
  const now = new Date();
  const diffDays = Math.ceil((new Date(endDate) - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Expired';
  if (diffDays <= 5) return 'Expiring_Soon';
  return 'Active';
};

// High-quality budget-friendly 7-day Indian Gym Diet Generator
const generateBudgetIndianDiet = (goal, dietType = 'Non-Veg') => {
  const isVeg = dietType.toLowerCase().includes('veg') && !dietType.toLowerCase().includes('non');
  const isEgg = dietType.toLowerCase().includes('egg');

  const p1 = isVeg ? '200g Low-fat Paneer / Tofu Bhurji' : (isEgg ? '4 Boiled Eggs (2 whole + 2 whites)' : '4 Boiled Eggs or 150g Chicken Sausages');
  const p2 = isVeg ? '60g Soya Chunks Curry + Thick Dal' : '150g Tawa Chicken Breast / Fish Curry + Dal Tadka';
  const snack = isVeg ? '1 Glass Sattu Drink (40g Chana Sattu) + Roasted Peanuts' : '1 Scoop Whey / Sattu Drink + Boiled Eggs';

  return `
🥗 **BUDGET-FRIENDLY 7-DAY INDIAN GYM DIET CHART**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 **Target Goal:** ${goal || 'Muscle Gain & Hypertrophy'}
🥑 **Diet Type:** ${dietType}
⚡ **Target Daily Macros:** ~135g-155g Protein | ~220g Carbs | ~55g Healthy Fats

⏰ **DAILY MEAL SCHEDULE (MONDAY - SUNDAY):**

🌅 **1. Early Morning (6:30 AM)**
• 500ml Warm Water + 1 tsp Chia Seeds / Lemon
• 5 Soaked Almonds + 2 Walnuts + 1 Banana

🥞 **2. Breakfast (8:30 AM) - High Energy**
• 60g Rolled Oats cooked in 200ml Toned Milk / Water + 1 tbsp Peanut Butter
• ${p1}
• 1 Seasonal Fruit (Apple or Papaya)

🥜 **3. Mid-Morning Snack (11:30 AM) - Budget Protein**
• 1 Bowl Boiled Moong Sprouts Salad (Cucumber, Tomato, Lemon & Onion)
• 1 Handful Roasted Chana (40g)
• 1 Cup Green Tea (Sugar-free)

🍛 **4. Lunch (1:30 PM) - Power Carbs & Micro Nutrients**
• 2 Whole Wheat Phulka Roti (lightly smeared with Desi Ghee)
• 1 Bowl Steamed Brown Rice or White Rice (100g cooked)
• 1 Big Bowl Thick Dal (Moong / Toor / Chana)
• ${p2}
• Fresh Cucumber, Tomato & Beetroot Green Salad

⚡ **5. Pre-Workout Fuel (4:30 PM - 45 mins before training)**
• 1 Cup Strong Black Coffee (No Sugar)
• 2 Whole Wheat Bread Slices with 1 tbsp Natural Peanut Butter OR 1 Large Banana

💪 **6. Post-Workout Recovery (6:30 PM - Immediate)**
• ${snack}
• 1 Banana or 30g Dextrose/Dates for fast glycogen replenishment

🍲 **7. Dinner (8:30 PM) - Lean & Protein-Dense**
• 2 Phulka Roti with ${isVeg ? '150g Paneer / Rajma / Chole Curry' : '150g Grilled / Boiled Chicken Breast with Steamed Veggies'}
• 1 Bowl Stir-Fried Indian Veggies (Shimla Mirch, Beans, Cabbage)
• 1 Cup Fresh Curd / Dahi (150g)

🥛 **8. Bedtime (10:30 PM) - Overnight Recovery**
• 1 Glass Warm Haldi Milk (Turmeric Milk with Cinnamon)
• 7.5 - 8 Hours of Deep Restful Sleep

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 **TOP 3 BUDGET INDIAN FITNESS TIPS:**
1. **Soya Chunks & Sattu:** 50g Soya Chunks provide ~26g protein for just ₹10-15! Sattu drink gives instant sustained energy.
2. **Hydration:** Drink at least 3.5 to 4.5 litres of water daily to prevent muscle cramps and optimize protein digestion.
3. **Consistency:** Stick to these natural Indian whole foods for 8 weeks for remarkable physique transformation.
`.trim();
};

// @desc    Public Member Portal - Check membership by 10-digit phone number
// @route   GET /api/public/member/:phone
const getMemberByPhone = async (req, res, next) => {
  try {
    const rawPhone = req.params.phone.trim();
    const cleanPhone = rawPhone.replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit phone number.',
      });
    }

    const member = await Member.findOne({
      phone: { $regex: cleanPhone + '$' },
    })
      .populate('currentPlan')
      .lean();

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'No gym membership found with this phone number. Please check with your gym reception.',
      });
    }

    const gym = await Gym.findById(member.gymId)
      .select('gymName ownerName phone upiId upiQrCodeUrl address')
      .lean();

    const payments = await Payment.find({ memberId: member._id })
      .sort({ paymentDate: -1 })
      .lean();

    const diffDays = Math.ceil((new Date(member.endDate) - new Date()) / (1000 * 60 * 60 * 24));
    const currentStatus = computeStatus(member.endDate);

    // Dynamic UPI Payment Link if member has pending dues
    let upiDeepLink = null;
    if (member.dueAmount > 0 && gym?.upiId) {
      upiDeepLink = `upi://pay?pa=${gym.upiId}&pn=${encodeURIComponent(gym.gymName)}&am=${member.dueAmount}&tn=${encodeURIComponent('Gym Fee: ' + member.name)}&cu=INR`;
    }

    res.json({
      success: true,
      gym: gym || {
        gymName: 'Iron Paradise Fitness',
        ownerName: 'Gym Owner',
        phone: '+91 98200 12345',
        upiId: 'ironparadise@okaxis',
        upiQrCodeUrl: '',
      },
      member: {
        id: member._id,
        name: member.name,
        phone: member.phone,
        gender: member.gender,
        planName: member.planName || member.currentPlan?.planName || 'General Membership',
        startDate: member.startDate,
        endDate: member.endDate,
        status: currentStatus,
        diffDays,
        paidAmount: member.paidAmount,
        dueAmount: member.dueAmount,
        aiDietPlan: member.aiDietPlan?.generatedPlan ? member.aiDietPlan : null,
      },
      upiDeepLink,
      payments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate / Fetch Cached 7-Day Indian Gym Diet Chart (Gemini 2.5 Flash)
// @route   POST /api/public/member/:id/diet
const generateMemberDiet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { goal = 'Muscle Gain', dietType = 'Non-Veg', forceRefresh = false } = req.body;

    const member = await Member.findById(id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Member not found.' });
    }

    // Check if valid cached diet exists within 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (
      !forceRefresh &&
      member.aiDietPlan?.generatedPlan &&
      member.aiDietPlan.lastUpdated &&
      new Date(member.aiDietPlan.lastUpdated) > sevenDaysAgo
    ) {
      return res.json({
        success: true,
        cached: true,
        message: 'Loaded cached 7-day Indian Diet Plan.',
        dietPlan: member.aiDietPlan,
      });
    }

    let generatedText = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_gemini_api_key_here') {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `You are an elite Indian certified sports nutritionist.
Create a structured, budget-friendly 7-day Indian gym diet chart formatted cleanly with emojis and markdown.
Details:
- Member Name: ${member.name}
- Goal: ${goal}
- Diet Type: ${dietType} (Must feature Indian foods like Paneer, Soya Chunks, Dal, Sprouts, Oats, Eggs, Chicken breast, Roti, Curd, Sattu)
- Calorie Target: ~2200-2400 kcal
- Budget: Low to moderate budget Indian gym member

Include:
1. Daily schedule: Early Morning, Breakfast, Mid-Morning, Lunch, Pre-Workout, Post-Workout, Dinner, Bedtime.
2. Estimated Protein, Carbs, Fats.
3. 3 Practical budget protein hacks for Indian lifters.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          generatedText = data.candidates[0].content.parts[0].text;
        }
      } catch (geminiError) {
        console.warn('⚠️ Gemini call failed, using high-quality Indian diet generator:', geminiError.message);
      }
    }

    // Fallback if no key or API failed
    if (!generatedText) {
      generatedText = generateBudgetIndianDiet(goal, dietType);
    }

    // Cache in member.aiDietPlan for 7 days
    member.aiDietPlan = {
      goal,
      dietType,
      generatedPlan: generatedText,
      lastUpdated: new Date(),
    };
    await member.save();

    res.json({
      success: true,
      cached: false,
      message: '✨ 7-Day Indian Gym Diet Chart generated and cached successfully!',
      dietPlan: member.aiDietPlan,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMemberByPhone,
  generateMemberDiet,
};
