// import { useId, useMemo, useState } from 'react'
// import { useProjectDraft } from './useProjectDraft'
// import { EquipmentPicker } from './EquipmentPicker'

// const MAX_TITLE = 120
// const MAX_DESC = 800
// export type Equipment = { id: string; name: string; verified: boolean }

// function useMockEquipment(): { verified: Equipment[]; custom: Equipment[] } {
//   return useMemo(() => {
//     const names = [
//       'UV-Vis Spectrophotometer','Incubator','Conductivity Meter','Autoclave','Analytical Balance','HPLC System','TOC Analyzer','Water Purification System','Fume Hood / Laminar Flow Cabinet','COD Analyzer'
//     ]
//     const verified = names.map((n, i) => ({ id: `v${i+1}`, name: n, verified: true }))
//     const custom = ['Custom Meter','Custom Cabinet'].map((n, i) => ({ id: `c${i+1}`, name: n, verified: false }))
//     return { verified, custom }
//   }, [])
// }

// export default function Step1ProjectDetails() {
//   const { draft, setTitle, setDescription, toggleEquipment } = useProjectDraft()
//   const [descCount, setDescCount] = useState(draft.description?.length ?? 0)
//   const [touched, setTouched] = useState(false)
//   const titleId = useId()
//   const errId = useId()

//   const { verified, custom } = useMockEquipment()

//   const titleValid = draft.title.trim().length > 0 && draft.title.length <= MAX_TITLE

//   return (
//     <div className="grid gap-6">
//       <div>
//         <label htmlFor={titleId} className="block text-sm font-medium">Project Title</label>
//         <input
//           id={titleId}
//           className="mt-1 w-full rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//           placeholder="Enter project title"
//           value={draft.title}
//           onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
//           onBlur={() => setTouched(true)}
//           aria-describedby={!titleValid ? errId : undefined}
//           aria-invalid={!titleValid}
//         />
//         {!titleValid && touched && (
//           <p id={errId} className="mt-1 text-sm text-rose-600">Title is required and must be ≤ {MAX_TITLE} characters.</p>
//         )}
//       </div>

//       <div>
//         <label className="block text-sm font-medium">Project Description</label>
//         <textarea
//           className="mt-1 w-full resize-y rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//           rows={4}
//           placeholder="Project description"
//           value={draft.description || ''}
//           onChange={(e) => { const v = e.target.value.slice(0, MAX_DESC); setDescription(v); setDescCount(v.length) }}
//         />
//         <div className="mt-1 text-right text-xs text-gray-500">{descCount}/{MAX_DESC}</div>
//       </div>

//       <div>
//         <div className="mb-2 text-sm font-medium">Select Equipment</div>
//         <EquipmentPicker
//           verified={verified}
//           custom={custom}
//           selectedIds={draft.equipmentIds}
//           onToggle={toggleEquipment}
//         />
//       </div>
//     </div>
//   )
// }



// Step1ProjectDetails is add Start Date and End Date


// // Step1ProjectDetails.tsx

// import { useId, useMemo, useState } from 'react'
// import { useProjectDraft } from './useProjectDraft'
// import { EquipmentPicker } from './EquipmentPicker'

// const MAX_TITLE = 120
// const MAX_DESC = 800
// export type Equipment = { id: string; name: string; verified: boolean }

// function useMockEquipment(): { verified: Equipment[]; custom: Equipment[] } {
//   return useMemo(() => {
//     const names = [
//       'UV-Vis Spectrophotometer',
//       'Incubator',
//       'Conductivity Meter',
//       'Autoclave',
//       'Analytical Balance',
//       'HPLC System',
//       'TOC Analyzer',
//       'Water Purification System',
//       'Fume Hood / Laminar Flow Cabinet',
//       'COD Analyzer',
//     ]
//     const verified = names.map((n, i) => ({ id: `v${i + 1}`, name: n, verified: true }))
//     const custom = ['Custom Meter', 'Custom Cabinet'].map((n, i) => ({
//       id: `c${i + 1}`,
//       name: n,
//       verified: false,
//     }))
//     return { verified, custom }
//   }, [])
// }

