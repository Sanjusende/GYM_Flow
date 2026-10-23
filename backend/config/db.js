const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Windows Node.js querySrv ECONNREFUSED:
// Node.js on Windows often defaults to 127.0.0.1 for DNS lookups which refuses SRV queries.
// Setting public DNS (Google 8.8.8.8 and Cloudflare 1.1.1.1) allows resolving mongodb+srv:// records.
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (err) {
  // Ignore if running in an environment where setServers is restricted
}

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGODB_URI ||
      'mongodb+srv://shendesanju89_db_user:Sanjay%402002@cluster0.bpkluvl.mongodb.net/GYM_Saas?retryWrites=true&w=majority';

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ MongoDB Connection Notice: ${error.message}`);
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
      console.warn(`🔑 Authentication Error: Please verify your MongoDB Atlas database username & password in .env (MONGODB_URI).`);
    } else {
      console.warn(`💡 Tip: To connect MongoDB Atlas or local MongoDB, check MONGODB_URI in your .env file.`);
    }
  }
};

module.exports = connectDB;

