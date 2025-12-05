import React, { useEffect, useState } from "react";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import {
  getRequestStatus,
  postRequestStatus,
  putRequestStatus,
  deleteRequestStatus,
} from "../../../networkCalls/NetworkCalls";
import { Api_url } from "../../../networkCalls/Apiurls";
import RingGradientLoader from "../../../components/RingGradientLoader";
import { showError, showSuccess, showWarn } from "../../../services/toasterService";

interface Status {
  status_id: number;
  status_name: string;
  is_active?: boolean;
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetStatusesResponse = ApiResponse<Status[]>;
type AddStatusResponse = ApiResponse<Status>;
type UpdateStatusResponse = ApiResponse<Status>;
type DeleteStatusResponse = ApiResponse<{ status_id: number; is_active: boolean }>;

// -------------------------
// Component
// -------------------------
const Statuses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [statusNameInput, setStatusNameInput] = useState("");

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState<Status | null>(null);

  // -------------------------
  // Load statuses
  // -------------------------
  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    setLoading(true);
    try {
      // const headers = await GetApiHeaders_token();
      const { status, data } = await getRequestStatus<GetStatusesResponse>(Api_url.getAllStatus);

      if (status === 200 && data) {
        setStatuses(data.data);
      } else {
        showError(data?.message || "Failed to fetch statuses");
      }
    } catch (err) {
      console.error(err);
      showError("Failed to fetch statuses");
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Modal handlers
  // -------------------------
  const openAddModal = () => {
    setModalMode("add");
    setStatusNameInput("");
    setSelectedStatus(null);
    setIsModalOpen(true);
  };

  const openEditModal = (status: Status) => {
    setModalMode("edit");
    setStatusNameInput(status.status_name);
    setSelectedStatus(status);
    setIsModalOpen(true);
  };

  const openDeleteModal = (status: Status) => {
    setStatusToDelete(status);
    setIsConfirmModalOpen(true);
  };

  // -------------------------
  // Add/Edit submit
  // -------------------------
  const handleModalSubmit = async () => {
    if (!statusNameInput.trim()) {
      showWarn("Status name is required");
      return;
    }

    try {
      // const headers = await GetApiHeaders_token();

      if (modalMode === "add") {
        const payload = { status_name: statusNameInput, is_active: true };
        const { status, data } = await postRequestStatus<AddStatusResponse>(Api_url.createStatus, payload);

        if (status === 201 || status === 200) {
          showSuccess(data?.message || "Status added successfully");
          setIsModalOpen(false);
          loadStatuses();
        } else {
          showError(data?.message || "Failed to add status");
          setIsModalOpen(false);
        }
      } else if (modalMode === "edit" && selectedStatus) {
        const payload = { status_id: selectedStatus.status_id, status_name: statusNameInput };
        const { status, data } = await putRequestStatus<UpdateStatusResponse>(Api_url.updateStatus, payload);

        if (status === 200) {
          showSuccess(data?.message || "Status updated successfully");
          setIsModalOpen(false);
          loadStatuses();
        } else {
          showError(data?.message || "Failed to update status");
        }
      }
    } catch (err) {
      console.error(err);
      showError("Failed to save status");
    }
  };

  // -------------------------
  // Confirm delete
  // -------------------------
  const confirmDelete = async () => {
    if (!statusToDelete) return;

    try {
      // const headers = await GetApiHeaders_token();
      const payload = { status_id: statusToDelete.status_id };
      const { status, data } = await deleteRequestStatus<DeleteStatusResponse>(Api_url.deleteStatus, payload);

      if (status === 200) {
        showSuccess(data?.message || "Status deleted successfully");
        loadStatuses();
      } else {
        showError(data?.message || "Failed to delete status");
      }
    } catch (err) {
      console.error(err);
      showError("Failed to delete status");
    } finally {
      setIsConfirmModalOpen(false);
      setStatusToDelete(null);
    }
  };

  const filteredStatuses = statuses.filter((s) => s.status_name.toLowerCase().includes(searchTerm.toLowerCase()));

  // -------------------------
  // Render
  // -------------------------
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Status List</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search status..."
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
            Add Status
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center p-4">
                    <RingGradientLoader />
                  </td>
                </tr>
              ) : filteredStatuses.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-4">
                    No statuses found
                  </td>
                </tr>
              ) : (
                filteredStatuses.map((status, index) => (
                  <tr key={status.status_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{status.status_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                      <button onClick={() => openEditModal(status)} className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteModal(status)} className="text-red-600 hover:text-red-900">
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
            <h2 className="text-xl font-bold mb-4">{modalMode === "add" ? "Add Status" : "Edit Status"}</h2>
            <input
              type="text"
              placeholder="Status Name"
              value={statusNameInput}
              onChange={(e) => setStatusNameInput(e.target.value)}
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
                {modalMode === "add" ? "Add" : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmModalOpen && statusToDelete && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-4">Are you sure you want to delete this status?</h2>
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

export default Statuses;
