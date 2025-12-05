// import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

//  type ProjectDraft = {
//   title: string
//   description?: string
//   equipmentIds: string[]
//   step: 1 | 2 | 3
//   riskAnswer?: string
//   riskLevel: 'low' | 'medium' | 'high'
//   requiredPhases: string[]
//   assigneeIds: string[]
// }

// const DraftCtx = createContext<{
//   draft: ProjectDraft
//   setTitle: (t: string) => void
//   setDescription: (d: string) => void
//   toggleEquipment: (id: string) => void
//   setStep: (s: 1|2|3) => void
//   setRiskAnswer: (a: string) => void
//   setRiskLevel: (l: 'low'|'medium'|'high') => void
//   setRequiredPhases: (p: string[]) => void
//   toggleAssignee: (id: string) => void
// } | null>(null)

// export function ProjectDraftProvider({ children, initial }: { children: React.ReactNode; initial?: Partial<ProjectDraft> }) {
//   const [draft, setDraft] = useState<ProjectDraft>({ title: '', description: '', equipmentIds: [], assigneeIds: [], step: 1, riskAnswer: undefined, riskLevel: 'low', requiredPhases: ['URS','FRS','DQ'], ...initial })
//   const setTitle = useCallback((t: string) => setDraft(d => ({ ...d, title: t })), [])
//   const setDescription = useCallback((desc: string) => setDraft(d => ({ ...d, description: desc })), [])
//   const toggleEquipment = useCallback((id: string) => setDraft(d => ({ ...d, equipmentIds: d.equipmentIds.includes(id) ? d.equipmentIds.filter(x => x !== id) : [...d.equipmentIds, id] })), [])
//   const setStep = useCallback((s: 1|2|3) => setDraft(d => ({ ...d, step: s })), [])
//   const setRiskAnswer = useCallback((a: string) => setDraft(d => ({ ...d, riskAnswer: a })), [])
//   const setRiskLevel = useCallback((l: 'low'|'medium'|'high') => setDraft(d => ({ ...d, riskLevel: l })), [])
//   const setRequiredPhases = useCallback((p: string[]) => setDraft(d => ({ ...d, requiredPhases: p })), [])
//   const toggleAssignee = useCallback((id: string) => setDraft(d => ({ ...d, assigneeIds: d.assigneeIds.includes(id) ? d.assigneeIds.filter(x => x !== id) : [...d.assigneeIds, id] })), [])
//   const value = useMemo(() => ({ draft, setTitle, setDescription, toggleEquipment, setStep, setRiskAnswer, setRiskLevel, setRequiredPhases, toggleAssignee }), [draft, setTitle, setDescription, toggleEquipment, setStep, setRiskAnswer, setRiskLevel, setRequiredPhases, toggleAssignee])
//   return React.createElement(DraftCtx.Provider, { value }, children)
// }

// export function useProjectDraft() {
//   const ctx = useContext(DraftCtx)
//   if (!ctx) throw new Error('useProjectDraft must be used within ProjectDraftProvider')
//   return ctx
// }

// useProjectDraft.tsx  

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'

export interface RejectReasonItem {
  user_name: string;
  reject_reason: string;
}

type ProjectDraft = {
  title: string
  description?: string
  startDate?: string
  endDate?: string
  equipmentIds: string[]
  step: 1 | 2 | 3
  riskAnswer?: string
  riskLevel: 'low' | 'medium' | 'high'
  requiredPhases: number[]
  assigneeIds: string[]
  uploadedFiles?: File[]   //  add this
  testingAssetType?: string
  createdBy?: number       // added
  changeRequestCode?: string
  changeRequestFile?: File | null
  changeRequestFileId?: string
  changeRequestFileName?: string
  isVerified?: boolean
  rejectReason?:RejectReasonItem[];
  changeRequestJson?: string
  transactionTemplateId?: number | null
  crMethod: 'file' | 'form'
  // NEW: Added fields
  renewalYear?: string
  make?: string
  model?: number | undefined
  jsonTemplateId?: number | null
  formSchema?: any
  savedTemplateData?: any
  templateFormatTypeId?: number | null
   savedTemplateFormatTypeId?: number | null
}

