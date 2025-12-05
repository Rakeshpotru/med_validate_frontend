// import React, { useState, useEffect } from 'react';
// import { Search, Filter, FileText, CheckCircle, Clock, User } from 'lucide-react';
// import { Project, Task } from '../types';
// import { showError } from '../../../../services/toasterService';
// import { Api_url } from '../../../../networkCalls/Apiurls';
// import { useNavigate } from 'react-router-dom';

// interface TasksProps {
//   onViewTask: (taskName: string, taskId: string, equipmentId: string, statusId: number) => void;
// }

// const ProjectTasks: React.FC<TasksProps> = ({ onViewTask }) => {
//   const [projects, setProjects] = useState<Project[]>([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
//   const [loading, setLoading] = useState(true);
//   const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: string; roleId: number } | null>(null);
//   const navigate = useNavigate();

//   const taskStatuses = [
//     'Active',
//     'On Hold',
//     'Completed',
//     'Pending',
//     'Reverted',
//     'Approved',
//     'Closed',
//     'Not Yet Started',
//   ];

//   // Load user details from localStorage
//   useEffect(() => {
//     const storedUser = localStorage.getItem('user');
//     if (storedUser) {
//       const parsedUser = JSON.parse(storedUser);
//       setCurrentUser({
//         id: String(parsedUser.user_id),
//         name: parsedUser.name || '',
//         email: parsedUser.email || '',
//         role: parsedUser.role_name || '',
//         roleId: parsedUser.role_id || 0,
//       });
//     }
//   }, []);

//   useEffect(() => {
//     const fetchTasks = async () => {
//       if (!currentUser) {
//         console.error('User data not found in local storage');
//         setLoading(false);
//         return;
//       }

//       setLoading(true);
//       try {
//         const apiEndpoint = currentUser.role === 'Admin' ? Api_url.getAllProjectTasks : Api_url.getProjectTasks_by_user_id(currentUser.id);
//         const res = await fetch(apiEndpoint, {
//           headers: {
//             'Content-Type': 'application/json',
//           },
//         });

//         if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);

//         const json = await res.json();
//         console.log('API Response:', json); // Debug log

//         if (json.status_code === 200) {
//           const transformed = transformApiDataToProjects(json.data, currentUser.id, currentUser.role);
//           console.log('Transformed Projects:', transformed); // Debug log
//           setProjects(transformed);
//         } else {
//           throw new Error(json.message || 'Failed to load tasks');
//         }
//       } catch (err: any) {
//         console.error('Error fetching tasks:', err.message);
//         showError(err.message || 'Failed to load tasks');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (currentUser) {
//       fetchTasks();
//     }
//   }, [currentUser]);

//   const transformApiDataToProjects = (data: any[], uid: string, usersrole: string): Project[] => {
//     console.log('Input Data for Transformation:', data); // Debug log

//     // Handle both API response formats
//     const transformedProjects = data.reduce((acc: Project[], item: any) => {
//       const projectId = String(item.project_id);
//       const projectName = item.project_name || 'Unnamed Project';

//       // Find or create project in accumulator
//       let project = acc.find((p) => p.id === projectId);
//       if (!project) {
//         project = {
//           id: projectId,
//           name: projectName,
//           createdBy: uid,
//           assignees: [uid],
//           phases: [],
//         };
//         acc.push(project);
//       }

//       // For getAllProjectTasks (nested structure)
//       if (item.phases) {
//         const phases = item.phases.map((phase: any) => ({
//           id: String(phase.phase_id),
//           name: phase.phase_name || 'Unnamed Phase',
//           type: 'Phase',
//           tasks: phase.tasks.map((task: any) => ({
//             id: String(task.project_task_id),
//             name: task.task_name || 'Unnamed Task',
//             status: mapStatus(task.status_id),
//             assignedTo: task.users || '--',
//             equipment_id: String(task.equipment_id || '0'),
//             status_id: task.status_id,
//             validUser: usersrole === 'Admin',
//           })),
//         }));
//         project.phases.push(...phases);
//       }
//       // For getProjectTasks_by_user_id (flat structure)
//       else {
//         const phaseId = String(item.phase_id);
//         const phaseName = item.phase_name || 'Unnamed Phase';

//         // Find or create phase in project
//         let phase = project.phases.find((p) => p.id === phaseId);
//         if (!phase) {
//           phase = {
//             id: phaseId,
//             name: phaseName,
//             type: 'Phase',
//             tasks: [],
//           };
//           project.phases.push(phase);
//         }

//         // Add task to phase
//         phase.tasks.push({
//           id: String(item.project_task_id),
//           name: item.task_name || 'Unnamed Task',
//           status: mapStatus(item.status_id),
//           assignedTo: usersrole === 'Admin' ? (item.users || '--') : currentUser?.name || '--',
//           equipment_id: String(item.equipment_id || '0'),
//           status_id: item.status_id,
//           validUser: usersrole === 'Admin',
//         });
//       }

//       return acc;
//     }, []);

//     console.log('Transformed Projects Output:', transformedProjects); // Debug log
//     return transformedProjects;
//   };

//   const mapStatus = (id: number): string => {
//     const statusMap: { [key: number]: string } = {
//       1: 'Active',
//       2: 'On Hold',
//       3: 'Completed',
//       4: 'Pending',
//       5: 'Reverted',
//       6: 'Approved',
//       7: 'Closed',
//       8: 'Not Yet Started',
//     };
//     return statusMap[id] || 'Drafted';
//   };

//   const getStatusBadge = (status: string) => {
//     const colorMap: Record<string, string> = {
//       Closed: 'bg-green-100 text-green-800',
//       Approved: 'bg-emerald-100 text-emerald-800',
//       Completed: 'bg-green-100 text-green-800',
//       Pending: 'bg-yellow-100 text-yellow-800',
//       Reverted: 'bg-red-100 text-red-800',
//       Active: 'bg-yellow-100 text-yellow-800',
//       'On Hold': 'bg-gray-100 text-gray-800',
//       'Not Yet Started': 'bg-gray-100 text-gray-800',
//       Drafted: 'bg-gray-100 text-gray-800',
//     };
//     const iconMap: Record<string, JSX.Element> = {
//       Closed: <CheckCircle className="h-4 w-4 text-green-600" />,
//       Approved: <CheckCircle className="h-4 w-4 text-emerald-600" />,
//       Completed: <CheckCircle className="h-4 w-4 text-green-600" />,
//       Pending: <Clock className="h-4 w-4 text-yellow-600" />,
//       Reverted: <Clock className="h-4 w-4 text-red-600" />,
//       Active: <Clock className="h-4 w-4 text-yellow-600" />,
//       'On Hold': <FileText className="h-4 w-4 text-gray-600" />,
//       'Not Yet Started': <FileText className="h-4 w-4 text-gray-600" />,
//       Drafted: <FileText className="h-4 w-4 text-gray-600" />,
//     };

//     return (
//       <span
//         className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorMap[status] || 'bg-gray-100 text-gray-800'}`}
//       >
//         {iconMap[status] || <FileText className="h-4 w-4" />}
//         <span className="ml-1">{status}</span>
//       </span>
//     );
//   };

//   const allTasks = projects.flatMap((project) =>
//     project.phases.flatMap((phase) =>
//       phase.tasks.map((task) => ({
//         ...task,
//         projectName: project.name,
//         projectId: project.id,
//         phaseName: phase.name,
//         phaseId: phase.id,
//         phaseType: phase.type,
//         user_name: task.assignedTo ?? '--',
//         status_id: task.status_id,
//         validUser: task.validUser,
//       }))
//     )
//   );

//   console.log('All Tasks:', allTasks); // Debug log

//   const uniqueUsers = Array.from(new Set(allTasks.map((t) => t.user_name)))
//     .filter(Boolean)
//     .map((name) => ({ id: name, name }));

//   const filteredTasks = allTasks.filter((task) => {
//     const matchesSearch =
//       task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       task.phaseName.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
//     const matchesAssignee = assigneeFilter === 'all' || task.user_name === assigneeFilter;
//     return matchesSearch && matchesStatus && matchesAssignee;
//   });

//   const handleViewTask = (taskName: string, taskId: string, equipmentId: string, statusId: number) => {
//     // Navigate to ProjectTaskEditor with task data in state
//     navigate(`/task/${taskId}`, {
//       state: { taskName, taskId, equipmentId, statusId },
//     });
//   };

//   return (
//     <div className="">
//       <h1 className="text-2xl font-bold mb-6">All Tasks</h1>
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
//         <div className="flex flex-wrap gap-4">
//           <div className="flex-1 min-w-64">
//             <div className="relative">
//               <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//               <input
//                 type="text"
//                 placeholder="Search tasks or projects..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               />
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <Filter className="h-4 w-4 text-gray-400" />
//             <select
//               value={statusFilter}
//               onChange={(e) => setStatusFilter(e.target.value)}
//               className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//             >
//               <option value="all">All Status</option>
//               {taskStatuses.map((status) => (
//                 <option key={status} value={status}>{status}</option>
//               ))}
//             </select>
//             {currentUser?.role === 'Admin' && (
//               <select
//                 value={assigneeFilter}
//                 onChange={(e) => setAssigneeFilter(e.target.value)}
//                 className="border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value="all">All Assignees</option>
//                 {uniqueUsers.map((user) => (
//                   <option key={user.id} value={user.name}>{user.name}</option>
//                 ))}
//               </select>
//             )}
//           </div>
//         </div>
//       </div>
//       {loading ? (
//         <div className="text-center py-10 text-gray-500">
//           <p className="text-lg font-semibold">Loading tasks...</p>
//         </div>
//       ) : allTasks.length === 0 ? (
//         <div className="text-center py-10 text-gray-500">
//           <p className="text-lg font-semibold">📋 No tasks found</p>
//         </div>
//       ) : (
//         <table className="w-full bg-white shadow rounded-lg overflow-hidden">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="text-left py-3 px-4 font-medium text-gray-900">Task</th>
//               <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
//               <th className="text-left py-3 px-4 font-medium text-gray-900">Phase</th>
//               <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
//               {currentUser?.role === 'Admin' && (
//                 <th className="text-left py-3 px-4 font-medium text-gray-900">Assignee</th>
//               )}
//               <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {filteredTasks.map((task) => (
//               <tr key={`${task.projectId}-${task.phaseId}-${task.id}`} className="hover:bg-gray-50">
//                 <td className="py-4 px-4 font-medium text-gray-800">{task.name}</td>
//                 <td className="py-4 px-4">{task.projectName}</td>
//                 <td className="py-4 px-4">{task.phaseName}</td>
//                 <td className="py-4 px-4">{getStatusBadge(task.status)}</td>
//                 {currentUser?.role === 'Admin' && (
//                   <td className="py-4 px-4">
//                     <div className="flex items-center space-x-2">
//                       <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
//                         <User className="h-3 w-3 text-blue-600" />
//                       </div>
//                       <span className="text-sm text-gray-900">{task.user_name}</span>
//                     </div>
//                   </td>
//                 )}
//                 <td className="py-4 px-4">
//                   <button
//                     onClick={() => handleViewTask(task.name, task.id, task.equipment_id, task.status_id)}
//                     className={`text-gray-600 hover:text-blue-600 ${!task.validUser && 'opacity-50 cursor-not-allowed'}`}
//                     title={!task.validUser ? "You are not allowed to access this task" : "View Document"}
//                     disabled={!task.validUser}
//                   >
//                     <FileText className="h-6 w-6 text-black hover:text-gray-700" />
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default ProjectTasks;
// *********************************************************************************************

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Api_url } from '../../../../networkCalls/Apiurls';
import { Project, Task } from '../types';
import { FileText, CheckCircle, Clock, Search, Filter, User, MessageSquare, FileEdit } from 'lucide-react';
import MicroscopeLoader from '../../../../../public/MicroscopeLoader';
import { showError, showSuccess } from '../../../../services/toasterService';
import { ToastContainer } from 'react-toastify';
import { mdToHtml } from '../../../../../public/mdtohtml';
import { htmlWithPermissions } from '../../../../../public/htmlWithPermissions';
// import Cropper from 'cropperjs';
// import "cropperjs/cropper.css"; //version 1 of snip
import Cropper from 'react-easy-crop'; //version 2 of snip
import { createRoot } from 'react-dom/client';

interface TaskManagerProps {
  onCreateTask: (projectId?: string) => void;
  onUpdateTask: (updatedTask: Task, projectId: string, phaseId: string) => void;
  onDeleteTask: (taskId: string, projectId: string, phaseId: string) => void;
}

interface FormElementState {
  radio: { [key: string]: string }; // Maps radio group name to selected value
  select: { [key: string]: string }; // Maps select element identifier to selected value
  checkbox: Record<string, string>; // Maps checkbox name to checked state
  reasons: Record<string, string>; // Maps reason name to text content
  [key: string]: any; // For file inputs
  initials?: Record<string, string>;   // <-- optional, may be empty if not captured
}

