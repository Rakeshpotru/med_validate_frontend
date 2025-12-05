import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Filter, AlertCircle, CheckCircle } from "lucide-react";
import { Api_url } from "../../../networkCalls/Apiurls";
import MicroscopeLoader from "../../../../public/MicroscopeLoader";
import { getApiHeaders, getRequest, postRequest } from "../../../networkCalls/NetworkCalls";
import { showError } from "../../../services/toasterService";

interface Incident {
    incident_report_id: number;
    project_name?: string;
    phase_name?: string;
    task_name?: string;
    raise_comment?: string;
    is_resolved: boolean;
    raised_date?: string;
    failure_type?: number;
    raised_by?: number;
    assigned_to?: number;
    incident_type?: string | number;
    incident_comment?: string;
    status_name?: string;
}


const IncidentReport: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "raised" | "resolved">("all");
    const [raisedFilter, setRaisedFilter] = useState<"all" | "raised_by_me" | "raised_against_me">("all");
    const [incidentList, setIncidentList] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // popup state
    const [popupIncidentId, setPopupIncidentId] = useState<number | null>(null);
    const [popupComment, setPopupComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // current user
    const parsedUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const currentUserId = parsedUser?.id;

    /** Fetch incidents */
    const fetchIncidents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const headers = await getApiHeaders();
            const url = Api_url.get_incident_reports();
            const res = await fetch(url, { headers });
            const response = await res.json();

            if (!Array.isArray(response.data)) throw new Error("Invalid incident data");

            const mapped: Incident[] = response.data.map((incident) => ({
                ...incident,
                incident_type: incident.failure_type,
                incident_comment: incident.raise_comment,
                status_name: incident.is_resolved ? "Resolved" : "Raised",
            }));

            // Sort by ID descending
            setIncidentList(mapped.sort((a, b) => b.incident_report_id - a.incident_report_id));
        } catch (err: any) {
            console.error("Error fetching incidents:", err);
            setError(err.message || "Failed to fetch incident reports");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchIncidents();
    }, [fetchIncidents]);

    /** Filter incidents */
    const filteredIncidents = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return incidentList.filter((incident) => {
            const matchesSearch =
                incident.incident_type?.toString().toLowerCase().includes(term) ||
                incident.incident_comment?.toLowerCase().includes(term);

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "raised" && !incident.is_resolved) ||
                (statusFilter === "resolved" && incident.is_resolved);

            const matchesRaised =
                raisedFilter === "all" ||
                (raisedFilter === "raised_by_me" && incident.raised_by === currentUserId) ||
                (raisedFilter === "raised_against_me" && incident.assigned_to === currentUserId);

            return matchesSearch && matchesStatus && matchesRaised;
        });
    }, [incidentList, searchTerm, statusFilter, raisedFilter, currentUserId]);

    /** Handle resolve action */
    const handleResolveClick = (incident: Incident) => {
        if (incident.is_resolved) {
            showError("This incident is already resolved.");
            return;
        }
        setPopupIncidentId(incident.incident_report_id);
        setPopupComment("");
    };

    /** Submit resolution */
    const handleSubmit = async () => {
        if (!popupIncidentId || !currentUserId) return;

        if (!popupComment.trim()) {
            showError("⚠️ Please leave a resolution comment.");
            return;
        }

        setSubmitting(true);
        try {
            const headers = await getApiHeaders();
            const body = {
                incident_report_id: popupIncidentId,
                resolved_by: currentUserId,
                resolve_comment: popupComment,
            };

            const url = Api_url.resolve_incidents;
            const res = await postRequest(url, body, headers);
            const response = res.json ? await res.json() : res;

            if (response.status_code === 200) {
                fetchIncidents(); // refresh
                setPopupIncidentId(null);
            } else {
                showError(response.message || "Failed to resolve incident.");
            }
        } catch (err: any) {
            console.error("Error resolving incident:", err);
            showError(err.message || "Error resolving incident.");
        } finally {
            setSubmitting(false);
        }
    };

    /** UI states */
    if (loading) {
        return (
            <div className="flex justify-center items-center">
                <MicroscopeLoader />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-gray-600 mb-6">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-8 w-full h-full overflow-y-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Incident Reports</h1>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex flex-wrap gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-64 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search incidents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="all">All</option>
                            <option value="raised">Raised</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>

                    {/* Raised Filter */}
                    <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                            value={raisedFilter}
                            onChange={(e) => setRaisedFilter(e.target.value as any)}
                            className="border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="all">All Raised</option>
                            <option value="raised_by_me">Raised by me</option>
                            <option value="raised_against_me">Raised against me</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Incident List */}
            {filteredIncidents.length > 0 ? (
                <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                        <table className="min-w-full text-sm text-left text-gray-600">
                            <thead className="bg-gray-100 text-gray-900 text-xs uppercase">
                                <tr>
                                    <th className="px-4 py-3">ID</th>
                                    <th className="px-4 py-3">Project</th>
                                    <th className="px-4 py-3">Phase</th>
                                    <th className="px-4 py-3">Task</th>
                                    <th className="px-4 py-3">Failure Type</th>
                                    <th className="px-4 py-3">Comment</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Raised Date</th>
                                    <th className="px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredIncidents.map((incident) => (
                                    <tr
                                        key={incident.incident_report_id}
                                        className="border-b last:border-none hover:bg-gray-50"
                                    >
                                        <td className="px-4 py-3 font-medium text-gray-900">
                                            {incident.incident_report_id}
                                        </td>
                                        <td className="px-4 py-3">{incident.project_name || "N/A"}</td>
                                        <td className="px-4 py-3">{incident.phase_name || "N/A"}</td>
                                        <td className="px-4 py-3">{incident.task_name || "N/A"}</td>
                                        <td className="px-4 py-3">{incident.incident_type || "N/A"}</td>
                                        <td className="px-4 py-3 truncate max-w-xs">
                                            {incident.incident_comment || "No comment"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${incident.status_name === "Resolved"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {incident.status_name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {incident.raised_date &&
                                                incident.raised_date !== "0000-00-00T07:12:57"
                                                ? new Date(incident.raised_date).toLocaleDateString()
                                                : "N/A"}
                                        </td>
                                        <td className="flex justify-center px-4 py-3">
                                            <button
                                                className={`${incident.is_resolved
                                                        ? "text-gray-300 cursor-not-allowed"
                                                        : "text-gray-600 hover:text-green-600"
                                                    }`}
                                                title={incident.is_resolved ? "Resolved" : "Resolve"}
                                                disabled={incident.is_resolved}
                                                onClick={() => handleResolveClick(incident)}
                                            >
                                                <CheckCircle className="h-6 w-6" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="space-y-4 md:hidden">
                        {filteredIncidents.map((incident) => (
                            <div
                                key={incident.incident_report_id}
                                className="bg-white shadow rounded-lg border border-gray-200 p-4"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        #{incident.incident_report_id}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${incident.status_name === "Closed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {incident.status_name}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Project:</span> {incident.project_name || "N/A"}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Phase:</span> {incident.phase_name || "N/A"}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Task:</span> {incident.task_name || "N/A"}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Failure Type:</span> {incident.incident_type || "N/A"}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Comment:</span>{" "}
                                    {incident.incident_comment || "No comment"}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">Raised:</span>{" "}
                                    {incident.raised_date && incident.raised_date !== "0000-00-00T07:12:57"
                                        ? new Date(incident.raised_date).toLocaleDateString()
                                        : "N/A"}
                                </p>
                                <div className="mt-3">
                                    <button
                                        className={`w-full px-4 py-2 rounded-lg text-sm font-medium ${incident.is_resolved
                                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                                : "bg-green-600 text-white hover:bg-green-700"
                                            }`}
                                        disabled={incident.is_resolved}
                                        onClick={() => handleResolveClick(incident)}
                                    >
                                        Resolve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No incidents found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search or filters.</p>
                </div>
            )}

            {/* Popup Modal */}
            {popupIncidentId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
                        <h2 className="text-lg font-semibold mb-3">
                            Resolve Incident #{popupIncidentId}
                        </h2>

                        <textarea
                            className="w-full border rounded-lg p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
                            rows={4}
                            placeholder="Enter your resolution comments..."
                            value={popupComment}
                            onChange={(e) => setPopupComment(e.target.value)}
                        />

                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                                onClick={() => setPopupIncidentId(null)}
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                {submitting ? "Resolving..." : "Resolve"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default IncidentReport;