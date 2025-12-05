import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, AlertCircle, ChevronRight, User, CheckCircle, Circle, Clock } from 'lucide-react';
import Select, { components } from 'react-select';
import Usersimage from '../../../../assets/users.png';
import { Api_url } from '../../../../networkCalls/Apiurls';
// import html2pdf from 'html2pdf.js'
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
import pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";



(pdfMake as any).vfs = (pdfFonts as any).vfs;

interface User {
  user_id: string | number;
  user_name: string;
  email?: string;
}

interface PDFOptions {
  header?: string;
  footer?: string;
  margin?: number;
}

interface ProjectDetailProps {
  onBack: () => void;
  onEditProject: (projectId: string) => void;
  onCreateTask: (projectId: string) => void;
  onUpdateTask: (updatedTask: any, projectId: string, phaseId: string) => void;
  onDeleteTask: (taskId: string, projectId: string, phaseId: string) => void;
}
interface DocumentData {
  task_doc_id: number;
  document_json: string;  // The HTML content for the PDF
}

// Custom option with checkbox
const Option = (props: any) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}
        onChange={() => null}
        className="mr-2"
      />
      <label>{props.label}</label>
    </components.Option>
  );
};

// Get initials from user name
const getInitials = (name: string) => {
  const parts = name.trim().split(' ');
  const initials = parts.map((p) => p[0]).join('');
  return initials.slice(0, 2).toUpperCase();
};

