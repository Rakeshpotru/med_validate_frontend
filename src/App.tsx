import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import './App.css';

import Dashboard from './pages/Dashboard';
import Works from './pages/Works';
import Projects from './pages/My Projects/Projects';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AppShell from './components/AppShell';
import IconRail from './components/IconRail';
import ProjectDetails from './pages/project/ProjectDetails';
import CommentsView from './pages/project/CommentsView';
import IncidentView from './pages/project/IncidentView';
import TaskDocumentView from './pages/project/TaskDocumentView';
import ProjectTaskEditor from './pages/project/Editor';
import TasksView from './pages/project/TasksView';

import UserLogin from './modules/home/pages/UserLogin';
import ForgotPwd from './modules/auth/pages/ForgotPwd';
import ChangePassword from './modules/auth/pages/ChangePassword';
import SecurityLayout from './modules/auth/pages/SecurityLayout';
import { ScreensList } from './modules/auth/pages/ScreensList';
import { ActionsManagement } from './modules/auth/pages/ActionManagement';
import { ScreenActionMappingList } from './modules/auth/pages/ScreenActionMappingList';
import { ScreenActionMapping } from './modules/auth/pages/ScreenActionMapping';
import { ScreenActionRoleMappingList } from './modules/auth/pages/ScreenActionRoleMappingList';
import { ScreenActionRoleMapping } from './modules/auth/pages/ScreenActionRoleMapping';

import LoginSuccess from './modules/home/pages/LoginSuccess';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProjectDetailsPage from './pages/project/ProjectDetailsPage';
import AccessGuard from './components/AccessGuard';
import AdminDashboard from './modules/auth/pages/AdminDashboard';
import DashboardLayout from './modules/auth/pages/AdminDashboard';
import UserRoles from './modules/auth/pages/userRoles';
import UserRegistration from './modules/auth/pages/UserRegistration';
import Equipments from './modules/auth/pages/Equipments';
import RiskAssessment from './modules/auth/pages/Risk-assessment';
import Status from './modules/auth/pages/Status';
import Tasks from './modules/auth/pages/Tasks';
import Phases from './modules/auth/pages/Phases';
import RiskPhaseMapping from './modules/auth/pages/RiskPhaseMapping';
import PhaseTaskMapping from './modules/auth/pages/PhaseTaskMapping';
import { loadPermissions } from "./services/permissionsService";
import WorkFlowStages from './modules/auth/pages/WorkFlowStages';
import WorkflowStagePhaseMapping from './modules/auth/pages/WorkFlowStagePhaseMap';
import ChangeRequestsAdmin from '../src/pages/ChangeRequest/ChangeRequestsPage';
import Templates from '../src/pages/Templates/Templates';



function App() {
  const storedUser = localStorage.getItem("USER_ID");
  const storedPermissions = localStorage.getItem("role_permissions");

  const [user, setUser] = useState<any>(storedUser ? JSON.parse(storedUser) : null);
  const [loginRolespermission, setLoginRolespermission] = useState<any>(
    storedPermissions ? JSON.parse(storedPermissions) : []
  );
   const [permissionsReady, setPermissionsReady] = useState(false);

  // 🔹 Load permissions globally on mount
   useEffect(() => {
    const initPermissions = async () => {
      try {
        const permissions = await loadPermissions(); // fetch from API only
        console.log("permissions for every screen",permissions);
        setLoginRolespermission(permissions);
      } finally {
        setPermissionsReady(true);
      }
    };
    // initPermissions();
  }, []);

 
  // const handleLogout = () => {
  //   localStorage.removeItem("role_permissions");
  //   localStorage.setItem("MANUAL_SSO", "true");
  //   localStorage.removeItem("TOKEN");
  //   localStorage.removeItem("temp_password_value");
  //   localStorage.removeItem("USER_ID");
  //   localStorage.removeItem("ROLE_ID");
  //   setUser(null);
  //   setLoginRolespermission([]);
  // };

  // ---------------- Public Layout ----------------
  const PublicLayout = () => <Outlet />;

  // ---------------- Protected Layout ----------------
  const ProtectedLayout = () => {
    const storedUser = localStorage.getItem("USER_ID");
    const token = localStorage.getItem("TOKEN");

    if (!storedUser || !token) return <Navigate to="/" replace />;

    return (
      <AppShell iconRail={<IconRail  />}>
        <Outlet />
      </AppShell>
    );
  };

  // ---------------- Login Wrapper ----------------
  const LoginWrapper = () => {
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem("TOKEN");
      const userId = localStorage.getItem("USER_ID");
      if (token && userId) navigate("/project/all", { replace: true });
    }, [navigate]);

    return (
      <UserLogin
        onLogin={(newUser, permissions) => {
          localStorage.setItem("USER_ID", newUser.id.toString());
          localStorage.setItem("role_permissions", JSON.stringify(permissions));
          setUser(newUser);
          setLoginRolespermission(permissions);
          navigate("project/all", { replace: true });
        }}
      />
    );
  };

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<LoginWrapper />} />
          <Route path="forgot-pwd" element={<ForgotPwd />} />
          <Route path="change-pwd" element={<ChangePassword />} />
          <Route
            path="login-success"
            element={
              <LoginSuccess
                onLogin={(newUser, permissions) => {
                  localStorage.setItem("USER_ID", newUser.id.toString());
                  localStorage.setItem("role_permissions", JSON.stringify(permissions));
                  setUser(newUser);
                  setLoginRolespermission(permissions);
                }}
              />
            }
          />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="works" element={<Works />} />
          {/* <Route path="projects" element={<Projects />} />
        <Route path="/projects/create" element={<Projects />} /> modal Screen for create project */}
        <Route
            path="projects"
            element={
              <AccessGuard screenName="Projects" permissions={loginRolespermission}>
                <Projects />
              </AccessGuard>
            }
          />
          <Route
            path="/projects/create"
            element={
              <AccessGuard screenName="Projects"  permissions={loginRolespermission}>
                <Projects />
              </AccessGuard>
            }
          />
          <Route 
  path="reports" 
  element={
    <AccessGuard screenName="Reports" permissions={loginRolespermission}>
      <Reports />
    </AccessGuard>
  } 
