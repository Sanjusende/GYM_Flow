const Member = require('../models/Member');

// High-quality Curated Indian Fitness Diet Plan generator fallback
const generateCuratedIndianDiet = (goal, dietaryPreference, calories = 2200) => {
  const isVeg = dietaryPreference?.toLowerCase().includes('veg') && !dietaryPreference?.toLowerCase().includes('non');
  const isEgg = dietaryPreference?.toLowerCase().includes('egg');

  let proteinSource1 = isVeg ? '200g Low-fat Paneer / Tofu' : (isEgg ? '4 Boiled Eggs (2 whole + 2 whites)' : '4 Boiled Eggs or 150g Chicken Sausages');
  let proteinSource2 = isVeg ? '50g Soya Chunks Curry + Dal' : '150g Grilled / Boiled Chicken Breast + Dal Tadka';
  let proteinSource3 = isVeg ? '1 Scoop Whey Protein or 1 Glass Sattu Drink (40g roasted chana sattu)' : '1 Scoop Whey Protein with skimmed milk or water';
  let dinnerProtein = isVeg ? '150g Paneer Bhurji / Rajma / Chole with 2 Roti' : '150g Tawa Chicken Breast / Fish Curry with 2 Phulka Roti';

  return `
🥗 **CUSTOMIZED INDIAN GYM DIET PLAN**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 **Target Goal:** ${goal || 'Lean Muscle Building'}
⚡ **Daily Calorie Target:** ~${calories} kcal
🥑 **Diet Type:** ${dietaryPreference || 'High Protein Indian (Eggetarian / Non-Veg)'}

⏰ **1. Early Morning (7:00 AM) - Wake Up & Hydration**
• 500ml Warm Water + 1 tsp Chia Seeds / Lemon
• 5-6 Soaked Almonds + 2 Walnuts + 1 Banana

🥞 **2. Breakfast (8:30 AM) - Sustained Energy**
• 60g Rolled Oats cooked in 200ml Toned Milk / Water + 1 tbsp Peanut Butter
• ${proteinSource1}
• 1 seasonal fruit (Apple or Papaya)

🥜 **3. Mid-Morning Snack (11:30 AM)**
• 1 Handful Roasted Chana (40g) + Sprouts Salad (Moong + Cucumber + Tomato + Lemon)
• 1 Cup Green Tea (Sugar-free)

🍛 **4. Lunch (1:30 PM) - Power Carbs & Protein**
• 2 Whole Wheat Phulka Roti (lightly smeared with desi ghee)
• 1 Bowl Steamed Brown Rice / White Rice (100g cooked)
• 1 Big Bowl Thick Dal (Moong / Toor / Masoor)
• ${proteinSource2}
• Big bowl of Green Salad (Cucumber, Tomato, Beetroot, Onion)

⚡ **5. Pre-Workout Fuel (4:30 PM - 45 mins before Gym)**
• 1 Cup Black Coffee (No Sugar)
• 2 Brown Bread Slices with 1 tbsp Natural Peanut Butter OR 1 Large Banana

💪 **6. Post-Workout Recovery (6:30 PM - Immediate)**
• ${proteinSource3}
• 1 Banana or 30g Dextrose/Dates for fast glycogen replenishment

🍲 **7. Dinner (8:30 PM) - Light & Protein-Dense**
• ${dinnerProtein}
• 1 Bowl Stir-Fried Indian Veggies (Broccoli / Beans / Shimla Mirch / Cabbage)
• 1 Cup Fresh Curd / Dahi (150g)

🥛 **8. Bedtime (10:30 PM) - Overnight Muscle Recovery**
• 1 Glass Warm Milk with a pinch of Haldi (Turmeric) and Cinnamon
• 7-8 Hours of Deep Restful Sleep

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 **ESTIMATED MACRO BREAKDOWN:**
• **Protein:** ~135g - 160g (High Bioavailability)
• **Carbohydrates:** ~220g - 250g (Complex slow-release)
• **Healthy Fats:** ~50g - 65g (Desi ghee, nuts, peanut butter)
• **Water Intake:** 3.5 to 4.5 Litres Daily
💡 **Pro-Tip:** Consistency over 8 weeks delivers 10x better muscle definition than any random supplement!
`.trim();
};

// @desc    Generate Gemini AI Diet Plan for Indian Gym Members
// @route   POST /api/members/:id/ai-diet or POST /api/ai/generate-diet
const generateDietPlan = async (req, res, next) => {
  try {
    const {
      memberId: bodyMemberId,
      goal = 'Muscle Gain',
      dietaryPreference = 'Non-Vegetarian',
      calories = 2200,
      budget = 'Budget-friendly',
      allergies = '',
      currentWeight,
    } = req.body;

    const memberId = req.params.id || bodyMemberId;

    let dietText = '';
    const apiKey = process.env.GEMINI_API_KEY;

    // If Gemini API Key exists, try calling Gemini 2.5 Flash / 1.5 Flash
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
                      text: `You are an expert Indian sports nutritionist and certified fitness coach for Indian gym members.
Generate a structured, practical, budget-friendly 1-day Indian gym diet plan formatted with clean emojis and markdown.
Details:
- Goal: ${goal}
- Dietary Preference: ${dietaryPreference} (Include foods like Paneer, Soya Chunks, Dal, Sprouts, Curd, Eggs, Chicken breast, Roti, Rice, Sattu, Peanuts)
- Daily Calorie Target: ~${calories} kcal
- Budget: ${budget}
- Member Weight: ${currentWeight || '70kg'}
- Specific Notes / Allergies: ${allergies || 'None'}

Provide:
1. Breakfast, Mid-Morning, Lunch, Pre-Workout, Post-Workout, Dinner, Bedtime.
2. Estimated Protein (in grams), Carbs, Fats, and Calories.
3. 3 practical tips for Indian gym goers (e.g., water intake, affordable protein hacks like sattu/soya). Keep it encouraging and easy to follow.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        const data = await response.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          dietText = data.candidates[0].content.parts[0].text;
        }
      } catch (geminiError) {
        console.warn('⚠️ Gemini API call failed, using high-quality curated generator:', geminiError.message);
      }
    }

    // Fallback if no key or API failed
    if (!dietText) {
      dietText = generateCuratedIndianDiet(goal, dietaryPreference, calories);
    }

    // If memberId is provided, cache to member record
    if (memberId) {
      const query = req.gymId ? { _id: memberId, gymId: req.gymId } : { _id: memberId };
      await Member.findOneAndUpdate(
        query,
        {
          aiDietCache: {
            goal,
            dietaryPreference,
            calories: Number(calories),
            dietText,
            generatedAt: new Date(),
          },
          aiDietPlan: {
            goal,
            dietType: dietaryPreference,
            generatedPlan: dietText,
            lastUpdated: new Date(),
          },
        }
      );
    }

    res.json({
      success: true,
      message: '✨ Indian Gym Diet Plan generated successfully!',
      diet: {
        goal,
        dietaryPreference,
        calories: Number(calories),
        dietText,
        generatedAt: new Date(),
      },
      dietPlan: {
        goal,
        dietType: dietaryPreference,
        generatedPlan: dietText,
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateDietPlan,
};
