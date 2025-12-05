// import React from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import { ArrowLeft } from 'lucide-react';

// const ProjectTaskEditor: React.FC = () => {
//   const location = useLocation();
//   const navigate = useNavigate(); // Hook for navigation
//   const { taskName, taskId, equipmentId, statusId } = location.state || {};

//   // Function to handle back navigation
//   const handleBack = () => {
//     navigate(-1); // Navigate back to the previous page
//   };

//   if (!taskName || !taskId) {
//     return <div className="p-6">Task details not found</div>;
//   }

//   return (
//     <div className="p-6">
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">Task Editor</h1>
//         <button
//           onClick={handleBack}
//           className="text-gray-600 hover:text-blue-600 focus:outline-none"
//           title="Back to Tasks"
//         >
//           <ArrowLeft className="h-6 w-6" />
//         </button>
//       </div>
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
//         <p><strong>Task Name:</strong> {taskName}</p>
//         <p><strong>Task ID:</strong> {taskId}</p>
//         <p><strong>Equipment ID:</strong> {equipmentId}</p>
//         <p><strong>Status ID:</strong> {statusId}</p>
//       </div>
//       <h1 className="text-2xl font-bold">Editor setup coming soon...!</h1>
//     </div>
//   );
// };
// export default ProjectTaskEditor;

// import React, { useEffect, useRef, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft } from 'lucide-react';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// // Placeholder content for the editor
// const placeholderContent = '<p>Start editing here...</p>';

// const ProjectTaskEditor: React.FC = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [content, setContent] = useState<string>(placeholderContent);
//   const editorRef = useRef<any>(null);
//   const editorId = 'tiny-editor';

//   // Editor setup with debugging
//   useEffect(() => {
//     const loadTinyMCEScript = () => {
//       return new Promise((resolve, reject) => {
//         if (window.tinymce) {
//           console.log('TinyMCE already loaded');
//           resolve();
//           return;
//         }
//         console.log('Loading TinyMCE script...');
//         const script = document.createElement('script');
//         script.src = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.4/tinymce.min.js';
//         script.crossOrigin = 'anonymous';
//         script.onload = () => {
//           console.log('TinyMCE script loaded successfully');
//           resolve();
//         };
//         script.onerror = (error) => {
//           console.error('Failed to load TinyMCE script:', error);
//           setError('Failed to load TinyMCE script');
//           reject(new Error('TinyMCE script failed to load'));
//         };
//         document.body.appendChild(script);
//       });
//     };

//     const initEditor = () => {
//       if (!window.tinymce) {
//         console.error('TinyMCE not available');
//         setError('TinyMCE not available');
//         setLoading(false);
//         return;
//       }
//       console.log('Initializing TinyMCE editor...');
//       const textarea = document.getElementById(editorId);
//       if (!textarea) {
//         console.error('Textarea with id "tiny-editor" not found in DOM');
//         setError('Editor container not found');
//         setLoading(false);
//         return;
//       }
//       window.tinymce.init({
//         selector: `#${editorId}`,
//         height: 600,
//         plugins: 'table lists code',
//         toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | bullist numlist | table',
//         menubar: false,
//         setup: (editor) => {
//           editorRef.current = editor;
//           editor.on('init', () => {
//             console.log('TinyMCE editor initialized');
//             editor.setContent(placeholderContent);
//             setContent(placeholderContent);
//             setLoading(false);
//           });
//           editor.on('error', (err) => {
//             console.error('TinyMCE initialization error:', err);
//             setError('Editor initialization failed');
//             setLoading(false);
//           });
//         },
//       });
//     };

//     const initialize = async () => {
//       try {
//         console.log('Starting editor initialization...');
//         await loadTinyMCEScript();
//         // Delay initialization to ensure DOM is ready
//         setTimeout(() => {
//           initEditor();
//         }, 100);
//       } catch (err) {
//         console.error('Editor init failed:', err);
//         setError('Editor initialization failed');
//         setLoading(false);
//       }
//     };

//     initialize();

//     return () => {
//       if (window.tinymce && editorRef.current) {
//         console.log('Cleaning up TinyMCE');
//         window.tinymce.remove(editorRef.current);
//       }
//     };
//   }, []);

//   // Handle save (logs content to console)
//   const handleSave = () => {
//     const editor = editorRef.current;
//     if (editor) {
//       const updatedContent = editor.getContent({ format: 'raw' });
//       setContent(updatedContent);
//       console.log('Saved content:', updatedContent);
//       navigate(-1);
//     } else {
//       console.error('Editor not initialized for save');
//     }
//   };

 

//   if (error) {
//     return (
//       <div className="p-6">
//         <h1 className="text-2xl font-bold mb-4">Task Editor</h1>
//         <p className="text-red-600">{error}</p>
//         <button
//           onClick={() => navigate(-1)}
//           className="text-gray-600 hover:text-blue-600 focus:outline-none"
//           title="Back"
//         >
//           <ArrowLeft className="h-6 w-6" />
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
//       <div className="flex justify-between items-center mb-4">
//         <h1 className="text-2xl font-bold">Task Editor</h1>
//         <button
//           onClick={() => navigate(-1)}
//           className="text-gray-600 hover:text-blue-600 focus:outline-none"
//           title="Back"
//         >
//           <ArrowLeft className="h-6 w-6" />
//         </button>
//       </div>
//       <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
//         <button
//           onClick={handleSave}
//           style={{
//             padding: '0.5rem 1rem',
//             backgroundColor: '#2563eb',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//           }}
//         >
//           Save
//         </button>
//         <button
//           onClick={() => navigate(-1)}
//           style={{
//             padding: '0.5rem 1rem',
//             backgroundColor: '#f0f0f0',
//             border: '1px solid #ccc',
//             borderRadius: '4px',
//             cursor: 'pointer',
//           }}
//         >
//           Cancel
//         </button>
//       </div>
//       <div className="text-area" style={{ minHeight: '600px', border: '1px solid #ccc' }}>
//         <textarea id={editorId} style={{ width: '100%', minHeight: '600px', visibility: 'visible' }}></textarea>
//       </div>
//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//     </div>
//   );
// };

// export default ProjectTaskEditor;


// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import Cropper from 'cropperjs';
// import { MessageSquare } from 'lucide-react';
// import { mdToHtml } from '../../../../../public/mdtohtml';
// import { htmlWithPermissions } from '../../../../../public/htmlWithPermissions';
// import { Api_url } from '../../../../networkCalls/Apiurls';
// import { showError, showSuccess } from '../../../../services/toasterService';
// import { ToastContainer } from 'react-toastify';

// interface FormElementState {
//   radio: { [key: string]: string }; // Maps radio group name to selected value
//   select: { [key: string]: string }; // Maps select element identifier to selected value
//   checkbox: Record<string, string>; // Maps checkbox name to checked state
//   reasons: Record<string, string>; // Maps reason name to text content
//   [key: string]: any; // For file inputs
//   initials?: Record<string, string>;   // <-- optional, may be empty if not captured
// }

// const ProjectTaskEditor: React.FC = () => {
//   const location = useLocation();
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const { taskName, taskId, equipmentId, statusId } = location.state || {};

//   const [currentUser, setCurrentUser] = useState<{
//     id: string;
//     name: string;
//     email: string;
//     role: string;
//     roleId: number;
//   }>({
//     id: '',
//     name: '',
//     email: '',
//     role: '',
//     roleId: 0,
//   });
//   const [loading, setLoading] = useState(true);
//   const [submitLoading, setSubmitLoading] = useState(false);
//   const [content, setContent] = useState<string>('');
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [isDocumentMode, setIsDocumentMode] = useState<boolean>(false);
//   const [isUpdate, setIsUpdate] = useState<boolean>(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
//   const [comments, setComments] = useState<
//     {
//       id: string;
//       task_id: string;
//       user: string;
//       text: string;
//       timestamp: string;
//       replies: { reply_id: string; comment: string; replied_by: string; replied_date: string }[];
//       showReplyInput: boolean;
//       replyText: string;
//       status_name: string;
//     }[]
//   >([]);
//   const [newComment, setNewComment] = useState<string>('');
//   const [currentTaskId, setCurrentTaskId] = useState<string>('');
//   const [curTask, setCurTask] = useState<string>('');
//   const [curTaskName, setCurTaskName] = useState<string>('');

//   const wsRef = useRef<WebSocket | null>(null);
//   const editorId = 'tiny-editor';
//   const [cursors, setCursors] = useState<{ [key: string]: { cursor: any; username: string } }>({});
//   const pendingMessages = useRef<any[]>([]);
//   const editorReady = useRef<boolean>(false);
//   const fileInputMapRef = useRef<Map<HTMLInputElement, string[]>>(new Map());
//   const formStateRef = useRef<FormElementState>({ radio: {}, select: {} });
//   const hasInitialized = useRef(false);
//   const [canComment, setCanComment] = useState<boolean>(false);
//   const [canReply, setCanReply] = useState<boolean>(false);
//   const editorRef = useRef<any>(null);
//   const contentRef = useRef<string>('');

//   const triggerWebSocketUpdate = useCallback((content: string, formState: FormElementState) => {
//     if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
//       console.warn('WebSocket not open, cannot send update. ReadyState:', wsRef.current?.readyState);
//       return;
//     }

//     let bookmark = null;
//     try {
//       if (editorRef.current?.selection) {
//         bookmark = editorRef.current.selection.getBookmark(2, true);
//       }
//     } catch (err) {
//       console.warn('Failed to get bookmark on change:', err);
//     }
//     const updatedContent = htmlWithPermissions(content, currentUser.id, formState);
//     const message = {
//       type: 'content_update',
//       content: updatedContent,
//       cursor: bookmark,
//       client_id: String(currentUser.id),
//       username: currentUser.name,
//       formState,
//     };

//     try {
//       wsRef.current.send(JSON.stringify(message));
//       contentRef.current = updatedContent;
//       setContent(updatedContent);
//       formStateRef.current = formState;
//     } catch (err) {
//       console.error('Failed to send WebSocket message:', err);
//     }
//   }, [wsRef, currentUser, editorRef, contentRef, setContent, formStateRef]);

//   const captureFormState = useCallback(() => {
//     const formState: FormElementState = { radio: {}, select: {}, checkbox: {}, reasons: {} };
//     const iframeDoc = editorRef.current?.iframeElement?.contentDocument;
//     if (!iframeDoc) {
//       console.warn('Iframe document not available for capturing form state');
//       return formState;
//     }

//     // --- Radios (Pass/Fail + Yes/No) captured row by row ---
//     const radiorows = iframeDoc.querySelectorAll('tbody tr');
//     radiorows.forEach((row, rowIndex) => {
//       // --- Pass/Fail radios ---
//       const passFailName = `pf-result-${rowIndex}`;
//       const passFailChecked = row.querySelector(
//         `input[type="radio"][name="${passFailName}"]:checked`
//       ) as HTMLInputElement | null;

//       if (passFailChecked) {
//         formState.radio[passFailName] = passFailChecked.value;
//       }

//       // --- Yes/No radios ---
//       const yesNoName = `ar-yesno-${rowIndex}`;
//       const yesNoChecked = row.querySelector(
//         `input[type="radio"][name="${yesNoName}"]:checked`
//       ) as HTMLInputElement | null;

//       if (yesNoChecked) {
//         formState.radio[yesNoName] = yesNoChecked.value;
//       }
//     });


//     // Selects (use their explicit name attr as key)
//     const selects = iframeDoc.querySelectorAll('select');
//     selects.forEach((select: HTMLSelectElement) => {
//       const key = select.name || select.getAttribute('data-select-key') || '';
//       if (key) {
//         formState.select[key] = select.value;
//       }
//     });



//     // Capture checkboxes with consistent names
//     const checkboxes = iframeDoc.querySelectorAll('input[type="checkbox"]');
//     checkboxes.forEach((checkbox: HTMLInputElement) => {
//       let cbName = checkbox.name;
//       const row = checkbox.closest('tr');
//       const rowIndex = row ? row.getAttribute('data-row-index') : null;

//       if (rowIndex !== null) {
//         cbName = `evidence-required-${rowIndex}`;
//         checkbox.name = cbName;
//       }
//       formState.checkbox[cbName] = checkbox.checked ? 'checked' : '';
//     });

