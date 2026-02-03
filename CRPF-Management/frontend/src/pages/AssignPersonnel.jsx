import React, { useEffect, useState } from 'react';
import { 
  FiUser, 
  FiActivity, 
  FiCheckCircle, 
  FiXCircle, 
  FiEdit, 
  FiTrash2, 
  FiSave, 
  FiList, 
  FiMapPin, 
  FiClock, 
  FiCalendar,
  FiRefreshCw 
} from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-toastify';

const AssignPersonnel = () => {
  const [personnelList, setPersonnelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [editForm, setEditForm] = useState({
    status: '',
    availability: '',
    currentTaskId: null,
  });

  const user = JSON.parse(localStorage.getItem('user'));
  const subAdminId = user?.User_Id;

  // --- Fetch Personnel Data ---
  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const res = await fetch(`http://localhost:5000/api/subadmin/personnel/${subAdminId}`);
      const data = await res.json();
      setPersonnelList(data);
    } catch (err) {
      console.error("Error fetching personnel:", err);
      alert('Failed to fetch personnel');
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Tasks Data ---
  const fetchTasks = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/subadmin/tasks/${subAdminId}`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      alert('Failed to fetch tasks');
    }
  };

  useEffect(() => {
    if (subAdminId) {
      fetchPersonnel();
      fetchTasks();
    }
  }, [subAdminId]);

  // --- Handlers for Edit Modal ---
  const handleOpenEditModal = (person) => {
    setSelectedPersonnel(person);
    setEditForm({
      status: person.status,
      availability: person.availability,
      currentTaskId: person.currentTaskId || null,
    });
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedPersonnel(null);
    setEditForm({ status: '', availability: '', currentTaskId: null });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value === '' ? null : value,
    }));
  };

  const handleUpdatePersonnel = async () => {
    if (!selectedPersonnel) return;

    try {
      const payload = {
        subAdminId,
        status: editForm.status,
        availability: editForm.availability,
        currentTaskId: editForm.currentTaskId,
      };

      const res = await fetch(
        `http://localhost:5000/api/subadmin/personnel/${selectedPersonnel.User_Id}/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      if (!res.ok) {
        throw new Error('Failed to update personnel');
      }

      alert('Personnel updated successfully!');
      fetchPersonnel();
      handleCloseEditModal();
    } catch (err) {
      console.error("Error updating personnel:", err.message);
      alert('Failed to update personnel: ' + err.message);
    }
  };

  // --- Quick Toggle Functions ---
  const toggleStatus = async (person) => {
    try {
      await axios.put(`http://localhost:5000/api/subadmin/personnel/${person.User_Id}/update`, {
        subAdminId,
        status: person.status === 'onduty' ? 'onleave' : 'onduty',
      });
      toast.success('Status toggled successfully');
      fetchPersonnel();
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error('Failed to toggle status');
    }
  };

  const toggleAvailability = async (person) => {
    try {
      await axios.put(`http://localhost:5000/api/subadmin/personnel/${person.User_Id}/update`, {
        subAdminId,
        availability: person.availability === 'free' ? 'tasked' : 'free',
      });
      toast.success('Availability toggled successfully');
      fetchPersonnel();
    } catch (err) {
      console.error("Error toggling availability:", err);
      toast.error('Failed to toggle availability');
    }
  };

  const clearTask = async (person) => {
    try {
      await axios.put(`http://localhost:5000/api/subadmin/personnel/${person.User_Id}/update`, {
        subAdminId,
        currentTaskId: null,
        availability: 'free',
      });
      toast.success('Task cleared successfully');
      fetchPersonnel();
    } catch (err) {
      console.error("Error clearing task:", err);
      toast.error('Failed to clear task');
    }
  };

  const formatDateTime = (dateTime) => {
    if (!dateTime) return 'Not specified';
    return new Date(dateTime).toLocaleString();
  };

  const getStatusColor = (status) => {
    return status === 'onduty' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
  };

  const getAvailabilityColor = (availability) => {
    return availability === 'free' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 md:px-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Personnel Management</h1>
        <button
          onClick={fetchPersonnel}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-600 text-lg">Loading personnel data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {personnelList.map((person) => (
            <div
              key={person.User_Id}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-200 border border-gray-200 flex flex-col"
            >
              {/* Header Section */}
              <div className="flex items-center space-x-4 mb-4 border-b pb-4">
                <FiUser className="text-gray-700 text-3xl" />
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{person.name}</h3>
                  <p className="text-sm text-gray-500">ID: {person.User_Id}</p>
                </div>
              </div>

              {/* Personnel Details */}
              <div className="text-sm text-gray-700 mb-4 flex-grow space-y-2">
                <p><span className="font-semibold text-gray-800">Rank:</span> {person.rank}</p>
                <p><span className="font-semibold text-gray-800">Service No:</span> {person.serviceNumber}</p>
                <p><span className="font-semibold text-gray-800">Phone:</span> {person.phoneNumber || 'Not provided'}</p>
                <p><span className="font-semibold text-gray-800">Email:</span> {person.email || 'Not provided'}</p>
                
                {/* Status and Availability Tags */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(person.status)}`}>
                    {person.status.toUpperCase()}
                  </span>
                  <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(person.availability)}`}>
                    {person.availability.toUpperCase()}
                  </span>
                </div>

                {/* Current Task Information */}
                {person.currentTask ? (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <FiList className="mr-2 text-blue-600" />
                      <span className="font-semibold text-gray-800">Current Task</span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-1">{person.currentTask.title}</p>
                    <p className="text-xs text-gray-600 mb-2">{person.currentTask.description}</p>
                    
                    {person.currentTask.location && (
                      <div className="flex items-center text-xs text-gray-600 mb-1">
                        <FiMapPin className="mr-1" />
                        <span>{person.currentTask.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center text-xs text-gray-600 mb-1">
                      <FiClock className="mr-1" />
                      <span>Start: {formatDateTime(person.currentTask.startTime)}</span>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-600">
                      <FiCalendar className="mr-1" />
                      <span>End: {formatDateTime(person.currentTask.endTime)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <FiCheckCircle className="mr-2 text-green-600" />
                      <span className="text-sm text-green-800 font-medium">No Active Task</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={() => toggleStatus(person)}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-700 hover:bg-gray-800 text-white transition-colors duration-200"
                >
                  <FiActivity /> Toggle Duty
                </button>
                
                <button
                  onClick={() => toggleAvailability(person)}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-600 hover:bg-gray-700 text-white transition-colors duration-200"
                >
                  <FiCheckCircle /> Toggle Availability
                </button>
                
                {person.currentTaskId && (
                  <button
                    onClick={() => clearTask(person)}
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
                  >
                    <FiXCircle /> Clear Task
                  </button>
                )}

                <button
                  onClick={() => handleOpenEditModal(person)}
                  className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 mt-2"
                >
                  <FiEdit /> Edit Personnel
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Personnel Modal */}
      {showEditModal && selectedPersonnel && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={handleCloseEditModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <FiXCircle size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
              Edit: {selectedPersonnel.name}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="onduty">On Duty</option>
                  <option value="onleave">On Leave</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <select
                  name="availability"
                  value={editForm.availability}
                  onChange={handleEditFormChange}
                  className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="free">Free</option>
                  <option value="tasked">Tasked</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Task</label>
                {editForm.currentTaskId ? (
                  <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md bg-gray-50">
                    <span className="text-gray-800 text-sm font-medium">
                      {tasks.find(task => task.Task_Id === editForm.currentTaskId)?.title || editForm.currentTaskId}
                    </span>
                    <button
                      onClick={() => setEditForm(prev => ({ ...prev, currentTaskId: null, availability: 'free' }))}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                    >
                      <FiTrash2 size={16} /> Clear
                    </button>
                  </div>
                ) : (
                  <select
                    name="currentTaskId"
                    value={editForm.currentTaskId || ''}
                    onChange={handleEditFormChange}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a task (Optional)</option>
                    {tasks.length > 0 ? (
                      tasks.map((task) => (
                        <option key={task.Task_Id} value={task.Task_Id}>
                          {task.title} ({task.Task_Id})
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>No tasks available</option>
                    )}
                  </select>
                )}
              </div>
            </div>

            <button
              onClick={handleUpdatePersonnel}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 transition duration-200"
            >
              <FiSave /> Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignPersonnel;