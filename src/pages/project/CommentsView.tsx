// import React, { useState, useEffect } from 'react';
// import { MessageSquare, Send, MoreVertical, ChevronDown, ChevronUp } from 'lucide-react';
// import { Api_url } from '../../networkCalls/Apiurls';
// import RingGradientLoader from '../../components/RingGradientLoader';

// interface Reply {
//     reply_id: number;
//     comment_id: number;
//     reply_description: string;
//     replied_by: number;
//     replied_date: string;
//     replied_by_name: string;
// }

// interface Comment {
//     comment_id: number;
//     description: string;
//     commented_by: number;
//     comment_date: string;
//     is_resolved: boolean;
//     resolved_by: number | null;
//     resolved_date: string | null;
//     sdlc_phase_id: number;
//     project_phase_id: number;
//     sdlc_task_id: number;
//     project_task_id: number;
//     task_name: string;
//     commented_by_name: string;
//     replies_count: number;
//     replies: Reply[];
// }

// interface Phase {
//     project_phase_id: number;
//     sdlc_phase_id: number;
//     phase_name: string;
//     comment_count: number;
//     comments: Comment[];
// }

// interface ProjectData {
//     project_id: number;
//     project_name: string;
//     phases: Phase[];
// }

// interface ApiResponse {
//     status_code: number;
//     message: string;
//     data: ProjectData[];
// }

// interface CommentsViewProps {
//     projectId: number;
//     userId: number;
// }

// const CommentsView: React.FC<CommentsViewProps> = ({ projectId, userId }) => {
//     const [data, setData] = useState<ProjectData[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
//     const [activeMenu, setActiveMenu] = useState<number | null>(null);
//     const [newReplyText, setNewReplyText] = useState<{ [key: number]: string }>({});
//     const [newCommentText, setNewCommentText] = useState<{ [key: string]: string }>({});

//     useEffect(() => {
//         fetchComments();
//     }, [projectId, userId]);

//     const fetchComments = async () => {
//         try {
//             setLoading(true);
//             const response = await fetch(Api_url.FetchComments(userId, projectId));
//             const result: ApiResponse = await response.json();
//             setData(result.data);
//         } catch (error) {
//             console.error('Error fetching comments:', error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const toggleCommentExpansion = (commentId: number) => {
//         setExpandedComments(prev => {
//             const newSet = new Set(prev);
//             if (newSet.has(commentId)) {
//                 newSet.delete(commentId);
//             } else {
//                 newSet.add(commentId);
//             }
//             return newSet;
//         });
//     };

//     const formatDate = (dateString: string) => {
//         const date = new Date(dateString);
//         const options: Intl.DateTimeFormatOptions = {
//             month: 'short',
//             day: 'numeric',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit'
//         };
//         return date.toLocaleDateString('en-US', options);
//     };

//     const handleAddReply = (commentId: number) => {
//         console.log('Adding reply to comment:', commentId, newReplyText[commentId]);
//         setNewReplyText(prev => ({ ...prev, [commentId]: '' }));
//     };

//     const handleAddNewComment = (projectStr: string, phaseStr: string) => {
//         console.log('Adding new top-level comment to project', projectStr, 'phase', phaseStr, newCommentText[`${projectStr}-${phaseStr}`]);
//         setNewCommentText(prev => ({ ...prev, [`${projectStr}-${phaseStr}`]: '' }));
//     };

//     const getPhaseAbbreviation = (phaseName: string) => {
//         const match = phaseName.match(/\(([^)]+)\)/);
//         return match ? match[1] : phaseName.substring(0, 3).toUpperCase();
//     };

//     const renderProjectView = (projectData: ProjectData) => {
//         return (
//             <div key={projectData.project_id} className="mb-8">
//                 <div className="flex gap-4 overflow-x-auto pb-4">
//                     {projectData.phases.map((phase) => {
//                         const key = `${projectData.project_id.toString()}-${phase.sdlc_phase_id.toString()}`;
//                         const totalComments = phase.comment_count;
//                         return (
//                             <div key={phase.project_phase_id} className="flex-shrink-0 w-80">
//                                 <div className="bg-blue-700 text-white rounded-t-lg p-3 flex items-center gap-2">
//                                     <MessageSquare size={18} />
//                                     <span className="font-medium">{getPhaseAbbreviation(phase.phase_name)}</span>
//                                     <span className="ml-auto bg-white text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
//                                         {totalComments}
//                                     </span>
//                                 </div>

//                                 <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg min-h-[400px]">
//                                     <div className="p-4 space-y-4">
//                                         {phase.comments.map((comment) => (
//                                             <div key={comment.comment_id}
//                                                 className="
//                                                      border border-gray-200 rounded-lg p-4
//         bg-white
//         transition-transform transition-shadow duration-300
//         hover:shadow-lg
//         hover:-translate-y-1
//         hover:bg-gray-50
//         cursor-pointer
//     "
//                                             >
//                                                 <div className="flex justify-between items-start mb-2">
//                                                     <div>
//                                                         <h4 className="font-semibold text-gray-900">{comment.commented_by_name}</h4>
//                                                         <p className="text-xs text-gray-500">Date: {formatDate(comment.comment_date)}</p>
//                                                     </div>
//                                                     <button
//                                                         onClick={() => setActiveMenu(activeMenu === comment.comment_id ? null : comment.comment_id)}
//                                                         className="relative text-gray-400 hover:text-gray-600"
//                                                     >
//                                                         <MoreVertical size={18} />
//                                                         {activeMenu === comment.comment_id && (
//                                                             <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//                                                                 <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Edit</button>
//                                                                 <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">Delete</button>
//                                                             </div>
//                                                         )}
//                                                     </button>
//                                                 </div>

//                                                 <p className="text-gray-700 text-sm mb-3">{comment.description}</p>

