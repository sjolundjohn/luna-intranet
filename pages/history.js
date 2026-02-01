import { useState, useEffect } from 'react';
import Link from 'next/link';

const statusColors = {
  pending_approval: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
  approved: 'bg-green-500/20 text-green-300 border-green-500/50',
  sent: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
  denied: 'bg-red-500/20 text-red-300 border-red-500/50',
};

const statusLabels = {
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  sent: 'Sent to KEGJOY',
  denied: 'Denied',
};

export default function History() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('luna_orders') || '[]');
    setOrders(savedOrders);
  }, []);

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all order history?')) {
      localStorage.removeItem('luna_orders');
      setOrders([]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Beverage History</h1>
          <p className="text-white/70">
            View your past beverage orders and their status
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/beverages" className="btn-primary">
            New Order
          </Link>
          {orders.length > 0 && (
            <button
              onClick={clearHistory}
              className="btn-secondary text-sm"
            >
              Clear History
            </button>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-white/60 mb-6">
            Your order history will appear here after you place your first order.
          </p>
          <Link href="/beverages" className="btn-primary inline-block">
            Place an Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div key={order.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="text-sm text-[#68d2df]">{getTimeAgo(order.date)}</p>
                    {order.status && (
                      <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[order.status] || 'bg-white/10 text-white/70'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-sm">{formatDate(order.date)}</p>
                  {order.submittedBy && (
                    <p className="text-white/50 text-sm mt-1">Submitted by: {order.submittedBy}</p>
                  )}
                </div>
                {index === 0 && (
                  <span className="text-xs bg-[#68d2df]/20 text-[#68d2df] px-2 py-1 rounded-full">
                    Most Recent
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {order.items.map((item, itemIndex) => (
                  <div
                    key={itemIndex}
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg"
                  >
                    <span className="text-xl">
                      {item.category === 'Kombucha' ? '🍵' : '☕'}
                    </span>
                    <div>
                      <p className="font-medium">{item.brand}</p>
                      <p className="text-sm text-white/60">{item.flavor}</p>
                    </div>
                  </div>
                ))}
              </div>

              {order.notes && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg">
                  <p className="text-sm text-white/60">Notes: {order.notes}</p>
                </div>
              )}

              {order.statusHistory && order.statusHistory.length > 0 && (
                <button
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  className="mt-4 text-sm text-[#68d2df] hover:underline"
                >
                  {selectedOrder?.id === order.id ? 'Hide Details' : 'View Status History'}
                </button>
              )}

              {selectedOrder?.id === order.id && order.statusHistory && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="font-medium mb-3 text-sm">Status History</h4>
                  <div className="space-y-2">
                    {order.statusHistory.map((history, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 ${
                          history.status === 'approved' || history.status === 'sent' ? 'bg-green-400' :
                          history.status === 'denied' ? 'bg-red-400' :
                          'bg-yellow-400'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{statusLabels[history.status] || history.status}</p>
                          <p className="text-white/50 text-xs">{history.note}</p>
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
  );
}
