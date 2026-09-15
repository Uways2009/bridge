import React from 'react';
import { PageId, Opportunity } from '../types';
import { TESTIMONIALS } from '../data/mockData';
import { useAdmin } from '../context/AdminContext';
import { OpportunityCard } from '../components/OpportunityCard';
import {
  ArrowUpRight,
  ShieldCheck,
  Users,
  Search,
  BookOpen,
  Handshake,
  CheckCircle2,
  MessageCircle,
  Video,
  UserCheck,
  Mail,
  ArrowRight,
  FileText,
  Briefcase,
  TrendingUp,
  Inbox,
  Sparkles,
} from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: PageId) => void;
  featuredOpportunities: Opportunity[];
  onViewOpportunity: (opp: Opportunity) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  onRequestServiceShortcut: (serviceKey: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  featuredOpportunities,
  onViewOpportunity,
  savedIds,
  onToggleSave,
}) => {
  const { heroHeadline, heroSubheadline } = useAdmin();

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-subtle-pattern pt-10 pb-16 sm:pt-16 sm:pb-24 border-b border-[#E4E1D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E4E1D8] text-xs font-semibold text-[#0B1F33] shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#087F5B]" />
                <span>Built for Nigeria. Open to opportunity.</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display text-[#0B1F33] tracking-tight leading-[1.12]">
                {heroHeadline ? (
                  <span>{heroHeadline}</span>
                ) : (
                  <>
                    Build your next <br className="hidden sm:inline" />
                    <span className="text-[#087F5B]">opportunity.</span>
                  </>
                )}
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-stone-600 max-w-xl leading-relaxed">
                {heroSubheadline ||
                  'NaijaBridge connects Nigerians to verified opportunities, practical digital skills, trusted support, and people who can help them move forward.'}
              </p>

              {/* Primary & Secondary Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('opportunities')}
                  className="px-6 py-3.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Explore Opportunities</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('community')}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-[#EAE7DC] text-[#0B1F33] border border-[#E4E1D8] font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Join the Community</span>
                  <Users className="w-4 h-4 text-[#0F766E]" />
                </button>
              </div>

              {/* Micro-Features Row */}
              <div className="pt-4 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-stone-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
                  <span>100% Free Verification</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
                  <span>Remote-First Access</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#087F5B]" />
                  <span>Zero Application Fees</span>
                </span>
              </div>
            </div>

            {/* Right Visual Composition - Standards & Editorial Vetting Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-xl border border-[#E4E1D8] space-y-5">
                {/* Visual Header Strip */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-[#0B1F33] text-white flex items-center justify-center font-bold text-xs">
                      NB
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#0B1F33]">The NaijaBridge Standard</h4>
                      <p className="text-[11px] text-stone-500">Editorial trust across 36 states + FCT</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#087F5B]/10 text-[#087F5B]">
                    Strict Verification
                  </span>
                </div>

                {/* Vetting Checklist */}
                <div className="space-y-3">
                  <div className="bg-[#F8F7F2] p-3.5 rounded-2xl border border-[#E4E1D8] flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#087F5B] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-[#0B1F33]">Official Registry & Source Checks</h5>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Every posting is cross-referenced with institutional websites and registered corporate entities.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#F8F7F2] p-3.5 rounded-2xl border border-[#E4E1D8] flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#087F5B] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-[#0B1F33]">Zero Fee Anti-Scam Policy</h5>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        We reject any posting requiring payment, registration fees, or dubious recruitment agency deposits.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#F8F7F2] p-3.5 rounded-2xl border border-[#E4E1D8] flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-[#0B1F33]">Verified Remote Work Readiness</h5>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Curated roles accommodate power, data, and payment realities for remote professionals in Nigeria.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Status */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <span className="text-[11px] text-stone-600">Editorial review before every public listing</span>
                  <span className="text-[10px] text-[#087F5B] font-bold">100% Remote-First</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE PURPOSE PILLARS (Clean, honest foundation without fake numbers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-stone-100">
            {/* Pillar 1 */}
            <div className="pt-4 sm:pt-0 sm:px-4 space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B]">01. Opportunities</span>
              <h4 className="text-base font-bold text-[#0B1F33]">Verified Listings</h4>
              <p className="text-xs text-stone-600">Vetted jobs, scholarships, grants, and internships.</p>
            </div>

            {/* Pillar 2 */}
            <div className="pt-4 sm:pt-0 sm:px-4 space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E]">02. Skills</span>
              <h4 className="text-base font-bold text-[#0B1F33]">8 Digital Tracks</h4>
              <p className="text-xs text-stone-600">Practical curricula designed for remote earning.</p>
            </div>

            {/* Pillar 3 */}
            <div className="pt-4 sm:pt-0 sm:px-4 space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D99A28]">03. Support</span>
              <h4 className="text-base font-bold text-[#0B1F33]">Pro-Bono CV Review</h4>
              <p className="text-xs text-stone-600">ATS formatting and portfolio feedback clinics.</p>
            </div>

            {/* Pillar 4 */}
            <div className="pt-4 sm:pt-0 sm:px-4 space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B1F33]">04. Reach</span>
              <h4 className="text-base font-bold text-[#0B1F33]">36 States + FCT</h4>
              <p className="text-xs text-stone-600">Remote participation via WhatsApp and web.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW NAIJABRIDGE WORKS (4-Step Pathway) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-2 block">
            A Clear, Proven Journey
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-display text-[#0B1F33] tracking-tight">
            How NaijaBridge Works
          </h2>
          <p className="text-sm sm:text-base text-stone-600 mt-2">
            We don’t just dump links. We guide you from finding the right opportunity to submitting an application that gets chosen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center font-bold text-lg mb-4">
                01
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1F33] mb-2">
                1. Discover
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Find manually verified remote jobs, scholarships, grants, and training programs across Nigeria without falling for fake recruiter scams.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-semibold text-[#087F5B] flex items-center gap-1">
              <span>Verified Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-lg mb-4">
                02
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1F33] mb-2">
                2. Learn
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Access structured, beginner-friendly learning paths in web development, digital tools, content, data analysis, and remote freelancing.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-semibold text-[#0F766E] flex items-center gap-1">
              <span>Practical Skills Tracks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#D99A28]/15 text-[#9A6B12] flex items-center justify-center font-bold text-lg mb-4">
                03
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1F33] mb-2">
                3. Prepare
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Refine your CV for ATS screening, build a credible digital portfolio, and receive personalized feedback on your applications.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-semibold text-[#9A6B12] flex items-center gap-1">
              <span>CV & Portfolio Reviews</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs relative flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#0B1F33]/10 text-[#0B1F33] flex items-center justify-center font-bold text-lg mb-4">
                04
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1F33] mb-2">
                4. Connect
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Engage with vetted employers, mentors, and ambitious peers through our active WhatsApp circles and weekend live masterclasses.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-stone-100 text-xs font-semibold text-[#0B1F33] flex items-center gap-1">
              <span>Mentors & Employers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED OPPORTUNITIES PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-1 block">
              Hand-Vetted Listings
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33] tracking-tight">
              Featured Opportunities
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Remote jobs, internships, scholarships, and corporate grants closing soon.
            </p>
          </div>

          <button
            onClick={() => onNavigate('opportunities')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087F5B] hover:text-[#066548] cursor-pointer"
          >
            <span>View All Opportunities</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {featuredOpportunities.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-dashed border-[#E4E1D8] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h3 className="text-base font-bold text-[#0B1F33]">No opportunities have been published yet.</h3>
              <p className="text-xs text-stone-500">
                Verified job openings, scholarships, and grants will appear here when they are published by our team.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredOpportunities.slice(0, 6).map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onViewDetails={onViewOpportunity}
                isSaved={savedIds.includes(opp.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. AUDIENCE PATHWAYS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E4E1D8] shadow-xs">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-2 block">
              Tailored Guidance
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33] tracking-tight">
              Where would you like to start?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Choose the pathway that matches your current career or educational objective.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Find opportunities */}
            <div
              onClick={() => onNavigate('opportunities')}
              className="group p-6 rounded-3xl bg-[#F8F7F2] border border-[#E4E1D8] hover:border-[#087F5B] transition-all cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center mb-4 group-hover:bg-[#087F5B] group-hover:text-white transition-colors">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1F33] group-hover:text-[#087F5B] transition-colors mb-1.5">
                Find Opportunities
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Explore vetted remote vacancies, undergraduate & master’s scholarships, and funding grants.
              </p>
              <span className="text-xs font-semibold text-[#087F5B] flex items-center gap-1">
                Browse Directory <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 2. Improve my CV */}
            <div
              onClick={() => onNavigate('services')}
              className="group p-6 rounded-3xl bg-[#F8F7F2] border border-[#E4E1D8] hover:border-[#087F5B] transition-all cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-4 group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1F33] group-hover:text-[#087F5B] transition-colors mb-1.5">
                Improve my CV
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Free professional CV review and modernization optimized for Nigerian and international applicant tracking systems.
              </p>
              <span className="text-xs font-semibold text-[#0F766E] flex items-center gap-1">
                Request Free Review <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 3. Build my portfolio */}
            <div
              onClick={() => onNavigate('services')}
              className="group p-6 rounded-3xl bg-[#F8F7F2] border border-[#E4E1D8] hover:border-[#087F5B] transition-all cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#D99A28]/15 text-[#9A6B12] flex items-center justify-center mb-4 group-hover:bg-[#D99A28] group-hover:text-white transition-colors">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1F33] group-hover:text-[#087F5B] transition-colors mb-1.5">
                Build my Portfolio
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Structure your design, coding, or writing projects into credible case studies that demonstrate proof of work.
              </p>
              <span className="text-xs font-semibold text-[#9A6B12] flex items-center gap-1">
                Explore Portfolio Setup <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 4. Learn digital skills */}
            <div
              onClick={() => onNavigate('skills')}
              className="group p-6 rounded-3xl bg-[#F8F7F2] border border-[#E4E1D8] hover:border-[#087F5B] transition-all cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center mb-4 group-hover:bg-[#087F5B] group-hover:text-white transition-colors">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1F33] group-hover:text-[#087F5B] transition-colors mb-1.5">
                Learn Digital Skills
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                8 specialized learning paths from Web Development and Digital Tools to Cybersecurity and Data Analytics.
              </p>
              <span className="text-xs font-semibold text-[#087F5B] flex items-center gap-1">
                View Learning Tracks <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 5. Start or grow my business */}
            <div
              onClick={() => onNavigate('services')}
              className="group p-6 rounded-3xl bg-[#F8F7F2] border border-[#E4E1D8] hover:border-[#087F5B] transition-all cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-4 group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1F33] group-hover:text-[#087F5B] transition-colors mb-1.5">
                Start or Grow My Business
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Professional business profile PDFs, pitch decks for grants, and starter SME website setups.
              </p>
              <span className="text-xs font-semibold text-[#0F766E] flex items-center gap-1">
                SME Services <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            {/* 6. Find a mentor */}
            <div
              onClick={() => onNavigate('community')}
              className="group p-6 rounded-3xl bg-[#F8F7F2] border border-[#E4E1D8] hover:border-[#087F5B] transition-all cursor-pointer shadow-xs hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#D99A28]/15 text-[#9A6B12] flex items-center justify-center mb-4 group-hover:bg-[#D99A28] group-hover:text-white transition-colors">
                <UserCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold font-display text-[#0B1F33] group-hover:text-[#087F5B] transition-colors mb-1.5">
                Connect with Mentors
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                Participate in structured mentoring clinics with experienced Nigerian professionals and alumni.
              </p>
              <span className="text-xs font-semibold text-[#9A6B12] flex items-center gap-1">
                Join Mentoring Circles <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. REMOTE COMMUNITY PARTICIPATION SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1F33] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B]">
              Accessible Everywhere in Nigeria
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display text-white tracking-tight">
              Participate 100% Remotely.
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              NaijaBridge is engineered from day one to operate asynchronously across everyday Nigerian communication tools, so you can learn and apply wherever you live.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-[#087F5B] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">WhatsApp Communities</h4>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    Low-data discussion groups for peer reviews, alerts & mutual support.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                <Video className="w-5 h-5 text-[#0F766E] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Virtual Workshops</h4>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    Interactive weekend sessions on Google Meet, Zoom & YouTube Live.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                <UserCheck className="w-5 h-5 text-[#D99A28] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Online Mentoring</h4>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    Small-group feedback clinics with verified industry practitioners.
                  </p>
                </div>
              </div>

              <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex items-start gap-3">
                <Mail className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Email Opportunity Alerts</h4>
                  <p className="text-[11px] text-white/70 mt-0.5">
                    Weekly briefs summarizing upcoming deadlines and eligibility.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onNavigate('community')}
                className="px-6 py-3 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Join Our WhatsApp & Virtual Community</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. STORIES & TESTIMONIALS (Clean Empty State when empty) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-1 block">
            Impact in Motion
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33] tracking-tight">
            Community Outcomes
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real stories from members accessing verified opportunities through NaijaBridge.
          </p>
        </div>

        {TESTIMONIALS.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-dashed border-[#E4E1D8] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="max-w-sm mx-auto space-y-1">
              <h3 className="text-base font-bold text-[#0B1F33]">No testimonials have been added.</h3>
              <p className="text-xs text-stone-500">
                Member stories and outcomes will appear here as approved reviews are published.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block px-2.5 py-1 rounded-md bg-[#087F5B]/10 text-[#087F5B] text-[11px] font-semibold mb-3">
                    {t.impactMetric}
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed italic mb-5">
                    "{t.quote}"
                  </p>
                </div>

                <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0B1F33] text-white flex items-center justify-center font-bold text-xs">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B1F33]">{t.name}</h4>
                    <p className="text-[11px] text-stone-500">{t.role}</p>
                    <p className="text-[10px] text-stone-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 8. FINAL CALL-TO-ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#F8F7F2] border-2 border-[#E4E1D8] rounded-3xl p-8 sm:p-14 text-center space-y-6 relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#087F5B]/10 text-[#087F5B] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Take Action</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-[#0B1F33] tracking-tight">
              Your next step can start today.
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              Whether you are looking for your first remote job, funding for your business idea, or guidance on writing winning essays, NaijaBridge is here to support you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('community')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Join NaijaBridge</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('partners')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white hover:bg-stone-50 text-[#0B1F33] border border-[#E4E1D8] font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Partner with Us</span>
              <Handshake className="w-4 h-4 text-[#0F766E]" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