/>

          <Route path="settings" element={<Settings />} />
          {/* -------------------------------------------- */}
          {/* <Route path="changerequests" element={<ChangeRequestsAdmin />} /> */}
          <Route path="changerequests" element={<AccessGuard screenName="CR Approval" permissions={loginRolespermission}><ChangeRequestsAdmin /></AccessGuard>} />
          {/* -------------------------------------------- */}
          <Route path="templates" element={<AccessGuard screenName="Templates" permissions={loginRolespermission}><Templates /></AccessGuard>}/>
        <Route path="project_details_page/:id" element={<ProjectDetailsPage />} />

          {/* Project Routes */}
          <Route path="project/:id" element={<ProjectDetails />}>
            <Route index element={<Navigate to="tasks" replace />} />
            <Route path="tasks" element={<TasksView />} />
            <Route path="comments" element={<CommentsView projectId={0} userId={0} />} />
            <Route path="incident" element={<IncidentView />} />
          </Route>
          <Route path="task-documents/:taskId" element={<TaskDocumentView />} />
          <Route path="tasks/:taskId/document" element={<ProjectTaskEditor />} />
          {/* <Route path="project/all" element={<ProjectDetails />} /> */}
            <Route
  path="project/all"
  element={
    <AccessGuard screenName="Works" permissions={loginRolespermission}>
      <ProjectDetails />
    </AccessGuard>
  }
/>
          {/* Security Module */}
          {/* <Route path="security/*" element={<SecurityLayout />}> */}
          <Route 
  path="security/*" 
  element={
    <AccessGuard screenName="Security" permissions={loginRolespermission}>
      <SecurityLayout />
    </AccessGuard>
  }
>
            <Route index element={<Navigate to="/security/screens" replace />} />
            <Route path="screens" element={<ScreensList />} />
            <Route path="actions" element={<ActionsManagement />} />
            <Route path="screen-action-mapping" element={<ScreenActionMappingList />} />
            <Route path="screen-action-mapping/:screenId/:screenName" element={<ScreenActionMapping />} />
            <Route path="screen-action-role-mapping" element={<ScreenActionRoleMappingList />} />
            <Route path="screen-action-role-mapping/:roleId/:roleName" element={<ScreenActionRoleMapping />} />
          </Route>

{/* <Route path="/admindashboard" element={<DashboardLayout />}> */}
<Route 
  path="/admindashboard" 
  element={
    <AccessGuard screenName="Admin" permissions={loginRolespermission}>
      <DashboardLayout />
    </AccessGuard>
  }
>
  <Route index element={<Navigate to="userRole" replace />} />
  <Route path="userRole" element={<UserRoles />} />
  <Route path="userRegistration" element={<UserRegistration />} />
  <Route path="equipments" element={<Equipments />} />
  <Route path="risk-assessment" element={<RiskAssessment />} />
  <Route path="status" element={<Status />} />
  <Route path="tasks" element={<Tasks />} />
  <Route path="phases" element={<Phases />} />
  <Route path="riskphasemapping" element={<RiskPhaseMapping />} />
  <Route path="phasetaskmapping" element={<PhaseTaskMapping />} />
  <Route path="workflowstages" element={<WorkFlowStages />} />
  <Route path="workflowstagephasemap" element={<WorkflowStagePhaseMapping />} />

</Route>

        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />
    </>
  );
}

export default App;
