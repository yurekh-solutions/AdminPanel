import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, CheckCircle, XCircle, Clock, Eye, ChevronLeft, AlertTriangle } from 'lucide-react';

interface DeletionRequest {
  _id: string;
  requestType: 'account' | 'data';
  userType: 'buyer' | 'supplier';
  email: string;
  name: string;
  phoneNumber?: string;
  reason?: string;
  dataTypes?: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'rejected';
  submittedAt: string;
  processedAt?: string;
  processedBy?: { name: string; email: string };
  adminNotes?: string;
  ipAddress?: string;
  userAgent?: string;
}

const DeletionRequestManager: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DeletionRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterType]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        navigate('/admin/login');
        return;
      }

      const params = new URLSearchParams();
      if (filterStatus) params.append('status', filterStatus);
      if (filterType) params.append('requestType', filterType);

      const response = await fetch(
        `https://backendmatrix.onrender.com/api/privacy/deletion-requests?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setRequests(data.data || []);
      } else if (response.status === 401) {
        navigate('/admin/login');
      }
    } catch (error) {
      console.error('Error fetching deletion requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      setProcessing(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `https://backendmatrix.onrender.com/api/privacy/deletion-requests/${requestId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: newStatus,
            adminNotes: adminNotes,
          }),
        }
      );

      if (response.ok) {
        alert(`Request status updated to ${newStatus}`);
        setAdminNotes('');
        setSelectedRequest(null);
        fetchRequests();
      } else {
        alert('Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status');
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessAccountDeletion = async (requestId: string) => {
    if (!confirm('Are you sure you want to permanently delete this account? This action cannot be undone!')) {
      return;
    }

    try {
      setProcessing(true);
      const token = localStorage.getItem('adminToken');

      const response = await fetch(
        `https://backendmatrix.onrender.com/api/privacy/deletion-requests/${requestId}/process`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.accountDeleted ? 'Account deleted successfully!' : 'Account not found or already deleted');
        setSelectedRequest(null);
        fetchRequests();
      } else {
        alert(data.message || 'Failed to process deletion');
      }
    } catch (error) {
      console.error('Error processing deletion:', error);
      alert('Error processing deletion');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {status}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        type === 'account' ? 'bg-red-100 text-red-800' : 'bg-purple-100 text-purple-800'
      }`}>
        {type === 'account' ? 'Account Deletion' : 'Data Deletion'}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-200 rounded-lg transition"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">GDPR Deletion Requests</h1>
              <p className="text-gray-600 mt-1">Manage user account and data deletion requests</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="account">Account Deletion</option>
                <option value="data">Data Deletion</option>
              </select>
            </div>
          </div>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Trash2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No deletion requests</h3>
            <p className="text-gray-600">There are no deletion requests matching your filters</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request._id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getTypeBadge(request.requestType)}
                      {getStatusBadge(request.status)}
                      <span className="text-sm text-gray-500">
                        {request.userType === 'buyer' ? '👤 Buyer' : '🏢 Supplier'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.name}</h3>
                    <p className="text-gray-600">{request.email}</p>
                    {request.phoneNumber && (
                      <p className="text-gray-600 text-sm">📞 {request.phoneNumber}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted: {new Date(request.submittedAt).toLocaleString()}
                    </p>
                    {request.reason && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700"><strong>Reason:</strong> {request.reason}</p>
                      </div>
                    )}
                    {request.dataTypes && request.dataTypes.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {request.dataTypes.map((type, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            {type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <Eye className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Request Details</h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type</label>
                    <p className="mt-1">{getTypeBadge(selectedRequest.requestType)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <p className="mt-1">{getStatusBadge(selectedRequest.status)}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Info</label>
                    <p className="mt-1 text-gray-900">{selectedRequest.name}</p>
                    <p className="text-gray-600">{selectedRequest.email}</p>
                    {selectedRequest.phoneNumber && <p className="text-gray-600">{selectedRequest.phoneNumber}</p>}
                  </div>

                  {selectedRequest.adminNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Admin Notes</label>
                      <p className="mt-1 p-3 bg-gray-50 rounded-lg text-gray-900">{selectedRequest.adminNotes}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add/Update Notes</label>
                    <textarea
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder="Add notes about this request..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    {selectedRequest.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(selectedRequest._id, 'in-progress')}
                          disabled={processing}
                          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          <Clock className="w-4 h-4 inline mr-2" />
                          Mark In Progress
                        </button>
                      </>
                    )}

                    {selectedRequest.status === 'in-progress' && (
                      <>
                        {selectedRequest.requestType === 'account' && (
                          <button
                            onClick={() => handleProcessAccountDeletion(selectedRequest._id)}
                            disabled={processing}
                            className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Delete Account Now
                          </button>
                        )}
                        <button
                          onClick={() => handleStatusUpdate(selectedRequest._id, 'completed')}
                          disabled={processing}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                          Mark Complete
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(selectedRequest._id, 'rejected')}
                          disabled={processing}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4 inline mr-2" />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeletionRequestManager;
