const mongoose = require('mongoose');
const Gym = require('./models/Gym');
const Plan = require('./models/Plan');
const Member = require('./models/Member');
const Payment = require('./models/Payment');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const indianGymMembersData = [
  // 1. Expiring Soon (3-4 Days Left)
  {
    name: 'Rahul Sharma',
    phone: '9820111223',
    gender: 'Male',
    planIndex: 0, // 1 Month
    daysOffset: 3, // Expiring in 3 days
    price: 1500,
    paidAmount: 1500,
    dueAmount: 0,
  },
  {
    name: 'Priya Patel',
    phone: '9876544332',
    gender: 'Female',
    planIndex: 1, // 3 Months
    daysOffset: 2, // Expiring in 2 days
    price: 3800,
    paidAmount: 3800,
    dueAmount: 0,
  },
  {
    name: 'Amit Verma',
    phone: '9811255667',
    gender: 'Male',
    planIndex: 0,
    daysOffset: 3, // Expiring in 3 days
    price: 1500,
    paidAmount: 1000,
    dueAmount: 500, // Udhaari!
  },
  {
    name: 'Neha Gupta',
    phone: '9920377889',
    gender: 'Female',
    planIndex: 2,
    daysOffset: 4,
    price: 6500,
    paidAmount: 6500,
    dueAmount: 0,
  },

  // 2. Expired Members
  {
    name: 'Vikram Singh',
    phone: '9833422334',
    gender: 'Male',
    planIndex: 1,
    daysOffset: -3, // Expired 3 days ago
    price: 3800,
    paidAmount: 3800,
    dueAmount: 0,
  },
  {
    name: 'Rohit Kumar',
    phone: '9769099887',
    gender: 'Male',
    planIndex: 0,
    daysOffset: -8, // Expired 8 days ago
    price: 1500,
    paidAmount: 500,
    dueAmount: 1000, // Udhaari + Expired
  },
  {
    name: 'Sneha Reddy',
    phone: '9845012398',
    gender: 'Female',
    planIndex: 0,
    daysOffset: -15,
    price: 1500,
    paidAmount: 1500,
    dueAmount: 0,
  },
  {
    name: 'Deepak Yadav',
    phone: '9892044556',
    gender: 'Male',
    planIndex: 1,
    daysOffset: -20,
    price: 3800,
    paidAmount: 2500,
    dueAmount: 1300,
  },

  // 3. Pending Udhaari (Dues)
  {
    name: 'Ankit Mishra',
    phone: '9819988776',
    gender: 'Male',
    planIndex: 2,
    daysOffset: 50,
    price: 6500,
    paidAmount: 4500,
    dueAmount: 2000,
  },
  {
    name: 'Kunal Patil',
    phone: '9823065432',
    gender: 'Male',
    planIndex: 1,
    daysOffset: 25,
    price: 3800,
    paidAmount: 2300,
    dueAmount: 1500,
  },
  {
    name: 'Manoj Tiwari',
    phone: '9870154321',
    gender: 'Male',
    planIndex: 0,
    daysOffset: 12,
    price: 1500,
    paidAmount: 700,
    dueAmount: 800,
  },
  {
    name: 'Pooja Sharma',
    phone: '9811876543',
    gender: 'Female',
    planIndex: 0,
    daysOffset: 10,
    price: 1500,
    paidAmount: 1000,
    dueAmount: 500,
  },

  // 4. Active Loyal Members
  {
    name: 'Harpreet Singh',
    phone: '9814098765',
    gender: 'Male',
    planIndex: 3, // 1 Year
    daysOffset: 180,
    price: 11000,
    paidAmount: 11000,
    dueAmount: 0,
  },
  {
    name: 'Kavita Nair',
    phone: '9847033221',
    gender: 'Female',
    planIndex: 2,
    daysOffset: 90,
    price: 6500,
    paidAmount: 6500,
    dueAmount: 0,
  },
  {
    name: 'Sachin Kulkarni',
    phone: '9822077112',
    gender: 'Male',
    planIndex: 1,
    daysOffset: 45,
    price: 3800,
    paidAmount: 3800,
    dueAmount: 0,
  },
  {
    name: 'Divya Choudhary',
    phone: '9829088223',
    gender: 'Female',
    planIndex: 1,
    daysOffset: 60,
    price: 3800,
    paidAmount: 3800,
    dueAmount: 0,
  },
  {
    name: 'Arjun Chauhan',
    phone: '9810044119',
    gender: 'Male',
    planIndex: 1,
    daysOffset: 35,
    price: 3800,
    paidAmount: 3800,
    dueAmount: 0,
  },
  {
    name: 'Sunita Deshmukh',
    phone: '9821166334',
    gender: 'Female',
    planIndex: 3,
    daysOffset: 200,
    price: 11000,
    paidAmount: 11000,
    dueAmount: 0,
  },
  {
    name: 'Shreya Joshi',
    phone: '9820599441',
    gender: 'Female',
    planIndex: 0,
    daysOffset: 20,
    price: 1500,
    paidAmount: 1500,
    dueAmount: 0,
  },
  {
    name: 'Rakesh Joshi',
    phone: '9869011998',
    gender: 'Male',
    planIndex: 1,
    daysOffset: 70,
    price: 3800,
    paidAmount: 3800,
    dueAmount: 0,
  },
];

