// src/components/templates/TemplateList.tsx
import React, { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Calendar,
  Tag,
  ChevronLeft,
  Eye,
  X,
} from "lucide-react";
import { getRequestStatus, postRequestStatus } from "../../networkCalls/NetworkCalls";
import { Api_url } from "../../networkCalls/Apiurls";
import RenderUiTemplate from "../../../public/RenderUi_Template";
import AddQuestions, { NewQuestion } from "./AddQuestions";
import RingGradientLoader from "../../components/RingGradientLoader";
import { showSuccess, showError } from "../../services/toasterService";
import { canCreateTemplate } from "../../services/permissionsService"; // ← ADD IMPORT
const DEFAULT_LOW_LABEL = import.meta.env.VITE_WEIGHTAGE_DEFAULT_LOW_LABEL;
const DEFAULT_MEDIUM_LABEL = import.meta.env.VITE_WEIGHTAGE_DEFAULT_MEDIUM_LABEL;
const DEFAULT_HIGH_LABEL = import.meta.env.VITE_WEIGHTAGE_DEFAULT_HIGH_LABEL;

interface Template {
  template_type_id: number;
  template_type_name: string;
  format_name: string;
  is_active: boolean;
  section?: boolean;
  weightage?: boolean;
}
interface Version {
  template_id?: number;
  template_name?: string;
  created_date?: string;
  template_version?: string;
  json_template?: any; // Added for accessing JSON in latest version
}
interface Section {
  title: string;
  questions: any[];
}
interface WeightageRange {
  id: number;
  label: string;
  from: string;
  to: string;
}
interface JsonTemplate {
  formTitle: string;
  questions?: any[];
  tables?: any[];
  sections?: Section[];
  weightage_ranges?: {
    label: string;
    from: number | null;
    to: number | null;
  }[];
}
interface TemplateListProps {
  onEnterEditor: (template: Template) => void;
  initialSelected?: Template;
  onResetSelected?: () => void;
}
const dummyWeightageChange = (total: number, updatedJson: any, action?: "submit" | "change" | undefined, riskLabel?: string | undefined) => {
  // console.log("Weightage changed", total, updatedJson, action, riskLabel);
};
const dummySubmit = (data: any) => {
  // console.log("Form submitted", data);
};
const TemplateList: React.FC<TemplateListProps> = ({ onEnterEditor, initialSelected, onResetSelected }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Template | null>(initialSelected || null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [flatQuestions, setFlatQuestions] = useState<NewQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingVersions, setLoadingVersions] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  /* ---------- View-mode state ---------- */
  const [viewing, setViewing] = useState<boolean>(false);
  const [viewLoading, setViewLoading] = useState<boolean>(false);
  const [viewError, setViewError] = useState<string>("");
  const [formSchema, setFormSchema] = useState<JsonTemplate | null>(null);

  /* ---------- Editor mode for non-section templates ---------- */
  const [showAddQuestions, setShowAddQuestions] = useState<boolean>(false);
  const [isShowContent, setIsShowContent] = useState<boolean>(false);
  const [savingTemplate, setSavingTemplate] = useState<boolean>(false); // ← NEW: Save loader
  const [weightageRanges, setWeightageRanges] = useState<WeightageRange[]>([]);
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await getRequestStatus<any>(Api_url.getAllTemplateTypes);
      if ((res?.data as any)?.status_code === 200) {
        setTemplates((res.data as any).data);
        setError("");
      } else {
        setError("No active templates found.");
      }
    } catch (e: any) {
      // console.error(e);
      setError("Failed to fetch templates.");
    } finally {
      setLoading(false);
    }
  };
  /* -------------------------------------------------
     1. Load all template types on initial render
  ------------------------------------------------- */
  useEffect(() => {
    fetchTemplates();
  }, []);
  /* -------------------------------------------------
     Set initial selected if provided
  ------------------------------------------------- */
  useEffect(() => {
    if (initialSelected && (!selected || selected.template_type_id !== initialSelected.template_type_id)) {
      setSelected(initialSelected);
    }
  }, [initialSelected]);
  /* -------------------------------------------------
     2. Load versions for selected template type
  ------------------------------------------------- */
  useEffect(() => {
    if (selected) {
      fetchVersions(selected.template_type_id);
    } else {
      setVersions([]);
      setFlatQuestions([]);
    }
  }, [selected]);
  const handleTemplateClick = (t: Template) => {
    setSelected(t);
    setViewing(false);
    setShowAddQuestions(false);
    setIsShowContent(false);
  };
  const fetchVersions = async (templateTypeId: number) => {
    setLoadingVersions(true);
    try {
      const url = Api_url.getAllVersions(templateTypeId);
      const res = await getRequestStatus<any>(url);
      if ((res?.data as any)?.status_code === 200) {
        let versionsData = (res.data as any).data || [];
        // Sort by created_date descending
        versionsData = versionsData
          .filter((v: Version) => v.template_id && v.created_date)
          .sort(
            (a: Version, b: Version) =>
              new Date(b.created_date!).getTime() - new Date(a.created_date!).getTime()
          );
        setVersions(versionsData);
       
        if (versionsData.length > 0) {
          const latest = versionsData[0];
          const json: JsonTemplate = latest.json_template;
          // console.log("latest):", latest);
          // console.log("json):", json.questions);
         
          let cleanQuestions: { type: string; question: string }[] = [];
          if (json.questions && Array.isArray(json.questions)) {
            cleanQuestions = json.questions.map((q: any) => ({
              type: q.type || "text",
              question: q.label || "",
            }));
          } else if (json.sections && Array.isArray(json.sections)) {
            cleanQuestions = json.sections.flatMap((section: any) =>
              (section.questions || []).map((q: any) => ({
                type: q.type || "text",
                question: q.label || "",
              }))
            );
          }
         
          // console.log("cleanQuestions", cleanQuestions);

          setFlatQuestions(cleanQuestions);
          if (selected?.weightage && json.weightage_ranges && Array.isArray(json.weightage_ranges)) {
            const ranges: WeightageRange[] = json.weightage_ranges.map((r: any, idx: number) => ({
              id: Date.now() + idx,
              label: r.label || "",
              from: r.from !== null && r.from !== undefined ? String(r.from) : "",
              to: r.to !== null && r.to !== undefined ? String(r.to) : "",
            }));
            setWeightageRanges(ranges);
          } else if (selected?.weightage) {
            const defaults: WeightageRange[] = [
              { id: Date.now(), label: DEFAULT_LOW_LABEL, from: "", to: "" },
              { id: Date.now() + 1, label: DEFAULT_MEDIUM_LABEL, from: "", to: "" },
              { id: Date.now() + 2, label: DEFAULT_HIGH_LABEL, from: "", to: "" },
            ];
            setWeightageRanges(defaults);
          } else {
            setWeightageRanges([]);
          }
        } else {
          setFlatQuestions([]);
          if (selected?.weightage) {
            const defaults: WeightageRange[] = [
              { id: Date.now(), label: DEFAULT_LOW_LABEL, from: "", to: "" },
              { id: Date.now() + 1, label: DEFAULT_MEDIUM_LABEL, from: "", to: "" },
              { id: Date.now() + 2, label: DEFAULT_HIGH_LABEL, from: "", to: "" },
            ];
            setWeightageRanges(defaults);
          } else {
            setWeightageRanges([]);
          }
        }
      } else {
        setVersions([]);
        setFlatQuestions([]);
        setWeightageRanges([]);
      }
    } catch (e) {
      // console.error("Error fetching versions:", e);
      setVersions([]);
      setFlatQuestions([]);
      setWeightageRanges([]);
    } finally {
      setLoadingVersions(false);
    }
  };
  /* -------------------------------------------------
     3. Handle back from versions list - REFRESH TEMPLATES
  ------------------------------------------------- */
  const handleBackFromVersions = () => {
    setSelected(null);
    setIsShowContent(false);
    onResetSelected?.();
    // Refresh the templates list when going back
    fetchTemplates();
  };
  /* -------------------------------------------------
     4. VIEW – fetch the JSON template for a version
  ------------------------------------------------- */
  const handleViewClick = async (templateId: number) => {
    setViewLoading(true);
    setViewError("");
    setViewing(true);
    try {
      const url = Api_url.getJsonTemplate(templateId);
      const res = await getRequestStatus<any>(url);
      if ((res?.data as any)?.status_code === 200) {
        const schema = (res.data as any)?.data?.json_template ?? (res.data as any)?.json_template;
        if (!schema) throw new Error("json_template not found in response");
        setFormSchema(schema);
      } else {
        throw new Error((res?.data as any)?.message ?? "Failed to load template");
      }
    } catch (e: any) {
      // console.error(e);
      setViewError(e.message ?? "Network error");
      setFormSchema(null);
    } finally {
      setViewLoading(false);
    }
  };
  const closeView = () => {
    setViewing(false);
    setFormSchema(null);
    setViewError("");
  };
  const handleSaveQuestions = async (arg: NewQuestion[] | { questions: NewQuestion[]; weightageRanges?: WeightageRange[] }) => {
    let savedQuestions: NewQuestion[];
    let wr: WeightageRange[] | undefined;
    if (Array.isArray(arg)) {
      savedQuestions = arg;
    } else {
      savedQuestions = arg.questions;
      wr = arg.weightageRanges;
    }
    if (!selected) return;
    setSavingTemplate(true);
    const templateData = {
      formTitle: selected.template_type_name,
      questions: savedQuestions
        .filter((q: any) => q.type !== "Table")
        .map((q: any) => ({
          label: q.question,
          type: q.type.toLowerCase(),
          options: q.options,
        })),
      tables: savedQuestions
        .filter((q: any) => q.type === "Table")
        .map((tableQ: any) => {
          const generateKey = (name: string, index: number): string => {
            let key = (name || `Column ${index + 1}`).toLowerCase().replace(/[^a-z0-9]/g, "_");
            if (key === "") key = `column_${index}`;
            return key;
          };
          const colInfos = tableQ.columns?.map((col: any, index: number) => {
            const key = generateKey(col.name, index);
            const type = col.type === "Text" ? "text" : col.type.toLowerCase();
            const colObj: any = {
              header: col.name || `Column ${index + 1}`,
              key,
              type,
            };
            if ((col.type === "button" || col.type === "label") && col.options?.length > 0) {
              colObj.label = col.options[0];
            }
            return { ...col, tempKey: key, obj: colObj };
          }) || [];
          return {
            columns: colInfos.map((ci: any) => ci.obj),
            rows: tableQ.rows?.map((row: any) =>
              colInfos.reduce((acc: any, ci: any) => {
                acc[ci.tempKey] = row.cells?.[ci.id] || (ci.type === "button" ? "" : "");
                return acc;
              }, {})
            ) || [],
          };
        }),
    };
    if (wr) {
      (templateData as any).weightage_ranges = wr.map((r) => ({
        label: r.label,
        from: r.from ? parseInt(r.from, 10) : null,
        to: r.to ? parseInt(r.to, 10) : null,
      }));
    }
    const fullSchema = {
      template: templateData,
    };
    const payload = {
      template_name: selected.template_type_name,
      template_type_id: selected.template_type_id,
      json_template: fullSchema.template,
      created_by: 1,
    };
    try {
      const res = await postRequestStatus(Api_url.createJsonTemplate, payload);
      if ((res?.data as any)?.status_code === 200 || (res?.data as any)?.status_code === 201) {
        showSuccess(`Template "${selected.template_type_name}" saved successfully`);
        setShowAddQuestions(false);
        setIsShowContent(false);
        fetchVersions(selected.template_type_id);
      } else {
        showError((res?.data as any)?.message || "Failed to save template");
      }
    } catch (e: any) {
      // console.error(e);
      showError(e.message || "Network error. Please try again.");
    } finally {
      setSavingTemplate(false);
    }
  };
  const closeAddQuestions = () => {
    setShowAddQuestions(false);
    setIsShowContent(false);
  };

  // MAIN LOADER - Templates List
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <RingGradientLoader />
        {/* <p className="mt-6 text-xl font-medium text-gray-600">Loading templates...</p> */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <X size={64} className="text-red-500 mb-4" />
        <p className="text-xl font-medium text-red-600">{error}</p>
      </div>
    );
  }

  // VIEW MODE
  if (viewing) {
    return (
      <div className="w-full max-w-7xl mx-auto bg-gray-50">
        <div className="flex justify-between items-center gap-4 mb-4">
          <h2 className="text-[20px] font-semibold text-gray-800">
            {selected?.template_type_name ?? ""} – Preview
          </h2>
          <button onClick={closeView} className="self-start px-4 py-2  flex items-center gap-2">
            <ChevronLeft size={18} /> Back to Versions
          </button>
        </div>
        {viewLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RingGradientLoader />
            {/* <p className="mt-6 text-xl font-medium text-gray-600">Loading template preview...</p> */}
          </div>
        ) : viewError ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-8 py-6 rounded-2xl max-w-2xl text-center">
            <X size={48} className="mx-auto mb-4" />
            <p className="text-lg font-medium">{viewError}</p>
          </div>
        ) : formSchema ? (
          <div className="w-full bg-white p-4 rounded-xl shadow-md">
            <RenderUiTemplate
              formSchema={formSchema}
              onWeightageChange={dummyWeightageChange}
              onSubmit={dummySubmit}
            />
          </div>
        ) : null}
      </div>
    );
  }
  /* ---------- SELECTED TEMPLATE – Versions list ---------- */
  const isInAddQuestionsMode = showAddQuestions && isShowContent && selected && !selected.section;
  if (selected && !isInAddQuestionsMode) {
    return (
      <div className="w-full max-w-[85rem] mx-auto bg-gray-50">
        <div className="flex justify-between items-center gap-4 mb-4">
          <h2 className="text-[20px] font-semibold text-gray-800">
            {selected.template_type_name}
          </h2>
          <button onClick={handleBackFromVersions}
            className="self-start px-4 py-2  flex items-center gap-2"
          >
            <ChevronLeft size={18} /> Back
          </button>
        </div>

        <div className="bg-white border border-gray-200 shadow rounded-[5px] pb-6 p-4">
        {/* Add New Version button (top) */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">
            Versions
          </h2>
          {selected.is_active && (
            <button
              onClick={() => {
                if (!canCreateTemplate()) {
                  showError("You do not have permission to create templates.");
                  return;
                }
                if (selected.section) {
                  onEnterEditor(selected);
                } else {
                  setShowAddQuestions(true);
                  setIsShowContent(true);
                }
              }}
            disabled={!canCreateTemplate()}
title={!canCreateTemplate() ? "You do not have permission" : ""}
className={`px-3 py-2 cursor-pointer text-white rounded-lg flex items-center gap-2 transition-colors ${
  canCreateTemplate()
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-gray-400 text-gray-600 cursor-not-allowed"
}`}
            >
              <Plus size={20} /> Add New Version
            </button>
          )}
        </div>
        {/* Existing Versions Table */}
        {!isShowContent && (
          <div className="w-full">
            {loadingVersions ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-md">
                <RingGradientLoader />
                {/* <p className="mt-6 text-xl font-medium text-gray-600">Loading versions...</p> */}
              </div>
            ) : versions.length > 0 ? (
              <div className="bg-white rounded-md shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[#1d69bf] border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-sm font-medium text-white">
                          <div className="flex items-center">
                          <FileText size={16} className="inline mr-2" />
                          Template Name
                          </div>
                        </th>
                        <th className="px-6 py-4 text-sm font-medium text-white">
                          <div className="flex items-center">
                          <Calendar size={16} className="inline mr-2" />
                          Created Date
                          </div>
                        </th>
                        <th className="px-6 py-4 text-sm font-medium text-white">
                          <div className="flex items-center">
                          <Tag size={16} className="inline mr-2" />
                          Version
                          </div>
                        </th>
                        <th className="px-6 py-4 text-sm font-medium text-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {versions.map((v, i) => (
                        <tr key={v.template_id ?? i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {v.template_name ?? `Version ${i + 1}`}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {v.created_date
                              ? new Date(v.created_date).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {v.template_version ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {v.template_id && (
                              <button
                                onClick={() => handleViewClick(v.template_id!)} title="Preview this version"
                                className="text-blue-600 hover:text-blue-900 flex items-center gap-1 mr-4"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl shadow-md text-center text-gray-500">
                <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-lg">
                  No versions yet. {selected.is_active ? "Create the first one!" : ""}
                </p>
              </div>
            )}
          </div>
        )}
        </div>

        {/* Inactive message */}
        {!selected.is_active && (
          <div className="mt-8 bg-white p-8 rounded-2xl shadow-md text-center max-w-xl">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              {selected.format_name}
            </h2>
            <p className="text-gray-600">
              This template type is <strong>inactive</strong>. You can view existing versions
              but cannot add new ones.
            </p>
          </div>
        )}
      </div>
    );
  }
  /* ---------- AddQuestions for non-section templates ---------- */
  if (isInAddQuestionsMode) {
    return (
      <AddQuestions
        sectionId={null}
        sectionName={selected!.template_type_name}
        existingQuestions={flatQuestions}
        initialWeightageRanges={weightageRanges}
        showWeightage={selected!.weightage === true}
        onBack={closeAddQuestions}
        onSave={(arg) => handleSaveQuestions(arg)}
      />
    );
  }
  /* ---------- DEFAULT – List of template types ---------- */
  return (
    <div className="p-10 flex flex-col items-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-10 text-gray-800">
        Templates
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10 w-full max-w-7xl">
        {templates.map((t, i) => {
          const colors = [
            "bg-[rgba(99,91,255,1)] text-white",
            "bg-[rgba(22,205,199,1)] text-white",
          ];
          const bgcolors = [
            "bg-[linear-gradient(180deg,rgba(99,91,255,0.12)_0%,rgba(99,91,255,0.03)_100%)]",
            "bg-[linear-gradient(180deg,rgba(22,205,199,0.12)_0%,rgba(22,205,199,0.03)_100%)]",
          ];
          
          const color = colors[i % colors.length];
          return (
            <div
              key={t.template_type_id}
              onClick={() => handleTemplateClick(t)}
              className={`rounded-[8px] p-6 shadow-sm p-8 rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer flex flex-col items-center text-center 
               ${ bgcolors[i % bgcolors.length] }`}
            >
              <div
                className={`w-12 h-12 rounded-[8px] flex items-center justify-center mb-4 ${color}`}
              >
                <FileText size={28} />
              </div>
              <h3 className="text-[18px] font-medium text-gray-800 mb-1 leading-[25px]">
                {t.template_type_name}
              </h3>
              {/* <p className="text-gray-700 font-normal text-[14px]">{t.format_name}</p> */}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default TemplateList;