import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';
import App from './App';
import './styles.css'; 

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root') // מחבר את ה-App ל-div עם id="root"
);
