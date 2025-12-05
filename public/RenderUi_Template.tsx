// src/components/RenderUiTemplate.tsx
import React, { useEffect, useMemo, useState } from "react";
import DecodedTokenValues from "../src/components/DecryptToken";

interface RenderTemplateProps {
  formSchema: any;
  buttonMode?: 1 | 2 | 3; // flag to show buttons SAVE/SUBMIT/NONE
  onWeightageChange?: (
    total: number,
    updatedJson: any,
    action?: "change" | "submit",
    riskLabel?: string,
  ) => void;
  onSubmit?: (updatedJson: any) => void;
  onChange?: (updatedJson: any, riskLabel: string) => void;
  template_weightage_format?: true | false
  can_edit?: boolean
  showAddComment?: boolean;
  disableEditComment?: boolean;
  allFieldsEnabledOrDisabled?: boolean;
  commentsEnabled?: 1 | 2 | 3;
}


type AnswerVal =
  | { option?: string; weight?: number; value?: any }
  | Array<{ option?: string; weight?: number }>
  | any;

const deepClone = (o: any) => JSON.parse(JSON.stringify(o || {}));

const makeKey = (field: any, ctx: string) => {
  const id =
    field?.question_id ??
    field?.key ??
    (field?.no !== undefined ? `row${field.no}` : undefined) ??
    field?.name ??
    field?.label ??
    field?.text ??
    field?.title ??
    field?.title ??
    "field";
  return `${ctx}::${String(id)}`;
};

