import { useEffect, useState, useMemo } from "react";
import { MoreVertical, X } from "lucide-react";
import { Input } from "../../components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../../components/ui/button";
import RingGradientLoader from "../../components/RingGradientLoader";
import { Api_url } from "../../networkCalls/Apiurls";
import { showSuccess, showError } from "../../services/toasterService";
import RenderUiTemplate from "../../../public/RenderUi_Template";
import {
  getRequestStatus,
  postRequestStatus,
} from "../../networkCalls/NetworkCalls";

interface Incident {
  id: number;
  incident_report_id: number;
  project_name: string;
  phase_name: string;
  task_name: string;
  raise_comment: string;
  raised_date: string;
  resolve_comment: string;
  is_resolved: boolean;
  raised_by_user_id: number;
  assigned_to_user_id: number;
  raised_by_username: string;
  status: string;
  latest_json: any;
  can_edit: boolean;
}

interface IncidentProps {
  projectId: number;
  userId: number;
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetIncidentsResponse = ApiResponse<[]>;

const IncidentView: React.FC<IncidentProps> = ({ projectId, userId }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [curUser, setCurUser] = useState<any>([])
  const [filterType, setFilterType] = useState<
    "All" | "raisedByMe" | "raisedAgainstMe"
  >("All");
  const [searchText, setSearchText] = useState("");

  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const currentuserId = localStorage.getItem("USER_ID");
  const [selected, setSelected] = useState<any>(null)
  const [weightage, setWeightage] = useState<number | null>(null);

  // --- Prevent scroll when modal open ---
  useEffect(() => {
    document.body.style.overflow = selectedIncident ? "hidden" : "";
  }, [selectedIncident]);

  // ---- Fetch Incident Reports ----
  useEffect(() => {
    fetchIncidents();
  }, [projectId, userId]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);

      const { status, data } = await getRequestStatus<GetIncidentsResponse>(
        Api_url.fetch_incident_reports({
          user_id: Number(currentuserId),
          project_id: Number(projectId)
        })
      );

      const newData = data?.data || [];
      setIncidents(newData);
    } catch (err: any) {
      setError(err.message || "Error fetching incidents");
    } finally {
      setLoading(false);
    }
  };

  // ---- Weightage Change Handler ----
  const handleWeightageChange = (total: number) => {
    setWeightage(total || null);
  };

  // ---- Submit Handler ----
  const handleincidentSubmit = async (formData: any) => {
    try {
      setLoading(true);

      const payload = {
        incident_report_id: selected.incident_report_id,
        project_task_id: selected.task_id,
        raised_by: userId,
        document: formData,
      };
      const response = await postRequestStatus<any>(
        Api_url.raise_incident_report,
        payload,
        { "Content-Type": "application/json" }
      );

      if (response.status === 200) {
        showSuccess("Incident reported successfully.");
        setSelectedIncident(null);
        setWeightage(null);
        setSelected(null);
        setLoading(false);
        fetchIncidents()
      } else {
        showError(response.data || "Failed to Report Incident.");
      }
    } catch (err: any) {
      showError(err.message);
    }
  };

  // ---- Filter Incidents ----
  const filteredIncidents = useMemo(() => {
    let filtered = [...incidents];

    if (filterType === "raisedByMe") {
      filtered = filtered.filter((i) => i.raised_by_user_id === userId);
    } else if (filterType === "raisedAgainstMe") {
      filtered = filtered.filter((i) => i.assigned_to_user_id === userId);
    }

    if (searchText) {
      const s = searchText.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.project_name.toLowerCase().includes(s) ||
          i.phase_name.toLowerCase().includes(s) ||
          i.raise_comment.toLowerCase().includes(s)
      );
    }

    return filtered;
  }, [incidents, searchText, filterType, userId]);

  // ---- Main Content ----
  const content = loading ? (
    <RingGradientLoader />
  ) : error ? (
    <div className="p-8 text-center text-gray-700 font-semibold">{error}</div>
  ) : filteredIncidents.length === 0 ? (
    <div className="p-8 text-center text-gray-500 font-medium">
      No incidents found!
    </div>
  ) : (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredIncidents.map((incident, index) => (
        <motion.div
          key={incident.incident_report_id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="relative bg-white rounded-lg border border-gray-200 hover:border-[#112de4] p-4 space-y-3 hover:shadow-lg hover:scale-105 transition-all duration-300">

            {/* Status */}
            <div className="absolute top-3 right-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${incident.status === "Active"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
                  }`}
              >
                {incident.status}
              </span>
            </div>

            <h3 className="font-semibold text-gray-900 text-lg">
              Incident #{incident.incident_report_id}
            </h3>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>Project:</strong> {incident.project_name}
              </p>
              <p>
                <strong>Phase:</strong> {incident.phase_name}
              </p>
              <p>
                <strong>Task:</strong> {incident.task_name}
              </p>
              <p>
                <strong>Raised By:</strong> {incident.raised_by_username}
              </p>
              <p>
                <strong>Raised:</strong>{" "}
                {new Date(incident.raised_date).toLocaleString()}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => {
                  let parsed = incident.latest_json;

                  if (typeof parsed === "string") {
                    try {
                      parsed = JSON.parse(parsed);
                    } catch (e) {
                      console.error("Invalid JSON:", e);
                    }
                  }
                  setSelected(incident)
                  setSelectedIncident(parsed);
                }}
                style={{ backgroundColor: "#1d69bf", color: "#fff" }}
              >
                Open
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  // ---- JSX RETURN ----
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <h3 className="text-lg font-semibold">
          Incidents ({loading ? "..." : filteredIncidents.length})
        </h3>

        <div className="flex items-center gap-2">
          <Input
            placeholder="Search incidents..."
            className="h-8 w-48"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value as "All" | "raisedByMe" | "raisedAgainstMe"
              )
            }
            className="h-8 rounded border px-3 text-sm"
          >
            <option value="All">All</option>
            <option value="raisedByMe">Raised by me</option>
            <option value="raisedAgainstMe">Raised against me</option>
          </select>

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {content}

      {/* Modal */}
      <AnimatePresence>
        {selectedIncident && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-[#000000b5] bg-opacity-50 z-50"
          >
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Form</h2>

                <button onClick={() => setSelectedIncident(null)}>
                  <X className="w-5 h-5 text-gray-500 hover:text-black" />
                </button>
              </div>

              <RenderUiTemplate
                formSchema={selectedIncident}
                buttonMode={selected?.can_edit === true ? 1 : 3}
                onWeightageChange={handleWeightageChange}
                onSubmit={(formData) => handleincidentSubmit(formData)}
                can_edit={selected?.can_edit}
              />

              {weightage !== null && (
                <div className="mt-6 bg-gray-100 p-4 rounded-md">
                  <h3 className="font-semibold text-[#1d69bf] text-lg">
                    Total Weightage Received: {weightage}
                  </h3>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IncidentView;
