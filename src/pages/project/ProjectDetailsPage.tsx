import { useMemo, useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import PhasesTable from '../../components/project/phases/PhasesTable';
import type { Member, Project, Phase, Task } from '../../components/project/types';
import { ChevronLeft, ChevronDown, Download, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AvatarGroup from '../../components/project/utils/AvatarGroup';
import Select, { components } from 'react-select';
import { Api_url } from '../../networkCalls/Apiurls';
import RingGradientLoader from '../../components/RingGradientLoader';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";  // Fixed: Default import for vfs
import htmlToPdfmake from "html-to-pdfmake";
import { showSuccess, showError, showWarn } from "../../services/toasterService"; // Adjust path as needed
import DecodedTokenValues from '../../components/DecryptToken';
import { getRequestStatus, postRequestStatus } from '../../networkCalls/NetworkCalls';


// Fixed: Direct assignment of vfs (no .pdfMake property)
(pdfMake as any).vfs = pdfFonts;

// Custom option with checkbox (from reference) - ensures pre-selected show as checked
const Option = (props: any) => {
  return (
    <components.Option {...props}>
      <input
        type="checkbox"
        checked={props.isSelected}  // Fixed: Use isSelected for pre-checked state
        onChange={() => null}
        className="mr-2"
      />
      <label>{props.label}</label>
    </components.Option>
  );
};

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const expandedParam = searchParams.get('expanded');

  const [project, setProject] = useState<Project | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [allTaskDocs, setAllTaskDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectFilesExpanded, setProjectFilesExpanded] = useState(false);
  const [phaseDocsExpanded, setPhaseDocsExpanded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Admin check
  const [isAdmin, setIsAdmin] = useState(false);

  // Assign popup states
  const [showAssignPopup, setShowAssignPopup] = useState(false);
  const [assignType, setAssignType] = useState<'phase' | 'task' | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [selectedItemName, setSelectedItemName] = useState<string>('');
  const [selectedOptions, setSelectedOptions] = useState<any[]>([]);
  const [currentAssignedUsers, setCurrentAssignedUsers] = useState<any[]>([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [openingAssign, setOpeningAssign] = useState(false);
  // New states for transfer
  const [showTransferPopup, setShowTransferPopup] = useState(false);
  const [transferType, setTransferType] = useState<'phase' | 'task' | null>(null);
  const [selectedItem, setSelectedItem] = useState<{id: string, name: string} | null>(null);
  const [selectedToUser, setSelectedToUser] = useState<any>(null);
  const [transferComment, setTransferComment] = useState('');
  const [unassignedForTransfer, setUnassignedForTransfer] = useState<any[]>([]);
  const [transferLoading, setTransferLoading] = useState(false);
  const [openingTransfer, setOpeningTransfer] = useState(false);
  // New: Current user
  const [crntUser, setCrntUser] = useState<{id: string, name: string, role: string} | null>(null);
    // State for PDF loading
  const [pdfLoading, setPdfLoading] = useState<{ [key: number]: boolean }>({});
  // State for download loading
  const [downloadLoading, setDownloadLoading] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();
  const { user_id, user_name, user_role_id, user_role_name, user_email } = DecodedTokenValues();

  const BASE = (import.meta as any).env?.BASE_URL ?? '/';

  // Check admin role
  useEffect(() => {
    const roleId = user_role_id;
    setIsAdmin(roleId === 1);
  }, []);
// New useEffect for current user
  useEffect(() => {
  if (user_id && user_role_id && user_name) {
    setCrntUser({
      id: user_id.toString(),
      name: user_name,
      role: user_role_id === 1 ? 'Admin' : 'User'
    });
  } else {
    // setErrorMessage('No user ID found in localStorage.');
  }
}, [user_id, user_role_id, user_name]);
  
  // Options for react-select (all project members)
  const options = useMemo(() => 
    project?.members?.map((m: Member) => ({
      value: m.id,
      label: m.name,
    })) || [], 
  [project]);

  // Handle open assign modal (async fetch current users using getUsersBy... APIs)
  // const handleOpenAssign = async (type: 'phase' | 'task', itemId: string, itemName: string) => {
  //   setOpeningAssign(true);
  //   const actualId = itemId.replace(/^(phase|task)-/, '');
  //   setAssignType(type);
  //   setSelectedItemId(actualId);
  //   setSelectedItemName(itemName);

  //   try {
  //     const headers = await import('../../networkCalls/NetworkCalls').then(m => m.getApiHeaders());
  //     let fetchedUsers: any[] = [];
  //     if (type === 'phase') {
  //       const result = await getRequestStatus<{ data: any[] }>(Api_url.getUsersByProjectPhaseId(actualId), headers);
  //       if (result.status >= 200 && result.status < 300) {
  //         fetchedUsers = result.data?.data || [];
  //       }
  //     } else {
  //       const result = await getRequestStatus<{ data: any[] }>(Api_url.getUsersByProjectTaskId(actualId), headers);
  //       if (result.status >= 200 && result.status < 300) {
  //         fetchedUsers = result.data?.data || [];
  //       }
  //     }

  //     // Set current assigned for display (with image_url for potential avatar display)
  //     setCurrentAssignedUsers(fetchedUsers.map((u: any) => ({ 
  //       user_id: u.user_id, 
  //       user_name: u.user_name,
  //       image_url: u.image_url 
  //     })));

  //     // Pre-select in multi-select (ensures assigned users are selected/checked)
  //     const currentOptions = fetchedUsers.map((u: any) => ({
  //       value: u.user_id.toString(),  // Ensure string match with options.value
  //       label: u.user_name,
  //     }));
  //     setSelectedOptions(currentOptions);
  //   } catch (err: any) {
  //     console.error('Error fetching current users:', err);
  //     showError('Failed to load current users. Please try again.');
  //     // setErrorMessage(`Failed to load current users: ${err.message}`);
  //     // Fallback to empty
  //     setCurrentAssignedUsers([]);
  //     setSelectedOptions([]);
  //   } finally {
  //     setOpeningAssign(false);
  //     setShowAssignPopup(true);
  //   }
  // };
  const handleOpenAssign = async (type: 'phase' | 'task', itemId: string, itemName: string) => {
  setOpeningAssign(true);
  const actualId = itemId.replace(/^(phase|task)-/, '');
  setAssignType(type);
  setSelectedItemId(actualId);
  setSelectedItemName(itemName);

  try {
    let fetchedUsers: any[] = [];
    if (type === 'phase') {
      const result = await getRequestStatus<{ data: any[] }>(Api_url.getUsersByProjectPhaseId(actualId));
      if (result.status === 200) {
        fetchedUsers = result.data?.data || [];
      }
    } else {
      const result = await getRequestStatus<{ data: any[] }>(Api_url.getUsersByProjectTaskId(actualId));
      if (result.status === 200) {
        fetchedUsers = result.data?.data || [];
      }
    }

    // Set current assigned for display (with image_url for potential avatar display)
    setCurrentAssignedUsers(fetchedUsers.map((u: any) => ({ 
      user_id: u.user_id, 
      user_name: u.user_name,
      image_url: u.image_url 
    })));

    // Pre-select in multi-select (ensures assigned users are selected/checked)
    const currentOptions = fetchedUsers.map((u: any) => ({
      value: u.user_id.toString(),  // Ensure string match with options.value
      label: u.user_name,
    }));
    setSelectedOptions(currentOptions);
  } catch (err: any) {
    console.error('Error fetching current users:', err);
    showError('Failed to load current users. Please try again.');
    // setErrorMessage(`Failed to load current users: ${err.message}`);
    // Fallback to empty
    setCurrentAssignedUsers([]);
    setSelectedOptions([]);
  } finally {
    setOpeningAssign(false);
    setShowAssignPopup(true);
  }
};

  // Handle assign users (updated: after mapping, fetch and show updated users with images/initials)
  // const handleAssignUsers = async () => {
  //   if (!selectedOptions.length || !assignType || !selectedItemId) {
  //     showWarn('Please select at least one user.');
  //     // setErrorMessage('No users selected.');
  //     return;
  //   }
  //   setAssignLoading(true);
  //   try {
  //     const headersMod = await import('../../networkCalls/NetworkCalls').then(m => m.getApiHeaders());
  //     const headers = {
  //       ...headersMod,
  //       'Content-Type': 'application/json',
  //     };
  //     const userIds = selectedOptions.map((opt: any) => opt.value);

  //     // Emulate reference: Include ID in payload (project_phase_id or project_task_id)
  //     const payload = assignType === 'phase' 
  //       ? { user_ids: userIds, project_phase_id: selectedItemId } 
  //       : { user_ids: userIds, project_task_id: selectedItemId };

  //     // Use specified map APIs
  //     let url;
  //     if (assignType === 'phase') {
  //       url = Api_url.mapUsersToPhase(selectedItemId);
  //     } else {
  //       url = Api_url.mapUsersToTask(selectedItemId);
  //     }
  //     const res = await fetch(url, {
  //       method: 'POST',
  //       headers,
  //       body: JSON.stringify(payload),
  //     });

  //     if (!res.ok) {
  //       let errorMsg = `Failed to assign users: ${res.status}`;
  //       if (res.status === 422) {
  //         // Enhanced: Try to parse 422 details (common for validation errors)
  //         try {
  //           const errorData = await res.json();
  //           errorMsg += ` - ${errorData.message || 'Validation error (e.g., missing ID or invalid users)'}`;
  //         } catch {
  //           errorMsg += ' - Unprocessable entity (check payload)';
  //         }
  //       }
  //       // throw new Error(errorMsg);
  //     }

  //     // Fetch updated users after successful mapping
  //     let updatedUsers: any[] = [];
  //     if (assignType === 'phase') {
  //       const getRes = await fetch(Api_url.getUsersByProjectPhaseId(selectedItemId), { headers });
  //       if (getRes.ok) {
  //         const { data } = await getRes.json();
  //         updatedUsers = data || [];
  //       }
  //     } else {
  //       const getRes = await fetch(Api_url.getUsersByProjectTaskId(selectedItemId), { headers });
  //       if (getRes.ok) {
  //         const { data } = await getRes.json();
  //         updatedUsers = data || [];
  //       }
  //     }

  //     // Map to assignees with full Member structure (including avatars for images/initials)
  //     const updatedAssignees: Member[] = updatedUsers.map((u: any) => ({
  //       id: u.user_id.toString(),
  //       name: u.user_name,
  //       avatarUrl: u.image_url ? `${BASE}users_profile/${u.image_url}` : undefined,
  //     }));

  //     // Update local state with fetched updated assignees (ensures images/initials display correctly)
  //     setPhases((prev) =>
  //       prev.map((ph) => {
  //         if (assignType === 'phase' && ph.id === `phase-${selectedItemId}`) {
  //           return { ...ph, assignees: updatedAssignees };
  //         } else if (assignType === 'task') {
  //           return {
  //             ...ph,
  //             tasks: ph.tasks.map((t: Task) => {
  //               if (t.id === `task-${selectedItemId}`) {
  //                 return { ...t, assignees: updatedAssignees };
  //               }
  //               return t;
  //             }),
  //           };
  //         }
  //         return ph;
  //       })
  //     );

  //     setShowAssignPopup(false);
  //     // setErrorMessage('');  // Clear on success
  //     showSuccess('Users assigned successfully!');
  //   } catch (err: any) {
  //     console.error('Error assigning users:', err);
  //     showError(`Failed to assign users, please try again`);
  //     // setErrorMessage(err.message);  // Show detailed error
  //   } finally {
  //     setAssignLoading(false);
  //   }
  // };
  const handleAssignUsers = async () => {
  if (!selectedOptions.length || !assignType || !selectedItemId) {
    showWarn('Please select at least one user.');
    // setErrorMessage('No users selected.');
    return;
  }
  setAssignLoading(true);
  try {
    const userIds = selectedOptions.map((opt: any) => opt.value);

    // Emulate reference: Include ID in payload (project_phase_id or project_task_id)
    const payload = assignType === 'phase' 
      ? { user_ids: userIds, project_phase_id: selectedItemId } 
      : { user_ids: userIds, project_task_id: selectedItemId };

    // Use specified map APIs
    let url;
    if (assignType === 'phase') {
      url = Api_url.mapUsersToPhase(selectedItemId);
    } else {
      url = Api_url.mapUsersToTask(selectedItemId);
    }
    const res = await postRequestStatus<any>(url, payload);

    if (res.status === 200 || res.status ===201) {
      // Fetch updated users after successful mapping
      let updatedUsers: any[] = [];
      if (assignType === 'phase') {
        const getRes = await getRequestStatus<any>(Api_url.getUsersByProjectPhaseId(selectedItemId));
        if (getRes.status === 200) {
          updatedUsers = getRes.data?.data || [];
        }
      } else {
        const getRes = await getRequestStatus<any>(Api_url.getUsersByProjectTaskId(selectedItemId));
        if (getRes.status === 200) {
          updatedUsers = getRes.data?.data || [];
        }
      }

      // Map to assignees with full Member structure (including avatars for images/initials)
      const updatedAssignees: Member[] = updatedUsers.map((u: any) => ({
        id: u.user_id.toString(),
        name: u.user_name,
        avatarUrl: u.image_url ? `${BASE}users_profile/${u.image_url}` : undefined,
      }));

      // Update local state with fetched updated assignees (ensures images/initials display correctly)
      setPhases((prev) =>
        prev.map((ph) => {
          if (assignType === 'phase' && ph.id === `phase-${selectedItemId}`) {
            return { ...ph, assignees: updatedAssignees };
          } else if (assignType === 'task') {
            return {
              ...ph,
              tasks: ph.tasks.map((t: Task) => {
                if (t.id === `task-${selectedItemId}`) {
                  return { ...t, assignees: updatedAssignees };
                }
                return t;
              }),
            };
          }
          return ph;
        })
      );

      setShowAssignPopup(false);
      // setErrorMessage('');  // Clear on success
      showSuccess('Users assigned successfully!');
    } else {
      let errorMsg = `Failed to assign users: ${res.status}`;
      if (res.status === 422) {
        // Enhanced: Try to parse 422 details (common for validation errors)
        try {
          errorMsg += ` - ${res.data?.message || 'Validation error (e.g., missing ID or invalid users)'}`;
        } catch {
          errorMsg += ' - Unprocessable entity (check payload)';
        }
      }
      throw new Error(errorMsg);
    }
  } catch (err: any) {
    console.error('Error assigning users:', err);
    showError(`Failed to assign users, please try again`);
    // setErrorMessage(err.message);  // Show detailed error
  } finally {
    setAssignLoading(false);
  }
};

// New: Handle open transfer popup
  const handleOpenTransfer = useCallback((type: 'phase' | 'task', actualId: string, name: string, currentAssignees: Member[]) => {
    setOpeningTransfer(true);
    setSelectedItem({ id: actualId, name });
    setTransferType(type);
    // Unassigned users (exclude current assignees)
    const unassigned = options.filter(opt => !currentAssignees.some(a => a.id === opt.value));
    setUnassignedForTransfer(unassigned);
    setSelectedToUser(null);
    setTransferComment('');
    setOpeningTransfer(false);
    setShowTransferPopup(true);
  }, [options]);
  // New: Handle transfer ownership
  // const handleTransfer = useCallback(async () => {
  //   const commentTrimmed = transferComment.trim();
  //   if (!selectedToUser) {
  //     showWarn("Please select a user to transfer to.");
  //     // setErrorMessage("Please select a user.");
  //     return;
  //   }
  //   if (!commentTrimmed) {
  //     showWarn("Please enter a comment. It is a mandatory field.");
  //     // setErrorMessage("Please enter a comment.");
  //     return;
  //   }
  //   if (!selectedItem || !crntUser) {
  //     showWarn("Invalid transfer details.");
  //     // setErrorMessage("Invalid transfer details.");
  //     return;
  //   }
  //   setTransferLoading(true);
  //   try {
  //     const headersMod = await import('../../networkCalls/NetworkCalls').then(m => m.getApiHeaders());
  //     const headers = { ...headersMod, 'Content-Type': 'application/json' };
  //     const isPhase = transferType === 'phase';
  //     const endpoint = isPhase
  //       ? Api_url.transferProjectPhaseOwnership()
  //       : Api_url.transferProjectTaskOwnership();
  //     const payload = isPhase
  //       ? {
  //           project_phase_id: selectedItem.id,
  //           from_user_id: crntUser.id,
  //           to_user_id: selectedToUser.value,
  //           phase_transfer_reason: commentTrimmed
  //         }
  //       : {
  //           project_task_id: selectedItem.id,
  //           from_user_id: crntUser.id,
  //           to_user_id: selectedToUser.value,
  //           task_transfer_reason: commentTrimmed
  //         };
  //     const res = await fetch(endpoint, {
  //       method: 'POST',
  //       headers,
  //       body: JSON.stringify(payload)
  //     });
  //     if (!res.ok) {
  //       // throw new Error(`Failed to transfer ${isPhase ? 'phase' : 'task'} ownership: ${res.status}`);
  //     }
  //     // Fetch updated assignees
  //     const userEndpoint = isPhase
  //       ? Api_url.getUsersByProjectPhaseId(selectedItem.id)
  //       : Api_url.getUsersByProjectTaskId(selectedItem.id);
  //     const userRes = await fetch(userEndpoint, { headers });
  //     let updatedAssignees: Member[] = [];
  //     if (userRes.ok) {
  //       const { data } = await userRes.json();
  //       updatedAssignees = data.map((u: any) => ({
  //         id: u.user_id.toString(),
  //         name: u.user_name,
  //         avatarUrl: u.image_url ? `${BASE}users_profile/${u.image_url}` : undefined,
  //       }));
  //     }
  //     // Update local state
  //     setPhases((prev) =>
  //       prev.map((ph) => {
  //         if (isPhase && ph.id === `phase-${selectedItem.id}`) {
  //           return { ...ph, assignees: updatedAssignees };
  //         } else if (!isPhase) {
  //           return {
  //             ...ph,
  //             tasks: ph.tasks.map((t: Task) => {
  //               if (t.id === `task-${selectedItem.id}`) {
  //                 return { ...t, assignees: updatedAssignees };
  //               }
  //               return t;
  //             }),
  //           };
  //         }
  //         return ph;
  //       })
  //     );
  //     setShowTransferPopup(false);
  //     setSelectedToUser(null);
  //     setTransferComment('');
  //     // setErrorMessage('');
  //     showSuccess('Ownership transferred successfully!');
  //   } catch (err: any) {
  //     console.error('Error transferring ownership:', err.message);
  //     showError(`Failed to transfer ownership, please try again`);
  //     // setErrorMessage(`Failed to transfer ownership: ${err.message}`);
  //   } finally {
  //     setTransferLoading(false);
  //   }
  // }, [transferType, selectedItem, crntUser, transferComment, selectedToUser, BASE]);
  const handleTransfer = useCallback(async () => {
  const commentTrimmed = transferComment.trim();
  if (!selectedToUser) {
    showWarn("Please select a user to transfer to.");
    // setErrorMessage("Please select a user.");
    return;
  }
  if (!commentTrimmed) {
    showWarn("Please enter a comment. It is a mandatory field.");
    // setErrorMessage("Please enter a comment.");
    return;
  }
  if (!selectedItem || !crntUser) {
    showWarn("Invalid transfer details.");
    // setErrorMessage("Invalid transfer details.");
    return;
  }
  setTransferLoading(true);
  try {
    const isPhase = transferType === 'phase';
    const endpoint = isPhase
      ? Api_url.transferProjectPhaseOwnership()
      : Api_url.transferProjectTaskOwnership();
    const payload = isPhase
      ? {
          project_phase_id: selectedItem.id,
          from_user_id: crntUser.id,
          to_user_id: selectedToUser.value,
          phase_transfer_reason: commentTrimmed
        }
      : {
          project_task_id: selectedItem.id,
          from_user_id: crntUser.id,
          to_user_id: selectedToUser.value,
          task_transfer_reason: commentTrimmed
        };
    const res = await postRequestStatus<any>(endpoint, payload);
    if (res.status === 200 || res.status === 201) {
      // Fetch updated assignees
      const userEndpoint = isPhase
        ? Api_url.getUsersByProjectPhaseId(selectedItem.id)
        : Api_url.getUsersByProjectTaskId(selectedItem.id);
      const userRes = await getRequestStatus<any>(userEndpoint);
      let updatedAssignees: Member[] = [];
      if (userRes.status === 200) {
        const data = userRes.data;
        updatedAssignees = data?.data?.map((u: any) => ({
          id: u.user_id.toString(),
          name: u.user_name,
          avatarUrl: u.image_url ? `${BASE}users_profile/${u.image_url}` : undefined,
        })) || [];
      }
      // Update local state
      setPhases((prev) =>
        prev.map((ph) => {
          if (isPhase && ph.id === `phase-${selectedItem.id}`) {
            return { ...ph, assignees: updatedAssignees };
          } else if (!isPhase) {
            return {
              ...ph,
              tasks: ph.tasks.map((t: Task) => {
                if (t.id === `task-${selectedItem.id}`) {
                  return { ...t, assignees: updatedAssignees };
                }
                return t;
              }),
            };
          }
          return ph;
        })
      );
      setShowTransferPopup(false);
      setSelectedToUser(null);
      setTransferComment('');
      // setErrorMessage('');
      showSuccess('Ownership transferred successfully!');
    } else {
      throw new Error(`Failed to transfer ${isPhase ? 'phase' : 'task'} ownership: ${res.status}`);
    }
  } catch (err: any) {
    console.error('Error transferring ownership:', err.message);
    showError(`Failed to transfer ownership, please try again`);
    // setErrorMessage(`Failed to transfer ownership: ${err.message}`);
  } finally {
    setTransferLoading(false);
  }
}, [transferType, selectedItem, crntUser, transferComment, selectedToUser, BASE]);

// New: Handler for viewing task documents
  const onViewTaskDocuments = useCallback((taskId: string) => {
    const actualId = taskId.replace(/^task-/, '');
    const task = phases.flatMap(ph => ph.tasks).find(t => t.id === taskId);
    if (task) {
      navigate(`/task-documents/${actualId}`, {
        state: {
          projectName: task.title.split(':')[0].trim(),
          phaseName: task.stage,
          taskName: task.label,
          dueDate: task.dueDate,
          editdocument: false,
          task_order_id: task.task_order_id
        },
      });
    }
  }, [phases, navigate]);
  
  // useEffect(() => {
  //   fetch(`${Api_url.new_getProjectDetails}/${id}`)
  //     .then((res) => res.json())
  //     .then((data) => {
  //       if (data.status_code === 200) {
  //         // showSuccess("Project Details Fetched Successfully!");
  //         const apiData = data.data;
  //         setLoading(false);
  //         // Map members
  //         const members: Member[] = apiData.users.map((u: any) => ({
  //           id: u.user_id.toString(),
  //           name: u.user_name,
  //           avatarUrl: u.image_url ? `${BASE}users_profile/${u.image_url}` : undefined,
  //         }));

  //         // Map project
  //         const proj: Project = {
  //           id: apiData.project_id.toString(),
  //           title: apiData.project_name,
  //           description: apiData.project_description || 'N/A',
  //           riskAssessment: apiData.risk_assessment_name,
  //           startDate: new Date(apiData.start_date).toLocaleDateString('en-GB', {
  //             day: 'numeric',
  //             month: 'short',
  //             year: 'numeric',
  //           }),
  //           // endDate: new Date(apiData.end_date).toLocaleDateString('en-GB', {
  //           //   day: 'numeric',
  //           //   month: 'short',
  //           //   year: 'numeric',
  //           // }),
  //           endDate: apiData.end_date
  //           ? new Date(apiData.end_date).toLocaleDateString('en-GB', {
  //               day: 'numeric',
  //               month: 'short',
  //               year: 'numeric',
  //             })
  //           : 'N/A',
  //           // dueDate: new Date(apiData.end_date).toLocaleDateString('en-GB', {
  //           //   day: 'numeric',
  //           //   month: 'short',
  //           //   year: 'numeric',
  //           // }),
  //           dueDate: apiData.end_date
  //           ? new Date(apiData.end_date).toLocaleDateString('en-GB', {
  //               day: 'numeric',
  //               month: 'short',
  //               year: 'numeric',
  //             })
  //           : 'N/A',
  //           status: apiData.project_status_name,
  //           progressPct: apiData.completed_percentage,
  //           members,
  //           daysLeft: apiData.left_days,
  //           equipment_name: apiData.equipment_name,
  //         };
  //         setProject(proj);

  //         // Set project files
  //         const projectFilesList = apiData.project_files || [];
  //         setProjectFiles(projectFilesList);

  //         // Collect all task docs
  //         const taskDocsList = apiData.phases.flatMap((p: any) => 
  //           p.task_docs.map((doc: any) => ({
  //             ...doc,
  //             phaseName: p.phase_name
  //           }))
  //         );
  //         setAllTaskDocs(taskDocsList);

  //         // Map phases
  //         const phaseList: Phase[] = apiData.phases.map((p: any, idx: number) => ({
  //           id: `phase-${p.project_phase_id}`,
  //           name: p.phase_name,
  //           status: p.phase_status_name,
  //           updatedAt: new Date(),
  //           assignees: p.phase_users.map((pu: any) => ({
  //             id: pu.user_id.toString(),
  //             name: pu.user_name,
  //             avatarUrl: pu.image_url ? `${BASE}users_profile/${pu.image_url}` : undefined,
  //           })),
  //           lead: members[0] || undefined,
  //           dueDate: new Date(apiData.end_date).toLocaleDateString('en-GB', {
  //             day: 'numeric',
  //             month: 'short',
  //             year: 'numeric',
  //           }),
  //           tasks: p.tasks.map((t: any, tidx: number) => ({
  //             id: `task-${t.project_task_id}`,
  //             stage: p.phase_name,
  //             title: t.task_name,
  //             body: '', // No body in API response
  //             dueDate: '', // No dueDate per task in API
  //             warnings: Math.random() > 0.7 ? 1 : 0,
  //             comments: Math.floor(Math.random() * 5),
  //             attachments: Math.floor(Math.random() * 3),
  //             assignees: t.task_users.map((tu: any) => ({
  //               id: tu.user_id.toString(),
  //               name: tu.user_name,
  //               avatarUrl: tu.image_url ? `${BASE}users_profile/${tu.image_url}` : undefined,
  //             })),
  //             label: t.task_status_name,
  //             labelDaysLeft: 0,
  //             task_status_name: t.task_status_name,
  //           })),
  //         }));

  //         setPhases(phaseList);
  //       }
  //     })
  //     .catch((err) => {
  //       console.error('Error fetching project details:', err);
  //       setLoading(false);
  //       showError('Failed to load project details. Please try again.');
  //     });
  // }, [id, BASE]);

  // Convert phase names from URL to IDs
  useEffect(() => {
  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const result = await getRequestStatus<any>(`${Api_url.new_getProjectDetails}/${id}`);
      if (result.status === 200) {
        const data = result.data;
        if (data.status_code === 200) {
          // showSuccess("Project Details Fetched Successfully!");
          const apiData = data.data;
          // Map members
          const members: Member[] = apiData.users.map((u: any) => ({
            id: u.user_id.toString(),
            name: u.user_name,
            avatarUrl: u.image_url ? `${BASE}users_profile/${u.image_url}` : undefined,
          }));

          // Map project
          const proj: Project = {
            id: apiData.project_id.toString(),
            title: apiData.project_name,
            description: apiData.project_description || 'N/A',
            riskAssessment: apiData.risk_assessment_name,
            startDate: new Date(apiData.start_date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            // endDate: new Date(apiData.end_date).toLocaleDateString('en-GB', {
            //   day: 'numeric',
            //   month: 'short',
            //   year: 'numeric',
            // }),
            endDate: apiData.end_date
            ? new Date(apiData.end_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'N/A',
            // dueDate: new Date(apiData.end_date).toLocaleDateString('en-GB', {
            //   day: 'numeric',
            //   month: 'short',
            //   year: 'numeric',
            // }),
            dueDate: apiData.end_date
            ? new Date(apiData.end_date).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : 'N/A',
            status: apiData.project_status_name,
            progressPct: apiData.completed_percentage,
            members,
            daysLeft: apiData.left_days,
            equipment_name: apiData.equipment_name,
          };
          setProject(proj);

          // Set project files
          const projectFilesList = apiData.project_files || [];
          setProjectFiles(projectFilesList);

          // Collect all task docs
          const taskDocsList = apiData.phases.flatMap((p: any) => 
            p.task_docs.map((doc: any) => ({
              ...doc,
              phaseName: p.phase_name
            }))
          );
          setAllTaskDocs(taskDocsList);

          // Map phases
          const phaseList: Phase[] = apiData.phases.map((p: any, idx: number) => ({
            id: `phase-${p.project_phase_id}`,
            name: p.phase_name,
            status: p.phase_status_name,
            updatedAt: new Date(),
            assignees: p.phase_users.map((pu: any) => ({
              id: pu.user_id.toString(),
              name: pu.user_name,
              avatarUrl: pu.image_url ? `${BASE}users_profile/${pu.image_url}` : undefined,
            })),
            lead: members[0] || undefined,
            dueDate: new Date(apiData.end_date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            tasks: p.tasks.map((t: any, tidx: number) => ({
              id: `task-${t.project_task_id}`,
              stage: p.phase_name,
              title: t.task_name,
              body: '', // No body in API response
              dueDate: '', // No dueDate per task in API
              warnings: Math.random() > 0.7 ? 1 : 0,
              comments: Math.floor(Math.random() * 5),
              attachments: Math.floor(Math.random() * 3),
              assignees: t.task_users.map((tu: any) => ({
                id: tu.user_id.toString(),
                name: tu.user_name,
                avatarUrl: tu.image_url ? `${BASE}users_profile/${tu.image_url}` : undefined,
              })),
              label: t.task_status_name,
              labelDaysLeft: 0,
              task_status_name: t.task_status_name,
              task_order_id: t.task_order_id,
              task_status_id: t.task_status_id,
            })),
          }));

          setPhases(phaseList);
        }
      }
    } catch (err) {
      console.error('Error fetching project details:', err);
      showError('Failed to load project details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  fetchProjectDetails();
}, [id, BASE]);

  const expandedIds = useMemo(() => {
    if (!expandedParam) return [];
    const names = expandedParam.split(',');
    return phases.filter((p) => names.includes(p.name)).map((p) => p.id);
  }, [expandedParam, phases]);

  // --- HTML preprocessing for PDF ---
  const preprocessHTML = (rawHtml: string): string => {
    const container = document.createElement("div");
    container.innerHTML = rawHtml;

    // Replace <select> with selected text
    container.querySelectorAll("select").forEach((sel) => {
      const selectedText = (sel as HTMLSelectElement).selectedOptions[0]?.text || "";
      const span = document.createElement("span");
      span.textContent = selectedText;
      sel.replaceWith(span);
    });

    // Replace inputs and textareas with their value
    container
      .querySelectorAll("input[type=text], input[type=email], input[type=password], input[type=number], textarea")
      .forEach((input) => {
        const inp = input as HTMLInputElement;
        const span = document.createElement("span");
        span.style.display = "inline-block";
        span.style.border = "1px solid #ccc";
        span.style.padding = "2px 4px";
        span.style.backgroundColor = "#f9f9f9";
        span.textContent = inp.value || "[empty]";
        inp.replaceWith(span);
      });

    // Replace radio buttons with only selected ones
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
      if (radioGroups.get(rad.name) === rad) {
        const span = document.createElement("span");
        span.textContent = rad.value;
        span.style.display = "inline-block";
        span.style.padding = "2px 4px";
        rad.replaceWith(span);
      } else {
        rad.remove();
      }
    });

    // Replace checked checkboxes
    container.querySelectorAll("input[type=checkbox]").forEach((chk) => {
      const cb = chk as HTMLInputElement;
      if (cb.checked) {
        const span = document.createElement("span");
        span.textContent = cb.value || "✔";
        span.style.display = "inline-block";
        span.style.padding = "2px 4px";
        cb.replaceWith(span);
      } else {
        cb.remove();
      }
    });

    // Remove all buttons
    container.querySelectorAll("button, input[type=button]").forEach((btn) => btn.remove());

    return container.innerHTML;
  };

  // --- Generate PDF ---
  const generatePDF = (data: { task_doc_id: number; document_json: string }) => {
    if (!data || !data.document_json) {
      console.error("No document data to generate PDF");
      return;
    }

    const margin = 25;
    const cleanHtml = preprocessHTML(data.document_json);
    const pdfContent = htmlToPdfmake(cleanHtml);

    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [margin, margin + 40, margin, margin + 40],
      header: (currentPage: number, pageCount: number) => ({
        text: "AIVerify - United Consulting Hub",
        alignment: "center",
        fontSize: 18,
        margin: [0, 15, 0, 0],
      }),
      footer: (currentPage: number, pageCount: number) => ({
        text: `Page ${currentPage} of ${pageCount}`,
        alignment: "center",
        fontSize: 10,
        margin: [0, 0, 0, 15],
      }),
      content: pdfContent,
      defaultStyle: { fontSize: 11 },
    };

    pdfMake.createPdf(docDefinition).download(`document_${data.task_doc_id}.pdf`);
  };

 

  // --- Fetch and generate PDF from API ---
  // const handleGeneratePDF = async (docId: number) => {
  //   setPdfLoading(prev => ({ ...prev, [docId]: true }));
  //   try {
  //     const url = Api_url.getTaskDoc(docId);
  //     const headers = await import('../../networkCalls/NetworkCalls').then(m => m.getApiHeaders());
  //     const response = await fetch(url, { headers });
  //     const result = await response.json();
  //     if (result.status_code === 200 && result.data) {
  //       generatePDF(result.data);
  //       showSuccess('PDF generated and downloaded successfully!');
  //     } else {
  //       showError("Failed to fetch document, please try again.");
  //       // setErrorMessage(result.message || "Failed to fetch document data.");
  //     }
  //   } catch (err: any) {
  //     console.error("Error fetching document:", err.message);
  //     showError('Failed to generate PDF. Please try again.');
  //     // setErrorMessage("Failed to fetch document data.");
  //   } finally {
  //     setPdfLoading(prev => ({ ...prev, [docId]: false }));
  //   }
  // }
  const handleGeneratePDF = async (docId: number) => {
  setPdfLoading(prev => ({ ...prev, [docId]: true }));
  try {
    const url = Api_url.getTaskDoc(docId);
    const result = await getRequestStatus<any>(url);
    if (result.status === 200) {
      const data = result.data;
      if (data.status_code === 200 && data.data) {
        generatePDF(data.data);
        showSuccess('PDF generated and downloaded successfully!');
      } else {
        showError("Failed to fetch document, please try again.");
        // setErrorMessage(data.message || "Failed to fetch document data.");
      }
    } else {
      showError("Failed to fetch document, please try again.");
      // setErrorMessage(result.data?.message || "Failed to fetch document data.");
    }
  } catch (err: any) {
    console.error("Error fetching document:", err.message);
    showError('Failed to generate PDF. Please try again.');
    // setErrorMessage("Failed to fetch document data.");
  } finally {
    setPdfLoading(prev => ({ ...prev, [docId]: false }));
  }
}

  if (loading) {
    return (
      <div className="grid place-items-center h-screen">
        <RingGradientLoader />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="grid place-items-center h-screen">
        <div>No project found.</div>
      </div>
    );
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleExpandedChange = (expanded: string[]) => {
    const params = new URLSearchParams(searchParams);
    if (expanded.length > 0) {
      const names = expanded
        .map((id) => phases.find((p) => p.id === id)?.name)
        .filter(Boolean)
        .join(',');
      params.set('expanded', names);
    } else {
      params.delete('expanded');
    }
    setSearchParams(params, { replace: true });
  };

  const handleOpenTask = (taskId: string) => {
    console.log('Open task:', taskId);
  };

  const handleEditTask = (taskId: string) => {
    console.log('Edit task:', taskId);
  };

  const handleEditPhase = (phaseId: string) => {
    console.log('Edit phase:', phaseId);
  };

  const handleViewPhase = (phaseId: string) => {
    console.log('View phase:', phaseId);
  };

  const handleAddTask = (phaseId: string) => {
    console.log('Add task to phase:', phaseId);
  };

  const handleProjectFilesToggle = () => {
    setProjectFilesExpanded(!projectFilesExpanded);
  };

  const handlePhaseDocsToggle = () => {
    setPhaseDocsExpanded(!phaseDocsExpanded);
  };

  const handleDownloadFile = async (filename: string, downloadName: string) => {
    setDownloadLoading(prev => ({ ...prev, [filename]: true }));
    try {
      const downloadUrl = Api_url.getProjectFile(filename);
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        // throw new Error(`Failed to download file: ${res.status}`);
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
      showSuccess('File downloaded successfully!');
    } catch (err: any) {
      console.error('Error downloading file:', err.message);
      showError(`Failed to download file, please try again.`);
      // setErrorMessage(`Failed to download file: ${err.message}`);
    } finally {
      setDownloadLoading(prev => ({ ...prev, [filename]: false }));
    }
  };

  const handleDownloadDoc = (docVersion: string, docId: number, phaseName: string) => {
    const downloadUrl = `${BASE}download/task-doc/${docId}/${encodeURIComponent(docVersion)}?phase=${encodeURIComponent(phaseName)}`;
    window.open(downloadUrl, '_blank');
  };

  return (
    <div className="grid gap-4">
      {/* Single Project Details Card */}
      <motion.section
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="sticky top-0 z-10 rounded-2xl bg-white p-6 shadow-sm border border-gray-200"
        aria-labelledby="project-details-header-title"
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={handleBack}
              aria-label="Go back"
              className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              🔧
            </div>
            <div className="flex-1">
              {/* <h1 id="project-details-header-title" className="text-xl font-semibold text-gray-900">
                {project.title} ({project.daysLeft} Days left)
              </h1> */}
              <h1 id="project-details-header-title" className="text-xl font-semibold text-gray-900">
              {project.title} 
              {project.daysLeft > 0 ? `(${project.daysLeft} Days left)` : ''}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                <span className="font-medium text-blue-600">Due date:</span> {project.dueDate ? project.dueDate : 'N/A'}
              </p>
              {/* Progress Bar */}
              <div className="mt-4 w-full">
                <div className="relative">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200" aria-hidden="true" />
                  <motion.div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={project.progressPct}
                    aria-label={`Project progress: ${project.progressPct}%`}
                    className="absolute left-0 top-0 h-2 rounded-full bg-blue-600"
                    style={{ width: `${project.progressPct}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progressPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                  {/* Knob */}
                  <motion.div
                    aria-hidden
                    className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 shadow-sm"
                    style={{ left: `calc(${project.progressPct}% - 6px)` }}
                    initial={{ left: '-6px' }}
                    animate={{ left: `calc(${project.progressPct}% - 6px)` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
                <div className="mt-1 text-right text-sm font-medium text-blue-600">{project.progressPct}%</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AvatarGroup members={project.members.slice(0, 10)} maxVisible={10} size="md" />
            {project.members.length > 10 && (
              <div
                className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600"
                aria-label={`+${project.members.length - 10} more members`}
                title={project.members.slice(10).map(m => m.name).join(', ')}
              >
                +{project.members.length - 10}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
          <p className="text-gray-900 leading-relaxed">{project.description}</p>
        </div>

        {/* Overview Grid */}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              {project.status}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Risk Assessment</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              {project.riskAssessment}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Equipment</p>
            <p className="text-gray-900 text-sm">{project.equipment_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Start Date</p>
            <p className="text-gray-900 text-sm">{project.startDate}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">End Date</p>
            <p className="text-gray-900 text-sm">{project.endDate}</p>
          </div>          
        </div>

        {/* Project Files Section */}
        {projectFiles.length > 0 && (
          <div className="mt-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={handleProjectFilesToggle}
            >
              <h3 className="text-lg font-semibold text-gray-900">Project Files</h3>
              <motion.div
                animate={{ rotate: projectFilesExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </motion.div>
            </div>
            <AnimatePresence>
              {projectFilesExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2"
                >
                  {projectFiles.map((file: any) => (
                    <div key={file.project_file_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{file.file_name}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDownloadFile(file.file_name, file.file_name); }}
                        disabled={!!downloadLoading[file.file_name]}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed justify-end"
                      >
                        {downloadLoading[file.file_name] ? (
                          <RingGradientLoader size="small" />
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Download
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Phase Document Versions Section */}
        {allTaskDocs.length > 0 && (
          <div className="mt-6">
            <div 
              className="flex items-center justify-between cursor-pointer" 
              onClick={handlePhaseDocsToggle}
            >
              <h3 className="text-lg font-semibold text-gray-900">Phase Document Versions</h3>
              <motion.div
                animate={{ rotate: phaseDocsExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-5 w-5 text-gray-500" />
              </motion.div>
            </div>
            <AnimatePresence>
              {phaseDocsExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-3 space-y-2"
                >
                  {allTaskDocs.map((doc: any) => (
                    <div key={doc.task_doc_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">
                        {doc.doc_version}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleGeneratePDF(doc.task_doc_id); }}
                        disabled={!!pdfLoading[doc.task_doc_id]}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed justify-end"
                      >
                        {pdfLoading[doc.task_doc_id] ? (
                          <RingGradientLoader size="small" />
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Generate PDF
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{errorMessage}</div>
        )}
      </motion.section>

      <PhasesTable
        phases={phases}
        initialExpanded={expandedIds}
        onOpenTask={handleOpenTask}
        onEditTask={handleEditTask}
        onEditPhase={handleEditPhase}
        onViewPhase={handleViewPhase}
        onAddTask={handleAddTask}
        onExpandedChange={handleExpandedChange}
        isAdmin={isAdmin}
        onOpenAssign={handleOpenAssign}
        onViewDocuments={onViewTaskDocuments}
        crntUserId={crntUser?.id}  // New
        onOpenTransfer={handleOpenTransfer}
      />

      {/* Loader for opening popups */}
      {(openingAssign || openingTransfer) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <RingGradientLoader />
        </div>
      )}

      {/* Assign Users Popup (Fixed: Wrap siblings in fragment <>) */}
      {showAssignPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-6 md:p-8 relative">
            <button
              onClick={() => setShowAssignPopup(false)}
              className="absolute top-2 right-2 w-6 h-6 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center hover:bg-gray-100 hover:text-red-600 transition"
              aria-label="Close"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Assign Users to {assignType === 'phase' ? 'Phase' : 'Task'}: {selectedItemName}
            </h2>
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                {errorMessage}
              </div>
            )}
            <div className="space-y-6">
              {/* Fixed: Wrap the two <div> siblings in a React Fragment <> </> */}
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Currently Assigned</label>
                  <div className="bg-gray-100 p-3 rounded-md min-h-[52px] text-sm text-gray-700 border border-gray-200">
                    {currentAssignedUsers.length > 0
                      ? currentAssignedUsers.map((u: any) => u.user_name).join(', ')
                      : 'No users assigned yet.'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Select Users (Add/Remove)</label>
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
                    isDisabled={assignLoading}
                  />
                </div>
              </>
            </div>
            <div className="mt-8 flex justify-end space-x-2">
              <button
                onClick={() => setShowAssignPopup(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-700"
                disabled={assignLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignUsers}
                disabled={assignLoading}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"

              >

                {assignLoading ? <RingGradientLoader size="small" /> : null}

                {assignLoading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

{/* New: Transfer Popup JSX */}
      {showTransferPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Transfer {transferType === 'phase' ? 'Phase' : 'Task'} Ownership to{' '}
              {selectedItem?.name}
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
                value={crntUser?.name || ''}
                disabled
                className="w-full border rounded px-3 py-2 bg-gray-100"
              />
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
              <Select
                options={unassignedForTransfer}
                onChange={setSelectedToUser}
                value={selectedToUser}
                placeholder="Search and select user..."
                className="text-sm"
                isDisabled={transferLoading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Comments <span className="text-red-500">*</span></label>
              <textarea
                value={transferComment}
                onChange={(e) => setTransferComment(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={3}
                placeholder="Enter reason for transfer..."
                disabled={transferLoading}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowTransferPopup(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                disabled={transferLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"

                disabled={!selectedToUser || !transferComment.trim() || transferLoading}

              >

                {transferLoading ? <RingGradientLoader size="small" /> : null}

                {transferLoading ? 'Transferring...' : 'Transfer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}