import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import { SafeIcon } from "../../components/Modernicon";

// Add animation styles
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

const AdminDashboard: React.FC = () => {
  const authContext = useAuth();

  if (!authContext) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const { user, logout } = authContext;
  const [activeTab, setActiveTab] = useState<"overview" | "patients" | "staff" | "assignments" | "blog">("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalNurses: 0,
    totalLabScientists: 0,
    totalAppointments: 0,
    blogStats: {
      total_posts: 0,
      published_posts: 0,
      draft_posts: 0,
      posts_with_toc: 0,
      toc_usage_rate: 0,
    },
  });

  const [appointments, setAppointments] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = user?.profile?.role === "ADMIN";

  useEffect(() => {
    // Add styles to document
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [staffData, appointmentsData, blogStats] = await Promise.all([
        apiService.getStaffMembers().catch(() => []),
        apiService.getAppointments().catch(() => []),
        apiService.getBlogStats().catch(() => ({
          total_posts: 0,
          published_posts: 0,
          draft_posts: 0,
          posts_with_toc: 0,
          toc_usage_rate: 0,
        })),
      ]);

      const safeStaff = Array.isArray(staffData) ? staffData : [];
      const safeAppointments = Array.isArray(appointmentsData) ? appointmentsData : [];

      setStaff(safeStaff);
      setAppointments(safeAppointments);

      const patientMap = new Map();
      safeAppointments.forEach((appt: any) => {
        if (appt?.patient?.id && !patientMap.has(appt.patient.id)) {
          patientMap.set(appt.patient.id, appt.patient);
        }
      });
      setPatients(Array.from(patientMap.values()));

      setStats({
        totalPatients: patientMap.size,
        totalDoctors: safeStaff.filter((s: any) => s?.role === "DOCTOR").length,
        totalNurses: safeStaff.filter((s: any) => s?.role === "NURSE").length,
        totalLabScientists: safeStaff.filter((s: any) => s?.role === "LAB").length,
        totalAppointments: safeAppointments.length,
        blogStats: blogStats as any,
      });
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to load dashboard data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon name="X" size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Admin privileges required to access this dashboard.</p>
          <button
            onClick={() => logout()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon name="X" size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError(null);
              loadDashboardData();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: "overview", label: "Overview", icon: "Home", count: null },
    { id: "patients", label: "Patients", icon: "User", count: stats.totalPatients },
    { id: "staff", label: "Staff", icon: "Users", count: stats.totalDoctors + stats.totalNurses + stats.totalLabScientists },
    { id: "assignments", label: "Assignments", icon: "UserPlus", count: appointments.filter(a => a?.status !== "COMPLETED").length },
    { id: "blog", label: "Blog", icon: "FileText", count: stats.blogStats.total_posts },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        } flex flex-col`}
        style={{ minHeight: "100vh" }}
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <SafeIcon name="Logo" size={24} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">Etha-Atlantic</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <SafeIcon name={item.icon} size={20} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
                    {item.count !== null && (
                      <span
                        className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
              {user?.profile?.fullname?.charAt(0) || "A"}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.profile?.fullname || "Admin"}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <SafeIcon
              name="ChevLeft"
              size={16}
              style={{ transform: sidebarCollapsed ? "rotate(180deg)" : "none" }}
            />
            {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navItems.find((n) => n.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {activeTab === "overview" && "Welcome back! Here's your system overview."}
                {activeTab === "patients" && `Manage ${stats.totalPatients} registered patients`}
                {activeTab === "staff" && `Manage ${staff.length} staff members`}
                {activeTab === "assignments" && "Assign staff to patient appointments"}
                {activeTab === "blog" && `Manage ${stats.blogStats.total_posts} blog posts`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <SafeIcon
                  name="Search"
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={loadDashboardData}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                title="Refresh"
              >
                <SafeIcon name="RefreshCw" size={20} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors relative">
                <SafeIcon name="Bell" size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8">
          {activeTab === "overview" && <OverviewTab stats={stats} appointments={appointments} />}
          {activeTab === "patients" && <PatientsTab patients={patients} searchQuery={searchQuery} />}
          {activeTab === "staff" && <StaffTab staff={staff} searchQuery={searchQuery} />}
          {activeTab === "assignments" && <AssignmentsTab appointments={appointments} />}
          {activeTab === "blog" && <BlogTab stats={stats.blogStats} />}
        </main>
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{ stats: any; appointments: any[] }> = ({ stats, appointments }) => {
  const statCards = [
    {
      label: "Total Patients",
      value: stats.totalPatients,
      icon: "User",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Doctors",
      value: stats.totalDoctors,
      icon: "Stethoscope",
      color: "from-green-500 to-green-600",
    },
    {
      label: "Nurses",
      value: stats.totalNurses,
      icon: "Shield",
      color: "from-purple-500 to-purple-600",
    },
    {
      label: "Lab Scientists",
      value: stats.totalLabScientists,
      icon: "Flask",
      color: "from-orange-500 to-orange-600",
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <SafeIcon name={card.icon} size={24} className="text-white" />
              </div>
              <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                +{3 + idx}%
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{card.value}</h3>
            <p className="text-sm font-medium text-gray-600">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <SafeIcon name="BarChart" size={20} className="text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Blog Statistics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Posts", value: stats.blogStats.total_posts, color: "blue" },
              { label: "Published", value: stats.blogStats.published_posts, color: "green" },
              { label: "Drafts", value: stats.blogStats.draft_posts, color: "orange" },
              { label: "With TOC", value: stats.blogStats.posts_with_toc, color: "purple" },
            ].map((item, idx) => (
              <div key={idx} className={`bg-${item.color}-50 rounded-xl p-4 text-center`}>
                <div className={`text-2xl font-bold text-${item.color}-600 mb-1`}>{item.value}</div>
                <div className="text-xs text-gray-600">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Appointment Overview</h3>
          <div className="space-y-3">
            {[
              { label: "Pending", value: appointments.filter(a => a?.status === "PENDING").length, color: "gray" },
              { label: "In Review", value: appointments.filter(a => a?.status === "IN_REVIEW").length, color: "blue" },
              { label: "Completed", value: appointments.filter(a => a?.status === "COMPLETED").length, color: "green" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">{item.value}</span>
                  <span className={`w-2 h-2 rounded-full bg-${item.color}-500`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PatientsTab: React.FC<{ patients: any[]; searchQuery: string }> = ({ patients, searchQuery }) => {
  const filteredPatients = patients.filter(p =>
    p?.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Patient Management</h3>
            <p className="text-sm text-gray-500 mt-1">{filteredPatients.length} patients found</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
            <SafeIcon name="Plus" size={16} />
            Add Patient
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredPatients.map((patient, idx) => (
              <tr key={patient?.id || idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {patient?.fullname?.charAt(0) || "P"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{patient?.fullname || "Unknown"}</p>
                      <p className="text-xs text-gray-500">ID: {patient?.id || "N/A"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-900">{patient?.user?.email || "No email"}</p>
                  <p className="text-xs text-gray-500">{patient?.phone || "No phone"}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                      <SafeIcon name="Eye" size={16} className="text-blue-600" />
                    </button>
                    <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                      <SafeIcon name="Edit" size={16} className="text-green-600" />
                    </button>
                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <SafeIcon name="Trash" size={16} className="text-red-600" />
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
};

const StaffTab: React.FC<{ staff: any[]; searchQuery: string }> = ({ staff, searchQuery }) => {
  const filteredStaff = staff.filter(s =>
    s?.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s?.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "DOCTOR":
        return { bg: "bg-blue-50", text: "text-blue-600" };
      case "NURSE":
        return { bg: "bg-purple-50", text: "text-purple-600" };
      case "LAB":
        return { bg: "bg-orange-50", text: "text-orange-600" };
      default:
        return { bg: "bg-gray-50", text: "text-gray-600" };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Staff Management</h3>
            <p className="text-sm text-gray-500 mt-1">{filteredStaff.length} staff members</p>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2">
            <SafeIcon name="Plus" size={16} />
            Add Staff
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Staff Member</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredStaff.map((member, idx) => {
              const roleColor = getRoleColor(member?.role);
              return (
                <tr key={member?.id || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {member?.fullname?.charAt(0) || "S"}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{member?.fullname || "Unknown"}</p>
                        <p className="text-xs text-gray-500">ID: {member?.id || "N/A"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${roleColor.bg} ${roleColor.text}`}>
                      {member?.role || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900">{member?.user?.email || "No email"}</p>
                    <p className="text-xs text-gray-500">{member?.phone || "No phone"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-semibold">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                        <SafeIcon name="Eye" size={16} className="text-blue-600" />
                      </button>
                      <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                        <SafeIcon name="Edit" size={16} className="text-green-600" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <SafeIcon name="Trash" size={16} className="text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AssignmentsTab: React.FC<{ appointments: any[] }> = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">Staff Assignments</h3>
        <p className="text-sm text-gray-500 mt-1">Manage appointments and staff allocation</p>
      </div>
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon name="UserPlus" size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-600">Assignment functionality will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

const BlogTab: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Blog Management</h3>
            <p className="text-sm text-gray-500 mt-1">{stats.total_posts} total posts</p>
          </div>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2">
            <SafeIcon name="Plus" size={16} />
            New Post
          </button>
        </div>
      </div>
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon name="FileText" size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-600">Blog management interface will be displayed here</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;