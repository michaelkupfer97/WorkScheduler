import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // קובץ CSS נפרד שיכיל את הסגנונות

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
  const [error, setError] = useState('');
  const [passwordValid, setPasswordValid] = useState(false);  // משתנה לאחסון אם הסיסמה תקינה

  // פונקציה לבדוק את תקינות הסיסמה
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;  // לפחות 8 תווים, אות גדולה, מספר או תו מיוחד
    return regex.test(password);
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordValid(validatePassword(newPassword));  // עדכון תקינות הסיסמה בזמן הקלדה
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!passwordValid) {
      setError('הסיסמה חייבת לכלול לפחות 8 תווים, אות גדולה, ומספר או תו מיוחד');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        password,
        email,
        organization,
      });

      if (response.data.success) {
        console.log('Registration successful!');
        // עבור לדף אחר או עדכון המצב
      } else {
        setError('Registration failed');
      }
    } catch (err) {
      setError('There was an error with registration');
      console.error(err);
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>הירשם</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">שם משתמש</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">סיסמה</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
            />
            <div className="password-info">
              {password && !passwordValid && (
                <p>הסיסמה חייבת לכלול לפחות 8 תווים, אות גדולה, ומספר או תו מיוחד</p>
              )}
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">אימייל</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="organization">ארגון</label>
            <input
              type="text"
              id="organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              required
            />
          </div>

          {error && <p className="error">{error}</p>}

          <button type="submit">הירשם</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
