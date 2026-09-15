import React, { useState } from 'react';
import { SKILL_PATHWAYS, UPCOMING_WORKSHOPS } from '../data/mockData';
import { SkillPathway, WorkshopEvent } from '../types';
import { useAdmin } from '../context/AdminContext';
import {
  BookOpen,
  Code,
  Palette,
  Megaphone,
  Briefcase,
  Database,
  Bot,
  Shield,
  Store,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
  Calendar,
  Users,
  Download,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface SkillsPageProps {
  onRegisterWorkshop: (workshop: WorkshopEvent) => void;
}

export const SkillsPage: React.FC<SkillsPageProps> = ({
  onRegisterWorkshop,
}) => {
  const { products } = useAdmin();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activePathway, setActivePathway] = useState<SkillPathway | null>(null);

  const activeProducts = (products || []).filter((p) => p.status !== 'archived');

  // Icon mapping
  const getPathwayIcon = (id: string) => {
    switch (id) {
      case 'web-app-dev':
        return <Code className="w-6 h-6 text-[#087F5B]" />;
      case 'ui-ux-design':
        return <Palette className="w-6 h-6 text-[#0F766E]" />;
      case 'digital-marketing':
        return <Megaphone className="w-6 h-6 text-[#D99A28]" />;
      case 'freelance-remote':
        return <Briefcase className="w-6 h-6 text-purple-600" />;
      case 'data-analysis':
        return <Database className="w-6 h-6 text-blue-600" />;
      case 'ai-literacy':
        return <Bot className="w-6 h-6 text-emerald-600" />;
      case 'cybersecurity-cloud':
        return <Shield className="w-6 h-6 text-indigo-600" />;
      case 'business-digitization':
        return <Store className="w-6 h-6 text-amber-700" />;
      default:
        return <BookOpen className="w-6 h-6 text-[#087F5B]" />;
    }
  };

  const filteredPathways =
    selectedCategory === 'All'
      ? SKILL_PATHWAYS
      : SKILL_PATHWAYS.filter(
          (p) =>
            p.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
            p.description.toLowerCase().includes(selectedCategory.toLowerCase())
        );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header Banner */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" />
          <span>Practical Digital Pathways</span>
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-display text-[#0B1F33] tracking-tight">
          High-Income Digital Skills for Today's Economy
        </h1>
        <p className="text-sm sm:text-base text-stone-600 leading-relaxed">
          Structured, free and subsidized learning roadmaps tailored for Nigerian internet bandwidth, power constraints, and real job opportunities worldwide.
        </p>
      </div>

      {/* Pathway Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SKILL_PATHWAYS.map((pathway) => (
          <div
            key={pathway.id}
            className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E4E1D8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between hover:border-[#087F5B]/50"
          >
            <div>
              {/* Icon & Level */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8] flex items-center justify-center">
                  {getPathwayIcon(pathway.id)}
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-stone-100 text-stone-700">
                  {pathway.progression}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-bold font-display text-[#0B1F33] mb-2">
                {pathway.title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {pathway.description}
              </p>

              {/* Target Audience & Mode */}
              <div className="space-y-2 bg-[#F8F7F2] p-3.5 rounded-2xl border border-[#E4E1D8]/80 text-xs mb-4">
                <div className="flex items-start gap-2 text-stone-700">
                  <span className="font-semibold text-stone-900 shrink-0">Audience:</span>
                  <span className="text-stone-600">{pathway.targetAudience}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700 pt-1 border-t border-stone-200/60">
                  <Clock className="w-3.5 h-3.5 text-[#D99A28] shrink-0" />
                  <span className="text-stone-600">
                    <strong className="font-semibold text-stone-900">Format:</strong>{' '}
                    {pathway.learningMode}
                  </span>
                </div>
              </div>

              {/* Tools & Tech Chips */}
              <div className="mb-6">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                  Tools & Competencies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {pathway.toolsTaught.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-stone-100 flex items-center gap-2">
              <button
                onClick={() => setActivePathway(pathway)}
                className="flex-1 py-2.5 px-3 rounded-xl bg-[#0B1F33] hover:bg-[#087F5B] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>View Full Roadmap</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Masterclasses & Cohort Sessions */}
      <section className="bg-white rounded-3xl p-8 sm:p-10 border border-[#E4E1D8] shadow-xs space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] mb-1 block">
              Free Community Learning
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33] tracking-tight">
              Upcoming Live Masterclasses
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Join free live workshops on Google Meet & Zoom with real-time Q&A and practical breakdowns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {UPCOMING_WORKSHOPS.map((workshop) => (
            <div
              key={workshop.id}
              className="bg-[#F8F7F2] rounded-2xl p-5 border border-[#E4E1D8] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#087F5B]/10 text-[#087F5B] font-bold">
                    {workshop.fee}
                  </span>
                  <span className="text-stone-500 font-medium">{workshop.platform}</span>
                </div>

                <h4 className="text-base font-bold font-display text-[#0B1F33]">
                  {workshop.title}
                </h4>

                <p className="text-xs text-stone-600 line-clamp-2">
                  {workshop.description}
                </p>

                <div className="pt-2 border-t border-stone-200/60 space-y-1 text-xs text-stone-600">
                  <div className="flex items-center gap-1.5 font-medium text-stone-900">
                    <Calendar className="w-3.5 h-3.5 text-[#0F766E]" />
                    <span>{workshop.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-stone-500">
                    <Clock className="w-3.5 h-3.5 text-[#D99A28]" />
                    <span>{workshop.timeWAT}</span>
                  </div>
                  <div className="text-[11px] text-stone-500 pt-0.5">
                    Instructor: <strong>{workshop.speaker}</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRegisterWorkshop(workshop)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Reserve Free Seat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Curated Digital Toolkits & Downloadable Guides (Real-time Synced from Firebase) */}
      {activeProducts.length > 0 && (
        <section className="space-y-6 pt-4 border-t border-[#E4E1D8]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] flex items-center gap-1.5">
                <FileText className="w-4 h-4" />
                <span>Verified Learning Assets & Resources</span>
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33] mt-1">
                Digital Toolkits & Career Guides
              </h2>
            </div>
            <p className="text-xs text-stone-500 max-w-sm">
              Practical cheat-sheets, CV templates, tech roadmaps, and grant directories curated by our team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-[#E4E1D8] p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-[#087F5B] border border-emerald-200/60">
                      {prod.category}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500">
                      {prod.format || prod.fileType || 'Guide'}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#0B1F33] leading-snug">
                    {prod.title}
                  </h3>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                    {prod.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    {prod.isFree ? (
                      <span className="text-xs font-bold text-[#087F5B] bg-emerald-50 px-2 py-0.5 rounded-full">
                        100% Free
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-[#0B1F33]">
                        ₦{(prod.priceNaira || 0).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {(prod.downloadUrl || prod.fileUrl || prod.externalUrl) && (
                    <a
                      href={prod.downloadUrl || prod.fileUrl || prod.externalUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#0B1F33] hover:bg-[#087F5B] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{prod.isFree ? 'Download Free' : 'Access Resource'}</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Study Groups & Community Learning Callout */}
      <div className="bg-[#0B1F33] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-md">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5 text-[#D99A28]" />
            <span>Collaborative Learning</span>
          </div>
          <h3 className="text-2xl font-bold font-display text-white">
            Need accountability while learning a new skill?
          </h3>
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Join our peer-led cohort study circles on WhatsApp and Discord. Learn alongside fellow Nigerian students, graduates, and career-switchers working through identical curriculum tracks.
          </p>
        </div>

        <a
          href="https://whatsapp.com"
          target="_blank"
          rel="noreferrer"
          className="px-6 py-3.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-xs sm:text-sm transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Join Free Study Group</span>
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>

      {/* Full Roadmap Modal */}
      {activePathway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#E4E1D8] p-6 sm:p-8 relative max-h-[85vh] overflow-y-auto space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#087F5B] block mb-1">
                  Comprehensive Learning Pathway
                </span>
                <h2 className="text-2xl font-bold font-display text-[#0B1F33]">
                  {activePathway.title}
                </h2>
                <p className="text-xs text-stone-500 mt-1">
                  Progression: {activePathway.progression} • {activePathway.learningMode}
                </p>
              </div>
              <button
                onClick={() => setActivePathway(null)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-500 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
              <div>
                <h4 className="font-bold text-[#0B1F33] mb-1">Overview:</h4>
                <p>{activePathway.description}</p>
              </div>

              <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#E4E1D8]">
                <h4 className="font-bold text-[#0B1F33] mb-1">Who this is for:</h4>
                <p>{activePathway.targetAudience}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#0B1F33] mb-2">Key Tools & Technologies Covered:</h4>
                <div className="flex flex-wrap gap-2">
                  {activePathway.toolsTaught.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-stone-100 text-stone-800 font-semibold text-xs border border-stone-200"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Next Cohort Study Group:</p>
                <p>
                  Free asynchronous study circles meet weekly on WhatsApp and Discord to review project exercises and share data/bundle tips.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row gap-2 justify-end">
              <button
                onClick={() => setActivePathway(null)}
                className="px-5 py-2.5 rounded-xl bg-[#087F5B] text-white text-xs font-semibold hover:bg-[#066548] transition-colors cursor-pointer"
              >
                Close Pathway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
