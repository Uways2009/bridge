import React, { useState } from 'react';
import {
  X,
  Handshake,
  CheckCircle2,
  Building,
  Send,
  ShieldCheck,
} from 'lucide-react';

interface PartnerInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerInquiryModal: React.FC<PartnerInquiryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [orgName, setOrgName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [partnerType, setPartnerType] = useState('Employer (Hiring Talent)');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim() || !contactPerson.trim() || !email.trim()) {
      setError('Please provide organization name, contact person, and email.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 750);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setOrgName('');
    setContactPerson('');
    setEmail('');
    setNotes('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E4E1D8] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0B1F33] text-white p-6 relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#D99A28] text-[#0B1F33] mb-2 inline-block">
            Institutional Partnership
          </span>
          <h2 className="text-xl font-bold font-display text-white pr-8">
            Partner with NaijaBridge
          </h2>
          <p className="text-xs text-white/70 mt-1">
            Connect with verified Nigerian talent, sponsor digital cohorts, or post vacancies.
          </p>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#087F5B]/10 text-[#087F5B] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display text-[#0B1F33]">
                Inquiry Received!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{contactPerson}</strong> from <strong>{orgName}</strong>. Our Partnerships Lead will review your request and reply via <strong>{email}</strong> within 1-2 business days.
              </p>
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-[#0B1F33] hover:bg-[#087F5B] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Organization / Institution Name *
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme Africa Ltd or University of Ibadan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Contact Person Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Dr. Kalu"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Official Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="partnerships@organization.org"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Partnership Category
                </label>
                <select
                  value={partnerType}
                  onChange={(e) => setPartnerType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B] bg-white"
                >
                  <option value="Employer (Hiring Talent)">Employer (Hiring Verified Remote / On-site Talent)</option>
                  <option value="University / Polytechnic">University / Polytechnic Faculty</option>
                  <option value="NGO / Foundation">NGO / Philanthropic Foundation</option>
                  <option value="Corporate Sponsor">Corporate Sponsor (Funding Data / Laptops / Hubs)</option>
                  <option value="Training Provider">Training Provider (Subsidized Certifications)</option>
                  <option value="Diaspora Mentor">Diaspora Mentor (Volunteering 1 hr/month)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Brief Overview of Collaboration Intent
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share details on vacancies to post, programs you want to support, or grant initiatives..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? <span>Submitting...</span> : <span>Send Partnership Inquiry</span>}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
