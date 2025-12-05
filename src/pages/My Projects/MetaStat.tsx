import type { ReactNode } from 'react';

export function MetaStat({ icon, count, ariaLabel }: { icon: ReactNode; count: number; ariaLabel: string }) {
  return (
    <div className="inline-flex items-center gap-1 text-sm text-gray-500" aria-label={ariaLabel}>
      {icon}
      <span>{count}</span>
    </div>
  );
}
