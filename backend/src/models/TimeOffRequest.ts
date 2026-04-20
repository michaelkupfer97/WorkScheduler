import mongoose, { Schema, Document } from 'mongoose';

export interface ITimeOffRequestDocument extends Document {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  managerNote?: string;
}

const timeOffRequestSchema = new Schema<ITimeOffRequestDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    managerNote: { type: String },
  },
  { timestamps: true }
);

export const TimeOffRequest = mongoose.model<ITimeOffRequestDocument>('TimeOffRequest', timeOffRequestSchema);