//     // Capture Initial/Date & Evidence file inputs separately
//     const rows = iframeDoc.querySelectorAll('tbody tr');
//     rows.forEach((row, rowIndex) => {
//       const cells = row.querySelectorAll('td');
//       const table = iframeDoc.querySelector('table');
//       const headerCells = Array.from(table?.querySelectorAll('thead th') || []);

//       const evidenceIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'evidence');
//       const initialDateIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase().includes('initial/date'));

//       if (initialDateIndex !== -1) {
//         const fileInput = cells[initialDateIndex]?.querySelector('input[type="file"]') as HTMLInputElement;
//         formState[`initial-file-${rowIndex}`] = fileInput?.files?.length ? fileInput.files[0].name : '';
//       }

//       if (evidenceIndex !== -1) {
//         const fileInput = cells[evidenceIndex]?.querySelector('input[type="file"]') as HTMLInputElement;
//         formState[`evidence-${rowIndex}`] = fileInput?.files?.length ? fileInput.files[0].name : '';
//       }
//     });

//     // "If no, describe" content
//     const reasons = iframeDoc.querySelectorAll('div[data-reason-name]');
//     reasons.forEach((div: HTMLElement) => {
//       const key = div.dataset.reasonName || '';
//       if (key) formState.reasons[key] = div.textContent || '';
//     });

//     console.log('Captured form state:', formState);
//     return formState;
//   }, [editorRef]);



//   const restoreFormState = useCallback((formState: FormElementState) => {
//     const iframeDoc = editorRef.current?.iframeElement?.contentDocument;
//     if (!iframeDoc) {
//       console.warn('Iframe document not available for restoring form state');
//       return;
//     }

//     // Radios
//     Object.entries(formState.radio || {}).forEach(([name, value]) => {
//       const selected = iframeDoc.querySelector(
//         `input[type="radio"][name="${name}"][value="${value}"]`
//       ) as HTMLInputElement | null;

//       if (selected) {
//         selected.checked = true;
//         selected.setAttribute('checked', 'checked');
//       } else {
//         console.warn(`Radio not found for name=${name}, value=${value}`);
//       }

//       // Uncheck others in same group
//       iframeDoc.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((r: HTMLInputElement) => {
//         if (r.value !== value) {
//           r.checked = false;
//           r.removeAttribute('checked');
//         }
//       });
//     });

//     // Selects
//     Object.entries(formState.select || {}).forEach(([key, value]) => {
//       const select = iframeDoc.querySelector(`select[name="${key}"]`) as HTMLSelectElement | null;
//       if (select) {
//         select.value = value;
//         select.setAttribute('data-selected-user', value);

//         select.querySelectorAll('option').forEach((opt) => {
//           if (opt.value === value) {
//             opt.setAttribute('selected', 'selected');
//           } else {
//             opt.removeAttribute('selected');
//           }
//         });
//       }

//     });


//     // Checkboxes
//     Object.entries(formState.checkbox || {}).forEach(([name, isChecked]) => {
//       const checkbox = iframeDoc.querySelector(`input[type="checkbox"][name="${name}"]`) as HTMLInputElement | null;
//       if (checkbox) {
//         const checked = isChecked === 'checked';
//         checkbox.checked = checked;
//         if (checked) checkbox.setAttribute('checked', 'checked');
//         else checkbox.removeAttribute('checked');
//       }
//     });

//     // ✅ Restore file names
//     const rows = iframeDoc.querySelectorAll('tbody tr');
//     rows.forEach((row, rowIndex) => {
//       const table = iframeDoc.querySelector('table');
//       const headerCells = Array.from(table?.querySelectorAll('thead th') || []);
//       const cells = row.querySelectorAll('td');

//       const evidenceIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'evidence');
//       const initialDateIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase().includes('initial/date'));

//       // Initial/Date
//       if (initialDateIndex !== -1 && formState[`initial-file-${rowIndex}`]) {
//         const cell = cells[initialDateIndex];
//         cell.innerHTML += `<div class="uploaded-file"><a href="/uploads/${formState[`initial-file-${rowIndex}`]}" target="_blank">${formState[`initial-file-${rowIndex}`]}</a></div>`;
//       }

//       // Evidence
//       if (evidenceIndex !== -1 && formState[`evidence-${rowIndex}`]) {
//         const cell = cells[evidenceIndex];
//         cell.innerHTML += `<div class="uploaded-file"><a href="/uploads/${formState[`evidence-${rowIndex}`]}" target="_blank">${formState[`evidence-${rowIndex}`]}</a></div>`;
//       }
//     });

//     // Reasons
//     Object.entries(formState.reasons || {}).forEach(([name, value]) => {
//       const div = iframeDoc.querySelector(`div[data-reason-name="${name}"]`) as HTMLElement | null;
//       if (div) div.textContent = value;
//     });

//     // Re-apply permissioned HTML after restoring
//     const rawHtml = iframeDoc.body.innerHTML;
//     const permissionedHtml = htmlWithPermissions(rawHtml, currentUser.id, formState);
//     editorRef.current?.setContent(permissionedHtml);
//   }, [editorRef, currentUser]);

//   const handleRadioChange = useCallback((e: Event) => {
//     if (!hasInitialized.current) {
//       console.log('Skipping radio change: editor not initialized');
//       return;
//     }
//     const target = e.target as HTMLInputElement;
//     if (target.type !== 'radio' || !target.checked) {
//       console.log('Skipping radio change: not a checked radio button');
//       return;
//     }

//     console.log('Handling radio change:', { name: target.name, value: target.value });

//     setTimeout(() => {
//       const editor = editorRef.current;
//       if (!editor) {
//         console.warn('Editor not available for radio change');
//         return;
//       }

//       const iframeDoc = editor.iframeElement?.contentDocument;
//       if (!iframeDoc) {
//         console.warn('Iframe document not available for radio change');
//         return;
//       }

//       const currentRow = target.closest('tr');
//       if (!currentRow) {
//         console.warn('Current row not found for radio change');
//         return;
//       }

//       const rowIndex = parseInt(currentRow.getAttribute('data-row-index') || '0', 10);

//       const radioName = target.name;
//       console.log(radioName, 'radioName');

//       // ✅ Update only that radio group
//       iframeDoc.querySelectorAll(`input[type="radio"][name="${radioName}"]`).forEach((radio: HTMLInputElement) => {
//         radio.checked = radio.value === target.value;
//         if (radio.checked) radio.setAttribute('checked', 'checked');
//         else radio.removeAttribute('checked');
//       });

//       // ✅ If this is the Actual Result Yes/No radio group
//       if (radioName.startsWith('ar-yesno-')) {
//         const reasonDiv = currentRow.querySelector<HTMLDivElement>(`div[data-reason-name="reason-${rowIndex}"]`);
//         if (reasonDiv) {
//           if (target.value === 'no') {
//             reasonDiv.style.display = 'block';
//             reasonDiv.setAttribute('contenteditable', 'true');

//             // Prepend bold label if not already present
//             if (!reasonDiv.querySelector('strong')) {
//               const existingText = reasonDiv.innerHTML.trim();
//               reasonDiv.innerHTML = `<strong>If No, Describe: </strong>${existingText}`;
//             }
//           } else {
//             reasonDiv.style.display = 'none';
//             reasonDiv.setAttribute('contenteditable', 'false');
//           }
//         }
//       }

//       // 🔄 Sync back into content + formState
//       const updatedContent = editor.getContent({ format: 'raw' });
//       const formState = captureFormState();
//       const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);

//       triggerWebSocketUpdate(permissionedContent, formState);
//       editor.setContent(permissionedContent);
//     }, 0);
//   }, [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]);

//   const handleSignOffClick = useCallback(
//     (e: Event, taskId: string) => {
//       const target = e.currentTarget as HTMLButtonElement;
//       if (!target.classList.contains("signoff-btn")) return;

//       const title = target.getAttribute("data-title");
//       const rowIndex = target.getAttribute("data-row-index");
//       const row = target.closest("tr") as HTMLTableRowElement | null;

//       if (currentUser.role === "Executor") {
//         if (!row || !title || rowIndex === null) return;

//         // ✅ Validation: Ensure Actual Result + Pass/Fail are selected
//         const actualResult = row.querySelector<HTMLInputElement>(
//           `input[name="ar-yesno-${title}-${rowIndex}"]:checked`
//         );
//         const passFail = row.querySelector<HTMLInputElement>(
//           `input[name="pf-result-${title}-${rowIndex}"]:checked`
//         );

//         if (!actualResult || !passFail) {
//           showError("⚠️ Please select Actual Result and Pass/Fail before signing off.");
//           return;
//         } else {
//           row.setAttribute("data-signed", "true");
//         }
//       }
//       console.log(`✅ Sign Off clicked for table=${title}, row=${rowIndex}`);

//       // 🔒 Mark button as completed
//       target.setAttribute("data-completed", "true");
//       target.disabled = true;
//       target.style.opacity = "0.5";

//       // 📅 Date + initials
//       const now = new Date();
//       const dateStr = now.toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       });
//       const getInitials = (fullName: string) => {
//         if (!fullName) return "";
//         const parts = fullName.trim().split(/\s+/);
//         return parts.length > 1
//           ? parts[0][0].toUpperCase() + parts[parts.length - 1][0].toUpperCase()
//           : parts[0][0].toUpperCase();
//       };
//       const initials = getInitials(currentUser.name);

//       // ✅ Save initials into formState
//       const currentFormState = captureFormState();
//       currentFormState.initials = {
//         ...currentFormState.initials,
//         [`initial-${title}-${rowIndex}`]: initials + " / " + dateStr,
//       };

//       // 👤 Show initials + date after button (UI only)
//       if (
//         !target.nextElementSibling ||
//         !target.nextElementSibling.classList.contains("signoff-meta")
//       ) {
//         const span = document.createElement("span");
//         span.className = "signoff-meta";
//         span.style.marginLeft = "8px";
//         span.style.fontWeight = "bold";
//         span.style.fontSize = "0.9em";
//         span.textContent = `${initials} - ${dateStr}`;
//         target.insertAdjacentElement("afterend", span);
//       }

//       // 🔄 Persist + WebSocket update + editor refresh
//       setTimeout(() => {
//         const editor = editorRef.current;
//         if (!editor) return;

//         // Enable next row if assigned to this user
//         const nextRow = row.nextElementSibling as HTMLTableRowElement | null;
//         if (nextRow) {
//           const assignedUser = nextRow
//             .querySelector("select")
//             ?.getAttribute("data-selected-user");

//           nextRow.querySelectorAll("input, select, button").forEach((el) => {
//             (el as HTMLInputElement | HTMLButtonElement | HTMLSelectElement).disabled =
//               assignedUser !== String(currentUser.id);
//           });
//         }

//         // Refresh editor content with permissions
//         const updatedContent = editor.getContent({ format: "raw" });
//         const formState = captureFormState();
//         const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);

//         editor.setContent(permissionedContent);

//         // 🔔 WebSocket update
//         if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
//           wsRef.current.send(
//             JSON.stringify({
//               type: "content_update",
//               taskId,
//               content: permissionedContent,
//               formState,
//               client_id: String(currentUser.id),
//               username: currentUser.name,
//             })
//           );
//         }

//         // 🔧 API call (disabled for now)
//         const replyData = {
//           project_id: 1,
//           project_phase_id: 1,
//           project_task_id: Number(taskId),
//           document: permissionedContent,
//           created_by: currentUser.id,
//           updated_by: currentUser.id,
//           submitted_by: currentUser.id,
//           approved_by: currentUser.id,
//           status_id: 1,
//         };

//         // fetch(Api_url.save_task_documnet, {
//         //   method: "POST",
//         //   headers: { "Content-Type": "application/json" },
//         //   body: JSON.stringify(replyData),
//         // })
//         //   .then((response) => response.json())
//         //   .then((result) => {
//         //     if (result.status_code === 200) {
//         //       showSuccess(
//         //         currentUser.role === "Executor"
//         //           ? "Test case Submitted successfully.."
//         //           : "Sign Off Completed, You can submit the document."
//         //       );
//         //     } else {
//         //       showError(`Error: ${result.message || "Unknown error"}`);
//         //     }
//         //   })
//         //   .catch((error: any) => {
//         //     showError(`Network error: ${error.message}`);
//         //   });

