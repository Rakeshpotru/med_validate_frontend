import React, { useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { getApiHeaders, getRequest, postRequest } from "../../networkCalls/NetworkCalls";
import { Api_url } from "../../networkCalls/Apiurls";
import { showError, showSuccess, showWarn } from "../../services/toasterService";
import { ToastContainer } from "react-toastify";
import { ToasterMessages } from "../../services/validationService";
import axios, { AxiosError } from "axios";

const getRoleId = (r: string) => {
  switch (r.toLowerCase()) {
    case "1.admin": return 1;
    case "2.editor": return 2;
    case "3.viewer": return 3;
    default: return 0;
  }
};

const BulkImport: React.FC = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editRow, setEditRow] = useState<any>({});
  const [showModal, setShowModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existingUsers, setExistingUsers] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [showExistModal, setShowExistModal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const rd = new FileReader();
    rd.onload = evt => {
      const wb = XLSX.read(new Uint8Array(evt.target?.result as ArrayBuffer), { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const j = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setRows(j);
    };
    rd.readAsArrayBuffer(f);
  };

  const validateEditRow = (row: any) => {
    const errors: Record<string, string> = {};
    if (!String(row["First Name"] || "").trim()) errors["First Name"] = "First name is required";
    if (!String(row["Last Name"] || "").trim()) errors["Last Name"] = "Last name is required";
    const email = String(row["Email"] || "").trim();
    if (!email) errors["Email"] = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors["Email"] = "Invalid email format";
    const phone = String(row["Phone"] || "").trim();
    if (!phone) errors["Phone"] = "Phone number is required";
    else if (!/^\d{10}$/.test(phone)) errors["Phone"] = "Phone must be exactly 10 digits";
    if (!String(row["User Role"] || "").trim()) errors["User Role"] = "User role is required";
    return errors;
  };

  const handleEdit = (i: number) => {
    const row = { ...rows[i] };
    const validationErrors = validateEditRow(row);
    setEditIdx(i);
    setEditRow(row);
    setErrors(validationErrors);
    setShowModal(true);
  };

  const handleSave = () => {
    const validationErrors = validateEditRow(editRow);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (editIdx != null) {
      const rs = [...rows];
      rs[editIdx] = editRow;
      setRows(rs);
      setShowModal(false);
      setEditIdx(null);
      setErrors({});
    }
  };

  const handleDelete = (i: number) => {
    setRows(r => r.filter((_, idx) => idx !== i));
  };

  const downloadExcel = async () => {
    alert('download started')
    try {
      const headers = await getApiHeaders();
      const res = await getRequest(Api_url.registerNewUsers, headers);
      // Check if the response is successful
      if (res.status === 200) {
        // Create a Blob from the Excel file data
        const blob = await res.blob();

        // Create a temporary URL for the file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "downloaded_file.xlsx";  // You can set a dynamic filename if needed

        // Trigger a click to start the download
        link.click();
      } else {
        showError(ToasterMessages.bulkRegistrationFailure);
      }
    } catch (error: any) {
      showError(ToasterMessages.bulkRegistrationFailure);
    } finally {
      setLoading(false);  // Stop loading indicator
    }
  }

const handleSubmit = useCallback(async () => {
  setLoading(true);

  const formatted = rows.map(r => ({
    user_first_name: r["First Name"] || "",
    user_middle_name: r["Middle Name"] || "",
    user_last_name: r["Last Name"] || "",
    user_email: r["Email"] || "",
    user_phone: String(r["Phone"] || ""),
    user_address: r["Address"] || "",
    role_id: getRoleId(r["User Role"] || "")
  }));

  try {
    const headers = await getApiHeaders();
    const res = await postRequest(
      Api_url.registerNewUsers,
      { users: formatted, created_by: 1, is_active: true },
      headers
    );

    const statusCode = (res as any)?.status_code;
    const createdUserIds = (res as any)?.data?.created_user_ids || [];
    const existing = (res as any)?.data?.existing_users || [];
    const validation = (res as any)?.data?.validation_errors || [];

    if (statusCode === 201) {
      if (createdUserIds.length > 0) {
        showSuccess(`${createdUserIds.length} user(s) registered successfully.`);
      }

      if (existing.length > 0 || validation.length > 0) {
        setExistingUsers(existing);
        setValidationErrors(validation);
        setSelectedUsers(
          formatted.filter(user =>
            !existing.some(e => e.user_email === user.user_email) &&
            !validation.some(v => v.user_email === user.user_email)
          )
        );
        setShowExistModal(true);
        showError(`${existing.length + validation.length} user(s) rejected.`);
      } else {
        navigate("/registrations");
      }

    } else if (statusCode === 409) {
      showError(ToasterMessages.userexist);
      setExistingUsers(existing);
      setValidationErrors(validation);
      setSelectedUsers([]);
      setShowExistModal(true);

    } else if (statusCode === 400) {
      showError(ToasterMessages.registrationFailure);

    } else if (statusCode === 422) {
      setExistingUsers(existing);
      setValidationErrors(validation);
      setSelectedUsers(
        formatted.filter(user =>
          !existing.some(e => e.user_email === user.user_email) &&
          !validation.some(v => v.user_email === user.user_email)
        )
      );
      setShowExistModal(true);

      let hasInvalidRole = false;

      const validationSummary = validation
        .map(v => {
          const errorMessages = v.errors.join(", ");
          if (v.errors.some((err: string) => err.includes("Invalid role_id"))) {
            hasInvalidRole = true;
          }
          return `✖ ${v.user_email}: ${errorMessages}`;
        })
        .join("\n");

      if (hasInvalidRole) {
        showError("Invalid role ID provided for one or more users.");
      } else {
        showError(
          `${existing.length + validation.length} user(s) rejected due to validation errors.\n\n${validationSummary}`
        );
      }

    } else {
      showWarn(`Unhandled Status Code: ${statusCode}`);
    }

  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;

      if (status === 422) {
        const res = err.response?.data;
        const validation = res?.data?.validation_errors || [];
        const existing = res?.data?.existing_users || [];

        setExistingUsers(existing);
        setValidationErrors(validation);
        setSelectedUsers(
          formatted.filter(user =>
            !existing.some(e => e.user_email === user.user_email) &&
            !validation.some(v => v.user_email === user.user_email)
          )
        );
        setShowExistModal(true);

        let hasInvalidRole = false;

        const validationSummary = validation
          .map((v: any) => {
            const errorMessages = v.errors.join(", ");
            if (v.errors.some((err: string) => err.includes("Invalid role_id"))) {
              hasInvalidRole = true;
            }
            return `✖ ${v.user_email}: ${errorMessages}`;
          })
          .join("\n");

        if (hasInvalidRole) {
          showError("Invalid role ID provided for one or more users.");
        } else {
          showError(
            `${existing.length + validation.length} user(s) rejected due to validation errors.\n\n${validationSummary}`
          );
        }

      } else {
        showError("Something went wrong. Please try again.");
      }
    } else {
      showError("Unknown error occurred.");
    }
  } finally {
    setLoading(false);
  }
}, [rows, navigate]);


  const handleProceed = async () => {
    // if (selectedUsers.length === 0) {
    setShowExistModal(false);
    navigate("/registrations");
    return;
    // }
    // setLoading(true);
    // try {
    //   const headers = await getApiHeaders();
    //   const res = await postRequest(Api_url.registerNewUsers, { users: selectedUsers, created_by: 1, is_active: true }, headers);
    //   const createdUserIds = res?.data?.created_user_ids || [];
    //   const existing = res?.data?.existing_users || [];
    //   const validation = res?.data?.validation_errors || [];
    //   if (createdUserIds.length > 0) {
    //     showSuccess(`${createdUserIds.length} user(s) registered successfully.`);
    //   }
    //   if (existing.length > 0 || validation.length > 0) {
    //     setExistingUsers(existing);
    //     setValidationErrors(validation);
    //     setSelectedUsers(selectedUsers.filter(user =>
    //       !existing.some(e => e.user_email === user.user_email) &&
    //       !validation.some(v => v.user_email === user.user_email)
    //     ));
    //   } else {
    //     setShowExistModal(false);
    //     navigate("/registrations");
    //   }
    // } catch (error: any) {
    //   showError(ToasterMessages.bulkRegistrationFailure);
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <div className="container bulk-container">
      <ToastContainer position="top-right" />
      {loading && (
        <div style={loaderOverlay}>
          <div className="spinner"></div>
        </div>
      )}
      <h2>User Management</h2>
      <h3>Bulk Import</h3>
      <div className="bg-background bulk-flex">
        <div style={{ width: "20%" }}>
          <input type="file" accept=".xlsx,.csv" ref={fileRef} onChange={loadFile} />
        </div>
        <div style={{ width: "50%" }}>
          <button className="btn download_btn" onClick={() => fileRef.current && (fileRef.current.value = "")}>
            <i className="fa fa-download" onClick={() => downloadExcel()} style={{ marginRight: "8px" }}></i>Download
          </button>
        </div>
        <div>
          <button className="btn secondary back-btn" onClick={() => navigate("/registrations")}>Back</button>
        </div>
      </div>
      {rows.length > 0 && (
        <div className="user-management-table">
          <table className="table">
            <thead>
              <tr>
                {Object.keys(rows[0]).map(k => <th key={k}>{k}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={idx}>
                  {Object.keys(r).map((k, i) => <td key={i}>{r[k]}</td>)}
                  <td>
                    <button className="btn" onClick={() => handleEdit(idx)}>Edit</button>
                    <button className="btn danger" onClick={() => handleDelete(idx)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="form-actions text-center width-100" style={{ marginTop: 18 }}>
            <button className="btn bluk-btn add-user" onClick={handleSubmit} disabled={loading}>Upload</button>
            <button className="btn bluk-btn bulk-bg" onClick={() => setRows([])} disabled={loading}>Cancel</button>
          </div>
        </div>
      )}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ fontWeight: "bold", marginBottom: "16px" }}>Edit Row</h3>
            {Object.keys(editRow).map(k => (
              <div key={k} style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontWeight: "500", marginBottom: "4px" }}>{k}</label>
                <input
                  type={k === "Phone" ? "tel" : "text"}
                  inputMode={k === "Phone" ? "numeric" : undefined}
                  maxLength={k === "Phone" ? 10 : undefined}
                  value={editRow[k]}
                  onChange={e => {
                    const val = k === "Phone" ? e.target.value.replace(/\D/g, "") : e.target.value;
                    setEditRow((prev: any) => ({ ...prev, [k]: val }));
                    setErrors(prev => ({ ...prev, [k]: "" }));
                  }}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: `1px solid ${errors[k] ? "red" : "#ccc"}`
                  }}
                />
                {errors[k] && (
                  <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
                    {errors[k]}
                  </div>
                )}
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                className="btn"
                onClick={handleSave}
                style={{
                  marginRight: "8px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px"
                }}
              >
                Save
              </button>
              <button
                className="btn"
                onClick={() => setShowModal(false)}
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px"
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showExistModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3>Rejected Users</h3>
            {(existingUsers.length > 0 || validationErrors.length > 0) && (
              <>
                {existingUsers.length > 0 && (
                  <>
                    <h4>Existing Users</h4>
                    <ul>
                      {existingUsers.map((user, idx) => (
                        <li key={idx}>{user.user_email} (Already exists)</li>
                      ))}
                    </ul>
                  </>
                )}
                {validationErrors.length > 0 && (
                  <>
                    <h4>Invalid Users</h4>
                    <ul>
                      {validationErrors.map((error, idx) => (
                        <li key={idx}>{error.user_email}: {error.errors.join(", ")}</li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
            {/* <h4>Proceed with Valid Users?</h4> */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button
                className="btn"
                onClick={handleProceed}
                style={{
                  marginRight: "8px",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px"
                }}
              >
                Ok
              </button>
              {/* <button
                className="btn"
                onClick={() => {
                  setShowExistModal(false);
                  navigate("/registrations");
                }}
                style={{
                  backgroundColor: "#6c757d",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: "4px"
                }}
              >
                Cancel
              </button> */}
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

export default BulkImport;