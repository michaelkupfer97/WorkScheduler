import express from 'express';
import { getWeeklyShifts } from '../controllers/shiftController.js';
import authMiddleware from '../middleware/auth.js';
import  { User } from '../models/User.js';
import { Shift } from '../models/Shift.js';

const router = express.Router();

// GET - קבלת משמרות שבועיות לפי הארגון של המשתמש
router.get('/weekly', authMiddleware, getWeeklyShifts);

// POST - יצירת משמרת חדשה
router.post('/', async (req, res) => {
  try {
    const { date, startTime, endTime, employeeIds } = req.body;

    const employees = await User.find({ '_id': { $in: employeeIds } });

    if (employees.length !== employeeIds.length) {
      return res.status(400).json({ message: 'Some employees not found' });
    }

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