const RenderUiTemplate: React.FC<RenderTemplateProps> = ({
  formSchema,
  buttonMode = 3,   // default is Save mode
  onWeightageChange,
  onSubmit,
  onChange,
  template_weightage_format = false,
  can_edit = true,
  showAddComment = true,
  disableEditComment = true,
  allFieldsEnabledOrDisabled = true,
  commentsEnabled = 3       // CommentsEnabled=(1 → Hide comments, 2 → Disable comments, 3 → Enable comments)
}) => {
  const [answers, setAnswers] = useState<Record<string, AnswerVal>>({});
  const [total, setTotal] = useState<number>(0);
  const [calculatedlable, setCalculatedlable] = useState<string>('Low')
  const templateRoot = useMemo(() => formSchema?.template ?? formSchema ?? {}, [formSchema]);

  // UI state for per-field comment controls
  const [commentUI, setCommentUI] = useState<Record<string, { showNewBox: boolean; newText: string }>>({});
  const [loggedInUser, setLoggedInUser] = useState<any>(null);

  useEffect(() => {
    setLoggedInUser(DecodedTokenValues());
  }, []);


  const isWeightageType = useMemo(() => {
    const t = templateRoot;
    if (!t) return false;
    if (typeof t.type === "string" && /weight/i.test(t.type)) return true;
    const rows = t.rows ?? t.sections?.flatMap((s: any) => s.rows ?? []) ?? [];
    if (Array.isArray(rows) && rows.length) {
      return rows.some((r: any) => Array.isArray(r.options) && r.options.some((o: any) => o?.weight !== undefined));
    }
    if (Array.isArray(t.questions)) {
      return t.questions.some((q: any) => Array.isArray(q.options) && q.options.some((o: any) => o?.weight !== undefined));
    }
    return false;
  }, [templateRoot]);

  const [currentUser, setCurrentUser] = useState<any>(null);
  // Add this function OUTSIDE renderField, inside the component
  const isSignAllowed = (row: any): boolean => {
    if (!loggedInUser) {
      console.log("No loggedInUser yet");
      return false;
    }

    const userName = loggedInUser.user_name?.trim();
    const userRole = loggedInUser.user_role_name?.trim();

    const rowName = row.name___title_?.trim();
    const rowRole = row._role?.trim();

    const allowed = userName === rowName && userRole === rowRole;

    console.log("Sign Check:", { userName, userRole, rowName, rowRole, allowed });

    return allowed;
  };
  useEffect(() => {
    const user = localStorage.getItem("currentUser");

    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
      } catch (e) {
        console.error("Invalid currentUser JSON", e);
      }
    }

  }, []);

  const getInitials = (name: string = "") =>
    name.split(" ").map(n => n[0]).join("").toUpperCase();

  // Replace the entire useEffect with this improved version:

  useEffect(() => {
    if (!formSchema) {
      setAnswers({});
      setTotal(0);
      return;
    }

    const initial: Record<string, AnswerVal> = {};
    const t = templateRoot;

    const processRowLike = (row: any, ctx: string) => {
      const key = makeKey(row, ctx);

      // Handle fields with options (radio, dropdown, checkbox)
      if (Array.isArray(row.options)) {
        const sel = row.options.filter((o: any) => o?.selected === true);
        if (sel.length === 1) initial[key] = { option: sel[0].option, weight: sel[0].weight ?? 0 };
        else if (sel.length > 1) initial[key] = sel.map((s: any) => ({ option: s.option, weight: s.weight ?? 0 }));
        else if (row.selected) initial[key] = row.selected;
      }
      // Handle fields with selected_answer/selected_weight
      else if (row.selected_answer !== undefined || row.selected_weight !== undefined) {
        initial[key] = { option: row.selected_answer, weight: row.selected_weight ?? 0 };
      }
      // Handle textarea with comments
      else if (row.type === "textarea" && row.comments) {
        initial[key] = {
          value: row.selected?.value ?? row.value ?? "",
          comments: (row.selected?.comments ?? []).map((comment: any) => ({
            ...comment,
            isNew: false // Mark existing comments as not new
          }))
        };
      }
      // Handle any field with selected data that includes comments
      else if (row.selected && row.selected.comments !== undefined) {
        initial[key] = {
          value: row.selected.value ?? "",
          comments: (row.selected.comments ?? []).map((comment: any) => ({
            ...comment,
            isNew: false // Mark existing comments as not new
          }))
        };
      }
      // Handle simple value fields
      else if (row.value !== undefined) {
        initial[key] = { value: row.value };
      }
      // Handle selected object without comments
      else if (row.selected && row.selected.value !== undefined) {
        initial[key] = row.selected;
      }
      // Fallback
      else {
        initial[key] = { value: row.value ?? "" };
      }
    };

    const traverse = (obj: any, ctx = "root") => {
      if (!obj) return;
      if (Array.isArray(obj)) return obj.forEach((it, idx) => traverse(it, `${ctx}[${idx}]`));

      // Process rows
      if (Array.isArray(obj.rows)) obj.rows.forEach((row: any, idx: number) => processRowLike(row, `${ctx}.rows[${idx}]`));

      // Process questions
      if (Array.isArray(obj.questions)) obj.questions.forEach((q: any, idx: number) => {
        const key = makeKey(q, `${ctx}.questions[${idx}]`);

        // Handle questions with selected data
        if (q?.selected) {
          if (q.type === "textarea" && q.comments) {
            initial[key] = {
              value: q.selected.value ?? "",
              comments: (q.selected.comments ?? []).map((comment: any) => ({
                ...comment,
                isNew: false // Mark existing comments as not new
              }))
            };
          } else {
            initial[key] = q.selected;
          }
        }
        // Handle questions with options
        else if (Array.isArray(q.options)) {
          const sel = q.options.filter((o: any) => o?.selected === true);
          if (sel.length === 1) initial[key] = { option: sel[0].option, weight: sel[0].weight ?? 0 };
          else if (sel.length > 1) initial[key] = sel.map((s: any) => ({ option: s.option, weight: s.weight ?? 0 }));
        }
        // Process nested structure
        traverse(q, `${ctx}.questions[${idx}]`);
      });

      // Process fields
      if (Array.isArray(obj.fields)) obj.fields.forEach((f: any, idx: number) => {
        const key = makeKey(f, `${ctx}.fields[${idx}]`);
        const answer = answers[key];
        if (Array.isArray(f.options)) {
          f.options.forEach((o: any) => delete o.selected);
          if (Array.isArray(answer)) {
            const chosen = new Set(answer.map((a: any) => a.option));
            f.options.forEach((o: any) => { if (chosen.has(o.option)) o.selected = true; });
          } else if (answer && typeof answer === "object") {
            f.options.forEach((o: any) => { if (o.option === answer.option) o.selected = true; });
          }
        } else if (answer && (answer as any).value !== undefined) {
          f.value = (answer as any).value;
        }
        traverse(f, `${ctx}.fields[${idx}]`);
      });

      // Process sections
      if (Array.isArray(obj.sections)) obj.sections.forEach((s: any, idx: number) => traverse(s, `${ctx}.sections[${idx}]`));

      // Process tables
      if (obj.table && Array.isArray(obj.table.rows)) {
        const tbKey = makeKey({ title: obj.title ?? obj.name ?? "table" }, `${ctx}.table`);
        if (!(tbKey in initial)) initial[tbKey] = deepClone(obj.table.rows);
        traverse(obj.table, `${ctx}.table`);
      }
    };

    traverse(t, "root");

    // Apply selectedValues from formSchema if they exist
    if (formSchema.selectedValues && typeof formSchema.selectedValues === "object") {
      Object.entries(formSchema.selectedValues).forEach(([k, v]) => {
        // Try to find matching key or use the key directly
        const match = Object.keys(initial).find((ik) => ik.endsWith(k) || ik.includes(k));
        if (match) {
          // If the value has comments, mark them as not new
          if (v && typeof v === 'object' && Array.isArray(v.comments)) {
            initial[match] = {
              ...v,
              comments: v.comments.map((comment: any) => ({
                ...comment,
                isNew: false // Mark existing comments as not new
              }))
            };
          } else {
            initial[match] = v as AnswerVal;
          }
        } else {
          // If no match found, create a key based on the field name
          const newKey = `root::${k}`;
          initial[newKey] = v as AnswerVal;
        }
      });
    }

    setAnswers(initial);
  }, [formSchema, templateRoot]);


  // Auto-fill `_role → name___title_` - Update answers state for table rows
  useEffect(() => {
    console.log("🔍 Auto-fill useEffect triggered");
    console.log("templateRoot:", templateRoot);
    console.log("formSchema?.assignedUsers:", formSchema?.assignedUsers);

    if (!templateRoot || !formSchema?.assignedUsers || !Array.isArray(formSchema.assignedUsers)) {
      console.log("❌ Early return - missing data");
      return;
    }

    const updateAnswersWithUsers = () => {
      setAnswers((prevAnswers) => {
        console.log("📊 Current prevAnswers:", prevAnswers);
        const updatedAnswers = { ...prevAnswers };
        let hasChanges = false;

        // Helper to find and update table rows in answers
        const processTableInAnswers = (tableKey: string, rows: any[]) => {
          console.log(`🔧 Processing table with key: ${tableKey}`);
          console.log(`📋 Rows:`, rows);

          if (!Array.isArray(rows)) return;

          const updatedRows = rows.map((row: any) => {
            // console.log(`  Row role: "${row._role}", name: "${row.name___title_}"`);

            if (row._role && row._role.trim() !== "") {
              // Find ALL users matching this role (not just the first one)
              const matchedUsers = formSchema.assignedUsers.filter(
                (u: any) =>
                  u.role_name?.trim().toLowerCase() ===
                  row._role?.trim().toLowerCase()
              );

              const selectedUser = matchedUsers.sort((a, b) => a.user_id - b.user_id)[0];

              if (selectedUser && row.name___title_ !== selectedUser.user_name) {
                hasChanges = true;
                return { ...row, name___title_: selectedUser.user_name };
              }


              console.log(`  Matched users for role "${row._role}":`, matchedUsers);

              if (matchedUsers.length > 0) {
                // Join all user names with commas
                const allUserNames = matchedUsers.map((u: any) => u.user_name).join(", ");

                if (row.name___title_ !== allUserNames) {
                  hasChanges = true;
                  console.log(`  ✅ Updating name___title_ to: ${allUserNames}`);
                  return { ...row, name___title_: allUserNames };
                }
              }
            }
            return row;
          });

          if (hasChanges) {
            console.log(`✨ Updating answers for table key: ${tableKey}`);
            updatedAnswers[tableKey] = updatedRows;
          }
        };

        // Traverse template to find all tables and update their corresponding answers
        const traverseTemplate = (obj: any, ctx = "root") => {
          if (!obj) return;
          if (Array.isArray(obj)) return obj.forEach((item, idx) => traverseTemplate(item, `${ctx}[${idx}]`));

          // Handle section with table
          if (obj.table && Array.isArray(obj.table.rows)) {
            const tableKey = makeKey({ title: obj.title ?? obj.name ?? "table" }, `${ctx}.table`);
            console.log(`📍 Found section table: ${obj.title}, key: ${tableKey}`);
            const currentRows = prevAnswers[tableKey] || obj.table.rows;
            processTableInAnswers(tableKey, currentRows);
          }

          // Handle direct table
          if (obj.rows && Array.isArray(obj.rows) && !obj.sections && !obj.questions) {
            const tableKey = makeKey({ title: obj.title ?? obj.name ?? "table" }, ctx);
            console.log(`📍 Found direct table: ${obj.title}, key: ${tableKey}`);
            const currentRows = prevAnswers[tableKey] || obj.rows;
            processTableInAnswers(tableKey, currentRows);
          }

          // Recurse through structure
          if (Array.isArray(obj.sections)) obj.sections.forEach((s: any, idx: number) => traverseTemplate(s, `${ctx}.sections[${idx}]`));
          if (Array.isArray(obj.questions)) obj.questions.forEach((q: any, idx: number) => traverseTemplate(q, `${ctx}.questions[${idx}]`));
          if (Array.isArray(obj.fields)) obj.fields.forEach((f: any, idx: number) => traverseTemplate(f, `${ctx}.fields[${idx}]`));
        };

        traverseTemplate(templateRoot, "root");

        console.log(`🎯 hasChanges: ${hasChanges}`);
        console.log(`📤 Returning updated answers:`, hasChanges ? updatedAnswers : prevAnswers);

        return hasChanges ? updatedAnswers : prevAnswers;
      });
    };

    updateAnswersWithUsers();
  }, [templateRoot, formSchema?.assignedUsers]);

  useEffect(() => {
    let ttl = 0;
    Object.values(answers).forEach((v) => {
      if (Array.isArray(v)) ttl += v.reduce((s, it) => s + Number(it?.weight ?? 0), 0);
      else if (v && typeof v === "object") ttl += Number((v as any).weight ?? 0);
    });
    setTotal(ttl);

    // --- RISK LABEL CALCULATION USING LOCAL VARIABLE ---
    let localLabel = "";
    if (Array.isArray(templateRoot.weightage_ranges)) {
      for (const r of templateRoot.weightage_ranges) {
        if (ttl >= Number(r.from) && ttl <= Number(r.to)) {
          localLabel = r.label;
          break;
        }
      }
    }

    // update state (optional, but async)
    setCalculatedlable(localLabel);
    // use IMMEDIATE value
    if (onWeightageChange && formSchema) {
      const updated = buildUpdatedJsonWithSelected(formSchema, answers);
      if (isWeightageType) {
        const root = updated.template ?? updated;
        root.totalWeightage = ttl;
      }
      onWeightageChange(ttl, updated, "change", localLabel);
    }


  }, [answers]);

  const handleText = (key: string, val: any) => setAnswers((p) => ({ ...p, [key]: { value: val } }));
  const handleSelect = (key: string, option: { option?: string; weight?: number }) =>
    setAnswers((p) => ({ ...p, [key]: { option: option.option, weight: option.weight ?? 0 } }));
  const handleToggleCheckbox = (key: string, option: { option?: string; weight?: number }) =>
    setAnswers((p) => {
      const cur = p[key] ?? [];
      const exists = Array.isArray(cur) && cur.find((x: any) => x.option === option.option);
      if (exists) return { ...p, [key]: (cur as any[]).filter((c) => c.option !== option.option) };
      else return { ...p, [key]: [...(Array.isArray(cur) ? cur : []), { option: option.option, weight: option.weight ?? 0 }] };
    });

  const buildUpdatedJsonWithSelected = (schema: any, answersMap: Record<string, AnswerVal>) => {
    const cloned = deepClone(schema);
    const t = cloned.template ?? cloned;

    const traverseAndApply = (obj: any, ctx = "root") => {
      if (!obj) return;
      if (Array.isArray(obj)) return obj.forEach((it, idx) => traverseAndApply(it, `${ctx}[${idx}]`));

      // rows -> options or value
      if (Array.isArray(obj.rows)) obj.rows.forEach((row: any, rIdx: number) => {
        const key = makeKey(row, `${ctx}.rows[${rIdx}]`);
        const answer = answersMap[key];
        if (Array.isArray(row.options)) {
          row.options.forEach((o: any) => delete o.selected);
          if (Array.isArray(answer)) {
            const chosen = new Set(answer.map((a: any) => a.option));
            row.options.forEach((o: any) => { if (chosen.has(o.option)) o.selected = true; });
          } else if (answer && typeof answer === "object") {
            row.options.forEach((o: any) => { if (o.option === answer.option) o.selected = true; });
          }
        } else if (answer && (answer as any).value !== undefined) {
          row.value = (answer as any).value;
        }
      });

      // questions
      if (Array.isArray(obj.questions)) obj.questions.forEach((q: any, idx: number) => {
        if (Array.isArray(q.options)) {
          const key = makeKey(q, `${ctx}.questions[${idx}]`);
          const answer = answersMap[key];
          q.options.forEach((o: any) => delete o.selected);
          if (Array.isArray(answer)) {
            const chosen = new Set(answer.map((a: any) => a.option));
            q.options.forEach((o: any) => { if (chosen.has(o.option)) o.selected = true; });
          } else if (answer && typeof answer === "object") {
            q.options.forEach((o: any) => { if (o.option === answer.option) o.selected = true; });
          }
        } else {
          const key = makeKey(q, `${ctx}.questions[${idx}]`);
          if (answersMap[key] !== undefined) q.selected = answersMap[key];
        }
        traverseAndApply(q, `${ctx}.questions[${idx}]`);
      });

      // fields
      if (Array.isArray(obj.fields)) obj.fields.forEach((f: any, idx: number) => {
        const key = makeKey(f, `${ctx}.fields[${idx}]`);
        const answer = answersMap[key];
        if (Array.isArray(f.options)) {
          f.options.forEach((o: any) => delete o.selected);
          if (Array.isArray(answer)) {
            const chosen = new Set(answer.map((a: any) => a.option));
            f.options.forEach((o: any) => { if (chosen.has(o.option)) o.selected = true; });
          } else if (answer && typeof answer === "object") {
            f.options.forEach((o: any) => { if (o.option === answer.option) o.selected = true; });
          }
        } else if (answer && (answer as any).value !== undefined) {
          f.value = (answer as any).value;
        }
        traverseAndApply(f, `${ctx}.fields[${idx}]`);
      });

      // sections
      if (Array.isArray(obj.sections)) obj.sections.forEach((s: any, idx: number) => traverseAndApply(s, `${ctx}.sections[${idx}]`));

      // table under section
      if (obj.table && Array.isArray(obj.table.rows)) {
        // apply table rows edits back to obj.table.rows if answersMap has that table key
        const tbKey = makeKey({ title: obj.title ?? obj.name ?? "table" }, `${ctx}.table`);
        if (answersMap[tbKey]) {
          obj.table.rows = deepClone(answersMap[tbKey]);
        } else {
          traverseAndApply(obj.table, `${ctx}.table`);
        }
      }

      // direct table object (generic_table / table)
      if (obj.rows && Array.isArray(obj.rows)) {
        const tableKey = makeKey({ title: obj.title ?? obj.name ?? "table" }, ctx);
        if (answersMap[tableKey] && Array.isArray(answersMap[tableKey])) {
          obj.rows = deepClone(answersMap[tableKey]);
        } else {
          // fallback: recurse into rows
          traverseAndApply(obj.rows, `${ctx}.rows`);
        }
      }
    };

    traverseAndApply(t, "root");

    const compact: Record<string, any> = {};
    Object.entries(answersMap).forEach(([k, v]) => {
      const tail = k.split("::").pop() ?? k;
      compact[tail] = v;
    });
    cloned.selectedValues = compact;

    return cloned;
  };

  const renderField = (field: any, ctx = "root") => {
    if (!field) return null;

    // SECTION TABLE: convert to generic_table early for consistent handling
    // if (field.table && Array.isArray(field.table.rows)) {
    //   return renderField(
    //     { type: "generic_table", rows: field.table.rows, columns: field.table.columns, title: field.title },
    //     `${ctx}.table`
    //   );
    // }


    // If section contains table + questions, render BOTH
    if (field.table && Array.isArray(field.table.rows)) {
      return (
        <div key={makeKey(field, ctx)} className="mb-6">
          {field.title && (
            <div className="bg-[#1d69bf] text-white font-semibold px-4 py-2 rounded-t-md">
              {field.title}
            </div>
          )}

          <div className="p-4 border border-gray-200 rounded-b-md space-y-4">
            {/* Render TABLE */}
            {renderField(
              { type: "generic_table", title: field.title ?? field.name ?? "table", rows: field.table.rows, columns: field.table.columns },
              `${ctx}.table`
            )}

            {/* Render QUESTIONS AFTER TABLE */}
            {Array.isArray(field.questions) &&
              field.questions.map((q: any, i: number) =>
                <div key={i}>{renderField(q, `${ctx}.questions[${i}]`)}</div>
              )}
          </div>
        </div>
      );
    }

    // group of fields
    if (field.group && Array.isArray(field.fields)) {
      return (
        <div key={makeKey(field, ctx)} className="flex gap-4 mt-2 flex-wrap">
          {field.fields.map((f: any, idx: number) => (
            <div key={idx} style={f.style || { width: f.style?.width || "auto" }}>
              {renderField(f, `${ctx}.group[${idx}]`)}
            </div>
          ))}
        </div>
      );
    }

    const key = makeKey(field, ctx);
    const t = (field.type || "").toString().toLowerCase();
    // const isFieldsDisabled = !allFieldsEnabledOrDisabled || !can_edit;
    // Replace the isFieldsDisabled calculation with this:
    const isFieldsDisabled = !can_edit || !allFieldsEnabledOrDisabled;
    // primitive inputs
    if (["text", "date", "number", "email"].includes(t)) {
      const curVal = (answers[key] as any)?.value ?? field?.selected?.value ?? field?.value ?? "";
      
      // Special handling for date field to restrict to 4-digit year
      const handleDateChange = (value: string) => {
        if (t === "date") {
          // For date type, validate the format
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (value === "" || dateRegex.test(value)) {
            const year = value.substring(0, 4);
            // Ensure year is exactly 4 digits
            if (year.length === 4 && /^\d{4}$/.test(year)) {
              handleText(key, value);
            }
          }
        } else {
          handleText(key, value);
        }
      };

      return (
        <div key={key} className="mt-3 w-full">
          {(field.label || field.text) && <label className="block text-sm font-medium mb-1">{field.label ?? field.text}</label>}
          <input
            type={t === "date" ? "date" : t === "number" ? "number" : "text"}
            placeholder={field.placeholder ?? ""}
            value={curVal}
            style={field.style || {}}
            disabled={isFieldsDisabled}
            className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-slate-500"
            onChange={(e) => handleDateChange(e.target.value)}
            // Add restrictions for date field
            {...(t === "date" && {
              min: "1900-01-01",
              max: "2100-12-31",
              pattern: "[0-9]{4}-[0-9]{2}-[0-9]{2}",
              title: "Please enter a date in YYYY-MM-DD format (4-digit year)",
              onInput: (e) => {
                // Additional client-side validation for 4-digit year
                const input = e.target as HTMLInputElement;
                const value = input.value;
                
                // Ensure year part is exactly 4 digits
                if (value.length >= 4) {
                  const yearPart = value.substring(0, 4);
                  if (!/^\d{4}$/.test(yearPart)) {
                    // Clear the input if year is not 4 digits
                    input.value = '';
                    handleText(key, '');
                  }
                }
              }
            })}
          />
        </div>
      );
    }

    if (t === "textarea" && field.comments) {
      // When comments are disabled (1), don't render comments section at all
      if (commentsEnabled === 1) {
        const fieldDataRaw = answers[key] || {};
        const value = fieldDataRaw.value ?? "";

        return (
          <div key={key} className="mt-3">
            {(field.label || field.text) && (
              <label className="block text-sm font-medium mb-1">
                {field.label ?? field.text}
              </label>
            )}
            <textarea
              placeholder={field.placeholder ?? ""}
              value={value}
              disabled={isFieldsDisabled}
              className="border border-gray-300 rounded-md p-2 w-full resize-y focus:ring-2 focus:ring-slate-500"
              onChange={(e) => {
                setAnswers((prev: any) => ({
                  ...prev,
                  [key]: { ...fieldDataRaw, value: e.target.value }
                }));
              }}
            />
            {/* Comments section completely removed when commentsEnabled === 1 */}
          </div>
        );
      }

      // Original comments handling for commentsEnabled === 2 or 3
      const fieldDataRaw = answers[key] || {};
      const fieldData = {
        value: fieldDataRaw.value ?? "",
        comments: Array.isArray(fieldDataRaw.comments) ? fieldDataRaw.comments : [],
      };

      const value = fieldData.value;
      const comments = fieldData.comments;

      const ui = commentUI[key] || { showNewBox: false, newText: "" };
      const setUI = (data: any) =>
        setCommentUI((prev: any) => ({ ...prev, [key]: { ...ui, ...data } }));

      const updateValue = (v: string) => {
        setAnswers((prev: any) => ({
          ...prev,
          [key]: { ...fieldData, value: v }
        }));
      };

      // Delete a comment (only allowed for new comments that haven't been saved)
      const deleteComment = (commentId: string) => {
        const newComments = comments.filter((c: any) => c.id !== commentId);
        setAnswers((prev: any) => ({
          ...prev,
          [key]: { ...fieldData, comments: newComments }
        }));
      };

      // Update an existing comment
      const updateComment = (id: string, text: string) => {
        const newComments = comments.map((c: any) =>
          c.id === id ? { ...c, text } : c
        );
        setAnswers((prev: any) => ({
          ...prev,
          [key]: { ...fieldData, comments: newComments }
        }));
      };

      // Save new comment
      const saveNewComment = () => {
        if (!ui.newText.trim()) {
          setUI({ showNewBox: false, newText: "" });
          return;
        }

        const newComment = {
          id: crypto.randomUUID(),
          text: ui.newText,
          user: loggedInUser?.user_name,
          timestamp: new Date().toISOString(),
          isNew: true // Flag to identify newly added comments that can be deleted
        };

        setAnswers((prev: any) => ({
          ...prev,
          [key]: { ...fieldData, comments: [...comments, newComment] }
        }));

        setUI({ showNewBox: false, newText: "" });
      };

      const effectiveShowAddComment = commentsEnabled === 3 && showAddComment;
      const effectiveDisableEditComment = commentsEnabled === 2 || disableEditComment;

      return (
        <div key={key} className="mt-3">
          {(field.label || field.text) && (
            <label className="block text-sm font-medium mb-1">
              {field.label ?? field.text}
            </label>
          )}

          <textarea
            placeholder={field.placeholder ?? ""}
            value={value}
            disabled={isFieldsDisabled}
            className="border border-gray-300 rounded-md p-2 w-full resize-y focus:ring-2 focus:ring-slate-500"
            onChange={(e) => updateValue(e.target.value)}
          />

          {/* Comments section - only show when commentsEnabled !== 1 */}
          {commentsEnabled !== 1 && (
            <div className="mt-3">
              {(comments.length > 0 || ui.showNewBox) && (
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Comments
                </label>
              )}

              {/* Existing comments */}
              {comments.map((c: any) => (
                <div key={c.id} className="relative mb-3 p-2 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500 mb-2">
                    {c.user} • {new Date(c.timestamp).toLocaleString()}
                  </div>
                  <input
                    className="border border-gray-300 rounded p-2 w-full bg-white"
                    value={c.text}
                    disabled={c.isNew ? false : effectiveDisableEditComment}
                    onChange={(e) => {
                      if (c.isNew || !effectiveDisableEditComment) {
                        updateComment(c.id, e.target.value);
                      }
                    }}
                  />
                  {/* Delete button - only shown for NEW comments when commentsEnabled === 3 */}
                  {/* Existing saved comments (isNew = false) don't get delete button */}
                  {c.isNew && commentsEnabled === 3 && (
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 bg-red-200 flex justify-center items-center rounded-[3px] w-5 h-5 transition-colors"
                      title="Delete comment"
                      onClick={() => deleteComment(c.id)}
                    >
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}

              {/* New comment input - only show when commentsEnabled === 3 */}
              {ui.showNewBox && commentsEnabled === 3 && (
                <div className="flex gap-2 mb-2 items-center">
                  <input
                    className="border border-gray-300 rounded p-2 flex-1"
                    placeholder="Write a comment..."
                    value={ui.newText}
                    autoFocus
                    onChange={(e) => setUI({ newText: e.target.value })}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        saveNewComment();
                      }
                    }}
                  />
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      onClick={saveNewComment}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                      onClick={() => setUI({ showNewBox: false, newText: "" })}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Add Comment button - only show when commentsEnabled === 3 */}
              {!ui.showNewBox && commentsEnabled === 3 && effectiveShowAddComment && (
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-[#1d69bf] text-white hover:bg-[#1557a8] transition-colors"
                  onClick={() => setUI({ showNewBox: true })}
                >
                  + Add Comment
                </button>
              )}
            </div>
          )}
        </div>
      );
    }
    if (t === "textarea") {
      const curVal = (answers[key] as any)?.value ?? field?.selected?.value ?? field?.value ?? "";
      return (
        <div key={key} className="mt-3">
          {(field.label || field.text) && <label className="block text-sm font-medium mb-1">{field.label ?? field.text}</label>}
          <textarea
            placeholder={field.placeholder ?? ""}
            value={curVal}
            style={field.style || {}}
            disabled={isFieldsDisabled}
            className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-slate-500 resize-y"
            onChange={(e) => handleText(key, e.target.value)}
          />
        </div>
      );
    }

    if (t === "dropdown" || t === "select") {
      const cur = (answers[key] as any)?.option ?? field?.selected?.option ?? field?.selected_answer ?? "";
      return (
        <div key={key} className="mt-3">
          {(field.label || field.text) && <label className="block text-sm font-medium mb-1">{field.label ?? field.text}</label>}
          <select
            disabled={isFieldsDisabled}
            value={cur}
            onChange={(e) => {
              const chosen = (field.options || []).find((o: any) => String(o.option) === e.target.value);
              if (chosen) handleSelect(key, { option: chosen.option, weight: chosen.weight ?? 0 });
              else handleText(key, e.target.value);
            }}
            className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-slate-500"
          >
            <option value="">{field.placeholder ?? "Select"}</option>
            {(field.options || []).map((o: any, i: number) => (
              <option key={i} value={o.option}>{o.option}{o.weight !== undefined ? ` (${o.weight})` : ""}</option>
            ))}
          </select>
          <div className="text-xs text-gray-600 mt-1">Selected weight: {(answers[key] as any)?.weight ?? field?.selected?.weight ?? field?.selected_weight ?? 0}</div>
        </div>
      );
    }

    if (t === "radio") {
      const cur = (answers[key] as any)?.option ?? field?.selected?.option ?? field?.selected_answer ?? "";
      return (
        <div key={key} className="mt-3">
          {(field.label || field.text) && <label className="block text-sm font-medium mb-2">{field.label ?? field.text}</label>}
          <div className="space-y-2">
            {(field.options || []).map((o: any, i: number) => {
              const checked = cur === o.option;
              return (
                <label key={i} className="flex items-center justify-between text-gray-700">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      disabled={isFieldsDisabled}
                      name={key}
                      checked={checked}
                      onChange={() => handleSelect(key, { option: o.option, weight: o.weight ?? 0 })}
                      className="mr-2 h-4 w-4"
                    />
                    <span className="text-sm">{o.option}</span>
                  </div>
                  <div className="text-xs text-gray-500">{o.weight ?? ""}</div>
                </label>
              );
            })}
          </div>
          <div className="text-xs text-gray-600 mt-1">Selected weight: {(answers[key] as any)?.weight ?? field?.selected?.weight ?? field?.selected_weight ?? 0}</div>
        </div>
      );
    }

    if (t === "checkbox" || t === "checkbox-group") {
      const curArr = Array.isArray(answers[key]) ? (answers[key] as any[]) : undefined;
      return (
        <div key={key} className="mt-3">
          {(field.label || field.text) && <label className="block text-sm font-medium mb-2">{field.label ?? field.text}</label>}
          <div className="space-y-2">
            {(field.options || []).map((o: any, i: number) => {
              const checked = Array.isArray(curArr) ? curArr.some((c) => c.option === o.option) : !!(o?.selected === true);
              return (
                <label key={i} className="flex items-center justify-between text-gray-700">
                  <div className="flex items-center gap-2">
                    <input
                      disabled={isFieldsDisabled}
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleCheckbox(key, { option: o.option, weight: o.weight ?? 0 })}
                      className="mr-2 h-4 w-4"
                    />
                    <span className="text-sm">{o.option}</span>
                  </div>
                  <div className="text-xs text-gray-500">{o.weight ?? ""}</div>
                </label>
              );
            })}
          </div>
          <div className="text-xs text-gray-600 mt-1">Selected weight: {Array.isArray(answers[key]) ? (answers[key] as any[]).reduce((s, a) => s + (a.weight ?? 0), 0) : (field?.selected?.weight ?? 0)}</div>
        </div>
      );
    }

    // Weightage table renderer (special case: root weightage_table)
    if (templateRoot?.type === "weightage_table" && Array.isArray(templateRoot.rows)) {
      const rows = templateRoot.rows;
      return (
        <div key={key} className="mt-6">
          <div className="bg-[#1d69bf] text-white font-semibold px-4 py-2 rounded-t-md">
            {templateRoot.template_name}
          </div>
          <div className="overflow-x-auto border border-gray-300 rounded-b-md">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">No.</th>
                  <th className="border px-3 py-2">Questions</th>
                  <th className="border px-3 py-2">No</th>
                  <th className="border px-3 py-2">Yes</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: any, ri: number) => {
                  const rowKey = makeKey(r, `${ctx}.rows[${ri}]`);
                  const cur = (answers[rowKey] as any)?.option ?? "";
                  return (
                    <tr key={ri} className="border-t">
                      <td className="border px-3 py-2">{r.no}</td>
                      <td className="border px-3 py-2">{r.question}</td>
                      <td className="border px-3 py-2 text-center">
                        <input
                          type="radio"
                          name={rowKey}
                          disabled={isFieldsDisabled}
                          checked={cur === "No"}
                          onChange={() => handleSelect(rowKey, { option: "No", weight: r.options[0]?.weight ?? 0 })}
                        />
                      </td>
                      <td className="border px-3 py-2 text-center">
                        <input
                          type="radio"
                          name={rowKey}
                          disabled={isFieldsDisabled}
                          checked={cur === "Yes"}
                          onChange={() => handleSelect(rowKey, { option: "Yes", weight: r.options[1]?.weight ?? 0 })}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Generic table renderer (handles type === "table" or "generic_table" or section.table converted earlier)
    if (t === "table" || t === "generic_table" || Array.isArray(field.rows)) {
      const tableRows = field.rows ?? [];
      // allow columns to be provided, else infer from first row keys
      const columns = field.columns ?? (tableRows[0] ? Object.keys(tableRows[0]).map((k: string) => ({ key: k, header: k })) : []);

      // table-level answers key so edits persist and get applied back into JSON on submit
      const tableKey = makeKey({ title: field.title ?? field.name ?? "table" }, ctx);
      // ensure answers has a copy of current rows if not already present
      if (!answers[tableKey]) {
        // seed the table rows into answers to allow editing; do not mutate original tableRows array object
        setAnswers((prev) => ({ ...prev, [tableKey]: deepClone(tableRows) }));
      }

      const handleCellChange = (rowIndex: number, colKey: string, value: any) => {
        setAnswers((prev) => {
          const current = Array.isArray(prev[tableKey]) ? deepClone(prev[tableKey]) : deepClone(tableRows);
          current[rowIndex] = { ...current[rowIndex], [colKey]: value };
          return { ...prev, [tableKey]: current };
        });
      };

      // get current rows view from answers (fallback to tableRows)
      const currentRows = Array.isArray(answers[tableKey]) ? (answers[tableKey] as any[]) : tableRows;

      return (
        <div key={key} className="mt-6">
          {field.name || field.title ? (
            <div className="bg-[#1d69bf] text-white font-semibold px-4 py-2 rounded-t-md" style={field.style || {}}>
              {field.name ?? field.title}
            </div>
          ) : null}

          <div className="overflow-x-auto border border-gray-300 rounded-b-md">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  {columns.map((c: any, ci: number) => (
                    <th key={ci} className="border px-3 py-2 text-left font-semibold text-gray-700">{c.header ?? c.title ?? c.key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row: any, ri: number) => (
                  <tr key={ri} className="border-t">
                    {columns.map((col: any, ci: number) => (
                      <td key={ci} className="border px-3 py-2 text-left">
                        {col.type === "button" ? (
                          <button
                            type="button"
                            className={`px-4 py-2 text-xs font-medium rounded transition-all ${isSignAllowed(row)
                              ? "bg-[#1d69bf] text-white hover:bg-[#1557a8] shadow-sm"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                              }`}
                            disabled={!isSignAllowed(row)}
                            onClick={() => {
                              if (!isSignAllowed(row)) return;

                              const initials = getInitials(loggedInUser?.user_name || "");
                              const timestamp = new Date().toLocaleString();
                              const signValue = `${initials} • ${timestamp}`;
                              handleCellChange(ri, col.key, signValue);
                            }}
                          >
                            {col.label || "Sign"}
                          </button>
                        ) : col.type === "date" ? (
                          // Date cell with 4-digit year restriction
                          <input
                            type="date"
                            value={row[col.key] ?? ""}
                            disabled={isFieldsDisabled}
                            onChange={(e) => handleCellChange(ri, col.key, e.target.value)}
                            className="border border-gray-300 rounded p-1 w-full text-sm"
                            min="1900-01-01"
                            max="2100-12-31"
                            pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                            title="Please enter a date in YYYY-MM-DD format (4-digit year)"
                            onInput={(e) => {
                              // Additional validation for table date cells
                              const input = e.target as HTMLInputElement;
                              const value = input.value;
                              
                              if (value.length >= 4) {
                                const yearPart = value.substring(0, 4);
                                if (!/^\d{4}$/.test(yearPart)) {
                                  input.value = '';
                                  handleCellChange(ri, col.key, '');
                                }
                              }
                            }}
                          />
                        ) : (
                          <input
                            type={col.type === "number" ? "number" : "text"}
                            value={row[col.key] ?? ""}
                            disabled={isFieldsDisabled}
                            onChange={(e) => handleCellChange(ri, col.key, e.target.value)}
                            className="border border-gray-300 rounded p-1 w-full text-sm"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Section-like fallback (render nested things)
    if (field.sections || field.questions || field.fields || field.rows) {
      return (
        <div key={key} className="mb-6">
          {(field.title || field.name) && (
            <div className="bg-[#1d69bf] text-white font-semibold px-4 py-2 rounded-t-md" style={field.style || {}}>
              {field.title ?? field.name}
            </div>
          )}
          <div className="p-4 border border-gray-200 rounded-b-md space-y-4">
            {Array.isArray(field.fields) ? field.fields.map((f: any, i: number) => <div key={i}>{renderField(f, `${ctx}.fields[${i}]`)}</div>) : null}
            {Array.isArray(field.questions) ? field.questions.map((q: any, i: number) => <div key={i}>{renderField(q, `${ctx}.questions[${i}]`)}</div>) : null}
            {Array.isArray(field.rows) ? renderField({ ...field, type: "table", rows: field.rows, columns: field.columns }, `${ctx}.rows`) : null}
            {Array.isArray(field.sections) ? field.sections.map((s: any, i: number) => <div key={i}>{renderField(s, `${ctx}.sections[${i}]`)}</div>) : null}
            {field.table ? renderField({ type: "table", ...field.table }, `${ctx}.table`) : null}
          </div>
        </div>
      );
    }

    // unknown fallback: pretty-print object
    return (
      <div key={key} className="border p-3 rounded-md mt-3 bg-gray-50">
        <pre className="text-xs text-gray-600">{JSON.stringify(field, null, 2)}</pre>
      </div>
    );
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault?.();
    if (!formSchema) return;
    const updated = buildUpdatedJsonWithSelected(formSchema, answers);
    if (isWeightageType) {
      const root = updated.template ?? updated;
      root.totalWeightage = total;
    }
    if (onWeightageChange) onWeightageChange(total, updated, "submit", calculatedlable);
    if (onSubmit) onSubmit(updated);
  };

  if (!formSchema) return <div className="text-gray-500 text-center py-6">No schema provided</div>;

  const t = templateRoot;

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex justify-end items-start">
        {/* <h2 className="text-lg font-bold">{t.formTitle ?? t.template_name ?? "Dynamic Form"}</h2> */}
        {(template_weightage_format) && (
          <div className="text-right">
            <div className="text-sm text-gray-600">Live Total Weightage</div>
            <div className="text-2xl font-semibold text-[#1d69bf]">{total}</div>
          </div>
        )}
      </div>

      {Array.isArray(t.sections)
        ? t.sections.map((s: any, i: number) => <div key={i}>{renderField(s, `root.sections[${i}]`)}</div>)
        : Array.isArray(t.questions)
          ? t.questions.map((q: any, i: number) => <div key={i}>{renderField(q, `root.questions[${i}]`)}</div>)
          : (t.type && /weightage|table/i.test(t.type) && Array.isArray(t.rows))
            ? renderField({ type: "table", name: t.template_name ?? t.templateName, columns: t.columns ?? [], rows: t.rows ?? [] }, "root.rows")
            : null}

      {/* {Array.isArray(t.weightage_ranges) && t.weightage_ranges.length > 0 && (
        <div className="mt-6">
          <div className="bg-[#1d69bf] text-white font-semibold px-4 py-2 rounded-t-md">
            Weightage Ranges
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-b-md">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Label</th>
                  <th className="border px-3 py-2 text-left">From</th>
                  <th className="border px-3 py-2 text-left">To</th>
                </tr>
              </thead>

              <tbody>
                {t.weightage_ranges.map((range: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="border px-3 py-2">{range.label}</td>
                    <td className="border px-3 py-2">
                      <input
                        type="number"
                        value={range.from}
                        disabled
                        className="border border-gray-300 rounded p-1 w-full bg-gray-100 cursor-not-allowed"
                      />
                    </td>
                    <td className="border px-3 py-2">
                      <input
                        type="number"
                        value={range.to}
                        disabled
                        className="border border-gray-300 rounded p-1 w-full bg-gray-100 cursor-not-allowed"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )} */}

      {buttonMode !== 3 && (
        <div className="flex justify-end mt-6 gap-2">
          {/* {buttonMode === 1 && ( */}
          <button
            type="button"
            onClick={() => submit(undefined)}
            className="px-4 py-2 rounded bg-[#1d69bf] text-white"
          >
            {buttonMode === 1 ? 'Submit' : 'Save'}
          </button>
          {/* )} */}

          {/* {buttonMode === 2 && (
            <button
              type="submit"
              className="px-4 py-2 rounded bg-[#1d69bf] text-white"
            >
              Submit
            </button>
          )} */}
        </div>
      )}

    </form>
  );
};

export default RenderUiTemplate;