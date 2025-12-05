import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Api_url } from '../../networkCalls/Apiurls';
import { FileText, CheckCircle, Clock, Search, Filter, User, MessageSquare, FileEdit } from 'lucide-react';
import { showError, showSuccess, showWarn } from '../../services/toasterService';
import { ToastContainer } from 'react-toastify';
import { mdToHtml } from '../../../public/mdtohtml';
import { htmlWithPermissions } from '../../../public/htmlWithPermissions';
import Cropper from 'react-easy-crop'; // version 2 of snip
import RingGradientLoader from '../../components/RingGradientLoader';
import { canEditDocument, canSaveDocument, canSubmitDocument, canCommentOnDocument, canRevertTask } from '../../services/permissionsService';
import { createRoot } from 'react-dom/client';
import { getRequestStatus, postRequestStatus } from '../../networkCalls/NetworkCalls';
import RenderUiTemplate from '../../../public/RenderUi_Template';
import DecodedTokenValues from '../../components/DecryptToken';

interface FormElementState {
    radio: { [key: string]: string }; // Maps radio group name to selected value
    select: { [key: string]: string }; // Maps select element identifier to selected value
    checkbox: Record<string, string>; // Maps checkbox name to checked state
    reasons: Record<string, string>; // Maps reason name to text content
    [key: string]: any; // For file inputs
    initials?: Record<string, string>;   // <-- optional, may be empty if not captured
    statuses?: Record<string, string>;   // For pass/fail overrides
    comments?: Record<string, string>;   // For failure comments
    failureDetails?: Record<string, any>; // For system failures
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
    onSystemFailureExit?: () => void,  // e.g., () => navigate('/tasks')
    currentTaskId?: string,  // For sign-off handlers
    projectId?: number
) => {
        const [assignedUsers, setAssignedUsers] = useState<any[]>([]);

    // 1. Pure utils first (no deps on handlers)
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
            client_id: String(currentUser.id),
            username: currentUser.name,
            cursor: bookmark,
            formState,
        };

        try {
            wsRef.current.send(JSON.stringify(message));
            console.log('WebSocket message sent:', { content: updatedContent.substring(0, 100) + '...', formState });
            contentRef.current = updatedContent;
            // setContent(updatedContent);
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
        radiorows.forEach((row:any, rowIndex:any) => {
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
        rows.forEach((row:any, rowIndex:any) => {
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
        rows.forEach((row:any, rowIndex:any) => {
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


    // 2. Define handlers NEXT (call attach inside body, no dep on it)
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


    const handleSignOffClick = useCallback(
        (e: Event, taskId: string, projectId: number) => {
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



                if (passFail.value.toLowerCase() === "fail") {
                    (async () => {
                        try {

                            // ✅ Use Api_url and getRequestStatus to get project details
                            const userDataResponse = await getRequestStatus<any>(
                                Api_url.getUserDetailsAssignedToUserId(projectId)
                            );
                            console.log("api response for editor userdetails:", userDataResponse)
                             const assignedUsers = userDataResponse?.data?.data ?? [];
            if (!assignedUsers.length) {
                showError("Failed to load assigned users.");
                return;
            }
                           

                            const response = await getRequestStatus<any>(
                                Api_url.getAllTemplates(4) //4 for type deviation form 
                            );

                            const templatesArray = response?.data?.data;
                            if (templatesArray) {
                                const template = templatesArray;
                                const jsonTemplate = template.json_template;
                                const filteredUsers =
                jsonTemplate.requiredRoles?.length
                    ? assignedUsers.filter((u: any) =>
                          jsonTemplate.requiredRoles.includes(u.role)
                      )
                    : assignedUsers;
console.log("Filtered Users:", filteredUsers);
                            console.log("Template JSON:", jsonTemplate);

                                // Dispatch event to trigger modal in parent
                               window.dispatchEvent(
    new CustomEvent("showFailureForm", {
        detail: {
            template: jsonTemplate,
            assignedUsers: filteredUsers
        }
    })
);

                            } else {
                                showError("No failure template found");
                            }
                        } catch (err) {
                            console.error("Failed to fetch template:", err);
                            showError("Failed to load failure form template.");
                        }
                    })();
                    return;
                }
                else {
                    row.setAttribute("data-signed", "true");
                    proceedWithSignOff(target, title, String(rowIndex), row, taskId);

                }
            }

            // Normal signoff
            // proceedWithSignOff(target, title, String(rowIndex), row, taskId);
        },
        [editorRef, triggerWebSocketUpdate, captureFormState, currentUser]
    );


    const proceedWithSignOff = async (
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
        setTimeout(async () => {
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

            const response = await postRequestStatus<any>(Api_url.save_task_documnet, JSON.stringify(replyData))

            if (response.status === 200) {
                showSuccess(
                    currentUser.role === "Executor"
                        ? (systemFailure
                            ? "System issue saved. Awaiting resolution."
                            : "Test case submitted successfully.")
                        : "Sign Off completed, you can submit the document."
                );
            } else {
                showError(`Error: ${response.data.message || "Unknown error"}`);
            }
        }, 0);
    };

    // define attach functions (deps can reference handlers)
    const attachTableListeners = useCallback(() => {
        const iframeDoc = editorRef.current?.iframeElement?.contentDocument;
        if (!iframeDoc) return;

        // Attach radio changes
        iframeDoc.querySelectorAll('input[type="radio"]').forEach((radio:any) => {
            radio.removeEventListener('change', handleRadioChange); // Prevent duplicates
            radio.addEventListener('change', handleRadioChange);
        });

        // Attach dropdown changes
        iframeDoc.querySelectorAll('select').forEach((select:any) => {
            select.removeEventListener('change', handleDropdownChange);
            select.addEventListener('change', handleDropdownChange);
        });

        // Attach signoff button clicks
        iframeDoc.querySelectorAll(".signoff-btn").forEach((btn:any) => {
            btn.removeEventListener("click", handleSignOffClick as EventListener);
            btn.addEventListener("click", (e) => handleSignOffClick(e, String(currentTaskId), projectId!));
        });

        // Attach checkbox changes
        iframeDoc.querySelectorAll('input[type="checkbox"]').forEach((checkbox:any) => {
            checkbox.removeEventListener('change', handleCheckboxChange);
            checkbox.addEventListener('change', handleCheckboxChange);
        });



        // Attach file changes (critical for handleFileChange to trigger)
        const fileInputs = iframeDoc.querySelectorAll('input[type="file"]') as NodeListOf<HTMLInputElement>;
        console.log('Attaching listeners to', fileInputs.length, 'file inputs:', Array.from(fileInputs).map(i => i.name)); // Debug
        fileInputs.forEach((input: HTMLInputElement) => {
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

    // Other helpers
    const convertSelectsToSpans = useCallback((htmlContent: string): string => {
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
    }, []);

    const makePartialReadOnly = useCallback(() => {
        const iframe = document.querySelector('iframe');
        if (!iframe) return;
        const iframeDoc = iframe.contentDocument || (iframe as any).contentWindow?.document;
        if (!iframeDoc?.body) return;

        const nonInteractive = iframeDoc.body.querySelectorAll(':not(select):not(img):not(a.image-link):not(input[type="radio"])');
        nonInteractive.forEach((el: HTMLElement) => {
            if (['SELECT', 'IMG', 'A', 'INPUT'].includes(el.tagName)) return;
            el.setAttribute('contenteditable', 'false');
            el.style.backgroundColor = '#f5f5f5';
            el.style.pointerEvents = 'none';
        });

        // Enable interactive elements
        iframeDoc.body.querySelectorAll('select, input[type="radio"], a.image-link').forEach((el: HTMLElement) => {
            el.removeAttribute('contenteditable');
            el.style.pointerEvents = 'auto';
            if (el.tagName === 'SELECT' || el.tagName === 'INPUT') (el as any).disabled = false;
        });
    }, []);

    const getUserColor = useCallback((clientId: string): string => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD', '#D4A5A5', '#9B59B6'];
        const hash = clientId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    }, []);

    // WS effect (re-attach after updates)

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

    return {
        captureFormState,
        restoreFormState,
        attachTableListeners,
        attachSignOffListeners,
        handleRadioChange,
        handleDropdownChange,
        handleCheckboxChange,
        handleSignOffClick,
        proceedWithSignOff,
        convertSelectsToSpans,
        makePartialReadOnly,
        getUserColor,
        triggerWebSocketUpdate,  // Export if needed elsewhere
    };
};

interface ProjectTaskEditorProps {
    taskId?: string;
    projectId?: number;
    taskName?: string;
    ref?: React.Ref<any>;
    initialCommentId?: number;
    task_order_id: number;
    onCommentSaved?: () => void;
    editdocument: boolean;
}

export interface EditorImperativeHandle {
    highlightComment: (commentId: string | number) => void;
    // resolveComment: (commentId: number, userId: number) => Promise<void>;
    // replyToComment: (commentId: number, replyText: string) => Promise<void>;
    // Add more methods for "all conditions" as needed, e.g., focusOnSection(sectionId: string)
}

const ProjectTaskEditor: React.FC<ProjectTaskEditorProps> = forwardRef<EditorImperativeHandle, ProjectTaskEditorProps>(
    ({ taskId: propTaskId, projectId: propProjectId, taskName: propTaskName, initialCommentId, task_order_id, onCommentSaved, editdocument }, ref) => {
        const { state } = useLocation();
        const projectId = propProjectId || state?.projectId;
        console.log("📌 Editor projectId:", projectId);

        const navigate = useNavigate();
        // Use prop first, fallback to router state
        const taskId = propTaskId || state?.taskId;
        const caneditdoc = state?.editdocument || false;
        const taskName = propTaskName || state?.taskName;
        const p_task_order_id = state?.task_order_id
        const [currentUser, setCurrentUser] = useState<{ id: string | null; name: string | null; email: string | null; role: string | null; roleId: number } | null>(null);
        const [loading, setLoading] = useState(true);
        const [content, setContent] = useState<string>('');
        const [isEditing, setIsEditing] = useState<boolean>(false);
        const [isDocumentMode, setIsDocumentMode] = useState<boolean>(false);
        const [isUpdate, setIsUpdate] = useState<boolean>(false);
        const [submitLoading, setSubmitLoading] = useState<boolean>(false);
        const currentTaskId = taskId; // From params
        const wsRef = useRef<WebSocket | null>(null);
        const editorId = `tiny-editor-${taskId}`; // Unique per task
        const editorRef = useRef<any>(null);
        const contentRef = useRef<string>('');
        const formStateRef = useRef<FormElementState>({ radio: {}, select: {}, checkbox: {}, reasons: {} });
        const hasInitialized = useRef<boolean>(false);
        const fileInputMapRef = useRef<Map<HTMLInputElement, string[]>>(new Map());
        const editdocument1 = state.editdocument
        console.log(canSaveDocument(), canSubmitDocument(), canRevertTask(), 'canSaveDocument(),canSubmitDocument(),canRevertTask()')
        const { captureFormState, restoreFormState, attachTableListeners, attachSignOffListeners, handleSignOffClick, proceedWithSignOff, handleDropdownChange, triggerWebSocketUpdate, handleRadioChange, handleCheckboxChange } = useTableEvents(
            editorRef,
            wsRef,
            currentUser!,
            contentRef,
            setContent,
            formStateRef,
            hasInitialized,
            () => { /* Handle system failure exit, e.g., navigate('/tasks') */ },
            currentTaskId,
            projectId
        );
        const [formSchema, setFormSchema] = useState<any>(null);
        const [showFailureForm, setShowFailureForm] = useState(false);

        const fetchDocument = useCallback(async () => {
            setLoading(true);
            let storedUser = localStorage.getItem('USER_ID');
            try {
                // const response = await fetch(Api_url.pro_Get_document_by_taskid(Number(taskId)), {
                //     headers: { 'Content-Type': 'application/json' },
                // });
                const response = await getRequestStatus<any>(
                    Api_url.pro_Get_document_by_taskid(Number(taskId))
                );
                // if (!response.ok) throw new Error(`Failed to fetch document: ${response.statusText}`);
                // const data = await response.json();
                const fileFlag: number = response.data.data.file_flag;
                let documentContent: string = response.data.data.task_document || "";
                if (!documentContent) {
                    // showError("No document content available");
                    showWarn("You dont have a verified document , Proceed with your content.", { autoClose: 3000 });

                    documentContent = "<p>Proceed with your Content.</p>";
                }
                let htmlContent: string;
                if (fileFlag === 1) {
                    const rawHtml = mdToHtml(documentContent);
                    console.log("html raw data", rawHtml)
                    htmlContent = htmlWithPermissions(rawHtml, storedUser, formStateRef.current);
                } else {
                    htmlContent = htmlWithPermissions(documentContent, storedUser, formStateRef.current);
                }

                // Determine modes based on taskName/role
                const states = {
                    draft: { isEditing: true, isDocumentMode: false },
                    review: { isEditing: true, isDocumentMode: false },
                    default: { isEditing: true, isDocumentMode: true },
                };
                const { isEditing, isDocumentMode } = editdocument ? false : states[taskName?.toLowerCase() as keyof typeof states] || states.default;
                setIsEditing(isEditing);
                setIsDocumentMode(isDocumentMode);
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
        }, [taskId, formStateRef]);

        useEffect(() => {
            const handleShowFailureForm = (event: any) => {
                setFormSchema(event.detail);
                setShowFailureForm(true);
            };

            window.addEventListener("showFailureForm", handleShowFailureForm);
            return () => window.removeEventListener("showFailureForm", handleShowFailureForm);
        }, []);

        useEffect(() => {
            // alert('ProjectTaskEditor loaded');
            const storedUser = localStorage.getItem('USER_ID');
            const userrole = Number(localStorage.getItem('ROLE_ID'));
            // const curuser = localStorage.getItem('currentUser')
            // const parsedUser = curuser ? JSON.parse(curuser) : null;
            const curuser = DecodedTokenValues();

            setCurrentUser({
                id: storedUser,
                name: curuser.user_name,
                email: curuser.user_email,
                role: curuser.user_role_name,
                // role: userrole == 1 ? "Admin" : userrole == 2 ? "Validator" : userrole == 3 ? "Viewer" : userrole == 4 ? "Manager" : userrole == 5 ? "General Manager" : userrole == 6 ? "Author" : userrole == 7 ? "Reviewer" : userrole == 8 ? "Executor" : "Sign off",
                roleId: userrole,
            });
        }, []);

        // Fetch document directly by taskId
        useEffect(() => {
            if (!taskId) {
                showError('Invalid task or user data');
                setLoading(false);
                return;
            }
            fetchDocument();
        }, [currentUser, taskId]);

        // WebSocket and Editor Init (adapted from your single component, with full hooks)
        useEffect(() => {
            if (!currentUser || loading) return;

            const loadTinyMCEScript = () => {
                return new Promise((resolve, reject) => {
                    if (window.tinymce) {
                        console.log('TinyMCE already loaded');
                        resolve(null);
                        return;
                    }
                    const script = document.createElement('script');
                    const basePath = import.meta.env.VITE_BASE_PATH || '';
                    script.src = `${basePath}/tinymce/js/tinymce/tinymce.min.js`;
                    script.onload = () => {
                        console.log('TinyMCE script loaded successfully');
                        resolve(null);
                    };
                    script.onerror = () => {
                        console.error('Failed to load TinyMCE script');
                        // showError('Failed to load editor');
                        reject(new Error('TinyMCE script failed to load'));
                    };
                    document.body.appendChild(script);
                });
            };

            const connectWebSocket = (taskId: string) => {
                const wsUrl = `ws://127.0.0.1:8026/api/ws/${taskId}`;
                // const wsUrl = `ws://20.84.100.70/api/ws/${taskId}`;
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
                                attachSignOffListeners();
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
                                // setContent(markdownContent);
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
                    plugins: 'table lists advlist code image emoticons charmap insertdatetime media preview quickbars searchreplace form export',
                    // UPDATED: Add 'showComments' FIRST in the toolbar
                    toolbar: readOnly ? '' : 'undo redo styleselect bold italic fontsizeselect forecolor backcolor alignleft aligncenter alignright bullist numlist table print  exportpdf  emoticons charmap insertdatetime image preview searchreplace',
                    // checkboxBtn radioBtn dropdownBtn  // // if required add these buttons in the toolbar
                    readonly: readOnly,
                    menu: {
                        insert: {
                            title: 'Insert',
                            items: 'checkbox radio select'
                        }
                    },
                    extended_valid_elements: 'input[type|name|value|checked|disabled],select[name],option[value|selected]',
                    quickbars_selection_toolbar: readOnly
                        ? "comments"
                        : "bold italic underline quicklink h2 h3 forecolor backcolor comments",
                    // OPTIONAL: Add content_style for commented-text (as mentioned in previous response)
                    font_size_styles: '8px 10px 12px 14px 18px 24px 36px',
                    content_style: `
                        .commented-text {
                            background-color: #fcf1f1ff !important;
                            padding: 2px 4px;
                            border-radius: 13px;
                            position: relative;
                        }
                        .commented-text:hover {
                            background-color: #e0bb41ff !important;
                            border-left: 3px solid #e42424ff;
                            border-radius: 13px;
                            cursor: pointer;
                        }
                        .comment-highlight {
                            background-color: #fbff00ff !important; /* soft blue */
                            padding: 2px 4px !important;
                            border-radius: 13px !important;
                            box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);
                            animation:  warningBlink 1s ease-in-out infinite;;
                            }

                            @keyframes warningBlink {
                            0%, 100% {
                                background-color: #dfa952; /* warm amber */
                                box-shadow: 0 0 6px rgba(223, 169, 82, 0.8);
                            }
                            50% {
                                background-color: #ff5252; /* alert red in the middle */
                                box-shadow: 0 0 12px rgba(255, 82, 82, 0.9);
                            }
                            }
                    `,
                    setup: (editor: any) => {
                        editorRef.current = editor;

                        editor.on("OpenWindow", (e) => {
                            // Force dialog to NOT be readonly
                            const win = e.dialogApi?.getEl ? e.dialogApi.getEl() : document.querySelector(".tox-dialog");

                            setTimeout(() => {
                                if (!win) return;

                                // Enable ALL input elements
                                win.querySelectorAll("textarea, input, select").forEach((el) => {
                                    el.removeAttribute("disabled");
                                    el.classList.remove("tox-disabled");
                                });

                                // 🔥 Force-enable all buttons including "Add Comment"
                                win.querySelectorAll("button").forEach((btn) => {
                                    btn.removeAttribute("disabled");
                                    btn.classList.remove("tox-disabled");
                                });

                            }, 30);
                        });


                        // Your existing custom buttons (unchanged)
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

                        // Your existing comments button (updated to include comment_id in the span)
                        if (p_task_order_id !== 1) {
                            editor.ui.registry.addButton('comments', {
                                icon: 'comment',
                                tooltip: 'Add Comment',

                                onSetup: (api) => {
                                    // 🔥 Force-enable button even in readOnly mode
                                    api.setEnabled(true);

                                    const reEnable = () => api.setEnabled(true);
                                    editor.on('NodeChange', reEnable);
                                    editor.on('SelectionChange', reEnable);

                                    return () => {
                                        editor.off('NodeChange', reEnable);
                                        editor.off('SelectionChange', reEnable);
                                    };
                                },

                                onAction: () => {
                                    const selection = editor.selection.getContent();
                                    if (!selection) {
                                        showError("Please select text to comment on.");
                                        return;
                                    }

                                    editor.windowManager.open({
                                        title: "Add Comment",
                                        size: "medium",
                                        body: {
                                            type: "panel",
                                            items: [
                                                { type: "textarea", name: "comment", label: "Comment" }
                                            ]
                                        },
                                        buttons: [
                                            { type: "cancel", text: "Cancel" },
                                            { type: "submit", text: "Add Comment", primary: true }
                                        ],

                                        onSubmit: async (api) => {
                                            const commentText = api.getData().comment.trim();
                                            if (!commentText) {
                                                showError("Comment cannot be empty.");
                                                return;
                                            }

                                            const commentData = {
                                                project_task_id: Number(currentTaskId),
                                                description: commentText,
                                                commented_by: Number(currentUser.id),
                                                resolved: false,
                                                is_direct_comment: false
                                            };

                                            try {
                                                const result = await postRequestStatus(Api_url.Task_Comments, commentData);
                                                const commentId = result.data?.data?.comment_id;

                                                const wrappedContent = `
                                                    <span class="commented-text"
                                                        data-comment-id="${commentId}"
                                                        data-comment="${editor.dom.encode(commentText)}"
                                                        title="${editor.dom.encode(commentText)}"
                                                    >${selection}</span>
                                                `;

                                                editor.selection.setContent(wrappedContent);
                                                editor.fire("change");
                                                showSuccess("Comment added successfully.");
                                                handleEditSaveBg();
                                                onCommentSaved?.();
                                                api.close();

                                            } catch (err) {
                                                console.error("❌ Inline comment error:", err);
                                                showError(err.message || "Failed to post comment");
                                            }
                                        }
                                    });
                                }
                            });
                        }
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

                                    // console.log(currentTaskId, 'currentTaskId in handleLinkClick');
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

                                        handleSignOffClick({ currentTarget: btnEl } as unknown as Event, currentTaskId, projectId);
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
                                        handleSignOffClick(e, currentTaskId, projectId);
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
                                        // editorReady.current = true;
                                        hasInitialized.current = true; // ✅ allow change handlers to run
                                        console.log('Editor fully ready, processing pending messages...');
                                        // processPendingMessages();
                                    } else {
                                        console.warn('Editor selection not ready, retrying...');
                                        // setTimeout(processPendingMessages, 500);
                                    }
                                }, 500);

                            }
                        });

                        editor.on("input", () => {
                            const raw = editor.getContent({ format: "raw" });
                            const formState = captureFormState();
                            triggerWebSocketUpdate(raw, formState);
                        });
                        // 🔥 Real-time typing sync from ProjectTasks.tsx
                        editor.on('Change KeyUp', () => {
                            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                                const rawContent = editor.getContent({ format: 'raw' });

                                const formState = captureFormState();
                                const permissionedContent = htmlWithPermissions(rawContent, currentUser.id, formState);

                                triggerWebSocketUpdate(permissionedContent, formState);
                            }
                        });
                    },
                });
            };

            const init = async () => {
                try {
                    await loadTinyMCEScript();
                    connectWebSocket(taskId);
                    initEditor(content, p_task_order_id === 1 ? !caneditdoc : true, taskId);
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
        }, [currentUser, taskId, isEditing, isDocumentMode, captureFormState, restoreFormState, attachTableListeners, attachSignOffListeners]);

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

        const handleFileUpload = async (e: Event) => {
            const input = e.target as HTMLInputElement;
            const files = input?.files;
            if (!files || files.length === 0) return;

            const formData = new FormData();
            Array.from(files).forEach((file) => {
                formData.append('files', file);
            });

            try {
                const res = await fetch(Api_url.EvidenceUploadFromEditor, {
                    method: 'POST',
                    body: formData,
                });
                // const response = await postRequestStatus(Api_url.EvidenceUploadFromEditor, formData)


                const response = await res.json();
                // console.log('Upload Success:', result);

                if (Array.isArray(response.uploaded_files)) {
                    const prevFiles = fileInputMapRef.current.get(input) || [];
                    const updatedFiles = [...new Set([...prevFiles, ...response.uploaded_files])];
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
                        triggerWebSocketUpdate(permissionedHtml, formState);
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
                        // const res = await fetch(Api_url.EvidenceUploadFromEditor, {
                        //     method: "POST",
                        //     body: formData,
                        // });
                        const result = await postRequestStatus<any>(Api_url.EvidenceUploadFromEditor, formData)

                        // const result = await res.json();
                        // console.log('Snip upload result:', result);

                        if (Array.isArray(result.data.uploaded_files)) {
                            const prevFiles = fileInputMapRef.current.get(fileInput) || [];
                            const updatedFiles = [...new Set([...prevFiles, ...result.data.uploaded_files])];
                            fileInputMapRef.current.set(fileInput, updatedFiles);

                            renderFileNamesNearInput(fileInput, updatedFiles);

                            const editor = editorRef.current;
                            if (editor && editor.iframeElement?.contentDocument) {
                                const rawHtml = editor.iframeElement.contentDocument.body.innerHTML;
                                const permissionedHtml = htmlWithPermissions(rawHtml, currentUser.id, formStateRef.current);
                                editor.setContent(permissionedHtml);
                                const formState = captureFormState();
                                triggerWebSocketUpdate(permissionedHtml, formState);
                                contentRef.current = permissionedHtml;
                                formStateRef.current = formState;
                            }

                            const url = result.data.uploaded_files?.[0]?.url;
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
                triggerWebSocketUpdate(contentRef.current, formState);

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

        useEffect(() => {
            if (!editorRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
                console.warn("Editor/WebSocket not ready for real-time sync");
                return;
            }

            const editor = editorRef.current;
            const ws = wsRef.current;

            const sendUpdate = () => {
                let bookmark = null;
                try {
                    bookmark = editor.selection.getBookmark(2, true);
                } catch (err) {
                    console.warn("Bookmark capture failed:", err);
                }

                const formState = captureFormState();

                const message = {
                    type: "content_update",
                    content: editor.getContent({ format: "raw" }),
                    client_id: String(currentUser.id),
                    username: currentUser.name,
                    cursor: bookmark,
                    formState,
                };

                try {
                    ws.send(JSON.stringify(message));
                    console.log("Sent cursor + content update");
                } catch (e) {
                    console.error("WS send failed", e);
                }
            };

            editor.on("keyup", sendUpdate);
            editor.on("mouseup", sendUpdate);
            editor.on("SelectionChange", sendUpdate);

            // fire once on load
            sendUpdate();

            return () => {
                editor.off("keyup", sendUpdate);
                editor.off("mouseup", sendUpdate);
                editor.off("SelectionChange", sendUpdate);
            };
        }, [currentUser, captureFormState]);

        // method that highlight comment when clicked on any comment in the comments tab 
        useEffect(() => {
            if (initialCommentId) {
                let retries = 0;
                const maxRetries = 50;
                const interval = setInterval(() => {
                    const iframeDoc = editorRef.current?.iframeElement?.contentDocument;
                    const element = iframeDoc?.querySelector(`span[data-comment-id="${initialCommentId}"]`);
                    if (element || retries >= maxRetries) {
                        console.log('retry count for highlight:', retries);
                        clearInterval(interval);
                        if (element) highlightCommentFunc(initialCommentId);
                    }
                    retries++;
                }, 1000);

                return () => clearInterval(interval);
            }
        }, [initialCommentId, hasInitialized.current, editorRef.current]);

        const handleEditSaveBg = async () => {
            const editor = editorRef.current;
            if (editor) {
                const formState = captureFormState();
                const rawHtml = editor.getContent({ format: "raw" });
                const htmlContent = htmlWithPermissions(rawHtml, currentUser!.id, formState);
                // triggerWebSocketUpdate(htmlContent, formState); // Use your full trigger if needed
                console.log(htmlContent, 'html content with permissions');

                setContent(htmlContent);
                contentRef.current = htmlContent;
                formStateRef.current = formState;

                console.log('✅ Saved HTML:', htmlContent);

                const replyData = {
                    project_task_id: Number(currentTaskId),
                    document_json: htmlContent,
                    created_by: 1,
                };

                try {
                    // const response = await fetch(Api_url.save_task_documnet, {
                    //     method: 'POST',
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //     },
                    //     body: JSON.stringify(replyData),
                    // });

                    const response = await postRequestStatus<any>(Api_url.save_task_documnet, JSON.stringify(replyData))
                    console.log(response.data, 'data saved after inline comment')

                    // const result = await response.json();
                } catch (error: any) {
                    // showError(`Network error: ${error.message}`);
                }
            }

        }

        // Handle save in edit mode
        const handleEditSave = async () => {
            const editor = editorRef.current;
            setLoading(true);
            if (editor) {
                const formState = captureFormState();
                const rawHtml = editor.getContent({ format: "raw" });
                const htmlContent = htmlWithPermissions(rawHtml, currentUser!.id, formState);
                // triggerWebSocketUpdate(htmlContent, formState); // Use your full trigger if needed
                console.log(htmlContent, 'html content with permissions');

                setContent(htmlContent);
                contentRef.current = htmlContent;
                formStateRef.current = formState;

                console.log('✅ Saved HTML:', htmlContent);

                const replyData = {
                    project_task_id: Number(currentTaskId),
                    document_json: htmlContent,
                    created_by: 1,
                };

                try {
                    // const response = await fetch(Api_url.save_task_documnet, {
                    //     method: 'POST',
                    //     headers: {
                    //         'Content-Type': 'application/json',
                    //     },
                    //     body: JSON.stringify(replyData),
                    // });
                    const response = await postRequestStatus<any>(Api_url.save_task_documnet, JSON.stringify(replyData))

                    setLoading(false);

                    // const result = await response.json();
                    if (response.status === 201) {
                        showSuccess('Task Document saved successfully');
                        console.log('✅ API Response:', response.data.message);
                        setIsUpdate(true);
                        setTimeout(() => {
                            navigate(-1);
                        }, 1500);
                    } else {
                        showError(`Error: ${response.data.message || 'Unknown error'}`);
                    }
                } catch (error: any) {
                    showError(`Network error: ${error.message}`);
                }
            }
        };

        // Handle task submit
        const handleTaskSubmit = async () => {
            if (!currentUser || !currentTaskId) return;
            const updatedBy = Number(currentUser.id);
            if (isNaN(updatedBy) || !currentTaskId) {
                showError('Cannot submit task: Invalid data');
                return;
            }

            const editor = editorRef.current;
            const formState = captureFormState();
            const rawHtml = editor.getContent({ format: "raw" });
            const htmlContent = htmlWithPermissions(rawHtml, currentUser.id, formState);

            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, "text/html");

            const signoffRows = doc.querySelectorAll("table[data-title^='TS'] tbody tr");

            let hasPendingSignoff = false;

            signoffRows.forEach(row => {
                const select = row.querySelector("select");
                const assignedUser = select?.getAttribute("data-selected-user");
                const btn = row.querySelector("td button.signoff-btn") as HTMLButtonElement;
                const signedOff = btn?.getAttribute("data-completed") === "true";

                if (assignedUser === String(currentUser.id) && btn && !signedOff) {
                    hasPendingSignoff = true;
                }
            });

            if (hasPendingSignoff) {
                showError("You must complete your sign-off before submitting this task.");
                return;
            }

            setSubmitLoading(true);
            try {
                const submitData = {
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
                if (result.status_code === 400) {
                    showWarn(`${result.message}`)
                    return;
                }
                else {
                    showSuccess('Task submitted successfully');
                    setTimeout(() => {
                        navigate(-1);
                    }, 1500); // wait 1.5 seconds before going back
                }

                // Optionally refresh or navigate
            } catch (err: any) {
                console.error('❌ Error submitting task:', err.message);
                showError(err.message || 'Failed to submit task');
            } finally {
                setSubmitLoading(false);
            }
        };

        const handleTaskRevert = async () => {
            try {
                const editor = editorRef.current;
                const formState = captureFormState();
                const rawHtml = editor.getContent({ format: "raw" });
                const htmlContent = htmlWithPermissions(rawHtml, currentUser.id, formState);
                const submitData = {
                    task_id: Number(currentTaskId),
                    document_json: htmlContent,
                };

                // const response = await fetch(Api_url.Revert_To_Previous_Task, {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //     },
                //     body: JSON.stringify(submitData),
                // });
                setLoading(true)
                const response = await postRequestStatus<any>(Api_url.Revert_To_Previous_Task, submitData, { 'Content-Type': 'application/json' })


                // const result = await response.json();
                // console.log('Task Reverted Back Successfully:', response);

                // if (!response.ok || response.status >= 400) {
                //     showError(result.message);
                //     throw new Error(result.message || `Failed to revert task: ${response.statusText}`);
                // }
                // if(response.status === 400){
                //     showError(result.message)
                // }
                setLoading(false)

                if (response.status === 200) {
                    showSuccess('Reverted Back to Previous Task.');
                    // navigate(-1);
                    setTimeout(() => {
                        navigate(-1);
                    }, 3500);

                } else {
                    showWarn(response.data.message)
                    // alert(response.data.message)
                }

                // Optionally refresh or navigate
            } catch (err: any) {
                console.error('❌ Error Reverted Back to Previous Task:', err.message);
                showError(err.message || 'Failed to submit task');
            } finally {
                setSubmitLoading(false);
            }
        }

        const highlightCommentFunc = useCallback(
            (commentId: string | number) => {
                const id = String(commentId);
                const editorInstance = editorRef.current;

                // ✅ Check if editor is ready
                if (!editorInstance || !editorInstance.iframeElement) {
                    console.warn("Editor not ready for highlighting");
                    alert("Editor is not ready yet. Please try again.");
                    return;
                }

                // ✅ Get iframe document safely
                const iframeDoc =
                    editorInstance.iframeElement.contentDocument ||
                    editorInstance.iframeElement.contentWindow?.document;

                if (!iframeDoc) {
                    console.warn("Unable to access iframe document");
                    return;
                }

                // ✅ Find the target comment element
                const commentElement = iframeDoc.querySelector(
                    `span[data-comment-id="${id}"]`
                ) as HTMLElement | null;

                if (!commentElement) {
                    console.warn(`Comment element with ID ${id} not found`);
                    return;
                }

                // ✅ Clear any existing highlights
                iframeDoc.querySelectorAll(".comment-highlight").forEach((el: any) => {
                    el.classList.remove("comment-highlight");
                });

                // ✅ Smooth scroll to the element
                try {
                    commentElement.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "nearest",
                    });
                } catch (err) {
                    console.warn("Failed to scroll comment into view:", err);
                }

                // ✅ Highlight the element
                commentElement.classList.add("comment-highlight");

                // ✅ Remove highlight after delay (e.g., 5s)
                const highlightTimeout = setTimeout(() => {
                    commentElement.classList.remove("comment-highlight");
                }, 5000);

                // ✅ Ensure cleanup if user navigates away
                return () => clearTimeout(highlightTimeout);
            },
            [editorRef, currentUser, captureFormState, triggerWebSocketUpdate]
        );

        useImperativeHandle(ref, () => ({
            fetchDocument,
            highlightComment: highlightCommentFunc
        }), [highlightCommentFunc]);

        const handleFailureSubmit = async (formData: any) => {
            try {
                const payload = {
                    incident_report_id: 0,
                    project_task_id: Number(taskId),
                    raised_by: currentUser?.id,
                    document: formData
                }
                // const response = await fetch(Api_url.raise_incident, {
                const response = await postRequestStatus<any>(Api_url.raise_incident_report, payload, { 'Content-Type': 'application/json' })

                // const response = await post_(Api_url.raise_incident_report, {
                //     method: "POST",
                //     headers: { "Content-Type": "application/json" },
                //     body: JSON.stringify({
                //         // incident_type_id: 1,
                //         // project_task_id: Number(taskId),
                //         // raised_by: currentUser?.id,
                //         // details: formData,
                //         incident_report_id: 0,
                //         project_task_id:  Number(taskId),
                //         raised_by: currentUser?.id,
                //         document: formData
                //     }),
                // });

                // const result = await response.json();
                if (response.status === 200) {
                    showSuccess("Incident reported successfully.");
                    setShowFailureForm(false);
                    navigate(-1);

                } else {
                    showError(response.data || "Failed to Report Incident.");
                }
            } catch (err: any) {
                showError(err.message);
            }
        };

        if (loading) {
            return (
                <div className="p-6 flex justify-center items-center">
                    <RingGradientLoader />
                </div>
            );
        }

        if (!taskId) {
            return <div>Error: Invalid task or user. <button onClick={() => window.history.back()}>Go Back</button></div>;
        }

        return (
            <div style={{ maxWidth: '100%', margin: '0 auto', position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '0.1rem' }}>
                    {editdocument1 ? (
                        <>
                            {/* save btn */}
                            <button disabled={!canSaveDocument()}
                                onClick={() => {
                                    handleEditSave();
                                }}
                                style={{
                                    padding: '0.2rem 1rem',
                                    fontSize: '13px',
                                    height: '28px',
                                    backgroundColor: '#2563eb',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: canSaveDocument() ? 'pointer' : 'not-allowed',
                                    fontWeight: '500'
                                }}
                                title={canSaveDocument() ? "Save Document" : "You dont have permission to save document"}
                            >
                                Save
                                {/* {isUpdate ? 'Update' : 'Save'} */}
                            </button>
                            {/* submit btn */}
                            <button disabled={!canSubmitDocument()}
                                onClick={handleTaskSubmit}
                                style={{
                                    padding: '0.2rem 1rem',
                                    fontSize: '13px',
                                    height: '28px',
                                    backgroundColor: '#00a917ff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: canSubmitDocument() ? 'pointer' : 'not-allowed',
                                    // cursor: 'not-allowed',
                                    opacity: canSubmitDocument() ? 1 : 0.6,
                                    fontWeight: '500'
                                }}
                                title={canSubmitDocument() ? "Submit Document" : "You dont have permission to Submit this document"}

                            // disabled={submitLoading}
                            >
                                Submit
                            </button>
                            {/* Revert Task btn */}
                            <button hidden={p_task_order_id === 1 ? true : !canRevertTask()}
                                onClick={handleTaskRevert}
                                style={{
                                    padding: '0.2rem 1rem',
                                    fontSize: '13px',
                                    height: '28px',
                                    backgroundColor: '#db7a0aff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: !canRevertTask() ? 'not-allowed' : 'pointer',
                                    opacity: !canRevertTask() ? 0.6 : 1,
                                    fontWeight: '500'
                                }}
                                disabled={submitLoading}
                                title={canRevertTask() ? "Revert Task" : "You dont have permission to Revert this Task"}

                            >
                                Revert Task
                            </button>
                            {/* Cancel btn */}
                            <button
                                onClick={() => window.history.back()}
                                style={{
                                    backgroundColor: '#acacacff',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    padding: '0.2rem 1rem',
                                    fontSize: '13px',
                                    height: '28px',
                                    fontWeight: '500',
                                    color: 'white'
                                }}
                            >
                                Cancel
                            </button>
                        </>
                    ) :
                        <>
                            {/* Cancel btn */}
                            <button
                                onClick={() => window.history.back()}
                                style={{
                                    backgroundColor: '#acacacff',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    padding: '0.2rem 1rem',
                                    fontSize: '13px',
                                    height: '28px',
                                    fontWeight: '500',
                                    color: 'white'
                                }}
                            >
                                Cancel
                            </button>
                        </>
                    }
                </div>
                {showFailureForm && formSchema && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 p-6 relative">
                            <button
                                onClick={() => setShowFailureForm(false)}
                                className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl"
                            >
                                ×
                            </button>

                            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
                                Failure Form (Executor)
                            </h2>

                            <div className="overflow-y-auto max-h-[70vh]">
                                <RenderUiTemplate
                                    formSchema={formSchema}
                                    onWeightageChange={(total, updatedJson) =>
                                        console.log("Template changed", updatedJson)
                                    }
                                    onSubmit={(formData) => handleFailureSubmit(formData)}
                                    can_edit={true}
                                    buttonMode={1}
                                />
                            </div>
                        </div>
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
        );
    });
export default ProjectTaskEditor;