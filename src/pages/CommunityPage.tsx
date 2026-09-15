import React, { useState } from 'react';
import { UPCOMING_WORKSHOPS } from '../data/mockData';
import { WorkshopEvent } from '../types';
import {
  Users,
  MessageCircle,
  Send,
  Mail,
  Calendar,
  ShieldAlert,
  Award,
  ArrowRight,
  HeartHandshake,
  CheckCircle2,
  Sparkles,
  MapPin,
  Clock,
} from 'lucide-react';

interface CommunityPageProps {
  onRegisterWorkshop: (workshop: WorkshopEvent) => void;
  onOpenVolunteerModal: () => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({
  onRegisterWorkshop,
  onOpenVolunteerModal,
}) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.includes('@')) {
      setNewsletterSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] flex items-center gap-1.5">
          <Users className="w-4 h-4" />
          <span>People Moving Together</span>
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-[#0B1F33] tracking-tight">
          A Thriving Remote Community of Ambitious Nigerians
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          From undergraduate students in Nsukka to freelancers in Port Harcourt and diaspora mentors in London and Toronto. We share opportunities, critique each other's work, and grow together.
        </p>
      </div>

      {/* How to Join Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Channel 1: WhatsApp Community */}
        <div className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs flex flex-col justify-between hover:border-[#087F5B] transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F5B] block mb-1">
              Most Active
            </span>
            <h3 className="text-lg font-bold font-display text-[#0B1F33] mb-2">
              WhatsApp Circles
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Curated, low-data group circles for instant opportunity alerts, project collaborations, and daily Q&A.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-stone-100">
            <a
              href="https://chat.whatsapp.com"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Join WhatsApp Circle</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Channel 2: Telegram Channel */}
        <div className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs flex flex-col justify-between hover:border-[#0F766E] transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-4">
              <Send className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F766E] block mb-1">
              Broadcasting
            </span>
            <h3 className="text-lg font-bold font-display text-[#0B1F33] mb-2">
              Telegram Broadcast
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Real-time daily feed of verified job openings, grants, scholarships, and masterclass reminders without chatter.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-stone-100">
            <a
              href="https://t.me"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 px-3 rounded-xl bg-[#0F766E] hover:bg-[#0c5e58] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Join Telegram Channel</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Channel 3: Weekly Brief Newsletter */}
        <div className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs flex flex-col justify-between hover:border-[#D99A28] transition-all">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-[#D99A28]/15 text-[#9A6B12] flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A6B12] block mb-1">
              Every Monday
            </span>
            <h3 className="text-lg font-bold font-display text-[#0B1F33] mb-2">
              The Opportunity Brief
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every Monday at 7:00 AM WAT: 10 hand-curated opportunities, application tips, and upcoming deadlines.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-stone-100">
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              {newsletterSubscribed ? (
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold text-center">
                  ✓ Subscribed!
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className="flex-1 px-2.5 py-2 rounded-lg border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-lg bg-[#0B1F33] text-white hover:bg-[#087F5B] transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Channel 4: Future Physical Hubs */}
        <div className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
              Roadmap 2026/27
            </span>
            <h3 className="text-lg font-bold font-display text-[#0B1F33] mb-2">
              Physical Digital Hubs
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Partnering with tertiary institutions and innovation spaces to provide solar-powered internet study stations in Nigerian cities.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-stone-100">
            <span className="text-xs font-semibold text-stone-400 block text-center py-2 bg-stone-50 rounded-xl">
              Phase II Initiative
            </span>
          </div>
        </div>
      </div>

      {/* Community Guidelines & Code of Conduct */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E4E1D8] shadow-xs space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-1 block">
            Safe, Respectful Space
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33]">
            Community Guidelines & Standards
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            To keep NaijaBridge high-value, scam-free, and supportive for everyone, all members adhere to five core principles:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8] space-y-2">
            <h4 className="font-bold text-sm text-[#0B1F33] flex items-center gap-2">
              <span className="text-[#087F5B]">01.</span> Zero Tolerance for Scams
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Posting unverified schemes, multi-level marketing (MLM), paid job-application scams, or unsolicited crypto promotions results in immediate removal.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8] space-y-2">
            <h4 className="font-bold text-sm text-[#0B1F33] flex items-center gap-2">
              <span className="text-[#087F5B]">02.</span> Verified Sharing
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              When sharing an opportunity, always include the official organization link, application deadline, and eligibility criteria so peers can verify details.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8] space-y-2">
            <h4 className="font-bold text-sm text-[#0B1F33] flex items-center gap-2">
              <span className="text-[#087F5B]">03.</span> Constructive Peer Reviews
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              When reviewing a peer's CV, portfolio, or essay, offer specific, encouraging, and actionable feedback that helps them improve their chances.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8] space-y-2">
            <h4 className="font-bold text-sm text-[#0B1F33] flex items-center gap-2">
              <span className="text-[#087F5B]">04.</span> Collaboration over Competition
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              One Nigerian winning a scholarship or remote job creates a path for the next person. We celebrate every member's breakthrough.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8] space-y-2">
            <h4 className="font-bold text-sm text-[#0B1F33] flex items-center gap-2">
              <span className="text-[#087F5B]">05.</span> Privacy & Respect
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Never scrape or solicit personal telephone numbers from community group members for spam marketing. Keep discussions focused and courteous.
            </p>
          </div>
        </div>
      </section>

      {/* Upcoming Community Events Schedule */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E4E1D8] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-1 block">
              Live Interactive Sessions
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33]">
              Upcoming Virtual Events
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Join free weekly masterclasses, live CV review clinics, and diaspora AMA panels.
            </p>
          </div>
        </div>

        {UPCOMING_WORKSHOPS.length === 0 ? (
          <div className="bg-[#F8F7F2] rounded-2xl p-10 border border-dashed border-[#E4E1D8] text-center space-y-2">
            <h3 className="text-base font-bold text-[#0B1F33]">No upcoming events are available.</h3>
            <p className="text-xs text-stone-500">
              Virtual masterclasses and CV clinics will appear here when they are scheduled.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {UPCOMING_WORKSHOPS.map((event) => (
              <div
                key={event.id}
                className="bg-[#F8F7F2] p-5 rounded-2xl border border-[#E4E1D8] flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded bg-[#087F5B]/10 text-[#087F5B] font-bold">
                      {event.fee}
                    </span>
                    <span className="text-stone-500">{event.platform}</span>
                  </div>
                  <h4 className="font-bold font-display text-[#0B1F33] text-base">
                    {event.title}
                  </h4>
                  <p className="text-xs text-stone-600 line-clamp-2">{event.description}</p>
                  <div className="pt-2 text-xs text-stone-600 space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-stone-900">
                      <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-stone-500">
                      <Clock className="w-3.5 h-3.5 text-[#D99A28]" />
                      <span>{event.timeWAT}</span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      Host: <strong>{event.speaker}</strong>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onRegisterWorkshop(event)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Register for Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Volunteer & Campus Ambassador Program */}
      <section className="bg-[#0B1F33] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-[#D99A28]" />
            <span>Youth Leadership</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
            Become a Campus Ambassador or Community Facilitator
          </h2>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Are you an energetic undergraduate or recent graduate? Help us organize watch parties for masterclasses, verify regional opportunities, and guide your fellow students into digital pathways.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
              <span>Official Certificate of Volunteer Leadership</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
              <span>Direct 1-on-1 Mentorship from Advisory Board</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
              <span>Monthly Internet Data Stipend for active ambassadors</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
              <span>Priority recommendation letters for scholarships</span>
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onOpenVolunteerModal}
              className="px-6 py-3.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <span>Apply to Volunteer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
