// components/dashboards/NurseDashboard.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import {
  Activity,
  Clipboard,
  Menu,
  Clock,
  CheckCircle,
  Search,
  Bell,
  ChevronDown,
  FileText,
  AlertCircle,
  Heart,
  Thermometer,
  X,
  Filter,
  RefreshCw,
} from "lucide-react";

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
  assigned_to?: any;
}

const NurseDashboard: React.FC = () => {
  const { user } = useAuth();
  const [vitalRequests, setVitalRequests] = useState<VitalRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VitalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VitalRequest | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "in_progress" | "completed"
  >("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showVitalsForm, setShowVitalsForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [vitalsData, setVitalsData] = useState({
    blood_pressure: "",
    respiration_rate: "",
    pulse_rate: "",
    body_temperature: "",
    height_cm: "",
    weight_kg: "",
  });

  const getProfileImageUrl = (profile: any) => {
    if (!profile?.profile_pix) return null;
    if (profile.profile_pix.startsWith("http")) return profile.profile_pix;
    return `https://dhospitalback.onrender.com${profile.profile_pix}`;
  };

  const getPatientName = (request: VitalRequest) => {
    return request.appointment?.name || "Unknown Patient";
  };

  const getPatientInitial = (request: VitalRequest) => {
    const name = getPatientName(request);
    return name.charAt(0).toUpperCase();
  };

  const getPatientAge = (request: VitalRequest) => {
    return request.appointment?.age || "N/A";
  };

  const getPatientGender = (request: VitalRequest) => {
    const sex = request.appointment?.sex;
    if (sex === "M") return "Male";
    if (sex === "F") return "Female";
    return "Unknown";
  };

  const navigationItems = [
    {
      id: "all" as const,
      name: "All Requests",
      icon: <FileText className="w-4 h-4 md:w-5 md:h-5" />,
      color: "text-blue-600",
      count: vitalRequests.length,
    },
    {
      id: "pending" as const,
      name: "Pending",
      icon: <Clock className="w-4 h-4 md:w-5 md:h-5" />,
      color: "text-yellow-600",
      count: vitalRequests.filter((r) => r.status === "PENDING").length,
    },
    {
      id: "in_progress" as const,
      name: "In Progress",
      icon: <AlertCircle className="w-4 h-4 md:w-5 md:h-5" />,
      color: "text-orange-600",
      count: vitalRequests.filter((r) => r.status === "IN_PROGRESS").length,
    },
    {
      id: "completed" as const,
      name: "Completed",
      icon: <CheckCircle className="w-4 h-4 md:w-5 md:h-5" />,
      color: "text-green-600",
      count: vitalRequests.filter((r) => r.status === "DONE").length,
    },
  ];

  useEffect(() => {
    loadVitalRequests();
    const interval = setInterval(() => {
      loadVitalRequests();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterRequests();
  }, [vitalRequests, activeTab, searchQuery]);

  const loadVitalRequests = async () => {
    try {
      const data = await apiService.getVitalRequests();
      setVitalRequests(data || []);
    } catch (error) {
      console.error("Failed to load vital requests:", error);
      setVitalRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = vitalRequests;

    switch (activeTab) {
      case "pending":
        filtered = filtered.filter((r) => r.status === "PENDING");
        break;
      case "in_progress":
        filtered = filtered.filter((r) => r.status === "IN_PROGRESS");
        break;
      case "completed":
        filtered = filtered.filter((r) => r.status === "DONE");
        break;
      default:
        break;
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          getPatientName(request).toLowerCase().includes(query) ||
          (request.note && request.note.toLowerCase().includes(query))
      );
    }

    setFilteredRequests(filtered);
  };

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

      await loadVitalRequests();
      alert("Vitals recorded successfully!");
    } catch (error) {
      console.error("Failed to submit vitals:", error);
      alert("Failed to record vitals. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-100 text-green-800 border border-green-200";
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-800 border border-orange-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />;
      case "IN_PROGRESS":
        return (
          <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
        );
      case "PENDING":
        return <Clock className="w-3 h-3 md:w-4 md:h-4 text-yellow-600" />;
      default:
        return <Clock className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />;
    }
  };

  const handleMarkInProgress = async (requestId: number) => {
    try {
      setVitalRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "IN_PROGRESS" } : req
        )
      );
      alert("Vital request marked as In Progress");
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleMarkComplete = async (requestId: number) => {
    try {
      setVitalRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: "DONE" } : req
        )
      );
      alert("Vital request marked as Completed");
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading nurse dashboard...</p>
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
                  <Activity className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">MediCare</h1>
                  <p className="text-xs text-gray-500">Nurse Panel</p>
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
                <div
                  className={`${
                    activeTab === item.id ? item.color : "text-gray-400"
                  }`}
                >
                  {item.icon}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex justify-between items-center">
                    <span className="text-sm md:text-base">{item.name}</span>
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
                    {user?.profile?.fullname?.charAt(0) ||
                      user?.username?.charAt(0) ||
                      "N"}
                  </span>
                </div>
              )}
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.profile?.fullname || user?.username}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Nurse</p>
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
                  placeholder="Search vital requests..."
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
                        {user?.profile?.fullname?.charAt(0) ||
                          user?.username?.charAt(0) ||
                          "N"}
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
                      {user?.profile?.fullname?.charAt(0) ||
                        user?.username?.charAt(0) ||
                        "N"}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.profile?.fullname || user?.username}
                  </p>
                  <p className="text-xs text-gray-500">Nurse</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-3 md:p-4 lg:p-6">
            {/* Stats Cards - Responsive Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
              {/* Total Requests Card */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <Clipboard className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  </div>
                  <span className="text-xs md:text-sm font-medium text-green-600 bg-green-50 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full">
                    +
                    {vitalRequests.filter((r) => r.status === "PENDING").length}{" "}
                    new
                  </span>
                </div>
                <div className="mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Total Requests
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                    {vitalRequests.length}
                  </p>
                </div>
              </div>

              {/* Pending Card */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Pending
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                    {vitalRequests.filter((r) => r.status === "PENDING").length}
                  </p>
                </div>
              </div>

              {/* In Progress Card */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <AlertCircle className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    In Progress
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                    {
                      vitalRequests.filter((r) => r.status === "IN_PROGRESS")
                        .length
                    }
                  </p>
                </div>
              </div>

              {/* Completed Card */}
              <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
                <div className="mt-3 md:mt-4">
                  <p className="text-xs md:text-sm font-medium text-gray-600">
                    Completed
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1">
                    {vitalRequests.filter((r) => r.status === "DONE").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl md:rounded-2xl p-3 md:p-4 mb-6 md:mb-8 border border-blue-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                <div>
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    Nurse Performance Overview
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    {filteredRequests.length} requests match current filters
                  </p>
                </div>
                <div className="flex items-center space-x-3 md:space-x-4">
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600">
                      Avg. Response Time
                    </p>
                    <p className="text-sm md:text-base font-semibold text-gray-900">
                      15min
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs md:text-sm text-gray-600">
                      Completion Rate
                    </p>
                    <p className="text-sm md:text-base font-semibold text-green-600">
                      98.5%
                    </p>
                  </div>
                  <button
                    onClick={loadVitalRequests}
                    className="flex items-center space-x-2 px-3 py-1.5 md:px-4 md:py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                    <span className="text-xs md:text-sm font-medium">
                      Refresh
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Vital Requests List */}
            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-0">
                  <div>
                    <h3 className="text-lg md:text-xl font-semibold text-gray-900">
                      Vital Sign Requests
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 mt-1">
                      {filteredRequests.length} vital requests • Last updated:
                      Just now
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Filter className="w-3 h-3 md:w-4 md:h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <select
                        className="pl-8 pr-3 py-1.5 md:pl-10 md:pr-4 md:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs md:text-sm bg-white"
                        value={activeTab}
                        onChange={(e) => setActiveTab(e.target.value as any)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <div className="px-4 py-8 md:px-6 md:py-12 text-center text-gray-500">
                    <Activity className="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3 md:mb-4" />
                    <p className="text-base md:text-lg font-medium">
                      No vital requests found
                    </p>
                    <p className="text-xs md:text-sm mt-1 max-w-md mx-auto">
                      {searchQuery.trim()
                        ? `No vital requests match "${searchQuery}"`
                        : "No vital requests match the current filter. Try changing filters or check back later."}
                    </p>
                    {searchQuery.trim() && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="mt-3 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <div
                      key={request.id}
                      className="px-4 py-4 md:px-6 md:py-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-start space-x-3 mb-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs md:text-sm font-medium">
                                {getPatientInitial(request)}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center md:space-x-3 mb-1">
                                <h3 className="text-base md:text-lg font-semibold text-gray-900">
                                  {getPatientName(request)}
                                </h3>
                                <div className="flex items-center space-x-2 mt-1 md:mt-0">
                                  {getStatusIcon(request.status)}
                                  <span
                                    className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(
                                      request.status
                                    )}`}
                                  >
                                    {request.status.replace("_", " ")}
                                  </span>
                                </div>
                              </div>
                              <p className="text-gray-600 text-xs md:text-sm">
                                Age: {getPatientAge(request)} | Gender:{" "}
                                {getPatientGender(request)} | ID:{" "}
                                {request.appointment?.id || "N/A"}
                              </p>
                            </div>
                          </div>

                          {request.note && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-xs md:text-sm font-medium text-blue-700">
                                Doctor's Note
                              </p>
                              <p className="text-xs md:text-sm text-blue-600 mt-1">
                                {request.note}
                              </p>
                            </div>
                          )}

                          <p className="text-xs text-gray-500">
                            Requested:{" "}
                            {new Date(request.created_at).toLocaleDateString(
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

                        <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-3">
                          {(request.status === "PENDING" ||
                            request.status === "IN_PROGRESS") && (
                            <>
                              {request.status === "PENDING" && (
                                <button
                                  onClick={() =>
                                    handleMarkInProgress(request.id)
                                  }
                                  className="px-3 py-1.5 md:px-4 md:py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-sm flex items-center justify-center space-x-1.5 text-xs md:text-sm"
                                >
                                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                  <span>Start Assessment</span>
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowVitalsForm(true);
                                }}
                                className={`px-3 py-1.5 md:px-4 md:py-2 text-white rounded-lg transition-colors shadow-sm flex items-center justify-center space-x-1.5 text-xs md:text-sm ${
                                  request.status === "PENDING"
                                    ? "bg-blue-600 hover:bg-blue-700"
                                    : "bg-orange-600 hover:bg-orange-700"
                                }`}
                              >
                                <Activity className="w-3 h-3 md:w-4 md:h-4" />
                                <span>
                                  {request.status === "PENDING"
                                    ? "Record Vitals"
                                    : "Update Vitals"}
                                </span>
                              </button>
                            </>
                          )}
                          {request.status === "IN_PROGRESS" && (
                            <button
                              onClick={() => handleMarkComplete(request.id)}
                              className="px-3 py-1.5 md:px-4 md:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center space-x-1.5 text-xs md:text-sm"
                            >
                              <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                              <span>Mark Complete</span>
                            </button>
                          )}
                          {request.status === "DONE" && (
                            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
                              <CheckCircle className="w-3 h-3 md:w-4 md:h-4" />
                              <span className="text-xs md:text-sm font-medium">
                                Completed
                              </span>
                            </div>
                          )}
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

      {/* Vitals Form Modal */}
      {showVitalsForm && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 md:p-4 z-50">
          <div className="bg-white rounded-xl md:rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Record Vital Signs
              </h3>
              <button
                onClick={() => setShowVitalsForm(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 md:p-6">
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">
                  Patient: {getPatientName(selectedRequest)}
                </p>
                <p className="text-sm text-blue-700">
                  Age: {getPatientAge(selectedRequest)} | Gender:{" "}
                  {getPatientGender(selectedRequest)}
                </p>
                {selectedRequest.note && (
                  <p className="text-sm text-blue-600 mt-1">
                    <span className="font-medium">Doctor's Note:</span>{" "}
                    {selectedRequest.note}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmitVitals} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 p-3 bg-red-50 rounded-lg border border-red-200">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-semibold text-gray-700">
                        Cardiovascular
                      </span>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Pressure *
                      </label>
                      <input
                        type="text"
                        required
                        value={vitalsData.blood_pressure}
                        onChange={(e) =>
                          setVitalsData({
                            ...vitalsData,
                            blood_pressure: e.target.value,
                          })
                        }
                        placeholder="e.g., 120/80"
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pulse Rate (bpm) *
                      </label>
                      <input
                        type="number"
                        required
                        min="40"
                        max="200"
                        value={vitalsData.pulse_rate}
                        onChange={(e) =>
                          setVitalsData({
                            ...vitalsData,
                            pulse_rate: e.target.value,
                          })
                        }
                        placeholder="e.g., 72"
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                      <Thermometer className="w-4 h-4 text-orange-500" />
                      <span>Respiratory & Temperature</span>
                    </h4>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
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
                        className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 md:col-span-2">
                    <h4 className="text-sm font-semibold text-gray-700">
                      Anthropometric Measurements
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
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
                          className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowVitalsForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Submit Vitals</span>
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

export default NurseDashboard;
