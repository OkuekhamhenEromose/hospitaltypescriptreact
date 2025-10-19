// components/dashboards/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// import { apiService } from '../../services/api';
import { Users, Calendar, FileText, Settings } from 'lucide-react';

interface Stats {
  totalPatients: number;
  totalDoctors: number;
  totalNurses: number;
  totalLabScientists: number;
  totalAppointments: number;
  pendingAppointments: number;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalPatients: 0,
    totalDoctors: 0,
    totalNurses: 0,
    totalLabScientists: 0,
    totalAppointments: 0,
    pendingAppointments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // In a real app, you'd have API endpoints for these stats
      // For now, we'll simulate the data
      const simulatedStats: Stats = {
        totalPatients: 1247,
        totalDoctors: 23,
        totalNurses: 45,
        totalLabScientists: 12,
        totalAppointments: 289,
        pendingAppointments: 34
      };
      setStats(simulatedStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin {user?.profile?.fullname || user?.username}
        </h1>
        <p className="text-gray-600 mt-2">Administrator Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Patients</h3>
              <p className="text-2xl font-bold">{stats.totalPatients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Medical Staff</h3>
              <p className="text-2xl font-bold">
                {stats.totalDoctors + stats.totalNurses + stats.totalLabScientists}
              </p>
              <p className="text-sm text-gray-600">
                {stats.totalDoctors} Doctors, {stats.totalNurses} Nurses, {stats.totalLabScientists} Lab Scientists
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Appointments</h3>
              <p className="text-2xl font-bold">{stats.totalAppointments}</p>
              <p className="text-sm text-gray-600">
                {stats.pendingAppointments} pending
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">User Management</h2>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-blue-600" />
                <div className="ml-3">
                  <h3 className="font-medium">Manage Patients</h3>
                  <p className="text-sm text-gray-600">View and manage patient accounts</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-green-600" />
                <div className="ml-3">
                  <h3 className="font-medium">Manage Staff</h3>
                  <p className="text-sm text-gray-600">Manage doctors, nurses, and lab staff</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* System Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">System Management</h2>
          </div>
          <div className="p-6 space-y-4">
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-purple-600" />
                <div className="ml-3">
                  <h3 className="font-medium">Appointment Overview</h3>
                  <p className="text-sm text-gray-600">View all appointments and status</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <FileText className="h-6 w-6 text-orange-600" />
                <div className="ml-3">
                  <h3 className="font-medium">Medical Records</h3>
                  <p className="text-sm text-gray-600">Access and manage medical records</p>
                </div>
              </div>
            </button>

            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <Settings className="h-6 w-6 text-gray-600" />
                <div className="ml-3">
                  <h3 className="font-medium">System Settings</h3>
                  <p className="text-sm text-gray-600">Configure system preferences</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium">New patient registration</p>
                <p className="text-sm text-gray-600">John Doe registered as a new patient</p>
              </div>
              <span className="text-sm text-gray-500">2 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div>
                <p className="font-medium">Appointment completed</p>
                <p className="text-sm text-gray-600">Medical report generated for Jane Smith</p>
              </div>
              <span className="text-sm text-gray-500">4 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">Lab tests completed</p>
                <p className="text-sm text-gray-600">Blood tests results submitted for Robert Johnson</p>
              </div>
              <span className="text-sm text-gray-500">6 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;