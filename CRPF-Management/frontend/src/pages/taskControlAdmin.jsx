import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Users, Calendar, MapPin, ChevronsUpDown, X, Loader2 } from 'lucide-react';

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api/admin';

// --- API Service ---
const apiService = {
    getTasks: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/task`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch tasks');
            }
            return response.json();
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            throw error;
        }
    },
    createTask: async (taskData) => {
        try {
            // Generate a unique Task_Id if not provided
            if (!taskData.Task_Id) {
                taskData.Task_Id = `TASK-${Date.now()}`;
            }
            
            const response = await fetch(`${API_BASE_URL}/task`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create task');
            }
            return response.json();
        } catch (error) {
            console.error('Failed to create task:', error);
            throw error;
        }
    },
    updateTask: async (taskId, taskData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update task');
            }
            return response.json();
        } catch (error) {
            console.error('Failed to update task:', error);
            throw error;
        }
    },
    deleteTask: async (taskId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/task/${taskId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete task');
            }
            return response.json();
        } catch (error) {
            console.error('Failed to delete task:', error);
            throw error;
        }
    },
    getFreePersonnel: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/free`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch available personnel');
            }
            return response.json();
        } catch (error) {
            console.error('Failed to fetch free personnel:', error);
            throw error;
        }
    },
    getAllPersonnel: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/user`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch personnel');
            }
            return response.json();
        } catch (error) {
            console.error('Failed to fetch all personnel:', error);
            throw error;
        }
    }
};

// --- Helper Components ---

const StatusBadge = ({ status }) => {
    const statusStyles = {
        pending: 'bg-amber-100 text-amber-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        completed: 'bg-emerald-100 text-emerald-800',
    };
    const statusText = {
        pending: 'Pending',
        'in-progress': 'In Progress',
        completed: 'Completed',
    };

    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles[status]}`}>
            {statusText[status]}
        </span>
    );
};