const seedDemoMembers = async (gymId) => {
  try {
    let plans = await Plan.find({ gymId });
    if (plans.length === 0) {
      const defaultPlans = [
        { gymId, planName: '1 Month', durationInDays: 30, price: 1500 },
        { gymId, planName: '3 Months', durationInDays: 90, price: 3800 },
        { gymId, planName: '6 Months', durationInDays: 180, price: 6500 },
        { gymId, planName: '1 Year Annual', durationInDays: 365, price: 11000 },
      ];
      plans = await Plan.insertMany(defaultPlans);
    }

    await Member.deleteMany({ gymId });
    await Payment.deleteMany({ gymId });

    const now = new Date();
    const createdMembers = [];

    for (const data of indianGymMembersData) {
      const selectedPlan = plans[data.planIndex] || plans[0];
      const endDate = new Date(now.getTime() + data.daysOffset * 24 * 60 * 60 * 1000);
      const startDate = new Date(endDate.getTime() - selectedPlan.durationInDays * 24 * 60 * 60 * 1000);

      let status = 'Active';
      if (data.daysOffset < 0) status = 'Expired';
      else if (data.daysOffset <= 5) status = 'Expiring_Soon';

      const member = await Member.create({
        gymId,
        name: data.name,
        phone: data.phone,
        gender: data.gender,
        currentPlan: selectedPlan._id,
        planName: selectedPlan.planName,
        startDate,
        endDate,
        paidAmount: data.paidAmount,
        dueAmount: data.dueAmount,
        status,
        aiDietPlan: {
          goal: data.gender === 'Male' ? 'Muscle Gain' : 'Fat Loss',
          dietType: data.name.includes('Patel') || data.name.includes('Gupta') || data.name.includes('Joshi') ? 'Pure Veg' : 'Non-Veg',
          generatedPlan: `Budget-Friendly Indian Gym Diet for ${data.name}: Paneer, Dal, Soya Chunks, Oats, Sprouts, Phulka Roti, and Curd.`,
          lastUpdated: new Date(),
        },
      });

      createdMembers.push(member);

      if (data.paidAmount > 0) {
        await Payment.create({
          gymId,
          memberId: member._id,
          amount: data.paidAmount,
          paymentMode: data.paidAmount % 1000 === 0 ? 'UPI' : 'Cash',
          remarks: `Initial fee for ${selectedPlan.planName}`,
          paymentDate: startDate,
        });
      }
    }

    console.log(`✅ Successfully seeded 20 Realistic Indian Gym Members for Demo Gym: ${gymId}`);
    return createdMembers;
  } catch (err) {
    console.error('❌ Error seeding demo members:', err.message);
  }
};

const runStandaloneSeed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gymflow_db';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

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
        address: 'Bandra West, Mumbai, Maharashtra',
        isDemo: true,
      });
      console.log('Created Demo Gym: Iron Paradise Fitness');
    }

    await seedDemoMembers(demoGym._id);
    console.log('🎉 Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Standalone seed failed:', error.message);
    process.exit(1);
  }
};

if (require.main === module) {
  runStandaloneSeed();
}

module.exports = {
  seedDemoMembers,
};
