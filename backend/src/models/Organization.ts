import mongoose, { Schema, Document } from 'mongoose';
import crypto from 'crypto';

export interface IOrganizationDocument extends Document {
  name: string;
  timezone: string;
  weekStartsOn: number;
  shiftTypes: Array<{
    name: string;
    startTime: string;
    endTime: string;
    color: string;
  }>;
  inviteCode: string;
}

const shiftTypeSchema = new Schema(
  {
    name: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    color: { type: String, required: true },
  },
  { _id: true }
);

const organizationSchema = new Schema<IOrganizationDocument>(
  {
    name: { type: String, required: true, trim: true },
    timezone: { type: String, default: 'Asia/Jerusalem' },
    weekStartsOn: { type: Number, default: 0, min: 0, max: 6 },
    shiftTypes: {
      type: [shiftTypeSchema],
      default: [
        { name: 'Morning', startTime: '07:00', endTime: '15:00', color: '#FDE68A' },
        { name: 'Afternoon', startTime: '15:00', endTime: '23:00', color: '#93C5FD' },
        { name: 'Night', startTime: '23:00', endTime: '07:00', color: '#C4B5FD' },
      ],
    },
    inviteCode: { type: String, unique: true },
  },
  { timestamps: true }
);

organizationSchema.pre('save', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = crypto.randomBytes(6).toString('hex');
  }
  next();
});

export const Organization = mongoose.model<IOrganizationDocument>('Organization', organizationSchema);
