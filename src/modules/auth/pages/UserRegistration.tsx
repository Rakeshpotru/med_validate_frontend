import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import axios from 'axios';

import { Api_url } from '../../../networkCalls/Apiurls';
import Select from 'react-select';
import RingGradientLoader from '../../../components/RingGradientLoader';
import { showError, showSuccess, showWarn } from '../../../services/toasterService';
import { deleteRequestStatus,  getRequestStatus, postRequestStatus, putRequestStatus } from '../../../networkCalls/NetworkCalls';

interface User {
  user_id: number;
  username: string;
  user_first_name: string;
  user_middle_name?: string | null;
  user_last_name?: string | null;
  email: string;
  user_phone?: string | null;
  user_address?: string | null;
  role_id: number | null;
  is_active: boolean;
}

interface UserRole {
  role_id: number;
  role_name: string;
}

// Response structure for Add User API

interface AddUserResponse {
  status: number;
  message?: string;
  data: {
    user_id: number;
    user_first_name: string;
    user_middle_name?: string | null;
    user_last_name?: string | null;
    user_email: string;
    user_phone?: string | null;
    user_address?: string | null;
    role_id: number | null;
    is_active?: boolean;
  };
}


// Response structure for Update User API
interface UpdateUserResponse {
  status: string;
  data: {
    user_id: number;
  };
}


