import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    console.log("Attempting to connect to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);  // ללא אופציות נוספות
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1); // יוצא מהיישום אם החיבור נכשל
  }
};
