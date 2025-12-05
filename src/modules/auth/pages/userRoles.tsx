import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';
// import { toast } from 'react-toastify'; // Import toast
// import 'react-toastify/dist/ReactToastify.css'; // Import toast CSS
import { Api_url } from '../../../networkCalls/Apiurls';
import RingGradientLoader from '../../../components/RingGradientLoader';
import { showError, showSuccess, showWarn } from '../../../services/toasterService';
import { deleteRequestStatus,  getRequestStatus, postRequestStatus, putRequestStatus } from '../../../networkCalls/NetworkCalls';

interface UserRole {
  role_id: number;
  role_name: string;
}
interface AddRoleResponse {
  status: number;
  message?: string;
  data: {
    role_id: number;
    role_name: string;
  };
}

interface UpdateRoleResponse {
  status: number;
  message?: string;
  data: {
    role_id: number;
  };
}

const UserRoles: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);

  // modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [roleNameInput, setRoleNameInput] = useState('');

  // confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<number | null>(null);

  useEffect(() => {
    loadUserRoles();
  }, []);

  const loadUserRoles = async () => {
    setLoading(true);
    try {
      // const res = await axios.get(Api_url.getAllUserRoles);
      // const headers = await GetApiHeaders_token();
      const res = await getRequestStatus<{ status: number; data: UserRole[] }>(
        Api_url.getAllUserRoles
        
      );
      setUserRoles(res?.data?.data || []);
    } catch (err) {
      console.error(err);
      showError('Failed to fetch user roles'); // Toast error notification
    } finally {
      setLoading(false);
    }
  };

  // open modal
  const openAddModal = () => {
    setModalMode('add');
    setRoleNameInput('');
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const openEditModal = (role: UserRole) => {
    setModalMode('edit');
    setRoleNameInput(role.role_name);
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  // submit modal
  const handleModalSubmit = async () => {
    if (!roleNameInput.trim()) {
      showWarn('Role name is required'); // Toast warning notification
      return;
    }

  //   try {
  //     if (modalMode === 'add') {
  //       await axios.post(Api_url.createUserRole, {
  //         role_name: roleNameInput,
  //         is_active: true, // Assuming roles are always active by default
  //       });
  //       showSuccess('Role added successfully'); // Toast success notification
  //     } else if (modalMode === 'edit' && selectedRole) {
  //       await axios.put(Api_url.updateUserRole, {
  //         role_id: selectedRole.role_id,
  //         role_name: roleNameInput,
  //       });
  //       showSuccess('Role updated successfully'); // Toast success notification
  //     }
  //     setIsModalOpen(false);
  //     loadUserRoles();
  //   } catch (err: any) {
  //     showError(err.response?.data?.message || 'Failed to save user role'); // Toast error notification
  //   }
  // };


    try {
      // const headers = await GetApiHeaders_token();

      if (modalMode === 'add') {
        const payload = { role_name: roleNameInput, is_active: true };
        const res = await postRequestStatus<AddRoleResponse>(Api_url.createUserRole, payload);
        
        if (res?.data?.data?.role_id) {
          showSuccess('Role added successfully');
        } else {
          showWarn('Unexpected response from Add Role API');
        }

      } else if (modalMode === 'edit' && selectedRole) {
        const payload = { role_id: selectedRole.role_id, role_name: roleNameInput };
        const res = await putRequestStatus<UpdateRoleResponse>(Api_url.updateUserRole, payload);

        if (res?.data?.data?.role_id) {
          showSuccess('Role updated successfully');
        } else {
          showWarn('Unexpected response from Update Role API');
        }
      }

      setIsModalOpen(false);
      loadUserRoles();

    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save user role');
    }
  };
  const deleteUserRole = (id: number) => {
    setRoleToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
  if (roleToDelete === null) return;

  try {
    // const headers = await GetApiHeaders_token();
    const payload = { role_id: roleToDelete };

    const res = await deleteRequestStatus(Api_url.deleteUserRole, payload);
    console.log("🗑️ Delete response:", res);

    if (res?.status === 200) {
      showSuccess('Role deleted successfully');
      loadUserRoles();
    } else {
      showWarn('Unexpected response from delete API');
    }
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    showError(err.response?.data?.message || 'Failed to delete user role');
  } finally {
    setIsConfirmModalOpen(false);
    setRoleToDelete(null);
  }
};


  const filteredUserRoles = userRoles.filter((role) => {
    const term = searchTerm.toLowerCase();
    return role.role_name.toLowerCase().includes(term);
  });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Roles</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Role
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center p-4"><RingGradientLoader /></td>
                </tr>
              ) : filteredUserRoles.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center p-4">No roles found</td>
                </tr>
              ) : (
                filteredUserRoles.map((role, index) => (
                  <tr key={role.role_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{role.role_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                      <button onClick={() => openEditModal(role)} className="text-green-600 hover:text-green-900 cursor-pointer">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteUserRole(role.role_id)} className="text-red-600 hover:text-red-900 cursor-pointer">
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
            <h2 className="text-xl font-bold mb-4">{modalMode === 'add' ? 'Add Role' : 'Edit Role'}</h2>
            <input
              type="text"
              placeholder="Role Name"
              value={roleNameInput}
              onChange={(e) => setRoleNameInput(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
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
            <h2 className="text-lg font-bold mb-4">Are you sure you want to delete this role?</h2>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
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

export default UserRoles;
