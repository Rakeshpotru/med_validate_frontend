// import { useEffect, useMemo, useState } from 'react'
// import { useProjectDraft } from './useProjectDraft'
// import { PriorityBadge } from '../../components/ui/PriorityBadge'
// // import { PhasePill } from '../../components/ui/PhasePill'
// import axios from 'axios'

// type RiskLevel = 'low' | 'medium' | 'high'

// interface Phase {
//   phase_id: number
//   phase_name: string
// }

// interface RiskWithPhases {
//   risk_assessment_id: number
//   risk_assessment_name: 'Low' | 'Medium' | 'High'
//   phases: Phase[]
// }

// const RISK_OPTIONS = [
//   {
//     level: 'high',
//     label: 'High Risk',
//     description:
//       'Data generated or stored are of high importance to clinical operations or patient safety. Data corruption cannot be easily detected and/or are unrecoverable. The system operation and performance are of high importance to clinical operations or patient safety. Data loss, corruption or alteration, or poor system operation and performance may cause severe permanent injury or cause death.',
//   },
//   {
//     level: 'medium',
//     label: 'Medium Risk',
//     description:
//       'Data has a low likelihood of being lost, corrupted, or altered. Data corruption or loss is easily detected and can be recovered. System operation and performance may be important to clinical operations or patient safety. Issues with data integrity, or system operation and performance may cause minimal impact to patient safety.',
//   },
//   {
//     level: 'low',
//     label: 'Low Risk',
//     description:
//       'Data is non-critical, or is not likely to be lost, corrupted, or altered. Data corruption or loss is easily detected and can be easily recovered. System operation or performance has no detectable impact to clinical operations or patient safety. Issues with data integrity, or system operation and performance have no impact on patient safety.',
//   },
// ]

// export default function Step2RiskAssessment() {
//   const { draft, setRiskAnswer, setRequiredPhases } = useProjectDraft()
//   const [selected, setSelected] = useState<RiskLevel>(draft.riskLevel || 'low')
//   const [riskPhaseMap, setRiskPhaseMap] = useState<Record<RiskLevel, Phase[]>>({
//     low: [],
//     medium: [],
//     high: [],
//   })

//   // Fetch the risk-phase mapping from API
//   useEffect(() => {
//     axios
//       .get('http://127.0.0.1:244/api/master/getAllMappedRisksWithPhases')
//       .then((response) => {
//         const data: RiskWithPhases[] = response.data.data

//         // Transform API data into easier to use format
//         const map: Record<RiskLevel, Phase[]> = {
//           low: [],
//           medium: [],
//           high: [],
//         }

//         data.forEach((item) => {
//           const level = item.risk_assessment_name.toLowerCase() as RiskLevel
//           map[level] = item.phases
//         })

//         setRiskPhaseMap(map)
//       })
//       .catch((error) => {
//         console.error('Failed to fetch risk-phase mapping:', error)
//       })
//   }, [])

//   // Update project draft state when risk level changes
//   useEffect(() => {
//     const selectedPhases = riskPhaseMap[selected] || []
//     const phaseCodes = selectedPhases.map((p) => p.phase_name) // Or use `p.phase_id` if needed
//     setRiskAnswer(selected)
//     setRequiredPhases(phaseCodes)
//   }, [selected, riskPhaseMap, setRiskAnswer, setRequiredPhases])

//   const chips = useMemo(() => draft.requiredPhases, [draft.requiredPhases])

