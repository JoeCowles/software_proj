import React, { useState } from 'react';
import axios from 'axios'; // Ensure axios is imported

function GroceryInputPage() {
  const [item, setItem] = useState('');
  const [price, setPrice] = useState('');
  const [date, setDate] = useState('');
  const [username, setUsername] = useState(''); // Added to capture the username

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Assume the username is stored in local storage upon login
    const storedUsername = localStorage.getItem('username');

    try {
      // Send the POST request to the server with the grocery item data
      await axios.post('http://localhost:5000/api/createOrder', {
        username: storedUsername, // Use the stored username or some other method to obtain it
        itemName: item,
        price: parseFloat(price),
        date: date
      });

      alert('Order created successfully!');
      
      // Reset form fields
      setItem('');
      setPrice('');
      setDate('');
    } catch (error) {
      console.error('Failed to create order:', error.response?.data || error.message);
      alert('Failed to create order: ' + (error.response?.data || error.message));
    }
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
