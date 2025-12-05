// // ProjectCreateWizard.tsx


// import Step1ProjectDetails from './Step1ProjectDetails';
// import Step2RiskAssessment from './Step2RiskAssessment';
// import Step3AssignUpload from './Step3AssignUpload';
// import { Stepper } from './Stepper';
// import Button from '../../components/ui/button';
// import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../../services/dialog';
// import { ProjectDraftProvider, useProjectDraft } from './useProjectDraft';
// import { useNavigate } from 'react-router-dom';


// function WizardInner({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
//   const { draft, setStep } = useProjectDraft()
//   const titleValid = draft.title.trim().length > 0
//   const hasRisk = !!draft.riskAnswer
//   const navigate = useNavigate();

//   const handleNav = ()=>{
//     navigate("/projects")
//   }
//   return (
//     <>
//       <Stepper
//         current={draft.step}
//         onStepClick={(s) => {
//           if (s === 1) return setStep(1)
//           if (s === 2 && titleValid) return setStep(2)
//           if (s === 3 && titleValid && hasRisk) return setStep(3)
//         }}
//         allowAdvance={titleValid}
//       />
//       <DialogBody>
//         {draft.step === 1 && <Step1ProjectDetails />}
//         {draft.step === 2 && <Step2RiskAssessment />}
//         {draft.step === 3 && <Step3AssignUpload />}
//       </DialogBody>
//       <DialogFooter>
//         <Button variant="outline" onClick={()=>{onClose(),handleNav()}} aria-label="Cancel create project">
//           Cancel
//         </Button>
//         {draft.step > 1 && (
//           <Button 
//             variant="secondary" 
//             onClick={() => setStep((draft.step - 1) as 1 | 2 | 3)} 
//             aria-label="Back to previous step"
//           >
//             Back
//           </Button>
//         )}
//         <Button
//           onClick={() => {
//             if (draft.step === 1) return setStep(2)
//             if (draft.step === 2) return setStep(3)
//             return onComplete()
//           }}
//           disabled={(draft.step === 1 && !titleValid) || (draft.step === 2 && !hasRisk)}
//           aria-label={draft.step === 3 ? 'Submit project' : 'Next step'}
//         >
//           {draft.step === 3 ? 'Submit' : 'Next'}
//         </Button>
//       </DialogFooter>
//     </>
//   )
// }

// export default function ProjectCreateWizard({ 
//   open, 
//   onOpenChange, 
//   onComplete,
//   handleUrl 
// }: { 
//   open: boolean
//   onOpenChange: (v: boolean) => void
//   onComplete?: () => void 
//   handleUrl:()=>void
// }) {
//   return (
//     <ProjectDraftProvider>
//       <Dialog 
//         open={open} 
//         onOpenChange={onOpenChange}
//         ariaLabelledby="create-project-title"
//         handleUrl = {handleUrl}
//       >
//         <DialogHeader 
//           id="create-project-title" 
//           title="Create New Project" 
//           onClose={() => onOpenChange(false)} 
//         />
//         <WizardInner 
//           onClose={() => onOpenChange(false)} 
//           onComplete={() => { 
//             onComplete?.()
//             onOpenChange(false)
//           }} 
//         />
//       </Dialog>
//     </ProjectDraftProvider>
//   )
// }




// -----------------------------without validations--------------------------------


// import { useEffect } from 'react'
// import axios from 'axios'
// import Step1ProjectDetails from './Step1ProjectDetails'
// import Step2RiskAssessment from './Step2RiskAssessment'
// import Step3AssignUpload from './Step3AssignUpload'
// import { Stepper } from './Stepper'
// import Button from '../../components/ui/button'
// import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../../services/dialog'
// import { ProjectDraftProvider, useProjectDraft } from './useProjectDraft'
// import { useNavigate } from 'react-router-dom'
// import { Api_url } from '../../networkCalls/Apiurls'
// import { showError, showSuccess, showWarn } from '../../services/toasterService'

// function WizardInner({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
//   const { draft, setStep, resetDraft } = useProjectDraft()
//   const titleValid = draft.title.trim().length > 0
//   const hasRisk = !!draft.riskAnswer
//   const navigate = useNavigate()

//   const handleNav = () => {
//     navigate('/projects')
//   }
// const validateStep = (step: number) => {
//   if (step === 1) {
//     if (!draft.title.trim()) {
//       showWarn("Project title is required.");
//       return false;
//     }
//     if (!draft.description?.trim()) {
//       showWarn("Project description is required.");
//       return false;
//     }
//     if (!draft.startDate || !draft.endDate) {
//       showWarn("Start and End dates are required.");
//       return false;
//     }
//     if (!draft.equipmentIds?.length) {
//   showWarn("At least one equipment is required.");
//   return false;
// }

//   }

//   if (step === 2) {
//     if (!draft.riskAnswer) {
//       showWarn("Risk assessment is required.");
//       return false;
//     }
//     if (!draft.riskLevel) {
//       showWarn("Please select a risk level.");
//       return false;
//     }
//   }

//   if (step === 3) {
//     if (!draft.assigneeIds?.length) {
//       showWarn("At least one assignee is required.");
//       return false;
//     }
//     if (!draft.equipmentIds?.length) {
//       showWarn("At least one equipment is required.");
//       return false;
//     }
//     // Optional: validate uploaded files if required
//   }

//   return true;
// };

//   // Function to call backend API
// const handleSubmit = async () => {
//   try {
//     const formData = new FormData();
//     formData.append('project_name', draft.title);
//     formData.append('project_description', draft.description || '');
//     if (draft.startDate) formData.append('start_date', draft.startDate);
//     if (draft.endDate) formData.append('end_date', draft.endDate);
//     formData.append('risk_assessment_id', ( { low:1, medium:2, high:3 }[draft.riskLevel] || 0 ).toString());
//     formData.append('equipment_id', draft.equipmentIds[0] || '0');
//     formData.append('created_by', (draft.createdBy || 0).toString());
//     formData.append('user_ids', draft.assigneeIds?.join(',') || '');
//     draft.uploadedFiles?.forEach(file => formData.append('files', file));

