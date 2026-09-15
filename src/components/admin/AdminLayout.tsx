import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AdminOverview } from './AdminOverview';
import { AdminOpportunities } from './AdminOpportunities';
import { AdminUsers } from './AdminUsers';
import { AdminAcademy } from './AdminAcademy';
import { AdminWorkshops } from './AdminWorkshops';
import { AdminInbox } from './AdminInbox';
import { AdminCMS } from './AdminCMS';
import { AdminSubscribers } from './AdminSubscribers';
import { AdminAuditLogs } from './AdminAuditLogs';
import { AdminLockScreen } from './AdminLockScreen';
import {
  LayoutDashboard,
  Compass,
  Users,
  Calendar,
  Inbox,
  LayoutTemplate,
  Radio,
  ShieldCheck,
  LogOut,
  Lock,
  ExternalLink,
  Menu,
  X,
  Bell,
  Sparkles,
  ChevronRight,
  Clock,
  CheckCircle2,
  GraduationCap,
  RefreshCw,
} from 'lucide-react';

interface AdminLayoutProps {
  onReturnToPublicSite: () => void;
}

export type AdminTab =
  | 'overview'
  | 'opportunities'
  | 'academy'
  | 'users'
  | 'workshops'
  | 'inbox'
  | 'cms'
  | 'subscribers'
  | 'audit';

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onReturnToPublicSite }) => {
  const {
    currentAdmin,
    isSessionLocked,
    sessionRemainingSeconds,
    logout,
    lockSession,
    opportunities,
    inboxItems,
    siteSettings,
    syncStatus,
    lastSyncedAt,
    refreshData,
    versionedLogoUrl,
  } = useAdmin();

  const getInitialAdminTab = (): AdminTab => {
    if (typeof window === 'undefined') return 'overview';
    const path = window.location.pathname;
    if (path === '/admin/users') return 'users';
    if (path === '/admin/academy') return 'academy';
    if (path === '/admin/opportunities') return 'opportunities';
    if (path === '/admin/workshops') return 'workshops';
    if (path === '/admin/inbox') return 'inbox';
    if (path === '/admin/cms') return 'cms';
    if (path === '/admin/subscribers') return 'subscribers';
    if (path === '/admin/audit') return 'audit';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<AdminTab>(getInitialAdminTab);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
    try {
      const targetPath = tab === 'overview' ? '/admin' : `/admin/${tab}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    const handlePop = () => {
      setActiveTab(getInitialAdminTab());
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Cross-component quick modal triggers
  const [isCreateOppModalOpen, setIsCreateOppModalOpen] = useState(false);
  const [isCreateWorkshopModalOpen, setIsCreateWorkshopModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);

  const pendingOpportunitiesCount = opportunities.filter(
    (o) => o.status === 'Pending' || o.status === 'In Review'
  ).length;

  const newInboxCount = inboxItems.filter(
    (i) => i.status === 'New' || i.status === 'In Review'
  ).length;

  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Dashboard Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'opportunities',
      label: 'Opportunities Directory',
      icon: <Compass className="w-4 h-4" />,
      badge: pendingOpportunitiesCount > 0 ? pendingOpportunitiesCount : undefined,
      badgeColor: 'bg-[#D99A28] text-white',
    },
    {
      id: 'academy',
      label: 'Tech Academy & Courses',
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: 'users',
      label: 'Talent & User Accounts',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'workshops',
      label: 'Workshops & Events',
      icon: <Calendar className="w-4 h-4" />,
    },
    {
      id: 'inbox',
      label: 'Inquiries & Support Desk',
      icon: <Inbox className="w-4 h-4" />,
      badge: newInboxCount > 0 ? newInboxCount : undefined,
      badgeColor: 'bg-[#087F5B] text-white',
    },
    {
      id: 'cms',
      label: 'Content CMS & Copy',
      icon: <LayoutTemplate className="w-4 h-4" />,
    },
    {
      id: 'subscribers',
      label: 'Subscribers & Broadcasts',
      icon: <Radio className="w-4 h-4" />,
    },
    {
      id: 'audit',
      label: 'Audit Trail & Security',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  const minutesRemaining = Math.floor(sessionRemainingSeconds / 60);
  const secondsRemaining = sessionRemainingSeconds % 60;

  return (
    <div className="min-h-screen bg-[#F8F7F2] flex flex-col md:flex-row text-[#1F2933]">
      {/* Session Lock Modal if auto-locked */}
      {isSessionLocked && <AdminLockScreen />}

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex md:w-64 lg:w-72 bg-[#0B1F33] text-white flex-col justify-between shrink-0 border-r border-[#152e4a]">
        <div className="p-6 space-y-6">
          {/* Logo & Platform Tag */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {siteSettings?.logoDarkUrl || versionedLogoUrl || siteSettings?.logoUrl ? (
                <img
                  src={siteSettings?.logoDarkUrl || versionedLogoUrl || siteSettings?.logoUrl}
                  alt={siteSettings?.logoAlt || 'NaijaBridge'}
                  referrerPolicy="no-referrer"
                  className="h-9 w-auto max-h-10 object-contain"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#087F5B] flex items-center justify-center font-black text-white text-lg tracking-wider font-display shadow-md">
                  NB
                </div>
              )}
              <div>
                <span className="font-display font-bold text-base tracking-tight text-white block leading-tight">
                  {siteSettings?.siteName || 'NaijaBridge'}
                </span>
                <span className="text-[10px] uppercase font-bold text-[#087F5B] tracking-wider">
                  Admin Command Console
                </span>
              </div>
            </div>
          </div>

          {/* Quick Staff Identity */}
          {currentAdmin && (
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
              <img
                src={currentAdmin.avatar}
                alt={currentAdmin.name}
                className="w-9 h-9 rounded-xl object-cover ring-2 ring-[#087F5B]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentAdmin.name}</p>
                <p className="text-[10px] text-[#087F5B] font-semibold truncate">
                  {currentAdmin.role}
                </p>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#087F5B] text-white shadow-sm font-bold'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.badgeColor || 'bg-white/20 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Panel */}
        <div className="p-4 m-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between text-[11px] text-white/60">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#D99A28]" />
              <span>Session Expiry:</span>
            </span>
            <span className="font-mono text-white font-bold">
              {minutesRemaining}:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
            </span>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-white/10">
            <button
              onClick={lockSession}
              className="flex-1 py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-[11px] font-medium text-white/80 hover:text-white flex items-center justify-center gap-1 cursor-pointer transition-colors"
              title="Lock screen immediately"
            >
              <Lock className="w-3 h-3" />
              <span>Lock</span>
            </button>
            <button
              onClick={logout}
              className="flex-1 py-1.5 px-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-[11px] font-medium text-red-200 hover:text-red-100 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              title="Sign out of admin"
            >
              <LogOut className="w-3 h-3" />
              <span>Sign Out</span>
            </button>
          </div>

          <button
            onClick={onReturnToPublicSite}
            className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Go to Public Site</span>
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="md:hidden bg-[#0B1F33] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#087F5B] flex items-center justify-center font-bold text-white text-sm">
            NB
          </div>
          <div>
            <span className="font-bold text-sm block leading-none">NaijaBridge Admin</span>
            <span className="text-[10px] text-[#087F5B] font-semibold uppercase tracking-wider">
              {currentAdmin?.role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={lockSession}
            className="p-1.5 rounded-lg bg-white/10 text-white/80 hover:text-white cursor-pointer"
            title="Lock"
          >
            <Lock className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0B1F33] text-white p-4 space-y-3 border-b border-[#152e4a] sticky top-14 z-40">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                    isActive ? 'bg-[#087F5B] text-white' : 'text-white/70 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-white/20">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <button
              onClick={onReturnToPublicSite}
              className="text-xs text-white/70 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Exit to Public Site</span>
            </button>
            <button
              onClick={logout}
              className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="hidden md:flex items-center justify-between bg-white border-b border-[#E4E1D8] px-8 py-3.5 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-[#1F2933]/60">
            <span className="font-medium">NaijaBridge Admin Console</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#1F2933]/40" />
            <span className="font-bold text-[#0B1F33] capitalize">
              {activeTab === 'cms'
                ? 'Content CMS'
                : activeTab === 'audit'
                ? 'Security & Audit Logs'
                : activeTab}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Firebase Cloud Sync Status */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#F8F7F2] border border-[#E4E1D8] text-[11px]">
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus === 'syncing'
                    ? 'bg-amber-500 animate-spin'
                    : syncStatus === 'error'
                    ? 'bg-red-500'
                    : 'bg-[#087F5B] animate-pulse'
                }`}
              />
              <span className="font-semibold text-[#0B1F33]">
                {syncStatus === 'syncing'
                  ? 'Syncing Cloud...'
                  : syncStatus === 'error'
                  ? 'Offline Cache'
                  : 'Firebase Live'}
              </span>
              <button
                onClick={() => refreshData()}
                disabled={syncStatus === 'syncing'}
                className="p-1 rounded-md hover:bg-[#EAE7DC] text-[#1F2933]/60 hover:text-[#0B1F33] cursor-pointer transition-colors"
                title="Force refresh all records from Firebase Firestore"
              >
                <RefreshCw
                  className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin text-[#087F5B]' : ''}`}
                />
              </button>
            </div>

            {/* Direct Link to Public Site */}
            <button
              onClick={onReturnToPublicSite}
              className="px-3.5 py-1.5 rounded-xl bg-[#F8F7F2] hover:bg-[#EAE7DC] text-xs font-semibold text-[#0B1F33] flex items-center gap-1.5 border border-[#E4E1D8] transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#087F5B]" />
              <span>View Live Website</span>
            </button>

            {/* Quick Actions Shortcuts */}
            <div className="flex items-center gap-1.5 border-l border-[#E4E1D8] pl-4">
              <button
                onClick={() => {
                  setActiveTab('opportunities');
                  setIsCreateOppModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#087F5B]/10 hover:bg-[#087F5B] text-[#087F5B] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                + Opportunity
              </button>

              <button
                onClick={() => {
                  setActiveTab('workshops');
                  setIsCreateWorkshopModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-[#0B1F33]/5 hover:bg-[#0B1F33] text-[#0B1F33] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                + Workshop
              </button>
            </div>
          </div>
        </header>

        {/* Tab Body View */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && (
            <AdminOverview
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenCreateOpp={() => {
                setActiveTab('opportunities');
                setIsCreateOppModalOpen(true);
              }}
              onOpenCreateWorkshop={() => {
                setActiveTab('workshops');
                setIsCreateWorkshopModalOpen(true);
              }}
              onOpenBroadcast={() => {
                setActiveTab('subscribers');
                setIsBroadcastModalOpen(true);
              }}
            />
          )}

          {activeTab === 'opportunities' && (
            <AdminOpportunities
              isCreateModalOpen={isCreateOppModalOpen}
              onCloseCreateModal={() => setIsCreateOppModalOpen(false)}
              onOpenCreateModal={() => setIsCreateOppModalOpen(true)}
            />
          )}

          {activeTab === 'academy' && <AdminAcademy />}

          {activeTab === 'users' && <AdminUsers />}

          {activeTab === 'workshops' && (
            <AdminWorkshops
              isCreateModalOpen={isCreateWorkshopModalOpen}
              onCloseCreateModal={() => setIsCreateWorkshopModalOpen(false)}
              onOpenCreateModal={() => setIsCreateWorkshopModalOpen(true)}
            />
          )}

          {activeTab === 'inbox' && <AdminInbox />}

          {activeTab === 'cms' && <AdminCMS />}

          {activeTab === 'subscribers' && (
            <AdminSubscribers
              isBroadcastModalOpen={isBroadcastModalOpen}
              onCloseBroadcastModal={() => setIsBroadcastModalOpen(false)}
              onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
            />
          )}

          {activeTab === 'audit' && <AdminAuditLogs />}
        </main>
      </div>
    </div>
  );
};
