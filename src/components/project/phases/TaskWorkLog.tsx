import { useState, useEffect, useRef } from 'react';
import { X, Send, Calendar } from 'lucide-react';
import { Api_url } from '../../../networkCalls/Apiurls';
import RingGradientLoader from '../../../components/RingGradientLoader';
import { showSuccess, showError, showWarn } from "../../../services/toasterService";
import DecodedTokenValues from '../../../components/DecryptToken';
import type { Member } from '../../../components/project/types';
import { getRequestStatus, postRequestStatus } from '../../../networkCalls/NetworkCalls';


interface TaskWorkLogProps {
  isOpen: boolean;
  onClose: () => void;
  projectTaskId?: string;
}

interface ApiWorkLog {
  task_work_log_id: number;
  user_id: number;
  user_name: string;
  image_url?: string | null;
  remarks: string;
  created_date: string;
}

interface ApiResponse {
  status_code: number;
  message: string;
  data: {
    project_task_id: number;
    task_id: number;
    task_name: string;
    task_status_id: number;
    status_name: string;
    project_phase_id: number;
    project_id: number;
    phase_id: number;
    project_name: string;
    phase_name: string;
    users: Member[];
    work_logs: ApiWorkLog[];
  };
}

interface Comment {
  id: number;
  author: string;
  avatar?: string;
  time: string;
  text: string;
}

export default function TaskWorkLog({ isOpen, onClose, projectTaskId }: TaskWorkLogProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [taskName, setTaskName] = useState('Untitled Task');
  const [phaseName, setPhaseName] = useState('Untitled Phase');
  const [projectName, setProjectName] = useState('Untitled Project');
  const [taskStatus, setTaskStatus] = useState('In-Progress');
  const [taskStatusId, setTaskStatusId] = useState<number>(0);
  const [assignees, setAssignees] = useState<Member[]>([]);

  const { user_id, user_name } = DecodedTokenValues();

  const commentsEndRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom when comments update
  useEffect(() => {
    if (!loading && comments.length > 0) {
      commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, loading]);

const formatToLocal = (utcDateStr: string) => {
  // Parse the date as UTC
  const date = new Date(utcDateStr + 'Z'); // 'Z' ensures it's treated as UTC
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  };
  return date.toLocaleString(undefined, options).replace('AM', 'am').replace('PM', 'pm');
};

  const refetchData = async () => {
  if (!projectTaskId) return;
  setLoading(true);
  const url = `${Api_url.get_task_worklog}?project_task_id=${projectTaskId}`;
  try {
    const result = await getRequestStatus<ApiResponse>(url);
    if (result.status === 200) {
      const data: ApiResponse = result.data;
      if (data.status_code === 200) {
        const apiData = data.data;
        setTaskName(apiData.task_name);
        setPhaseName(apiData.phase_name);
        setProjectName(apiData.project_name);
        setTaskStatus(apiData.status_name || 'In-Progress');
        setTaskStatusId(apiData.task_status_id);
        setAssignees(apiData.users || []);

        const mappedComments: Comment[] = apiData.work_logs.map((log: ApiWorkLog) => ({
          id: log.task_work_log_id,
          author: log.user_name,
          avatar: log.image_url ? `${Api_url.user_images}/${log.image_url}` : undefined,
          // time: new Date(log.created_date).toLocaleString(),
          time: formatToLocal(log.created_date),
          text: log.remarks,
        }));
        setComments(mappedComments);
      } else {
        showError(data.message || 'Failed to fetch work logs');
      }
    } else {
      throw new Error(`HTTP ${result.status}: Failed to fetch`);
    }
  } catch (err) {
    console.error('Error fetching work logs:', err);
    showError('Failed to load work logs');
  } finally {
    setLoading(false);
  }
};

  // Fetch work logs
  useEffect(() => {
    if (isOpen && projectTaskId) {
      refetchData();
    }
  }, [isOpen, projectTaskId]);

// Prevent background scroll when WorkLog is open
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "auto";
  }

  return () => {
    document.body.style.overflow = "auto";
  };
}, [isOpen]);