//     const response = await axios.post(Api_url.createProject, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     });

//     showSuccess("Project created successfully!");
//     resetDraft();
//     onComplete();
//   } catch (error: any) {
//     console.error('❌ Failed to create project:', error);
//     showError("Could not create project. Check console for details.");
//   }
// };



//   return (
//     <>
//       {/* <Stepper
//         current={draft.step}
//         onStepClick={(s) => {
//           if (s === 1) return setStep(1)
//           if (s === 2 && titleValid) return setStep(2)
//           if (s === 3 && titleValid && hasRisk) return setStep(3)
//         }}
//         allowAdvance={titleValid}
//       /> */}
//       <Stepper
//         current={draft.step}
//         onStepClick={(s) => {
//           setStep(s as 1 | 2 | 3)  // <-- remove all titleValid/hasRisk checks
//         }}
//         allowAdvance={true} // always allow advancing
//       />


//       <DialogBody>
//         {draft.step === 1 && <Step1ProjectDetails />}
//         {draft.step === 2 && <Step2RiskAssessment />}
//         {draft.step === 3 && <Step3AssignUpload />}
//       </DialogBody>

//       <DialogFooter>
//         <Button
//           variant="outline"
//           onClick={() => {
//             onClose()
//             handleNav()
//           }}
//           aria-label="Cancel create project"
//         >
//           Cancel
//         </Button>

//         {draft.step > 1 && (
//           <Button
//             variant="secondary"
//             onClick={() => setStep((draft.step - 1) as 1 | 2 | 3)}
//             aria-label="Back to previous step"
//           >
//             Back
//           </Button>
//         )}

//         {/* <Button
//           onClick={() => {
//             if (draft.step === 1) return setStep(2)
//             if (draft.step === 2) return setStep(3)
//             return handleSubmit()
//           }}
//           disabled={(draft.step === 1 && !titleValid) || (draft.step === 2 && !hasRisk)}
//           aria-label={draft.step === 3 ? 'Submit project' : 'Next step'}
//         >
//           {draft.step === 3 ? 'Submit' : 'Next'}
//         </Button> */}

//         <Button
//   onClick={() => {
//     if (!validateStep(draft.step)) return; // stop if validation fails

//     if (draft.step === 1) return setStep(2);
//     if (draft.step === 2) return setStep(3);
//     return handleSubmit(); // final submission
//   }}
//   aria-label={draft.step === 3 ? 'Submit project' : 'Next step'}
// >
//   {draft.step === 3 ? 'Submit' : 'Next'}
// </Button>


//       </DialogFooter>
//     </>
//   )
// }

// // ✅ Wrapper Component
// export default function ProjectCreateWizard({
//   open,
//   onOpenChange,
//   onComplete,
//   handleUrl,
// }: {
//   open: boolean
//   onOpenChange: (v: boolean) => void
//   onComplete?: () => void
//   handleUrl: () => void
// }) {
//   return (
//     <ProjectDraftProvider>
//       <Dialog
//         open={open}
//         onOpenChange={onOpenChange}
//         ariaLabelledby="create-project-title"
//         handleUrl={handleUrl}
//       >
//         <DialogHeader
//           id="create-project-title"
//           title="Create New Project"
//           onClose={() => onOpenChange(false)}
//         />
//         <WizardInner
//           onClose={() => onOpenChange(false)}
//           onComplete={() => {
//             onComplete?.()
//             onOpenChange(false)
//           }}
//         />
//       </Dialog>
//     </ProjectDraftProvider>
//   )
// }


// --------------------    selection has been restricted with out entering the data-------------------------- 

// import { useEffect, useState } from 'react'
// import axios from 'axios'
// import Step1ProjectDetails from './Step1ProjectDetails'
// import Step2RiskAssessment from './Step2RiskAssessment'
// import Step3AssignUpload from './Step3AssignUpload'
// import { Stepper } from './Stepper'
// import Button from '../../components/ui/button'
// import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../../services/dialog'
// import { ProjectDraftProvider, useProjectDraft } from './useProjectDraft'
// import { useNavigate } from 'react-router-dom'
// import { Api_url } from '../../networkCalls/Apiurls'
// import { showError, showSuccess, showWarn } from '../../services/toasterService'
// import RingGradientLoader from '../../components/RingGradientLoader' // your loader

