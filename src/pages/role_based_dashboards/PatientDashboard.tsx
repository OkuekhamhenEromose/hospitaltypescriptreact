// components/dashboards/PatientDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import {
  Calendar,
  FileText,
  // Activity,
  Download,
  Menu,
  Home,
  // User,
  History,
  Search,
  Bell,
  MessageSquare,
  ChevronDown,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface Appointment {
  id: number;
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
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);
  const [activeTab, setActiveTab] = useState<
    "all" | "book" | "reports" | "appointments"
  >("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "M",
    address: "",
    message: "",
  });

  // Helper function to get profile image URL
  const getProfileImageUrl = (profile: any) => {
    if (!profile?.profile_pix) return null;

    if (profile.profile_pix.startsWith("http")) {
      return profile.profile_pix;
    }

    return `http://localhost:8000${profile.profile_pix}`;
  };

  // Safe navigation functions
  const getPatientName = (appointment: Appointment) => {
    return appointment.name || "Unknown Patient";
  };

  const getPatientInitial = (appointment: Appointment) => {
    const name = getPatientName(appointment);
    return name.charAt(0).toUpperCase();
  };

  const navigationItems = [
    {
      id: "all" as const,
      name: "Dashboard Overview",
      icon: <Home className="w-5 h-5" />,
      color: "text-blue-600",
    },
    {
      id: "book" as const,
      name: "Book Appointment",
      icon: <Plus className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      id: "reports" as const,
      name: "Medical Reports",
      icon: <FileText className="w-5 h-5" />,
      color: "text-purple-600",
      count: appointments.filter((a) => a.medical_report).length,
    },
    {
      id: "appointments" as const,
      name: "My Appointments",
      icon: <History className="w-5 h-5" />,
      color: "text-orange-600",
      count: appointments.length,
    },
  ];

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(() => {
      loadAppointments();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeTab]);

  const loadAppointments = async () => {
    try {
      const data = await apiService.getAppointments();
      console.log("Loaded appointments for patient:", data);
      setAppointments(data || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    switch (activeTab) {
      case "reports":
        setFilteredAppointments(appointments.filter((a) => a.medical_report));
        break;
      case "appointments":
        setFilteredAppointments(appointments);
        break;
      default:
        setFilteredAppointments([]);
    }
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const appointmentData = {
        name: formData.name,
        age: parseInt(formData.age),
        sex: formData.sex,
        address: formData.address,
        message: formData.message || "",
      };

      console.log("Sending appointment data:", appointmentData);

      await apiService.createAppointment(appointmentData);
      setShowAppointmentForm(false);
      setFormData({ name: "", age: "", sex: "M", address: "", message: "" });

      await loadAppointments();
      alert("Appointment booked successfully!");
    } catch (error) {
      console.error("Failed to create appointment:", error);
      alert(
        "Failed to create appointment. Please check your data and try again."
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border border-green-200";
      case "IN_REVIEW":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "AWAITING_RESULTS":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "PENDING":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "IN_REVIEW":
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      case "AWAITING_RESULTS":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const downloadMedicalReport = (appointment: Appointment) => {
    if (!appointment.medical_report) return;

    const report = appointment.medical_report;
    const content = `
      MEDICAL REPORT
      ==============
      
      Patient: ${getPatientName(appointment)}
      Age: ${appointment.age} | Gender: ${
      appointment.sex === "M" ? "Male" : "Female"
    }
      Date: ${new Date().toLocaleDateString()}
      
      DIAGNOSIS
      ---------
      ${report.medical_condition}
      
      PRESCRIPTION
      ------------
      ${report.drug_prescription || "No prescription"}
      
      MEDICAL ADVICE
      --------------
      ${report.advice || "No specific advice"}
      
      ${
        report.next_appointment
          ? `Next Appointment: ${report.next_appointment}`
          : ""
      }
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical-report-${getPatientName(appointment)}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const completedAppointments = appointments.filter(
    (a) => a.status === "COMPLETED"
  );
  const pendingAppointments = appointments.filter(
    (a) => a.status !== "COMPLETED"
  );

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
                  <p className="text-xs text-gray-500">Patient Panel</p>
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
                    {item.count !== undefined && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activeTab === item.id
                            ? "bg-blue-200 text-blue-800"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
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
                    {user?.profile?.fullname?.charAt(0) ||
                      user?.username?.charAt(0) ||
                      "P"}
                  </span>
                </div>
              )}
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.profile?.fullname || user?.username || "Patient"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Patient</p>
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
                      {user?.profile?.fullname?.charAt(0) ||
                        user?.username?.charAt(0) ||
                        "P"}
                    </span>
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.profile?.fullname || user?.username || "Patient"}
                  </p>
                  <p className="text-xs text-gray-500">Patient</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {activeTab === "all" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                        <Plus className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                        Quick Book
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600">
                        Book Appointment
                      </p>
                      <button
                        onClick={() => setShowAppointmentForm(true)}
                        className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                        <FileText className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600">
                        Medical Reports
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {appointments.filter((a) => a.medical_report).length}
                      </p>
                      <p className="text-gray-600 text-sm">Available reports</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                        <History className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-600">
                        Total Appointments
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">
                        {appointments.length}
                      </p>
                      <p className="text-gray-600 text-sm">All visits</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Pending Appointments */}
                  {pendingAppointments.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-yellow-50 to-orange-50">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pending Appointments
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {pendingAppointments.slice(0, 3).map((appointment) => (
                          <div key={appointment.id} className="px-6 py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">
                                  {getPatientName(appointment)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(
                                    appointment.booked_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(appointment.status)}
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    appointment.status
                                  )}`}
                                >
                                  {appointment.status.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Reports */}
                  {completedAppointments.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Recent Reports
                        </h3>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {completedAppointments
                          .slice(0, 3)
                          .map((appointment) => (
                            <div key={appointment.id} className="px-6 py-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {getPatientName(appointment)}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {
                                      appointment.medical_report
                                        ?.medical_condition
                                    }
                                  </p>
                                </div>
                                <button
                                  onClick={() =>
                                    downloadMedicalReport(appointment)
                                  }
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "book" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Book New Appointment
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Schedule your medical appointment with our healthcare
                    professionals
                  </p>
                  <button
                    onClick={() => setShowAppointmentForm(true)}
                    className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Book Appointment</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Medical Reports
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredAppointments.length} reports available
                    </p>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filteredAppointments.length === 0 ? (
                      <div className="px-6 py-12 text-center text-gray-500">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium">
                          No medical reports found
                        </p>
                        <p className="text-sm mt-1">
                          Your medical reports will appear here after completed
                          appointments.
                        </p>
                      </div>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="px-6 py-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {getPatientInitial(appointment)}
                                </span>
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {getPatientName(appointment)}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  Age: {appointment.age} | Gender:{" "}
                                  {appointment.sex === "M" ? "Male" : "Female"}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                                COMPLETED
                              </span>
                              <button
                                onClick={() =>
                                  downloadMedicalReport(appointment)
                                }
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                              >
                                <Download className="w-4 h-4" />
                                <span>Download</span>
                              </button>
                            </div>
                          </div>

                          {/* Medical Report Details */}
                          {appointment.medical_report && (
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <p className="font-medium text-green-800 text-sm">
                                    Diagnosis
                                  </p>
                                  <p className="text-gray-900 bg-white p-3 rounded-lg border border-green-100 mt-1">
                                    {
                                      appointment.medical_report
                                        .medical_condition
                                    }
                                  </p>
                                </div>
                                {appointment.medical_report
                                  .drug_prescription && (
                                  <div>
                                    <p className="font-medium text-green-800 text-sm">
                                      Prescription
                                    </p>
                                    <p className="text-gray-900 bg-white p-3 rounded-lg border border-green-100 mt-1">
                                      {
                                        appointment.medical_report
                                          .drug_prescription
                                      }
                                    </p>
                                  </div>
                                )}
                              </div>
                              {appointment.medical_report.advice && (
                                <div className="mt-4">
                                  <p className="font-medium text-green-800 text-sm">
                                    Medical Advice
                                  </p>
                                  <p className="text-gray-900 bg-white p-3 rounded-lg border border-green-100 mt-1">
                                    {appointment.medical_report.advice}
                                  </p>
                                </div>
                              )}
                              {appointment.medical_report.next_appointment && (
                                <div className="mt-4">
                                  <p className="font-medium text-green-800 text-sm">
                                    Next Appointment
                                  </p>
                                  <p className="text-gray-900 bg-white p-3 rounded-lg border border-green-100 mt-1">
                                    {
                                      appointment.medical_report
                                        .next_appointment
                                    }
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                    <h3 className="text-xl font-semibold text-gray-900">
                      My Appointments
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredAppointments.length} total appointments
                    </p>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filteredAppointments.length === 0 ? (
                      <div className="px-6 py-12 text-center text-gray-500">
                        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-medium">
                          No appointments found
                        </p>
                        <p className="text-sm mt-1">
                          Book your first appointment to get started.
                        </p>
                        <button
                          onClick={() => setShowAppointmentForm(true)}
                          className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Book Appointment
                        </button>
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
                                    {getPatientInitial(appointment)}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">
                                    {getPatientName(appointment)}
                                  </h3>
                                  <p className="text-gray-600 text-sm">
                                    Age: {appointment.age} | Gender:{" "}
                                    {appointment.sex === "M"
                                      ? "Male"
                                      : "Female"}
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
                                {new Date(
                                  appointment.booked_at
                                ).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>

                            <div className="flex flex-col items-end space-y-2">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(appointment.status)}
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                    appointment.status
                                  )}`}
                                >
                                  {appointment.status.replace("_", " ")}
                                </span>
                              </div>

                              {appointment.status === "COMPLETED" &&
                                appointment.medical_report && (
                                  <button
                                    onClick={() =>
                                      downloadMedicalReport(appointment)
                                    }
                                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                                  >
                                    <Download className="w-4 h-4" />
                                    <span>Download Report</span>
                                  </button>
                                )}
                            </div>
                          </div>

                          {/* Status Message */}
                          {appointment.status !== "COMPLETED" && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-yellow-800 text-sm">
                                <strong>Status:</strong>{" "}
                                {appointment.status.replace("_", " ")} - Your
                                appointment is being processed.
                                {appointment.status === "IN_REVIEW" &&
                                  " Doctor is reviewing your results."}
                                {appointment.status === "AWAITING_RESULTS" &&
                                  " Waiting for test results."}
                                {appointment.status === "PENDING" &&
                                  " Waiting for doctor assignment."}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Book New Appointment
              </h3>
              <button
                onClick={() => setShowAppointmentForm(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <ChevronDown className="w-5 h-5 text-gray-500 transform rotate-90" />
              </button>
            </div>

            <form onSubmit={handleSubmitAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={formData.sex}
                  onChange={(e) =>
                    setFormData({ ...formData, sex: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Enter your complete address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms/Message (Optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Describe your symptoms or any message for the doctor"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAppointmentForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
