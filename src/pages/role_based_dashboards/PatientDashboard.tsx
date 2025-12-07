// components/dashboards/PatientDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import {
  Calendar,
  FileText,
  Download,
  Menu,
  Home,
  History,
  Search,
  Bell,
  ChevronDown,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Filter,
  User,
  Activity,
  Shield,
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
  doctor?: any;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    sex: "M",
    address: "",
    message: "",
  });

  const getProfileImageUrl = (profile: any) => {
    if (!profile?.profile_pix) return null;
    if (profile.profile_pix.startsWith("http")) return profile.profile_pix;
    return `http://localhost:8000${profile.profile_pix}`;
  };

  const getPatientName = (appointment: Appointment) => {
    return appointment.name || user?.profile?.fullname || "Patient";
  };

  const getPatientInitial = (appointment: Appointment) => {
    const name = getPatientName(appointment);
    return name.charAt(0).toUpperCase();
  };

  const navigationItems = [
    {
      id: "all" as const,
      name: "Overview",
      icon: <Home className="w-4 h-4 md:w-5 md:h-5" />,
      color: "text-blue-600",
    },
    {
      id: "book" as const,
      name: "Book Appointment",
      icon: <Plus className="w-4 h-4 md:w-5 md:h-5" />,
      color: "text-green-600",
    },
    {
      id: "reports" as const,
      name: "Medical Reports",
      icon: <FileText className="w-4 h-4 md:w-5 md:h-5" />,
      color: "text-purple-600",
      count: appointments.filter((a) => a.medical_report).length,
    },
    {
      id: "appointments" as const,
      name: "My Appointments",
      icon: <History className="w-4 h-4 md:w-5 md:h-5" />,
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
  }, [appointments, activeTab, statusFilter, searchQuery]);

  const loadAppointments = async () => {
    try {
      const data = await apiService.getAppointments();
      setAppointments(data || []);
    } catch (error) {
      console.error("Failed to load appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;
    
    if (activeTab === "reports") {
      filtered = filtered.filter((a) => a.medical_report);
    } else if (activeTab === "appointments") {
      filtered = filtered;
    } else {
      filtered = [];
    }
    
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appointment => 
        getPatientName(appointment).toLowerCase().includes(query) ||
        (appointment.message && appointment.message.toLowerCase().includes(query)) ||
        (appointment.medical_report?.medical_condition && 
         appointment.medical_report.medical_condition.toLowerCase().includes(query))
      );
    }
    
    setFilteredAppointments(filtered);
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const appointmentData = {
        name: formData.name || user?.profile?.fullname || user?.username || "Patient",
        age: parseInt(formData.age),
        sex: formData.sex,
        address: formData.address,
        message: formData.message || "",
      };

      await apiService.createAppointment(appointmentData);
      setShowAppointmentForm(false);
      setFormData({ name: "", age: "", sex: "M", address: "", message: "" });
      await loadAppointments();
      alert("Appointment booked successfully!");
    } catch (error) {
      console.error("Failed to create appointment:", error);
      alert("Failed to create appointment. Please check your data and try again.");
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
        return <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />;
      case "IN_REVIEW":
        return <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-blue-600" />;
      case "AWAITING_RESULTS":
        return <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-600" />;
      case "PENDING":
        return <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />;
      default:
        return <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />;
    }
  };

  const downloadMedicalReport = (appointment: Appointment) => {
    if (!appointment.medical_report) return;

    const report = appointment.medical_report;
    const content = `MEDICAL REPORT\n==============\n\nPatient: ${getPatientName(appointment)}\nAge: ${appointment.age} | Gender: ${appointment.sex === "M" ? "Male" : "Female"}\nDate: ${new Date().toLocaleDateString()}\n\nDIAGNOSIS\n--------\n${report.medical_condition}\n\nPRESCRIPTION\n------------\n${report.drug_prescription || "No prescription"}\n\nMEDICAL ADVICE\n--------------\n${report.advice || "No specific advice"}\n\n${report.next_appointment ? `Next Appointment: ${report.next_appointment}` : ""}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medical-report-${getPatientName(appointment)}-${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading patient dashboard...</p>
        </div>
      </div>
    );
  }
  const recentAppointments = appointments.slice(0, 3);

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
          <div className="flex items-center justify-between p-4 md:p-6 border-b">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">MediCare</h1>
                  <p className="text-xs text-gray-500">Patient Panel</p>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100 hidden lg:block"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2 md:p-4 space-y-2">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-3 py-2.5 md:px-4 md:py-3 rounded-xl transition-all duration-200 font-medium
                  ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <div className={`${activeTab === item.id ? item.color : "text-gray-400"}`}>
                  {item.icon}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm md:text-base">{item.name}</span>
                    {item.count !== undefined && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activeTab === item.id ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-600"
                      }`}>
                        {item.count}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-3 md:p-4 border-t">
            <div className="flex items-center space-x-3 p-2 md:p-3 rounded-lg bg-gray-50">
              {user?.profile?.profile_pix ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 flex-shrink-0">
                  <img
                    src={getProfileImageUrl(user.profile)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {user?.profile?.fullname?.charAt(0) || user?.username?.charAt(0) || "P"}
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
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
            <div className="flex items-center space-x-3 md:space-x-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-1.5 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {navigationItems.find((item) => item.id === activeTab)?.name}
              </h1>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              {/* Mobile Search */}
              <div className="relative md:hidden">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-36"
                />
              </div>

              {/* Desktop Search */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48 lg:w-64"
                />
              </div>

              {/* Notifications */}
              <button className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 relative">
                <Bell className="w-4 md:w-5 h-4 md:h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu (Mobile) */}
              <div className="md:hidden">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300">
                  {user?.profile?.profile_pix ? (
                    <img
                      src={getProfileImageUrl(user.profile)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user?.profile?.fullname?.charAt(0) || user?.username?.charAt(0) || "P"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* User Menu (Desktop) */}
              <div className="hidden md:flex items-center space-x-3">
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
                      {user?.profile?.fullname?.charAt(0) || user?.username?.charAt(0) || "P"}
                    </span>
                  </div>
                )}
                <div>
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
          <div className="p-3 md:p-4 lg:p-6">
            {activeTab === "all" && (
              <div className="space-y-6">
                {/* Welcome Card */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl md:text-2xl font-bold mb-2">
                        Welcome back, {user?.profile?.fullname || user?.username || "Patient"}!
                      </h2>
                      <p className="text-blue-100 text-sm md:text-base">
                        Track your health journey and manage appointments in one place.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowAppointmentForm(true)}
                      className="bg-white text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors shadow-sm flex items-center justify-center space-x-2 text-sm md:text-base font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Book Appointment</span>
                    </button>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
                  <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                        <Plus className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                      </div>
                      <span className="text-xs md:text-sm font-medium text-green-600 bg-green-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                        Quick Book
                      </span>
                    </div>
                    <div className="mt-3 md:mt-4">
                      <p className="text-xs md:text-sm font-medium text-gray-600">
                        Book Appointment
                      </p>
                      <button
                        onClick={() => setShowAppointmentForm(true)}
                        className="mt-2 bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-xs md:text-sm"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                      </div>
                    </div>
                    <div className="mt-3 md:mt-4">
                      <p className="text-xs md:text-sm font-medium text-gray-600">
                        Medical Reports
                      </p>
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                        {appointments.filter((a) => a.medical_report).length}
                      </p>
                      <p className="text-gray-600 text-xs md:text-sm">Available reports</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow col-span-2 lg:col-span-1">
                    <div className="flex items-center justify-between">
                      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                        <History className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                      </div>
                    </div>
                    <div className="mt-3 md:mt-4">
                      <p className="text-xs md:text-sm font-medium text-gray-600">
                        Total Appointments
                      </p>
                      <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                        {appointments.length}
                      </p>
                      <p className="text-gray-600 text-xs md:text-sm">All visits</p>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {/* Recent Appointments */}
                  <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          Recent Appointments
                        </h3>
                        <button 
                          onClick={() => setActiveTab("appointments")}
                          className="text-blue-600 hover:text-blue-700 text-xs md:text-sm font-medium"
                        >
                          View All
                        </button>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                      {recentAppointments.length === 0 ? (
                        <div className="px-4 py-6 md:px-6 md:py-8 text-center text-gray-500">
                          <Calendar className="w-8 h-8 md:w-10 md:h-10 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm md:text-base font-medium">No appointments yet</p>
                          <p className="text-xs md:text-sm mt-1">Book your first appointment to get started</p>
                        </div>
                      ) : (
                        recentAppointments.map((appointment) => (
                          <div key={appointment.id} className="px-4 py-3 md:px-6 md:py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 md:space-x-3">
                                  <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-xs md:text-sm font-medium">
                                      {getPatientInitial(appointment)}
                                    </span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                                      {getPatientName(appointment)}
                                    </p>
                                    <p className="text-gray-600 text-xs md:text-sm">
                                      {new Date(appointment.booked_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(appointment.status)}
                                <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(appointment.status)}`}>
                                  {appointment.status.replace("_", " ")}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Health Summary */}
                  <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
                      <h3 className="text-base md:text-lg font-semibold text-gray-900">
                        Health Summary
                      </h3>
                    </div>
                    <div className="p-4 md:p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Activity className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs md:text-sm font-medium text-gray-700">Vitals Recorded</p>
                              <p className="text-lg md:text-xl font-bold text-gray-900">
                                {appointments.filter(a => a.vitals).length}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs md:text-sm font-medium text-gray-700">Lab Tests Done</p>
                              <p className="text-lg md:text-xl font-bold text-gray-900">
                                {appointments.reduce((acc, a) => acc + (a.lab_results?.length || 0), 0)}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Shield className="w-4 h-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-xs md:text-sm font-medium text-gray-700">Active Prescriptions</p>
                              <p className="text-lg md:text-xl font-bold text-gray-900">
                                {appointments.filter(a => a.medical_report?.drug_prescription).length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <p className="text-xs md:text-sm text-gray-600 mb-2">Need medical attention?</p>
                          <button
                            onClick={() => setShowAppointmentForm(true)}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                          >
                            Book Emergency Appointment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "book" && (
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <Calendar className="w-6 h-6 md:w-8 md:h-8 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                    Book New Appointment
                  </h2>
                  <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
                    Schedule your medical appointment with our healthcare professionals
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-6">
                    <button
                      onClick={() => setShowAppointmentForm(true)}
                      className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors shadow-sm flex flex-col items-center justify-center space-y-2"
                    >
                      <Plus className="w-5 h-5 md:w-6 md:h-6" />
                      <div>
                        <p className="font-medium text-sm md:text-base">Regular Checkup</p>
                        <p className="text-green-100 text-xs md:text-sm">Book with any doctor</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setShowAppointmentForm(true)}
                      className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors shadow-sm flex flex-col items-center justify-center space-y-2"
                    >
                      <AlertCircle className="w-5 h-5 md:w-6 md:h-6" />
                      <div>
                        <p className="font-medium text-sm md:text-base">Emergency</p>
                        <p className="text-red-100 text-xs md:text-sm">Immediate attention</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-4 md:space-y-6">
                {/* Reports Header */}
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                          Medical Reports
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                          {filteredAppointments.length} reports available
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Filter className="w-3 h-3 md:w-4 md:h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <select 
                            className="pl-8 pr-3 py-1.5 md:pl-10 md:pr-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-xs md:text-sm bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="all">All Status</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="IN_REVIEW">In Review</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filteredAppointments.length === 0 ? (
                      <div className="px-4 py-8 md:px-6 md:py-12 text-center text-gray-500">
                        <FileText className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                        <p className="text-base md:text-lg font-medium">
                          No medical reports found
                        </p>
                        <p className="text-xs md:text-sm mt-1 max-w-md mx-auto">
                          {searchQuery.trim() 
                            ? `No reports match "${searchQuery}"`
                            : "Your medical reports will appear here after completed appointments."}
                        </p>
                        {searchQuery.trim() && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-3 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="px-4 py-4 md:px-6 md:py-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start space-x-3 mb-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs md:text-sm font-medium">
                                    {getPatientInitial(appointment)}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-1">
                                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                                      {getPatientName(appointment)}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-1 md:mt-0">
                                      <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
                                      <span className="bg-green-100 text-green-800 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium border border-green-200">
                                        COMPLETED
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-gray-600 text-xs md:text-sm">
                                    Age: {appointment.age} • Gender:{" "}
                                    {appointment.sex === "M" ? "Male" : "Female"} • Date:{" "}
                                    {new Date(appointment.booked_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              {/* Medical Report Details */}
                              {appointment.medical_report && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-3 md:p-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                    <div>
                                      <p className="font-medium text-green-800 text-xs md:text-sm mb-1">
                                        Diagnosis
                                      </p>
                                      <p className="text-gray-900 bg-white p-2 md:p-3 rounded-lg border border-green-100 text-xs md:text-sm">
                                        {appointment.medical_report.medical_condition}
                                      </p>
                                    </div>
                                    {appointment.medical_report.drug_prescription && (
                                      <div>
                                        <p className="font-medium text-green-800 text-xs md:text-sm mb-1">
                                          Prescription
                                        </p>
                                        <p className="text-gray-900 bg-white p-2 md:p-3 rounded-lg border border-green-100 text-xs md:text-sm">
                                          {appointment.medical_report.drug_prescription}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  {appointment.medical_report.advice && (
                                    <div className="mt-3 md:mt-4">
                                      <p className="font-medium text-green-800 text-xs md:text-sm mb-1">
                                        Medical Advice
                                      </p>
                                      <p className="text-gray-900 bg-white p-2 md:p-3 rounded-lg border border-green-100 text-xs md:text-sm">
                                        {appointment.medical_report.advice}
                                      </p>
                                    </div>
                                  )}
                                  {appointment.medical_report.next_appointment && (
                                    <div className="mt-3 md:mt-4">
                                      <p className="font-medium text-green-800 text-xs md:text-sm mb-1">
                                        Next Appointment
                                      </p>
                                      <p className="text-gray-900 bg-white p-2 md:p-3 rounded-lg border border-green-100 text-xs md:text-sm">
                                        {appointment.medical_report.next_appointment}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-3">
                              <button
                                onClick={() => downloadMedicalReport(appointment)}
                                className="flex items-center justify-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-xs md:text-sm"
                              >
                                <Download className="w-3 h-3 md:w-4 md:h-4" />
                                <span>Download Report</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appointments" && (
              <div className="space-y-4 md:space-y-6">
                {/* Appointments Header */}
                <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                          My Appointments
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 mt-1">
                          {filteredAppointments.length} total appointments
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="relative">
                          <Filter className="w-3 h-3 md:w-4 md:h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <select 
                            className="pl-8 pr-3 py-1.5 md:pl-10 md:pr-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs md:text-sm bg-white"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                          >
                            <option value="all">All Status</option>
                            <option value="PENDING">Pending</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="AWAITING_RESULTS">Awaiting Results</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>
                        <button
                          onClick={() => setShowAppointmentForm(true)}
                          className="bg-green-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center space-x-1.5 text-xs md:text-sm"
                        >
                          <Plus className="w-3 h-3 md:w-4 md:h-4" />
                          <span>New</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {filteredAppointments.length === 0 ? (
                      <div className="px-4 py-8 md:px-6 md:py-12 text-center text-gray-500">
                        <Calendar className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                        <p className="text-base md:text-lg font-medium">
                          No appointments found
                        </p>
                        <p className="text-xs md:text-sm mt-1 max-w-md mx-auto">
                          {searchQuery.trim() 
                            ? `No appointments match "${searchQuery}"`
                            : "Book your first appointment to get started."}
                        </p>
                        {searchQuery.trim() && (
                          <button
                            onClick={() => setSearchQuery("")}
                            className="mt-3 px-3 py-1.5 text-sm text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            Clear search
                          </button>
                        )}
                        <button
                          onClick={() => setShowAppointmentForm(true)}
                          className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          Book Appointment
                        </button>
                      </div>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <div
                          key={appointment.id}
                          className="px-4 py-4 md:px-6 md:py-6 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                            <div className="flex-1">
                              <div className="flex items-start space-x-3 mb-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-white text-xs md:text-sm font-medium">
                                    {getPatientInitial(appointment)}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-1">
                                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                                      {getPatientName(appointment)}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-1 md:mt-0">
                                      {getStatusIcon(appointment.status)}
                                      <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(appointment.status)}`}>
                                        {appointment.status.replace("_", " ")}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-gray-600 text-xs md:text-sm">
                                    Age: {appointment.age} • Gender:{" "}
                                    {appointment.sex === "M" ? "Male" : "Female"} • ID: {appointment.id}
                                  </p>
                                  {appointment.doctor && (
                                    <p className="text-gray-600 text-xs md:text-sm mt-1">
                                      Doctor: {appointment.doctor.fullname}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-3">
                                <div>
                                  <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">
                                    Address
                                  </p>
                                  <p className="text-xs md:text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                    {appointment.address}
                                  </p>
                                </div>

                                {appointment.message && (
                                  <div>
                                    <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">
                                      Message
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600 bg-gray-50 p-2 rounded-lg">
                                      {appointment.message}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <p className="text-xs text-gray-500">
                                Booked:{" "}
                                {new Date(appointment.booked_at).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-3">
                              {appointment.status === "COMPLETED" && appointment.medical_report && (
                                <button
                                  onClick={() => downloadMedicalReport(appointment)}
                                  className="flex items-center justify-center space-x-1.5 px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-xs md:text-sm"
                                >
                                  <Download className="w-3 h-3 md:w-4 md:h-4" />
                                  <span>Download Report</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Status Message */}
                          {appointment.status !== "COMPLETED" && (
                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                              <p className="text-yellow-800 text-xs md:text-sm">
                                <strong>Status:</strong> {appointment.status.replace("_", " ")} - Your appointment is being processed.
                                {appointment.status === "IN_REVIEW" && " Doctor is reviewing your results."}
                                {appointment.status === "AWAITING_RESULTS" && " Waiting for test results."}
                                {appointment.status === "PENDING" && " Waiting for doctor assignment."}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-50">
          <div className="bg-white rounded-xl md:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Book New Appointment
              </h3>
              <button
                onClick={() => setShowAppointmentForm(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <form onSubmit={handleSubmitAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || user?.profile?.fullname || user?.username || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
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
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    placeholder="Enter your age"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
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
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
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
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    rows={3}
                    placeholder="Describe your symptoms or any message for the doctor"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAppointmentForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;