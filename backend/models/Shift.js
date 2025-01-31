// models/Shift.js
import mongoose from 'mongoose';

const shiftSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],  // שייך לעובדים
  status: { type: String, enum: ['pending', 'completed', 'canceled'], default: 'pending' }
});

export const Shift = mongoose.model('Shift', shiftSchema);
