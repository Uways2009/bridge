import React, { useState } from 'react';
import { ServiceItem } from '../types';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';

interface ServiceRequestModalProps {
  service: ServiceItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [stateLocation, setStateLocation] = useState('Lagos');
  const [userStatus, setUserStatus] = useState('Recent Graduate / NYSC');
  const [notes, setNotes] = useState('');
  const [draftLink, setDraftLink] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !service) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setError('Please fill in your full name, email, and WhatsApp number.');
      return;
    }
    if (!email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    // Simulate reliable dispatch
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 800);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setDraftLink('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E4E1D8] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B1F33] text-white p-6 relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#087F5B] text-white mb-2 inline-block">
            {service.isFree ? 'Free Service' : `₦${service.priceNaira.toLocaleString()}`}
          </span>
          <h2 className="text-xl font-bold font-display text-white pr-8">
            Request: {service.title}
          </h2>
          <p className="text-xs text-white/70 mt-1">
            Delivery turnaround: {service.deliveryTime}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#087F5B]/10 text-[#087F5B] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display text-[#0B1F33]">
                Request Received!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{fullName}</strong>. A NaijaBridge support coordinator will reach out to you via WhatsApp ({phone}) or email within 24 business hours to begin your {service.title}.
              </p>
              <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#E4E1D8] text-xs text-stone-600 text-left max-w-sm mx-auto">
                <p className="font-semibold text-stone-800 mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>We confirm your specific goals and target applications.</li>
                  <li>Our review team gets to work on your deliverable.</li>
                  <li>You receive finalized assets within {service.deliveryTime}.</li>
                </ul>
              </div>
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-[#0B1F33] hover:bg-[#087F5B] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close & Return to Services
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Amina Mohammed"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 801 234 5678"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Current Location in Nigeria
                  </label>
                  <select
                    value={stateLocation}
                    onChange={(e) => setStateLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B] bg-white"
                  >
                    <option value="Lagos">Lagos State</option>
                    <option value="Abuja">Abuja (FCT)</option>
                    <option value="Oyo">Oyo (Ibadan)</option>
                    <option value="Rivers">Rivers (Port Harcourt)</option>
                    <option value="Enugu">Enugu State</option>
                    <option value="Kaduna">Kaduna State</option>
                    <option value="Kano">Kano State</option>
                    <option value="Edo">Edo (Benin City)</option>
                    <option value="Other">Other States (All 36 Covered)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Current Career or Business Status
                </label>
                <select
                  value={userStatus}
                  onChange={(e) => setUserStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B] bg-white"
                >
                  <option value="Undergraduate Student">Undergraduate Student</option>
                  <option value="Recent Graduate / NYSC">Recent Graduate / NYSC</option>
                  <option value="Job Seeker">Job Seeker</option>
                  <option value="Freelancer">Freelancer / Independent Contractor</option>
                  <option value="Small Business Owner">Small Business Owner</option>
                  <option value="Career Transitioner">Career Transitioner (Switching to Tech)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Link to Existing CV / Portfolio / Profile (Optional)
                </label>
                <input
                  type="url"
                  value={draftLink}
                  onChange={(e) => setDraftLink(e.target.value)}
                  placeholder="https://drive.google.com/... or LinkedIn URL"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Specific goals or notes for our team
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us what role, scholarship, or business goal you are targeting..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>
                        Submit Request ({service.isFree ? 'Free' : `₦${service.priceNaira.toLocaleString()}`})
                      </span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-stone-500 text-center mt-2">
                  No upfront payment required for review. We connect directly on WhatsApp first.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
