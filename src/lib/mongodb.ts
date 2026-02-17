import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let isConnected: boolean = false; 

export const connectToDatabase = async () => {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(MONGODB_URI);

    isConnected = !!db.connections[0].readyState;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};