//                                                 <div className="flex gap-2 mb-3">
//                                                     <input
//                                                         type="text"
//                                                         placeholder="Add a reply"
//                                                         value={newReplyText[comment.comment_id] || ''}
//                                                         onChange={(e) => setNewReplyText(prev => ({ ...prev, [comment.comment_id]: e.target.value }))}
//                                                         className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                                     />
//                                                     <button
//                                                         onClick={() => handleAddReply(comment.comment_id)}
//                                                         className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                                                     >
//                                                         <Send size={16} />
//                                                     </button>
//                                                 </div>

//                                                 <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
//                                                     <button className="flex items-center gap-1 hover:text-blue-600">
//                                                         <MessageSquare size={14} />
//                                                         <span>{comment.task_name}</span>
//                                                     </button>
//                                                     <button
//                                                         onClick={() => toggleCommentExpansion(comment.comment_id)}
//                                                         className="flex items-center gap-1 hover:text-blue-600"
//                                                     >
//                                                         <span>Reply ({comment.replies_count})</span>
//                                                         {expandedComments.has(comment.comment_id) ? (
//                                                             <ChevronUp size={14} />
//                                                         ) : (
//                                                             <ChevronDown size={14} />
//                                                         )}
//                                                     </button>
//                                                 </div>

//                                                 {expandedComments.has(comment.comment_id) && (
//                                                     <div className="space-y-3">
//                                                         {comment.replies.map((reply) => (
//                                                             <div key={reply.reply_id} className="ml-4 pl-4 border-l-2 border-gray-200">
//                                                                 <div className="mb-1">
//                                                                     <h5 className="font-semibold text-sm text-gray-900">{reply.replied_by_name}</h5>
//                                                                     <p className="text-xs text-gray-500">{formatDate(reply.replied_date)}</p>
//                                                                 </div>
//                                                                 <p className="text-sm text-gray-700">{reply.reply_description}</p>
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         ))}
//                                         <div className="border-t border-gray-200 pt-4">
//                                             <div className="flex gap-2">
//                                                 <input
//                                                     type="text"
//                                                     placeholder="Add a new comment"
//                                                     value={newCommentText[key] || ''}
//                                                     onChange={(e) => setNewCommentText(prev => ({ ...prev, [key]: e.target.value }))}
//                                                     className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                                 />
//                                                 <button
//                                                     onClick={() => handleAddNewComment(projectData.project_id.toString(), phase.sdlc_phase_id.toString())}
//                                                     className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                                                 >
//                                                     <Send size={16} />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             </div>
//         );
//     };

//     // const renderAllProjectsView = () => {
//     //     const allPhases: { [key: string]: { phaseName: string; commentsByProject: { [pid: number]: { name: string; comments: Comment[] } } } } = {};

//     //     data.forEach((project) => {
//     //         project.phases.forEach((phase) => {
//     //             const key = phase.sdlc_phase_id.toString();
//     //             if (!allPhases[key]) {
//     //                 allPhases[key] = { phaseName: phase.phase_name, commentsByProject: {} };
//     //             }
//     //             if (!allPhases[key].commentsByProject[project.project_id]) {
//     //                 allPhases[key].commentsByProject[project.project_id] = { name: project.project_name, comments: [] };
//     //             }
//     //             allPhases[key].commentsByProject[project.project_id].comments.push(...phase.comments);
//     //         });
//     //     });

//     //     return (
//     //         <div className="flex gap-4 overflow-x-auto pb-4">
//     //             {Object.entries(allPhases).map(([phaseId, phaseData]) => {
//     //                 const totalComments = Object.values(phaseData.commentsByProject).reduce((sum, pg) => sum + pg.comments.length, 0);
//     //                 return (
//     //                     <div key={phaseId} className="flex-shrink-0 w-80">
//     //                         <div className="bg-blue-700 text-white rounded-t-lg p-3 flex items-center gap-2">
//     //                             <MessageSquare size={18} />
//     //                             <span className="font-medium">{getPhaseAbbreviation(phaseData.phaseName)}</span>
//     //                             <span className="ml-auto bg-white text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
//     //                                 {totalComments}
//     //                             </span>
//     //                         </div>

//     //                         <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg min-h-[400px]">
//     //                             <div className="p-4 space-y-4">
//     //                                 {Object.entries(phaseData.commentsByProject).map(([pidStr, projectGroup]) => {
//     //                                     const key = `${pidStr}-${phaseId}`;
//     //                                     return (
//     //                                         <div key={pidStr} className="space-y-3">
//     //                                             {/* <div className="group relative">
//     //                                             <div className="bg-blue-75 px-4 py-2 rounded-lg cursor-pointer">
//     //                                                 <p className=" text-sm font-semibold text-gray-700">{projectGroup.name}</p>
//     //                                             </div> */}
//     //                                             <div className="group relative inline-block">
//     //                                                 {/* Project Title */}
//     //                                                 <div className="bg-blue-75 px-4 py-2 rounded-lg cursor-pointer transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:z-10 relative">
//     //                                                     <p className="text-sm font-semibold text-gray-700">{projectGroup.name}</p>
//     //                                                 </div>
//     //                                                 <div className="mt-2 transition-transform duration-300 group-hover:scale-105 group-hover:shadow-2xl group-hover:z-10 relative  group-hover:pb-2 ">
//     //                                                     {projectGroup.comments.map((comment) => (
//     //                                                         <div key={comment.comment_id}
//     //                                                             // className="border border-gray-200 rounded-lg p-4"
//     //                                                             className=" border border-gray-200 rounded-lg p-4 bg-white transition-transform transition-shadow duration-300 hover:shadow-lg hover:-translate-y-1 hover:bg-gray-50 cursor-pointer"
//     //                                                         >
//     //                                                             <div className="flex justify-between items-start mb-2">
//     //                                                                 <div>
//     //                                                                     <h4 className="font-semibold text-gray-900">{comment.commented_by_name}</h4>
//     //                                                                     <p className="text-xs text-gray-500">Date: {formatDate(comment.comment_date)}</p>
//     //                                                                 </div>
//     //                                                                 <button
//     //                                                                     onClick={() => setActiveMenu(activeMenu === comment.comment_id ? null : comment.comment_id)}
//     //                                                                     className="relative text-gray-400 hover:text-gray-600"
//     //                                                                 >
//     //                                                                     <MoreVertical size={18} />
//     //                                                                     {activeMenu === comment.comment_id && (
//     //                                                                         <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//     //                                                                             <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">Edit</button>
//     //                                                                             <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">Delete</button>
//     //                                                                         </div>
//     //                                                                     )}
//     //                                                                 </button>
//     //                                                             </div>

