// ScreenActionRoleMappingList.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Api_url } from "../../../networkCalls/Apiurls";
import RingGradientLoader from "../../../components/RingGradientLoader";
import { showWarn } from "../../../services/toasterService";
import {  getRequestStatus } from "../../../networkCalls/NetworkCalls";


interface Role {
  role_id: number;
  role_name: string;
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetRolesResponse = ApiResponse<Role[]>;

export const ScreenActionRoleMappingList: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // Fetch all roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        // const headers = await GetApiHeaders_token();

        const { data } = await getRequestStatus<GetRolesResponse>(
          Api_url.getAllUserRoles
          
        );

        if (!data || data.status_code !== 200 || !Array.isArray(data.data)) {
          showWarn(data?.message || "Failed to load roles.", 4000);
          return;
        }

        setRoles(data.data);
      } catch (err) {
        console.error("❌ Error fetching roles:", err);
        showWarn("Unable to fetch roles. Please try again later.", 4000);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);
  // if (loading)
  //   return <div className="p-4 text-gray-600">Loading roles...</div>;
if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RingGradientLoader  />
      </div>
    );
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Screen Action Role Mapping
        </h2>
      </div>

      {/* Roles Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role Name
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.role_id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {role.role_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() =>
                      navigate(
                        `/security/screen-action-role-mapping/${role.role_id}/${encodeURIComponent(
                          role.role_name
                        )}`
                      )
                    }
                    className="cursor-pointer space-x-2 bg-[#0078e1] text-white px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
                  >
                    Configure
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
