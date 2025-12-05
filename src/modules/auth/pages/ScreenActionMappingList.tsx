import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Api_url } from "../../../networkCalls/Apiurls";
import RingGradientLoader from "../../../components/RingGradientLoader";
import {  getRequestStatus } from "../../../networkCalls/NetworkCalls";
import { showWarn } from "../../../services/toasterService";

interface ScreenAction {
  ActionId: number;
  ActionName: string;
  ScreenActionId: number;
}

interface ScreenMapping {
  ScreenId: number;
  ScreenName: string;
  actions: ScreenAction[];
}
interface Screen {
  ScreenId: number;
  ScreenName: string;
}

interface MergedScreenMapping {
  ScreenId: number;
  ScreenName: string;
  actions: ScreenAction[];
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetScreensResponse = ApiResponse<Screen[]>;
type GetMappingsResponse = ApiResponse<ScreenMapping[]>;


export const ScreenActionMappingList: React.FC = () => {
  const [screenMappings, setScreenMappings] = useState<ScreenMapping[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchMappings = async () => {
          try {
        // const headers = await GetApiHeaders_token();

        // Fetch screens and mappings concurrently (type-safe)
        const [screensRes, mappingsRes] = await Promise.all([
          getRequestStatus<GetScreensResponse>(Api_url.getAllScreens),
          getRequestStatus<GetMappingsResponse>(Api_url.ScreenActionMappingList),
        ]);

        const screensData = screensRes.data;
        const mappingsData = mappingsRes.data;

        if (
  !screensData ||
  !mappingsData ||
  screensData.status_code !== 200 ||
  mappingsData.status_code !== 200 ||
  !Array.isArray(screensData.data) ||
  !Array.isArray(mappingsData.data)
) {
  throw new Error("Invalid or null response from server");
}

        // Merge actions into each screen
        const merged: MergedScreenMapping[] = screensData.data.map((screen) => {
          const mapping = mappingsData.data.find((m) => m.ScreenId === screen.ScreenId);
          return {
            ...screen,
            actions: mapping?.actions ?? [],
          };
        });

        setScreenMappings(merged);
        setStatus("success");
      } catch (err) {
        console.error("Failed to fetch screen mappings:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
        setStatus("error");
        showWarn("Unable to load screen mappings. Please try again.", 5000);
      }
    };

    fetchMappings();
  }, []);


  // if (status === "loading") return <div className="p-4">Loading screen mappings...</div>;
   if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RingGradientLoader  />
      </div>
    );
  }
  if (status === "error") return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!screenMappings.length) return <div className="p-4 text-gray-500">No screens found.</div>;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Screen Action Mapping</h2>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Screen Name
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Actions Count
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {screenMappings.map((screen) => (
              <tr key={screen.ScreenId} className="hover:bg-gray-50">
                <td className="px-6 py-4">{screen.ScreenName}</td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {screen.actions?.length || 0} actions
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() =>
                      navigate(
                        `/security/screen-action-mapping/${screen.ScreenId}/${encodeURIComponent(
                          screen.ScreenName
                        )}`
                      )
                    }
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" />
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
