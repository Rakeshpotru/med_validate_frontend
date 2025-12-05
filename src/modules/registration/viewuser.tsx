import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApiHeaders, getRequest } from "../../networkCalls/NetworkCalls";
import { Api_url } from "../../networkCalls/Apiurls";
import { showError } from "../../services/toasterService";

const ViewUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const headers = await getApiHeaders();
        const urlWithId = `${Api_url.getAllUsers}?user_id=${id}`;
        const res = await getRequest(urlWithId, headers);
        console.log("API Response:", res);
        const parsed = typeof res === "string" ? JSON.parse(res) : res;
        setUser(parsed.data?.[0]);
      } catch (error) {
        console.error("Fetch User Error:", error);
        showError("Failed to fetch user details");
      }
    };

    fetchUser();
  }, [id]);

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500 text-lg">Loading user details...</div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">User Details</h2>
      <div className="space-y-3">
        <p><span className="font-semibold text-gray-600">User ID:</span> {user.user_id}</p>
        <p><span className="font-semibold text-gray-600">Name:</span> {user.user_first_name} {user.user_middle_name} {user.user_last_name}</p>
        <p><span className="font-semibold text-gray-600">Email:</span> {user.user_email}</p>
        <p><span className="font-semibold text-gray-600">Phone:</span> {user.user_phone}</p>
        <p><span className="font-semibold text-gray-600">Address:</span> {user.user_address}</p>
        <p><span className="font-semibold text-gray-600">User Role:</span> {user.role_name || "N/A"}</p>
      </div>
      <div className="mt-6">
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default ViewUser;