//   return (
//     <div className="grid gap-6">
//       {/* Risk Table */}
//       <section>
//         <h3 className="text-lg font-bold mb-4">Risk Assessment</h3>
//         <table className="w-full mb-4">
//           <thead>
//             <tr className="bg-gray-200">
//               <th className="p-2 text-left">Select</th>
//               <th className="p-2 text-left">Classification</th>
//               <th className="p-2 text-left">Description</th>
//             </tr>
//           </thead>
//           <tbody>
//             {RISK_OPTIONS.map((option) => {
//               const isSelected = selected === option.level
//               const rowClass =
//                 option.level === 'high'
//                   ? 'bg-red-100'
//                   : option.level === 'medium'
//                   ? 'bg-yellow-100'
//                   : 'bg-green-100'
//               return (
//                 <tr key={option.level} className={rowClass}>
//                   <td className="p-2 border">
//                     <input
//                       type="radio"
//                       name="riskLevel"
//                       value={option.level}
//                       checked={isSelected}
//                       onChange={() => setSelected(option.level as RiskLevel)}
//                     />
//                   </td>
//                   <td className="p-2 border font-medium">{option.label}</td>
//                   <td className="p-2 border">{option.description}</td>
//                 </tr>
//               )
//             })}
//           </tbody>
//         </table>
//       </section>

//       {/* Required Phases */}
//       <section>
//         <div className="mb-3 flex items-center gap-3">
//           <h3 className="text-sm font-medium">Required Phases</h3>
//           <PriorityBadge priority={selected} />
//         </div>
//         {/* <div className="flex flex-wrap gap-2 transition-all duration-300 motion-reduce:transition-none">
//           {chips.map((code) => (
//             <PhasePill key={code} code={code} variant="dialog" />
//           ))}
//         </div> */}
//       </section>
//     </div>
//   )
// }



// Step2ProjectDetails.tsx
import { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useProjectDraft } from "./useProjectDraft";
import { Api_url } from "../../networkCalls/Apiurls";
import { getRequestStatus, postRequestStatus } from "../../networkCalls/NetworkCalls";
import Button from "../ui/button";
import RenderUiTemplate from "../../../public/RenderUi_Template";
import { PriorityBadge } from "../My Projects/PriorityBadge";

type RiskLevel = 'low' | 'medium' | 'high'

interface Phase {
  phase_id: number
  phase_name: string
}

interface RiskAssessment {
  risk_assessment_id: number
  risk_assessment_name: 'Low' | 'Medium' | 'High'
  risk_assessment_description: string
}

interface RiskWithPhases {
  risk_assessment_id: number
  risk_assessment_name: 'Low' | 'Medium' | 'High'
  phases: Phase[]
}