const DraftCtx = createContext<{
  draft: ProjectDraft
  setTitle: (t: string) => void
  setDescription: (d: string) => void
  setStartDate: (d: string) => void
  setEndDate: (d: string) => void
  toggleEquipment: (id: string) => void
  setStep: (s: 1|2|3) => void
  setRiskAnswer: (a: string) => void
  setRiskLevel: (l: 'low'|'medium'|'high') => void
  setRequiredPhases: (p: number[]) => void
  toggleAssignee: (id: string) => void
  setUploadedFiles: (files: File[]) => void
  setTestingAssetType: (t: string) => void
  resetDraft: () => void    // added
  setChangeRequestCode: (code: string) => void
  setChangeRequestFile: (file: File | null) => void
  setChangeRequestFileName: (name: string) => void
  setIsVerified: (verified: boolean) => void
  setRejectReason: (reason: RejectReasonItem[]) => void;
  setChangeRequestJson: (json: string) => void
  setTransactionTemplateId: (id: number | null) => void
  setCrMethod: (method: 'file' | 'form') => void
  // NEW: Added setters
  setRenewalYear: (y: string) => void
  setMake: (m: string) => void
  setModel: (m: number | undefined) => void
  setJsonTemplateId: (id: number | null) => void
  setFormSchema: (schema: any) => void
  setSavedTemplateData: (data: any) => void
   setTemplateFormatTypeId: (id: number | null) => void
   setSavedTemplateFormatTypeId: (id: number | null) => void
} | null>(null)

