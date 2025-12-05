import React from 'react';
import { useNavigate } from 'react-router-dom';

interface NavProps {
  user: any;
  onLogout: () => void;
}

const Nav: React.FC<NavProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const handleNavigate = (path: string) => navigate(path);

  return (
    <header className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-700 to-green-600 text-white">
      {/* Left side: navigation buttons */}
      <div className="flex items-center space-x-2">
        <button onClick={() => handleNavigate("/dashboard")} className="px-3 py-1 rounded bg-indigo-500 hover:bg-indigo-600">
          Dashboard
        </button>
        <button onClick={() => handleNavigate("/security")} className="px-3 py-1 rounded bg-blue-500 hover:bg-orange-600">
          Security
        </button>
        <button onClick={() => handleNavigate("/projectslist")} className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600">
          Projects
        </button>
        <button onClick={() => handleNavigate("/project_tasks")} className="px-3 py-1 rounded bg-green-500 hover:bg-green-600">
          Tasks
        </button>
        <button onClick={() => handleNavigate('/incident-reports')} className="px-3 py-1 rounded bg-green-500 hover:bg-green-600">
          Incident Reports
        </button>
      </div>

      {/* Right side: user info + logout */}
      <div className="flex items-center space-x-4">
        <span className="font-bold">
          {user.name} ({user.role})
        </span>
        <button onClick={onLogout} className="px-3 py-1 rounded bg-red-500 hover:bg-red-600">
          Logout
        </button>
      </div>
    </header>
  );
};


export default Nav;
