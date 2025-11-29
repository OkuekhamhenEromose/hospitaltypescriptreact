import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  FileText,
  // Activity,
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
  // Image,
  // Save,
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

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "patients" | "staff" | "blog"
  >("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isAdmin = user?.profile?.role === "ADMIN";

  const getProfileImageUrl = (profile: any) => {
    if (!profile?.profile_pix) return null;

    if (profile.profile_pix.startsWith("http")) {
      return profile.profile_pix;
    }

    return `http://localhost:8000${profile.profile_pix}`;
  };

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [staffData, appointments, blogStats, allBlogPosts] =
        await Promise.all([
          apiService.getStaffMembers(),
          apiService.getAppointments(),
          apiService.getBlogStats(),
          apiService.getAllBlogPosts(),
        ]);

      setStaff(staffData);
      setBlogPosts(allBlogPosts);

      const patientMap = new Map();
      appointments.forEach((appointment: any) => {
        if (appointment.patient && !patientMap.has(appointment.patient.id)) {
          patientMap.set(appointment.patient.id, {
            ...appointment.patient,
            appointments_count: appointments.filter(
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
        totalAppointments: appointments.length,
        blogStats: blogStats,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">MediCare</h1>
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

// Blog Management Tab Component
const BlogManagementTab: React.FC<{
  posts: any[];
  onRefresh: () => void;
  onCreateNew: () => void;
}> = ({ posts, onRefresh, onCreateNew }) => {
  const navigate = useNavigate();

  const handleEdit = (slug: string) => {
    // Navigate to the blog editor with the post slug
    navigate(`/admin/blog/edit/${slug}`);
  };

  const handleView = (slug: string) => {
    // Open the blog post in a new tab for preview
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
      // Show success message
      alert("Blog post deleted successfully!");
      // Refresh the posts list
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

      if (featuredImage) {
        formDataToSend.append("featured_image", featuredImage);
      }
      if (image1) {
        formDataToSend.append("image_1", image1);
      }
      if (image2) {
        formDataToSend.append("image_2", image2);
      }

      await apiService.createBlogPost(formDataToSend);

      await Promise.all([
        apiService.getAllBlogPosts(),
        apiService.getLatestBlogPosts(),
      ]);

      onSuccess();
    } catch (error: any) {
      console.error("Error creating blog post:", error);
      alert(
        `Failed to create blog post: ${error.message || "Please try again"}`
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
