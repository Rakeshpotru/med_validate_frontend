import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Api_url } from "../../../networkCalls/Apiurls";
import RingGradientLoader from "../../../components/RingGradientLoader";
import { showError, showSuccess, showWarn } from "../../../services/toasterService";
import {  getRequestStatus, postRequestStatus } from "../../../networkCalls/NetworkCalls";

interface Action {
  ScreenActionId: number;
  ActionName: string;
}

interface Screen {
  ScreenId: number;
  ScreenName: string;
  actions: Action[];
}

interface Role {
  role_id: number;
  role_name: string;
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetScreensResponse = ApiResponse<Screen[]>;
type GetRolesResponse = ApiResponse<Role[]>;
type GetRoleActionsResponse = ApiResponse<Screen[]>;

export const ScreenActionRoleMapping: React.FC = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.user_id || 1;

  const [roleName, setRoleName] = useState<string>("");
  const [screens, setScreens] = useState<Screen[]>([]);
  const [permissions, setPermissions] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  

  // Toggle checkbox permission
  const togglePermission = (id: number, value: boolean) => {
    setPermissions(prev => ({ ...prev, [id]: value }));
  };

  // Fetch role name
  useEffect(() => {
    if (!roleId) return;

    const fetchRoleName = async () => {
      try {
        // const headers = await GetApiHeaders_token();
        const { data } = await getRequestStatus<GetRolesResponse>(
          Api_url.getAllUserRoles
          
        );

        if (data && Array.isArray(data.data)) {
          const role = data.data.find((r) => r.role_id === Number(roleId));
          setRoleName(role?.role_name || `Role ${roleId}`);
        } else {
          setRoleName(`Role ${roleId}`);
        }
      } catch (err) {
        console.error(" Error fetching role name:", err);
        showWarn("Unable to fetch role name.", 4000);
        setRoleName(`Role ${roleId}`);
      }
    };

    fetchRoleName();
  }, [roleId]);
  // Fetch screens and role actions
  useEffect(() => {
    if (!roleId) return;

      const fetchData = async () => {
      try {
        // const headers = await GetApiHeaders_token();

        // Fetch all screens
        const screenRes = await getRequestStatus<GetScreensResponse>(
          Api_url.ScreenActionMappingList
          
        );
        const allScreens = Array.isArray(screenRes?.data?.data)
          ? screenRes.data.data
          : [];

        // Fetch role actions
        const roleRes = await postRequestStatus<GetRoleActionsResponse>(
          Api_url.getRoleScreenActionsByRoleId,
          { role_id: Number(roleId) }
          
        );

        const roleActions: number[] = Array.isArray(roleRes?.data?.data)
          ? roleRes.data.data.flatMap((screen: any) =>
              (screen.actions || []).map(
                (a: any) => a.ScreenActionId || a.Screen_Action_ID
              )
            )
          : [];

        setScreens(allScreens);

        const initialPermissions: Record<number, boolean> = {};
        allScreens.forEach((screen) => {
          screen.actions.forEach((action) => {
            initialPermissions[action.ScreenActionId] = roleActions.includes(
              action.ScreenActionId
            );
          });
        });

        setPermissions(initialPermissions);
      } catch (err) {
        console.error("Error fetching data:", err);
        showError("Failed to fetch screen or role data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roleId]);

  const handleSave = async () => {
    const selectedActions = Object.keys(permissions)
      .filter(id => permissions[+id])
      .map(Number);

    if (selectedActions.length === 0) {
      alert("Please select at least one action.");
      return;
    }

    const payload = {
      items: [
        {
          role_id: Number(roleId),
          screen_action_id: selectedActions,
          is_active: true,
          created_by: userId,
        },
      ],
    };

    try {
      setSaving(true);
      // const headers = await GetApiHeaders_token();

      const result = await postRequestStatus(
        Api_url.InsertRoleScreenActions,
        payload
      
      );

      if (result?.status === 200) {
        showSuccess("Role-screen-action mappings updated successfully!");
        navigate(-1);
      } else {
        showError("Failed to save mapping.");
      }
    } catch (err) {
      console.error("Error saving:", err);
      showError("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  // if (loading) return <div className="p-4">Loading screens...</div>;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RingGradientLoader  />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center space-x-4">
        {/* <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button> */}
        <h2 className="text-lg font-semibold text-green-600">
          Screen Action Role Mapping: {roleName || `Role ${roleId}`}
        </h2>
      </div>

      {/* Table */}
      <div className="p-6">
        {screens.length === 0 ? (
          <div className="text-gray-500">No screens found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-3 text-left text-sm font-medium text-gray-700">
                    SCREEN NAME
                  </th>
                  <th className="border px-4 py-3 text-left text-sm font-medium text-gray-700">
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {screens.map(screen => (
                  <tr key={screen.ScreenId}>
                    <td className="border px-4 py-3 bg-gray-50">{screen.ScreenName}</td>
                    <td className="border px-4 py-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {screen.actions.map(action => (
                          <label key={action.ScreenActionId} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={permissions[action.ScreenActionId] || false}
                              onChange={e => togglePermission(action.ScreenActionId, e.target.checked)}
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{action.ActionName}</span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Buttons */}
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={saving || Object.values(permissions).every(v => !v)}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "SAVE MAPPING"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
