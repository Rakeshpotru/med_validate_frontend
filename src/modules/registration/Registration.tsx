import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getRequest, getApiHeaders, postRequest, deleteRequest } from "../../networkCalls/NetworkCalls";
import { Api_url } from "../../networkCalls/Apiurls";
import { showError, showSuccess } from "../../services/toasterService";
import { toast, ToastContainer, ToastContentProps } from "react-toastify";
import { ToasterMessages } from "../../services/validationService";

interface User {
  user_id: number;
  user_first_name: string;
  user_middle_name: string;
  user_last_name: string;
  user_email: string;
  user_address: string;
}

const Registrations: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      const headers = await getApiHeaders();
      console.log(Api_url.getAllUsers, 'Api_url.getAllUsers')
      const res = await getRequest(Api_url.getAllUsers, headers);
      const parsed = typeof res === "string" ? JSON.parse(res) : res;
      setUsers(parsed.data ?? []);
    } catch {
      showError("Failed to fetch users");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const confirmDelete = (id: number, name: string) => {
    toast(({ closeToast }: ToastContentProps) => (
      <div>
        <p>Delete <strong>{name}</strong>?</p>
        <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
          <button onClick={async () => {
            try {
              const headers = await getApiHeaders();
              await deleteRequest(Api_url.deleteUser(id), headers);
              setUsers(u => u.filter(x => x.user_id !== id));
              showSuccess(ToasterMessages.userDeleteSuccess);
            } catch {
              showError(ToasterMessages.userDeleteFailed);
            }
            closeToast?.();
          }} className="btn danger">Yes</button>
          <button onClick={() => closeToast?.()} className="btn secondary">No</button>
        </div>
      </div>
    ), { autoClose: false });
  };

  return (
    <div className="container">
      <ToastContainer position="top-right" />
      <h2>User Registration</h2>
      <div className="action-bar">
        <button className="btn primary bluk-btn bulk-bg" onClick={() => navigate("/bulkimport")}>Bulk Import</button>
        <button className="btn bluk-btn bulk-bg" onClick={() => navigate("/Adduser")}>Add User</button>
      </div>
      <div className="user-management-table">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td>
                <td>{`${u.user_first_name} ${u.user_middle_name} ${u.user_last_name}`}</td>
                <td>{u.user_email}</td>
                <td>{u.user_address}</td>
                <td>
                  <button
                    className="btn custom-viewedit margin-btn view-bg"  
                    onClick={() => navigate(`/ViewUser/${u.user_id}`)}
                  >
                    View
                  </button>                  <button className="btn custom-viewedit margin-btn edit-bg">Edit</button>
                  <button className="btn custom-viewedit danger delete-bg" onClick={() => confirmDelete(u.user_id, u.user_first_name)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


const thStyle = {
  border: "1px solid black",
  padding: "8px",
  backgroundColor: "#e0f7fa",
};

const tdStyle = {
  border: "1px solid black",
  padding: "8px",
};

const actionBtn = {
  padding: "6px 12px",
  backgroundColor: "#6c757d",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

export default Registrations;