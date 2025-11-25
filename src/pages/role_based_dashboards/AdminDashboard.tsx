import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/api";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  FileText,
  Activity,
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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staff, setStaff] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isAdmin = user?.profile?.role === "ADMIN";

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all data
      const [staffData, appointments, blogStats, allBlogPosts] =
        await Promise.all([
          apiService.getStaffMembers(),
          apiService.getAppointments(),
          apiService.getBlogStats(),
          apiService.getAllBlogPosts(),
        ]);

      setStaff(staffData);
      setBlogPosts(allBlogPosts);

      // Extract unique patients
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

      // Calculate stats
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">
          Access denied. Admin role required.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Manage patients, staff, and blog content
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              {
                id: "overview",
                name: "Overview",
                icon: <Activity className="w-5 h-5" />,
              },
              {
                id: "patients",
                name: "Patients",
                icon: <Users className="w-5 h-5" />,
              },
              {
                id: "staff",
                name: "Staff",
                icon: <Users className="w-5 h-5" />,
              },
              {
                id: "blog",
                name: "Blog Management",
                icon: <FileText className="w-5 h-5" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === "overview" && <OverviewTab stats={stats} />}
        {activeTab === "patients" && <PatientsTab patients={patients} />}
        {activeTab === "staff" && <StaffTab staff={staff} />}
        {activeTab === "blog" && (
          <BlogManagementTab
            posts={blogPosts}
            onRefresh={loadDashboardData}
            onCreateNew={() => setShowCreateModal(true)}
          />
        )}
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

// Overview Tab
const OverviewTab: React.FC<{ stats: DashboardStats | null }> = ({ stats }) => {
  if (!stats) return null;

  const statCards = [
    {
      label: "Total Patients",
      value: stats.totalPatients,
      color: "bg-blue-500",
      icon: "👥",
    },
    {
      label: "Doctors",
      value: stats.totalDoctors,
      color: "bg-green-500",
      icon: "👨‍⚕️",
    },
    {
      label: "Nurses",
      value: stats.totalNurses,
      color: "bg-purple-500",
      icon: "👩‍⚕️",
    },
    {
      label: "Lab Scientists",
      value: stats.totalLabScientists,
      color: "bg-yellow-500",
      icon: "🔬",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div
                className={`${stat.color} text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl`}
              >
                {stat.icon}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Blog Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Blog Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Posts</p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.blogStats.total_posts}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Published</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.blogStats.published_posts}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Drafts</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.blogStats.draft_posts}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">With TOC</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.blogStats.posts_with_toc}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Patients Tab
const PatientsTab: React.FC<{ patients: any[] }> = ({ patients }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b">
      <h3 className="text-lg font-semibold">All Patients</h3>
      <p className="text-sm text-gray-600">
        {patients.length} registered patients
      </p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Appointments
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">{patient.fullname}</td>
              <td className="px-6 py-4 text-gray-600">{patient.user.email}</td>
              <td className="px-6 py-4">{patient.appointments_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Staff Tab
const StaffTab: React.FC<{ staff: any[] }> = ({ staff }) => (
  <div className="bg-white rounded-lg shadow">
    <div className="px-6 py-4 border-b">
      <h3 className="text-lg font-semibold">Staff Members</h3>
      <p className="text-sm text-gray-600">{staff.length} staff members</p>
    </div>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {staff.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">{member.fullname}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
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
              <td className="px-6 py-4 text-gray-600">{member.user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Blog Management Tab
const BlogManagementTab: React.FC<{
  posts: any[];
  onRefresh: () => void;
  onCreateNew: () => void;
}> = ({ posts, onRefresh, onCreateNew }) => {
  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await apiService.deleteBlogPost(slug);
      onRefresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Blog Posts</h3>
          <p className="text-sm text-gray-600">{posts.length} total posts</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Post</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{post.title}</div>
                  <div className="text-sm text-gray-500">
                    {post.description?.substring(0, 60)}...
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      post.published
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {post.published ? "Published" : "Draft"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <button className="text-gray-600 hover:text-gray-900">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(post.slug)}
                      className="text-red-600 hover:text-red-900"
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
  );
};

// Create Blog Modal Component
// pages/role_based_dashboards/AdminDashboard.tsx - Update CreateBlogModal
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

      console.log("Creating blog post with data:", {
        title: formData.title,
        published: formData.published,
        hasFeaturedImage: !!featuredImage,
        hasImage1: !!image1,
        hasImage2: !!image2,
      });

      await apiService.createBlogPost(formDataToSend);
      
      // Refresh blog data
      await Promise.all([
        apiService.getAllBlogPosts(),
        apiService.getLatestBlogPosts(),
      ]);

      console.log("Blog post created successfully!");
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold">Create New Blog Post</h2>
          <p className="text-sm text-gray-600 mt-1">
            Add a main image and two additional images for your blog post
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter blog post title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter a brief description that will appear on the blog listing"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            <textarea
              required
              rows={15}
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
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
            <p className="text-sm text-gray-500 mt-1">
              Use HTML heading tags (h1-h6) for subheadings. They will be automatically extracted for the table of contents.
            </p>
          </div>

          {/* Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Image (Main) *
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                className="w-full text-sm"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Main image displayed at top</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Image 1
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage1(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Second image for content</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Image 2
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage2(e.target.files?.[0] || null)}
                className="w-full text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">Third image for content</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={(e) =>
                  setFormData({ ...formData, published: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm font-medium">Publish immediately</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.enable_toc}
                onChange={(e) =>
                  setFormData({ ...formData, enable_toc: e.target.checked })
                }
                className="mr-2"
              />
              <span className="text-sm font-medium">Enable table of contents</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? "Creating..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;
