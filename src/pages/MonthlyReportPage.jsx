import React, { useState, useEffect } from 'react';

function MonthlyReportPage() {
  const [month, setMonth] = useState('');
  const [report, setReport] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (month) {
      const groceryItems = JSON.parse(localStorage.getItem('groceryItems') || '[]');
      const filteredItems = groceryItems.filter(item => new Date(item.date).getMonth() === new Date(month).getMonth());
      
      const itemExpenses = {};
      filteredItems.forEach(item => {
        if (itemExpenses[item.item]) {
          itemExpenses[item.item] += item.price;
        } else {
          itemExpenses[item.item] = item.price;
        }
      });

      setReport(Object.entries(itemExpenses));
      setTotal(Object.values(itemExpenses).reduce((acc, curr) => acc + curr, 0));
    }
  }, [month]);

  return (
    <div>
      <h2>Monthly Grocery Report</h2>
      <div>
        <label>Select Month: </label>
        <input type="month" onChange={(e) => setMonth(e.target.value)} />
      </div>
      {report.length > 0 && (
        <div>
          <h3>Grocery Expenses for the month of {new Date(month).toLocaleString('default', { month: 'long' })}:</h3>
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