const handleStatusChange = async (newStatusId: number) => {
  if (!projectTaskId || newStatusId === taskStatusId || submitting) return;
  setSubmitting(true);

  const payload = {
    project_task_id: parseInt(projectTaskId),
    task_status_id: newStatusId,
  };

  try {
    const url = Api_url.updateProjectTaskStatusForTaskWorkLog(); // Call the function to get the URL
    const result = await postRequestStatus<any>(url, payload);

    if (result.status === 200 || result.status === 201) {
      const data = result.data;
      if (data.status_code === 200 || data.status_code === 201) {
        showSuccess('Status updated successfully');
        await refetchData(); // Refetch to update UI
      } else {
        showError('Failed to update status');
      }
    } else {
      throw new Error(`HTTP ${result.status}: ${result.data?.message || 'Failed to update status'}`);
    }
  } catch (err) {
    console.error('Error updating status:', err);
    showError('Failed to update status');
  } finally {
    setSubmitting(false);
  }
};
  
const handleAddComment = async () => {
  if (!newComment.trim() || !projectTaskId || !user_id) return;
  setSubmitting(true);

  const payload = {
    project_task_id: parseInt(projectTaskId),
    user_id: parseInt(user_id),
    remarks: newComment.trim(),
  };

  try {
    const result = await postRequestStatus<any>(Api_url.create_task_worklog, payload);

    if (result.status === 200 || result.status === 201) {
      const data = result.data;
      if (data.status_code === 201) {
        setNewComment('');
        // showSuccess(data.message || 'Comment added successfully');
        await refetchData(); // Refetch to update UI
      } else {
        showError('Failed to add comment');
      }
    } else {
      throw new Error(`HTTP ${result.status}: ${result.data?.message || 'Failed to add comment'}`);
    }
  } catch (err) {
    console.error('Error adding comment:', err);
    showError('Failed to add comment');
  } finally {
    setSubmitting(false);
  }
};
  if (!isOpen) return null;

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 1);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return { bg: 'green-50', text: 'green-700' };
      case 'In-Progress':
        return { bg: 'orange-50', text: 'orange-700' };
      case 'Stuck':
        return { bg: 'red-50', text: 'red-700' };
      default:
        return { bg: 'gray-50', text: 'gray-700' };
    }
  };

  const statusColors = getStatusColor(taskStatus);

  const canSetToActive = taskStatusId === 11; // Enable Active button only if current is Stuck (11)
  const canSetToStuck = taskStatusId === 1; // Enable Stuck button only if current is Active (1)
  const isCompleted = taskStatusId === 3; // Completed status id

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40 transition-opacity"/>
      <div className="fixed top-0 right-0 h-full w-1/2 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Task Work Log</h2>
            <p className="text-lg font-semibold text-gray-900">
              {taskName}
              <span className="text-gray-400"> / </span>
              {phaseName}{' '}
              <span className="text-gray-500 text-base">({projectName})</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange(1)}
                disabled={!canSetToActive || submitting}
                className={`px-3 py-2 text-sm font-semibold rounded-full transition-colors ${
                  canSetToActive && !submitting
                    ? 'bg-orange-100 text-orange-700 hover:bg-orange-200 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title="Mark as Active"
              >
                {submitting ? <RingGradientLoader size="small" className="!bg-transparent" /> : 'Mark as Active'}
              </button>
              <button
                onClick={() => handleStatusChange(11)}
                disabled={!canSetToStuck || submitting}
                className={`px-3 py-2 text-sm font-semibold rounded-full transition-colors ${
                  canSetToStuck && !submitting
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
                title="Mark as Stuck"
              >
                {submitting ? <RingGradientLoader size="small" className="!bg-transparent" /> : 'Mark as Stuck'}
              </button>
            </div>

            {/* Assignees */}
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-gray-900">Assignees</label>
              <div className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg bg-gray-50">
                {assignees.length > 0 ? (
                  <div className="flex -space-x-2">
                    {assignees.slice(0, 5).map((user: Member, idx: number) => {
                      const hasImage = user.avatarUrl || user.image_url;
                      const imageSrc = hasImage
                        ? user.avatarUrl || `${Api_url.user_images}/${user.image_url}`
                        : null;
                      const displayName = user.name || user.user_name || 'User';

                      return (
                        <div
                          key={idx}
                          title={displayName}
                          className="relative w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-gray-300 text-gray-600 text-xs font-medium overflow-hidden"
                        >
                          {imageSrc ? (
                            <img
                              src={imageSrc}
                              alt={displayName}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            getInitials(displayName)
                          )}
                        </div>
                      );
                    })}
                    {assignees.length > 5 && (
                      <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-gray-200 text-gray-600 text-xs font-medium">
                        +{assignees.length - 5}
                      </div>
                    )}
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">No assignees</span>
                )}
                <span className="text-sm text-gray-500 whitespace-nowrap">Recently assigned</span>
              </div>
            </div>

            {/* Status */}
            <div className='flex items-center justify-between gap-3'>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Status</label>
              <div className={`px-3 py-2 bg-${statusColors.bg} text-${statusColors.text} rounded-full text-sm font-medium inline-block`}>
                {taskStatus}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Comments</h3>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center py-4">
                    <RingGradientLoader className="!bg-transparent" />
                  </div>
                ) : comments.length > 0 ? (
                  comments.map((comment) => {
                    const isCurrentUser = comment.author === user_name;

                    return (
                      <div
                        key={comment.id}
                        className={`flex gap-3 ${isCurrentUser ? "justify-end" : "justify-start"}`}
                      >
                        {!isCurrentUser && (
                          <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-300 text-gray-600 text-xs font-medium flex items-center justify-center overflow-hidden">
                            {comment.avatar ? (
                              <img
                                src={comment.avatar}
                                alt={comment.author}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              getInitials(comment.author)
                            )}
                          </div>
                        )}

                        <div
                          className={`max-w-[70%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                            isCurrentUser
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-gray-100 text-gray-700 rounded-bl-none"
                          }`}
                        >
                          {!isCurrentUser && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{comment.author}</span>
                              <span className="text-xs text-gray-500">{comment.time}</span>
                            </div>
                          )}
                          <p>{comment.text}</p>
                          {isCurrentUser && (
                            <div className="text-xs text-gray-200 mt-1 text-right">{comment.time}</div>
                          )}
                        </div>

                        {isCurrentUser && (
                          <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-300 text-gray-600 text-xs font-medium flex items-center justify-center overflow-hidden">
                            {comment.avatar ? (
                              <img
                                src={comment.avatar}
                                alt={comment.author}
                                className="w-full h-full object-cover rounded-full"
                              />
                            ) : (
                              getInitials(comment.author)
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-gray-500">No comments yet.</p>
                )}
                <div ref={commentsEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end gap-3">
            {(() => {
              const matchedUser = assignees.find(
                (user) => String(user.user_id) === String(user_id)
              );

              const hasImage =
                matchedUser?.avatarUrl || matchedUser?.image_url
                  ? true
                  : false;
              const imageSrc = hasImage
                ? matchedUser?.avatarUrl ||
                  `${Api_url.user_images}/${matchedUser?.image_url}`
                : null;
              const displayName =
                matchedUser?.name || matchedUser?.user_name || user_name || "User";

              return (
                <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 text-xs font-medium flex items-center justify-center overflow-hidden">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={displayName}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    getInitials(displayName)
                  )}
                </div>
              );
            })()}

            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !isCompleted) handleAddComment();
                }}
                placeholder={isCompleted ? "You can’t add comments when the task is completed" : "What would you like to say?"}
                className={`flex-1 bg-transparent text-sm outline-none ${isCompleted ? "text-gray-400 cursor-not-allowed" : "text-gray-700 placeholder-gray-400" }`}
                disabled={submitting || isCompleted}
              />
              <button
                onClick={handleAddComment}
                disabled={isCompleted || !newComment.trim() || submitting}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {submitting ? (
                  <RingGradientLoader size="small" className="!bg-transparent" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}