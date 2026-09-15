import React, { useState, useEffect } from 'react';
import { PageId, Opportunity, ServiceItem, WorkshopEvent } from './types';
import { SUPPORT_SERVICES } from './data/mockData';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Public Pages
import { HomePage } from './pages/HomePage';
import { OpportunitiesPage } from './pages/OpportunitiesPage';
import { SkillsPage } from './pages/SkillsPage';
import { SupportPage } from './pages/SupportPage';
import { CommunityPage } from './pages/CommunityPage';
import { PartnersPage } from './pages/PartnersPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { PublicAcademy } from './components/public/PublicAcademy';
import { NiaChatbot } from './components/chat/NiaChatbot';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';

// Modals & Interactive Overlays
import { OpportunityDetailModal } from './components/OpportunityDetailModal';
import { ServiceRequestModal } from './components/ServiceRequestModal';
import { WorkshopRegisterModal } from './components/WorkshopRegisterModal';
import { PartnerInquiryModal } from './components/PartnerInquiryModal';
import { VolunteerModal } from './components/VolunteerModal';
import { SavedOpportunitiesDrawer } from './components/SavedOpportunitiesDrawer';

import { Bookmark, Lock, ArrowUpRight, ShieldCheck } from 'lucide-react';

const getInitialPage = (): PageId => {
  if (typeof window === 'undefined') return 'home';
  const path = window.location.pathname;
  if (path === '/admin/login' || path === '/admin' || path.startsWith('/admin/')) return 'admin';
  if (path === '/academy') return 'academy';
  if (path === '/opportunities') return 'opportunities';
  if (path === '/skills') return 'skills';
  if (path === '/services') return 'services';
  if (path === '/community') return 'community';
  if (path === '/partners') return 'partners';
  if (path === '/about') return 'about';
  if (path === '/contact') return 'contact';
  return 'home';
};