// Generate a consistent background color based on name hash
const getColorForInitials = (name: string) => {
  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#0EA5E9'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  state = { hasError: false, error: undefined };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-600 p-4">
          Error rendering component: {this.state.error?.message || 'Unknown error'}
        </div>
      );
    }
    return this.props.children;
  }
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({
  onBack,
  onEditProject,
  onCreateTask,
  onUpdateTask,
  onDeleteTask
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhase, setActivePhase] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [selectedPhaseOrTask, setSelectedPhaseOrTask] = useState<any>(null);
  const [assignType, setAssignType] = useState<'phase' | 'task' | null>(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [phaseTaskUsers, setPhaseTaskUsers] = useState<any[]>([]);
  const [unassignedUsers, setUnassignedUsers] = useState<any[]>([]);
  const [crntUser, setCrntUser] = useState<any>(null);
  const [phaseUsersMap, setPhaseUsersMap] = useState<{ [key: string]: User[] }>({});
  const [taskUsersMap, setTaskUsersMap] = useState<{ [key: string]: User[] }>({});
  const [totalTasks, setTotalTasks] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [data, setData] = useState<DocumentData | null>(null);

  // Fetch user details from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCrntUser({
          id: parsedUser.id,
          name: parsedUser.name,
          email: parsedUser.email,
          role: parsedUser.role
        });
      } catch (err) {
        console.error('Error parsing user data from localStorage:', err);
        setErrorMessage('Failed to load user data.');
      }
    } else {
      setErrorMessage('No user data found in localStorage.');
    }
  }, []);

  // Convert API users to react-select format
  const options = project?.users?.map((u: any) => ({
    value: u.user_id,
    label: u.user_name,
  })) || [];

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setErrorMessage('Invalid project ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching project details for projectId:', projectId);
        const headers = await import('../../../../networkCalls/NetworkCalls').then(m => m.getApiHeaders());
        const res = await fetch(Api_url.getProjectDetails(projectId), { headers });
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const response = await res.json();
        if (!response.data || !response.data.project_id) {
          throw new Error('Invalid project data received');
        }

        // Deduplicate phases by phase_id
        const uniquePhases = Array.from(
          new Map(response.data.phases.map((phase: any) => [phase.phase_id, phase])).values()
        );

        // Update project data with deduplicated phases
        const projectData = {
          ...response.data,
          phases: uniquePhases,
        };

        setProject(projectData);

        // Calculate total tasks from unique phases
        const taskCount = uniquePhases.reduce((total: number, phase: any) => {
          return total + (phase.tasks?.length || 0);
        }, 0) || 0;
        setTotalTasks(taskCount);
      } catch (err: any) {
        console.error('Error fetching project details:', err.message);
        setErrorMessage(`Failed to load project details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  // Fetch phase and task users dynamically
  useEffect(() => {
    const fetchPhaseAndTaskUsers = async () => {
      if (!project || !project.phases) return;

      try {
        const headers = await import('../../../../networkCalls/NetworkCalls').then(m => m.getApiHeaders());

        // Fetch phase users
        const phaseUsersPromises = project.phases.map(async (phase: any) => {
          try {
            const res = await fetch(Api_url.getUsersByProjectPhaseId(phase.phase_id), { headers });
            if (!res.ok) {
              console.warn(`No users found for phase ${phase.phase_id} (Status: ${res.status})`);
              return { phaseId: String(phase.phase_id), users: [] };
            }
            const { data } = await res.json();
            return { phaseId: String(phase.phase_id), users: data || [] };
          } catch (err: any) {
            console.warn(`Error fetching users for phase ${phase.phase_id}: ${err.message}`);
            return { phaseId: String(phase.phase_id), users: [] };
          }
        });

        // Fetch task users
        const taskUsersPromises = project.phases.flatMap((phase: any) =>
          phase.tasks?.map(async (task: any) => {
            try {
              const res = await fetch(Api_url.getUsersByProjectTaskId(task.task_id), { headers });
              if (!res.ok) {
                console.warn(`No users found for task ${task.task_id} (Status: ${res.status})`);
                return { taskId: String(task.task_id), users: [] };
              }
              const { data } = await res.json();
              return { taskId: String(task.task_id), users: data || [] };
            } catch (err: any) {
              console.warn(`Error fetching users for task ${task.task_id}: ${err.message}`);
              return { taskId: String(task.task_id), users: [] };
            }
          }) || []
        );

        const phaseUsersResults = await Promise.all(phaseUsersPromises);
        const taskUsersResults = await Promise.all(taskUsersPromises);

        const newPhaseUsersMap = phaseUsersResults.reduce((acc, { phaseId, users }) => ({
          ...acc,
          [phaseId]: users.map((u: any) => ({ user_id: u.user_id, user_name: u.user_name }))
        }), {});
        setPhaseUsersMap(newPhaseUsersMap);

        const newTaskUsersMap = taskUsersResults.reduce((acc, { taskId, users }) => ({
          ...acc,
          [taskId]: users.map((u: any) => ({ user_id: u.user_id, user_name: u.user_name }))
        }), {});
        setTaskUsersMap(newTaskUsersMap);
      } catch (err: any) {
        console.error('Error fetching phase/task users:', err.message);
        setErrorMessage(`Failed to load phase/task users: ${err.message}`);
      }
    };
    fetchPhaseAndTaskUsers();
  }, [project]);

  const handleAssignPopupOpen = (item: any, type: 'phase' | 'task') => {
    setSelectedPhaseOrTask({
      ...item,
      phase_name: type === 'phase' ? item.phase_name : undefined,
      task_name: type === 'task' ? item.task_name : undefined,
    });
    setAssignType(type);
    setShowAssignPopup(true);
    setSelectedUser(null);
    setComment('');
    setErrorMessage('');

    const assignedUsers = type === 'phase'
      ? phaseUsersMap[String(item.phase_id)]?.map(u => u.user_id) || []
      : taskUsersMap[String(item.task_id)]?.map(u => u.user_id) || [];

    const unassigned = options.filter(opt => !assignedUsers.includes(opt.value));
    setUnassignedUsers(unassigned);
  };

  const handleAssign = async () => {
    if (!selectedUser || !selectedPhaseOrTask) {
      setErrorMessage("Please select a user.");
      return;
    }

    try {
      const headers = await import('../../../../networkCalls/NetworkCalls').then(m => m.getApiHeaders());
      const isPhase = assignType === 'phase';
      const endpoint = isPhase
        ? Api_url.transferProjectPhaseOwnership()
        : Api_url.transferProjectTaskOwnership();
      const payload = isPhase
        ? {
          project_phase_id: selectedPhaseOrTask.phase_id,
          from_user_id: crntUser.id,
          to_user_id: selectedUser.value,
          phase_transfer_reason: comment || 'Ownership transfer'
        }
        : {
          project_task_id: selectedPhaseOrTask.task_id,
          from_user_id: crntUser.id,
          to_user_id: selectedUser.value,
          task_transfer_reason: comment || 'Ownership transfer'
        };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Failed to transfer ${isPhase ? 'phase' : 'task'} ownership: ${res.status}`);
      }

      const newUser = options.find(opt => opt.value === selectedUser.value);
      if (!newUser) {
        throw new Error('Selected user not found in options.');
      }

      // Fetch updated users to ensure all mapped users are displayed
      const fetchUpdatedUsers = async () => {
        try {
          const userEndpoint = isPhase
            ? Api_url.getUsersByProjectPhaseId(selectedPhaseOrTask.phase_id)
            : Api_url.getUsersByProjectTaskId(selectedPhaseOrTask.task_id);
          const userRes = await fetch(userEndpoint, { headers });
          if (!userRes.ok) {
            console.warn(`No users found for ${isPhase ? 'phase' : 'task'} after transfer (Status: ${userRes.status})`);
            return [];
          }
          const { data } = await userRes.json();
          return data.map((u: any) => ({ user_id: u.user_id, user_name: u.user_name })) || [];
        } catch (err: any) {
          console.warn(`Error fetching updated users for ${isPhase ? 'phase' : 'task'}: ${err.message}`);
          return [];
        }
      };

      const updatedUsers = await fetchUpdatedUsers();

      // Update state with the fetched users or append the new user locally if fetch fails
      const newUserData = { user_id: newUser.value, user_name: newUser.label };
      if (isPhase) {
        setPhaseUsersMap(prev => ({
          ...prev,
          [String(selectedPhaseOrTask.phase_id)]: updatedUsers.length > 0
            ? updatedUsers
            : [...(prev[String(selectedPhaseOrTask.phase_id)] || []), newUserData]
        }));
      } else {
        setTaskUsersMap(prev => ({
          ...prev,
          [String(selectedPhaseOrTask.task_id)]: updatedUsers.length > 0
            ? updatedUsers
            : [...(prev[String(selectedPhaseOrTask.task_id)] || []), newUserData]
        }));
      }

      setShowAssignPopup(false);
      setSelectedUser(null);
      setComment('');
      setErrorMessage('');
    } catch (err: any) {
      console.error('Error transferring ownership:', err.message);
      setErrorMessage(`Failed to transfer ownership: ${err.message}`);
    }
  };

  const assignUsersToPhase = async () => {
    if (!selectedPhaseOrTask?.phase_id || selectedOptions.length === 0) {
      setErrorMessage("Please select at least one user.");
      return;
    }

    try {
      const headers = await import('../../../../networkCalls/NetworkCalls').then(m => m.getApiHeaders());
      const payload = {
        project_phase_id: selectedPhaseOrTask.phase_id,
        user_ids: selectedOptions.map(opt => opt.value)
      };
      console.log('Assigning users to phase:', payload); // Log payload for debugging
      const res = await fetch(Api_url.mapUsersToPhase(), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Failed to map users to phase: ${res.status}`;
        throw new Error(errorMessage);
      }

      const newUsers = selectedOptions.map(opt => ({
        user_id: opt.value,
        user_name: opt.label
      }));

      setPhaseUsersMap(prev => ({
        ...prev,
        [String(selectedPhaseOrTask.phase_id)]: newUsers
      }));

      setShowPopup(false);
      setSelectedOptions([]);
      setErrorMessage('');
    } catch (err: any) {
      console.error('Error mapping users to phase:', err.message);
      setErrorMessage(`Failed to map users to phase: ${err.message}`);
    }
  };

  const assignUsersToTask = async () => {
    if (!selectedPhaseOrTask?.task_id || selectedOptions.length === 0) {
      setErrorMessage("Please select at least one user.");
      return;
    }

    try {
      const headers = await import('../../../../networkCalls/NetworkCalls').then(m => m.getApiHeaders());
      const payload = {
        project_task_id: selectedPhaseOrTask.task_id,
        user_ids: selectedOptions.map(opt => opt.value)
      };
      const res = await fetch(Api_url.mapUsersToTask(), {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Failed to map users to task: ${res.status}`);
      }

      const newUsers = selectedOptions.map(opt => ({
        user_id: opt.value,
        user_name: opt.label
      }));

      setTaskUsersMap(prev => ({
        ...prev,
        [String(selectedPhaseOrTask.task_id)]: newUsers
      }));

      setShowPopup(false);
      setSelectedOptions([]);
      setErrorMessage('');
    } catch (err: any) {
      console.error('Error mapping users to task:', err.message);
      setErrorMessage(`Failed to map users to task: ${err.message}`);
    }
  };

  const handleDownload = async (filename: string, downloadName: string) => {
    try {
      const headers = await import('../../../../networkCalls/NetworkCalls').then(m => m.getApiHeaders());
      const downloadUrl = Api_url.getProjectFile(filename);
      const res = await fetch(downloadUrl, { headers });
      if (!res.ok) {
        throw new Error(`Failed to download file: ${res.status}`);
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadName || filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error downloading file:', err.message);
      setErrorMessage(`Failed to download file: ${err.message}`);
    }
  };

const handleTaskDocClick = async (id: number) => {
  console.log('Fetching data for task:', id);

  try {
    const url = Api_url.getTaskDoc(id); //  Now using correct URL builder
    console.log('Fetching from URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
      },
    });

    const result = await response.json();
    console.log('Data fetched:', result);

    if (result.status_code === 200 && result.data) {
      console.log(result.data, 'resultdata');
      setData(result.data); // Optional: keep if needed
      await generatePDF(result.data); //  Your PDF generation logic
    } else {
      const message = result?.message || result?.detail || 'Unknown error';
      console.error('Error fetching document:', message);
      setErrorMessage(`Error fetching document: ${message}`);
    }
  } catch (error: any) {
    console.error('Error fetching data:', error.message);
    setErrorMessage('Failed to fetch document data.');
  }
};



