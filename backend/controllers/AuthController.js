import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log('Login request:', req.body);//temp
    const user = await User.findOne({ username });
    console.log('User from DB:', user);//temp
    if (!user) return res.status(400).send('Invalid credentials (user not found)');

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);//temp
    if (!isMatch) return res.status(400).send('Invalid credentials (wrong password)');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    console.log('Generated token:', token);//temp
    console.log('JWT_SECRET from env:', process.env.JWT_SECRET);
    // אם הכל תקין, החזר את המידע על המשתמש והטוקן
    res.json({
      success: true,
      token,
      user: {
        username: user.username,
        role: user.role,
        email: user.email,
        organization: user.organization,
        _id: user._id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).send('Server error');
  }
};

// פונקציית הרשמה
export const register = async (req, res) => {
  const { username, password, email, organization } = req.body;

  try {
    // בדוק אם המשתמש קיים כבר
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).send('User already exists');

    // הצפן את הסיסמה עם bcrypt (אם לא שומרים על ה-pre save hook)
    const hashedPassword = await bcrypt.hash(password, 10);

    // יצירת משתמש חדש
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      organization,
    });

    const savedUser = await newUser.save();
    console.log('User saved successfully:', savedUser);

    // שליחת תגובה
    res.status(201).send({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send('Server error');
  }
};

