import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Api_url } from "../../../networkCalls/Apiurls";
import RingGradientLoader from "../../../components/RingGradientLoader";
import { createPortal } from "react-dom";
import { showError, showSuccess } from "../../../services/toasterService";
import { deleteRequestStatus,  getRequestStatus, postRequestStatus, putRequestStatus } from "../../../networkCalls/NetworkCalls";

interface Action {
  ActionId: number;
  ActionName: string;
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetActionsResponse = ApiResponse<Action[]>;
type UpdateActionResponse = ApiResponse<Action>;
type DeleteActionResponse = ApiResponse<null>;
export const ActionsManagement: React.FC = () => {
  const [actions, setActions] = useState<Action[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<Action | null>(null);
  const [actionName, setActionName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [actionToDelete, setActionToDelete] = useState<Action | null>(null);

  // Fetch all actions
  const fetchActions = async () => {
    setLoading(true);
    try {
      // const headers = await GetApiHeaders_token();
      const { status, data } = await getRequestStatus<GetActionsResponse>(Api_url.getAllActions);

      if (data?.status_code === 200 && Array.isArray(data.data)) {
        setActions(data.data);
      } else {
        showError(data?.message || "Failed to load actions");
      }
    } catch (err: any) {
      console.error("Error fetching actions:", err);
      setError(err.message || "Something went wrong while fetching actions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, []);

  // --- Add/Edit modal functions ---
  const openModal = (action?: Action) => {
    if (action) {
      setCurrentAction(action);
      setActionName(action.ActionName);
    } else {
      setCurrentAction(null);
      setActionName("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setActionName("");
    setCurrentAction(null);
  };

  const handleSave = async () => {
    if (!actionName.trim()) return;

    
  // Check for duplicate action name (case-insensitive)
  const duplicate = actions.some(
    (a) =>
      a.ActionName.toLowerCase() === actionName.trim().toLowerCase() &&
      a.ActionId !== currentAction?.ActionId // exclude the current action if editing
  );

  if (duplicate) {
    showError("An action with this name already exists");
    return;
  }
    setSaving(true);

    try {
      // const headers = await GetApiHeaders_token();

      if (currentAction) {
        // --- Update ---
        const payload = { ActionName: actionName };
        const { data } = await putRequestStatus<UpdateActionResponse>(
          `${Api_url.updateAction(currentAction.ActionId)}`,
          payload
          
        );

        if (data?.status_code === 200) {
          setActions((prev) =>
            prev.map((a) =>
              a.ActionId === currentAction.ActionId
                ? { ...a, ActionName: actionName }
                : a
            )
          );
          showSuccess(data?.message || "Action updated successfully");
        } else {
          showError(data?.message || "Failed to update action");
        }
      } else {
        // --- Create ---
        const payload = { ActionName: actionName };
        const { data } = await postRequestStatus<UpdateActionResponse>(Api_url.addAction, payload);

        if (data?.status_code === 200 || data?.status_code === 201) {
          setActions((prev) => [data.data, ...prev]); // prepend new action
          showSuccess(data?.message || "Action created successfully");
        } else {
          showError(data?.message || "Failed to create action");
        }
      }

      closeModal();
    } catch (err: any) {
      console.error("Error saving action:", err);
      showError("Something went wrong while saving the action");
    } finally {
      setSaving(false);
    }
  };

  // --- Delete modal functions ---
  const openDeleteModal = (action: Action) => {
    setActionToDelete(action);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setActionToDelete(null);
    setIsDeleteModalOpen(false);
  };

 const handleDelete = async (actionId: number) => {
    try {
      // const headers = await GetApiHeaders_token();
      const { data } = await deleteRequestStatus<DeleteActionResponse>(
        `${Api_url.deleteAction(actionId)}`,
        undefined
        
      );

      if (data?.status_code === 200) {
        setActions((prev) => prev.filter((a) => a.ActionId !== actionId));
        showSuccess(data?.message || "Action deleted successfully");
      } else {
        showError(data?.message || "Failed to delete action");
      }
    } catch (err: any) {
      console.error("Error deleting action:", err);
      showError("Something went wrong while deleting the action");
    }
  };

  // --- Filter actions for search ---
  const filteredActions = actions.filter((action) =>
    action.ActionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- Loader & error ---
  if (loading || saving) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RingGradientLoader />
      </div>
    );
  }


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Actions Management</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center space-x-2 bg-[#0078e1] cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          <span>Add Action</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-6">
        <input
          type="text"
          placeholder="Search actions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />

        {/* Table */}
        <div className="overflow-hidden border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action Name
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredActions.map((action) => (
                <tr key={action.ActionId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">{action.ActionName}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openModal(action)}
                        className="bg-[#007dda] text-white p-2 rounded-lg hover:bg-indigo-600 cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(action)}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredActions.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                    No actions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6">
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <h3 className="text-lg font-semibold">
                  {currentAction ? "Edit Action" : "Add Action"}
                </h3>
                <button onClick={closeModal}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <input
                type="text"
                value={actionName}
                onChange={(e) => setActionName(e.target.value)}
                placeholder="Enter action name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !actionName.trim()}
                  className={`px-4 py-2 rounded-lg text-white ${
                    actionName.trim()
                      ? "bg-indigo-600 hover:bg-indigo-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Delete Modal */}
      {isDeleteModalOpen &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
            <div className="bg-white rounded-lg shadow-lg w-96 p-6">
              <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
                <h3 className="text-lg font-semibold">Delete Action</h3>
                <button onClick={closeDeleteModal}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="mb-4">
                Are you sure you want to delete ?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionToDelete) handleDelete(actionToDelete.ActionId);
                    closeDeleteModal();
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