//       }, 0);
//     },
//     [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]
//   );

//   const handleDropdownChange = useCallback((e: Event) => {
//     const target = e.target as HTMLSelectElement;
//     if (target.tagName !== "SELECT") return;

//     console.log("Handling dropdown change:", { value: target.value });

//     setTimeout(() => {
//       const editor = editorRef.current;
//       if (!editor) return;

//       const iframeDoc = editor.iframeElement?.contentDocument;
//       if (!iframeDoc) return;

//       // ✅ update selected user attribute
//       target.setAttribute("data-selected-user", target.value);

//       console.log("Updated data-selected-user:", target.getAttribute("data-selected-user"));

//       // send update to websocket
//       const updatedContent = editor.getContent({ format: "raw" });
//       const formState = captureFormState();
//       const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);

//       triggerWebSocketUpdate(permissionedContent, formState);
//     }, 0);
//   }, [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]);


//   const handleCheckboxChange = useCallback((e: Event) => {
//     if (!hasInitialized.current) {
//       console.log('Skipping checkbox change: editor not initialized');
//       return;
//     }

//     const target = e.target as HTMLInputElement;
//     if (target.type !== 'checkbox') {
//       console.log('Skipping checkbox change: not a checkbox');
//       return;
//     }

//     setTimeout(() => {
//       const editor = editorRef.current;
//       if (!editor) return;

//       const updatedContent = editor.getContent({ format: 'raw' });
//       const formState = captureFormState();
//       const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);

//       triggerWebSocketUpdate(permissionedContent, formState);
//       editor.setContent(permissionedContent);
//     }, 0);
//   }, [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]);

//   const handleFileChange = useCallback((e: Event) => {
//     const target = e.target as HTMLInputElement;
//     if (!target || target.type !== 'file') return;

//     const editor = editorRef.current;
//     const iframeDoc = editor?.iframeElement?.contentDocument;
//     if (!iframeDoc) return;

//     const currentRow = target.closest('tr');
//     if (!currentRow) return;
//     const rowIndex = parseInt(currentRow.getAttribute('data-row-index') || '0', 10);

//     const headerCells = Array.from(iframeDoc.querySelector('table')?.querySelectorAll('thead th') || []);
//     const actualResultIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'actual result');

//     // --- Evidence Upload ---
//     if (target.name.startsWith('evidence-')) {
//       if (!target.files?.length) {
//         showError('Please select an evidence file to upload.');
//         return;
//       }

//       // ✅ Update formState with uploaded file
//       const formState = captureFormState();
//       formState.evidenceFiles = {
//         ...formState.evidenceFiles,
//         [`evidence-${rowIndex}`]: target.files?.[0] || null,
//       };

//       const updatedContent = editor.getContent({ format: 'raw' });
//       const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);
//       triggerWebSocketUpdate(permissionedContent, formState);
//       editor.setContent(permissionedContent);
//       return;
//     }

//     // --- Initial/Date Upload ---
//     if (target.name.startsWith('initialdate-')) {
//       if (!target.files?.length) {
//         showError('Please select a file for Initial/Date.');
//         target.value = '';
//         return;
//       }

//       const file = target.files[0];

//       // All conditions met: Proceed with upload logic
//       // Build formState including file (store under nested initialFiles)
//       const formState = captureFormState();
//       formState.initialFiles = {
//         ...(formState.initialFiles || {}),
//         [`initial-file-${rowIndex}`]: file.name,
//       };

//       const rawHtml = iframeDoc.body.innerHTML;
//       const permissionedContent = htmlWithPermissions(rawHtml, currentUser.id, formState);

//       contentRef.current = permissionedContent;
//       formStateRef.current = formState;
//       triggerWebSocketUpdate(permissionedContent, formState);

//       editor.setContent(permissionedContent);
//     }
//   }, [editorRef, currentUser, captureFormState, triggerWebSocketUpdate]);

//   const attachListeners = useCallback(() => {
//     const iframeDoc = editorRef.current?.iframeElement?.contentDocument;
//     if (!iframeDoc) return;

//     const handleEvent = (e: Event) => {
//       const target = e.target as HTMLElement;

//       if (target.tagName === 'INPUT') {
//         const input = target as HTMLInputElement;
//         if (input.type === 'radio') {
//           handleRadioChange(e);
//           return;
//         }
//         if (input.type === 'checkbox') {
//           handleCheckboxChange(e);
//           return;
//         }
//         if (input.type === 'file') {
//           handleFileChange(e);
//           return;
//         }
//       }

//       if (target.tagName === 'SELECT') {
//         handleDropdownChange(e);
//       }

//       // ✅ Sign Off button click
//       if (target.tagName === "BUTTON" && target.classList.contains("signoff-btn")) {
//         handleSignOffClick(e, currentTaskId);
//         return;
//       }
//     };

//     iframeDoc.removeEventListener('change', handleEvent);
//     iframeDoc.removeEventListener('click', handleEvent);
//     iframeDoc.addEventListener('change', handleEvent);
//     iframeDoc.addEventListener('click', handleEvent);
//   }, [handleRadioChange, handleDropdownChange, handleCheckboxChange, handleFileChange, handleSignOffClick, currentTaskId]);

//   useEffect(() => {
//     const curUserString = localStorage.getItem('currentUser');
//     const parsedUser = curUserString ? JSON.parse(curUserString) : null;

//     if (parsedUser?.id) {
//       const roleMap: { [key: string]: number } = {
//         Validator: 2,
//         Manager: 4,
//         'General Manager': 5,
//         Admin: 1,
//       };

//       setCurrentUser({
//         id: parsedUser.id,
//         name: parsedUser.name || '',
//         email: parsedUser.email || '',
//         role: parsedUser.role || '',
//         roleId: roleMap[parsedUser.role] || 0,
//       });
//       setCanComment(roleMap[parsedUser.role] === 4 || roleMap[parsedUser.role] === 5);
//       setCanReply(roleMap[parsedUser.role] === 2);
//     }

//     setCurrentTaskId(taskId || '');
//     setCurTask(taskName || '');
//     setCurTaskName(taskName || '');

//     const initialize = async () => {
//       setLoading(true);
//       try {
//         const response = await fetch(Api_url.get_task_document(taskId));
//         if (!response.ok) throw new Error("Failed to fetch document");

//         const responseBody = await response.json();
//         const fileFlag: number = responseBody.data?.file_flag;
//         let documentContent: string = responseBody.data?.task_document || "";

//         if (!documentContent) {
//           showError("No document content available");
//           documentContent = "<p>Default content: Unable to load document</p>";
//         }

//         // --- 2. Convert based on flag ---
//         let htmlContent: string;
//         if (fileFlag === 1) {
//           // Markdown → HTML
//           const rawHtml = mdToHtml(documentContent);
//           htmlContent = htmlWithPermissions(rawHtml, currentUser.id, formStateRef.current || {});
//         } else {
//           // Already HTML
//           htmlContent = htmlWithPermissions(documentContent, currentUser.id, formStateRef.current || {});
//         }

//         // --- 3. Task mode states ---
//         const states = {
//           draft: { isEditing: true, isDocumentMode: false, isUpdate: false },
//           review: { isEditing: false, isDocumentMode: false, isUpdate: true },
//           default: { isEditing: false, isDocumentMode: true, isUpdate: false },
//         };
//         const { isEditing, isDocumentMode, isUpdate } =
//           states[taskName.toLowerCase() as keyof typeof states] || states.default;

//         setIsEditing(isEditing);
//         setIsDocumentMode(isDocumentMode);
//         setIsUpdate(isUpdate);

//         // --- 4. Read-only adjustments ---
//         if (isDocumentMode && htmlContent) {
//           htmlContent = convertSelectsToSpans(htmlContent);
//         }

//         // --- 5. Save content + refs ---
//         setContent(htmlContent);
//         contentRef.current = htmlContent;

//         // initialize form state baseline (important!)
//         formStateRef.current = formStateRef.current || {};

//         // Now initialize the editor after content is fetched
//         const loadTinyMCEScript = () => {
//           return new Promise((resolve, reject) => {
//             if (window.tinymce) {
//               console.log('TinyMCE already loaded');
//               resolve();
//               return;
//             }
//             console.log('Loading TinyMCE script...');
//             const script = document.createElement('script');
//             script.src = `${basePath}/tinymce/js/tinymce/tinymce.min.js`;
//             script.crossOrigin = 'anonymous';
//             script.onload = () => {
//               console.log('TinyMCE script loaded successfully');
//               resolve();
//             };
//             script.onerror = (error) => {
//               console.error('Failed to load TinyMCE script:', error);
//               showError('Failed to load editor');
//               reject(new Error('TinyMCE script failed to load'));
//             };
//             document.body.appendChild(script);
//           });
//         };

//         const connectWebSocket = (taskId: string) => {
//           const wsUrl = `ws://127.0.0.1:8012/api/ws/${taskId}`;
//           const ws = new WebSocket(wsUrl);
//           wsRef.current = ws;

//           ws.onopen = () => {
//             console.log('WebSocket connected for task:', taskId);
//             const initialContent = contentRef.current || '';
//             let initialBookmark = null;
//             if (editorRef.current && editorReady.current && editorRef.current.selection) {
//               try {
//                 initialBookmark = editorRef.current.selection.getBookmark(2, true);
//                 console.log('Initial bookmark captured:', initialBookmark);
//               } catch (err) {
//                 console.warn('Failed to capture initial bookmark:', err);
//               }
//             }
//             const formState = captureFormState();
//             const message = {
//               type: 'content_update',
//               content: initialContent,
//               client_id: String(currentUser.id),
//               username: currentUser.name,
//               cursor: initialBookmark,
//               formState,
//             };
//             ws.send(JSON.stringify(message));
//           };

//           ws.onmessage = (event) => {
//             try {
//               const message = JSON.parse(event.data);

//               // Ignore updates from self
//               if (message.client_id === currentUser.id && message.type === 'content_update') {
//                 console.log('Ignoring content update from self:', currentUser.id);
//                 return;
//               }

//               if (message.type === 'content_update' && message.content) {
//                 if (!editorRef.current || !editorReady.current || !editorRef.current.selection) {
//                   console.warn('Editor not fully ready, queuing message:', JSON.stringify(message, null, 2));
//                   pendingMessages.current.push(message);
//                   return;
//                 }

//                 const markdownContent = message.content;

//                 const editor = editorRef.current;
//                 const currentContent = editor.getContent({ format: 'raw' });
//                 if (currentContent !== markdownContent) {
//                   let bookmark = null;
//                   try {
//                     bookmark = editor.selection.getBookmark(2, true);
//                     console.log('Captured bookmark:', bookmark);
//                   } catch (err) {
//                     console.warn('Failed to get bookmark:', err);
//                   }

//                   // Build HTML for this user with correct permissions
//                   const htmlContent = htmlWithPermissions(markdownContent, currentUser.id, message.formState);
//                   console.log('------html with permissions------', htmlContent);

//                   // Just set the content — DO NOT trigger WS update here
//                   editor.setContent(htmlContent);

//                   attachListeners();


//                   // Restore form state if provided
//                   if (message.formState) {
//                     restoreFormState(message.formState);
//                     formStateRef.current = message.formState;
//                   }

//                   if (bookmark) {
//                     try {
//                       editor.selection.moveToBookmark(bookmark);
//                       console.log('Restored bookmark:', bookmark);
//                     } catch (err) {
//                       console.warn('Failed to restore bookmark:', err);
//                     }
//                   }

//                   contentRef.current = markdownContent;
//                   setContent(markdownContent);
//                 }

//                 // Update cursor info for other users
//                 if (message.client_id !== currentUser.id) {
//                   let cursor = message.cursor;
//                   if (cursor && cursor.start && Array.isArray(cursor.start)) {
//                     cursor = {
//                       type: 'caret',
//                       start: { type: 'paragraph', offset: cursor.start[0] || 0 },
//                     };
//                   }
//                   if (cursor && message.username) {
//                     setCursors((prev) => ({
//                       ...prev,
//                       [message.client_id]: {
//                         cursor,
//                         username: message.username || `User_${message.client_id}`,
//                       },
//                     })
//                   );
//                   }
//                 }
//               }
//               else if (message.type === 'error') {
//                 console.error('WebSocket error message:', message.message);
//                 showError(message.message);
//               }
//             } catch (err) {
//               console.error('Invalid WebSocket message:', event.data, err);
//             }
//           };


