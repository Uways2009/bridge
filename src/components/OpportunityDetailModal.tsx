import React, { useState } from 'react';
import { Opportunity } from '../types';
import {
  X,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Briefcase,
  GraduationCap,
  Sparkles,
  ArrowUpRight,
  Bookmark,
  Share2,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';

interface OpportunityDetailModalProps {
  opportunity: Opportunity | null;
  isOpen: boolean;
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  isSaved,
  onToggleSave,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !opportunity) return null;

  const handleCopyShare = () => {
    navigator.clipboard.writeText(
      `${opportunity.title} via NaijaBridge: ${window.location.origin}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E4E1D8] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#0B1F33] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-[#087F5B] text-white text-xs font-semibold">
              {opportunity.category}
            </span>
            {opportunity.verified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-medium backdrop-blur-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#087F5B]" />
                <span>Verified Listing</span>
              </span>
            )}
            {opportunity.featured && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#D99A28] text-[#0B1F33] text-xs font-bold">
                Featured
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-display text-white pr-8">
            {opportunity.title}
          </h2>
          <p className="text-sm text-white/80 font-medium mt-1">
            {opportunity.organization}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8F7F2] p-4 rounded-2xl border border-[#E4E1D8] text-xs">
            <div>
              <span className="text-stone-500 block text-[11px] mb-0.5">Location</span>
              <span className="font-semibold text-[#0B1F33] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
                {opportunity.remoteType}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px] mb-0.5">Application Deadline</span>
              <span className="font-semibold text-rose-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                {opportunity.deadline} ({opportunity.daysRemaining} days left)
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px] mb-0.5">Education / Level</span>
              <span className="font-semibold text-[#0B1F33] flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-[#D99A28]" />
                {opportunity.educationLevel}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-[11px] mb-0.5">Remuneration / Grant</span>
              <span className="font-semibold text-[#087F5B]">
                {opportunity.stipendOrSalary || 'Not specified'}
              </span>
            </div>
          </div>

          {/* About Opportunity */}
          <div>
            <h4 className="text-sm font-bold text-[#0B1F33] uppercase tracking-wider mb-2">
              Opportunity Overview
            </h4>
            <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">
              {opportunity.description}
            </p>
          </div>

          {/* Requirements */}
          {opportunity.requirements && opportunity.requirements.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-[#0B1F33] uppercase tracking-wider mb-3">
                Key Requirements & Eligibility
              </h4>
              <ul className="space-y-2">
                {opportunity.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <CheckCircle2 className="w-4 h-4 text-[#087F5B] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Benefits */}
          {opportunity.benefits && opportunity.benefits.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-[#0B1F33] uppercase tracking-wider mb-3">
                What is Provided / Benefits
              </h4>
              <ul className="space-y-2">
                {opportunity.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <Sparkles className="w-4 h-4 text-[#D99A28] shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mandatory Safety Disclaimer */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-stone-600">
            <AlertCircle className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-stone-800 font-semibold">Verification Notice:</strong>{' '}
              NaijaBridge makes reasonable efforts to verify opportunities, but users should review the official source before submitting personal information or applications.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-stone-50 border-t border-[#E4E1D8] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onToggleSave(opportunity.id)}
              className={`flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                isSaved
                  ? 'border-[#087F5B] bg-[#087F5B]/10 text-[#087F5B]'
                  : 'border-[#E4E1D8] text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              <span>{isSaved ? 'Saved to Bookmarks' : 'Save for Later'}</span>
            </button>

            <button
              onClick={handleCopyShare}
              className="px-4 py-2.5 rounded-xl border border-[#E4E1D8] text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-[#087F5B]" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
          </div>

          <a
            href={opportunity.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Official Application</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
