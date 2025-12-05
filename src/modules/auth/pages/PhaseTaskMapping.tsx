import React, { useEffect, useState } from "react";
import { Edit } from "lucide-react";
import {
  getRequestStatus,
  postRequestStatus,
  
} from "../../../networkCalls/NetworkCalls";
import { Api_url } from "../../../networkCalls/Apiurls";
import RingGradientLoader from "../../../components/RingGradientLoader";
import { showError, showSuccess, showWarn } from "../../../services/toasterService";

// -------------------------
// Interfaces
// -------------------------
interface Phase {
  phase_id: number;
  phase_name: string;
}

interface Task {
  task_id: number;
  task_name: string;
}

interface PhaseTaskMapping {
  phase_id: number;
  phase_name: string;
  tasks: Task[];
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetPhasesResponse = ApiResponse<Phase[]>;
type GetTasksResponse = ApiResponse<Task[]>;
type GetPhaseTaskMappingResponse = ApiResponse<PhaseTaskMapping[]>;
type MapPhaseToTasksResponse = ApiResponse<null>;

// -------------------------
// Component
// -------------------------
const PhaseTaskMapping: React.FC = () => {
  const [mappings, setMappings] = useState<PhaseTaskMapping[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPhaseId, setSelectedPhaseId] = useState<number | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<number[]>([]);

  // -------------------------
  // Load data
  // -------------------------
  useEffect(() => {
    fetchMappings();
    fetchTasks();
  }, []);

  const fetchMappings = async () => {
    setLoading(true);
    try {
      // const headers = await GetApiHeaders_token();
      const phasesRes = await getRequestStatus<GetPhasesResponse>(Api_url.getAllPhases);
      const mappedRes = await getRequestStatus<GetPhaseTaskMappingResponse>(Api_url.getSDLCPhasesWithTasks);

      const allPhases = phasesRes.data?.data || [];
      const mapped = mappedRes.data?.data || [];

      // Merge all phases with mapped tasks
      const merged = allPhases.map((phase) => {
        const found = mapped.find((m) => m.phase_id === phase.phase_id);
        return {
          phase_id: phase.phase_id,
          phase_name: phase.phase_name,
          tasks: found ? found.tasks : [],
        };
      });

      setMappings(merged);
    } catch (err: any) {
      showError(err?.response?.data?.message || "Failed to fetch phases or mappings");
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      // const headers = await GetApiHeaders_token();
      const res = await getRequestStatus<GetTasksResponse>(Api_url.getAllTasks);
      setTasks(res.data?.data || []);
    } catch (err) {
      showError("Failed to fetch tasks");
    }
  };

  // -------------------------
  // Modal handlers
  // -------------------------
  const openMappingModal = (phaseId: number) => {
    const existing = mappings.find((m) => m.phase_id === phaseId);
    setSelectedPhaseId(phaseId);
    setSelectedTaskIds(existing?.tasks.map((t) => t.task_id) || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedPhaseId) {
      showWarn("Select a phase");
      return;
    }
    if (selectedTaskIds.length === 0) {
      showWarn("Select at least one task");
      return;
    }

    try {
      // const headers = await GetApiHeaders_token();
      const payload = { phase_id: selectedPhaseId, task_ids: selectedTaskIds };
      const { status, data } = await postRequestStatus<MapPhaseToTasksResponse>(Api_url.mapPhaseToTasks, payload);

      if (status === 200 || status === 201) {
        showSuccess("Mapping saved successfully");
        setIsModalOpen(false);
        fetchMappings();
      } else {
        showError(data?.message || "Failed to save mappings");
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || "Failed to save mappings");
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Phase to Task Mapping</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        {loading ? (
          <p><RingGradientLoader /></p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-sm text-gray-600">Phase</th>
                <th className="text-left px-4 py-2 text-sm text-gray-600">Mapped Tasks</th>
                <th className="text-left px-4 py-2 text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((phase) => (
                <tr key={phase.phase_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 text-gray-800">{phase.phase_name}</td>
                  <td className="px-4 py-2 text-gray-700">
                    {phase.tasks.length ? (
                      <div className="flex flex-wrap gap-1">
                        {phase.tasks.map((task) => (
                          <span key={task.task_id} className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            {task.task_name}
                          </span>
                        ))}
                      </div>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => openMappingModal(phase.phase_id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4">Map Tasks to Phase</h2>

            <label className="block text-sm font-medium mb-2 text-gray-700">Select Tasks:</label>
            <div className="max-h-40 overflow-y-auto border rounded px-2 py-1 mb-4">
              {tasks.map((task) => (
                <label key={task.task_id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    value={task.task_id}
                    checked={selectedTaskIds.includes(task.task_id)}
                    onChange={(e) => {
                      const tid = task.task_id;
                      setSelectedTaskIds((prev) =>
                        e.target.checked ? [...prev, tid] : prev.filter((id) => id !== tid)
                      );
                    }}
                  />
                  <span>{task.task_name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhaseTaskMapping;
