// components/dashboards/DoctorDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import {
  Users,
  FileText,
  Activity,
  // Send,
  Menu,
  // Home,
  // User,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

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
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "awaiting" | "in_review" | "completed"
  >("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showTestRequest, setShowTestRequest] = useState(false);
  const [showVitalRequest, setShowVitalRequest] = useState(false);
  const [showMedicalReport, setShowMedicalReport] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form states
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
  const getProfileImageUrl = (profile: any) => {
    if (!profile?.profile_pix) return null;

    if (profile.profile_pix.startsWith("http")) {
      return profile.profile_pix;
    }

    return `http://localhost:8000${profile.profile_pix}`;
  };

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

  const navigationItems = [
    {
      id: "all" as const,
      name: "All Appointments",
      icon: <Calendar className="w-5 h-5" />,
      color: "text-blue-600",
      count: appointments.length,
    },
    {
      id: "awaiting" as const,
      name: "Awaiting Results",
      icon: <Clock className="w-5 h-5" />,
      color: "text-yellow-600",
      count: appointments.filter((a) => a.status === "AWAITING_RESULTS").length,
    },
    {
      id: "in_review" as const,
      name: "In Review",
      icon: <Eye className="w-5 h-5" />,
      color: "text-blue-600",
      count: appointments.filter((a) => a.status === "IN_REVIEW").length,
    },
    {
      id: "completed" as const,
      name: "Completed",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-green-600",
      count: appointments.filter((a) => a.status === "COMPLETED").length,
    },
  ];

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(() => {
      loadAppointments();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeTab]);

  const loadAppointments = async () => {
    try {
      const data = await apiService.getAppointments();
      setAppointments(data);
    } catch (error) {
      console.error("Failed to load appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    switch (activeTab) {
      case "awaiting":
        setFilteredAppointments(
          appointments.filter((a) => a.status === "AWAITING_RESULTS")
        );
        break;
      case "in_review":
        setFilteredAppointments(
          appointments.filter((a) => a.status === "IN_REVIEW")
        );
        break;
      case "completed":
        setFilteredAppointments(
          appointments.filter((a) => a.status === "COMPLETED")
        );
        break;
      default:
        setFilteredAppointments(appointments);
    }
  };

  const handleTestRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Overlay for Mobile */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${sidebarOpen ? "w-64" : "w-20"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">MediCare</h1>
                  <p className="text-xs text-gray-500">Doctor Panel</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 hidden lg:block"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <div
                  className={`${
                    activeTab === item.id ? item.color : "text-gray-400"
                  }`}
                >
                  {item.icon}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex justify-between items-center">
                    <span>{item.name}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activeTab === item.id
                          ? "bg-blue-200 text-blue-800"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {item.count}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              {user?.profile?.profile_pix ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                  <img
                    src={getProfileImageUrl(user.profile)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    Dr.{" "}
                    {user?.profile?.fullname?.charAt(0) ||
                      user?.username?.charAt(0) ||
                      "D"}
                  </span>
                </div>
              )}
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Dr. {user?.profile?.fullname || user?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Doctor</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigationItems.find((item) => item.id === activeTab)?.name}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>

              {/* Notifications */}
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Messages */}
              <button className="p-2 rounded-lg hover:bg-gray-100 relative">
                <MessageSquare className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                {user?.profile?.profile_pix ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                    <img
                      src={getProfileImageUrl(user.profile)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      Dr.{" "}
                      {user?.profile?.fullname?.charAt(0) ||
                        user?.username?.charAt(0) ||
                        "D"}
                    </span>
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    Dr. {user?.profile?.fullname || user?.username}
                  </p>
                  <p className="text-xs text-gray-500">Doctor</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +{appointments.filter((a) => a.status === "PENDING").length}{" "}
                    new
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Appointments
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {appointments.length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">In Review</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {
                      appointments.filter((a) => a.status === "IN_REVIEW")
                        .length
                    }
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">
                    Awaiting Results
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {
                      appointments.filter(
                        (a) => a.status === "AWAITING_RESULTS"
                      ).length
                    }
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {
                      appointments.filter((a) => a.status === "COMPLETED")
                        .length
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Patient Appointments
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredAppointments.length} appointments
                    </p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredAppointments.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">No appointments found</p>
                    <p className="text-sm mt-1">
                      No appointments match the current filter.
                    </p>
                  </div>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      className="px-6 py-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {appointment.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {appointment.name}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                Age: {appointment.age} | Gender:{" "}
                                {appointment.sex === "M"
                                  ? "Male"
                                  : appointment.sex === "F"
                                  ? "Female"
                                  : "Other"}
                              </p>
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm">
                            {appointment.address}
                          </p>

                          {appointment.message && (
                            <p className="text-gray-600 text-sm mt-2">
                              <span className="font-medium">Message:</span>{" "}
                              {appointment.message}
                            </p>
                          )}

                          <p className="text-sm text-gray-500 mt-3">
                            Booked:{" "}
                            {new Date(appointment.booked_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>

                        <div className="flex flex-col items-end space-y-3">
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
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                  Request Tests
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowVitalRequest(true);
                                  }}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors shadow-sm"
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
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors shadow-sm"
                                  >
                                    Create Report
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Additional Information Sections */}
                      <div className="mt-4 space-y-3">
                        {/* Test Requests */}
                        {appointment.test_requests && (
                          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <h4 className="font-semibold text-blue-800 text-sm mb-2">
                              Test Requests
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <p>
                                <span className="font-medium">Tests:</span>{" "}
                                {appointment.test_requests.tests}
                              </p>
                              <p>
                                <span className="font-medium">Status:</span>{" "}
                                {appointment.test_requests.status}
                              </p>
                              {appointment.test_requests.note && (
                                <p>
                                  <span className="font-medium">Note:</span>{" "}
                                  {appointment.test_requests.note}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Vital Requests */}
                        {appointment.vital_requests && (
                          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                            <h4 className="font-semibold text-green-800 text-sm mb-2">
                              Vital Requests
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <p>
                                <span className="font-medium">Status:</span>{" "}
                                {appointment.vital_requests.status}
                              </p>
                              {appointment.vital_requests.note && (
                                <p>
                                  <span className="font-medium">Note:</span>{" "}
                                  {appointment.vital_requests.note}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Vitals */}
                        {appointment.vitals && (
                          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                            <h4 className="font-semibold text-emerald-800 text-sm mb-2">
                              Vital Signs
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <p>
                                <span className="font-medium">BP:</span>{" "}
                                {appointment.vitals.blood_pressure}
                              </p>
                              <p>
                                <span className="font-medium">Pulse:</span>{" "}
                                {appointment.vitals.pulse_rate}
                              </p>
                              <p>
                                <span className="font-medium">Temp:</span>{" "}
                                {appointment.vitals.body_temperature}°C
                              </p>
                              <p>
                                <span className="font-medium">
                                  Respiration:
                                </span>{" "}
                                {appointment.vitals.respiration_rate}
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Lab Results */}
                        {appointment.lab_results &&
                          appointment.lab_results.length > 0 && (
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                              <h4 className="font-semibold text-purple-800 text-sm mb-2">
                                Lab Results
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {appointment.lab_results.map(
                                  (result, index) => (
                                    <div key={index} className="text-sm">
                                      <p className="font-medium text-purple-700">
                                        {result.test_name}
                                      </p>
                                      <p>
                                        <span className="font-medium">
                                          Result:
                                        </span>{" "}
                                        {result.result} {result.units}
                                      </p>
                                      {result.reference_range && (
                                        <p className="text-gray-600">
                                          Reference: {result.reference_range}
                                        </p>
                                      )}
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Medical Report */}
                        {appointment.medical_report && (
                          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                            <h4 className="font-semibold text-green-800 text-sm mb-2">
                              Medical Report
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-green-700">
                                  Condition
                                </p>
                                <p>
                                  {appointment.medical_report.medical_condition}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-green-700">
                                  Prescription
                                </p>
                                <p>
                                  {appointment.medical_report.drug_prescription}
                                </p>
                              </div>
                              <div>
                                <p className="font-medium text-green-700">
                                  Advice
                                </p>
                                <p>{appointment.medical_report.advice}</p>
                              </div>
                              {appointment.medical_report.next_appointment && (
                                <div>
                                  <p className="font-medium text-green-700">
                                    Next Appointment
                                  </p>
                                  <p>
                                    {
                                      appointment.medical_report
                                        .next_appointment
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals (keep existing modal code from original DoctorDashboard) */}
      {showTestRequest && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Request Lab Tests</h3>
            <form onSubmit={handleTestRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Tests
                </label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {testOptions.map((test) => (
                    <label
                      key={test}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                    >
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{test}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowTestRequest(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Request Vital Signs</h3>
            <form onSubmit={handleVitalRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVitalRequest(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
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
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              Create Medical Report
            </h3>
            <form onSubmit={handleMedicalReport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={3}
                  placeholder="Prescribe medications and dosage..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  rows={4}
                  placeholder="Provide health advice, lifestyle changes, diet recommendations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowMedicalReport(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
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