//           ws.onclose = () => {
//             console.log('WebSocket disconnected, reconnecting...');
//             setTimeout(() => connectWebSocket(taskId), 3000);
//           };

//           ws.onerror = (err) => {
//             console.error('WebSocket error:', err);
//           };
//         };

//         const processPendingMessages = () => {
//           if (!editorRef.current || !editorReady.current || !editorRef.current.selection) {
//             console.warn('Editor not fully ready for pending messages, retrying in 500ms');
//             setTimeout(processPendingMessages, 500);
//             return;
//           }
//           while (pendingMessages.current.length > 0) {
//             const message = pendingMessages.current.shift();
//             console.log('Processing queued message:', JSON.stringify(message, null, 2));
//             if (message.type === 'content_update' && message.content) {
//               const markdownContent = message.content;

//               const editor = editorRef.current;
//               const currentContent = editor.getContent({ format: 'raw' });
//               if (currentContent !== markdownContent) {
//                 let bookmark = null;
//                 try {
//                   bookmark = editor.selection.getBookmark(2, true);
//                   console.log('Captured bookmark for queued message:', bookmark);
//                 } catch (err) {
//                   console.warn('Failed to get bookmark for queued message:', err);
//                 }
//                 const htmlContent = htmlWithPermissions(markdownContent, currentUser.id, message.formState);
//                 console.log('------html with permissions------', htmlContent, 'html with permissions');

//                 editor.setContent(htmlContent);

//                 if (message.formState) {
//                   restoreFormState(message.formState);
//                   formStateRef.current = message.formState;
//                 }
//                 if (bookmark) {
//                   try {
//                     editor.selection.moveToBookmark(bookmark);
//                     console.log('Restored bookmark for queued message:', bookmark);
//                   } catch (err) {
//                     console.warn('Failed to restore bookmark for queued message:', err);
//                   }
//                 }
//                 contentRef.current = markdownContent;
//                 setContent(markdownContent);
//               }
//               if (message.client_id !== currentUser.id && message.cursor && message.username) {
//                 console.log(`Updating queued cursor for client ${message.client_id}, username: ${message.username}`);
//                 setCursors((prev) => ({
//                   ...prev,
//                   [message.client_id]: {
//                     cursor: message.cursor,
//                     username: message.username || message.client_id,
//                   },
//                 }));
//               }
//             }
//           }
//         };

//         let editorInstance = null;

//         const initEditor = (markdownContent: string, readOnly: boolean, taskId: string) => {
//           console.log('Initializing TinyMCE with markdown content:', markdownContent.substring(0, 100) + '...');
//           if (!window.tinymce) {
//             console.error('TinyMCE not loaded');
//             showError('Editor not available');
//             return;
//           }

//           console.log('------html with permissions before ------', markdownContent, 'html with permissions before');

//           const htmlContent = htmlWithPermissions(markdownContent, currentUser.id, formStateRef.current);
//           console.log('------html with permissions after ------', htmlContent, 'html with permissions after ');

//           window.tinymce.init({
//             selector: `#${editorId}`,
//             height: 600,
//             inline: false,
//             menubar: !readOnly,
//             plugins: 'table lists advlist code image emoticons charmap insertdatetime media preview quickbars searchreplace form',
//             toolbar: readOnly
//               ? ''
//               : 'undo redo | styleselect | bold italic | forecolor backcolor | alignleft aligncenter alignright | bullist numlist | table | print emoticons charmap insertdatetime image media preview save searchreplace | checkboxBtn radioBtn dropdownBtn | snipBtn',
//             readonly: readOnly,
//             menu: {
//               insert: { title: 'Insert', items: 'checkbox radio select' }
//             },
//             extended_valid_elements: 'input[type|name|value|checked|disabled],select[name],option[value|selected]',

//             images_upload_url: '/upload',
//             images_upload_handler: async (blobInfo, success, failure) => {
//               try {
//                 const formData = new FormData();
//                 formData.append('file', blobInfo.blob(), blobInfo.filename());
//                 const response = await fetch('/upload', {
//                   method: 'POST',
//                   body: formData,
//                 });
//                 if (!response.ok) throw new Error('Upload failed');
//                 const { url } = await response.json();
//                 success(url);
//               } catch (err) {
//                 console.error('Image upload error:', err);
//                 failure('Image upload failed: ' + err.message);
//               }
//             },
//             setup: (editor) => {
//               editorInstance = editor;
//               editorRef.current = editor;

//               editor.ui.registry.addButton('customimage', {
//                 text: 'Insert Image',
//                 onAction: () => {
//                   editor.windowManager.open({
//                     title: 'Insert Image',
//                     body: {
//                       type: 'panel',
//                       items: [
//                         { type: 'input', name: 'url', label: 'Image URL' },
//                         { type: 'input', name: 'alt', label: 'Alt Text' },
//                       ],
//                     },
//                     buttons: [
//                       { type: 'cancel', text: 'Cancel' },
//                       { type: 'submit', text: 'Insert', primary: true },
//                     ],
//                     onSubmit: (api) => {
//                       const { url, alt } = api.getData();
//                       if (url) {
//                         editor.insertContent(
//                           `<img src="${url}" alt="${alt || 'Image'}" class="editor-image" />`
//                         );
//                       }
//                       api.close();
//                     },
//                   });
//                 },
//               });

//               editor.ui.registry.addButton('insertimagelink', {
//                 text: 'Insert Image Link',
//                 onAction: () => {
//                   editor.windowManager.open({
//                     title: 'Insert Image Link',
//                     body: {
//                       type: 'panel',
//                       items: [
//                         { type: 'input', name: 'url', label: 'Image URL' },
//                         { type: 'input', name: 'text', label: 'Link Text' },
//                       ],
//                     },
//                     buttons: [
//                       { type: 'cancel', text: 'Cancel' },
//                       { type: 'submit', text: 'Insert', primary: true },
//                     ],
//                     onSubmit: (api) => {
//                       const { url, text } = api.getData();
//                       if (url) {
//                         editor.insertContent(
//                           `<a href="${url}" class="image-link" data-image-url="${url}">${text || 'View Image'}</a>`
//                         );
//                       }
//                       api.close();
//                     },
//                   });
//                 },
//               });

//               // Insert Checkbox
//               editor.ui.registry.addButton('checkboxBtn', {
//                 text: 'Checkbox',
//                 onAction: function () {
//                   editor.insertContent('<input type="checkbox" name="chk1" />');
//                 }
//               });

//               // Insert Radio
//               editor.ui.registry.addButton('radioBtn', {
//                 text: 'Radio',
//                 onAction: function () {
//                   editor.insertContent('<input type="radio" name="radioGroup" value="option1" />');
//                 }
//               });

//               // Insert Dropdown
//               editor.ui.registry.addButton('dropdownBtn', {
//                 text: 'Dropdown',
//                 onAction: function () {
//                   editor.insertContent(
//                     '<select name="mySelect">' +
//                     '<option value="1">Option 1</option>' +
//                     '<option value="2">Option 2</option>' +
//                     '</select>'
//                   );
//                 }
//               });


//               editor.ui.registry.addButton('snipBtn', {
//                 text: '✂️ Snip',
//                 tooltip: 'Capture and insert screenshot',
//                 onAction: async () => {
//                   try {
//                     // Prompt user to select a screen or window
//                     const stream = await navigator.mediaDevices.getDisplayMedia({
//                       video: {
//                         displaySurface: 'monitor', // Prefer entire screen, but user can choose
//                         cursor: 'always' // Include cursor in capture
//                       },
//                       audio: false
//                     });

//                     // Get the video track
//                     const track = stream.getVideoTracks()[0];
//                     const imageCapture = new ImageCapture(track);

//                     // Capture the frame
//                     const bitmap = await imageCapture.grabFrame();
//                     track.stop(); // Stop the stream immediately after capturing

//                     // Create canvas to draw the captured frame
//                     const canvas = document.createElement('canvas');
//                     canvas.width = bitmap.width;
//                     canvas.height = bitmap.height;
//                     const ctx = canvas.getContext('2d');
//                     ctx.drawImage(bitmap, 0, 0);

//                     // Create overlay for cropping
//                     const overlay = document.createElement('div');
//                     overlay.style.cssText = `
//             position: fixed;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             background: rgba(0, 0, 0, 0.8);
//             z-index: 9999;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             flex-direction: column;
//           `;
//                     document.body.appendChild(overlay);

//                     // Display the captured image
//                     const img = document.createElement('img');
//                     img.style.maxWidth = '90%';
//                     img.style.maxHeight = '80%';
//                     img.src = canvas.toDataURL('image/png');
//                     overlay.appendChild(img);

//                     // Wait for image to load before initializing Cropper
//                     await new Promise((resolve) => {
//                       img.onload = resolve;
//                       img.onerror = () => resolve(); // Resolve even on error to proceed
//                     });

//                     // Initialize Cropper.js (version 2.x)
//                     const cropper = new Cropper(img, {
//                       viewMode: 1, // Restrict crop box to image
//                       autoCrop: true,
//                       autoCropArea: 0.6, // Start with 60% of the image area
//                       movable: true,
//                       zoomable: true,
//                       scalable: true,
//                       rotatable: false,
//                       cropBoxResizable: true
//                     });

//                     // Action buttons
//                     const btnContainer = document.createElement('div');
//                     btnContainer.style.marginTop = '10px';

//                     // Insert button
//                     const insertBtn = document.createElement('button');
//                     insertBtn.innerText = '✅ Insert Snip';
//                     insertBtn.style.marginRight = '10px';
//                     insertBtn.style.padding = '8px 16px';
//                     insertBtn.style.background = '#28a745';
//                     insertBtn.style.color = 'white';
//                     insertBtn.style.border = 'none';
//                     insertBtn.style.borderRadius = '4px';
//                     insertBtn.style.cursor = 'pointer';

//                     insertBtn.onclick = async () => {
//                       try {
//                         // Get cropped canvas using Cropper.js 2.x
//                         const croppedCanvas = cropper.getCroppedCanvas({
//                           width: 800, // Optional: Set a max width for the cropped image
//                           height: 600, // Optional: Set a max height for the cropped image
//                           minWidth: 0,
//                           minHeight: 0,
//                           maxWidth: 4096,
//                           maxHeight: 4096,
//                           fillColor: '#fff',
//                           imageSmoothingEnabled: true,
//                           imageSmoothingQuality: 'high'
//                         });

//                         if (!croppedCanvas) {
//                           throw new Error('Failed to get cropped canvas');
//                         }

//                         // Convert cropped canvas to blob
//                         const blob = await new Promise((resolve) => {
//                           croppedCanvas.toBlob((blob) => resolve(blob), 'image/png');
//                         });

//                         if (!blob) {
//                           throw new Error('Failed to convert canvas to blob');
//                         }

//                         // Use the existing images_upload_handler to upload the image
//                         const blobInfo = {
//                           blob: () => blob,
//                           filename: () => `screenshot_${Date.now()}.png`
//                         };

//                         const uploadResult = await new Promise((resolve, reject) => {
//                           editor.getParam('images_upload_handler')(blobInfo,
//                             (url) => resolve(url),
//                             (error) => reject(new Error(error))
//                           );
//                         });

//                         // Insert the uploaded image into the editor
//                         editor.insertContent(`<img src="${uploadResult}" alt="Screenshot" class="editor-image" />`);

//                         // Clean up
//                         overlay.remove();
//                         cropper.destroy();
//                       } catch (err) {
//                         console.error('Error inserting screenshot:', err);
//                         editor.windowManager.alert('Failed to insert screenshot: ' + err.message);
//                         overlay.remove();
//                         cropper.destroy();
//                       }
//                     };