//     //                                                             <p className="text-gray-700 text-sm mb-3">{comment.description}</p>

//     //                                                             <div className="flex gap-2 mb-3">
//     //                                                                 <input
//     //                                                                     type="text"
//     //                                                                     placeholder="Add a reply"
//     //                                                                     value={newReplyText[comment.comment_id] || ''}
//     //                                                                     onChange={(e) => setNewReplyText(prev => ({ ...prev, [comment.comment_id]: e.target.value }))}
//     //                                                                     className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//     //                                                                 />
//     //                                                                 <button
//     //                                                                     onClick={() => handleAddReply(comment.comment_id)}
//     //                                                                     className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//     //                                                                 >
//     //                                                                     <Send size={16} />
//     //                                                                 </button>
//     //                                                             </div>

//     //                                                             <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
//     //                                                                 <button className="flex items-center gap-1 hover:text-blue-600">
//     //                                                                     <MessageSquare size={14} />
//     //                                                                     <span>{comment.task_name}</span>
//     //                                                                 </button>
//     //                                                                 <button
//     //                                                                     onClick={() => toggleCommentExpansion(comment.comment_id)}
//     //                                                                     className="flex items-center gap-1 hover:text-blue-600"
//     //                                                                 >
//     //                                                                     <span>Reply ({comment.replies_count})</span>
//     //                                                                     {expandedComments.has(comment.comment_id) ? (
//     //                                                                         <ChevronUp size={14} />
//     //                                                                     ) : (
//     //                                                                         <ChevronDown size={14} />
//     //                                                                     )}
//     //                                                                 </button>
//     //                                                             </div>

//     //                                                             {expandedComments.has(comment.comment_id) && (
//     //                                                                 <div className="space-y-3">
//     //                                                                     {comment.replies.map((reply) => (
//     //                                                                         <div key={reply.reply_id} className="ml-4 pl-4 border-l-2 border-gray-200">
//     //                                                                             <div className="mb-1">
//     //                                                                                 <h5 className="font-semibold text-sm text-gray-900">{reply.replied_by_name}</h5>
//     //                                                                                 <p className="text-xs text-gray-500">{formatDate(reply.replied_date)}</p>
//     //                                                                             </div>
//     //                                                                             <p className="text-sm text-gray-700">{reply.reply_description}</p>
//     //                                                                         </div>
//     //                                                                     ))}
//     //                                                                 </div>
//     //                                                             )}
//     //                                                         </div>
//     //                                                     ))}
//     //                                                     <div className="border-t border-gray-200 pt-4">
//     //                                                         <div className="flex gap-2">
//     //                                                             <input
//     //                                                                 type="text"
//     //                                                                 placeholder="Add a new comment"
//     //                                                                 value={newCommentText[key] || ''}
//     //                                                                 onChange={(e) => setNewCommentText(prev => ({ ...prev, [key]: e.target.value }))}
//     //                                                                 className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//     //                                                             />
//     //                                                             <button
//     //                                                                 onClick={() => handleAddNewComment(pidStr, phaseId)}
//     //                                                                 className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//     //                                                             >
//     //                                                                 <Send size={16} />
//     //                                                             </button>
//     //                                                         </div>
//     //                                                     </div>
//     //                                                 </div>
//     //                                             </div>
//     //                                         </div>
//     //                                     );
//     //                                 })}
//     //                             </div>
//     //                         </div>
//     //                     </div>
//     //                 );
//     //             })}
//     //         </div>
//     //     );
//     // };


//     const renderAllProjectsView = () => {
//         const phaseColors = [
//             { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", header: "bg-blue-600" },
//             { bg: "bg-green-100", border: "border-green-300", text: "text-green-800", header: "bg-green-600" },
//             { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800", header: "bg-purple-600" },
//             { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-800", header: "bg-pink-600" },
//             { bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-800", header: "bg-yellow-500" },
//             { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800", header: "bg-teal-600" },
//         ];

//         return (
//             <div className="flex gap-4 overflow-x-auto pb-4">
//                 {data.map((project) => {
//                     const totalComments = project.phases.reduce(
//                         (sum, phase) => sum + phase.comment_count,
//                         0
//                     );

//                     return (
//                         <div key={project.project_id} className="flex-shrink-0 w-96">
//                             {/* Project Header */}
//                             <div className="bg-blue-700 text-white rounded-t-lg p-3 flex items-center gap-2">
//                                 <MessageSquare size={18} />
//                                 <span className="font-medium">{project.project_name}</span>
//                                 <span className="ml-auto bg-white text-blue-700 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
//                                     {totalComments}
//                                 </span>
//                             </div>

//                             {/* Project Body */}
//                             <div className="bg-white border border-t-0 border-gray-200 rounded-b-lg min-h-[400px] overflow-y-auto">
//                                 <div className="p-4 space-y-6">
//                                     {project.phases.map((phase, index) => {
//                                         const color = phaseColors[index % phaseColors.length];
//                                         const key = `${project.project_id}-${phase.sdlc_phase_id}`;
//                                         return (
//                                             <div
//                                                 key={phase.sdlc_phase_id}
//                                                 className={`rounded-lg overflow-hidden border ${color.border} shadow-sm`}
//                                             >
//                                                 {/* Phase Header */}
//                                                 <div className={`${color.header} text-white p-2 flex items-center justify-between`}>
//                                                     <h4 className="text-sm font-semibold">{phase.phase_name}</h4>
//                                                     <span className="bg-white text-xs px-2 py-1 rounded-full font-semibold text-gray-700">
//                                                         {phase.comment_count}
//                                                     </span>
//                                                 </div>

