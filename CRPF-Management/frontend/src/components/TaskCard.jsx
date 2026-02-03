import React from 'react';
import { 
  EllipsisVerticalIcon,
  PencilSquareIcon,
  TrashIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import moment from 'moment';

const statusIcons = {
  completed: <CheckCircleIcon className="w-4 h-4 text-green-500" />,
  'in-progress': <ArrowPathIcon className="w-4 h-4 text-blue-500 animate-spin" />,
  pending: <ExclamationTriangleIcon className="w-4 h-4 text-orange-500" />
};

const TaskCard = ({ task, onEdit, onDelete }) => {
  const getStatusColor = () => {
    switch(task.status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-gray-900 text-lg line-clamp-1">{task.title}</h3>
            <span className={`${getStatusColor()} text-xs px-2 py-1 rounded-full flex items-center w-fit mt-2 gap-1`}>
              {statusIcons[task.status]}
              {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
            </span>
          </div>
          
          <div className="dropdown dropdown-end">
            <button tabIndex={0} className="text-gray-400 hover:text-gray-600">
              <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-white rounded-box w-40 border border-gray-100">
              <li>
                <button onClick={() => onEdit(task)} className="text-gray-700 hover:bg-gray-50">
                  <PencilSquareIcon className="w-4 h-4" />
                  Edit
                </button>
              </li>
              <li>
                <button onClick={() => onDelete(task.Task_Id)} className="text-red-600 hover:bg-gray-50">
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </li>
            </ul>
          </div>
        </div>

        <p className="text-gray-500 mt-3 text-sm line-clamp-2">
          {task.description || 'No description provided'}
        </p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <ClockIcon className="w-4 h-4 mr-2" />
            <span>
              {task.startTime ? moment(task.startTime).format('MMM D, h:mm A') : 'Not started'} - 
              {task.endTime ? moment(task.endTime).format('MMM D, h:mm A') : 'No deadline'}
            </span>
          </div>
          
          {task.location && (
            <div className="flex items-center text-sm text-gray-500">
              <MapPinIcon className="w-4 h-4 mr-2" />
              <span>{task.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <UserIcon className="w-4 h-4 mr-2" />
            <span>Assigned by: {task.assignedBy}</span>
          </div>
          
          {task.assignedTo.length > 0 && (
            <div className="flex items-center text-sm text-gray-500">
              <UserGroupIcon className="w-4 h-4 mr-2" />
              <span className="flex items-center">
                Assigned to: 
                <div className="flex ml-2 -space-x-2">
                  {task.assignedTo.slice(0, 3).map((user, index) => (
                    <div key={index} className="relative">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-medium text-indigo-700">
                        {user.charAt(0).toUpperCase()}
                      </div>
                      {index === 2 && task.assignedTo.length > 3 && (
                        <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center text-white text-xs">
                          +{task.assignedTo.length - 3}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;