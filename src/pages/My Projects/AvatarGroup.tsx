import type { Member } from './projectTypes';

export function AvatarGroup({ members, maxVisible = 3 }: { members: Member[]; maxVisible?: number }) {
  const visible = members.slice(0, maxVisible);
  const hidden = members.length - visible.length;
  return (
    <div className="flex -space-x-2" aria-label={`Members: ${members.map(m => m.name).join(', ')}`}> 
      {visible.map(m => (
        <img
          key={m.id}
          src={m.avatarUrl || 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2232%22 height=%2232%22><rect width=%2232%22 height=%2232%22 fill=%22%231f3a9d%22/></svg>'}
          alt={m.name}
          className="h-6 w-6 rounded-full ring-2 ring-white object-cover"
          width={24}
          height={24}
          loading="lazy"
        />
      ))}
      {hidden > 0 && (
        <span className="h-6 w-6 rounded-full bg-gray-200 text-gray-700 text-xs flex items-center justify-center ring-2 ring-white" aria-label={`${hidden} more`}>
          +{hidden}
        </span>
      )}
    </div>
  );
}