// function preprocessHTML(rawHtml: string): string {
//   const container = document.createElement("div");
//   container.innerHTML = rawHtml;

//   //  Replace <select> with selected option text
//   container.querySelectorAll("select").forEach((sel) => {
//     const selectedText = (sel as HTMLSelectElement).selectedOptions[0]?.text || "";
//     const span = document.createElement("span");
//     span.textContent = selectedText;
//     sel.replaceWith(span);
//   });

//   //  Replace text inputs with their value
//   container
//     .querySelectorAll(
//       "input[type=text], input[type=email], input[type=password], input[type=number], textarea"
//     )
//     .forEach((input) => {
//       const inp = input as HTMLInputElement;
//       let label = "";
//       const value = inp.value || "";

//       // Match label[for=id]
//       if (inp.id) {
//         const lbl = container.querySelector(`label[for="${inp.id}"]`);
//         if (lbl) {
//           label = lbl.textContent?.trim() || "";
//           const labelSpan = document.createElement("span");
//           labelSpan.textContent = label + ": ";
//           labelSpan.style.fontWeight = "bold";
//           lbl.replaceWith(labelSpan);
//         }
//       }

//       // Fallback → placeholder or sibling text
//       if (!label) {
//         label = inp.placeholder || inp.nextSibling?.textContent?.trim() || "";
//       }

