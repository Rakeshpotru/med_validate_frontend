// components/AccessGuard.tsx
import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import RingGradientLoader from "./RingGradientLoader"; // or your loader component
import { fetchRolePermissions } from "../services/permissionsService";
import { showWarn } from "../services/toasterService";

interface Action {
  action_name: string;
}

interface Screen {
  screen_name: string;
  actions: Action[];
}

interface AccessGuardProps {
  screenName: string;
  children: React.ReactNode;
}

const AccessGuard: React.FC<AccessGuardProps> = ({ screenName, children }) => {
  const [permissions, setPermissions] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const userId = Number(localStorage.getItem("USER_ID"));
        if (!userId) {
          showWarn("Session expired. Please log in again.", 4000);
          window.location.href = "/login";
          return;
        }

        const perms = await fetchRolePermissions();
        setPermissions(perms);

        const allowed = perms.some(
          (perm) =>
            perm.screen_name?.toLowerCase() === screenName.toLowerCase() &&
            perm.actions?.some((a) => a.action_name?.toLowerCase() === "screen view")
        );

        setHasAccess(allowed);
      } catch (err) {
        console.error("❌ Failed to fetch permissions:", err);
        showWarn("Unable to load permissions. Please try again later.", 5000);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [screenName]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RingGradientLoader />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
        <p className="text-gray-600">
          Sorry, you don’t have access to this screen or action.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessGuard;
