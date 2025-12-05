import type { UploadItem } from './useUploader'
import { File as FileIcon, FileText, Image as ImageIcon, RotateCcw, Trash2, XCircle } from 'lucide-react'

function iconForType(type: string) {
  if (type.includes('pdf') || type.includes('msword') || type.includes('officedocument') || type.includes('spreadsheetml') || type.includes('excel') || type.startsWith('text/')) return FileText
  if (type.startsWith('image/')) return ImageIcon
  return FileIcon
}

export function UploadQueue({ uploader }: { uploader: { queue: UploadItem[]; start: () => void; cancel: (id: string) => void; remove: (id: string) => void; retry: (id: string) => void } }) {
  return (
    <div className="mt-4">
      <ul className="grid gap-3">
        {uploader.queue.map(item => {
          const Icon = iconForType(item.file.type)
          const meta = `${(item.file.size / (1024*1024)).toFixed(1)}MB · ${item.status === 'uploading' ? `Uploading ${item.progress}% · ${item.eta}` : item.status === 'done' ? 'Uploaded Successfully' : item.status === 'error' ? (item.error || 'Failed') : 'Queued'}`
          return (
            <li key={item.id} role="group" aria-live="polite" className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 transition-all duration-150 ease-out">
              <div className="flex items-center gap-4">
                <Icon className={["h-6 w-6 text-[#1f3a9d]", item.status === 'done' ? 'animate-pulse' : ''].join(' ')} aria-hidden />
                <div>
                  <div className="text-[14px] font-semibold text-[#111827]">{item.file.name}</div>
                  <div className="text-[13px] text-[#6B7280] transition-opacity duration-150">{meta}</div>
                  {item.status === 'uploading' && (
                    <div className="mt-2 h-1 w-64 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.progress}>
                      <div className="h-full bg-gradient-to-r from-[#1f3a9d] to-[#4f46e5]" style={{ width: `${item.progress}%` }} />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {item.status === 'uploading' && (
                  <button title="Cancel upload" aria-label="Cancel upload" onClick={() => uploader.cancel(item.id)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]">
                    <XCircle className="h-5 w-5 text-[#1f3a9d]" />
                  </button>
                )}
                {item.status === 'done' && (
                  <button title="Delete file" aria-label="Delete file" onClick={() => uploader.remove(item.id)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]">
                    <Trash2 className="h-5 w-5 text-[#1f3a9d]" />
                  </button>
                )}
                {item.status === 'error' && (
                  <button title="Retry upload" aria-label="Retry upload" onClick={() => uploader.retry(item.id)} className="grid h-9 w-9 place-items-center rounded-full hover:bg-[#F3F4F6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]">
                    <RotateCcw className="h-5 w-5 text-[#1f3a9d]" />
                  </button>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
