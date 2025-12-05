import axios from "axios";
import { Api_url } from "../networkCalls/Apiurls";
import {  postRequestStatus } from "../networkCalls/NetworkCalls";

interface Screen {
  screen_name: string;
  actions: Action[];
}

interface Action {
  action_name: string;
}
interface Res {
  
    data: {
      user_id: number;
      user_name: string;
      email: string;
      role_id: number;
      role_name: string;
      screens: {
        screen_id: number;
        screen_name: string;
        actions: {
          action_id: number;
          action_name: string;
        }[];
      }[];
    
  };
}

// ---- Internal cache ----
let cachedPermissions: Screen[] | null = null;
let permissionsLoaded = false;

/**
 * Fetch latest permissions from API for the current user (used only once).
 */
export const fetchRolePermissions = async (): Promise<Screen[]> => {
  try {
    const storedUserId = localStorage.getItem("USER_ID");
    const userId = storedUserId ? Number(storedUserId) : null;

    if (!userId || isNaN(userId)) {
      // console.warn("❌ Missing or invalid USER_ID in localStorage");
      return [];
    }

    // const res = await axios.post(Api_url.getRolePermissions, { user_id: userId });
     // ✅ Get headers including token
    // const headers = await GetApiHeaders_token();

    const res = await postRequestStatus<Res>(
      Api_url.getRolePermissions,
      { user_id: userId }
        // ✅ Pass token here
    );

    // console.log("permissions API Response :",res);
        const apiData  = res.data;

    if (apiData ?.status_code === 200) {
      cachedPermissions = apiData .data?.screens || []
            // console.log("cachedPermissions")

      return cachedPermissions;
    }

    // console.warn("⚠️ Unexpected API response:", res.data);
    return [];
  } catch (err) {
    // console.error("❌ Failed to fetch role permissions:", err);
    return [];
  }
};

/**
 * Load permissions once and cache them.
 */
export const loadPermissions = async (): Promise<void> => {
  if (permissionsLoaded) return;

  cachedPermissions = await fetchRolePermissions();
  permissionsLoaded = true;
};

/**
 * Internal helper to check permission synchronously.
 * Returns false if permissions not yet loaded.
 */
const hasActionAccessSync = (screenName: string, actionName: string): boolean => {
  if (!cachedPermissions) {
    // console.warn(`⚠️ Permissions not loaded — returning false for ${screenName} → ${actionName}`);
    return false;
  }

  const screen = cachedPermissions.find(
    (s) => s.screen_name.toLowerCase() === screenName.toLowerCase()
  );

// console.log("screen name",screen);

  const hasAccess =
    screen?.actions.some(
      (a) => a.action_name.toLowerCase() === actionName.toLowerCase()
    ) ?? false;


// console.log("action name",hasAccess);

  return hasAccess;
};

// ------- My Works -------
export const canViewDocumentInTasks = (): boolean =>
  hasActionAccessSync("Works", "Document View");

// ------- Project details -------
export const canAssignUsers = (): boolean =>
  hasActionAccessSync("Project Details", "Assign Users");

export const canTransferOwnership = (): boolean =>
  hasActionAccessSync("Project Details", "Transfer Ownership");

export const canViewDocumentInProjectdetail = (): boolean =>
  hasActionAccessSync("Project Details", "Document View");

export const canViewTaskWorkLog = (): boolean =>
  hasActionAccessSync("Project Details", "Task Work Log");

// ------- Comments view -------
export const canViewDocument = (): boolean =>
  hasActionAccessSync("Comments View", "View Document");

export const canAddComment = (): boolean =>
  hasActionAccessSync("Comments View", "Add Comment");

export const canEditComment = (): boolean =>
  hasActionAccessSync("Comments View", "Edit Comment");

export const canAddReplyComment = (): boolean =>
  hasActionAccessSync("Comments View", "Reply Add Comment");

export const canEditReplyComment = (): boolean =>
  hasActionAccessSync("Comments View", "Reply Edit Comment");

// ------- Incident view -------
export const canResloveIncident = (): boolean =>
  hasActionAccessSync("Incidents View", "Reslove Incident");

// ------- Projects -------
export const canAddEquipment = (): boolean =>
  hasActionAccessSync("Projects", "add equipment");

export const canEditProjectDetails = (): boolean =>
  hasActionAccessSync("Projects", "Edit Project");

export const canCreateProject = (): boolean =>
  hasActionAccessSync("Projects", "New Project");


// ------- Editor -------
export const canEditDocument = (): boolean =>
  hasActionAccessSync("Editor", "Document Edit");

export const canSaveDocument = (): boolean =>
  hasActionAccessSync("Editor", "save");

export const canSubmitDocument = (): boolean =>
  hasActionAccessSync("Editor", "Submit");

export const canRaiseIncidentInDocument = (): boolean =>
  hasActionAccessSync("Editor", "Raise Incident");

export const canCommentOnDocument = (): boolean =>
  hasActionAccessSync("Editor", "Add Comment");

export const canRevertTask = (): boolean =>
  hasActionAccessSync("Editor", "Revert Task");




// ------- Templates -------

export const canCreateTemplate = (): boolean =>
  hasActionAccessSync("Templates", "Create Template");