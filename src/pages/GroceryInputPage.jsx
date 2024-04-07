import React, { useState } from 'react';

function GroceryInputPage() {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Assuming we use localStorage to store the items
    const groceryItems = JSON.parse(localStorage.getItem('groceryItems') || '[]');
    groceryItems.push({ item, price: parseFloat(price), date });
    localStorage.setItem('groceryItems', JSON.stringify(groceryItems));
    // Reset form
    setItem('');
    setPrice('');
    setDate('');
    alert('Item added successfully!');
  };

  return (
    <div>
      <h2>Enter Your Grocery Purchase</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Item Name: </label>
          <input type="text" value={item} onChange={(e) => setItem(e.target.value)} required />
        </div>
        <div>
          <label>Price: </label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div>
          <label>Date: </label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <button type="submit">Add Item</button>
      </form>
    </div>
  );
}

export default GroceryInputPage;

