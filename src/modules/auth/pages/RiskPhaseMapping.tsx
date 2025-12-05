import React, { useEffect, useState } from 'react';
import { Edit } from 'lucide-react';
import {
  getRequestStatus,
  postRequestStatus,
  
} from '../../../networkCalls/NetworkCalls';
import { Api_url } from '../../../networkCalls/Apiurls';
import RingGradientLoader from '../../../components/RingGradientLoader';
import { showError, showSuccess, showWarn } from '../../../services/toasterService';

// -------------------------
// Interfaces
// -------------------------
interface Phase {
  phase_id: number;
  phase_name: string;
}

interface Risk {
  risk_assessment_id: number;
  risk_assessment_name: string;
}

interface RiskPhaseMapping {
  risk_assessment_id: number;
  risk_assessment_name: string;
  phases: Phase[];
}

interface ApiResponse<T> {
  status_code: number;
  message: string;
  data: T;
}

type GetRisksResponse = ApiResponse<Risk[]>;
type GetPhasesResponse = ApiResponse<Phase[]>;
type GetMappingsResponse = ApiResponse<RiskPhaseMapping[]>;
type MapRiskToPhasesResponse = ApiResponse<null>;

// -------------------------
// Component
// -------------------------
const RiskPhaseMapping: React.FC = () => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [allPhases, setAllPhases] = useState<Phase[]>([]);
  const [mappings, setMappings] = useState<RiskPhaseMapping[]>([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRiskId, setSelectedRiskId] = useState<number | null>(null);
  const [selectedPhaseIds, setSelectedPhaseIds] = useState<number[]>([]);

  // -------------------------
  // Load data
  // -------------------------
  useEffect(() => {
    fetchRisks();
    fetchPhases();
    fetchMappings();
  }, []);

  const fetchRisks = async () => {
    try {
      // const headers = await GetApiHeaders_token();
      const { status, data } = await getRequestStatus<GetRisksResponse>(Api_url.getAllRiskAssessments);
      if (status === 200 && data) setRisks(data.data);
      else showError(data?.message || 'Failed to fetch risk assessments');
    } catch (err) {
      showError('Failed to fetch risk assessments');
    }
  };

  const fetchPhases = async () => {
    try {
      // const headers = await GetApiHeaders_token();
      const { status, data } = await getRequestStatus<GetPhasesResponse>(Api_url.getAllPhases);
      if (status === 200 && data) setAllPhases(data.data);
      else showError(data?.message || 'Failed to fetch phases');
    } catch (err) {
      showError('Failed to fetch phases');
    }
  };

  const fetchMappings = async () => {
    setLoading(true);
    try {
      // const headers = await GetApiHeaders_token();
      const { status, data } = await getRequestStatus<GetMappingsResponse>(Api_url.getAllMappedRisksWithPhases);
      if (status === 200 && data) setMappings(data.data);
      else showError(data?.message || 'Failed to fetch risk-phase mappings');
    } catch (err) {
      showError('Failed to fetch risk-phase mappings');
    } finally {
      setLoading(false);
    }
  };

  // -------------------------
  // Modal handlers
  // -------------------------
  const openMappingModal = (riskId: number) => {
    const existing = mappings.find((m) => m.risk_assessment_id === riskId);
    setSelectedRiskId(riskId);
    setSelectedPhaseIds(existing?.phases.map((p) => p.phase_id) || []);
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedRiskId) {
      showWarn('Select a risk');
      return;
    }
    if (selectedPhaseIds.length === 0) {
      showWarn('Select at least one phase');
      return;
    }

    try {
      // const headers = await GetApiHeaders_token();
      const payload = { risk_assessment_id: selectedRiskId, phase_ids: selectedPhaseIds };
      const { status, data } = await postRequestStatus<MapRiskToPhasesResponse>(Api_url.mapRiskToPhases, payload);

      if (status === 200 || status === 201) {
        showSuccess('Mapping saved successfully');
        setIsModalOpen(false);
        fetchMappings();
      } else {
        showError(data?.message || 'Failed to save mappings');
      }
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to save mappings');
    }
  };

  // -------------------------
  // Render
  // -------------------------
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Risk to Phase Mapping</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        {loading ? (
          <p><RingGradientLoader /></p>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-sm text-gray-600">Risk Level</th>
                <th className="text-left px-4 py-2 text-sm text-gray-600">Mapped Phases</th>
                <th className="text-left px-4 py-2 text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk) => {
                const mapped = mappings.find((m) => m.risk_assessment_id === risk.risk_assessment_id);
                return (
                  <tr key={risk.risk_assessment_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-800">{risk.risk_assessment_name}</td>
                    <td className="px-4 py-2 text-gray-700">
                      {mapped?.phases.length ? (
                        <div className="flex flex-wrap gap-1">
                          {mapped.phases.map((p) => (
                            <span key={p.phase_id} className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                              {p.phase_name}
                            </span>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openMappingModal(risk.risk_assessment_id)}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4 mr-1" /> Map
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 p-6">
            <h2 className="text-xl font-bold mb-4">Map Phases to Risk</h2>

            <label className="block text-sm font-medium mb-2 text-gray-700">Select Phases:</label>
            <div className="max-h-40 overflow-y-auto border rounded px-2 py-1 mb-4">
              {allPhases.map((phase) => (
                <label key={phase.phase_id} className="flex items-center space-x-2 py-1">
                  <input
                    type="checkbox"
                    value={phase.phase_id}
                    checked={selectedPhaseIds.includes(phase.phase_id)}
                    onChange={(e) => {
                      const pid = phase.phase_id;
                      setSelectedPhaseIds((prev) =>
                        e.target.checked ? [...prev, pid] : prev.filter((id) => id !== pid)
                      );
                    }}
                  />
                  <span>{phase.phase_name}</span>
                </label>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save Mapping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskPhaseMapping;
