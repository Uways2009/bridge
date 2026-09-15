import React from 'react';
import { Opportunity } from '../types';
import {
  X,
  Bookmark,
  Trash2,
  ArrowUpRight,
  MapPin,
  Clock,
  Briefcase,
} from 'lucide-react';

interface SavedOpportunitiesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedOpportunities: Opportunity[];
  onRemoveSaved: (id: string) => void;
  onViewDetails: (opp: Opportunity) => void;
  onExploreMore: () => void;
}

export const SavedOpportunitiesDrawer: React.FC<SavedOpportunitiesDrawerProps> = ({
  isOpen,
  onClose,
  savedOpportunities,
  onRemoveSaved,
  onViewDetails,
  onExploreMore,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#F8F7F2] h-full shadow-2xl flex flex-col justify-between border-l border-[#E4E1D8] animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 bg-white border-b border-[#E4E1D8] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#087F5B]/10 text-[#087F5B]">
              <Bookmark className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-bold text-[#0B1F33] text-base font-display">
                Saved Opportunities
              </h3>
              <p className="text-xs text-stone-500">
                {savedOpportunities.length} {savedOpportunities.length === 1 ? 'item' : 'items'} bookmarked
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Close saved drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedOpportunities.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-500 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-[#E4E1D8] flex items-center justify-center text-stone-400 shadow-xs">
                <Bookmark className="w-6 h-6" />
              </div>
              <h4 className="font-semibold text-stone-800 text-sm">No saved opportunities yet</h4>
              <p className="text-xs text-stone-500 max-w-xs leading-relaxed">
                Click the bookmark icon on any opportunity card across jobs, scholarships, or grants to save them for later review.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onExploreMore();
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-[#087F5B] text-white text-xs font-semibold hover:bg-[#066548] transition-colors cursor-pointer"
              >
                Browse Opportunities
              </button>
            </div>
          ) : (
            savedOpportunities.map((opp) => (
              <div
                key={opp.id}
                className="bg-white rounded-2xl border border-[#E4E1D8] p-4 shadow-xs hover:border-[#087F5B]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {opp.category}
                    </span>
                    <button
                      onClick={() => onRemoveSaved(opp.id)}
                      className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove from saved"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4
                    onClick={() => {
                      onClose();
                      onViewDetails(opp);
                    }}
                    className="text-sm font-bold text-[#0B1F33] group-hover:text-[#087F5B] cursor-pointer transition-colors line-clamp-2"
                  >
                    {opp.title}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">{opp.organization}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#D99A28]" />
                    <span>{opp.deadline}</span>
                  </span>

                  <button
                    onClick={() => {
                      onClose();
                      onViewDetails(opp);
                    }}
                    className="font-semibold text-[#087F5B] hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-white border-t border-[#E4E1D8]">
          <button
            onClick={() => {
              onClose();
              onExploreMore();
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0B1F33] hover:bg-[#087F5B] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore All Opportunities</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