//       const span = document.createElement("span");
//       span.style.display = "inline-block";
//       span.style.border = "1px solid #ccc";
//       span.style.padding = "2px 4px";
//       span.style.backgroundColor = "#f9f9f9";
//       span.style.minWidth = "100px";
//       span.textContent = value || "[empty]";

//       if (label && !inp.id) {
//         span.textContent = label + ": " + (value || "[empty]");
//       }

//       inp.replaceWith(span);
//     });

//   //  Replace radio buttons with only the selected option
//   const radioGroups = new Map();
//   container.querySelectorAll("input[type=radio]").forEach((radio) => {
//     const rad = radio as HTMLInputElement;
//     if (!radioGroups.has(rad.name)) {
//       radioGroups.set(rad.name, null);
//     }
//     if (rad.checked) {
//       radioGroups.set(rad.name, rad);
//     }
//   });

//   container.querySelectorAll("input[type=radio]").forEach((radio) => {
//     const rad = radio as HTMLInputElement;

//     // Helper to find and remove next text node
//     const removeNextTextNode = (node: Node) => {
//       let sibling = node.nextSibling;
//       while (sibling) {
//         if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
//           sibling.remove();
//           return true;
//         }
//         sibling = sibling.nextSibling;
//       }
//       return false;
//     };

//     let label = "";

//     // Prefer label[for=id]
//     if (rad.id) {
//       const lbl = container.querySelector(`label[for="${rad.id}"]`);
//       if (lbl) {
//         label = lbl.textContent?.trim() || "";
//         lbl.remove();
//       }
//     }

//     // Fallback: next text node or value
//     if (!label) {
//       let nextText = "";
//       let nextTextNode: Node | null = null;
//       let sibling = rad.nextSibling;
//       while (sibling) {
//         if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
//           nextText = sibling.textContent.trim();
//           nextTextNode = sibling;
//           break;
//         }
//         sibling = sibling.nextSibling;
//       }
//       label = nextText || rad.value || "";

//       // If used next text, remove it to avoid duplication
//       if (nextTextNode) {
//         nextTextNode.remove();
//       }
//     }

//     if (radioGroups.get(rad.name) === rad) {
//       // For selected: create span
//       const span = document.createElement("span");
//       span.textContent = label + " *"; //  Only once
//       span.style.display = "inline-block";
//       span.style.padding = "2px 4px";
//       rad.replaceWith(span);
//     } else {
//       // For unselected: remove radio and its associated text if applicable
//       removeNextTextNode(rad);
//       radio.remove();
//     }
//   });

//   return container.innerHTML;
// }


// function preprocessHTML(rawHtml: string): string {
//   const container = document.createElement("div");
//   container.innerHTML = rawHtml;

//   //  Replace <select> with selected option text
//   container.querySelectorAll("select").forEach((sel) => {
//     const selectedText = (sel as HTMLSelectElement).selectedOptions[0]?.text || "";
//     const span = document.createElement("span");
//     span.textContent = selectedText;
//     sel.replaceWith(span);
//   });

//   //  Replace text inputs with their value
//   container
//     .querySelectorAll(
//       "input[type=text], input[type=email], input[type=password], input[type=number], textarea"
//     )
//     .forEach((input) => {
//       const inp = input as HTMLInputElement;
//       let label = "";
//       const value = inp.value || "";

//       // Match label[for=id]
//       if (inp.id) {
//         const lbl = container.querySelector(`label[for="${inp.id}"]`);
//         if (lbl) {
//           label = lbl.textContent?.trim() || "";
//           const labelSpan = document.createElement("span");
//           labelSpan.textContent = label + ": ";
//           labelSpan.style.fontWeight = "bold";
//           lbl.replaceWith(labelSpan);
//         }
//       }

//       // Fallback → placeholder or sibling text
//       if (!label) {
//         label = inp.placeholder || inp.nextSibling?.textContent?.trim() || "";
//       }

//       const span = document.createElement("span");
//       span.style.display = "inline-block";
//       span.style.border = "1px solid #ccc";
//       span.style.padding = "2px 4px";
//       span.style.backgroundColor = "#f9f9f9";
//       span.style.minWidth = "100px";
//       span.textContent = value || "[empty]";

//       if (label && !inp.id) {
//         span.textContent = label + ": " + (value || "[empty]");
//       }

//       inp.replaceWith(span);
//     });

//   //  Replace radio buttons with only the selected option
//   const radioGroups = new Map();
//   container.querySelectorAll("input[type=radio]").forEach((radio) => {
//     const rad = radio as HTMLInputElement;
//     if (!radioGroups.has(rad.name)) {
//       radioGroups.set(rad.name, null);
//     }
//     if (rad.checked) {
//       radioGroups.set(rad.name, rad);
//     }
//   });

//   container.querySelectorAll("input[type=radio]").forEach((radio) => {
//     const rad = radio as HTMLInputElement;

//     // Helper to find and remove next text node
//     const removeNextTextNode = (node: Node) => {
//       let sibling = node.nextSibling;
//       while (sibling) {
//         if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
//           sibling.remove();
//           return true;
//         }
//         sibling = sibling.nextSibling;
//       }
//       return false;
//     };

