import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function NDAApprove() {
  const router = useRouter();
  const { id, action } = router.query;
  const [request, setRequest] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, processing, success, error, not_found
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id || !action) return;

    // Find the request
    const requests = JSON.parse(localStorage.getItem('ndaRequests') || '[]');
    const found = requests.find(r => r.id === id);

    if (!found) {
      setStatus('not_found');
      return;
    }

    setRequest(found);

    // Check if already processed
    if (found.status !== 'pending_approval') {
      setStatus('already_processed');
      setMessage(`This request has already been ${found.status === 'denied' ? 'denied' : 'processed'}.`);
      return;
    }

    // Process the action
    processAction(found, action, requests);
  }, [id, action]);

  const processAction = async (req, actionType, allRequests) => {
    setStatus('processing');

    if (actionType === 'deny') {
      // Update status to denied
      const updatedRequests = allRequests.map(r => {
        if (r.id === req.id) {
          return {
            ...r,
            status: 'denied',
            statusHistory: [
              ...r.statusHistory,
              {
                status: 'denied',
                timestamp: new Date().toISOString(),
                note: 'Request denied by approver'
              }
            ]
          };
        }
        return r;
      });

      localStorage.setItem('ndaRequests', JSON.stringify(updatedRequests));
      setStatus('success');
      setMessage('The NDA request has been denied.');
      return;
    }

    if (actionType === 'approve') {
      // First update status to approved
      let updatedRequests = allRequests.map(r => {
        if (r.id === req.id) {
          return {
            ...r,
            status: 'approved',
            statusHistory: [
              ...r.statusHistory,
              {
                status: 'approved',
                timestamp: new Date().toISOString(),
                note: 'Request approved'
              }
            ]
          };
        }
        return r;
      });

      localStorage.setItem('ndaRequests', JSON.stringify(updatedRequests));

      // Now send the NDA via API
      try {
        const response = await fetch('/api/nda/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: req.email,
            firstName: req.firstName,
            lastName: req.lastName,
            companyName: req.companyName,
          }),
        });

        const data = await response.json();

        // Update with send result
        updatedRequests = updatedRequests.map(r => {
          if (r.id === req.id) {
            const newStatus = data.success ? 'sent' : 'error';
            return {
              ...r,
              status: newStatus,
              statusHistory: [
                ...r.statusHistory,
                {
                  status: newStatus,
                  timestamp: new Date().toISOString(),
                  note: data.success ? 'NDA sent via Dropbox Sign' : `Error: ${data.error}`
                }
              ]
            };
          }
          return r;
        });

        localStorage.setItem('ndaRequests', JSON.stringify(updatedRequests));

        if (data.success) {
          setStatus('success');
          setMessage(`The NDA has been approved and sent to ${req.email} for signing.`);
        } else {
          setStatus('error');
          setMessage(`The request was approved but there was an error sending the NDA: ${data.error}`);
        }
      } catch (err) {
        setStatus('error');
        setMessage('The request was approved but there was an error sending the NDA. Please try again from the NDA History page.');
      }
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          {status === 'loading' && (
            <>
              <div className="animate-pulse text-[#68d2df] mb-4">Loading...</div>
              <p className="text-white/70">Retrieving NDA request...</p>
            </>
          )}

          {status === 'processing' && (
            <>
              <div className="w-16 h-16 border-4 border-[#68d2df] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold mb-4">Processing...</h1>
              <p className="text-white/70">
                {action === 'approve' ? 'Approving request and sending NDA...' : 'Processing your decision...'}
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-4">
                {action === 'approve' ? 'Request Approved!' : 'Request Denied'}
              </h1>
              <p className="text-white/70 mb-6">{message}</p>
              {request && (
                <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                  <p><strong>Company:</strong> {request.companyName}</p>
                  <p><strong>Recipient:</strong> {request.firstName} {request.lastName}</p>
                  <p><strong>Email:</strong> {request.email}</p>
                </div>
              )}
              <Link href="/nda-history" className="btn-primary">
                View All Requests
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-4">Error</h1>
              <p className="text-white/70 mb-6">{message}</p>
              <Link href="/nda-history" className="btn-primary">
                Go to NDA History
              </Link>
            </>
          )}

          {status === 'not_found' && (
            <>
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-4">Request Not Found</h1>
              <p className="text-white/70 mb-6">
                This NDA request could not be found. It may have been deleted or the link may be invalid.
              </p>
              <Link href="/nda-history" className="btn-primary">
                View All Requests
              </Link>
            </>
          )}

          {status === 'already_processed' && (
            <>
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-4">Already Processed</h1>
              <p className="text-white/70 mb-6">{message}</p>
              {request && (
                <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                  <p><strong>Company:</strong> {request.companyName}</p>
                  <p><strong>Recipient:</strong> {request.firstName} {request.lastName}</p>
                  <p><strong>Current Status:</strong> {request.status}</p>
                </div>
              )}
              <Link href="/nda-history" className="btn-primary">
                View All Requests
              </Link>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
