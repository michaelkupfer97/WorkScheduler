import mongoose, { Schema, Document } from 'mongoose';

export interface IShiftDocument extends Document {
  organizationId: mongoose.Types.ObjectId;
  date: Date;
  shiftType: string;
  startTime: string;
  endTime: string;
  assignedEmployees: mongoose.Types.ObjectId[];
  requiredCount: number;
  status: 'draft' | 'published' | 'completed';
  notes?: string;
  color?: string;
}

const shiftSchema = new Schema<IShiftDocument>(
  {
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
    date: { type: Date, required: true },
    shiftType: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    assignedEmployees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    requiredCount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['draft', 'published', 'completed'], default: 'draft' },
    notes: { type: String },
    color: { type: String },
  },
  { timestamps: true }
);

shiftSchema.index({ organizationId: 1, date: 1, shiftType: 1 });
shiftSchema.index({ assignedEmployees: 1 });

export const Shift = mongoose.model<IShiftDocument>('Shift', shiftSchema);