//     let label = "";

//     if (rad.id) {
//       const lbl = container.querySelector(`label[for="${rad.id}"]`);
//       if (lbl) {
//         label = lbl.textContent?.trim() || "";
//         lbl.remove();
//       }
//     }

//     if (!label) {
//       let nextText = "";
//       let nextTextNode: Node | null = null;
//       let sibling = rad.nextSibling;
//       while (sibling) {
//         if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
//           nextText = sibling.textContent.trim();
//           nextTextNode = sibling;
//           break;
//         }
//         sibling = sibling.nextSibling;
//       }
//       label = nextText || rad.value || "";
//       if (nextTextNode) nextTextNode.remove();
//     }

//     if (radioGroups.get(rad.name) === rad) {
//       const span = document.createElement("span");
//       span.textContent = label + " *";
//       span.style.display = "inline-block";
//       span.style.padding = "2px 4px";
//       rad.replaceWith(span);
//     } else {
//       removeNextTextNode(rad);
//       radio.remove();
//     }
//   });

//   //  Replace checkboxes with only checked ones
//   container.querySelectorAll("input[type=checkbox]").forEach((chk) => {
//     const cb = chk as HTMLInputElement;

//     let label = "";
//     if (cb.id) {
//       const lbl = container.querySelector(`label[for="${cb.id}"]`);
//       if (lbl) {
//         label = lbl.textContent?.trim() || "";
//         lbl.remove();
//       }
//     }

//     if (!label) {
//       let nextText = "";
//       let nextTextNode: Node | null = null;
//       let sibling = cb.nextSibling;
//       while (sibling) {
//         if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
//           nextText = sibling.textContent.trim();
//           nextTextNode = sibling;
//           break;
//         }
//         sibling = sibling.nextSibling;
//       }
//       label = nextText || cb.value || "";
//       if (nextTextNode) nextTextNode.remove();
//     }

//     if (cb.checked) {
//       const span = document.createElement("span");
//       span.textContent = label + " *"; //   show checked ones with star
//       span.style.display = "inline-block";
//       span.style.padding = "2px 4px";
//       cb.replaceWith(span);
//     } else {
//       // Remove unchecked + its label text
//       let sibling = cb.nextSibling;
//       while (sibling) {
//         if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
//           sibling.remove();
//           break;
//         }
//         sibling = sibling.nextSibling;
//       }
//       cb.remove();
//     }
//   });

//   return container.innerHTML;
// }

function preprocessHTML(rawHtml: string): string {
  const container = document.createElement("div");
  container.innerHTML = rawHtml;

  //  Replace <select> with selected option text
  container.querySelectorAll("select").forEach((sel) => {
    const selectedText = (sel as HTMLSelectElement).selectedOptions[0]?.text || "";
    const span = document.createElement("span");
    span.textContent = selectedText;
    sel.replaceWith(span);
  });

  //  Replace text inputs with their value
  container
    .querySelectorAll(
      "input[type=text], input[type=email], input[type=password], input[type=number], textarea"
    )
    .forEach((input) => {
      const inp = input as HTMLInputElement;
      let label = "";
      const value = inp.value || "";

      if (inp.id) {
        const lbl = container.querySelector(`label[for="${inp.id}"]`);
        if (lbl) {
          label = lbl.textContent?.trim() || "";
          const labelSpan = document.createElement("span");
          labelSpan.textContent = label + ": ";
          labelSpan.style.fontWeight = "bold";
          lbl.replaceWith(labelSpan);
        }
      }

      if (!label) {
        label = inp.placeholder || inp.nextSibling?.textContent?.trim() || "";
      }

      const span = document.createElement("span");
      span.style.display = "inline-block";
      span.style.border = "1px solid #ccc";
      span.style.padding = "2px 4px";
      span.style.backgroundColor = "#f9f9f9";
      span.style.minWidth = "100px";
      span.textContent = value || "[empty]";

      if (label && !inp.id) {
        span.textContent = label + ": " + (value || "[empty]");
      }

      inp.replaceWith(span);
    });

  // Replace radio buttons with only the selected option
  const radioGroups = new Map();
  container.querySelectorAll("input[type=radio]").forEach((radio) => {
    const rad = radio as HTMLInputElement;
    if (!radioGroups.has(rad.name)) {
      radioGroups.set(rad.name, null);
    }
    if (rad.checked) {
      radioGroups.set(rad.name, rad);
    }
  });

  container.querySelectorAll("input[type=radio]").forEach((radio) => {
    const rad = radio as HTMLInputElement;

    const removeNextTextNode = (node: Node) => {
      let sibling = node.nextSibling;
      while (sibling) {
        if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
          sibling.remove();
          return true;
        }
        sibling = sibling.nextSibling;
      }
      return false;
    };

    let label = "";

    if (rad.id) {
      const lbl = container.querySelector(`label[for="${rad.id}"]`);
      if (lbl) {
        label = lbl.textContent?.trim() || "";
        lbl.remove();
      }
    }

    if (!label) {
      let nextText = "";
      let nextTextNode: Node | null = null;
      let sibling = rad.nextSibling;
      while (sibling) {
        if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
          nextText = sibling.textContent.trim();
          nextTextNode = sibling;
          break;
        }
        sibling = sibling.nextSibling;
      }
      label = nextText || rad.value || "";
      if (nextTextNode) nextTextNode.remove();
    }

    if (radioGroups.get(rad.name) === rad) {
      const span = document.createElement("span");
      span.textContent = label + " *";
      span.style.display = "inline-block";
      span.style.padding = "2px 4px";
      rad.replaceWith(span);
    } else {
      removeNextTextNode(rad);
      radio.remove();
    }
  });

  //  Replace checkboxes with only checked ones
  container.querySelectorAll("input[type=checkbox]").forEach((chk) => {
    const cb = chk as HTMLInputElement;
    let label = "";

    if (cb.id) {
      const lbl = container.querySelector(`label[for="${cb.id}"]`);
      if (lbl) {
        label = lbl.textContent?.trim() || "";
        lbl.remove();
      }
    }

    if (!label) {
      let nextText = "";
      let nextTextNode: Node | null = null;
      let sibling = cb.nextSibling;
      while (sibling) {
        if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
          nextText = sibling.textContent.trim();
          nextTextNode = sibling;
          break;
        }
        sibling = sibling.nextSibling;
      }
      label = nextText || cb.value || "";
      if (nextTextNode) nextTextNode.remove();
    }

    if (cb.checked) {
      const span = document.createElement("span");
      span.textContent = label + " *";
      span.style.display = "inline-block";
      span.style.padding = "2px 4px";
      cb.replaceWith(span);
    } else {
      let sibling = cb.nextSibling;
      while (sibling) {
        if (sibling.nodeType === Node.TEXT_NODE && sibling.textContent?.trim()) {
          sibling.remove();
          break;
        }
        sibling = sibling.nextSibling;
      }
      cb.remove();
    }
  });

  //  Replace button inputs with N/A
  container.querySelectorAll("input[type=button], button").forEach((btn) => {
    const span = document.createElement("span");
    // span.textContent = "N/A";
    span.textContent = "";
    span.style.display = "inline-block";
    span.style.padding = "2px 4px";
    btn.replaceWith(span);
  });

  return container.innerHTML;
}


