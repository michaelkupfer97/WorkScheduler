import Shift from '../models/Shift.js';
import Constraint from '../models/Constraint.js';

// פונקציה לשיבוץ משמרת
export const assignShift = async (employeeId, day, startTime, endTime) => {
  try {
    const newShift = new Shift({
      employeeId,
      day,
      startTime,
      endTime,
    });
    await newShift.save();
    return { success: true, shift: newShift };
  } catch (error) {
    console.error('Error assigning shift:', error);
    return { success: false, error: error.message };
  }
};

// פונקציה לשליפת אילוצים
export const getConstraints = async (employeeId) => {
  try {
    const constraints = await Constraint.find({ userId: employeeId });
    return { success: true, constraints };
  } catch (error) {
    console.error('Error fetching constraints:', error);
    return { success: false, error: error.message };
  }
};

