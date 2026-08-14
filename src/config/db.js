const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error('MONGODB_URI environment variable is missing');
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoURI, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000
      })
      .then((mongooseInstance) => {
        console.log(`[Database] MongoDB Connected: ${mongooseInstance.connection.host} | DB: ${mongooseInstance.connection.name}`);
        return mongooseInstance;
      })
      .catch((err) => {
        console.error(`[Database Error] Connection failed: ${err.message}`);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
};

module.exports = connectDB;
