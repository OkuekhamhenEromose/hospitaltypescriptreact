// components/dashboards/AdminDashboard.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "../../hooks/useAuth";
import { apiService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import { UniversalIcon } from "../../components/Modernicon";

// Define proper interfaces

interface TeamMember {
  name: string;
  avatar: string | null;
}

interface StaffMember {
  id?: number;
  fullname?: string;
  role?: string;
  phone?: string;
  user?: {
    email?: string;
  };
}

interface Patient {
  id?: number;
  fullname?: string;
  phone?: string;
  user?: {
    email?: string;
  };
  appointments_count?: number;
}

interface Appointment {
  id?: number;
  name?: string;
  age?: number;
  sex?: string;
  status?: string;
  booked_at?: string;
  patient?: {
    id: number;
    fullname?: string;
    [key: string]: unknown;
  };
  doctor?: {
    fullname?: string;
  };
}

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

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    fullname: string;
  };
}

function imgUrl(
  p: { profile_pix?: string | null } | null | undefined,
): string | null {
  if (!p?.profile_pix) {
    return null;
  }

  const profilePix = String(p.profile_pix).trim();

  if (/^https?:\/\//i.test(profilePix)) {
    return profilePix;
  }

  const BACKEND_ORIGIN = (
    import.meta.env.VITE_API_URL ??
    "https://hospitalback-clean-0fre.onrender.com/api"
  ).replace(/\/api\/?$/, "");

  const separator = profilePix.startsWith("/") ? "" : "/";
  return `${BACKEND_ORIGIN}${separator}${profilePix}`;
}

