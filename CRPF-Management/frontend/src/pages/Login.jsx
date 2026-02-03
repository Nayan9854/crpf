// src/pages/Login.jsx

import React, { useState } from 'react'; // Removed useEffect
import axios from 'axios';
// useNavigate is no longer needed here for the redirect logic,
// but you might keep it for other purposes if necessary.
// For this specific case, it can be removed.
import { useNavigate } from 'react-router-dom';

// Accept onLoginSuccess as a prop
const Login = ({ onLoginSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // const navigate = useNavigate(); // This is no longer needed for the redirect

  // 🔴 REMOVE THIS ENTIRE BLOCK 🔴
  /*
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      navigate('/dashboard');
    }
  }, [navigate]);
  */
  // 🔴 END OF BLOCK TO REMOVE 🔴

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        User_Id: userId,
        password,
      });

      const userData = res.data.user;
      
      // Call the function passed from App.js
      if (onLoginSuccess) {
        onLoginSuccess(userData);
      }

      setError('');
      alert('Login successful ✅');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1606923829579-5cb3806044fa')] bg-cover bg-center">
      <div className="bg-green-900 bg-opacity-90 shadow-lg rounded-lg p-8 w-full max-w-md text-white border border-green-700">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* ... your form inputs ... */}
          <div>
            <label className="block text-sm mb-1">User ID</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              className="w-full px-4 py-2 rounded bg-green-100 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your User ID"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded bg-green-100 text-black focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your Password"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 transition-colors py-2 rounded font-semibold"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
// Fixed login form validation
