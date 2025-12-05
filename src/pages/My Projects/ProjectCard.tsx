import { useEffect, useRef, useState } from 'react';
import { canEditProjectDetails } from '../../services/permissionsService' // make sure import path is correct
import { motion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { CalendarDays, MessageSquare, Paperclip, ListChecks, MoreVertical, Tag, Lock } from 'lucide-react';
import type { ProjectSummary } from './projectTypes';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import Button from '../ui/button';
import { MetaStat } from './MetaStat';
import { ProgressInline } from './ProgressInline';
import { PhasePill } from './PhasePill';
import { AvatarGroup } from './AvatarGroup';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Api_url } from '../../networkCalls/Apiurls';
import { showError, showSuccess, showWarn } from '../../services/toasterService';
import { deleteRequestStatus } from '../../networkCalls/NetworkCalls';

export function ProjectCard({ item, onOpen, highlight, handleProjectCreationVal, onArchive }: { 
  item: ProjectSummary; 
  onOpen: (id: string) => void; 
  highlight?: boolean, 
  handleProjectCreationVal: (id: string) => void;
  onArchive?: (projectId: string) => void;
}) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const open = () => onOpen(item.id);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [hasEditPermission, setHasEditPermission] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  // Check edit permissions on mount
  // useEffect(() => {
  //   canEditProjectDetails().then((hasAccess) => {
  //     setHasEditPermission(hasAccess);
  //   }).catch((error) => {
  //     console.error('Error checking edit permissions:', error);
  //     setHasEditPermission(false); // Default to false on error
  //   });
  // }, []);

  useEffect(() => {
  try {
    const hasAccess = canEditProjectDetails();
    setHasEditPermission(hasAccess);
  } catch (error) {
    setHasEditPermission(false);
  }
}, []);

  // Disable background scroll when archive modal is open
  useEffect(() => {
    // Disable background scroll when Work Log is open
    document.body.style.overflow = showArchiveModal ? "hidden" : "auto";

    return () => {
      // Re-enable background scroll when closed
      document.body.style.overflow = "auto";
    };
  }, [showArchiveModal]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open dropdown only on click (no toggle close on button click)
  const handleButtonClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleViewClick = (id: string) => {
    setIsOpen(false);
    // Navigate to the "View" page with the project ID
    navigate(`/project_details_page/${id}`);
  };

  const handleEditClick = (id: string) => {
    setIsOpen(false);
    handleProjectCreationVal(id);
  };
  const confirmArchive = async () => {
  setShowArchiveModal(false);
  // Call the archive API
  const projectId = item.id;
  const archiveUrl = Api_url.archiveProject(projectId);
  try {
    const response = await deleteRequestStatus<{ status_code: number; message: string; data: any }>(archiveUrl);
    if (response.status >= 200 && response.status < 300) { // Success range
      // Access the nested message from the API response structure
      const apiMessage = response.data?.message || 'Project archived successfully';
      showSuccess(apiMessage);
      // Optionally, log or use the project_id from data
      console.log('Archived project ID:', response.data?.data?.project_id);
      // Notify parent to refetch latest data after successful archive
      onArchive?.(projectId);
    } else {
      const apiResponseData = response.data as { status_code: number; message: string; data: any }; // Type assertion for error handling
      const errorMessage = apiResponseData?.message || 'Failed to archive project';
      if (response.status === 400) {
        // Handle specific "already archived" case or other warnings
        if (errorMessage.includes('already archived')) {
          showWarn('Project is already archived.');
        } else {
          showWarn(errorMessage);
        }
      } else {
        showError(errorMessage);
      }
    }
  } catch (error) {
    console.error('Error archiving project:', error);
    showError('An unexpected error occurred while archiving the project. Please try again.');
  }
  // onOpen(item.id); // Commented out original logic; adjust if needed to open after archive
};
  const modalContent = showArchiveModal ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Archive Project?</h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to archive <strong>{item.title}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowArchiveModal(false)}
            className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmArchive}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Archive
          </button>
        </div>
      </motion.div>
    </motion.div>
  ) : null;
  // 🔹 Determine if edit is allowed (permission + not completed)
  const isCompleted = item.status_id === 3;
  const canEdit = hasEditPermission && !isCompleted;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{
        opacity: 1,
        scale: 1,
        borderColor: highlight ? 'rgba(61, 91, 198, 0.3)' : 'rgba(203, 213, 225, 1)'
      }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={open}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
          }
        }}
        aria-label={`Open project ${item.title}`}
        className={`relative group w-full max-w-[400px] text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]`}
        style={highlight ? { backgroundColor: 'rgba(61, 91, 198, 0.1)' } : {}}
      >
        {highlight && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ background: 'radial-gradient(120% 120% at 50% 50%, rgba(31,58,157,0.3), transparent 60%)' }}
          />
        )}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge status={item.status} />
          </div>

          <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
              onClick={handleButtonClick}

              aria-expanded={isOpen}
              aria-haspopup="true"
            >
              <MoreVertical className="h-5 w-5" />
            </button>

            {isOpen && (
              <div
                className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/10 focus:outline-none z-20
                 animate-[fadeIn_0.2s_ease-out,slideIn_0.2s_ease-out]"
              >
                <div className="flex flex-col items-start py-2">
                  {/* View Button */}
                  <button
                    onClick={() => handleViewClick(item.id)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 ease-in-out"
                  >
                    👁️ View
                  </button>

                  {/* Edit Button */}
                  <button
                    disabled={!canEdit}
                    onClick={canEdit ? () => handleEditClick(item.id) : undefined}
                    className={`w-full text-left px-4 py-2 text-sm rounded transition-all duration-200 ease-in-out ${canEdit
                      ? 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer'
                      : 'text-gray-400 cursor-not-allowed opacity-60'
                    }`}
                    title={!canEdit ? (!hasEditPermission ? "You do not have permission to edit this project." : "Cannot edit completed projects.") : ''}
                  >
                    {!canEdit && <Lock className="h-4 w-4 mr-2 inline text-gray-400" aria-hidden />}
                    ✏️ Edit
                  </button>

                  {/* Archive Button */}
                  <button
                    onClick={() => {
                      setShowArchiveModal(true);
                      setIsOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 ease-in-out"
                  >
                    🗄️ Archive
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-haspopup="menu" aria-label="Open project menu">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewClick(item.id)}>View</DropdownMenuItem>

              <DropdownMenuItem
                disabled={!hasEditPermission}
                onClick={hasEditPermission ? () => handleEditClick(item.id) : undefined}
                className={!hasEditPermission ? 'opacity-50 cursor-not-allowed' : ''}
              >
                {!hasEditPermission && <Lock className="h-4 w-4 mr-2 text-gray-400" />}
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onOpen(item.id)} className="text-gray-700">
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu> */}
        </div>

        {/* Rest of your card content with hover expansions for title and summary */}
        <div className="mt-3">
          <div className="flex items-center gap-4">
            <div className={`font-semibold text-gray-900 transition-all ${isHovered ? 'line-clamp-none' : 'line-clamp-1'}`}>
              {item.title}
            </div>
            <PriorityBadge priority={item.priority} />
          </div>
          <div className={`transition-all ${isHovered ? 'h-auto' : 'h-10'}`}>
            <p className={`mt-1 text-sm text-gray-600 transition-all ${isHovered ? 'line-clamp-none' : 'line-clamp-2'}`}>
              {item.summary}
            </p>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <CalendarDays className="h-4 w-4" aria-hidden="true" />
          <span>
            {item.startDate} - {item.endDate}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Tag className="h-4 w-4 text-gray-400" aria-hidden />
          {item.phases.map((p) => (
            <PhasePill key={p} code={p} />
          ))}
        </div>

        {typeof item.progressPct === 'number' && (
          <div className="mt-3">
            <ProgressInline value={item.progressPct} />
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <AvatarGroup members={item.members} />
          <div className="flex items-center gap-4">
            <MetaStat icon={<MessageSquare className="h-4 w-4" />} count={item.stats.comments} ariaLabel="Comments" />
            <MetaStat icon={<ListChecks className="h-4 w-4" />} count={item.stats.tasks} ariaLabel="Tasks" />
            <MetaStat icon={<Paperclip className="h-4 w-4" />} count={item.stats.attachments} ariaLabel="Attachments" />
          </div>
        </div>
      </div>
      {createPortal(modalContent, document.body)}
    </motion.div>
  );
}