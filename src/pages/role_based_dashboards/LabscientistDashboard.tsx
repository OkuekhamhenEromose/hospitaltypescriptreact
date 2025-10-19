// components/dashboards/LabScientistDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Beaker, Clipboard, Users } from 'lucide-react';

interface TestRequest {
  id: number;
  appointment: {
    id: number;
    name: string;
    age: number;
    sex: string;
  };
  tests: string;
  note: string;
  status: string;
  created_at: string;
}

const LabScientistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [testRequests, setTestRequests] = useState<TestRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<TestRequest | null>(null);
  const [showLabResultForm, setShowLabResultForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [labResultData, setLabResultData] = useState({
    test_name: '',
    result: '',
    units: '',
    reference_range: ''
  });

  useEffect(() => {
    loadTestRequests();
  }, []);

  const loadTestRequests = async () => {
    try {
      const data = await apiService.getTestRequests();
      setTestRequests(data);
    } catch (error) {
      console.error('Failed to load test requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLabResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await apiService.createLabResult({
        test_request: selectedRequest.id,
        ...labResultData
      });
      setShowLabResultForm(false);
      setLabResultData({
        test_name: '',
        result: '',
        units: '',
        reference_range: ''
      });
      loadTestRequests();
    } catch (error) {
      console.error('Failed to submit lab result:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
          Lab Scientist {user?.profile?.fullname || user?.username}
        </h1>
        <p className="text-gray-600 mt-2">Laboratory Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Beaker className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Total Requests</h3>
              <p className="text-2xl font-bold">{testRequests.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clipboard className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Pending</h3>
              <p className="text-2xl font-bold">
                {testRequests.filter(r => r.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <h3 className="text-lg font-semibold">Completed</h3>
              <p className="text-2xl font-bold">
                {testRequests.filter(r => r.status === 'DONE').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Requests List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Laboratory Test Requests</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {testRequests.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No test requests assigned to you.
            </div>
          ) : (
            testRequests.map((request) => (
              <div key={request.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{request.appointment.name}</h3>
                    <p className="text-gray-600">
                      Age: {request.appointment.age} | Gender: {request.appointment.sex === 'M' ? 'Male' : 'Female'}
                    </p>
                    <p className="text-gray-600 mt-1">
                      <strong>Tests Required:</strong> {request.tests}
                    </p>
                    {request.note && (
                      <p className="text-gray-600 mt-1">Doctor's Note: {request.note}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Requested: {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status.replace('_', ' ')}
                    </span>
                    
                    {request.status === 'PENDING' && (
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowLabResultForm(true);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Submit Results
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Lab Result Form Modal */}
      {showLabResultForm && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Submit Lab Results for {selectedRequest.appointment.name}
            </h3>
            <form onSubmit={handleSubmitLabResult} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Test Name</label>
                <select
                  value={labResultData.test_name}
                  onChange={(e) => setLabResultData({ ...labResultData, test_name: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                >
                  <option value="">Select Test</option>
                  {selectedRequest.tests.split(',').map((test, index) => (
                    <option key={index} value={test.trim()}>
                      {test.trim()}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Result</label>
                <input
                  type="text"
                  value={labResultData.result}
                  onChange={(e) => setLabResultData({ ...labResultData, result: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Units</label>
                <input
                  type="text"
                  value={labResultData.units}
                  onChange={(e) => setLabResultData({ ...labResultData, units: e.target.value })}
                  placeholder="e.g., mg/dL, mmol/L"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Reference Range</label>
                <input
                  type="text"
                  value={labResultData.reference_range}
                  onChange={(e) => setLabResultData({ ...labResultData, reference_range: e.target.value })}
                  placeholder="e.g., 70-100 mg/dL"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLabResultForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Submit Result
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabScientistDashboard;