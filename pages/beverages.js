import { useState } from 'react';
import { useAuth } from '../lib/authContext';
import { products, vendorEmail, vendorPhone } from '../lib/products';

export default function Beverages() {
  const { user } = useAuth();
  const [order, setOrder] = useState({});
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const updateQuantity = (category, brandId, flavor, delta) => {
    const key = `${category}-${brandId}-${flavor}`;
    setOrder((prev) => {
      const current = prev[key] || 0;
      const newValue = Math.max(0, current + delta);
      if (newValue === 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: newValue };
    });
  };

  const getQuantity = (category, brandId, flavor) => {
    const key = `${category}-${brandId}-${flavor}`;
    return order[key] || 0;
  };

  const totalItems = Object.values(order).reduce((sum, qty) => sum + qty, 0);

  const formatOrderForEmail = () => {
    let orderText = `BEVERAGE ORDER REQUEST\n`;
    orderText += `========================\n\n`;
    orderText += `Ordered by: ${user?.name || 'Luna Team Member'}\n`;
    orderText += `Date: ${new Date().toLocaleDateString()}\n\n`;
    orderText += `ITEMS:\n`;

    Object.entries(order).forEach(([key, qty]) => {
      const [category, brandId, ...flavorParts] = key.split('-');
      const flavor = flavorParts.join('-');
      const categoryData = products[category];
      const brand = categoryData?.brands.find((b) => b.id === brandId);
      orderText += `  - ${qty}x ${brand?.name}: ${flavor}\n`;
    });

    if (notes) {
      orderText += `\nNOTES:\n${notes}\n`;
    }

    orderText += `\n------------------------\n`;
    orderText += `Sent from Luna Health Intranet`;

    return orderText;
  };

  const handleSubmit = async () => {
    if (totalItems === 0) return;

    setIsSubmitting(true);

    // Generate mailto link with order details
    const subject = encodeURIComponent(`Luna Health Beverage Order - ${new Date().toLocaleDateString()}`);
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
    setOrder({});
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Beverages</h1>
        <p className="text-white/70">
          Select items to order from KEGJOY. Your order will be emailed to {vendorEmail}.
        </p>
      </div>

      {/* Product Categories */}
      {Object.entries(products).map(([categoryKey, category]) => (
        <div key={categoryKey} className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span>{category.icon}</span>
            {category.name}
          </h2>

          <div className="space-y-4">
            {category.brands.map((brand) => (
              <div key={brand.id} className="card">
                <h3 className="font-medium mb-4 text-[#68d2df]">{brand.name}</h3>
                <div className="grid gap-3">
                  {brand.flavors.map((flavor) => (
                    <div
                      key={flavor}
                      className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
                    >
                      <span className="flex-1">{flavor}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(categoryKey, brand.id, flavor, -1)}
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                          disabled={getQuantity(categoryKey, brand.id, flavor) === 0}
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-mono">
                          {getQuantity(categoryKey, brand.id, flavor)}
                        </span>
                        <button
                          onClick={() => updateQuantity(categoryKey, brand.id, flavor, 1)}
                          className="w-8 h-8 rounded-full bg-[#68d2df] text-[#041e42] hover:bg-[#4fc4d3] transition-colors flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
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
              <p className="text-sm text-white/60">{totalItems} item(s) selected</p>
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
          )}

          <button
            onClick={handleSubmit}
            disabled={totalItems === 0 || isSubmitting}
            className={`btn-primary w-full ${
              totalItems === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Preparing Order...' : `Send Order (${totalItems} items)`}
          </button>
        </div>
      </div>
    </div>
  );
}
