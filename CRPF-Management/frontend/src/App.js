import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import './App.css';
import Login from './pages/Login';
import Navbar from './components/Navbar';
import TaskCrud from './pages/taskCrud';
import UserCrud from './pages/userCrud';
import WeaponCrud from './pages/weaponCrud';
import AssignPersonnel from './pages/AssignPersonnel';
import { ToastContainer } from 'react-toastify';
import SubAdminWeaponDashboard from './pages/AssignWeapon';
import TaskList from './pages/taskControlAdmin';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData)); // store in localStorage
    setUser(userData);
    if (userData.role === 'admin' || userData.role === 'sub-admin') {
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <>
      {user && <Navbar user={user} onLogout={handleLogout} />}

      <Routes>
        {!user ? (
          <>
            <Route
              path="/"
              element={<Login onLoginSuccess={handleLoginSuccess} />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </>
        ) : (
          <>
            {user.role === 'admin' && (
              <>
                <Route path="/dashboard" element={<UserCrud />} />
                <Route path="/manage-weapons" element={<WeaponCrud />} />
                <Route path="/tasks" element={<TaskList/>} />
              </>
            )}

            {user.role === 'sub-admin' && (
              <>
                <Route path="/dashboard" element={<AssignPersonnel />} />
                <Route path="/tasks" element={<TaskCrud />} />
                <Route path="/manage-weapons" element={<SubAdminWeaponDashboard/>} />
              </>
            )}

            <Route path="*" element={<Navigate to="/dashboard" />} />
          </>
        )}
      </Routes>

      <ToastContainer />
    </>
  );
}


export default App;