const InnerApp: React.FC = () => {
  const {
    opportunities,
    workshops,
    isAuthenticated,
    currentAdmin,
    lockSession,
    logout,
  } = useAdmin();

  const [currentPage, setCurrentPage] = useState<PageId>(getInitialPage);
  const [savedOpportunityIds, setSavedOpportunityIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('naijabridge_saved_opps');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Listen for browser popstate
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPage(getInitialPage());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Modal States
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const [selectedWorkshop, setSelectedWorkshop] = useState<WorkshopEvent | null>(null);
  const [isWorkshopModalOpen, setIsWorkshopModalOpen] = useState(false);

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [isVolunteerModalOpen, setIsVolunteerModalOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);

  // Sync saved items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('naijabridge_saved_opps', JSON.stringify(savedOpportunityIds));
    } catch (e) {
      console.error('Failed to persist bookmarks', e);
    }
  }, [savedOpportunityIds]);

  // Window scroll and URL push on page navigation
  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    try {
      const targetPath =
        page === 'home'
          ? '/'
          : page === 'admin'
          ? isAuthenticated
            ? '/admin'
            : '/admin/login'
          : `/${page}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    } catch {
      // Ignore if history state not supported
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync URL when in Admin mode
  useEffect(() => {
    if (currentPage === 'admin') {
      const currentPath = window.location.pathname;
      const targetPath = isAuthenticated
        ? currentPath.startsWith('/admin/') && currentPath !== '/admin/login'
          ? currentPath
          : '/admin'
        : '/admin/login';
      if (window.location.pathname !== targetPath) {
        try {
          window.history.replaceState(null, '', targetPath);
        } catch {
          // Ignore
        }
      }
    }
  }, [currentPage, isAuthenticated]);

  const handleToggleSave = (id: string) => {
    setSavedOpportunityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleViewOpportunity = (opp: Opportunity) => {
    setSelectedOpportunity(opp);
    setIsDetailModalOpen(true);
  };

  const handleRequestService = (service: ServiceItem) => {
    setSelectedService(service);
    setIsServiceModalOpen(true);
  };

  const handleRegisterWorkshop = (workshop: WorkshopEvent) => {
    setSelectedWorkshop(workshop);
    setIsWorkshopModalOpen(true);
  };

  const handleRequestServiceShortcut = (serviceKey: string) => {
    const matchedService =
      SUPPORT_SERVICES.find((s) => s.id.includes(serviceKey)) || SUPPORT_SERVICES[0];
    handleRequestService(matchedService);
  };

  // Only published opportunities should be visible on public pages
  const publicOpportunities = opportunities.filter(
    (opp) => !opp.status || opp.status === 'Published'
  );

  // Get bookmarked opportunity objects
  const savedOpportunitiesList = opportunities.filter((opp) =>
    savedOpportunityIds.includes(opp.id)
  );

  // If on Admin page, render dedicated Admin view
  if (currentPage === 'admin') {
    if (!isAuthenticated) {
      return (
        <AdminLogin
          onLoginSuccess={() => {
            try {
              window.history.pushState(null, '', '/admin');
            } catch {
              // Ignore
            }
          }}
          onCancel={() => handleNavigate('home')}
        />
      );
    }
    return <AdminLayout onReturnToPublicSite={() => handleNavigate('home')} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F2] text-[#0B1F33] selection:bg-[#087F5B]/20 selection:text-[#087F5B]">
      {/* If an Admin is logged in, display top Staff status strip */}
      {isAuthenticated && currentAdmin && (
        <div className="bg-[#12283E] text-white text-xs px-4 py-1.5 border-b border-white/10 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#087F5B] animate-pulse" />
            <span>
              Staff Session Active: <strong>{currentAdmin.name}</strong> ({currentAdmin.role})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate('admin')}
              className="px-2.5 py-0.5 rounded-lg bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Lock className="w-3 h-3" />
              <span>Admin Console</span>
            </button>
            <button
              onClick={lockSession}
              className="text-white/70 hover:text-white text-[11px] cursor-pointer"
            >
              Lock
            </button>
            <span className="text-white/30">•</span>
            <button
              onClick={logout}
              className="text-red-300 hover:text-red-200 text-[11px] cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Global Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        savedCount={savedOpportunityIds.length}
        onOpenSaved={() => setIsSavedDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            featuredOpportunities={publicOpportunities}
            onViewOpportunity={handleViewOpportunity}
            savedIds={savedOpportunityIds}
            onToggleSave={handleToggleSave}
            onRequestServiceShortcut={handleRequestServiceShortcut}
          />
        )}

        {currentPage === 'opportunities' && (
          <OpportunitiesPage
            opportunities={publicOpportunities}
            onViewOpportunity={handleViewOpportunity}
            savedIds={savedOpportunityIds}
            onToggleSave={handleToggleSave}
          />
        )}

        {currentPage === 'academy' && (
          <PublicAcademy onNavigateToContact={() => handleNavigate('contact')} />
        )}

        {currentPage === 'skills' && (
          <SkillsPage
            onRegisterWorkshop={handleRegisterWorkshop}
          />
        )}

        {currentPage === 'services' && (
          <SupportPage
            onRequestService={handleRequestService}
          />
        )}

        {currentPage === 'community' && (
          <CommunityPage
            onRegisterWorkshop={handleRegisterWorkshop}
            onOpenVolunteerModal={() => setIsVolunteerModalOpen(true)}
          />
        )}

        {currentPage === 'partners' && (
          <PartnersPage onOpenPartnerModal={() => setIsPartnerModalOpen(true)} />
        )}

        {currentPage === 'about' && <AboutPage />}

        {currentPage === 'contact' && <ContactPage />}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Saved Count Floating Button */}
      {savedOpportunityIds.length > 0 && (
        <div className="fixed bottom-20 right-5 z-40">
          <button
            onClick={() => setIsSavedDrawerOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white text-[#0B1F33] border border-[#E4E1D8] shadow-md hover:bg-stone-50 transition-all text-xs font-semibold cursor-pointer"
            title="View saved opportunities"
          >
            <Bookmark className="w-4 h-4 text-[#087F5B] fill-current" />
            <span>Saved ({savedOpportunityIds.length})</span>
          </button>
        </div>
      )}

      {/* Nia Opportunity Assistant Chatbot */}
      <NiaChatbot onNavigate={handleNavigate} />

      {/* Interactive Modals */}
      <OpportunityDetailModal
        opportunity={selectedOpportunity}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        isSaved={selectedOpportunity ? savedOpportunityIds.includes(selectedOpportunity.id) : false}
        onToggleSave={handleToggleSave}
      />

      <ServiceRequestModal
        service={selectedService}
        isOpen={isServiceModalOpen}
        onClose={() => setIsServiceModalOpen(false)}
      />

      <WorkshopRegisterModal
        workshop={selectedWorkshop}
        isOpen={isWorkshopModalOpen}
        onClose={() => setIsWorkshopModalOpen(false)}
      />

      <PartnerInquiryModal
        isOpen={isPartnerModalOpen}
        onClose={() => setIsPartnerModalOpen(false)}
      />

      <VolunteerModal
        isOpen={isVolunteerModalOpen}
        onClose={() => setIsVolunteerModalOpen(false)}
      />

      <SavedOpportunitiesDrawer
        isOpen={isSavedDrawerOpen}
        onClose={() => setIsSavedDrawerOpen(false)}
        savedOpportunities={savedOpportunitiesList}
        onRemoveSaved={handleToggleSave}
        onViewDetails={handleViewOpportunity}
        onExploreMore={() => handleNavigate('opportunities')}
      />
    </div>
  );
};

export default function App() {
  return (
    <AdminProvider>
      <InnerApp />
    </AdminProvider>
  );
}
