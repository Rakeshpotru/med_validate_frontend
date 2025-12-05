// // BoardView.tsx
// import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import type { Task } from '../types'
// import BoardColumn from './BoardColumn'

// export interface BoardViewProps {
//   groups: Array<[string, Task[]]>
//   onOpenTask?: (id: string) => void
//   projectId: number
//   /** optional: receives the outer root (paged root) */
//   outerRef?: (el: HTMLDivElement | null) => void
//   onReorder?: (stage: string, newOrderIds: string[]) => void
//   /** controlled page index from parent (0-based). If provided, component will scroll to it */
//   externalPage?: number
//   /** notify parent of current page and total pages */
//   onPageInfo?: (info: { current: number; total: number }) => void
// }

// export default function BoardView({ groups, onOpenTask, outerRef, onReorder, externalPage, onPageInfo, projectId }: BoardViewProps) {
//   const rootRef = useRef<HTMLDivElement | null>(null)
//   const containerRef = useRef<HTMLDivElement | null>(null)
//   const [currentPage, setCurrentPage] = useState(0)
//   const [columnsPerPage, setColumnsPerPage] = useState(1)
//   const minColumnWidth = 300 // Minimum width for each column in pixels
  
//   // Calculate how many columns can fit in the viewport
//   useEffect(() => {
//     if (!containerRef.current) return
    
//     const updateColumnsPerPage = () => {
//       const containerWidth = containerRef.current?.clientWidth || 0
//       const newColumnsPerPage = Math.max(1, Math.floor(containerWidth / minColumnWidth))
//       setColumnsPerPage(prev => {
//         // Only update if the number of columns changes
//         if (prev !== newColumnsPerPage) {
//           // Adjust current page to prevent showing empty pages
//           const totalPages = Math.ceil(groups.length / newColumnsPerPage)
//           if (currentPage >= totalPages && totalPages > 0) {
//             setCurrentPage(totalPages - 1)
//           }
//           return newColumnsPerPage
//         }
//         return prev
//       })
//     }
    
//     // Initial calculation
//     updateColumnsPerPage()
    
//     // Set up resize observer for container
//     const resizeObserver = new ResizeObserver(updateColumnsPerPage)
//     if (containerRef.current) {
//       resizeObserver.observe(containerRef.current)
//     }
    
//     return () => {
//       resizeObserver.disconnect()
//     }
//   }, [groups.length, currentPage])
  
//   // Calculate pagination
//   const totalPages = Math.ceil(groups.length / columnsPerPage)
//   const startCol = currentPage * columnsPerPage
//   const endCol = startCol + columnsPerPage
//   const visibleGroups = groups.slice(startCol, endCol)
  
//   // Notify parent of page changes
//   const prevPageInfo = useRef<{ current: number; total: number } | null>(null)
  
//   useEffect(() => {
//     if (!onPageInfo) return;
    
//     const newPageInfo = { current: currentPage, total: totalPages }
//     // Only notify if the page info has actually changed
//     if (!prevPageInfo.current || 
//         prevPageInfo.current.current !== newPageInfo.current || 
//         prevPageInfo.current.total !== newPageInfo.total) {
//       prevPageInfo.current = newPageInfo
//       onPageInfo(newPageInfo)
//     }
//   }, [currentPage, totalPages, onPageInfo])
  
//   // Handle external page changes from parent
//   const prevExternalPage = useRef<number | null>(null)
//   const isInitialMount = useRef(true)
  
//   useEffect(() => {
//     if (isInitialMount.current) {
//       isInitialMount.current = false;
//       return;
//     }
    
//     if (externalPage != null && externalPage !== currentPage) {
//       // Ensure the external page is within valid range
//       const newPage = Math.max(0, Math.min(externalPage, totalPages - 1))
//       if (newPage !== currentPage) {
//         setCurrentPage(newPage)
//       }
//     }
    
//     if (externalPage != null && 
//         externalPage !== currentPage && 
//         externalPage !== prevExternalPage.current) {
//       prevExternalPage.current = externalPage;
//       setCurrentPage(prev => {
//         const newPage = Math.min(Math.max(0, externalPage), totalPages - 1);
//         return newPage !== prev ? newPage : prev;
//       });
//     }
//   }, [externalPage, totalPages])
  
//   // Navigation handlers
//   const goToNextPage = useCallback(() => {
//     setCurrentPage(prev => {
//       const nextPage = Math.min(prev + 1, totalPages - 1)
//       return nextPage !== prev ? nextPage : prev
//     })
//   }, [totalPages])
  
//   const goToPrevPage = useCallback(() => {
//     setCurrentPage(prev => {
//       const prevPage = Math.max(prev - 1, 0)
//       return prevPage !== prev ? prevPage : prev
//     })
//   }, [])

