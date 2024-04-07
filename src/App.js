import React, { useState, useEffect } from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from 'react-router-dom';
import CreateUserPage from './pages/CreateUserPage';
import GroceryInputPage from './pages/GroceryInputPage';
import MonthlyReportPage from './pages/MonthlyReportPage';
import LoginPage from './pages/LoginPage';

function App() {
  // State to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // Effect hook to check if the user is logged in
  useEffect(() => {
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    // Call the function to check login status on component mount
    checkLoginStatus();
    setIsLoggedIn(false);
    // Optionally, set up a listener for storage events if you want to
    // handle login status across multiple tabs/windows
    window.addEventListener('storage', checkLoginStatus);

    // Cleanup listener on component unmount
    return () => window.removeEventListener('storage', checkLoginStatus);
  }, []);

  // Function to update login status
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <div>
        {isLoggedIn && (
          <nav>
            <ul>  
              <li>
                <Link to="/input">Input Grocery Purchases</Link>
              </li>
              <li>
                <Link to="/report">View Monthly Report</Link>
              </li>
            </ul>
          </nav>
        )}

        <Routes>
          <Route path="/" element={<LoginPage onLoginSuccess={handleLoginSuccess}/>} />
          <Route path="/createuserpage" element={<CreateUserPage/>} />
          <Route path="/input" element={<GroceryInputPage />} />
          <Route path="/report" element={<MonthlyReportPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
