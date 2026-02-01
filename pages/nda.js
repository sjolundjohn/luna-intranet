import { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function RequestNDA() {
  const [formData, setFormData] = useState({
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create NDA request object
      const ndaRequest = {
        id: Date.now().toString(),
        ...formData,
        status: 'pending_approval',
        createdAt: new Date().toISOString(),
        statusHistory: [
          {
            status: 'pending_approval',
            timestamp: new Date().toISOString(),
            note: 'Request submitted, awaiting approval'
          }
        ]
      };

      // Save to localStorage
      const existingRequests = JSON.parse(localStorage.getItem('ndaRequests') || '[]');
      existingRequests.push(ndaRequest);
      localStorage.setItem('ndaRequests', JSON.stringify(existingRequests));

      // Generate approval URL
      const baseUrl = window.location.origin;
      const approveUrl = `${baseUrl}/nda-approve?id=${ndaRequest.id}&action=approve`;
      const denyUrl = `${baseUrl}/nda-approve?id=${ndaRequest.id}&action=deny`;

      // Create email content
      const subject = encodeURIComponent(`NDA Request: ${formData.companyName} - ${formData.firstName} ${formData.lastName}`);
      const body = encodeURIComponent(
`Hi,

A new NDA request has been submitted and requires your approval.

Details:
- Company: ${formData.companyName}
- Name: ${formData.firstName} ${formData.lastName}
- Email: ${formData.email}

To APPROVE this request and send the NDA:
${approveUrl}

To DENY this request:
${denyUrl}

Thanks,
Luna Intranet`
      );

      // Open email client
      window.location.href = `mailto:jb@lunadiabetes.com?subject=${subject}&body=${body}`;

      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    }

    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="card text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">Request Submitted!</h1>
            <p className="text-white/70 mb-6">
              Your NDA request has been submitted. An approval email has been prepared for the approver.
              Once approved, the NDA will be automatically sent to the recipient.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ companyName: '', firstName: '', lastName: '', email: '' });
                }}
                className="btn-secondary"
              >
                Submit Another
              </button>
              <Link href="/nda-history" className="btn-primary">
                View All Requests
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Request NDA</h1>
          <p className="text-white/70">
            Submit a request to send a Non-Disclosure Agreement. The request will be sent to an approver before the NDA is dispatched.
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                placeholder="Enter company name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-[#68d2df]"
                placeholder="email@company.com"
              />
              <p className="text-white/50 text-sm mt-2">The NDA will be sent to this email address for signing.</p>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit NDA Request'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
