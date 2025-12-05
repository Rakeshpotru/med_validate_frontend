const DOC_API_URL = "https://4845fa19-57cb-4b75-904e-84cca17f184d-00-tiobbeycoxyg.worf.replit.dev/";
import { AppConfig } from "../config";
import { login } from "../services/adminService";


export const Api_url = {
  getDocsApi: `${DOC_API_URL}/document`,
  getAllUsers: `${AppConfig.baseURL}/users/getusers`,
  registerNewUsers: `${AppConfig.baseURL}/users/registeruser`,
  login : `${AppConfig.baseURL}/login`,
  deleteUser: (userId: number | string) => `${AppConfig.baseURL}/users/deleteuser/${userId}`,

  
  // changePassword:   `${BASE_API_URL}/change-password`,
  // changePassword: (token: string | null) => `${AppConfig.baseURL}/change-password?token=${token}`,

  changePassword: `${AppConfig.baseURL}/change-password`,

   // Forgot password endpoints
  forgotPassword: `${AppConfig.baseURL}/forgot-password`,
  verifyOtp: `${AppConfig.baseURL}/verify-otp`,
  resetPassword: `${AppConfig.baseURL}/reset-password`,

  // master api endpoints
  getAllUserRoles: `${AppConfig.baseURL}/master/getAllUserRoles`,
  createUserRole: `${AppConfig.baseURL}/master/createUserRole`,
  updateUserRole: `${AppConfig.baseURL}/master/updateUserRole`,
  deleteUserRole: `${AppConfig.baseURL}/master/deleteUserRole`,
  getAllStatus: `${AppConfig.baseURL}/master/getAllStatus`,
  createStatus: `${AppConfig.baseURL}/master/createStatus`,
  updateStatus: `${AppConfig.baseURL}/master/updateStatus`,
  deleteStatus: `${AppConfig.baseURL}/master/deleteStatus`,
  getAllTasks: `${AppConfig.baseURL}/master/getAllTasks`,
  createTask: `${AppConfig.baseURL}/master/createTask`,
  updateTask: `${AppConfig.baseURL}/master/updateTask`,
  deleteTask: `${AppConfig.baseURL}/master/deleteTask`,
  getAllPhases: `${AppConfig.baseURL}/master/getAllPhases`,
  createPhase: `${AppConfig.baseURL}/master/createPhase`,
  updatePhase: `${AppConfig.baseURL}/master/updatePhase`,
  deletePhase: `${AppConfig.baseURL}/master/deletePhase`,
  getAllMappedRisksWithPhases: `${AppConfig.baseURL}/master/getAllMappedRisksWithPhases`,
  mapRiskToPhases: `${AppConfig.baseURL}/master/mapRiskToPhases`,
  getAllRiskAssessments: `${AppConfig.baseURL}/master/getAllRiskAssessments`,
  getAllTestingAssetTypes: `${AppConfig.baseURL}/master/getAllTestingAssetTypes`,

  getAllWorkFlowStages: `${AppConfig.baseURL}/master/getAllstages`,
  CreateWorkFlowStages: `${AppConfig.baseURL}/master/addWorkFlowStage`,
  UpdareWorkFlowStages: (id: number) => `${AppConfig.baseURL}/master/updateWorkFlowStage/${id}`,
  DeleteWorkFlowStages: (id: number) => `${AppConfig.baseURL}/master/deleteWorkFlowStage/${id}`,
  getStagePhaseMappings: `${AppConfig.baseURL}/master/GetworkFlowStagePhaseMapping`,
  StagePhasesMapping: `${AppConfig.baseURL}/master/map-phases/`,


  
  getAllEquipments: `${AppConfig.baseURL}/master/equipments`,
  createEquipment: `${AppConfig.baseURL}/master/create-equipments`,
  updateEquipment: (id: number | string) => `${AppConfig.baseURL}/master/update-equipments/${id}`,
  deleteEquipment: (id: number | string) => `${AppConfig.baseURL}/master/delete-equipments/${id}`,

  getSDLCPhasesWithTasks: `${AppConfig.baseURL}/master/getSDLCPhasesWithTasks`,
  mapPhaseToTasks: `${AppConfig.baseURL}/master/mapPhaseToTasks`,
  
  createRiskAssessment: `${AppConfig.baseURL}/master/createRiskAssessment`,
  updateRiskAssessment: `${AppConfig.baseURL}/master/updateRiskAssessment`,
  deleteRiskAssessment: `${AppConfig.baseURL}/master/deleteRiskAssessment`,

  getAllProjects: `${AppConfig.baseURL}/transaction/getallprojects`,
  Projects_by_user_id: (userId: number | string) => `${AppConfig.baseURL}/transaction/projects_by_user_id/${userId}`,
  getProjectDetails: (projectId: number | string) =>`${AppConfig.baseURL}/transaction/project-details/${projectId}`,
  createProject: `${AppConfig.baseURL}/transaction/createProject`,
  getUsers: `${AppConfig.baseURL}/transaction/getallusers`,
  
  map_Project_phase_users:`${AppConfig.baseURL}/transaction/mapUsersToPhase`,
  map_Project_task_users: `${AppConfig.baseURL}/transaction/mapUsersToTask`,
  getUsersByPhaseId: (phaseId: number | string) => `${AppConfig.baseURL}/transaction/GetUsersByProjectPhaseId/${phaseId}`,
  getUsersByTaskId: (taskId: number | string) => `${AppConfig.baseURL}/transaction/GetUsersByTaskId/${taskId}`,

  // Login : `${AppConfig.baseURL}/user/login`,
  Login: `${AppConfig.baseURL}/auth/login`,
   LoginSSO: `${AppConfig.baseURL}/auth/okta-sso`,
     OktaLogout: `${AppConfig.baseURL}/auth/okta/logout`,

  // getAllProjectTasks: `${AppConfig.baseURL}/transaction/getalltasks`,
  // getProjectTasks_by_user_id: (userId: number | string) => `${AppConfig.baseURL}/transaction/GetTasksByUserId/${userId}`,
  pro_getalltasks: `${AppConfig.baseURL}/transaction/getalltasks`,
  pro_gettasksByUser: (userId: number | string) => `${AppConfig.baseURL}/transaction/GetTasksByUserId/${userId}`,
 
  getUsersByProjectPhaseId: (phaseId: number | string) => `${AppConfig.baseURL}/transaction/GetUsersByProjectPhaseId/${phaseId}`,
  getUsersByProjectTaskId: (taskId: number | string) => `${AppConfig.baseURL}/transaction/GetUsersByProjectTaskId/${taskId}`,
  mapUsersToPhase: () => `${AppConfig.baseURL}/transaction/mapUsersToPhase`,
  mapUsersToTask: () => `${AppConfig.baseURL}/transaction/mapUsersToTask`,
  transferProjectPhaseOwnership: () => `${AppConfig.baseURL}/transaction/TransferProjectPhaseOwnership`,
  transferProjectTaskOwnership: () => `${AppConfig.baseURL}/transaction/TransferProjectTaskOwnership`,
  updateProjectTaskStatusForTaskWorkLog: () => `${AppConfig.baseURL}/transaction/updateProjectTaskStatusForTaskWorkLog`,

  getallusers: `${AppConfig.baseURL}/transaction/getallusers`,
  // CreateUser: `${AppConfig.baseURL}/transaction/CreateUser`,
  CreateUser: `${AppConfig.baseURL}/users/NewCreateUser`,            // POST create user
  UpdateUser: `${AppConfig.baseURL}/users/NewUpdateUser`,
    GetUserById: `${AppConfig.baseURL}/users/getUserById`,
      UploadUserImage: `${AppConfig.baseURL}/users`,
        // DeleteUserImage: "http://127.0.0.1:8024/api/users",
        DeleteUserImage: `${AppConfig.baseURL}/users`,



  // UpdateUser: `${AppConfig.baseURL}/transaction/UpdateUser`,
  DeleteUser: `${AppConfig.baseURL}/transaction/DeleteUser`,

  save_task_documnet: `${AppConfig.baseURL}/docs/saveProjectTaskDocument`,
  // get_task_document: (project_task_id: number | string) => `${AppConfig.baseURL}/docs/GetDocumentByProjectTaskId/${project_task_id}`,
    pro_Get_document_by_taskid: (project_task_id: number | string) => `${AppConfig.baseURL}/docs/GetDocumentByProjectTaskId/${project_task_id}`,
  EvidenceUploadFromEditor: `${AppConfig.baseURL}/transaction/UploadFilesFromEditor`,
  GetEvidenceFileToEditor: `${AppConfig.baseURL}/transaction/GetEditorUploadedFile`,
  Get_commentsby_taskid: (task_id: number | string) => `${AppConfig.baseURL}/transaction/GetCommentsByTask/${task_id}`,
  GetPhaseDocumentsByProjectTaskId: (project_task_id: number) => `${AppConfig.baseURL}/docs/GetPhaseDocumentsByProjectTaskId/${project_task_id}`,
  GetIncidentsByTaskId: (task_id: number) => `${AppConfig.baseURL}/transaction/task-incident-reports/${task_id}`,

  submitTasks: `${AppConfig.baseURL}/docs/submitProjectTaskDocument`,
  Task_Comments: `${AppConfig.baseURL}/transaction/CreateProjectComment`,
  Task_Comments_reply: `${AppConfig.baseURL}/transaction/AddCommentReply`,

  getProjectFile: (fileName: string) => `${AppConfig.baseURL}/transaction/getProjectFile?file_name=${encodeURIComponent(fileName)}`,
  getTaskDoc: (id: number) => `${AppConfig.baseURL}/docs/${id}`,


  getAllActions: `${AppConfig.baseURL}/screens/getallactions`,
  addAction: `${AppConfig.baseURL}/screens/add`,
  updateAction: (id: number | string) => `${AppConfig.baseURL}/screens/update/${id}`,
  deleteAction: (id: number | string) => `${AppConfig.baseURL}/screens/delete/${id}`,
  getAllScreens: `${AppConfig.baseURL}/screens/getallscreens`,   
  addScreen: `${AppConfig.baseURL}/screens/addscreen`,
  updateScreen: `${AppConfig.baseURL}/screens/updatescreen`,
  deleteScreen:`${AppConfig.baseURL}/screens/deletescreen`,             
  getRolePermissions: `${AppConfig.baseURL}/screens/get-role-permissions`,


  ScreenActionMappingList: `${AppConfig.baseURL}/screens/get-screen-action-mapping`, 
  ScreenActionMappingInsert: `${AppConfig.baseURL}/screens/insert-screen-action-mapping`, 
  // Screen Action Role Mapping Endpoints (if needed)

  InsertRoleScreenActions : `${AppConfig.baseURL}/screens/insert-role-screen-actions`,
getRoleScreenActionsByRoleId :`${AppConfig.baseURL}/screens/get-role-screen-actions-by-roleid`,

  
  // incident report api endpoints start
get_incident_reports: (params?: { user_id?: number; task_id?: number; raised_by?: number }) => {
  const query = new URLSearchParams();
  if (params?.user_id) query.append("user_id", String(params.user_id));
  if (params?.task_id) query.append("task_id", String(params.task_id));
  if (params?.raised_by) query.append("raised_by", String(params.raised_by));

  return `${AppConfig.baseURL}/transaction/GetIncidentReports?${query.toString()}`;
},

resolve_incidents: `${AppConfig.baseURL}/transaction/ResolveIncidentReport`,
raise_incident: `${AppConfig.baseURL}/transaction/AddIncidentReport`,
raise_incident_report: `${AppConfig.baseURL}/transaction/raise-incident-Report`,
fetch_incident_reports: (params?: { user_id?: number; project_id?: number }) => {
  const query = new URLSearchParams();

  if (params?.user_id) query.append("user_id", String(params.user_id));
  if (params?.project_id) query.append("project_id", String(params.project_id));

  return `${AppConfig.baseURL}/transaction/incident-reports?${query.toString()}`;
},

ResolveComment: (commentId: number | string, userId: number | string) =>`${AppConfig.baseURL}/transaction/ResolveComment/${commentId}/${userId}`,

// WebSocket endpoint
connectWebSocket: (taskId: string) => `${AppConfig.wsBaseURL}/${taskId}`,
myworks_projects: `${AppConfig.baseURL}/transaction/new_getProjectsByUser`,
myworks_tasks: `${AppConfig.baseURL}/transaction/new_getUserTasks`,
user_images: `${AppConfig.baseURL}/users_profile`,
new_getProjectDetails: `${AppConfig.baseURL}/transaction/new_getProjectDetails`,
get_task_worklog: `${AppConfig.baseURL}/transaction/getTaskWorkLogDetailsByProjectTaskId`,
create_task_worklog: `${AppConfig.baseURL}/transaction/createTaskWorkLog`,
getUnverifiedChangeRequests: `${AppConfig.baseURL}/transaction/getUnverifiedChangeRequests`,
getChangeRequestFile: (fileName: string) => `${AppConfig.baseURL}/transaction/getChangeRequestFile?file_name=${encodeURIComponent(fileName)}`,
updateChangeRequestStatus: `${AppConfig.baseURL}/transaction/updateChangeRequestVerificationStatus`,

// -------- New Ui Api end points -----------------------------------
FetchingIncidentReports: (userId: number | string, projectId: number | string) =>`${AppConfig.baseURL}/transaction/incident-reports/${userId}?project_id=${projectId}`,
FetchComments: (userId: number | string, projectId: number | string) =>`${AppConfig.baseURL}/transaction/comments/${userId}?project_id=${projectId}`,






new_get_all_projects: 
  `${AppConfig.baseURL}/transaction/new_get_all_projects`,


Add_Task_Comments: `${AppConfig.baseURL}/transaction/CreateProjectComment`,
Add_Task_Comments_reply: `${AppConfig.baseURL}/transaction/AddCommentReply`,
Edit_Task_Comment: `${AppConfig.baseURL}/transaction/comment/edit`,
Edit_Task_Comment_reply: `${AppConfig.baseURL}/transaction/reply/edit`,

ResolveIncidentReport: () => `${AppConfig.baseURL}/transaction/ResolveIncidentReport`,







Revert_To_Previous_Task: `${AppConfig.baseURL}/transaction/task/revert`,
retrieveProjectDetails: (projectId: string | number) => `${AppConfig.baseURL}/transaction/retrieve_project_details/${projectId}`,
updateProjectDetails: (projectId: string | number) =>`${AppConfig.baseURL}/transaction/update_project_details/${projectId}`,
archiveProject: (projectId: string | number) =>`${AppConfig.baseURL}/transaction/delete_project/${projectId}`,

// getAllRiskAssessmentTemplates: `${AppConfig.baseURL}/master/getAllRiskAssessmentTemplates`,

// getAllRiskAssessmentTemplates: (assetTypeId: number) => `${AppConfig.baseURL}/master/by-asset?asset_type_id=${assetTypeId}`,
getAllTemplates: (templateTypeId: number) =>
  `${AppConfig.baseURL}/master/by-template-type?template_type_id=${templateTypeId}`,
//  getUserDetailsAssignedToUserId: (projectId: string | number) =>
//     `${AppConfig.baseURL}/transaction/new_getProjectDetails/${projectId}`,
getUserDetailsAssignedToUserId: (projectId: string | number) =>
        `${AppConfig.baseURL}/projects/users/${projectId}`,
saveJsonTemplate: `${AppConfig.baseURL}/master/save`,
getJsonTemplateById: (id: number) => `${AppConfig.baseURL}/master/json-template/${id}`,

  addQuestionToTemplate: `${AppConfig.baseURL}/master/addQuestionToTemplate`,

get_dashboard_data: (userId: number, projectId?: number) =>
  `${AppConfig.baseURL}/transaction/get_dashboard_data?user_id=${userId}${projectId ? `&project_id=${projectId}` : ''}`,


getAllTemplateTypes: `${AppConfig.baseURL}/master/getAllTemplateTypes`,
createJsonTemplate: `${AppConfig.baseURL}/master/createJsonTemplate`,
getJsonTemplate: (templateId: string | number) => `${AppConfig.baseURL}/master/getJsonTemplate/${templateId}`, // Updated to function type for ID param
getAllVersions: (templateTypeId: number) =>
  `${AppConfig.baseURL}/master/getAllVersions?template_type_id=${templateTypeId}`,

compare_docs: (id: number): string => `${AppConfig.baseURL}/docs/compare_docs/${id}`,

};