//                     // Cancel button
//                     const cancelBtn = document.createElement('button');
//                     cancelBtn.innerText = '❌ Cancel';
//                     cancelBtn.style.padding = '8px 16px';
//                     cancelBtn.style.background = '#dc3545';
//                     cancelBtn.style.color = 'white';
//                     cancelBtn.style.border = 'none';
//                     cancelBtn.style.borderRadius = '4px';
//                     cancelBtn.style.cursor = 'pointer';
//                     cancelBtn.onclick = () => {
//                       overlay.remove();
//                       cropper.destroy();
//                     };

//                     btnContainer.appendChild(insertBtn);
//                     btnContainer.appendChild(cancelBtn);
//                     overlay.appendChild(btnContainer);
//                   } catch (err) {
//                     console.error('Screen capture failed:', err);
//                     editor.windowManager.alert('Failed to capture screen: ' + err.message);
//                   }
//                 }
//               });

//               editor.on('init', () => {
//                 console.log('TinyMCE initialized, setting content:', htmlContent.substring(0, 100) + '...');
//                 editor.setContent(htmlContent || '<p>No content available</p>');

//                 contentRef.current = markdownContent;
//                 setContent(markdownContent);
//                 restoreFormState(formStateRef.current);
//               });
//             },
//           });
//         };

//         await loadTinyMCEScript();
//         connectWebSocket(taskId);
//         initEditor(contentRef.current, isDocumentMode || !isEditing, taskId);
//         editorReady.current = true;
//         processPendingMessages();
//         attachListeners();
//       } catch (err: any) {
//         showError(err.message || "Failed to load document");
//         const fallback = "<p>Failed to load document</p>";
//         setContent(fallback);
//         contentRef.current = fallback;
//       } finally {
//         setLoading(false);
//       }
//     };

//     initialize();
//   }, [taskId, taskName, equipmentId]);

//   const handleInitialDateUpload = (e: Event) => {
//     try {
//       const target = e.target as HTMLInputElement;
//       if (!target.files?.length) return;

//       const editor = editorRef.current;
//       if (!editor) return;
//       const iframeDoc = editor.iframeElement?.contentDocument;
//       if (!iframeDoc) return;

//       const file = target.files[0];
//       const currentRow = target.closest('tr');
//       if (!currentRow) return;

//       const rowIndex = parseInt(currentRow.getAttribute('data-row-index') || '0', 10);
//       const cells = currentRow.querySelectorAll('td');
//       const headerCells = Array.from(iframeDoc.querySelectorAll('thead th'));

//       const testInstructionsIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'test instruction');
//       const evidenceIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'evidence');

//       // 1. Evidence required check
//       let evidenceRequired = false;
//       if (testInstructionsIndex !== -1) {
//         const cb = cells[testInstructionsIndex]?.querySelector('input[type="checkbox"]') as HTMLInputElement;
//         evidenceRequired = !!cb?.checked;
//       }
//       if (evidenceRequired && evidenceIndex !== -1) {
//         const evCell = cells[evidenceIndex];
//         const hasEvidence = !!evCell?.querySelector('.file-link'); // check for uploaded file link
//         if (!hasEvidence) {
//           showError('Please upload evidence before Signoff.');
//           target.value = '';
//           return;
//         }
//       }

//       // 2. Pass/Fail required
//       const passFailChecked = !!currentRow.querySelector<HTMLInputElement>(`input[type="radio"][name^="pf-result-"]:checked`);
//       if (!passFailChecked) {
//         showError('Please select Pass or Fail before Signoff.');
//         target.value = '';
//         return;
//       }
//       else {
//         const selectedRadio = currentRow.querySelector<HTMLInputElement>(
//           `input[type="radio"][name^="pf-result-"]:checked`
//         );
//         const passFailValue = selectedRadio ? selectedRadio.value : null; // "Pass" / "Fail" / whatever the value is
//         console.log(passFailValue, 'passFailValue')
//         if (passFailValue === 'fail') {
//           showError('Your Test case failed. Do you want to upload Initial/Date?');
//           target.value = '';
//           return;
//         }
//       }

//       // 3. Actual Result required
//       const yesNoChecked = !!currentRow.querySelector<HTMLInputElement>(`input[type="radio"][name^="ar-yesno-"]:checked`);
//       if (!yesNoChecked) {
//         showError('Please select Yes or No in Actual Result before Signoff.');
//         target.value = '';
//         return;
//       }

//       // ✅ Passed → mark uploaded file
//       const initialDateIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase().includes('initial/date'));
//       const initialCell = cells[initialDateIndex];
//       if (initialCell) {

//         // Instead of manual marker.innerHTML → use same logic as handleFileUpload
//         const prevFiles = fileInputMapRef.current.get(target) || [];
//         const updatedFiles = [...new Set([...prevFiles, file.name])];
//         fileInputMapRef.current.set(target, updatedFiles);
//         renderFileNamesNearInput(target, updatedFiles);
//       }

//       // Lock current row
//       currentRow.style.opacity = '0.6';
//       currentRow.style.pointerEvents = 'none';
//       currentRow.querySelectorAll('input, select, button, textarea')
//         .forEach(el => el.setAttribute('disabled', 'disabled'));

//       // Build formState including file (no direct HTML mutation for file links)
//       const formState = captureFormState();
//       formState[`initial-file-${rowIndex}`] = file.name;

//       contentRef.current = iframeDoc.body.innerHTML; // keep raw table as is
//       formStateRef.current = formState;
//       triggerWebSocketUpdate(contentRef.current, formState);

//       // ✅ Do NOT inject file links again into editor.setContent
//       // Just re-apply permissioned HTML without duplicating uploaded files
//       const permissionedContent = htmlWithPermissions(contentRef.current, currentUser.id, formState);
//       editor.setContent(permissionedContent);

//       // After content reset, re-render the file names from fileInputMapRef
//       renderFileNamesNearInput(target, fileInputMapRef.current.get(target) || []);

//       showSuccess('Initial/Date uploaded successfully.');
//     } catch (err) {
//       console.log('InitialDateUpload failed', err);
//       showError('Unexpected error while uploading Initial/Date.');
//     }
//   };


//   // file uploading in editor
//   const handleFileUpload = async (e: Event) => {
//     const input = e.target as HTMLInputElement;
//     const files = input?.files;
//     if (!files || files.length === 0) return;

//     const formData = new FormData();
//     Array.from(files).forEach((file) => {
//       formData.append('files', file);
//     });

//     try {
//       // const response = await fetch(Api_url.EvidenceUploadFromEditor, {
//       //   method: 'POST',
//       //   body: formData,
//       // });

//       // const result = await response.json();
//       // console.log('Upload Success:', result);

//       // if (Array.isArray(result.uploaded_files)) {
//       //   const prevFiles = fileInputMapRef.current.get(input) || [];
//       //   const updatedFiles = [...new Set([...prevFiles, ...result.uploaded_files])];
//       //   fileInputMapRef.current.set(input, updatedFiles);
//       //   renderFileNamesNearInput(input, updatedFiles);

//       //   // ----- WebSocket Sync -----
//       //   const editor = editorRef.current;
//       //   if (editor && editor.iframeElement?.contentDocument) {
//       //     const rawHtml = editor.iframeElement.contentDocument.body.innerHTML;
//       //     const permissionedHtml = htmlWithPermissions(rawHtml, currentUser.id, formStateRef.current);
//       //     console.log('------html with permissions------', permissionedHtml, 'html with permissions')

//       //     editor.setContent(permissionedHtml);
//       //     const formState = captureFormState(); // from useTableEvents
//       //     triggerWebSocketUpdate(permissionedHtml, formState);
//       //     contentRef.current = permissionedHtml;
//       //     formStateRef.current = formState;
//       //   }
//       //   // --------------------------
//       // }
//     } catch (error) {
//       console.error('Upload Error:', error);
//       showError('Failed to upload files');
//     }
//   };

//   // Renders uploaded file links and remove buttons next to the file input inside the TinyMCE table cell.
//   const renderFileNamesNearInput = (input: HTMLInputElement, filePaths: string[]) => {
//     let container = input.nextElementSibling as HTMLElement;

//     // Create container if not found
//     if (!container || !container.classList.contains('file-name-container')) {
//       container = document.createElement('div');
//       container.className = 'file-name-container';
//       container.style.marginTop = '6px';
//       container.style.fontSize = '14px';
//       container.style.display = 'flex';
//       container.style.flexDirection = 'column';
//       input.parentElement?.insertBefore(container, input.nextSibling);
//     }

//     // Merge with previous files if any (to support incremental updates)
//     const existingFiles = Array.from(container.querySelectorAll('a.file-link'))
//       .map(link => link.getAttribute('data-file-url') || '')
//       .filter(Boolean);

//     const allFiles = [...new Set([...existingFiles, ...filePaths])]; // remove duplicates

//     // Clear UI before re-rendering
//     container.innerHTML = '';

//     allFiles.forEach((filePath, idx) => {
//       const fileName = filePath.split(/[\\/]/).pop()!.trim();
//       const fileLine = document.createElement('div');
//       fileLine.style.display = 'flex';
//       fileLine.style.alignItems = 'center';
//       fileLine.style.gap = '6px';
//       fileLine.style.marginBottom = '4px';

//       const link = document.createElement('a');
//       link.href = '#';
//       link.textContent = fileName;
//       link.className = 'file-link';
//       link.setAttribute('data-file-url', filePath);
//       link.style.color = '#007bff';
//       link.style.textDecoration = 'underline';

//       const removeBtn = document.createElement('button');
//       removeBtn.innerText = '×';
//       removeBtn.style.color = 'red';
//       removeBtn.style.border = 'none';
//       removeBtn.style.background = 'transparent';
//       removeBtn.style.cursor = 'pointer';
//       removeBtn.style.fontSize = '14px';

//       // Remove file and re-render
//       removeBtn.onclick = () => {
//         const updatedFiles = allFiles.filter((_, i) => i !== idx);
//         fileInputMapRef.current.set(input, updatedFiles);
//         renderFileNamesNearInput(input, updatedFiles); // re-render after removal
//       };

//       fileLine.appendChild(link);
//       fileLine.appendChild(removeBtn);
//       container.appendChild(fileLine);
//     });

//     // Update internal map state
//     fileInputMapRef.current.set(input, allFiles);
//   };

//   // Fetches an uploaded image by filename and opens it in a popup
//   const handleImageClick = (fileName: string) => {
//     // fetch(`${Api_url.GetEvidenceFileToEditor}/${encodeURIComponent(fileName)}`)
//     //   .then(response => {
//     //     if (!response.ok) throw new Error('File not found');
//     //     return response.blob();
//     //   })
//     //   .then(blob => {
//     //     const fileUrl = URL.createObjectURL(blob);
//     //     openFileInPopup(fileUrl);
//     //   })
//     //   .catch(error => {
//     //     console.error('Error fetching file:', error);
//     //     showError('Failed to fetch file');
//     //   });
//   };

//   // Opens the given image URL in a centered popup viewer
//   const openFileInPopup = (fileUrl: string) => {
//     const popup = window.open('', '_blank', 'width=600,height=400');
//     if (popup) {
//       popup.document.write(`
//       <html>
//         <head><title>File Viewer</title></head>
//         <body style="text-align: center; padding: 20px;">
//           <img src="${fileUrl}" alt="File" style="max-width: 100%; height: auto;" />
//         </body>
//       </html>
//     `);
//     } else {
//       console.error('Failed to open popup. The popup might be blocked by the browser.');
//       showError('Failed to open file viewer. Please allow popups.');
//     }
//   };

//   // Returns a consistent color for each user based on their client ID
//   const getUserColor = (clientId: string): string => {
//     const colors = [
//       '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6',
//     ];
//     const hash = clientId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
//     return colors[hash % colors.length];
//   };

//   // Converts <select> dropdowns in read-only mode to bold <span> elements showing selected text
//   const convertSelectsToSpans = (htmlContent: string): string => {
//     console.log('Converting selects to spans, input:', htmlContent.substring(0, 100) + '...');
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(htmlContent, 'text/html');
//     const selects = doc.querySelectorAll('select');

//     selects.forEach((select) => {
//       const selectedOption = (select as HTMLSelectElement).selectedOptions[0];
//       const span = doc.createElement('span');
//       span.textContent = selectedOption?.textContent || '';
//       span.style.fontWeight = 'bold';
//       span.style.marginRight = '0.5rem';
//       select.replaceWith(span);
//     });

