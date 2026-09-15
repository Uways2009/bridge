import React from 'react';
import { PARTNER_PLACEHOLDERS } from '../data/mockData';
import {
  Handshake,
  Building,
  GraduationCap,
  Globe2,
  Laptop,
  Heart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Briefcase,
  FileCheck,
} from 'lucide-react';

interface PartnersPageProps {
  onOpenPartnerModal: () => void;
}

export const PartnersPage: React.FC<PartnersPageProps> = ({ onOpenPartnerModal }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] flex items-center gap-1.5">
          <Handshake className="w-4 h-4" />
          <span>Institutional Collaboration</span>
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-[#0B1F33] tracking-tight">
          Partner with NaijaBridge
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Connect with vetted, disciplined Nigerian talent, sponsor digital literacy cohorts, or contribute to sustainable opportunity pipelines across all six geopolitical zones.
        </p>
      </div>

      {/* 5 Target Stakeholders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Employers */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E4E1D8] shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-[#0B1F33]">
              Employers & Recruiters
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Hire pre-screened, motivated Nigerian software engineers, product designers, digital marketers, and customer support specialists for remote, hybrid, or on-site roles.
            </p>
            <ul className="space-y-1.5 text-xs text-stone-600 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" />
                <span>Zero recruiter commissions for entry cohorts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" />
                <span>Verified identity & verified work portfolios</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onOpenPartnerModal}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#0B1F33] hover:bg-[#087F5B] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Post Vacancies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2. Educational Institutions */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E4E1D8] shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-[#0B1F33]">
              Universities & Polytechnics
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Bridge the gap between academic theory and modern market demands. We collaborate with student unions and faculties to host free campus CV clinics and industry masterclasses.
            </p>
            <ul className="space-y-1.5 text-xs text-stone-600 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Campus Ambassador chapters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Graduate employability workshops</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onOpenPartnerModal}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#0B1F33] hover:bg-[#0F766E] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Host Campus Clinic</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3. NGOs & Foundations */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E4E1D8] shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D99A28]/15 text-[#9A6B12] flex items-center justify-center">
              <Globe2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-[#0B1F33]">
              NGOs & Philanthropic Foundations
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Channel youth development grants, scholarships, and women-in-tech sponsorships through our verified beneficiary pipelines with 100% transparent audit reporting.
            </p>
            <ul className="space-y-1.5 text-xs text-stone-600 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D99A28]" />
                <span>Rigorous vetting and beneficiary monitoring</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D99A28]" />
                <span>Impact metrics & quarterly telemetry</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onOpenPartnerModal}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#0B1F33] hover:bg-[#9A6B12] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Co-Design Programs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4. Corporate Sponsors (Laptops / Data / Solar Hubs) */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E4E1D8] shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-[#0B1F33]">
              Corporate Sponsors (Equipment & Data)
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Eliminate the two largest barriers for young Nigerians: internet data bundles and refurbished laptop hardware. Sponsor 50 or 500 learners today.
            </p>
            <ul className="space-y-1.5 text-xs text-stone-600 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Direct-to-telco bundle allocation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Dedicated corporate cohort branding</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onOpenPartnerModal}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#0B1F33] hover:bg-purple-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Sponsor Infrastructure</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 5. Diaspora Mentors */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E4E1D8] shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-display text-[#0B1F33]">
              Diaspora Mentors & Professionals
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Give back 1 hour a month. Review scholarship essays, conduct mock tech interviews, or host an AMA session for aspiring professionals in your homeland.
            </p>
            <ul className="space-y-1.5 text-xs text-stone-600 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Flexible Google Meet weekend scheduling</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />
                <span>High-impact, direct 1-on-1 interaction</span>
              </li>
            </ul>
          </div>
          <button
            onClick={onOpenPartnerModal}
            className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#0B1F33] hover:bg-rose-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Volunteer as Mentor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Verified Partner Logos / Placeholder Area */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-[#E4E1D8] shadow-xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B]">
            Ecosystem Network
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33]">
            Collaborative Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-stone-500">
            Verified institutional partners, corporate sponsors, and university chapters.
          </p>
        </div>

        {PARTNER_PLACEHOLDERS.length === 0 ? (
          <div className="p-8 rounded-2xl bg-[#F8F7F2] border border-dashed border-[#E4E1D8] text-center space-y-2 max-w-lg mx-auto">
            <h4 className="text-sm font-bold text-[#0B1F33]">No institutional partners published yet.</h4>
            <p className="text-xs text-stone-500">
              Content will appear here when verified partner collaborations are announced.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {PARTNER_PLACEHOLDERS.map((partner) => (
              <div
                key={partner.id}
                className="p-6 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8] flex flex-col items-center justify-center text-center space-y-1.5 hover:border-[#087F5B]/40 transition-all"
              >
                <Building className="w-6 h-6 text-stone-400" />
                <span className="font-bold text-xs text-[#0B1F33]">{partner.name}</span>
                <span className="text-[10px] text-stone-500">{partner.type}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Main Partnership CTA Banner */}
      <div className="bg-[#0B1F33] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h3 className="text-2xl sm:text-3xl font-bold font-display text-white">
            Ready to explore a custom partnership?
          </h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Whether you want to sponsor an upcoming hackathon, fund internet bundles for 100 students, or post confidential vacancies, our team is ready to collaborate.
          </p>
        </div>

        <button
          onClick={onOpenPartnerModal}
          className="px-8 py-3.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Submit Partnership Inquiry</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
