import { useEffect, useState } from 'react';
import Input from '../ui/input';

export function ProjectsSearch({
  value,
onChange,
  placeholder = 'Search',
  onStatusChange,
  statuses = [], // New prop: array of unique statuses from parent
}: {
  value: string;
  onChange: (v: string) => void;
  onStatusChange?: (status: string) => void;
  placeholder?: string;
  statuses?: string[]; // Optional, defaults to empty
}) {
  const [inner, setInner] = useState(value);
  const [status, setStatus] = useState(''); // Current selected status

  useEffect(() => setInner(value), [value]);

  // simple debounce
  useEffect(() => {
    const id = setTimeout(() => {
      if (inner !== value) onChange(inner);
    }, 250);
    return () => clearTimeout(id);
  }, [inner, onChange, value]);

  // Handle status change and notify parent for filtering
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    onStatusChange?.(newStatus); // Call parent callback to trigger filter
  };

  return (
    <div className="flex items-center gap-2 w-full max-w-md">
      <Input
        value={inner}
        onChange={(e) => setInner(e.target.value)}
        placeholder={placeholder}
        aria-label="Search projects"
        className="flex-1"
      />
      {/* Status dropdown - populated from prop */}
      <select
        value={status}
        onChange={handleStatusChange}
        className="border border-gray-300 rounded-md p-2 text-sm bg-white"
        aria-label="Filter by status"
      >
        <option value="">All</option>
        {statuses.map((stat) => (
          <option key={stat} value={stat}>
            {stat}
          </option>
        ))}
      </select>
    </div>
  );
}
