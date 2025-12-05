import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  CheckCircle,
  Hourglass,
  ClipboardList,
  Layers,
  TrendingUp,
  Search,
  ChevronDown,
  LayoutDashboard,
  Target,
  Activity,
  AlertCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp as TrendingUpIcon,
  Users,
  Calendar,
  Filter,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { Api_url } from "../networkCalls/Apiurls";
import { getRequestStatus } from "../networkCalls/NetworkCalls";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type PhaseSummary = {
  phase_name: string;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  my_tasks: number;
  other_tasks: number;
  my_pending_tasks: number;
  my_completed_tasks: number;
  other_pending_tasks: number;
  other_completed_tasks: number;
};

type Project = {
  project_id: number;
  project_name: string;
  total_phases: number;
  completed_phases: number;
  pending_phases: number;
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  my_tasks: number;
  other_tasks: number;
  my_pending_tasks: number;
  my_completed_tasks: number;
  other_pending_tasks: number;
  other_completed_tasks: number;
  completion_percent: number;
  phases_summary?: PhaseSummary[];
};

type ApiResponse = {
  status_code: number;
  message: string;
  data: { projects: Project[] };
};

const PHASE_COLORS = [
  { bg: "from-blue-500 to-blue-600", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  { bg: "from-purple-500 to-purple-600", light: "bg-purple-50", text: "text-purple-600", border: "border-purple-200" },
  { bg: "from-teal-500 to-teal-600", light: "bg-teal-50", text: "text-teal-600", border: "border-teal-200" },
  { bg: "from-indigo-500 to-indigo-600", light: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
  { bg: "from-cyan-500 to-cyan-600", light: "bg-cyan-50", text: "text-cyan-600", border: "border-cyan-200" },
];

// Chart configuration
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  animation: {
    duration: 1000,
    easing: 'easeInOutQuart' as const,
  },
};

// New feature: Export data function
const exportToCSV = (projects: Project[], projectId: string) => {
  const headers = [
    'Project Name',
    'Total Tasks',
    'Completed Tasks',
    'Pending Tasks',
    'My Tasks',
    'Other Tasks',
    'Completion %',
    'Total Phases',
    'Completed Phases'
  ];
  
  let data = projects;
  
  // If a specific project is selected, include phase details
  if (projectId !== "0") {
    const project = projects.find(p => String(p.project_id) === projectId);
    if (project && project.phases_summary) {
      // Add phase data
      project.phases_summary.forEach(phase => {
        data = [{
          ...project,
          project_name: `${project.project_name} - ${phase.phase_name}`,
          total_tasks: phase.total_tasks,
          completed_tasks: phase.completed_tasks,
          pending_tasks: phase.pending_tasks,
          my_tasks: phase.my_tasks,
          other_tasks: phase.other_tasks,
          completion_percent: phase.total_tasks > 0 ? (phase.completed_tasks / phase.total_tasks) * 100 : 0,
          total_phases: 1,
          completed_phases: phase.completed_tasks === phase.total_tasks ? 1 : 0,
        } as Project];
      });
    }
  }
  
  const csvContent = [
    headers.join(','),
    ...data.map(project => [
      `"${project.project_name}"`,
      project.total_tasks,
      project.completed_tasks,
      project.pending_tasks,
      project.my_tasks,
      project.other_tasks,
      project.completion_percent,
      project.total_phases,
      project.completed_phases
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `project-dashboard-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [userId] = useState("3");
  const [projectId, setProjectId] = useState("0");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [expandedProjectId, setExpandedProjectId] = useState<number | null>(null);
  const [chartData, setChartData] = useState<any>(null);
  const [showCharts, setShowCharts] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click - FIXED VERSION
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async (uId = userId, pId = projectId) => {
    setLoading(true);
    try {
      const url = Api_url.get_dashboard_data(uId, pId === "0" ? undefined : Number(pId));
      const { status, data }: { status: number; data: ApiResponse | null } = await getRequestStatus<ApiResponse>(url);

      if (status !== 200) {
        throw new Error(`Request failed: ${status}`);
      }

      const dataProjects: Project[] =
        data?.data?.projects && Array.isArray(data.data.projects)
          ? data.data.projects
          : [];
      setProjects(dataProjects);
      setAllProjects(dataProjects);
    } catch (err) {
      console.error("❌ Dashboard fetch error:", err);
      setProjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Prepare chart data when projects change
  useEffect(() => {
    if (projects.length > 0) {
      prepareChartData();
    }
  }, [projects, projectId]);

  const prepareChartData = () => {
    if (projectId === "0") {
      // All projects view - show aggregated data
      const projectNames = projects.map(p => p.project_name);
      const completionRates = projects.map(p => p.completion_percent);
      const completedTasks = projects.map(p => p.completed_tasks);
      const pendingTasks = projects.map(p => p.pending_tasks);
      const myTasks = projects.map(p => p.my_tasks);
      const otherTasks = projects.map(p => p.other_tasks);

      setChartData({
        completionTrend: {
          labels: projectNames,
          datasets: [
            {
              label: 'Completion %',
              data: completionRates,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.4,
            },
          ],
        },
        taskDistribution: {
          labels: projectNames,
          datasets: [
            {
              label: 'Completed Tasks',
              data: completedTasks,
              backgroundColor: 'rgba(34, 197, 94, 0.8)',
            },
            {
              label: 'Pending Tasks',
              data: pendingTasks,
              backgroundColor: 'rgba(249, 115, 22, 0.8)',
            },
          ],
        },
        taskOwnership: {
          labels: projectNames,
          datasets: [
            {
              label: 'My Tasks',
              data: myTasks,
              backgroundColor: 'rgba(59, 130, 246, 0.8)',
            },
            {
              label: 'Others Tasks',
              data: otherTasks,
              backgroundColor: 'rgba(168, 85, 247, 0.8)',
            },
          ],
        },
        overallProgress: {
          labels: ['Completed', 'Pending'],
          datasets: [
            {
              data: [totals.totalCompletedTasks, totals.totalPendingTasks],
              backgroundColor: [
                'rgba(34, 197, 94, 0.8)',
                'rgba(249, 115, 22, 0.8)',
              ],
              borderColor: [
                'rgb(34, 197, 94)',
                'rgb(249, 115, 22)',
              ],
              borderWidth: 2,
            },
          ],
        },
      });
    } else {
      // Single project view - show detailed phase data
      const project = projects.find(p => String(p.project_id) === projectId);
      if (project && project.phases_summary) {
        const phaseNames = project.phases_summary.map(p => p.phase_name);
        const phaseCompletion = project.phases_summary.map(p => 
          (p.completed_tasks / p.total_tasks) * 100
        );
        const myCompleted = project.phases_summary.map(p => p.my_completed_tasks);
        const otherCompleted = project.phases_summary.map(p => p.other_completed_tasks);
        const myPending = project.phases_summary.map(p => p.my_pending_tasks);
        const otherPending = project.phases_summary.map(p => p.other_pending_tasks);

        setChartData({
          completionTrend: {
            labels: phaseNames,
            datasets: [
              {
                label: 'Phase Completion %',
                data: phaseCompletion,
                borderColor: 'rgb(139, 92, 246)',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4,
              },
            ],
          },
          taskDistribution: {
            labels: phaseNames,
            datasets: [
              {
                label: 'Completed Tasks',
                data: project.phases_summary.map(p => p.completed_tasks),
                backgroundColor: 'rgba(34, 197, 94, 0.8)',
              },
              {
                label: 'Pending Tasks',
                data: project.phases_summary.map(p => p.pending_tasks),
                backgroundColor: 'rgba(249, 115, 22, 0.8)',
              },
            ],
          },
          taskOwnership: {
            labels: phaseNames,
            datasets: [
              {
                label: 'My Completed',
                data: myCompleted,
                backgroundColor: 'rgba(59, 130, 246, 0.8)',
              },
              {
                label: 'Others Completed',
                data: otherCompleted,
                backgroundColor: 'rgba(168, 85, 247, 0.8)',
              },
              {
                label: 'My Pending',
                data: myPending,
                backgroundColor: 'rgba(59, 130, 246, 0.4)',
              },
              {
                label: 'Others Pending',
                data: otherPending,
                backgroundColor: 'rgba(168, 85, 247, 0.4)',
              },
            ],
          },
          overallProgress: {
            labels: ['My Completed', 'My Pending', 'Others Completed', 'Others Pending'],
            datasets: [
              {
                data: [
                  project.my_completed_tasks,
                  project.my_pending_tasks,
                  project.other_completed_tasks,
                  project.other_pending_tasks
                ],
                backgroundColor: [
                  'rgba(59, 130, 246, 0.8)',
                  'rgba(59, 130, 246, 0.4)',
                  'rgba(168, 85, 247, 0.8)',
                  'rgba(168, 85, 247, 0.4)',
                ],
                borderColor: [
                  'rgb(59, 130, 246)',
                  'rgb(59, 130, 246)',
                  'rgb(168, 85, 247)',
                  'rgb(168, 85, 247)',
                ],
                borderWidth: 2,
              },
            ],
          },
        });
      }
    }
  };

  // NEW FEATURE: Filter projects by status
  const filteredProjects = useMemo(() => {
    if (statusFilter === "all") return projects;
    
    return projects.filter(project => {
      switch (statusFilter) {
        case "completed":
          return project.completion_percent === 100;
        case "in-progress":
          return project.completion_percent >= 70 && project.completion_percent < 100;
        case "active":
          return project.completion_percent >= 40 && project.completion_percent < 70;
        case "starting":
          return project.completion_percent < 40;
        default:
          return true;
      }
    });
  }, [projects, statusFilter]);

  const totals = useMemo(() => {
    const filtered = filteredProjects;
    const totalCompletedPhases = filtered.reduce((a, p) => a + (p.completed_phases || 0), 0);
    const totalPendingPhases = filtered.reduce((a, p) => a + (p.pending_phases || 0), 0);
    const totalCompletedTasks = filtered.reduce((a, p) => a + (p.completed_tasks || 0), 0);
    const totalPendingTasks = filtered.reduce((a, p) => a + (p.pending_tasks || 0), 0);
    const totalTasks = filtered.reduce((a, p) => a + (p.total_tasks || 0), 0);
    const myCompletedTasks = filtered.reduce((a, p) => a + (p.my_completed_tasks || 0), 0);
    const myPendingTasks = filtered.reduce((a, p) => a + (p.my_pending_tasks || 0), 0);
    const otherCompletedTasks = filtered.reduce((a, p) => a + (p.other_completed_tasks || 0), 0);
    const otherPendingTasks = filtered.reduce((a, p) => a + (p.other_pending_tasks || 0), 0);
    const avgCompletion =
      filtered.length > 0
        ? filtered.reduce((a, p) => a + (p.completion_percent || 0), 0) / filtered.length
        : 0;
    return {
      totalCompletedPhases,
      totalPendingPhases,
      totalCompletedTasks,
      totalPendingTasks,
      totalTasks,
      myCompletedTasks,
      myPendingTasks,
      otherCompletedTasks,
      otherPendingTasks,
      avgCompletion: Number(avgCompletion.toFixed(1)),
    };
  }, [filteredProjects]);

  const dropdownList = useMemo(() => {
    const q = projectSearch.trim().toLowerCase();
    return allProjects.filter((p) => (q ? p.project_name.toLowerCase().includes(q) : true));
  }, [allProjects, projectSearch]);

  const selectProject = (id: string) => {
    setProjectId(id);
    setDropdownOpen(false);
    setExpandedProjectId(null);
    fetchData(userId, id);
  };

  const toggleExpandProject = (id: number) =>
    setExpandedProjectId((prev) => (prev === id ? null : id));

  const getStatusColor = (percent: number) => {
    if (percent === 100) return "from-emerald-500 to-green-600";
    if (percent >= 70) return "from-blue-500 to-cyan-600";
    if (percent >= 40) return "from-amber-500 to-orange-600";
    return "from-rose-500 to-red-600";
  };

  const getStatusBadge = (percent: number) => {
    if (percent === 100) return { text: "Completed", class: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    if (percent >= 70) return { text: "In Progress", class: "bg-blue-100 text-blue-700 border-blue-200" };
    if (percent >= 40) return { text: "Active", class: "bg-amber-100 text-amber-700 border-amber-200" };
    return { text: "Starting", class: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 sticky top-0 z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                <LayoutDashboard className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Project Dashboard
                </h1>
                <p className="text-slate-600 mt-1">Real-time project tracking & analytics</p>
              </div>
            </div>
            
            {/* NEW: Control Buttons Group */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-sm font-medium hover:border-blue-400 hover:shadow-lg transition-all duration-200 w-full sm:w-40"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="active">Active</option>
                  <option value="starting">Starting</option>
                </select>
                <Filter className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>

              {/* Project Dropdown - FIXED */}
              <div className="relative w-full sm:w-64" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((s) => !s)}
                  className="flex items-center justify-between gap-3 px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-sm font-medium hover:border-blue-400 hover:shadow-lg transition-all duration-200 w-full"
                >
                  <span className="truncate">
                    {projectId === "0"
                      ? "All Projects"
                      : allProjects.find((p) => String(p.project_id) === projectId)?.project_name ||
                      "Select Project"}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                </button>
                
                {/* Dropdown Menu - FIXED positioning and z-index */}
                {dropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                        <Search className="w-4 h-4 text-white" />
                        <input
                          value={projectSearch}
                          onChange={(e) => setProjectSearch(e.target.value)}
                          placeholder="Search projects..."
                          className="w-full bg-transparent text-white placeholder-white/70 outline-none text-sm"
                        />
                      </div>
                    </div>
                    <div className="p-2 max-h-80 overflow-y-auto">
                      <div
                        className="px-4 py-3 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 cursor-pointer transition-colors"
                        onClick={() => selectProject("0")}
                      >
                        <div className="font-semibold text-slate-900">All Projects</div>
                        <div className="text-xs text-slate-500 mt-1">View combined analytics</div>
                      </div>
                      {dropdownList.map((p) => (
                        <div
                          key={p.project_id}
                          className="px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 cursor-pointer rounded-lg transition-colors"
                          onClick={() => selectProject(String(p.project_id))}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-slate-900">{p.project_name}</div>
                            <div
                              className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(p.completion_percent).class}`}
                            >
                              {p.completion_percent}%
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {p.completed_tasks}/{p.total_tasks} tasks completed
                          </div>
                        </div>
                      ))}
                      {dropdownList.length === 0 && (
                        <div className="p-6 text-center text-slate-500">No projects found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Toggle Charts */}
                <button
                  onClick={() => setShowCharts(!showCharts)}
                  className="p-3 border-2 border-slate-200 rounded-xl bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-200"
                  title={showCharts ? "Hide Charts" : "Show Charts"}
                >
                  {showCharts ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>

                {/* Export Data */}
                <button
                  onClick={() => exportToCSV(projects, projectId)}
                  className="p-3 border-2 border-slate-200 rounded-xl bg-white hover:border-green-400 hover:shadow-lg transition-all duration-200"
                  title="Export Data"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* Refresh */}
                <button
                  onClick={() => fetchData()}
                  disabled={refreshing}
                  className="px-5 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl hover:from-blue-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 font-medium flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Bar */}
        {!loading && filteredProjects.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <MetricPill
              icon={<ClipboardList className="w-4 h-4" />}
              value={totals.totalTasks}
              label="Total Tasks"
              color="blue"
            />
            <MetricPill
              icon={<CheckCircle className="w-4 h-4" />}
              value={totals.totalCompletedTasks}
              label="Completed"
              color="green"
            />
            <MetricPill
              icon={<Hourglass className="w-4 h-4" />}
              value={totals.totalPendingTasks}
              label="Pending"
              color="orange"
            />
            <MetricPill
              icon={<Layers className="w-4 h-4" />}
              value={totals.totalCompletedPhases + totals.totalPendingPhases}
              label="Total Phases"
              color="purple"
            />
            <MetricPill
              icon={<Users className="w-4 h-4" />}
              value={totals.myCompletedTasks + totals.myPendingTasks}
              label="My Tasks"
              color="indigo"
            />
            <MetricPill
              icon={<TrendingUp className="w-4 h-4" />}
              value={`${totals.avgCompletion}%`}
              label="Avg Progress"
              color="cyan"
            />
          </div>
        )}

        {/* NEW: Status Filter Info */}
        {statusFilter !== "all" && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                Showing {filteredProjects.length} projects filtered by {statusFilter.replace('-', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Charts Section - Now toggleable */}
        {!loading && filteredProjects.length > 0 && chartData && showCharts && (
          <div className="space-y-6">
            {/* Top Row Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Completion Trend */}
              <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    {projectId === "0" ? "Projects Completion Trend" : "Phase Completion Trend"}
                  </h3>
                </div>
                <div className="h-64">
                  <Line 
                    data={chartData.completionTrend} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          display: true,
                          text: 'Completion Progress',
                        },
                      },
                    }} 
                  />
                </div>
              </div>

              {/* Overall Progress Doughnut */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    {projectId === "0" ? "Task Distribution" : "Task Ownership"}
                  </h3>
                </div>
                <div className="h-64">
                  <Doughnut 
                    data={chartData.overallProgress} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          display: true,
                          text: 'Distribution',
                        },
                      },
                    }} 
                  />
                </div>
              </div>
            </div>

            {/* Bottom Row Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Distribution */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    {projectId === "0" ? "Tasks by Project" : "Tasks by Phase"}
                  </h3>
                </div>
                <div className="h-80">
                  <Bar 
                    data={chartData.taskDistribution} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          display: true,
                          text: 'Completed vs Pending Tasks',
                        },
                      },
                    }} 
                  />
                </div>
              </div>

              {/* Task Ownership */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-lg font-bold text-slate-900">
                    {projectId === "0" ? "Task Ownership" : "Detailed Task Breakdown"}
                  </h3>
                </div>
                <div className="h-80">
                  <Bar 
                    data={chartData.taskOwnership} 
                    options={{
                      ...chartOptions,
                      plugins: {
                        ...chartOptions.plugins,
                        title: {
                          display: true,
                          text: 'Task Assignment Details',
                        },
                      },
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
              <p className="text-slate-600 font-medium">Loading dashboard data...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-12 text-center">
            <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">
              {statusFilter !== "all" 
                ? `No projects found with status: ${statusFilter.replace('-', ' ')}`
                : "No project data available"
              }
            </p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <LayoutDashboard className="w-6 h-6 text-blue-600" />
                {projectId === "0" ? "All Projects" : "Project Details"}
                <span className="text-sm font-normal text-slate-500 ml-2">
                  ({filteredProjects.length} projects)
                </span>
              </h3>
              
              {/* Export button for project list */}
              <button
                onClick={() => exportToCSV(filteredProjects, projectId)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((proj) => {
                const status = getStatusBadge(proj.completion_percent);
                const isExpanded = expandedProjectId === proj.project_id;
                const color = getStatusColor(proj.completion_percent);
                
                return (
                  <div
                    key={proj.project_id}
                    className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-slate-900 text-sm leading-tight">{proj.project_name}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full border ${status.class}`}>
                        {proj.completion_percent}%
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Tasks:</span>
                        <span className="font-medium">{proj.completed_tasks}/{proj.total_tasks}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Phases:</span>
                        <span className="font-medium">{proj.completed_phases}/{proj.total_phases}</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>My Tasks:</span>
                        <span className="font-medium">{proj.my_tasks}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
                          style={{ width: `${proj.completion_percent}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpandProject(proj.project_id)}
                      className="w-full mt-3 px-3 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all duration-200"
                    >
                      {isExpanded ? "Hide Phases" : "View Phases"}
                    </button>

                    {isExpanded && proj.phases_summary && (
                      <div className="mt-4 pt-4 border-t border-slate-200 space-y-3">
                        {proj.phases_summary.map((phase, phaseIdx) => {
                          const phasePercent = phase.total_tasks > 0 ? (phase.completed_tasks / phase.total_tasks) * 100 : 0;
                          return (
                            <div key={phase.phase_name} className="text-xs">
                              <div className="flex justify-between mb-1">
                                <span className="font-medium text-slate-700">{phase.phase_name}</span>
                                <span className="text-slate-600">{phasePercent.toFixed(0)}%</span>
                              </div>
                              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-500 transition-all duration-500"
                                  style={{ width: `${phasePercent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Simplified Metric Pill Component */
const MetricPill = ({ icon, value, label, color }: any) => {
  const colorClasses = {
    blue: "bg-blue-500 text-white",
    green: "bg-emerald-500 text-white",
    orange: "bg-orange-500 text-white",
    purple: "bg-purple-500 text-white", 
    indigo: "bg-indigo-500 text-white",
    cyan: "bg-cyan-500 text-white",
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 p-4 text-center">
      <div className={`w-8 h-8 ${colorClasses[color]} rounded-lg flex items-center justify-center mx-auto mb-2`}>
        {icon}
      </div>
      <div className="text-xl font-bold text-slate-900">{value}</div>
      <div className="text-xs text-slate-600 mt-1">{label}</div>
    </div>
  );
};