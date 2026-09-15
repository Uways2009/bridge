import React, { useState, useMemo } from 'react';
import { Opportunity, OpportunityCategory } from '../types';
import { OpportunityCard } from '../components/OpportunityCard';
import {
  Search,
  Filter,
  ShieldCheck,
  RotateCcw,
  SlidersHorizontal,
  AlertCircle,
  Briefcase,
  X,
} from 'lucide-react';

interface OpportunitiesPageProps {
  opportunities: Opportunity[];
  onViewOpportunity: (opp: Opportunity) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
}

export const OpportunitiesPage: React.FC<OpportunitiesPageProps> = ({
  opportunities,
  onViewOpportunity,
  savedIds,
  onToggleSave,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedRemoteType, setSelectedRemoteType] = useState<string>('All');
  const [selectedEducation, setSelectedEducation] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'newest'>('deadline');
  const [onlyVerified, setOnlyVerified] = useState(false);

  const categories: string[] = [
    'All',
    'Jobs',
    'Internships',
    'Scholarships',
    'Grants',
    'Fellowships',
    'Training',
    'Freelance projects',
    'Volunteer opportunities',
  ];

  const filteredOpportunities = useMemo(() => {
    return opportunities
      .filter((opp) => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = opp.title.toLowerCase().includes(q);
          const matchesOrg = opp.organization.toLowerCase().includes(q);
          const matchesDesc = opp.description.toLowerCase().includes(q);
          const matchesCat = opp.category.toLowerCase().includes(q);
          if (!matchesTitle && !matchesOrg && !matchesDesc && !matchesCat) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== 'All' && opp.category !== selectedCategory) {
          return false;
        }

        // Remote Status
        if (selectedRemoteType !== 'All') {
          if (selectedRemoteType === 'Fully Remote' && opp.remoteType !== 'Fully Remote') {
            return false;
          }
          if (selectedRemoteType === 'Hybrid' && !opp.remoteType.includes('Hybrid')) {
            return false;
          }
          if (selectedRemoteType === 'On-site' && opp.remoteType !== 'On-site') {
            return false;
          }
        }

        // Education
        if (selectedEducation !== 'All' && opp.educationLevel !== selectedEducation) {
          return false;
        }

        // Only Verified
        if (onlyVerified && !opp.verified) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          return a.daysRemaining - b.daysRemaining;
        }
        return new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime();
      });
  }, [
    opportunities,
    searchQuery,
    selectedCategory,
    selectedRemoteType,
    selectedEducation,
    onlyVerified,
    sortBy,
  ]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedRemoteType('All');
    setSelectedEducation('All');
    setOnlyVerified(false);
    setSortBy('deadline');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    selectedRemoteType !== 'All' ||
    selectedEducation !== 'All' ||
    onlyVerified;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      {/* Header Banner */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" />
          <span>Vetted Directory</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#0B1F33] tracking-tight">
          Verified Opportunities
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed">
          Discover hand-screened remote jobs, scholarships, youth grants, and tech fellowships. Every opportunity has been checked to protect applicants from scams.
        </p>
      </div>

      {/* Search & Filters Control Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E4E1D8] shadow-xs space-y-4">
        {/* Top Search Input & Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by job title, grant, company, or keyword (e.g. React, TEF, Figma)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E4E1D8] text-xs sm:text-sm focus:outline-none focus:border-[#087F5B] bg-[#F8F7F2]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3.5 py-2.5 rounded-xl border border-[#E4E1D8] text-xs sm:text-sm bg-white text-stone-700 focus:outline-none focus:border-[#087F5B]"
            >
              <option value="deadline">Sort: Closing Soonest</option>
              <option value="newest">Sort: Newly Posted</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="p-2.5 rounded-xl border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0B1F33] text-white font-semibold shadow-xs'
                  : 'bg-[#F8F7F2] text-stone-600 hover:bg-stone-200/60 border border-[#E4E1D8]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Dropdown Filters */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 font-semibold">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#087F5B]" />
            <span>Filters:</span>
          </div>

          <select
            value={selectedRemoteType}
            onChange={(e) => setSelectedRemoteType(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
          >
            <option value="All">All Work Modes</option>
            <option value="Fully Remote">Fully Remote Only</option>
            <option value="Hybrid">Hybrid</option>
            <option value="On-site">On-site Only</option>
          </select>

          <select
            value={selectedEducation}
            onChange={(e) => setSelectedEducation(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-700"
          >
            <option value="All">All Education Levels</option>
            <option value="Open to Everyone">Open to Everyone</option>
            <option value="Undergraduate">Undergraduate Students</option>
            <option value="Graduate">Postgraduate / Masters</option>
          </select>

          <label className="flex items-center gap-1.5 cursor-pointer text-stone-700 select-none ml-auto">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={(e) => setOnlyVerified(e.target.checked)}
              className="rounded text-[#087F5B] focus:ring-[#087F5B]"
            />
            <span className="font-medium">Verified by NaijaBridge team</span>
          </label>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
        <AlertCircle className="w-4 h-4 text-[#D99A28] shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold">Important Disclaimer:</strong> NaijaBridge makes reasonable efforts to verify opportunities, but users should review the official source before submitting personal information or applications. Never pay application fees to any employer or recruiter.
        </p>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-stone-500 font-medium px-1">
        <span>
          Showing <strong>{filteredOpportunities.length}</strong> of {opportunities.length} opportunities
        </span>
        {hasActiveFilters && (
          <button
            onClick={handleResetFilters}
            className="text-[#087F5B] hover:underline cursor-pointer"
          >
            Clear active filters
          </button>
        )}
      </div>

      {/* Opportunities Grid */}
      {filteredOpportunities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#E4E1D8] shadow-xs space-y-4">
          <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <Briefcase className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold font-display text-[#0B1F33]">
            {opportunities.length === 0
              ? 'No opportunities have been published yet.'
              : 'No matching opportunities found'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {opportunities.length === 0
              ? 'Verified remote vacancies, scholarships, and SME grants will appear here once approved by our editorial desk.'
              : "We couldn't find any opportunities matching your current filters. Try relaxing your search terms or clearing your filters."}
          </p>
          {opportunities.length > 0 && hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-[#087F5B] text-white text-xs font-semibold hover:bg-[#066548] transition-colors cursor-pointer"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOpportunities.map((opp) => (
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
    </div>
  );
};