// Hook to handle table-related events (radio, dropdown, inputs) and sync updates via WebSocket
const useTableEvents = (
  editorRef: React.MutableRefObject<any>,
  wsRef: React.MutableRefObject<WebSocket | null>,
  currentUser: { id: string; name: string; role: string; roleId: number },
  contentRef: React.MutableRefObject<string>,
  setContent: React.Dispatch<React.SetStateAction<string>>,
  formStateRef: React.MutableRefObject<FormElementState>,
  hasInitialized: React.MutableRefObject<boolean>,
  onSystemFailureExit?: () => void   // <-- new callback

) => {
  const triggerWebSocketUpdate = useCallback((content: string, formState: FormElementState) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not open, cannot send update. ReadyState:', wsRef.current?.readyState);
      return;
    }

    let bookmark = null;
    try {
      if (editorRef.current?.selection) {
        bookmark = editorRef.current.selection.getBookmark(2, true);
      }
    } catch (err) {
      console.warn('Failed to get bookmark on change:', err);
    }
    const updatedContent = htmlWithPermissions(content, currentUser.id, formState);
    console.log(updatedContent, '!!!!!!!!!!!!!!!!!!!!!updatedContent!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    const message = {
      type: 'content_update',
      content: updatedContent,
      cursor: bookmark,
      client_id: String(currentUser.id),
      username: currentUser.name,
      formState,
    };

    try {
      wsRef.current.send(JSON.stringify(message));
      console.log('WebSocket message sent:', { content: updatedContent.substring(0, 100) + '...', formState });
      contentRef.current = updatedContent;
      setContent(updatedContent);
      formStateRef.current = formState;
    } catch (err) {
      console.error('Failed to send WebSocket message:', err);
    }
  }, [wsRef, currentUser, editorRef, contentRef, setContent, formStateRef]);

  const captureFormState = useCallback(() => {
    const formState: FormElementState = { radio: {}, select: {}, checkbox: {}, reasons: {} };
    const iframeDoc = editorRef.current?.iframeElement?.contentDocument;
    if (!iframeDoc) {
      console.warn('Iframe document not available for capturing form state');
      return formState;
    }

    // --- Radios (Pass/Fail + Yes/No) captured row by row ---
    const radiorows = iframeDoc.querySelectorAll('tbody tr');
    radiorows.forEach((row, rowIndex) => {
      // --- Pass/Fail radios ---
      const passFailName = `pf-result-${rowIndex}`;
      const passFailChecked = row.querySelector(
        `input[type="radio"][name="${passFailName}"]:checked`
      ) as HTMLInputElement | null;

      if (passFailChecked) {
        formState.radio[passFailName] = passFailChecked.value;
      }

      // --- Yes/No radios ---
      const yesNoName = `ar-yesno-${rowIndex}`;
      const yesNoChecked = row.querySelector(
        `input[type="radio"][name="${yesNoName}"]:checked`
      ) as HTMLInputElement | null;

      if (yesNoChecked) {
        formState.radio[yesNoName] = yesNoChecked.value;
      }
    });


    // Selects (use their explicit name attr as key)
    const selects = iframeDoc.querySelectorAll('select');
    selects.forEach((select: HTMLSelectElement) => {
      const key = select.name || select.getAttribute('data-select-key') || '';
      if (key) {
        formState.select[key] = select.value;
      }
    });



    // Capture checkboxes with consistent names
    const checkboxes = iframeDoc.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox: HTMLInputElement) => {
      let cbName = checkbox.name;
      const row = checkbox.closest('tr');
      const rowIndex = row ? row.getAttribute('data-row-index') : null;

      if (rowIndex !== null) {
        cbName = `evidence-required-${rowIndex}`;
        checkbox.name = cbName;
      }
      formState.checkbox[cbName] = checkbox.checked ? 'checked' : '';
    });

    // Capture Initial/Date & Evidence file inputs separately
    const rows = iframeDoc.querySelectorAll('tbody tr');
    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll('td');
      const table = iframeDoc.querySelector('table');
      const headerCells = Array.from(table?.querySelectorAll('thead th') || []);

      const evidenceIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'evidence');
      const initialDateIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase().includes('initial/date'));

      if (initialDateIndex !== -1) {
        const fileInput = cells[initialDateIndex]?.querySelector('input[type="file"]') as HTMLInputElement;
        formState[`initial-file-${rowIndex}`] = fileInput?.files?.length ? fileInput.files[0].name : '';
      }

      if (evidenceIndex !== -1) {
        const fileInput = cells[evidenceIndex]?.querySelector('input[type="file"]') as HTMLInputElement;
        formState[`evidence-${rowIndex}`] = fileInput?.files?.length ? fileInput.files[0].name : '';
      }
    });

    // "If no, describe" content
    const reasons = iframeDoc.querySelectorAll('div[data-reason-name]');
    reasons.forEach((div: HTMLElement) => {
      const key = div.dataset.reasonName || '';
      if (key) formState.reasons[key] = div.textContent || '';
    });

    console.log('Captured form state:', formState);
    return formState;
  }, [editorRef]);



  const restoreFormState = useCallback((formState: FormElementState) => {
    const iframeDoc = editorRef.current?.iframeElement?.contentDocument;
    if (!iframeDoc) {
      console.warn('Iframe document not available for restoring form state');
      return;
    }

    // Radios
    Object.entries(formState.radio || {}).forEach(([name, value]) => {
      const selected = iframeDoc.querySelector(
        `input[type="radio"][name="${name}"][value="${value}"]`
      ) as HTMLInputElement | null;

      if (selected) {
        selected.checked = true;
        selected.setAttribute('checked', 'checked');
      } else {
        console.warn(`Radio not found for name=${name}, value=${value}`);
      }

      // Uncheck others in same group
      iframeDoc.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((r: HTMLInputElement) => {
        if (r.value !== value) {
          r.checked = false;
          r.removeAttribute('checked');
        }
      });
    });

    // Selects
    Object.entries(formState.select || {}).forEach(([key, value]) => {
      const select = iframeDoc.querySelector(`select[name="${key}"]`) as HTMLSelectElement | null;
      if (select) {
        select.value = value;
        select.setAttribute('data-selected-user', value);

        select.querySelectorAll('option').forEach((opt) => {
          if (opt.value === value) {
            opt.setAttribute('selected', 'selected');
          } else {
            opt.removeAttribute('selected');
          }
        });
      }

    });


    // Checkboxes
    Object.entries(formState.checkbox || {}).forEach(([name, isChecked]) => {
      const checkbox = iframeDoc.querySelector(`input[type="checkbox"][name="${name}"]`) as HTMLInputElement | null;
      if (checkbox) {
        const checked = isChecked === 'checked';
        checkbox.checked = checked;
        if (checked) checkbox.setAttribute('checked', 'checked');
        else checkbox.removeAttribute('checked');
      }
    });

    // ✅ Restore file names
    const rows = iframeDoc.querySelectorAll('tbody tr');
    rows.forEach((row, rowIndex) => {
      const table = iframeDoc.querySelector('table');
      const headerCells = Array.from(table?.querySelectorAll('thead th') || []);
      const cells = row.querySelectorAll('td');

      const evidenceIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'evidence');
      const initialDateIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase().includes('initial/date'));

      // Initial/Date
      if (initialDateIndex !== -1 && formState[`initial-file-${rowIndex}`]) {
        const cell = cells[initialDateIndex];
        cell.innerHTML += `<div class="uploaded-file"><a href="/uploads/${formState[`initial-file-${rowIndex}`]}" target="_blank">${formState[`initial-file-${rowIndex}`]}</a></div>`;
        cell.innerHTML += `<div class="uploaded-file"><a href="/uploads/${formState[`initial-file-${rowIndex}`]}" target="_blank">${formState[`initial-file-${rowIndex}`]}</a></div>`;

      }

      // Evidence
      if (evidenceIndex !== -1 && formState[`evidence-${rowIndex}`]) {
        const cell = cells[evidenceIndex];
        cell.innerHTML += `<div class="uploaded-file"><a href="/uploads/${formState[`evidence-${rowIndex}`]}" target="_blank">${formState[`evidence-${rowIndex}`]}</a></div>`;
      }
    });

    // Reasons
    Object.entries(formState.reasons || {}).forEach(([name, value]) => {
      const div = iframeDoc.querySelector(`div[data-reason-name="${name}"]`) as HTMLElement | null;
      if (div) div.textContent = value;
    });

    // Re-apply permissioned HTML after restoring
    const rawHtml = iframeDoc.body.innerHTML;
    const permissionedHtml = htmlWithPermissions(rawHtml, currentUser.id, formState);
    editorRef.current?.setContent(permissionedHtml);
  }, [editorRef, currentUser]);

  const handleRadioChange = useCallback((e: Event) => {
    if (!hasInitialized.current) {
      console.log('Skipping radio change: editor not initialized');
      return;
    }
    const target = e.target as HTMLInputElement;
    if (target.type !== 'radio' || !target.checked) {
      console.log('Skipping radio change: not a checked radio button');
      return;
    }

    console.log('Handling radio change:', { name: target.name, value: target.value });

    setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) {
        console.warn('Editor not available for radio change');
        return;
      }

      const iframeDoc = editor.iframeElement?.contentDocument;
      if (!iframeDoc) {
        console.warn('Iframe document not available for radio change');
        return;
      }

      const currentRow = target.closest('tr');
      if (!currentRow) {
        console.warn('Current row not found for radio change');
        return;
      }

      const rowIndex = parseInt(currentRow.getAttribute('data-row-index') || '0', 10);

      const radioName = target.name;
      console.log(radioName, 'radioName');

      // ✅ Update only that radio group
      iframeDoc.querySelectorAll(`input[type="radio"][name="${radioName}"]`).forEach((radio: HTMLInputElement) => {
        radio.checked = radio.value === target.value;
        if (radio.checked) radio.setAttribute('checked', 'checked');
        else radio.removeAttribute('checked');
      });

      // ✅ If this is the Actual Result Yes/No radio group
      if (radioName.startsWith('ar-yesno-')) {
        const reasonDiv = currentRow.querySelector<HTMLDivElement>(`div[data-reason-name="reason-${rowIndex}"]`);
        if (reasonDiv) {
          if (target.value === 'no') {
            reasonDiv.style.display = 'block';
            reasonDiv.setAttribute('contenteditable', 'true');

            // Prepend bold label if not already present
            if (!reasonDiv.querySelector('strong')) {
              const existingText = reasonDiv.innerHTML.trim();
              reasonDiv.innerHTML = `<strong>If No, Describe: </strong>${existingText}`;
            }
          } else {
            reasonDiv.style.display = 'none';
            reasonDiv.setAttribute('contenteditable', 'false');
          }
        }
      }

      // 🔄 Sync back into content + formState
      const updatedContent = editor.getContent({ format: 'raw' });
      const formState = captureFormState();
      const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);

      triggerWebSocketUpdate(permissionedContent, formState);
      editor.setContent(permissionedContent);
      attachTableListeners();
      attachSignOffListeners();
    }, 0);
  }, [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]);

  // const handleSignOffClick = useCallback(
  //   (e: Event, taskId: string) => {
  //     const target = e.currentTarget as HTMLButtonElement;
  //     if (!target.classList.contains("signoff-btn")) return;

  //     const title = target.getAttribute("data-title");
  //     const rowIndex = target.getAttribute("data-row-index");
  //     const row = target.closest("tr") as HTMLTableRowElement | null;

  //     if (currentUser.role === "Executor") {
  //       if (!row || !title || rowIndex === null) return;

  //       // ✅ Validation: Ensure Actual Result + Pass/Fail are selected
  //       const actualResult = row.querySelector<HTMLInputElement>(
  //         `input[name="ar-yesno-${title}-${rowIndex}"]:checked`
  //       );
  //       const passFail = row.querySelector<HTMLInputElement>(
  //         `input[name="pf-result-${title}-${rowIndex}"]:checked`
  //       );

  //       if (!actualResult || !passFail) {
  //         showError("⚠️ Please select Actual Result and Pass/Fail before signing off.");
  //         return;
  //       } else {
  //         row.setAttribute("data-signed", "true");
  //       }
  //     }
  //     console.log(`✅ Sign Off clicked for table=${title}, row=${rowIndex}`);

  //     // 🔒 Mark button as completed
  //     target.setAttribute("data-completed", "true");
  //     target.disabled = true;
  //     target.style.opacity = "0.5";

  //     // 📅 Date + initials
  //     const now = new Date();
  //     const dateStr = now.toLocaleDateString("en-GB", {
  //       day: "2-digit",
  //       month: "short",
  //       year: "numeric",
  //     });
  //     const getInitials = (fullName: string) => {
  //       if (!fullName) return "";
  //       const parts = fullName.trim().split(/\s+/);
  //       return parts.length > 1
  //         ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
  //         : parts[0][0].toUpperCase();
  //     };
  //     const initials = getInitials(currentUser.name);

  //     // ✅ Save initials into formState
  //     const currentFormState = captureFormState();
  //     currentFormState.initials = {
  //       ...currentFormState.initials,
  //       [`initial-${title}-${rowIndex}`]: initials + " / " + dateStr,
  //     };

  //     // 👤 Show initials + date after button (UI only)
  //     if (
  //       !target.nextElementSibling ||
  //       !target.nextElementSibling.classList.contains("signoff-meta")
  //     ) {
  //       const span = document.createElement("span");
  //       span.className = "signoff-meta";
  //       span.style.marginLeft = "8px";
  //       span.style.fontWeight = "bold";
  //       span.style.fontSize = "0.9em";
  //       span.textContent = `${initials} - ${dateStr}`;
  //       target.insertAdjacentElement("afterend", span);
  //     }

  //     // 🔄 Persist + WebSocket update + editor refresh
  //     setTimeout(() => {
  //       const editor = editorRef.current;
  //       if (!editor) return;

  //       // Disable signed-off row completely
  //       // row.querySelectorAll("input, select, button").forEach((el) => {
  //       //   (el as HTMLInputElement | HTMLButtonElement | HTMLSelectElement).disabled = true;
  //       // });

  //       // Enable next row if assigned to this user
  //       const nextRow = row.nextElementSibling as HTMLTableRowElement | null;
  //       if (nextRow) {
  //         const assignedUser = nextRow
  //           .querySelector("select")
  //           ?.getAttribute("data-selected-user");

  //         nextRow.querySelectorAll("input, select, button").forEach((el) => {
  //           (el as HTMLInputElement | HTMLButtonElement | HTMLSelectElement).disabled =
  //             assignedUser !== String(currentUser.id);
  //         });
  //       }

  //       // Refresh editor content with permissions
  //       const updatedContent = editor.getContent({ format: "raw" });
  //       const formState = captureFormState();
  //       const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);

  //       editor.setContent(permissionedContent);

  //       // 🔔 WebSocket update
  //       if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
  //         wsRef.current.send(
  //           JSON.stringify({
  //             type: "content_update",
  //             taskId,
  //             content: permissionedContent,
  //             formState,
  //             client_id: String(currentUser.id),
  //             username: currentUser.name,
  //           })
  //         );
  //       }

  //       // --- Feedback only (API commented out) ---
  //       // showSuccess("✅ Test case submitted and next row enabled");

  //       // 🔧 API call (disabled for now)
  //       const replyData = {
  //         // project_id: 1,
  //         // project_phase_id: 1,
  //         project_task_id: Number(taskId),
  //         // document: permissionedContent,
  //         document_json: permissionedContent,
  //         created_by: currentUser.id,
  //         // updated_by: currentUser.id,
  //         // submitted_by: currentUser.id,
  //         // approved_by: currentUser.id,
  //         // status_id: 1,
  //       };

  //       fetch(Api_url.save_task_documnet, {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(replyData),
  //       })
  //         .then((response) => response.json())
  //         .then((result) => {
  //           if (result.status_code === 200) {
  //             showSuccess(
  //               currentUser.role === "Executor"
  //                 ? "Test case Submitted successfully.."
  //                 : "Sign Off Completed, You can submit the document."
  //             );
  //           } else {
  //             showError(`Error: ${result.message || "Unknown error"}`);
  //           }
  //         })
  //         .catch((error: any) => {
  //           showError(`Network error: ${error.message}`);
  //         });

  //     }, 0);
  //   },
  //   [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]
  // );


  const handleSignOffClick = useCallback(
    (e: Event, taskId: string) => {
      const target = e.currentTarget as HTMLButtonElement;
      if (!target.classList.contains("signoff-btn")) return;

      const title = target.getAttribute("data-title");
      const rowIndex = Number(target.getAttribute("data-row-index"));
      const row = target.closest("tr") as HTMLTableRowElement | null;


      if (currentUser.role === "SIgn Off") {
        if (!row || !title || isNaN(rowIndex)) return;

        // ✅ Stamp initials into row
        const initials = currentUser.name
          .split(" ")
          .map(n => n[0])
          .join("")
          .toUpperCase();

        // Add initials into a cell (last cell of the row for example)
        let initialsCell = row.querySelector(".signoff-initials");
        if (!initialsCell) {
          initialsCell = document.createElement("td");
          initialsCell.classList.add("signoff-initials");
          row.appendChild(initialsCell);
        }
        initialsCell.textContent = initials;

        // Mark row signed
        row.setAttribute("data-signed", "true");

        // Proceed with normal signoff flow (disable current row + enable next)
        // proceedWithSignOff(target, title, String(rowIndex), row, taskId);
        return;
      }


      if (currentUser.role === "Executor") {
        if (!row || !title || isNaN(rowIndex)) return;

        // ✅ Validation
        const actualResult = row.querySelector<HTMLInputElement>(
          `input[name="ar-yesno-${title}-${rowIndex}"]:checked`
        );
        const passFail = row.querySelector<HTMLInputElement>(
          `input[name="pf-result-${title}-${rowIndex}"]:checked`
        );

        if (!actualResult || !passFail) {
          showError("⚠️ Please select Actual Result and Pass/Fail before signing off.");
          return;
        }

        // Check if failed
        if (passFail.value.toLowerCase() === "fail") {
          // Popup modal
          const modal = document.createElement("div");
          modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
          `;

          const modalContent = document.createElement("div");
          modalContent.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 420px;
            width: 100%;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          `;

          modalContent.innerHTML = `
            <h3 style="margin: 0; font-size: 1.25rem; font-weight: 600; color: #333; text-align: center;">
              Reason for Test Case Failure
            </h3>
            
            <div style="display: flex; justify-content: center; gap: 15px; margin: 20px 0;">
              <button id="test-case-btn" class="failure-btn" data-type="testcase"
                style="flex: 1; padding: 10px; background: #0ed99cff; color: black; border: none; 
                      border-radius: 6px; cursor: pointer; font-weight: 500; transition: 0.4s;">
                Test Case Failure
              </button>
              <button id="system-btn" class="failure-btn" data-type="system"
                style="flex: 1; padding: 10px; background: #d56f1bff; color: black; border: none; 
                      border-radius: 6px; cursor: pointer; font-weight: 500; transition: 0.4s;">
                System Failure
              </button>
            </div>

            <div style="margin-top: 10px;">
              <label style="display: block; margin-bottom: 6px; font-weight: 500; color: #555;">
                Comment:
              </label>
              <textarea id="failure-comment" 
                style="width: 100%; min-height: 90px; padding: 8px; border: 1px solid #ccc; 
                      border-radius: 6px; resize: vertical; font-size: 0.9rem;"></textarea>
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
              <button id="cancel-btn" 
                style="padding: 8px 16px; background: #6c757d; color: white; border: none; 
                      border-radius: 6px; cursor: pointer; font-weight: 500;">
                Cancel
              </button>
              <button id="submit-btn" 
                style="padding: 8px 16px; background: #198754; color: white; border: none; 
                      border-radius: 6px; cursor: pointer; font-weight: 500;">
                Submit
              </button>
            </div>
          `;

          modal.appendChild(modalContent);
          document.body.appendChild(modal);

          let selectedFailure: "testcase" | "system" | null = null;

          // Button handlers
          const testCaseBtn = modalContent.querySelector("#test-case-btn") as HTMLButtonElement;
          const systemBtn = modalContent.querySelector("#system-btn") as HTMLButtonElement;
          const cancelBtn = modalContent.querySelector("#cancel-btn") as HTMLButtonElement;
          const submitBtn = modalContent.querySelector("#submit-btn") as HTMLButtonElement;

          testCaseBtn.onclick = () => {
            selectedFailure = "testcase";
            testCaseBtn.style.opacity = "0.6";
            systemBtn.style.opacity = "1";
          };
          systemBtn.onclick = () => {
            selectedFailure = "system";
            systemBtn.style.opacity = "0.6";
            testCaseBtn.style.opacity = "1";
          };
          cancelBtn.onclick = () => modal.remove();

          submitBtn.addEventListener("click", async () => {
            if (!selectedFailure) {
              showError("Please select a failure type (Test Case Failure or System Failure).");
              return;
            }
            const comment = (modalContent.querySelector("#failure-comment") as HTMLTextAreaElement).value.trim();
            if (!comment) {
              showError("Please provide a comment.");
              return;
            }

            const editor = editorRef.current;
            if (!editor) return;

            const updatedContent = editor.getContent({ format: "raw" });
            const formState = captureFormState();
            const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);

            const incidentData = {
              incident_type_id: selectedFailure === "testcase" ? 1 : 2,
              project_task_id: Number(taskId),
              test_script_name: title,
              testcase_number: String(rowIndex + 1),
              incident_comment: comment,
              raised_by: currentUser.id,
              document: permissionedContent,
            };

            try {
              const response = await fetch(Api_url.raise_incident, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(incidentData),
              });
              const result = await response.json();

              if (response.ok && result.status !== "error") {
                if (selectedFailure === "testcase") {
                  // ---- persist to formState ----
                  formState.radio = {
                    ...(formState.radio || {}),
                    [`pf-result-${title}-${rowIndex}`]: "pass",
                  };
                  formState.comments = {
                    ...(formState.comments || {}),
                    [`comment-${title}-${rowIndex}`]: comment,
                  };

                  // ---- force DOM to Pass (uncheck Fail) ----
                  const radios = row?.querySelectorAll<HTMLInputElement>(
                    `input[name="pf-result-${title}-${rowIndex}"]`
                  );
                  row.setAttribute("data-signed", "true");

                  if (radios && radios.length) {
                    radios.forEach(r => {
                      r.checked = r.value === "pass";
                      // fire change so any bindings / captureFormState readers update
                      r.dispatchEvent(new Event("change", { bubbles: true }));
                      r.dispatchEvent(new Event("input", { bubbles: true }));
                    });
                  }

                  // ---- rebuild editor content BEFORE sign-off so captureFormState sees Pass ----
                  const raw = editorRef.current?.getContent({ format: "raw" });
                  const permissioned = htmlWithPermissions(raw, currentUser.id, formState);
                  editorRef.current?.setContent(permissioned);

                  showSuccess("Test case issue reported. Marked as Pass.");
                  modal.remove();

                  // continue (this will disable current row + enable the next one)
                  // proceedWithSignOff(target, title, String(rowIndex), row, taskId);
                  proceedWithSignOff(target, title, String(rowIndex), row, taskId, formState, false);

                }
                else {
                  // ❌ System Issue → keep as Fail
                  formState.failureDetails = {
                    ...formState.failureDetails,
                    [`failure-${title}-${rowIndex}`]: { reason: "system", comment, raiseIncident: true },
                  };
                  // proceedWithSignOff(target, title, String(rowIndex), row, taskId, captureFormState());
                  // proceedWithSignOff(target, title, String(rowIndex), row, taskId, formState, true);

                  // showSuccess("System issue reported.");
                  modal.remove();
                  showSuccess("You have raised an Incident, will resume execution after Incident resolved.");

                  // 🚪 Exit to Tasks screen via callback
                  if (onSystemFailureExit) {
                    onSystemFailureExit();
                  }

                  // 🚪 Exit to Tasks screen
                  // setViewDoc(false);
                  // navigate("/tasks");
                }
              } else {
                throw new Error(result.message || "Failed to raise incident");
              }
            } catch (err: any) {
              showError(`Failed to raise incident: ${err.message}`);
              modal.remove();
            }
          });


          return; // stop here until popup resolved
        } else {
          row.setAttribute("data-signed", "true");
          proceedWithSignOff(target, title, String(rowIndex), row, taskId);

        }
      }

      // Normal signoff
      // proceedWithSignOff(target, title, String(rowIndex), row, taskId);
    },
    [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]
  );

  // const proceedWithSignOff = (
  //   target: HTMLButtonElement,
  //   title: string | null,
  //   rowIndex: string | null,
  //   row: HTMLTableRowElement | null,
  //   taskId: string,
  //   preCapturedFormState?: ReturnType<typeof captureFormState> // optional
  // ) => {
  //   console.log(`✅ Sign Off clicked for table=${title}, row=${rowIndex}`);

  //   const currentFormState = preCapturedFormState || captureFormState();

  //   // ✅ Ensure testcase marked as Pass (unless already handled with a comment)
  //   if (title?.toLowerCase().includes("testcase") && rowIndex) {
  //     currentFormState.statuses = {
  //       ...currentFormState.statuses,
  //       [`status-${title}-${rowIndex}`]: "pass",
  //     };
  //     const key = `comment-${title}-${rowIndex}`;
  //     if (!currentFormState.comments?.[key]) {
  //       currentFormState.comments = {
  //         ...currentFormState.comments,
  //         [key]: "Test case passed on sign-off",
  //       };
  //     }
  //   }

  //   // 🔒 Mark button + disable entire row
  //   target.setAttribute("data-completed", "true");
  //   target.disabled = true;
  //   target.style.opacity = "0.5";

  //   if (row) {
  //     // Disable all inputs in current row
  //     row.querySelectorAll("input, select, button").forEach((el) => {
  //       (el as HTMLInputElement | HTMLButtonElement | HTMLSelectElement).disabled = true;
  //     });

  //     // Enable next row if assigned to current user
  //     const nextRow = row.nextElementSibling as HTMLTableRowElement | null;
  //     if (nextRow) {
  //       const assignedUser = nextRow.querySelector("select")?.getAttribute("data-selected-user");
  //       nextRow.querySelectorAll("input, select, button").forEach((el) => {
  //         (el as HTMLInputElement | HTMLButtonElement | HTMLSelectElement).disabled =
  //           assignedUser !== String(currentUser.id);
  //       });
  //     }
  //   }

  //   // 📅 Add initials + timestamp
  //   const now = new Date();
  //   const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  //   const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  //   const getInitials = (fullName: string) => {
  //     if (!fullName) return "";
  //     const parts = fullName.trim().split(/\s+/);
  //     return parts.length > 1
  //       ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
  //       : parts[0][0].toUpperCase();
  //   };
  //   const initials = getInitials(currentUser.name);

  //   currentFormState.initials = {
  //     ...currentFormState.initials,
  //     [`initial-${title}-${rowIndex}`]: `${initials} / ${dateStr} ${timeStr}`,
  //   };

  //   if (!target.nextElementSibling || !target.nextElementSibling.classList.contains("signoff-meta")) {
  //     const span = document.createElement("span");
  //     span.className = "signoff-meta";
  //     span.style.marginLeft = "8px";
  //     span.style.fontWeight = "bold";
  //     span.style.fontSize = "0.9em";
  //     span.textContent = `${initials} - ${dateStr} ${timeStr}`;
  //     target.insertAdjacentElement("afterend", span);
  //   }

  //   // 🖱️ Add row click → show comment
  //   if (row && title && rowIndex && currentFormState.comments?.[`comment-${title}-${rowIndex}`]) {
  //     row.style.cursor = "pointer";
  //     row.onclick = () => {
  //       const c = currentFormState.comments?.[`comment-${title}-${rowIndex}`] || "No comment available";
  //       alert(`Comment for ${title}, row ${rowIndex}: ${c}`);
  //     };
  //   }

  //   // 🔄 Persist + WebSocket + API call
  //   setTimeout(() => {
  //     const editor = editorRef.current;
  //     if (!editor) return;

  //     const updatedContent = editor.getContent({ format: "raw" });
  //     const fs = currentFormState; // ✅ use updated state (don’t recapture)
  //     const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, fs);
  //     editor.setContent(permissionedContent);

  //     // 🔔 WebSocket update
  //     if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
  //       wsRef.current.send(
  //         JSON.stringify({
  //           type: "content_update",
  //           taskId,
  //           content: permissionedContent,
  //           formState: fs,
  //           client_id: String(currentUser.id),
  //           username: currentUser.name,
  //         })
  //       );
  //     }

  //     // 🔧 API call to save
  //     const replyData = {
  //       project_id: 1,
  //       project_phase_id: 1,
  //       project_task_id: Number(taskId),
  //       // document: permissionedContent,
  //       document_json: permissionedContent,
  //       created_by: currentUser.id,
  //       updated_by: currentUser.id,
  //       submitted_by: currentUser.id,
  //       approved_by: currentUser.id,
  //       status_id: title?.toLowerCase().includes("testcase") ? 2 : 1,
  //     };

  //     fetch(Api_url.save_task_documnet, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(replyData),
  //     })
  //       .then((r) => r.json())
  //       .then((result) => {
  //         if (result.status_code === 200) {
  //           showSuccess(
  //             currentUser.role === "Executor"
  //               ? "Test case submitted successfully."
  //               : "Sign Off completed, you can submit the document."
  //           );
  //         } else {
  //           showError(`Error: ${result.message || "Unknown error"}`);
  //         }
  //       })
  //       .catch((error: any) => showError(`Network error: ${error.message}`));
  //   }, 0);
  // };

  const proceedWithSignOff = (
    target: HTMLButtonElement,
    title: string | null,
    rowIndex: string | null,
    row: HTMLTableRowElement | null,
    taskId: string,
    preCapturedFormState?: ReturnType<typeof captureFormState>, // optional
    systemFailure: boolean = false
  ) => {
    console.log(`✅ Sign Off clicked for table=${title}, row=${rowIndex}, systemFailure=${systemFailure}`);

    const currentFormState = preCapturedFormState || captureFormState();

    if (!systemFailure) {
      // ✅ Normal sign-off flow (force PASS if testcase)
      if (title?.toLowerCase().includes("testcase") && rowIndex) {
        currentFormState.statuses = {
          ...currentFormState.statuses,
          [`status-${title}-${rowIndex}`]: "pass",
        };
        const key = `comment-${title}-${rowIndex}`;
        if (!currentFormState.comments?.[key]) {
          currentFormState.comments = {
            ...currentFormState.comments,
            [key]: "Test case passed on sign-off",
          };
        }
      }
    } else {
      // ❌ System failure → clear pass/fail
      if (title && rowIndex) {
        delete currentFormState.statuses?.[`status-${title}-${rowIndex}`];
        delete currentFormState.radio?.[`pf-result-${title}-${rowIndex}`];

        // Also clear DOM radios if present
        const radios = row?.querySelectorAll<HTMLInputElement>(
          `input[name="pf-result-${title}-${rowIndex}"]`
        );
        radios?.forEach(r => (r.checked = false));
      }
    }

    // 🔒 Mark button + disable entire row
    target.setAttribute("data-completed", "true");
    target.disabled = true;
    target.style.opacity = "0.5";

    if (row) {
      row.querySelectorAll("input, select, button").forEach((el) => {
        (el as HTMLInputElement | HTMLButtonElement | HTMLSelectElement).disabled = true;
      });

      // Enable next row if assigned to current user
      const nextRow = row.nextElementSibling as HTMLTableRowElement | null;
      if (nextRow) {
        const assignedUser = nextRow.querySelector("select")?.getAttribute("data-selected-user");
        nextRow.querySelectorAll("input, select, button").forEach((el) => {
          (el as HTMLInputElement | HTMLButtonElement | HTMLSelectElement).disabled =
            assignedUser !== String(currentUser.id);
        });
      }
    }

    // 📅 Add initials + timestamp
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    const timeStr = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

    const getInitials = (fullName: string) => {
      if (!fullName) return "";
      const parts = fullName.trim().split(/\s+/);
      return parts.length > 1
        ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
        : parts[0][0].toUpperCase();
    };
    const initials = getInitials(currentUser.name);

    currentFormState.initials = {
      ...currentFormState.initials,
      [`initial-${title}-${rowIndex}`]: `${initials} / ${dateStr} ${timeStr}`,
    };

    if (!target.nextElementSibling || !target.nextElementSibling.classList.contains("signoff-meta")) {
      const span = document.createElement("span");
      span.className = "signoff-meta";
      span.style.marginLeft = "8px";
      span.style.fontWeight = "bold";
      span.style.fontSize = "0.9em";
      span.textContent = `${initials} - ${dateStr} ${timeStr}`;
      target.insertAdjacentElement("afterend", span);
    }

    // 🔄 Persist + WebSocket + API call
    setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) return;

      const updatedContent = editor.getContent({ format: "raw" });
      const fs = currentFormState; // ✅ use updated state
      const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, fs);
      editor.setContent(permissionedContent);

      // 🔔 WebSocket update
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "content_update",
            taskId,
            content: permissionedContent,
            formState: fs,
            client_id: String(currentUser.id),
            username: currentUser.name,
          })
        );
      }

      // 🔧 API call to save
      const replyData = {
        project_id: 1,
        project_phase_id: 1,
        project_task_id: Number(taskId),
        document_json: permissionedContent,
        created_by: currentUser.id,
        updated_by: currentUser.id,
        submitted_by: currentUser.id,
        approved_by: currentUser.id,
        status_id: !systemFailure && title?.toLowerCase().includes("testcase") ? 2 : 1,
      };

      fetch(Api_url.save_task_documnet, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(replyData),
      })
        .then((r) => r.json())
        .then((result) => {
          if (result.status_code === 200) {
            showSuccess(
              currentUser.role === "Executor"
                ? (systemFailure
                  ? "System issue saved. Awaiting resolution."
                  : "Test case submitted successfully.")
                : "Sign Off completed, you can submit the document."
            );
          } else {
            showError(`Error: ${result.message || "Unknown error"}`);
          }
        })
        .catch((error: any) => showError(`Network error: ${error.message}`));
    }, 0);
  };

  

  const handleDropdownChange = useCallback((e: Event) => {
    const target = e.target as HTMLSelectElement;
    if (target.tagName !== "SELECT") return;

    console.log("Handling dropdown change:", { value: target.value });

    setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) return;

      const iframeDoc = editor.iframeElement?.contentDocument;
      if (!iframeDoc) return;

      // ✅ update selected user attribute
      target.setAttribute("data-selected-user", target.value);

      console.log("Updated data-selected-user:", target.getAttribute("data-selected-user"));

      // send update to websocket
      const updatedContent = editor.getContent({ format: "raw" });
      const formState = captureFormState();
      const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);

      triggerWebSocketUpdate(permissionedContent, formState);
      // editor.setContent(permissionedContent);
      // attachTableListeners();
    }, 0);
  }, [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]);


  const handleCheckboxChange = useCallback((e: Event) => {
    if (!hasInitialized.current) {
      console.log('Skipping checkbox change: editor not initialized');
      return;
    }

    const target = e.target as HTMLInputElement;
    if (target.type !== 'checkbox') {
      console.log('Skipping checkbox change: not a checkbox');
      return;
    }

    setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) return;

      const updatedContent = editor.getContent({ format: 'raw' });
      const formState = captureFormState();
      const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);

      triggerWebSocketUpdate(permissionedContent, formState);
      editor.setContent(permissionedContent);
      // IMPORTANT: after setContent, DOM is new → reattach events
      attachTableListeners?.();
      attachSignOffListeners();
    }, 0);
  }, [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]);

  const handleFileChange = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target || target.type !== 'file') return;

    const editor = editorRef.current;
    const iframeDoc = editor?.iframeElement?.contentDocument;
    if (!iframeDoc) return;

    const currentRow = target.closest('tr');
    if (!currentRow) return;
    const rowIndex = parseInt(currentRow.getAttribute('data-row-index') || '0', 10);

    const headerCells = Array.from(iframeDoc.querySelector('table')?.querySelectorAll('thead th') || []);
    const actualResultIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'actual result');

    // --- Evidence Upload ---
    if (target.name.startsWith('evidence-')) {
      if (!target.files?.length) {
        showError('Please select an evidence file to upload.');
        return;
      }

      // ✅ Update formState with uploaded file
      const formState = captureFormState();
      formState.evidenceFiles = {
        ...formState.evidenceFiles,
        [`evidence-${rowIndex}`]: target.files?.[0] || null,
      };

      const updatedContent = editor.getContent({ format: 'raw' });
      const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);
      triggerWebSocketUpdate(permissionedContent, formState);
      editor.setContent(permissionedContent);
      return;
    }

    // --- Initial/Date Upload ---
    if (target.name.startsWith('initialdate-')) {
      if (!target.files?.length) {
        showError('Please select a file for Initial/Date.');
        target.value = '';
        return;
      }

      const file = target.files[0];

      // All conditions met: Proceed with upload logic
      // Build formState including file (store under nested initialFiles)
      const formState = captureFormState();
      formState.initialFiles = {
        ...(formState.initialFiles || {}),
        [`initial-file-${rowIndex}`]: file.name,
      };

      const rawHtml = iframeDoc.body.innerHTML;
      const permissionedContent = htmlWithPermissions(rawHtml, currentUser.id, formState);

      contentRef.current = permissionedContent;
      formStateRef.current = formState;
      triggerWebSocketUpdate(permissionedContent, formState);

      editor.setContent(permissionedContent);
      attachTableListeners();
      attachSignOffListeners();
    }
  }, [editorRef, currentUser, captureFormState, triggerWebSocketUpdate]);

  // If file change isn't triggering, it's likely missing here.
  const attachTableListeners = useCallback(() => {
    const iframeDoc = editorRef.current?.iframeElement?.contentDocument;
    if (!iframeDoc) return;

    // Attach radio changes
    iframeDoc.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.removeEventListener('change', handleRadioChange); // Prevent duplicates
      radio.addEventListener('change', handleRadioChange);
    });

    // Attach dropdown changes
    iframeDoc.querySelectorAll('select').forEach((select) => {
      select.removeEventListener('change', handleDropdownChange);
      select.addEventListener('change', handleDropdownChange);
    });

    // Attach signoff button clicks
    iframeDoc.querySelectorAll(".signoff-btn").forEach((btn) => {
      btn.removeEventListener("click", handleSignOffClick as EventListener);
      btn.addEventListener("click", (e) => handleSignOffClick(e, String(currentTaskId)));
    });

    // Attach checkbox changes
    iframeDoc.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.removeEventListener('change', handleCheckboxChange);
      checkbox.addEventListener('change', handleCheckboxChange);
    });



    // Attach file changes (critical for handleFileChange to trigger)
    const fileInputs = iframeDoc.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
    console.log('Attaching listeners to', fileInputs.length, 'file inputs:', Array.from(fileInputs).map(i => i.name)); // Debug
    fileInputs.forEach((input: HTMLInputElement) => {
      // if (!(input as any)._listenerAttached) {
      //   input.setAttribute('multiple', 'true');
      //   input.setAttribute('accept', '.png,.jpeg,.jpg'); // Ensure accept attribute
      //   if (input.name.startsWith('evidence-')) {
      //     console.log('Attaching handleFileUpload to', input.name); // Debug
      //     input.addEventListener('change', handleFileUpload);
      //   } else if (input.name.startsWith('initialdate-')) {
      //     console.log('Attaching handleInitialDateUpload to', input.name); // Debug
      //     input.addEventListener('change', handleInitialDateUpload);
      //   } else {
      //     console.warn('Unrecognized file input name:', input.name);
      //   }
      //   (input as any)._listenerAttached = true;
      // }
    });
    // Add other listeners as needed (e.g., for reasons div input/keyup if required)
  }, [handleRadioChange, handleDropdownChange, handleCheckboxChange, handleFileChange, handleSignOffClick, editorRef]);

  const attachSignOffListeners = () => {
    const editor = editorRef.current;
    if (!editor) return;

    const iframeDoc = editor.iframeElement?.contentDocument;
    if (!iframeDoc) return;

    // Clean up any old listener first
    iframeDoc.removeEventListener("click", iframeClickHandler);

    iframeDoc.addEventListener("click", iframeClickHandler);
  };

  const iframeClickHandler = (e: Event) => {
    const target = e.target as HTMLElement;
    if (target && target.classList.contains("signoff-btn")) {
      // handleSignOffClick(e);
      console.log('sign off clicked...')
    }
  };


  const handleTableEvent = useCallback((e: Event) => {
    const target = e.target as HTMLElement;

    if (target.tagName === 'INPUT') {
      const input = target as HTMLInputElement;
      if (input.type === 'radio') {
        handleRadioChange(e);
        return;
      }
      if (input.type === 'checkbox') {
        handleCheckboxChange(e);
        return;
      }
      if (input.type === 'file') {
        handleFileChange(e);
        return;
      }
      if (input.type === 'button') {
        handleButtonClick(e);
      }
    }

    if (target.tagName === 'SELECT') {
      handleDropdownChange(e);
    }

    // ✅ Sign Off button click
    if (target.tagName === "BUTTON" && target.classList.contains("signoff-btn")) {
      handleSignOffClick(e, currentTaskId);   // <-- add this
      return;
    }
  }, [handleRadioChange, handleDropdownChange, handleCheckboxChange, handleFileChange, handleSignOffClick]);



  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;

    const handleWSMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'content_update' && data.client_id !== String(currentUser.id)) {
          console.log('Received WebSocket message:', { content: data.content.substring(0, 100) + '...', formState: data.formState });
          setContent(data.content);
          editorRef.current?.setContent(data.content);
          if (data.formState) {
            restoreFormState(data.formState);
          }
        }
      } catch (err) {
        console.error('Failed to process WebSocket message:', err);
      }
    };

    ws.addEventListener('message', handleWSMessage);
    ws.addEventListener('open', () => {
      console.log('WebSocket opened');
      if (editorRef.current && hasInitialized.current) {
        const initialContent = editorRef.current.getContent();
        const initialFormState = captureFormState();
        triggerWebSocketUpdate(initialContent, initialFormState);
      }
    });

    return () => {
      ws.removeEventListener('message', handleWSMessage);
    };
  }, [wsRef, currentUser, editorRef, captureFormState, restoreFormState, triggerWebSocketUpdate]);

  return { handleRadioChange, handleDropdownChange, handleCheckboxChange, captureFormState, restoreFormState, handleTableEvent, handleFileChange, handleSignOffClick };
};


