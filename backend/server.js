import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import shiftRoutes from './routes/shiftRoutes.js';
import authRoutes from './Routes/authRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB().then(() => {
   // כאן אנחנו מוסיפים את הנתיבים החדשים
   app.use('/api/auth', authRoutes);  // נתיבי התחברות והרשמה
   app.use('/api/users', userRoutes);  // נתיבי ניהול משתמשים
   app.use('/api/shifts', shiftRoutes);  // נתיבי ניהול משמרות

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => console.error('Failed to start server:', error));


/*
import express from 'express';
import bcrypt from 'bcryptjs'; // עבור הצפנת סיסמאות
import { connectDB } from './config/db.js';
import userRoutes from './Routes/userRoutes.js';
import cors from 'cors';
import Constraint from './models/Constraint.js';
import dotenv from 'dotenv';
dotenv.config(); // טוען את משתני הסביבה


const app = express();
app.use(cors());
app.use(express.json()); // Parse incoming JSON requests

// התחברות למאגר הנתונים
connectDB().then(() => {
  // נתיב התחברות
  app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    // חפש את המשתמש במסד הנתונים
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ success: false, message: 'משתמש לא נמצא' });
    }

    // השוואת סיסמאות בעזרת bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'סיסמה לא נכונה' });
    }

    // אם הכל תקין, החזר success
    res.json({ success: true, message: 'התחברות הצליחה' });
  });

 // נתיבים לניהול אילוצים
 app.post('/api/constraints', async (req, res) => {
    const { userId, day, startTime, endTime } = req.body;

    try {
      const newConstraint = new Constraint({
        userId,
        day,
        startTime,
        endTime,
      });

      await newConstraint.save();
      res.json({ success: true, message: 'האילוץ נוסף בהצלחה' });
    } catch (error) {
      res.status(400).json({ success: false, message: 'לא ניתן להוסיף את האילוץ', error });
    }
  });

  app.get('/api/constraints/:userId', async (req, res) => {
    try {
      const constraints = await Constraint.find({ userId: req.params.userId });
      res.json({ success: true, constraints });
    } catch (error) {
      res.status(400).json({ success: false, message: 'לא ניתן להציג את האילוצים', error });
    }
  });

  // שאר הנתיבים שלך
  app.use('/api/users', userRoutes);

  // הפעלת השרת
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => {
  console.error('Server initialization failed:', error);
});
*/