import React, {
    useEffect,
    useState,
    useRef,
    useCallback,
    forwardRef,
    useImperativeHandle,
} from "react";
import {
    MessageSquare,
    FileText,
    TriangleAlert,
    Send,
    CornerUpLeft,
    Download,
    Eye,
    Loader2,
    X,
} from "lucide-react";
import { showSuccess, showError, showWarn } from "../../services/toasterService";
import { Api_url } from "../../networkCalls/Apiurls";
import pdfMake from "pdfmake/build/pdfmake";
import htmlToPdfmake from "html-to-pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { canCommentOnDocument } from "../../services/permissionsService";
import { getRequestStatus, postRequestStatus, putRequestStatus } from "../../networkCalls/NetworkCalls";
import RingGradientLoader from "../../components/RingGradientLoader";

(pdfMake as any).vfs = (pdfFonts as any).vfs;

interface Comment {
    id: number;
    author: string;
    authorId: number;
    date: string;
    content: string;
    likes: number;
    isLiked: boolean;
    replies?: Comment[];
}

interface PhaseDocument {
    task_doc_id: number;
    phase_name_doc_version: string;
    phase_code?: string;
    task_name?: string;
    doc_version?: string;
}

interface IncidentDisplay {
    phase: string;
    raised: string;
    raiseComment: string;
    resolveComment: string;
    status: string;
}

type TabType = "comments" | "files" | "incidents";

export interface SidebarHandle {
    refreshComments: () => void;
}

interface ApiResponse<T> {
    status_code: number;
    message: string;
    data: T;
}

type GetcomentsResponse = ApiResponse<[]>;

