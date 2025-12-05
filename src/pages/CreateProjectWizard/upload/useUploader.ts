import { useCallback, useMemo, useRef, useState } from 'react'

export type UploadItem = {
  id: string
  file: File
  status: 'queued' | 'uploading' | 'done' | 'error'
  progress: number
  eta?: string
  error?: string
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function useUploader(opts?: { 
  maxFiles?: number; 
  maxSizeMB?: number; 
  accept?: string[]; 
  autoStart?: boolean;
  onError?: (error: string, file?: File) => void;
}) {
  // 🔹 Read from Vite environment variables
  const envMaxFiles = Number(import.meta.env.VITE_MAX_FILE_COUNT) 
  const envMaxSizeMB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB)
  const envAccept = import.meta.env.VITE_ACCEPT_MIME_TYPES ? import.meta.env.VITE_ACCEPT_MIME_TYPES.split(',') : undefined

  // 🔹 Use either passed options or env defaults
  const maxFiles = opts?.maxFiles ?? envMaxFiles
  const maxSizeMB = opts?.maxSizeMB ?? envMaxSizeMB
  const maxSize = maxSizeMB * 1024 * 1024
  const accept = opts?.accept ?? envAccept // Fallback to env if not provided
  const autoStart = opts?.autoStart ?? true
  const onError = opts?.onError

  const [queue, setQueue] = useState<UploadItem[]>([])
  const timers = useRef<Record<string, number>>({})

  const isFull = queue.length >= maxFiles
  const isUploading = queue.some(i => i.status === 'uploading')

  // --- START function must be defined first ---
  const start = useCallback(() => {
    setQueue((prev) => prev.map(i => (i.status === 'queued' ? { ...i, status: 'uploading' as const } : i)))
    setQueue((prev) => {
      prev.forEach((item) => {
        if (item.status !== 'uploading') return
        if (timers.current[item.id]) return
        const begin = Date.now()
        const totalMs = 2000 + Math.random() * 4000
        const tick = () => {
          const elapsed = Date.now() - begin
          const pct = Math.min(100, Math.round((elapsed / totalMs) * 100))
          const etaMs = Math.max(0, totalMs - elapsed)
          const eta = `${Math.ceil(etaMs / 1000)} sec left`
          setQueue(q => q.map(it => it.id === item.id ? { ...it, progress: pct, eta } : it))
          if (pct >= 100) {
            setQueue(q => q.map(it => it.id === item.id ? { ...it, status: 'done', eta: undefined } : it))
            cancelAnimationFrame(timers.current[item.id])
            delete timers.current[item.id]
          } else {
            timers.current[item.id] = requestAnimationFrame(tick)
          }
        }
        timers.current[item.id] = requestAnimationFrame(tick)
      })
      return prev
    })
  }, [])

  // --- addFiles ---
const addFiles = useCallback((files: File[]) => {
  // 🔹 If user tries to select more than maxFiles at once, reject all
  if (files.length > maxFiles) {
    onError?.(`You can upload only ${maxFiles} files`)
    return
  }

  setQueue(prev => {
    // 🔹 If queue already has files and adding new ones would exceed maxFiles
    if (prev.length + files.length > maxFiles) {
      onError?.(`You can upload only ${maxFiles} files in total`)
      return prev
    }

    const existing = new Set(prev.map(i => `${i.file.name}:${i.file.size}`))
    const toAdd: UploadItem[] = []

    for (const f of files) {
      if (f.size > maxSize) {
        onError?.(`File too large (max ${maxSizeMB}MB): ${f.name}`, f)
        continue
      }
      if (accept && !accept.some(a =>
        a.endsWith('/*') ? f.type.startsWith(a.slice(0, -1)) : f.type === a
      )) {
        onError?.(`Type not allowed: ${f.name}`, f)
        continue
      }
      const key = `${f.name}:${f.size}`
      if (existing.has(key)) {
        onError?.(`Duplicate file: ${f.name}`, f)
        continue
      }
      toAdd.push({
        id: generateUUID(),
        file: f,
        status: 'queued' as const,
        progress: 0,
      })
    }

    const next = [...prev, ...toAdd]

      // Auto-start immediately after queuing new files
    if (autoStart && toAdd.length > 0) {
      queueMicrotask(() => start())
    }

    return next
  })
}, [accept, maxFiles, maxSize, maxSizeMB, autoStart, onError, start])

  const restoreFiles = useCallback((files: File[]) => {
    setQueue(prev => {
      const existing = new Set(prev.map(i => `${i.file.name}:${i.file.size}`))
      const toAdd: UploadItem[] = files
        .filter(f => !existing.has(`${f.name}:${f.size}`))
        .map(f => ({
          id: generateUUID(),
          file: f,
          status: 'done' as const,
          progress: 100
        }))
      return [...prev, ...toAdd]
    })
  }, [])

  const cancel = useCallback((id: string) => {
    if (timers.current[id]) {
      cancelAnimationFrame(timers.current[id])
      delete timers.current[id]
    }
    setQueue(q => q.filter(i => i.id !== id))
  }, [])

  const remove = useCallback((id: string) => setQueue(q => q.filter(i => i.id !== id)), [])
  const retry = useCallback((id: string) => setQueue(q => q.map(i => i.id === id ? { ...i, status: 'queued', error: undefined, progress: 0 } : i)), [])
  const clear = useCallback(() => setQueue([]), [])

  return useMemo(() => ({
    queue,
    addFiles,
    start,
    cancel,
    remove,
    retry,
    clear,
    restoreFiles,
    isFull,
    isUploading
  }), [queue, addFiles, start, cancel, remove, retry, clear, restoreFiles, isFull, isUploading])
}
