import React, { useState } from 'react';
import { Opportunity } from '../types';
import {
  ShieldCheck,
  Calendar,
  MapPin,
  Bookmark,
  Share2,
  ArrowUpRight,
  Clock,
  Sparkles,
  Check,
} from 'lucide-react';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onViewDetails: (opp: Opportunity) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  onViewDetails,
  isSaved,
  onToggleSave,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: opportunity.title,
      text: `${opportunity.title} via NaijaBridge`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    // Clipboard copy fallback
    navigator.clipboard.writeText(
      `${opportunity.title} - ${opportunity.organization}. Apply through NaijaBridge: ${window.location.origin}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Category badge colors
  const getCategoryStyle = (cat: string) => {
    switch (cat) {
      case 'Jobs':
        return 'bg-[#087F5B]/10 text-[#087F5B] border-[#087F5B]/20';
      case 'Scholarships':
        return 'bg-[#0F766E]/10 text-[#0F766E] border-[#0F766E]/20';
      case 'Grants':
        return 'bg-[#D99A28]/15 text-[#9A6B12] border-[#D99A28]/30';
      case 'Internships':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Fellowships':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Training':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-[#E4E1D8] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-[#087F5B]/40">
      <div>
        {/* Header Badges & Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getCategoryStyle(
                opportunity.category
              )}`}
            >
              {opportunity.category}
            </span>

            {opportunity.featured && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D99A28]/15 text-[#885A09] text-xs font-semibold border border-[#D99A28]/30">
                <Sparkles className="w-3 h-3 text-[#D99A28]" />
                <span>Featured</span>
              </span>
            )}

            {opportunity.verified && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#087F5B]/10 text-[#087F5B] text-xs font-medium border border-[#087F5B]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              title="Share Opportunity"
              aria-label="Share Opportunity"
            >
              {copied ? (
                <Check className="w-4 h-4 text-[#087F5B]" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => onToggleSave(opportunity.id)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isSaved
                  ? 'text-[#087F5B] bg-[#087F5B]/10'
                  : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Opportunity'}
              aria-label="Save Opportunity"
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Opportunity Title & Org */}
        <h3
          onClick={() => onViewDetails(opportunity)}
          className="text-lg font-bold font-display text-[#0B1F33] group-hover:text-[#087F5B] transition-colors cursor-pointer line-clamp-2"
        >
          {opportunity.title}
        </h3>
        <p className="text-xs font-medium text-stone-500 mt-1 mb-3">
          {opportunity.organization}
        </p>

        {/* Short Description */}
        <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed mb-4">
          {opportunity.description}
        </p>
      </div>

      {/* Meta details & Action */}
      <div className="pt-3 border-t border-stone-100 mt-2">
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-stone-600 mb-3">
          <span className="flex items-center gap-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>{opportunity.remoteType}</span>
          </span>

          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#D99A28]" />
            <span
              className={
                opportunity.daysRemaining <= 7
                  ? 'text-rose-600 font-semibold'
                  : 'text-stone-600'
              }
            >
              {opportunity.daysRemaining > 0
                ? `${opportunity.daysRemaining} days left`
                : 'Closing soon'}
            </span>
          </span>

          {opportunity.stipendOrSalary && (
            <span className="text-[#087F5B] font-semibold">
              {opportunity.stipendOrSalary.split('(')[0]}
            </span>
          )}
        </div>

        <button
          onClick={() => onViewDetails(opportunity)}
          className="w-full py-2.5 px-4 rounded-xl bg-[#F8F7F2] hover:bg-[#087F5B] text-[#0B1F33] hover:text-white text-xs font-semibold transition-all border border-[#E4E1D8] hover:border-[#087F5B] flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>View Opportunity</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
