import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Users, Shield, Wrench, AlertTriangle, CheckCircle, Home, ClipboardList, Layers, Share2, WorkflowIcon } from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    
    { id: 'roles', label: 'Roles', icon: Shield, path: '/admindashboard/userRole' },
    { id: 'user-registration', label: 'Users', icon: Users, path: '/admindashboard/userRegistration' },
    { id: 'equipments', label: 'Equipments', icon: Wrench, path: '/admindashboard/equipments' },
    { id: 'risk-assessment', label: 'Risk Assessment', icon: AlertTriangle, path: '/admindashboard/risk-assessment' },
    { id: 'status', label: 'Status', icon: CheckCircle, path: '/admindashboard/status' },
    { id: 'tasks', label: 'SDLC Tasks', icon: ClipboardList, path: '/admindashboard/tasks' },
    { id: 'phases', label: 'SDLC Phases', icon: Layers, path: '/admindashboard/phases' },
    { id: 'riskphasemapping', label: 'Risk to Phase Mapping', icon: Share2, path: '/admindashboard/riskphasemapping' },
    { id: 'phasetaskmapping', label: 'Phase to Task Mapping', icon: ClipboardList, path: '/admindashboard/phasetaskmapping' },
    { id: 'WorkflowStages', label: 'work flow Stages', icon: WorkflowIcon, path: '/admindashboard/workflowstages'},
    { id: 'StagePhasemapping', label: 'work flow Stage Phase Mapping', icon: WorkflowIcon, path: '/admindashboard/workflowstagephasemap'}
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-blue-800 text-white shadow-lg">
        <div className="p-4 border-b border-blue-700">
          <h1 className="text-xl font-bold">Master Tables</h1>
        </div>
        
        <nav className="mt-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.path)}
                className={`w-full flex items-center px-4 py-3 text-left hover:bg-blue-700 transition-colors duration-200 ${
                  isActive ? 'bg-blue-700 border-r-4 border-blue-300' : ''
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;