const Avatar: React.FC<{
  name: string;
  size?: number;
  src?: string | null;
  className?: string;
}> = ({ name, size = 40, src, className = "" }) => {
  const safeName = name || "?";
  const initials = safeName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={`rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={safeName} className="w-full h-full object-cover" />
      ) : (
        <span
          className="text-white font-semibold"
          style={{ fontSize: size * 0.4 }}
        >
          {initials}
        </span>
      )}
    </div>
  );
};

const StatCard: React.FC<{
  icon: string;
  label: string;
  value: number | string;
  change?: string;
  color: string;
  iconBg: string;
}> = ({ icon, label, value, change, color, iconBg }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
    <div className="flex items-start justify-between mb-4">
      <div
        className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}
      >
        <UniversalIcon name={icon} size={24} className={color} />
      </div>
      {change && (
        <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
          {change}
        </span>
      )}
    </div>
    <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
    <div className="text-sm text-gray-500 font-medium">{label}</div>
  </div>
);

const ProjectCard: React.FC<{
  title: string;
  category: string;
  status: string;
  progress: number;
  team: TeamMember[];
  dueDate?: string;
}> = ({ title, category, status, progress, team, dueDate }) => (
  <div className="bg-white rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition-all duration-200">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-500">{category}</p>
      </div>
      <span
        className={`text-xs px-3 py-1 rounded-full font-medium ${
          status === "Ongoing"
            ? "bg-blue-50 text-blue-600"
            : status === "Completed"
              ? "bg-green-50 text-green-600"
              : "bg-gray-50 text-gray-600"
        }`}
      >
        {status}
      </span>
    </div>

    <div className="flex items-center gap-2 mb-3">
      <div className="flex -space-x-2">
        {team.slice(0, 4).map((member, idx) => (
          <Avatar
            key={idx}
            name={member.name}
            size={28}
            src={member.avatar}
            className="border-2 border-white"
          />
        ))}
        {team.length > 4 && (
          <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-600">
              +{team.length - 4}
            </span>
          </div>
        )}
      </div>
    </div>

    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-600">
        <span>Progress</span>
        <span className="font-semibold">{progress}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            progress >= 75
              ? "bg-green-500"
              : progress >= 50
                ? "bg-blue-500"
                : "bg-orange-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      {dueDate && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
          <UniversalIcon name="Calendar" size={12} />
          <span>Due {dueDate}</span>
        </div>
      )}
    </div>
  </div>
);

const isAppointmentArray = (value: unknown): value is Appointment[] => {
  return Array.isArray(value);
};

const AdminDashboard: React.FC = () => {
  const auth = useAuth();
  const {user, logout,} = auth;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [stats, setStats] = useState<DashboardStats>({
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

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const isAdmin = auth.user?.profile?.role === "ADMIN";

  useEffect(() => {
    const checkAuth = async (): Promise<void> => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        try {
          const payload = JSON.parse(atob(token.split(".")[1])) as {
            exp: number;
          };
          const exp = payload.exp * 1000;
          if (exp < Date.now()) {
            try {
              await apiService.refreshToken();
            } catch {
              logout();
              window.location.href = "/login";
              return;
            }
          }
        } catch {
          window.location.href = "/login";
          return;
        }
      } catch (error: unknown) {
        console.error("Auth check failed:", error);
        window.location.href = "/login";
      } finally {
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, [logout]);

  const loadDashboardData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      const createFetch = <T,>(fetchFn: () => Promise<T>) => {
        return async (): Promise<T> => {
          try {
            return await fetchFn();
          } catch (error: unknown) {
            const err = error as { message?: string };
            if (
              err.message?.includes("401") ||
              err.message?.includes("Unauthorized")
            ) {
              try {
                await apiService.refreshToken();
                return await fetchFn();
              } catch {
                logout();
                throw error;
              }
            }
            throw error;
          }
        };
      };

      const [staffData, appointmentsData, blogStats, postsData] =
        await Promise.all([
          createFetch(() => apiService.getStaffMembers())().catch(
            (): StaffMember[] => [],
          ),
          createFetch(() => apiService.getAppointments())().catch(
            (): Appointment[] => [],
          ),
          createFetch(() => apiService.getBlogStats())().catch(() => ({
            total_posts: 0,
            published_posts: 0,
            draft_posts: 0,
            posts_with_toc: 0,
            toc_usage_rate: 0,
          })),
          createFetch(async () => {
            const posts = await apiService.getAllBlogPosts();
            return posts as unknown as BlogPost[];
          })().catch((): BlogPost[] => []),
        ]);

      const safeStaff: StaffMember[] = Array.isArray(staffData)
        ? staffData
        : [];
      const safeAppointments = isAppointmentArray(appointmentsData)
        ? appointmentsData
        : [];
      const safePosts: BlogPost[] = Array.isArray(postsData) ? postsData : [];

      setStaff(safeStaff);
      setAppointments(safeAppointments);
      setBlogPosts(safePosts);

      const patientMap = new Map<number, Patient>();
      safeAppointments.forEach((appt: Appointment) => {
        if (appt?.patient?.id && !patientMap.has(appt.patient.id)) {
          patientMap.set(appt.patient.id, {
            ...appt.patient,
            appointments_count: safeAppointments.filter(
              (x: Appointment) => x?.patient?.id === appt.patient?.id,
            ).length,
          });
        }
      });
      setPatients(Array.from(patientMap.values()));

      setStats({
        totalPatients: patientMap.size,
        totalDoctors: safeStaff.filter((s: StaffMember) => s?.role === "DOCTOR")
          .length,
        totalNurses: safeStaff.filter((s: StaffMember) => s?.role === "NURSE")
          .length,
        totalLabScientists: safeStaff.filter(
          (s: StaffMember) => s?.role === "LAB",
        ).length,
        totalAppointments: safeAppointments.length,
        blogStats: blogStats as DashboardStats["blogStats"],
      });
    } catch (err: unknown) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  },[auth]);
  useEffect(() => {
    if (!authChecking && isAdmin) {
      loadDashboardData();
    }
  }, [authChecking, isAdmin, loadDashboardData]);


  const handleDeleteBlogPost = async (slug: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      await apiService.deleteBlogPost(slug);
      setBlogPosts(blogPosts.filter((post) => post.slug !== slug));
      loadDashboardData();
    } catch (error: unknown) {
      console.error("Failed to delete blog post:", error);
      alert("Failed to delete blog post. Please try again.");
    }
  };

  const handleViewBlogPost = (slug: string): void => {
    window.open(`/blog/${slug}`, "_blank");
  };

  const handleEditBlogPost = (slug: string): void => {
    window.location.href = `/admin/blog/edit/${slug}`;
  };

  const navItems = [
    { id: "overview", label: "Dashboard", icon: "Home" },
    {
      id: "patients",
      label: "Patients",
      icon: "User",
      count: stats.totalPatients,
    },
    { id: "staff", label: "Staff", icon: "Users", count: staff.length },
    {
      id: "appointments",
      label: "Appointments",
      icon: "Calendar",
      count: appointments.length,
    },
    {
      id: "blog",
      label: "Blog",
      icon: "FileText",
      count: stats.blogStats.total_posts,
    },
    { id: "analytics", label: "Analytics", icon: "BarChart" },
  ];

  const filteredPatients = useMemo(
    () =>
      searchQuery
        ? patients.filter(
            (p) =>
              p?.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : patients,
    [patients, searchQuery],
  );

  const filteredStaff = useMemo(
    () =>
      searchQuery
        ? staff.filter(
            (s) =>
              s?.fullname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              s?.role?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : staff,
    [staff, searchQuery],
  );

  const filteredBlogPosts = useMemo(
    () =>
      searchQuery
        ? blogPosts.filter(
            (p) =>
              p?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              p?.description?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : blogPosts,
    [blogPosts, searchQuery],
  );

  if (authChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UniversalIcon name="X" size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Admin privileges required to access this dashboard.
          </p>
          <button
            onClick={() => auth.logout()}
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
          <p className="text-gray-600 font-medium">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const monthlyData = [
    { month: "Jan", value: 145 },
    { month: "Feb", value: 163 },
    { month: "Mar", value: 142 },
    { month: "Apr", value: 178 },
    { month: "May", value: 195 },
    { month: "Jun", value: 210 },
    { month: "Jul", value: 198 },
    { month: "Aug", value: 187 },
  ];

  const maxValue = Math.max(...monthlyData.map((d) => d.value));

  const ongoingProjects: Array<{
    title: string;
    category: string;
    status: string;
    progress: number;
    dueDate: string;
    team: TeamMember[];
  }> = [
    {
      title: "Patient Portal Development",
      category: "Web Design & Development",
      status: "Ongoing",
      progress: 67,
      dueDate: "Aug 17, 2024",
      team: [
        { name: "John Doe", avatar: null },
        { name: "Jane Smith", avatar: null },
        { name: "Mike Johnson", avatar: null },
      ],
    },
    {
      title: "Lab Results System",
      category: "Backend Integration",
      status: "Ongoing",
      progress: 45,
      dueDate: "Aug 25, 2024",
      team: [
        { name: "Sarah Connor", avatar: null },
        { name: "Tom Hardy", avatar: null },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <UniversalIcon name="Activity" size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Etha-Atlantic</h1>
              <p className="text-xs text-gray-500">Healthcare System</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">
            Menu
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                  isActive
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <UniversalIcon
                  name={item.icon}
                  size={20}
                  className={
                    isActive
                      ? "text-blue-600"
                      : "text-gray-400 group-hover:text-gray-600"
                  }
                />
                <span className="flex-1 text-left font-medium text-sm">
                  {item.label}
                </span>
                {item.count !== undefined && (
                  <span
                    className={`text-xs px-2.5 py-1 rounded-lg font-semibold ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
            <Avatar name={user?.profile?.fullname || "Admin"} src={imgUrl(auth.user?.profile)} size={40} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {auth.user?.profile?.fullname || "Admin"}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={() => auth.logout()}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Logout"
            >
              <UniversalIcon
                name="LogOut"
                size={16}
                className="text-gray-400"
              />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Hey, {auth.user?.profile?.fullname?.split(" ")[0] || "Admin"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">{currentDate}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <UniversalIcon
                  name="Search"
                  size={16}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Start searching here..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                />
              </div>
              <button
                onClick={loadDashboardData}
                className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors"
                title="Refresh Data"
              >
                <UniversalIcon
                  name="RefreshCw"
                  size={20}
                  className="text-gray-600"
                />
              </button>
              <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors">
                <UniversalIcon
                  name="Settings"
                  size={20}
                  className="text-gray-600"
                />
              </button>
              <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-colors relative">
                <UniversalIcon
                  name="Bell"
                  size={20}
                  className="text-gray-600"
                />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <UniversalIcon
                        name="Activity"
                        size={24}
                        className="text-white"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        System Performance Update
                      </h3>
                      <p className="text-blue-100 text-sm">
                        We have observed excellent system performance with{" "}
                        {stats.totalAppointments} appointments processed this
                        month. Keep up the great work!
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-semibold text-sm">
                    View Details
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon="Users"
                  label="Active Employees"
                  value={staff.length}
                  change="+5.2%"
                  color="text-blue-600"
                  iconBg="bg-blue-50"
                />
                <StatCard
                  icon="Calendar"
                  label="Total Appointments"
                  value={stats.totalAppointments}
                  change="+12.3%"
                  color="text-green-600"
                  iconBg="bg-green-50"
                />
                <StatCard
                  icon="User"
                  label="Total Patients"
                  value={stats.totalPatients}
                  change="+8.1%"
                  color="text-purple-600"
                  iconBg="bg-purple-50"
                />
                <StatCard
                  icon="Activity"
                  label="Completion Rate"
                  value={`${Math.round((appointments.filter((a) => a?.status === "COMPLETED").length / Math.max(appointments.length, 1)) * 100)}%`}
                  change="+2.4%"
                  color="text-orange-600"
                  iconBg="bg-orange-50"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        On Going Projects
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Best performing projects ranking
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <UniversalIcon
                          name="Search"
                          size={18}
                          className="text-gray-400"
                        />
                      </button>
                      <button className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <UniversalIcon
                          name="Filter"
                          size={18}
                          className="text-gray-400"
                        />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {ongoingProjects.map((project, idx) => (
                      <ProjectCard key={idx} {...project} />
                    ))}

                    {appointments.slice(0, 2).map((appt, idx) => (
                      <ProjectCard
                        key={`appt-${idx}`}
                        title={`Appointment: ${appt?.name || "Patient"}`}
                        category={`${appt?.sex === "M" ? "Male" : "Female"} • Age ${appt?.age || "N/A"}`}
                        status={
                          appt?.status === "COMPLETED" ? "Completed" : "Ongoing"
                        }
                        progress={appt?.status === "COMPLETED" ? 100 : 50}
                        dueDate={
                          appt?.booked_at
                            ? new Date(appt.booked_at).toLocaleDateString()
                            : undefined
                        }
                        team={[
                          {
                            name: appt?.doctor?.fullname || "Unassigned",
                            avatar: null,
                          },
                        ]}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        Graphs and Analysis
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Projects completed per month
                      </p>
                    </div>
                    <select className="text-sm border-0 bg-transparent text-gray-600 font-medium focus:outline-none cursor-pointer">
                      <option>Month</option>
                      <option>Week</option>
                      <option>Year</option>
                    </select>
                  </div>

                  <div className="space-y-3 mb-6">
                    {monthlyData.map((data, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="text-xs font-medium text-gray-500 w-8">
                          {data.month}
                        </span>
                        <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg transition-all duration-500"
                            style={{
                              width: `${(data.value / maxValue) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-900 w-8 text-right">
                          {data.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                        <span className="text-gray-600">Projects Done</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {monthlyData.reduce((sum, d) => sum + d.value, 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-sm" />
                        <span className="text-gray-600">Pages Done</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {monthlyData.reduce((sum, d) => sum + d.value, 0) * 12}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-sm" />
                        <span className="text-gray-600">Project On Hold</span>
                      </div>
                      <span className="font-semibold text-gray-900">14</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "patients" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Patient Management
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredPatients.length} patients found
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <UniversalIcon name="Plus" size={16} />
                    <span className="font-medium">Add Patient</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Appointments
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPatients.map((patient, idx) => (
                      <tr
                        key={patient?.id || idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={patient?.fullname || "P"} size={40} />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {patient?.fullname || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {patient?.id || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {patient?.user?.email || "No email"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {patient?.phone || "No phone"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold">
                            <UniversalIcon name="Calendar" size={12} />
                            {patient?.appointments_count || 0} visits
                          </span>
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
                              <UniversalIcon
                                name="Eye"
                                size={16}
                                className="text-blue-600"
                              />
                            </button>
                            <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                              <UniversalIcon
                                name="Edit"
                                size={16}
                                className="text-green-600"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "staff" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Staff Management
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredStaff.length} staff members
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center gap-2">
                    <UniversalIcon name="Plus" size={16} />
                    <span className="font-medium">Add Staff</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Staff Member
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredStaff.map((member, idx) => (
                      <tr
                        key={member?.id || idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={member?.fullname || "S"} size={40} />
                            <div>
                              <p className="font-semibold text-gray-900">
                                {member?.fullname || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500">
                                ID: {member?.id || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-lg text-xs font-semibold ${
                              member?.role === "DOCTOR"
                                ? "bg-blue-50 text-blue-600"
                                : member?.role === "NURSE"
                                  ? "bg-purple-50 text-purple-600"
                                  : "bg-orange-50 text-orange-600"
                            }`}
                          >
                            {member?.role || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {member?.user?.email || "No email"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member?.phone || "No phone"}
                          </p>
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
                              <UniversalIcon
                                name="Eye"
                                size={16}
                                className="text-blue-600"
                              />
                            </button>
                            <button className="p-2 hover:bg-green-50 rounded-lg transition-colors">
                              <UniversalIcon
                                name="Edit"
                                size={16}
                                className="text-green-600"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "blog" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Blog Management
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {filteredBlogPosts.length} blog posts
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/admin/blog/new")}
                    className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    <UniversalIcon name="Plus" size={16} />
                    <span className="font-medium">New Post</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBlogPosts.map((post, idx) => (
                      <tr
                        key={post?.id || idx}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 max-w-xs">
                          <p className="font-semibold text-gray-900 truncate">
                            {post?.title || "Untitled"}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {post?.description || "No description"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={post?.author?.fullname || "A"}
                              size={32}
                            />
                            <span className="text-sm text-gray-900">
                              {post?.author?.fullname || "Unknown"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold ${
                              post?.published
                                ? "bg-green-50 text-green-700"
                                : "bg-orange-50 text-orange-700"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                post?.published
                                  ? "bg-green-500"
                                  : "bg-orange-500"
                              }`}
                            />
                            {post?.published ? "Published" : "Draft"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-900">
                            {post?.created_at
                              ? new Date(post.created_at).toLocaleDateString()
                              : "Unknown"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewBlogPost(post?.slug)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Post"
                            >
                              <UniversalIcon
                                name="Eye"
                                size={16}
                                className="text-blue-600"
                              />
                            </button>
                            <button
                              onClick={() => handleEditBlogPost(post?.slug)}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Edit Post"
                            >
                              <UniversalIcon
                                name="Edit"
                                size={16}
                                className="text-green-600"
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteBlogPost(post?.slug)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Post"
                            >
                              <UniversalIcon
                                name="Trash"
                                size={16}
                                className="text-red-600"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {(activeTab === "appointments" || activeTab === "analytics") && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UniversalIcon
                  name={activeTab === "appointments" ? "Calendar" : "BarChart"}
                  size={40}
                  className="text-gray-400"
                />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h3>
              <p className="text-gray-600 mb-6">
                This section is under development
              </p>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                Coming Soon
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
