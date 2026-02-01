import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function History() {
  const [orders, setOrders] = useState([]);

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
          <h1 className="text-3xl font-bold mb-2">Order History</h1>
          <p className="text-white/70">
            View your past beverage orders
          </p>
        </div>
        {orders.length > 0 && (
          <button
            onClick={clearHistory}
            className="text-sm text-white/60 hover:text-red-400 transition-colors"
          >
            Clear History
          </button>
        )}
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
                  <p className="text-sm text-[#68d2df]">{getTimeAgo(order.date)}</p>
                  <p className="text-white/60 text-sm">{formatDate(order.date)}</p>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
