// AddQuestions.tsx

import React, { useEffect, useState } from "react";
import { Trash2, Plus, Eye, ChevronLeft, Edit2, SquarePen } from "lucide-react";
import { showError, showSuccess } from "../../services/toasterService"; // Added showSuccess
import RingGradientLoader from "../../components/RingGradientLoader";
import DeleteConfirm from "../../modules/auth/pages/DeletePopup";
// === ENVIRONMENT-BASED DEFAULT WEIGHTAGE LABELS ===
const DEFAULT_LOW_LABEL = import.meta.env.VITE_WEIGHTAGE_DEFAULT_LOW_LABEL;
const DEFAULT_MEDIUM_LABEL = import.meta.env.VITE_WEIGHTAGE_DEFAULT_MEDIUM_LABEL;
const DEFAULT_HIGH_LABEL = import.meta.env.VITE_WEIGHTAGE_DEFAULT_HIGH_LABEL;
export interface Column {
  id: number;
  name: string;
  type: "label" | "button" | "Text" | "date";
  options?: string[];
}
export interface Row {
  id: number;
  cells: Record<number, string>;
}
export interface NewQuestion {
  question?: string;
  type: string;
  options?: { option: string; weight: number }[];
  columns?: Column[];
  rows?: Row[];
  comments?: boolean;
}
export interface WeightageRange {
  id: number;
  label: string;
  from: string;
  to: string;
}
interface AddQuestionsProps {
  sectionId?: number | null;
  sectionName?: string | null;
  existingQuestions?: NewQuestion[];
  initialWeightageRanges?: WeightageRange[];
  onBack: () => void;
  onSave?: (arg: NewQuestion[] | { questions: NewQuestion[]; weightageRanges?: WeightageRange[] }) => void;
  showWeightage?: boolean;
}

