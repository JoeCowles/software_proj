import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // Import Link along with useNavigate

function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', { username, password });
      localStorage.setItem('token', response.data.token);
      alert('Login successful');
      onLoginSuccess();
      navigate('/report'); // Redirect to the report page after successful login
    } catch (error) {
      alert('Login failed: ' + (error.response?.data || error.message));
    }
  };
  
  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit">Login</button>
      </form>
      {/* Add the link to the CreateUserPage below the form */}
      <p>
        Don't have an account? <Link to="/createuserpage">Sign up</Link>
      </p>
    </div>
  );
}

export default LoginPage;
