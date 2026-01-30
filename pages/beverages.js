import { useState, useEffect } from 'react';
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
    // Check for recent orders
    const orders = JSON.parse(localStorage.getItem('luna_orders') || '[]');
    if (orders.length > 0) {
      const lastOrder = new Date(orders[0].date);
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

  const formatOrderForEmail = () => {
    let orderText = `Hi there!\n\n`;
    orderText += `This is John from Luna Health. Hope you're having a great day! ☀️\n\n`;
    orderText += `We're running low on beverages and would love to place an order when you get a chance:\n\n`;

    if (selectedKombucha) {
      orderText += `• 1x ${selectedKombucha.brandName} - ${selectedKombucha.flavor}\n`;
    }
    if (selectedColdBrew) {
      orderText += `• 1x ${selectedColdBrew.brandName} - ${selectedColdBrew.flavor}\n`;
    }

    if (notes) {
      orderText += `\nA quick note: ${notes}\n`;
    }

    orderText += `\nThanks so much for always taking great care of us! We really appreciate the partnership.\n\n`;
    orderText += `Best,\n`;
    orderText += `John\n`;
    orderText += `Luna Health`;

    return orderText;
  };

  const saveOrderToHistory = () => {
    const orders = JSON.parse(localStorage.getItem('luna_orders') || '[]');
    const newOrder = {
      id: Date.now(),
      date: new Date().toISOString(),
      items: [],
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

    orders.unshift(newOrder);
    localStorage.setItem('luna_orders', JSON.stringify(orders.slice(0, 50))); // Keep last 50 orders
  };

  const handleSubmit = async () => {
    if (totalItems === 0) return;

    setIsSubmitting(true);

    // Save to order history
    saveOrderToHistory();

    // Generate mailto link with order details
    const subject = encodeURIComponent(`Beverage Order from Luna Health 🌙`);
    const body = encodeURIComponent(formatOrderForEmail());
    const mailtoLink = `mailto:${vendorEmail}?subject=${subject}&body=${body}`;

    // Open email client
    window.location.href = mailtoLink;

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
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-2xl font-bold mb-4">Order Ready to Send!</h1>
          <p className="text-white/70 mb-6">
            Your email client should have opened with the order details.
            Just hit send to complete your order!
          </p>
          <div className="bg-white/5 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-white/60 mb-2">Order will be sent to:</p>
            <p className="font-mono">{vendorEmail}</p>
            <p className="text-sm text-white/60 mt-4">Questions? Call:</p>
            <p className="font-mono">{vendorPhone}</p>
          </div>
          <button onClick={resetOrder} className="btn-secondary">
            Place Another Order
          </button>
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
        <p className="text-white/70">
          Select <strong>one kombucha</strong> and/or <strong>one cold brew</strong> to order from KEGJOY.
        </p>
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
            {isSubmitting ? 'Preparing Order...' : `Send Order (${totalItems} item${totalItems > 1 ? 's' : ''})`}
          </button>
        </div>
      </div>
    </div>
  );
}
