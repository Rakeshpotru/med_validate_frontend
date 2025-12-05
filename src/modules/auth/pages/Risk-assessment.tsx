import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
import { Api_url } from "../../../networkCalls/Apiurls";
import RingGradientLoader from '../../../components/RingGradientLoader';
import { showSuccess, showWarn } from '../../../services/toasterService';
import { deleteRequestStatus, getRequestStatus, postRequestStatus, putRequestStatus } from '../../../networkCalls/NetworkCalls';

interface RiskAssessment {
  risk_assessment_id: number;
  risk_assessment_name: string;
  risk_assessment_description?: string | null;
  is_active?: boolean;
}

// Generic API response wrapper
interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

// Specific API responses
type GetAllRiskAssessmentsResponse = ApiResponse<RiskAssessment[]>;
type CreateRiskAssessmentResponse = ApiResponse<RiskAssessment>;
type UpdateRiskAssessmentResponse = ApiResponse<RiskAssessment>;
type DeleteRiskAssessmentResponse = ApiResponse<{ risk_assessment_id: number; is_active: boolean }>;

const RiskAssessments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(false);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRisk, setSelectedRisk] = useState<RiskAssessment | null>(null);
  const [riskNameInput, setRiskNameInput] = useState('');

  // delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDeleteRisk, setSelectedDeleteRisk] = useState<RiskAssessment | null>(null);

  useEffect(() => {
    loadRiskAssessments();
  }, []);

  const loadRiskAssessments = async () => {
    setLoading(true);
   try {
      // const headers = await GetApiHeaders_token();
      const { status, data } = await getRequestStatus<GetAllRiskAssessmentsResponse>(
        Api_url.getAllRiskAssessments
        
      );

      if (status === 200 && data) {
        setRiskAssessments(data.data);
      } else {
        showWarn(data?.message || "Failed to fetch risk assessments");
      }
    } catch (err) {
      console.error(err);
      showWarn("Failed to fetch risk assessments");
    } finally {
      setLoading(false);
    }
  };


  // open add/edit modal
  const openAddModal = () => {
    setModalMode('add');
    setRiskNameInput('');
    setSelectedRisk(null);
    setIsModalOpen(true);
  };

  const openEditModal = (risk: RiskAssessment) => {
    setModalMode('edit');
    setRiskNameInput(risk.risk_assessment_name);
    setSelectedRisk(risk);
    setIsModalOpen(true);
  };

  // open delete modal
  const openDeleteModal = (risk: RiskAssessment) => {
    setSelectedDeleteRisk(risk);
    setIsDeleteModalOpen(true);
  };

  // add/edit submit
  const handleModalSubmit = async () => {
    if (!riskNameInput.trim()) return showWarn('Risk Assessment name is required');
try {
      // const headers = await GetApiHeaders_token();

      if (modalMode === "add") {
        const payload = { risk_assessment_name: riskNameInput };
        const { status, data } = await postRequestStatus<CreateRiskAssessmentResponse>(
          Api_url.createRiskAssessment,
          payload
          
        );
        
       

        if (status === 200 && (data?.status_code === 200 || data?.status_code === 201)) {
          showSuccess(data?.message || "Risk Assessment added successfully");
          
          setIsModalOpen(false);
          loadRiskAssessments();
        } else {
          showWarn(data?.message || "Failed to add risk assessment");
        }
      } else if (modalMode === "edit" && selectedRisk) {
        const payload = { risk_assessment_id: selectedRisk.risk_assessment_id, risk_assessment_name: riskNameInput };
        const { status, data } = await putRequestStatus<UpdateRiskAssessmentResponse>(
          Api_url.updateRiskAssessment,
          payload
          
        );

        if (status === 200) {
          showSuccess("Risk Assessment updated successfully");
          setIsModalOpen(false);
          loadRiskAssessments();
        } else {
          showWarn(data?.message || "Failed to update risk assessment");
        }
      }
    } catch (err: any) {
      console.error(err);
      showWarn("Failed to save risk assessment");
    }
  };


  // confirm delete
  const confirmDelete = async () => {
    if (!selectedDeleteRisk) return;

    try {
      // const headers = await GetApiHeaders_token();
      const payload = { risk_assessment_id: selectedDeleteRisk.risk_assessment_id };
      const { status, data } = await deleteRequestStatus<DeleteRiskAssessmentResponse>(
        Api_url.deleteRiskAssessment,
        payload
        
      );

      if (status === 200) {
        showSuccess( "Risk Assessment deleted successfully");
        loadRiskAssessments();
      } else {
        showWarn(data?.message || "Failed to delete risk assessment");
      }
    } catch (err: any) {
      console.error(err);
      showWarn("Failed to delete risk assessment");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedDeleteRisk(null);
    }
  };

  const filteredRiskAssessments = riskAssessments.filter((risk) =>
    risk.risk_assessment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Risk Assessment</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search risk assessments..."
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
            Add Risk Assessment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Assessment Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center p-4"> <RingGradientLoader /></td>
                </tr>
              ) : filteredRiskAssessments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-4">No risk assessments found</td>
                </tr>
              ) : (
                filteredRiskAssessments.map((risk, index) => (
                  <tr key={risk.risk_assessment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{risk.risk_assessment_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                      <button onClick={() => openEditModal(risk)} className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteModal(risk)} className="text-red-600 hover:text-red-900">
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
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Risk Assessment' : 'Edit Risk Assessment'}</h2>
            <input
              type="text"
              placeholder="Risk Assessment Name"
              value={riskNameInput}
              onChange={(e) => setRiskNameInput(e.target.value)}
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

      {/* Delete Modal */}
      {isDeleteModalOpen && selectedDeleteRisk && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4">Delete Risk Assessment</h2>
            <p className="mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedDeleteRisk.risk_assessment_name}</span>?
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAssessments;
