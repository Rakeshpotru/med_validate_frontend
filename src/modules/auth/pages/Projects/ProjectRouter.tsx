// import React from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import ProjectDetail from './ProjectDetail';
// import ProjectsList from './ProjectsList';


// const ProjectsRouter: React.FC = () => {
//   const navigate = useNavigate();
//   const { projectId } = useParams<{ projectId: string }>();

//   // Show ProjectDetail if projectId exists
//   if (projectId) {
//     return (
//       <ProjectDetail
//         onBack={() => navigate('/projectslist')} // go back to project list
//         onEditProject={(id) => console.log('edit project', id)}
//         onCreateTask={(id) => console.log('create task', id)}
//         onUpdateTask={(task, projectId, phaseId) => console.log('update task', task)}
//         onDeleteTask={(taskId, projectId, phaseId) => console.log('delete task', taskId)}
//       />
//     );
//   }

//   // Otherwise, show the list
//   return (
//     <ProjectsList
//       onViewProject={(id) => navigate(`/projects/${id}`)}
//       onDeleteProject={(id) => console.log('delete project', id)}
//     />
//   );
// };

// export default ProjectsRouter;
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProjectDetail from './ProjectDetail';
import ProjectsList from './ProjectsList';

const ProjectsRouter: React.FC = () => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  // Show ProjectDetail if projectId exists
  if (projectId) {
    return (
      <ProjectDetail
        projectId={projectId} // Added to fix undefined issue
        onBack={() => navigate('/projectslist')}
        onEditProject={(id) => console.log('edit project', id)}
        onCreateTask={(id) => console.log('create task', id)}
        onUpdateTask={(task, projectId, phaseId) => console.log('update task', task)}
        onDeleteTask={(taskId, projectId, phaseId) => console.log('delete task', taskId)}
      />
    );
  }

  // Otherwise, show the list
  return (
    <ProjectsList
      onViewProject={(id) => navigate(`/projects/${id}`)}
      onDeleteProject={(id) => console.log('delete project', id)}
    />
  );
};

export default ProjectsRouter;