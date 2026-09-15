import React, { useState } from 'react';
import { PageId } from '../types';
import { useAdmin } from '../context/AdminContext';
import {
  Menu,
  X,
  Bookmark,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Compass,
  GraduationCap,
  Briefcase,
  Users,
  Handshake,
  Info,
  PhoneCall,
  Lock,
  Megaphone,
} from 'lucide-react';

interface HeaderProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  savedCount: number;
  onOpenSaved: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  savedCount,
  onOpenSaved,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { siteAnnouncement, currentAdmin, isAuthenticated, siteSettings, versionedLogoUrl } = useAdmin();

  const navLinks: { id: PageId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Compass className="w-4 h-4" /> },
    { id: 'opportunities', label: 'Opportunities', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'academy', label: 'Tech Academy', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills & Learning', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'services', label: 'Support Services', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'community', label: 'Community', icon: <Users className="w-4 h-4" /> },
    { id: 'partners', label: 'Partners', icon: <Handshake className="w-4 h-4" /> },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
    { id: 'contact', label: 'Contact', icon: <PhoneCall className="w-4 h-4" /> },
  ];

  const handleNavClick = (page: PageId) => {
    onNavigate(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F7F2]/95 backdrop-blur-md border-b border-[#E4E1D8] transition-colors">
      {/* Dynamic Announcement Banner (Controlled from Admin CMS) */}
      {siteAnnouncement && siteAnnouncement.active && (
        <div className="bg-[#087F5B] text-white text-xs px-4 py-2 font-medium border-b border-white/10 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-hidden">
              <Megaphone className="w-3.5 h-3.5 text-[#D99A28] shrink-0 animate-bounce" />
              <span className="truncate">{siteAnnouncement.message}</span>
            </div>
            {siteAnnouncement.linkText && (
              <button
                onClick={() => handleNavClick('opportunities')}
                className="shrink-0 font-bold underline hover:text-white/80 text-[11px] cursor-pointer whitespace-nowrap"
              >
                {siteAnnouncement.linkText} →
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top micro-bar with trust, location banner, and Staff Portal link */}
      <div className="bg-[#0B1F33] text-white/90 text-xs px-4 py-1.5 font-medium">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-[#087F5B] animate-pulse" />
            <span>Built for Nigeria. Open to opportunity.</span>
            <span className="text-white/40 hidden sm:inline">|</span>
            <span className="text-white/70 hidden sm:inline">Remote-First • All 36 States + FCT</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {isAuthenticated && currentAdmin ? (
              <button
                onClick={() => handleNavClick('admin')}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#087F5B]/30 hover:bg-[#087F5B] text-white text-[11px] font-semibold transition-colors cursor-pointer border border-[#087F5B]/50"
                title="Go to Admin Console"
              >
                <Lock className="w-3 h-3 text-[#D99A28]" />
                <span>Admin Console ({currentAdmin.name.split(' ')[0]})</span>
              </button>
            ) : (
              <button
                onClick={() => handleNavClick('admin')}
                className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Staff & Administrator Login"
              >
                <Lock className="w-3 h-3 text-[#087F5B]" />
                <span className="text-[11px]">Staff Portal</span>
              </button>
            )}

            <span className="text-white/30 hidden sm:inline">•</span>

            <a
              href="https://whatsapp.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <span>WhatsApp Alerts</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 text-left group focus:outline-none cursor-pointer"
          >
            {versionedLogoUrl || siteSettings?.logoUrl ? (
              <img
                src={versionedLogoUrl || siteSettings?.logoUrl}
                alt={siteSettings?.logoAlt || 'NaijaBridge'}
                referrerPolicy="no-referrer"
                className="h-10 max-h-12 w-auto object-contain transition-transform group-hover:scale-105"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-[#0B1F33] border border-[#0F766E]/40 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                {/* Stylized bridge arch icon */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <span className="absolute bottom-1 w-5 h-1.5 bg-[#087F5B] rounded-full" />
                  <span className="absolute top-1 w-3 h-3 rounded-full border-2 border-[#D99A28] border-b-transparent -rotate-45" />
                  <span className="text-white font-bold text-xs tracking-tighter">NB</span>
                </div>
              </div>
            )}
            <div>
              <span className="text-xl font-bold tracking-tight text-[#0B1F33] font-display flex items-center gap-1">
                Naija<span className="text-[#087F5B]">Bridge</span>
              </span>
              <span className="block text-[11px] font-medium text-[#1F2933]/70 -mt-1 tracking-wider uppercase">
                Digital Pathways & Impact
              </span>
            </div>
          </button>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1 lg:gap-1.5">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B1F33] text-white shadow-xs'
                      : 'text-[#1F2933] hover:text-[#087F5B] hover:bg-[#EAE7DC]/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Secondary Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Bookmarks / Saved opportunities button */}
            <button
              onClick={onOpenSaved}
              className="relative p-2.5 rounded-xl border border-[#E4E1D8] text-[#1F2933] hover:border-[#087F5B] hover:text-[#087F5B] transition-colors cursor-pointer bg-white/80"
              title="Saved Opportunities"
              aria-label="View saved opportunities"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#087F5B] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Quick Explore CTA */}
            <button
              onClick={() => handleNavClick('opportunities')}
              className="px-4 py-2.5 rounded-xl bg-[#087F5B] text-white text-sm font-semibold hover:bg-[#066548] transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore Opportunities</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile menu trigger */}
          <div className="flex items-center gap-2 xl:hidden">
            <button
              onClick={onOpenSaved}
              className="relative p-2 rounded-lg border border-[#E4E1D8] text-[#1F2933]"
              aria-label="View saved opportunities"
            >
              <Bookmark className="w-4 h-4" />
              {savedCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#087F5B] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-[#0B1F33] hover:bg-[#EAE7DC] focus:outline-none cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#F8F7F2] border-b border-[#E4E1D8] px-4 pt-3 pb-6 shadow-xl animate-in fade-in duration-200">
          <div className="space-y-1 mb-4">
            {navLinks.map((link) => {
              const isActive = currentPage === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#0B1F33] text-white font-semibold'
                      : 'text-[#1F2933] hover:bg-[#EAE7DC]'
                  }`}
                >
                  <span className={isActive ? 'text-[#087F5B]' : 'text-[#0F766E]'}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#E4E1D8] flex flex-col gap-2.5">
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full py-2.5 px-4 rounded-xl border border-[#0B1F33]/20 bg-[#0B1F33]/5 text-[#0B1F33] font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[#087F5B]" />
              <span>{isAuthenticated ? 'Open Admin Console' : 'Staff & Admin Portal'}</span>
            </button>
            <button
              onClick={() => handleNavClick('community')}
              className="w-full py-2.5 px-4 rounded-xl bg-[#087F5B] text-white font-semibold text-sm flex items-center justify-center gap-1.5"
            >
              <span>Join the Community</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