const AddQuestions: React.FC<AddQuestionsProps> = ({
  sectionId,
  sectionName,
  existingQuestions = [],
  initialWeightageRanges = [],
  onBack,
  onSave,
  showWeightage = false,
}) => {
  // console.warn("_Child_",existingQuestions)
  const [questions, setQuestions] = useState<NewQuestion[]>(existingQuestions);
  const [originalQuestions, setOriginalQuestions] = useState<NewQuestion[]>([]); // ← NEW: For change detection
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState<NewQuestion>({
    question: "",
    type: "Dropdown",
    options: [], // ← MODIFIED: Start with empty options array
    columns: [],
    rows: [],
    comments: false, // ← NEW: Initialize comments
  });
  const [weightageRanges, setWeightageRanges] = useState<WeightageRange[]>([]);
  const [originalWeightageRanges, setOriginalWeightageRanges] = useState<WeightageRange[]>([]);
  useEffect(() => {
    setQuestions(existingQuestions);
    setOriginalQuestions(existingQuestions); // ← NEW: Capture original for comparison
  }, [existingQuestions]);
  useEffect(() => {
    if (sectionId === null && showWeightage) {
      const defaults: WeightageRange[] = [
        { id: Date.now(), label: DEFAULT_LOW_LABEL, from: "", to: "" },
        { id: Date.now() + 1, label: DEFAULT_MEDIUM_LABEL, from: "", to: "" },
        { id: Date.now() + 2, label: DEFAULT_HIGH_LABEL, from: "", to: "" },
      ];
      const ranges = initialWeightageRanges.length > 0 ? initialWeightageRanges : defaults;
      setWeightageRanges(ranges);
      setOriginalWeightageRanges(JSON.parse(JSON.stringify(ranges)));
    }
  }, [initialWeightageRanges, sectionId, showWeightage]);
  const questionTypes = ["Dropdown", "Radio", "Checkbox", "Text", "Textarea", "Table", "Date"];
  const questionsChanged = JSON.stringify(questions) !== JSON.stringify(originalQuestions);
  const weightageChanged = sectionId === null && showWeightage
    ? JSON.stringify(weightageRanges) !== JSON.stringify(originalWeightageRanges)
    : false;
  const hasChanges = questionsChanged || weightageChanged;

  // ==================== WEIGHTAGE RANGE VALIDATION ====================
  const validateWeightageRanges = (): boolean => {
    if (!showWeightage || sectionId !== null) return true;

    if (weightageRanges.length === 0) {
      showError("At least one weightage range is required.");
      return false;
    }

    for (const range of weightageRanges) {
      if (!range.label.trim()) {
        showError("Weightage label cannot be empty.");
        return false;
      }
      if (range.from === "" || isNaN(Number(range.from))) {
        showError(`"From" value in "${range.label || "this range"}" must be a valid number.`);
        return false;
      }
      if (range.to === "" || isNaN(Number(range.to))) {
        showError(`"To" value in "${range.label || "this range"}" must be a valid number.`);
        return false;
      }
      if (Number(range.to) <= Number(range.from)) {
        showError(`"To" must be greater than "From" in "${range.label}".`);
        return false;
      }
    }

    // Check overlapping ranges
    const sorted = [...weightageRanges]
      .map(r => ({ ...r, fromNum: Number(r.from), toNum: Number(r.to) }))
      .sort((a, b) => a.fromNum - b.fromNum);

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i].toNum >= sorted[i + 1].fromNum) {
        showError(`Weightage ranges "${sorted[i].label}" and "${sorted[i + 1].label}" are overlapping.`);
        return false;
      }
    }

    return true;
  };
  // ====================================================================

  const updateRange = (id: number, field: "label" | "from" | "to", value: string) => {
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
  const handleAddOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...(newQuestion.options || []), { option: "", weight: 0 }], // ← MODIFIED: Add empty option
    });
  };

  const handleOptionChange = (index: number, field: "option" | "weight", value: string | number) => {
    const updated = [...(newQuestion.options || [])];
    updated[index] = { ...updated[index], [field]: field === "weight" ? Number(value) || 0 : value };
    setNewQuestion({ ...newQuestion, options: updated });
  };

  const handleDeleteOption = (index: number) => {
    if ((newQuestion.options?.length || 0) > 1) {
      setNewQuestion({ ...newQuestion, options: (newQuestion.options || []).filter((_, i) => i !== index) });
    }
  };

  // ────── Table column handlers ──────
  const handleAddColumn = () => {
    const newCol: Column = { id: Date.now(), name: "", type: "label", options: [] }; // ← MODIFIED: Start with empty name
    setNewQuestion({ ...newQuestion, columns: [...(newQuestion.columns || []), newCol] });
    // If editing a table with existing rows, add empty cell to each row for the new column
    if (editingIndex !== null && newQuestion.type === "Table" && newQuestion.rows && newQuestion.rows.length > 0) {
      setNewQuestion(prev => ({
        ...prev,
        rows: prev.rows!.map(row => ({
          ...row,
          cells: { ...row.cells, [newCol.id]: "" }
        }))
      }));
    }
  };

  const handleColumnNameChange = (colId: number, value: string) => {
    setNewQuestion({
      ...newQuestion,
      columns: (newQuestion.columns || []).map(c => (c.id === colId ? { ...c, name: value } : c)),
    });
  };

  const handleColumnTypeChange = (colId: number, type: "label" | "button" | "Text" | "date") => {
    const updated = (newQuestion.columns || []).map(c => {
      if (c.id === colId) {
        let newOptions: string[] = [];
        if (type === "button") {
          // ← MODIFIED: Default to one empty button if none exists
          newOptions = (c.options && c.options.length > 0) ? c.options : [""];
        } else {
          newOptions = c.options || [];
        }
        return {
          ...c,
          type,
          options: newOptions
        };
      }
      return c;
    });
    setNewQuestion({ ...newQuestion, columns: updated });
  };

  const handleAddColumnOption = (colId: number) => {
    const updated = (newQuestion.columns || []).map(c => {
      if (c.id === colId && c.type === "button") {
        return { ...c, options: [...(c.options || []), ""] }; // ← MODIFIED: Add empty string
      }
      return c;
    });
    setNewQuestion({ ...newQuestion, columns: updated });
  };

  const handleColumnOptionChange = (colId: number, optIdx: number, value: string) => {
    const updated = (newQuestion.columns || []).map(c => {
      if (c.id === colId && c.type === "button") {
        const opts = [...(c.options || [])];
        opts[optIdx] = value;
        return { ...c, options: opts };
      }
      return c;
    });
    setNewQuestion({ ...newQuestion, columns: updated });
  };

  const handleDeleteColumnOption = (colId: number, optIdx: number) => {
    const updated = (newQuestion.columns || []).map(c => {
      if (c.id === colId && c.type === "button" && (c.options?.length || 0) > 1) {
        return { ...c, options: c.options?.filter((_, i) => i !== optIdx) || [] };
      }
      return c;
    });
    setNewQuestion({ ...newQuestion, columns: updated });
  };

  const handleDeleteColumn = (colId: number) => {
    // Remove column
    setNewQuestion(prev => ({
      ...prev,
      columns: prev.columns?.filter(c => c.id !== colId) || []
    }));
    // If editing and has rows, remove the cell from each row
    if (editingIndex !== null && newQuestion.type === "Table" && newQuestion.rows && newQuestion.rows.length > 0) {
      setNewQuestion(prev => ({
        ...prev,
        rows: prev.rows!.map(row => {
          const { [colId]: _, ...cells } = row.cells;
          return { ...row, cells };
        })
      }));
    }
  };

  // ────── Table row handlers ──────
  const handleAddRow = () => {
    const newRowId = Date.now();
    const newCells: Record<number, string> = {};
    (newQuestion.columns || []).forEach(col => {
      newCells[col.id] = "";
    });
    setNewQuestion({
      ...newQuestion,
      rows: [...(newQuestion.rows || []), { id: newRowId, cells: newCells }],
    });
  };

  const handleCellChange = (rowId: number, colId: number, value: string) => {
    setNewQuestion({
      ...newQuestion,
      rows: (newQuestion.rows || []).map(row =>
        row.id === rowId ? { ...row, cells: { ...row.cells, [colId]: value } } : row
      ),
    });
  };

  const handleDeleteRow = (rowId: number) => {
    setNewQuestion({
      ...newQuestion,
      rows: (newQuestion.rows || []).filter(row => row.id !== rowId),
    });
  };

  // ────── Add / Update question ──────
  // const handleAddOrUpdateQuestion = () => {
  //   if (["Dropdown", "Radio", "Checkbox"].includes(newQuestion.type) && (newQuestion.options?.length || 0) < 2) {
  //     showError(`${newQuestion.type} requires at least 2 options`);
  //     return;
  //   }
  //   if (newQuestion.type === "Table") {
  //     if ((newQuestion.columns?.length || 0) < 1) {
  //       showError("Table requires at least 1 column");
  //       return;
  //     }
  //     if ((newQuestion.rows?.length || 0) < 1) {
  //       showError("Table requires at least 1 row");
  //       return;
  //     }
  //   }
  //   const q = { ...newQuestion }; // ← FIXED: Removed sectionId addition
  //   if (editingIndex !== null) {
  //     // Update existing
  //     setQuestions(prev => prev.map((item, idx) => (idx === editingIndex ? q : item)));
  //     setEditingIndex(null);
  //   } else {
  //     // Add new
  //     setQuestions([...questions, q]);
  //   }
  //   // Reset for new
  //   setNewQuestion({
  //     question: "",
  //     type: "Dropdown",
  //     options: [{ option: "Option 1", weight: 0 }],
  //     columns: [],
  //     rows: [],
  //   });
  // };