export default function Step2RiskAssessment({ projectId }: { projectId: string | null }) {
  const isEditMode = !!projectId
  const {
    draft,
    setDraft, 
    setRiskAnswer,
    setRiskLevel,
    setRequiredPhases,
    setJsonTemplateId ,
     setSavedTemplateData ,
      setTemplateFormatTypeId,
      setSavedTemplateFormatTypeId,
      setRenewalYear,
          setMake,
          setModel,
  } = useProjectDraft()

  const assetTypeId = draft.testingAssetType ? parseInt(draft.testingAssetType, 10) : 0;
  const defaultRiskLevel = assetTypeId === 1 ? 'low' : 'high';

  const [selected, setSelected] = useState<RiskLevel>(draft.riskLevel || defaultRiskLevel);
  const [selectedPhases, setSelectedPhases] = useState<number[]>(draft.requiredPhases || []);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [riskPhaseMap, setRiskPhaseMap] = useState<Record<RiskLevel, Phase[]>>({ low: [], medium: [], high: [] });
  const [allPhases, setAllPhases] = useState<Phase[]>([]);
  const [userModified, setUserModified] = useState(false);
 
  // --- Store both form template and its ID
  const [formSchema, setFormSchema] = useState<any>(null);
  const [currentTemplateId, setCurrentTemplateId] = useState<number | null>(null);
 const [savedJsonTemplateId, setSavedJsonTemplateId] = useState<number | null>(null);
const [autoSelected, setAutoSelected] = useState(false);
// const [templateFormatTypeId, setTemplateFormatTypeId] = useState<number | null>(null);
// const [templateFormatTypeId, setTemplateFormatTypeId] = useState<1 | 2 | 3 | null>(null);
const templateFormatTypeId = draft.templateFormatTypeId;
// Generate 1 to 10 for renewal dropdown (adjust range if needed, e.g., current year +1 to +10)
  const renewalYears = Array.from({ length: 10 }, (_, i) => (i + 1).toString())


  // const [isAdding, setIsAdding] = useState(false);
  // const [newQuestionText, setNewQuestionText] = useState("");

  const initialAppliedRef = useRef(false);

  const mappedPhasesForSelected = useMemo(() => riskPhaseMap[selected] || [], [riskPhaseMap, selected]);

  // --- Initialize defaults for edit mode
  useEffect(() => {
    if (isEditMode && !initialAppliedRef.current) {
      setSelected(draft.riskLevel || defaultRiskLevel);
      setSelectedPhases(draft.requiredPhases);
      initialAppliedRef.current = true;
    }
  }, [draft, isEditMode, defaultRiskLevel]);

  useEffect(() => setRequiredPhases(selectedPhases), [selectedPhases, setRequiredPhases])
  useEffect(() => { setRiskAnswer(selected); setRiskLevel(selected); }, [selected, setRiskAnswer, setRiskLevel])

  // --- Auto-apply mapped phases if user hasn't changed anything
  useEffect(() => {
    if (!isEditMode && !userModified && allPhases.length && selectedPhases.length === 0) {
      const mappedIds = mappedPhasesForSelected.map(p => p.phase_id);
      setSelectedPhases(mappedIds);
    }
  }, [selected, allPhases, isEditMode, mappedPhasesForSelected, userModified, selectedPhases.length])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [riskRes, phaseRes, allPhasesRes] = await Promise.all([
          getRequestStatus<any>(Api_url.getAllRiskAssessments),
          getRequestStatus<any>(Api_url.getAllMappedRisksWithPhases),
          getRequestStatus<any>(Api_url.getAllPhases)
        ])

        if (riskRes.data?.status_code === 200) {
          setRiskAssessments(riskRes.data.data.sort((a: RiskAssessment, b: RiskAssessment) => b.risk_assessment_id - a.risk_assessment_id))
        }

        if (phaseRes.data?.data) {
          const map: Record<RiskLevel, Phase[]> = { low: [], medium: [], high: [] };
          (phaseRes.data.data as RiskWithPhases[]).forEach(item => {
            map[item.risk_assessment_name.toLowerCase() as RiskLevel] = item.phases;
          })
          setRiskPhaseMap(map)
        }

        if (allPhasesRes.data?.status_code === 200) {
          setAllPhases(allPhasesRes.data.data.sort((a: Phase, b: Phase) => a.phase_name.localeCompare(b.phase_name)));
        }
      } catch (error) {
        console.error("Failed to fetch risk/phase data:", error);
      }
    };
    fetchData();
  }, []);

  // --- Fetch templates and save template ID
 // --- Fetch templates dynamically based on asset type selected in Step 1
