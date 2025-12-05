import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, Download, Lock } from 'lucide-react'
import { useProjectDraft } from './useProjectDraft'
import { useUploader } from './upload/useUploader'
import { FileDropZone } from './upload/FileDropZone'
import { UploadQueue } from './upload/UploadQueue'
import { Api_url } from '../../networkCalls/Apiurls'
import { showError, showSuccess, showWarn } from '../../services/toasterService'
import { getRequestStatus, postRequestStatus } from '../../networkCalls/NetworkCalls'
import RenderUiTemplate from "../../../public/RenderUi_Template";

export type Assignee = { id: string; name: string; role: string; avatarUrl?: string;roleId: number; }
export type OriginalFile = { file_id: number; file_name: string }
const mandatoryRoles = import.meta.env.VITE_MANDATORY_ROLES
  ? import.meta.env.VITE_MANDATORY_ROLES.split(',').map(Number)
  : []

// ---------------- Assignee Item ----------------
function AssigneeItem({
  a,
  selected,
  onToggle,
  originalAssignees,
  projectStatus,
}: {
  a: Assignee
  selected: boolean
  onToggle: (id: string) => void
  originalAssignees: string[]
  projectStatus: number | null
}) {
  const isExistingAssignee = originalAssignees.includes(a.id)
  const isLocked = selected && isExistingAssignee && projectStatus !== 8

  const handleToggle = () => {
    if (isLocked) {
      showWarn('Cannot remove assignees after the project has started.')
      return
    }
    onToggle(a.id)
  }

  return (
    <div
      role="option"
      aria-selected={selected}
      tabIndex={isLocked ? -1 : 0}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleToggle()
        }
      }}
      className={[
        'flex cursor-pointer items-center justify-between rounded-lg px-4 h-12 transition-colors border',
        selected ? 'bg-brand/10 border-brand' : 'hover:bg-black/5 border-transparent',
        isLocked ? 'cursor-not-allowed opacity-60' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative h-8 w-8">
          {selected ? (
            <div className="grid h-8 w-8 place-items-center">
              {isLocked ? (
                <Lock className="h-6 w-6 text-gray-400" aria-hidden />
              ) : (
                <CheckCircle className="h-6 w-6 text-brand" aria-hidden />
              )}
            </div>
          ) : a.avatarUrl ? (
            <img
              src={a.avatarUrl}
              alt={a.name}
              className="h-8 w-8 rounded-full object-cover"
              onError={(e) => {
                // Fallback to initials on image load error
                e.currentTarget.style.display = 'none'
                const fallback = e.currentTarget.nextSibling as HTMLElement
                if (fallback) fallback.style.display = 'flex'
              }}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-400 text-center text-xs flex items-center justify-center text-white">
              {a.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div>
          <div className="text-[12px] font-semibold text-[#111827] leading-tight">{a.name}</div>
          <div className="text-[11px] text-[#6B7280] leading-tight flex items-center gap-1">
  {a.role}
  {mandatoryRoles.includes(a.roleId) && (
    <span className="inline-block px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
      {/* Required */}
    </span>
  )}
</div>
        </div>
      </div>
      <span className="h-5 w-5" aria-hidden />
    </div>
  )
}

// ---------------- Assignee List ----------------
function AssigneeList({
  items,
  selectedIds,
  onToggle,
  originalAssignees,
  projectStatus,
}: {
  items: Assignee[]
  selectedIds: string[]
  onToggle: (id: string) => void
  originalAssignees: string[]
  projectStatus: number | null
}) {
  return (
    <div role="listbox" aria-multiselectable="true" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {items.map((a) => (
        <AssigneeItem
          key={a.id}
          a={a}
          selected={selectedIds.includes(a.id)}
          onToggle={onToggle}
          originalAssignees={originalAssignees}
          projectStatus={projectStatus}
        />
      ))}
    </div>
  )
}

// ---------------- Existing Files List (for Edit Mode) ----------------
function ExistingFilesList({
  files,
  keptFileIds,
  onKeepChange,
  onRemove,
}: {
  files: OriginalFile[]
  keptFileIds: number[]
  onKeepChange: (fileId: number, keep: boolean) => void
  onRemove: (fileId: number) => void
}) {
  const handleDownload = (fileName: string) => {
    // Using getProjectFile API endpoint, passing file name as query parameter
    const downloadUrl = Api_url.getProjectFile(fileName)
    console.log(downloadUrl,"downloadUrl")
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (files.length === 0) return null

  return (
    <div className="mt-4">
      <div className="mb-2 text-sm font-medium text-gray-700">Existing Files</div>
      <div className="space-y-2">
        {files.map((file) => {
          const isKept = keptFileIds.includes(file.file_id)
          return (
            <div
              key={file.file_id}
              className="flex items-center justify-between rounded-md border border-gray-200 p-3 bg-white"
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  id={`keep-${file.file_id}`}
                  checked={isKept}
                  onChange={(e) => onKeepChange(file.file_id, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`keep-${file.file_id}`} className="text-sm font-medium text-gray-900 cursor-pointer">
                  {file.file_name}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(file.file_name)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                  aria-label={`Download ${file.file_name}`}
                  title="Download file"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------- Step3AssignUpload Component ----------------
interface Step3Props {
  originalFiles?: OriginalFile[]
  keptFileIds?: number[]
  onFileKeepChange: (fileId: number, keep: boolean) => void
  onFileRemove: (fileId: number) => void
  originalAssignees: string[]
  projectStatus: number | null
  isEditMode?: boolean
  showCrApproved?: boolean;
  onCrFileChanged?: () => void
  onCrFormChanged?: () => void
}

export default function Step3AssignUpload({
  originalFiles = [],
  keptFileIds = [],
  onFileKeepChange,
  onFileRemove,
  originalAssignees = [],
  projectStatus = null,
  isEditMode = false,
  showCrApproved = false,
  onCrFileChanged,
  onCrFormChanged,
}: Step3Props) {
  const { draft, toggleAssignee, setUploadedFiles, setChangeRequestCode, setChangeRequestFile, setCrMethod, setChangeRequestJson } = useProjectDraft()

  const [assignees, setAssignees] = useState<Assignee[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const [crFormSchema, setCrFormSchema] = useState<any>(null);
  const [crCurrentTemplateId, setCrCurrentTemplateId] = useState<number | null>(null);
  const [showCrForm, setShowCrForm] = useState(false);
  const [crInitialData, setCrInitialData] = useState<any>(null);

  const allowedFileTypes_CR = import.meta.env.VITE_CR_ALLOWED_FILE_TYPES
  const maxFileSizeMB_CR = Number(import.meta.env.VITE_CR_MAX_FILE_SIZE_MB)
  const crTemplateType = Number(import.meta.env.VITE_CR_TEMPLATE_TYPE) || 5;

  const maxSizeMB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB)
  const envAcceptMIMETypes = (import.meta.env.VITE_ACCEPT_MIME_TYPES || '').split(',').filter(Boolean);
  const uploader = useUploader({
    maxFiles: Number(import.meta.env.VITE_MAX_FILE_COUNT),
    maxSizeMB,
    accept: envAcceptMIMETypes, // Pass env-based accept
    onError: (error, file) => {
      showError(error)
    }
  })

  // Restore initial files from draft only once on mount
  useEffect(() => {
    if (draft.uploadedFiles?.length) {
      uploader.restoreFiles(draft.uploadedFiles)
    }
  }, []) // Empty deps: runs only on initial render

  // Keep draft in sync with uploader queue
  useEffect(() => {
    setUploadedFiles(uploader.queue.map((item) => item.file))
  }, [uploader.queue, setUploadedFiles])

  // Fetch assignees
  useEffect(() => {
    setLoading(true)
    getRequestStatus<any>(Api_url.getUsers)
      .then((res) => {
        const users = res.data?.data || []
        const mapped: Assignee[] = users.map((u: any) => {
          const avatarUrl = u.image_url ? `${Api_url.user_images}/${u.image_url}` : undefined
          return {
            id: u.user_id.toString(),
            name: u.user_name,
            role: u.role_name,
            roleId: Number(u.role_id),    // ← ADD THIS LINE
            avatarUrl,
          }
        })
        setAssignees(mapped)
      })
      .catch((err) => {
        console.error('Failed to fetch users:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredAssignees = assignees.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // const isEditMode = originalFiles.length > 0 // Infer edit mode if original files exist
  // Helper: Current file name for display in input branches
  const isChangeRequestEditable = !isEditMode || !draft.isVerified

  const currentChangeRequestFileName = draft.changeRequestFile?.name || draft.changeRequestFileName || ''

  // NEW: Download handler for Change Request file (edit mode only, existing files)
  const handleDownloadCR = (fileName: string) => {
    const downloadUrl = Api_url.getChangeRequestFile(fileName)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Helper: Determine displayed file name and whether to show download
  const displayedCRFileName = draft.changeRequestFile?.name || draft.changeRequestFileName || ''
  const showCRDownload = isEditMode && !!draft.changeRequestFileName && !draft.changeRequestFile

  const handleCreateCrForm = useCallback(async () => {
    if (crFormSchema) {
      setShowCrForm(prev => !prev);
      return;
    }
    if (isEditMode && draft.changeRequestJson) {

      try {

        const parsedSchema = typeof draft.changeRequestJson === 'object' && draft.changeRequestJson !== null

          ? draft.changeRequestJson

          : JSON.parse(draft.changeRequestJson);

        setCrFormSchema(parsedSchema);

        setCrCurrentTemplateId(draft.transactionTemplateId);

        setCrInitialData(null);

        setShowCrForm(true);

      } catch (error) {

        console.error("Failed to parse CR json:", error);

        showError("Failed to load CR form template.");

      }

      return;

    }
    try {
      const response = await getRequestStatus<any>(
        Api_url.getAllTemplates(crTemplateType)
      );

      console.log("CR Template API response:", response);

      const templateObject = response?.data?.data;

      if (templateObject) {

        let template;

        if (isEditMode && draft.transactionTemplateId) {

          // In edit mode, use the template only if ID matches
          if (templateObject.template_id === draft.transactionTemplateId) {
            template = templateObject;
          } else {
            showWarn("Template ID mismatch.");
            return;
          }

        } else {

          // Create mode → directly use the returned template
          template = templateObject;
        }

        setCrFormSchema(template.json_template || null);
        setCrCurrentTemplateId(template.template_id || null);
      }
      else {
        setCrFormSchema(null);
        setCrCurrentTemplateId(null);
        showWarn("No template data found.");
        return;
      }

      setShowCrForm(true);

    } catch (error) {
      console.error("Failed to fetch CR templates:", error);
      showError("Failed to load CR form template.");
    }

  }, [crFormSchema, isEditMode, draft.transactionTemplateId, draft.changeRequestJson, crTemplateType]);

  const handleCrFormSubmit = async (submittedData: any) => {
    console.log("Submitted data:", submittedData);
    setChangeRequestJson(JSON.stringify(submittedData));
    setCrFormSchema(submittedData);
    showSuccess("CR Form saved successfully!");
    setShowCrForm(false);
    onCrFormChanged?.()
  };

  // MODIFIED: Initialize CR method and auto-load form in edit mode if 'form'
  useEffect(() => {

    if (isEditMode && draft.transactionTemplateId !== undefined) {

      const method = draft.transactionTemplateId ? 'form' : 'file';

      setCrMethod(method);

      // Set initial data for pre-filling in edit mode

      if (method === 'form' && draft.changeRequestJson) {
        try {
          const parsed = typeof draft.changeRequestJson === 'object' && draft.changeRequestJson !== null
            ? draft.changeRequestJson
            : JSON.parse(draft.changeRequestJson);
          setCrInitialData(parsed);
        } catch (error) {
          console.error("Failed to parse initial CR data:", error);
          setCrInitialData(null);
        }
      }

      // Fetch the specific template schema if 'form' (still needed for rendering, but uses correct ID)



    }

  }, [isEditMode, draft.transactionTemplateId, draft.changeRequestJson, setCrMethod, handleCreateCrForm]);
  const isCrButtonDisabled = isEditMode && (draft.isVerified !== false);



  const crButtonClassName = isCrButtonDisabled

    ? 'w-full px-4 py-2 bg-gray-200 text-gray-500 rounded-md text-sm font-medium cursor-not-allowed'

    : 'w-full px-4 py-2 bg-green-500 text-white rounded-md text-sm font-medium hover:bg-green-600 transition-colors';
  const isFileInputDisabled = isEditMode && (draft.isVerified !== false);



  const fileInputLabelClassName = isFileInputDisabled

    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'

    : 'bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100';



  const showRejectReason = draft.isVerified === false && (draft.rejectReason?.length ?? 0) > 0;


  return (
    <div className="grid gap-6">
      {/* Assign to project */}
      <section className="space-y-4">
  {/* Header */}
  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
    Assign team members to the project <span className="ml-1 text-red-500">*</span>
  </h3>

  {/* Mandatory Roles Info - Enhanced with icon and better spacing */}
  {mandatoryRoles.length > 0 && (
    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg shadow-sm">
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0 w-5 h-5 text-purple-600 mt-0.5">
          {/* Simple required icon - inline SVG */}
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
        <div>
          <div className="text-xs font-medium text-purple-800 mb-1">Required Roles</div>
          <div className="text-xs text-purple-700">
            At least one {assignees
              .filter(a => mandatoryRoles.includes(a.roleId))
              .map(a => a.role)
              .filter((role, index, arr) => arr.indexOf(role) === index)
              .join(', ')} must be selected
          </div>
        </div>
      </div>
    </div>
  )}

  {/* Selected Users as Chips */}
  <div className="flex flex-wrap gap-2 mb-3">
    {draft.assigneeIds?.map(id => {
      const user = assignees.find(a => a.id === id);
      return user ? (
        <div key={id} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm shadow-sm hover:shadow-md transition-shadow">
          <span className="truncate max-w-[150px]">{user.name}</span>
          <button
            type="button"
            onClick={() => toggleAssignee(id)}
            className="ml-1 text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full w-4 h-4 flex items-center justify-center hover:bg-blue-200"
            aria-label={`Remove ${user.name}`}
          >
            <span className="text-xs font-bold">×</span>
          </button>
        </div>
      ) : null;
    })}
  </div>

  {loading ? (
    <div className="flex items-center justify-center py-8 text-sm text-gray-500">
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300 mr-2"></div>
      Loading...
    </div>
  ) : (
    <>
      {/* Search Input - Enhanced with icon and clear button */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {/* Inline search icon SVG */}
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Add team members..."
          className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          aria-label="Search and add team members"
        />
        {searchQuery && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            onClick={() => setSearchQuery('')}
            aria-label="Clear search"
          >
            <span className="text-xs font-bold">×</span>
          </button>
        )}
      </div>

      {/* Search Results - Conditional with empty state */}
      {searchQuery && (
        <div className="mt-2">
          {filteredAssignees.length > 0 ? (
            <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto bg-white shadow-inner">
              <AssigneeList
                items={filteredAssignees}
                selectedIds={draft.assigneeIds || []}
                onToggle={toggleAssignee}
                originalAssignees={originalAssignees}
                projectStatus={projectStatus}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg">
              {/* Inline search icon for empty state */}
              <svg className="h-8 w-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <div>No matching users found</div>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-1 text-xs text-blue-600 hover:underline"
              >
                Clear search to see all
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )}
</section>

      {/* Required Phases - Upload */}
      <section>
        <h3 className="mb-3 text-sm font-medium">Upload files</h3>
        <FileDropZone
          onFiles={(files: File[]) => uploader.addFiles(files)}
          disabled={uploader.isFull}
          helperId="upload-help"
        />
        <p id="upload-help" className="sr-only">
          Drag and drop to upload files or browse using the file picker
        </p>
        {/* Upload Guidelines (from .env) */}
        <p className="mt-2 text-xs text-gray-500">
          Accepted file types:{" "}
          <span className="font-medium">
            {import.meta.env.VITE_FILE_ACCEPT.replace(/,/g, ", ")}
          </span>
        </p>

        {/* Existing Files (Edit Mode Only) */}
        {isEditMode && (
          <ExistingFilesList
            files={originalFiles}
            keptFileIds={keptFileIds}
            onKeepChange={onFileKeepChange}
            onRemove={onFileRemove}
          />
        )}

        {/* New Uploaded Files */}
        {uploader.queue.length > 0 && (
          <div className="mt-4">
            <div className="mb-2 text-sm font-medium text-gray-700">
              {isEditMode ? 'New Uploaded Files' : 'Uploaded Files'}
            </div>
            <UploadQueue uploader={uploader} />
          </div>
        )}
      </section>

      {/* Change Request Selection: File or Form */}
      <section>
        <h3 className="mb-3 text-sm font-medium">
          Change Request {!isEditMode && <span className="text-red-500">*</span>}
        </h3>
        {/* Radio Buttons */}
        <div className="space-y-2 mb-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="crMethod"
              value="file"
              checked={draft.crMethod === 'file'}
              onChange={() => setCrMethod('file')}
              className="mr-2 h-4 w-4 text-brand focus:ring-brand"
              disabled={isEditMode}
            />
            <span className="text-sm">Upload Change Request</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="crMethod"
              value="form"
              checked={draft.crMethod === 'form'}
              onChange={() => setCrMethod('form')}
              className="mr-2 h-4 w-4 text-brand focus:ring-brand"
              disabled={isEditMode}
            />
            <span className="text-sm">Create Change Request</span>
          </label>
        </div>

        {/* Conditional Content */}
        {draft.crMethod === 'file' ? (
          <>
            {/* Change Request Code — Only visible when "file" is selected */}
            <div className={isEditMode ? 'opacity-60 pointer-events-none mb-6' : 'mb-6'}>
              <h3 className="mb-3 text-sm font-medium">
                Change Request Number {!isEditMode && <span className="text-red-500">*</span>}
              </h3>
              <input
                type="text"
                value={draft.changeRequestCode || ''}
                onChange={(e) => setChangeRequestCode(e.target.value)}
                placeholder="Enter change request number"
                disabled={isEditMode}
                className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  isEditMode
                    ? 'bg-gray-100 cursor-not-allowed border-gray-300'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
            </div>

            {/* File Upload UI */}
            <div className={isEditMode ? 'space-y-2' : 'flex items-center gap-3'}>
              {isEditMode ? (
                <>
                  <label className={`relative inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${fileInputLabelClassName}`}>
                    Choose File
                    <input
                      type="file"
                      onChange={(e) => {
                        if (isFileInputDisabled) return
                        const file = e.target.files?.[0] || null
                        if (file && file.size > maxFileSizeMB_CR * 1024 * 1024) {
                          showWarn(`File size must not exceed ${maxFileSizeMB_CR} MB.`)
                          return
                        }
                        const allowed = allowedFileTypes_CR.split(',')
                        const isAllowed = allowed.some((ext) =>
                          file?.name.toLowerCase().endsWith(ext.trim().toLowerCase())
                        )
                        if (!isAllowed) {
                          showWarn(`Only ${allowedFileTypes_CR} files are allowed.`)
                          return
                        }
                        setChangeRequestFile(file)
                        onCrFileChanged?.();
                      }}
                      accept={allowedFileTypes_CR}
                      disabled={isFileInputDisabled}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                  <span className="text-sm text-gray-700 truncate max-w-[250px]">
                    {displayedCRFileName || 'No file selected'}
                  </span>
                  {showCRDownload && (
                    <button
                      type="button"
                      onClick={() => handleDownloadCR(draft.changeRequestFileName!)}
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      aria-label="Download file"
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <label className="relative inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-md cursor-pointer hover:bg-blue-100 transition-colors text-sm font-medium">
                    Choose File
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        if (file && file.size > maxFileSizeMB_CR * 1024 * 1024) {
                          showWarn(`File size must not exceed ${maxFileSizeMB_CR} MB.`)
                          return
                        }
                        const allowed = allowedFileTypes_CR.split(',')
                        const isAllowed = allowed.some((ext) =>
                          file?.name.toLowerCase().endsWith(ext.trim().toLowerCase())
                        )
                        if (!isAllowed) {
                          showWarn(`Only ${allowedFileTypes_CR} files are allowed.`)
                          return
                        }
                        setChangeRequestFile(file)
                        onCrFileChanged?.();
                      }}
                      accept={allowedFileTypes_CR}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </label>
                  <span className="text-sm text-gray-700 truncate max-w-[250px]">
                    {draft.changeRequestFile?.name || 'No file selected'}
                  </span>
                </>
              )}

              {showRejectReason && (
                <div className="text-sm mt-3">
                <span className="font-semibold text-yellow-700 block mb-1">
                  CR Rejected:
                </span>

                <div className="space-y-1">
                  {draft.rejectReason?.map((item, index) => (
                    <div key={index} className="flex gap-1 text-gray-400 max-w-xs">
                      <span className="font-medium text-gray-300">{item.user_name}:</span>{' '}
                      <span className="inline-block truncate" title={item.reject_reason}>
                        {item.reject_reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              )}
              {showCrApproved && <p className="text-green-600 font-medium mt-2">CR Approved</p>}
            </div>
          </>
        ) : (
          /* Form Method */
          <div className="space-y-4">
            <button
              onClick={handleCreateCrForm}
              disabled={isCrButtonDisabled}
              className={crButtonClassName}
            >
              {draft.changeRequestJson ? 'Edit CR Form' : 'Create CR Form'}
            </button>

            {showRejectReason && (
              <div className="text-sm mt-3">
              <span className="font-semibold text-yellow-700 block mb-1">
                CR Rejected:
              </span>

              <div className="space-y-1">
                {draft.rejectReason?.map((item, index) => (
                  <div key={index} className="flex gap-1 text-gray-400 max-w-xs">
                    <span className="font-medium text-gray-300">{item.user_name}:</span>{' '}
                    <span className="inline-block truncate" title={item.reject_reason}>
                      {item.reject_reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            )}
            {showCrApproved && <p className="text-green-600 font-medium mt-2">CR Approved</p>}
          </div>
        )}
      </section>
      
      {showCrForm && crFormSchema && (
        <div className="fixed inset-0 bg-[#000000b5] bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 p-6 relative">
            <button
              onClick={() => setShowCrForm(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-800 text-2xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
              Change Request Form
            </h2>
            <div className="overflow-y-auto max-h-[70vh]">
              <RenderUiTemplate
                formSchema={crFormSchema}
                initialData={crInitialData}
                onSubmit={handleCrFormSubmit}
                buttonMode={2}
                allFieldsEnabledOrDisabled={true}
                commentsEnabled={2}
              />
            </div>
          </div>
        </div>

      )}
    </div>
  )
}

