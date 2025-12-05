import React, { Fragment, useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Nav from "../modules/home/pages/Nav";
import ProjectsRouter from "../modules/auth/pages/Projects/ProjectRouter";
import ProjectTasks from "../modules/auth/pages/Projects/ProjectTasks";
import CreateProject from "../modules/auth/pages/Projects/CreateProject";
import UserLogin from "../modules/home/pages/UserLogin";
import DashboardLayout from "../modules/auth/pages/AdminDashboard";
import Equipments from "../modules/auth/pages/Equipments";
import UserRoles from "../modules/auth/pages/userRoles";
import Status from "../modules/auth/pages/Status";
import Tasks from "../modules/auth/pages/Tasks";
import Phases from "../modules/auth/pages/Phases";
import RiskPhaseMapping from "../modules/auth/pages/RiskPhaseMapping";
import RiskAssessment from "../modules/auth/pages/Risk-assessment";
import PhaseTaskMapping from "../modules/auth/pages/PhaseTaskMapping";
import UserRegistration from "../modules/auth/pages/UserRegistration";
import ProjectTaskEditor from "../modules/auth/pages/Projects/ProjectTaskEditor";
import SecurityLayout from "../modules/auth/pages/SecurityLayout";
import { ActionsManagement } from "../modules/auth/pages/ActionManagement";
import { ScreensList } from "../modules/auth/pages/ScreensList";
import { ScreenActionMappingList } from "../modules/auth/pages/ScreenActionMappingList";
import { ScreenActionMapping } from "../modules/auth/pages/ScreenActionMapping";
import { ScreenActionRoleMappingList } from "../modules/auth/pages/ScreenActionRoleMappingList";
import { ScreenActionRoleMapping } from "../modules/auth/pages/ScreenActionRoleMapping";
import AccessGuard from "../modules/auth/pages/Projects/AccessGuard";
import IncidentReport from '../modules/auth/pages/IncidentReports';
import ForgotPwd from "../modules/auth/pages/ForgotPwd";
import ChangePassword from "../modules/auth/pages/ChangePassword";
import LoginSuccess from "../modules/home/pages/LoginSuccess";

const AppRouter = () => {
  // State for current user and their role permissions
  // const [user, setUser] = useState<any>(null);
  // const [loginRolespermission, setLoginRolespermission] = useState<any>([]);

  // useEffect(() => {
  //   // Load existing user & permissions from localStorage on mount
  //   const storedUser = localStorage.getItem("currentUser");
  //   const storedPermissions = localStorage.getItem("role_permissions");

  //   if (storedUser) setUser(JSON.parse(storedUser));
  //   if (storedPermissions) setLoginRolespermission(JSON.parse(storedPermissions));
  // }, []);
    const storedUser = localStorage.getItem("currentUser");
    const storedPermissions = localStorage.getItem("role_permissions");

    const [user, setUser] = useState<any>(storedUser ? JSON.parse(storedUser) : null);
    const [loginRolespermission, setLoginRolespermission] = useState<any>(storedPermissions ? JSON.parse(storedPermissions) : []);

  const handleLogout = () => {
    // Clear state and localStorage on logout
    localStorage.removeItem("currentUser");
    localStorage.removeItem("role_permissions");
    localStorage.setItem("MANUAL_SSO", "true");

    setUser(null);
    setLoginRolespermission([]);
  };

  return (
    <Fragment>
      {user && <Nav user={user} onLogout={handleLogout} />}

      <Routes>
        {/* Login */}
        <Route path="/forgot-pwd" element={<ForgotPwd />} />
        <Route path="/change-pwd" element={<ChangePassword />} />
        <Route
          path="/"
          element={
            user ? (
              <Navigate to="/projectslist" />
            ) : (
              <UserLogin
                onLogin={(newUser, permissions) => {
                  setUser(newUser);
                  setLoginRolespermission(permissions);
                }}
              />
            )
          }
        />
         <Route
          path="/login-success"
          element={
            <LoginSuccess
              onLogin={(newUser, permissions) => {
                setUser(newUser);
                setLoginRolespermission(permissions);
              }}
            />
          }
        />
        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <AccessGuard screenName="Dashboard" permissions={loginRolespermission}>
                <DashboardLayout />
              </AccessGuard>
            ) : (
              <Navigate to="/" />
            )
          }
        >
          <Route index element={<Navigate to="userRole" replace />} />
          <Route path="equipments" element={<Equipments />} />
          <Route path="risk-assessment" element={<RiskAssessment />} />
          <Route path="userRole" element={<UserRoles />} />
          <Route path="status" element={<Status />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="phases" element={<Phases />} />
          <Route path="riskphasemapping" element={<RiskPhaseMapping />} />
          <Route path="phasetaskmapping" element={<PhaseTaskMapping />} />
          <Route path="userRegistration" element={<UserRegistration />} />
        </Route>

        {/* Security */}
        <Route
          path="/security"
          element={
            user ? (
              <AccessGuard screenName="Security" permissions={loginRolespermission}>
                <SecurityLayout />
              </AccessGuard>
            ) : (
              <Navigate to="/" />
            )
          }
        >
          <Route index element={<Navigate to="screens" replace />} />
          <Route path="screens" element={<ScreensList />} />
          <Route path="actions" element={<ActionsManagement />} />
          <Route path="screen-action-mapping" element={<ScreenActionMappingList />} />
          <Route path="screen-action-mapping/:screenId/:screenName" element={<ScreenActionMapping />} />
          <Route path="screen-action-role-mapping" element={<ScreenActionRoleMappingList />} />
          <Route path="screen-action-role-mapping/:roleId/:roleName" element={<ScreenActionRoleMapping />} />
        </Route>

        {/* Projects */}
        <Route
          path="/projectslist"
          element={
            user ? (
              <AccessGuard screenName="Projects" permissions={loginRolespermission}>
                <ProjectsRouter />
              </AccessGuard>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/projects/:projectId"
          element={
            user ? (
              <AccessGuard screenName="Projects" permissions={loginRolespermission}>
                <ProjectsRouter />
              </AccessGuard>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/project_tasks"
          element={
            user ? (
              <AccessGuard screenName="Tasks" permissions={loginRolespermission}>
                <ProjectTasks />
              </AccessGuard>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/createproject"
          element={
            user?.role === "Admin" ? (
              <AccessGuard screenName="Projects" permissions={loginRolespermission}>
                <CreateProject />
              </AccessGuard>
            ) : (
              <Navigate to="/projectslist" />
            )
          }
        />

        <Route
          path="/task/:taskId"
          element={
            user ? (
              <AccessGuard screenName="Tasks" permissions={loginRolespermission}>
                <ProjectTaskEditor />
              </AccessGuard>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
  path="/incident-reports"
  element={
    user ? (
      <AccessGuard screenName="Incident Reports" permissions={loginRolespermission}>
        <IncidentReport />
      </AccessGuard>
    ) : (
      <Navigate to="/" replace />
    )
  }
/>

        <Route path="*" element={<Navigate to={user ? "/projectslist" : "/"} />} />
      </Routes>
    </Fragment>
  );
};

const RouterWrapper = () => (
  <BrowserRouter>
    <AppRouter />
  </BrowserRouter>
);

export default RouterWrapper;
