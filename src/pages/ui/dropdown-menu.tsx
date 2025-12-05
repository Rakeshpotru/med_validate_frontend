import React, { useEffect, useId, useRef, useState } from 'react';

// Minimal, accessible dropdown menu components compatible with shadcn-like API
// Usage:
// <DropdownMenu>
//   <DropdownMenuTrigger asChild><Button>...</Button></DropdownMenuTrigger>
//   <DropdownMenuContent align="end">
//     <DropdownMenuItem onClick={...}>Edit</DropdownMenuItem>
//   </DropdownMenuContent>
// </DropdownMenu>

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  return <div className="relative inline-block" data-dropdown>{children}</div>;
}

export function DropdownMenuTrigger({ asChild: _asChild = false, children }: { asChild?: boolean; children: React.ReactElement }) {
  // We just render children; logic is handled in Content via contextless approach
  return children;
}

type Align = 'start' | 'center' | 'end';

export function DropdownMenuContent({ children, align = 'start', className = '' }: { children: React.ReactNode; align?: Align; className?: string }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLElement | null>(null);
  const id = useId();

  useEffect(() => {
    // Find previous sibling (trigger) button element
    const parent = menuRef.current?.parentElement;
    const trigger = parent?.querySelector('[data-dropdown] > *:first-child button, [data-dropdown] > *:first-child [role="button"], [data-dropdown] > *:first-child');
    if (trigger instanceof HTMLElement) {
      buttonRef.current = trigger;
      const onClick = () => setOpen((o) => !o);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen((o) => !o);
        }
      };
      trigger.addEventListener('click', onClick);
      trigger.addEventListener('keydown', onKey as any);
      return () => {
        trigger.removeEventListener('click', onClick);
        trigger.removeEventListener('keydown', onKey as any);
      };
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onEsc as any);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onEsc as any);
    };
  }, [open]);

  const alignment = align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0';

  return (
    <div ref={menuRef} className="relative" aria-expanded={open} aria-controls={id}>
      {open && (
        <div
          id={id}
          role="menu"
          className={`absolute z-50 mt-2 min-w-[8rem] rounded-md border bg-white p-1 shadow-lg focus:outline-none ${alignment} ${className}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({ children, onClick, className = '' }: { children: React.ReactNode; onClick?: (e?: React.MouseEvent) => void; className?: string }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={(e) => onClick?.(e)}
      className={`flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100 ${className}`}
    >
      {children}
    </button>
  );
}
