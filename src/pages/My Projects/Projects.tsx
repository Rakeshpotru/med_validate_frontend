import { useEffect, useMemo, useState, useRef } from "react";
import { useToast } from "../ui/toast";
import { ProjectsGrid } from "./ProjectsGrid";
import { ProjectsSearch } from "./ProjectSearch";
import RingGradientLoader from "../../components/RingGradientLoader";
import { Api_url } from "../../networkCalls/Apiurls";
import ProjectCreateWizard from "../CreateProjectWizard/ProjectCreateWizard";
import Button from "../ui/button";
import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { showWarn } from "../../services/toasterService";
import { getRequestStatus } from "../../networkCalls/NetworkCalls";
import { canCreateProject, canEditProjectDetails } from "../../services/permissionsService";

// ---------------- Project Types ----------------
interface Member {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface ProjectSummary {
  id: string;
  title: string;
  summary: string;
  status: string;
  status_id: number; // Added for precise edit disable check
  priority: string;
  startDate: string;
  endDate: string;
  phases: string[];
  progressPct: number;
  members: Member[];
  stats: {
    comments: number;
    tasks: number;
    attachments: number;
  };
}



// --- API Response Interfaces ---
interface ProjectApiItem {
  project_id: number;
  project_name: string;
  project_description: string;
  status_name: string;
  status_id: number; // Added to match API
  risk_assessment_name?: string;
  start_date?: string;
  end_date?: string;
  completed_percentage?: number;
  comments_count?: number;
  incident_count?: number;
  files_count?: number;
  users?: {
    user_id: number;
    user_name: string;
    user_image?: string;
  }[];
  phases?: {
    phase_code: string;
  }[];
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetProjectsResponse = ApiResponse<ProjectApiItem[]>;
export default function MyProjectsActive() {
  const [query, setQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(""); // Selected status filter
  const [items, setItems] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null)
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast, Toast } = useToast();
  const fetchedRef = useRef(false);

