import mongoose from 'mongoose';
import app from '../src/app.js';

// Global variable to cache the database connection in serverless environments
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  
  if (mongoose.connections.length > 0) {
    isConnected = mongoose.connections[0].readyState === 1;
    if (isConnected) return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
    console.log('MongoDB connected for serverless function');
  } catch (error) {
    console.error('Failed to connect to MongoDB in serverless environment', error);
  }
};

export default async function handler(req, res) {
  // Ensure database connection before handling the request
  await connectDB();
  
  // Pass the request to your Express app
  return app(req, res);
}
