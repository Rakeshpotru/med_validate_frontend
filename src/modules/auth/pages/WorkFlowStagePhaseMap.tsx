import React, { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import RingGradientLoader from "../../../components/RingGradientLoader";
import { showError, showSuccess, showWarn } from "../../../services/toasterService";
import {  getRequestStatus, postRequestStatus } from "../../../networkCalls/NetworkCalls";
import { Api_url } from "../../../networkCalls/Apiurls";

interface Stage {
  stage_id: number;
  stage_name: string;
  order_id: number;
}

interface Phase {
  phase_id: number;
  phase_name: string;
}

interface StagePhaseMapping {
  stage_id: number;
  stage_name: string;
  phases: Phase[];
}

const WorkflowStagePhaseMapping: React.FC = () => {
  const [mappings, setMappings] = useState<StagePhaseMapping[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [selectedPhaseIds, setSelectedPhaseIds] = useState<number[]>([]);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = user?.user_id || 1;

  useEffect(() => {
        fetchData();
    fetchPhases();
  }, []);

    const fetchData = async () => {
  setLoading(true);
  try {
    // const headers = await GetApiHeaders_token();

    // Fetch stages
    const stagesRes = await getRequestStatus<any>(Api_url.getAllWorkFlowStages);
    const stagesArray = stagesRes.data?.data || [];
const allStages: Stage[] = stagesArray.map((s: any) => ({
  stage_id: s.work_flow_stage_id,
  stage_name: s.work_flow_stage_name,
  order_id: s.order_id || 0,
}));


    // Fetch stage-phase mappings
    const mappingRes = await getRequestStatus<any>(Api_url.getStagePhaseMappings);
    const mapped: StagePhaseMapping[] = mappingRes.data || [];

    const merged = allStages.map((stage) => {
      const found = mapped.find((m) => m.stage_id === stage.stage_id);
      return {
        stage_id: stage.stage_id,
        stage_name: stage.stage_name,
        phases: found?.phases || [],
      };
    });

    setMappings(merged);
            // }, 1500);

        } catch {
            showError("Failed to load workflow stages");
  } finally {
    setLoading(false);
  }
};


  const fetchPhases = async () => {
    try {
      // const headers = await GetApiHeaders_token();
      const res = await getRequestStatus<any>(Api_url.getAllPhases);
      setPhases(res.data?.data || []);
    } catch {
            showError("Failed to load phases");
    }
  };

  const openModal = (stageId: number) => {
    const existing = mappings.find((m) => m.stage_id === stageId);
    setSelectedStageId(stageId);
    setSelectedPhaseIds(existing?.phases.map((p) => p.phase_id) || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedStageId) return showWarn("Select a workflow stage");

    try {
      // const headers = await GetApiHeaders_token();
      const res = await postRequestStatus(Api_url.StagePhasesMapping, {
        stage_id: selectedStageId,
        phase_ids: selectedPhaseIds,
        user_id: userId,
      });

      if (res.status >= 200 && res.status < 300) {
        showSuccess(res.data?.message || "Mapping updated successfully");
        setIsModalOpen(false);
        fetchData();
            showSuccess("Mapping updated successfully");
      } else {
        showError(res.data?.message || "Failed to update mapping");
      }
    } catch (err: any) {
      showError(err?.message || "Failed to update mapping");
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Workflow Stage → Phase Mapping</h1>

      <div className="bg-white rounded-lg shadow-md p-4">
        {loading ? (
          <RingGradientLoader />
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-sm text-gray-600">Workflow Stage</th>
                <th className="text-left px-4 py-2 text-sm text-gray-600">Mapped Phases</th>
                <th className="text-left px-4 py-2 text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((stage) => (
                <tr key={stage.stage_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800">{stage.stage_name}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {stage.phases.length ? (
                      <div className="flex flex-wrap gap-1">
                        
                        {stage.phases.map((phase,index) => (
                          <span
                            key={`${phase.phase_id}-${index}`}
                            className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full"
                          >
                            {phase.phase_name}
                          </span>
                        ))}
                      </div>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => openModal(stage.stage_id)}
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Edit className="w-4 h-4 mr-1" /> Map
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4">Map Phases to Workflow Stage</h2>

            <div className="max-h-48 overflow-y-auto border rounded px-2 py-2 mb-4">
              {phases.map((phase) => (
                <label key={phase.phase_id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    value={phase.phase_id}
                    checked={selectedPhaseIds.includes(phase.phase_id)}
                    onChange={(e) => {
                      const pid = phase.phase_id;
                      setSelectedPhaseIds((prev) =>
                        e.target.checked ? [...prev, pid] : prev.filter((id) => id !== pid)
                      );
                    }}
                  />
                  <span>{phase.phase_name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowStagePhaseMapping;
