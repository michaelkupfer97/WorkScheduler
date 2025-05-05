import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format, startOfWeek, addDays } from 'date-fns';
import './EmployeeDashboard.css';

const EmployeeDashboard = ({ token }) => {
  const [shifts, setShifts] = useState([]);
  const [weekDates, setWeekDates] = useState([]);
  const [userName, setUserName] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    // לחשב את התאריכים של השבוע הנוכחי (ראשון עד שבת)
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    const dates = [...Array(7)].map((_, i) => addDays(start, i));
    setWeekDates(dates);

    // שליפת נתוני המשתמש והמשמרות
    const fetchData = async () => {
      try {
        const userRes = await axios.get('/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserName(userRes.data.name);

        const shiftRes = await axios.get('/api/shifts/weekly', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShifts(shiftRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [token]);

  // פונקציה שמטפלת ביציאה מהחשבון
  const handleLogout = () => {
    localStorage.removeItem('token');  // מחיקת הטוקן מה-localStorage
    window.location.href = "/login";   // נווט לעמוד הלוגין
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>שלום, {userName}</h1>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={() => window.location.href = '/submit-request'}>
          הגשת בקשה לסידור עבודה
        </button>
        <button onClick={() => window.location.href = '/shift-history'} style={{ marginRight: '1rem' }}>
          צפייה בהיסטוריית משמרות
        </button>
      </div>

      {/* כפתור התנתקות */}
      <div className="dashboard-header">
        <button
          className="logout-button"
          onClick={() => setShowLogoutConfirm(true)}
        >
          התנתק
        </button>
      </div>

      {/* חלון אישור התנתקות */}
      {showLogoutConfirm && (
        <div className="logout-confirmation">
          <p>האם אתה בטוח שברצונך להתנתק?</p>
          <button onClick={handleLogout}>כן</button>
          <button onClick={() => setShowLogoutConfirm(false)}>לא</button>
        </div>
      )}

      <table border="1" cellPadding="10" style={{ width: '100%', textAlign: 'center' }}>
        <thead>
          <tr>
            {weekDates.map((date, i) => (
              <th key={i}>
                {format(date, 'EEEE')}<br />{format(date, 'dd/MM/yyyy')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {weekDates.map((date, i) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const shift = shifts.find(s => s.date === dateStr);
              const assigned = shift?.employees?.includes(userName);

              return (
                <td key={i} style={{ backgroundColor: assigned ? '#90ee90' : '#f5f5f5' }}>
                  {assigned ? 'את/ה עובד/ת' : 'אין שיבוץ'}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeDashboard;  