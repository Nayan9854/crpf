import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SubAdminWeaponDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const subAdminId = user?.User_Id;

  const [weapons, setWeapons] = useState([]);
  const [personnelList, setPersonnelList] = useState([]);
  const [selectedPersonnel, setSelectedPersonnel] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Fetch unassigned or subadmin-assigned weapons
  const fetchWeapons = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/subadmin/weapon/${subAdminId}/available`);
      setWeapons(res.data);
    } catch (err) {
      console.error('Error fetching weapons:', err);
    }
  };

  // Fetch personnel under this subadmin
  const fetchPersonnel = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/subadmin/personnel/${subAdminId}`);
      setPersonnelList(res.data);
    } catch (err) {
      console.error('Error fetching personnel:', err);
    }
  };

  useEffect(() => {
    if (subAdminId) {
      fetchWeapons();
      fetchPersonnel();
      setLoading(false);
    }
  }, [subAdminId]);

  // Assign weapon to selected personnel
  const handleAssign = async (weaponId) => {
    try {
      const personnelId = selectedPersonnel[weaponId];
      if (!personnelId) return alert('Please select a personnel to assign.');

      await axios.post(`http://localhost:5000/api/subadmin/weapon/${weaponId}/assign`, { 
        subAdminId,
        personnelId
      });

      setActionMessage(`✅ Weapon ${weaponId} assigned.`);
      fetchWeapons();
    } catch (err) {
      console.error('Error assigning weapon:', err);
      setActionMessage('❌ Failed to assign weapon.');
    }
  };

  // Unassign weapon from current personnel
  const handleUnassign = async (weaponId) => {
    try {
      await axios.put(`http://localhost:5000/api/subadmin/weapon/${weaponId}/unassign`, {
        subAdminId
      });

      setActionMessage(`🚫 Weapon ${weaponId} unassigned.`);
      fetchWeapons();
    } catch (err) {
      console.error('Error unassigning weapon:', err);
      setActionMessage('❌ Failed to unassign weapon.');
    }
  };

  if (!subAdminId) return <p>Unauthorized: Sub-admin not logged in.</p>;
  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔐 SubAdmin Weapon Dashboard</h1>

      {actionMessage && <p className="mb-4 text-green-600 font-semibold">{actionMessage}</p>}

      {weapons.length === 0 ? (
        <p className="text-gray-500">No weapons available to display.</p>
      ) : (
        <div className="space-y-4">
          {weapons.map((weapon) => (
            <div key={weapon.Weapon_Id} className="border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">🔫 Weapon ID: {weapon.Weapon_Id}</h2>
              <p>Status: {weapon.assignedTo ? `Assigned to ${weapon.assignedTo}` : 'Unassigned'}</p>

              {weapon.assignedTo ? (
                <button
                  className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => handleUnassign(weapon.Weapon_Id)}
                >
                  Unassign Weapon
                </button>
              ) : (
                <>
                  <select
                    className="mt-3 border px-3 py-2 rounded w-full"
                    value={selectedPersonnel[weapon.Weapon_Id] || ''}
                    onChange={(e) =>
                      setSelectedPersonnel((prev) => ({
                        ...prev,
                        [weapon.Weapon_Id]: e.target.value
                      }))
                    }
                  >
                    <option value="">Select Personnel</option>
                    {personnelList.map((person) => (
                      <option key={person.User_Id} value={person.User_Id}>
                        {person.name} (ID: {person.User_Id})
                      </option>
                    ))}
                  </select>
                  <button
                    className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => handleAssign(weapon.Weapon_Id)}
                  >
                    Assign Weapon
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubAdminWeaponDashboard;
