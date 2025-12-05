import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Api_url } from "../../../networkCalls/Apiurls";
import RingGradientLoader from "../../../components/RingGradientLoader";
import { showSuccess, showWarn } from "../../../services/toasterService";
import {  getRequestStatus, postRequestStatus } from "../../../networkCalls/NetworkCalls";

interface Action {
  ActionId: number;
  ActionName: string;
}


interface ScreenActionMapping {
  ScreenId: number;
  ScreenName: string;
  actions: Action[];
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetActionsResponse = ApiResponse<Action[]>;
type GetMappingsResponse = ApiResponse<ScreenActionMapping[]>;

interface InsertMappingPayload {
  items: {
    screen_id: number;
    action_ids: number[];
    is_active: boolean;
    created_by: number;
  }[];
}

export const ScreenActionMapping: React.FC = () => {
  const { screenId, screenName } = useParams<{ screenId: string; screenName: string }>();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.user_id || 1;

  const [actions, setActions] = useState<Action[]>([]);
  const [permissions, setPermissions] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ✅ Fetch actions + existing mappings
 useEffect(() => {
    const fetchData = async () => {
      try {
        // const headers = await GetApiHeaders_token();

        const [actionsRes, mappingsRes] = await Promise.all([
          getRequestStatus<GetActionsResponse>(Api_url.getAllActions),
          getRequestStatus<GetMappingsResponse>(Api_url.ScreenActionMappingList),
        ]);

        const actionsData = actionsRes.data;
        const mappingsData = mappingsRes.data;

        if (
          !actionsData ||
          !mappingsData ||
          actionsData.status_code !== 200 ||
          mappingsData.status_code !== 200 ||
          !Array.isArray(actionsData.data) ||
          !Array.isArray(mappingsData.data)
        ) {
          throw new Error("Invalid API response format");
        }

        // Extract all actions
        const allActions: Action[] = actionsData.data;
        setActions(allActions);

        // Find current screen mapping
        const screenMapping = mappingsData.data.find(
          (m) => m.ScreenId === Number(screenId)
        );

        const mappedActionIds = screenMapping?.actions.map((a) => a.ActionId) ?? [];

        // Build permissions object
        const initialPermissions: Record<number, boolean> = {};
        allActions.forEach((action) => {
          initialPermissions[action.ActionId] = mappedActionIds.includes(action.ActionId);
        });

        setPermissions(initialPermissions);
      } catch (err) {
        console.error(" Error fetching mappings:", err);
        showWarn("Failed to load screen mappings. Please try again later.", 4000);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [screenId]);

  // ✅ Save mapping
  const handleSave = async () => {
    const selectedActions = Object.keys(permissions)
      .filter((id) => permissions[+id])
      .map(Number);

    if (selectedActions.length === 0) {
      showWarn("Please select at least one action.");
      return;
    }

    const payload = {
      items: [
        {
          screen_id: Number(screenId),
          action_ids: selectedActions,
          is_active: true,
          created_by: userId,
        },
      ],
    };

    try {
      setSaving(true);
      // const headers = await GetApiHeaders_token();
      const response = await postRequestStatus<ApiResponse<null>>(
        Api_url.ScreenActionMappingInsert,
        payload
        
      );

      if (response?.data?.status_code === 200) {
        showSuccess(" Screen-action mappings updated successfully!");
        navigate(-1);
      } else {
        showWarn(response?.data?.message || "Failed to save mappings.");
      }
    } catch (err) {
      console.error(" Error saving mappings:", err);
      showWarn("An unexpected error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };
  // if (loading) return <div className="p-4">Loading actions...</div>;
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RingGradientLoader  />
      </div>
    );
  }
  const columns = Array.from({ length: 4 }, (_, i) =>
    actions.slice((i * actions.length) / 4, ((i + 1) * actions.length) / 4)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center space-x-4">
        {/* <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
        </button> */}
        <h2 className="text-lg font-semibold text-green-600">
          Screen Action Mapping: {decodeURIComponent(screenName || "")}
        </h2>
      </div>

      {/* Table */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-4 py-3 text-left text-sm font-medium text-gray-700">
                  SCREEN NAME
                </th>
                <th className="border px-4 py-3 text-center text-sm font-medium text-gray-700">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-6 bg-gray-50">
                  <div className="text-sm font-medium text-gray-900">
                    {decodeURIComponent(screenName || "")}
                  </div>
                </td>
                <td className="border px-6 py-4">
                  <div className="grid grid-cols-4 gap-8">
                    {columns.map((col, idx) => (
                      <div key={idx} className="space-y-3">
                        {col.map((action) => (
                          <label key={action.ActionId} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={permissions[action.ActionId] || false}
                              onChange={(e) =>
                                setPermissions((prev) => ({
                                  ...prev,
                                  [action.ActionId]: e.target.checked,
                                }))
                              }
                              className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="text-sm text-gray-700">{action.ActionName}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            CANCEL
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
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
