// FileViewer.tsx (Fixed JSON Parsing with Type Guard & Error Handling)
import { X, FileText, Download } from 'lucide-react';
import { ChangeRequest } from '../../../src/pages/ChangeRequest/ChangeRequestTypes';
import { Api_url } from '../../networkCalls/Apiurls';
import RenderUiTemplate from '../../../public/RenderUi_Template'; // Adjust path as needed
import { useState, useEffect } from 'react';
import { showSuccess, showError, showWarn } from "../../services/toasterService";

interface FileViewerProps {
  changeRequest: ChangeRequest;
  pendingFormData: { change_request_id: number; json: any } | null;
  onClose: () => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onFormSubmit?: (data: { change_request_id: number; json: any }) => void;
}

export function FileViewer({ changeRequest, onClose, onApprove, onReject,onFormSubmit, pendingFormData }: FileViewerProps) {
  const fileUrl = Api_url.getChangeRequestFile(changeRequest.change_request_file);
  const isPending = changeRequest.is_verified === null;
  const [showFormModal, setShowFormModal] = useState(false);

  const handleCrFormSubmit = async (submittedData: any) => {
    console.log("Submitted data+++++++++++++++++++:", submittedData);
    onFormSubmit?.({
      change_request_id: changeRequest.change_request_id,
      json: submittedData
    });
    setShowFormModal(false);
    showSuccess("Saved! You can now approve or reject.");
    };

  //Prevent background scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // FIXED: Safe JSON parsing with type guard & try-catch
  const parsedJson = (() => {
    // Priority 1: Use latest saved (but unapproved) data if it's for this CR
    if (
      pendingFormData &&
      pendingFormData.change_request_id === changeRequest.change_request_id
    ) {
      return pendingFormData.json;
    }

  // Priority 2: Fall back to original from backend
    const json = changeRequest.change_request_json;
    if (!json) return null;
    if (typeof json === 'string') {
      try {
        return JSON.parse(json);
      } catch (error) {
        console.error('Invalid JSON in change_request_json:', error);
        return null; // Fallback to error modal
      }
    }
    // If already an object (backend returned object directly), use as-is
    return json;
  })();

  const handleViewForm = () => {
    setShowFormModal(true);
  };

  const handleCloseForm = () => {
    setShowFormModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800">
              {changeRequest.change_request_code}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{changeRequest.project_name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6 bg-gray-50">
          <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[400px] flex items-center justify-center">
            {/* Conditional rendering based on transaction_template_id */}
            {changeRequest.transaction_template_id === null || changeRequest.transaction_template_id === undefined ? (
              // File Mode: Download UI (unchanged)
              <div className="text-center">
                <FileText className="w-20 h-20 text-blue-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">File Download</p>
                <p className="text-sm text-gray-500 mb-4">{changeRequest.change_request_file}</p>
                <a
                  href={fileUrl}
                  download={changeRequest.change_request_file}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download File
                </a>
              </div>
            ) : (
              // JSON/Form Mode: View Form Button
              <div className="text-center">
                <FileText className="w-20 h-20 text-green-500 mx-auto mb-4" />
                <p className="text-gray-700 font-medium mb-2">Change Request Form</p>
                {/* <p className="text-sm text-gray-500 mb-4">View submitted form data</p> */}
                <button
                  onClick={handleViewForm}
                  className="inline-flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  <Download className="w-4 h-4" />
                  View CR Form
                </button>
              </div>
            )}
          </div>
        </div>

        {isPending ? (
          <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-white">
            <button
              onClick={() => onReject(changeRequest.change_request_id)}
              className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(changeRequest.change_request_id)}
              className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-sm hover:shadow-md"
            >
              Approve
            </button>
          </div>
        ) : (
          <div className="p-6 border-t border-gray-200 bg-white text-center">
            <p className="text-gray-600 font-medium">
              This CR file is already {changeRequest.is_verified ? 'approved' : 'rejected'}.
            </p>
            {changeRequest.is_verified === false && changeRequest.reject_reason && (
              <p className="text-sm text-gray-500 mt-2 italic">
                Reason: {changeRequest.reject_reason}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Form Viewer Modal */}
      {showFormModal && parsedJson ? (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">Change Request Form</h3>
              <button
                onClick={handleCloseForm}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scroll-smooth p-4">
              <RenderUiTemplate 
                formSchema={parsedJson} 
                // onSubmit={() => {}}
                buttonMode={2}
                onSubmit={handleCrFormSubmit}
                allFieldsEnabledOrDisabled={false}
                commentsEnabled={3}
              />
            </div>
          </div>
        </div>
      ) : showFormModal && !parsedJson ? (
        // FIXED: Show fallback if parsing fails
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full text-center p-6">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No form data available or invalid format.</p>
            <button
              onClick={handleCloseForm}
              className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}