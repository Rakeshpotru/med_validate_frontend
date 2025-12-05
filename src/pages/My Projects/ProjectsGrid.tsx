import { useEffect, useRef, useState } from 'react';
import type { ProjectSummary } from './projectTypes';
import { ProjectCard } from './ProjectCard';

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="flex justify-between">
        <div className="h-5 w-28 rounded bg-gray-200" />
        <div className="h-5 w-6 rounded bg-gray-200" />
      </div>
      <div className="mt-3 h-5 w-3/5 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-full rounded bg-gray-200" />
      <div className="mt-2 h-4 w-5/6 rounded bg-gray-200" />
      <div className="mt-4 h-2 w-full rounded bg-gray-200" />
      <div className="mt-4 flex items-center justify-between">
        <div className="flex -space-x-2">
          <div className="h-6 w-6 rounded-full bg-gray-200 ring-2 ring-white" />
          <div className="h-6 w-6 rounded-full bg-gray-200 ring-2 ring-white" />
          <div className="h-6 w-6 rounded-full bg-gray-200 ring-2 ring-white" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-10 rounded bg-gray-200" />
          <div className="h-4 w-10 rounded bg-gray-200" />
          <div className="h-4 w-10 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
export function ProjectsGrid({ items, loading, onOpenProject, highlightId, handleProjectCreationVal, onArchive }: { items: ProjectSummary[]; loading?: boolean; onOpenProject: (id: string) => void; highlightId?: string | null, handleProjectCreationVal:(id: string)=>void, onArchive?: (projectId: string) => void }) {
  const [focusIndex, setFocusIndex] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const cols = 3; // layout target for keyboard math; visual grid responds via CSS

  useEffect(() => {
    // Clamp focus index if filtering changes list length
    if (focusIndex >= items.length) setFocusIndex(Math.max(0, items.length - 1));
  }, [items.length, focusIndex]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!items.length) return;
    let next = focusIndex;
    switch (e.key) {
      case 'ArrowRight':
      case 'Right':
        next = Math.min(items.length - 1, focusIndex + 1);
        break;
      case 'ArrowLeft':
      case 'Left':
        next = Math.max(0, focusIndex - 1);
        break;
      case 'ArrowDown':
      case 'Down':
        next = Math.min(items.length - 1, focusIndex + cols);
        break;
      case 'ArrowUp':
      case 'Up':
        next = Math.max(0, focusIndex - cols);
        break;
      case 'Enter':
      case ' ': {
        e.preventDefault();
        const id = items[focusIndex]?.id;
        if (id) onOpenProject(id);
        return;
      }
      default:
        return;
    }
    e.preventDefault();
    setFocusIndex(next);
    refs.current[next]?.focus();
  };

  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-gray-300 text-gray-500">
        No projects found.
      </div>
    );
  }

  return (
    <div
      role="grid"
      tabIndex={0}
      onKeyDown={onKeyDown}
      className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4 items-stretch"
      aria-label="Projects grid"
    >
      {items.map((item, idx) => (
        <div role="gridcell" key={item.id} className='flex flex-col h-full'>
          {/* Button ref is forwarded by querying inside ProjectCard via first child button */}
          <div ref={(el) => {
            // find inner role=button after mount
            const btn = el?.querySelector('[role="button"]') as HTMLElement | null;
            refs.current[idx] = (btn as unknown as HTMLButtonElement) || null;
          }}>
            <ProjectCard 
              item={item} 
              onOpen={onOpenProject} 
              highlight={item.id === highlightId} 
              handleProjectCreationVal={handleProjectCreationVal}
              onArchive={onArchive}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
