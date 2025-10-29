// components/dashboards/PatientDashboard.tsx - Enhanced version
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Calendar, FileText, Activity, Download } from 'lucide-react';

interface Appointment {
  id: number;
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
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: 'M',
    address: '',
    message: ''
  });

  useEffect(() => {
    loadAppointments();
    
    // Auto-refresh appointments every 30 seconds to get updates
    const interval = setInterval(() => {
      loadAppointments();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await apiService.getAppointments();
      console.log('Loaded appointments for patient:', data);
      setAppointments(data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const appointmentData = {
        name: formData.name,
        age: parseInt(formData.age),
        sex: formData.sex,
        address: formData.address,
        message: formData.message || ''
      };

      console.log('Sending appointment data:', appointmentData);
      
      await apiService.createAppointment(appointmentData);
      setShowAppointmentForm(false);
      setFormData({ name: '', age: '', sex: 'M', address: '', message: '' });
      
      await loadAppointments();
      alert('Appointment booked successfully!');
      
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('Failed to create appointment. Please check your data and try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_REVIEW': return 'bg-blue-100 text-blue-800';
      case 'AWAITING_RESULTS': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to download medical report as PDF (placeholder)
  const downloadMedicalReport = (appointment: Appointment) => {
    if (!appointment.medical_report) return;
    
    const report = appointment.medical_report;
    const content = `
      MEDICAL REPORT
      ==============
      
      Patient: ${appointment.name}
      Age: ${appointment.age} | Gender: ${appointment.sex === 'M' ? 'Male' : 'Female'}
      Date: ${new Date().toLocaleDateString()}
      
      DIAGNOSIS
      ---------
      ${report.medical_condition}
      
      PRESCRIPTION
      ------------
      ${report.drug_prescription || 'No prescription'}
      
      MEDICAL ADVICE
      --------------
      ${report.advice || 'No specific advice'}
      
      ${report.next_appointment ? `Next Appointment: ${report.next_appointment}` : ''}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-report-${appointment.name}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED');
  const pendingAppointments = appointments.filter(a => a.status !== 'COMPLETED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.profile?.fullname || user?.username || 'User'}
        </h1>
        <p className="text-gray-600 mt-2">Patient Dashboard</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Book Appointment</h3>
              <button
                onClick={() => setShowAppointmentForm(true)}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Medical Reports</h3>
              <p className="text-2xl font-bold text-green-600">
                {appointments.filter(a => a.medical_report).length}
              </p>
              <p className="text-gray-600">Available reports</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Appointments</h3>
              <p className="text-2xl font-bold text-purple-600">{appointments.length}</p>
              <p className="text-gray-600">All visits</p>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Form Modal */}
      {showAppointmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Book New Appointment</h3>
            <form onSubmit={handleSubmitAppointment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Enter your age"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Enter your complete address"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Symptoms/Message (Optional)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Describe your symptoms or any message for the doctor"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAppointmentForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Completed Appointments with Medical Reports */}
      {completedAppointments.length > 0 && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-green-800">Completed Appointments with Medical Reports</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {completedAppointments.map((appointment) => (
                <div key={appointment.id} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">{appointment.name}</h3>
                      <p className="text-gray-600">
                        Age: {appointment.age} | Gender: {appointment.sex === 'M' ? 'Male' : appointment.sex === 'F' ? 'Female' : 'Other'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Booked: {new Date(appointment.booked_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('_', ' ')}
                      </span>
                      {appointment.medical_report && (
                        <button
                          onClick={() => downloadMedicalReport(appointment)}
                          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download Report
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Medical Report - Highlighted */}
                  {appointment.medical_report && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-semibold text-green-800 text-lg">Medical Report</h4>
                        <span className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm">
                          COMPLETED
                        </span>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium text-gray-700">Diagnosis:</p>
                          <p className="text-gray-900 bg-white p-2 rounded border">{appointment.medical_report.medical_condition}</p>
                        </div>
                        {appointment.medical_report.drug_prescription && (
                          <div>
                            <p className="font-medium text-gray-700">Prescription:</p>
                            <p className="text-gray-900 bg-white p-2 rounded border">{appointment.medical_report.drug_prescription}</p>
                          </div>
                        )}
                      </div>
                      {appointment.medical_report.advice && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-700">Medical Advice:</p>
                          <p className="text-gray-900 bg-white p-2 rounded border">{appointment.medical_report.advice}</p>
                        </div>
                      )}
                      {appointment.medical_report.next_appointment && (
                        <div className="mt-3">
                          <p className="font-medium text-gray-700">Next Appointment:</p>
                          <p className="text-gray-900 bg-white p-2 rounded border">{appointment.medical_report.next_appointment}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Vitals */}
                  {appointment.vitals && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-800">Vital Signs</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                        <p>BP: {appointment.vitals.blood_pressure || 'N/A'}</p>
                        <p>Pulse: {appointment.vitals.pulse_rate || 'N/A'}</p>
                        <p>Temp: {appointment.vitals.body_temperature ? `${appointment.vitals.body_temperature}°C` : 'N/A'}</p>
                        <p>Respiration: {appointment.vitals.respiration_rate || 'N/A'}</p>
                      </div>
                    </div>
                  )}

                  {/* Lab Results */}
                  {appointment.lab_results && appointment.lab_results.length > 0 && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800">Lab Results</h4>
                      {appointment.lab_results.map((result, index) => (
                        <div key={index} className="mt-2 p-2 bg-white rounded border">
                          <p><strong>{result.test_name}:</strong> {result.result} {result.units}</p>
                          {result.reference_range && (
                            <p className="text-sm text-gray-600">Reference: {result.reference_range}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending Appointments */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">
            {pendingAppointments.length > 0 ? 'Pending Appointments' : 'My Appointments'}
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {appointments.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No appointments found. Book your first appointment above.
            </div>
          ) : pendingAppointments.length === 0 && completedAppointments.length > 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              All appointments are completed. Check your medical reports above.
            </div>
          ) : (
            pendingAppointments.map((appointment) => (
              <div key={appointment.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{appointment.name}</h3>
                    <p className="text-gray-600">
                      Age: {appointment.age} | Gender: {appointment.sex === 'M' ? 'Male' : appointment.sex === 'F' ? 'Female' : 'Other'}
                    </p>
                    <p className="text-gray-600 mt-1">{appointment.address}</p>
                    {appointment.message && (
                      <p className="text-gray-600 mt-1">Message: {appointment.message}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Booked: {new Date(appointment.booked_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                    {appointment.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Show progress for pending appointments */}
                {appointment.status !== 'COMPLETED' && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-yellow-800">
                      <strong>Status:</strong> {appointment.status.replace('_', ' ')} - Your appointment is being processed.
                      {appointment.status === 'IN_REVIEW' && ' Doctor is reviewing your results.'}
                      {appointment.status === 'AWAITING_RESULTS' && ' Waiting for test results.'}
                      {appointment.status === 'PENDING' && ' Waiting for doctor assignment.'}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;