//                                                 {/* Phase Comments */}
//                                                 <div className={`${color.bg} p-3 space-y-4`}>
//                                                     {phase.comments.length > 0 ? (
//                                                         phase.comments.map((comment) => (
//                                                             <div
//                                                                 key={comment.comment_id}
//                                                                 className="border border-gray-200 rounded-lg p-3 bg-white transition-transform duration-300 hover:shadow-md hover:-translate-y-0.5"
//                                                             >
//                                                                 {/* Comment Header */}
//                                                                 <div className="flex justify-between items-start mb-1">
//                                                                     <div>
//                                                                         <h4 className="font-semibold text-gray-900 text-sm">
//                                                                             {comment.commented_by_name}
//                                                                         </h4>
//                                                                         <p className="text-xs text-gray-500">
//                                                                             {formatDate(comment.comment_date)}
//                                                                         </p>
//                                                                     </div>
//                                                                     <button
//                                                                         onClick={() =>
//                                                                             setActiveMenu(
//                                                                                 activeMenu === comment.comment_id
//                                                                                     ? null
//                                                                                     : comment.comment_id
//                                                                             )
//                                                                         }
//                                                                         className="relative text-gray-400 hover:text-gray-600"
//                                                                     >
//                                                                         <MoreVertical size={16} />
//                                                                         {activeMenu === comment.comment_id && (
//                                                                             <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
//                                                                                 <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50">
//                                                                                     Edit
//                                                                                 </button>
//                                                                                 <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 text-red-600">
//                                                                                     Delete
//                                                                                 </button>
//                                                                             </div>
//                                                                         )}
//                                                                     </button>
//                                                                 </div>

//                                                                 {/* Comment Description */}
//                                                                 <p className="text-gray-700 text-sm mb-2">
//                                                                     {comment.description}
//                                                                 </p>

//                                                                 {/* Add Reply */}
//                                                                 <div className="flex gap-2 mb-2">
//                                                                     <input
//                                                                         type="text"
//                                                                         placeholder="Add a reply"
//                                                                         value={newReplyText[comment.comment_id] || ''}
//                                                                         onChange={(e) =>
//                                                                             setNewReplyText((prev) => ({
//                                                                                 ...prev,
//                                                                                 [comment.comment_id]: e.target.value,
//                                                                             }))
//                                                                         }
//                                                                         className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                                                     />
//                                                                     <button
//                                                                         onClick={() =>
//                                                                             handleAddReply(comment.comment_id)
//                                                                         }
//                                                                         className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                                                                     >
//                                                                         <Send size={14} />
//                                                                     </button>
//                                                                 </div>

//                                                                 {/* Replies Toggle */}
//                                                                 <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
//                                                                     <button
//                                                                         className="flex items-center gap-1 hover:text-blue-600"
//                                                                         onClick={() =>
//                                                                             toggleCommentExpansion(comment.comment_id)
//                                                                         }
//                                                                     >
//                                                                         <span>Replies ({comment.replies_count})</span>
//                                                                         {expandedComments.has(comment.comment_id) ? (
//                                                                             <ChevronUp size={12} />
//                                                                         ) : (
//                                                                             <ChevronDown size={12} />
//                                                                         )}
//                                                                     </button>
//                                                                 </div>

//                                                                 {/* Replies */}
//                                                                 {expandedComments.has(comment.comment_id) && (
//                                                                     <div className="space-y-2 ml-3 border-l-2 border-gray-100 pl-3">
//                                                                         {comment.replies.map((reply) => (
//                                                                             <div key={reply.reply_id}>
//                                                                                 <div className="flex justify-between items-center">
//                                                                                     <h5 className="font-medium text-xs text-gray-800">
//                                                                                         {reply.replied_by_name}
//                                                                                     </h5>
//                                                                                     <p className="text-[10px] text-gray-500">
//                                                                                         {formatDate(reply.replied_date)}
//                                                                                     </p>
//                                                                                 </div>
//                                                                                 <p className="text-sm text-gray-700">
//                                                                                     {reply.reply_description}
//                                                                                 </p>
//                                                                             </div>
//                                                                         ))}
//                                                                     </div>
//                                                                 )}
//                                                             </div>
//                                                         ))
//                                                     ) : (
//                                                         <p className={`${color.text} text-sm italic`}>
//                                                             No comments for this phase
//                                                         </p>
//                                                     )}

//                                                     {/* Add New Comment */}
//                                                     <div className="border-t border-gray-100 pt-3">
//                                                         <div className="flex gap-2">
//                                                             <input
//                                                                 type="text"
//                                                                 placeholder="Add a new comment"
//                                                                 value={newCommentText[key] || ''}
//                                                                 onChange={(e) =>
//                                                                     setNewCommentText((prev) => ({
//                                                                         ...prev,
//                                                                         [key]: e.target.value,
//                                                                     }))
//                                                                 }
//                                                                 className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                                                             />
//                                                             <button
//                                                                 onClick={() =>
//                                                                     handleAddNewComment(
//                                                                         project.project_id.toString(),
//                                                                         phase.sdlc_phase_id.toString()
//                                                                     )
//                                                                 }
//                                                                 className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                                                             >
//                                                                 <Send size={14} />
//                                                             </button>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         );
//     };



//     // if (loading) {
//     //     return (
//     //         <div className="flex items-center justify-center h-64">
//     //             <div className="text-gray-500">Loading comments...</div>
//     //         </div>
//     //     );
//     // }

//     return (
//         <div className="p-6">
//             {loading && (
//                 <RingGradientLoader />
//             )}
//             {projectId === 0 ? renderAllProjectsView() : (
//                 data.find(p => p.project_id === projectId) ?
//                     renderProjectView(data.find(p => p.project_id === projectId)!) :
//                     <div className="text-center text-gray-500 py-8">No comments found for this project</div>
//             )}
//         </div>
//     );
// };

