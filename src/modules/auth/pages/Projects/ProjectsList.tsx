import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, Calendar, AlertCircle } from 'lucide-react';
import {  getRequestStatus } from '../../../../networkCalls/NetworkCalls';
import { Api_url } from '../../../../networkCalls/Apiurls';
import CreateProject from './CreateProject';

export interface Project {
  project_id: number;
  project_name: string;
  description: string;
  created_by: number;
  created_at: string;
  created_date?: string;
  risk_assessment_id: number;
  risk_assessment_name?: string;
  equipment_id: number;
  status: 'active' | 'completed' | 'on-hold';
  status_id?: number;
  project_status?: string;
}

export interface RiskAssessment {
  risk_assessment_name: string;
}

interface ProjectApiResponse {
  project_id: number;
  project_name: string;
  project_description: string;
  created_date: string;
  risk_assessment_id: number;
  risk_assessment_name: string;
  equipment_id: number;
  status_name: string;
  status_id: number;
}

interface ProjectListProps {
  onViewProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

interface Action {
  action_id: number;
  action_name: string;
}

interface Screen {
  screen_id: number;
  screen_name: string;
  actions: Action[];
}

const ProjectList: React.FC<ProjectListProps> = ({ onViewProject, onDeleteProject }) => {
  const [projectList, setProjectList] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<Screen[]>([]);
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  // Load user + permissions from localStorage
  useEffect(() => {
    // const storedUser = localStorage.getItem('currentUser');
    // if (storedUser) {
    //   const parsedUser = JSON.parse(storedUser);
    //   setUserId(parsedUser.id || null);

    // }

    // const storedPermissions = localStorage.getItem('role_permissions');
    // if (storedPermissions) {
    //   setPermissions(JSON.parse(storedPermissions));
    //   setPermissionsLoaded(true);
    // }
    handleInitialData()
  }, []);



 const handleInitialData = async()=>{
 const storedUser =  localStorage.getItem('currentUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser.id || null);
    // fetchProjects()
    }

    const storedPermissions =  localStorage.getItem('role_permissions');
    console.warn("++storedPermissions",storedPermissions)
    if (storedPermissions) {
      setPermissions(JSON.parse(storedPermissions));
      setPermissionsLoaded(true);
    }
  }
    useEffect(() => {
    if (userId && permissions)  {
      console.warn("++Venkat_intil_userId",userId)
      console.warn("++Venkat_permissions",permissions)
      fetchProjects();
      }
  }, [userId,permissions]);

  // ✅ Helpers
  const hasScreenAccess = (screenName: string) =>
    permissions.some((s) => s.screen_name.toLowerCase() === screenName.toLowerCase());

  const hasActionAccess = (screenName: string, actionName: string) => {
    
    if (!permissionsLoaded) return false; // not loaded yet
  console.warn("++Venkat_permissions",permissions)

  const screen = permissions.find((s) => s.screen_name.toLowerCase() === screenName.toLowerCase());
  console.warn("++Venkat",screen)

  return screen?.actions.some( (a) => a.action_name.toLowerCase() === actionName.toLowerCase() ) || false;
  };

  // Fetch projects
  const fetchProjects = async () => {
    if (!userId) {
      console.error('User ID not found in local storage');
      setProjectList([]);
      setStatuses([]);
      setRiskAssessments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // const headers = await getApiHeaders();

      if (!hasScreenAccess('Projects')) {
        console.warn('⛔ No access to Projects screen');
        setProjectList([]);
        setStatuses([]);
        setRiskAssessments([]);
        setLoading(false);
        return;
      }

      // Decide endpoint based on permission
      let url = Api_url.Projects_by_user_id(userId);
      if (hasActionAccess('Projects', 'Get All Projects')) {
        url = Api_url.getAllProjects;
      }

      const projectsRes = await getRequestStatus(url);
      const parsedProjects = typeof projectsRes === 'string' ? JSON.parse(projectsRes) : projectsRes;
      const projectsData: ProjectApiResponse[] = Array.isArray(parsedProjects.data) ? parsedProjects.data : [];

      const mappedProjects: Project[] = projectsData.map((p) => ({
        project_id: p.project_id,
        project_name: p.project_name,
        description: p.project_description,
        created_by: userId!,
        created_at: p.created_date,
        created_date: p.created_date,
        risk_assessment_id: p.risk_assessment_id,
        risk_assessment_name: p.risk_assessment_name || '',
        equipment_id: p.equipment_id,
        status: (p.status_name || '').toLowerCase() as 'active' | 'completed' | 'on-hold',
        status_id: p.status_id,
        project_status: p.status_name || '',
      }));

      setProjectList(mappedProjects);

      // Fetch all statuses
      const statusRes = await getRequestStatus(Api_url.getAllStatus);
      const parsedStatuses = typeof statusRes === 'string' ? JSON.parse(statusRes) : statusRes;
      const statusData: string[] = Array.isArray(parsedStatuses.data)
        ? parsedStatuses.data.map((s: any) => s.status_name || '')
        : [];

      setStatuses(statusData.filter(Boolean));

      // Fetch all risk assessments
      const riskRes = await getRequestStatus(Api_url.getAllRiskAssessments);
      const parsedRisks = typeof riskRes === 'string' ? JSON.parse(riskRes) : riskRes;
      const riskData: RiskAssessment[] = Array.isArray(parsedRisks.data)
        ? parsedRisks.data.map((r: any) => ({ risk_assessment_name: r.risk_assessment_name || '' }))
        : [];

      setRiskAssessments(riskData.filter((r) => r.risk_assessment_name));

    } catch (err) {
      console.error('Error fetching data:', err);
      setProjectList([]);
      setStatuses([]);
      setRiskAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (userId) fetchProjects();
  // }, [userId]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return projectList.filter((project) => {
      const name = project.project_name || '';
      const desc = project.description || '';
      const status = project.project_status || '';
      const risk = project.risk_assessment_name || '';

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        desc.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || status.toLowerCase() === statusFilter.toLowerCase();
      const matchesRisk = riskFilter === 'all' || risk.toLowerCase() === riskFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesRisk;
    });
  }, [projectList, searchTerm, statusFilter, riskFilter]);

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="text-center py-12">Loading projects...</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Projects</h1>

        {/* Show button if user has Create action */}
        {permissionsLoaded && (
  <button
    onClick={() => setShowCreateProject(true)}
    disabled={!hasActionAccess('Projects', 'New Project')}
    className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors
      ${hasActionAccess('Projects', 'New Project') 
        ? 'bg-blue-600 text-white hover:bg-blue-700' 
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
  >
    <Plus className="h-5 w-5" />
    <span>New Project</span>
  </button>
)}
        {showCreateProject && (
          <CreateProject
            onClose={() => setShowCreateProject(false)}
            onSave={fetchProjects}
          />
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Status</option>
              {statuses.map((s) => (
                <option key={s} value={(s || '').toLowerCase()}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">All Risk</option>
              {riskAssessments.map((r) => (
                <option key={r.risk_assessment_name} value={(r.risk_assessment_name || '').toLowerCase()}>
                  {r.risk_assessment_name} Risk
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Project Cards */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.project_id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => onViewProject(project.project_id.toString())}
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                {project.project_name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{project.description}</p>
              <div className="flex items-center space-x-2 mb-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                    project.risk_assessment_name || ''
                  )}`}
                >
                  {project.risk_assessment_name} Risk
                </span>
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {project.project_status}
                </span>
              </div>
              <div className="text-sm text-gray-500 mt-4 flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(project.created_date || project.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default ProjectList;