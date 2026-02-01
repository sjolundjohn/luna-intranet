import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

const statusColors = {
  pending_approval: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  approved: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  sent: 'bg-purple-500/20 text-purple-300 border-purple-500/50',
  signed: 'bg-green-500/20 text-green-300 border-green-500/50',
  denied: 'bg-red-500/20 text-red-300 border-red-500/50',
  error: 'bg-red-500/20 text-red-300 border-red-500/50',
};

const statusLabels = {
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  sent: 'Sent for Signing',
  signed: 'Signed',
  denied: 'Denied',
  error: 'Error',
};

export default function NDAHistory() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = () => {
    const stored = JSON.parse(localStorage.getItem('ndaRequests') || '[]');
    // Sort by date, newest first
    stored.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setRequests(stored);
    setIsLoading(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSendNDA = async (request) => {
    try {
      const response = await fetch('/api/nda/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: request.email,
          firstName: request.firstName,
          lastName: request.lastName,
          companyName: request.companyName,
        }),
      });

      const data = await response.json();

      // Update request status
      const updatedRequests = requests.map(r => {
        if (r.id === request.id) {
          const newStatus = data.success ? 'sent' : 'error';
          return {
            ...r,
            status: newStatus,
            statusHistory: [
              ...r.statusHistory,
              {
                status: newStatus,
                timestamp: new Date().toISOString(),
                note: data.success ? 'NDA sent via Dropbox Sign' : data.error,
              }
            ]
          };
        }
        return r;
      });

      localStorage.setItem('ndaRequests', JSON.stringify(updatedRequests));
      setRequests(updatedRequests);
    } catch (err) {
      console.error('Failed to send NDA:', err);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-[#68d2df]">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">NDA History</h1>
            <p className="text-white/70">Track all NDA requests and their status</p>
          </div>
          <Link href="/nda" className="btn-primary">
            New Request
          </Link>
        </div>

        {requests.length === 0 ? (
          <div className="card text-center py-12">
            <svg className="w-16 h-16 mx-auto mb-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No NDA Requests Yet</h2>
            <p className="text-white/70 mb-6">Start by submitting your first NDA request.</p>
            <Link href="/nda" className="btn-primary">
              Request NDA
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{request.companyName}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[request.status]}`}>
                        {statusLabels[request.status]}
                      </span>
                    </div>
                    <p className="text-white/70">
                      {request.firstName} {request.lastName} &bull; {request.email}
                    </p>
                    <p className="text-white/50 text-sm mt-1">
                      Submitted {formatDate(request.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {request.status === 'approved' && (
                      <button
                        onClick={() => handleSendNDA(request)}
                        className="btn-primary text-sm"
                      >
                        Send NDA
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedRequest(selectedRequest?.id === request.id ? null : request)}
                      className="btn-secondary text-sm"
                    >
                      {selectedRequest?.id === request.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>
                </div>

                {selectedRequest?.id === request.id && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <h4 className="font-medium mb-4">Status History</h4>
                    <div className="space-y-3">
                      {request.statusHistory.map((history, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`w-3 h-3 rounded-full mt-1.5 ${
                            history.status === 'signed' ? 'bg-green-400' :
                            history.status === 'denied' || history.status === 'error' ? 'bg-red-400' :
                            history.status === 'sent' ? 'bg-purple-400' :
                            history.status === 'approved' ? 'bg-blue-400' :
                            'bg-yellow-400'
                          }`} />
                          <div>
                            <p className="font-medium">{statusLabels[history.status]}</p>
                            <p className="text-white/50 text-sm">{history.note}</p>
                            <p className="text-white/30 text-xs">{formatDate(history.timestamp)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
