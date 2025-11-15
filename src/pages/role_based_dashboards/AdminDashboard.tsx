// components/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

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

interface StaffMember {
  id: number;
  fullname: string;
  role: string;
  user: {
    email: string;
    username: string;
  };
}

interface Patient {
  id: number;
  fullname: string;
  user: {
    email: string;
    username: string;
  };
  appointments_count: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'patients' | 'staff' | 'blog'>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  // Safe checks throughout the component
  const isAdmin = user?.profile?.role === 'ADMIN';
  const userName = user?.profile?.fullname || 'Admin';

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load staff members
      const staffData = await apiService.getStaffMembers();
      setStaff(staffData);

      // Load appointments to get patient data
      const appointments = await apiService.getAppointments();
      
      // Extract unique patients from appointments
      const patientMap = new Map();
      appointments.forEach((appointment: any) => {
        if (appointment.patient && !patientMap.has(appointment.patient.id)) {
          patientMap.set(appointment.patient.id, {
            ...appointment.patient,
            appointments_count: appointments.filter((a: any) => a.patient?.id === appointment.patient.id).length
          });
        }
      });
      setPatients(Array.from(patientMap.values()));

      // Load blog stats
      const blogStats = await apiService.getBlogStats();

      // Calculate dashboard stats
      const dashboardStats: DashboardStats = {
        totalPatients: patientMap.size,
        totalDoctors: staffData.filter((s: StaffMember) => s.role === 'DOCTOR').length,
        totalNurses: staffData.filter((s: StaffMember) => s.role === 'NURSE').length,
        totalLabScientists: staffData.filter((s: StaffMember) => s.role === 'LAB').length,
        totalAppointments: appointments.length,
        blogStats: blogStats
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Access denied. Admin role required.</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="text-sm text-gray-500">
              Welcome, {userName}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview' },
              { id: 'patients', name: 'Patients' },
              { id: 'staff', name: 'Staff' },
              { id: 'blog', name: 'Blog Management' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'patients' && <PatientsTab patients={patients} />}
          {activeTab === 'staff' && <StaffTab staff={staff} />}
          {activeTab === 'blog' && <BlogManagementTab />}
        </div>
      </div>
    </div>
  );
};

// Overview Tab Component
const OverviewTab: React.FC<{ stats: DashboardStats | null }> = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {/* Hospital Stats */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">👥</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalPatients}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">👨‍⚕️</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Doctors</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalDoctors}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">👩‍⚕️</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Nurses</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalNurses}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">🔬</span>
              </div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Lab Scientists</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalLabScientists}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Stats */}
      <div className="bg-white overflow-hidden shadow rounded-lg col-span-2">
        <div className="p-5">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Blog Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Total Posts</dt>
              <dd className="text-2xl font-bold text-blue-600">{stats.blogStats.total_posts}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Published</dt>
              <dd className="text-2xl font-bold text-green-600">{stats.blogStats.published_posts}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Drafts</dt>
              <dd className="text-2xl font-bold text-yellow-600">{stats.blogStats.draft_posts}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">With TOC</dt>
              <dd className="text-2xl font-bold text-purple-600">{stats.blogStats.posts_with_toc}</dd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Patients Tab Component
const PatientsTab: React.FC<{ patients: Patient[] }> = ({ patients }) => {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Patients</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">All registered patients in the system.</p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {patients.map((patient) => (
            <li key={patient.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {patient.fullname.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{patient.fullname}</div>
                    <div className="text-sm text-gray-500">{patient.user.email}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {patient.appointments_count} appointment(s)
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Staff Tab Component
const StaffTab: React.FC<{ staff: StaffMember[] }> = ({ staff }) => {
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'DOCTOR': return 'bg-blue-100 text-blue-800';
      case 'NURSE': return 'bg-purple-100 text-purple-800';
      case 'LAB': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Staff Members</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">All hospital staff including doctors, nurses, and lab scientists.</p>
      </div>
      <div className="border-t border-gray-200">
        <ul className="divide-y divide-gray-200">
          {staff.map((member) => (
            <li key={member.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 text-sm font-medium">
                        {member.fullname.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">{member.fullname}</div>
                    <div className="text-sm text-gray-500">{member.user.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Blog Management Tab Component
const BlogManagementTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Blog Management</h3>
        <button
          onClick={() => window.location.href = '/blog/admin/create'}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create New Post
        </button>
      </div>
      
      <BlogPostList />
    </div>
  );
};

// Blog Post List Component
const BlogPostList: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      const blogPosts = await apiService.getAllBlogPosts();
      setPosts(blogPosts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await apiService.deleteBlogPost(slug);
      loadBlogPosts(); // Reload the list
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading blog posts...</div>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Blog Posts</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">Manage all blog posts and their publication status.</p>
      </div>
      <div className="border-t border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
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
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.published 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {post.author?.fullname}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => window.location.href = `/blog/admin/edit/${post.slug}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;