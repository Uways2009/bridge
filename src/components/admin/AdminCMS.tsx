import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { FAQItem } from '../../types';
import { AdminBrandMedia } from './AdminBrandMedia';
import { AdminServicesCMS } from './AdminServicesCMS';
import { AdminContactInfoCMS } from './AdminContactInfoCMS';
import { AdminTeamCMS } from './AdminTeamCMS';
import { AdminProductsCMS } from './AdminProductsCMS';
import {
  LayoutTemplate,
  BellRing,
  Award,
  HelpCircle,
  Briefcase,
  Users,
  CheckCircle2,
  Save,
  Plus,
  Edit2,
  Trash2,
  X,
  Upload,
  Mail,
  FileText,
  Clock,
  Sparkles,
  RotateCw,
} from 'lucide-react';

export const AdminCMS: React.FC = () => {
  const {
    siteAnnouncement,
    updateSiteAnnouncement,
    heroHeadline,
    heroSubheadline,
    updateHeroContent,
    impactMetrics,
    updateImpactMetrics,
    faqs,
    createFAQ,
    updateFAQ,
    deleteFAQ,
    canEditContent,
    syncStatus,
    lastSyncedAt,
  } = useAdmin();

  // Active section inside CMS
  const [activeSection, setActiveSection] = useState<
    | 'brand_media'
    | 'services'
    | 'contact_info'
    | 'team'
    | 'resources'
    | 'announcements'
    | 'hero'
    | 'metrics'
    | 'faqs'
  >('brand_media');

  // Announcement state
  const [annActive, setAnnActive] = useState(siteAnnouncement.active);
  const [annMessage, setAnnMessage] = useState(siteAnnouncement.message);
  const [annLinkText, setAnnLinkText] = useState(siteAnnouncement.linkText);
  const [annLinkUrl, setAnnLinkUrl] = useState(siteAnnouncement.linkUrl || '/opportunities');
  const [annSaved, setAnnSaved] = useState(false);

  // Hero state
  const [localHeadline, setLocalHeadline] = useState(heroHeadline);
  const [localSubheadline, setLocalSubheadline] = useState(heroSubheadline);
  const [heroSaved, setHeroSaved] = useState(false);

  // Impact metrics state
  const [metricsReached, setMetricsReached] = useState(impactMetrics.reached);
  const [metricsVerified, setMetricsVerified] = useState(impactMetrics.verified);
  const [metricsWorkshops, setMetricsWorkshops] = useState(impactMetrics.workshops);
  const [metricsStates, setMetricsStates] = useState(impactMetrics.states);
  const [metricsSaved, setMetricsSaved] = useState(false);

  // FAQ modal state
  const [editingFaq, setEditingFaq] = useState<FAQItem | null>(null);
  const [isNewFaqModalOpen, setIsNewFaqModalOpen] = useState(false);
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqAnswer, setFaqAnswer] = useState('');
  const [faqCategory, setFaqCategory] = useState<FAQItem['category']>('General');
  const [isSavingFaq, setIsSavingFaq] = useState(false);
  const [faqFilterCategory, setFaqFilterCategory] = useState<string>('all');

  // React to async Firestore snapshots
  useEffect(() => {
    setAnnActive(siteAnnouncement.active);
    setAnnMessage(siteAnnouncement.message);
    setAnnLinkText(siteAnnouncement.linkText);
    if (siteAnnouncement.linkUrl) setAnnLinkUrl(siteAnnouncement.linkUrl);
  }, [siteAnnouncement]);

  useEffect(() => {
    setLocalHeadline(heroHeadline);
    setLocalSubheadline(heroSubheadline);
  }, [heroHeadline, heroSubheadline]);

  useEffect(() => {
    setMetricsReached(impactMetrics.reached);
    setMetricsVerified(impactMetrics.verified);
    setMetricsWorkshops(impactMetrics.workshops);
    setMetricsStates(impactMetrics.states);
  }, [impactMetrics]);

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSiteAnnouncement({
      active: annActive,
      message: annMessage,
      linkText: annLinkText,
      linkUrl: annLinkUrl,
      linkPage: siteAnnouncement.linkPage || 'opportunities',
      type: siteAnnouncement.type || 'info',
    });
    setAnnSaved(true);
    setTimeout(() => setAnnSaved(false), 2500);
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateHeroContent(localHeadline, localSubheadline);
    setHeroSaved(true);
    setTimeout(() => setHeroSaved(false), 2500);
  };

  const handleSaveMetrics = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateImpactMetrics({
      reached: metricsReached,
      verified: metricsVerified,
      workshops: metricsWorkshops,
      states: metricsStates,
    });
    setMetricsSaved(true);
    setTimeout(() => setMetricsSaved(false), 2500);
  };

  const handleSaveFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingFaq(true);
    try {
      if (editingFaq) {
        await updateFAQ(editingFaq.id, {
          question: faqQuestion.trim(),
          answer: faqAnswer.trim(),
          category: faqCategory,
        });
      } else {
        await createFAQ({
          question: faqQuestion.trim(),
          answer: faqAnswer.trim(),
          category: faqCategory,
        });
      }
      setEditingFaq(null);
      setIsNewFaqModalOpen(false);
      setFaqQuestion('');
      setFaqAnswer('');
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Failed to save FAQ'}`);
    } finally {
      setIsSavingFaq(false);
    }
  };

  const filteredFaqs = faqs.filter((faq) => {
    if (faqFilterCategory === 'all') return true;
    return faq.category === faqFilterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header & Sync Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#0B1F33]">
            Site Content Management (CMS)
          </h1>
          <p className="text-xs text-stone-600 mt-1">
            Directly update public site messaging, support services, verified contact channels, team profiles, and FAQs.
          </p>
        </div>

        {/* Real-time synchronization indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-[11px] text-[#087F5B] font-semibold">
          {syncStatus === 'syncing' ? (
            <>
              <RotateCw className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing with Firebase...</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-pulse" />
              <span>Live Synced to Public Site</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E4E1D8]">
        {[
          { id: 'brand_media', label: 'Brand Logo & Media', icon: <Upload className="w-3.5 h-3.5" /> },
          { id: 'services', label: 'Support Services & Pricing', icon: <Briefcase className="w-3.5 h-3.5" /> },
          { id: 'contact_info', label: 'Contact Channels & Desk', icon: <Mail className="w-3.5 h-3.5" /> },
          { id: 'team', label: 'Founding & Advisory Team', icon: <Users className="w-3.5 h-3.5" /> },
          { id: 'resources', label: 'Products & Toolkits', icon: <FileText className="w-3.5 h-3.5" /> },
          { id: 'announcements', label: 'Announcement Banner', icon: <BellRing className="w-3.5 h-3.5" /> },
          { id: 'hero', label: 'Homepage Hero Copy', icon: <LayoutTemplate className="w-3.5 h-3.5" /> },
          { id: 'metrics', label: 'Impact Statistics', icon: <Award className="w-3.5 h-3.5" /> },
          { id: 'faqs', label: 'FAQ Database', icon: <HelpCircle className="w-3.5 h-3.5" /> },
        ].map((tab) => {
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-[#0B1F33] text-white shadow-xs'
                  : 'text-[#1F2933]/70 hover:bg-[#EAE7DC]/60 hover:text-[#0B1F33]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SECTION 1: Brand Logo & Media */}
      {activeSection === 'brand_media' && <AdminBrandMedia />}

      {/* SECTION 2: Support Services & Pricing Packages */}
      {activeSection === 'services' && <AdminServicesCMS />}

      {/* SECTION 3: Contact Channels & Desk */}
      {activeSection === 'contact_info' && <AdminContactInfoCMS />}

      {/* SECTION 4: Founding & Advisory Team */}
      {activeSection === 'team' && <AdminTeamCMS />}

      {/* SECTION 5: Products & Resources Toolkits */}
      {activeSection === 'resources' && <AdminProductsCMS />}

      {/* SECTION 6: Top Announcement Banner */}
      {activeSection === 'announcements' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs max-w-3xl space-y-6">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div>
              <h3 className="text-base font-bold font-display text-[#0B1F33]">
                Top Announcement Bar
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Displays a prominent alert banner at the very top of all public pages for urgent updates.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={annActive}
                onChange={(e) => setAnnActive(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#087F5B]"></div>
              <span className="ml-3 text-xs font-semibold text-stone-700">
                {annActive ? 'Active (Visible)' : 'Disabled'}
              </span>
            </label>
          </div>

          {/* Live Preview of Banner */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Live Preview
            </span>
            {annActive ? (
              <div className="bg-[#0B1F33] text-[#F8F7F2] px-4 py-2 rounded-xl flex items-center justify-between text-xs gap-3">
                <span className="truncate">{annMessage || 'Banner preview message...'}</span>
                <span className="font-semibold underline text-[#087F5B] shrink-0 cursor-pointer">
                  {annLinkText || 'Learn More'} &rarr;
                </span>
              </div>
            ) : (
              <div className="p-3 text-stone-400 italic text-center">
                Announcement banner is currently turned off and hidden from public visitors.
              </div>
            )}
          </div>

          <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Announcement Message *
              </label>
              <input
                type="text"
                required
                value={annMessage}
                onChange={(e) => setAnnMessage(e.target.value)}
                placeholder="e.g. 🚨 New Federal Tech Scholarship applications are now live. 100% verified."
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Call-to-Action Link Text
                </label>
                <input
                  type="text"
                  value={annLinkText}
                  onChange={(e) => setAnnLinkText(e.target.value)}
                  placeholder="e.g. Apply Before Deadline"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Destination URL / Route
                </label>
                <input
                  type="text"
                  value={annLinkUrl}
                  onChange={(e) => setAnnLinkUrl(e.target.value)}
                  placeholder="e.g. /opportunities or https://..."
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {annSaved && (
                <span className="text-xs text-[#087F5B] font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Announcement saved and synchronized!</span>
                </span>
              )}
              {canEditContent && (
                <button
                  type="submit"
                  className="ml-auto px-5 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Announcement</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SECTION 7: Homepage Hero Copy */}
      {activeSection === 'hero' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-bold font-display text-[#0B1F33]">
              Homepage Hero Headline & Subheadline
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Instantly adjust the primary display tagline and value proposition seen on the homepage.
            </p>
          </div>

          <form onSubmit={handleSaveHero} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Primary Hero Headline *
              </label>
              <input
                type="text"
                required
                value={localHeadline}
                onChange={(e) => setLocalHeadline(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Supporting Subheadline Description *
              </label>
              <textarea
                rows={3}
                required
                value={localSubheadline}
                onChange={(e) => setLocalSubheadline(e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl p-3 text-xs focus:outline-none focus:border-[#087F5B] leading-relaxed"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              {heroSaved && (
                <span className="text-xs text-[#087F5B] font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hero copy saved and synced!</span>
                </span>
              )}
              {canEditContent && (
                <button
                  type="submit"
                  className="ml-auto px-5 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Hero Content</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SECTION 8: Impact Statistics */}
      {activeSection === 'metrics' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs max-w-3xl space-y-6">
          <div>
            <h3 className="text-base font-bold font-display text-[#0B1F33]">
              Verified Impact Statistics
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              These live metrics appear across the homepage and about page to communicate institutional credibility.
            </p>
          </div>

          <form onSubmit={handleSaveMetrics} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Youth & Jobseekers Reached
                </label>
                <input
                  type="text"
                  value={metricsReached}
                  onChange={(e) => setMetricsReached(e.target.value)}
                  placeholder="e.g. 50,000+"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Verified Scam-Free Opportunities
                </label>
                <input
                  type="text"
                  value={metricsVerified}
                  onChange={(e) => setMetricsVerified(e.target.value)}
                  placeholder="e.g. 1,200+"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Workshops & Clinics Conducted
                </label>
                <input
                  type="text"
                  value={metricsWorkshops}
                  onChange={(e) => setMetricsWorkshops(e.target.value)}
                  placeholder="e.g. 140+"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Nigerian States & FCT Reached
                </label>
                <input
                  type="text"
                  value={metricsStates}
                  onChange={(e) => setMetricsStates(e.target.value)}
                  placeholder="e.g. 36 + FCT"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {metricsSaved && (
                <span className="text-xs text-[#087F5B] font-semibold flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Metrics saved and synchronized!</span>
                </span>
              )}
              {canEditContent && (
                <button
                  type="submit"
                  className="ml-auto px-5 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Impact Metrics</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* SECTION 9: FAQ Database */}
      {activeSection === 'faqs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold font-display text-[#0B1F33] flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#087F5B]" />
                <span>Frequently Asked Questions</span>
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Questions displayed on the public contact page and information portal.
              </p>
            </div>

            {canEditContent && (
              <button
                onClick={() => {
                  setEditingFaq(null);
                  setFaqQuestion('');
                  setFaqAnswer('');
                  setFaqCategory('General');
                  setIsNewFaqModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add FAQ Question</span>
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {['all', 'General', 'Opportunities', 'Services', 'Community', 'Partners'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFaqFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  faqFilterCategory === cat
                    ? 'bg-[#0B1F33] text-white'
                    : 'bg-white text-stone-600 border border-[#E4E1D8] hover:bg-stone-100'
                }`}
              >
                {cat === 'all' ? `All Questions (${faqs.length})` : cat}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 border border-[#E4E1D8] text-center text-xs text-stone-500">
                No FAQs found in this category.
              </div>
            ) : (
              filteredFaqs.map((faq) => (
                <div
                  key={faq.id}
                  className="p-5 rounded-2xl bg-white border border-[#E4E1D8] shadow-xs flex items-start justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#087F5B] bg-[#087F5B]/10 px-2 py-0.5 rounded-md">
                      {faq.category || 'General'}
                    </span>
                    <h4 className="font-bold text-sm text-[#0B1F33]">{faq.question}</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">{faq.answer}</p>
                  </div>

                  {canEditContent && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => {
                          setEditingFaq(faq);
                          setFaqQuestion(faq.question);
                          setFaqAnswer(faq.answer);
                          setFaqCategory(faq.category || 'General');
                          setIsNewFaqModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 cursor-pointer"
                        title="Edit FAQ"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm(`Delete FAQ: "${faq.question}"?`)) {
                            await deleteFAQ(faq.id);
                          }
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                        title="Delete FAQ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal: FAQ Editor */}
      {isNewFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-4 border border-[#E4E1D8] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D8]">
              <h3 className="font-bold text-base font-display text-[#0B1F33]">
                {editingFaq ? 'Edit FAQ Item' : 'Add New FAQ Item'}
              </h3>
              <button
                onClick={() => setIsNewFaqModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Category</label>
                <select
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value as any)}
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#087F5B]"
                >
                  <option value="General">General</option>
                  <option value="Opportunities">Opportunities</option>
                  <option value="Services">Services</option>
                  <option value="Community">Community</option>
                  <option value="Partners">Partners</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. How does NaijaBridge verify that opportunities are scam-free?"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Answer *</label>
                <textarea
                  rows={4}
                  required
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Clear, authoritative explanation addressing the user's question directly."
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl p-3 text-xs focus:outline-none focus:border-[#087F5B] leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsNewFaqModalOpen(false)}
                  className="px-4 py-2.5 border border-stone-200 rounded-xl text-stone-700 font-semibold cursor-pointer hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFaq}
                  className="px-6 py-2.5 bg-[#087F5B] hover:bg-[#066548] text-white rounded-xl font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSavingFaq ? 'Saving to Firebase...' : editingFaq ? 'Save Updates' : 'Add FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