// function WizardInner({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
//   const { draft, setStep, resetDraft } = useProjectDraft()
//   const navigate = useNavigate()
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const handleNav = () => {
//     navigate('/projects')
//   }

//   const isStepValid = (step: number): boolean => {
//     if (step === 1) {
//       return !!draft.title?.trim() /* && !!draft.description?.trim()  */&& !!draft.startDate/*  && !!draft.endDate */ && !!draft.equipmentIds?.length
//     }
//     if (step === 2) {
//       return !!draft.riskAnswer && !!draft.riskLevel
//     }
//     if (step === 3) {
//       return !!draft.assigneeIds?.length && !!draft.equipmentIds?.length
//     }
//     return false
//   }

//   const canAdvance = isStepValid(draft.step)

//   const validateStep = (step: number) => {
//     if (step === 1) {
//       if (!draft.title?.trim()) {
//         showWarn("Project title is required.")
//         return false
//       }
//       if (draft.title.trim().length > 120) {
//         showWarn("Project title cannot exceed 150 characters.")
//         return false
//       }

//       // if (!draft.description?.trim()) {
//       //   showWarn("Project description is required.")
//       //   return false
//       // }
//       // if (draft.description.trim().length > 800) {
//       //   showWarn("Project description cannot exceed 800 characters.")
//       //   return false
//       // }

//       if (!draft.startDate) {
//         showWarn("Start date is required.")
//         return false
//       }
//       // if (!draft.endDate) {
//       //   showWarn("End date is required.")
//       //   return false
//       // }

//       if (!draft.equipmentIds?.length) {
//         showWarn("At least one equipment is required.")
//         return false
//       }
//     }

//     if (step === 2) {
//       if (!draft.riskAnswer) {
//         showWarn("Risk assessment is required.")
//         return false
//       }
//       if (!draft.riskLevel) {
//         showWarn("Please select a risk level.")
//         return false
//       }
//     }

//     if (step === 3) {
//       if (!draft.assigneeIds?.length) {
//         showWarn("At least one assignee is required.")
//         return false
//       }
//       if (!draft.equipmentIds?.length) {
//         showWarn("At least one equipment is required.")
//         return false
//       }
//     }

//     return true
//   }


//   // Function to call backend API
//   const handleSubmit = async () => {
//   try {
//     setIsLoading(true)
//     const staticUserId = localStorage.getItem("USER_ID");
//     const formData = new FormData()
//     formData.append('project_name', draft.title)
//     formData.append('project_description', draft.description || '')
//     if (draft.startDate) formData.append('start_date', draft.startDate)
//     if (draft.endDate) formData.append('end_date', draft.endDate)
//     formData.append('risk_assessment_id', ({ low: 1, medium: 2, high: 3 }[draft.riskLevel] || 0).toString())
//     formData.append('equipment_id', draft.equipmentIds[0] || '0')
//     // formData.append('created_by', (draft.createdBy || 0).toString())
//     formData.append('created_by', (staticUserId || '0'))
//     formData.append('user_ids', draft.assigneeIds?.join(',') || '')
//     draft.uploadedFiles?.forEach(file => formData.append('files', file))

//     const response = await axios.post(Api_url.createProject, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' }
//     })

//     showSuccess("Project created successfully!")
//     resetDraft()
//     onComplete()
//   } catch (error: any) {
//     console.error('❌ Failed to create project:', error)
//     // Extract and show server-specific error message in toaster
//     let errorMessage = "Could not create project. Check console for details.";
//     if (error.response?.data?.message) {
//       errorMessage = error.response.data.message;
//     }

//     showError(errorMessage);
//   } finally {
//     setIsLoading(false)
//   }
// }

//   return (
//     <>
//       <Stepper
//         current={draft.step}
//         onStepClick={(s) => {
//           if (s < draft.step) {
//             setStep(s)
//           } else if (s > draft.step && canAdvance) {
//             setStep(s)
//           }
//           // Do nothing for current step or invalid forward
//         }}
//         allowAdvance={canAdvance}
//       />

//       <DialogBody>
//         {draft.step === 1 && <Step1ProjectDetails />}
//         {draft.step === 2 && <Step2RiskAssessment />}
//         {draft.step === 3 && <Step3AssignUpload />}
//       </DialogBody>

//       <DialogFooter>
//         <Button
//           variant="outline"
//           onClick={() => {
//             onClose()
//             handleNav()
//           }}
//           aria-label="Cancel create project"
//         >
//           Cancel
//         </Button>

//         {draft.step > 1 && (
//           <Button
//             variant="secondary"
//             onClick={() => setStep((draft.step - 1) as 1 | 2 | 3)}
//             aria-label="Back to previous step"
//           >
//             Back
//           </Button>
//         )}

//         <Button
//         className='cursor-pointer'
//           onClick={() => {
//             if (!validateStep(draft.step)) return // stop if validation fails

//             if (draft.step === 1) return setStep(2)
//             if (draft.step === 2) return setStep(3)
//             return handleSubmit() // final submission
//           }}
//           aria-label={draft.step === 3 ? 'Submit project' : 'Next step'}
//         >
//           {draft.step === 3 ? 'Submit' : 'Next'}
//         </Button>
//               {isLoading &&  <RingGradientLoader />}
//       </DialogFooter>
//     </>
//   )
// }

// // ✅ Wrapper Component
// export default function ProjectCreateWizard({
//   open,
//   onOpenChange,
//   onComplete,
//   handleUrl,
// }: {
//   open: boolean
//   onOpenChange: (v: boolean) => void
//   onComplete?: () => void
//   handleUrl: () => void
// }) {
//   return (
//     <ProjectDraftProvider>
//       <Dialog
//         open={open}
//         onOpenChange={onOpenChange}
//         ariaLabelledby="create-project-title"
//         handleUrl={handleUrl}
//       >
//         <DialogHeader
//           id="create-project-title"
//           title="Create New Project"
//           onClose={() => onOpenChange(false)}
//         />
//         <WizardInner
//           onClose={() => onOpenChange(false)}
//           onComplete={() => {
//             onComplete?.()
//             onOpenChange(false)
//           }}
//         />
//       </Dialog>
//     </ProjectDraftProvider>
//   )
// }


// ProjectCreateWizard.tsx

import { useEffect, useState, useRef } from 'react'
import Step1ProjectDetails from './Step1ProjectDetails'
import Step2RiskAssessment from './Step2RiskAssessment'
import Step3AssignUpload, { Assignee } from './Step3AssignUpload'
import { Stepper } from './Stepper'
import Button from '../../components/ui/button'
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '../../services/dialog'
import { ProjectDraftProvider, useProjectDraft } from './useProjectDraft'
import { useNavigate } from 'react-router-dom'
import { Api_url } from '../../networkCalls/Apiurls'
import { showError, showSuccess, showWarn } from '../../services/toasterService'
import { getRequestStatus, postRequestStatus, putRequestStatus } from '../../networkCalls/NetworkCalls'
import RingGradientLoader from '../../components/RingGradientLoader' // your loader
// import DecodedTokenValues from '../../components/DecryptToken';

function WizardInner({ projectId, onClose, onComplete }: { projectId: string | null, onClose: () => void; onComplete: () => void }) {
  const { draft, setStep, resetDraft, setTitle, setDescription, setStartDate, setEndDate, setRiskLevel, setRiskAnswer, setRequiredPhases, toggleEquipment, toggleAssignee, setUploadedFiles, setTestingAssetType, setChangeRequestCode, setChangeRequestFile, setChangeRequestFileName, setIsVerified, setRejectReason, setChangeRequestJson, setTransactionTemplateId, setCrMethod, setRenewalYear, setMake, setModel, setJsonTemplateId, setSavedTemplateData } = useProjectDraft()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isFetching, setIsFetching] = useState<boolean>(false)
  const [originalAssignees, setOriginalAssignees] = useState<string[]>([])
  const [originalFiles, setOriginalFiles] = useState<{ file_id: number; file_name: string }[]>([])
  const [keptFileIds, setKeptFileIds] = useState<number[]>([])
  const [projectStatus, setProjectStatus] = useState<number | null>(null)
  const [originalStartDate, setOriginalStartDate] = useState<string | null>(null) // Store original start date
  const [originalEndDate, setOriginalEndDate] = useState<string | null>(null) // NEW: Store original end date
  const hasFetchedRef = useRef(false)
  const isPopulatingRef = useRef(false)
  // const { user_id, user_name, user_role_id, user_role_name, user_email } = DecodedTokenValues();
  const isEditMode = !!projectId // Derive from prop, no local state
  const [showCrApproved, setShowCrApproved] = useState(false);
  const [assignees, setAssignees] = useState<Assignee[]>([])

  const [crFileChanged, setCrFileChanged] = useState(false)
  const [crFormChanged, setCrFormChanged] = useState(false)
  const [changeRequestId, setChangeRequestId] = useState<string | null>(null)
  useEffect(() => {
    if (projectId) {
      setCrFileChanged(false)
      setCrFormChanged(false)
    }
  }, [projectId])
  const handleNav = () => {
    navigate('/projects')
  }

useEffect(() => {
  getRequestStatus<any>(Api_url.getUsers)
    .then((res) => {
      const users = res.data?.data || []
      const mapped: Assignee[] = users.map((u: any) => ({
        id: u.user_id.toString(),
        name: u.user_name,
        role: u.role_name,
        roleId: Number(u.role_id),   // This is critical
        avatarUrl: u.image_url ? `${Api_url.user_images}/${u.image_url}` : undefined,
      }))
      setAssignees(mapped)
    })
    .catch(() => {})
}, [])
  interface JsonTemplateResponse {
    transaction_template_id?: string | number;
    template_json?: any;
  }

  // Fetch project data if editing
  useEffect(() => {
    if (projectId && !hasFetchedRef.current) {
      hasFetchedRef.current = true;
      const fetchProjectData = async () => {
        setIsFetching(true);
        try {
          const response = await getRequestStatus<any>(Api_url.retrieveProjectDetails(projectId));
          if (response.status === 200) {
            const data = response.data.data;
            setProjectStatus(data.status_id || null);

            if (isPopulatingRef.current) return;
            isPopulatingRef.current = true;

            setTimeout(async () => {
              // Populate project fields
              setTitle(data.project_name || "");
              setDescription(data.project_description || "");
              const fetchedStartDate = data.start_date
                ? data.start_date.split("T")[0]
                : "";
              setStartDate(fetchedStartDate);
              setOriginalStartDate(fetchedStartDate);

              setEndDate(data.end_date ? data.end_date.split("T")[0] : "");
              setOriginalEndDate(
                data.end_date ? data.end_date.split("T")[0] : ""
              );

              setTestingAssetType(data.asset_type_id?.toString() || "");
              setRenewalYear(data.renewal_year ? data.renewal_year.toString() : "");
              setMake(data.make || "");
              setModel(
                data.model !== undefined && data.model !== null
                  ? data.model
                  : undefined
              );

              // Risk
              const riskLevel = data.risk_assessment_name.toLowerCase();
              setRiskLevel(riskLevel);
              setRiskAnswer(riskLevel);

              // Phases
              const phaseIds = data.phases?.map((p: any) => p.phase_id) || [];
              setRequiredPhases(phaseIds);

              // Equipment
              const equipmentId = data.equipment_id?.toString() || "";
              if (equipmentId) toggleEquipment(equipmentId);

              // Users
              const assigneeIds =
                data.users?.map((u: any) => u.user_id.toString()) || [];
              assigneeIds.forEach((id: any) => toggleAssignee(id));
              setOriginalAssignees([...assigneeIds]);

              // Files
              setOriginalFiles(data.files || []);
              setKeptFileIds(data.files?.map((f: any) => f.file_id) || []);
              setUploadedFiles([]);

              // Change Request
              setChangeRequestCode(data.change_request_code || "");
              setChangeRequestFileName(data.change_request_file || "");
              setIsVerified(data.is_verified ?? true)
              setRejectReason(data.reject_reason || '')
              setShowCrApproved(data.is_verified === true);
              const crId = data.change_request_id || null
              setChangeRequestId(crId)

              // NEW: Populate CR method and related fields
              const transactionTemplateId = data.transaction_template_id || null
              const crMethod = transactionTemplateId ? 'form' : 'file'
              setCrMethod(crMethod)
              // FIXED: Ensure change_request_json is always a string

              const jsonValue = data.change_request_json;
              const jsonString = jsonValue
                ? (typeof jsonValue === 'string'
                  ? jsonValue
                  : JSON.stringify(jsonValue))
                : '';
              setChangeRequestJson(jsonString);
              setTransactionTemplateId(transactionTemplateId)
              // ----------------------------------------------------
              //  🔥 LOAD JSON TEMPLATE (Edit Mode)
              // ----------------------------------------------------
              if (data.json_template_id) {
                console.log("Found Template ID:", data.json_template_id);

                try {
                  const templateResp = await getRequestStatus(
                    Api_url.getJsonTemplateById(data.json_template_id)
                  );

                  console.log("Template Response:", templateResp);

                  const templateJson =
                    templateResp?.data?.data?.template_json?.template_json ||
                    templateResp?.data?.data?.template_json;

                  if (templateJson) {
                    console.log("Loaded Template JSON:", templateJson);

                    // Save into draft using proper setters
                    setJsonTemplateId(data.json_template_id);
                    setSavedTemplateData(templateJson);
                  } else {
                    console.warn("Template JSON not found in API response.");
                  }
                } catch (e) {
                  console.error("Error fetching template:", e);
                }
              }


              // ----------------------------------------------------

              setStep(1);
              isPopulatingRef.current = false;
            }, 0);
          }
        } catch (error: any) {
          console.error("Failed to fetch project:", error);
          showError(
            error.response?.data?.message || "Failed to load project data"
          );
          isPopulatingRef.current = false;
        } finally {
          setIsFetching(false);
        }
      };

      fetchProjectData()
    } else if (!projectId) {
      hasFetchedRef.current = false
      isPopulatingRef.current = false
      setOriginalAssignees([])
      setOriginalFiles([])
      setKeptFileIds([])
      setProjectStatus(null)
      setOriginalStartDate(null)
      setOriginalEndDate(null) // NEW
      resetDraft()
      setChangeRequestId(null)
    }
  }, [
    projectId,
    setTitle,
    setDescription,
    setStartDate,
    setEndDate,
    setTestingAssetType,
    // NEW: Add new setters
    setRenewalYear,
    setMake,
    setModel,
    setRiskLevel,
    setRiskAnswer,
    setRequiredPhases, //  add this dependency
    toggleEquipment,
    toggleAssignee,
    setUploadedFiles,
    setChangeRequestCode,
    setChangeRequestFileName,
    setIsVerified,
    setRejectReason,
    setCrMethod,
    setChangeRequestJson,
    setTransactionTemplateId,
    resetDraft,
    setStep
  ])


  // Reset draft when switching to create mode
  useEffect(() => {
    if (!projectId) {
      resetDraft()
    }
  }, [projectId, resetDraft])

  // Helper functions for date validation
  const getToday = () => new Date().toISOString().split('T')[0] // "2025-11-04"
  const getCurrentYear = () => new Date().getFullYear() // 2025

  const validateStartDate = (dateStr: string): string | null => {
    if (!dateStr) return 'Start date is required.'
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const today = new Date(getToday())


    // UPDATED: Allow original unchanged + safeguard if original null (loading)
    if (isEditMode && (originalStartDate === null || dateStr === originalStartDate)) {
      return null
    }

    if (!isEditMode || projectStatus === 8) {
      // In create mode or edit with status=8: prevent before today
      if (year < getCurrentYear()) {
        return 'Please choose a start date from this year or later.'
      }
      if (date < today) {
        return 'Please choose a start date from today or later.'
      }
    } else if (originalStartDate) {
      const originalDate = new Date(originalStartDate)
      if (date < originalDate) {
        return 'Start date cannot be before the original start date.'
      }
    }
    return null
  }
  const validateEndDate = (dateStr: string, startDateStr?: string): string | null => {
    if (!dateStr) return null // End date is optional
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const today = new Date(getToday())


    // NEW: Allow original unchanged + safeguard
    if (isEditMode && (originalEndDate === null || dateStr === originalEndDate)) {
      return null
    }

    if (!isEditMode || projectStatus === 8) {
      // Similar to start: prevent before today in create or editable edit
      if (year < getCurrentYear()) {
        return 'Please choose an end date from this year or later.'
      }
      if (date < today) {
        return 'Please choose an end date from today or later.'
      }
    }
    if (startDateStr && date < new Date(startDateStr)) {
      return 'End date must be after or on start date.'
    }
    return null
  }
  const isStepValid = (step: number): boolean => {
    if (step === 1) {
      const hasTitle = !!draft.title?.trim()
      const titleLengthOk = draft.title.length <= 120
      const hasStartDate = !!draft.startDate
      const startError = validateStartDate(draft.startDate || '')
      const endError = draft.endDate ? validateEndDate(draft.endDate, draft.startDate) : null
      const hasEquipment = !!draft.equipmentIds?.length
      const hasAssetType = isEditMode || !!draft.testingAssetType
      return hasTitle && titleLengthOk && hasStartDate && !startError && !endError && hasEquipment && hasAssetType
    }
    if (step === 2) {
      return (
        !!draft.riskAnswer &&
        !!draft.riskLevel &&
        !!draft.requiredPhases?.length //  Must have at least one phase
      )
    }
    if (step === 3) {
      const hasChangeReqCode = !!draft.changeRequestCode?.trim()
      // const hasChangeReqFile = !!draft.changeRequestFile || !!draft.changeRequestFileName
      // return !!draft.assigneeIds?.length && !!draft.equipmentIds?.length && hasChangeReqCode && hasChangeReqFile
      const hasCrData = draft.crMethod === 'file'
        ? (!!draft.changeRequestFile || !!draft.changeRequestFileName)
        : !!draft.changeRequestJson
      return !!draft.assigneeIds?.length && !!draft.equipmentIds?.length && hasChangeReqCode && hasCrData
    }
    return false
  }

  const canAdvance = isStepValid(draft.step)

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!draft.title?.trim()) {
        showWarn("Project title is required.")
        return false
      }
      if (draft.title.trim().length > 120) {
        showWarn("Project title cannot exceed 120 characters.")
        return false
      }

      // if (!draft.description?.trim()) {
      //   showWarn("Project description is required.")
      //   return false
      // }
      // if (draft.description.trim().length > 800) {
      //   showWarn("Project description cannot exceed 800 characters.")
      //   return false
      // }

      if (!draft.startDate) {
        showWarn("Start date is required.")
        return false
      }
      //  NEW: Validate start date validity
      const startDateError = validateStartDate(draft.startDate)
      if (startDateError) {
        showWarn(startDateError)
        return false
      }
      //  NEW: Validate end date if provided
      if (draft.endDate) {
        const endDateError = validateEndDate(draft.endDate, draft.startDate)
        if (endDateError) {
          showWarn(endDateError)
          return false
        }
      }
      if (!isEditMode && !draft.testingAssetType) {
        showWarn("Testing asset type is required.")
        return false
      }
      if (!draft.equipmentIds?.length) {
        showWarn("At least one equipment is required.")
        return false
      }
    }

    if (step === 2) {
      if (!draft.riskAnswer) {
        showWarn("Risk assessment is required.")
        return false
      }
      if (!draft.riskLevel) {
        showWarn("Please select a risk level.")
        return false
      }
      if (!draft.requiredPhases || draft.requiredPhases.length === 0) {
        showWarn("At least one phase is required.")
        return false
      }
    }

    if (step === 3) {
      if (!draft.assigneeIds?.length) {
        showWarn("At least one assignee is required.")
        return false
      }

  // 🔥 ENHANCED: Mandatory Role Validation
  const mandatoryRoles = import.meta.env.VITE_MANDATORY_ROLES
    ? import.meta.env.VITE_MANDATORY_ROLES.split(',').map(Number)
    : []

  // If there are mandatory roles defined, validate them
  if (mandatoryRoles.length > 0) {
    // Get the full assignee objects (we need roleId)
    const selectedAssignees = assignees.filter(a => draft.assigneeIds.includes(a.id))
    const hasMandatoryRole = selectedAssignees.some(a => 
      mandatoryRoles.includes(a.roleId)
    )

    if (!hasMandatoryRole) {
      // Get role names for better error message
      const mandatoryRoleNames = assignees
        .filter(a => mandatoryRoles.includes(a.roleId))
        .map(a => a.role)
        .filter((role, index, arr) => arr.indexOf(role) === index) // Remove duplicates

      showWarn(`You must select at least one ${mandatoryRoleNames.join(' or ')}.`)
      return false
    }
  }

      if (!draft.equipmentIds?.length) {
        showWarn("At least one equipment is required.")
        return false
      }

      // NEW: Add validation for change request fields
      if (draft.crMethod === 'file') {
        if (!draft.changeRequestCode?.trim()) {
          showWarn("Change request number is required.")
          return false
        }
      }
    
      const hasCrData = draft.crMethod === 'file'
        ? (!!draft.changeRequestFile || !!draft.changeRequestFileName)
        : !!draft.changeRequestJson
      if (!hasCrData) {
        // showWarn(`Change request ${draft.crMethod === 'file' ? 'file' : 'form data'} is required.`)
      }
    }

    return true
  }

  const handleFileKeepChange = (fileId: number, keep: boolean) => {
    setKeptFileIds(prev =>
      keep ? [...prev, fileId] : prev.filter(id => id !== fileId)
    )
  }

  const handleFileRemove = (fileId: number) => {
    setKeptFileIds(prev => prev.filter(id => id !== fileId))
  }
  // const handleSubmit = async () => {
  //   try {
  //     setIsLoading(true)
  //     //  const staticUserId = localStorage.getItem("USER_ID");
  //     let response
  //     if (isEditMode) {
  //        // Compute user diffs for add/remove
  //        const currentAssignees = draft.assigneeIds || [];
  //        const addUserIds = currentAssignees
  //          .filter((id: string) => !originalAssignees.includes(id))
  //           .map((id: string) => parseInt(id));
  //        const removeUserIds = originalAssignees
  //          .filter((id: string) => !currentAssignees.includes(id))
  //           .map((id: string) => parseInt(id));
  //       // Compute file removes
  //        const removeFileIds = originalFiles
  //          .filter((f) => !keptFileIds.includes(f.file_id))
  //           .map((f) => f.file_id);
  //        const formData = new FormData()
  //        formData.append('title', draft.title || '')
  //        formData.append('description', draft.description || '')
  //        formData.append('start_date', draft.startDate || '')
  //        formData.append('end_date', draft.endDate || '')
  //        // formData.append('updated_by', String(user_id) || '0')
  //        // NEW: Append new fields
  //        if (draft.renewalYear) formData.append('renewal_year', draft.renewalYear)
  //        if (draft.make) formData.append('make', draft.make)
  //        if (draft.model !== undefined && draft.model !== null) formData.append('model', draft.model.toString())
  //        if (addUserIds.length > 0) {
  //          formData.append('add_user_ids', addUserIds.join(','))
  //        }
  //        if (removeUserIds.length > 0) {
  //          formData.append('remove_user_ids', removeUserIds.join(','))
  //        }
  //        if (removeFileIds.length > 0) {
  //          formData.append('remove_file_ids', removeFileIds.join(','))
  //        }
  //         // Files: only append new files (size > 0)
  //        draft.uploadedFiles?.forEach((file: File) => {
  //          if (file.size > 0) {
  //            formData.append('files', file)
  //          }
  //        })
  //        // NEW: Append change request fields
  //        formData.append('change_request_code', draft.changeRequestCode || '')
  //        if (draft.changeRequestFile) {
  //          formData.append('change_request_file', draft.changeRequestFile)
  //        } else if (draft.changeRequestFileName) {
  //          formData.append('change_request_filename', draft.changeRequestFileName)  // For backend to reference existing file
  //        }
  //         // Note: risk_assessment_id, equipment_id, asset_type_id not updated here - backend does not support in this endpoint
  //         // TODO: Handle via separate API calls if needed
  //        response = await putRequestStatus<any>(Api_url.updateProjectDetails(projectId!), formData, { 'Content-Type': 'multipart/form-data' })
  //         // console.log('Update response:', response); // Debug log
  //        showSuccess("Project updated successfully!")
  //     } else {
  //        const formData = new FormData()
  //        formData.append('project_name', draft.title)
  //        formData.append('project_description', draft.description || '')
  //        if (draft.startDate) formData.append('start_date', draft.startDate)
  //        if (draft.endDate) formData.append('end_date', draft.endDate)
  //        formData.append('risk_assessment_id', ({ low: 1, medium: 2, high: 3 }[draft.riskLevel] || 0).toString())
  //        formData.append('equipment_id', draft.equipmentIds[0] || '0')
  //         // formData.append('created_by', (draft.createdBy || 0).toString())
  //        // formData.append('created_by', String(user_id || '0'))
  //        formData.append('user_ids', draft.assigneeIds?.join(',') || '')
  //        formData.append('phase_ids', draft.requiredPhases?.join(',') || '')
  //        if (draft.testingAssetType) {
  //          formData.append('asset_type_id', draft.testingAssetType)
  //        }
  //        // NEW: Append new fields
  //        if (draft.renewalYear) formData.append('renewal_year', draft.renewalYear)
  //        if (draft.make) formData.append('make', draft.make)
  //        if (draft.model !== undefined && draft.model !== null) formData.append('model', draft.model.toString())
  //        draft.uploadedFiles?.forEach(file => formData.append('files', file))
  //        // NEW: Append change request fields for create
  //        formData.append('change_request_code', draft.changeRequestCode || '')
  //        if (draft.changeRequestFile) {
  //          formData.append('change_request_file', draft.changeRequestFile)
  //        }
  //        response = await postRequestStatus<any>(Api_url.createProject, formData, { 'Content-Type': 'multipart/form-data' })
  //         // console.log('Create response:', response); // Debug log
  //        showSuccess("Project created successfully!")
  //     }
  //     resetDraft()
  //      setOriginalAssignees([]) // Reset
  //     setOriginalFiles([])
  //     setKeptFileIds([])
  //     onComplete()
  //   } catch (error: any) {
  //     console.error('❌ Failed to save project:', error)
  //      let errorMessage = isEditMode ? "Could not update project." : "Could not create project. Check console for details.";
  //     if (error.response?.data?.message) {
  //        errorMessage = error.response.data.message;
  //     }
  //      showError(errorMessage);
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }
  const handleSubmit = async () => {
    let newTemplateId: number | string | undefined;
    try {
      setIsLoading(true);
      // 🔥 1) Save JSON template first (if present)

      if (draft.savedTemplateData) {
        try {
          const payload = { template_json: draft.savedTemplateData };
          console.log("saved template data:",payload)

          const templateResp = await postRequestStatus<{
            transaction_template_id?: number | string;
          }>(Api_url.saveJsonTemplate, payload);

          newTemplateId = templateResp.data?.transaction_template_id;

          console.log("Saved JSON template response:", templateResp);
          console.log("Saved template ID:", newTemplateId);

          if (newTemplateId != null) {
            setJsonTemplateId(Number(newTemplateId));
          } else {
            console.warn("JSON template saved but no ID returned.");
            showWarn("JSON template saved but no ID returned.");
          }
        } catch (err) {
          console.error("Failed to save JSON template:", err);
          showError("Could not save risk assessment template.");
          setIsLoading(false);
          return;
        }
      }

      let response;
      if (isEditMode) {
        // Compute user diffs for add/remove
        const currentAssignees = draft.assigneeIds || [];
        const addUserIds = currentAssignees
          .filter((id: string) => !originalAssignees.includes(id))
          .map((id: string) => parseInt(id));
        const removeUserIds = originalAssignees
          .filter((id: string) => !currentAssignees.includes(id))
          .map((id: string) => parseInt(id));
        // Compute file removes
        const removeFileIds = originalFiles
          .filter((f) => !keptFileIds.includes(f.file_id))
          .map((f) => f.file_id);
        const formData = new FormData();
        formData.append('title', draft.title || '');
        formData.append('description', draft.description || '');
        formData.append('start_date', draft.startDate || '');
        formData.append('end_date', draft.endDate || '');
        // FIXED: Always append these fields, empty if falsy to allow clearing
        formData.append('renewal_year', draft.renewalYear || '');
        formData.append('make', draft.make || '');
        formData.append('model', draft.model !== undefined && draft.model !== null ? draft.model.toString() : '');
        if (addUserIds.length > 0) {
          formData.append('add_user_ids', addUserIds.join(','));
        }
        if (removeUserIds.length > 0) {
          formData.append('remove_user_ids', removeUserIds.join(','));
        }
        if (removeFileIds.length > 0) {
          formData.append('remove_file_ids', removeFileIds.join(','));
        }
        draft.uploadedFiles?.forEach((file: File) => {
          if (file.size > 0) {
            formData.append('files', file);
          }
        });
        if (changeRequestId) {
          formData.append('change_request_id', changeRequestId.toString())
        }
        formData.append('change_request_code', draft.changeRequestCode || '');
        if (crFileChanged && draft.changeRequestFile) {
          formData.append('change_request_file', draft.changeRequestFile);
          formData.append('change_request_json', '');
        }
        else if (crFormChanged) {
          formData.append('change_request_json', draft.changeRequestJson || '');
          formData.append('change_request_file', '');
        }
        
        // Log FormData contents for debugging
        for (const [key, value] of formData.entries()) {
        }

        response = await putRequestStatus<any>(
          Api_url.updateProjectDetails(projectId!),
          formData,
          { 'Content-Type': 'multipart/form-data' }
        );

        if (response.status === 200 || response.status === 201) {
          showSuccess('Project updated successfully!');
        } else {
          showWarn(response.data?.message || 'Failed to update project.');
          return;
        }
      } else {
        const formData = new FormData();
        formData.append('project_name', draft.title || '');
        formData.append('project_description', draft.description || '');
        if (draft.startDate) formData.append('start_date', draft.startDate);
        if (draft.endDate) formData.append('end_date', draft.endDate);
        formData.append('risk_assessment_id', ({ low: 1, medium: 2, high: 3 }[draft.riskLevel] || 0).toString());
        formData.append('equipment_id', draft.equipmentIds[0] || '0');
        formData.append('user_ids', draft.assigneeIds?.join(',') || '');
        formData.append('phase_ids', draft.requiredPhases?.join(',') || '');
        if (draft.testingAssetType) {
          formData.append('asset_type_id', draft.testingAssetType);
        }
        // Create mode: Keep optional (no old values to clear)
        if (draft.renewalYear) formData.append('renewal_year', draft.renewalYear);
        if (draft.make) formData.append('make', draft.make);
        if (draft.model !== undefined && draft.model !== null) formData.append('model', draft.model.toString());
        draft.uploadedFiles?.forEach(file => formData.append('files', file));
        formData.append('change_request_code', draft.changeRequestCode || '');
      if (newTemplateId) {
          formData.append('json_template_id', newTemplateId.toString());
          console.log("💾 Attaching json_template_id in create mode:", newTemplateId);
        }

        console.log("data for formdata:",formData)

        if (draft.crMethod === 'file') {
        if (draft.changeRequestFile) {
          formData.append('change_request_file', draft.changeRequestFile);
        }
        formData.append('change_request_json', '');
      } else {
        if (draft.changeRequestJson) {
          formData.append('change_request_json', draft.changeRequestJson);
        }
formData.append('change_request_file', '');
      }
        // Log FormData contents for debugging
        for (const [key, value] of formData.entries()) {
        }
        response = await postRequestStatus<any>(
          Api_url.createProject,
          formData,
          { 'Content-Type': 'multipart/form-data' }
        );

        if (response.status === 409) {
          showWarn(response.data?.message || 'A project with this name already exists. Please choose a different name.');
          return;
        }
        if (response.status === 200 || response.status === 201) {
          showSuccess('Project created successfully!');
        } else {
          showWarn(response.data?.message || 'Failed to create project.');
          return;
        }
      }
      resetDraft();
      setOriginalAssignees([]);
      setOriginalFiles([]);
      setKeptFileIds([]);
      onComplete();
    } catch (error: any) {
      console.error('❌ Failed to save project:', error);
      let errorMessage = isEditMode ? 'Could not update project.' : 'Could not create project. Check console for details.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      showWarn(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  if (isFetching) {
    return <div className="flex items-center justify-center py-8"><RingGradientLoader /></div>
  }

  return (
    <>
      <Stepper
        current={draft.step}
        onStepClick={(s) => {
          if (s < draft.step) {
            setStep(s)
          } else if (s > draft.step && canAdvance) {
            setStep(s)
          }
          // Do nothing for current step or invalid forward
        }}
        allowAdvance={canAdvance}
        isEditMode={isEditMode}
      />
      <DialogBody >
        {draft.step === 1 && <Step1ProjectDetails
          projectId={projectId}
          projectStatus={projectStatus}
          originalStartDate={originalStartDate}
          originalEndDate={originalEndDate}  // NEW
        />}
        {draft.step === 2 && (
          <Step2RiskAssessment
            projectId={projectId}
            onTemplateSave={(templateId) => setJsonTemplateId(templateId)}
          />
        )}
        {draft.step === 3 && (
          <Step3AssignUpload
            originalFiles={originalFiles}
            keptFileIds={keptFileIds}
            onFileKeepChange={handleFileKeepChange}
            onFileRemove={handleFileRemove}
            projectStatus={projectStatus}
            originalAssignees={originalAssignees}
            isEditMode={isEditMode}
            showCrApproved={showCrApproved}
            onCrFileChanged={() => setCrFileChanged(true)}
            onCrFormChanged={() => setCrFormChanged(true)}
          />
        )}
      </DialogBody>

      <DialogFooter>
        <Button
          variant="outline"
          onClick={() => {
            onClose()
            handleNav()
          }}
          aria-label="Cancel"
        >
          Cancel
        </Button>

        {draft.step > 1 && (
          <Button
            variant="secondary"
            onClick={() => setStep((draft.step - 1) as 1 | 2 | 3)}
            aria-label="Back to previous step"
          >
            Back
          </Button>
        )}

        <Button
          className='cursor-pointer'
          onClick={() => {
            if (!validateStep(draft.step)) return

            if (draft.step === 1) return setStep(2)
            if (draft.step === 2) return setStep(3)
            return handleSubmit()
          }}
          aria-label={draft.step === 3 ? (isEditMode ? 'Update project' : 'Submit project') : 'Next step'}
          disabled={isFetching}
        >
          {draft.step === 3 ? (isEditMode ? 'Update' : 'Submit') : 'Next'}
        </Button>
        {isLoading && <RingGradientLoader />}
      </DialogFooter>
    </>
  )
}