const handleAddOrUpdateQuestion = () => {
  // Validate question text (except for Table type)
  if (newQuestion.type !== "Table" && (!newQuestion.question || newQuestion.question.trim() === "")) {
    showError("Question is required");
    return;
  }

  // Check for duplicate question text ONLY when type is the same (case-insensitive)
  const trimmedQuestion = newQuestion.question?.trim() || "";
  if (newQuestion.type !== "Table" && trimmedQuestion) {
    const isDuplicate = questions.some((q, index) => 
      index !== editingIndex && // Skip current question when editing
      q.question?.trim().toLowerCase() === trimmedQuestion.toLowerCase() &&
      q.type === newQuestion.type // ← ADDED: Only check duplicates when type is same
    );

    if (isDuplicate) {
      showError(`Question "${trimmedQuestion}" with type "${newQuestion.type}" already exists. Please use a different question text or type.`);
      return;
    }
  }

  if (["Dropdown", "Radio", "Checkbox"].includes(newQuestion.type)) {
    const optLength = (newQuestion.options?.length || 0);
    if (optLength < 2) {
      showError(`${newQuestion.type} requires at least 2 options`);
      return;
    }
    if (newQuestion.options && newQuestion.options.some(opt => !opt.option || !opt.option.trim())) {
      showError("All options must have non-empty text");
      return;
    }
  }
  if (newQuestion.type === "Table") {
    if ((newQuestion.columns?.length || 0) < 1) {
      showError("Table requires at least 1 column");
      return;
    }
    if ((newQuestion.rows?.length || 0) < 1) {
      showError("Table requires at least 1 row");
      return;
    }
    if (newQuestion.columns && newQuestion.columns.some(col => !col.name || !col.name.trim())) {
      showError("All columns must have non-empty names");
      return;
    }
    const hasInvalidButtons = newQuestion.columns && newQuestion.columns.some(col => 
      col.type === "button" && 
      (!col.options || col.options.filter(opt => opt && opt.trim()).length === 0)
    );
    if (hasInvalidButtons) {
      showError("Each button column must have at least one non-empty button text");
      return;
    }
  }
  
  const q = { ...newQuestion };
  if (editingIndex !== null) {
    // Update existing
    setQuestions(prev => prev.map((item, idx) => (idx === editingIndex ? q : item)));
    setEditingIndex(null);
    showSuccess("Question updated successfully");
  } else {
    // Add new
    setQuestions([...questions, q]);
    showSuccess("Question added successfully");
  }
  
  // Reset for new
  setNewQuestion({
    question: "",
    type: "Dropdown",
    options: [],
    columns: [],
    rows: [],
    comments: false,
  });
};
  // ← MODIFIED: Delete with confirmation
  const handleDeleteQuestion = (idx: number) => {
    setQuestionToDelete(idx);
    setDeleteConfirmOpen(true);
  };
  const confirmDeleteQuestion = () => {
    if (questionToDelete !== null) {
      setQuestions(questions.filter((_, i) => i !== questionToDelete));
      setQuestionToDelete(null);
      showSuccess("Question deleted successfully");
    }
    setDeleteConfirmOpen(false);
  };
  const cancelDelete = () => {
    setQuestionToDelete(null);
    setDeleteConfirmOpen(false);
  };
  const handleSaveAndBack = async () => {
    if (!questions.length) {
      showError("No questions to save");
      return;
    }

    if (!hasChanges) {
      onBack();
      return;
    }

    // Validate weightage ranges before saving
    if (showWeightage && sectionId === null && !validateWeightageRanges()) {
      return; // Validation failed → toasters already shown
    }

    setSaving(true);
    try {
      // Simulate tiny delay for better UX (optional)
      await new Promise(resolve => setTimeout(resolve, 300));
      if (sectionId === null && showWeightage && onSave) {
        onSave({ questions, weightageRanges });
      } else if (onSave) {
        onSave(questions);
      }
      setOriginalQuestions([...questions]);
      if (sectionId === null && showWeightage) {
        setOriginalWeightageRanges(JSON.parse(JSON.stringify(weightageRanges)));
      }
      onBack();
    } catch (err) {
      showError("Failed to save questions");
    } finally {
      setSaving(false);
    }
  };
  // ==============================================================

  const startEditing = (index: number) => {
    const q = questions[index];
    setEditingIndex(index);
    setNewQuestion({ ...q, comments: q.comments ?? false }); // ← NEW: Ensure comments is boolean
  };

  const isOptionType = ["Dropdown", "Radio", "Checkbox"].includes(newQuestion.type);
  const isTableType = newQuestion.type === "Table";
  const isDateType = newQuestion.type === "Date";
  const isTextareaType = newQuestion.type === "Textarea"; // ← NEW: For conditional rendering
  const isEditing = editingIndex !== null;

  const renderTablePreview = (cols?: Column[], rows?: Row[]) => {
    if (!cols || cols.length === 0) {
      return <span className="text-gray-500 italic">No columns defined</span>;
    }
    return (
      <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden text-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {cols.map((col) => (
                <th key={col.id} className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  {col.name || "Untitled"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows && rows.length > 0 ? (
              rows.slice(0, 4).map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {cols.map((col) => (
                    <td key={col.id} className="px-4 py-3">
                      {col.type === "button" ? (
                        <div className="flex gap-1 flex-wrap">
                          {(col.options || []).filter(opt => opt.trim()).map((opt, idx) => (
                            <button key={idx} disabled className="px-2 py-1 bg-blue-600 text-white rounded text-xs opacity-80 whitespace-nowrap">
                              {opt}
                            </button>
                          )) || <span className="text-gray-400">No buttons</span>}
                        </div>
                      ) : col.type === "Text" || col.type === "label" ? (
                        <input
                          type="text"
                          value={row.cells[col.id] || ""}
                          disabled
                          placeholder="Enter text"
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-xs cursor-not-allowed"
                        />
                      ) : col.type === "date" ? (
                        <input
                          type="date"
                          value={row.cells[col.id] || ""}
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-xs cursor-not-allowed"
                        />
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={cols.length} className="px-4 py-8 text-center text-gray-500">
                  No rows added yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {rows && rows.length > 0 && (
          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 border-t">
            {rows.length} row{rows.length > 1 ? "s" : ""} {rows.length > 4 && "(showing first 4)"}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-gray-50">
      <div className="flex justify-between items-center gap-4 mb-6 bg-white shadow-md p-3 rounded-2xl">
        <h2 className="text-[20px] font-semibold text-gray-800 pl-2">
          Add Questions : {sectionName}
        </h2>
        <button onClick={onBack} className="self-start px-3 py-2 flex items-center hover:bg-gray-100 rounded-[5px] gap-2">
          <ChevronLeft size={18} /> Back to Sections
        </button>
      </div>
      
      <div className="flex w-full gap-8 max-w-7xl mx-auto h-screen">
        {/* LEFT: Form */}
        <div className="bg-white p-4 rounded-2xl shadow-md w-full max-w-md flex-shrink-0
        sticky top-4 h-fit">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            {isEditing ? "Edit Question" : "Add New Question"}
          </h2>
          <div className="space-y-4 mb-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type <span className="text-red-500">*</span></label>
              <select
                value={newQuestion.type}
                onChange={e => {
                  const t = e.target.value;
                  setNewQuestion({
                    ...newQuestion,
                    type: t,
                    options: ["Text", "Textarea", "Date"].includes(t) ? undefined : [], // ← MODIFIED: Set empty options for option types
                    columns: t === "Table" ? [] : undefined,
                    rows: t === "Table" ? [] : undefined,
                    comments: t === "Textarea" ? (newQuestion.comments ?? false) : undefined, // ← NEW: Preserve or reset comments
                  });
                }}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-200 outline-none"
              >
                {questionTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            {!isTableType && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Text <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="Enter question (optional for table)"
                  value={newQuestion.question}
                  onChange={e => setNewQuestion({ ...newQuestion, question: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>
            )}
            {/* ← NEW: Comments Checkbox for Textarea */}
            {isTextareaType && (
              <div className="mt-3 flex items-center">
                <input
                  type="checkbox"
                  id="comments-enabled"
                  checked={newQuestion.comments || false}
                  onChange={e => setNewQuestion({ ...newQuestion, comments: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="comments-enabled" className="ml-2 block text-sm text-gray-700">
                  Enable Comments
                </label>
              </div>
            )}
            {/* Options for Dropdown/Radio/Checkbox */}
            {isOptionType && (
              <div className="border-t border-[#ddd] mt-6 pt-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Options <span className="text-red-500">*</span></label>
                </div>
                {(newQuestion.options || []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={opt.option}
                      onChange={e => handleOptionChange(i, "option", e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg p-2 text-sm"
                      placeholder="Enter option" // ← Changed to generic placeholder
                    />
                    {showWeightage && (
                      <input
                        type="number"
                        min={0}
                        value={opt.weight}
                        onChange={e => handleOptionChange(i, "weight", e.target.value)}
                        className="w-20 border border-gray-300 rounded-lg p-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="Weight"
                      />
                    )}
                    <button onClick={() => handleDeleteOption(i)} className="text-red-500 p-1 cursor-pointer rounded-[5px] hover:bg-red-100 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {(newQuestion.options || []).length === 0 && (
                  <p className="text-sm text-gray-500 italic mb-3">No options added yet. Add at least 2 non-empty options.</p>
                )}
                <button onClick={handleAddOption} className="text-green-600 cursor-pointer hover:text-green-800 border border-dashed border-green-600 px-2 py-1 rounded-[5px] text-sm flex items-center gap-1">
                  <Plus size={14} /> Add Option
                </button>
              </div>
            )}
            {/* Table Configuration */}
            {isTableType && (
              <>
                {/* Columns */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Table Columns</label>
                  {(newQuestion.columns || []).map(col => (
                    <div key={col.id} className="border border-gray-200 rounded-lg p-4 mb-4 bg-gray-50">
                      <input
                        type="text"
                        placeholder="Column Name" // ← Placeholder for empty name
                        value={col.name}
                        onChange={e => handleColumnNameChange(col.id, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 mb-3 text-sm"
                      />
                      <select
                        value={col.type}
                        onChange={e => handleColumnTypeChange(col.id, e.target.value as any)}
                        className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-3"
                      >
                        <option value="label">Label</option>
                        <option value="Text">Text</option>
                        <option value="button">Button</option>
                        <option value="date">Date</option>
                      </select>
                      {col.type === "button" && (
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Button Texts (Multiple buttons will appear side-by-side)</label>
                          {(col.options || []).map((opt, oi) => (
                            <div key={oi} className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={opt}
                                onChange={e => handleColumnOptionChange(col.id, oi, e.target.value)}
                                className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                                placeholder={`Button ${oi + 1}`}
                              />
                              {col.options!.length > 1 && (
                                <button onClick={() => handleDeleteColumnOption(col.id, oi)} className="text-red-500">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                          {(col.options || []).length === 0 && (
                            <p className="text-xs text-gray-500 italic mb-2">No button texts added yet.</p>
                          )}
                          <button onClick={() => handleAddColumnOption(col.id)} className="text-xs text-blue-600">
                            + Add Button Text
                          </button>
                        </div>
                      )}
                      <button
                        onClick={() => handleDeleteColumn(col.id)}
                        className="mt-3 text-red-600 hover:text-red-800 text-sm"
                      >
                        <Trash2 size={16} className="inline mr-1" /> Remove Column
                      </button>
                    </div>
                  ))}
                  {(newQuestion.columns || []).length === 0 && (
                    <p className="text-sm text-gray-500 italic mb-3">No columns added yet. Add at least 1 column with a non-empty name.</p>
                  )}
                  <button
                    onClick={handleAddColumn}
                    className="w-full py-3 border-2 border-dashed border-gray-400 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                  >
                    + Add Column
                  </button>
                </div>
                {/* Rows */}
                <div className="mt-8">
                  <label className="block text-sm font-medium text-gray-700 mb-4">Table Rows</label>
                  <div className="border border-gray-300 rounded-xl overflow-hidden">
                    {newQuestion.columns && newQuestion.columns.length > 0 && (
                      <div className="bg-gray-100 px-6 py-4 border-b">
                        <div
                          className="grid gap-4 text-xs font-bold text-gray-700 uppercase tracking-wider"
                          style={{ gridTemplateColumns: `repeat(${newQuestion.columns.length}, 1fr) 80px` }}
                        >
                          {newQuestion.columns.map(col => (
                            <div key={col.id} className="truncate" title={col.name}>
                              {col.name || "Column"}
                            </div>
                          ))}
                          <div>Action</div>
                        </div>
                      </div>
                    )}
                    <div className="divide-y divide-gray-200">
                      {(newQuestion.rows || []).length === 0 ? (
                        <div className="text-center py-16 text-gray-500">No rows added yet</div>
                      ) : (
                        newQuestion.rows!.map(row => (
                          <div key={row.id} className="px-6 py-5 hover:bg-gray-50">
                            <div
                              className="grid gap-4 items-center"
                              style={{ gridTemplateColumns: `repeat(${newQuestion.columns!.length}, 1fr) 80px` }}
                            >
                              {newQuestion.columns!.map(col => (
                                <div key={col.id}>
                                  {col.type === "Text" || col.type === "label" ? (
                                    <input
                                      type="text"
                                      placeholder={col.name}
                                      value={row.cells[col.id] || ""}
                                      onChange={e => handleCellChange(row.id, col.id, e.target.value)}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  ) : col.type === "button" ? (
                                    <div className="flex gap-1 flex-wrap">
                                      {(col.options || []).filter(opt => opt.trim()).map((opt, idx) => (
                                        <button key={idx} disabled className="px-2 py-2 bg-blue-600 text-white rounded text-xs opacity-80 whitespace-nowrap">
                                          {opt}
                                        </button>
                                      )) || <span className="text-gray-400">No buttons</span>}
                                    </div>
                                  ) : col.type === "date" ? (
                                    <input
                                      type="date"
                                      value={row.cells[col.id] || ""}
                                      onChange={e => handleCellChange(row.id, col.id, e.target.value)}
                                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                  ) : null}
                                </div>
                              ))}
                              <div className="flex justify-center">
                                <button onClick={() => handleDeleteRow(row.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  <button onClick={handleAddRow}
                    className="mt-6 w-full py-4 border-2 border-dashed border-gray-400 rounded-2xl text-gray-700 hover:bg-gray-50 font-medium flex items-center justify-center gap-2"
                  >
                    <Plus size={22} /> Add New Row
                  </button>
                </div>
              </>
            )}
            {isDateType && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <input type="date" disabled className="w-full p-3 border rounded bg-white" />
                <p className="text-xs text-gray-500 mt-2">Users will see a date picker</p>
              </div>
            )}
            <button
              onClick={handleAddOrUpdateQuestion}
              className="w-full bg-[#3b82f6] text-white py-3 cursor-pointer rounded-lg hover:bg-blue-700 transition font-medium mt-3"
            >
              {isEditing ? "Update Question" : "Add Question"}
            </button>
          </div>

          {sectionId === null && showWeightage && (
            <div className="">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Weightage Ranges</h3>
              <table className="w-full text-left mb-4">
                <thead>
                  <tr className="bg-[#dfedff] capitalize text-[14px] font-medium">
                    <th className="p-3 rounded-tl-[8px] rounded-bl-[8px]">#</th>
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
                          placeholder="e.g., 50"
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
              <div className="w-full flex justify-end">
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
        {/* RIGHT: Preview */}
        <div className="flex-1 bg-white p-4 rounded-2xl shadow-md overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-400  [-webkit-overflow-scrolling:touch]">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-between">
            <span>Preview</span>
            <span className="bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium">{questions.length} questions</span>
          </h3>
          {questions.length === 0 ? (
            <p className="text-center text-gray-500 py-12">Add questions to see preview</p>
          ) : (
            <div className="space-y-6">
              {questions.map((q, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow transition">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800">{q.question || "(No question text)"}</h4>
                      <p className="text-[13px] inline-block w-auto text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 leading-[20px] rounded-full">{q.type}</p>
                    </div>
                    <div className="flex gap-1">
                      <button title="Edit" onClick={() => startEditing(i)} className="text-blue-600 flex justify-center items-center cursor-pointer hover:bg-blue-50 w-8 h-8 px-1 py-1 rounded">
                        <SquarePen strokeWidth={1.75} size={16} />
                      </button>
                      <button title="Remove" onClick={() => handleDeleteQuestion(i)} className="text-red-600 flex justify-center items-center cursor-pointer hover:bg-red-50 w-8 h-8 px-1 py-1  rounded">
                        <Trash2 strokeWidth={1.75} size={16} />
                      </button>
                    </div>
                  </div>
                  {q.type === "Table" && renderTablePreview(q.columns, q.rows)}
                  {["Dropdown", "Radio", "Checkbox"].includes(q.type) && (
                    <div className="text-sm text-gray-600">
                      Options: {q.options?.map(o => o.option).join(", ") || "None"}
                    </div>
                  )}
                  {/* ← NEW: Show comments status for Textarea */}
                  {q.type === "Textarea" && (
                    <div className="text-sm text-gray-600">
                      Comments: {q.comments ? "Enabled" : "Disabled"}
                    </div>
                  )}
                </div>
              ))}
              <div className="w-full flex justify-end ">
                <button
                  onClick={handleSaveAndBack}
                  disabled={saving || !questions.length || !hasChanges} // ← UPDATED: Disable if no changes
                  className={`w-auto py-2 px-3 rounded-lg font-medium text-md transition flex items-center justify-center gap-3 ${
                    saving || !questions.length || !hasChanges
                      ? "bg-gray-500 text-white cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {saving ? (
                    <>
                      <RingGradientLoader />
                      Saving Questions...
                    </>
                  ) : hasChanges ? (
                    "Save All Questions & Go Back"
                  ) : (
                    "No Changes to Save"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* ← ADDED: Delete Confirmation Modal */}
      <DeleteConfirm
        open={deleteConfirmOpen}
        onClose={cancelDelete}
        onConfirm={confirmDeleteQuestion}
        itemName={`Question ${questionToDelete !== null ? questionToDelete + 1 : ""}`}
      />
    </div>
  );
};

export default AddQuestions;