import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

interface AccessGuardProps {
  screenName: string;
  actionName?: string; // optional action to check
  permissions?: any[]; // optional
  children: React.ReactNode;
}

const AccessGuard: React.FC<AccessGuardProps> = ({ screenName, actionName, permissions, children }) => {
  const [loadedPermissions, setLoadedPermissions] = useState<any[]>([]);

  useEffect(() => {
    let perms: any[] = [];

    // Use passed permissions first
    if (permissions && Array.isArray(permissions)) {
      perms = permissions;
      console.log("AccessGuard - using passed permissions:", perms);
    } else if (localStorage.getItem("role_permissions")) {
      const stored = JSON.parse(localStorage.getItem("role_permissions")!);
      if (Array.isArray(stored)) perms = stored;
      else if (stored && Array.isArray(stored.permissions)) perms = stored.permissions;
      console.log("AccessGuard - loaded permissions from localStorage:", perms);
    }

    setLoadedPermissions(perms);
  }, [permissions]);

  console.log("AccessGuard check for screen:", screenName);
  console.log("AccessGuard check for action:", actionName);
  console.log("Loaded permissions:", loadedPermissions);

  const hasScreenAccess = Array.isArray(loadedPermissions)
    ? loadedPermissions.some((s) => {
        console.log("Checking screen:", s.screen_name);
        if (s.screen_name.toLowerCase() !== screenName.toLowerCase()) return false;

        if (actionName && Array.isArray(s.actions)) {
          const actionAllowed = s.actions.some(
            (a) => a.action_name.toLowerCase() === actionName.toLowerCase()
          );
          console.log(`Checking action "${actionName}" on screen "${screenName}":`, actionAllowed);
          return actionAllowed;
        }

        console.log(`Screen "${screenName}" access granted (no action check)`);
        return true;
      })
    : false;

  if (!hasScreenAccess) {
    console.log(`Access denied for screen "${screenName}"${actionName ? ` and action "${actionName}"` : ""}`);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Sorry, you don’t have access to the <strong>{screenName}</strong> page
          {actionName ? ` for action "${actionName}"` : ''}.
        </p>
      </div>
    );
  }

  console.log(`Access granted for screen "${screenName}"${actionName ? ` and action "${actionName}"` : ""}`);
  return <>{children}</>;
};

export default AccessGuard;
