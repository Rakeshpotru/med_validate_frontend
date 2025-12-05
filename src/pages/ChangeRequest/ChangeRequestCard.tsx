import { FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import { ChangeRequest } from '../../../src/pages/ChangeRequest/ChangeRequestTypes';

interface ChangeRequestCardProps {
  changeRequest: ChangeRequest;
  onView: (changeRequest: ChangeRequest) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
}

const getStatusBadge = (isVerified: boolean | null) => {
  if (isVerified === null) {
    return { label: 'Pending', bg: 'bg-yellow-100', text: 'text-yellow-800' };
  }
  if (isVerified === true) {
    return { label: 'Approved', bg: 'bg-green-100', text: 'text-green-800' };
  }
  return { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800' };
};

const getFileIcon = (filename: string | null) => {
  if (!filename) {
    return '📋';
  }
  if (filename.match(/\.(png|jpg|jpeg|gif|bmp|webp)$/i)) {
    return '🖼️';
  }
  if (filename.match(/\.pdf$/i)) {
    return '📄';
  }
  return '📎';
};

export function ChangeRequestCard({
  changeRequest,
  onView,
  onApprove,
  onReject,
}: ChangeRequestCardProps) {
  const status = getStatusBadge(changeRequest.is_verified);
  const isPending = changeRequest.is_verified === null;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200">
      <div className="p-3">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {changeRequest.change_request_code}
            </h3>
            <p className="text-sm text-gray-600">{changeRequest.project_name}</p>
          </div>
          <span className={`px-3 py-1 ${status.bg} ${status.text} text-xs font-medium rounded-full`}>
            {status.label}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <span className="text-2xl">{getFileIcon(changeRequest.change_request_file)}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 truncate font-medium">
              {changeRequest.change_request_file || (changeRequest.transaction_template_id ? 'Form Data' : 'No attachment')}
            </p>
            <p className="text-xs text-gray-500">
              {changeRequest.change_request_file ? 'Attached file' : (changeRequest.transaction_template_id ? 'Submitted form' : 'No attachment')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => onView(changeRequest)}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[13px] bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          {isPending && (
            <>
              <button
                onClick={() => onApprove(changeRequest.change_request_id)}
                className="flex items-center justify-center gap-1 px-2 py-1.5 text-[13px] bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
              >
                <CheckCircle className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => onReject(changeRequest.change_request_id)}
                className="flex items-center justify-center gap-1 px-2 py-1.5 text-[13px] bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}