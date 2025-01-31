import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');  // תוסיף שדה אימייל
  const [organization, setOrganization] = useState('');  // תוסיף שדה ארגון
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false); // מצב לצפייה בטופס ההרשמה

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });

      if (response.data.success) {
        // שמור את ה-JWT ב-localStorage
        localStorage.setItem('token', response.data.token);

        // עדכן את המצב ב-Frontend, כך שהמערכת תדע שהמשתמש מחובר
        onLoginSuccess();
        console.log('Login successful!');
      } else {
        setError('שם משתמש או סיסמה לא נכונים');
      }
    } catch (err) {
      setError('הייתה בעיה בהתחברות. נסה שנית.');
      console.error(err);
    }
  };

  const handleRegisterClick = () => {
    setIsRegistering(true); // שינוי מצב להצגת טופס הרשמה
  };

  // הפונקציה שמטפלת בהגשת טופס ההרשמה
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        username,
        password,
        email,
        organization,
      });

      if (response.data.success) {
        setError('');
        setIsRegistering(false);
        console.log('User registered successfully');
      } else {
        setError('הייתה בעיה בהרשמה');
      }
    } catch (err) {
      setError('הייתה בעיה בהרשמה. נסה שנית.');
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>{isRegistering ? 'הרשמה' : 'התחברות'}</h2>
        {!isRegistering ? (
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
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="error">{error}</p>}

            <button type="submit">התחבר</button>

            {/* כפתור ההרשמה */}
            <button type="button" className="register-button" onClick={handleRegisterClick}>
              הירשם
            </button>
          </form>
        ) : (
          // טופס הרשמה
          <form onSubmit={handleRegisterSubmit}>
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
                onChange={(e) => setPassword(e.target.value)}
                required
              />
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
        )}
      </div>
    </div>
  );
};

export default Login;
