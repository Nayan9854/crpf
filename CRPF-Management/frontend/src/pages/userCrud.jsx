import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Users, Shield, User, Filter, X, ChevronDown, MoreVertical } from 'lucide-react';

const initialFormState = {
  User_Id: '',
  name: '',
  email: '',
  password: '',
  role: 'personnel', // Default role is personnel
  rank: '',
  serviceNumber: '',
  adminId: '',
  subAdminId: '',
  status: 'onduty',
  availability: 'free',
};

/**
 * A professional User Management component for CRUD operations on Sub-Admins and Personnel.
 * It intentionally excludes 'Admin' users from being fetched, displayed, or created.
 * Features a modern card-based UI, advanced filtering, and a streamlined add/edit modal.
 * Users are sorted by role: Sub-Admins, then Personnel.
 */
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/admin/user');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // *** CHANGE: Filter out 'admin' users immediately after fetching ***
      const nonAdminUsers = data.filter(
        user => user.role === 'sub-admin' || user.role === 'personnel'
      );

      setUsers(nonAdminUsers);
      setError('');
    } catch (err) {
      console.error('Fetch Error:', err);
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter and sort users whenever dependencies change
  useEffect(() => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        Object.values(user).some(val => 
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Availability filter
    if (availabilityFilter !== 'all') {
      filtered = filtered.filter(user => user.availability === availabilityFilter);
    }

    // Sort: sub-admin first, then personnel
    filtered.sort((a, b) => {
      const roleOrder = { 'sub-admin': 1, 'personnel': 2 };
      return (roleOrder[a.role] || 3) - (roleOrder[b.role] || 3);
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter, availabilityFilter]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const showMessage = (message, isError = false) => {
    if (isError) {
      setError(message);
      setTimeout(() => setError(''), 5000);
    } else {
      setSuccess(message);
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingId 
        ? `http://localhost:5000/api/admin/user/${editingId}`
        : 'http://localhost:5000/api/admin/user';
      
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Operation failed');
      }

      showMessage(editingId ? 'User updated successfully!' : 'User created successfully!');
      setForm(initialFormState);
      setEditingId(null);
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      console.error('Submit Error:', err);
      showMessage(err.message || 'Operation failed', true);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setForm({ ...initialFormState, ...user });
    setEditingId(user.User_Id);
    setShowForm(true);
  };
  
  const handleAddNew = () => {
    setForm(initialFormState);
    setEditingId(null);
    setShowForm(true);
  }

  const handleDelete = async (User_Id, userName) => {
    if (window.confirm(`Are you sure you want to delete user "${userName}" (ID: ${User_Id})?`)) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/admin/user/${User_Id}`, {
          method: 'DELETE',
        });

        if (!response.ok) { throw new Error('Failed to delete user'); }
        showMessage('User deleted successfully!');
        fetchUsers();
      } catch (err) {
        console.error('Delete Error:', err);
        showMessage('Failed to delete user.', true);
      } finally {
        setLoading(false);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setAvailabilityFilter('all');
  };

  // Helper functions for styling cards
  const getRoleAccentColor = (role) => {
    switch (role) {
      case 'sub-admin': return 'border-blue-500';
      case 'personnel': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };
  
  const getAvatarBgColor = (role) => {
    switch(role) {
      case 'sub-admin': return '3B82F6'; // blue-500
      case 'personnel': return '22C55E'; // green-500
      default: return '6B7280'; // gray-500
    }
  };

  const capitalize = (s) => s && s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage Sub-Admins and Personnel.</p>
            </div>
            <button
              onClick={handleAddNew}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add New User
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6" role="alert">{success}</div>}

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, ID, or service no..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="relative">
              <select
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                className="w-full appearance-none bg-white px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                {/* *** CHANGE: "Admin" role removed from filter options *** */}
                <option value="sub-admin">Sub-Admin</option>
                <option value="personnel">Personnel</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {['status', 'availability'].map(filterType => (
              <div className="relative" key={filterType}>
                <select
                  value={{status: statusFilter, availability: availabilityFilter}[filterType]}
                  onChange={e => ({status: setStatusFilter, availability: setAvailabilityFilter}[filterType])(e.target.value)}
                  className="w-full appearance-none bg-white px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All {capitalize(filterType)}s</option>
                  {filterType === 'status' && <><option value="onduty">On Duty</option><option value="offduty">Off Duty</option><option value="leave">On Leave</option></>}
                  {filterType === 'availability' && <><option value="free">Available</option><option value="busy">Busy</option></>}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            ))}

            <button
              onClick={clearFilters}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" /> Clear
            </button>
          </div>
        </div>

        {/* User Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[95vh] transform transition-all duration-300 scale-95 hover:scale-100">
                <div className="p-6 sm:p-8 border-b">
                    <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"><X className="w-6 h-6" /></button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[calc(95vh-150px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
                            <input name="User_Id" value={form.User_Id} onChange={handleChange} required disabled={!!editingId} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                            <input name="name" value={form.name} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password { !editingId && '*'}</label>
                            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder={editingId ? 'Leave blank to keep unchanged' : ''} required={!editingId} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select name="role" value={form.role} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                {/* *** CHANGE: "Admin" role removed from form options *** */}
                                <option value="personnel">Personnel</option>
                                <option value="sub-admin">Sub-Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Service Number</label>
                            <input name="serviceNumber" value={form.serviceNumber} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        {(form.role === 'personnel' || form.role === 'sub-admin') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rank</label>
                            <input name="rank" value={form.rank} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        )}
                        {form.role === 'sub-admin' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Admin ID</label>
                            <input name="adminId" value={form.adminId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        )}
                        {form.role === 'personnel' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Admin ID</label>
                            <input name="subAdminId" value={form.subAdminId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"/>
                        </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold transition-colors">{loading ? 'Saving...' : (editingId ? 'Update User' : 'Create User')}</button>
                    </div>
                </form>
            </div>
          </div>
        )}

        {/* Users Grid */}
         <div className="bg-white rounded-xl shadow-sm">
            <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">All Users ({filteredUsers.length})</h2>
            </div>

            {loading && <div className="p-12 text-center text-gray-500">Loading users...</div>}
            {!loading && filteredUsers.length === 0 && <div className="p-12 text-center text-gray-500">No users found. Try adjusting your filters.</div>}
            {!loading && filteredUsers.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
                {filteredUsers.map((user) => (
                <div key={user.User_Id} className={`bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-t-4 ${getRoleAccentColor(user.role)} flex flex-col`}>
                    <div className="p-6 flex-grow">
                        <div className="flex flex-col items-center text-center">
                            <img 
                                className="w-24 h-24 rounded-full mb-4 ring-4 ring-gray-100"
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=${getAvatarBgColor(user.role)}&color=fff&font-size=0.4`}
                                alt={`${user.name}'s avatar`}
                            />
                            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                            <p className="text-sm font-semibold text-gray-500">{capitalize(user.role)}</p>
                            <p className="text-xs text-gray-400 mt-1">ID: {user.User_Id}</p>
                        </div>
                        
                        <div className="mt-6 border-t border-gray-200 pt-4 space-y-3 text-sm">
                            {user.email && <p><strong className="font-medium text-gray-600">Email:</strong> <span className="text-gray-800 break-all">{user.email}</span></p>}
                            {user.serviceNumber && <p><strong className="font-medium text-gray-600">Service No:</strong> <span className="text-gray-800">{user.serviceNumber}</span></p>}
                            {user.rank && <p><strong className="font-medium text-gray-600">Rank:</strong> <span className="text-gray-800">{user.rank}</span></p>}
                        </div>

                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                             <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.status === 'onduty' ? 'bg-green-100 text-green-800' :
                                user.status === 'offduty' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {user.status === 'leave' ? 'On Leave' : capitalize(user.status)}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                user.availability === 'free' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                                {capitalize(user.availability)}
                            </span>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-center gap-3">
                        <button onClick={() => handleEdit(user)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors" title="Edit user">
                            <Edit className="w-4 h-4" /> Edit
                        </button>
                        <button onClick={() => handleDelete(user.User_Id, user.name)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors" title="Delete user">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;