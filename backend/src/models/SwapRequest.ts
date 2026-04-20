import mongoose, { Schema, Document } from 'mongoose';

export interface ISwapRequestDocument extends Document {
  requesterId: mongoose.Types.ObjectId;
  targetEmployeeId: mongoose.Types.ObjectId;
  originalShiftId: mongoose.Types.ObjectId;
  targetShiftId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  managerNote?: string;
}

const swapRequestSchema = new Schema<ISwapRequestDocument>(
  {
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetEmployeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalShiftId: { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
    targetShiftId: { type: Schema.Types.ObjectId, ref: 'Shift', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    managerNote: { type: String },
  },
  { timestamps: true }
);

export const SwapRequest = mongoose.model<ISwapRequestDocument>('SwapRequest', swapRequestSchema);