useEffect(() => {
  const fetchTemplates = async () => {
    try {
      const assetTypeId = draft.testingAssetType
        ? parseInt(draft.testingAssetType, 10)
        : 0;

      const templateTypeId =
        assetTypeId === 1
          ? 1
          : assetTypeId === 2
          ? 2
          : assetTypeId === 3
          ? 3
          : null;

      if (!templateTypeId) {
        setFormSchema(null);
        setCurrentTemplateId(null);
        return;
      }

      const response = await getRequestStatus<any>(
        Api_url.getAllTemplates(templateTypeId)
      );

      console.log("api response for temlate type id :",response)

      const template = response?.data?.data;
      console.log("template data",template)
      if (template) {
        // backend json_template already contains the usable schema
        setFormSchema(template.json_template || null);
        setCurrentTemplateId(template.template_id || null);

        // ✅ Store template ID in draft immediately
        if (template.template_id) {
          setJsonTemplateId(template.template_id);
          setSavedJsonTemplateId(template.template_id); 
          
          console.log("💾 Auto-stored template ID for backend:", template.template_id);
        }
         if (template.template_format_type_id != null) {
            setTemplateFormatTypeId(template.template_format_type_id);
            setSavedTemplateFormatTypeId(template.template_format_type_id);
          }

      } else {
        setFormSchema(null);
        setCurrentTemplateId(null);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      setFormSchema(null);
      setCurrentTemplateId(null);
    }
  };

  // if (draft.testingAssetType) fetchTemplates();
  if (draft.testingAssetType && !draft.savedTemplateData) {
  fetchTemplates();
}

}, [draft.testingAssetType, setJsonTemplateId,setTemplateFormatTypeId, setSavedTemplateFormatTypeId]);

useEffect(() => {
  if (draft.savedTemplateData) {
    setFormSchema(draft.savedTemplateData);
  }
}, []);  

// useEffect(() => {
//   // 🧠 Just use what’s already stored in memory (no API calls)
//   if (draft.savedTemplateData) {
//     console.log("💾 Using already saved template JSON from draft");
//     setFormSchema(draft.savedTemplateData);
//   } else if (draft.jsonTemplateId) {
//     // Optional: you can log it for debugging
//     console.log("ℹ️ Template ID exists but no local data — skip API call");
//   } else {
//     console.log("⚠️ No saved template yet — showing base form schema");
//   }
// }, [draft.savedTemplateData, draft.jsonTemplateId]);

 useEffect(() => {
    if (draft.savedTemplateFormatTypeId != null) {
      setTemplateFormatTypeId(draft.savedTemplateFormatTypeId);
    }
  }, [draft.savedTemplateFormatTypeId]);

 
const handleFormSubmit = (submittedData: any) => {
  if (!submittedData) {
    console.warn("⚠️ No submitted data found");
    return;
  }

  console.log("💾 Storing template locally (NO API SAVE)",submittedData);
  setSavedTemplateData(submittedData);    // Save JSON locally
   if (draft.templateFormatTypeId != null) {
      setSavedTemplateFormatTypeId(draft.templateFormatTypeId);
    }
};


  // --- Handle phases and risk level changes
  const togglePhase = (phaseId: number) => {
    if (isEditMode) return
    setUserModified(true)
    setSelectedPhases((prev) =>
      prev.includes(phaseId) ? prev.filter((id) => id !== phaseId) : [...prev, phaseId]
        )
}

  const handleRiskChange = (level: RiskLevel) => {
  if (isEditMode || autoSelected) return; // ✅ Prevent manual override
  setUserModified(true);
  setSelected(level);
  const mappedIds = riskPhaseMap[level]?.map((p) => p.phase_id) || [];
  setSelectedPhases(mappedIds);
};


  // const handleWeightageChange = (updatedWeights: any) => {
  //   console.log("Updated weights:", updatedWeights);
  // };

// Handle weightage changes and store locally
const handleWeightageChange = (totalWeightage: number, updatedJson?: any,riskLabel?:string) => {
  console.log("🔢 Updated Total Weightage:", totalWeightage);
  console.log("🔢  Weightage:", riskLabel);


  let newRiskLevel: RiskLevel | null = null;

  if (riskLabel) {
    // Map JSON label to internal risk levels
    switch (riskLabel.toLowerCase()) {
      case "direct impact":
        newRiskLevel = "high"; // or "direct" depending on your logic
        break;
      case "indirect impact":
        newRiskLevel = "low"; // or "indirect"
        break;
      case "low":
      case "medium":
      case "high":
        newRiskLevel = riskLabel.toLowerCase() as RiskLevel;
        break;
      default:
        newRiskLevel = null;
    }
  }

  // ✅ Apply auto-selection and disable manual choice
  if (newRiskLevel && newRiskLevel !== selected) {
    console.log(`🎯 Auto-selected risk level: ${newRiskLevel}`);
    setSelected(newRiskLevel);
    setAutoSelected(true); // Mark as auto-selected
  }

  // 💾 Store updated JSON locally
  if (updatedJson) {
    console.log("💾 Storing updated JSON locally (NO API SAVE)", updatedJson);
    setSavedTemplateData(updatedJson);
    if (draft.templateFormatTypeId != null) {
      setSavedTemplateFormatTypeId(draft.templateFormatTypeId);
    }
  }
};




  return (
    <div className="grid gap-6">
      {/* Dynamic Risk Assessment Template */}
      <section>
        {/* <h3 className="text-lg font-bold mb-4">Dynamic Risk Assessment Template</h3> */}
        {formSchema ? (
          <>
          
            
         <fieldset disabled={isEditMode}>
  <RenderUiTemplate
    
    formSchema={formSchema}
    savedValues={formSchema.selectedValues}
    buttonMode={3}
    onWeightageChange={(totalWeightage, updatedJson,change,riskLabel) => handleWeightageChange(totalWeightage, updatedJson,riskLabel)}
    hideSubmitButton={true}
    template_weightage_format={true}
  />
</fieldset>


          </>
        ) : (
          <p className="text-sm text-gray-500"> Template not found...</p>
        )}
      </section>

      {/* Risk Table */}
      {/* <section>
        <h3 className="text-lg font-bold mb-4">
          Risk Assessment <span className={!isEditMode ? 'text-red-500' : ''}>*</span>
        </h3>
        {assetTypeId === 1 ? (
          // Exact risk assessment UI for asset type 1 (software/table)
          <div className={isEditMode ? 'opacity-90 pointer-events-none' : ''}>
            <table className="w-full mb-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 text-left">Select</th>
                  <th className="p-2 text-left">Classification</th>
                  <th className="p-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {riskAssessments.map((risk) => {
                  const level = risk.risk_assessment_name.toLowerCase() as RiskLevel
                  const isSelected = selected === level
                  const rowClass =
                    level === 'high'
                      ? 'bg-red-100'
                      : level === 'medium'
                        ? 'bg-yellow-100'
                        : 'bg-green-100'
                  return (
                    <tr key={risk.risk_assessment_id} className={rowClass}>
                      <td className="p-2 border">
                        <input
                          type="radio"
                          name="riskLevel"
                          value={level}
                          checked={isSelected}
                          onChange={() => handleRiskChange(level)}
                        />
                      </td>
                      <td className="p-2 border font-medium">{risk.risk_assessment_name}</td>
                      <td className="p-2 border">{risk.risk_assessment_description}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          // Radio buttons for Direct/Indirect Impact for other asset types
          <div className={isEditMode ? 'opacity-90 pointer-events-none' : ''}>
            <div className="flex items-center justify-start gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="riskLevel"
                  value="high"
                  checked={selected === 'high'}
                  onChange={() => handleRiskChange('high')}
                  disabled={isEditMode}
                />
                <span>Direct Impact</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="riskLevel"
                  value="low"
                  checked={selected === 'low'}
                  onChange={() => handleRiskChange('low')}
                  disabled={isEditMode}
                />
                <span>Indirect Impact</span>
              </label>
            </div>
          </div>
        )}
      </section> */}
       <section>
  <h3 className="text-lg font-bold mb-4">
    Risk Assessment{" "}
    <span className={!isEditMode ? "text-red-500" : ""}>*</span>
  </h3>

  <div className={isEditMode ? "opacity-90 pointer-events-none" : ""}>
    <div className="flex flex-wrap items-center gap-6">
      {assetTypeId === 1 ? (
        // Show High / Medium / Low for asset type 1
        <>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="riskLevel"
              value="high"
              checked={selected === "high"}
              onChange={() => handleRiskChange("high")}
              disabled={isEditMode}
            />
            <span className="font-medium text-red-600">High</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="riskLevel"
              value="medium"
              checked={selected === "medium"}
              onChange={() => handleRiskChange("medium")}
              disabled={isEditMode}
            />
            <span className="font-medium text-yellow-600">Medium</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="riskLevel"
              value="low"
              checked={selected === "low"}
              onChange={() => handleRiskChange("low")}
              disabled={isEditMode}
            />
            <span className="font-medium text-green-600">Low</span>
          </label>
        </>
      ) : (
        // For other asset types: Direct / Indirect Impact
        <>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="riskLevel"
              value="high"
              checked={selected === "high"}
              onChange={() => handleRiskChange("high")}
              disabled={isEditMode}
            />
            <span>Direct Impact</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="riskLevel"
              value="low"
              checked={selected === "low"}
              onChange={() => handleRiskChange("low")}
              disabled={isEditMode}
            />
            <span>Indirect Impact</span>
          </label>
        </>
      )}
    </div>
  </div>
</section>


      {/* Phases */}
      <section className={isEditMode ? 'opacity-60 pointer-events-none' : ''}>
        <div className="mb-3 flex items-center gap-3">
          <h3 className="text-sm font-medium">Required Phases</h3>
          <PriorityBadge priority={selected} />
          <span className="text-xs text-gray-500">(Click to select/deselect)</span>
        </div>

        {allPhases.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {allPhases.map((phase) => {
              const isSelected = selectedPhases.includes(phase.phase_id)
              const isMapped = mappedPhasesForSelected.some((p) => p.phase_id === phase.phase_id)
              let base = 'transition-all duration-200 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium border cursor-pointer select-none'
              let state = isSelected
                ? 'bg-green-500 text-white border-green-500 hover:bg-green-600 scale-105'
                : isMapped && !isEditMode
                  ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'

              return (
                <div
                  key={phase.phase_id}
                  onClick={() => togglePhase(phase.phase_id)}
                  className={`${base} ${state}`}
                >
                  {phase.phase_name}
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No phases available.</p>
        )}
      </section>

      {/* NEW: Added Fields - Renewal Year, Make, Model */}
      <div className="grid grid-cols-3 gap-6">
        {/* Renewal Year Dropdown */}
        <div>
          <label className="block text-sm font-medium">
            Renewal Year
          </label>
          <select
            value={draft.renewalYear || ''}
            onChange={e => setRenewalYear(e.target.value)}
            className="mt-1 w-full h-[40px] rounded-[5px] border border-[#E4E5E8] px-3 py-2 text-[13px] text-[#18191C]
              focus:border-[#0066bf] focus:outline-none focus:ring-0 focus:ring-[#0066bf]
              cursor-pointer"
          >
            <option value="">Select Year</option>
            {renewalYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        {/* Make Text Input */}
        <div>
          <label className="block text-sm font-medium">Make</label>
          <input
            type="text"
            value={draft.make || ''}
            onChange={e => setMake(e.target.value)}
            placeholder="Enter make"
            className="mt-1 w-full h-[40px] rounded-[5px] border border-[#E4E5E8] px-3 py-2 text-[13px] text-[#18191C]
              focus:border-[#0066bf] focus:outline-none focus:ring-0 focus:ring-[#0066bf]
              cursor-pointer"
          />
        </div>
        {/* Model Number Input (integer) */}
        <div>
          <label className="block text-sm font-medium">Model</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{4}"
            maxLength={4}
            value={draft.model !== undefined ? draft.model.toString() : ''}
            onChange={e => {
              const value = e.target.value.replace(/\D/g, ''); // Only allow digits
              if (value.length <= 4) {
                setModel(value ? parseInt(value, 10) : undefined);
              }
            }}
            placeholder="Enter model year"
            className="mt-1 w-full h-[40px] rounded-[5px] border border-[#E4E5E8] px-3 py-2 text-[13px] text-[#18191C]
              focus:border-[#0066bf] focus:outline-none focus:ring-0 focus:ring-[#0066bf]
              cursor-pointer"
          />
        </div>
      </div>
    </div>
  )
}
