import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { products, vendorEmail, vendorPhone } from '../lib/products';

export default function Beverages() {
  const { user } = useAuth();
  const [selectedKombucha, setSelectedKombucha] = useState(null);
  const [selectedColdBrew, setSelectedColdBrew] = useState(null);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showRecentOrderWarning, setShowRecentOrderWarning] = useState(false);
  const [lastOrderDate, setLastOrderDate] = useState(null);

  useEffect(() => {
    // Check for recent orders (approved ones only)
    const orders = JSON.parse(localStorage.getItem('luna_orders') || '[]');
    const approvedOrders = orders.filter(o => o.status === 'approved' || o.status === 'sent');
    if (approvedOrders.length > 0) {
      const lastOrder = new Date(approvedOrders[0].date);
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      if (lastOrder > twoWeeksAgo) {
        setLastOrderDate(lastOrder);
        setShowRecentOrderWarning(true);
      }
    }
  }, []);

  const selectItem = (category, brandId, brandName, flavor) => {
    const item = { brandId, brandName, flavor };
    if (category === 'kombucha') {
      setSelectedKombucha(selectedKombucha?.brandId === brandId && selectedKombucha?.flavor === flavor ? null : item);
    } else {
      setSelectedColdBrew(selectedColdBrew?.brandId === brandId && selectedColdBrew?.flavor === flavor ? null : item);
    }
  };

  const isSelected = (category, brandId, flavor) => {
    if (category === 'kombucha') {
      return selectedKombucha?.brandId === brandId && selectedKombucha?.flavor === flavor;
    }
    return selectedColdBrew?.brandId === brandId && selectedColdBrew?.flavor === flavor;
  };

  const totalItems = (selectedKombucha ? 1 : 0) + (selectedColdBrew ? 1 : 0);

  const handleSubmit = async () => {
    if (totalItems === 0) return;

    setIsSubmitting(true);

    // Create order object
    const newOrder = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'pending_approval',
      submittedBy: user?.name || 'Luna Team Member',
      notes: notes,
      items: [],
      statusHistory: [
        {
          status: 'pending_approval',
          timestamp: new Date().toISOString(),
          note: 'Order submitted, awaiting approval'
        }
      ]
    };

    if (selectedKombucha) {
      newOrder.items.push({
        category: 'Kombucha',
        brand: selectedKombucha.brandName,
        flavor: selectedKombucha.flavor,
      });
    }
    if (selectedColdBrew) {
      newOrder.items.push({
        category: 'Cold Brew',
        brand: selectedColdBrew.brandName,
        flavor: selectedColdBrew.flavor,
      });
    }

    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('luna_orders') || '[]');
    orders.unshift(newOrder);
    localStorage.setItem('luna_orders', JSON.stringify(orders.slice(0, 50)));

    // Generate approval URLs
    const baseUrl = window.location.origin;
    const approveUrl = `${baseUrl}/beverage-approve?id=${newOrder.id}&action=approve`;
    const denyUrl = `${baseUrl}/beverage-approve?id=${newOrder.id}&action=deny`;

    // Format items for email
    let itemsList = '';
    newOrder.items.forEach(item => {
      itemsList += `• 1x ${item.brand} - ${item.flavor}\n`;
    });

    // Create approval email content
    const subject = encodeURIComponent(`Beverage Order Request - ${newOrder.submittedBy}`);
    const body = encodeURIComponent(
`Hi John,

A beverage order has been submitted and requires your approval.

Submitted by: ${newOrder.submittedBy}
Date: ${new Date().toLocaleDateString()}

Items:
${itemsList}
${notes ? `Notes: ${notes}\n` : ''}
To APPROVE and send to KEGJOY:
${approveUrl}

To DENY this order:
${denyUrl}

Thanks,
Luna Intranet`
    );

    // Open email client to send approval request
    window.location.href = `mailto:john@lunadiabetes.com?subject=${subject}&body=${body}`;

    // Show success after a brief delay
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const resetOrder = () => {
    setSelectedKombucha(null);
    setSelectedColdBrew(null);
    setNotes('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="card">
          <div className="text-6xl mb-6">📧</div>
          <h1 className="text-2xl font-bold mb-4">Order Submitted for Approval!</h1>
          <p className="text-white/70 mb-6">
            Your order request has been submitted. An approval email has been prepared for John.
            Once approved, the order will be sent to KEGJOY.
          </p>
          <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-white/60 mb-2">Approval request sent to:</p>
            <p className="font-mono">john@lunadiabetes.com</p>
            <p className="text-sm text-white/60 mt-4">After approval, order goes to:</p>
            <p className="font-mono">{vendorEmail}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <button onClick={resetOrder} className="btn-secondary">
              Place Another Order
            </button>
            <Link href="/history" className="btn-primary">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Recent Order Warning Modal */}
      {showRecentOrderWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold mb-3">Recent Order Detected</h2>
            <p className="text-white/70 mb-4">
              You placed an order on <strong>{lastOrderDate?.toLocaleDateString()}</strong> — less than 2 weeks ago.
            </p>
            <p className="text-white/70 mb-6">
              We probably still have kombucha and cold brew. Are you sure you need to order more?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRecentOrderWarning(false)}
                className="btn-secondary flex-1"
              >
                Continue Anyway
              </button>
              <button
                onClick={() => window.history.back()}
                className="btn-primary flex-1"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Beverages</h1>
        <p className="text-white/70 mb-4">
          Select <strong>one kombucha</strong> and/or <strong>one cold brew</strong> to order from KEGJOY.
        </p>
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <p className="text-blue-300 text-sm">
            <strong>Note:</strong> After submitting, an approval request will be sent to John.
            Once approved, the order will be automatically sent to KEGJOY.
          </p>
        </div>
      </div>

      {/* Product Categories */}
      {Object.entries(products).map(([categoryKey, category]) => (
        <div key={categoryKey} className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>{category.icon}</span>
              {category.name}
            </h2>
            {((categoryKey === 'kombucha' && selectedKombucha) ||
              (categoryKey === 'coldBrew' && selectedColdBrew)) && (
              <span className="text-sm text-[#68d2df] bg-[#68d2df]/20 px-3 py-1 rounded-full">
                1 selected
              </span>
            )}
          </div>

          <div className="space-y-4">
            {category.brands.map((brand) => (
              <div key={brand.id} className="card">
                <h3 className="font-medium mb-4 text-[#68d2df]">{brand.name}</h3>
                <div className="grid gap-3">
                  {brand.flavors.map((flavor) => {
                    const selected = isSelected(categoryKey, brand.id, flavor);
                    return (
                      <button
                        key={flavor}
                        onClick={() => selectItem(categoryKey, brand.id, brand.name, flavor)}
                        className={`flex items-center justify-between p-3 rounded-lg transition-all text-left ${
                          selected
                            ? 'bg-[#68d2df] text-[#041e42]'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <span className="flex-1">{flavor}</span>
                        {selected && (
                          <span className="text-lg">✓</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Order Summary */}
      <div className="sticky bottom-8">
        <div className="card bg-[#041e42]/95 backdrop-blur-lg border-[#68d2df]/30">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Order Summary</h3>
              <p className="text-sm text-white/60">
                {totalItems === 0
                  ? 'No items selected'
                  : `${totalItems} item${totalItems > 1 ? 's' : ''} selected`}
              </p>
            </div>
            {totalItems > 0 && (
              <button
                onClick={resetOrder}
                className="text-sm text-white/60 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {totalItems > 0 && (
            <>
              <div className="mb-4 space-y-2">
                {selectedKombucha && (
                  <div className="text-sm bg-white/5 p-2 rounded">
                    🍵 {selectedKombucha.brandName}: {selectedKombucha.flavor}
                  </div>
                )}
                {selectedColdBrew && (
                  <div className="text-sm bg-white/5 p-2 rounded">
                    ☕ {selectedColdBrew.brandName}: {selectedColdBrew.flavor}
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm text-white/70 mb-2">
                  Additional notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Delivery instructions, urgency..."
                  className="input-field resize-none h-20"
                />
              </div>
            </>
          )}

          <button
            onClick={handleSubmit}
            disabled={totalItems === 0 || isSubmitting}
            className={`btn-primary w-full ${
              totalItems === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Submitting...' : `Submit Order for Approval (${totalItems} item${totalItems > 1 ? 's' : ''})`}
          </button>
        </div>
      </div>
    </div>
  );
}
