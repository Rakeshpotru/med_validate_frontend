import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getApiHeaders, postRequest } from "../../networkCalls/NetworkCalls";
import { Api_url } from "../../networkCalls/Apiurls";
import { showError, showSuccess, showWarn } from "../../services/toasterService";
import { ToastContainer } from "react-toastify";
import { ToasterMessages } from "../../services/validationService";

const getRoleId = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin": return 1;
    case "editor": return 2;
    case "viewer": return 3;
    default: return 0;
  }
};

const AddUser: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstname: "", middlename: "", lastname: "", email: "", phone: "", address: "", role: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showExistModal, setShowExistModal] = useState(false);
  const [existingUser, setExistingUser] = useState<string | null>(null);

  const validate = useCallback(() => {
    const errs: Record<string, string> = {};
    const nameRx = /^[A-Za-z]{1,}$/;
    const emailRx = /^[\w.%+-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    const phoneRx = /^[6-9]\d{9}$/;

    if (!form.firstname.trim()) errs.firstname = "First name is required";
    else if (!nameRx.test(form.firstname)) errs.firstname = "First name should contain only letters and be at least 2 characters";
    if (!form.lastname.trim()) errs.lastname = "Last name is required";
    else if (!nameRx.test(form.lastname)) errs.lastname = "Last name should contain only letters and be at least 2 characters";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!emailRx.test(form.email)) errs.email = "Enter a valid email address";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!phoneRx.test(form.phone)) errs.phone = "Enter a valid 10-digit phone number starting with 6-9";
    if (!form.role.trim()) errs.role = "Please select a role";
    return errs;
  }, [form]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);

    try {
      const payload = {
        users: [{
          user_first_name: form.firstname,
          user_middle_name: form.middlename,
          user_last_name: form.lastname,
          user_email: form.email,
          user_phone: form.phone,
          user_address: form.address,
          role_id: getRoleId(form.role)
        }],
        created_by: 1,
        is_active: true
      };

      const headers = await getApiHeaders();
      const res = await postRequest(Api_url.registerNewUsers, payload, headers);

      const statusCode = res.status_code;
      console.log("data:", res);

      if (statusCode === 201) {
        showSuccess(ToasterMessages.registrationSuccess);
        setTimeout(() => navigate("/registrations"), 1500);
      } else if (statusCode === 409) {
        showError(ToasterMessages.userexist);
        const existingUser = res?.data?.data?.existing_users?.[0];
        if (existingUser) {
          setExistingUser(existingUser.user_email);
          setShowExistModal(true);
        }
      } else if (statusCode === 400) {
        showError(ToasterMessages.registrationFailure);
      } else {
        showWarn(`Unhandled Status Code: ${statusCode}`);
      }

    } catch (error: any) {
      console.error("Submit Error:", error);

      // 👉 Handle 422 Unprocessable Entity (Validation Error)
      if (error?.response?.status === 422) {
        const message = error.response.data?.message || ToasterMessages.validationError;
        showError(`422: ${message}`);
      } else {
        showError(ToasterMessages.connection_error);
      }

    } finally {
      setLoading(false);
    }
  }, [form, navigate, validate]);



  return (
    <div className="container form-container">
      <ToastContainer position="top-right" />
      {loading && (
        <div style={loaderOverlay}>
          <div className="spinner"></div>
        </div>
      )}
      <div className="login-card">
        <h3 className="heading-text">Add User</h3>
        <form onSubmit={handleSubmit} className="flex-dire-wrap">
          {["firstname", "middlename", "lastname", "email", "phone"].map(f => (
            <div className="mb-15 width-48" key={f}>
              <label className="text-label">{f}</label>
              <input
                className="input-registration"
                name={f}
                value={(form as any)[f]}
                onChange={e => setForm(prev => ({ ...prev, [f]: e.target.value }))}
                disabled={loading}
              />
              {errors[f] && <span className="error">{errors[f]}</span>}
            </div>
          ))}
          <div className="mb-15 width-48">
            <label className="text-label">Role</label>
            <select
              className="input-registration"
              name="role"
              value={form.role}
              onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
              disabled={loading}
            >
              <option value="">Select</option>
              <option>Admin</option><option>Editor</option><option>Viewer</option>
            </select>
            {errors.role && <span className="error">{errors.role}</span>}
          </div>
          <div className="mb-15 width-100">
            <label className="text-label">Address</label>
            <textarea
              className="width-100"
              name="address"
              value={form.address}
              onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
              disabled={loading}
            />
          </div>
          <div className="form-actions text-center width-100">
            <button type="submit" className="btn submit_btn sub-bg" disabled={loading}>Submit</button>
            <button type="button" className="btn submit_btn cancel-bg" onClick={() => navigate("/registrations")} disabled={loading}>Cancel</button>
          </div>
        </form>
      </div>
      {showExistModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Existing User</h3>
            <p>User with email <b style={{ color: "red" }}>{existingUser}</b>  already exists.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                className="btn"
                onClick={() => setShowExistModal(false)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const modalOverlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContent = {
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "10px",
  width: "400px",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
};

const loaderOverlay = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

export default AddUser;