const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [roleId, setRoleId] = useState<number | null>(null);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);

  const [currentUser, setCurrentUser] = useState<{ user_id: number } | null>(null);
  const safe = (v: string | null | undefined) => v?.trim() || "";

 useEffect(() => {
  const userData = localStorage.getItem("USER_ID");
  if (userData) {
    try {
      // Try to parse JSON, if it fails assume it's just a number string
      const parsed = JSON.parse(userData);
      const userId = parsed?.user_id || parsed?.id || Number(userData);

      if (userId) {
        setCurrentUser({ user_id: userId });
      } else {
        console.warn("USER_ID missing or invalid:", userData);
      }
    } catch {
      // If it's not JSON, just use it directly
      setCurrentUser({ user_id: Number(userData) });
    }
  }
  loadUsers();
  loadRoles();
}, []);


  const loadUsers = async () => {
    setLoading(true);
    try {
      // const res = await axios.get(Api_url.getallusers);
      // const headers = await GetApiHeaders_token(); // ✅ add token
      let url = Api_url.getallusers
      // const headers = await GetApiHeaders_token(); 
    
    const res = await getRequestStatus<any>(url);
      console.log("📦 API Response Data:", res.data);

      setUsers(res?.data.data || []);
    } catch (err) {
      showError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      // const res = await axios.get(Api_url.getAllUserRoles);
      // const headers = await GetApiHeaders_token(); // ✅ add token
    // const res = await axios.get(Api_url.getAllUserRoles, { headers });
    const res = await getRequestStatus<any>(Api_url.getAllUserRoles);
    
      setRoles(res.data.data || []);
    } catch (err) {
      showError('Failed to load user roles');
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setFirstName('');
    setMiddleName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setRoleId(null);
    setIsModalOpen(true);
  };

const openEditModal = (user: User) => {
  console.log("🧠 Editing user:", user);

  setModalMode('edit');

  // Fill the modal inputs directly from backend fields
  setFirstName(user.user_first_name || '');
  setMiddleName(user.user_middle_name || '');
  setLastName(user.user_last_name || '');
  setEmail(user.email || ''); // backend uses `email`
  setPhone(user.user_phone || '');
  setAddress(user.user_address || '');
  setRoleId(user.role_id);

  setSelectedUser(user);
  setIsModalOpen(true);
};


const handleModalSubmit = async () => {
  // -------------------------
  // VALIDATION
  // -------------------------
  if (!firstName.trim()) {
    showWarn("First name is required");
    return;
  }

  if (modalMode === "add") {
    if (!email.trim()) {
      showWarn("Email is required");
      return;
    }

    if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,3}$/.test(
        email
      )
    ) {
      showWarn("Enter a valid email");
      return;
    }

    if (roleId === null || roleId === undefined) {
      showWarn("Please select a role");
      return;
    }
  }

  if (!currentUser) {
    showWarn("Current user not found");
    return;
  }

  // -------------------------
  // BUILD PAYLOAD
  // -------------------------
  const payload =
    modalMode === "add"
      ? {
          users: {
            user_first_name: safe(firstName),
            user_middle_name: safe(middleName),
            user_last_name: safe(lastName),
            user_email: email,
            user_phone: safe(phone),
            user_address: safe(address),
            role_id: roleId,
          },
          created_by: currentUser.user_id,
          is_active: true,
        }
      : {
          user_first_name: safe(firstName),
          user_middle_name: safe(middleName),
          user_last_name: safe(lastName),
          user_phone: safe(phone),
          user_address: safe(address),
          role_id: roleId,
          updated_by: currentUser.user_id,
        };

  console.log("🧩 Final Payload:", payload);

  try {
    // -------------------------
    // ADD USER
    // -------------------------
    if (modalMode === "add") {
      const res = await postRequestStatus(Api_url.CreateUser, payload);

      console.log("📥 Add user response:", res);

      if (res?.status === 200 || res?.status === 201) {
        showSuccess("User created successfully");
        setIsModalOpen(false);
        loadUsers();
      } else {
        showError(res?.message || "Failed to create user");
      }

      return;
    }

    // -------------------------
    // UPDATE USER
    // -------------------------
    if (modalMode === "edit" && selectedUser) {
      const res = await putRequestStatus(
        `${Api_url.UpdateUser}/${selectedUser.user_id}`,
        payload
      );

      console.log("📥 Update user response:", res);

      const updatedUserId = res?.data?.data?.user_id;

      if (!updatedUserId) {
        showError("Failed to update user. Bad API response.");
        return;
      }

      // Update user in local state (optional but useful)
      setUsers((prev) =>
        prev.map((u) =>
          u.user_id === selectedUser.user_id
            ? { ...u, ...payload, user_id: updatedUserId }
            : u
        )
      );

      showSuccess("User updated successfully");
      setIsModalOpen(false);
      loadUsers();
      return;
    }
  } catch (err: any) {
    console.error("❌ Error in modal submit:", err);
    showError(err?.response?.data?.message || "Something went wrong");
  }
};



  const deleteUser = (id: number) => {
    setUserToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete || !currentUser) return;
    try {
      // const headers = await GetApiHeaders_token(); // ✅ add token
// console.log("🪪 Headers being sent:", headers);

    await deleteRequestStatus(Api_url.DeleteUser, {
      data: { user_id: userToDelete, updated_by: currentUser.user_id }
      
    });
      showSuccess('User deleted successfully');
      loadUsers();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    `${u.username || ''} ${u.email || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roleOptions = [
    { value: null, label: 'No Role' },
    ...roles.map((r) => ({ value: r.role_id, label: r.role_name })),
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Users</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    <RingGradientLoader />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center p-4">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, i) => (
                  <tr key={u.user_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">{i + 1}</td>
                    {/* <td className="px-6 py-4 text-sm">{u.user_name || '-'}</td> */}
                    <td className="px-6 py-4 text-sm">
  {`${u.user_first_name || ''}  ${u.user_last_name || ''}`.trim() || '-'}
</td>

                    <td className="px-6 py-4 text-sm">{u.email}</td>
                    <td className="px-6 py-4 text-sm">
                      {roles.find((r) => r.role_id === u.role_id)?.role_name || 'No Role'}
                    </td>
                    <td className="px-6 py-4 text-sm">{u.is_active ? 'Active' : 'Inactive'}</td>
                    <td className="px-6 py-4 text-sm flex space-x-2">
                      <button onClick={() => openEditModal(u)} className="text-green-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteUser(u.user_id)} className="text-red-600">
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
      <h2 className="text-xl font-bold mb-4">
        {modalMode === 'add' ? 'Add User' : 'Edit User'}
      </h2>

      <div className="space-y-3">
        {/* First Name */}
        <div>
          <label className="block text-sm font-medium mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          
          <input
  className="w-full px-3 py-2 border rounded"
  placeholder="Enter first name"
  value={firstName}
  onChange={(e) => {
    const val = e.target.value;
    if (/^[A-Za-z\s]*$/.test(val)) {
      setFirstName(val);
    }
  }}
/>

        </div>

        {/* Middle Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Middle Name</label>
          <input
  className="w-full px-3 py-2 border rounded"
  placeholder="Enter middle name"
  value={middleName}
  onChange={(e) => {
    const val = e.target.value;
    if (/^[A-Za-z\s]*$/.test(val)) {
      setMiddleName(val);
    }
  }}
/>

        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
  className="w-full px-3 py-2 border rounded"
  placeholder="Enter last name"
  value={lastName}
  onChange={(e) => {
    const val = e.target.value;
    if (/^[A-Za-z\s]*$/.test(val)) {
      setLastName(val);
    }
  }}
/>

        </div>

        {/* Email — only for Add mode */}
        {modalMode === 'add' && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
         <input
  className="w-full px-3 py-2 border rounded"
  placeholder="Enter phone number"
  value={phone}
  onChange={(e) => {
    const val = e.target.value;

    // ❌ Block non-digits
    if (!/^\d*$/.test(val)) return;

    // ❌ Restrict max length = 10
    if (val.length > 10) return;

    setPhone(val);
  }}
/>

        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1">Address</label>
          <input
            className="w-full px-3 py-2 border rounded"
            placeholder="Enter address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Role <span className="text-red-500">*</span>
          </label>
          <Select
            options={roleOptions}
            value={roleOptions.find((r) => r.value === roleId)}
            onChange={(opt) => setRoleId(opt ? opt.value : null)}
            placeholder="Select role"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-5">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-4 py-2 bg-gray-300 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleModalSubmit}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          {modalMode === 'add' ? 'Add' : 'Update'}
        </button>
      </div>
    </div>
  </div>
)}


      {/* Confirm Delete Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-lg font-bold mb-4">
              Are you sure you want to delete this user?
            </h2>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 bg-gray-300 rounded">
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
