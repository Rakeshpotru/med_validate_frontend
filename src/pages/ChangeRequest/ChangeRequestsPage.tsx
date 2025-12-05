import { useState, useEffect } from 'react';
import { FileCheck, AlertCircle, ChevronDown } from 'lucide-react';
import { ChangeRequest, ApiResponse } from './ChangeRequestTypes';
import { ChangeRequestCard } from './ChangeRequestCard';
import { FileViewer } from './FileViewer';
import { Api_url } from '../../networkCalls/Apiurls';
import RingGradientLoader from '../../components/RingGradientLoader';
import { showSuccess, showError, showWarn } from "../../services/toasterService"; // Adjust path as needed
import { getRequestStatus, postRequestStatus } from '../../networkCalls/NetworkCalls';
import DecodedTokenValues from '../../components/DecryptToken';

function ChangeRequestsPage() {
  const { user_id } = DecodedTokenValues();
  const [changeRequests, setChangeRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [pendingRejectId, setPendingRejectId] = useState<number | null>(null);

   // Only ONE pending form edit at a time

  const [pendingFormData, setPendingFormData] = useState<{
    change_request_id: number;
    json: any;
  } | null>(null);

  useEffect(() => {
    fetchChangeRequests();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getRequestStatus<any>(Api_url.getUnverifiedChangeRequests);

      if (response.status === 200 && response.data) {
        setChangeRequests(response.data.data || []);
        // showSuccess(response.data.message || 'Change requests fetched successfully');
      } else {
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = changeRequests.filter((cr) => {
    switch (selectedStatus) {
      case 'pending':
        return cr.is_verified === null;
      case 'approved':
        return cr.is_verified === true;
      case 'rejected':
        return cr.is_verified === false;
      default:
        return true;
    }
  });

  const handleApprove = async (id: number) => {
    if (!user_id) {
      showError('User ID not found. Please log in again.');
      return;
    }
    try {
      setActionLoading(true);
      const changeRequest = changeRequests.find(cr => cr.change_request_id === id);
      if (!changeRequest) {
        showError("Change request not found");
        return;
      }
      const change_request_json = pendingFormData?.change_request_id === id? pendingFormData.json: null;
      
      const data = {
        change_request_id: id,
        change_request_user_mapping_id: changeRequest.change_request_user_mapping_id,
        verified_by: user_id,
        is_verified: true,
        reject_reason: 'N/A',
        change_request_json
      };

      const response = await postRequestStatus(Api_url.updateChangeRequestStatus, data);

      if (response.status === 200) {
        setChangeRequests(prev => prev.map(cr => 
          cr.change_request_id === id ? { ...cr, is_verified: true, reject_reason: 'N/A' } : cr
        ));
        if (selectedRequest && selectedRequest.change_request_id === id) {
          setSelectedRequest({ ...selectedRequest, is_verified: true, reject_reason: 'N/A' });
        }
        setPendingFormData(null);
        showSuccess('CR Approved Successfully');
      } else {
        showError('please try again later');
      }
    } catch (err) {
      showError('please try again later');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (id: number) => {
    setPendingRejectId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      showWarn('Reject reason is required.');
      return;
    }
    if (!user_id || !pendingRejectId) {
      showError('Please log in again.');
      setShowRejectModal(false);
      return;
    }
    try {
      setRejectLoading(true);
      const changeRequest = changeRequests.find(cr => cr.change_request_id === pendingRejectId);
      if (!changeRequest) {
        showError("Change request not found");
        return;
      }
      const change_request_json = pendingFormData?.change_request_id === pendingRejectId? pendingFormData.json: null;
      const data = {
        change_request_id: pendingRejectId,
        change_request_user_mapping_id: changeRequest.change_request_user_mapping_id,
        verified_by: user_id,
        is_verified: false,
        reject_reason: rejectReason.trim(),
        change_request_json
      };

      const response = await postRequestStatus(Api_url.updateChangeRequestStatus, data);

      if (response.status === 200 || response.status === 201) {
        setChangeRequests(prev => prev.map(cr => 
          cr.change_request_id === pendingRejectId ? { ...cr, is_verified: false, reject_reason: rejectReason.trim() } : cr
        ));
        if (selectedRequest && selectedRequest.change_request_id === pendingRejectId) {
          setSelectedRequest({ ...selectedRequest, is_verified: false, reject_reason: rejectReason.trim() });
        }
        setPendingFormData(null);
        showSuccess('CR Rejected');
      } else {
        showError('please try again later');
      }
    } catch (err) {
      showError('please try again later');
    } finally {
      setRejectLoading(false);
      setShowRejectModal(false);
      setPendingRejectId(null);
      setRejectReason('');
    }
  };

  const handleReject = (id: number) => {
    openRejectModal(id);
  };

  const handleView = (changeRequest: ChangeRequest) => {
    setSelectedRequest(changeRequest);
  };

  const statusLabel = selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <RingGradientLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 text-center mb-2">Error</h2>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchChangeRequests}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileCheck className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Change Request Management</h1>
          </div>
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'pending' | 'approved' | 'rejected')}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FileCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No {statusLabel} Requests</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredRequests.map((changeRequest) => (
              <ChangeRequestCard
                key={changeRequest.change_request_id}
                changeRequest={changeRequest}
                onView={handleView}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <FileViewer
          changeRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          pendingFormData={pendingFormData}
          onFormSubmit={(data) => {
            setPendingFormData({
              change_request_id: data.change_request_id,
              json: data.json
            });

          }}
        />
      )}

      {actionLoading && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <RingGradientLoader />
        </div>
      )}

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col">
            {rejectLoading ? (
              <div>
                <RingGradientLoader />
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800">Reject Change Request</h2>
                  <p className="text-sm text-gray-600 mt-1">Please provide a reason for rejection.</p>
                </div>
                <div className="flex-1 p-6 overflow-auto">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter reject reason..."
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 bg-white">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setPendingRejectId(null);
                      setRejectReason('');
                    }}
                    className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectConfirm}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Reject
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ChangeRequestsPage;