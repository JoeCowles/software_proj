import React, { useState, useEffect } from 'react';
import axios from 'axios';

function MonthlyReportPage() {
  const [month, setMonth] = useState('');
  const [report, setReport] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      if (!month) return; // Do not proceed if no month is selected

      const [yearValue, monthValue] = month.split('-');
      const username = localStorage.getItem('username'); // Ensure the username is stored after login
      if (!username) {
        alert('No username found. Please login again.');
        return;
      }

      try {
        // Make a GET request to the server
        const response = await axios.get(`http://localhost:5000/api/getItemsByUsername/${yearValue}/${parseInt(monthValue, 10)}/${encodeURIComponent(username)}`);
        const items = response.data;

        setReport(items.map(item => [item.itemName, item.totalPrice]));
        setTotal(items.reduce((acc, item) => acc + item.totalPrice, 0));
      } catch (error) {
        console.error('Failed to fetch items:', error);
        alert('Failed to retrieve items. Please try again.');
      }
    };

    fetchItems();
  }, [month]);

  return (
    <div>
      <h2>Monthly Grocery Report</h2>
      <div>
        <label>Select Month: </label>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
      </div>
      {report.length > 0 && (
        <div>
          <h3>Grocery Expenses for the month of {month}:</h3>
          <ul>
            {report.map(([item, price]) => (
              <li key={item}>{item}: ${price.toFixed(2)}</li>
            ))}
          </ul>
          <h4>Total Expenses: ${total.toFixed(2)}</h4>
        </div>
      )}
    </div>
  );
}

export default MonthlyReportPage;
