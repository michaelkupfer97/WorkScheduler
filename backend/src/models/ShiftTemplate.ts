import mongoose, { Schema, Document } from 'mongoose';

export interface IShiftTemplateDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  dayOfWeek: number;
  shiftType: string;
  requiredCount: number;
}

const shiftTemplateSchema = new Schema<IShiftTemplateDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
    shiftType: { type: String, required: true },
    requiredCount: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
);

shiftTemplateSchema.index({ organizationId: 1, dayOfWeek: 1, shiftType: 1 }, { unique: true });

export const ShiftTemplate = mongoose.model<IShiftTemplateDocument>('ShiftTemplate', shiftTemplateSchema);
