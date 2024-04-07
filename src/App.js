import React from 'react';
import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link
} from 'react-router-dom';
import GroceryInputPage from './pages/GroceryInputPage'; // Adjust the import path as needed
import MonthlyReportPage from './pages/MonthlyReportPage'; // Adjust the import path as needed

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/input">Input Grocery Purchases</Link>
            </li>
            <li>
              <Link to="/report">View Monthly Report</Link>
            </li>
          </ul>
        </nav>

        {/* A <Routes> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/input" element={<GroceryInputPage />} />
          <Route path="/report" element={<MonthlyReportPage />} />
        </Routes>
      </div>
    </Router>
  );
}

// You can also create a simple Home component for the landing page
function Home() {
  return (
    <div>
      <h2>Welcome to the Grocery Tracker App</h2>
      <p>Use the navigation links to add grocery purchases or view your monthly report.</p>
    </div>
  );
}

export default App;