const ProjectTasks: React.FC<TaskManagerProps> = ({
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
}) => {
  const { userId } = useParams<{ userId: string }>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: string;
    roleId: number;
  }>({
    id: '',
    name: '',
    email: '',
    role: '',
    roleId: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [viewDoc, setViewDoc] = useState<boolean>(false);
  const editorRef = useRef<any>(null);
  const contentRef = useRef<string>('');
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDocumentMode, setIsDocumentMode] = useState<boolean>(false);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [comments, setComments] = useState<
    {
      id: string;
      task_id: string;
      user: string;
      text: string;
      timestamp: string;
      replies: { reply_id: string; comment: string; replied_by: string; replied_date: string }[];
      showReplyInput: boolean;
      replyText: string;
      status_name: string;
    }[]
  >([]);
  const [newComment, setNewComment] = useState<string>('');
  const [currentTaskId, setCurrentTaskId] = useState<string>('');
  const [curTask, setCurTask] = useState<string>('');
  const [curTaskName, setCurTaskName] = useState<string>('');

  const wsRef = useRef<WebSocket | null>(null);
  const editorId = 'tiny-editor';
  const [cursors, setCursors] = useState<{ [key: string]: { cursor: any; username: string } }>({});
  const pendingMessages = useRef<any[]>([]);
  const editorReady = useRef<boolean>(false);
  const fileInputMapRef = useRef<Map<HTMLInputElement, string[]>>(new Map());
  const formStateRef = useRef<FormElementState>({ radio: {}, select: {} });
  const hasInitialized = useRef(false);
  const [canComment, setCanComment] = useState<boolean>(false);
  const [canReply, setCanReply] = useState<boolean>(false);

  const { handleRadioChange, handleDropdownChange, handleCheckboxChange, captureFormState, restoreFormState, handleSignOffClick, handleTableEvent, handleFileChange } = useTableEvents(
    editorRef,
    wsRef,
    currentUser,
    contentRef,
    setContent,
    formStateRef,
    hasInitialized,
    () => {
      setViewDoc(false);// close document view
    }
  );

  const taskStatuses = [
    'Active',
    'On Hold',
    'Completed',
    'Pending',
    'Reverted',
    'Approved',
    'Closed',
    'Not Yet Started',
  ];

  const triggerWebSocketUpdatetaskmanagr = useCallback((content: string, formState: FormElementState) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not open, cannot send update. ReadyState:', wsRef.current?.readyState);
      return;
    }

    let bookmark = null;
    try {
      if (editorRef.current?.selection) {
        bookmark = editorRef.current.selection.getBookmark(2, true);
      }
    } catch (err) {
      console.warn('Failed to get bookmark on change:', err);
    }
    const updatedContent = htmlWithPermissions(content, currentUser.id, formState);
    // console.log(updatedContent, '!!!!!!!!!!!!!!!!!!!!!updatedContent!!!!!!!!!!!!!!!!!!!!!!!!!!!');
    const message = {
      type: 'content_update',
      content: updatedContent,
      cursor: bookmark,
      client_id: String(currentUser.id),
      username: currentUser.name,
      formState,
    };

    try {
      wsRef.current.send(JSON.stringify(message));
      console.log('WebSocket message sent:', { content: updatedContent.substring(0, 100) + '...', formState });
      contentRef.current = updatedContent;
      setContent(updatedContent);
      formStateRef.current = formState;
    } catch (err) {
      console.error('Failed to send WebSocket message:', err);
    }
  }, [wsRef, currentUser, editorRef, contentRef, setContent, formStateRef]);

  // ********* Fetch all tasks *********
  useEffect(() => {
    const curUserString = localStorage.getItem('currentUser');
    const parsedUser = curUserString ? JSON.parse(curUserString) : null;
    if (!parsedUser.id) {
      showError('User ID is missing');
      return;
    }

    const fetchTasks = async () => {
      setLoading(true);
      try {
        const curUserString = localStorage.getItem('currentUser');
        const parsedUser = curUserString ? JSON.parse(curUserString) : null;

        if (!parsedUser?.id) {
          throw new Error('Current user data is missing or invalid');
        }

        const roleMap: { [key: string]: number } = {
          Validator: 2,
          Manager: 4,
          'General Manager': 5,
          Admin: 1,
        };

        setCurrentUser({
          id: parsedUser.id,
          name: parsedUser.name || '',
          email: parsedUser.email || '',
          role: parsedUser.role || '',
          roleId: roleMap[parsedUser.role] || 0,
        });

        const url =
          parsedUser.role === 'Admin'
            ? Api_url.pro_getalltasks
            : Api_url.pro_gettasksByUser(parsedUser.id);

        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);

        const json = await res.json();

        // if (json.status === 'success') {
        //   const transformed = transformApiDataToProjects(json.data, userId, parsedUser.role);
        //   setProjects(transformed);
        // } else {
        //   throw new Error(json.message || 'Failed to load tasks');
        // }
        if (json.status_code === 200) {
          const transformed = transformApiDataToProjects(
            json.data,
            parsedUser.id,
            parsedUser.role
          );
          setProjects(transformed);
        } else {
          throw new Error(json.message || "Failed to load tasks");
        }
      } catch (err: any) {
        console.error('Error fetching tasks:', err.message);
        showError(err.message || 'Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

  // Initializes TinyMCE editor, WebSocket sync, and dynamic task behaviors on document view
  useEffect(() => {
    const loadTinyMCEScript = () => {
      return new Promise((resolve, reject) => {
        if (window.tinymce) {
          console.log('TinyMCE already loaded');
          resolve();
          return;
        }
        const script = document.createElement('script');
        const basePath = import.meta.env.VITE_BASE_PATH || '';
        script.src = `${basePath}/tinymce/js/tinymce/tinymce.min.js`;
        script.onload = () => {
          console.log('TinyMCE script loaded successfully');
          resolve();
        };
        script.onerror = () => {
          console.error('Failed to load TinyMCE script');
          showError('Failed to load editor');
          reject(new Error('TinyMCE script failed to load'));
        };
        document.body.appendChild(script);
      });
    };

    const connectWebSocket = (taskId: string) => {
      // const wsUrl = `ws://127.0.0.1:8012/api/ws/${taskId}`;
      // const wsUrl = `ws://20.119.101.189/api/ws/${taskId}`;
      const wsUrl = Api_url.connectWebSocket(taskId);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WebSocket connected for task:', taskId);
        const initialContent = contentRef.current || '';
        let initialBookmark = null;
        if (editorRef.current && editorReady.current && editorRef.current.selection) {
          try {
            initialBookmark = editorRef.current.selection.getBookmark(2, true);
            console.log('Initial bookmark captured:', initialBookmark);
          } catch (err) {
            console.warn('Failed to capture initial bookmark:', err);
          }
        }
        const formState = captureFormState();
        const message = {
          type: 'content_update',
          content: initialContent,
          client_id: String(currentUser.id),
          username: currentUser.name,
          cursor: initialBookmark,
          formState,
        };
        ws.send(JSON.stringify(message));
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Ignore updates from self
          if (message.client_id === currentUser.id && message.type === 'content_update') {
            console.log('Ignoring content update from self:', currentUser.id);
            return;
          }

          if (message.type === 'content_update' && message.content) {
            if (!editorRef.current || !editorReady.current || !editorRef.current.selection) {
              console.warn('Editor not fully ready, queuing message:', JSON.stringify(message, null, 2));
              pendingMessages.current.push(message);
              return;
            }

            const markdownContent = message.content;
            console.log('Received content Markdown:', markdownContent.substring(0, 100) + '...');

            const editor = editorRef.current;
            const currentContent = editor.getContent({ format: 'raw' });
            if (currentContent !== markdownContent) {
              let bookmark = null;
              try {
                bookmark = editor.selection.getBookmark(2, true);
                console.log('Captured bookmark:', bookmark);
              } catch (err) {
                console.warn('Failed to get bookmark:', err);
              }

              // Build HTML for this user with correct permissions
              const htmlContent = htmlWithPermissions(markdownContent, currentUser.id, message.formState);
              console.log('------html with permissions------', htmlContent);

              // Just set the content — DO NOT trigger WS update here
              editor.setContent(htmlContent);

              attachTableListeners();


              // Reattach table listeners if you still use them
              if (typeof attachTableListeners === 'function') {
                attachTableListeners();
              }

              // Restore form state if provided
              if (message.formState) {
                restoreFormState(message.formState);
                formStateRef.current = message.formState;
              }

              if (bookmark) {
                try {
                  editor.selection.moveToBookmark(bookmark);
                  console.log('Restored bookmark:', bookmark);
                } catch (err) {
                  console.warn('Failed to restore bookmark:', err);
                }
              }

              contentRef.current = markdownContent;
              setContent(markdownContent);
            }

            // Update cursor info for other users
            if (message.client_id !== currentUser.id) {
              let cursor = message.cursor;
              if (cursor && cursor.start && Array.isArray(cursor.start)) {
                cursor = {
                  type: 'caret',
                  start: { type: 'paragraph', offset: cursor.start[0] || 0 },
                };
              }
              if (cursor && message.username) {
                setCursors((prev) => ({
                  ...prev,
                  [message.client_id]: {
                    cursor,
                    username: message.username || `User_${message.client_id}`,
                  },
                }));
              }
            }
          }
          else if (message.type === 'error') {
            console.error('WebSocket error message:', message.message);
            showError(message.message);
          }
        } catch (err) {
          console.error('Invalid WebSocket message:', event.data, err);
          // showError('Invalid WebSocket message received');
        }
      };


      ws.onclose = () => {
        console.log('WebSocket disconnected, reconnecting...');
        setTimeout(() => connectWebSocket(taskId), 3000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
      };
    };

    const processPendingMessages = () => {
      if (!editorRef.current || !editorReady.current || !editorRef.current.selection) {
        console.warn('Editor not fully ready for pending messages, retrying in 500ms');
        setTimeout(processPendingMessages, 500);
        return;
      }
      while (pendingMessages.current.length > 0) {
        const message = pendingMessages.current.shift();
        console.log('Processing queued message:', JSON.stringify(message, null, 2));
        if (message.type === 'content_update' && message.content) {
          const markdownContent = message.content;
          console.log('Processing queued content Markdown:', markdownContent.substring(0, 100) + '...');

          const editor = editorRef.current;
          const currentContent = editor.getContent({ format: 'raw' });
          if (currentContent !== markdownContent) {
            let bookmark = null;
            try {
              bookmark = editor.selection.getBookmark(2, true);
              console.log('Captured bookmark for queued message:', bookmark);
            } catch (err) {
              console.warn('Failed to get bookmark for queued message:', err);
            }
            const htmlContent = htmlWithPermissions(markdownContent, currentUser.id, message.formState);
            console.log('------html with permissions------', htmlContent, 'html with permissions');

            editor.setContent(htmlContent);

            if (message.formState) {
              restoreFormState(message.formState);
              formStateRef.current = message.formState;
            }
            if (bookmark) {
              try {
                editor.selection.moveToBookmark(bookmark);
                console.log('Restored bookmark for queued message:', bookmark);
              } catch (err) {
                console.warn('Failed to restore bookmark for queued message:', err);
              }
            }
            contentRef.current = markdownContent;
            setContent(markdownContent);
          }
          if (message.client_id !== currentUser.id && message.cursor && message.username) {
            console.log(`Updating queued cursor for client ${message.client_id}, username: ${message.username}`);
            setCursors((prev) => ({
              ...prev,
              [message.client_id]: {
                cursor: message.cursor,
                username: message.username || message.client_id,
              },
            }));
          }
        }
      }
    };

    let editorInstance = null;

    const initEditor = (markdownContent: string, readOnly: boolean, taskId: string) => {
      console.log('Initializing TinyMCE with markdown content:', markdownContent.substring(0, 100) + '...');
      if (!window.tinymce) {
        console.error('TinyMCE not loaded');
        showError('Editor not available');
        return;
      }

      console.log('------html with permissions before ------', markdownContent, 'html with permissions before');

      const htmlContent = htmlWithPermissions(markdownContent, currentUser.id, formStateRef.current);
      console.log('------html with permissions after ------', htmlContent, 'html with permissions after ');

      window.tinymce.init({
        selector: `#${editorId}`,
        height: 600,
        inline: false,
        menubar: !readOnly,
        plugins: 'table lists advlist code image emoticons charmap insertdatetime media preview quickbars searchreplace form',
        toolbar: readOnly
          ? ''
          : 'undo redo | styleselect | bold italic | forecolor backcolor | alignleft aligncenter alignright | bullist numlist | table | print emoticons charmap insertdatetime image media preview save searchreplace | checkboxBtn radioBtn dropdownBtn | snipBtn',
        readonly: readOnly,
        menu: {
          insert: { title: 'Insert', items: 'checkbox radio select' }
        },
        extended_valid_elements: 'input[type|name|value|checked|disabled],select[name],option[value|selected]',

        images_upload_url: '/upload',
        images_upload_handler: async (blobInfo, success, failure) => {
          try {
            const formData = new FormData();
            formData.append('file', blobInfo.blob(), blobInfo.filename());
            const response = await fetch('/upload', {
              method: 'POST',
              body: formData,
            });
            if (!response.ok) throw new Error('Upload failed');
            const { url } = await response.json();
            success(url);
          } catch (err) {
            console.error('Image upload error:', err);
            failure('Image upload failed: ' + err.message);
          }
        },
        setup: (editor) => {
          editorInstance = editor;
          editorRef.current = editor;

          editor.ui.registry.addButton('customimage', {
            text: 'Insert Image',
            onAction: () => {
              editor.windowManager.open({
                title: 'Insert Image',
                body: {
                  type: 'panel',
                  items: [
                    { type: 'input', name: 'url', label: 'Image URL' },
                    { type: 'input', name: 'alt', label: 'Alt Text' },
                  ],
                },
                buttons: [
                  { type: 'cancel', text: 'Cancel' },
                  { type: 'submit', text: 'Insert', primary: true },
                ],
                onSubmit: (api) => {
                  const { url, alt } = api.getData();
                  if (url) {
                    editor.insertContent(
                      `<img src="${url}" alt="${alt || 'Image'}" class="editor-image" />`
                    );
                  }
                  api.close();
                },
              });
            },
          });

          editor.ui.registry.addButton('insertimagelink', {
            text: 'Insert Image Link',
            onAction: () => {
              editor.windowManager.open({
                title: 'Insert Image Link',
                body: {
                  type: 'panel',
                  items: [
                    { type: 'input', name: 'url', label: 'Image URL' },
                    { type: 'input', name: 'text', label: 'Link Text' },
                  ],
                },
                buttons: [
                  { type: 'cancel', text: 'Cancel' },
                  { type: 'submit', text: 'Insert', primary: true },
                ],
                onSubmit: (api) => {
                  const { url, text } = api.getData();
                  if (url) {
                    editor.insertContent(
                      `<a href="${url}" class="image-link" data-image-url="${url}">${text || 'View Image'}</a>`
                    );
                  }
                  api.close();
                },
              });
            },
          });

          // Insert Checkbox
          editor.ui.registry.addButton('checkboxBtn', {
            text: 'Checkbox',
            onAction: function () {
              editor.insertContent('<input type="checkbox" name="chk1" />');
            }
          });

          // Insert Radio
          editor.ui.registry.addButton('radioBtn', {
            text: 'Radio',
            onAction: function () {
              editor.insertContent('<input type="radio" name="radioGroup" value="option1" />');
            }
          });

          // Insert Dropdown
          editor.ui.registry.addButton('dropdownBtn', {
            text: 'Dropdown',
            onAction: function () {
              editor.insertContent(
                '<select name="mySelect">' +
                '<option value="1">Option 1</option>' +
                '<option value="2">Option 2</option>' +
                '</select>'
              );
            }
          });

          editor.on('init', () => {
            console.log('TinyMCE initialized, setting content:', htmlContent.substring(0, 100) + '...');
            editor.setContent(htmlContent || '<p>No content available</p>');
            // handleRestrictions(editor.getContent({ format: 'raw' }));

            contentRef.current = markdownContent;
            setContent(markdownContent);
            restoreFormState(formStateRef.current);

            const iframe = editor.iframeElement;
            if (iframe && iframe.contentDocument) {
              const iframeDoc = iframe.contentDocument;
              const styleSheet = iframeDoc.createElement('link');
              styleSheet.setAttribute('rel', 'stylesheet');
              styleSheet.setAttribute('href', '/styles/editor-image.css');
              styleSheet.setAttribute('data-image-styles', 'true');
              try {
                iframeDoc.querySelectorAll('link[data-image-styles]').forEach((el) => el.remove());
                iframeDoc.head.appendChild(styleSheet);
                console.log('External CSS loaded for images/links');
              } catch (err) {
                console.error('Failed to load image/link CSS:', err);
                const inlineStyle = iframeDoc.createElement('style');
                inlineStyle.setAttribute('data-image-styles', 'true');
                inlineStyle.textContent = `
                .editor-image {
                  max-width: 100%;
                  height: auto;
                  border: 1px solid #ccc;
                  border-radius: 4px;
                  margin: 5px;
                }
                .image-link {
                  color: #1e90ff;
                  text-decoration: underline;
                  cursor: pointer;
                }
                .image-preview-modal {
                  position: fixed;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  background: rgba(0, 0, 0, 0.7);
                  display: none;
                  justify-content: center;
                  align-items: center;
                  z-index: 10001;
                }
                .image-preview-modal img {
                  max-width: 80%;
                  max-height: 80%;
                  border: 2px solid #fff;
                  border-radius: 4px;
                }
                .image-preview-modal.active {
                  display: flex;
                }
              `;
                try {
                  iframeDoc.querySelectorAll('style[data-image-styles]').forEach((el) => el.remove());
                  iframeDoc.head.appendChild(inlineStyle);
                  console.log('Inline CSS injected for images/links');
                } catch (err) {
                  console.error('Failed to inject inline CSS:', err);
                }
              }

              let modal = iframeDoc.querySelector('.image-preview-modal');
              if (!modal) {
                modal = iframeDoc.createElement('div');
                modal.className = 'image-preview-modal';
                iframeDoc.body.appendChild(modal);
              }

              const handleLinkClick = (event: MouseEvent) => {
                const target = event.target as HTMLElement;

                const linkEl = target.closest<HTMLElement>('.image-link, .file-link');
                const btnEl = target.closest<HTMLButtonElement>('button.signoff-btn');
                const btnSnip = target.closest<HTMLButtonElement>('button.snip-btn');

                console.log(currentTaskId, 'currentTaskId in handleLinkClick');
                if (linkEl) {
                  const fileUrl = linkEl.getAttribute('data-image-url') || linkEl.getAttribute('data-file-url');
                  if (fileUrl) {
                    console.log('File link clicked:', fileUrl, 'Attributes:', {
                      dataImageUrl: linkEl.getAttribute('data-image-url'),
                      dataFileUrl: linkEl.getAttribute('data-file-url'),
                      textContent: linkEl.textContent?.trim(),
                      classList: linkEl.classList.toString(),
                    });

                    const fileName = fileUrl.split(/[\\/]/).pop()!.trim();
                    handleImageClick(fileName);
                  } else {
                    console.error('No file URL found for link:', linkEl.outerHTML);
                    showError('Cannot open file: No file URL specified');
                  }
                } else if (btnEl && btnEl.type === 'button') {
                  console.log('Sign off button clicked:', {
                    title: btnEl.getAttribute('data-title'),
                    rowIndex: btnEl.getAttribute('data-row-index'),
                  });

                  handleSignOffClick({ currentTarget: btnEl } as unknown as Event, currentTaskId);
                  // snipping tool btn to capture images
                } else if (btnSnip && btnSnip.type === 'button') {
                  console.log('Snip button clicked:', {
                    title: btnSnip.getAttribute('data-title'),
                    rowIndex: btnSnip.getAttribute('data-row-index'),
                  });
                  handleSnipClick({ currentTarget: btnSnip } as unknown as Event, currentTaskId);

                } else {
                  console.warn('Unhandled click target:', target);
                }
              };

              modal.addEventListener('click', () => {
                modal.classList.remove('active');
                modal.innerHTML = '';
              });

              iframeDoc.addEventListener('click', handleLinkClick);
              const attachTableListeners = () => {
                const iframeDoc = editorRef.current?.iframeElement?.contentDocument;
                if (!iframeDoc) return;

                // remove old ones
                iframeDoc.removeEventListener('change', handleTableChangeEvent);
                iframeDoc.addEventListener('change', handleTableChangeEvent);

                // also attach Initial/Date upload handler
                iframeDoc.querySelectorAll('td input[type="file"]').forEach(input => {
                  const colIndex = (input.closest('td') as HTMLTableCellElement)?.cellIndex;
                  if (colIndex === initialDateIndex) {
                    input.removeEventListener('change', handleInitialDateUpload);
                    input.addEventListener('change', handleInitialDateUpload);
                  }
                });
              };
              const handleTableChangeEvent = (e: Event) => {
                console.log('Table change event detected in TinyMCE!', {
                  type: e.type,
                  target: e.target,
                  tagName: (e.target as HTMLElement)?.tagName,
                  inputType: (e.target as HTMLInputElement)?.type
                });

                const target = e.target as HTMLElement;

                if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'radio') {
                  console.log('Radio button change detected in TinyMCE');
                  handleRadioChange(e);
                }
                if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
                  handleCheckboxChange(e);
                  return;
                }

                if (target.tagName === "BUTTON" && target.classList.contains("signoff-btn")) {
                  handleSignOffClick(e, currentTaskId);
                  return;
                }

                if (target.tagName === 'SELECT') {
                  console.log('Dropdown change detected in TinyMCE');
                  handleDropdownChange(e);
                }

                if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'file') {
                  console.log('File input change detected in TinyMCE');
                  // handleFileChange(e);
                  handleFileUpload(e); // General file upload handler
                  return;
                }

                if (target.tagName !== 'Button' || (target as HTMLInputElement).type === 'Button') {
                  console.log('Change event "button clicked');
                  return;
                }

                const currentRow = target.closest('tr');
                if (!currentRow) return;
                const rowIndex = parseInt(currentRow.getAttribute('data-row-index') || '0', 10);

                // get table headers
                const table = currentRow.closest('table');
                if (!table) return;
                const headerCells = Array.from(table.querySelectorAll('thead th'));

                const cell = target.closest('td');
                if (!cell) return;
                const colIndex = (cell as HTMLTableCellElement).cellIndex;

                const colName = headerCells[colIndex]?.textContent?.trim().toLowerCase() || '';

                if (colName.includes('evidence')) {
                  console.log('Evidence upload detected at row', rowIndex);
                  handleFileUpload(e);   // ✅ your existing evidence handler
                } else if (colName.includes('initial/date')) {
                  console.log('Initial/Date upload detected at row', rowIndex);
                  handleInitialDateUpload(e); // ✅ your existing initial/date handler
                } else {
                  console.log('File change ignored, not evidence or initial/date');
                }

              };

              iframeDoc.addEventListener('change', handleTableChangeEvent);
              console.log('Table change event listeners added to TinyMCE iframe');

              editor.on('remove', () => {
                iframeDoc.removeEventListener('click', handleLinkClick);
                iframeDoc.removeEventListener('change', handleTableChangeEvent);
                iframeDoc.querySelectorAll('.image-preview-modal').forEach((el) => el.remove());
                iframeDoc.querySelectorAll('link[data-image-styles], style[data-image-styles]').forEach((el) => el.remove());
                console.log('All event listeners cleaned up from TinyMCE iframe');
              });

              if (readOnly) {
                // Assuming makePartialReadOnly is defined elsewhere
                // makePartialReadOnly();
              }

              setTimeout(() => {
                console.log('Checking editor readiness post-init...');
                if (editor.selection) {
                  editorReady.current = true;
                  hasInitialized.current = true; // ✅ allow change handlers to run
                  console.log('Editor fully ready, processing pending messages...');
                  processPendingMessages();
                } else {
                  console.warn('Editor selection not ready, retrying...');
                  setTimeout(processPendingMessages, 500);
                }
              }, 500);

            }
          });

          if (!readOnly) {
            editor.on('Change KeyUp', () => {
              if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                const markdownContent = editor.getContent({ format: 'raw' });
                const updatedContent = htmlWithPermissions(markdownContent, currentUser.id, formStateRef.current);

                const formState = captureFormState();
                const message = {
                  type: 'content_update',
                  content: updatedContent,
                  cursor: editor.selection.getBookmark(2, true),
                  client_id: String(currentUser.id),
                  username: currentUser.name,
                  formState,
                };
                wsRef.current.send(JSON.stringify(message));
                contentRef.current = markdownContent;
                setContent(markdownContent);
                formStateRef.current = formState;
              }
            });

            let previousRowCount = 0;
            let lastValidStep = 0;

            editor.on('TableModified', (e) => {
              const table = editor.selection.getNode().closest('table');
              if (!table) return;

              let tbody = table.querySelector('tbody');
              if (!tbody) {
                tbody = document.createElement('tbody');
                table.appendChild(tbody);
              }

              const rows = table.rows;
              const currentRowCount = rows.length;

              const rowAdded = currentRowCount > previousRowCount;
              previousRowCount = currentRowCount;

              if (e.structure && rowAdded) {
                const headers = table.querySelectorAll('thead th');
                const newRow = rows[rows.length - 1];

                newRow.querySelectorAll('th').forEach((th) => {
                  const td = document.createElement('td');
                  td.innerHTML = th.innerHTML;
                  th.replaceWith(td);
                });

                const cells = newRow.querySelectorAll('td');

                let stepIndex = -1;
                let evidenceIndex = -1;
                let resultIndex = -1;
                let usersIndex = -1;

                headers.forEach((th, index) => {
                  const text = th.textContent?.trim().toLowerCase();
                  if (text === 'step #') stepIndex = index;
                  if (text === 'evidence') evidenceIndex = index;
                  if (text === 'pass/fail') resultIndex = index;
                  if (text === 'user') usersIndex = index;
                });

                if (rows.length > 1) {
                  const lastRow = rows[rows.length - 2];
                  const lastStepCell = lastRow.cells[stepIndex !== -1 ? stepIndex : 0];
                  const lastStepText = lastStepCell?.textContent?.trim() || '';
                  lastValidStep = lastStepText ? parseInt(lastStepText, 10) : lastValidStep;
                }
                const newStep = (lastValidStep + 1).toString().padStart(2, '0');

                if (cells.length) {
                  if (stepIndex !== -1 && cells[stepIndex]) {
                    cells[stepIndex].textContent = newStep;
                  } else if (cells[0]) {
                    cells[0].textContent = newStep;
                  }

                  if (evidenceIndex !== -1 && cells[evidenceIndex]) {
                    cells[evidenceIndex].innerHTML = '<input type="file" accept="image/*" capture="environment" /><div class="file-name-container" style="margin-top: 6px; font-size: 14px; display: flex; flex-direction: column;"></div>';
                    // cells[evidenceIndex].innerHTML = '<input multiple="multiple" type="file" /><div class="file-name-container" style="margin-top: 6px; font-size: 14px; display: flex; flex-direction: column;"></div>';
                    const newInput = cells[evidenceIndex].querySelector('input[type="file"]') as HTMLInputElement;
                    fileInputMapRef.current.set(newInput, []);
                    // Assuming renderFileNamesNearInput is defined elsewhere
                    // renderFileNamesNearInput(newInput, []);
                  }

                  if (resultIndex !== -1) {
                    const cells = row.querySelectorAll('td');
                    const savedValue = rowResults[rowIndex];
                    const radioName = `result-${String(rowIndex + 1).padStart(2, '0')}`;

                    const passChecked = savedValue === 'pass' ? 'checked="checked"' : '';
                    const failChecked = savedValue === 'fail' ? 'checked="checked"' : '';

                    // render the radio buttons
                    cells[resultIndex].innerHTML = `
                    <label>
                      <input type="radio" name="${radioName}" value="pass" ${passChecked} ${isRowEnabled ? '' : 'disabled'}> Pass
                    </label>
                    <label>
                      <input type="radio" name="${radioName}" value="fail" ${failChecked} ${isRowEnabled ? '' : 'disabled'}> Fail
                    </label>
                  `;

                    // attach change listeners to update rowResults
                    const radios = cells[resultIndex].querySelectorAll(`input[name="${radioName}"]`);
                    radios.forEach(radio => {
                      radio.addEventListener('change', (e) => {
                        rowResults[rowIndex] = e.target.value; // keep the current selection
                        console.log(`Row ${rowIndex} result updated →`, rowResults[rowIndex]);

                        // 🔄 if you want, re-render the row so checked is rebuilt cleanly
                        // renderRow(row, rowIndex); // <-- call your render function here
                      });
                    });

                    console.log(`Set radio buttons for row ${rowIndex}:`, { radioName, passChecked, failChecked, isRowEnabled });
                  }


                  if (usersIndex !== -1 && cells[usersIndex]) {
                    // Find the table caption or fallback to a default
                    const row = cells[usersIndex].closest('tr');
                    const table = row.closest('table');
                    const caption = table?.querySelector('caption')?.textContent?.trim();
                    const title = caption || 'table';
                    const rowIndex = Array.from(table?.querySelectorAll('tbody tr') || []).indexOf(row!);
                    const selectName = `user-${title || 'table'}-${rowIndex}`;
                    cells[usersIndex].innerHTML = `
                        <select name="${selectName}" data-selected-user="">
                          <option value="1">Babjee</option>
                          <option value="2">Phani</option>
                          <option value="3">Mounika</option>
                          <option value="4">Madhav</option>
                          <option value="5">Rakesh</option>
                          <option value="6">Muni</option>
                        </select>
                      `;
                  }
                }

                for (let i = 0; i < rows.length - 1; i++) {
                  const row = rows[i];
                  const rowCells = row.querySelectorAll('td');
                  const stepText = rowCells[stepIndex !== -1 ? stepIndex : 0]?.textContent?.trim() || '';
                  const stepNum = stepText ? stepText.padStart(2, '0') : '';

                  if (evidenceIndex !== -1 && rowCells[evidenceIndex]) {
                    const currentInput = rowCells[evidenceIndex].querySelector('input[type="file"]') as HTMLInputElement;
                    const currentFiles = fileInputMapRef.current.get(currentInput) || [];
                    const fileContainer = rowCells[evidenceIndex].querySelector('.file-name-container');

                    if (currentInput && fileContainer) {
                      const newInput = document.createElement('input');
                      newInput.type = 'file';
                      newInput.setAttribute('multiple', 'multiple');
                      rowCells[evidenceIndex].replaceChild(newInput, currentInput);
                      const newContainer = fileContainer.cloneNode(true) as HTMLElement;
                      rowCells[evidenceIndex].replaceChild(newContainer, fileContainer);
                      fileInputMapRef.current.set(newInput, currentFiles);

                      const links = newContainer.querySelectorAll('a.file-link');
                      links.forEach((link, idx) => {
                        const filePath = currentFiles[idx];
                        if (filePath) {
                          link.setAttribute('data-file-url', filePath);
                          link.textContent = filePath.split(/[\\/]/).pop()!.trim();
                          const removeBtn = link.nextElementSibling as HTMLButtonElement;
                          if (removeBtn) {
                            removeBtn.onclick = () => {
                              const newList = currentFiles.filter((_, i) => i !== idx);
                              fileInputMapRef.current.set(newInput, newList);
                              // renderFileNamesNearInput(newInput, newList);
                            };
                          }
                        }
                      });
                    } else if (currentFiles.length > 0) {
                      rowCells[evidenceIndex].innerHTML = '<input type="file" accept="image/*" capture="environment" /><div class="file-name-container" style="margin-top: 6px; font-size: 14px; display: flex; flex-direction: column;"></div>';
                      const newInput = rowCells[evidenceIndex].querySelector('input[type="file"]') as HTMLInputElement;
                      fileInputMapRef.current.set(newInput, currentFiles);
                      // renderFileNamesNearInput(newInput, currentFiles);
                    }
                  }

                  if (resultIndex !== -1 && rowCells[resultIndex]) {
                    const currentRadios = rowCells[resultIndex].querySelectorAll('input[type="radio"]');
                    let selectedValue = formStateRef.current.radio[`result-${stepNum}`] || '';
                    currentRadios.forEach((radio: HTMLInputElement) => {
                      if (radio.checked) selectedValue = radio.value;
                    });
                    const radioName = `result-${stepNum}`;

                    if (currentRadios.length > 0) {
                      currentRadios.forEach((radio) => {
                        radio.name = radioName;
                        if (radio.value === selectedValue) radio.checked = true;
                      });
                    } else {
                      rowCells[resultIndex].innerHTML = `
                      <label><input type="radio" name="${radioName}" value="pass" ${selectedValue === 'pass' ? 'checked' : ''}> Pass</label>
                      <label><input type="radio" name="${radioName}" value="fail" ${selectedValue === 'fail' ? 'checked' : ''}> Fail</label>
                    `;
                    }
                  }

                  if (usersIndex !== -1 && rowCells[usersIndex]) {
                    const table = row.closest('table');
                    const caption = table?.querySelector('caption')?.textContent?.trim();
                    const title = caption || 'table';
                    const rowIndex = Array.from(table?.querySelectorAll('tbody tr') || []).indexOf(row!);
                    const selectName = `user-${title}-${rowIndex}`;

                    cells[usersIndex].innerHTML = `
                      <select name="${selectName}" data-selected-user="">
                        <option value="1">Babjee</option>
                        <option value="2">Phani</option>
                        <option value="3">Mounika</option>
                        <option value="4">Madhav</option>
                        <option value="5">Rakesh</option>
                        <option value="6">Muni</option>
                      </select>
                    `;
                  }
                }

                const updatedContent = editor.getContent({ format: 'html' });
                editor.setContent(updatedContent, { format: 'html' });
                restoreFormState(formStateRef.current);

                const iframe = editor.iframeElement;
                if (iframe && iframe.contentDocument) {
                  const iframeDoc = iframe.contentDocument;
                  const fileInputs = iframeDoc.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
                  fileInputs.forEach((input) => {
                    if (!(input as any)._listenerAttached) {
                      input.setAttribute('multiple', 'true');
                      input.addEventListener('change', handleFileUpload);
                      (input as any)._listenerAttached = true;
                    }
                  });
                }
              }
            });
          }
        }
      });
    };

    // const fetchAndInit = async (taskId: string, equip_id: number) => {
    //   try {
    //     await loadTinyMCEScript();

    //     let documentContent = ''; // Variable to hold the document content
    //     try {
    //       // Make an API call to get the document by task ID
    //       const response = await fetch(Api_url.pro_Get_document_by_taskid(Number(taskId)), {
    //         method: 'GET',
    //         headers: {
    //           'accept': 'application/json',
    //         },
    //       });

    //       if (!response.ok) throw new Error('Failed to load document from API');
    //       const data = await response.json();
    //       console.log('API response for document:', data);
    //       const { document, file_flag } = data;

    //       if (!document) throw new Error('No document content available from the API');

    //       console.log('Fetched document content:', document.substring(0, 100) + '...');

    //       // If the file is in markdown (file_flag = 1), convert it to HTML
    //       if (file_flag === 1) {
    //         const documentContent1 = mdToHtml(document);
    //         console.log('Converted Markdown to HTML:', documentContent1);
    //         console.log(currentUser.role, 'currentUser.role')
    //         documentContent = htmlWithPermissions(documentContent1, currentUser.id, formStateRef.current);
    //         console.log('Converted Markdown to HTML:', documentContent.substring(0, 100) + '...');
    //       } else {
    //         documentContent = document; // If it's already HTML
    //         console.log('Document is in HTML format:', documentContent.substring(0, 100) + '...');
    //         console.log('Document is in HTML:', documentContent);

    //       }
    //     } catch (err) {
    //       console.error('Document fetch error:', err);
    //       showError('Failed to load document from API');
    //       documentContent = 'Failed to load document content';
    //     }

    //     // If not in editing mode or document mode, use the content as is
    //     if (!isEditing || isDocumentMode) {
    //       documentContent = documentContent;
    //     }

    //     setTimeout(() => {
    //       // Initialize the editor with the document content
    //       initEditor(documentContent, !isEditing || isDocumentMode, taskId);
    //     }, 100);

    //     // Connect WebSocket if the task ID is available
    //     if (taskId) {
    //       connectWebSocket(taskId);
    //     }
    //     // handleRestrictions(documentContent);

    //   } catch (err) {
    //     console.error('Editor init failed:', err);
    //     showError('Failed to initialize editor');
    //   }
    // };
    const fetchAndInit = async (taskId: string, equip_id: number) => {
      try {
        await loadTinyMCEScript();

        let documentContent = '';
        try {
          const response = await fetch(Api_url.pro_Get_document_by_taskid(Number(taskId)), {
            method: 'GET',
            headers: { accept: 'application/json' },
          });

          if (!response.ok) throw new Error('Failed to load document from API');
          const result = await response.json();
          console.log('API response for document:', result);

          const { data } = result || {};
          if (!data) throw new Error(result.message || 'No document data available from API');

          const { task_document, file_flag } = data;

          if (!task_document) throw new Error('No document content available from the API');

          console.log('Fetched document content:', task_document.substring(0, 100) + '...');

          if (file_flag === 1) {
            const documentContent1 = mdToHtml(task_document);
            documentContent = htmlWithPermissions(
              documentContent1,
              currentUser.id,
              formStateRef.current
            );
            console.log('Converted Markdown to HTML:', documentContent.substring(0, 100) + '...');
          } else {
            documentContent = task_document;
            console.log('Document is in HTML format:', documentContent.substring(0, 100) + '...');
          }
        } catch (err) {
          console.error('Document fetch error:', err);
          showError('Failed to load document from API');
          documentContent = 'We can\'t find any template for this Equipment, you can start writing your document here...';
        }

        if (!isEditing || isDocumentMode) {
          documentContent = documentContent;
        }

        setTimeout(() => {
          initEditor(documentContent, !isEditing || isDocumentMode, taskId);
        }, 100);

        if (taskId) {
          connectWebSocket(taskId);
        }
      } catch (err) {
        console.error('Editor init failed:', err);
        showError('Failed to initialize editor');
      }
    };


    if (viewDoc && currentTaskId) {
      console.log('Starting editor initialization for task:', currentTaskId);
      fetchAndInit(currentTaskId, projects
        .flatMap((p) => p.phases.flatMap((ph) => ph.tasks))
        .find((t) => t.id === currentTaskId)?.equipment_id || 0);
    }

    return () => {
      console.log('Cleaning up WebSocket and TinyMCE');
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (window.tinymce && editorInstance) {
        window.tinymce.remove(editorInstance);
      }
      editorReady.current = false;
      pendingMessages.current = [];
    };
  }, [viewDoc, currentTaskId, isEditing, isDocumentMode, currentUser.id, currentUser.name]);

  useEffect(() => {
    if (editorRef.current && content && editorReady.current) {
      console.log('Updating editor content:', content.substring(0, 100) + '...');
      const editor = editorRef.current;
      const currentContent = editor.getContent({ format: 'raw' });

      if (currentContent !== content) {
        let bookmark = null;
        try {
          bookmark = editor.selection.getBookmark(2, true);
          console.log('Captured bookmark in content update:', bookmark);
        } catch (err) {
          console.warn('Failed to get bookmark in content update, proceeding without cursor:', err);
        }

        // 🔁 Apply permissions before setting
        const htmlWithPerms = htmlWithPermissions(content, currentUser.id, formStateRef.current);
        console.log('------html with permissions------', htmlWithPerms, 'html with permissions')
        editor.setContent(htmlWithPerms);
        restoreFormState(formStateRef.current);

        if (bookmark) {
          try {
            editor.selection.moveToBookmark(bookmark);
            console.log('Restored bookmark in content update:', bookmark);
          } catch (err) {
            console.warn('Failed to restore bookmark in content update, skipping:', err);
          }
        }

        contentRef.current = content;
      }
    }
  }, [content, restoreFormState, currentUser.id]);

  // Renders real-time collaborator cursors inside TinyMCE editor iframe using `cursors` state
  useEffect(() => {
    console.log('Current user ID:', currentUser.id, 'Username:', currentUser.name);
    if (!editorRef.current || !editorReady.current || !editorRef.current.selection || !editorRef.current.dom) {
      console.warn('Editor not ready for cursor rendering');
      return;
    }

    const editor = editorRef.current;
    const iframe = document.querySelector('iframe');
    if (!iframe || !iframe.contentDocument || !iframe.contentWindow) {
      console.warn('Iframe not accessible for cursor rendering');
      showError('Editor iframe not accessible');
      return;
    }

    const iframeDoc = iframe.contentDocument;
    const iframeWin = iframe.contentWindow;
    const dom = editor.dom;

    const renderCursors = () => {
      console.log('Rendering cursors, current state:', JSON.stringify(cursors, null, 2));

      iframeDoc.querySelectorAll('.cursor-label, .cursor-bar').forEach((el) => el.remove());

      let currentBookmark = null;
      try {
        currentBookmark = editor.selection.getBookmark(2, true);
        console.log('Captured current bookmark:', currentBookmark);
      } catch (err) {
        console.warn('Failed to get current bookmark:', err);
      }

      Object.entries(cursors).forEach(([clientId, { cursor, username }]) => {
        if (clientId === currentUser.id) {
          console.log(`Skipping rendering for current user: ${username} (${clientId})`);
          return;
        }
        if (!username) {
          console.warn(`Missing username for client ${clientId}, using fallback`);
          username = `User_${clientId}`;
        }
        const userColor = getUserColor(clientId);
        if (!userColor || !/^#[0-9A-F]{6}$/i.test(userColor)) {
          console.warn(`Invalid color for client ${clientId}:`, userColor);
          return;
        }

        if (!cursor || !cursor.start) {
          console.warn(`Invalid cursor for client ${clientId} (${username}):`, cursor);
          const label = dom.create('div', {
            class: `cursor-label cursor-label-${clientId}`,
            style: `position: absolute; top: 10px; left: 10px; background-color: ${userColor}; color: #ffffff; padding: 2px 6px; font-size: 12px; border-radius: 3px; z-index: 10000; white-space: nowrap; opacity: 0.9; box-shadow: 0 1px 3px rgba(0,0,0,0.2);`,
          }, username);
          iframeDoc.body.appendChild(label);
          console.log(`Rendered fallback label for ${username} (${clientId}) at top-left`);
          return;
        }

        try {
          editor.selection.moveToBookmark(cursor);
          const rng = editor.selection.getRng();
          const clientRect = rng.getClientRects()[0];
          if (!clientRect) {
            console.warn(`No client rect for cursor of client ${clientId} (${username})`);
            const label = dom.create('div', {
              class: `cursor-label cursor-label-${clientId}`,
              style: `position: absolute; top: 10px; left: 10px; background-color: ${userColor}; color: #ffffff; padding: 2px 6px; font-size: 12px; border-radius: 3px; z-index: 10000; white-space: nowrap; opacity: 0.9; box-shadow: 0 1px 3px rgba(0,0,0,0.2);`,
            }, username);
            iframeDoc.body.appendChild(label);
            console.log(`Rendered fallback label for ${username} (${clientId}) at top-left`);
            return;
          }

          const scrollY = iframeWin.scrollY || 0;
          const scrollX = iframeWin.scrollX || 0;
          const editorRect = iframe.getBoundingClientRect();
          const iframeOffsetTop = editorRect.top;
          const iframeOffsetLeft = editorRect.left;

          const top = clientRect.top + scrollY - iframeOffsetTop;
          const left = clientRect.left + scrollX - iframeOffsetLeft;

          const cursorBar = dom.create('div', {
            class: `cursor-bar cursor-${clientId}`,
            style: `position: absolute; top: ${top}px; left: ${left}px; width: 2px; height: ${clientRect.height || 16}px; background-color: ${userColor}; z-index: 9999; transition: top 0.2s, left 0.2s; opacity: 1;`,
          });
          iframeDoc.body.appendChild(cursorBar);

          const label = dom.create('div', {
            class: `cursor-label cursor-label-${clientId}`,
            style: `position: absolute; top: ${top - 20}px; left: ${left}px; background-color: ${userColor}; color: #ffffff; padding: 2px 6px; font-size: 12px; border-radius: 3px; z-index: 10000; white-space: nowrap; opacity: 0.9; box-shadow: 0 1px 3px rgba(0,0,0,0.2);`,
          }, username);
          iframeDoc.body.appendChild(label);

          console.log(`Rendered cursor for ${username} (${clientId}) at top:${top}, left:${left}, color:${userColor}`);
        } catch (err) {
          console.error(`Failed to render cursor for user ${username} (${clientId}):`, err);
          const label = dom.create('div', {
            class: `cursor-label cursor-label-${clientId}`,
            style: `position: absolute; top: 10px; left: 10px; background-color: ${userColor}; color: #ffffff; padding: 2px 6px; font-size: 12px; border-radius: 3px; z-index: 10000; white-space: nowrap; opacity: 0.9; box-shadow: 0 1px 3px rgba(0,0,0,0.2);`,
          }, username);
          iframeDoc.body.appendChild(label);
          // console.log(`Rendered fallback label for ${username} (${clientId}) at top-left`);
        }
      });

      if (currentBookmark) {
        try {
          editor.selection.moveToBookmark(currentBookmark);
          console.log('Restored current bookmark:', currentBookmark);
        } catch (err) {
          console.warn('Failed to restore current bookmark:', err);
        }
      }
    };

    const interval = setInterval(renderCursors, 1000);
    return () => {
      clearInterval(interval);
      if (iframe && iframe.contentDocument) {
        iframe.contentDocument.querySelectorAll('.cursor-label, .cursor-bar').forEach((el) => el.remove());
        iframe.contentDocument.querySelectorAll('style[data-cursor-styles]').forEach((el) => el.remove());
      }
    };
  }, [cursors, currentUser.id]);

  // Sends real-time cursor updates over WebSocket on user interactions (keyup, mouseup, selection)
  useEffect(() => {
    console.log('Current user ID:', currentUser.id, 'Username:', currentUser.name);
    if (!editorRef.current || !editorReady.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('Editor or WebSocket not ready for cursor updates', {
        editorReady: editorReady.current,
        wsReady: wsRef.current?.readyState,
      });
      return;
    }

    const editor = editorRef.current;
    const ws = wsRef.current;

    const sendCursorUpdate = () => {
      let bookmark = null;
      try {
        bookmark = editor.selection.getBookmark(2, true);
        console.log('Captured cursor bookmark for sending:', bookmark);
      } catch (err) {
        console.warn('Failed to capture cursor bookmark:', err);
        return;
      }

      const formState = captureFormState();
      const message = {
        type: 'content_update',
        content: editor.getContent({ format: 'raw' }),
        client_id: String(currentUser.id),
        username: currentUser.name || `User_${currentUser.id}`,
        cursor: bookmark,
        // formState
      };
      try {
        ws.send(JSON.stringify(message));
        console.log('Sent cursor update:', JSON.stringify(message, null, 2));
      } catch (err) {
        console.error('Failed to send cursor update:', err);
      }
    };

    editor.on('keyup', sendCursorUpdate);
    editor.on('mouseup', sendCursorUpdate);
    editor.on('SelectionChange', sendCursorUpdate);

    sendCursorUpdate();

    return () => {
      editor.off('keyup', sendCursorUpdate);
      editor.off('mouseup', sendCursorUpdate);
      editor.off('SelectionChange', sendCursorUpdate);
    };
  }, [editorReady, currentUser.id, currentUser.name, captureFormState]);

  // Attach event listeners to all radio buttons inside the rendered content.
  useEffect(() => {
    const editorIframe = document.querySelector('iframe');

    if (!editorIframe) return;

    const iframeDoc = editorIframe.contentDocument || editorIframe.contentWindow?.document;
    if (!iframeDoc) return;
  }, [content]); // Replace `htmlContent` with the actual variable that updates when content is loaded

  const loadDoc = async (
    taskName: string,
    taskId: string,
    equip_id: number,
  ): Promise<void> => {
    if (!taskId) {
      showError("Cannot load document: Invalid task or equipment ID");
      return;
    }

    setCurrentTaskId(taskId);
    setCurTask(taskId);
    setCurTaskName(taskName);

    setCanComment(["review", "draft", "dryrun"].includes(taskName.toLowerCase()));
    setCanReply(["review", "draft"].includes(taskName.toLowerCase()));
    setLoading(true);

    try {
      const response = await fetch(Api_url.pro_Get_document_by_taskid(Number(taskId)), {
        method: "GET",
        headers: { accept: "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch document");

      const result = await response.json();
      console.log("API response:", result);

      const { data } = result || {};
      if (!data) throw new Error(result.message || "No document data available");

      const fileFlag: number = data.file_flag; // 1 = Markdown, 2 = HTML
      let documentContent: string = data.task_document || "";

      if (!documentContent) {
        showError("No document content available");
        documentContent = "<p>Default content: Unable to load document</p>";
      }

      let htmlContent: string;
      if (fileFlag === 1) {
        const rawHtml = mdToHtml(documentContent);
        htmlContent = htmlWithPermissions(rawHtml, currentUser.id, formStateRef.current || {});
      } else {
        htmlContent = htmlWithPermissions(documentContent, currentUser.id, formStateRef.current || {});
      }

      const states = {
        draft: { isEditing: true, isDocumentMode: false, isUpdate: false },
        review: { isEditing: false, isDocumentMode: false, isUpdate: true },
        default: { isEditing: false, isDocumentMode: true, isUpdate: false },
      };

      const baseState = states[taskName.toLowerCase() as keyof typeof states] || states.default;

      // Determine state based on role
      const { isEditing, isDocumentMode, isUpdate } = currentUser?.role === 'Admin'
        ? { isEditing: false, isDocumentMode: true, isUpdate: false } // Admin: Always read-only viewer mode
        : baseState; // Non-admin: Follow taskName-based state

      setIsEditing(isEditing);
      setIsDocumentMode(isDocumentMode);
      setIsUpdate(isUpdate);

      if (isDocumentMode && htmlContent) {
        htmlContent = convertSelectsToSpans(htmlContent);
      }

      setViewDoc(true);
      setContent(htmlContent);
      contentRef.current = htmlContent;
      formStateRef.current = formStateRef.current || {};

      await fetchComments(taskId);
    } catch (err: any) {
      showError(err.message || "Failed to load document");
      const fallback = "<p>Failed to load document</p>";
      setContent(fallback);
      contentRef.current = fallback;
      setViewDoc(true);
    } finally {
      setLoading(false);
    }
  };

  // resolve comments
  const handleResolve = async (commentId: any, userId: any) => {
    try {
      const response = await fetch(Api_url.ResolveComment(commentId, userId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Authorization': 'Bearer your-token-here', // replace with actual token
        },
        body: JSON.stringify({ extra_info: 'optional' }), // only if backend needs body
      });

      const data = await response.json();

      if (!response.ok) {
        alert(`Error: ${data.message}`);
        return;
      }

      // Update local state
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, status_name: 'Resolved' } : c
        )
      );
    } catch (error) {
      console.error('Resolve comment failed', error);
    }
  };

  const handleSnipClick = async (e: Event, taskId: string) => {
    try {
      // Find the button and the corresponding file input in the same Attachment cell
      const button = e.currentTarget as HTMLButtonElement;
      if (!button) {
        console.error('No Snip button found');
        return;
      }

      const attachmentCell = button.closest('td'); // Assumes Attachment is in a <td>; adjust to 'div.attachment' if needed
      if (!attachmentCell) {
        console.error('No Attachment cell found for Snip button');
        return;
      }

      const fileInput = attachmentCell.querySelector('input[type="file"]') as HTMLInputElement;
      if (!fileInput) {
        console.error('No file input found in Attachment cell');
        return;
      }

      // 1. Capture screen with focus management
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
          displaySurface: "monitor",
          surfaceSwitching: "include",
          logicalSurface: true,
        },
        audio: false,
      });

      // Refocus the window after the picker closes
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay

      window.focus(); // Ensure the window regains focus

      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();

      // Listen for track ended to handle cleanup and refocus
      track.onended = () => {
        window.focus(); // Refocus when the stream ends (e.g., user stops sharing)
      };

      track.stop(); // Stop the track after capturing to avoid lingering permissions

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bitmap, 0, 0);
      const imageSrc = canvas.toDataURL("image/png");

      // 3. Create container div for React overlay
      const overlayDiv = document.createElement("div");
      document.body.appendChild(overlayDiv);
      const root = createRoot(overlayDiv);

      // 4. Overlay React component (inline)
      const Overlay: React.FC<{ imageSrc: string; onClose: () => void }> = ({ imageSrc, onClose }) => {
        const [crop, setCrop] = useState({ x: 0, y: 0 });
        const [zoom, setZoom] = useState(1);
        const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
        const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

        const onCropComplete = useCallback((_: any, croppedPixels: any) => {
          setCroppedAreaPixels(croppedPixels);
        }, []);

        useEffect(() => {
          const image = new Image();
          image.src = imageSrc;
          image.onload = () => {
            setImageDimensions({ width: image.width, height: image.height });
            setZoom(1);
          };
        }, [imageSrc]);

        const getCroppedImage = useCallback(async () => {
          if (!croppedAreaPixels) return null;
          const image = new Image();
          image.src = imageSrc;
          await new Promise((res) => (image.onload = res));

          const cropCanvas = document.createElement("canvas");
          cropCanvas.width = croppedAreaPixels.width;
          cropCanvas.height = croppedAreaPixels.height;
          const cropCtx = cropCanvas.getContext("2d")!;
          cropCtx.drawImage(
            image,
            croppedAreaPixels.x,
            croppedAreaPixels.y,
            croppedAreaPixels.width,
            croppedAreaPixels.height,
            0,
            0,
            croppedAreaPixels.width,
            croppedAreaPixels.height
          );

          return new Promise<Blob | null>((resolve) =>
            cropCanvas.toBlob((b) => resolve(b), "image/png")
          );
        }, [croppedAreaPixels]);

        const handleConfirm = async () => {
          const blob = await getCroppedImage();
          if (!blob) return;

          const formData = new FormData();
          formData.append("files", blob, `snip_${Date.now()}.png`);
          const res = await fetch(Api_url.EvidenceUploadFromEditor, {
            method: "POST",
            body: formData,
          });
          const result = await res.json();
          console.log('Snip upload result:', result);

          if (Array.isArray(result.uploaded_files)) {
            const prevFiles = fileInputMapRef.current.get(fileInput) || [];
            const updatedFiles = [...new Set([...prevFiles, ...result.uploaded_files])];
            fileInputMapRef.current.set(fileInput, updatedFiles);

            renderFileNamesNearInput(fileInput, updatedFiles);

            const editor = editorRef.current;
            if (editor && editor.iframeElement?.contentDocument) {
              const rawHtml = editor.iframeElement.contentDocument.body.innerHTML;
              const permissionedHtml = htmlWithPermissions(rawHtml, currentUser.id, formStateRef.current);
              editor.setContent(permissionedHtml);
              const formState = captureFormState();
              triggerWebSocketUpdatetaskmanagr(permissionedHtml, formState);
              contentRef.current = permissionedHtml;
              formStateRef.current = formState;
            }

            const url = result.uploaded_files?.[0]?.url;
            if (url) {
              editorRef.current?.insertContent(
                `<img src="${url}" alt="Snip" class="snipped-img" style="max-width:100%;height:auto;" />`
              );
            }
          }

          cleanup();
        };

        const cleanup = () => {
          onClose(); // Trigger refocus on close
          root.unmount();
          overlayDiv.remove();
        };

        return (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.8)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                position: "relative",
                width: "80vw",
                height: "80vh",
                background: "#fff",
              }}
            >
              {imageDimensions && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>
            <div style={{ marginTop: 10 }}>
              <button onClick={handleConfirm} style={{ marginRight: 10 }}>
                ✅ Insert Snip
              </button>
              <button onClick={cleanup}>❌ Cancel</button>
            </div>
          </div>
        );
      };

      // 5. Render overlay with refocus callback
      root.render(<Overlay imageSrc={imageSrc} onClose={() => window.focus()} />);
    } catch (err) {
      console.error("Snip failed:", err);
      window.focus(); // Refocus on error
    }
  };



  const handleInitialDateUpload = (e: Event) => {
    try {
      const target = e.target as HTMLInputElement;
      if (!target.files?.length) return;

      const editor = editorRef.current;
      if (!editor) return;
      const iframeDoc = editor.iframeElement?.contentDocument;
      if (!iframeDoc) return;

      const file = target.files[0];
      const currentRow = target.closest('tr');
      if (!currentRow) return;

      const rowIndex = parseInt(currentRow.getAttribute('data-row-index') || '0', 10);
      const cells = currentRow.querySelectorAll('td');
      const headerCells = Array.from(iframeDoc.querySelectorAll('thead th'));

      const testInstructionsIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'test instruction');
      const evidenceIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'evidence');

      // 1. Evidence required check
      let evidenceRequired = false;
      if (testInstructionsIndex !== -1) {
        const cb = cells[testInstructionsIndex]?.querySelector('input[type="checkbox"]') as HTMLInputElement;
        evidenceRequired = !!cb?.checked;
      }
      if (evidenceRequired && evidenceIndex !== -1) {
        const evCell = cells[evidenceIndex];
        // const hasEvidence = !!evCell?.querySelector('.uploaded-file');
        const hasEvidence = !!evCell?.querySelector('.file-link'); // check for uploaded file link
        if (!hasEvidence) {
          showError('Please upload evidence before Signoff.');
          target.value = '';
          return;
        }
      }

      // 2. Pass/Fail required
      const passFailChecked = !!currentRow.querySelector<HTMLInputElement>(`input[type="radio"][name^="pf-result-"]:checked`);
      if (!passFailChecked) {
        showError('Please select Pass or Fail before Signoff.');
        target.value = '';
        return;
      }
      else {
        const selectedRadio = currentRow.querySelector<HTMLInputElement>(
          `input[type="radio"][name^="pf-result-"]:checked`
        );
        const passFailValue = selectedRadio ? selectedRadio.value : null; // "Pass" / "Fail" / whatever the value is
        console.log(passFailValue, 'passFailValue')
        if (passFailValue === 'fail') {
          showError('Your Test case failed. Do you want to upload Initial/Date?');
          target.value = '';
          return;
        }
      }

      // 3. Actual Result required
      const yesNoChecked = !!currentRow.querySelector<HTMLInputElement>(`input[type="radio"][name^="ar-yesno-"]:checked`);
      if (!yesNoChecked) {
        showError('Please select Yes or No in Actual Result before Signoff.');
        target.value = '';
        return;
      }

      // ✅ Passed → mark uploaded file
      const initialDateIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase().includes('initial/date'));
      const initialCell = cells[initialDateIndex];
      if (initialCell) {

        // Instead of manual marker.innerHTML → use same logic as handleFileUpload
        const prevFiles = fileInputMapRef.current.get(target) || [];
        const updatedFiles = [...new Set([...prevFiles, file.name])];
        fileInputMapRef.current.set(target, updatedFiles);
        renderFileNamesNearInput(target, updatedFiles);
      }

      // Lock current row
      currentRow.style.opacity = '0.6';
      currentRow.style.pointerEvents = 'none';
      currentRow.querySelectorAll('input, select, button, textarea')
        .forEach(el => el.setAttribute('disabled', 'disabled'));

      // Build formState including file (no direct HTML mutation for file links)
      const formState = captureFormState();
      formState[`initial-file-${rowIndex}`] = file.name;

      contentRef.current = iframeDoc.body.innerHTML; // keep raw table as is
      formStateRef.current = formState;
      triggerWebSocketUpdatetaskmanagr(contentRef.current, formState);

      // ✅ Do NOT inject file links again into editor.setContent
      // Just re-apply permissioned HTML without duplicating uploaded files
      const permissionedContent = htmlWithPermissions(contentRef.current, currentUser.id, formState);
      editor.setContent(permissionedContent);

      // After content reset, re-render the file names from fileInputMapRef
      renderFileNamesNearInput(target, fileInputMapRef.current.get(target) || []);

      showSuccess('Initial/Date uploaded successfully.');
      // showSuccess('Changes sent to team.');
    } catch (err) {
      console.log('InitialDateUpload failed', err);
      showError('Unexpected error while uploading Initial/Date.');
    }
  };


  // file uploading in editor
  const handleFileUpload = async (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = input?.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(Api_url.EvidenceUploadFromEditor, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      console.log('Upload Success:', result);

      if (Array.isArray(result.uploaded_files)) {
        const prevFiles = fileInputMapRef.current.get(input) || [];
        const updatedFiles = [...new Set([...prevFiles, ...result.uploaded_files])];
        fileInputMapRef.current.set(input, updatedFiles);
        renderFileNamesNearInput(input, updatedFiles);

        // ----- WebSocket Sync -----
        const editor = editorRef.current;
        if (editor && editor.iframeElement?.contentDocument) {
          const rawHtml = editor.iframeElement.contentDocument.body.innerHTML;
          const permissionedHtml = htmlWithPermissions(rawHtml, currentUser.id, formStateRef.current);
          console.log('------html with permissions------', permissionedHtml, 'html with permissions')

          editor.setContent(permissionedHtml);
          const formState = captureFormState(); // from useTableEvents
          triggerWebSocketUpdatetaskmanagr(permissionedHtml, formState);
          contentRef.current = permissionedHtml;
          formStateRef.current = formState;
        }
        // --------------------------
      }
    } catch (error) {
      console.error('Upload Error:', error);
      showError('Failed to upload files');
    }
  };

  // Renders uploaded file links and remove buttons next to the file input inside the TinyMCE table cell.
  const renderFileNamesNearInput = (input: HTMLInputElement, filePaths: string[]) => {
    let container = input.nextElementSibling as HTMLElement;

    // Create container if not found
    if (!container || !container.classList.contains('file-name-container')) {
      container = document.createElement('div');
      container.className = 'file-name-container';
      container.style.marginTop = '6px';
      container.style.fontSize = '14px';
      container.style.display = 'flex';
      container.style.flexDirection = 'column';
      input.parentElement?.insertBefore(container, input.nextSibling);
    }

    // Merge with previous files if any (to support incremental updates)
    const existingFiles = Array.from(container.querySelectorAll('a.file-link'))
      .map(link => link.getAttribute('data-file-url') || '')
      .filter(Boolean);

    const allFiles = [...new Set([...existingFiles, ...filePaths])]; // remove duplicates

    // Clear UI before re-rendering
    container.innerHTML = '';

    allFiles.forEach((filePath, idx) => {
      const fileName = filePath.split(/[\\/]/).pop()!.trim();
      const fileLine = document.createElement('div');
      fileLine.style.display = 'flex';
      fileLine.style.alignItems = 'center';
      fileLine.style.gap = '6px';
      fileLine.style.marginBottom = '4px';

      const link = document.createElement('a');
      link.href = '#';
      link.textContent = fileName;
      link.className = 'file-link';
      link.setAttribute('data-file-url', filePath);
      link.style.color = '#007bff';
      link.style.textDecoration = 'underline';

      const removeBtn = document.createElement('button');
      removeBtn.innerText = '×';
      removeBtn.style.color = 'red';
      removeBtn.style.border = 'none';
      removeBtn.style.background = 'transparent';
      removeBtn.style.cursor = 'pointer';
      removeBtn.style.fontSize = '14px';

      // Remove file and re-render
      removeBtn.onclick = () => {
        const updatedFiles = allFiles.filter((_, i) => i !== idx);
        fileInputMapRef.current.set(input, updatedFiles);
        renderFileNamesNearInput(input, updatedFiles); // re-render after removal
      };

      fileLine.appendChild(link);
      fileLine.appendChild(removeBtn);
      container.appendChild(fileLine);
    });

    // Update internal map state
    fileInputMapRef.current.set(input, allFiles);
  };

  // Fetches an uploaded image by filename and opens it in a popup
  const handleImageClick = (fileName: string) => {
    fetch(`${Api_url.GetEvidenceFileToEditor}/${encodeURIComponent(fileName)}`)
      .then(response => {
        if (!response.ok) throw new Error('File not found');
        return response.blob();
      })
      .then(blob => {
        const fileUrl = URL.createObjectURL(blob);
        openFileInPopup(fileUrl);
      })
      .catch(error => {
        console.error('Error fetching file:', error);
        showError('Failed to fetch file');
      });
  };

  // Opens the given image URL in a centered popup viewer
  const openFileInPopup = (fileUrl: string) => {
    const popup = window.open('', '_blank', 'width=600,height=400');
    if (popup) {
      popup.document.write(`
      <html>
        <head><title>File Viewer</title></head>
        <body style="text-align: center; padding: 20px;">
          <img src="${fileUrl}" alt="File" style="max-width: 100%; height: auto;" />
        </body>
      </html>
    `);
    } else {
      console.error('Failed to open popup. The popup might be blocked by the browser.');
      showError('Failed to open file viewer. Please allow popups.');
    }
  };

  // Returns a consistent color for each user based on their client ID
  const getUserColor = (clientId: string): string => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6',
    ];
    const hash = clientId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  // Converts <select> dropdowns in read-only mode to bold <span> elements showing selected text
  const convertSelectsToSpans = (htmlContent: string): string => {
    console.log('Converting selects to spans, input:', htmlContent.substring(0, 100) + '...');
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    const selects = doc.querySelectorAll('select');

    selects.forEach((select) => {
      const selectedOption = (select as HTMLSelectElement).selectedOptions[0];
      const span = doc.createElement('span');
      span.textContent = selectedOption?.textContent || '';
      span.style.fontWeight = 'bold';
      span.style.marginRight = '0.5rem';
      select.replaceWith(span);
    });

    const output = doc.body.innerHTML;
    console.log('Converted to spans, output:', output.substring(0, 100) + '...');
    return output;
  };

  // Makes most content in the editor read-only, while keeping inputs, selects, radios, and images interactive
  const makePartialReadOnly = () => {
    console.log('Making editor partially read-only');
    const iframe = document.querySelector('iframe');
    if (!iframe) {
      console.warn('No iframe found for partial read-only');
      return;
    }

    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    const container = iframeDoc.body;

    const nonSelectElements = container.querySelectorAll(':not(select):not(img):not(a.image-link):not(input[type="radio"])');
    nonSelectElements.forEach((el) => {
      const element = el as HTMLElement;
      if (
        element.tagName.toLowerCase() !== 'select' &&
        element.tagName.toLowerCase() !== 'img' &&
        !element.classList.contains('image-link') &&
        element.tagName.toLowerCase() !== 'input'
      ) {
        element.setAttribute('contenteditable', 'false');
        element.style.backgroundColor = '#f5f5f5';
        element.style.pointerEvents = 'none';
      }
    });

    const selectElements = container.querySelectorAll('select');
    selectElements.forEach((el) => {
      const element = el as HTMLSelectElement;
      element.removeAttribute('contenteditable');
      element.style.pointerEvents = 'auto';
      element.disabled = false;
    });

    const radioElements = container.querySelectorAll('input[type="radio"]');
    radioElements.forEach((el) => {
      const element = el as HTMLInputElement;
      element.removeAttribute('contenteditable');
      element.style.pointerEvents = 'auto';
      element.disabled = false;
    });

    const imageLinks = container.querySelectorAll('a.image-link');
    imageLinks.forEach((el) => {
      const element = el as HTMLElement;
      element.style.pointerEvents = 'auto';
    });
  };


  // Handle save in edit mode – saves HTML content with permissions applied
  const handleEditSave = async () => {
    const editor = editorRef.current;
    setLoading(true);
    if (editor) {
      const formState = captureFormState();
      const rawHtml = editor.getContent({ format: "raw" });
      const htmlContent = htmlWithPermissions(rawHtml, currentUser.id, formState); // ensures radios/checks persist
      triggerWebSocketUpdatetaskmanagr(htmlContent, formState);
      console.log(htmlContent, 'html content with permissions');

      setContent(htmlContent);
      contentRef.current = htmlContent;
      formStateRef.current = formState;

      console.log('✅ Saved HTML:', htmlContent);

      const replyData = {
        // project_id: 1,
        // project_phase_id: 1,
        project_task_id: Number(currentTaskId),
        // document: htmlContent,  // <<-- send the permissioned version
        document_json: htmlContent,
        created_by: 1,
        // updated_by: 1,
        // submitted_by: 1,
        // approved_by: 1,
        // status_id: 1
      };

      try {
        const response = await fetch(Api_url.save_task_documnet, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(replyData),
        });
        setLoading(false);

        const result = await response.json();
        if (response.ok && result.status_code === 200) {
          // showSuccess('Document saved successfully');
          console.log('✅ API Response:', result.message);
          setViewDoc(false);
        } else {
          showError(`Error: ${result.message || 'Unknown error'}`);
        }
      } catch (error: any) {
        showError(`Network error: ${error.message}`);
      }
    }
  };


  // Handle save in view-only mode – updates HTML content and state
  const handleViewSave = async () => {
    const htmlContent = editorRef.current.getContent();
    setContent(htmlContent);
    contentRef.current = htmlContent;
    formStateRef.current = captureFormState();
    console.log('✅ View HTML:', htmlContent);
    showSuccess('Document changes saved successfully');
  };

  // fetch tasks based on role...
  // const fetchTasks = async () => {
  //   try {
  //     const url = currentUser?.role === 'Admin' ? Api_url.pro_getalltasks : Api_url.pro_gettasksByUser(userId!);
  //     const res = await fetch(url, {
  //       headers: { 'Content-Type': 'application/json' },
  //     });
  //     if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);
  //     const json = await res.json();
  //     if (json.status === 'success') {
  //       const transformed = transformApiDataToProjects(json.data, userId!, currentUser?.role);
  //       setProjects(transformed);
  //     } else {
  //       throw new Error(json.message || 'Failed to load tasks');
  //     }
  //   } catch (err: any) {
  //     console.error('Error refreshing tasks:', err.message);
  //     showError(err.message || 'Failed to refresh task list');
  //   }
  // };
  const fetchTasks = async () => {
    try {
      const url =
        currentUser?.role === 'Admin'
          ? Api_url.pro_getalltasks
          : Api_url.pro_gettasksByUser(currentUser.id);

      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) throw new Error(`Failed to fetch tasks: ${res.statusText}`);

      const json = await res.json();

      // Support both old and new response formats
      const tasks = Array.isArray(json.data) ? json.data : json;

      if ((json.status && json.status === 'success') || json.status_code === 200) {
        const transformed = transformApiDataToProjects(tasks, userId!, currentUser?.role);
        setProjects(transformed);
      } else {
        throw new Error(json.message || 'Failed to load tasks');
      }
    } catch (err: any) {
      console.error('Error refreshing tasks:', err.message);
      showError(err.message || 'Failed to refresh task list');
    }
  };


  // fetch comments by task id
  // const fetchComments = async (taskId: string) => {
  //   if (!taskId) {
  //     console.error('Invalid task ID:', taskId);
  //     showError('Cannot fetch comments: Invalid task ID');
  //     return;
  //   }
  //   setCommentLoading(true);
  //   try {
  //     const response = await fetch(Api_url.Get_commentsby_taskid(taskId), {
  //       headers: { 'Content-Type': 'application/json' },
  //     });
  //     if (!response.ok) {
  //       let errorDetail = response.statusText;
  //       try {
  //         const errorData = await response.json();
  //         errorDetail = errorData.detail || response.statusText;
  //       } catch {
  //         // Ignore if response is not JSON
  //       }
  //       throw new Error(`Failed to fetch comments: ${response.status} ${errorDetail}`);
  //     }
  //     const commentsData = await response.json();
  //     const formattedComments = commentsData.map((comment: any) => ({
  //       id: String(comment.project_task_comments_id),
  //       task_id: String(comment.project_task_id),
  //       user: comment.commented_by || 'Unknown',
  //       text: comment.comment || '',
  //       timestamp: comment.commented_date
  //         ? new Date(comment.commented_date).toLocaleString('en-US', {
  //           year: 'numeric',
  //           month: 'short',
  //           day: 'numeric',
  //           hour: '2-digit',
  //           minute: '2-digit',
  //           second: '2-digit',
  //         })
  //         : 'No timestamp',
  //       replies: comment.replies
  //         ? comment.replies.map((reply: any) => ({
  //           reply_id: String(reply.reply_id),
  //           comment: reply.comment || '',
  //           replied_by: reply.replied_by || 'Unknown',
  //           replied_date: reply.replied_date
  //             ? new Date(reply.replied_date).toLocaleString('en-US', {
  //               year: 'numeric',
  //               month: 'short',
  //               day: 'numeric',
  //               hour: '2-digit',
  //               minute: '2-digit',
  //               second: '2-digit',
  //             })
  //             : 'No timestamp',
  //         }))
  //         : [],
  //       showReplyInput: false,
  //       replyText: '',
  //       status_name: comment.status_name || 'Unknown',
  //     }));
  //     setComments(formattedComments);
  //   } catch (err: any) {
  //     console.error('Error fetching comments:', err.message, err.stack);
  //     showError(`Failed to fetch comments: ${err.message}`);
  //   } finally {
  //     setCommentLoading(false);
  //   }
  // };
  const fetchComments = async (taskId: string) => {
    if (!taskId) {
      console.error('Invalid task ID:', taskId);
      showError('Cannot fetch comments: Invalid task ID');
      return;
    }

    setCommentLoading(true); // Start loading spinner or similar

    try {
      // Fetch data from the API
      const response = await fetch(Api_url.Get_commentsby_taskid(taskId), {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        // Handle errors from the response
        let errorDetail = response.statusText;
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || response.statusText;
        } catch {
          // Ignore if the response is not JSON
        }
        throw new Error(`Failed to fetch comments: ${response.status} ${errorDetail}`);
      }

      // Parse the response data
      const responseData = await response.json();

      // Check the response structure (status_code should be 200 and data should exist)
      if (responseData.status_code !== 200 || !responseData.data) {
        throw new Error('Invalid response structure');
      }

      const commentsData = responseData.data;

      // Map the response data to the required format
      const formattedComments = commentsData.map((comment: any) => ({

        id: String(comment.comment_id), // Comment ID
        task_id: String(comment.project_task_id), // Task ID
        user: comment.commented_by_name || 'Unknown', // User who commented
        text: comment.description || '', // Comment text
        is_resolved: comment.is_resolved,
        timestamp: comment.comment_date
          ? new Date(comment.comment_date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
          : 'No timestamp', // Format the timestamp
        replies: comment.replies
          ? comment.replies.map((reply: any) => ({
            reply_id: String(reply.reply_id), // Reply ID
            comment: reply.reply_description || '', // Reply text
            replied_by: reply.replied_by_name || 'Unknown', // User who replied
            replied_date: reply.replied_date
              ? new Date(reply.replied_date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
              : 'No timestamp', // Reply timestamp
          }))
          : [], // If no replies, use an empty array
        showReplyInput: false, // To show or hide reply input
        replyText: '', // Placeholder for reply text input
        status_name: comment.is_resolved ? 'Resolved' : 'Unresolved', // Map the resolution status
      }));
      console.log(formattedComments, "formattedComments")


      // Set the formatted comments in the state
      setComments(formattedComments);

    } catch (err: any) {
      // Catch and handle any errors during the fetch process
      console.error('Error fetching comments:', err.message, err.stack);
      showError(`Failed to fetch comments: ${err.message}`);
    } finally {
      // Stop the loading spinner or similar
      setCommentLoading(false);
    }
  };


  // submit the task -- moves to next user
  const handleTaskSubmit = async () => {
    const editor = editorRef.current;
    const updatedBy = Number(currentUser.id);
    // setTimeout(() => {
    //   handleEditSave();
    // }, 500);
    setIsSidebarOpen(false);
    if (isNaN(updatedBy)) {
      console.error('Invalid user ID:', currentUser.id);
      showError('Cannot submit task: Invalid user ID');
      return;
    }
    if (!currentTaskId) {
      console.error('Invalid task ID:', currentTaskId);
      showError('Cannot submit task: Invalid task ID');
      return;
    }
    const formState = captureFormState();
    const rawHtml = editor.getContent({ format: "raw" });
    const htmlContent = htmlWithPermissions(rawHtml, currentUser.id, formState); // ensures radios/checks persist


    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    const signoffRows = doc.querySelectorAll("table[data-title^='TS'] tbody tr");

    let hasPendingSignoff = false;

    // signoffRows.forEach(row => {
    //   const select = row.querySelector("select");
    //   const assignedUser = select?.getAttribute("data-selected-user");
    //   const btn = row.querySelector("td button.signoff-btn") as HTMLButtonElement;
    //   const signedOff = btn?.getAttribute("data-completed") === "true";

    //   if (assignedUser === String(currentUser.id) && !signedOff) {
    //     hasPendingSignoff = true;
    //   }
    // });

    signoffRows.forEach(row => {
      const select = row.querySelector("select");
      const assignedUser = select?.getAttribute("data-selected-user");
      const btn = row.querySelector("td button.signoff-btn") as HTMLButtonElement;
      const signedOff = btn?.getAttribute("data-completed") === "true";

      if (assignedUser === String(currentUser.id) && btn) {
        // current user has a pending signoff button → block submit
        hasPendingSignoff = true;
      }
    });

    if (hasPendingSignoff) {
      showError("You must complete your sign-off before submitting this task.");
      return;
    }

    // else{
    //   showError("You completed your sign-off for this task.");
    //   return;
    // }


    triggerWebSocketUpdatetaskmanagr(htmlContent, formState);


    setSubmitLoading(true);
    try {
      const submitData = {
        // task_id: Number(currentTaskId),
        // status_id: 3,
        // updated_by: updatedBy,
        // document: htmlContent,
        project_task_id: Number(currentTaskId),
        document_json: htmlContent,
        task_status_id: 3,
        updated_by: updatedBy
      };

      const response = await fetch(Api_url.submitTasks, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();
      console.log('Task submit response:', result);

      if (!response.ok || result.status === 'error') {
        showError(result.message);
        throw new Error(result.message || `Failed to submit task: ${response.statusText}`);
      }

      showSuccess('Task submitted successfully');
      await fetchTasks();
      await fetchComments(currentTaskId);
      setViewDoc(false);
    } catch (err: any) {
      console.error('❌ Error submitting task:', err.message);
      showError(err.message || 'Failed to submit task');
    } finally {
      setSubmitLoading(false);
    }
  };

  // coment on a task
  const handleCommentSave = async () => {
    if (!newComment.trim()) {
      showError('Comment cannot be empty');
      return;
    }

    const commentedBy = Number(currentUser.id);
    if (isNaN(commentedBy)) {
      console.error('Invalid user ID:', currentUser.id);
      showError('Cannot post comment: Invalid user ID');
      return;
    }

    if (!currentTaskId) {
      console.error('Invalid task ID:', currentTaskId);
      showError('Cannot post comment: Invalid task ID');
      return;
    }

    setCommentLoading(true);
    try {
      const commentData = {
        // task_id: Number(currentTaskId),
        // comment: newComment,
        // commented_by: commentedBy,
        project_task_id: Number(currentTaskId),
        description: newComment,
        commented_by: commentedBy,
      };
      console.log('Posting comment with data:', commentData);

      const response = await fetch(Api_url.Task_Comments, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(commentData),
      });

      const result = await response.json();
      console.log('Comment save response:', result);

      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || `Failed to post comment: ${response.statusText}`);
      }

      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setComments([
        {
          id: String(result.comment_id),
          task_id: currentTaskId,
          user: currentUser.name || 'You',
          text: newComment,
          timestamp,
          replies: [],
          showReplyInput: false,
          replyText: '',
          status_name: 'Active',
        },
        ...comments,
      ]);
      setNewComment('');
      showSuccess(result.message || 'Comment posted successfully');
      await fetchComments(currentTaskId);
      await fetchTasks();
      setViewDoc(false);

      // ✅ If user is Reviewer → clear all signoffs and save document again
      if (currentUser.role === 'Reviewer') {
        const editor = window.tinymce?.activeEditor;
        if (editor) {
          let content = editor.getContent();

          // Remove all signature text spans
          content = content.replace(/<span class="signoff-meta".*?<\/span>/g, '');

          // Reset all signoff buttons (re-enable if you want fresh signing)
          content = content.replace(/data-completed="true"/g, 'data-completed="false"');
          content = content.replace(/disabled=""/g, '');

          editor.setContent(content);

          // Call your save document function
          await handleEditSave();
          console.log('✅ Reviewer comment posted: all signoffs cleared and document saved again');
        }
      }


    } catch (err: any) {
      console.error('❌ Error posting comment:', err.message);
      showError(err.message || 'Failed to post comment');
    } finally {
      setCommentLoading(false);
    }
  };

  // reply to a comment
  const handleReplySave = async (index: number) => {
    const comment = comments[index];
    if (!comment.replyText?.trim()) {
      showError('Reply cannot be empty');
      return;
    }

    const projectTaskCommentsId = Number(comment.id);
    if (isNaN(projectTaskCommentsId)) {
      console.error('Invalid comment ID:', comment.id);
      showError('Cannot post reply: Invalid comment ID');
      return;
    }

    const repliedBy = Number(currentUser.id);
    if (isNaN(repliedBy)) {
      console.error('Invalid user ID:', currentUser.id);
      showError('Cannot post reply: Invalid user ID');
      return;
    }

    setCommentLoading(true);
    try {
      const replyData = {
        // project_task_comments_id: projectTaskCommentsId,
        // comment: comment.replyText,
        // replied_by: repliedBy,
        comment_id: projectTaskCommentsId,
        reply_description: comment.replyText,
        replied_by: repliedBy,
      };
      console.log('Posting reply with data:', replyData);

      const response = await fetch(Api_url.Task_Comments_reply, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replyData),
      });

      const result = await response.json();
      console.log('Reply save response:', result);

      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || `Failed to post reply: ${response.statusText}`);
      }

      const timestamp = new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      setComments((prev) => {
        const updatedComments = [...prev];
        updatedComments[index] = {
          ...updatedComments[index],
          replies: [
            ...(updatedComments[index].replies || []),
            {
              reply_id: String(result.reply_id),
              comment: comment.replyText,
              replied_by: currentUser.name || 'You',
              replied_date: timestamp,
            },
          ],
          showReplyInput: false,
          replyText: '',
          status_name: 'Resolved',
        };
        return updatedComments;
      });
      showSuccess(result.message || 'Reply posted successfully');
      await fetchComments(currentTaskId);
    } catch (err: any) {
      console.error('❌ Error posting reply:', err.message);
      showError(err.message || 'Failed to post reply');
    } finally {
      setCommentLoading(false);
      await fetchComments(currentTaskId);
    }
  };

  // const transformApiDataToProjects = (data: any[], uid: string, usersrole: string): Project[] => {
  //   const map: { [key: string]: Project } = {};

  //   data.forEach((item) => {
  //     if (!map[item.project_id]) {
  //       map[item.project_id] = {
  //         id: String(item.project_id),
  //         name: item.project_name,
  //         createdBy: uid,
  //         assignees: [uid],
  //         phases: [],
  //       };
  //     }

  //     const project = map[item.project_id];
  //     let phase = project.phases.find((p) => p.id === String(item.phase_id));
  //     if (!phase) {
  //       phase = {
  //         id: String(item.phase_id),
  //         name: item.phase_name,
  //         type: 'Phase',
  //         tasks: [],
  //       };
  //       project.phases.push(phase);
  //     }
  //     const isValidUser =
  //       (!item.submitted && (item.status_id === 5 || item.status_id === 1 || item.status_id === 4))
  //     // (usersrole !== ('Admin') && [1, 5].includes(item.status_id)) ||
  //     // (usersrole === 'Manager' && (item.status_id === 1 || item.status_id === 5)) ||
  //     // (usersrole === 'General Manager' && item.status_id === 1)

  //     phase.tasks.push({
  //       id: String(item.project_task_id),
  //       name: item.task_name,
  //       status: mapStatus(item.status_id),
  //       assignedTo: item.users,
  //       equipment_id: item.equipment_id,
  //       status_id: item.status_id,
  //       submitted: item.submitted,
  //       validUser: isValidUser,
  //     });
  //   });

  //   return Object.values(map);
  // };

  const transformApiDataToProjects = (
    data: any[],
    uid: string,
    usersrole: string
  ): Project[] => {
    const map: { [key: string]: Project } = {};

    // ✅ Case 1: Admin → pro_getalltasks (nested response)
    if (usersrole === "Admin") {
      return data.map((project) => ({
        id: String(project.project_id),
        name: project.project_name,
        createdBy: uid,
        assignees: [],
        phases: project.phases.map((phase: any) => ({
          id: String(phase.phase_id),
          name: phase.phase_name,
          type: "Phase",
          tasks: phase.tasks.map((task: any) => {
            const isValidUser =
              [1, 5, 9].includes(task.status_id) && !task.submitted;

            return {
              id: String(task.project_task_id),
              name: task.task_name,
              status: mapStatus(task.status_id),
              assignedTo: task.users, // string, same as your current binding
              equipment_id: task.equipment_id ?? null,
              status_id: task.status_id,
              submitted: task.submitted ?? false,
              validUser: isValidUser,
            };
          }),
        })),
      }));
    }

    // ✅ Case 2: Non-Admin → pro_gettasksByUser (flat response)
    data.forEach((item) => {
      if (!map[item.project_id]) {
        map[item.project_id] = {
          id: String(item.project_id),
          name: item.project_name,
          createdBy: uid,
          assignees: [uid],
          phases: [],
        };
      }

      const project = map[item.project_id];
      let phase = project.phases.find((p) => p.id === String(item.phase_id));
      if (!phase) {
        phase = {
          id: String(item.phase_id),
          name: item.phase_name,
          type: "Phase",
          tasks: [],
        };
        project.phases.push(phase);
      }

      const isValidUser =
        [1, 5, 9].includes(item.status_id) && !item.submitted;

      phase.tasks.push({
        id: String(item.project_task_id),
        name: item.task_name,
        status: mapStatus(item.status_id),
        assignedTo: item.users ?? "--",
        equipment_id: item.equipment_id,
        status_id: item.status_id,
        submitted: item.submitted,
        validUser: isValidUser,
      });
    });

    return Object.values(map);
  };


  const mapStatus = (id: number): string => {
    const statusMap: { [key: number]: string } = {
      1: 'Active',
      2: 'On Hold',
      3: 'Completed',
      4: 'Pending',
      5: 'Reverted',
      6: 'Approved',
      7: 'Closed',
      8: 'Not Yet Started',
      9: "Resolved",
      10: "Incident Reported",


    };
    return statusMap[id] || 'Drafted';
  };

  const getStatusBadge = (status: string) => {
    const colorMap: Record<string, string> = {
      Closed: 'bg-green-100 text-green-800',
      Approved: 'bg-emerald-100 text-emerald-800',
      Completed: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Reverted: 'bg-red-100 text-red-800',
      Active: 'bg-yellow-100 text-yellow-800',
      'On Hold': 'bg-gray-100 text-gray-800',
      'Not Yet Started': 'bg-gray-100 text-gray-800',
      Drafted: 'bg-gray-100 text-gray-800',
    };
    const iconMap: Record<string, JSX.Element> = {
      Closed: <CheckCircle className="h-4 w-4 text-green-600" />,
      Approved: <CheckCircle className="h-4 w-4 text-emerald-600" />,
      Completed: <CheckCircle className="h-4 w-4 text-green-600" />,
      Pending: <Clock className="h-4 w-4 text-yellow-600" />,
      Reverted: <Clock className="h-4 w-4 text-red-600" />,
      Active: <Clock className="h-4 w-4 text-yellow-600" />,
      'On Hold': <FileText className="h-4 w-4 text-gray-600" />,
      'Not Yet Started': <FileText className="h-4 w-4 text-gray-600" />,
      Drafted: <FileText className="h-4 w-4 text-gray-600" />,
    };

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorMap[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {iconMap[status] || <FileText className="h-4 w-4" />}
        <span className="ml-1">{status}</span>
      </span>
    );
  };

  const allTasks = projects.flatMap((project) =>
    project.phases.flatMap((phase) =>
      phase.tasks.map((task) => ({
        ...task,
        projectName: project.name,
        projectId: project.id,
        phaseName: phase.name,
        phaseId: phase.id,
        phaseType: phase.type,
        user_name: task.assignedTo ?? '--',
        status_id: task.status_id,
        validUser: task.validUser,
        submitted: task.submitted,
      }))
    )
  );

  const uniqueUsers = Array.from(new Set(allTasks.map((t) => t.user_name)))
    .filter(Boolean)
    .map((name) => ({ id: name, name }));

  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.phaseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesAssignee = assigneeFilter === 'all' || task.user_name === assigneeFilter;
    return matchesSearch && matchesStatus && matchesAssignee;
  });

  // const canComment = currentUser.roleId === 4 || currentUser.roleId === 5;
  // const canReply = currentUser.roleId === 2;

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center">
        <MicroscopeLoader />
      </div>
    );
  }

  return (
    <div className="">
      {submitLoading && viewDoc && (
        <div className=" flex justify-center items-center">
          <MicroscopeLoader />
        </div>
      )}
      {!viewDoc ? (
        <>
          <h1 className="text-2xl font-bold mb-6">All Tasks</h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search tasks or projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  {taskStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <select
                  value={assigneeFilter}
                  onChange={(e) => setAssigneeFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Assignees</option>
                  {uniqueUsers.map((user) => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {allTasks.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <p className="text-lg font-semibold">📋 No tasks found</p>
            </div>
          ) : (
            <table className="w-full bg-white shadow rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Task</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Phase</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  {currentUser?.role === 'Admin' && (
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Assignee</th>
                  )}
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={`${task.projectId}-${task.phaseId}-${task.id}`} className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-800">{task.name}</td>
                    <td className="py-4 px-4">{task.projectName}</td>
                    <td className="py-4 px-4">{task.phaseName}</td>
                    <td className="py-4 px-4">{getStatusBadge(task.status)}</td>
                    {currentUser?.role === 'Admin' && (
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="text-sm text-gray-900">{task.user_name}</span>
                        </div>
                      </td>
                    )}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => loadDoc(task.name, task.id, task.equipment_id, currentUser?.role === 'Admin')}
                        className={`text-gray-600 hover:text-blue-600 ${(!task.validUser && currentUser?.role !== 'Admin') && 'opacity-50 cursor-not-allowed'}`}
                        title={
                          currentUser?.role === 'Admin'
                            ? "View Document (Read-Only)"
                            : task.status_id === 3
                              ? "Task has been submitted successfully."
                              : task.status_id === 10
                                ? "An incident has been raised. Task will resume once the incident is resolved."
                                : task.submitted
                                  ? "You have already submitted this task. Waiting for other users to submit."
                                  : !task.validUser && currentUser?.role !== 'Admin'
                                    ? "You are not allowed to access this task."
                                    : "View Document"
                        }
                        disabled={!task.validUser && currentUser?.role !== 'Admin'}
                      >
                        <FileEdit className="h-6 w-6 text-black hover:text-gray-700" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      ) : (
        <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
            {isEditing && !isDocumentMode ? (
              <>
                <button
                  onClick={() => {
                    handleEditSave();
                    setViewDoc(false);
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  {isUpdate ? 'Update' : 'Save'}
                </button>
                <button
                  onClick={handleTaskSubmit}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#00a917ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: submitLoading ? 'not-allowed' : 'pointer',
                    opacity: submitLoading ? 0.6 : 1,
                  }}
                  disabled={submitLoading}
                >
                  Submit
                </button>
                <button
                  onClick={() => setViewDoc(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            ) : isDocumentMode ? (
              <>
                <button
                  onClick={handleTaskSubmit}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#00a917ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: submitLoading ? 'not-allowed' : 'pointer',
                    opacity: submitLoading ? 0.6 : 1,
                  }}
                  disabled={submitLoading}
                >
                  Approve
                </button>
                <button
                  onClick={() => setViewDoc(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleTaskSubmit}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#00a917ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: submitLoading ? 'not-allowed' : 'pointer',
                    opacity: submitLoading ? 0.6 : 1,
                  }}
                  disabled={submitLoading}
                >
                  Submit
                </button>
                <button
                  onClick={() => setViewDoc(false)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </>
            )}
            {(canComment || canReply) && (
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: isSidebarOpen ? '#0ea5e9' : '#f0f0f0',
                  color: isSidebarOpen ? '#ffffff' : '#1f2937',
                  border: isSidebarOpen ? '1px solid #0ea5e9' : '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                }}
                title="Comments"
              >
                <MessageSquare className="h-4 w-4" />
              </button>
            )}
          </div>

          {(canComment || canReply) && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                right: isSidebarOpen ? '0' : '-300px',
                width: '300px',
                height: '100%',
                backgroundColor: '#fff',
                boxShadow: '-2px 0 5px rgba(0,0,0,0.2)',
                transition: 'right 0.3s ease-in-out',
                zIndex: 1000,
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Comments</h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '9999px',
                    border: '1px solid #555',
                    color: '#555',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                  }}
                  title="Close"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {commentLoading && (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <MicroscopeLoader />
                </div>
              )}

              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                {comments.length === 0 && !commentLoading ? (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>No comments available</p>
                ) : (
                  comments.map((comment, index) => (
                    <div
                      key={comment.id}
                      style={{
                        backgroundColor: '#f5f5f5',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        borderLeft: '4px solid #4289f4ff',
                        marginBottom: '0.5rem',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.75rem',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'background-color 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#e0e0e0';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#f5f5f5';
                      }}
                    >
                      <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>
                            {comment.user} (Task {comment.task_id})
                            {comment.status_name ===  'Resolved' ? (
                              <span style={{ fontSize: '0.8rem', color: '#28a745' }}>Resolved</span>
                            ) : (
                              <button
                                onClick={() => handleResolve(comment.id, currentUser.id)}
                                style={{
                                  fontSize: '0.9rem',
                                  cursor: 'pointer',
                                  background: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '4px',
                                  padding: '0.2rem 0.5rem',
                                }}
                                title="Resolve comment"
                              >
                                ✅
                              </button>
                            )}

                          </p>
                          <p style={{ fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>{comment.text}</p>
                          <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.25rem' }}>
                            {comment.timestamp}
                          </p>
                          {canReply && comment.status_name ===  'Unresolved' && (
                            <>
                              <button
                                onClick={() => {
                                  setComments((prev) =>
                                    prev.map((c, i) =>
                                      i === index ? { ...c, showReplyInput: !c.showReplyInput } : { ...c, showReplyInput: false }
                                    )
                                  );
                                }}
                                style={{
                                  marginTop: '0.25rem',
                                  fontSize: '0.75rem',
                                  color: '#4285f4',
                                  background: 'none',
                                  border: 'none',
                                  cursor: commentLoading ? 'not-allowed' : 'pointer',
                                  opacity: commentLoading ? 0.6 : 1,
                                  transition: 'background-color 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.backgroundColor = '#e3f2fd';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                                disabled={commentLoading}
                              >
                                {comment.showReplyInput ? 'Cancel' : 'Reply'}
                              </button>
                              {comment.showReplyInput && (
                                <div
                                  style={{
                                    marginTop: '0.5rem',
                                    backgroundColor: '#fff',
                                    padding: '0.25rem',
                                    borderRadius: '4px',
                                    border: '1px solid #ccc',
                                    transition: 'background-color 0.2s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#fff';
                                  }}
                                >
                                  <textarea
                                    value={comment.replyText || ''}
                                    onChange={(e) => {
                                      setComments((prev) =>
                                        prev.map((c, i) => (i === index ? { ...c, replyText: e.target.value } : c))
                                      );
                                    }}
                                    placeholder="Add a reply..."
                                    style={{
                                      width: '100%',
                                      minHeight: '60px',
                                      padding: '0.25rem',
                                      border: '1px solid #ccc',
                                      borderRadius: '4px',
                                      marginBottom: '0.25rem',
                                    }}
                                    disabled={commentLoading}
                                  />
                                  <button
                                    onClick={() => handleReplySave(index)}
                                    style={{
                                      marginTop: '0.25rem',
                                      padding: '0.25rem 0.5rem',
                                      backgroundColor: '#4285f4',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: '4px',
                                      cursor: commentLoading ? 'not-allowed' : 'pointer',
                                      opacity: commentLoading ? 0.6 : 1,
                                      transition: 'background-color 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#3267d6';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = '#4285f4';
                                    }}
                                    disabled={commentLoading}
                                  >
                                    Send
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                          {comment.replies && comment.replies.length > 0 && (
                            <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
                              {comment.replies.map((reply) => (
                                <div
                                  key={reply.reply_id}
                                  style={{
                                    borderBottom: '1px solid #eee',
                                    padding: '0.25rem 0',
                                    transition: 'background-color 0.2s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#e0e0e0';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                  }}
                                >
                                  <strong style={{ fontSize: '0.8rem' }}>{reply.replied_by}</strong>
                                  <p style={{ fontSize: '0.8rem', margin: 0 }}>{reply.comment}</p>
                                  <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.1rem' }}>
                                    {reply.replied_date}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {canComment && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    style={{
                      width: '100%',
                      minHeight: '80px',
                      padding: '0.5rem',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      resize: 'vertical',
                    }}
                    disabled={commentLoading}
                  />
                  <button
                    onClick={handleCommentSave}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: commentLoading ? 'not-allowed' : 'pointer',
                      opacity: commentLoading ? 0.6 : 1,
                    }}
                    disabled={commentLoading}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="text-area">
            <textarea id={editorId}></textarea>
          </div>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      )}
    </div>
  );
};

export default ProjectTasks;