// import type { Member } from '../types'

// export interface AvatarGroupProps {
//   members: Member[]
//   maxVisible?: number
//   size?: 'sm' | 'md'
// }

// export default function AvatarGroup({ members, maxVisible = 4, size = 'sm' }: AvatarGroupProps) {
//   const visible = members.slice(0, maxVisible)
//   const overflow = members.length - maxVisible
//   const sizeClass = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
//   const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

//   const allNames = members.map((m) => m.name).join(', ')

//   return (
//     <div className="flex items-center gap-2" title={allNames} aria-label={`Assignees: ${allNames}`}>
//       <div className="flex -space-x-2">
//         {visible.map((m) => (
//           <img
//             key={m.id}
//             src={
//               m.avatarUrl ||
//               'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22><rect width=%2240%22 height=%2240%22 fill=%22%231f3a9d%22/></svg>'
//             }
//             alt={m.name}
//             className={`${sizeClass} rounded-full border-2 border-white object-cover ring-1 ring-gray-200`}
//             loading="lazy"
//             decoding="async"
//             onError={(e) => {
//               const img = e.currentTarget
//               if (!img.dataset.fallback) {
//                 img.dataset.fallback = '1'
//                 const BASE = (import.meta as any).env?.BASE_URL ?? '/'
//                 img.src = `${BASE}users_profile/default.svg`
//               }
//             }}
//           />
//         ))}
//         {overflow > 0 && (
//           <div
//             className={`${sizeClass} inline-flex items-center justify-center rounded-full border-2 border-white bg-gray-100 ${textSize} font-medium text-gray-600 ring-1 ring-gray-200`}
//             aria-label={`+${overflow} more`}
//           >
//             +{overflow}
//           </div>
//         )}
//       </div>
//       <div className="flex flex-col">
//         <span className={`${textSize} font-medium text-[hsl(var(--fg))]`}>
//           {visible.length > 0 ? visible[0].name : 'No assignee'}
//         </span>
//         {overflow > 0 && (
//           <span className="text-xs text-gray-500">+{overflow} more</span>
//         )}
//       </div>
//     </div>
//   )
// }


import type { Member } from '../types'
import { cn } from '../../ui/utils' // Assuming cn is available

export interface AvatarGroupProps {
  members: Member[]
  maxVisible?: number
  size?: 'sm' | 'md'
  showNames?: boolean
}

function getAvatarBg(name: string) {
  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500']
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export default function AvatarGroup({ members, maxVisible = 4, size = 'sm', showNames = false }: AvatarGroupProps) {
  const visible = members.slice(0, maxVisible)
  const overflow = members.length - maxVisible
  const sizeClass = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const allNames = members.map((m) => m.name).join(', ')

  return (
    <div className="flex items-center gap-2" title={allNames} aria-label={`Assignees: ${allNames}`}>
      <div className="flex -space-x-2">
        {visible.map((m) => {
          const initial = m.name.charAt(0).toUpperCase()
          const avatarBg = getAvatarBg(m.name)
          return (
            <div
              key={m.id}
              className={cn(
                sizeClass,
                "rounded-full border-2 border-white shadow-sm relative overflow-hidden flex items-center justify-center font-medium text-white ring-1 ring-gray-200",
                m.avatarUrl ? 'object-cover' : avatarBg
              )}
              title={m.name}
            >
              {m.avatarUrl ? (
                <img
                  src={m.avatarUrl}
                  alt={m.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget
                    img.style.display = 'none'
                    // Fallback to initial
                    const fallback = img.parentElement
                    if (fallback) {
                      fallback.classList.remove('object-cover')
                      fallback.classList.add(avatarBg)
                      fallback.innerHTML = `<span class="${textSize}">${initial}</span>`
                    }
                  }}
                />
              ) : (
                <span className={textSize}>{initial}</span>
              )}
            </div>
          )
        })}
        {overflow > 0 && (
          <div 
            className={cn(
              sizeClass,
              "inline-flex items-center justify-center rounded-full border-2 border-white bg-gray-100 font-medium text-gray-600 ring-1 ring-gray-200"
            )}
            title={members.slice(maxVisible).map(m => m.name).join(', ')}
            aria-label={`+${overflow} more`}
          >
            +{overflow}
          </div>
        )}
      </div>
      {showNames && (
        <div className="flex flex-col">
          <span className={`${textSize} font-medium text-gray-900`}>
            {visible.length > 0 ? visible[0].name : 'No assignee'}
          </span>
          {overflow > 0 && (
            <span className="text-xs text-gray-500">+{overflow} more</span>
          )}
        </div>
      )}
    </div>
  )
}