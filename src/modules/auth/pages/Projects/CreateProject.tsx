import React, { useEffect, useState } from 'react';
import { X, Save, AlertCircle, Info } from 'lucide-react';
import { postRequest } from '../../../../networkCalls/NetworkCalls';
import { Api_url } from '../../../../networkCalls/Apiurls';
import { toast } from 'react-toastify';

interface RiskAssessment {
  risk_assessment_id: number;
  risk_assessment_name: string;
}

interface RiskPhase {
  risk_phase_mapping_id: number;
  phase_id: number;
  phase_name: string;
  risk_assessment_id: number;
  risk_assessment_name: string;
}

interface User {
  user_id: number;
  user_name: string;
  email: string;
  roles: {
    role_id: number;
    role_name: string;
  }[];
}

interface CreateProjectProps {
  onClose: () => void;
  onSave: () => void;
}

const CreateProject: React.FC<CreateProjectProps> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    equipment: 0,
    riskAssessment: 'Low' as 'Low' | 'Medium' | 'High',
    assignees: [] as string[],
    searchQuery: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [phases, setPhases] = useState<RiskPhase[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [equipments, setEquipments] = useState<{ equipment_id: number; equipment_name: string; ai_verified_doc?: boolean }[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showAddEquipment, setShowAddEquipment] = useState(false);
  const [newEquipmentName, setNewEquipmentName] = useState('');
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [showRiskPopup, setShowRiskPopup] = useState(false);

  useEffect(() => {
    fetch(Api_url.getAllRiskAssessments)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRiskAssessments(data);
        } else if (Array.isArray(data?.data)) {
          setRiskAssessments(data.data);
        } else {
          console.error("Unexpected riskAssessments format:", data);
          setRiskAssessments([]);
        }
      })
      .catch((err) => console.error("Error fetching risk assessments:", err));
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      setCurrentUserId(user.id);
    }

    fetch(Api_url.getUsers)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (Array.isArray(data?.data)) {
          setUsers(data.data);
        } else {
          console.error('Unexpected users response:', data);
          setUsers([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching users:', err);
        setUsers([]);
      });
  }, []);

  useEffect(() => {
    fetch(Api_url.getAllEquipments)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEquipments(data);
        } else if (data?.data && Array.isArray(data.data)) {
          setEquipments(data.data);
        } else {
          console.error('Unexpected equipment data format:', data);
          setEquipments([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching equipments:', err);
        setEquipments([]);
      });
  }, []);

  useEffect(() => {
    const selectedRisk = riskAssessments.find(
      (ra) => ra.risk_assessment_name.toLowerCase() === formData.riskAssessment.toLowerCase()
    );

    if (selectedRisk) {
      fetch(Api_url.getAllMappedRisksWithPhases)
        .then((res) => res.json())
        .then((data) => {
          const mapping = data.data.find(
            (item: any) => item.risk_assessment_id === selectedRisk.risk_assessment_id
          );
          if (mapping) {
            setPhases(mapping.phases);
          } else {
            setPhases([]);
          }
        })
        .catch((err) => console.error('Error fetching phases:', err));
    }
  }, [formData.riskAssessment, riskAssessments]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        const maxSize = 10 * 1024 * 1024; // 10MB limit
        if (file.size > maxSize) {
          alert(`File ${file.name} exceeds 10MB limit`);
          return false;
        }
        return true;
      });
      setProjectFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = [...projectFiles];
    updatedFiles.splice(index, 1);
    setProjectFiles(updatedFiles);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Project name is required';
    if (!formData.description.trim()) newErrors.description = 'Project description is required';
    if (!formData.equipment) newErrors.equipment = 'Equipment selection is required';
    if (formData.assignees.length === 0) newErrors.assignees = 'At least one assignee is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddEquipment = async () => {
    if (!newEquipmentName.trim()) {
      setErrors((prev) => ({ ...prev, newEquipment: 'Equipment name is required' }));
      return;
    }

    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      setErrors((prev) => ({ ...prev, newEquipment: 'User not logged in' }));
      return;
    }
    const userId = JSON.parse(userData).id;

    try {
      setLoading(true);
      const payload = {
        equipment_name: newEquipmentName,
        created_by: userId
      };
      const response = await postRequest(Api_url.createEquipment, payload, {
        'Content-Type': 'application/json',
      });

      if (response) {
        fetch(Api_url.getAllEquipments)
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data)) {
              setEquipments(data);
            } else if (data?.data && Array.isArray(data.data)) {
              setEquipments(data.data);
            } else {
              console.error('Unexpected equipment data format:', data);
              setEquipments([]);
            }
          })
          .catch((err) => {
            console.error('Error fetching equipments:', err);
            setEquipments([]);
          });

        setNewEquipmentName('');
        setShowAddEquipment(false);
        setErrors((prev) => ({ ...prev, newEquipment: '' }));
      } else {
        console.error('Invalid response format:', response);
        alert('Failed to add equipment. Invalid response from server.');
      }
    } catch (err: any) {
      console.error('Error adding equipment:', err.message, err.response?.data);
      alert(`Error while adding equipment: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const selectedRisk = riskAssessments.find(
      (ra) => ra.risk_assessment_name.toLowerCase() === formData.riskAssessment.toLowerCase()
    );

    if (!selectedRisk) {
      alert('Invalid risk assessment selected');
      return;
    }

    const userData = localStorage.getItem('currentUser');
    if (!userData) {
      alert('User data not found. Please log in again.');
      return;
    }
    const userId = JSON.parse(userData).id;

    const formDataPayload = new FormData();
    formDataPayload.append('project_name', formData.name);
    formDataPayload.append('project_description', formData.description || '');
    formDataPayload.append('risk_assessment_id', String(selectedRisk.risk_assessment_id));
    formDataPayload.append('equipment_id', String(formData.equipment || 0));
    formDataPayload.append('created_by', String(userId));

    const userIdsString = formData.assignees.join(',');
    formDataPayload.append('user_ids', userIdsString);

    projectFiles.forEach((file) => {
      formDataPayload.append('files', file);
    });

    try {
      setLoading(true);

      const result: any = await postRequest(Api_url.createProject, formDataPayload, {});

      if (result?.status_code === 201 || result?.status === 200 || result?.project_id) {
        toast.success("Project created successfully!");
        onSave();
        onClose();
        setProjectFiles([]);
        setFormData({
          name: '',
          description: '',
          equipment: 0,
          riskAssessment: 'Low',
          assignees: [],
          searchQuery: '',
        });
      } else {
        console.error('Unexpected response:', result);
        alert('Project creation failed. Please try again.');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('An error occurred while creating the project.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssigneeToggle = (user: User) => {
    const id = String(user.user_id);
    setFormData((prev) => {
      const alreadySelected = prev.assignees.includes(id);
      const updatedAssignees = alreadySelected
        ? prev.assignees.filter((uid) => uid !== id)
        : [...prev.assignees, id];
      return { ...prev, assignees: updatedAssignees };
    });
  };

  const userOptions = users
    .filter(user =>
      user.user_id !== null &&
      user.roles?.[0]?.role_id !== 1
    )
    .map(user => ({
      value: String(user.user_id),
      label: user.user_name
    }));

  const handleRiskChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      riskAssessment: e.target.value as 'Low' | 'Medium' | 'High',
    }));
    // Do not close popup here - wait for submit
  };

  const handleRiskSubmit = () => {
    // Close the popup only after submit
    setShowRiskPopup(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create New Project</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter project name"
            />
            {errors.name && (
              <div className="flex items-center text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.name}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter project description"
            />
            {errors.description && (
              <div className="flex items-center text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.description}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Equipment *</label>
              <button
                type="button"
                onClick={() => setShowAddEquipment(!showAddEquipment)}
                className="text-blue-600 text-sm hover:underline"
              >
                {showAddEquipment ? 'Cancel' : '+ Add Equipment'}
              </button>
            </div>

            {showAddEquipment && (
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newEquipmentName}
                    onChange={(e) => setNewEquipmentName(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${errors.newEquipment ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter new equipment name"
                  />
                  <button
                    type="button"
                    onClick={handleAddEquipment}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                {errors.newEquipment && (
                  <div className="flex items-center text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.newEquipment}
                  </div>
                )}
              </div>
            )}

            <select
              value={formData.equipment}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, equipment: Number(e.target.value) }))
              }
              className={`block w-full border rounded-lg px-3 py-2 ${errors.equipment ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">Select Equipment</option>
              <optgroup label="✅ AI Verified Equipment">
                {equipments
                  .filter((equip) => equip.ai_verified_doc)
                  .map((equip) => (
                    <option key={equip.equipment_id} value={equip.equipment_id}>
                      {equip.equipment_name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="🆕 New Equipment">
                {equipments
                  .filter((equip) => !equip.ai_verified_doc)
                  .map((equip) => (
                    <option key={equip.equipment_id} value={equip.equipment_id}>
                      {equip.equipment_name}
                    </option>
                  ))}
              </optgroup>
            </select>
            {errors.equipment && (
              <div className="flex items-center text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.equipment}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Risk Assessment *</label>
            <div className="space-y-2">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setShowRiskPopup(true);
                }}
                className="text-blue-600 underline hover:text-blue-800"
              >
                Assess Risk
              </a>
              <span id="riskDisplay" className="block mb-2 text-gray-700">
                Current Risk: <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${formData.riskAssessment === 'Low'
                    ? 'bg-green-100 text-green-800'
                    : formData.riskAssessment === 'Medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                    }`}
                >
                  {formData.riskAssessment}
                </span>
              </span>
            </div>
          </div>

          {phases.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900">Required Phases</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {phases.map((phase) => (
                  <span key={phase.phase_id} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                    {phase.phase_name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Team Members *</label>
            <div className="relative">
              <div className="flex flex-wrap items-center w-full px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
                {formData.assignees.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {formData.assignees.map(assigneeId => {
                      const user = userOptions.find(option => option.value === assigneeId);
                      return user ? (
                        <div
                          key={user.value}
                          className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                        >
                          {user.label}
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                assignees: prev.assignees.filter(id => id !== user.value)
                              }));
                            }}
                            className="ml-1 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
                <input
                  type="text"
                  value={formData.searchQuery || ''}
                  onChange={(e) => {
                    const query = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      searchQuery: query
                    }));
                  }}
                  placeholder={formData.assignees.length === 0 ? "Search team members..." : ""}
                  className="flex-1 border-none outline-none"
                />
              </div>
              {formData.searchQuery && formData.searchQuery.length >= 2 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                  {userOptions
                    .filter(option =>
                      option.label.toLowerCase().includes(formData.searchQuery.toLowerCase())
                    )
                    .filter(option => !formData.assignees.includes(option.value))
                    .map(option => (
                      <div
                        key={option.value}
                        className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            assignees: [...prev.assignees, option.value],
                            searchQuery: ''
                          }));
                        }}
                      >
                        {option.label}
                      </div>
                    ))}
                  {userOptions.every(option =>
                    !option.label.toLowerCase().includes(formData.searchQuery.toLowerCase()) ||
                    formData.assignees.includes(option.value)
                  ) && (
                    <div className="px-3 py-2 text-gray-500">No matching users found</div>
                  )}
                </div>
              )}
            </div>
            {errors.assignees && (
              <div className="flex items-center text-red-600 text-sm mt-1">
                <AlertCircle className="w-4 h-4 mr-1" />
                {errors.assignees}
              </div>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload Project Files</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                id="fileUpload"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />
              <label htmlFor="fileUpload" className="flex flex-col items-center justify-center cursor-pointer">
                <svg
                  className="w-8 h-8 text-gray-500 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16v-4m0 0V8m0 4h10m-6 4l4-4m0 0l-4-4" />
                </svg>
                <span className="text-sm text-gray-600">Click or drag files to upload (PDF, DOC, TXT, PNG, JPG)</span>
              </label>
            </div>

            {projectFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {projectFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border border-gray-200 rounded-md bg-white shadow-sm"
                  >
                    <span className="truncate text-sm text-gray-700 font-bold w-5/6">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="w-8 h-6 bg-black text-white font-bold rounded-l-[4px] flex items-center justify-center hover:bg-red-700 transition"
                      title="Remove file"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Create Project</span>
            </button>
          </div>
        </form>

        {showRiskPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Risk Assessment</h3>
                <button
                  onClick={() => setShowRiskPopup(false)}
                  className="text-gray-800 hover:text-blue-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <table className="w-full mb-4">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="p-2">Select</th>
                    <th className="p-2">Classification</th>
                    <th className="p-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-red-100">
                    <td className="p-2 border">
                      <input
                        type="radio"
                        name="riskLevel"
                        value="High"
                        checked={formData.riskAssessment === 'High'}
                        onChange={handleRiskChange}
                      />
                    </td>
                    <td className="p-2 border">High Risk</td>
                    <td className="p-2 border">
                      Data generated or stored are of high importance to clinical operations or patient safety. Data corruption cannot be easily detected and/or are unrecoverable. The system operation and performance are of high importance to clinical operations or patient safety. Data loss, corruption or alteration, or poor system operation and performance may cause severe permanent injury or cause death.
                    </td>
                  </tr>
                  <tr className="bg-yellow-100">
                    <td className="p-2 border">
                      <input
                        type="radio"
                        name="riskLevel"
                        value="Medium"
                        checked={formData.riskAssessment === 'Medium'}
                        onChange={handleRiskChange}
                      />
                    </td>
                    <td className="p-2 border">Medium Risk</td>
                    <td className="p-2 border">
                      Data has a low likelihood of being lost, corrupted, or altered. Data corruption or loss is easily detected and can be recovered. System operation and performance may be important to clinical operations or patient safety. Issues with data integrity, or system operation and performance may cause minimal impact to patient safety.
                    </td>
                  </tr>
                  <tr className="bg-green-100">
                    <td className="p-2 border">
                      <input
                        type="radio"
                        name="riskLevel"
                        value="Low"
                        checked={formData.riskAssessment === 'Low'}
                        onChange={handleRiskChange}
                      />
                    </td>
                    <td className="p-2 border">Low Risk</td>
                    <td className="p-2 border">
                      Data is non-critical, or is not likely to be lost, corrupted, or altered. Data corruption or loss is easily detected and can be easily recovered. System operation or performance has no detectable impact to clinical operations or patient safety. Issues with data integrity, or system operation and performance have no impact on patient safety.
                    </td>
                  </tr>
                </tbody>
              </table>
              {formData.riskAssessment && formData.riskAssessment !== '' && (
                <div className="flex justify-end">
                  <button
                    onClick={handleRiskSubmit}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Submit
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProject;