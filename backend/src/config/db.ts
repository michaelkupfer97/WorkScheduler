import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.warn('Server will start without database. Reconnecting in background...');
    retryConnection();
  }
}

function retryConnection() {
  setTimeout(async () => {
    try {
      await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('MongoDB reconnected successfully');
    } catch {
      console.warn('MongoDB still unreachable. Retrying in 30s...');
      retryConnection();
    }
  }, 30000);
}
