import argon2 from 'argon2';
import { User } from '../models/User.js';

// פונקציית התחברות
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('Invalid credentials');

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) return res.status(400).send('Invalid credentials');

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.send({ user, token });
  } catch (error) {
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

    // הצפן את הסיסמה
    const hashedPassword = await argon2.hash(password);

    // יצירת משתמש חדש
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      organization, // שייך לארגון
    });

    // שמירה לדאטהבייס
    const savedUser = await newUser.save();
    console.log('User saved successfully:', savedUser); // לוג לאימות
    res.status(201).send({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error); // לוג לשגיאות
    res.status(500).send('Server error');
  }
};

