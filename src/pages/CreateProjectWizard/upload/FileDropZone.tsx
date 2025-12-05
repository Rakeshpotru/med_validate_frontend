import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { UploadCloud } from 'lucide-react'

export function FileDropZone({ onFiles, disabled, helperId }: { onFiles: (files: File[]) => void; disabled?: boolean; helperId?: string }) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const id = useId();
  const maxFiles = import.meta.env.VITE_MAX_FILE_COUNT || '10';
  const acceptValue = import.meta.env.VITE_FILE_ACCEPT;

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (disabled) return
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(files)
  }, [onFiles, disabled])

  const openPicker = useCallback(() => {
    if (disabled) return
    inputRef.current?.click()
  }, [disabled])

  const handleMouseEnter = useCallback(() => {
    if (disabled) {
      setShowTooltip(true)
    }
  }, [disabled])

  const handleMouseLeave = useCallback(() => {
    setShowTooltip(false)
  }, [])

  return (
    <div className="mb-6 relative">
      <div
        role="button"
        aria-describedby={helperId}
        tabIndex={0}
        onClick={openPicker}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPicker() } }}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={[
          'group flex w-full flex-col items-center justify-center rounded-lg border border-dashed transition-colors duration-200 motion-reduce:duration-0',
          'px-4 py-5',
          disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
          dragOver ? 'border-[#1f3a9d] bg-[#F9FAFB]' : 'border-gray-300 hover:bg-[#F9FAFB] motion-reduce:hover:bg-[#F3F4F6]'
        ].join(' ')}
        style={{ borderWidth: 1 }}
      >
        <UploadCloud className="h-6 w-6 text-[#1f3a9d]" aria-hidden />
        <div className="mt-2 text-[13px] font-semibold text-gray-900">Drag and drop to upload file</div>
        <div className="text-[12px] text-[#6B7280]">Or</div>
        <button
          className="mt-2 rounded-md bg-[#1f3a9d] px-3.5 py-1.5 text-[12px] font-medium text-white shadow-sm hover:bg-[#19307d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
          type="button"
        >
          Browse File
        </button>
        {disabled && showTooltip && (
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[12px] px-2 py-1 rounded-md whitespace-nowrap z-10 shadow-lg">
            Accepts only {maxFiles} files
          </div>
        )}
      </div>
      <input ref={inputRef} id={id} type="file" className="hidden" multiple accept={acceptValue} onChange={(e) => {
        const files = e.currentTarget.files ? Array.from(e.currentTarget.files) : []
        if (files.length) onFiles(files)
        e.currentTarget.value = ''
      }} />
      <div className="sr-only" aria-live="polite"></div>
    </div>
  )
}