import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
function CreateUserPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleCreateUser = async (event) => {
    event.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/register', { username, password });
      alert('User created successfully');
      navigate('/login');
      // Redirect to login page or update the state accordingly
    } catch (error) {
      alert('Failed to create user: ' + (error.response?.data || error.message));
    }
  };
  

  return (
    <div>
      <h2>Create User</h2>
      <form onSubmit={handleCreateUser}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Create User</button>
      </form>
    </div>
  );
}

export default CreateUserPage;
