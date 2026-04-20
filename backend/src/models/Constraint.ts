import mongoose, { Schema, Document } from 'mongoose';

export interface IConstraintDocument extends Document {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  weekStartDate: Date;
  entries: Array<{
    dayOfWeek: number;
    shiftType: string;
    preference: 'available' | 'preferred' | 'unavailable';
  }>;
  submittedAt: Date;
  deadline: Date;
}

const constraintEntrySchema = new Schema(
  {
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    shiftType: { type: String, required: true },
    preference: { type: String, enum: ['available', 'preferred', 'unavailable'], required: true },
  },
  { _id: false }
);

const constraintSchema = new Schema<IConstraintDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    weekStartDate: { type: Date, required: true },
    entries: { type: [constraintEntrySchema], required: true },
    submittedAt: { type: Date, default: Date.now },
    deadline: { type: Date, required: true },
  },
  { timestamps: true }
);

constraintSchema.index({ userId: 1, weekStartDate: 1 }, { unique: true });
constraintSchema.index({ organizationId: 1, weekStartDate: 1 });

export const Constraint = mongoose.model<IConstraintDocument>('Constraint', constraintSchema);