  // ---------------- Fetch projects ----------------
  const fetchProjects = async () => {
  if (fetchedRef.current) return;
  fetchedRef.current = true;

  setLoading(true);

  try {
    // const headers = await GetApiHeaders_token();
    const { status, data } = await getRequestStatus<GetProjectsResponse>(Api_url.new_get_all_projects);

    console.log("✅ project details", data);

    if (!data || data.status_code !== 200 || !Array.isArray(data.data)) {
      showWarn(data?.message || "Failed to load projects.", 5000);
      return;
    }

    const mapped: ProjectSummary[] = data.data.map((p: any) => ({
      id: `${p.project_id}`,
      title: p.project_name || " ",
      summary: p.project_description || " ",
      status: p.status_name || " ",
      status_id: p.status_id || 0, // Added: Map status_id for completed check
    priority: p.risk_assessment_name?.toLowerCase() ,
      startDate: p.start_date
          ? new Date(p.start_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric",year: "numeric", })
        : "N/A",
      endDate: p.end_date
          ? new Date(p.end_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" ,year: "numeric",})
        : "N/A",
        phases: Array.isArray(p.phases) ? p.phases.map((ph: any) => ph.phase_code) : [],
      progressPct: p.completed_percentage || 0,
      members: Array.isArray(p.users)
        ? p.users.slice(0, 5).map((u: any) => ({
            id: `u_${u.user_id}`,
            name: u.user_name,
            avatarUrl: u.user_image
              ? `/users_profile/${u.user_image}`
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.user_name)}&length=1`,
          }))
        : [],
        stats: { comments: p.comments_count ?? 0, tasks: p.incident_count ?? 0, attachments: p.files_count ?? 0 },
    }));

    setItems(mapped);
  } catch (error: any) {
    console.error("Error fetching projects:", error);
      // showWarn(error.message || "Internal server error. Please try again.", 5000);
  } finally {
    setLoading(false);
  }
};

  // ---------------- Initial fetch ----------------
  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    setWizardOpen(location.pathname === "/projects/create");
  }, [location.pathname]);

  // ---------------- Unique Statuses from items 👈 New: Compute unique statuses
  const uniqueStatuses = useMemo(() => {
    return [...new Set(items.map((item) => item.status).filter(Boolean))].sort();
  }, [items]);

  // ---------------- Filter ---------------- 👈 Updated to include status filter
  const filtered = useMemo(() => {
    let filteredItems = items;

    // Filter by status if selected
    if (selectedStatus) {
      filteredItems = filteredItems.filter((project) => project.status === selectedStatus);
    }

    // Filter by search query
    const q = query.trim().toLowerCase();
    if (!q) return filteredItems;
   return filteredItems.filter((project) => {
  const name = project.title?.toLowerCase() || "";
  return name.includes(q);
});

  }, [items, query, selectedStatus]);

  // ---------------- Handlers ----------------
  const onOpenProject = (id: string) => console.log("Open project:", id);

  const handleProjectCreationVal = (item: string) => {
    if (!canEditProjectDetails()) {
      showWarn("You don’t have permission to edit this project.", 3000);
      return;
    }
    setProjectId(item);
    setWizardOpen(true);
  };

const handleArchive = () => {
    fetchedRef.current = false;
    fetchProjects();
  };

  const onWizardComplete = (newProject: ProjectSummary) => {
    setItems((prev) => [newProject, ...prev]);
    setHighlightId(newProject.id);
    setTimeout(() => setHighlightId(null), 2000);
    setWizardOpen(false);
    setProjectId(null); // Clean up after complete
  };

  const handleNewProject = () => {
    setProjectId(null);
    if (canCreateProject()) setWizardOpen(true);
    else showWarn("You don’t have permission to create a project.", 3000);
  };

  const handleWizardClose = () => {
    setWizardOpen(false);
    if (!projectId) {
      setProjectId(null); // Ensure clean state
    }
  };

  // ---------------- Render ----------------
  return (
    <section className="grid gap-4">
      <div className="flex items-center justify-between gap-3">
        {/* 👈 Updated: Pass uniqueStatuses prop for dropdown binding */}
        <ProjectsSearch
          value={query}
          onChange={setQuery}
          onStatusChange={setSelectedStatus}
          statuses={uniqueStatuses} // 👈 New prop: binds actual status names from API data
        />
        <div className="flex gap-2">
          <Button
            onClick={handleNewProject}
            disabled={!canCreateProject()}
            className={`bg-[#1f3a9d] hover:bg-[#1f3a9d]/90 text-white flex items-center gap-2 cursor-pointer
              ${!canCreateProject() ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Plus className="h-4 w-4" />
            New Project
          </Button>

          {wizardOpen && (projectId ? canEditProjectDetails() : canCreateProject()) && (
            <ProjectCreateWizard
              projectId={projectId}
              open={wizardOpen}
              onOpenChange={(val) => setWizardOpen(val)}
              onComplete={() => {
                setWizardOpen(false);
                fetchedRef.current = false;
                fetchProjects();
              }}
              handleUrl={() => navigate("/projects")}
            />
          )}
        </div>
      </div>
      {/* 👈 Optional: Show current filters info */}
      {(query || selectedStatus) && (
        <div className="text-sm text-gray-600">
          {query && `Searching for "${query}"`}
          {selectedStatus && ` | Status: ${selectedStatus}`}
          {query && selectedStatus && ' | '}
          {` (${filtered.length} results)`}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <RingGradientLoader />
        </div>
      ) : filtered.length > 0 ? (
        <ProjectsGrid
          items={filtered.map((p) => ({
            ...p,
            summary:
              p.summary.length > 120
                ? p.summary.slice(0, 120) + "..."
                : p.summary,
          }))}
          loading={loading}
          onOpenProject={onOpenProject}
          highlightId={highlightId || undefined}
          handleProjectCreationVal={handleProjectCreationVal}
          onArchive={handleArchive}
        />
      ) : (
        <div className="text-center text-gray-500 py-10">No projects found.</div>
      )}

      <Toast />
    </section>
  );
}
