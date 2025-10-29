// components/dashboards/NurseDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import { Activity, Clipboard, Users } from "lucide-react";

interface VitalRequest {
  id: number;
  appointment: {
    id: number;
    name: string;
    age: number;
    sex: string;
  };
  note: string;
  status: string;
  created_at: string;
}

const NurseDashboard: React.FC = () => {
  const { user } = useAuth();
  const [vitalRequests, setVitalRequests] = useState<VitalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VitalRequest | null>(
    null
  );
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vitalsData, setVitalsData] = useState({
    blood_pressure: "",
    respiration_rate: "",
    pulse_rate: "",
    body_temperature: "",
    height_cm: "",
    weight_kg: "",
  });

  useEffect(() => {
    loadVitalRequests();
  }, []);

  const loadVitalRequests = async () => {
    try {
      const data = await apiService.getVitalRequests();
      console.log("Loaded vital requests for nurse:", data);
      setVitalRequests(data);
    } catch (error) {
      console.error("Failed to load vital requests:", error);
    } finally {
      setLoading(false);
    }
  };

  // components/dashboards/NurseDashboard.tsx - Update handleSubmitVitals
  const handleSubmitVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await apiService.createVitals({
        vital_request: selectedRequest.id,
        ...vitalsData,
        respiration_rate: vitalsData.respiration_rate
          ? parseInt(vitalsData.respiration_rate)
          : null,
        pulse_rate: vitalsData.pulse_rate
          ? parseInt(vitalsData.pulse_rate)
          : null,
        body_temperature: vitalsData.body_temperature
          ? parseFloat(vitalsData.body_temperature)
          : null,
        height_cm: vitalsData.height_cm
          ? parseFloat(vitalsData.height_cm)
          : null,
        weight_kg: vitalsData.weight_kg
          ? parseFloat(vitalsData.weight_kg)
          : null,
      });

      setShowVitalsForm(false);
      setVitalsData({
        blood_pressure: "",
        respiration_rate: "",
        pulse_rate: "",
        body_temperature: "",
        height_cm: "",
        weight_kg: "",
      });

      // Refresh the list
      await loadVitalRequests();

      // Show success message
      alert("Vitals recorded successfully!");
    } catch (error) {
      console.error("Failed to submit vitals:", error);
      alert("Failed to record vitals. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800";
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800";
      case "PENDING":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Nurse {user?.profile?.fullname || user?.username}
        </h1>
        <p className="text-gray-600 mt-2">Nurse Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clipboard className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Requests</h3>
              <p className="text-2xl font-bold">{vitalRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Pending</h3>
              <p className="text-2xl font-bold">
                {vitalRequests.filter((r) => r.status === "PENDING").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Completed</h3>
              <p className="text-2xl font-bold">
                {vitalRequests.filter((r) => r.status === "DONE").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vital Requests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Vital Sign Requests</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {vitalRequests.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No vital sign requests assigned to you.
            </div>
          ) : (
            vitalRequests.map((request) => (
              <div key={request.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">
                      {request.appointment.name}
                    </h3>
                    <p className="text-gray-600">
                      Age: {request.appointment.age} | Gender:{" "}
                      {request.appointment.sex === "M" ? "Male" : "Female"}
                    </p>
                    {request.note && (
                      <p className="text-gray-600 mt-1">
                        Doctor's Note: {request.note}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Requested:{" "}
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {request.status.replace("_", " ")}
                    </span>

                    {request.status === "PENDING" && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowVitalsForm(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Record Vitals
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Vitals Form Modal */}
      {showVitalsForm && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Record Vital Signs for {selectedRequest.appointment.name}
            </h3>
            <form onSubmit={handleSubmitVitals} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Blood Pressure
                  </label>
                  <input
                    type="text"
                    value={vitalsData.blood_pressure}
                    onChange={(e) =>
                      setVitalsData({
                        ...vitalsData,
                        blood_pressure: e.target.value,
                      })
                    }
                    placeholder="e.g., 120/80"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Pulse Rate
                  </label>
                  <input
                    type="number"
                    value={vitalsData.pulse_rate}
                    onChange={(e) =>
                      setVitalsData({
                        ...vitalsData,
                        pulse_rate: e.target.value,
                      })
                    }
                    placeholder="bpm"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Respiration Rate
                  </label>
                  <input
                    type="number"
                    value={vitalsData.respiration_rate}
                    onChange={(e) =>
                      setVitalsData({
                        ...vitalsData,
                        respiration_rate: e.target.value,
                      })
                    }
                    placeholder="breaths/min"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Body Temperature
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsData.body_temperature}
                    onChange={(e) =>
                      setVitalsData({
                        ...vitalsData,
                        body_temperature: e.target.value,
                      })
                    }
                    placeholder="°C"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsData.height_cm}
                    onChange={(e) =>
                      setVitalsData({
                        ...vitalsData,
                        height_cm: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsData.weight_kg}
                    onChange={(e) =>
                      setVitalsData({
                        ...vitalsData,
                        weight_kg: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVitalsForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NurseDashboard;
