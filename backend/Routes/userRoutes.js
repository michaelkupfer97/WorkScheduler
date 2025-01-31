import express from 'express';
import { User } from '../models/User.js'; // ייבוא המודל

const router = express.Router();

// GET - מחזיר את כל המשתמשים
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});

// POST - יצירת משתמש חדש
router.post('/', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const newUser = new User({ username, password, role });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
});

export default router; // ייצוא הנתיבים
