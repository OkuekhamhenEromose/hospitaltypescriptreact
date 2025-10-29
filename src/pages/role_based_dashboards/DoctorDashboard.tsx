// components/dashboards/DoctorDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import { Users, FileText, Activity, Send } from "lucide-react";

interface Appointment {
  id: number;
  patient: any;
  name: string;
  age: number;
  sex: string;
  address: string;
  message: string;
  status: string;
  booked_at: string;
  medical_report?: any;
  vitals?: any;
  lab_results?: any[];
  test_requests?: any;
  vital_requests?: any;
}

const DoctorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showTestRequest, setShowTestRequest] = useState(false);
  const [showVitalRequest, setShowVitalRequest] = useState(false);
  const [showMedicalReport, setShowMedicalReport] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states - removed assigned_to fields since backend handles assignment
  const [testRequestData, setTestRequestData] = useState({
    tests: "",
    note: "",
  });
  const [vitalRequestData, setVitalRequestData] = useState({
    note: "",
  });
  const [medicalReportData, setMedicalReportData] = useState({
    medical_condition: "",
    drug_prescription: "",
    advice: "",
    next_appointment: "",
  });

  const testOptions = [
    "Glucose",
    "Blood Test",
    "Blood Count",
    "Urinalysis",
    "Electrolyte",
    "HIV",
    "Tumour Marker",
    "Protein",
    "Serum",
    "Lipid Panel",
    "Blood Lead",
  ];

  useEffect(() => {
    loadAppointments();
    // Refresh appointments every 30 seconds to get updates
    const interval = setInterval(() => {
      loadAppointments();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await apiService.getAppointments();
      console.log("Loaded appointments for doctor:", data); // Debug log
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      // Backend will automatically assign to available lab scientist
      await apiService.createTestRequest({
        appointment: selectedAppointment.id,
        tests: testRequestData.tests,
        note: testRequestData.note,
      });
      setShowTestRequest(false);
      setTestRequestData({ tests: "", note: "" });
      loadAppointments();
    } catch (error) {
      console.error("Failed to create test request:", error);
    }
  };

  const handleVitalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      // Backend will automatically assign to available nurse
      await apiService.createVitalRequest({
        appointment: selectedAppointment.id,
        note: vitalRequestData.note,
      });
      setShowVitalRequest(false);
      setVitalRequestData({ note: "" });
      loadAppointments();
    } catch (error) {
      console.error("Failed to create vital request:", error);
    }
  };

  const handleMedicalReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      await apiService.createMedicalReport({
        appointment: selectedAppointment.id,
        ...medicalReportData,
      });
      setShowMedicalReport(false);
      setMedicalReportData({
        medical_condition: "",
        drug_prescription: "",
        advice: "",
        next_appointment: "",
      });
      loadAppointments();
    } catch (error) {
      console.error("Failed to create medical report:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "IN_REVIEW":
        return "bg-blue-100 text-blue-800";
      case "AWAITING_RESULTS":
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
          Dr. {user?.profile?.fullname || user?.username}
        </h1>
        <p className="text-gray-600 mt-2">Doctor Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Appointments</h3>
              <p className="text-2xl font-bold">{appointments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">In Review</h3>
              <p className="text-2xl font-bold">
                {appointments.filter((a) => a.status === "IN_REVIEW").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Awaiting Results</h3>
              <p className="text-2xl font-bold">
                {
                  appointments.filter((a) => a.status === "AWAITING_RESULTS")
                    .length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Send className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Completed</h3>
              <p className="text-2xl font-bold">
                {appointments.filter((a) => a.status === "COMPLETED").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Patient Appointments</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {appointments.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No appointments assigned to you.
            </div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{appointment.name}</h3>
                    <p className="text-gray-600">
                      Age: {appointment.age} | Gender:{" "}
                      {appointment.sex === "M"
                        ? "Male"
                        : appointment.sex === "F"
                        ? "Female"
                        : "Other"}
                    </p>
                    <p className="text-gray-600 mt-1">{appointment.address}</p>
                    {appointment.message && (
                      <p className="text-gray-600 mt-1">
                        Message: {appointment.message}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Booked:{" "}
                      {new Date(appointment.booked_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.replace("_", " ")}
                    </span>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      {appointment.status !== "COMPLETED" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowTestRequest(true);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                          >
                            Request Tests
                          </button>
                          <button
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setShowVitalRequest(true);
                            }}
                            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                          >
                            Request Vitals
                          </button>
                          {(appointment.vitals ||
                            (appointment.lab_results &&
                              appointment.lab_results.length > 0)) && (
                            <button
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setShowMedicalReport(true);
                              }}
                              className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm hover:bg-purple-700"
                            >
                              Create Report
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Test Requests */}
                {appointment.test_requests && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800">
                      Test Requests
                    </h4>
                    <p>
                      <strong>Tests:</strong> {appointment.test_requests.tests}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      {appointment.test_requests.status}
                    </p>
                    {appointment.test_requests.note && (
                      <p>
                        <strong>Note:</strong> {appointment.test_requests.note}
                      </p>
                    )}
                  </div>
                )}

                {/* Vital Requests */}
                {appointment.vital_requests && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">
                      Vital Requests
                    </h4>
                    <p>
                      <strong>Status:</strong>{" "}
                      {appointment.vital_requests.status}
                    </p>
                    {appointment.vital_requests.note && (
                      <p>
                        <strong>Note:</strong> {appointment.vital_requests.note}
                      </p>
                    )}
                  </div>
                )}

                {/* Vitals */}
                {appointment.vitals && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">
                      Vital Signs
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                      <p>BP: {appointment.vitals.blood_pressure}</p>
                      <p>Pulse: {appointment.vitals.pulse_rate}</p>
                      <p>Temp: {appointment.vitals.body_temperature}°C</p>
                      <p>Respiration: {appointment.vitals.respiration_rate}</p>
                    </div>
                  </div>
                )}

                {/* Lab Results */}
                {appointment.lab_results &&
                  appointment.lab_results.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800">
                        Lab Results
                      </h4>
                      {appointment.lab_results.map((result, index) => (
                        <div key={index} className="mt-2">
                          <p>
                            <strong>{result.test_name}:</strong> {result.result}{" "}
                            {result.units}
                          </p>
                          {result.reference_range && (
                            <p className="text-sm text-gray-600">
                              Reference: {result.reference_range}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {/* Medical Report */}
                {appointment.medical_report && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-800">
                      Medical Report
                    </h4>
                    <p>
                      <strong>Condition:</strong>{" "}
                      {appointment.medical_report.medical_condition}
                    </p>
                    <p>
                      <strong>Prescription:</strong>{" "}
                      {appointment.medical_report.drug_prescription}
                    </p>
                    <p>
                      <strong>Advice:</strong>{" "}
                      {appointment.medical_report.advice}
                    </p>
                    {appointment.medical_report.next_appointment && (
                      <p>
                        <strong>Next Appointment:</strong>{" "}
                        {appointment.medical_report.next_appointment}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Test Request Modal */}
      {showTestRequest && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Request Lab Tests</h3>
            <form onSubmit={handleTestRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Tests
                </label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                  {testOptions.map((test) => (
                    <label key={test} className="flex items-center">
                      <input
                        type="checkbox"
                        value={test}
                        onChange={(e) => {
                          const selectedTests = testRequestData.tests
                            .split(",")
                            .filter((t) => t.trim())
                            .filter((t) => t !== test);

                          if (e.target.checked) {
                            selectedTests.push(test);
                          }

                          setTestRequestData({
                            ...testRequestData,
                            tests: selectedTests.join(", "),
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="ml-2 text-sm">{test}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note (Optional)
                </label>
                <textarea
                  value={testRequestData.note}
                  onChange={(e) =>
                    setTestRequestData({
                      ...testRequestData,
                      note: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTestRequest(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vital Request Modal */}
      {showVitalRequest && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Request Vital Signs</h3>
            <form onSubmit={handleVitalRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Note (Optional)
                </label>
                <textarea
                  value={vitalRequestData.note}
                  onChange={(e) =>
                    setVitalRequestData({
                      ...vitalRequestData,
                      note: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowVitalRequest(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medical Report Modal */}
      {showMedicalReport && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Create Medical Report
            </h3>
            <form onSubmit={handleMedicalReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Medical Condition/Diagnosis
                </label>
                <select
                  value={medicalReportData.medical_condition}
                  onChange={(e) =>
                    setMedicalReportData({
                      ...medicalReportData,
                      medical_condition: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Condition</option>
                  <option value="HIV">HIV</option>
                  <option value="Cancer">Cancer</option>
                  <option value="Kidney Stone">Kidney Stone</option>
                  <option value="Chronic Heart Failure">
                    Chronic Heart Failure
                  </option>
                  <option value="Leukaemia">Leukaemia</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Liver Disease">Liver Disease</option>
                  <option value="Tuberculosis">Tuberculosis</option>
                  <option value="Hernia">Hernia</option>
                  <option value="Hypertension">Hypertension</option>
                  <option value="Asthma">Asthma</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Drug Prescription
                </label>
                <textarea
                  value={medicalReportData.drug_prescription}
                  onChange={(e) =>
                    setMedicalReportData({
                      ...medicalReportData,
                      drug_prescription: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Prescribe medications and dosage..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Health Advice & Diet Recommendations
                </label>
                <textarea
                  value={medicalReportData.advice}
                  onChange={(e) =>
                    setMedicalReportData({
                      ...medicalReportData,
                      advice: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={4}
                  placeholder="Provide health advice, lifestyle changes, diet recommendations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Next Appointment (Optional)
                </label>
                <input
                  type="date"
                  value={medicalReportData.next_appointment}
                  onChange={(e) =>
                    setMedicalReportData({
                      ...medicalReportData,
                      next_appointment: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowMedicalReport(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Create Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
