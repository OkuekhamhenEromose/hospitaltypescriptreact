import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import EthaLogo from "../../assets/img/etta-replace1-removebg-preview.png";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  FileText,
  Menu,
  X,
  Home,
  User,
  Calendar,
  BarChart3,
  Search,
  ChevronDown,
  Bell,
  MessageSquare,
  UserPlus,
  Stethoscope,
  FlaskConical,
  Shield,
  Filter,
  RefreshCw,
  Clock,
  Download,
} from "lucide-react";

interface DashboardStats {
  totalPatients: number;
  totalDoctors: number;
  totalNurses: number;
  totalLabScientists: number;
  totalAppointments: number;
  blogStats: {
    total_posts: number;
    published_posts: number;
    draft_posts: number;
    posts_with_toc: number;
    toc_usage_rate: number;
  };
}

interface StaffAssignment {
  appointmentId: number;
  patientId: number;
  patientName: string;
  assignedDoctor?: any;
  assignedNurse?: any;
  assignedLab?: any;
  status: string;
  bookedAt: string;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "patients" | "staff" | "blog" | "assignments"
  >("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [availableNurses, setAvailableNurses] = useState<any[]>([]);
  const [availableLabScientists, setAvailableLabScientists] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<StaffAssignment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const isAdmin = user?.profile?.role === "ADMIN";

  const getProfileImageUrl = (profile: any) => {
    if (!profile?.profile_pix) return null;

    if (profile.profile_pix.startsWith("http")) {
      return profile.profile_pix;
    }

    return `https://dhospitalback.onrender.com${profile.profile_pix}`;
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
      loadAvailableStaff();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (activeTab === "assignments") {
      loadAssignments();
    }
  }, [activeTab, statusFilter]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [staffData, appointmentsData, blogStats, allBlogPosts] =
        await Promise.all([
          apiService.getStaffMembers(),
          apiService.getAppointments(),
          apiService.getBlogStats(),
          apiService.getAllBlogPosts(),
        ]);

      setStaff(staffData);
      setBlogPosts(allBlogPosts);
      setAppointments(appointmentsData);

      const patientMap = new Map();
      appointmentsData.forEach((appointment: any) => {
        if (appointment.patient && !patientMap.has(appointment.patient.id)) {
          patientMap.set(appointment.patient.id, {
            ...appointment.patient,
            appointments_count: appointmentsData.filter(
              (a: any) => a.patient?.id === appointment.patient.id
            ).length,
          });
        }
      });
      setPatients(Array.from(patientMap.values()));

      setStats({
        totalPatients: patientMap.size,
        totalDoctors: staffData.filter((s: any) => s.role === "DOCTOR").length,
        totalNurses: staffData.filter((s: any) => s.role === "NURSE").length,
        totalLabScientists: staffData.filter((s: any) => s.role === "LAB")
          .length,
        totalAppointments: appointmentsData.length,
        blogStats: blogStats,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableStaff = async () => {
    try {
      const [doctors, nurses, labScientists] = await Promise.all([
        apiService.getAvailableStaff('DOCTOR'),
        apiService.getAvailableStaff('NURSE'),
        apiService.getAvailableStaff('LAB'),
      ]);
      setAvailableDoctors(doctors);
      setAvailableNurses(nurses);
      setAvailableLabScientists(labScientists);
    } catch (error) {
      console.error("Error loading available staff:", error);
    }
  };

  const loadAssignments = async () => {
    try {
      const filteredAppointments = statusFilter === 'all' 
        ? appointments 
        : appointments.filter(a => a.status === statusFilter);
      
      const assignmentsData: StaffAssignment[] = filteredAppointments.map((appt: any) => ({
        appointmentId: appt.id,
        patientId: appt.patient?.id,
        patientName: appt.name,
        assignedDoctor: appt.doctor,
        assignedNurse: appt.vital_requests?.[0]?.assigned_to,
        assignedLab: appt.test_requests?.[0]?.assigned_to,
        status: appt.status,
        bookedAt: appt.booked_at,
      }));
      setAssignments(assignmentsData);
    } catch (error) {
      console.error("Error loading assignments:", error);
    }
  };

  const handleAssignStaff = async (data: any) => {
    try {
      const promises = [];
      
      if (data.doctor_id) {
        promises.push(apiService.assignStaff({
          appointment_id: data.appointment_id,
          staff_id: data.doctor_id,
          role: 'DOCTOR'
        }));
      }
      
      if (data.nurse_id) {
        promises.push(apiService.assignStaff({
          appointment_id: data.appointment_id,
          staff_id: data.nurse_id,
          role: 'NURSE'
        }));
      }
      
      if (data.lab_id) {
        promises.push(apiService.assignStaff({
          appointment_id: data.appointment_id,
          staff_id: data.lab_id,
          role: 'LAB'
        }));
      }
      
      await Promise.all(promises);
      loadDashboardData();
      loadAssignments();
      
    } catch (error) {
      console.error("Error assigning staff:", error);
      throw error;
    }
  };

  const handleOpenAssignmentModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowAssignmentModal(true);
  };

  // const handleReassignStaff = async (assignmentId: number, newStaffId: string) => {
  //   try {
  //     await apiService.reassignStaff(assignmentId, newStaffId);
  //     loadAssignments();
  //   } catch (error) {
  //     console.error("Error reassigning staff:", error);
  //   }
  // };

  const handleExportAssignments = () => {
  const csvData = assignments.map(a => ({
    'Appointment ID': a.appointmentId,
    'Patient Name': a.patientName,
    'Assigned Doctor': a.assignedDoctor?.fullname || 'Unassigned',
    'Assigned Nurse': a.assignedNurse?.fullname || 'Unassigned',
    'Assigned Lab Scientist': a.assignedLab?.fullname || 'Unassigned',
    'Status': a.status,
    'Booked Date': new Date(a.bookedAt).toLocaleDateString(),
  }));

  // Simple CSV generator without external library
  const convertToCSV = (data: any[]) => {
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add header row
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
      const values = headers.map(header => {
        const value = row[header];
        // Escape quotes and wrap in quotes if contains comma or quotes
        const escaped = String(value).replace(/"/g, '""');
        return /[,"\n]/.test(escaped) ? `"${escaped}"` : escaped;
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  };

  const csv = convertToCSV(csvData);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `assignments_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  
  // Clean up
  window.URL.revokeObjectURL(url);
};

  const navigationItems = [
    {
      id: "overview",
      name: "Overview",
      icon: <Home className="w-5 h-5" />,
      color: "text-blue-600",
    },
    {
      id: "patients",
      name: "Patients",
      icon: <User className="w-5 h-5" />,
      color: "text-green-600",
    },
    {
      id: "staff",
      name: "Staff",
      icon: <Users className="w-5 h-5" />,
      color: "text-purple-600",
    },
    {
      id: "assignments",
      name: "Staff Assignments",
      icon: <UserPlus className="w-5 h-5" />,
      color: "text-indigo-600",
    },
    {
      id: "blog",
      name: "Blog Management",
      icon: <FileText className="w-5 h-5" />,
      color: "text-orange-600",
    },
  ];

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              Admin role required to access this dashboard.
            </p>
          </div>
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
          <div className="flex items-center justify-between p-6 border-b">
            {sidebarOpen && (
              <div className="flex items-center space-x-3">
                {/* <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div> */}
                <img src={EthaLogo} alt="Etha-Atlantic Memorial Logo" className="w-12 h-12" />
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Etha-Atlantic</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
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
                  setActiveTab(item.id as any);
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
                {sidebarOpen && <span>{item.name}</span>}
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
                    {user?.profile?.fullname?.charAt(0) || "A"}
                  </span>
                </div>
              )}
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.profile?.fullname || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    Administrator
                  </p>
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
                  placeholder="Search..."
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
                      {user?.profile?.fullname?.charAt(0) || "A"}
                    </span>
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.profile?.fullname || "Admin User"}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {activeTab === "overview" && <OverviewTab stats={stats} />}
                {activeTab === "patients" && (
                  <PatientsTab patients={patients} />
                )}
                {activeTab === "staff" && <StaffTab staff={staff} />}
                {activeTab === "assignments" && (
                  <StaffAssignmentTab
                    assignments={assignments}
                    appointments={appointments.filter(a => statusFilter === 'all' || a.status === statusFilter)}
                    onAssign={handleOpenAssignmentModal}
                    onFilterChange={setStatusFilter}
                    onExport={handleExportAssignments}
                    onRefresh={() => {
                      loadDashboardData();
                      loadAssignments();
                    }}
                  />
                )}
                {activeTab === "blog" && (
                  <BlogManagementTab
                    posts={blogPosts}
                    onRefresh={loadDashboardData}
                    onCreateNew={() => setShowCreateModal(true)}
                  />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create Blog Modal */}
      {showCreateModal && (
        <CreateBlogModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadDashboardData();
          }}
        />
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedAppointment && (
        <AssignmentModal
          appointment={selectedAppointment}
          availableDoctors={availableDoctors}
          availableNurses={availableNurses}
          availableLabScientists={availableLabScientists}
          onClose={() => {
            setShowAssignmentModal(false);
            setSelectedAppointment(null);
          }}
          onAssign={handleAssignStaff}
        />
      )}
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ stats: DashboardStats | null }> = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      label: "Total Patients",
      value: stats.totalPatients,
      color: "bg-gradient-to-r from-blue-500 to-blue-600",
      icon: "👥",
      trend: "+12%",
    },
    {
      label: "Doctors",
      value: stats.totalDoctors,
      color: "bg-gradient-to-r from-green-500 to-green-600",
      icon: "👨‍⚕️",
      trend: "+5%",
    },
    {
      label: "Nurses",
      value: stats.totalNurses,
      color: "bg-gradient-to-r from-purple-500 to-purple-600",
      icon: "👩‍⚕️",
      trend: "+8%",
    },
    {
      label: "Lab Scientists",
      value: stats.totalLabScientists,
      color: "bg-gradient-to-r from-orange-500 to-orange-600",
      icon: "🔬",
      trend: "+3%",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div
                className={`${stat.color} text-white w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg`}
              >
                {stat.icon}
              </div>
              <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Blog Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Blog Statistics
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">
                {stats.blogStats.total_posts}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Posts</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">
                {stats.blogStats.published_posts}
              </p>
              <p className="text-sm text-gray-600 mt-1">Published</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-xl">
              <p className="text-2xl font-bold text-yellow-600">
                {stats.blogStats.draft_posts}
              </p>
              <p className="text-sm text-gray-600 mt-1">Drafts</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <p className="text-2xl font-bold text-purple-600">
                {stats.blogStats.posts_with_toc}
              </p>
              <p className="text-sm text-gray-600 mt-1">With TOC</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <span className="font-medium text-blue-700">Add New Patient</span>
              <Plus className="w-5 h-5 text-blue-600" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <span className="font-medium text-green-700">
                Schedule Appointment
              </span>
              <Calendar className="w-5 h-5 text-green-600" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <span className="font-medium text-purple-700">
                Create Blog Post
              </span>
              <FileText className="w-5 h-5 text-purple-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Patients Tab Component
const PatientsTab: React.FC<{ patients: any[] }> = ({ patients }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Patient Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {patients.length} registered patients
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Add Patient</span>
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Appointments
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-medium">
                      {patient.fullname?.charAt(0) || "P"}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {patient.fullname}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {patient.id}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {patient.user?.email}
                </div>
                <div className="text-sm text-gray-500">
                  {patient.phone || "No phone"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {patient.appointments_count} appointments
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Staff Tab Component
const StaffTab: React.FC<{ staff: any[] }> = ({ staff }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">
            Staff Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {staff.length} staff members
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" />
          <span>Add Staff</span>
        </button>
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Staff Member
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {staff.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white text-sm font-medium">
                      {member.fullname?.charAt(0) || "S"}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {member.fullname}
                    </div>
                    <div className="text-sm text-gray-500">ID: {member.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    member.role === "DOCTOR"
                      ? "bg-blue-100 text-blue-800"
                      : member.role === "NURSE"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {member.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {member.user?.email}
                </div>
                <div className="text-sm text-gray-500">
                  {member.phone || "No phone"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Staff Assignment Tab Component
const StaffAssignmentTab: React.FC<{
  assignments: StaffAssignment[];
  appointments: any[];
  onAssign: (appointment: any) => void;
  onFilterChange: (filter: string) => void;
  onExport: () => void;
  onRefresh: () => void;
}> = ({ assignments, appointments, onAssign, onFilterChange, onExport, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              Staff Assignments
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Assign doctors, nurses, and lab scientists to patients
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={onRefresh}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button 
              onClick={onExport}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Assignment Summary
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Doctors Assigned</p>
                  <p className="text-sm text-gray-600">
                    {assignments.filter(a => a.assignedDoctor).length} of {assignments.length}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-blue-600">
                {assignments.length > 0 ? Math.round((assignments.filter(a => a.assignedDoctor).length / assignments.length) * 100) : 0}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Nurses Assigned</p>
                  <p className="text-sm text-gray-600">
                    {assignments.filter(a => a.assignedNurse).length} of {assignments.length}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-purple-600">
                {assignments.length > 0 ? Math.round((assignments.filter(a => a.assignedNurse).length / assignments.length) * 100) : 0}%
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FlaskConical className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Lab Scientists Assigned</p>
                  <p className="text-sm text-gray-600">
                    {assignments.filter(a => a.assignedLab).length} of {assignments.length}
                  </p>
                </div>
              </div>
              <span className="text-sm font-medium text-orange-600">
                {assignments.length > 0 ? Math.round((assignments.filter(a => a.assignedLab).length / assignments.length) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Assignment
          </h4>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <div className="flex items-center space-x-3">
                <UserPlus className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-700">Assign Multiple Staff</span>
              </div>
              <ChevronDown className="w-5 h-5 text-blue-600" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-700">View Assignment Calendar</span>
              </div>
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-purple-700">Generate Assignment Report</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Assignment Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Active Appointments
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Click on any appointment to assign staff
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Filter className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select 
                  onChange={(e) => onFilterChange(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="AWAITING_RESULTS">Awaiting Results</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nurse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lab Scientist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {appointments.filter(a => a.status !== 'COMPLETED').map((appointment) => (
                <tr 
                  key={appointment.id} 
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onAssign(appointment)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-sm font-medium">
                          {appointment.name?.charAt(0) || "P"}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {appointment.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Age: {appointment.age} | {appointment.sex}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.doctor ? (
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                          <span className="text-xs text-blue-600 font-medium">
                            {appointment.doctor.fullname?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {appointment.doctor.fullname}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.vital_requests?.[0]?.assigned_to ? (
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                          <span className="text-xs text-purple-600 font-medium">
                            {appointment.vital_requests[0].assigned_to.fullname?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {appointment.vital_requests[0].assigned_to.fullname}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {appointment.test_requests?.[0]?.assigned_to ? (
                      <div className="flex items-center">
                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                          <span className="text-xs text-orange-600 font-medium">
                            {appointment.test_requests[0].assigned_to.fullname?.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">
                          {appointment.test_requests[0].assigned_to.fullname}
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      appointment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      appointment.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-800' :
                      appointment.status === 'AWAITING_RESULTS' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {appointment.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssign(appointment);
                      }}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Assignment Modal Component
const AssignmentModal: React.FC<{
  appointment: any;
  availableDoctors: any[];
  availableNurses: any[];
  availableLabScientists: any[];
  onClose: () => void;
  onAssign: (data: any) => Promise<void>;
}> = ({ appointment, availableDoctors, availableNurses, availableLabScientists, onClose, onAssign }) => {
  const [selectedDoctor, setSelectedDoctor] = useState<string>(appointment?.doctor?.id || '');
  const [selectedNurse, setSelectedNurse] = useState<string>(appointment?.vital_requests?.[0]?.assigned_to?.id || '');
  const [selectedLab, setSelectedLab] = useState<string>(appointment?.test_requests?.[0]?.assigned_to?.id || '');
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    if (!selectedDoctor && !selectedNurse && !selectedLab) {
      alert('Please select at least one staff member to assign');
      return;
    }

    setLoading(true);
    try {
      await onAssign({
        appointment_id: appointment.id,
        doctor_id: selectedDoctor,
        nurse_id: selectedNurse,
        lab_id: selectedLab,
        notes: notes
      });
      onClose();
    } catch (error: any) {
      console.error('Assignment error:', error);
      alert(`Failed to assign staff: ${error.message || 'Please try again'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Assign Staff</h2>
              <p className="text-sm text-gray-600 mt-1">
                Assign healthcare professionals to {appointment?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Doctor Assignment */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <label className="block text-sm font-medium text-gray-700">
                Assign Doctor
              </label>
            </div>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a doctor...</option>
              {availableDoctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.fullname} 
                </option>
              ))}
            </select>
            {appointment.doctor && !selectedDoctor && (
              <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                Currently assigned: <strong>Dr. {appointment.doctor.fullname}</strong>
              </div>
            )}
          </div>

          {/* Nurse Assignment */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-purple-600" />
              <label className="block text-sm font-medium text-gray-700">
                Assign Nurse
              </label>
            </div>
            <select
              value={selectedNurse}
              onChange={(e) => setSelectedNurse(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="">Select a nurse...</option>
              {availableNurses.map((nurse) => (
                <option key={nurse.id} value={nurse.id}>
                  Nurse {nurse.fullname}
                </option>
              ))}
            </select>
          </div>

          {/* Lab Scientist Assignment */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FlaskConical className="w-5 h-5 text-orange-600" />
              <label className="block text-sm font-medium text-gray-700">
                Assign Lab Scientist
              </label>
            </div>
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Select a lab scientist...</option>
              {availableLabScientists.map((scientist) => (
                <option key={scientist.id} value={scientist.id}>
                  {scientist.fullname}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Assignment Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Add any special instructions or notes for the assigned staff..."
            />
          </div>

          {/* Appointment Info */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Appointment Details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Patient:</span>
                <span className="ml-2 font-medium">{appointment.name}</span>
              </div>
              <div>
                <span className="text-gray-500">Age/Sex:</span>
                <span className="ml-2 font-medium">{appointment.age} / {appointment.sex}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 font-medium capitalize">{appointment.status.toLowerCase().replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-gray-500">Booked:</span>
                <span className="ml-2 font-medium">
                  {new Date(appointment.booked_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || (!selectedDoctor && !selectedNurse && !selectedLab)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 font-medium transition-all shadow-sm"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Assigning...</span>
                </div>
              ) : (
                'Assign Staff'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Blog Management Tab Component
const BlogManagementTab: React.FC<{
  posts: any[];
  onRefresh: () => void;
  onCreateNew: () => void;
}> = ({ posts, onRefresh, onCreateNew }) => {
  const navigate = useNavigate();

  const handleEdit = (slug: string) => {
    navigate(`/admin/blog/edit/${slug}`);
  };

  const handleView = (slug: string) => {
    window.open(`/blog/${slug}`, "_blank");
  };

  const handleDelete = async (slug: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this blog post? This action cannot be undone."
      )
    )
      return;

    try {
      await apiService.deleteBlogPost(slug);
      alert("Blog post deleted successfully!");
      onRefresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete blog post. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Blog Posts</h3>
            <p className="text-sm text-gray-600 mt-1">
              {posts.length} total posts
            </p>
          </div>
          <button
            onClick={onCreateNew}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Post</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <tr
                  key={post.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">
                      {post.title}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {post.description?.substring(0, 100)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {post.author?.fullname || "Unknown Author"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        post.published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleView(post.slug)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                        title="View Post"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(post.slug)}
                        className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50 transition-colors"
                        title="Edit Post"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.slug)}
                        className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Create Blog Modal Component
const CreateBlogModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    published: false,
    enable_toc: true,
  });
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [image1, setImage1] = useState<File | null>(null);
  const [image2, setImage2] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // In ADMINDASHBOARD.TSX - Update the CreateBlogModal's handleSubmit function
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (
    !formData.title.trim() ||
    !formData.description.trim() ||
    !formData.content.trim()
  ) {
    alert("Please fill in all required fields");
    return;
  }

  setLoading(true);

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("content", formData.content);
    formDataToSend.append("published", formData.published.toString());
    formDataToSend.append("enable_toc", formData.enable_toc.toString());

    // Check if files exist before appending
    if (featuredImage) {
      formDataToSend.append("featured_image", featuredImage);
    } else {
      alert("Featured image is required");
      setLoading(false);
      return;
    }
    
    if (image1) {
      formDataToSend.append("image_1", image1);
    }
    
    if (image2) {
      formDataToSend.append("image_2", image2);
    }

    console.log("Creating blog post with data:", {
      title: formData.title,
      description: formData.description,
      hasFeaturedImage: !!featuredImage,
      hasImage1: !!image1,
      hasImage2: !!image2,
    });

    const response = await apiService.createBlogPost(formDataToSend);
    console.log("Blog post created successfully:", response);
    
    onSuccess();
    alert("Blog post created successfully!");
    
  } catch (error: any) {
    console.error("Error creating blog post:", error);
    alert(
      `Failed to create blog post: ${error.message || "Please try again. Check console for details."}`
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Create New Blog Post
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Add a main image and two additional images for your blog post
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter blog post title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter a brief description that will appear on the blog listing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              required
              rows={15}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
              placeholder={`Write your blog post content using HTML tags. Headings will be used for table of contents.

Example structure:
<h1>Main Heading</h1>
<p>Introduction paragraph...</p>

<h2>First Subheading</h2>
<p>Content for first section...</p>

<h2>Second Subheading</h2>
<p>Content for second section...</p>

<h3>Nested Subheading</h3>
<p>More detailed content...</p>

Make sure to include at least 6 subheadings for proper structure.`}
            />
            <p className="text-sm text-gray-500 mt-2">
              Use HTML heading tags (h1-h6) for subheadings. They will be
              automatically extracted for the table of contents.
            </p>
          </div>

          {/* Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Featured Image (Main) *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                required
              />
              <p className="text-xs text-gray-500">
                Main image displayed at top
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Image 1
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage1(e.target.files?.[0] || null)}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
              />
              <p className="text-xs text-gray-500">Second image for content</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Additional Image 2
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage2(e.target.files?.[0] || null)}
                className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
              />
              <p className="text-xs text-gray-500">Third image for content</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Publish immediately
              </span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.enable_toc}
                onChange={(e) =>
                  setFormData({ ...formData, enable_toc: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Enable table of contents
              </span>
            </label>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 font-medium transition-all shadow-sm"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                "Create Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;