const TabsView = forwardRef<SidebarHandle, TabsViewProps>(
    (
        {
            taskId,
            projectId,
            phaseId,
            userId,
            task_order_id,
            onCommentClick,
        },
        ref
    ) => {
        const staticUserId = localStorage.getItem("USER_ID");

        const [activeTab, setActiveTab] = useState<TabType>("comments");
        const [comments, setComments] = useState<Comment[]>([]);
        const [commentText, setCommentText] = useState("");
        const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
        const [showReplyInputs, setShowReplyInputs] = useState<{ [key: number]: boolean }>(
            {}
        );

        const [loading, setLoading] = useState(false);
        const [commentsLoading, setCommentsLoading] = useState(false);

        const commentInputRef = useRef<HTMLInputElement | null>(null);

        const [documentsLoading, setDocumentsLoading] = useState(false);
        const [phaseDocuments, setPhaseDocuments] = useState<PhaseDocument[]>([]);
        const [incidents, setIncidents] = useState<IncidentDisplay[]>([]);
        const [incidentsLoading, setIncidentsLoading] = useState(false);

        const [data, setData] = useState<DocumentData | null>(null);
        const [showDocumentModal, setShowDocumentModal] = useState(false);
        const [documentContent, setDocumentContent] = useState("");
        const [isLoading, setIsLoading] = useState(false);
        const [taskstatus, setTaskStatus] = useState<number>(0)

        /** ============= EDIT STATE ============= */
        const [editing, setEditing] = useState<{
            id: number;
            isReply: boolean;
            text: string;
        } | null>(null);

        /** =======================
         *  FETCH COMMENTS
         * ======================= */
        const fetchComments = useCallback(async () => {
            if (!taskId) return;
            setCommentsLoading(true);
            try {
                const { status, data } =
                    await getRequestStatus<GetcomentsResponse>(
                        Api_url.Get_commentsby_taskid(taskId)
                    );
                setTaskStatus(data.data[0].task_status_id);

                setComments(
                    data.data.map((c: any) => ({
                        id: c.comment_id,
                        author: c.commented_by_name,
                        authorId: c.commented_by,
                        date: new Date(c.comment_date).toLocaleString(),
                        content: c.description,
                        likes: 0,
                        isLiked: false,
                        replies:
                            c.replies?.map((r: any) => ({
                                id: r.reply_id,
                                author: r.replied_by_name,
                                authorId: r.replied_by,
                                date: new Date(r.replied_date).toLocaleString(),
                                content: r.reply_description,
                                likes: 0,
                                isLiked: false,
                            })) || [],
                    }))
                );
            } catch (err) {
                // showError("Failed to load comments");
            } finally {
                setCommentsLoading(false);
            }
        }, [taskId]);

        useImperativeHandle(ref, () => ({
            refreshComments: () => fetchComments(),
        }));

        /** =======================
         *  FETCH DOCS
         * ======================= */
        const fetchPhaseDocuments = useCallback(async () => {
            if (!taskId) return;

            setDocumentsLoading(true);
            try {
                const { status, data } =
                    await getRequestStatus<GetcomentsResponse>(
                        Api_url.GetPhaseDocumentsByProjectTaskId(Number(taskId))
                    );

                const docsArray = Array.isArray(data.data)
                    ? data.data
                    : Object.values(data.data || {}).flat();

                setPhaseDocuments(docsArray);
            } catch (err) {
                showError("Error fetching documents");
            } finally {
                setDocumentsLoading(false);
            }
        }, [taskId]);

        /** =======================
         *  FETCH INCIDENTS
         * ======================= */
        const fetchIncidents = useCallback(async () => {
            if (!taskId) return;

            setIncidentsLoading(true);
            try {
                const { status, data } =
                    await getRequestStatus<GetcomentsResponse>(
                        Api_url.GetIncidentsByTaskId(Number(taskId))
                    );

                const mapped: IncidentDisplay[] = data.data.map((item: any) => ({
                    phase: item.phase_code,
                    raised: new Date(item.raised_date).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                    }),
                    raiseComment: item.raise_comment || "N/A",
                    resolveComment: item.resolve_comment || "N/A",
                    status: item.is_resolved ? "RESOLVED" : "OPEN",
                }));

                setIncidents(mapped);
            } catch (err) {
                // showError("Error fetching incidents");
            } finally {
                setIncidentsLoading(false);
            }
        }, [taskId]);

        /** =======================
         *  PDF helpers
         * ======================= */
        function preprocessHTML(rawHtml: string): string {
            const container = document.createElement("div");
            container.innerHTML = rawHtml;

            // selects
            container.querySelectorAll("select").forEach((sel) => {
                const selectedText =
                    (sel as HTMLSelectElement).selectedOptions[0]?.text || "";
                const span = document.createElement("span");
                span.textContent = selectedText;
                sel.replaceWith(span);
            });

            // text inputs
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
                        label =
                            inp.placeholder || inp.nextSibling?.textContent?.trim() || "";
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

            // radios
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
                        if (
                            sibling.nodeType === Node.TEXT_NODE &&
                            sibling.textContent?.trim()
                        ) {
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
                        if (
                            sibling.nodeType === Node.TEXT_NODE &&
                            sibling.textContent?.trim()
                        ) {
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

            // checkboxes
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
                        if (
                            sibling.nodeType === Node.TEXT_NODE &&
                            sibling.textContent?.trim()
                        ) {
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
                        if (
                            sibling.nodeType === Node.TEXT_NODE &&
                            sibling.textContent?.trim()
                        ) {
                            sibling.remove();
                            break;
                        }
                        sibling = sibling.nextSibling;
                    }
                    cb.remove();
                }
            });

            // buttons
            container.querySelectorAll("input[type=button], button").forEach((btn) => {
                const span = document.createElement("span");
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
            const cleanHtml = preprocessHTML(data.document_json);
            const pdfContent = htmlToPdfmake(cleanHtml);

            const docDefinition: any = {
                pageSize: "A4",
                pageMargins: [margin, margin + 40, margin, margin + 40],
                header: () => {
                    const now = new Date();
                    const formattedDate =
                        now.toLocaleDateString("en-GB") +
                        " " +
                        now.toLocaleTimeString("en-GB", { hour12: false });

                    return [
                        {
                            margin: [40, 10, 40, 4],
                            columns: [
                                {
                                    text: formattedDate,
                                    alignment: "left",
                                    fontSize: 10,
                                },
                                {
                                    text: "AIVerify - United Consulting Hub",
                                    alignment: "right",
                                    fontSize: 14,
                                    bold: true,
                                },
                            ],
                        },
                        {
                            canvas: [
                                {
                                    type: "line",
                                    x1: 40,
                                    y1: 0,
                                    x2: 555,
                                    y2: 0,
                                    lineWidth: 1,
                                },
                            ],
                        },
                    ];
                },
                footer: (currentPage: number, pageCount: number) => ({
                    text: `AIVerify- United Consulting Hub ${currentPage} of ${pageCount}`,
                    alignment: "center",
                    fontSize: 20,
                    margin: [0, 0, 0, 15],
                }),
                content: pdfContent,
                defaultStyle: { fontSize: 11 },
            };

            pdfMake.createPdf(docDefinition).download(`document_${data.task_doc_id}.pdf`);
        };

        const handleTaskDocClick = async (id: number) => {
            try {
                const { status, data } =
                    await getRequestStatus<GetcomentsResponse>(Api_url.getTaskDoc(id));

                if (status === 200 && data) {
                    setData(data.data);
                    await generatePDF(data.data);
                } else {
                    const message = data.message || "Unknown error";
                    showError(`Error fetching document: ${message}`);
                }
            } catch (error: any) {
                showError("Failed to fetch document data.");
            }
        };

        const handleViewDoc = async (id: number) => {
            setIsLoading(true);
            try {
                const url = Api_url.compare_docs(id);
                const result = await getRequestStatus<string | any>(url, {
                    accept: "text/html, application/json",
                });

                if (result.status >= 200 && result.status < 300) {
                    let htmlContent = "";
                    const data = result.data;
                    if (typeof data === "string") {
                        htmlContent = data;
                    } else {
                        if (data.status_code === 200 && data.data) {
                            htmlContent = data.data.document_json || data.data;
                        } else {
                            throw new Error("Invalid JSON response structure");
                        }
                    }
                    setDocumentContent(htmlContent);
                    setShowDocumentModal(true);
                } else {
                    const errorData = result.data;
                    const errorText =
                        typeof errorData === "string"
                            ? errorData
                            : JSON.stringify(errorData);
                    const message = `HTTP ${result.status}: ${errorText.substring(
                        0,
                        100
                    )}...`;
                    showError(`Error loading document: ${message}`);
                }
            } catch (error: any) {
                showError("Failed to load document for viewing.");
            } finally {
                setIsLoading(false);
            }
        };

        useEffect(() => {
            fetchComments();
            fetchPhaseDocuments();
            fetchIncidents();
        }, [fetchComments, fetchPhaseDocuments, fetchIncidents]);

        /** =======================
         *  ADD COMMENT
         * ======================= */
        const addTaskComment = useCallback(async () => {
            const input = commentInputRef.current;
            const content = commentText.trim();

            if (!content) {
                showWarn("Please enter a comment");
                input?.focus();
                return;
            }

            if (!taskId || isNaN(Number(taskId))) {
                showError("Invalid task ID");
                return;
            }

            if (!staticUserId || isNaN(Number(staticUserId))) {
                showError("Invalid user ID");
                return;
            }

            try {
                setLoading(true);
                const payload = {
                    project_task_id: Number(taskId),
                    description: content,
                    commented_by: Number(staticUserId),
                };

                const res = await postRequestStatus<any>(
                    Api_url.Add_Task_Comments,
                    payload
                );

                if (res.status === 201) {
                    showSuccess("Comment added successfully!");
                    setCommentText("");
                    fetchComments();
                } else {
                    showError(res.data || "Failed to add comment");
                }
            } catch {
                showError("Error adding comment");
            } finally {
                setLoading(false);
            }
        }, [commentText, taskId, staticUserId, fetchComments]);

        /** =======================
         *  ADD REPLY
         * ======================= */
        const addTaskReply = useCallback(
            async (commentId: number) => {
                const content = replyText[commentId]?.trim() || "";

                if (!content) {
                    showWarn("Please enter a reply");
                    return;
                }

                if (!commentId || isNaN(commentId)) {
                    showError("Invalid comment ID");
                    return;
                }

                if (!staticUserId || isNaN(Number(staticUserId))) {
                    showError("Invalid user ID");
                    return;
                }

                try {
                    setLoading(true);
                    const payload = {
                        comment_id: commentId,
                        reply_description: content,
                        replied_by: Number(staticUserId),
                    };

                    const res = await postRequestStatus<any>(
                        Api_url.Add_Task_Comments_reply,
                        payload,
                    );

                    if (res.status === 201) {
                        showSuccess("Reply added successfully!");
                        setReplyText((prev) => ({ ...prev, [commentId]: "" }));
                        setShowReplyInputs((prev) => ({ ...prev, [commentId]: false }));
                        fetchComments();
                    } else {
                        showError(res.data || "Failed to add reply");
                    }
                } catch {
                    showError("Error adding reply");
                } finally {
                    setLoading(false);
                }
            },
            [replyText, staticUserId, fetchComments]
        );

        /** =======================
         *  EDIT COMMENT / REPLY
         * ======================= */
        const startEdit = (comment: Comment, isReply: boolean) => {
            setEditing({
                id: comment.id,
                isReply,
                text: comment.content,
            });
        };

        const cancelEdit = () => {
            setEditing(null);
        };

        const saveEdit = async () => {
            if (!editing) return;
            const text = editing.text.trim();
            if (!text) {
                showWarn("Please enter some text");
                return;
            }

            try {
                setLoading(true);

                // adjust URL names if your backend differs
                const url = editing.isReply
                    ? Api_url.Edit_Task_Comment_reply
                    : Api_url.Edit_Task_Comment;

                const payload = editing.isReply
                    ? {
                        reply_id: editing.id,
                        reply_description: text,
                        updated_by: staticUserId
                    }
                    : {
                        comment_id: editing.id,
                        description: text,
                        updated_by: staticUserId
                    };

                const res = await putRequestStatus<any>(url, payload);

                if (res.status === 200) {
                    showSuccess("Updated successfully!");
                    setEditing(null);
                    fetchComments();
                } else {
                    showError(res.data || "Failed to update");
                }
            } catch (e) {
                showError("Error while updating");
            } finally {
                setLoading(false);
            }
        };

        /** =======================
         *  COMMENT ITEM COMPONENT
         * ======================= */
        const CommentItem = useCallback(
            ({
                comment,
                isNested = false,
            }: {
                comment: Comment;
                isNested?: boolean;
            }) => {
                const localReplyRef = useRef<HTMLInputElement | null>(null);

                const isOwner =
                    staticUserId && Number(staticUserId) === comment.authorId;

                const isEditing =
                    editing && editing.id === comment.id && editing.isReply === isNested;

                useEffect(() => {
                    if (!isNested && showReplyInputs[comment.id] && localReplyRef.current) {
                        localReplyRef.current.focus();
                    }
                }, [isNested, showReplyInputs, comment.id]);

                const toggleReply = () => {
                    if (isNested) return;
                    setReplyText((prev) => ({ ...prev, [comment.id]: "" }));

                    setShowReplyInputs((prev) => {
                        const isOpen = prev[comment.id] || false;

                        // If this comment is already open → close all
                        if (isOpen) return {};

                        // Otherwise open ONLY this one
                        return { [comment.id]: true };
                    });
                };


                return (
                    <div
                        className={`${isNested ? "ml-8 border-l-2 border-gray-200 pl-4" : ""
                            } mt-4`}
                    >
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-gray-900 font-semibold text-sm">
                                        {comment.author}
                                    </h3>
                                    <p className="text-gray-500 text-xs">{comment.date}</p>
                                </div>

                                {/* EDIT button only for owner */}
                                {isOwner && taskstatus !== 3 && !isEditing &&(
                                    <button
                                        className="text-xs text-blue-600 hover:underline"
                                        onClick={() => startEdit(comment, isNested)}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            {/* COMMENT TEXT / EDIT MODE */}
                            {isEditing ? (
                                <div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editing.text}
                                            onChange={(e) => setEditing({ ...editing!, text: e.target.value })}
                                            className="flex-1 border border-gray-300 rounded-lg px-3 py-1 text-sm"
                                        />
                                    </div>
                                    <button
                                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg"
                                        onClick={saveEdit}
                                        disabled={loading}
                                    >
                                        Save
                                    </button>
                                    <button
                                        className="text-xs text-gray-500 px-3 py-1 rounded-lg"
                                        onClick={cancelEdit}
                                    >
                                        Cancel
                                    </button>
                                </div>

                            ) : (
                                <p
                                    onClick={() => onCommentClick?.(comment.id)}
                                    className="text-gray-600 text-sm leading-relaxed cursor-pointer hover:bg-gray-100 rounded p-1"
                                >
                                    {comment.content}
                                </p>
                            )}

                            {/* ACTIONS: Reply only for TOP level comments */}
                            <div className="flex items-center justify-between">
                                <div />
                                {!isNested && (
                                    <div className="flex items-center gap-3">
                                        <button
                                            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
                                            onClick={toggleReply}
                                        >
                                            <CornerUpLeft className="w-4 h-4" />
                                            <span>Reply</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* REPLY INPUT — only for this comment, only when toggled, only top-level */}
                            {!isNested && showReplyInputs[comment.id] && (
                                <div className="flex items-center gap-2 mt-2">
                                    <input
                                        ref={localReplyRef}
                                        type="text"
                                        placeholder="Add a reply"
                                        value={replyText[comment.id] || ""}
                                        onChange={(e) =>
                                            setReplyText({
                                                ...replyText,
                                                [comment.id]: e.target.value,
                                            })
                                        }
                                        className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 border border-gray-300 rounded-full px-4 py-2"
                                    />
                                    <button
                                        title="Save Reply"
                                        className="bg-blue-600 rounded-full p-2 hover:bg-blue-700 transition-colors"
                                        onClick={() => addTaskReply(comment.id)}
                                        disabled={loading}
                                    >
                                        <Send className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* CHILD REPLIES */}
                        {
                            comment.replies && comment.replies.length > 0 && (
                                <div className="mt-4 space-y-4">
                                    {comment.replies.map((reply) => (
                                        <CommentItem
                                            key={reply.id}
                                            comment={reply}
                                            isNested={true}
                                        />
                                    ))}
                                </div>
                            )
                        }
                    </div >
                );
            },
            [
                replyText,
                showReplyInputs,
                loading,
                addTaskReply,
                onCommentClick,
                staticUserId,
                editing,
                saveEdit,
            ]
        );

        /** =======================
         *  RENDER
         * ======================= */
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-4xl mx-auto py-6 px-4">
                    {/* Tabs */}
                    <div className="flex justify-around items-center mb-8 border-b-2 border-gray-300">
                        {[
                            { type: "comments", icon: MessageSquare, label: "Comments" },
                            { type: "files", icon: FileText, label: "Files" },
                            { type: "incidents", icon: TriangleAlert, label: "Incidents" },
                        ].map(({ type, icon: Icon, label }) => {
                            const isActive = activeTab === type;
                            const hasOpenIncidents =
                                type === "incidents" &&
                                incidents.some((i) => i.status === "OPEN");

                            return (
                                <button
                                    key={type}
                                    onClick={() => setActiveTab(type as TabType)}
                                    className={`relative flex flex-col items-center gap-1 pb-4 transition-colors ${isActive
                                        ? "text-blue-600"
                                        : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    <div className="relative">
                                        <Icon className="w-4 h-4" />
                                        {hasOpenIncidents && (
                                            <span className="absolute -top-1.5 -right-1.5 w-2 h-2 bg-orange-600 rounded-full" />
                                        )}
                                    </div>
                                    <span
                                        className={`text-xs ${isActive ? "font-semibold" : ""}`}
                                    >
                                        {label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Comments */}
                    {activeTab === "comments" && (
                        <div className="space-y-6">
                            {commentsLoading ? (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Loading comments...</span>
                                </div>
                            ) : comments.length > 0 ? (
                                comments.map((comment) => (
                                    <CommentItem key={comment.id} comment={comment} />
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No comments yet.</p>
                            )}

                            {/* Add Comment */}
                            <div
                                hidden={task_order_id === 1 ? true : taskstatus === 3 ? true : !canCommentOnDocument()}
                                className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-3 mt-6"
                            >
                                <input
                                    ref={commentInputRef}
                                    type="text"
                                    placeholder="Add a comment"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
                                />
                                <button
                                    title={"Save Comment."}
                                    className="bg-blue-600 rounded-full p-2 hover:bg-blue-700 transition-colors"
                                    onClick={addTaskComment}
                                    disabled={!canCommentOnDocument() || loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5 text-white" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Files */}
                    {activeTab === "files" && (
                        <div className="grid gap-4">
                            {documentsLoading ? (
                                <div className="flex items-center gap-2 text-gray-500">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Loading documents...</span>
                                </div>
                            ) : phaseDocuments.length > 0 ? (
                                phaseDocuments.map((doc) => {
                                    return (
                                        <div
                                            key={doc.task_doc_id}
                                            className="flex items-center justify-between border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-blue-600" />
                                                <span className="text-gray-800 text-sm font-medium">
                                                    {`${doc.phase_code}_${doc.task_name}_${doc.doc_version}`}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleTaskDocClick(doc.task_doc_id)}
                                                    className="flex items-center gap-1 cursor-pointer text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleViewDoc(doc.task_doc_id)}
                                                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    No documents available.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Incidents */}
                    {activeTab === "incidents" && (
                        <div className="grid md:grid-cols-1 gap-5">
                            {incidents.length === 0 ? (
                                <p className="text-gray-500 text-sm">No incidents found.</p>
                            ) : (
                                incidents.map((inc, index) => (
                                    <div
                                        key={index}
                                        className={`border rounded-2xl p-5 shadow-sm hover:shadow-md transition relative ${inc.status === "RESOLVED"
                                            ? "border-blue-400 bg-blue-50"
                                            : "border-red-200 bg-red-50"
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h2 className="font-semibold text-gray-800">
                                                {inc.phase}
                                            </h2>
                                            <span
                                                className={`text-xs font-semibold px-3 py-1 rounded-full ${inc.status === "OPEN"
                                                    ? "bg-yellow-100 text-yellow-700"
                                                    : "bg-green-100 text-green-700"
                                                    }`}
                                            >
                                                {inc.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700">
                                            <strong>Raised Date:</strong> {inc.raised}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong>Raise Comment:</strong> {inc.raiseComment}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 z-[49] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <RingGradientLoader />
                    </div>
                )}

                {/* Document Modal */}
                {showDocumentModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white rounded-lg max-w-9xl max-h-[90vh] w-full overflow-hidden flex flex-col">
                            <div className="flex justify-between items-center p-4 border-b">
                                <h2 className="text-xl font-bold text-gray-800">
                                    View Document
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowDocumentModal(false);
                                        setDocumentContent("");
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 p-4 overflow-auto">
                                <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: documentContent }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

export default TabsView;
