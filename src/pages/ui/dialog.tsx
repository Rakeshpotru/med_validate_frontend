import { useEffect, useId } from 'react'

export const Dialog = ({ open, onOpenChange, children, ariaLabelledby }: { 
  open: boolean; 
  onOpenChange: (v: boolean) => void; 
  children: React.ReactNode; 
  ariaLabelledby: string 
}) => {
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
  }, [open])

  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={ariaLabelledby}>
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-4 md:p-6">
        <div className="pointer-events-auto w-full max-w-[720px] h-full rounded-2xl bg-white shadow-xl flex flex-col">
          <div className="flex-1 flex flex-col max-h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export const DialogHeader = ({ title, onClose, id: idAttr }: { 
  title: string; 
  onClose: () => void; 
  id?: string 
}) => {
  const gen = useId()
  const id = idAttr || gen
  
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#D8DDE4] bg-white px-6 py-4 rounded-t-[13px]">
      <h2 id={id} className="text-xl font-semibold">{title}</h2>
      <button 
        aria-label="Close" 
        onClick={onClose} 
        className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
      >
        ✕
      </button>
    </div>
  )
}

export const DialogBody = ({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
)

export const DialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="mt-auto border-t border-[#D8DDE4] bg-white px-6 py-4 rounded-b-[13px]">
    <div className="flex items-center justify-end gap-2">
      {children}
    </div>
  </div>
)