const generatePDF = (data: any) => {
  if (!data || !data.document_json) {
    console.error("No document data to generate PDF");
    return;
  }

  const margin = 25;

  //  Clean HTML with select/radio/checkbox replacements
  const cleanHtml = preprocessHTML(data.document_json);

  //  Convert HTML → pdfmake structure
  const pdfContent = htmlToPdfmake(cleanHtml);

  const docDefinition: any = {
    pageSize: "A4",
    pageMargins: [margin, margin + 40, margin, margin + 40], // leave room for header & footer

    //  Dummy header on every page
    header: (currentPage: number, pageCount: number) => {
      return {
        text: "AIVerify- United Consulting Hub",
        alignment: "center",
        fontSize: 20,
        margin: [0, 15, 0, 0], // [left, top, right, bottom]
      };
    },

    //  Dummy footer on every page
    footer: (currentPage: number, pageCount: number) => {
      return {
        text: `AIVerify- United Consulting Hub ${currentPage} of ${pageCount}`,
        alignment: "center",
        fontSize: 20,
        margin: [0, 0, 0, 15],
      };
    },

    content: pdfContent,
    defaultStyle: { fontSize: 11 },
  };

  pdfMake.createPdf(docDefinition).download(`document_${data.task_doc_id}.pdf`);
};


  const getStatusName = (id: number) => {
    const statuses: Record<number, string> = {
      1: 'Active',
      2: 'On Hold',
      3: 'Completed',
      4: 'Pre-Approved',
      5: 'Executed',
      6: 'Post Approved',
      7: 'Closed',
      8: 'In Progress',
      9: 'Dry Run Complete'
    };
    return statuses[id] || 'Unknown';
  };

  const getStatusIcon = (id: number) => {
    switch (id) {
      case 2:
        return <Clock className="text-blue-500 w-4 h-4" />;
      case 7:
        return <CheckCircle className="text-green-500 w-4 h-4" />;
      default:
        return <Circle className="text-gray-400 w-4 h-4" />;
    }
  };

  const getStatusColorBadge = (id: number) => {
    switch (id) {
      case 2:
        return 'bg-blue-100 text-blue-700';
      case 7:
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const openPopup = (item: any, phase: boolean, id: any) => {
    setSelectedPhaseOrTask(item);
    setShowPopup(true);
    setSelectedOptions([]);
    setPhaseTaskUsers([]);
    setErrorMessage('');

    const users = phase
      ? phaseUsersMap[String(id)] || []
      : taskUsersMap[String(id)] || [];
    setPhaseTaskUsers(users);

    const assignedOptions = options.filter(opt =>
      users.map((u: User) => u.user_id).includes(opt.value)
    );
    setSelectedOptions(assignedOptions);
  };

  if (loading || !crntUser) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!projectId) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-10 w-10 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-700">Invalid project ID</h3>
        <button
          onClick={onBack}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project || errorMessage) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-10 w-10 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-semibold text-gray-700">Project not found</h3>
        <p className="text-gray-600 mt-2">{errorMessage || 'Failed to load project details.'}</p>
        <button
          onClick={onBack}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{project.project_name}</h1>
          </div>
          <button
            onClick={onBack}
            title="Back"
            className="group flex items-center gap-2 text-red-600 hover:text-red-800"
          >
            <div className="h-8 w-8 flex items-center justify-center rounded-full border border-red-600">
              <ArrowLeft className="h-4 w-4 text-red-600 group-hover:text-red-800" />
            </div>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded shadow border p-6">
              <h2 className="text-lg font-bold mb-4">Project Overview</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  Status: <span className="text-white bg-blue-500 rounded px-2 py-0.5">{getStatusName(project.status_id)}</span>
                </div>
                <div>
                  Risk Assessment: <span className="text-green-800 bg-green-100 rounded px-2 py-0.5">{project.risk_assessment_name}</span>
                </div>
                <div>
                  Created: <span className="text-gray-700">{new Date(project.created_date).toLocaleDateString()}</span>
                </div>
                <div>
                  Total Tasks: <span className="text-gray-700">{totalTasks}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-4">
                <h3 className="font-semibold text-gray-800 mb-1">Description:</h3>
                <span className={`${!showFullDescription ? 'line-clamp-2' : ''} whitespace-pre-line`}>
                  {project.description}
                </span>
                {project.description?.length > 100 && (
                  <button
                    onClick={() => setShowFullDescription(prev => !prev)}
                    className="text-blue-600 text-xs ml-2 hover:underline"
                  >
                    {showFullDescription ? 'Show Less' : 'Show More'}
                  </button>
                )}
              </div>
              {project.project_files?.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Attached Files:</h3>
                  <ul className="space-y-2">
                    {project.project_files.map((file: string, index: number) => {
                      const parts = file.split('_');
                      const originalName = parts.slice(1).join('_');
                      return (
                        <li
                          key={index}
                          className="flex justify-between items-center bg-gray-50 p-2 rounded"
                        >
                          <span>{originalName}</span>
                          <button
                            onClick={() => handleDownload(file, originalName)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Download"
                          >
                            <i class="fa fa-download" aria-hidden="true"></i>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {project.phases?.some((phase: any) => phase.task_docs?.length > 0) && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Task Documents:</h3>
                  <ul className="space-y-2">
                    {project.phases.flatMap((phase: any) =>
                      phase.task_docs?.map((doc: any) => {
                        const parts = doc.phase_name_doc_version.split('_');
                        const originalName = parts.slice(1).join('_');
                        return (
                          <li
                            key={doc.task_doc_id}
                            className="flex justify-between items-center bg-gray-50 p-2 rounded"
                          >
                            <span>{`${phase.phase_name} - ${originalName}`}</span>
                            <button
                              onClick={() => handleTaskDocClick(doc.task_doc_id)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Download Task Document"
                            >
                              <i className="fa fa-download" aria-hidden="true"></i>
                            </button>
                          </li>
                        );
                      }) || []
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white rounded shadow border p-6">
              <h3 className="text-lg font-bold mb-4">Project Users</h3>
              <div className="space-y-3">
                {project.users?.map((u: any) => (
                  <div key={u.user_id} className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{u.user_name}</div>
                      <div className="text-xs text-gray-500">{u.role_name || 'No role'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Phases</h2>
          <div className="space-y-4">
            {project.phases?.map((phase: any) => {
              const isCurrentUserInPhase = phaseUsersMap[String(phase.phase_id)]?.some(
                (user: User) => String(user.user_id) === String(crntUser.id)
              );
              return (
                <ErrorBoundary key={phase.phase_id}>
                  <div
                    className={`bg-white rounded-lg border p-4 transition-all ${activePhase === String(phase.phase_id) ? 'border-blue-600' : 'border-gray-200'}`}
                    onClick={() =>
                      setActivePhase(activePhase === String(phase.phase_id) ? null : String(phase.phase_id))
                    }
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <h3 className="text-gray-900 font-medium">{phase.phase_name}</h3>
                        <span className={`text-xs rounded px-2 py-0.5 ${getStatusColorBadge(phase.status_id)}`}>
                          {getStatusName(phase.status_id)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="flex -space-x-2">
                          {phaseUsersMap[String(phase.phase_id)]?.length > 0 ? (
                            phaseUsersMap[String(phase.phase_id)].map((user: User) => (
                              <div key={user.user_id} className="relative group">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-white"
                                  style={{ backgroundColor: getColorForInitials(user.user_name) }}
                                >
                                  {getInitials(user.user_name)}
                                </div>
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  {user.user_name}
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-500">No phase users</span>
                          )}
                        </div>
                        {crntUser?.role === 'Admin' ? (
                          <button
                            className="ml-2 text-gray-500 hover:text-black"
                            onClick={e => {
                              e.stopPropagation();
                              openPopup(phase, true, phase.phase_id);
                            }}
                          >
                            <User className="w-6 h-6" />
                          </button>
                        ) : (
                          <button
                            className={`ml-2 ${isCurrentUserInPhase ? '' : 'opacity-50 cursor-not-allowed'}`}
                            onClick={(e) => {
                              if (isCurrentUserInPhase) {
                                e.stopPropagation();
                                handleAssignPopupOpen(phase, 'phase');
                              }
                            }}
                            disabled={!isCurrentUserInPhase}
                            title={isCurrentUserInPhase ? 'Transfer phase ownership' : 'You are not assigned to this phase'}
                          >
                            <img src={Usersimage} alt="User Icon" className="w-6 h-6" />
                          </button>
                        )}
                        <ChevronRight
                          className={`h-4 w-4 transition-transform ${activePhase === String(phase.phase_id) ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </div>

                    {activePhase === String(phase.phase_id) && (
                      <div className="mt-4 space-y-2">
                        {phase.tasks?.length > 0 ? (
                          phase.tasks.map((task: any) => {
                            const isCurrentUserInTask = taskUsersMap[String(task.task_id)]?.some(
                              (user: User) => String(user.user_id) === String(crntUser.id)
                            );

                            return (
                              <div
                                key={task.task_id}
                                className="bg-gray-50 rounded p-3 border flex justify-between items-center"
                              >
                                <div className="flex items-center gap-2">
                                  <h3 className="text-gray-900 font-medium">{task.task_name}</h3>
                                  <span className={`text-xs rounded px-2 py-0.5 ${getStatusColorBadge(task.status_id)}`}>
                                    {getStatusName(task.status_id)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <div className="flex -space-x-2">
                                    {taskUsersMap[String(task.task_id)]?.length > 0 ? (
                                      taskUsersMap[String(task.task_id)].map((user: User) => (
                                        <div key={user.user_id} className="relative group">
                                          <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                                            style={{ backgroundColor: getColorForInitials(user.user_name) }}
                                          >
                                            {getInitials(user.user_name)}
                                          </div>
                                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 rounded bg-gray-800 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                            {user.user_name}
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-xs text-gray-500">No task users</span>
                                    )}
                                  </div>

                                  {crntUser?.role === 'Admin' ? (
                                    <button
                                      className="ml-2 text-gray-500 hover:text-black"
                                      onClick={e => {
                                        e.stopPropagation();
                                        openPopup(task, false, task.task_id);
                                      }}
                                    >
                                      <User className="w-5 h-5" />
                                    </button>
                                  ) : (
                                    <button
                                      className={`ml-2 ${isCurrentUserInTask ? '' : 'opacity-50 cursor-not-allowed'}`}
                                      onClick={(e) => {
                                        if (isCurrentUserInTask) {
                                          e.stopPropagation();
                                          handleAssignPopupOpen(task, 'task');
                                        }
                                      }}
                                      disabled={!isCurrentUserInTask || task.status_id === 3 || task.status_id === 6}
                                      title={isCurrentUserInTask ? (task.status_id === 3 || task.status_id === 6) ? 'The task has been completed.' : 'Transfer task ownership' : 'You are not assigned to this task'}
                                    >
                                      <img src={Usersimage} alt="User Icon" className="w-6 h-6" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            No tasks in this phase.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </ErrorBoundary>
              );
            })}
          </div>
        </div>

        {showPopup && crntUser?.role === 'Admin' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 md:p-8 relative">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full border border-gray-700 text-gray-700 text-xs font-bold flex items-center justify-center hover:bg-gray-100 hover:text-red-600 hover:border-red-600 transition"
                aria-label="Close"
                title="Close"
              >
                ✕
              </button>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Assign Users</h2>
              {errorMessage && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                  {errorMessage}
                </div>
              )}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Currently Assigned</label>
                  <div className="bg-gray-100 p-3 rounded-md min-h-[52px] text-sm text-gray-700 border border-gray-200">
                    {phaseTaskUsers.length > 0
                      ? phaseTaskUsers.map((u) => u.user_name).join(', ')
                      : 'No users assigned yet.'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Select Users</label>
                  <Select
                    options={options}
                    isMulti
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    components={{ Option }}
                    onChange={setSelectedOptions}
                    value={selectedOptions}
                    placeholder="Search and select users..."
                    className="text-sm"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => {
                    if (selectedPhaseOrTask?.phase_id) {
                      assignUsersToPhase();
                    } else if (selectedPhaseOrTask?.task_id) {
                      assignUsersToTask();
                    }
                  }}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-md shadow-sm transition"
                >
                  Assign
                </button>
              </div>
            </div>
          </div>
        )}

        {showAssignPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
              <h2 className="text-lg font-semibold mb-4">
                Transfer {assignType === 'phase' ? 'Phase' : 'Task'} Ownership to{' '}
                {assignType === 'phase'
                  ? selectedPhaseOrTask?.phase_name
                  : selectedPhaseOrTask?.task_name}
              </h2>

              {errorMessage && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                  {errorMessage}
                </div>
              )}

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current User</label>
                <input
                  type="text"
                  value={crntUser?.name}
                  disabled
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                <Select
                  options={unassignedUsers}
                  onChange={setSelectedUser}
                  value={selectedUser}
                  placeholder="Search and select user..."
                  className="text-sm"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  rows={3}
                ></textarea>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAssignPopup(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Transfer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ProjectDetail;