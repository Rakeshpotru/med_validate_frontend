// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { X, ArrowLeft } from 'lucide-react';
// // import Editor from './Editor';
// // import Sidebar from './Sidebar';
// import type { Task } from '../../components/project/types';
// import Editor from './Editor';
// import Sidebar from './Sidebar';

// interface Props {
//   task: Task;
// }

// type Tab = 'comments' | 'files' | 'incidents' | null;

// function TaskDocumentView({ task }: Props) {
//   const navigate = useNavigate();
//   const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
//   const [activeTab, setActiveTab] = useState<Tab>(null);

//   const handleTabClick = (tab: 'comments' | 'files' | 'incidents'): void => {
//     if (activeTab === tab) {
//       setIsSidebarOpen(false);
//       setActiveTab(null);
//     } else {
//       setIsSidebarOpen(true);
//       setActiveTab(tab);
//     }
//   };

//   const handleCloseSidebar = (): void => {
//     setIsSidebarOpen(false);
//     setActiveTab(null);
//   };

//   const handleBack = (): void => {
//     navigate('/tasks'); // Adjust the route as needed for the tasks screen
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Header */}
//       <header className="bg-white border-b border-gray-200 px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={handleBack}
//               className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
//               aria-label="Back to tasks"
//             >
//               <ArrowLeft className="w-5 h-5" />
//             </button>
//             <div>
//               <h1 className="text-2xl font-semibold text-gray-900">{task.title}</h1>
//               <p className="text-sm text-gray-500 mt-1">Due date: {task.dueDate}</p>
//             </div>
//           </div>
//           <div className="flex items-center gap-3">
//             <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
//               {task.label}
//             </button>
//             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center">
//               <span className="text-white text-sm font-medium">U</span>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Main Content Area */}
//       <div className="flex-1 flex overflow-hidden">
//         {/* Editor Section */}
//         <div
//           className={`flex-1 transition-all duration-300 ${
//             isSidebarOpen ? 'mr-0' : 'mr-0'
//           }`}
//         >
//           <Editor onToggleSidebar={handleTabClick} activeTab={activeTab}  />
//         </div>

//         {/* Sidebar Section */}
//         {isSidebarOpen && (
//           <div className="w-80 border-l border-gray-200 bg-white transition-all duration-300">
//             <Sidebar
//               activeTab={activeTab}
//               onClose={handleCloseSidebar}
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default TaskDocumentView;


import React, { useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import TabsView from './Sidebar';
import Editor from './Editor';

interface LocationState {
    projectId: number;     
    projectName: string;
    phaseName: string;
    taskName: string;
    dueDate: string;
    commentId?: number;
    task_order_id: number;
    editdocument: boolean;
}

const TaskDocumentView = () => {
    const { taskId } = useParams<{ taskId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const divRef = React.useRef<HTMLDivElement>(null);
    const state = (location.state || {}) as Partial<LocationState>;
    console.log("📌 TaskDocumentView received state:", state);

    const commentId = state.commentId;
    const projectId = state.projectId;
    console.log("📌 Project ID:", projectId);


    const projectName = state.projectName || 'Unknown Project';
    const phaseName = state.phaseName || 'Unknown Phase';
    const taskName = state.taskName || 'Unknown Task';
    const dueDate = state.dueDate || '-';
    const caneditdoc = state.editdocument || false
    const task_order_id = state.task_order_id
    const editorActionRef = useRef<any>(null);
    const sidebarRef = useRef<any>(null);

    const taskTitle = `Task ${taskId || 'Unknown'}`; // Dynamic title based on taskId
    //   const dueDate = '3 Sep, 2025'; // Could be dynamic from task data

    const handleClose = () => {
        navigate(-1); // Go back to previous page (e.g., TasksView)
    };

    const handleSidebarCommentClick = (commentId: number) => {
        editorActionRef.current?.highlightComment(String(commentId));
    };

    return (
        <div className='rounded-[16px]'>
            {/* Header Section */}
            <div className='grid gap-1 md:grid-cols-[1fr]'>
                <div className="flex items-center justify-between bg-white">
                    {/* Left: Titles */}
                    <div className="flex flex-col space-y-1">
                        <h1 className="text-[18px] leading-[18px] font-bold text-gray-900">
                            {projectName ? projectName : ''} <span className="text-gray-400 font-normal">|</span> {phaseName ? phaseName : ''} <span className="text-gray-400 font-normal">|</span> {taskName ? taskName : ''}
                        </h1>
                        {/* <p className="text-sm font-medium text-indigo-600">Due date: {dueDate}</p> */}
                    </div>
                    {/* Right: Status & Close */}
                    <div className="flex items-center space-x-3">
                        {/* <span className="px-3 py-1 text-sm font-semibold bg-indigo-100 text-indigo-700 rounded-lg">
                            Verification
                            </span> */}
                        <button
                            onClick={handleClose}
                            className="p-1.5 mr-[22px] w-8 h-8 text-[#333] hover:bg-red-200 border border-[#ccc] rounded-lg transition-colors duration-150"
                            aria-label="Close"
                            title={'Close'}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>

                    </div>
                </div>
            </div>
            {/* Main Content */}
            <main className='grid gap-1 grid-cols-1 md:grid-cols-[1fr_300px]'>
                <div className='bg-gray-100 p-2 rounded-[10px]'>
                    {/* <Editor taskId={taskId} ref={editorActionRef} /> */}
                    <Editor canedit={caneditdoc} taskId={taskId} projectId={projectId}initialCommentId={commentId} ref={editorActionRef} task_order_id={task_order_id}   onCommentSaved={() => sidebarRef.current?.refreshComments()}/>
                    
                </div>
                <div className='bg-gray-100 p-2 rounded-[10px] h-[600px] overflow-y-auto'>
                    <TabsView taskId={taskId} task_order_id={task_order_id} ref={sidebarRef} onCommentClick={(commentId) => editorActionRef.current?.highlightComment(commentId)}
                    />
                </div>
            </main>

        </div>
    );
};

export default TaskDocumentView;