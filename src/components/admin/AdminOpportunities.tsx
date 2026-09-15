import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Opportunity,
  OpportunityCategory,
  OpportunityStatus,
} from '../../types';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  Archive,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
  Eye,
  X,
  FileCheck,
  Check,
} from 'lucide-react';

interface AdminOpportunitiesProps {
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
  onOpenCreateModal: () => void;
}

export const AdminOpportunities: React.FC<AdminOpportunitiesProps> = ({
  isCreateModalOpen,
  onCloseCreateModal,
  onOpenCreateModal,
}) => {
  const {
    opportunities,
    createOpportunity,
    updateOpportunity,
    deleteOpportunity,
    changeOpportunityStatus,
    toggleFeatureOpportunity,
    approveAndPublishOpportunity,
    archiveOpportunity,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatusTab, setSelectedStatusTab] = useState<string>('All');
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state for Create / Edit modal
  const [formTitle, setFormTitle] = useState('');
  const [formOrg, setFormOrg] = useState('');
  const [formCategory, setFormCategory] = useState<OpportunityCategory>('Jobs');
  const [formType, setFormType] = useState<Opportunity['type']>('Full-time');
  const [formLocation, setFormLocation] = useState('Lagos, Nigeria / Hybrid');
  const [formIsRemote, setFormIsRemote] = useState(true);
  const [formRemoteType, setFormRemoteType] = useState<Opportunity['remoteType']>('Hybrid (Nigeria)');
  const [formEducationLevel, setFormEducationLevel] = useState<Opportunity['educationLevel']>('Graduate');
  const [formSalary, setFormSalary] = useState('');
  const [formDeadline, setFormDeadline] = useState('2026-10-31');
  const [formApplicationUrl, setFormApplicationUrl] = useState('https://');
  const [formOfficialSourceLink, setFormOfficialSourceLink] = useState('https://');
  const [formDescription, setFormDescription] = useState('');
  const [formRequirements, setFormRequirements] = useState<string[]>(['']);
  const [formBenefits, setFormBenefits] = useState<string[]>(['']);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formStatus, setFormStatus] = useState<OpportunityStatus>('Pending');

  const categories: ('All' | OpportunityCategory)[] = [
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

  const statusTabs = [
    'All',
    'Pending',
    'In Review',
    'Verified',
    'Published',
    'Archived',
    'Draft',
  ];

  // Open modal in Edit mode
  const handleOpenEdit = (opp: Opportunity) => {
    setEditingOpportunity(opp);
    setFormTitle(opp.title);
    setFormOrg(opp.organization);
    setFormCategory(opp.category);
    setFormType(opp.type);
    setFormLocation(opp.location);
    setFormIsRemote(opp.isRemote);
    setFormRemoteType(opp.remoteType);
    setFormEducationLevel(opp.educationLevel);
    setFormSalary(opp.stipendOrSalary || '');
    setFormDeadline(opp.deadline);
    setFormApplicationUrl(opp.applicationUrl);
    setFormOfficialSourceLink(opp.officialSourceLink || opp.applicationUrl);
    setFormDescription(opp.description);
    setFormRequirements(opp.requirements.length > 0 ? opp.requirements : ['']);
    setFormBenefits(opp.benefits.length > 0 ? opp.benefits : ['']);
    setFormFeatured(opp.featured);
    setFormStatus(opp.status || 'Published');
  };

  const handleCloseModal = () => {
    setEditingOpportunity(null);
    onCloseCreateModal();
    resetForm();
  };

  const resetForm = () => {
    setFormTitle('');
    setFormOrg('');
    setFormCategory('Jobs');
    setFormType('Full-time');
    setFormLocation('Lagos, Nigeria / Hybrid');
    setFormIsRemote(true);
    setFormRemoteType('Hybrid (Nigeria)');
    setFormEducationLevel('Graduate');
    setFormSalary('');
    setFormDeadline('2026-10-31');
    setFormApplicationUrl('https://');
    setFormOfficialSourceLink('https://');
    setFormDescription('');
    setFormRequirements(['']);
    setFormBenefits(['']);
    setFormFeatured(false);
    setFormStatus('Pending');
  };

  const handleRequirementChange = (index: number, val: string) => {
    const updated = [...formRequirements];
    updated[index] = val;
    setFormRequirements(updated);
  };

  const addRequirementField = () => {
    setFormRequirements([...formRequirements, '']);
  };

  const removeRequirementField = (index: number) => {
    if (formRequirements.length > 1) {
      setFormRequirements(formRequirements.filter((_, i) => i !== index));
    }
  };

  const handleBenefitChange = (index: number, val: string) => {
    const updated = [...formBenefits];
    updated[index] = val;
    setFormBenefits(updated);
  };

  const addBenefitField = () => {
    setFormBenefits([...formBenefits, '']);
  };

  const removeBenefitField = (index: number) => {
    if (formBenefits.length > 1) {
      setFormBenefits(formBenefits.filter((_, i) => i !== index));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanReqs = formRequirements.filter((r) => r.trim().length > 0);
    const cleanBenefits = formBenefits.filter((b) => b.trim().length > 0);

    if (editingOpportunity) {
      updateOpportunity(editingOpportunity.id, {
        title: formTitle,
        organization: formOrg,
        category: formCategory,
        type: formType,
        location: formLocation,
        isRemote: formIsRemote,
        remoteType: formRemoteType,
        educationLevel: formEducationLevel,
        stipendOrSalary: formSalary,
        deadline: formDeadline,
        applicationUrl: formApplicationUrl,
        officialSourceLink: formOfficialSourceLink,
        description: formDescription,
        requirements: cleanReqs,
        benefits: cleanBenefits,
        featured: formFeatured,
        status: formStatus,
        verified: formStatus === 'Verified' || formStatus === 'Published',
      });
    } else {
      createOpportunity({
        title: formTitle,
        organization: formOrg,
        category: formCategory,
        type: formType,
        location: formLocation,
        isRemote: formIsRemote,
        remoteType: formRemoteType,
        educationLevel: formEducationLevel,
        stipendOrSalary: formSalary,
        deadline: formDeadline,
        daysRemaining: 30,
        applicationUrl: formApplicationUrl,
        officialSourceLink: formOfficialSourceLink,
        description: formDescription,
        requirements: cleanReqs,
        benefits: cleanBenefits,
        featured: formFeatured,
        status: formStatus,
        verified: formStatus === 'Verified' || formStatus === 'Published',
      });
    }

    handleCloseModal();
  };

  // Filtering
  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || opp.category === selectedCategory;

    const matchesStatus =
      selectedStatusTab === 'All' ||
      (opp.status || 'Published').toLowerCase() === selectedStatusTab.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const isModalOpen = isCreateModalOpen || editingOpportunity !== null;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#0B1F33]">
            Opportunities Management
          </h1>
          <p className="text-xs text-[#1F2933]/70 mt-1">
            Create, moderate, verify official source credentials, publish, and track opportunity lifecycles.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E4E1D8]">
        {statusTabs.map((tab) => {
          const count =
            tab === 'All'
              ? opportunities.length
              : opportunities.filter(
                  (o) => (o.status || 'Published').toLowerCase() === tab.toLowerCase()
                ).length;

          const isActive = selectedStatusTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setSelectedStatusTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-[#0B1F33] text-white shadow-xs'
                  : 'text-[#1F2933]/70 hover:bg-[#EAE7DC]/60 hover:text-[#0B1F33]'
              }`}
            >
              <span>{tab}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-[#EAE7DC] text-[#1F2933]/80'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#1F2933]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by role title, hiring organization, or keywords..."
            className="w-full bg-white border border-[#E4E1D8] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0B1F33] placeholder:text-[#1F2933]/40 focus:outline-none focus:border-[#087F5B]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-white border border-[#E4E1D8] rounded-xl px-3 py-1.5 text-xs text-[#1F2933] w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-[#1F2933]/50" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities Table */}
      <div className="bg-white rounded-3xl border border-[#E4E1D8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F2] border-b border-[#E4E1D8] text-[#1F2933]/70 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Opportunity & Org</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Type / Location</th>
                <th className="py-3.5 px-4">Status & Vetting</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E1D8]">
              {filteredOpportunities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-[#1F2933]/60">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-base text-[#0B1F33]">
                        {opportunities.length === 0
                          ? 'No opportunities added yet.'
                          : 'No opportunities match your selected filters.'}
                      </p>
                      <p className="text-xs text-stone-500">
                        {opportunities.length === 0
                          ? 'Content will appear here when it is published. Use the button above to add your first verified opportunity.'
                          : 'Try changing your search query or selecting a different category filter.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOpportunities.map((opp) => {
                  const status = opp.status || 'Published';
                  let statusBadgeClass = 'bg-[#087F5B]/10 text-[#087F5B] border-[#087F5B]/30';
                  if (status === 'Pending' || status === 'New') {
                    statusBadgeClass = 'bg-[#D99A28]/15 text-[#D99A28] border-[#D99A28]/30';
                  } else if (status === 'In Review') {
                    statusBadgeClass = 'bg-[#0F766E]/15 text-[#0F766E] border-[#0F766E]/30';
                  } else if (status === 'Archived' || status === 'Closed') {
                    statusBadgeClass = 'bg-gray-100 text-gray-600 border-gray-200';
                  }

                  return (
                    <tr key={opp.id} className="hover:bg-[#F8F7F2]/50 transition-colors">
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#0B1F33] text-sm hover:text-[#087F5B] transition-colors line-clamp-1">
                            {opp.title}
                          </p>
                          <p className="text-[11px] text-[#1F2933]/60">{opp.organization}</p>
                          {opp.officialSourceLink && (
                            <a
                              href={opp.officialSourceLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-[#0F766E] hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <span>Official source</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-medium text-[#0B1F33]">{opp.category}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="text-[#0B1F33] font-medium">{opp.type}</p>
                        <p className="text-[11px] text-[#1F2933]/60">{opp.remoteType}</p>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadgeClass}`}
                          >
                            {status}
                          </span>
                          {opp.verified ? (
                            <div className="flex items-center gap-1 text-[10px] text-[#087F5B]">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] text-[#D99A28]">
                              <Clock className="w-3 h-3" />
                              <span>Needs Vetting</span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="text-[#0B1F33] font-medium">{opp.deadline}</p>
                        <p className="text-[10px] text-[#1F2933]/60">
                          {opp.daysRemaining > 0 ? `${opp.daysRemaining} days left` : 'Expired'}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => toggleFeatureOpportunity(opp.id)}
                          className="p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-[#D99A28]"
                          title={opp.featured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              opp.featured ? 'fill-[#D99A28] text-[#D99A28]' : 'text-gray-300'
                            }`}
                          />
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Publish / Approve */}
                          {status !== 'Published' && (
                            <button
                              onClick={() => approveAndPublishOpportunity(opp.id)}
                              className="p-1.5 rounded-lg bg-[#087F5B]/10 hover:bg-[#087F5B] hover:text-white text-[#087F5B] transition-colors cursor-pointer"
                              title="Approve & Publish to Directory"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            onClick={() => handleOpenEdit(opp)}
                            className="p-1.5 rounded-lg hover:bg-[#EAE7DC] text-[#0B1F33] transition-colors cursor-pointer"
                            title="Edit opportunity details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive button */}
                          {status !== 'Archived' && (
                            <button
                              onClick={() => archiveOpportunity(opp.id)}
                              className="p-1.5 rounded-lg hover:bg-[#EAE7DC] text-[#1F2933]/60 hover:text-[#0B1F33] transition-colors cursor-pointer"
                              title="Archive listing"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          <button
                            onClick={() => setDeletingId(opp.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                            title="Delete permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-[#E4E1D8]">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1F33]">Confirm Deletion</h3>
              <p className="text-xs text-[#1F2933]/70 mt-1">
                Are you sure you want to permanently delete this opportunity? This action is logged.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-[#E4E1D8] text-xs font-semibold text-[#1F2933] hover:bg-[#EAE7DC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteOpportunity(deletingId);
                  setDeletingId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Delete Opportunity
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Opportunity Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-[#E4E1D8] max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E1D8] mb-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[#0B1F33]">
                  {editingOpportunity ? 'Edit Opportunity' : 'Create & Moderate Opportunity'}
                </h2>
                <p className="text-xs text-[#1F2933]/60 mt-0.5">
                  Ensure all details, official application links, and criteria are verified before publishing.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-[#1F2933]/50 hover:bg-[#EAE7DC] hover:text-[#0B1F33] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6 text-xs">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Opportunity Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Junior Cloud Engineer Trainee"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Hiring Organization / Grant Foundation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formOrg}
                    onChange={(e) => setFormOrg(e.target.value)}
                    placeholder="e.g. Interswitch, TEF, Google Africa"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              {/* Category, Type & Remote Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as OpportunityCategory)}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  >
                    {categories
                      .filter((c) => c !== 'All')
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Engagement Type *
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as Opportunity['type'])}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Fellowship">Fellowship</option>
                    <option value="Grant">Grant</option>
                    <option value="Program">Program</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Remote Arrangement *
                  </label>
                  <select
                    value={formRemoteType}
                    onChange={(e) => {
                      const val = e.target.value as Opportunity['remoteType'];
                      setFormRemoteType(val);
                      setFormIsRemote(val !== 'On-site');
                    }}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="Fully Remote">Fully Remote</option>
                    <option value="Hybrid (Nigeria)">Hybrid (Nigeria)</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              {/* Location, Salary & Education */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Location / State
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Lagos, Abuja, Pan-Nigeria"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Stipend / Salary / Grant Amount
                  </label>
                  <input
                    type="text"
                    value={formSalary}
                    onChange={(e) => setFormSalary(e.target.value)}
                    placeholder="e.g. ₦250,000 / mo or $5,000 grant"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Education / Career Level
                  </label>
                  <select
                    value={formEducationLevel}
                    onChange={(e) =>
                      setFormEducationLevel(e.target.value as Opportunity['educationLevel'])
                    }
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="Open to Everyone">Open to Everyone</option>
                    <option value="Undergraduate">Undergraduate</option>
                    <option value="Graduate">Graduate / NYSC</option>
                    <option value="Mid-Level">Mid-Level</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>

              {/* Deadline & Official Source Links */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Application Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Application Link URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formApplicationUrl}
                    onChange={(e) => setFormApplicationUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Official Verification / Source Link
                  </label>
                  <input
                    type="url"
                    value={formOfficialSourceLink}
                    onChange={(e) => setFormOfficialSourceLink(e.target.value)}
                    placeholder="https://company.com/careers"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-[#0B1F33] mb-1">
                  Full Description & Scope *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Summarize the core requirements, day-to-day duties or grant objectives..."
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl p-3 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              {/* Dynamic Requirements List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-[#0B1F33]">
                    Requirements & Eligibility Criteria
                  </label>
                  <button
                    type="button"
                    onClick={addRequirementField}
                    className="text-[#087F5B] hover:text-[#066548] font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formRequirements.map((req, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={req}
                        onChange={(e) => handleRequirementChange(idx, e.target.value)}
                        placeholder={`Requirement ${idx + 1}`}
                        className="flex-1 bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                      />
                      {formRequirements.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRequirementField(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Benefits List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-semibold text-[#0B1F33]">
                    Benefits, Mentorship & Perks
                  </label>
                  <button
                    type="button"
                    onClick={addBenefitField}
                    className="text-[#087F5B] hover:text-[#066548] font-semibold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Benefit</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {formBenefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => handleBenefitChange(idx, e.target.value)}
                        placeholder={`Benefit ${idx + 1}`}
                        className="flex-1 bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                      />
                      {formBenefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBenefitField(idx)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status & Featured */}
              <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#0B1F33]">
                    Publication Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as OpportunityStatus)}
                    className="bg-white border border-[#E4E1D8] rounded-xl px-3 py-1.5 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="Published">Published (Live to public)</option>
                    <option value="Verified">Verified (Ready for launch)</option>
                    <option value="Pending">Pending (Needs verification)</option>
                    <option value="In Review">In Review</option>
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-medium text-[#0B1F33] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formFeatured}
                      onChange={(e) => setFormFeatured(e.target.checked)}
                      className="w-4 h-4 rounded text-[#087F5B] border-[#E4E1D8]"
                    />
                    <span>Highlight as Featured Opportunity</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E1D8]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-[#E4E1D8] text-xs font-semibold text-[#1F2933] hover:bg-[#EAE7DC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
                >
                  {editingOpportunity ? 'Save Updates' : 'Save & Record in Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
