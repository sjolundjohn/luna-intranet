import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function NDARequest() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    companyName: '',
    title: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    phone: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create request object with all fields
      const request = {
        id: `nda-${Date.now()}`,
        ...formData,
        status: 'pending_approval',
        createdAt: new Date().toISOString(),
      };

      // Store in localStorage
      const existingRequests = JSON.parse(localStorage.getItem('ndaRequests') || '[]');
      existingRequests.push(request);
      localStorage.setItem('ndaRequests', JSON.stringify(existingRequests));

      // Create approval URL
      const approvalUrl = `${window.location.origin}/nda-approve?id=${request.id}`;

      // Open email client for approval request
      const subject = encodeURIComponent(`NDA Approval Request - ${formData.fullName} (${formData.companyName || 'No Company'})`);
      const body = encodeURIComponent(
        `A new NDA request requires your approval.\n\n` +
        `Details:\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Name: ${formData.fullName}\n` +
        `Email: ${formData.email}\n` +
        `Company: ${formData.companyName || 'N/A'}\n` +
        `Title: ${formData.title || 'N/A'}\n` +
        `Address: ${formData.addressLine1 || 'N/A'}\n` +
        `${formData.addressLine2 ? formData.addressLine2 + '\n' : ''}` +
        `${formData.addressLine3 ? formData.addressLine3 + '\n' : ''}` +
        `Phone: ${formData.phone || 'N/A'}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `To approve and send the NDA:\n${approvalUrl}&action=approve\n\n` +
        `To deny this request:\n${approvalUrl}&action=deny`
      );

      // Open mailto link - approval goes to jb@lunadiabetes.com
      window.location.href = `mailto:jb@lunadiabetes.com?subject=${subject}&body=${body}`;

      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting NDA request:', error);
      alert('Error submitting request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-2">Request Submitted</h1>
            <p className="text-white/70 mb-6">
              Your NDA request has been submitted for approval. Please send the email that was opened to complete the request.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    email: '',
                    fullName: '',
                    companyName: '',
                    title: '',
                    addressLine1: '',
                    addressLine2: '',
                    addressLine3: '',
                    phone: '',
                  });
                }}
                className="btn-primary"
              >
                Submit Another
              </button>
              <button
                onClick={() => router.push('/nda-history')}
                className="px-6 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                View History
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Request NDA</h1>
        <p className="text-white/70 mb-8">
          Submit an NDA request for approval. Once approved, the NDA will be sent via Dropbox Sign.
        </p>

        <form onSubmit={handleSubmit} className="card">
          <div className="grid grid-cols-2 gap-6">
            {/* Full Name - Required */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-2">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                placeholder="John Smith"
              />
            </div>

            {/* Email - Required */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-2">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                placeholder="john@company.com"
              />
            </div>

            {/* Company Name */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                placeholder="Acme Inc."
              />
            </div>

            {/* Title */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                placeholder="CEO"
              />
            </div>

            {/* Address Line 1 */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                placeholder="123 Main Street"
              />
            </div>

            {/* Address Line 2 */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-2">Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                placeholder="Suite 100"
              />
            </div>

            {/* Address Line 3 (City, State, ZIP) */}
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium mb-2">City, State, ZIP</label>
              <input
                type="text"
                name="addressLine3"
                value={formData.addressLine3}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                placeholder="San Francisco, CA 94102"
              />
            </div>

            {/* Phone */}
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