//  Wrapper Component
export default function ProjectCreateWizard({
  projectId,
  open,
  onOpenChange,
  onComplete,
  handleUrl,
}: {
  projectId: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onComplete?: () => void
  handleUrl: () => void
}) {
  const [internalOpen, setInternalOpen] = useState(open);
  const allowCloseRef = useRef(false);

  // Sync internal state with prop
  useEffect(() => {
    setInternalOpen(open);
  }, [open]);

  // Explicit close function for buttons
  const closeDialog = () => {
    allowCloseRef.current = true;
    handleInternalOpenChange(false);
    allowCloseRef.current = false;
  };

  // Handle backdrop/escape/any auto-close attempts
  const handleInternalOpenChange = (value: boolean) => {
    if (value === false && !allowCloseRef.current) {
      // Ignore close attempts from backdrop or escape
      return;
    }
    setInternalOpen(value);
    onOpenChange(value);
  };

  return (
    <ProjectDraftProvider key={projectId || 'create'}>
      <Dialog
        open={internalOpen}
        onOpenChange={handleInternalOpenChange}
        ariaLabelledby="create-project-title"
        handleUrl={handleUrl}
      >
        <DialogHeader
          id="create-project-title"
          title={projectId ? "Edit Project" : "Create New Project"}
          onClose={closeDialog}
        />
        <WizardInner
          projectId={projectId}
          onClose={closeDialog}
          onComplete={() => {
            onComplete?.()
            closeDialog()
          }}
        />
      </Dialog>
    </ProjectDraftProvider>
  )
}