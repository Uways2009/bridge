import React, { useState } from 'react';
import { PageId } from '../types';
import { useAdmin } from '../context/AdminContext';
import {
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Send,
  MessageCircle,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
  Lock,
} from 'lucide-react';

interface FooterProps {
  onNavigate: (page: PageId) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { subscribeNewsletter, siteSettings, versionedLogoUrl, contactInfo } = useAdmin();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    setErrorMsg('');
    subscribeNewsletter(newsletterEmail.trim(), 'Footer Digest Form');
    setSubscribed(true);
  };

  return (
    <footer className="bg-[#0B1F33] text-white border-t border-[#1F2933]">
      {/* Upper newsletter & community alert strip */}
      <div className="border-b border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#087F5B]/20 text-[#087F5B] text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Weekly Opportunity Digest</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-display text-white tracking-tight">
              Never miss a verified deadline.
            </h3>
            <p className="text-white/70 text-sm mt-2 max-w-lg leading-relaxed">
              Every Monday morning, we deliver hand-vetted remote jobs, university scholarships, corporate grants, and free workshop alerts directly to your inbox.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="bg-[#087F5B]/20 border border-[#087F5B]/40 rounded-2xl p-4 flex items-center gap-3 text-white">
                <CheckCircle2 className="w-6 h-6 text-[#087F5B] shrink-0" />
                <div>
                  <p className="font-semibold text-sm">You are subscribed!</p>
                  <p className="text-xs text-white/80">
                    We’ve saved {newsletterEmail}. Expect our next verified opportunity brief this Monday.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter your email address (e.g. name@gmail.com)"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/15 text-white placeholder:text-white/40 text-sm focus:outline-none focus:border-[#087F5B] transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Subscribe Free</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                {errorMsg && <p className="text-xs text-rose-400 font-medium">{errorMsg}</p>}
                <p className="text-[11px] text-white/50">
                  Zero spam. Unsubscribe anytime with 1 click. Powered by community contributors.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              {siteSettings?.logoDarkUrl || versionedLogoUrl || siteSettings?.logoUrl ? (
                <img
                  src={siteSettings?.logoDarkUrl || versionedLogoUrl || siteSettings?.logoUrl}
                  alt={siteSettings?.logoAlt || 'NaijaBridge'}
                  referrerPolicy="no-referrer"
                  className="h-9 max-h-10 w-auto object-contain"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center text-white font-bold text-sm">
                  NB
                </div>
              )}
              <span className="text-2xl font-bold font-display tracking-tight text-white">
                {siteSettings?.siteName ? siteSettings.siteName : <>Naija<span className="text-[#087F5B]">Bridge</span></>}
              </span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
              NaijaBridge is a remote-first platform helping young Nigerians, students, graduates, freelancers, and small business owners access verified opportunities, digital skills, mentorship, and trusted online services.
            </p>

            <div className="flex items-center gap-3 text-white/70">
              <a
                href={
                  contactInfo?.whatsappGroupLink ||
                  (contactInfo?.whatsappNumber
                    ? `https://wa.me/${contactInfo.whatsappNumber.replace(/[^0-9]/g, '')}`
                    : 'https://wa.me/2348000000000')
                }
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#087F5B] hover:text-white flex items-center justify-center transition-colors"
                title="WhatsApp Support & Community"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href={contactInfo?.linkedinUrl || 'https://linkedin.com'}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#087F5B] hover:text-white flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={
                  contactInfo?.twitterHandle
                    ? contactInfo.twitterHandle.startsWith('http')
                      ? contactInfo.twitterHandle
                      : `https://twitter.com/${contactInfo.twitterHandle.replace('@', '')}`
                    : 'https://twitter.com'
                }
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#087F5B] hover:text-white flex items-center justify-center transition-colors"
                title="Twitter / X"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-[#087F5B] hover:text-white flex items-center justify-center transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Directory Links */}
          <div>
            <h4 className="text-xs font-bold text-[#D99A28] uppercase tracking-wider mb-4">
              Opportunities
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Remote Jobs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Internships & Fellowships
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Scholarships & Grants
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Freelance Contracts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Volunteer Opportunities
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Pages */}
          <div>
            <h4 className="text-xs font-bold text-[#D99A28] uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <button
                  onClick={() => onNavigate('academy')}
                  className="hover:text-white transition-colors cursor-pointer text-emerald-400 font-medium"
                >
                  Tech Academy Cohorts
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('skills')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Digital Skills Tracks
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('skills')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Upcoming Workshops
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('services')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  CV & Portfolio Review
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('community')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  WhatsApp & Telegram Circles
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('partners')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Partner With Us
                </button>
              </li>
            </ul>
          </div>

          {/* Organization */}
          <div>
            <h4 className="text-xs font-bold text-[#D99A28] uppercase tracking-wider mb-4">
              Organization
            </h4>
            <ul className="space-y-2.5 text-sm text-white/70">
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About Our Mission
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Future Digital Hubs
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Founding Team
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact & Inquiries
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Frequently Asked Questions
                </button>
              </li>
              <li className="pt-2 border-t border-white/10 mt-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-[#087F5B] hover:text-[#099268] transition-colors cursor-pointer flex items-center gap-1.5 font-semibold text-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Staff & Admin Console</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Verification Disclaimer Banner */}
        <div className="mt-12 pt-8 border-t border-white/10 bg-white/5 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs text-white/70">
          <div className="p-2.5 rounded-xl bg-[#087F5B]/20 text-[#087F5B] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="font-semibold text-white block">Official Verification Disclaimer</span>
            <p className="leading-relaxed">
              NaijaBridge makes reasonable efforts to verify opportunities, but users should review the official source before submitting personal information or applications. NaijaBridge will never charge users an application fee to view or apply for vetted public opportunities.
            </p>
          </div>
        </div>

        {/* Bottom copyright & timezone */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} NaijaBridge Initiative. Built for Nigeria. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" />
              <span>Primary Timezone: West Africa Time (WAT / UTC+1)</span>
            </span>
            <span>•</span>
            <span>Pricing in Nigerian Naira (₦)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
