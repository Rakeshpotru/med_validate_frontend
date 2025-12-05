// modules/auth/pages/ScreensList.tsx
import React, { useEffect, useState } from "react";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { Api_url } from "../../../networkCalls/Apiurls";
import RingGradientLoader from "../../../components/RingGradientLoader";
import { createPortal } from "react-dom";
import { showError, showSuccess } from "../../../services/toasterService";
import { deleteRequestStatus,  getRequestStatus, postRequestStatus, putRequestStatus } from "../../../networkCalls/NetworkCalls";

interface Screen {
  ScreenId: number;
  ScreenName: string;
  CreatedBy: number;
  CreatedDate: string;
  UpdatedBy?: number;
  UpdatedDate?: string;
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetScreensResponse = ApiResponse<Screen[]>;
type AddScreenResponse = ApiResponse<Screen>;
type UpdateScreenResponse = ApiResponse<null>;
type DeleteScreenResponse = ApiResponse<null>;

export const ScreensList: React.FC = () => {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add/Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [screenName, setScreenName] = useState("");
  const [saving, setSaving] = useState(false);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [screenToDelete, setScreenToDelete] = useState<Screen | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all screens
  // const fetchScreens = async () => {
  //   try {
  //     const response = await fetch(Api_url.getAllScreens);
  //     const result = await response.json();
  //     setScreens(result.data || []);
  //   } catch (err: any) {
  //     setError(err.message || "Unknown error");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
   const fetchScreens = async () => {
    try {
      // const headers = await GetApiHeaders_token();
      const { status, data } = await getRequestStatus<GetScreensResponse>(Api_url.getAllScreens);

      if (data?.status_code === 200 && Array.isArray(data.data)) {
        setScreens(data.data);
      } else {
        showError(data?.message || "Failed to load screens.");
      }
    } catch (err: any) {
      console.error("Error fetching screens:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  // --- Add/Edit Modal Functions ---
  const openModal = (screen?: Screen) => {
    if (screen) {
      setCurrentScreen(screen);
      setScreenName(screen.ScreenName);
    } else {
      setCurrentScreen(null);
      setScreenName("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setScreenName("");
    setCurrentScreen(null);
  };

  const handleSave = async () => {
    if (!screenName.trim()) return;
      // Check for duplicate screen name (case-insensitive)
  const duplicate = screens.some(
    (s) =>
      s.ScreenName.toLowerCase() === screenName.trim().toLowerCase() &&
      s.ScreenId !== currentScreen?.ScreenId // exclude the current screen if editing
  );

  if (duplicate) {
    showError("A screen with this name already exists");
    return;
  }
    setSaving(true);

  //   try {
  //     if (currentScreen) {
  //       // Update
  //       const res = await fetch(`${Api_url.updateScreen}/${currentScreen.ScreenId}`, {
  //         method: "PUT",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ ScreenName: screenName, UpdatedBy: 1 }),
  //       });
  //       const result = await res.json();

  //       if (res.ok) {
  //         setScreens((prev) =>
  //           prev.map((s) =>
  //             s.ScreenId === currentScreen.ScreenId ? { ...s, ScreenName: screenName } : s
  //           )
  //         );
  //         showSuccess(result.message || "Screen updated successfully");
  //       } else {
  //         showError(result.message || "Failed to update screen");
  //         return;
  //       }
  //     } else {
  //       // Add
  //       const res = await fetch(Api_url.addScreen, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ ScreenName: screenName, CreatedBy: 1 }),
  //       });
  //       const result = await res.json();

  //       if (res.ok) {
  //         setScreens((prev) => [result.data, ...prev]);
  //         showSuccess(result.message || "Screen added successfully");
  //       } else {
  //         showError(result.message || "Failed to add screen");
  //         return;
  //       }
  //     }

  //     closeModal();
  //   } catch (err: any) {
  //     console.error(err);
  //     showError("Something went wrong");
  //   } finally {
  //     setSaving(false);
  //   }
  // };


   try {
      if (currentScreen) {
        // --- Update ---
              // const headers = await GetApiHeaders_token();

        const payload = { ScreenName: screenName };
        const { status, data } = await putRequestStatus<UpdateScreenResponse>(
          `${Api_url.updateScreen}/${currentScreen.ScreenId}`,
          payload
        
        );

        if (data?.status_code === 200) {
          setScreens((prev) =>
            prev.map((s) =>
              s.ScreenId === currentScreen.ScreenId ? { ...s, ScreenName: screenName } : s
            )
          );
          showSuccess(data?.message || "Screen updated successfully.");
        } else {
          showError(data?.message || "Failed to update screen.");
        }
      } else {
        // --- Add ---
              // const headers = await GetApiHeaders_token();

        const payload = { ScreenName: screenName };
        const { status, data } = await postRequestStatus<AddScreenResponse>(
          Api_url.addScreen,
          payload
        
        );

        if (data?.status_code === 200 || data?.status_code === 201) {
  showSuccess(data?.message || "Screen added successfully.");

  // Add new screen to the top of the list
  setScreens(prev => [{...data.data}, ...prev]);
  
  closeModal();


        } else {
          showError(data?.message || "Failed to add screen.");
        }
      }

      closeModal();
    } catch (err: any) {
      console.error("Error saving screen:", err);
      showError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };
  // --- Delete Functions ---
  const openDeleteModal = (screen: Screen) => {
    setScreenToDelete(screen);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setScreenToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // const handleDelete = async (screenId: number) => {
  //   try {
  //     const res = await fetch(`${Api_url.deleteScreen}/${screenId}`, { method: "DELETE" });
  //     const result = await res.json();
  //     if (res.ok) {
  //       setScreens((prev) => prev.filter((s) => s.ScreenId !== screenId));
  //       showSuccess(result.message || "Screen deleted successfully");
  //     } else {
  //       showError(result.message || "Failed to delete screen");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     showError("Something went wrong while deleting the screen");
  //   }
  // };
  const handleDelete = async (screenId: number) => {
    try {
      // const headers = await GetApiHeaders_token();
      // console.log("headers response for delete",headers);
      const { status, data } = await deleteRequestStatus<DeleteScreenResponse>(
        `${Api_url.deleteScreen}/${screenId}`,
        undefined
       
      );

      if (data?.status_code === 200) {
        setScreens((prev) => prev.filter((s) => s.ScreenId !== screenId));
        showSuccess(data?.message || "Screen deleted successfully.");
      } else {
        showError(data?.message || "Failed to delete screen.");
      }
    } catch (err: any) {
      console.error("Error deleting screen:", err);
      showError("Something went wrong while deleting the screen.");
    }
  };

  // --- Loader & Error ---
  if (loading || saving) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RingGradientLoader />
      </div>
    );
  }

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  // --- Filtered Screens for Search ---
  const filteredScreens = screens.filter((screen) =>
    screen.ScreenName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Screens Management</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center cursor-pointer space-x-2 bg-[#0078e1] text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5" strokeWidth={2} />
          <span>Add Screen</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-6">
        <input
          type="text"
          placeholder="Search screens..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-6 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />

        {/* Screens Table */}
        <div className="overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Screen Name
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredScreens.map((screen) => (
                <tr key={screen.ScreenId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{screen.ScreenName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => openModal(screen)}
                        className="bg-[#007dda] text-white p-2 rounded-lg hover:bg-indigo-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(screen)}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredScreens.length === 0 && (
                <tr>
                  <td colSpan={2} className="text-center py-4 text-gray-500">
                    No screens found
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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ background: "color-mix(in oklab, #1b1717 30%, transparent)" }}
          >
            <div className="bg-white rounded-lg shadow-lg w-96 p-5">
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap border-b border-[#ddd] pb-[11px] mb-[20px]">
                <h3 className="text-lg font-semibold">{currentScreen ? "Edit Screen" : "Add Screen"}</h3>
                <button onClick={closeModal}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <input
                type="text"
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                placeholder="Enter screen name"
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
              />
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !screenName.trim()}
                  className={`px-4 py-2 rounded-lg ${
                    screenName.trim()
                      ? "bg-indigo-600 text-white hover:bg-indigo-700"
                      : "bg-gray-200 text-[#939393] cursor-not-allowed"
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
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ background: "color-mix(in oklab, #1b1717 30%, transparent)" }}
          >
            <div className="bg-white rounded-lg shadow-lg w-96 p-5">
              <div className="flex items-center justify-between mb-4 border-b border-[#ddd] pb-2">
                <h3 className="text-lg font-semibold">Delete Screen</h3>
                <button onClick={closeDeleteModal}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <p className="mb-4">
                Are you sure you want to delete <strong>{screenToDelete?.ScreenName}</strong>?
              </p>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={closeDeleteModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (screenToDelete) handleDelete(screenToDelete.ScreenId);
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
