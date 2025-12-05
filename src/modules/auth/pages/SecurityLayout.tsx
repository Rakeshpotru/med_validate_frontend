// components/SecurityLayout.tsx
import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  path: string;
}

const SecurityLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Absolute paths for tabs
  const tabs: Tab[] = [
    { id: "screens", label: "Screens", path: "/security/screens" },
    { id: "actions", label: "Actions", path: "/security/actions" },
    { id: "screen-action-mapping", label: "Screen Action Mapping", path: "/security/screen-action-mapping" },
    { id: "screen-action-role-mapping", label: "Screen Action Role Mapping", path: "/security/screen-action-role-mapping" },
  ];

  const getActiveTab = (tabPath: string) => location.pathname === tabPath;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Security Management
              </h1>
              <p className="text-xs text-slate-500 font-medium">Configure access control and permissions</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 -mb-px max-w-7xl mx-auto px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`relative px-5 py-2.5 text-sm font-semibold transition-all duration-300 rounded-t-xl
                ${getActiveTab(tab.path)
                  ? "text-blue-700 bg-gradient-to-b from-white to-blue-50/50 shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                }`}
            >
              {tab.label}
              {getActiveTab(tab.path) && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Nested routes */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        <Outlet />
      </div>
    </div>
  );
};

export default SecurityLayout;
