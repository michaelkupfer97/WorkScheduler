import mongoose from 'mongoose';

const ConstraintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // חיבור לעובד
  day: { type: String, required: true }, // יום (כמו 'ראשון', 'שני' וכו')
  startTime: { type: String, required: true }, // שעה התחלה
  endTime: { type: String, required: true }, // שעה סיום
});

const Constraint = mongoose.model('Constraint', ConstraintSchema);
export default Constraint;