//     const output = doc.body.innerHTML;
//     console.log('Converted to spans, output:', output.substring(0, 100) + '...');
//     return output;
//   };

//   // Makes most content in the editor read-only, while keeping inputs, selects, radios, and images interactive
//   const makePartialReadOnly = () => {
//     console.log('Making editor partially read-only');
//     const iframe = document.querySelector('iframe');
//     if (!iframe) {
//       console.warn('No iframe found for partial read-only');
//       return;
//     }

//     const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
//     const container = iframeDoc.body;

//     const nonSelectElements = container.querySelectorAll(':not(select):not(img):not(a.image-link):not(input[type="radio"])');
//     nonSelectElements.forEach((el) => {
//       const element = el as HTMLElement;
//       if (
//         element.tagName.toLowerCase() !== 'select' &&
//         element.tagName.toLowerCase() !== 'img' &&
//         !element.classList.contains('image-link') &&
//         element.tagName.toLowerCase() !== 'input'
//       ) {
//         element.setAttribute('contenteditable', 'false');
//         element.style.backgroundColor = '#f5f5f5';
//         element.style.pointerEvents = 'none';
//       }
//     });

//     const selectElements = container.querySelectorAll('select');
//     selectElements.forEach((el) => {
//       const element = el as HTMLSelectElement;
//       element.removeAttribute('contenteditable');
//       element.style.pointerEvents = 'auto';
//       element.disabled = false;
//     });

//     const radioElements = container.querySelectorAll('input[type="radio"]');
//     radioElements.forEach((el) => {
//       const element = el as HTMLInputElement;
//       element.removeAttribute('contenteditable');
//       element.style.pointerEvents = 'auto';
//       element.disabled = false;
//     });

//     const imageLinks = container.querySelectorAll('a.image-link');
//     imageLinks.forEach((el) => {
//       const element = el as HTMLElement;
//       element.style.pointerEvents = 'auto';
//     });
//   };


//   // Handle save in edit mode – saves HTML content with permissions applied
//   const handleEditSave = async () => {
//     const editor = editorRef.current;
//     setLoading(true);
//     if (editor) {
//       const formState = captureFormState();
//       const rawHtml = editor.getContent({ format: "raw" });
//       const htmlContent = htmlWithPermissions(rawHtml, currentUser.id, formState); // ensures radios/checks persist
//       triggerWebSocketUpdate(htmlContent, formState);
//       console.log(htmlContent, 'html content with permissions');

//       setContent(htmlContent);
//       contentRef.current = htmlContent;
//       formStateRef.current = formState;

//       console.log('✅ Saved HTML:', htmlContent);

//       const replyData = {
//         project_id: 1,
//         project_phase_id: 1,
//         project_task_id: Number(currentTaskId),
//         document: htmlContent,  // <<-- send the permissioned version
//         created_by: 1,
//         updated_by: 1,
//         submitted_by: 1,
//         approved_by: 1,
//         status_id: 1
//       };

//       // try {
//       //   const response = await fetch(Api_url.save_task_documnet, {
//       //     method: 'POST',
//       //     headers: {
//       //       'Content-Type': 'application/json',
//       //     },
//       //     body: JSON.stringify(replyData),
//       //   });
//       //   setLoading(false);

//       //   const result = await response.json();
//       //   if (response.ok && result.status_code === 200) {
//       //     console.log('✅ API Response:', result.message);
//       //     navigate(-1);
//       //   } else {
//       //     showError(`Error: ${result.message || 'Unknown error'}`);
//       //   }
//       // } catch (error: any) {
//       //   showError(`Network error: ${error.message}`);
//       // }
//     }
//   };


//   // Handle save in view-only mode – updates HTML content and state
//   const handleViewSave = async () => {
//     const htmlContent = editorRef.current.getContent();
//     setContent(htmlContent);
//     contentRef.current = htmlContent;
//     formStateRef.current = captureFormState();
//     console.log('✅ View HTML:', htmlContent);
//     showSuccess('Document changes saved successfully');
//     navigate(-1);
//   };

//   // submit the task -- moves to next user
//   const handleTaskSubmit = async () => {
//     const editor = editorRef.current;
//     const updatedBy = Number(currentUser.id);
//     setIsSidebarOpen(false);
//     if (isNaN(updatedBy)) {
//       console.error('Invalid user ID:', currentUser.id);
//       showError('Cannot submit task: Invalid user ID');
//       return;
//     }
//     if (!currentTaskId) {
//       console.error('Invalid task ID:', currentTaskId);
//       showError('Cannot submit task: Invalid task ID');
//       return;
//     }
//     const formState = captureFormState();
//     const rawHtml = editor.getContent({ format: "raw" });
//     const htmlContent = htmlWithPermissions(rawHtml, currentUser.id, formState); // ensures radios/checks persist


//     const parser = new DOMParser();
//     const doc = parser.parseFromString(htmlContent, "text/html");

//     const signoffRows = doc.querySelectorAll("table[data-title^='TS'] tbody tr");

//     let hasPendingSignoff = false;

//     signoffRows.forEach(row => {
//       const select = row.querySelector("select");
//       const assignedUser = select?.getAttribute("data-selected-user");
//       const btn = row.querySelector("td button.signoff-btn") as HTMLButtonElement;
//       const signedOff = btn?.getAttribute("data-completed") === "true";

//       if (assignedUser === String(currentUser.id) && !signedOff) {
//         hasPendingSignoff = true;
//       }
//     });

//     if (hasPendingSignoff) {
//       showError("You must complete your sign-off before submitting this task.");
//       return;
//     }


//     triggerWebSocketUpdate(htmlContent, formState);


//     setSubmitLoading(true);
//     // try {
//     //   const submitData = {
//     //     task_id: Number(currentTaskId),
//     //     status_id: 3,
//     //     updated_by: updatedBy,
//     //     document: htmlContent,
//     //   };

//     //   const response = await fetch(Api_url.submitTasks, {
//     //     method: 'POST',
//     //     headers: {
//     //       'Content-Type': 'application/json',
//     //     },
//     //     body: JSON.stringify(submitData),
//     //   });

//     //   const result = await response.json();
//     //   console.log('Task submit response:', result);

//     //   if (!response.ok || result.status === 'error') {
//     //     showError(result.message);
//     //     throw new Error(result.message || `Failed to submit task: ${response.statusText}`);
//     //   }

//     //   showSuccess('Task submitted successfully');
//     //   navigate(-1);
//     // } catch (err: any) {
//     //   console.error('❌ Error submitting task:', err.message);
//     //   showError(err.message || 'Failed to submit task');
//     // } finally {
//     //   setSubmitLoading(false);
//     // }
//   };

//   // coment on a task
//   const handleCommentSave = async () => {
//     if (!newComment.trim()) {
//       showError('Comment cannot be empty');
//       return;
//     }

//     const commentedBy = Number(currentUser.id);
//     if (isNaN(commentedBy)) {
//       console.error('Invalid user ID:', currentUser.id);
//       showError('Cannot post comment: Invalid user ID');
//       return;
//     }

//     if (!currentTaskId) {
//       console.error('Invalid task ID:', currentTaskId);
//       showError('Cannot post comment: Invalid task ID');
//       return;
//     }

//     // try {
//     //   const commentData = {
//     //     task_id: Number(currentTaskId),
//     //     comment: newComment,
//     //     commented_by: commentedBy,
//     //   };
//     //   console.log('Posting comment with data:', commentData);

//     //   const response = await fetch(Api_url.Task_Comments, {
//     //     method: 'POST',
//     //     headers: {
//     //       'Content-Type': 'application/json',
//     //     },
//     //     body: JSON.stringify(commentData),
//     //   });

//     //   const result = await response.json();
//     //   console.log('Comment save response:', result);

//     //   if (!response.ok || result.status === 'error') {
//     //     throw new Error(result.message || `Failed to post comment: ${response.statusText}`);
//     //   }

//     //   const timestamp = new Date().toLocaleString('en-US', {
//     //     year: 'numeric',
//     //     month: 'short',
//     //     day: 'numeric',
//     //     hour: '2-digit',
//     //     minute: '2-digit',
//     //     second: '2-digit',
//     //   });

//     //   setComments([
//     //     {
//     //       id: String(result.comment_id),
//     //       task_id: currentTaskId,
//     //       user: currentUser.name || 'You',
//     //       text: newComment,
//     //       timestamp,
//     //       replies: [],
//     //       showReplyInput: false,
//     //       replyText: '',
//     //       status_name: 'Active',
//     //     },
//     //     ...comments,
//     //   ]);
//     //   setNewComment('');
//     //   showSuccess(result.message || 'Comment posted successfully');
//     //   navigate(-1);

//     //   // ✅ If user is Reviewer → clear all signoffs and save document again
//     //   if (currentUser.role === 'Reviewer') {
//     //     const editor = window.tinymce?.activeEditor;
//     //     if (editor) {
//     //       let content = editor.getContent();

//     //       // Remove all signature text spans
//     //       content = content.replace(/<span class="signoff-meta".*?<\/span>/g, '');

//     //       // Reset all signoff buttons (re-enable if you want fresh signing)
//     //       content = content.replace(/data-completed="true"/g, 'data-completed="false"');
//     //       content = content.replace(/disabled=""/g, '');

//     //       editor.setContent(content);

//     //       // Call your save document function
//     //       await handleEditSave();
//     //       console.log('✅ Reviewer comment posted: all signoffs cleared and document saved again');
//     //     }
//     //   }


//     // } catch (err: any) {
//     //   console.error('❌ Error posting comment:', err.message);
//     //   showError(err.message || 'Failed to post comment');
//     // } 
//   };

//   // reply to a comment
//   const handleReplySave = async (index: number) => {
//     const comment = comments[index];
//     if (!comment.replyText?.trim()) {
//       showError('Reply cannot be empty');
//       return;
//     }

//     const projectTaskCommentsId = Number(comment.id);
//     if (isNaN(projectTaskCommentsId)) {
//       console.error('Invalid comment ID:', comment.id);
//       showError('Cannot post reply: Invalid comment ID');
//       return;
//     }

//     const repliedBy = Number(currentUser.id);
//     if (isNaN(repliedBy)) {
//       console.error('Invalid user ID:', currentUser.id);
//       showError('Cannot post reply: Invalid user ID');
//       return;
//     }

//     // try {
//     //   const replyData = {
//     //     project_task_comments_id: projectTaskCommentsId,
//     //     comment: comment.replyText,
//     //     replied_by: repliedBy,
//     //   };
//     //   console.log('Posting reply with data:', replyData);

//     //   const response = await fetch(Api_url.Task_Comments_reply, {
//     //     method: 'POST',
//     //     headers: {
//     //       'Content-Type': 'application/json',
//     //     },
//     //     body: JSON.stringify(replyData),
//     //   });

//     //   const result = await response.json();
//     //   console.log('Reply save response:', result);

//     //   if (!response.ok || result.status === 'error') {
//     //     throw new Error(result.message || `Failed to post reply: ${response.statusText}`);
//     //   }

//     //   const timestamp = new Date().toLocaleString('en-US', {
//     //     year: 'numeric',
//     //     month: 'short',
//     //     day: 'numeric',
//     //     hour: '2-digit',
//     //     minute: '2-digit',
//     //     second: '2-digit',
//     //   });

//     //   setComments((prev) => {
//     //     const updatedComments = [...prev];
//     //     updatedComments[index] = {
//     //       ...updatedComments[index],
//     //       replies: [
//     //         ...(updatedComments[index].replies || []),
//     //         {
//     //           reply_id: String(result.reply_id),
//     //           comment: comment.replyText,
//     //           replied_by: currentUser.name || 'You',
//     //           replied_date: timestamp,
//     //         },
//     //       ],
//     //       showReplyInput: false,
//     //       replyText: '',
//     //       status_name: 'Resolved',
//     //     };
//     //     return updatedComments;
//     //   });
//     //   showSuccess(result.message || 'Reply posted successfully');
//     // } catch (err: any) {
//     //   console.error('❌ Error posting reply:', err.message);
//     //   showError(err.message || 'Failed to post reply');
//     // } 
//   };