// export default function Step1ProjectDetails() {
//   const {
//     draft,
//     setTitle,
//     setDescription,
//     setStartDate,
//     setEndDate,
//     toggleEquipment,
//     setTestingAssetType, // ✅ using the new setter
//   } = useProjectDraft()

//   const [descCount, setDescCount] = useState(draft.description?.length ?? 0)
//   const [touched, setTouched] = useState(false)
//   const titleId = useId()
//   const errId = useId()

//   const { verified, custom } = useMockEquipment()
//   const titleValid = draft.title.trim().length > 0 && draft.title.length <= MAX_TITLE

//   return (
//     <div className="grid gap-6">
//       <div>
//         <label htmlFor={titleId} className="block text-sm font-medium">
//           Project Title
//         </label>
//         <input
//           id={titleId}
//           className="mt-1 w-full rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//           placeholder="Enter project title"
//           value={draft.title}
//           onChange={e => setTitle(e.target.value.slice(0, MAX_TITLE))}
//           onBlur={() => setTouched(true)}
//           aria-describedby={!titleValid ? errId : undefined}
//           aria-invalid={!titleValid}
//         />
//         {!titleValid && touched && (
//           <p id={errId} className="mt-1 text-sm text-rose-600">
//             Title is required and must be ≤ {MAX_TITLE} characters.
//           </p>
//         )}
//       </div>

//       <div>
//         <label className="block text-sm font-medium">Project Description</label>
//         <textarea
//           className="mt-1 w-full resize-y rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//           rows={4}
//           placeholder="Project description"
//           value={draft.description || ''}
//           onChange={e => {
//             const v = e.target.value.slice(0, MAX_DESC)
//             setDescription(v)
//             setDescCount(v.length)
//           }}
//         />
//         <div className="mt-1 text-right text-xs text-gray-500">
//           {descCount}/{MAX_DESC}
//         </div>
//       </div>

//       <div className="grid grid-cols-2 gap-6">
//         <div>
//           <label className="block text-sm font-medium">Start Date</label>
//           <input
//             type="date"
//             className="mt-1 w-full rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//             value={draft.startDate || ''}
//             onChange={e => setStartDate(e.target.value)}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">End Date</label>
//           <input
//             type="date"
//             className="mt-1 w-full rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//             value={draft.endDate || ''}
//             onChange={e => setEndDate(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* ✅ New Radio Buttons for Testing Asset Type */}
//       <div>
//         <div className="mb-2 text-sm font-medium">Testing Asset Type</div>
//         <div className="flex gap-4">
//           {['chemical', 'equipment', 'software'].map(type => (
//             <label key={type} className="flex items-center gap-2">
//               <input
//                 type="radio"
//                 name="testingAssetType"
//                 value={type}
//                 checked={draft.testingAssetType === type}
//                 onChange={() => setTestingAssetType(type as 'chemical' | 'equipment' | 'software')}
//               />
//               <span className="capitalize">{type}</span>
//             </label>
//           ))}
//         </div>
//       </div>

//       <div>
//         <div className="mb-2 text-sm font-medium">Select Equipment</div>
//         <EquipmentPicker
//           verified={verified}
//           custom={custom}
//           selectedIds={draft.equipmentIds}
//           onToggle={toggleEquipment}
//         />
//       </div>
//     </div>
//   )
// }



// import React, { useId, useEffect, useMemo, useState } from 'react'
// import axios from 'axios'
// import { useProjectDraft } from './useProjectDraft'
// import { EquipmentPicker } from './EquipmentPicker'
// import { AppConfig } from '../../config'

// const MAX_TITLE = 120
// const MAX_DESC = 800