//   // keyboard support for navigation
//   const onKeyDown = useCallback((e: React.KeyboardEvent) => {
//     if (e.key === 'ArrowLeft' || e.key === 'Left') {
//       e.preventDefault()
//       goToPrevPage()
//     } else if (e.key === 'ArrowRight' || e.key === 'Right') {
//       e.preventDefault()
//       goToNextPage()
//     }
//   }, [goToPrevPage, goToNextPage])
//   return (
//     <div
//       ref={(el) => {
//         rootRef.current = el;
//         outerRef?.(el);
//       }}
//       className="flex h-full flex-col overflow-hidden"
//       tabIndex={0}
//       onKeyDown={onKeyDown}
//     >
//       <div 
//         ref={containerRef}
//         className="flex-1 overflow-hidden"
//       >
//         <div className="h-full p-4">
//           <div className="flex flex-wrap gap-4" style={{
//             gridTemplateColumns: `repeat(${visibleGroups.length}, minmax(${minColumnWidth}px, 2fr))`,
//             width: '100%',
//             overflow: 'hidden'
//           }}>
//             {visibleGroups.map(([stage, list]) => (
//               <div key={stage} className="h-full">
//                 <BoardColumn
//                   stage={stage}
//                   tasks={list}
//                   onOpenTask={onOpenTask}
//                   onReorder={onReorder}
//                   projectId={projectId}
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
      
//       <div className="border-t border-[hsl(var(--border))] p-2">
//         <div className="flex items-center justify-between max-w-md mx-auto">
//           <button
//             onClick={goToPrevPage}
//             disabled={currentPage === 0}
//             className="inline-flex items-center justify-center rounded-md p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             aria-label="Previous page"
//           >
//             <svg 
//               xmlns="http://www.w3.org/2000/svg" 
//               width="24" 
//               height="24" 
//               viewBox="0 0 24 24" 
//               fill="none" 
//               stroke="currentColor" 
//               strokeWidth="2" 
//               strokeLinecap="round" 
//               strokeLinejoin="round" 
//               className="h-4 w-4"
//             >
//               <path d="m15 18-6-6 6-6" />
//             </svg>
//             <span className="sr-only">Previous</span>
//           </button>
          
//           <div className="text-sm text-[hsl(var(--muted-foreground))] px-4">
//             {currentPage + 1} / {Math.max(1, totalPages)}
//           </div>
          
//           <button
//             onClick={goToNextPage}
//             disabled={currentPage >= totalPages - 1}
//             className="inline-flex items-center justify-center rounded-md p-2 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             aria-label="Next page"
//           >
//             <svg 
//               xmlns="http://www.w3.org/2000/svg" 
//               width="24" 
//               height="24" 
//               viewBox="0 0 24 24" 
//               fill="none" 
//               stroke="currentColor" 
//               strokeWidth="2" 
//               strokeLinecap="round" 
//               strokeLinejoin="round" 
//               className="h-4 w-4"
//             >
//               <path d="m9 18 6-6-6-6" />
//             </svg>
//             <span className="sr-only">Next</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useCallback, useState, useRef } from 'react'
import type { Task } from '../types'
import BoardColumn from './BoardColumn'

export interface BoardViewProps {
  groups: Array<[string, Task[]]>
  onOpenTask?: (id: string) => void
  projectId: number
  outerRef?: (el: HTMLDivElement | null) => void
  onReorder?: (stage: string, newOrderIds: string[]) => void
}

export default function BoardView({
  groups,
  onOpenTask,
  outerRef,
  onReorder,
  projectId,
}: BoardViewProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [expandedStages, setExpandedStages] = useState<Set<string>>(
    () => new Set(groups.map(([s]) => s))
  )

  const toggleExpanded = useCallback((stage: string) => {
    setExpandedStages((prev) => {
      const next = new Set(prev)
      if (next.has(stage)) {
        next.delete(stage)
      } else {
        next.add(stage)
      }
      return next
    })
  }, [])

  // Distribute phases into 4 independent vertical columns (round-robin) to eliminate gaps
  const numCols = 4
  const colGroups = Array.from({ length: numCols }, (_, colIndex) =>
    groups
      .filter((_, index) => index % numCols === colIndex)
      .map(([stage, tasks]) => (
        <BoardColumn
          key={stage}
          stage={stage}
          tasks={tasks}
          onOpenTask={onOpenTask}
          onReorder={onReorder}
          projectId={projectId}
          isExpanded={expandedStages.has(stage)}
          onToggle={() => toggleExpanded(stage)}
        />
      ))
  )

  return (
    <div
      ref={(el) => {
        rootRef.current = el
        outerRef?.(el)
      }}
      className="flex h-full flex-col overflow-hidden"
      tabIndex={0}
    >
      <div className="flex-1 overflow-auto">
        {/* Horizontal flex for columns with vertical stacking inside each */}
        <div className="flex gap-4 p-4">
          {colGroups.map((col, colIndex) => (
            <div key={colIndex} className="flex flex-col gap-4 flex-1 min-w-0">
              {col}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}