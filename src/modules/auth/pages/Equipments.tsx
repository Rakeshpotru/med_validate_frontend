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
import { showSuccess, showError, showWarn } from "../../../services/toasterService";

// -------------------------
// Interfaces
// -------------------------
interface Equipment {
  equipment_id: number;
  equipment_name: string;
  asset_type_id?: number;
}

interface AssetType {
  asset_id: number;
  asset_name: string;
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetEquipmentsResponse = ApiResponse<Equipment[]>;
type AddEquipmentResponse = ApiResponse<Equipment>;
type UpdateEquipmentResponse = ApiResponse<Equipment>;
type DeleteEquipmentResponse = ApiResponse<{ equipment_id: number; is_active: boolean }>;
type GetAssetTypesResponse = ApiResponse<AssetType[]>;

// -------------------------
// Component
// -------------------------
const Equipments: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [equipmentNameInput, setEquipmentNameInput] = useState("");

  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [typesError, setTypesError] = useState("");
  const [selectedAssetType, setSelectedAssetType] = useState<number | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(null);

  // -------------------------
  // Load data
  // -------------------------
  useEffect(() => {
    loadEquipments();
    loadAssetTypes();
  }, []);

  const loadEquipments = async () => {
    setLoading(true);
    try {
      // const headers = await GetApiHeaders_token();
      const { status, data } = await getRequestStatus<GetEquipmentsResponse>(Api_url.getAllEquipments);

      if (status === 200 && data) {
        setEquipments(data.data);
      } else {
        showError(data?.message || "Failed to fetch equipments");
      }
    } catch (err) {
      console.error(err);
      showError("Failed to fetch equipments");
    } finally {
      setLoading(false);
    }
  };

  const loadAssetTypes = async () => {
    setLoadingTypes(true);
    setTypesError("");
    try {
      // const headers = await GetApiHeaders_token();
      const { status, data } = await getRequestStatus<GetAssetTypesResponse>(Api_url.getAllTestingAssetTypes);

      if (status === 200 && data) {
        setAssetTypes(data.data);
      } else {
        setTypesError(data?.message || "Failed to load testing asset types");
      }
    } catch (err) {
      console.error(err);
      setTypesError("Failed to load testing asset types");
    } finally {
      setLoadingTypes(false);
    }
  };

  // -------------------------
  // Modal handlers
  // -------------------------
  const openAddModal = () => {
    setModalMode("add");
    setEquipmentNameInput("");
    setSelectedEquipment(null);
    setSelectedAssetType(null);
    setIsModalOpen(true);
  };

  const openEditModal = (equipment: Equipment) => {
    setModalMode("edit");
    setEquipmentNameInput(equipment.equipment_name);
    setSelectedEquipment(equipment);
    setSelectedAssetType(equipment.asset_type_id || null);
    setIsModalOpen(true);
  };

  const openDeleteModal = (equipment: Equipment) => {
    setEquipmentToDelete(equipment);
    setIsConfirmModalOpen(true);
  };

  // -------------------------
  // Add/Edit submit
  // -------------------------
  const handleModalSubmit = async () => {
    if (!equipmentNameInput.trim()) return showWarn("Equipment name is required");
    if (selectedAssetType === null) return showWarn("Please select a testing asset type");

    try {
      // const headers = await GetApiHeaders_token();

      if (modalMode === "add") {
        const payload = { equipment_name: equipmentNameInput, asset_type_id: selectedAssetType };
        const { status, data } = await postRequestStatus<AddEquipmentResponse>(Api_url.createEquipment, payload);

        if (status === 201) {
          showSuccess(data?.message || "Equipment added successfully");
          setIsModalOpen(false);
          loadEquipments();
        } else {
          showError(data?.message || "Failed to add equipment");
        }
      } else if (modalMode === "edit" && selectedEquipment) {
        const payload = { equipment_id: selectedEquipment.equipment_id, equipment_name: equipmentNameInput, asset_type_id: selectedAssetType };
        const { status, data } = await putRequestStatus<UpdateEquipmentResponse>(Api_url.updateEquipment(selectedEquipment.equipment_id), payload);

        if (status === 200) {
          showSuccess(data?.message || "Equipment updated successfully");
          setIsModalOpen(false);
          loadEquipments();
        } else {
          showError(data?.message || "Failed to update equipment");
        }
      }
    } catch (err) {
      console.error(err);
      showError("Failed to save equipment");
    }
  };

  // -------------------------
  // Confirm delete
  // -------------------------
  const confirmDelete = async () => {
    if (!equipmentToDelete) return;

    try {
      // const headers = await GetApiHeaders_token();
      const payload = { equipment_id: equipmentToDelete.equipment_id };
      const { status, data } = await deleteRequestStatus<DeleteEquipmentResponse>(Api_url.deleteEquipment(equipmentToDelete.equipment_id), payload);

      if (status === 200) {
        showSuccess(data?.message || "Equipment deleted successfully");
        loadEquipments();
      } else {
        showError(data?.message || "Failed to delete equipment");
      }
    } catch (err) {
      console.error(err);
      showError("Failed to delete equipment");
    } finally {
      setIsConfirmModalOpen(false);
      setEquipmentToDelete(null);
    }
  };

  // -------------------------
  // Filter
  // -------------------------
  const filteredEquipments = equipments.filter((e) =>
    e.equipment_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // -------------------------
  // Render
  // -------------------------
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Equipment Management</h1>
        <p className="text-gray-600 mt-2">Manage and track all equipment inventory</p>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search equipment..."
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
            Add Equipment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment Name</th>
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
              ) : filteredEquipments.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-4">
                    No equipments found
                  </td>
                </tr>
              ) : (
                filteredEquipments.map((equipment, index) => (
                  <tr key={equipment.equipment_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{equipment.equipment_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                      <button onClick={() => openEditModal(equipment)} className="text-green-600 hover:text-green-900">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openDeleteModal(equipment)} className="text-red-600 hover:text-red-900">
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
            <h2 className="text-xl font-bold mb-4">{modalMode === "add" ? "Add Equipment" : "Edit Equipment"}</h2>

            <input
              type="text"
              placeholder="Equipment Name"
              value={equipmentNameInput}
              onChange={(e) => setEquipmentNameInput(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />

            <div className="mb-4">
              <div className="mb-2 text-sm font-medium">Testing Asset Type</div>
              {loadingTypes ? (
                <p className="text-sm text-gray-500">Loading types...</p>
              ) : typesError ? (
                <p className="text-sm text-red-500">{typesError}</p>
              ) : (
                <div className="flex gap-4 flex-wrap">
                  {assetTypes.map((type) => (
                    <label key={type.asset_id} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="assetType"
                        value={type.asset_id}
                        checked={selectedAssetType === type.asset_id}
                        onChange={() => setSelectedAssetType(type.asset_id)}
                      />
                      <span>{type.asset_name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

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
      {isConfirmModalOpen && equipmentToDelete && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-4">Are you sure you want to delete this equipment?</h2>
            <div className="flex justify-end space-x-2">
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

export default Equipments;
