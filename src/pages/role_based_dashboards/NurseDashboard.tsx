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
  MessageSquare,
  ChevronDown,
  FileText,
  AlertCircle,
  Heart,
  Thermometer,
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
}

const NurseDashboard: React.FC = () => {
  const { user } = useAuth();
  const [vitalRequests, setVitalRequests] = useState<VitalRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<VitalRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VitalRequest | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "in_progress" | "completed">("all");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
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
  const getProfileImageUrl = (profile: any) => {
    if (!profile?.profile_pix) return null;

    if (profile.profile_pix.startsWith("http")) {
      return profile.profile_pix;
    }

    return `http://localhost:8000${profile.profile_pix}`;
  };

  // Safe navigation functions
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
      icon: <FileText className="w-5 h-5" />,
      color: "text-blue-600",
      count: vitalRequests.length,
    },
    {
      id: "pending" as const,
      name: "Pending",
      icon: <Clock className="w-5 h-5" />,
      color: "text-yellow-600",
      count: vitalRequests.filter((r) => r.status === "PENDING").length,
    },
    {
      id: "in_progress" as const,
      name: "In Progress",
      icon: <AlertCircle className="w-5 h-5" />,
      color: "text-orange-600",
      count: vitalRequests.filter((r) => r.status === "IN_PROGRESS").length,
    },
    {
      id: "completed" as const,
      name: "Completed",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "text-green-600",
      count: vitalRequests.filter((r) => r.status === "DONE").length,
    },
  ];

  useEffect(() => {
    loadVitalRequests();
    const interval = setInterval(() => {
      loadVitalRequests();
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterRequests();
  }, [vitalRequests, activeTab]);

  const loadVitalRequests = async () => {
    try {
      const data = await apiService.getVitalRequests();
      console.log("Loaded vital requests:", data);
      setVitalRequests(data || []);
    } catch (error) {
      console.error("Failed to load vital requests:", error);
      setVitalRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    switch (activeTab) {
      case "pending":
        setFilteredRequests(vitalRequests.filter(r => r.status === "PENDING"));
        break;
      case "in_progress":
        setFilteredRequests(vitalRequests.filter(r => r.status === "IN_PROGRESS"));
        break;
      case "completed":
        setFilteredRequests(vitalRequests.filter(r => r.status === "DONE"));
        break;
      default:
        setFilteredRequests(vitalRequests);
    }
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
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "PENDING":
        return "bg-gray-100 text-gray-800 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "IN_PROGRESS":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "PENDING":
        return <Clock className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
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
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        ${sidebarOpen ? 'w-64' : 'w-20'}
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">MediCare</h1>
                  <p className="text-xs text-gray-500">Nurse Panel</p>
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
                  ${activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <div className={`${activeTab === item.id ? item.color : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activeTab === item.id ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {item.count}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </nav>

          {/* User Section */}
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
          {user?.profile?.fullname?.charAt(0) || user?.username?.charAt(0) || 'N'}
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
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeTab)?.name}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search vital requests..."
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
        {user?.profile?.fullname?.charAt(0) || user?.username?.charAt(0) || 'N'}
      </span>
    </div>
  )}
  <div className="hidden md:block">
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
          <div className="p-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    <Clipboard className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    +{vitalRequests.filter(r => r.status === 'PENDING').length} new
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{vitalRequests.length}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    <Activity className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {vitalRequests.filter((r) => r.status === "PENDING").length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {vitalRequests.filter((r) => r.status === "IN_PROGRESS").length}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {vitalRequests.filter((r) => r.status === "DONE").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Vital Requests List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Vital Sign Requests</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {filteredRequests.length} vital requests
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredRequests.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-lg font-medium">No vital requests found</p>
                    <p className="text-sm mt-1">No vital requests match the current filter.</p>
                  </div>
                ) : (
                  filteredRequests.map((request) => (
                    <div key={request.id} className="px-6 py-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {getPatientInitial(request)}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {getPatientName(request)}
                              </h3>
                              <p className="text-gray-600 text-sm">
                                Age: {getPatientAge(request)} | Gender: {getPatientGender(request)}
                              </p>
                            </div>
                          </div>
                          
                          {request.note && (
                            <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm font-medium text-blue-700">Doctor's Note</p>
                              <p className="text-sm text-blue-600 mt-1">{request.note}</p>
                            </div>
                          )}
                          
                          <p className="text-sm text-gray-500">
                            Requested: {new Date(request.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(request.status)}
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                request.status
                              )}`}
                            >
                              {request.status.replace("_", " ")}
                            </span>
                          </div>

                          {(request.status === "PENDING" || request.status === "IN_PROGRESS") && (
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowVitalsForm(true);
                              }}
                              className={`px-4 py-2 text-white rounded-lg transition-colors shadow-sm flex items-center space-x-2 ${
                                request.status === "PENDING" 
                                  ? "bg-blue-600 hover:bg-blue-700" 
                                  : "bg-orange-600 hover:bg-orange-700"
                              }`}
                            >
                              <Activity className="w-4 h-4" />
                              <span>
                                {request.status === "PENDING" ? "Record Vitals" : "Update Vitals"}
                              </span>
                            </button>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Record Vital Signs
              </h3>
              <button
                onClick={() => setShowVitalsForm(false)}
                className="p-1 rounded-lg hover:bg-gray-100"
              >
                <ChevronDown className="w-5 h-5 text-gray-500 transform rotate-90" />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800">
                Patient: {getPatientName(selectedRequest)}
              </p>
              <p className="text-sm text-blue-700">
                Age: {getPatientAge(selectedRequest)} | Gender: {getPatientGender(selectedRequest)}
              </p>
              {selectedRequest.note && (
                <p className="text-sm text-blue-600 mt-1">
                  <span className="font-medium">Doctor's Note:</span> {selectedRequest.note}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmitVitals} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span>Cardiovascular</span>
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-orange-500" />
                    <span>Respiratory & Temperature</span>
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Anthropometric Measurements
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowVitalsForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center space-x-2"
                >
                  <Activity className="w-4 h-4" />
                  <span>Submit Vitals</span>
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