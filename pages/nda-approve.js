import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function NDAApprove() {
  const router = useRouter();
  const { id, action } = router.query;

  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id) return;

    // Get request from localStorage
    const storedRequests = JSON.parse(localStorage.getItem('ndaRequests') || '[]');
    const foundRequest = storedRequests.find(r => r.id === id);

    if (!foundRequest) {
      setStatus('error');
      setMessage('NDA request not found');
      return;
    }

    if (foundRequest.status !== 'pending_approval') {
      setStatus('already_processed');
      setMessage(`This request has already been ${foundRequest.status}`);
      setRequest(foundRequest);
      return;
    }

    setRequest(foundRequest);

    // Process the action
    if (action === 'approve') {
      handleApprove(foundRequest, storedRequests);
    } else if (action === 'deny') {
      handleDeny(foundRequest, storedRequests);
    } else {
      setStatus('pending');
    }
  }, [id, action]);

  const handleApprove = async (req, allRequests) => {
    setStatus('processing');
    setMessage('Sending NDA via Dropbox Sign...');

    try {
      // Send to Dropbox Sign API with all required fields
      const response = await fetch('/api/nda/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: req.email,
          fullName: req.fullName,
          companyName: req.companyName,
          title: req.title,
          addressLine1: req.addressLine1,
          addressLine2: req.addressLine2,
          addressLine3: req.addressLine3,
          phone: req.phone,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update request status
        const updatedRequests = allRequests.map(r =>
          r.id === req.id
            ? { ...r, status: 'sent', signatureRequestId: data.signatureRequestId, approvedAt: new Date().toISOString() }
            : r
        );
        localStorage.setItem('ndaRequests', JSON.stringify(updatedRequests));

        setStatus('approved');
        setMessage('NDA has been sent successfully via Dropbox Sign!');
      } else {
        throw new Error(data.error || data.details || 'Failed to send NDA');
      }
    } catch (error) {
      console.error('Error sending NDA:', error);

      // Update status to show error but mark as approved
      const updatedRequests = allRequests.map(r =>
        r.id === req.id
          ? { ...r, status: 'approved_with_error', error: error.message, approvedAt: new Date().toISOString() }
          : r
      );
      localStorage.setItem('ndaRequests', JSON.stringify(updatedRequests));

      setStatus('error');
      setMessage(`The request was approved but there was an error sending the NDA: ${error.message}`);
    }
  };

  const handleDeny = (req, allRequests) => {
    const updatedRequests = allRequests.map(r =>
      r.id === req.id
        ? { ...r, status: 'denied', deniedAt: new Date().toISOString() }
        : r
    );
    localStorage.setItem('ndaRequests', JSON.stringify(updatedRequests));

    setStatus('denied');
    setMessage('NDA request has been denied.');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'approved':
        return (
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'denied':
        return (
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'processing':
        return (
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-16 h-16 bg-[#68d2df]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#68d2df]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          {getStatusIcon()}

          <h1 className="text-2xl font-bold mb-2">
            {status === 'loading' && 'Loading...'}
            {status === 'processing' && 'Processing...'}
            {status === 'approved' && 'NDA Approved & Sent'}
            {status === 'denied' && 'NDA Denied'}
            {status === 'error' && 'Error'}
            {status === 'already_processed' && 'Already Processed'}
            {status === 'pending' && 'NDA Approval Request'}
          </h1>

          <p className="text-white/70 mb-6">{message}</p>

          {request && status === 'pending' && (
            <div className="text-left bg-white/5 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3 text-[#68d2df]">Request Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/60">Full Name:</span>
                  <span>{request.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Email:</span>
                  <span>{request.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Company:</span>
                  <span>{request.companyName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Title:</span>
                  <span>{request.title || '-'}</span>
                </div>
                {request.addressLine1 && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Address:</span>
                    <span>{request.addressLine1}</span>
                  </div>
                )}
                {request.phone && (
                  <div className="flex justify-between">
                    <span className="text-white/60">Phone:</span>
                    <span>{request.phone}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-white/60">Requested:</span>
                  <span>{new Date(request.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {status === 'pending' && (
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.push(`/nda-approve?id=${id}&action=approve`)}
                className="btn-primary"
              >
                Approve & Send NDA
              </button>
              <button
                onClick={() => router.push(`/nda-approve?id=${id}&action=deny`)}
                className="px-6 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
              >
                Deny Request
              </button>
            </div>
          )}

          {(status === 'approved' || status === 'denied' || status === 'error' || status === 'already_processed') && (
            <button
              onClick={() => router.push('/nda-history')}
              className="btn-primary"
            >
              View NDA History
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
