// controllers/shiftController.js

import { Shift } from '../models/Shift.js';
import { User } from '../models/User.js';

export const getWeeklyShifts = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const shifts = await Shift.find({
      date: { $gte: startOfWeek, $lte: endOfWeek },
      'employees.organization': user.organization,
    }).populate('employees');

    res.json({ shifts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to get shifts', error });
  }
};
