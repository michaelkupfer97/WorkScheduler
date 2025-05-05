import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['manager', 'employee'], default: 'employee' },
  organization: { type: String, required: false },  // השדה לארגון
});

export const User = mongoose.model('User', userSchema);