//   if (loading) {
//     return (
//       <div className="p-6 flex justify-center items-center">
//         {/* <MicroscopeLoader /> */}
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
//       <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
//         {isEditing && !isDocumentMode ? (
//           <>
//             <button
//               onClick={() => {
//                 handleEditSave();
//               }}
//               style={{
//                 padding: '0.5rem 1rem',
//                 backgroundColor: '#2563eb',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer',
//               }}
//             >
//               {isUpdate ? 'Update' : 'Save'}
//             </button>
//             <button
//               onClick={handleTaskSubmit}
//               style={{
//                 padding: '0.5rem 1rem',
//                 backgroundColor: '#00a917',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: submitLoading ? 'not-allowed' : 'pointer',
//                 opacity: submitLoading ? 0.6 : 1,
//               }}
//               disabled={submitLoading}
//             >
//               Submit
//             </button>
//             <button
//               onClick={() => navigate(-1)}
//               style={{
//                 padding: '0.5rem 1rem',
//                 backgroundColor: '#f0f0f0',
//                 border: '1px solid #ccc',
//                 borderRadius: '4px',
//                 cursor: 'pointer',
//               }}
//             >
//               Cancel
//             </button>
//           </>
//         ) : isDocumentMode ? (
//           <>
//             <button
//               onClick={handleTaskSubmit}
//               style={{
//                 padding: '0.5rem 1rem',
//                 backgroundColor: '#00a917',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: submitLoading ? 'not-allowed' : 'pointer',
//                 opacity: submitLoading ? 0.6 : 1,
//               }}
//               disabled={submitLoading}
//             >
//               Approve
//             </button>
//             <button
//               onClick={() => navigate(-1)}
//               style={{
//                 padding: '0.5rem 1rem',
//                 backgroundColor: '#f0f0f0',
//                 border: '1px solid #ccc',
//                 borderRadius: '4px',
//                 cursor: 'pointer',
//               }}
//             >
//               Cancel
//             </button>
//           </>
//         ) : (
//           <>
//             <button
//               onClick={handleTaskSubmit}
//               style={{
//                 padding: '0.5rem 1rem',
//                 backgroundColor: '#00a917',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: submitLoading ? 'not-allowed' : 'pointer',
//                 opacity: submitLoading ? 0.6 : 1,
//               }}
//               disabled={submitLoading}
//             >
//               Submit
//             </button>
//             <button
//               onClick={() => navigate(-1)}
//               style={{
//                 padding: '0.5rem 1rem',
//                 backgroundColor: '#f0f0f0',
//                 border: '1px solid #ccc',
//                 borderRadius: '4px',
//                 cursor: 'pointer',
//               }}
//             >
//               Cancel
//             </button>
//           </>
//         )}
//         {(canComment || canReply) && (
//           <button
//             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
//             style={{
//               padding: '0.5rem 1rem',
//               backgroundColor: isSidebarOpen ? '#0ea5e9' : '#f0f0f0',
//               color: isSidebarOpen ? '#ffffff' : '#1f2937',
//               border: isSidebarOpen ? '1px solid #0ea5e9' : '1px solid #ccc',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '0.5rem',
//               transition: 'all 0.2s ease',
//             }}
//             title="Comments"
//           >
//             <MessageSquare className="h-4 w-4" />
//           </button>
//         )}
//       </div>

//       {(canComment || canReply) && (
//         <div
//           style={{
//             position: 'fixed',
//             top: 0,
//             right: isSidebarOpen ? '0' : '-300px',
//             width: '300px',
//             height: '100%',
//             backgroundColor: '#fff',
//             boxShadow: '-2px 0 5px rgba(0,0,0,0.2)',
//             transition: 'right 0.3s ease-in-out',
//             zIndex: 1000,
//             padding: '1rem',
//             display: 'flex',
//             flexDirection: 'column',
//             gap: '1rem',
//           }}
//         >
//           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//             <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', margin: 0 }}>Comments</h3>
//             <button
//               onClick={() => setIsSidebarOpen(false)}
//               style={{
//                 width: '28px',
//                 height: '28px',
//                 borderRadius: '9999px',
//                 border: '1px solid #555',
//                 color: '#555',
//                 fontWeight: 'bold',
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center',
//                 backgroundColor: 'transparent',
//                 cursor: 'pointer',
//               }}
//               title="Close"
//               aria-label="Close"
//             >
//               ✕
//             </button>
//           </div>

//           <div
//             style={{
//               flex: 1,
//               overflowY: 'auto',
//               display: 'flex',
//               flexDirection: 'column',
//               gap: '0.5rem',
//             }}
//           >
//             {comments.length === 0 ? (
//               <p style={{ color: '#666', fontStyle: 'italic' }}>No comments available</p>
//             ) : (
//               comments.map((comment, index) => (
//                 <div
//                   key={comment.id}
//                   style={{
//                     backgroundColor: '#f5f5f5',
//                     padding: '0.5rem 1rem',
//                     borderRadius: '4px',
//                     borderLeft: '4px solid #4289f4',
//                     marginBottom: '0.5rem',
//                     display: 'flex',
//                     alignItems: 'flex-start',
//                     gap: '0.75rem',
//                     flexDirection: 'column',
//                     position: 'relative',
//                     transition: 'background-color 0.2s ease',
//                   }}
//                   onMouseEnter={(e) => {
//                     e.currentTarget.style.backgroundColor = '#e0e0e0';
//                   }}
//                   onMouseLeave={(e) => {
//                     e.currentTarget.style.backgroundColor = '#f5f5f5';
//                   }}
//                 >
//                   <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
//                     <div style={{ flex: 1 }}>
//                       <p style={{ fontSize: '0.9rem', fontWeight: 'bold', margin: 0 }}>
//                         {comment.user} (Task {comment.task_id})
//                       </p>
//                       <p style={{ fontSize: '0.9rem', margin: '0.25rem 0 0 0' }}>{comment.text}</p>
//                       <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.25rem' }}>
//                         {comment.timestamp}
//                       </p>
//                       {canReply && (
//                         <>
//                           <button
//                             onClick={() => {
//                               setComments((prev) =>
//                                 prev.map((c, i) =>
//                                   i === index ? { ...c, showReplyInput: !c.showReplyInput } : { ...c, showReplyInput: false }
//                                 )
//                               );
//                             }}
//                             style={{
//                               marginTop: '0.25rem',
//                               fontSize: '0.75rem',
//                               color: '#4285f4',
//                               background: 'none',
//                               border: 'none',
//                               cursor: 'pointer',
//                               transition: 'background-color 0.2s ease',
//                             }}
//                             onMouseEnter={(e) => {
//                               e.currentTarget.style.backgroundColor = '#e3f2fd';
//                             }}
//                             onMouseLeave={(e) => {
//                               e.currentTarget.style.backgroundColor = 'transparent';
//                             }}
//                           >
//                             {comment.showReplyInput ? 'Cancel' : 'Reply'}
//                           </button>
//                           {comment.showReplyInput && (
//                             <div
//                               style={{
//                                 marginTop: '0.5rem',
//                                 backgroundColor: '#fff',
//                                 padding: '0.25rem',
//                                 borderRadius: '4px',
//                                 border: '1px solid #ccc',
//                                 transition: 'background-color 0.2s ease',
//                               }}
//                               onMouseEnter={(e) => {
//                                 e.currentTarget.style.backgroundColor = '#f5f5f5';
//                               }}
//                               onMouseLeave={(e) => {
//                                 e.currentTarget.style.backgroundColor = '#fff';
//                               }}
//                             >
//                               <textarea
//                                 value={comment.replyText || ''}
//                                 onChange={(e) => {
//                                   setComments((prev) =>
//                                     prev.map((c, i) => (i === index ? { ...c, replyText: e.target.value } : c))
//                                   );
//                                 }}
//                                 placeholder="Add a reply..."
//                                 style={{
//                                   width: '100%',
//                                   minHeight: '60px',
//                                   padding: '0.25rem',
//                                   border: '1px solid #ccc',
//                                   borderRadius: '4px',
//                                   marginBottom: '0.25rem',
//                                 }}
//                               />
//                               <button
//                                 onClick={() => handleReplySave(index)}
//                                 style={{
//                                   marginTop: '0.25rem',
//                                   padding: '0.25rem 0.5rem',
//                                   backgroundColor: '#4285f4',
//                                   color: 'white',
//                                   border: 'none',
//                                   borderRadius: '4px',
//                                   cursor: 'pointer',
//                                   transition: 'background-color 0.2s ease',
//                                 }}
//                                 onMouseEnter={(e) => {
//                                   e.currentTarget.style.backgroundColor = '#3267d6';
//                                 }}
//                                 onMouseLeave={(e) => {
//                                   e.currentTarget.style.backgroundColor = '#4285f4';
//                                 }}
//                               >
//                                 Send
//                               </button>
//                             </div>
//                           )}
//                         </>
//                       )}
//                       {comment.replies && comment.replies.length > 0 && (
//                         <div style={{ marginTop: '0.5rem', paddingLeft: '1rem' }}>
//                           {comment.replies.map((reply) => (
//                             <div
//                               key={reply.reply_id}
//                               style={{
//                                 borderBottom: '1px solid #eee',
//                                 padding: '0.25rem 0',
//                                 transition: 'background-color 0.2s ease',
//                               }}
//                               onMouseEnter={(e) => {
//                                 e.currentTarget.style.backgroundColor = '#e0e0e0';
//                               }}
//                               onMouseLeave={(e) => {
//                                 e.currentTarget.style.backgroundColor = 'transparent';
//                               }}
//                             >
//                               <div
//                                 style={{ fontSize: '0.8rem' }}>{reply.replied_by}</div>
//                               <p style={{ fontSize: '0.8rem', margin: 0 }}>{reply.comment}</p>
//                               <p style={{ fontSize: '0.7rem', color: '#666', marginTop: '0.1rem' }}>
//                                 {reply.replied_date}
//                               </p>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>

//           {canComment && (
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
//               <textarea
//                 value={newComment}
//                 onChange={(e) => setNewComment(e.target.value)}
//                 placeholder="Add a comment..."
//                 style={{
//                   width: '100%',
//                   minHeight: '80px',
//                   padding: '0.5rem',
//                   border: '1px solid #ccc',
//                   borderRadius: '4px',
//                   resize: 'vertical',
//                 }}
//               />
//               <button
//                 onClick={handleCommentSave}
//                 style={{
//                   padding: '0.5rem 1rem',
//                   backgroundColor: '#2563eb',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '4px',
//                   cursor: 'pointer',
//                 }}
//               >
//                 Save
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       <div className="text-area">
//         <textarea id={editorId}></textarea>
//       </div>

//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//     </div>
//   );
// };

// export default ProjectTaskEditor;



import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { htmlWithPermissions } from '../../../../../public/htmlWithPermissions';
import { mdToHtml } from '../../../../../public/mdtohtml';
import { Api_url } from '../../../../networkCalls/Apiurls';
import { showError } from '../../../../services/toasterService';
import { ToastContainer } from 'react-toastify';

interface FormElementState {
  radio: { [key: string]: string };
  select: { [key: string]: string };
  checkbox: Record<string, string>;
  reasons: Record<string, string>;
  [key: string]: any;
  initials?: Record<string, string>;
}