const PriorityBadge = ({ priority }) => {
    if (!priority) return null;
    
    const priorityStyles = {
        low: 'bg-gray-100 text-gray-800',
        medium: 'bg-blue-100 text-blue-800',
        high: 'bg-red-100 text-red-800',
    };
    const priorityText = {
        low: 'Low',
        medium: 'Medium',
        high: 'High',
    };

    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${priorityStyles[priority]}`}>
            {priorityText[priority]}
        </span>
    );
};

const MultiSelectDropdown = ({ 
    options, 
    selected, 
    onChange, 
    placeholder = "Select Personnel",
    isLoading = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = React.useRef(null);

    const handleToggle = (optionId) => {
        const newSelected = selected.includes(optionId)
            ? selected.filter(id => id !== optionId)
            : [...selected, optionId];
        onChange(newSelected);
    };
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedNames = options
        .filter(opt => selected.includes(opt.User_Id))
        .map(opt => opt.name)
        .join(', ');

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                className="w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 text-left flex justify-between items-center"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
            >
                {isLoading ? (
                    <span className="flex items-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Loading...
                    </span>
                ) : (
                    <>
                        <span className="truncate">{selectedNames || placeholder}</span>
                        <ChevronsUpDown className="h-4 w-4 text-gray-500" />
                    </>
                )}
            </button>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
                    {options.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">No personnel available</div>
                    ) : (
                        <ul className="py-1">
                            {options.map((option) => (
                                <li key={option.User_Id}>
                                    <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selected.includes(option.User_Id)}
                                            onChange={() => handleToggle(option.User_Id)}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-3">
                                            {option.name} 
                                            {option.rank && (
                                                <span className="text-xs text-gray-500 ml-2">({option.rank})</span>
                                            )}
                                        </span>
                                    </label>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Main Components ---

const TaskCard = ({ task, onEdit, onDelete, allPersonnel }) => {
    const validUsers = Array.isArray(allPersonnel) ? allPersonnel : [];
    const assignedPersonnel = validUsers.filter(u => 
        task.assignedTo && task.assignedTo.includes(u.User_Id)
    );
    
    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        
        return date.toLocaleString('en-US', {
            month: 'short', 
            day: 'numeric', 
            year: 'numeric', 
            hour: 'numeric', 
            minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
            <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-grow pr-4">
                        <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                            <PriorityBadge priority={task.priority} />
                        </div>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center space-x-2">
                        <StatusBadge status={task.status} />
                    </div>
                </div>
               
                <div className="space-y-2.5 text-sm text-gray-600">
                    {task.location && (
                        <div className="flex items-start">
                            <MapPin className="h-4 w-4 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="truncate">{task.location}</span>
                        </div>
                    )}
                    
                    <div className="flex items-start">
                        <Calendar className="h-4 w-4 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-medium text-gray-700">Timing</div>
                            <div className="text-gray-600">
                                {formatDate(task.startTime)} - {formatDate(task.endTime)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-start">
                        <Users className="h-4 w-4 mr-3 text-gray-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-medium text-gray-700">Assigned to</div>
                            <div className="flex flex-wrap gap-1.5 mt-1">
                                {assignedPersonnel.length > 0 ? (
                                    assignedPersonnel.map(p => (
                                        <span 
                                            key={p.User_Id} 
                                            className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full inline-flex items-center"
                                        >
                                            {p.name}
                                            {p.rank && (
                                                <span className="text-gray-500 ml-1">({p.rank})</span>
                                            )}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400 text-xs">Not assigned</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                    <div className="text-xs text-gray-400">ID: {task.Task_Id}</div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => onEdit(task)} 
                            className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            aria-label="Edit task"
                        >
                            <Edit className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => onDelete(task.Task_Id)} 
                            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                            aria-label="Delete task"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TaskModal = ({ isOpen, onClose, onSave, task, allPersonnel, freePersonnel, isLoading }) => {
    const [formData, setFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    
    const getAssignablePersonnel = () => {
        if (!task) { // Creating a new task
            return freePersonnel;
        }
        // Editing an existing task - include currently assigned personnel
        const assignedIds = task.assignedTo || [];
        const assigned = allPersonnel.filter(p => assignedIds.includes(p.User_Id));
        
        // Combine free personnel with currently assigned personnel
        const combined = [...freePersonnel, ...assigned];
        // Remove duplicates
        return Array.from(new Map(combined.map(p => [p.User_Id, p])).values());
    };
    
    useEffect(() => {
        if (isOpen) {
            setFormErrors({});
            if (task) {
                const formatForInput = (date) => {
                    if (!date) return '';
                    const d = new Date(date);
                    return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 16);
                };
                
                setFormData({
                    ...task,
                    startTime: formatForInput(task.startTime),
                    endTime: formatForInput(task.endTime),
                    assignedTo: task.assignedTo || []
                });
            } else {
                setFormData({
                    title: '',
                    description: '',
                    status: 'pending',
                    priority: 'medium',
                    location: '',
                    startTime: '',
                    endTime: '',
                    assignedTo: [],
                    assignedBy: 'admin' // This should be dynamic based on logged-in user
                });
            }
        }
    }, [task, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when field is edited
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };
    
    const handleAssignedToChange = (selectedUserIds) => {
        setFormData(prev => ({ ...prev, assignedTo: selectedUserIds }));
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.title || formData.title.trim() === '') {
            errors.title = 'Title is required';
        }
        
        if (formData.startTime && formData.endTime) {
            const start = new Date(formData.startTime);
            const end = new Date(formData.endTime);
            if (start >= end) {
                errors.endTime = 'End time must be after start time';
            }
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        const submissionData = {
            ...formData,
            startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
            endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
            // Ensure Task_Id is included when editing
            ...(task && task.Task_Id ? { Task_Id: task.Task_Id } : {})
        };
        
        onSave(submissionData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {task ? 'Edit Task' : 'Create New Task'}
                            </h2>
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                disabled={isLoading}
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className="block mb-2 text-sm font-medium text-gray-900">
                                    Title *
                                </label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    id="title" 
                                    value={formData.title || ''} 
                                    onChange={handleChange} 
                                    className={`bg-gray-50 border ${formErrors.title ? 'border-red-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`} 
                                    placeholder="e.g., Night Patrol" 
                                    required 
                                />
                                {formErrors.title && (
                                    <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
                                )}
                            </div>
                            
                            <div>
                                <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900">
                                    Description
                                </label>
                                <textarea 
                                    name="description" 
                                    id="description" 
                                    value={formData.description || ''} 
                                    onChange={handleChange} 
                                    rows="3" 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                                    placeholder="Detailed instructions..."
                                ></textarea>
                            </div>
                            
                            <div>
                                <label htmlFor="assignedTo" className="block mb-2 text-sm font-medium text-gray-900">
                                    Assign To
                                </label>
                                <MultiSelectDropdown 
                                    options={getAssignablePersonnel()} 
                                    selected={formData.assignedTo || []} 
                                    onChange={handleAssignedToChange}
                                    placeholder="Select personnel"
                                    isLoading={isLoading}
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900">
                                        Status
                                    </label>
                                    <select 
                                        name="status" 
                                        id="status" 
                                        value={formData.status || 'pending'} 
                                        onChange={handleChange} 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in-progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label htmlFor="priority" className="block mb-2 text-sm font-medium text-gray-900">
                                        Priority
                                    </label>
                                    <select 
                                        name="priority" 
                                        id="priority" 
                                        value={formData.priority || 'medium'} 
                                        onChange={handleChange} 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="location" className="block mb-2 text-sm font-medium text-gray-900">
                                    Location
                                </label>
                                <input 
                                    type="text" 
                                    name="location" 
                                    id="location" 
                                    value={formData.location || ''} 
                                    onChange={handleChange} 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
                                    placeholder="e.g., Sector 4" 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="startTime" className="block mb-2 text-sm font-medium text-gray-900">
                                        Start Time
                                    </label>
                                    <input 
                                        type="datetime-local" 
                                        name="startTime" 
                                        id="startTime" 
                                        value={formData.startTime || ''} 
                                        onChange={handleChange} 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    />
                                </div>
                                
                                <div>
                                    <label htmlFor="endTime" className="block mb-2 text-sm font-medium text-gray-900">
                                        End Time
                                    </label>
                                    <input 
                                        type="datetime-local" 
                                        name="endTime" 
                                        id="endTime" 
                                        value={formData.endTime || ''} 
                                        onChange={handleChange} 
                                        className={`bg-gray-50 border ${formErrors.endTime ? 'border-red-300' : 'border-gray-300'} text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5`}
                                    />
                                    {formErrors.endTime && (
                                        <p className="mt-1 text-sm text-red-600">{formErrors.endTime}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-lg">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors flex items-center justify-center min-w-20"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : task ? 'Update Task' : 'Create Task'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- App Component (Main Entry) ---
export default function App() {
    const [tasks, setTasks] = useState([]);
    const [allPersonnel, setAllPersonnel] = useState([]);
    const [freePersonnel, setFreePersonnel] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalLoading, setIsModalLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filter, setFilter] = useState('all');

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch all data concurrently
            const [tasksResponse, freePersonnelResponse, allPersonnelResponse] = await Promise.all([
                apiService.getTasks(),
                apiService.getFreePersonnel(),
                apiService.getAllPersonnel()
            ]);

            // Handle tasks
            const tasksArray = Array.isArray(tasksResponse.tasks) ? tasksResponse.tasks : [];
            const sortedTasks = tasksArray.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
            setTasks(sortedTasks);
            
            // Handle free personnel
            const freePersonnelArray = Array.isArray(freePersonnelResponse.personnel) ? freePersonnelResponse.personnel : [];
            setFreePersonnel(freePersonnelArray);

            // Handle all personnel
            const allPersonnelArray = Array.isArray(allPersonnelResponse) ? allPersonnelResponse : [];
            setAllPersonnel(allPersonnelArray);

        } catch (err) {
            setError(err.message || 'Failed to load data. Please try again later.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const handleOpenModal = (task = null) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingTask(null);
        setIsModalOpen(false);
    };

    const handleSaveTask = async (taskData) => {
        setIsModalLoading(true);
        try {
            if (editingTask && editingTask.Task_Id) {
                await apiService.updateTask(editingTask.Task_Id, taskData);
            } else {
                await apiService.createTask(taskData);
            }
            await fetchAllData();
            handleCloseModal();
        } catch (err) {
            setError(`Failed to save task: ${err.message}`);
            console.error(err);
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            setIsLoading(true);
            try {
                await apiService.deleteTask(taskId);
                await fetchAllData();
            } catch (err) {
                setError(`Failed to delete task: ${err.message}`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        }
    };
    
    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        return task.status === filter;
    });

    const FilterButton = ({ status, label }) => (
        <button
            onClick={() => setFilter(status)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="container mx-auto px-4 py-8">
                <header className="flex flex-col md:flex-row justify-between items-center mb-8">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Task Management</h1>
                        <p className="text-gray-600 text-sm mt-1">
                            {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} total
                        </p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition-colors duration-200"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Task
                    </button>
                </header>

                <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        <span className="text-sm font-medium text-gray-700">Filter by status:</span>
                        <div className="flex flex-wrap gap-2">
                            <FilterButton status="all" label="All Tasks" />
                            <FilterButton status="pending" label="Pending" />
                            <FilterButton status="in-progress" label="In Progress" />
                            <FilterButton status="completed" label="Completed" />
                        </div>
                    </div>
                </div>
                
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <X className="h-5 w-5 text-red-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">{error}</p>
                                <button 
                                    onClick={fetchAllData} 
                                    className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
                                >
                                    Try again
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTasks.length > 0 ? (
                            filteredTasks.map(task => (
                                <TaskCard 
                                    key={task.Task_Id} 
                                    task={task} 
                                    onEdit={handleOpenModal}
                                    onDelete={handleDeleteTask}
                                    allPersonnel={allPersonnel}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10 bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <Calendar className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No tasks found</h3>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    {filter === 'all' 
                                        ? 'There are currently no tasks. Create one to get started.'
                                        : `There are no ${filter} tasks.`}
                                </p>
                                {filter !== 'all' && (
                                    <button
                                        onClick={() => setFilter('all')}
                                        className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        View all tasks
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <TaskModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveTask}
                task={editingTask}
                allPersonnel={allPersonnel}
                freePersonnel={freePersonnel}
                isLoading={isModalLoading}
            />
        </div>
    );
}