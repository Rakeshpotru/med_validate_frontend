// Templates.tsx

import React, { useState, useEffect } from "react";
import TemplateEditor from "./TemplateEditor";
import TemplateList from "./TemplateList";
import { getRequestStatus } from "../../networkCalls/NetworkCalls";
import { Api_url } from "../../networkCalls/Apiurls";

interface Template {
  template_type_id: number;
  template_type_name: string;
  format_name: string;
  is_active: boolean;
  section?: boolean;
  weightage?: boolean; // ← ADDED
}

interface Version {
  template_id?: number;
  template_name?: string;
  created_date?: string;
  template_version?: string;
}

const Templates: React.FC = () => {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [latestVersionId, setLatestVersionId] = useState<number | undefined>(undefined);
  const [versions, setVersions] = useState<Version[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedForList, setSelectedForList] = useState<Template | undefined>(undefined); // ← FIXED: Changed from Template | null to Template | undefined
  // Fetch versions when a template is selected (used in TemplateList)
  const fetchVersions = async (templateTypeId: number) => {
    try {
      // const url = `http://127.0.0.1:308/api/master/getAllVersions?template_type_id=${templateTypeId}`;
      const url = Api_url.getAllVersions(templateTypeId);
      
      const res = await getRequestStatus<any>(url);
      if (res?.data?.status_code === 200) {
        const fetchedVersions = res.data.data || [];
        setVersions(fetchedVersions);

        // Find the latest version
        const latest = fetchedVersions
          .filter((v: Version) => v.template_id && v.created_date)
          .sort(
            (a: Version, b: Version) =>
              new Date(b.created_date!).getTime() - new Date(a.created_date!).getTime()
          )[0];

        setLatestVersionId(latest?.template_id);
      } else {
        setVersions([]);
        setLatestVersionId(undefined);
      }
    } catch (e) {
      console.error("Failed to fetch versions:", e);
      setVersions([]);
      setLatestVersionId(undefined);
    }
  };

  // Enter editor with optional latest version ID
  const enterEditor = (tmpl: Template, versionId?: number) => {
    setSelectedForList(tmpl); // ← NEW: Preserve for back navigation
    setEditingTemplate(tmpl);
    setSelectedTemplateId(tmpl.template_type_id);
    setLatestVersionId(versionId);
    // Fetch versions if not already loaded
    if (versions.length === 0 || !versionId) {
      fetchVersions(tmpl.template_type_id);
    }
  };

  // Go back to list
  const leaveEditor = () => {
    setEditingTemplate(null);
    setLatestVersionId(undefined);
    setSelectedTemplateId(null);
  };

  // Refresh versions after saving a new one
  const refreshVersions = () => {
    if (selectedTemplateId) {
      fetchVersions(selectedTemplateId);
    }
  };

  // When back from editor, optionally refetch if needed
  const handleBackFromEditor = () => {
    setEditingTemplate(null); // ← MODIFIED: Only reset editor state; keep selectedForList for versions view
    setLatestVersionId(undefined);
    // Optionally refetch to ensure UI is fresh
    if (selectedTemplateId) {
      fetchVersions(selectedTemplateId);
    }
  };
  // ← NEW: Reset list selected (called from TemplateList back to main list)
  const handleResetListSelected = () => {
    setSelectedForList(undefined); // ← FIXED: Changed from null to undefined
  };
  return (
    <>
      {editingTemplate ? (
        <TemplateEditor
          template={editingTemplate}
          versions={versions}
          onBack={handleBackFromEditor}
          onRefreshVersions={refreshVersions}
          latestVersionId={latestVersionId} // Pass latest version to pre-fill
        />
      ) : (
        <TemplateList
          onEnterEditor={enterEditor} // Now supports (tmpl, versionId?)
          initialSelected={selectedForList} // ← NEW: Pass preserved selected
          onResetSelected={handleResetListSelected} // ← NEW: For back to main templates
        />
      )}
    </>
  );
};

export default Templates;