// export default CommentsView;



import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { MessageSquare, Send, ChevronDown, ChevronUp, Edit, Check, X, FileText } from "lucide-react";
import { Api_url } from "../../networkCalls/Apiurls";
import RingGradientLoader from "../../components/RingGradientLoader";
import { showSuccess, showError, showWarn } from "../../services/toasterService"; // Adjust path as needed
import { useNavigate } from "react-router-dom";
import { canAddComment, canAddReplyComment, canEditComment, canEditReplyComment, canViewDocument } from "../../services/permissionsService";
import { getRequestStatus, postRequestStatus, putRequestStatus } from "../../networkCalls/NetworkCalls";

// ---------- Interfaces ----------
interface Reply {
    reply_id: number;
    comment_id: number;
    reply_description: string;
    replied_by: number;
    replied_date: string;
    replied_by_name: string;
}

interface Comment {
    comment_id: number;
    description: string;
    commented_by: number;
    comment_date: string;
    commented_by_name: string;
    replies_count: number;
    replies: Reply[];
    task_name: string;
    project_task_id: number;
    task_order_id: number;
    project_name: string;
}

interface Phase {
    sdlc_phase_id: number;
    phase_name: string;
    comment_count: number;
    comments: Comment[];
}

interface ProjectData {
    project_id: number;
    project_name: string;
    phases: Phase[];
}

// interface ApiResponse {
//     status_code: number;
//     message: string;
//     data: ProjectData[];
// }

interface CommentsViewProps {
    projectId: number;
    userId: number;
}


