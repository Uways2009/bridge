import React, { useState } from 'react';
import { SUPPORT_SERVICES } from '../data/mockData';
import { ServiceItem } from '../types';
import { ServiceCard } from '../components/ServiceCard';
import { useAdmin } from '../context/AdminContext';
import {
  FileCheck,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Clock,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

interface SupportPageProps {
  onRequestService: (service: ServiceItem) => void;
}

export const SupportPage: React.FC<SupportPageProps> = ({
  onRequestService,
}) => {
  const { services } = useAdmin();
  const [filterType, setFilterType] = useState<'All' | 'Free' | 'Paid'>('All');

  // Use real-time synchronized services from Firebase Firestore
  const activeServices = (services && services.length > 0 ? services : SUPPORT_SERVICES).filter(
    (svc) => svc.status !== 'archived'
  );

  const filteredServices = activeServices.filter((svc) => {
    if (filterType === 'Free') return svc.isFree;
    if (filterType === 'Paid') return !svc.isFree;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] flex items-center gap-1.5">
          <FileCheck className="w-4 h-4" />
          <span>Hands-on Career & SME Services</span>
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-[#0B1F33] tracking-tight">
          Practical Support Services
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          From free ATS-compliant CV modernization to professional business profile decks and portfolio websites. We help you present your work with global credibility.
        </p>
      </div>

      {/* Service Filter Tabs & Guarantee Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E4E1D8] pb-6">
        <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-[#E4E1D8]">
          <button
            onClick={() => setFilterType('All')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'All'
                ? 'bg-[#0B1F33] text-white'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Services ({activeServices.length})
          </button>
          <button
            onClick={() => setFilterType('Free')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'Free'
                ? 'bg-[#087F5B] text-white'
                : 'text-stone-600 hover:text-[#087F5B]'
            }`}
          >
            Free Community Tier (100% Free)
          </button>
          <button
            onClick={() => setFilterType('Paid')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              filterType === 'Paid'
                ? 'bg-[#D99A28] text-[#0B1F33]'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Subsidized SME Tier
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-stone-600 font-medium">
          <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
          <span>No upfront payment required to request consultation</span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            onRequest={onRequestService}
          />
        ))}
      </div>

      {/* How Our Support Process Works */}
      <div className="bg-[#F8F7F2] rounded-3xl p-8 sm:p-12 border border-[#E4E1D8] space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B]">
            Transparent Execution
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33]">
            How Support Delivery Works
          </h2>
          <p className="text-xs sm:text-sm text-stone-600">
            Simple, honest, and tailored for Nigerian realities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E4E1D8] space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h4 className="font-bold text-sm text-[#0B1F33]">Submit Your Draft or Goal</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Fill out the 2-minute request form with your existing CV, link to your portfolio, or description of the scholarship or grant you're targeting.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E4E1D8] space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h4 className="font-bold text-sm text-[#0B1F33]">WhatsApp Review & Intake</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              Our reviewer reaches out on WhatsApp or email to clarify target opportunities, confirm timelines, and ensure all requirements are clear.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E4E1D8] space-y-3">
            <span className="w-8 h-8 rounded-full bg-[#D99A28]/20 text-[#885A09] flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h4 className="font-bold text-sm text-[#0B1F33]">Receive Polished Assets</h4>
            <p className="text-xs text-stone-600 leading-relaxed">
              You receive ready-to-use editable files (DOCX, PDF, or live links) with a 7-day revision window for any feedback.
            </p>
          </div>
        </div>
      </div>

      {/* Community Support Callout */}
      <div className="bg-[#0B1F33] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
            <HeartHandshake className="w-3.5 h-3.5 text-[#D99A28]" />
            <span>Community Impact</span>
          </div>
          <h3 className="text-2xl font-bold font-display text-white">
            Need urgent feedback on your application?
          </h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Join our free weekly CV review clinics on WhatsApp and Google Meet, or connect with volunteer peer mentors in our active community circles.
          </p>
        </div>

        <button
          onClick={() => {
            const freeCv = SUPPORT_SERVICES.find((s) => s.isFree) || SUPPORT_SERVICES[0];
            onRequestService(freeCv);
          }}
          className="px-6 py-3.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Request Free Review</span>
          <FileCheck className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
