// components/dashboards/DoctorDashboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import {
  Users,
  FileText,
  Activity,
  Menu,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  Search,
  Bell,
  ChevronDown,
  X,
  Filter,
  Stethoscope,
  Heart,
  Thermometer,
  Beaker,
  Download,
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
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "awaiting" | "in_review" | "completed">("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showTestRequest, setShowTestRequest] = useState(false);
  const [showVitalRequest, setShowVitalRequest] = useState(false);
  const [showMedicalReport, setShowMedicalReport] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

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

  // Check screen size for responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getProfileImageUrl = (profile: any) => {
    if (!profile?.profile_pix) return null;

    if (profile.profile_pix.startsWith("http")) {
      return profile.profile_pix;
    }

    return `http://localhost:8000${profile.profile_pix}`;
  };

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
    }, 30000); // Reduced to 30 seconds to minimize API calls
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeTab, searchQuery]);

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
    let filtered = appointments;

    // Apply active tab filter
    switch (activeTab) {
      case "awaiting":
        filtered = filtered.filter((a) => a.status === "AWAITING_RESULTS");
        break;
      case "in_review":
        filtered = filtered.filter((a) => a.status === "IN_REVIEW");
        break;
      case "completed":
        filtered = filtered.filter((a) => a.status === "COMPLETED");
        break;
      default:
        // All appointments
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(appointment =>
        appointment.name.toLowerCase().includes(query) ||
        appointment.address?.toLowerCase().includes(query) ||
        appointment.message?.toLowerCase().includes(query) ||
        appointment.status.toLowerCase().includes(query)
      );
    }

    setFilteredAppointments(filtered);
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
      alert("Test request submitted successfully!");
    } catch (error) {
      console.error("Failed to create test request:", error);
      alert("Failed to create test request. Please try again.");
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
      alert("Vital request submitted successfully!");
    } catch (error) {
      console.error("Failed to create vital request:", error);
      alert("Failed to create vital request. Please try again.");
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
      alert("Medical report created successfully!");
    } catch (error) {
      console.error("Failed to create medical report:", error);
      alert("Failed to create medical report. Please try again.");
    }
  };

  const getStatusColor = useCallback((status: string) => {
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
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "IN_REVIEW":
        return <Eye className="w-4 h-4 text-blue-600" />;
      case "AWAITING_RESULTS":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  }, []);

  const exportPatientData = (appointment: Appointment) => {
    const data = {
      'Patient Name': appointment.name,
      'Age': appointment.age,
      'Gender': appointment.sex === "M" ? "Male" : appointment.sex === "F" ? "Female" : "Other",
      'Address': appointment.address,
      'Status': appointment.status,
      'Booked Date': new Date(appointment.booked_at).toLocaleDateString(),
      'Message': appointment.message || 'N/A',
      'Vitals': appointment.vitals ? JSON.stringify(appointment.vitals) : 'N/A',
      'Lab Results': appointment.lab_results ? JSON.stringify(appointment.lab_results) : 'N/A',
      'Medical Report': appointment.medical_report ? JSON.stringify(appointment.medical_report) : 'N/A'
    };

    const csv = Object.entries(data)
      .map(([key, value]) => `"${key}","${String(value).replace(/"/g, '""')}"`)
      .join('\n');
    
    const blob = new Blob([`${Object.keys(data).join(',')}\n${csv}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient_${appointment.id}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading doctor dashboard...</p>
        </div>
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
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        ${sidebarOpen ? "w-64" : "w-20"}
        ${isMobile ? 'w-full sm:w-64' : ''}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b">
            {sidebarOpen ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">MediCare</h1>
                  <p className="text-xs text-gray-500">Doctor Panel</p>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg mx-auto"></div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 hidden lg:block"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              {isMobile && (
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 md:px-4 py-4 md:py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setMobileSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-3 md:px-4 py-3 rounded-xl transition-all duration-200 font-medium
                  ${
                    activeTab === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }
                `}
              >
                <div
                  className={`${activeTab === item.id ? item.color : "text-gray-400"}`}
                >
                  {item.icon}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex justify-between items-center min-w-0">
                    <span className="truncate text-sm md:text-base">{item.name}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
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
          <div className="p-3 md:p-4 border-t">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
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
                    Dr. {user?.profile?.fullname?.charAt(0) ||
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
        <header className="bg-white border-b shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900 truncate">
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
                  className="pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-36 text-sm"
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

              {/* User Menu */}
              <div className="flex items-center space-x-2 md:space-x-3">
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
                      Dr. {user?.profile?.fullname?.charAt(0) ||
                        user?.username?.charAt(0) ||
                        "D"}
                    </span>
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    Dr. {user?.profile?.fullname || user?.username}
                  </p>
                  <p className="text-xs text-gray-500">Doctor</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
              {/* Total Appointments */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-green-600 bg-green-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                    +{appointments.filter((a) => a.status === "PENDING").length} new
                  </span>
                </div>
                <div className="mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Total Appointments
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {appointments.length}
                  </p>
                </div>
              </div>

              {/* In Review */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">In Review</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {appointments.filter((a) => a.status === "IN_REVIEW").length}
                  </p>
                </div>
              </div>

              {/* Awaiting Results */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Awaiting Results
                  </p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {appointments.filter((a) => a.status === "AWAITING_RESULTS").length}
                  </p>
                </div>
              </div>

              {/* Completed */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl md:text-3xl font-bold text-gray-900 mt-1">
                    {appointments.filter((a) => a.status === "COMPLETED").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl p-3 md:p-4 mb-6 md:mb-8 border border-blue-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Patient Overview
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    {filteredAppointments.length} appointments match current filters
                    {searchQuery && ` for "${searchQuery}"`}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600">Avg. Consultation</p>
                    <p className="text-sm md:text-base font-semibold text-gray-900">20min</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600">Today's Patients</p>
                    <p className="text-sm md:text-base font-semibold text-blue-600">
                      {appointments.filter(a => 
                        new Date(a.booked_at).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments List */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                      Patient Appointments
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      {filteredAppointments.length} appointments • Last updated: Just now
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="text-xs md:text-sm text-blue-600 hover:text-blue-800"
                      >
                        Clear search
                      </button>
                    )}
                    <div className="relative">
                      <Filter className="w-3 h-3 md:w-4 md:h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <select 
                        className="pl-8 pr-3 py-1.5 md:pl-10 md:pr-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-white"
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as any)}
                      >
                        <option value="all">All Status</option>
                        <option value="in_review">In Review</option>
                        <option value="awaiting">Awaiting Results</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
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
                        : "No appointments match the current filter. Try changing filters or check back later."}
                    </p>
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
                                {appointment.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-1">
                                <h3 className="text-base md:text-lg font-semibold text-gray-900 truncate">
                                  {appointment.name}
                                </h3>
                                <div className="flex items-center space-x-2 mt-1 md:mt-0">
                                  {getStatusIcon(appointment.status)}
                                  <span
                                    className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(
                                      appointment.status
                                    )}`}
                                  >
                                    {appointment.status.replace("_", " ")}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-600 text-xs md:text-sm">
                                Age: {appointment.age} • Gender:{" "}
                                {appointment.sex === "M"
                                  ? "Male"
                                  : appointment.sex === "F"
                                  ? "Female"
                                  : "Other"}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            {appointment.address && (
                              <p className="text-xs md:text-sm text-gray-600">
                                <span className="font-medium">Address:</span> {appointment.address}
                              </p>
                            )}

                            {appointment.message && (
                              <div className="bg-gray-50 p-2 md:p-3 rounded-lg">
                                <p className="text-xs md:text-sm font-medium text-gray-700 mb-1">
                                  Patient Message
                                </p>
                                <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                                  {appointment.message}
                                </p>
                              </div>
                            )}

                            <p className="text-xs text-gray-500">
                              Booked:{" "}
                              {new Date(appointment.booked_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>

                          {/* Additional Information Sections */}
                          <div className="mt-4 space-y-3">
                            {/* Test Requests */}
                            {appointment.test_requests && (
                              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-semibold text-blue-800 text-xs md:text-sm mb-2">
                                  Test Requests
                                </h4>
                                <div className="text-xs md:text-sm">
                                  <p className="mb-1">
                                    <span className="font-medium">Tests:</span>{" "}
                                    {appointment.test_requests.tests}
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

                            {/* Vitals */}
                            {appointment.vitals && (
                              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                <h4 className="font-semibold text-emerald-800 text-xs md:text-sm mb-2">
                                  Vital Signs
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs md:text-sm">
                                  <div className="flex items-center space-x-1">
                                    <Heart className="w-3 h-3 text-red-500" />
                                    <span>BP: {appointment.vitals.blood_pressure}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Activity className="w-3 h-3 text-blue-500" />
                                    <span>Pulse: {appointment.vitals.pulse_rate}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Thermometer className="w-3 h-3 text-orange-500" />
                                    <span>Temp: {appointment.vitals.body_temperature}°C</span>
                                  </div>
                                  <div>
                                    <span>Respiration: {appointment.vitals.respiration_rate}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Lab Results */}
                            {appointment.lab_results &&
                              appointment.lab_results.length > 0 && (
                                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                  <h4 className="font-semibold text-purple-800 text-xs md:text-sm mb-2">
                                    Lab Results
                                  </h4>
                                  <div className="space-y-2">
                                    {appointment.lab_results.slice(0, 2).map((result, index) => (
                                      <div key={index} className="text-xs md:text-sm">
                                        <p className="font-medium text-purple-700">
                                          <Beaker className="w-3 h-3 inline mr-1" />
                                          {result.test_name}
                                        </p>
                                        <p>
                                          Result: {result.result} {result.units}
                                        </p>
                                      </div>
                                    ))}
                                    {appointment.lab_results.length > 2 && (
                                      <p className="text-xs text-purple-600">
                                            +{appointment.lab_results.length - 2} more results
                                          </p>
                                    )}
                                  </div>
                                </div>
                              )}
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-3">
                          {/* Action Buttons */}
                          <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                            {appointment.status !== "COMPLETED" && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowTestRequest(true);
                                  }}
                                  className="px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 text-white rounded-lg text-xs md:text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                                >
                                  <FileText className="w-3 h-3 md:w-4 md:h-4" />
                                  <span>Request Tests</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedAppointment(appointment);
                                    setShowVitalRequest(true);
                                  }}
                                  className="px-3 py-1.5 md:px-4 md:py-2 bg-green-600 text-white rounded-lg text-xs md:text-sm hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                                >
                                  <Activity className="w-3 h-3 md:w-4 md:h-4" />
                                  <span>Request Vitals</span>
                                </button>
                                {(appointment.vitals ||
                                  (appointment.lab_results &&
                                    appointment.lab_results.length > 0)) && (
                                  <button
                                    onClick={() => {
                                      setSelectedAppointment(appointment);
                                      setShowMedicalReport(true);
                                    }}
                                    className="px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 text-white rounded-lg text-xs md:text-sm hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center space-x-1.5"
                                  >
                                    <Stethoscope className="w-3 h-3 md:w-4 md:h-4" />
                                    <span>Create Report</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                          
                          {/* Export Button */}
                          <button
                            onClick={() => exportPatientData(appointment)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-xs md:text-sm flex items-center justify-center space-x-1.5"
                          >
                            <Download className="w-3 h-3 md:w-4 md:h-4" />
                            <span>Export Data</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      {showTestRequest && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-50">
          <div className="bg-white rounded-xl md:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Request Lab Tests</h3>
              <button
                onClick={() => setShowTestRequest(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 md:p-6">
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
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    rows={3}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTestRequest(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Vital Request Modal */}
      {showVitalRequest && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-50">
          <div className="bg-white rounded-xl md:rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Request Vital Signs</h3>
              <button
                onClick={() => setShowVitalRequest(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 md:p-6">
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
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                    rows={3}
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowVitalRequest(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm"
                  >
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Medical Report Modal */}
      {showMedicalReport && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-50">
          <div className="bg-white rounded-xl md:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Medical Report
              </h3>
              <button
                onClick={() => setShowMedicalReport(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 md:p-6">
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
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
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
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
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
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
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
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowMedicalReport(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-sm"
                  >
                    Create Report
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

export default DoctorDashboard;