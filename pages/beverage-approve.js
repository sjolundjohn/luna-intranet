import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { vendorEmail, vendorPhone } from '../lib/products';

export default function BeverageApprove() {
  const router = useRouter();
  const { id, action } = router.query;
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState('loading'); // loading, processing, success, error, not_found
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!id || !action) return;

    // Find the order
    const orders = JSON.parse(localStorage.getItem('luna_orders') || '[]');
    const found = orders.find(o => o.id === id);

    if (!found) {
      setStatus('not_found');
      return;
    }

    setOrder(found);

    // Check if already processed
    if (found.status !== 'pending_approval') {
      setStatus('already_processed');
      setMessage(`This order has already been ${found.status === 'denied' ? 'denied' : 'processed'}.`);
      return;
    }

    // Process the action
    processAction(found, action, orders);
  }, [id, action]);

  const processAction = async (ord, actionType, allOrders) => {
    setStatus('processing');

    if (actionType === 'deny') {
      // Update status to denied
      const updatedOrders = allOrders.map(o => {
        if (o.id === ord.id) {
          return {
            ...o,
            status: 'denied',
            statusHistory: [
              ...(o.statusHistory || []),
              {
                status: 'denied',
                timestamp: new Date().toISOString(),
                note: 'Order denied by John'
              }
            ]
          };
        }
        return o;
      });

      localStorage.setItem('luna_orders', JSON.stringify(updatedOrders));
      setStatus('success');
      setMessage('The beverage order has been denied.');
      return;
    }

    if (actionType === 'approve') {
      // Update status to approved
      const updatedOrders = allOrders.map(o => {
        if (o.id === ord.id) {
          return {
            ...o,
            status: 'approved',
            statusHistory: [
              ...(o.statusHistory || []),
              {
                status: 'approved',
                timestamp: new Date().toISOString(),
                note: 'Order approved by John'
              }
            ]
          };
        }
        return o;
      });

      localStorage.setItem('luna_orders', JSON.stringify(updatedOrders));

      // Format items for KEGJOY email
      let itemsList = '';
      ord.items.forEach(item => {
        itemsList += `• 1x ${item.brand} - ${item.flavor}\n`;
      });

      // Create the order email for KEGJOY
      const subject = encodeURIComponent(`Beverage Order from Luna Health`);
      const body = encodeURIComponent(
`Hi there!

This is John from Luna Health. Hope you're having a great day!

We're running low on beverages and would love to place an order when you get a chance:

${itemsList}
${ord.notes ? `A quick note: ${ord.notes}\n` : ''}
Thanks so much for always taking great care of us! We really appreciate the partnership.

Best,
John
Luna Health`
      );

      // Open email client to send to KEGJOY
      window.location.href = `mailto:${vendorEmail}?subject=${subject}&body=${body}`;

      setStatus('success');
      setMessage(`Order approved! Your email client should open with the order ready to send to KEGJOY.`);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          {status === 'loading' && (
            <>
              <div className="animate-pulse text-[#68d2df] mb-4">Loading...</div>
              <p className="text-white/70">Retrieving order...</p>
            </>
          )}

          {status === 'processing' && (
            <>
              <div className="w-16 h-16 border-4 border-[#68d2df] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <h1 className="text-2xl font-bold mb-4">Processing...</h1>
              <p className="text-white/70">
                {action === 'approve' ? 'Approving order and preparing email...' : 'Processing your decision...'}
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
                {action === 'approve' ? 'Order Approved!' : 'Order Denied'}
              </h1>
              <p className="text-white/70 mb-6">{message}</p>
              {order && (
                <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm text-white/60 mb-2">Order Details:</p>
                  <p><strong>Submitted by:</strong> {order.submittedBy}</p>
                  <p><strong>Items:</strong></p>
                  <ul className="ml-4 mt-1">
                    {order.items.map((item, idx) => (
                      <li key={idx}>• {item.brand}: {item.flavor}</li>
                    ))}
                  </ul>
                  {action === 'approve' && (
                    <p className="text-sm text-white/60 mt-4">
                      <strong>Send to:</strong> {vendorEmail}
                    </p>
                  )}
                </div>
              )}
              <Link href="/history" className="btn-primary">
                View Order History
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
              <Link href="/history" className="btn-primary">
                Go to Order History
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
              <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
              <p className="text-white/70 mb-6">
                This order could not be found. It may have been deleted or the link may be invalid.
              </p>
              <Link href="/history" className="btn-primary">
                View Order History
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
              {order && (
                <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
                  <p><strong>Submitted by:</strong> {order.submittedBy}</p>
                  <p><strong>Items:</strong></p>
                  <ul className="ml-4 mt-1">
                    {order.items.map((item, idx) => (
                      <li key={idx}>• {item.brand}: {item.flavor}</li>
                    ))}
                  </ul>
                  <p><strong>Current Status:</strong> {order.status}</p>
                </div>
              )}
              <Link href="/history" className="btn-primary">
                View Order History
              </Link>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
