import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  if (!user) return null;

  return (
    <nav className="bg-[#454B1B] text-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Role as Logo */}
      <div className="text-2xl font-bold uppercase tracking-wider">
        {user.role === 'admin' ? 'Admin Panel' : 'Sub-Admin Panel'}
      </div>

      {/* Links */}
      <div className="flex space-x-6 text-sm font-medium items-center">
        {user.role === 'admin' && (
          <>
            <Link to="/dashboard" className="hover:text-green-200">Manage Users</Link>
            <Link to="/manage-weapons" className="hover:text-green-200">Manage Weapons</Link>
            <Link to="/tasks" className="hover:text-green-200">Manage Task</Link>
          </>
        )}

        {user.role === 'sub-admin' && (
          <>
            <Link to="/dashboard" className="hover:text-green-200">Assigned Personnel</Link>
            <Link to="/tasks" className="hover:text-green-200">Assign Tasks</Link>
            <Link to="/manage-weapons" className="hover:text-green-200">Assign Weapons</Link>
          </>
        )}

        {/* Logged in info */}
        <span className="border-l border-white pl-4 text-sm text-green-200">
          Welcome, {user.name} ({user.User_Id})
        </span>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="ml-4 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

// Fixed navbar responsive design
