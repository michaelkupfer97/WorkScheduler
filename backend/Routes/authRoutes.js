import express from 'express';
import { login, register } from '../controllers/AuthController.js';  // ייבוא הפונקציות

const router = express.Router();

// נתיב הרשמה
router.post('/register', register);  // יצירת משתמש חדש

// נתיב התחברות
router.post('/login', login);  // התחברות למערכת

export default router;
