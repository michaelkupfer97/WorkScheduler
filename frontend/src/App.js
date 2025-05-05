import React, { useState, useEffect } from 'react';
import Login from './components/Login';  // ייבוא רכיב הכניסה
import EmployeeDashboard from './components/EmployeeDashboard';
import Register from './components/Register';  // ייבוא רכיב ההרשמה
import { jwtDecode } from 'jwt-decode';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token && !isTokenExpired(token)) {
      setIsAuthenticated(true);  // טוקן תקף, משתמש מחובר
    } else {
      localStorage.removeItem('token');  // הסרת טוקן אם הוא לא תקף
      setIsAuthenticated(false);  // לא מחובר
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
        <EmployeeDashboard />
      ) : isRegistering ? (
        <Register />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // זמן נוכחי בשניות
    return decoded.exp < currentTime;  // אם הטוקן פג תוקף
  } catch (error) {
    return true;  // אם יש שגיאה בפענוח הטוקן (לדוג' טוקן פג תוקף או לא תקין)
  }
};

export default App;