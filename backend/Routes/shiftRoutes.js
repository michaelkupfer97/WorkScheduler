// routes/shiftRoutes.js
import express from 'express';
import { Shift } from '../models/Shift.js';
import { User } from '../models/User.js';

const router = express.Router();

// POST - יצירת משמרת חדשה
router.post('/', async (req, res) => {
  try {
    const { date, startTime, endTime, employeeIds } = req.body;

    // שליפת העובדים לפי מזהה
    const employees = await User.find({ '_id': { $in: employeeIds } });

    if (employees.length !== employeeIds.length) {
      return res.status(400).json({ message: 'Some employees not found' });
    }

    // יצירת המשמרת
    const newShift = new Shift({
      date,
      startTime,
      endTime,
      employees,
    });

    await newShift.save();
    res.status(201).json(newShift);
  } catch (error) {
    res.status(400).json({ message: 'Error creating shift', error });
  }
});

export default router;
