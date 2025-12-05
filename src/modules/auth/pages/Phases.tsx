import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import {
  getRequestStatus,
  postRequestStatus,
  putRequestStatus,
  deleteRequestStatus,
  
} from '../../../networkCalls/NetworkCalls';
import { Api_url } from '../../../networkCalls/Apiurls';
import RingGradientLoader from '../../../components/RingGradientLoader';
import { showError, showSuccess, showWarn } from '../../../services/toasterService';

// -------------------------
// Interfaces
// -------------------------
interface Phase {
  phase_id: number;
  phase_name: string;
  order_id: number;
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetPhasesResponse = ApiResponse<Phase[]>;
type AddPhaseResponse = ApiResponse<Phase>;
type UpdatePhaseResponse = ApiResponse<Phase>;
type DeletePhaseResponse = ApiResponse<{ phase_id: number }>;

// -------------------------
// Component
// -------------------------
const Phases: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [phaseNameInput, setPhaseNameInput] = useState('');
  const [orderIdInput, setOrderIdInput] = useState<number | ''>('');

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [phaseToDelete, setPhaseToDelete] = useState<Phase | null>(null);

  // -------------------------
  // Load Phases
  // -------------------------
  useEffect(() => {
    loadPhases();
  }, []);

  const loadPhases = async () => {
    setLoading(true);
    try {
      // const headers = await GetApiHeaders_token();
      const { status, data } = await getRequestStatus<GetPhasesResponse>(Api_url.getAllPhases);

      if (status === 200 && data) {
        setPhases(data.data);
      } else {
        showError(data?.message || 'Failed to fetch phases');
      }
    } catch (err) {
      console.error(err);
      showError('Failed to fetch phases');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Modal handlers
  // -------------------------
  const openAddModal = () => {
    setModalMode('add');
    setPhaseNameInput('');
    setOrderIdInput('');
    setSelectedPhase(null);
    setIsModalOpen(true);
  };

  const openEditModal = (phase: Phase) => {
    setModalMode('edit');
    setPhaseNameInput(phase.phase_name);
    setOrderIdInput(phase.order_id);
    setSelectedPhase(phase);
    setIsModalOpen(true);
  };

  const openDeleteModal = (phase: Phase) => {
    setPhaseToDelete(phase);
    setIsConfirmModalOpen(true);
  };

  // -------------------------
  // Add/Edit submit
  // -------------------------
  const handleModalSubmit = async () => {
    if (!phaseNameInput.trim()) {
      showWarn('Phase name is required');
      return;
    }
    if (orderIdInput === '' || orderIdInput <= 0) {
      showWarn('Valid Order ID is required');
      return;
    }

    try {
      // const headers = await GetApiHeaders_token();

      if (modalMode === 'add') {
        const payload = { phase_name: phaseNameInput, order_id: orderIdInput, is_active: true };
        const { status, data } = await postRequestStatus<AddPhaseResponse>(Api_url.createPhase, payload);

        if (status === 201) {
          showSuccess(data?.message || 'Phase added successfully');
          setIsModalOpen(false);
          loadPhases();
        } else {
          showError(data?.message || 'Failed to add phase');
        }
      } else if (modalMode === 'edit' && selectedPhase) {
        const payload = { phase_id: selectedPhase.phase_id, phase_name: phaseNameInput, order_id: orderIdInput };
        const { status, data } = await putRequestStatus<UpdatePhaseResponse>(Api_url.updatePhase, payload, headers);

        if (status === 200) {
          showSuccess(data?.message || 'Phase updated successfully');
          setIsModalOpen(false);
          loadPhases();
        } else {
          showError(data?.message || 'Failed to update phase');
        }
      }
    } catch (err) {
      console.error(err);
      showError('Failed to save phase');
    }
  };

  // -------------------------
  // Confirm delete
  // -------------------------
  const confirmDelete = async () => {
    if (!phaseToDelete) return;

    try {
      // const headers = await GetApiHeaders_token();
      const payload = { phase_id: phaseToDelete.phase_id };
      const { status, data } = await deleteRequestStatus<DeletePhaseResponse>(Api_url.deletePhase, payload);

      if (status === 200) {
        showSuccess(data?.message || 'Phase deleted successfully');
        loadPhases();
      } else {
        showError(data?.message || 'Failed to delete phase');
      }
    } catch (err) {
      console.error(err);
      showError('Failed to delete phase');
    } finally {
      setIsConfirmModalOpen(false);
      setPhaseToDelete(null);
    }
  };

  const filteredPhases = phases.filter((p) => p.phase_name.toLowerCase().includes(searchTerm.toLowerCase()));

  // -------------------------
  // Render
  // -------------------------
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">SDLC Phase List</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search phase..."
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
            Add Phase
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phase Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center p-4"><RingGradientLoader /></td>
                </tr>
              ) : filteredPhases.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center p-4">No phases found</td>
                </tr>
              ) : (
                filteredPhases.map((phase, index) => (
                  <tr key={phase.phase_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{phase.phase_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{phase.order_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                      <button onClick={() => openEditModal(phase)} className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteModal(phase)} className="text-red-600 hover:text-red-900">
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Phase' : 'Edit Phase'}</h2>
            <input
              type="text"
              placeholder="Phase Name"
              value={phaseNameInput}
              onChange={(e) => setPhaseNameInput(e.target.value)}
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
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
              <button onClick={handleModalSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {modalMode === 'add' ? 'Add' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmModalOpen && phaseToDelete && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-4">Are you sure you want to delete this phase?</h2>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Yes, Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Phases;
