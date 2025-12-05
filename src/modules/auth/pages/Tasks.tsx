import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { Api_url } from '../../../networkCalls/Apiurls';
import RingGradientLoader from '../../../components/RingGradientLoader';
import { showError, showSuccess, showWarn } from '../../../services/toasterService';
import { deleteRequestStatus, getRequestStatus, postRequestStatus, putRequestStatus } from '../../../networkCalls/NetworkCalls';

interface Task {
  task_id: number;
  task_name: string;
  order_id: number;
}

export interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

// Specific API responses
export type GetTasksResponse = ApiResponse<Task[]>;
export type AddTaskResponse = ApiResponse<Task>;
export type UpdateTaskResponse = ApiResponse<Task>;
export type DeleteTaskResponse = ApiResponse<{ task_id: number }>;

const Tasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskNameInput, setTaskNameInput] = useState('');
  const [orderIdInput, setOrderIdInput] = useState<number | ''>('');

  // Confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      // const headers = await GetApiHeaders_token();
      const { data } = await getRequestStatus<GetTasksResponse>(Api_url.getAllTasks );
      setTasks(data?.data || []);
    } catch (err) {
      console.error(err);
      showError("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };


  const openAddModal = () => {
    setModalMode('add');
    setTaskNameInput('');
    setOrderIdInput('');
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setModalMode('edit');
    setTaskNameInput(task.task_name);
    setOrderIdInput(task.order_id);
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!taskNameInput.trim()) {
      showWarn('Task name is required');
      return;
    }
    if (orderIdInput === '' || orderIdInput <= 0) {
      showWarn('Valid order_id is required');
      return;
    }

    try {
      // const headers = await GetApiHeaders_token();
      if (modalMode === "add") {
        const payload = { task_name: taskNameInput, order_id: orderIdInput, is_active: true };
        await postRequestStatus<AddTaskResponse>(Api_url.createTask, payload );
        showSuccess("Task added successfully");
      } else if (modalMode === "edit" && selectedTask) {
        const payload = { task_id: selectedTask.task_id, task_name: taskNameInput, order_id: orderIdInput };
        await putRequestStatus<UpdateTaskResponse>(Api_url.updateTask, payload );
        showSuccess("Task updated successfully");
      }
      setIsModalOpen(false);
      loadTasks();
    } catch (err: any) {
      showError(err.response?.data?.message || "Failed to save task");
    }
  };

  const deleteTask = (id: number) => {
    setTaskToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (taskToDelete === null) return;

    try {
      // const headers = await GetApiHeaders_token();
      const payload = { task_id: taskToDelete };
      await deleteRequestStatus<DeleteTaskResponse>(Api_url.deleteTask,payload);
      showSuccess("Task deleted successfully");
      loadTasks();
    } catch (err: any) {
      showError(err.response?.data?.message || "Failed to delete task");
    } finally {
      setIsConfirmModalOpen(false);
      setTaskToDelete(null);
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.order_id.toString().includes(searchTerm)
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">SDLC Tasks List</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search task or order..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center p-4"> <RingGradientLoader /></td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">No tasks found</td>
                </tr>
              ) : (
                filteredTasks.map((task, index) => (
                  <tr key={task.task_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.task_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.order_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                      <button onClick={() => openEditModal(task)} className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteTask(task.task_id)} className="text-red-600 hover:text-red-900">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Task' : 'Edit Task'}</h2>
            <input
              type="text"
              placeholder="Task Name"
              value={taskNameInput}
              onChange={(e) => setTaskNameInput(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <input
              type="number"
              placeholder="Order ID"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {modalMode === 'add' ? 'Add' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-4">Are you sure you want to delete this SDLC task?</h2>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
