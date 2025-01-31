import React, { useState, useEffect } from 'react';
import Login from './components/Login';  // ייבוא רכיב הכניסה
import UserList from './components/UserList';
import Register from './components/Register';  // ייבוא רכיב ההרשמה
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // בדוק אם המשתמש מחובר עם JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);  // אם יש טוקן, נניח שהמשתמש מחובר
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true); // עדכון סטייט למשתמש מחובר
  };

  const handleRegisterClick = () => {
    setIsRegistering(true); // כשמישהו רוצה להירשם
  };

  return (
    <div>
      <h1>מערכת לניהול עובדים</h1>
      {isAuthenticated ? (
        <UserList />
      ) : isRegistering ? (
        <Register />
      ) : (
        <div>
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      )}
    </div>
  );
}

export default App;