const useTableEvents = (
  editorRef: React.MutableRefObject<any>,
  wsRef: React.MutableRefObject<WebSocket | null>,
  currentUser: { id: string; name: string },
  contentRef: React.MutableRefObject<string>,
  setContent: React.Dispatch<React.SetStateAction<string>>,
  formStateRef: React.MutableRefObject<FormElementState>,
  hasInitialized: React.MutableRefObject<boolean>
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
    const radiorows = iframeDoc.querySelectorAll('tbody tr');
    radiorows.forEach((row, rowIndex) => {
      const passFailName = `pf-result-${rowIndex}`;
      const passFailChecked = row.querySelector(
        `input[type="radio"][name="${passFailName}"]:checked`
      ) as HTMLInputElement | null;
      if (passFailChecked) {
        formState.radio[passFailName] = passFailChecked.value;
      }
      const yesNoName = `ar-yesno-${rowIndex}`;
      const yesNoChecked = row.querySelector(
        `input[type="radio"][name="${yesNoName}"]:checked`
      ) as HTMLInputElement | null;
      if (yesNoChecked) {
        formState.radio[yesNoName] = yesNoChecked.value;
      }
    });
    const selects = iframeDoc.querySelectorAll('select');
    selects.forEach((select: HTMLSelectElement) => {
      const key = select.name || select.getAttribute('data-select-key') || '';
      if (key) {
        formState.select[key] = select.value;
      }
    });
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
    const reasons = iframeDoc.querySelectorAll('div[data-reason-name]');
    reasons.forEach((div: HTMLElement) => {
      const key = div.dataset.reasonName || '';
      if (key) formState.reasons[key] = div.textContent || '';
    });
    return formState;
  }, [editorRef]);

  const restoreFormState = useCallback((formState: FormElementState) => {
    const iframeDoc = editorRef.current?.iframeElement?.contentDocument;
    if (!iframeDoc) {
      console.warn('Iframe document not available for restoring form state');
      return;
    }
    Object.entries(formState.radio || {}).forEach(([name, value]) => {
      const selected = iframeDoc.querySelector(
        `input[type="radio"][name="${name}"][value="${value}"]`
      ) as HTMLInputElement | null;
      if (selected) {
        selected.checked = true;
        selected.setAttribute('checked', 'checked');
      }
      iframeDoc.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((r: HTMLInputElement) => {
        if (r.value !== value) {
          r.checked = false;
          r.removeAttribute('checked');
        }
      });
    });
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
    Object.entries(formState.checkbox || {}).forEach(([name, isChecked]) => {
      const checkbox = iframeDoc.querySelector(`input[type="checkbox"][name="${name}"]`) as HTMLInputElement | null;
      if (checkbox) {
        const checked = isChecked === 'checked';
        checkbox.checked = checked;
        if (checked) checkbox.setAttribute('checked', 'checked');
        else checkbox.removeAttribute('checked');
      }
    });
    const rows = iframeDoc.querySelectorAll('tbody tr');
    rows.forEach((row, rowIndex) => {
      const table = iframeDoc.querySelector('table');
      const headerCells = Array.from(table?.querySelectorAll('thead th') || []);
      const evidenceIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase() === 'evidence');
      const initialDateIndex = headerCells.findIndex(th => th.textContent?.trim().toLowerCase().includes('initial/date'));
      if (initialDateIndex !== -1 && formState[`initial-file-${rowIndex}`]) {
        const cell = row.querySelectorAll('td')[initialDateIndex];
        cell.innerHTML += `<div class="uploaded-file"><a href="/Uploads/${formState[`initial-file-${rowIndex}`]}" target="_blank">${formState[`initial-file-${rowIndex}`]}</a></div>`;
      }
      if (evidenceIndex !== -1 && formState[`evidence-${rowIndex}`]) {
        const cell = row.querySelectorAll('td')[evidenceIndex];
        cell.innerHTML += `<div class="uploaded-file"><a href="/Uploads/${formState[`evidence-${rowIndex}`]}" target="_blank">${formState[`evidence-${rowIndex}`]}</a></div>`;
      }
    });
    Object.entries(formState.reasons || {}).forEach(([name, value]) => {
      const div = iframeDoc.querySelector(`div[data-reason-name="${name}"]`) as HTMLElement | null;
      if (div) div.textContent = value;
    });
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
      iframeDoc.querySelectorAll(`input[type="radio"][name="${radioName}"]`).forEach((radio: HTMLInputElement) => {
        radio.checked = radio.value === target.value;
        if (radio.checked) radio.setAttribute('checked', 'checked');
        else radio.removeAttribute('checked');
      });
      if (radioName.startsWith('ar-yesno-')) {
        const reasonDiv = currentRow.querySelector<HTMLDivElement>(`div[data-reason-name="reason-${rowIndex}"]`);
        if (reasonDiv) {
          if (target.value === 'no') {
            reasonDiv.style.display = 'block';
            reasonDiv.setAttribute('contenteditable', 'true');
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
      const updatedContent = editor.getContent({ format: 'raw' });
      const formState = captureFormState();
      const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);
      triggerWebSocketUpdate(permissionedContent, formState);
      editor.setContent(permissionedContent);
      attachTableListeners();
    }, 0);
  }, [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]);

  const handleDropdownChange = useCallback((e: Event) => {
    const target = e.target as HTMLSelectElement;
    if (target.tagName !== 'SELECT') return;
    setTimeout(() => {
      const editor = editorRef.current;
      if (!editor) return;
      const iframeDoc = editor.iframeElement?.contentDocument;
      if (!iframeDoc) return;
      target.setAttribute('data-selected-user', target.value);
      const updatedContent = editor.getContent({ format: 'raw' });
      const formState = captureFormState();
      const permissionedContent = htmlWithPermissions(updatedContent, currentUser.id, formState);
      triggerWebSocketUpdate(permissionedContent, formState);
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
      attachTableListeners();
    }, 0);
  }, [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]);

  const attachTableListeners = useCallback(() => {
    const iframeDoc = editorRef.current?.iframeElement?.contentDocument;
    if (!iframeDoc) return;
    iframeDoc.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.removeEventListener('change', handleRadioChange);
      radio.addEventListener('change', handleRadioChange);
    });
    iframeDoc.querySelectorAll('select').forEach((select) => {
      select.removeEventListener('change', handleDropdownChange);
      select.addEventListener('change', handleDropdownChange);
    });
    iframeDoc.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
      checkbox.removeEventListener('change', handleCheckboxChange);
      checkbox.addEventListener('change', handleCheckboxChange);
    });
  }, [handleRadioChange, handleDropdownChange, handleCheckboxChange]);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;
    const handleWSMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'content_update' && data.client_id !== String(currentUser.id)) {
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

  return { captureFormState, restoreFormState, attachTableListeners };
};

const ProjectTaskEditor: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { taskName, taskId } = state || {};
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    role: string;
  }>({
    id: '',
    name: '',
    role: '',
  });
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isDocumentMode, setIsDocumentMode] = useState<boolean>(false);
  const wsRef = useRef<WebSocket | null>(null);
  const editorId = 'tiny-editor';
  const editorRef = useRef<any>(null);
  const contentRef = useRef<string>('');
  const formStateRef = useRef<FormElementState>({ radio: {}, select: {}, checkbox: {}, reasons: {} });
  const hasInitialized = useRef(false);

  const { captureFormState, restoreFormState, attachTableListeners } = useTableEvents(
    editorRef,
    wsRef,
    currentUser,
    contentRef,
    setContent,
    formStateRef,
    hasInitialized
  );

  useEffect(() => {
    const curUserString = localStorage.getItem('currentUser');
    const parsedUser = curUserString ? JSON.parse(curUserString) : null;
    if (parsedUser?.id) {
      setCurrentUser({
        id: parsedUser.id,
        name: parsedUser.name || '',
        role: parsedUser.role || '',
      });
    }
    const fetchDocument = async () => {
      setLoading(true);
      try {
        const response = await fetch(Api_url.get_task_document(taskId));
        if (!response.ok) throw new Error("Failed to fetch document");
        const data = await response.json();
        const fileFlag: number = data.file_flag;
        let documentContent: string = data.document || "";
        if (!documentContent) {
          showError("No document content available");
          documentContent = "<p>Default content: Unable to load document</p>";
        }
        let htmlContent: string;
        if (fileFlag === 1) {
          const rawHtml = mdToHtml(documentContent);
          htmlContent = htmlWithPermissions(rawHtml, currentUser.id, formStateRef.current);
        } else {
          htmlContent = htmlWithPermissions(documentContent, currentUser.id, formStateRef.current);
        }
        const states = {
          draft: { isEditing: true, isDocumentMode: false },
          review: { isEditing: false, isDocumentMode: false },
          default: { isEditing: false, isDocumentMode: true },
        };
        const { isEditing, isDocumentMode } = states[taskName?.toLowerCase() as keyof typeof states] || states.default;
        setIsEditing(isEditing);
        setIsDocumentMode(isDocumentMode);
        if (isDocumentMode && htmlContent) {
          htmlContent = convertSelectsToSpans(htmlContent);
        }
        setContent(htmlContent);
        contentRef.current = htmlContent;
        formStateRef.current = formStateRef.current || {};
      } catch (err: any) {
        showError(err.message || "Failed to load document");
        const fallback = "<p>Failed to load document</p>";
        setContent(fallback);
        contentRef.current = fallback;
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [taskId, taskName]);

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
      const wsUrl = `ws://127.0.0.1:8090/api/ws/${taskId}`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;
      ws.onopen = () => {
        console.log('WebSocket connected for task:', taskId);
        const initialContent = contentRef.current || '';
        let initialBookmark = null;
        if (editorRef.current && editorRef.current.selection) {
          try {
            initialBookmark = editorRef.current.selection.getBookmark(2, true);
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
          if (message.type === 'content_update' && message.content) {
            if (!editorRef.current) {
              console.warn('Editor not fully ready, skipping message');
              return;
            }
            const markdownContent = message.content;
            const editor = editorRef.current;
            const currentContent = editor.getContent({ format: 'raw' });
            if (currentContent !== markdownContent) {
              let bookmark = null;
              try {
                bookmark = editor.selection.getBookmark(2, true);
              } catch (err) {
                console.warn('Failed to get bookmark:', err);
              }
              const htmlContent = htmlWithPermissions(markdownContent, currentUser.id, message.formState);
              editor.setContent(htmlContent);
              attachTableListeners();
              if (message.formState) {
                restoreFormState(message.formState);
                formStateRef.current = message.formState;
              }
              if (bookmark) {
                try {
                  editor.selection.moveToBookmark(bookmark);
                } catch (err) {
                  console.warn('Failed to restore bookmark:', err);
                }
              }
              contentRef.current = markdownContent;
              setContent(markdownContent);
            }
          }
        } catch (err) {
          console.error('Invalid WebSocket message:', event.data, err);
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

    const initEditor = (markdownContent: string, readOnly: boolean, taskId: string) => {
      if (!window.tinymce) {
        console.error('TinyMCE not loaded');
        showError('Editor not available');
        return;
      }
      const htmlContent = htmlWithPermissions(markdownContent, currentUser.id, formStateRef.current);
      window.tinymce.init({
        selector: `#${editorId}`,
        height: 600,
        inline: false,
        menubar: !readOnly,
        plugins: 'table lists advlist code image emoticons charmap insertdatetime media preview quickbars searchreplace form',
        toolbar: readOnly
          ? ''
          : 'undo redo | styleselect | bold italic | forecolor backcolor | alignleft aligncenter alignright | bullist numlist | table | print emoticons charmap insertdatetime image media preview searchreplace | checkboxBtn radioBtn dropdownBtn',
        readonly: readOnly,
        menu: {
          insert: { title: 'Insert', items: 'checkbox radio select' }
        },
        extended_valid_elements: 'input[type|name|value|checked|disabled],select[name],option[value|selected]',
        setup: (editor) => {
          editorRef.current = editor;
          editor.ui.registry.addButton('checkboxBtn', {
            text: 'Checkbox',
            onAction: function () {
              editor.insertContent('<input type="checkbox" name="chk1" />');
            }
          });
          editor.ui.registry.addButton('radioBtn', {
            text: 'Radio',
            onAction: function () {
              editor.insertContent('<input type="radio" name="radioGroup" value="option1" />');
            }
          });
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
            editor.setContent(htmlContent || '<p>No content available</p>');
            contentRef.current = markdownContent;
            setContent(markdownContent);
            restoreFormState(formStateRef.current);
            hasInitialized.current = true;
            attachTableListeners();
          });
        },
      });
    };

    const init = async () => {
      try {
        await loadTinyMCEScript();
        connectWebSocket(taskId);
        initEditor(contentRef.current, isDocumentMode || !isEditing, taskId);
      } catch (err) {
        console.error('Editor init failed:', err);
      }
    };
    init();
    return () => {
      if (editorRef.current) {
        editorRef.current.remove();
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentUser.id, taskId, isEditing, isDocumentMode]);

  const convertSelectsToSpans = (htmlContent: string): string => {
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
    return doc.body.innerHTML;
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <button
          onClick={() => navigate(-1)}
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
      </div>
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
  );
};

export default ProjectTaskEditor;