// export type Equipment = { id: string; name: string; verified: boolean }

// export type TestingAssetType = {
//   id: string
//   name: string
// }

// export default function Step1ProjectDetails() {
//   const {
//     draft,
//     setTitle,
//     setDescription,
//     setStartDate,
//     setEndDate,
//     toggleEquipment,
//     setTestingAssetType,
//   } = useProjectDraft()

//   const [descCount, setDescCount] = useState(draft.description?.length ?? 0)
//   const [touched, setTouched] = useState(false)
//   const titleId = useId()
//   const errId = useId()

//   const titleValid = draft.title.trim().length > 0 && draft.title.length <= MAX_TITLE

//   // API data for testing asset types
//   const [assetTypes, setAssetTypes] = useState<TestingAssetType[]>([])
//   const [loadingTypes, setLoadingTypes] = useState(true)
//   const [typesError, setTypesError] = useState<string | null>(null)

//   // API data for equipment
//   const [equipment, setEquipment] = useState<{ verified: Equipment[]; custom: Equipment[] }>({ verified: [], custom: [] })
//   const [loadingEquipment, setLoadingEquipment] = useState(true)
//   const [equipmentError, setEquipmentError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchTypes = async () => {
//       try {
//         const response = await axios.get(`${AppConfig.baseURL}/master/getAllTestingAssetTypes`)

//         // Normalize and transform response data to array of {id, name}
//         let rawData: any[] = []
//         if (Array.isArray(response.data)) {
//           rawData = response.data
//         } else if (Array.isArray(response.data?.data)) {
//           rawData = response.data.data
//         } else if (response.data && typeof response.data === 'object') {
//           // Handle single object case or wrapped
//           rawData = [response.data]
//         }

//         const types: TestingAssetType[] = rawData
//           .filter(item => item.is_active === true) // Filter active ones
//           .map(item => ({
//             id: item.asset_id.toString(), // Convert to string
//             name: item.asset_name
//           }))

//         setAssetTypes(types)
//       } catch (err) {
//         console.error('Failed to load testing asset types:', err)
//         setTypesError('Unable to load asset types')
//       } finally {
//         setLoadingTypes(false)
//       }
//     }

//     fetchTypes()
//   }, [])

//   useEffect(() => {
//     const fetchEquipment = async () => {
//       try {
//         // TODO: Replace with actual API endpoint for equipment
//         // Example: const response = await axios.get(`${AppConfig.baseURL}/master/getAllEquipment`)
//         // For now, using empty arrays as mock/static data is removed
//         const verified: Equipment[] = []
//         const custom: Equipment[] = []
//         setEquipment({ verified, custom })
//       } catch (err) {
//         console.error('Failed to load equipment:', err)
//         setEquipmentError('Unable to load equipment')
//       } finally {
//         setLoadingEquipment(false)
//       }
//     }

//     fetchEquipment()
//   }, [])

//   const { verified, custom } = equipment

//   return (
//     <div className="grid gap-6">
//       {/* Project Title */}
//       <div>
//         <label htmlFor={titleId} className="block text-sm font-medium">
//           Project Title
//         </label>
//         <input
//           id={titleId}
//           className="mt-1 w-full rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//           placeholder="Enter project title"
//           value={draft.title}
//           onChange={e => setTitle(e.target.value.slice(0, MAX_TITLE))}
//           onBlur={() => setTouched(true)}
//           aria-describedby={!titleValid ? errId : undefined}
//           aria-invalid={!titleValid}
//         />
//         {!titleValid && touched && (
//           <p id={errId} className="mt-1 text-sm text-rose-600">
//             Title is required and must be ≤ {MAX_TITLE} characters.
//           </p>
//         )}
//       </div>

