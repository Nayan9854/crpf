import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiEdit, FiTrash2, FiPlus, FiX, FiCalendar, FiMapPin, FiUser, FiInfo, FiCheck } from 'react-icons/fi';

const TaskCrud = () => {
  const [tasks, setTasks] = useState([]);
  const [personnel, setPersonnel] = useState([]);
  const [availablePersonnel, setAvailablePersonnel] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedPersonnel, setSelectedPersonnel] = useState([]);
  const [formData, setFormData] = useState({
    Task_Id: '',
    title: '',
    description: '',
    location: '',
    assignedTo: '',
    startTime: '',
    endTime: '',
    status: 'pending'
  });

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' }
  ];

  const user = JSON.parse(localStorage.getItem('user'));
  const subAdminId = user?.User_Id;

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/subadmin/tasks/${subAdminId}`);
      setTasks(res.data);
    } catch (err) {
      toast.error('Failed to fetch tasks');
    }
  };

  const fetchPersonnel = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/subadmin/personnel/${subAdminId}`);
      setPersonnel(res.data);
      
      // Filter available personnel (those without current tasks and not on leave)
      const available = res.data.filter(person => 
        !person.currentTaskId && 
        person.availability === 'free' && 
        person.status !== 'onleave'
      );
      setAvailablePersonnel(available);
    } catch (err) {
      toast.error('Failed to fetch personnel');
    }
  };

  useEffect(() => {
    if (subAdminId) {
      fetchTasks();
      fetchPersonnel();
    }
  }, [subAdminId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePersonnelSelection = (personnelId) => {
    const isSelected = selectedPersonnel.includes(personnelId);
    if (isSelected) {
      setSelectedPersonnel(selectedPersonnel.filter(id => id !== personnelId));
    } else {
      setSelectedPersonnel([...selectedPersonnel, personnelId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedPersonnel.length === 0) {
      toast.error('Please select at least one personnel');
      return;
    }

    try {
      const payload = {
        ...formData,
        assignedBy: subAdminId,
        assignedTo: selectedPersonnel,
      };

      if (editingTask) {
        await axios.put(`http://localhost:5000/api/subadmin/task/${formData.Task_Id}`, payload);
        toast.success('Task updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/subadmin/task', payload);
        toast.success('Task created successfully');
      }
      
      fetchTasks();
      fetchPersonnel(); // Refresh personnel to update availability
      resetForm();
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error processing task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/subadmin/task/${id}`);
      toast.success('Task deleted successfully');
      fetchTasks();
      fetchPersonnel(); // Refresh personnel to update availability
    } catch (err) {
      toast.error('Error deleting task');
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setFormData({
      Task_Id: task.Task_Id,
      title: task.title,
      description: task.description,
      location: task.location,
      assignedTo: task.assignedTo.join(', '),
      startTime: task.startTime ? task.startTime.split('.')[0] : '',
      endTime: task.endTime ? task.endTime.split('.')[0] : '',
      status: task.status
    });
    setSelectedPersonnel(task.assignedTo);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      Task_Id: '',
      title: '',
      description: '',
      location: '',
      assignedTo: '',
      startTime: '',
      endTime: '',
      status: 'pending'
    });
    setSelectedPersonnel([]);
    setEditingTask(null);
  };

  const getPersonnelName = (userId) => {
    const person = personnel.find(p => p.User_Id === userId);
    return person ? `${person.name} (${person.User_Id})` : userId;
  };

  const statusColors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800',
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Task Management</h1>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-200"
          >
            <FiPlus className="mr-2" />
            New Task
          </button>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => (
            <div key={task.Task_Id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-200">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">{task.title}</h3>
                    <span className="text-xs text-gray-500">ID: {task.Task_Id}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status] || 'bg-gray-100 text-gray-800'}`}>
                    {task.status.replace('-', ' ')}
                  </span>
                </div>

                <p className="mt-3 text-gray-600">{task.description}</p>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <FiMapPin className="mr-2" />
                    <span>{task.location || 'Not specified'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiUser className="mr-2" />
                    <span>Assigned to: {task.assignedTo.map(id => getPersonnelName(id)).join(', ')}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <FiCalendar className="mr-2" />
                    <span>
                      {new Date(task.startTime).toLocaleString()} - {new Date(task.endTime).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => editTask(task)}
                    className="flex items-center bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded-lg text-sm transition duration-200"
                  >
                    <FiEdit className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => deleteTask(task.Task_Id)}
                    className="flex items-center bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-lg text-sm transition duration-200"
                  >
                    <FiTrash2 className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FiInfo className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">No tasks found</h3>
            <p className="text-gray-500 mt-2">Create your first task by clicking the "New Task" button</p>
          </div>
        )}

        {/* Modal for Add/Edit Task */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingTask ? 'Edit Task' : 'Create New Task'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task ID</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="Task_Id"
                    value={formData.Task_Id}
                    onChange={handleChange}
                    placeholder="Enter task ID"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter task description"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter location"
                  />
                </div>

                {/* Personnel Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assign Personnel ({selectedPersonnel.length} selected)
                  </label>
                  {availablePersonnel.length === 0 ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800 text-sm">
                        No available personnel found. All personnel are either assigned to tasks or on leave.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                      {availablePersonnel.map(person => (
                        <div
                          key={person.User_Id}
                          className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition duration-200 ${
                            selectedPersonnel.includes(person.User_Id)
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handlePersonnelSelection(person.User_Id)}
                        >
                          <div className="flex items-center">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{person.name}</p>
                              <p className="text-sm text-gray-500">
                                ID: {person.User_Id} | Rank: {person.rank || 'N/A'}
                              </p>
                            </div>
                          </div>
                          {selectedPersonnel.includes(person.User_Id) && (
                            <FiCheck className="text-blue-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                  >
                    {statusOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200"
                    disabled={selectedPersonnel.length === 0}
                  >
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCrud;