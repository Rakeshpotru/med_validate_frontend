// src/components/templates/TemplateEditor.tsx
import React, { useEffect, useState } from "react";
import {
  Trash2,
  Plus,
  Eye,
  ChevronLeft,
  FileText,
  Calendar,
  Tag,
} from "lucide-react";
import { postRequestStatus, getRequestStatus } from "../../networkCalls/NetworkCalls";
import { Api_url } from "../../networkCalls/Apiurls";
import AddQuestions, { NewQuestion } from "./AddQuestions";
import RenderUiTemplate from "../../../public/RenderUi_Template"; // Assuming this can render sections too; adjust if needed
import { showSuccess, showError } from "../../services/toasterService";
import RingGradientLoader from "../../components/RingGradientLoader";
import DeleteConfirm from "../../modules/auth/pages/DeletePopup"; // adjust path as needed

// Environment-based default labels 
const DEFAULT_LOW_LABEL = import.meta.env.VITE_WEIGHTAGE_DEFAULT_LOW_LABEL;
const DEFAULT_MEDIUM_LABEL = import.meta.env.VITE_WEIGHTAGE_DEFAULT_MEDIUM_LABEL;
const DEFAULT_HIGH_LABEL = import.meta.env.VITE_WEIGHTAGE_DEFAULT_HIGH_LABEL;

interface Template {
  template_type_id: number;
  template_type_name: string;
  is_active: boolean;
  weightage?: boolean; // from API
  format_name?: string; // Added for completeness
}

interface Section {
  id: number;
  name: string;
  questions: any[];
}

interface Version {
  template_id?: number;
  template_name?: string;
  created_date?: string;
  template_version?: string;
}
interface WeightageRange {
  id: number;
  label: string;
  from: string;
  to: string;
}
interface JsonTemplate {
  formTitle: string;
  sections: {
    title: string;
    questions?: any[];
    table?: {
      columns: any[];
      rows: any[];
    };
  }[];
  weightage_ranges?: {
    label: string;
    from: number | null;
    to: number | null;
  }[];
}
interface TemplateEditorProps {
  template: Template;
  versions: Version[];
  onBack: () => void;
  onRefreshVersions: () => void;
  latestVersionId?: number;               // ← NEW
}

const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template,
  versions,
  onBack,
  onRefreshVersions,
  latestVersionId,
}) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState<boolean>(false); // ← NEW: Loading state for sections
  const [sectionName, setSectionName] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<{ id: number; name: string } | null>(null);
  const [showAddQuestions, setShowAddQuestions] = useState<boolean>(false);
  const [previewSection, setPreviewSection] = useState<Section | null>(null);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [loadingPreview, setLoadingPreview] = useState<boolean>(false);
  const createdBy = 1;
  const [saving, setSaving] = useState<boolean>(false);
  const [initialSections, setInitialSections] = useState<Section[]>([]);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [weightageRanges, setWeightageRanges] = useState<WeightageRange[]>([]);
  const [initialWeightageRanges, setInitialWeightageRanges] = useState<WeightageRange[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<boolean>(false);
  const [sectionToDelete, setSectionToDelete] = useState<{ id: number; name: string } | null>(null);
  useEffect(() => {
    if (!latestVersionId) {
      setSections([]);
      setInitialSections([]);
      if (template.weightage) {
        const defaults: WeightageRange[] = [
          { id: Date.now(), label: DEFAULT_LOW_LABEL, from: "", to: "" },
          { id: Date.now() + 1, label: DEFAULT_MEDIUM_LABEL, from: "", to: "" },
          { id: Date.now() + 2, label: DEFAULT_HIGH_LABEL, from: "", to: "" },
        ];
        setWeightageRanges(defaults);
        setInitialWeightageRanges(JSON.parse(JSON.stringify(defaults)));
      } else {
        setWeightageRanges([]);
        setInitialWeightageRanges([]);
      }
      setHasChanges(false);
      return;
    }
    const loadLatest = async () => {
      setLoadingSections(true); // ← Start loader
      try {
        // const url = `http://127.0.0.1:308/api/master/getJsonTemplate/${latestVersionId}`;
        const url = Api_url.getJsonTemplate(latestVersionId);
        
        const res = await getRequestStatus<any>(url);
        if (res?.data?.status_code === 200) {
          const json = res.data?.data?.json_template ?? res.data?.json_template;
          if (!json) throw new Error("json_template missing");
          // ---- convert API schema → local Section[] ----
          const secs: Section[] = json.sections.map((s: any, idx: number) => {
            const tableQ = s.table
              ? [
                  {
                    type: "Table",
                    columns: s.table.columns.map((c: any, ci: number) => ({
                      id: Date.now() + ci,
                      name: c.header,
                      type: c.type === "text" ? "Text" : c.type === "button" ? "button" : "label",
                      options: c.label ? [c.label] : [],
                    })),
                    rows: s.table.rows.map((r: any, ri: number) => {
                      return {
                        id: Date.now() + ri,
                        cells: Object.fromEntries(
                          s.table.columns.map((c: any, ci: number) => {
                            const colId = Date.now() + ci;
                            return [colId, r[c.key] ?? ""];
                          })
                        ),
                      };
                    }),
                  },
                ]
              : [];
            const otherQs = (s.questions ?? []).map((q: any) => ({
              question: q.label,
              type: q.type.charAt(0).toUpperCase() + q.type.slice(1),
              options: q.options?.map((opt: any) => ({
                option: opt.option ?? opt,
                weight: opt.weight ?? 0,
              })),
              ...(q.type === "textarea" && { comments: q.comments ?? false }),
            }));
            return {
              id: Date.now() + idx,
              name: s.title,
              questions: [...tableQ, ...otherQs],
            };
          });
          setSections(secs);
          setInitialSections(JSON.parse(JSON.stringify(secs))); // Deep copy snapshot
          if (template.weightage) {
            if (json.weightage_ranges && Array.isArray(json.weightage_ranges)) {
              const ranges: WeightageRange[] = json.weightage_ranges.map((r: any, idx: number) => ({
                id: Date.now() + idx,
                label: r.label || "",
                from: r.from != null ? r.from.toString() : "",
                to: r.to != null ? r.to.toString() : "",
              }));
              setWeightageRanges(ranges);
              setInitialWeightageRanges(JSON.parse(JSON.stringify(ranges)));
            } else {
              const defaults: WeightageRange[] = [
                { id: Date.now(), label: DEFAULT_LOW_LABEL, from: "", to: "" },
                { id: Date.now() + 1, label: DEFAULT_MEDIUM_LABEL, from: "", to: "" },
                { id: Date.now() + 2, label: DEFAULT_HIGH_LABEL, from: "", to: "" },
              ];
              setWeightageRanges(defaults);
              setInitialWeightageRanges(JSON.parse(JSON.stringify(defaults)));
            }
          } else {
            setWeightageRanges([]);
            setInitialWeightageRanges([]);
          }
          setHasChanges(false);
        } else {
          throw new Error(res?.data?.message ?? "Failed to load latest version");
        }
      } catch (e: any) {
        // console.error(e);
        // Replaced alert with toaster
        showError(`Failed to load latest version: ${e.message}`);
        setSections([]);
        setInitialSections([]);
        if (template.weightage) {
          const defaults: WeightageRange[] = [
            { id: Date.now(), label: DEFAULT_LOW_LABEL, from: "", to: "" },
            { id: Date.now() + 1, label: DEFAULT_MEDIUM_LABEL, from: "", to: "" },
            { id: Date.now() + 2, label: DEFAULT_HIGH_LABEL, from: "", to: "" },
          ];
          setWeightageRanges(defaults);
          setInitialWeightageRanges(JSON.parse(JSON.stringify(defaults)));
        } else {
          setWeightageRanges([]);
          setInitialWeightageRanges([]);
        }
        setHasChanges(false);
      } finally {
        setLoadingSections(false); // ← Stop loader
      }
    };
    loadLatest();
  }, [latestVersionId, template.weightage]);
  useEffect(() => {
    const sectionsChanged = JSON.stringify(sections) !== JSON.stringify(initialSections);
    const weightageChanged = template.weightage
      ? JSON.stringify(weightageRanges) !== JSON.stringify(initialWeightageRanges)
      : false;
    setHasChanges(sectionsChanged || weightageChanged);
  }, [sections, initialSections, weightageRanges, initialWeightageRanges, template.weightage]);

  // ==================== NEW: Weightage Range Validations ====================
  const isWeightageLabelDuplicate = (label: string, excludeId: number | null = null): boolean => {
    const trimmedLabel = label.trim();
    return weightageRanges.some(range => 
      range.id !== excludeId && 
      range.label.trim().toLowerCase() === trimmedLabel.toLowerCase()
    );
  };

  const validateWeightageRanges = (): boolean => {
    if (!template.weightage) return true;

    if (weightageRanges.length === 0) {
      showError("At least one weightage range is required.");
      return false;
    }

    // Check for duplicate labels
    const labels = weightageRanges.map(range => range.label.trim().toLowerCase());
    const duplicateLabels = labels.filter((label, index) => labels.indexOf(label) !== index);
    
    if (duplicateLabels.length > 0) {
      showError(`Duplicate weightage labels found: "${duplicateLabels.join(', ')}". Each weightage range must have a unique label.`);
      return false;
    }

    for (const range of weightageRanges) {
      if (!range.label.trim()) {
        showError("Weightage label cannot be empty.");
        return false;
      }
      if (range.from === "" || isNaN(Number(range.from))) {
        showError(`"From" value in "${range.label}" must be a valid number.`);
        return false;
      }
      if (range.to === "" || isNaN(Number(range.to))) {
        showError(`"To" value in "${range.label}" must be a valid number.`);
        return false;
      }
      if (Number(range.to) <= Number(range.from)) {
        showError(`"To" must be greater than "From" in "${range.label}".`);
        return false;
      }
    }

    // Check for overlapping ranges
    const sorted = [...weightageRanges].sort((a, b) => Number(a.from) - Number(b.from));
    for (let i = 0; i < sorted.length - 1; i++) {
      if (Number(sorted[i].to) >= Number(sorted[i + 1].from)) {
        showError(`Weightage ranges "${sorted[i].label}" and "${sorted[i + 1].label}" are overlapping.`);
        return false;
      }
    }

    return true;
  };
  // ==========================================================================

  const updateRange = (id: number, field: keyof WeightageRange, value: string) => {
    // Only validate if we're updating the label field
    if (field === "label") {
      const trimmedValue = value.trim();
      
      if (trimmedValue && isWeightageLabelDuplicate(trimmedValue, id)) {
        showError(`Weightage label "${trimmedValue}" already exists. Please use a different label.`);
        return; // Don't update if duplicate
      }
    }

    setWeightageRanges((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };
  const deleteRange = (id: number) => {
    setWeightageRanges((prev) => prev.filter((r) => r.id !== id));
  };
  const addRange = () => {
    setWeightageRanges((prev) => [
      ...prev,
      { id: Date.now(), label: "", from: "", to: "" },
    ]);
  };
  const handleAddSection = () => {
    if (!sectionName.trim()) {
      showError("Please enter a section name");
      return;
    }

    // Check for duplicate section names (case-insensitive)
    const trimmedName = sectionName.trim();
    const isDuplicate = sections.some(
      section => section.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (isDuplicate) {
      showError(`Section "${trimmedName}" already exists. Please use a different name.`);
      return;
    }

    const newSec: Section = {
      id: Date.now(),
      name: trimmedName,
      questions: []
    };

    setSections((prev) => [...prev, newSec]);
    setSectionName("");
    showSuccess(`Section "${newSec.name}" added`);
  };

  const handleDeleteSection = (id: number) => {
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  // ← NEW: Delete confirmation handlers
  const openDeleteConfirm = (id: number, name: string) => {
    setSectionToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setSectionToDelete(null);
  };

  const confirmDeleteSection = () => {
    if (sectionToDelete) {
      handleDeleteSection(sectionToDelete.id);
      showSuccess(`Section "${sectionToDelete.name}" deleted`);
    }
    closeDeleteConfirm();
  };

  const openAddQuestions = (id: number, name: string) => {
    setSelectedSection({ id, name });
    setShowAddQuestions(true);
  };
  const handleSaveQuestions = (arg: NewQuestion[] | { questions: NewQuestion[]; weightageRanges?: WeightageRange[] | undefined; }) => {
    let savedQuestions: NewQuestion[];
    let newWeightageRanges: WeightageRange[] | undefined;
    if (Array.isArray(arg)) {
      savedQuestions = arg;
    } else {
      savedQuestions = arg.questions;
      newWeightageRanges = arg.weightageRanges;
    }
    if (newWeightageRanges) {
      setWeightageRanges(newWeightageRanges);
    }
    if (!selectedSection) return;
    const cleanedQuestions = template.weightage
      ? savedQuestions
      : savedQuestions.map((q) => {
        if (["Dropdown", "Radio", "Checkbox"].includes(q.type)) {
          return {
            ...q,
            options: q.options?.map((opt: any) => ({ option: opt.option })) || [],
          };
        }
        return q;
      });
    setSections((prev) =>
      prev.map((s) => (s.id === selectedSection.id ? { ...s, questions: cleanedQuestions } : s))
    );
  };

  const closeAddQuestions = () => {
    setShowAddQuestions(false);
    setSelectedSection(null);
  };

  // ---------- Preview ----------
  const openPreview = async (sec: Section) => {
    setPreviewSection(sec);
    setShowPreview(true);
    setLoadingPreview(true);
    // Simulate loading if needed; RenderUiTemplate might not need it
    setTimeout(() => setLoadingPreview(false), 500);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewSection(null);
    setLoadingPreview(false);
  };

  // ---------- Save whole template ----------
  // MODIFIED: Save only enabled when there are sections, questions, AND actual changes
  const canSave =
    sections.length > 0 &&
    sections.every((s) => s.questions.length > 0) &&
    (!template.weightage || weightageRanges.length > 0) &&
    hasChanges;
  const handleSaveTemplate = async () => {
    if (!canSave) return;

    // NEW: Validate weightage ranges before saving
    if (template.weightage && !validateWeightageRanges()) {
      return; // Stop saving if validation fails (toasters already shown)
    }

    setSaving(true);
    const fullSchemaTemplate: JsonTemplate = {
      formTitle: template.template_type_name,
      sections: sections.map((s) => {
        const secObj: any = { title: s.name };
        const tableQ = s.questions.find((q: any) => q.type === "Table");
        const otherQs = s.questions.filter((q: any) => q.type !== "Table");
        if (tableQ) {
          const generateKey = (name: string, index: number): string => {
            let key = (name || `Column ${index + 1}`).toLowerCase().replace(/[^a-z0-9]/g, "_");
            if (key === "") key = `column_${index}`;
            return key;
          };
          const colInfos = tableQ.columns?.map((col: any, index: number) => {
            const key = generateKey(col.name, index);
            // FIXED: Correct type mapping – label stays "label", not "text"
            const type = col.type === "Text" ? "text" : col.type.toLowerCase();
            const colObj: any = {
              header: col.name || `Column ${index + 1}`,
              key,
              type,
            };
            // Apply label for both button and label types if options exist
            if ((col.type === "button" || col.type === "label") && col.options?.length > 0) {
              colObj.label = col.options[0];
            }
            return { ...col, tempKey: key, obj: colObj };
          }) || [];
          const tableData = {
            columns: colInfos.map((ci: any) => ci.obj),
            rows: tableQ.rows?.map((row: any) =>
              colInfos.reduce((acc: any, ci: any) => {
                // FIXED: Access cells by ci.id (number), which matches loaded/saved keys
                acc[ci.tempKey] = row.cells?.[ci.id] || (ci.type === "button" ? "" : "");
                return acc;
              }, {})
            ) || [],
          };
          secObj.table = tableData;
        }
        if (otherQs.length > 0) {
          secObj.questions = otherQs.map((q: any) => ({
            label: q.question,
            type: q.type.toLowerCase(),
            options: q.options,
            ...(q.type === "Textarea" && { comments: q.comments ?? false }),
          }));
        }
        return secObj;
      }),
    };
    if (template.weightage) {
      fullSchemaTemplate.weightage_ranges = weightageRanges.map((r) => ({
        label: r.label,
        from: r.from ? parseInt(r.from, 10) : null,
        to: r.to ? parseInt(r.to, 10) : null,
      }));
    }
    const payload = {
      template_name: template.template_type_name,
      template_type_id: template.template_type_id,
      json_template: fullSchemaTemplate,
      created_by: createdBy,
    };
    try {
      const res = await postRequestStatus<any>(Api_url.createJsonTemplate, payload);
      if (res?.data?.status_code === 200 || res?.data?.status_code === 201) {
        showSuccess(`Template "${template.template_type_name}" saved successfully`);
        setSections([]);
        setInitialSections([]);
        setHasChanges(false);
        onRefreshVersions();
      } else {
        // Handle your exact API error format
        const errorMsg = res?.data?.message || "Failed to save template";
        showError(errorMsg);
      }
    } catch (e: any) {
      // console.error(e);
      showError(e.message || "Network error. Please try again.");
    } finally {
      setSaving(false); // ← Always stop loader
    }
  };

  // ---------- Render ----------
  if (showPreview && previewSection) {
    return (
      <div className="p-8 flex flex-col items-center min-h-screen bg-gray-50">
        <button
          onClick={closePreview}
          className="self-start mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center gap-2"
        >
          <ChevronLeft size={18} /> Back
        </button>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Preview: {previewSection.name}
        </h1>
        <div className="w-full bg-white p-6 rounded-2xl shadow-md max-w-4xl">
          {loadingPreview ? (
            <div className="text-center text-gray-500">Loading preview...</div>
          ) : (
            // TODO: Implement section preview. For now, use a simple list; integrate RenderUiTemplate if it supports sections
            <div className="space-y-4">
              {previewSection.questions.map((q: any, i: number) => (
                <div key={i} className="border p-4 rounded-lg">
                  <h3 className="font-semibold">{q.question || `Question ${i + 1}`}</h3>
                  <p>Type: {q.type}</p>
                  {q.type === "Textarea" && <p>Comments: {q.comments ? "Enabled" : "Disabled"}</p>}
                  {q.type === "Table" && (
                    <div className="mt-2">
                      <p>Columns: {q.columns?.length || 0}</p>
                      <p>Rows: {q.rows?.length || 0}</p>
                    </div>
                  )}
                  {q.options && <p>Options: {q.options.map((o: any) => o.option).join(", ")}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (showAddQuestions && selectedSection) {
    return (
      <AddQuestions
        sectionId={selectedSection.id}
        sectionName={selectedSection.name}
        existingQuestions={
          sections.find((s) => s.id === selectedSection.id)?.questions || []
        }
        showWeightage={template.weightage === true}
        onBack={closeAddQuestions}
        onSave={handleSaveQuestions}
      />
    );
  }

  // Main editor UI
  return (
    <div className="w-full max-w-[85rem] mx-auto bg-gray-50">
      <div className="flex justify-between items-center gap-4 mb-4">
        <h2 className="text-[20px] font-bold text-gray-800">
          {template.template_type_name} – {latestVersionId ? "Edit Latest Version" : "New Version"}
        </h2>
        <button onClick={onBack} className="self-start px-4 py-2  flex items-center gap-2">
          <ChevronLeft size={18} /> Back to Versions
        </button>
      </div>
      
      <div className="w-full flex gap-8 mb-8">
        {/* LEFT: Add Section */}
        <div className="w-[35%] space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-full">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Add New Section<span className="text-red-500">*</span>
            </h2>
            <input
              type="text"
              placeholder="Section name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4 focus:ring focus:ring-blue-200 outline-none"
            />
            <button
              onClick={handleAddSection}
              className="w-full bg-[#3b82f6] text-white rounded-lg py-2 hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Add Section
            </button>
          </div>
          {template.weightage && (
            <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Weightage Ranges</h3>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#dfedff] capitalize text-[14px] font-medium">
                    <th className="p-3 rounded-tl-[8px] rounded-bl-[8px]">Sl.No</th>
                    <th className="p-3">Weightage</th>
                    <th className="p-3">From</th>
                    <th className="p-3">To</th>
                    <th className="p-3 rounded-tr-[8px] rounded-br-[8px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {weightageRanges.map((range, idx) => (
                    <tr key={range.id} className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                      <td className="py-[12px] px-3 text-[14px] font-medium text-gray-500">{idx + 1}</td>
                      <td className="py-[12px] px-3">
                        <input
                          type="text"
                          value={range.label}
                          onChange={(e) => updateRange(range.id, "label", e.target.value)}
                          className="border border-gray-300 rounded p-1 w-full text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g., Low"
                        />
                      </td>
                      <td className="py-[12px] px-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={range.from}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d+$/.test(val)) {
                              updateRange(range.id, "from", val);
                            }
                          }}
                          className="border border-gray-300 rounded p-1 w-full text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g., 0"
                        />
                      </td>
                      <td className="py-[12px] px-3">
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={range.to}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || /^\d+$/.test(val)) {
                              updateRange(range.id, "to", val);
                            }
                          }}
                          className="border border-gray-300 rounded p-1 w-full text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="e.g., 30"
                        />
                      </td>
                      <td className="py-[12px] px-2 text-[14px] font-medium text-gray-500 text-center">
                        <button
                          title="Delete Range"
                          onClick={() => deleteRange(range.id)}
                          className="text-red-500 p-1 hover:bg-red-100 rounded-[5px] hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="w-full flex justify-end mt-4">
                <button
                  onClick={addRange}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
                >
                  <Plus size={16} /> Add Range
                </button>
              </div>
            </div>
          )}
        </div>
        {/* RIGHT: Sections Table */}
        <div className="flex-1">
          {latestVersionId && loadingSections ? (
            // ← NEW: Loader for "Loaded Sections (Edit/Add More)"
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center min-h-[300px]">
              <div className="text-center">
                <RingGradientLoader />
              </div>
            </div>
          ) : sections.length > 0 ? (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">
                {latestVersionId ? "Sections" : "New Sections"}
              </h3>
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#dfedff] capitalize text-[14px] font-medium">
                    <th className="p-3  rounded-tl-[8px] rounded-bl-[8px]">Sl.No</th>
                    <th className="p-3">Section Name</th>
                    <th className="p-3">Questions</th>
                    <th className="p-3 rounded-tr-[8px] rounded-br-[8px] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((sec, idx) => (
                    <tr key={sec.id} className="hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
                      <td className="py-[12px] px-3 text-[14px] font-medium text-gray-500">{idx + 1}</td>
                      <td className="py-[12px] px-3 text-[14px] font-medium text-gray-500">{sec.name}</td>
                      <td className="py-[12px] px-3 text-[14px] font-medium text-gray-500">{sec.questions.length}</td>
                      <td className="py-[12px] px-2 text-[14px] font-medium text-gray-500 text-center flex justify-center gap-3">
                        {/* <button
                          onClick={() => openAddQuestions(sec.id, sec.name)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Add Qs
                        </button> */}
                        <button title="Add Questions"
                          onClick={() => openAddQuestions(sec.id, sec.name)}
                          className="text-blue-600 p-1 hover:bg-blue-100 rounded-[5px] hover:text-blue-800 cursor-pointer"
                        >
                          <Plus size={18} />
                        </button>
                        {/* <button
                          onClick={() => openPreview(sec)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <Eye size={16} />
                        </button> */}
                        <button title="Remove Section"
                          onClick={() => openDeleteConfirm(sec.id, sec.name)}
                          className="text-red-500 p-1 hover:bg-red-100 rounded-[5px] hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="w-full flex justify-end">
                <button
                  onClick={handleSaveTemplate}
                  disabled={!canSave || saving}
                  className={`mt-6 w-auto py-2 px-4 rounded-lg flex items-center justify-center gap-2 ${canSave && !saving
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-400 text-gray-600 cursor-not-allowed"
                    }`}
                >
                  {saving ? (
                    <>
                      <RingGradientLoader />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FileText size={18} />
                      Save New Version
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            // ← NEW: Empty state when no sections
            <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center min-h-[300px]">
              <div className="text-center text-gray-500">
                <div className="mb-4">
                  <FileText size={48} className="mx-auto text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No Sections Available
                </h3>
                <p className="text-gray-500 mb-4">
                  Add your first section using the form on the left to get started.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ← NEW: Delete Confirmation Modal */}
      <DeleteConfirm
        open={deleteConfirmOpen}
        onClose={closeDeleteConfirm}
        onConfirm={confirmDeleteSection}
        itemName={sectionToDelete?.name ? `section "${sectionToDelete.name}"` : "this section"}
      />
    </div>
  );
};

export default TemplateEditor;