//       {/* Project Description */}
//       <div>
//         <label className="block text-sm font-medium">Project Description</label>
//         <textarea
//           className="mt-1 w-full resize-y rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//           rows={4}
//           placeholder="Project description"
//           value={draft.description || ''}
//           onChange={e => {
//             const v = e.target.value.slice(0, MAX_DESC)
//             setDescription(v)
//             setDescCount(v.length)
//           }}
//         />
//         <div className="mt-1 text-right text-xs text-gray-500">
//           {descCount}/{MAX_DESC}
//         </div>
//       </div>

//       {/* Project Dates */}
//       <div className="grid grid-cols-2 gap-6">
//         <div>
//           <label className="block text-sm font-medium">Start Date</label>
//           <input
//             type="date"
//             className="mt-1 w-full rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//             value={draft.startDate || ''}
//             onChange={e => setStartDate(e.target.value)}
//           />
//         </div>
//         <div>
//           <label className="block text-sm font-medium">End Date</label>
//           <input
//             type="date"
//             className="mt-1 w-full rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
//             value={draft.endDate || ''}
//             onChange={e => setEndDate(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Testing Asset Type Selection (Radio Buttons from API) */}
//       <div>
//         <div className="mb-2 text-sm font-medium">Testing Asset Type</div>
//         {loadingTypes ? (
//           <p className="text-sm text-gray-500">Loading types...</p>
//         ) : typesError ? (
//           <p className="text-sm text-red-500">{typesError}</p>
//         ) : assetTypes.length > 0 ? (
//           <div className="flex gap-4 flex-wrap">
//             {assetTypes.map((type, index) => (
//               <label key={type.id || `asset-${index}`} className="flex items-center gap-2">
//                 <input
//                   type="radio"
//                   name="testingAssetType"
//                   value={type.id}
//                   checked={draft.testingAssetType === type.id}
//                   onChange={() => setTestingAssetType(type.id)}
//                 />
//                 <span>{type.name}</span>
//               </label>
//             ))}
//           </div>
//         ) : (
//           <p className="text-sm text-gray-500">No asset types available</p>
//         )}
//       </div>

//       {/* Equipment Picker */}
//       <div>
//         <div className="mb-2 text-sm font-medium">Select Equipment</div>
//         {loadingEquipment ? (
//           <p className="text-sm text-gray-500">Loading equipment...</p>
//         ) : equipmentError ? (
//           <p className="text-sm text-red-500">{equipmentError}</p>
//         ) : (
//           <EquipmentPicker
//             verified={verified}
//             custom={custom}
//             selectedIds={draft.equipmentIds}
//             onToggle={toggleEquipment}
//           />
//         )}
//       </div>
//     </div>
//   )
// }


// Step1ProjectDetails.tsx

import React, { useId, useEffect, useState } from 'react'

import { useProjectDraft } from './useProjectDraft'
import { EquipmentPicker } from './EquipmentPicker'
import { AppConfig } from '../../config'
import { Api_url } from '../../networkCalls/Apiurls'
import { showError, showSuccess, showWarn } from '../../services/toasterService'
import {getRequestStatus } from '../../networkCalls/NetworkCalls'
const MAX_TITLE = 120
const MAX_DESC = 800

export type Equipment = { id: string; name: string; verified: boolean }

export type TestingAssetType = {
  id: string
  name: string
}