interface ApiResponse<T> {
    status_code: number;
    message: string;
    data: T;
}
type GetcomentsResponse = ApiResponse<ProjectData[]>;
const CommentsView: React.FC<CommentsViewProps> = ({ projectId, userId }) => {
    const [data, setData] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
    const [expandedProjects, setExpandedProjects] = useState<Set<number>>(new Set());
    const [expandedTasks, setExpandedTasks] = useState<Set<number>>(new Set()); // New state for task expansion
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingReplyId, setEditingReplyId] = useState<number | null>(null);
    const editRef = useRef<HTMLTextAreaElement>(null);
    const commentInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    const replyInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
    const navigate = useNavigate();
    // Persistence key for localStorage
    const storageKey = `comments-expanded-${projectId}`;
    // Load expanded states from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            try {
                const { projects, tasks, comments } = JSON.parse(saved);
                setExpandedProjects(new Set(projects || []));
                setExpandedTasks(new Set(tasks || []));
                setExpandedComments(new Set(comments || []));
            } catch (err) {
                console.error('Failed to load expanded states:', err);
            }
        }
    }, [projectId, storageKey]);
    // Save expanded states to localStorage on changes
    useEffect(() => {
        const toSave = {
            projects: Array.from(expandedProjects),
            tasks: Array.from(expandedTasks),
            comments: Array.from(expandedComments),
        };
        localStorage.setItem(storageKey, JSON.stringify(toSave));
    }, [expandedProjects, expandedTasks, expandedComments, storageKey]);
    // ---------- Utility ----------
    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });

    const fetchComments = useCallback(async () => {
        try {
            setLoading(true);
            const { status, data } = await getRequestStatus<GetcomentsResponse>(Api_url.FetchComments(userId, projectId));

            // const res = await fetch(Api_url.FetchComments(userId, projectId));
            // const result: ApiResponse = await res.json();
            setData(data?.data || []);
            // Reset to default expanded projects on new data fetch (optional: comment out to keep previous)
            setExpandedProjects(new Set((data?.data || []).map((p: ProjectData) => p.project_id)));
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setEditingCommentId(null);
            setEditingReplyId(null);
            setLoading(false);
        }
    }, [projectId, userId]);

    useEffect(() => { fetchComments(); }, [fetchComments]);
    // New effect to auto-expand tasks with comments on data load
    useEffect(() => {
        if (data.length > 0) {
            const taskIdsWithComments = new Set<number>();
            data.forEach((project) => {
                project.phases.forEach((phase) => {
                    const groupedByTask = phase.comments.reduce((groups: Record<number, Comment[]>, comment) => {
                        const taskId = comment.project_task_id;
                        if (!groups[taskId]) {
                            groups[taskId] = [];
                        }
                        groups[taskId].push(comment);
                        return groups;
                    }, {});
                    Object.keys(groupedByTask).forEach((taskIdStr) => {
                        const taskId = parseInt(taskIdStr);
                        if (groupedByTask[taskId].length > 0) {
                            taskIdsWithComments.add(taskId);
                        }
                    });
                });
            });
            // Merge with existing to respect user toggles
            setExpandedTasks(prev => new Set([...prev, ...taskIdsWithComments]));
        }
    }, [data]);
    const phaseColors = useMemo(() => [
        { bg: "bg-blue-100", border: "border-blue-300", text: "text-blue-800", header: "bg-blue-500" },
        { bg: "bg-green-100", border: "border-green-300", text: "text-green-800", header: "bg-green-500" },
        { bg: "bg-purple-100", border: "border-purple-300", text: "text-purple-800", header: "bg-purple-500" },
        { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-800", header: "bg-pink-500" },
        { bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-800", header: "bg-yellow-500" },
        { bg: "bg-teal-100", border: "border-teal-300", text: "text-teal-800", header: "bg-teal-500" },
    ], []);

    // ---------- Handlers ----------
    const toggleProjectExpansion = useCallback((id: number) => {
        setExpandedProjects(prev => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    }, []);
    const toggleCommentExpansion = (id: number) => setExpandedComments(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
    });
    // New toggle for tasks
    const toggleTaskExpansion = useCallback((taskId: number) => {
        setExpandedTasks(prev => {
            const next = new Set(prev);
            next.has(taskId) ? next.delete(taskId) : next.add(taskId);
            return next;
        });
    }, []);
    const startEditingComment = (comment: Comment) => {
        setEditingCommentId(comment.comment_id);
        setEditingReplyId(null);
        setTimeout(() => {
            if (editRef.current) {
                editRef.current.value = comment.description;
                editRef.current.focus();
                const len = comment.description.length;
                editRef.current.setSelectionRange(len, len);
            }
        }, 0);
    };

    const startEditingReply = (reply: Reply) => {
        setEditingReplyId(reply.reply_id);
        setEditingCommentId(null);
        setTimeout(() => {
            if (editRef.current) {
                editRef.current.value = reply.reply_description;
                editRef.current.focus();
                const len = reply.reply_description.length;
                editRef.current.setSelectionRange(len, len);
            }
        }, 0);
    };

    const handleAddNewComment = async (projectId: string, phaseId: string, taskId: number) => {
        const key = `${projectId}-${phaseId}-${taskId}`;
        const input = commentInputRefs.current[key];
        const commentText = input?.value.trim() || "";

        if (!commentText) {
            showWarn("Please enter a comment");
            input?.focus();
            return;
        }

        if (!taskId || isNaN(taskId)) {
            showError("Invalid task ID");
            return;
        }

        if (!userId || isNaN(userId)) {
            showError("Invalid user ID");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                project_task_id: taskId,
                description: commentText,
                commented_by: userId,
            };

            const res = await postRequestStatus<any>(Api_url.Add_Task_Comments, payload)

            // const res = await fetch(Api_url.Add_Task_Comments, {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(payload),
            // });

            // const result = await res.json();

            if (res.status === 201) {
                showSuccess("Comment added successfully!");
                input.value = "";
                fetchComments();
            } else {
                showError(res.data || "Failed to add comment");
            }
        } catch (err) {
            showError("Error adding comment");
        } finally {
            setLoading(false);
        }
    };

    const handleAddReply = async (commentId: number) => {
        const input = replyInputRefs.current[commentId];
        const replyText = input?.value.trim() || "";
        if (!replyText) {
            showWarn("Please enter a reply");
            input?.focus();
            return;
        }
        if (!commentId || isNaN(commentId)) {
            showError("Invalid comment ID");
            return;
        }

        if (!userId || isNaN(userId)) {
            showError("Invalid user ID");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                comment_id: commentId,
                reply_description: replyText,
                replied_by: userId,
            };
            const res = await postRequestStatus<any>(Api_url.Add_Task_Comments_reply, payload)

            // const res = await fetch(Api_url.Add_Task_Comments_reply, {
            //     method: "POST",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(payload),
            // });

            // const result = await res.json();
            if (res.status === 201) {
                showSuccess("Reply added successfully!");
                input.value = "";
                fetchComments();
            } else {
                showError(res.data || "Failed to add reply");
            }
        } catch (err) {
            showError("Error adding reply");
        } finally {
            setLoading(false);
        }
    };

    const saveEditedComment = async (commentId: number) => {
        const newText = editRef.current?.value.trim() || "";
        if (!newText) {
            showWarn("Text cannot be empty");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                comment_id: commentId,
                description: newText,
                updated_by: userId
            };
            const res = await putRequestStatus<any>(Api_url.Edit_Task_Comment, payload)

            // const res = await fetch(Api_url.Edit_Task_Comment, {
            //     method: "PUT",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(payload),
            // });
            // const result = await res.json();
            if (res.status === 200) {
                showSuccess("Comment updated!");
                setEditingCommentId(null);
                fetchComments();
            } else showError(res.data || "Failed to update comment");
        } catch (err) {
            console.error(err);
            showError("Error updating comment");
        }
        finally {
            setLoading(false);
        }
    };

    const saveEditedReply = async (replyId: number) => {
        const newText = editRef.current?.value.trim() || "";
        if (!newText) {
            showWarn("Text cannot be empty");
            return;
        }

        try {
            setLoading(true);
            const payload = {
                reply_id: replyId,
                reply_description: newText,
                updated_by: userId
            };
            const res = await putRequestStatus<any>(Api_url.Edit_Task_Comment_reply, payload)

            // const res = await fetch(Api_url.Edit_Task_Comment_reply, {
            //     method: "PUT",
            //     headers: { "Content-Type": "application/json" },
            //     body: JSON.stringify(payload),
            // });
            // const result = await res.json();
            if (res.status === 200) {
                showSuccess("Reply updated!");
                setEditingReplyId(null);
                fetchComments();
            } else showError(res.data || "Failed to update reply");
        } catch (err) {
            console.error(err);
            showError("Error updating reply");
        }
        finally {
            setLoading(false);
        }
    };

    if (loading) return <RingGradientLoader />;

    const CommentCard = ({ comment, projectName, phaseName, taskName, dueDate, projectTaskId }: {
        comment: Comment;
        projectName: string;
        phaseName: string;
        taskName: string;
        dueDate: string;
        projectTaskId: number;  // From comment.project_task_id
    }) => (
        <div className="border border-gray-200 rounded-lg p-3 bg-white transition hover:shadow-md">
            <div className="flex justify-between items-start mb-1">
                <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{comment.commented_by_name}</h4>
                    <p className="text-xs text-gray-500">{formatDate(comment.comment_date)}</p>
                </div>

                {/* ✅ FIXED: Compare as numbers to avoid type mismatch */}
                {/* {Number(comment.commented_by) === Number(userId) && ( */}
                <div className="flex items-center gap-1">
                    <span
                        onClick={() => {
                            const canView = canViewDocument();
                            if (!canView) return;
                            navigate(`/task-documents/${projectTaskId}`, {
                                state: {
                                    projectName,
                                    phaseName,
                                    taskName,
                                    dueDate: dueDate || '-',
                                    commentId: comment.comment_id,
                                    task_order_id: comment.task_order_id,
                                    editdocument: false
                                }
                            });
                        }}
                        className={`border text-[15px] p-1 w-[25px] h-[25px] text-[#a7a7a7] rounded-full flex items-center gap-1 cursor-pointer ${canViewDocument()
                            ? 'hover:border-yellow-500 hover:text-yellow-600 ' : 'cursor-not-allowed'
                            }`}
                        title={canViewDocument() ? "Task_Edit" : "No permission to view document"}
                    >
                        <FileText strokeWidth={1.5} size={20} />
                    </span>
                    <button
                        onClick={() => {
                            if (!canEditComment()) return; // Prevent action if no permission
                            startEditingComment(comment);
                        }}
                        disabled={comment.commented_by !== userId ? true : !canEditComment()}
                        className={`border text-[15px] p-1 w-[25px] h-[25px] text-[#a7a7a7] rounded-full flex items-center gap-1 cursor-pointer 
                                ${comment.commented_by !== userId ? "cursor-not-allowed opacity-50" : canEditComment()
                                ? "hover:text-blue-600 cursor-pointer"
                                : "cursor-not-allowed opacity-50"
                            }`}
                        title={comment.commented_by !== userId ? 'You are not allowed to edit this comment' :
                            canEditComment()
                                ? "Edit Comment"
                                : "You don’t have permission to edit comments"
                        }
                    >
                        <Edit strokeWidth={1.5} size={18} />
                    </button>
                </div>
                {/* )} */}
            </div>

            {editingCommentId === comment.comment_id ? (
                <div className="flex flex-col gap-2 mb-2">
                    <textarea
                        ref={editRef}
                        rows={3}
                        className="flex-1 px-3 py-1.5 border rounded focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex gap-2">
                        <button onClick={() => saveEditedComment(comment.comment_id)} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700" title="Save Comment">
                            <Check size={14} />
                        </button>
                        <button onClick={() => setEditingCommentId(null)} className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400" title="Cancel Editing">
                            <X size={14} />
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-gray-700 text-sm mb-2">{comment.description}</p>
            )}

            {/* Replies Toggle */}
            <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 w-full text-left" onClick={() => toggleCommentExpansion(comment.comment_id)}>
                {expandedComments.has(comment.comment_id) ? "Hide replies" : `View replies (${comment.replies_count})`}
                {expandedComments.has(comment.comment_id) ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {/* Replies */}
            {expandedComments.has(comment.comment_id) && (
                <div className="space-y-2 ml-3 border-l-2 border-gray-100 pl-3 mt-2">
                    {comment.replies.map(r => (
                        <div key={r.reply_id} className="flex justify-between items-start">
                            <div className="flex-1">
                                <h5 className="font-medium text-xs text-gray-800">{r.replied_by_name}</h5>
                                {editingReplyId === r.reply_id ? (
                                    <div className="flex flex-col gap-2 mt-1">
                                        <div className="w-full">
                                            <textarea
                                                ref={editRef}
                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 resize-none"
                                                rows={3}
                                                style={{ minHeight: '6rem', maxHeight: '20rem', overflowY: 'auto' }}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => saveEditedReply(r.reply_id)} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700" title="Save Reply"><Check size={14} /></button>
                                            <button onClick={() => setEditingReplyId(null)} className="p-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400" title="Cancel Editing"><X size={14} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-700">{r.reply_description}</p>
                                )}
                            </div>

                            {/* ✅ FIXED: Compare as numbers to avoid type mismatch */}
                            {Number(r.replied_by) === Number(userId) && (
                                <button
                                    onClick={() => {
                                        if (!canEditReplyComment()) return;
                                        startEditingReply(r);
                                    }}
                                    disabled={!canEditReplyComment()}
                                    className={`text-gray-400 ml-2 rounded p-1 ${canEditReplyComment()
                                        ? "hover:text-blue-600 cursor-pointer"
                                        : "cursor-not-allowed opacity-50"
                                        }`}
                                    title={
                                        canEditReplyComment()
                                            ? "Edit Reply"
                                            : "You don’t have permission to edit this reply"
                                    }
                                >
                                    <Edit size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    {/* Reply Input */}
                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                        <input
                            type="text"
                            placeholder={
                                canAddReplyComment()
                                    ? "Add a reply"
                                    : "You don’t have permission to reply"
                            }
                            ref={el => replyInputRefs.current[comment.comment_id] = el}
                            disabled={!canAddReplyComment()}
                            className={`flex-1 px-0.1 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 ${canAddReplyComment()
                                ? "focus:ring-blue-500"
                                : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                }`}
                        />
                        <button
                            onClick={() => {
                                if (!canAddReplyComment()) return;
                                handleAddReply(comment.comment_id);
                            }}
                            disabled={!canAddReplyComment()}
                            className={`p-2 rounded-lg ${canAddReplyComment()
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            title={
                                canAddReplyComment()
                                    ? "Add Reply"
                                    : "You don’t have permission to add replies"
                            }
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    const PhaseCard = ({ phase, color, projectId }: { phase: Phase; color: any; projectId: number }) => {
        const groupedByTask = useMemo(() => {
            const groups: Record<number, { task_name: string; comments: Comment[] }> = {};
            phase.comments.forEach((comment) => {
                const taskId = comment.project_task_id;
                if (!groups[taskId]) {
                    groups[taskId] = { task_name: comment.task_name, comments: [] };
                }
                groups[taskId].comments.push(comment);
            });
            return groups;
        }, [phase.comments]);

        return (
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-white p-0 shadow-sm outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-500 transition-transform duration-300 hover:scale-98">
                <div className={`${color.header} text-white p-2 flex items-center justify-between`}>
                    <h4 className="text-sm font-semibold">{phase.phase_name}</h4>
                    <span className="bg-white text-xs px-2 py-1 rounded-full font-semibold text-gray-700">{phase.comment_count}</span>
                </div>
                <div className="p-3 space-y-3">
                    {Object.values(groupedByTask).length > 0 ? (
                        Object.entries(groupedByTask).map(([taskIdStr, { task_name, comments }]) => {
                            const taskId = parseInt(taskIdStr);
                            const taskCommentCount = comments.length;
                            const isTaskExpanded = expandedTasks.has(taskId);
                            const key = `${projectId}-${phase.sdlc_phase_id}-${taskId}`;
                            return (
                                <div key={taskId} className="space-y-3">
                                    {/* Task Header with Expand/Collapse Toggle */}
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-2">
                                        <div className="flex justify-between items-center">
                                            <h5 className="font-medium text-gray-800 text-sm">{task_name}</h5>
                                            <div className="flex items-center gap-2">
                                                {/* Expand/Collapse Button (only if has comments) */}
                                                {taskCommentCount > 0 && (
                                                    <button
                                                        onClick={() => toggleTaskExpansion(taskId)}
                                                        className="p-1 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center"
                                                        title={isTaskExpanded ? "Collapse task comments" : "Expand task comments"}
                                                    >
                                                        {isTaskExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                    </button>
                                                )}
                                                <span className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                                                    {taskCommentCount}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Task Content (Comments + Add Comment) - Collapsible */}
                                    {isTaskExpanded && (
                                        <div className="space-y-3">
                                            {/* Comments for this task - FIXED: Use comments.map instead of phase.comments.map */}
                                            <div className="space-y-3">
                                                {comments.map((comment) => (
                                                    <CommentCard
                                                        key={comment.comment_id}
                                                        comment={comment}
                                                        projectName={comment.project_name}
                                                        phaseName={phase.phase_name} // From scope
                                                        taskName={task_name} // From group (consistent for task)
                                                        dueDate="" // Fetch if available, else empty (handled in fallback)
                                                        projectTaskId={comment.project_task_id} // From comment
                                                    />
                                                ))}
                                            </div>
                                            {/* Add New Comment for this task */}
                                            <div className="border-t border-gray-100 pt-3">
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder={
                                                            canAddComment()
                                                                ? "Add a new comment"
                                                                : "You don’t have permission to comment"
                                                        }
                                                        ref={(el) => (commentInputRefs.current[key] = el)}
                                                        disabled={!canAddComment()}
                                                        className={`flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 ${canAddComment()
                                                            ? "focus:ring-blue-500"
                                                            : "bg-gray-100 text-gray-500 cursor-not-allowed"
                                                            }`}
                                                    />
                                                    <button
                                                        onClick={() =>
                                                            handleAddNewComment(
                                                                projectId.toString(),
                                                                phase.sdlc_phase_id.toString(),
                                                                taskId
                                                            )
                                                        }
                                                        disabled={!canAddComment()}
                                                        className={`p-2 rounded-lg ${canAddComment()
                                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                                            }`}
                                                        title={
                                                            canAddComment()
                                                                ? "Add Comment"
                                                                : "You don’t have permission to add comments"
                                                        }
                                                    >
                                                        <Send size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className={`${color.text} text-sm italic`}>No comments for this phase</p>
                    )}
                </div>
            </div>
        );
    };
    const renderView = () => {
        // Distribute phases into 4 independent vertical columns (round-robin) to eliminate gaps
        const numCols = 4;
        const colProjects = Array.from({ length: numCols }, (_, colIndex) =>
            data
                .filter((_, index) => index % numCols === colIndex)
                .map((project) => {
                    const totalComments = project.phases.reduce(
                        (sum, p) => sum + p.comment_count,
                        0
                    );
                    const isExpanded = expandedProjects.has(project.project_id);
                    const headerClass = `
                        flex flex-col flex-shrink-0 rounded-t-lg
                        ${!isExpanded
                            ? 'hover:shadow-none hover:border-none'
                            : 'hover:shadow border border-transparent hover:border-[#ddd]'
                        }
                        transition-all duration-300
                    `;
                    return (
                        <div key={project.project_id} className="w-full">
                            <div className={headerClass}>
                                <div className="bg-[hsl(var(--surface))] flex flex-col">
                                    {/* Header */}
                                    <div
                                        className="flex items-center justify-between bg-[#1f3a9d] px-3.5 py-2.5 text-white rounded-t-lg cursor-pointer hover:bg-[#1a2f7a] transition-colors"
                                        onClick={() => toggleProjectExpansion(project.project_id)}
                                    >
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-white/10">
                                                <MessageSquare className="h-4 w-4" />
                                            </span>
                                            <span className="font-medium truncate flex-1">
                                                {project.project_name}
                                            </span>
                                        </div>
                                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-white/10 px-2 text-sm">
                                            {totalComments}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleProjectExpansion(project.project_id);
                                            }}
                                            className="p-1 rounded-full hover:bg-white/20 transition-colors flex items-center justify-center ml-2"
                                            title={isExpanded ? "Collapse project" : "Expand project"}
                                        >
                                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                        </button>
                                    </div>
                                    {/* Expanded content */}
                                    {isExpanded && (
                                        <div className="border border-gray-200 border-t-0 rounded-b-lg">
                                            <div className="py-3 px-2 space-y-6">
                                                {project.phases.map((phase, i) => (
                                                    <PhaseCard
                                                        key={phase.sdlc_phase_id}
                                                        phase={phase}
                                                        color={phaseColors[i % phaseColors.length]}
                                                        projectId={project.project_id}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })
        );
        return (
            <div className="flex h-full flex-col overflow-hidden">
                <div className="flex-1 overflow-auto">
                    {/* Horizontal flex for columns with vertical stacking inside each */}
                    <div className="flex gap-4 p-4">
                        {colProjects.map((col, colIndex) => (
                            <div key={colIndex} className="flex flex-col gap-4 flex-1 min-w-0">
                                {col}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };
    return (
        <div className="relative">
            {data.length ? renderView() : <div className="text-center text-gray-500 py-8">No comments found</div>}
        </div>
    );
};

export default CommentsView;