export function ProjectDraftProvider({ children, initial }: { children: React.ReactNode; initial?: Partial<ProjectDraft> }) {
  const [draft, setDraft] = useState<ProjectDraft>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    equipmentIds: [],
    assigneeIds: [],
    step: 1,
    riskAnswer: undefined,
    riskLevel: 'low',
    requiredPhases: [],
    uploadedFiles: [],
    changeRequestCode: '',
    changeRequestFile: null,
    changeRequestFileId: '',
    changeRequestFileName: '',
    isVerified: false,
    rejectReason: '',
    crMethod: 'file',
    changeRequestJson: '',
    transactionTemplateId: null,
    jsonTemplateId: null,
  formSchema: null,
  savedTemplateData: null,
  templateFormatTypeId: null,
  savedTemplateFormatTypeId: null,
    ...initial
  })

  const setTitle = useCallback((t: string) => setDraft(d => ({ ...d, title: t })), [])
  const setDescription = useCallback((desc: string) => setDraft(d => ({ ...d, description: desc })), [])
  const setStartDate = useCallback((date: string) => setDraft(d => ({ ...d, startDate: date })), [])
  const setEndDate = useCallback((date: string) => setDraft(d => ({ ...d, endDate: date })), [])
  const toggleEquipment = useCallback((id: string) => setDraft(d => ({
        ...d,
    equipmentIds: d.equipmentIds.includes(id) ? d.equipmentIds.filter(x => x !== id) : [...d.equipmentIds, id]
  })), [])
  const setStep = useCallback((s: 1|2|3) => setDraft(d => ({ ...d, step: s })), [])
  const setRiskAnswer = useCallback((a: string) => setDraft(d => ({ ...d, riskAnswer: a })), [])
  const setRiskLevel = useCallback((l: 'low'|'medium'|'high') => setDraft(d => ({ ...d, riskLevel: l })), [])
  const setRequiredPhases = useCallback((p: number[]) => setDraft(d => ({ ...d, requiredPhases: p })), [])
  const toggleAssignee = useCallback((id: string) => setDraft(d => ({
        ...d,
        assigneeIds: d.assigneeIds.includes(id)
          ? d.assigneeIds.filter((x) => x !== id)
          : [...d.assigneeIds, id],
      })),
    []
  )
  const setUploadedFiles = useCallback((files: File[]) => setDraft((d) => ({ ...d, uploadedFiles: files })), [])
  const setTestingAssetType = useCallback((t: string) => setDraft((d) => ({ ...d, testingAssetType: t })), [])
  const setChangeRequestCode = useCallback((code: string) => setDraft((d) => ({ ...d, changeRequestCode: code })), [])
  const setChangeRequestFile = useCallback((file: File | null) => setDraft((d) => ({ ...d, changeRequestFile: file, changeRequestFileName: file ? file.name : '' })), [])
  const setChangeRequestFileName = useCallback((name: string) => setDraft((d) => ({ ...d, changeRequestFileName: name })), [])
  const setIsVerified = useCallback((verified: boolean) => setDraft(d => ({ ...d, isVerified: verified })), [])
  const setRejectReason = useCallback((reason: string) => setDraft(d => ({ ...d, rejectReason: reason })), [])
  const setJsonTemplateId = useCallback((id: number | null) => setDraft((d) => ({ ...d, jsonTemplateId: id })), [])
  const setFormSchema = useCallback((schema: any) => setDraft((d) => ({ ...d, formSchema: schema })), [])
  const setSavedTemplateData = useCallback((data: any) => setDraft((d) => ({ ...d, savedTemplateData: data })), [])
  const setRenewalYear = useCallback((y: string) => setDraft((d) => ({ ...d, renewalYear: y || undefined })), [])
  const setMake = useCallback((m: string) => setDraft((d) => ({ ...d, make: m || undefined })), [])
  const setModel = useCallback((m: number | undefined) => setDraft((d) => ({ ...d, model: m })), [])
  const setTemplateFormatTypeId = useCallback((id: number | null) => setDraft(d => ({ ...d, templateFormatTypeId: id })),[])
  
  const setSavedTemplateFormatTypeId = useCallback((id: number | null) => setDraft(d => ({ ...d, savedTemplateFormatTypeId: id })),[])
  const resetDraft = useCallback(() => {
    setDraft({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      equipmentIds: [],
      assigneeIds: [],
      step: 1,
      riskAnswer: undefined,
      riskLevel: 'low',
      requiredPhases: [],
      uploadedFiles: [],
      changeRequestCode: '',
      changeRequestFile: null,
      changeRequestFileId: '',
      changeRequestFileName: '',
      isVerified: false,
      rejectReason: '',
      crMethod: 'file',
      changeRequestJson: '',
      transactionTemplateId: null,
      templateFormatTypeId: null,
      savedTemplateData: null,
      savedTemplateFormatTypeId: null,
      ...initial
    })
  }, [initial])
  // NEW: Added setters
  // const setRenewalYear = useCallback((y: string) => setDraft(d => ({ ...d, renewalYear: y || undefined })), [])
  // const setMake = useCallback((m: string) => setDraft(d => ({ ...d, make: m || undefined })), [])
  // const setModel = useCallback((m: number | undefined) => setDraft(d => ({ ...d, model: m })), [])
  const setChangeRequestJson = useCallback((json: string) => setDraft(d => ({ ...d, changeRequestJson: json })), [])
  const setTransactionTemplateId = useCallback((id: number | null) => setDraft(d => ({ ...d, transactionTemplateId: id })), [])
  const setCrMethod = useCallback((method: 'file' | 'form') => setDraft(d => ({ ...d, crMethod: method })), [])
  const value = useMemo(() => ({
    draft,
    setTitle,
    setDescription,
    setStartDate,
    setEndDate,
    toggleEquipment,
    setStep,
    setRiskAnswer,
    setRiskLevel,
    setRequiredPhases,
    toggleAssignee,
    setUploadedFiles,
    setTestingAssetType,
    resetDraft,  //  added
    setChangeRequestCode,
    setChangeRequestFile,
    setChangeRequestFileName,
    setIsVerified,
    setRejectReason,
    setChangeRequestJson,
    setTransactionTemplateId,
    setCrMethod,
    // NEW: Added setters
    setRenewalYear,
    setMake,
    setModel,
	setJsonTemplateId,
      setFormSchema,
      setSavedTemplateData,
      setTemplateFormatTypeId,
       setSavedTemplateFormatTypeId,
  }), [draft, setTitle, setDescription, setStartDate, setEndDate, toggleEquipment, setStep, setRiskAnswer, setRiskLevel, setRequiredPhases, toggleAssignee, setUploadedFiles, setTestingAssetType, resetDraft, setChangeRequestCode, setChangeRequestFile, setChangeRequestFileName, setIsVerified, setRejectReason,  setChangeRequestJson, setTransactionTemplateId, setCrMethod, setRenewalYear, setMake, setModel, setJsonTemplateId,
      setFormSchema,
      setSavedTemplateData, setTemplateFormatTypeId, setSavedTemplateFormatTypeId])
  return React.createElement(DraftCtx.Provider, { value }, children)
}

export function useProjectDraft() {
  const ctx = useContext(DraftCtx)
  if (!ctx) throw new Error('useProjectDraft must be used within ProjectDraftProvider')
  return ctx
}