export default function Step1ProjectDetails({ 
  projectId, 
  projectStatus, 
  originalStartDate,
  originalEndDate  // NEW
}: { 
  projectId: string | null; 
  projectStatus?: number | null;
  originalStartDate?: string | null;
  originalEndDate?: string | null;  // NEW
}) {
  const isEditMode = !!projectId
  const {
    draft,
    setTitle,
    setDescription,
    setStartDate,
    setEndDate,
    toggleEquipment,
    setTestingAssetType,
    // Destructure risk setters to reset on asset type change
    setRiskLevel,
    setRiskAnswer,
    setRequiredPhases,
    // NEW: Destructure new field setters
    
  } = useProjectDraft()

  const [descCount, setDescCount] = useState(draft.description?.length ?? 0)
  const titleId = useId()
  const titleValid = draft.title.trim().length > 0 && draft.title.length <= MAX_TITLE

  // API data for testing asset types
  const [assetTypes, setAssetTypes] = useState<TestingAssetType[]>([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [typesError, setTypesError] = useState<string | null>(null)
  const today = new Date().toISOString().split('T')[0] // "2025-11-04"
  const [startDateError, setStartDateError] = useState<string | null>(null)
  const [endDateError, setEndDateError] = useState<string | null>(null)
  // Conditional disable for start date: In edit mode, disable unless status_id=8
  const isStartDateDisabled = isEditMode && projectStatus !== 8
  // // Generate 1 to 10 for renewal dropdown (adjust range if needed, e.g., current year +1 to +10)
  // const renewalYears = Array.from({ length: 10 }, (_, i) => (i + 1).toString())
  // Function to limit year to 4 digits
  const handleYearLimit = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget
    const parts = target.value.split("-")
    if (parts[0] && parts[0].length > 4) {
      parts[0] = parts[0].slice(0, 4)
      target.value = parts.join("-")
    }
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isStartDateDisabled) return
    const newStart = e.target.value
    setStartDate(newStart)
    if (draft.endDate && newStart && newStart >= draft.endDate) {
      setEndDate('')
    }
    validateStartDate(newStart)
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value
    setEndDate(newEnd)
    validateEndDate(newEnd)
  }

  const validateStartDate = (dateStr: string) => {
    if (!dateStr) {
      setStartDateError('Start date is required.')
      return
    }
    
    
    // UPDATED: Skip if original unchanged or loading
    if (isEditMode && (originalStartDate === null || dateStr === originalStartDate)) {
      setStartDateError(null)
      return
    }
    
    const date = new Date(dateStr)
    const todayDate = new Date(today)
    if (!isEditMode || projectStatus === 8) {
      // In create mode or edit with status=8: prevent before today
      const year = date.getFullYear()
      if (year < parseInt(today.split('-')[0])) {  // Use parseInt for year
        setStartDateError('Please choose a start date from this year or later.')
        return
      }
      if (date < todayDate) {
        setStartDateError('Please choose a start date from today or later.')
        return
      }
    } else {
      // In edit mode with status !=8: safeguard >= original (input disabled, but for completeness)
      if (originalStartDate) {
        const originalDate = new Date(originalStartDate)
        if (date < originalDate) {
          setStartDateError('Start date cannot be before the original start date.')
          return
        }
      }
    }
    setStartDateError(null)

  }
  // UPDATED: Local validateEndDate with logs & skip
  const validateEndDate = (dateStr: string) => {
    if (!dateStr) {
      setEndDateError(null)
      return
    }
    

    
    // NEW: Skip if original unchanged or loading
    if (isEditMode && (originalEndDate === null || dateStr === originalEndDate)) {
      setEndDateError(null)
      return
    }
    
    const date = new Date(dateStr)
    const todayDate = new Date(today)
    if (!isEditMode || projectStatus === 8) {
      // Similar to start: prevent before today in create or editable edit
      const year = date.getFullYear()
      if (year < parseInt(today.split('-')[0])) {
        setEndDateError('Please choose an end date from this year or later.')
        return
      }
      if (date < todayDate) {
        setEndDateError('Please choose an end date from today or later.')
        return
      }
    }
    if (draft.startDate && date < new Date(draft.startDate)) {
      setEndDateError('End date must be after or on start date.')
      return
    }
    setEndDateError(null)
  }

  useEffect(() => {
    if (draft.startDate) {
      validateStartDate(draft.startDate);
    }
    if (draft.endDate) {
      validateEndDate(draft.endDate);
    }
  }, [draft.startDate, draft.endDate, originalStartDate, originalEndDate, projectStatus, isEditMode])  // UPDATED: Added originalEndDate
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await getRequestStatus<any>(Api_url.getAllTestingAssetTypes);
        // Normalize and transform response data to array of {id, name}
        let rawData: any[] = []
        if (Array.isArray(response.data)) {
          rawData = response.data
        } else if (Array.isArray(response.data?.data)) {
          rawData = response.data.data
        } else if (response.data && typeof response.data === 'object') {
          // Handle single object case or wrapped
          rawData = [response.data]
        }

        const types: TestingAssetType[] = rawData
          .filter(item => item.is_active === true) // Filter active ones
          .map(item => ({
            id: item.asset_id.toString(), // Convert to string
            name: item.asset_name
          }))

        setAssetTypes(types)
      } catch (err) {
        // console.error('Failed to load testing asset types:', err)
        setTypesError('Server unavailable, please try again')
      } finally {
        setLoadingTypes(false)
      }
    }

    fetchTypes()
  }, [])

  //  UPDATED: Set default testing asset type to first one if none selected, and reset risk conditionally based on the default type's ID
  useEffect(() => {
    if (!loadingTypes && !typesError && assetTypes.length > 0 && !draft.testingAssetType && !isEditMode) {
      const defaultTypeId = parseInt(assetTypes[0].id, 10)
      const defaultRiskLevel = defaultTypeId === 1 ? 'low' : 'high'
      setTestingAssetType(assetTypes[0].id)
      //  NEW: Set conditional default ('low' for ID=1/software, 'high' for others)
      setRiskLevel(defaultRiskLevel)
      setRiskAnswer('')
      setRequiredPhases([])
    }
  }, [loadingTypes, typesError, assetTypes, draft.testingAssetType, isEditMode])

  //  UPDATED: Safeguard - if asset type changes and no risk level set yet, default conditionally
  useEffect(() => {
    if (!isEditMode && draft.testingAssetType && !draft.riskLevel) {
      const assetTypeId = parseInt(draft.testingAssetType, 10)
      const defaultRiskLevel = assetTypeId === 1 ? 'low' : 'high'
      setRiskLevel(defaultRiskLevel)
      setRiskAnswer('')
      setRequiredPhases([])
    }
  }, [draft.testingAssetType, isEditMode, draft.riskLevel])

  const assetTypeId = draft.testingAssetType ? parseInt(draft.testingAssetType, 10) : undefined

  return (
    <div className="grid gap-6">
      {/* Project Title */}
      <div>
        <label htmlFor={titleId} className="block text-sm font-medium">
          Project Title <span className="text-red-500">*</span>
        </label>
        <input
          id={titleId}
          className="mt-1 w-full rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
          placeholder="Enter project title"
          value={draft.title}
          onChange={e => {
            const value = e.target.value
            if (value.length <= MAX_TITLE) {
              setTitle(value)
            }
          }}
        />
        <div className="mt-1 text-right text-xs text-gray-500">
          {draft.title.length}/{MAX_TITLE}
        </div>
        {draft.title.length >= MAX_TITLE && (
          <p className="text-xs text-red-500">Maximum {MAX_TITLE} characters allowed</p>
        )}
      </div>

      {/* Project Description */}
      <div>
        <label className="block text-sm font-medium">Project Description</label>
        <textarea
          className="mt-1 w-full resize-y rounded-lg border border-[#D8DDE4] px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-[#1f3a9d]"
          rows={4}
          placeholder="Project description"
          value={draft.description || ''}
          onChange={e => {
            const value = e.target.value
            if (value.length <= MAX_DESC) {
              setDescription(value)
              setDescCount(value.length)
            }
          }}
        />
        <div className="mt-1 text-right text-xs text-gray-500">
          {descCount}/{MAX_DESC}
        </div>
        {descCount >= MAX_DESC && (
          <p className="text-xs text-red-500">Maximum {MAX_DESC} characters allowed</p>
        )}
      </div>

      {/* Project Dates */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium">
            Start Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={draft.startDate || ''}
            onChange={handleStartDateChange}
            onInput={handleYearLimit}
            min={!isStartDateDisabled ? today : undefined} // Set min to today when editable
            disabled={isStartDateDisabled}
            title={isStartDateDisabled && isEditMode ? 'Start date cannot be edited now, project is active.' : ''}
            className={`w-full h-[40px] rounded-[5px] border border-[#E4E5E8] px-3 py-2 text-[13px] text-[#18191C]
              focus:border-[#0066bf] focus:outline-none focus:ring-0 focus:ring-[#0066bf]
              mt-1 ${isStartDateDisabled ? 'cursor-not-allowed bg-gray-100' : 'cursor-pointer'}`}
            // Removed onKeyDown to allow manual entry for validation
          />
          {startDateError && (
            <p className="mt-1 text-xs text-red-500">{startDateError}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium">End Date</label>
          <input
            type="date"
            value={draft.endDate || ''}
            onChange={handleEndDateChange}
            onInput={handleYearLimit}
            min={draft.startDate || (!isStartDateDisabled ? today : undefined)} // Use start date or today when editable
            className="w-full h-[40px] rounded-[5px] border border-[#E4E5E8] px-3 py-2 text-[13px] text-[#18191C]
              focus:border-[#0066bf] focus:outline-none focus:ring-0 focus:ring-[#0066bf]
              cursor-pointer mt-1"
            // Removed onKeyDown to allow manual entry for validation
          />
          {endDateError && (
            <p className="mt-1 text-xs text-red-500">{endDateError}</p>
          )}
        </div>
      </div>
      
      {/* Testing Asset Type Selection (Radio Buttons from API) */}
      <div>
        <div className="mb-2 text-sm font-medium">
          Testing Asset Type {!isEditMode && <span className="text-red-500">*</span>}
        </div>
        {loadingTypes ? (
          <p className="text-sm text-gray-500">Loading types...</p>
        ) : typesError ? (
          <p className="text-sm text-red-500">{typesError}</p>
        ) : assetTypes.length > 0 ? (
          <div className="flex gap-4 flex-wrap">
            {assetTypes.map((type, index) => {
              const newAssetTypeId = parseInt(type.id, 10)
              return (
                <label
                  key={type.id || `asset-${index}`}
                  className={`flex items-center gap-2 ${
                    isEditMode ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  title={
                    isEditMode
                      ? 'Asset type cannot be changed now, project is active.'
                      : ''
                  }
                >
                  <input
                    type="radio"
                    name="testingAssetType"
                    value={type.id}
                    checked={draft.testingAssetType === type.id}
                    onChange={() => {
                      // Reset risk fields when changing asset type (only in non-edit mode)
                      if (!isEditMode) {
                        setTestingAssetType(type.id)
                        //  UPDATED: Set conditional default ('low' for ID=1/software, 'high' for others)
                        const defaultRiskLevel = newAssetTypeId === 1 ? 'low' : 'high'
                        setRiskLevel(defaultRiskLevel)
                        setRiskAnswer('')     // Clear answer
                        setRequiredPhases([]) // Clear phases (will auto-repopulate in Step 2)
                      }
                    }}
                    disabled={isEditMode}
                  />
                  <span>{type.name}</span>
                </label>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No asset types available</p>
        )}
      </div>

      {/* Equipment Picker - Disabled in edit mode */}
      <div>
        <div
          className="mb-2 text-sm font-medium"
          title={isEditMode ? 'Equipment cannot be changed now, project is active.' : ''}
        >
          Select Equipment <span className={!isEditMode ? 'text-red-500' : ''}>*</span>
        </div>
        <EquipmentPicker
          selectedIds={draft.equipmentIds}
          onToggle={toggleEquipment}
          assetTypeId={assetTypeId}
          disabled={isEditMode}
        />
      </div>
    </div>
  )
}