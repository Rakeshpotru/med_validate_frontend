import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Delete } from 'lucide-react';
import axios from 'axios';
import { Api_url } from '../../../networkCalls/Apiurls';
import RingGradientLoader from '../../../components/RingGradientLoader';
import { showError, showSuccess, showWarn } from '../../../services/toasterService';
import DeleteConfirm from './DeletePopup';
import { deleteRequestStatus, getRequestStatus, postRequestStatus, putRequestStatus } from '../../../networkCalls/NetworkCalls';

interface WorkFlowStage {
    work_flow_stage_id: number;
    work_flow_stage_name: string;
    is_active?: boolean;
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetWorkFlowStagesResponse = ApiResponse<WorkFlowStage[]>;
type CreateOrUpdateStageResponse = ApiResponse<WorkFlowStage>;
type DeleteStageResponse = ApiResponse<{ work_flow_stage_id: number }>;

const WorkFlowStages: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [workFlowStages, setWorkFlowStages] = useState<WorkFlowStage[]>([]);
    const [loading, setLoading] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stageNameInput, setStageNameInput] = useState('');
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedStage, setSelectedStage] = useState<WorkFlowStage | null>(null);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        loadStages();
    }, []);

    const loadStages = async () => {
        setLoading(true);
        try {
        //   const headers = await GetApiHeaders_token();
          const res = await getRequestStatus<GetWorkFlowStagesResponse>(Api_url.getAllWorkFlowStages);      
                setWorkFlowStages(res.data?.data || []);
        } catch {
            showError('Failed to fetch workflow stages');
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setModalMode('add');
        setStageNameInput('');
        setSelectedStage(null);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (stage: any) => {
        setSelectedItem(stage);
        setOpenDelete(true);
    };

    const deleteItem = () => {
        console.log("Delete API call =>", selectedItem);
        deleteStage(selectedItem?.stage.work_flow_stage_id)
        setOpenDelete(false);
    };


    const openEditModal = (stage: WorkFlowStage) => {
        setModalMode('edit');
        setSelectedStage(stage);
        setStageNameInput(stage.work_flow_stage_name);
        setIsModalOpen(true);
    };

    const handleAddOrUpdate = async () => {
        if (!stageNameInput.trim()) return showWarn('Stage name is required');

        try {
            // const headers = await GetApiHeaders_token();
            if (modalMode === 'add') {
                const payload = { work_flow_stage_name: stageNameInput.trim(), is_active: true };

                const res = await postRequestStatus<CreateOrUpdateStageResponse>(Api_url.CreateWorkFlowStages,payload);
                showSuccess(res.data?.message || 'Workflow stage created successfully');
            } else if (modalMode === 'edit' && selectedStage) {
                const res = await putRequestStatus<CreateOrUpdateStageResponse>(
                    Api_url.UpdareWorkFlowStages(selectedStage.work_flow_stage_id),
                    {
                        work_flow_stage_name: stageNameInput.trim(),
                        is_active: true
                    },headers
                );
                showSuccess(res.data?.message || 'Workflow stage updated successfully');
            }

            setIsModalOpen(false);
            loadStages();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Error saving workflow stage');
        }
    };


    const deleteStage = async (id: number) => {
        try {
            // const headers = await GetApiHeaders_token();
      const res = await deleteRequestStatus<DeleteStageResponse>(
        Api_url.DeleteWorkFlowStages(id),undefined
        
      );
            // const res = await axios.delete(Api_url.DeleteWorkFlowStages(id));
            showSuccess(res.data?.message || 'Workflow stage deleted');
            loadStages();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to delete workflow stage');
        }
    };

    const filteredStages = workFlowStages.filter((stage) =>
        stage.work_flow_stage_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Workflow Stages</h1>
            </div>

            <div className="bg-white rounded-lg shadow-md">
                <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search stage..."
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
                        Add Stage
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stage Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-4"><RingGradientLoader /></td>
                                </tr>
                            ) : filteredStages.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="text-center p-4">No stages found</td>
                                </tr>
                            ) : (
                                filteredStages.map((stage, index) => (
                                    <tr key={stage.work_flow_stage_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{stage.work_flow_stage_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                            <button onClick={() => openEditModal(stage)} className="text-green-600 hover:text-green-900">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-900"
                                                onClick={() => handleDeleteClick({ stage })}
                                            >
                                                <Trash2 className='w-4 h-4'/>
                                            </button>

                                            <DeleteConfirm
                                                open={openDelete}
                                                onClose={() => setOpenDelete(false)}
                                                onConfirm={deleteItem}
                                                itemName={selectedItem?.stage.work_flow_stage_name || ""}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
                    <div className="bg-white rounded-lg shadow-lg w-96 p-6">
                        <h2 className="text-xl font-bold mb-4">
                            {modalMode === 'add' ? 'Add Workflow Stage' : 'Edit Workflow Stage'}
                        </h2>

                        <input
                            type="text"
                            placeholder="Stage Name"
                            value={stageNameInput}
                            onChange={(e) => setStageNameInput(e.target.value)}
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
                                onClick={handleAddOrUpdate}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {modalMode === 'add' ? 'Add' : 'Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkFlowStages;
