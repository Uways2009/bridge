import React, { useState } from 'react';
import { FAQ_ITEMS } from '../data/mockData';
import { useAdmin } from '../context/AdminContext';
import {
  Mail,
  MessageCircle,
  Clock,
  MapPin,
  Send,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Phone,
} from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { contactInfo, faqs, submitPublicInquiry } = useAdmin();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const displayFaqs = faqs && faqs.length > 0 ? faqs : FAQ_ITEMS;
  const [openFaq, setOpenFaq] = useState<string | null>(displayFaqs[0]?.id || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await submitPublicInquiry({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        category: category,
        message: message.trim(),
        type: 'contact',
      });
      setIsSubmitting(false);
      setSubmitted(true);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err?.message || 'Unable to submit your message. Please try again.');
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setPhone('');
    setMessage('');
    setSubmitError(null);
  };

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] flex items-center gap-1.5">
          <Mail className="w-4 h-4" />
          <span>Get in Touch</span>
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-[#0B1F33] tracking-tight">
          Contact & Inquiries
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Have a question about an opportunity, want to partner, or need assistance with your application? We respond to all inquiries within 24 to 48 business hours.
        </p>
      </div>

      {/* Grid: Contact Information & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Side: Direct Contact Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs space-y-6">
            <h3 className="text-xl font-bold font-display text-[#0B1F33]">
              Direct Communication Channels
            </h3>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-stone-500 text-xs block">General Inquiries</span>
                  <a
                    href={`mailto:${contactInfo.officialEmail || 'hello@naijabridge.org'}`}
                    className="font-bold text-[#0B1F33] hover:text-[#087F5B] transition-colors"
                  >
                    {contactInfo.officialEmail || 'hello@naijabridge.org'}
                  </a>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    For public feedback, suggestions, and official correspondence.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center shrink-0">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-stone-500 text-xs block">WhatsApp Support Desk</span>
                  <a
                    href={
                      contactInfo.whatsappGroupLink ||
                      (contactInfo.whatsappNumber
                        ? `https://wa.me/${contactInfo.whatsappNumber.replace(/[^0-9]/g, '')}`
                        : 'https://wa.me/2348000000000')
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-[#0B1F33] hover:text-[#087F5B] transition-colors"
                  >
                    {contactInfo.whatsappNumber || '+234 (0) 800-NAIJA-BRG'}
                  </a>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {contactInfo.operatingHours || 'Mon - Fri: 9:00 AM - 5:00 PM WAT'}
                  </p>
                </div>
              </div>

              {contactInfo.phone && (
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-stone-500 text-xs block">Direct Helpline</span>
                    <a
                      href={`tel:${contactInfo.phone.replace(/[^0-9+]/g, '')}`}
                      className="font-bold text-[#0B1F33] hover:text-[#087F5B] transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                    {contactInfo.phoneSecondary && (
                      <span className="text-[11px] text-stone-500 block mt-0.5">
                        Alt: {contactInfo.phoneSecondary}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#D99A28]/15 text-[#9A6B12] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-stone-500 text-xs block">Report Suspicious Opportunity</span>
                  <a
                    href={`mailto:${contactInfo.verificationEmail || 'verify@naijabridge.org'}`}
                    className="font-bold text-[#0B1F33] hover:text-[#087F5B] transition-colors"
                  >
                    {contactInfo.verificationEmail || 'verify@naijabridge.org'}
                  </a>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Help us investigate recruiter scams or unverified links.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-stone-500 text-xs block">Response Expectation</span>
                  <span className="font-semibold text-stone-800">
                    {contactInfo.responseTimeNotice || 'Within 24-48 business hours'}
                  </span>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    {contactInfo.physicalAddress || 'Remote operating team across Lagos, Abuja, and Enugu.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Contact Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#087F5B]/10 text-[#087F5B] mx-auto flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold font-display text-[#0B1F33]">
                  Message Dispatched!
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{name}</strong>. Your inquiry has been routed to the appropriate coordinator. We will reply to <strong>{email}</strong> within 24 to 48 business hours.
                </p>
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 rounded-xl bg-[#0B1F33] hover:bg-[#087F5B] text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold font-display text-[#0B1F33] mb-2">
                  Send Us a Direct Message
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chinedu Okafor"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1D8] text-xs focus:outline-none focus:border-[#087F5B]"
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
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1D8] text-xs focus:outline-none focus:border-[#087F5B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      WhatsApp / Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+234 800 000 0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1D8] text-xs focus:outline-none focus:border-[#087F5B]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1D8] text-xs focus:outline-none focus:border-[#087F5B] bg-white"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="CV or Application Support">CV or Application Support</option>
                      <option value="Report Suspicious Opportunity">Report Suspicious Listing</option>
                      <option value="Partnership or Employer Posting">Partnership or Employer Posting</option>
                      <option value="Volunteer or Mentorship">Volunteer or Mentorship</option>
                      <option value="Media or Press">Media & Press</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we assist your journey or collaborate with your organization?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1D8] text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isSubmitting ? <span>Transmitting...</span> : <span>Send Message</span>}
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (Accordion) */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E4E1D8] shadow-xs space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-1 block">
            Common Inquiries
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Clear answers to common questions about our verification process, community, and services.
          </p>
        </div>

        <div className="divide-y divide-stone-100">
          {displayFaqs.map((faq) => {
            const isOpen = openFaq === faq.id;
            return (
              <div key={faq.id} className="py-4">
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-[#0B1F33] hover:text-[#087F5B] transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#087F5B] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2.5 text-xs sm:text-sm text-stone-600 leading-relaxed max-w-3xl animate-in fade-in duration-200">
                    {faq.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
