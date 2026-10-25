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

const DIRECT_FALLBACK_URI =
  'mongodb://shendesanju89_db_user:Sanjay%402002@ac-xqtbq3u-shard-00-00.bpkluvl.mongodb.net:27017,ac-xqtbq3u-shard-00-01.bpkluvl.mongodb.net:27017,ac-xqtbq3u-shard-00-02.bpkluvl.mongodb.net:27017/GYM_Saas?ssl=true&authSource=admin&retryWrites=true&w=majority';

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || DIRECT_FALLBACK_URI;

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB Connection Failed (${error.message}). Attempting Direct Shard Fallback...`);

    // If SRV DNS query refused on Windows or primary fails, try direct non-SRV replica set
    try {
      const fallbackConn = await mongoose.connect(DIRECT_FALLBACK_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected via Direct Shard Fallback: ${fallbackConn.connection.host}`);
      return fallbackConn;
    } catch (fallbackError) {
      console.error(`❌ MongoDB Fallback Connection Error: ${fallbackError.message}`);
      if (fallbackError.message.includes('bad auth') || fallbackError.message.includes('authentication failed')) {
        console.warn(`🔑 Authentication Error: Please verify your MongoDB Atlas database username & password in .env (MONGODB_URI).`);
      } else {
        console.warn(`💡 Tip: To connect MongoDB Atlas or local MongoDB, check MONGODB_URI in your .env file.`);
      }
    }
  }
};

module.exports = connectDB;

