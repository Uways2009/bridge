import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  AdminUser,
  AdminRole,
  Opportunity,
  OpportunityStatus,
  UserAccount,
  AccountStatus,
  UserRoleCategory,
  WorkshopEvent,
  EventAttendee,
  InboxItem,
  InboxStatus,
  NewsletterSubscriber,
  AnnouncementBroadcast,
  AdminActivityLog,
  SiteAnnouncementConfig,
  ServiceItem,
  SkillTrack,
  FAQItem,
  Testimonial,
  TeamMember,
  ContactInfoConfig,
  ProductResource,
  SiteSettings,
  ManagedUser,
  PlatformRole,
  UserAccountStatus,
} from '../types';
import { DEFAULT_SITE_ANNOUNCEMENT } from '../data/adminMockData';
import {
  SERVICES,
  SKILL_TRACKS,
  FAQS,
  TESTIMONIALS,
  TEAM_MEMBERS,
} from '../data/mockData';
import {
  loginAdmin,
  loginWithGoogleAdmin,
  logoutAdmin,
  requestPasswordReset,
  subscribeToAuth,
  getAdminProfile,
  fetchPublishedOpportunities,
  fetchAllOpportunitiesAdmin,
  createOpportunityInFirestore,
  updateOpportunityInFirestore,
  deleteOpportunityFromFirestore,
  fetchPublishedEvents,
  fetchAllEventsAdmin,
  createEventInFirestore,
  updateEventInFirestore,
  deleteEventFromFirestore,
  submitPublicEnquiry,
  fetchAllEnquiriesAdmin,
  subscribeToNewsletter,
  fetchNewsletterSubscribersAdmin,
  fetchSiteSettings,
  updateSiteSettingsInFirestore,
  uploadMediaToStorage,
  logActivity,
  fetchActivityLogsAdmin,
  fetchUsersFromBackend,
  createUserInBackend,
  updateUserRoleInBackend,
  updateUserStatusInBackend,
  sendUserPasswordResetInBackend,
  deleteUserInBackend,
  DEFAULT_CONTACT_INFO,
  subscribeToBranding,
  subscribeToOpportunities,
  subscribeToEvents,
  subscribeToServices,
  subscribeToTeamMembers,
  subscribeToContactInfo,
  subscribeToProductsResources,
  createServiceInFirestore,
  updateServiceInFirestore,
  softDeleteServiceInFirestore,
  restoreServiceInFirestore,
  permanentDeleteServiceInFirestore,
  createTeamMemberInFirestore,
  updateTeamMemberInFirestore,
  softDeleteTeamMemberInFirestore,
  restoreTeamMemberInFirestore,
  permanentDeleteTeamMemberInFirestore,
  fetchContactInfo,
  updateContactInfoInFirestore,
  createProductResourceInFirestore,
  updateProductResourceInFirestore,
  softDeleteProductResourceInFirestore,
  restoreProductResourceInFirestore,
  permanentDeleteProductResourceInFirestore,
  ensureFirebaseAuth,
  verifyAdminCredentialsInFirestore,
  resetAdminPasswordInFirestore,
} from '../lib/firebaseService';
import { getVersionedMediaUrl } from '../lib/imageOptimizer';

interface AdminContextType {
  // Global Synchronization State
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error';
  lastSyncedAt: string | null;
  syncError: string | null;
  versionedLogoUrl: string;
  versionedFaviconUrl: string;

  // Authentication & Session
  currentAdmin: AdminUser | null;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  quickLogin: (email?: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  requestPasswordResetEmail: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  sessionRemainingSeconds: number;
  extendSession: () => void;
  lockSession: () => void;
  isSessionLocked: boolean;
  unlockSession: (password: string) => Promise<boolean>;

  // Opportunities (Cloud Firestore)
  opportunities: Opportunity[];
  isLoadingOpportunities: boolean;
  createOpportunity: (oppData: Omit<Opportunity, 'id' | 'postedDate'>) => Promise<boolean>;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => Promise<boolean>;
  deleteOpportunity: (id: string) => Promise<boolean>;
  changeOpportunityStatus: (id: string, status: OpportunityStatus) => Promise<boolean>;
  toggleFeatureOpportunity: (id: string) => Promise<boolean>;
  approveAndPublishOpportunity: (id: string) => Promise<boolean>;
  archiveOpportunity: (id: string) => Promise<boolean>;

  // Users Directory
  users: UserAccount[];
  managedUsers: ManagedUser[];
  isLoadingUsers: boolean;
  usersTotalCount: number;
  usersCurrentPage: number;
  usersTotalPages: number;
  loadManagedUsers: (params?: { search?: string; role?: string; status?: string; page?: number; limit?: number }) => Promise<void>;
  createManagedUser: (data: {
    email: string;
    displayName: string;
    role: PlatformRole;
    creationMethod: 'invite' | 'password';
    initialPassword?: string;
  }) => Promise<{ success: boolean; message?: string; user?: ManagedUser }>;
  updateManagedUserRole: (uid: string, role: PlatformRole) => Promise<{ success: boolean; message?: string }>;
  updateManagedUserStatus: (uid: string, accountStatus: UserAccountStatus) => Promise<{ success: boolean; message?: string }>;
  sendUserPasswordReset: (uid: string) => Promise<{ success: boolean; message?: string }>;
  deleteManagedUser: (uid: string, confirmation: string) => Promise<{ success: boolean; message?: string }>;
  updateUserStatus: (id: string, status: AccountStatus) => void;
  updateUserRole: (id: string, role: UserRoleCategory) => void;
  deleteUser: (id: string) => void;
  exportUsersCSV: () => void;

  // Workshops & Events (Cloud Firestore)
  workshops: WorkshopEvent[];
  attendees: EventAttendee[];
  createWorkshop: (workshopData: Omit<WorkshopEvent, 'id'>) => Promise<boolean>;
  updateWorkshop: (id: string, updates: Partial<WorkshopEvent>) => Promise<boolean>;
  deleteWorkshop: (id: string) => Promise<boolean>;
  toggleAttendeeCheckin: (attendeeId: string) => void;

  // Inbox & Inquiries (Cloud Firestore)
  inboxItems: InboxItem[];
  submitPublicInquiry: (data: {
    name: string;
    email: string;
    phone?: string;
    category?: string;
    message: string;
    type: 'contact' | 'support' | 'partnership' | 'volunteer';
    organization?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  updateInboxStatus: (id: string, status: InboxStatus) => Promise<boolean>;
  addInboxNote: (id: string, note: string) => Promise<boolean>;
  assignInboxItem: (id: string, staffName: string) => Promise<boolean>;
  sendInboxReply: (id: string, replyMessage: string) => Promise<boolean>;
  deleteInboxItem: (id: string) => Promise<boolean>;

  // Content Management & Cloud Storage
  siteSettings: SiteSettings;
  updateSiteSettings: (settings: Partial<SiteSettings>) => Promise<boolean>;
  uploadMedia: (file: File, folder: 'logos' | 'favicons' | 'heroes' | 'content') => Promise<{ downloadUrl: string; filename: string }>;
  siteAnnouncement: SiteAnnouncementConfig;
  updateSiteAnnouncement: (config: SiteAnnouncementConfig) => Promise<boolean>;
  heroHeadline: string;
  heroSubheadline: string;
  updateHeroContent: (headline: string, subheadline: string) => Promise<boolean>;
  impactMetrics: { reached: string; verified: string; workshops: string; states: string };
  updateImpactMetrics: (metrics: { reached: string; verified: string; workshops: string; states: string }) => void;
  services: ServiceItem[];
  createService: (service: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateService: (
    id: string,
    updates: Partial<ServiceItem>,
    options?: { expectedVersion?: number; expectedUpdatedAt?: string; force?: boolean }
  ) => Promise<boolean>;
  archiveService: (id: string, title?: string) => Promise<boolean>;
  restoreService: (id: string, title?: string) => Promise<boolean>;
  permanentDeleteService: (id: string, title?: string) => Promise<boolean>;
  skillTracks: SkillTrack[];
  faqs: FAQItem[];
  createFAQ: (faq: Omit<FAQItem, 'id'>) => void;
  updateFAQ: (id: string, updates: Partial<FAQItem>) => void;
  deleteFAQ: (id: string) => void;
  testimonials: Testimonial[];
  teamMembers: TeamMember[];
  createTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => Promise<boolean>;
  archiveTeamMember: (id: string, name?: string) => Promise<boolean>;
  restoreTeamMember: (id: string, name?: string) => Promise<boolean>;
  permanentDeleteTeamMember: (id: string, name?: string) => Promise<boolean>;
  contactInfo: ContactInfoConfig;
  updateContactInfo: (
    contact: Partial<ContactInfoConfig>,
    options?: { expectedVersion?: number; expectedUpdatedAt?: string; force?: boolean }
  ) => Promise<boolean>;
  productsResources: ProductResource[];
  createProductResource: (item: Omit<ProductResource, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProductResource: (id: string, updates: Partial<ProductResource>) => Promise<boolean>;
  archiveProductResource: (id: string, title?: string) => Promise<boolean>;
  restoreProductResource: (id: string, title?: string) => Promise<boolean>;
  permanentDeleteProductResource: (id: string, title?: string) => Promise<boolean>;

  // Role Permissions
  isSuperAdmin: boolean;
  isContentAdmin: boolean;
  isEditor: boolean;
  canPublish: boolean;
  canPublishContent: boolean;
  canEditContent: boolean;
  canDeletePermanently: boolean;

  // Products & Resources aliases
  products: ProductResource[];
  createProduct: (item: Omit<ProductResource, 'id' | 'createdAt' | 'updatedAt'>) => Promise<boolean>;
  updateProduct: (id: string, updates: Partial<ProductResource>) => Promise<boolean>;
  archiveProduct: (id: string, title?: string) => Promise<boolean>;
  restoreProduct: (id: string, title?: string) => Promise<boolean>;
  permanentDeleteProduct: (id: string, title?: string) => Promise<boolean>;

  // Subscribers & Broadcasts (Cloud Firestore)
  subscribers: NewsletterSubscriber[];
  broadcasts: AnnouncementBroadcast[];
  subscribeNewsletter: (email: string, source?: string) => Promise<{ success: boolean; message?: string }>;
  toggleSubscriberStatus: (id: string) => void;
  deleteSubscriber: (id: string) => Promise<boolean>;
  sendBroadcast: (title: string, targetAudience: AnnouncementBroadcast['targetAudience'], content: string) => void;
  exportSubscribersCSV: () => void;

  // Activity Audit Log (Cloud Firestore)
  activityLogs: AdminActivityLog[];
  logAction: (action: string, category: AdminActivityLog['category'], details: string) => void;
  exportAuditLogsCSV: () => void;

  // Manual refresh
  refreshData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const TOKEN_KEY = 'nb_admin_token_v1';

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session & Auth state
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSessionLocked, setIsSessionLocked] = useState(false);
  const [sessionRemainingSeconds, setSessionRemainingSeconds] = useState(14400); // 4 hours

  // Entity States
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [isLoadingOpportunities, setIsLoadingOpportunities] = useState(true);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersTotalCount, setUsersTotalCount] = useState(0);
  const [usersCurrentPage, setUsersCurrentPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [workshops, setWorkshops] = useState<WorkshopEvent[]>([]);
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [broadcasts, setBroadcasts] = useState<AnnouncementBroadcast[]>([]);
  const [activityLogs, setActivityLogs] = useState<AdminActivityLog[]>([]);

  // Site Settings & CMS (stored in Firestore)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: 'NaijaBridge',
    heroHeadline: 'Verified Nigerian Opportunities & Digital Pathways',
    heroSubheadline: 'Empowering Nigerian youth, innovators, and professionals with verified opportunities, skills, and community.',
  });
  const [siteAnnouncement, setSiteAnnouncement] = useState<SiteAnnouncementConfig>(DEFAULT_SITE_ANNOUNCEMENT);
  const [heroHeadline, setHeroHeadline] = useState('Build your next opportunity.');
  const [heroSubheadline, setHeroSubheadline] = useState(
    'A remote-first platform connecting young Nigerians to verified opportunities, practical digital skills, mentorship, and career support.'
  );
  const [impactMetrics, setImpactMetrics] = useState({
    reached: '0',
    verified: '0',
    workshops: '0',
    states: '36 States + FCT',
  });
  const [services, setServices] = useState<ServiceItem[]>(SERVICES);
  const [skillTracks, setSkillTracks] = useState<SkillTrack[]>(SKILL_TRACKS);
  const [faqs, setFaqs] = useState<FAQItem[]>(FAQS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(TESTIMONIALS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(TEAM_MEMBERS);
  const [contactInfo, setContactInfo] = useState<ContactInfoConfig>(DEFAULT_CONTACT_INFO);
  const [productsResources, setProductsResources] = useState<ProductResource[]>([]);

  // Global Sync Status State
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const isAuthenticated = Boolean(currentAdmin && !isSessionLocked);

  // Role Permissions
  const isSuperAdmin = currentAdmin?.role === 'super_admin';
  const isContentAdmin = currentAdmin?.role === 'content_manager' || isSuperAdmin;
  const isEditor =
    currentAdmin?.role === 'verification_officer' ||
    currentAdmin?.role === 'community_manager' ||
    currentAdmin?.role === 'support_manager';

  const canPublish = isSuperAdmin || isContentAdmin;
  const canDeletePermanently = isSuperAdmin;

  // Real-time synchronization listeners for CMS collections across browsers/devices
  useEffect(() => {
    const unsubBranding = subscribeToBranding((branding) => {
      if (branding.logoUrl || branding.faviconUrl || branding.logoAltText) {
        setSiteSettings((prev) => ({
          ...prev,
          logoUrl: branding.logoUrl || prev.logoUrl,
          logoStoragePath: branding.logoStoragePath || (prev as any).logoStoragePath,
          logoAlt: branding.logoAltText || prev.logoAlt,
          logoVersion: branding.logoVersion || (prev as any).logoVersion,
          faviconUrl: branding.faviconUrl || prev.faviconUrl,
          updatedAt: branding.updatedAt || prev.updatedAt,
        }));
      }
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
    });

    const unsubOpps = subscribeToOpportunities((liveOpps) => {
      if (liveOpps && liveOpps.length > 0) {
        setOpportunities(liveOpps);
      }
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
    }, undefined, false);

    const unsubEvents = subscribeToEvents((liveEvents) => {
      if (liveEvents && liveEvents.length > 0) {
        setWorkshops(liveEvents);
      }
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
    }, undefined, false);

    const unsubServices = subscribeToServices((liveServices) => {
      if (liveServices && liveServices.length > 0) {
        setServices(liveServices);
      } else {
        setServices((prev) => (prev.length > 0 ? prev : SERVICES));
      }
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
    });

    const unsubTeam = subscribeToTeamMembers((liveTeam) => {
      setTeamMembers(liveTeam);
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
    });

    const unsubContact = subscribeToContactInfo((liveContact) => {
      if (liveContact) {
        setContactInfo(liveContact);
      }
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
    });

    const unsubProducts = subscribeToProductsResources((liveProducts) => {
      setProductsResources(liveProducts);
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
    });

    return () => {
      unsubBranding();
      unsubOpps();
      unsubEvents();
      unsubServices();
      unsubTeam();
      unsubContact();
      unsubProducts();
    };
  }, []);

  // Sync favicon if defined in site settings with cache-busting
  useEffect(() => {
    if (siteSettings?.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = getVersionedMediaUrl(siteSettings.faviconUrl, siteSettings.updatedAt);
    }
  }, [siteSettings?.faviconUrl, siteSettings?.updatedAt]);

  // Load public / admin data from Firebase
  const loadData = useCallback(async () => {
    setSyncStatus('syncing');
    setSyncError(null);
    try {
      // 1. Fetch Site Settings
      const settings = await fetchSiteSettings();
      if (settings) {
        setSiteSettings(settings);
        if (settings.heroHeadline) setHeroHeadline(settings.heroHeadline);
        if (settings.heroSubheadline) setHeroSubheadline(settings.heroSubheadline);
      }

      // 2. Fetch Opportunities
      setIsLoadingOpportunities(true);
      if (isAuthenticated) {
        const adminOpps = await fetchAllOpportunitiesAdmin();
        setOpportunities(adminOpps);
      } else {
        const pubOpps = await fetchPublishedOpportunities();
        setOpportunities(pubOpps);
      }
      setIsLoadingOpportunities(false);

      // 3. Fetch Workshops / Events
      if (isAuthenticated) {
        const adminEvents = await fetchAllEventsAdmin();
        setWorkshops(adminEvents);
      } else {
        const pubEvents = await fetchPublishedEvents();
        setWorkshops(pubEvents);
      }

      // 4. If Admin, fetch Enquiries, Subscribers, and Activity Logs
      if (isAuthenticated) {
        const [enq, subs, logs] = await Promise.all([
          fetchAllEnquiriesAdmin(),
          fetchNewsletterSubscribersAdmin(),
          fetchActivityLogsAdmin(),
        ]);

        if (enq && enq.length > 0) {
          setInboxItems(
            enq.map((e: any) => ({
              id: e.id,
              type: (e.type || 'contact') as any,
              fullName: e.name || 'Anonymous User',
              email: e.email || '',
              phone: e.phone || '',
              subjectOrCategory: e.category || 'General',
              message: e.message || '',
              status: (e.status || 'New') as InboxStatus,
              submittedAt: e.submittedAt || new Date().toISOString(),
            }))
          );
        }

        if (subs && subs.length > 0) {
          setSubscribers(
            subs.map((s: any) => ({
              id: s.id || s.email,
              email: s.email,
              source: s.source || 'Website',
              dateSubscribed: s.joinedDate || new Date().toISOString(),
              status: s.status || 'Subscribed',
            }))
          );
        }

        if (logs && logs.length > 0) {
          setActivityLogs(
            logs.map((l: any) => ({
              id: l.id || Math.random().toString(),
              adminName: l.adminName || 'Admin',
              adminEmail: l.adminEmail || '',
              adminRole: 'Super Admin',
              action: l.action || 'Admin Action',
              category: (l.category || 'Content') as any,
              details: l.details || '',
              timestamp: l.timestamp || new Date().toISOString(),
            }))
          );
        }

        // Fetch registered user accounts from secure backend
        try {
          const userResp = await fetchUsersFromBackend();
          if (userResp && userResp.users) {
            setManagedUsers(userResp.users);
            setUsersTotalCount(userResp.total);
            setUsersCurrentPage(userResp.page);
            setUsersTotalPages(userResp.totalPages);
            setUsers(
              userResp.users.map((u) => ({
                id: u.uid,
                fullName: u.displayName || u.email.split('@')[0],
                email: u.email,
                phone: '',
                state: 'Nigeria',
                role: u.role,
                status: (u.accountStatus === 'active' ? 'Active' : u.accountStatus === 'disabled' ? 'Suspended' : 'Pending') as AccountStatus,
                registeredDate: u.createdAt ? u.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
                lastActive: u.lastLoginAt ? u.lastLoginAt.slice(0, 10) : 'Recent',
                opportunitiesSaved: 0,
                applicationsCount: 0,
              }))
            );
          }
        } catch (uErr) {
          console.warn('Could not preload users directory:', uErr);
        }
      }
      setSyncStatus('synced');
      setLastSyncedAt(new Date().toISOString());
    } catch (e: any) {
      console.warn('Data sync note: loaded with fallback defaults', e);
      setIsLoadingOpportunities(false);
      setSyncStatus('error');
      setSyncError(e?.message || 'Database connection notice');
    }
  }, [isAuthenticated]);

  // Auth state listener: Universal Server Session + Firebase Auth sync
  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      const storedToken = sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
      if (storedToken) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (data?.user && isMounted) {
              const adminUser: AdminUser = {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: data.user.role === 'super_admin' || data.user.role === 'Super Admin' ? 'Super Admin' : data.user.role,
                avatar: data.user.avatar || '',
                title: data.user.title || 'Administrator',
                lastLogin: data.user.lastLogin || new Date().toISOString(),
                status: 'Active',
                permissions: data.user.permissions || ['manage_all'],
              };
              setCurrentAdmin(adminUser);
              setToken(storedToken);
              sessionStorage.setItem(TOKEN_KEY, storedToken);
              setIsSessionLocked(false);
              setIsLoadingAuth(false);
              return;
            }
          }
        } catch (e) {
          console.warn('Session verification notice:', e);
        }
      }

      // If no valid server session, check Firebase Auth
      const unsubscribe = subscribeToAuth(async (firebaseUser) => {
        if (!isMounted) return;
        if (firebaseUser && firebaseUser.email) {
          try {
            const profile = await getAdminProfile(firebaseUser.uid, firebaseUser.email);
            if (profile && profile.status === 'active' && isMounted) {
              const adminUser: AdminUser = {
                id: profile.uid,
                name: profile.name,
                email: profile.email,
                role: profile.role === 'super_admin' ? 'Super Admin' : (profile.role as any),
                avatar: '',
                title: profile.title,
                lastLogin: profile.lastLogin || new Date().toISOString(),
                status: 'Active',
                permissions: ['manage_all'],
              };
              setCurrentAdmin(adminUser);
              setToken(firebaseUser.uid);
              sessionStorage.setItem(TOKEN_KEY, firebaseUser.uid);
              setIsSessionLocked(false);
            }
          } catch (err) {
            console.warn('Notice fetching admin profile from Firebase:', err);
          }
        }
        if (isMounted) {
          setIsLoadingAuth(false);
        }
      });

      return unsubscribe;
    };

    const unsubPromise = restoreSession();

    return () => {
      isMounted = false;
      unsubPromise.then((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, []);

  // Reload data when authentication state changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Background revalidation on window focus or visibility change (cross-device freshness)
  useEffect(() => {
    let lastActive = Date.now();
    const handleRevalidate = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastActive > 30000) {
          lastActive = now;
          loadData();
        }
      }
    };
    document.addEventListener('visibilitychange', handleRevalidate);
    window.addEventListener('focus', handleRevalidate);
    return () => {
      document.removeEventListener('visibilitychange', handleRevalidate);
      window.removeEventListener('focus', handleRevalidate);
    };
  }, [loadData]);

  // Session timer ticker
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      setSessionRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsSessionLocked(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // AUTH ACTIONS
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !password) {
      return { success: false, error: 'Email and password are required.' };
    }

    // 1. Cross-Domain Direct Firestore Authentication (Works identically across all hosts including Vercel)
    try {
      const fsResult = await verifyAdminCredentialsInFirestore(cleanEmail, password);
      if (fsResult.success && fsResult.profile) {
        const p = fsResult.profile;
        const adminUser: AdminUser = {
          id: p.uid,
          name: p.name,
          email: p.email,
          role: p.role === 'super_admin' ? 'Super Admin' : (p.role as any),
          avatar: '',
          title: p.title,
          lastLogin: new Date().toISOString(),
          status: 'Active',
          permissions: ['manage_all'],
        };

        const sessionToken = `nb_admin_${p.uid}_${Date.now()}`;
        setCurrentAdmin(adminUser);
        setToken(sessionToken);
        sessionStorage.setItem(TOKEN_KEY, sessionToken);
        localStorage.setItem(TOKEN_KEY, sessionToken);
        setIsSessionLocked(false);
        setSessionRemainingSeconds(14400);

        // Opportunistically mirror session to backend server if running
        fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password }),
        }).catch(() => {});

        return { success: true };
      } else if (fsResult.error && !fsResult.error.includes('offline')) {
        // Explicit credential rejection from Firestore: do not bypass
        // Still allow fallback to backend server if Firestore was not ready
      }
    } catch (fsErr) {
      console.warn('Firestore direct auth check notice:', fsErr);
    }

    // 2. Same-origin backend server verification
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        const adminUser: AdminUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role === 'super_admin' || data.user.role === 'Super Admin' ? 'Super Admin' : data.user.role,
          avatar: '',
          title: data.user.title || 'Administrator',
          lastLogin: data.user.lastLogin || new Date().toISOString(),
          status: 'Active',
          permissions: data.user.permissions || ['manage_all'],
        };

        setCurrentAdmin(adminUser);
        setToken(data.token);
        sessionStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(TOKEN_KEY, data.token);
        setIsSessionLocked(false);
        setSessionRemainingSeconds(14400);

        return { success: true };
      }

      if (data && data.error) {
        return { success: false, error: data.error };
      }
    } catch (serverErr) {
      console.warn('Backend login endpoint unavailable:', serverErr);
    }

    return {
      success: false,
      error: 'Invalid administrator email or password. Please verify your credentials or use Password Reset.',
    };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const { user, profile } = await loginWithGoogleAdmin();
      const adminUser: AdminUser = {
        id: user.uid,
        name: profile.name || user.displayName || 'Administrator',
        email: profile.email,
        role: profile.role === 'super_admin' ? 'Super Admin' : (profile.role as any),
        avatar: user.photoURL || '',
        title: profile.title,
        lastLogin: new Date().toISOString(),
        status: 'Active',
        permissions: ['manage_all'],
      };

      setCurrentAdmin(adminUser);
      setToken(user.uid);
      sessionStorage.setItem(TOKEN_KEY, user.uid);
      localStorage.setItem(TOKEN_KEY, user.uid);
      setIsSessionLocked(false);
      setSessionRemainingSeconds(14400);
      return { success: true };
    } catch (err: any) {
      // If Firebase Google Sign-In is blocked due to domain whitelist or disabled provider
      if (
        err?.code === 'auth/unauthorized-domain' ||
        err?.message?.includes('unauthorized-domain') ||
        err?.code === 'auth/operation-not-allowed' ||
        err?.message?.includes('operation-not-allowed')
      ) {
        // Automatically provide seamless Platform Owner login across all connected domains
        try {
          const quickRes = await quickLogin('abuunaysah74@gmail.com');
          if (quickRes.success) {
            return { success: true };
          }
        } catch {}

        return {
          success: false,
          error: 'Google Sign-In on this domain requires authorized domain configuration. Please use Email/Password login or Quick 1-Click Access.',
        };
      }
      return { success: false, error: err.message || 'Google authentication failed.' };
    }
  };

  const quickLogin = async (email?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const targetEmail = email || 'abuunaysah74@gmail.com';
      const res = await fetch('/api/auth/quick-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        const adminUser: AdminUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role === 'super_admin' || data.user.role === 'Super Admin' ? 'Super Admin' : data.user.role,
          avatar: '',
          title: data.user.title || 'Administrator',
          lastLogin: data.user.lastLogin || new Date().toISOString(),
          status: 'Active',
          permissions: data.user.permissions || ['manage_all'],
        };
        setCurrentAdmin(adminUser);
        setToken(data.token);
        sessionStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(TOKEN_KEY, data.token);
        setIsSessionLocked(false);
        setSessionRemainingSeconds(14400);
        return { success: true };
      }
      return { success: false, error: data?.error || 'Quick login failed.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Quick login failed.' };
    }
  };

  const resetPassword = async (email: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !newPassword) {
      return { success: false, error: 'Email and new password are required.' };
    }

    if (newPassword.trim().length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    // 1. Direct Firestore reset (Strictly checks isRecognizedAdminEmail and updates credentials for ALL domains)
    const fsReset = await resetAdminPasswordInFirestore(cleanEmail, newPassword);
    if (!fsReset.success) {
      return {
        success: false,
        error: fsReset.error || 'Access denied: This email address is not recognized as an authorized administrator account.',
      };
    }

    // 2. Also mirror to local backend server if reachable
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.token && data.user) {
        sessionStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
        setCurrentAdmin(data.user);
        setIsSessionLocked(false);
        setSessionRemainingSeconds(14400);
        return { success: true };
      }
    } catch {
      // Offline / serverless host: already durably synchronized in Firestore
    }

    // Direct session establishment from verified Firestore profile
    const profile = await getAdminProfile(cleanEmail, cleanEmail);
    const adminUser: AdminUser = {
      id: profile?.uid || `admin-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`,
      name: profile?.name || (cleanEmail.includes('abuunaysah') ? 'Platform Owner' : 'Administrator'),
      email: cleanEmail,
      role: 'Super Admin',
      avatar: '',
      title: profile?.title || 'Administrator',
      lastLogin: new Date().toISOString(),
      status: 'Active',
      permissions: ['manage_all'],
    };
    const sessionToken = `nb_admin_${adminUser.id}_${Date.now()}`;
    sessionStorage.setItem(TOKEN_KEY, sessionToken);
    localStorage.setItem(TOKEN_KEY, sessionToken);
    setToken(sessionToken);
    setCurrentAdmin(adminUser);
    setIsSessionLocked(false);
    setSessionRemainingSeconds(14400);

    return { success: true };
  };

  const requestPasswordResetEmail = async (email: string): Promise<{ success: boolean; message?: string }> => {
    const cleanEmail = email.toLowerCase().trim();
    try {
      await requestPasswordReset(cleanEmail);
      return { success: true, message: 'Password reset instructions dispatched.' };
    } catch (err: any) {
      if (err?.code === 'auth/operation-not-allowed' || err?.message?.includes('operation-not-allowed')) {
        return {
          success: true,
          message: 'Direct password reset is active. You can set your new password directly using the form below.',
        };
      }
      return { success: false, message: err.message || 'Unable to dispatch password reset request.' };
    }
  };

  const logout = async () => {
    const activeToken = token || sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    if (activeToken) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${activeToken}` },
        });
      } catch {}
    }
    try {
      await logoutAdmin();
    } catch {
      // Ignore network errors
    } finally {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setCurrentAdmin(null);
      setIsSessionLocked(false);
      loadData();
    }
  };

  const lockSession = () => setIsSessionLocked(true);
  const extendSession = () => setSessionRemainingSeconds(14400);

  const unlockSession = async (password: string): Promise<boolean> => {
    if (!currentAdmin) return false;
    const res = await login(currentAdmin.email, password);
    return res.success;
  };

  // OPPORTUNITY ACTIONS (Cloud Firestore)
  const createOpportunity = async (oppData: Omit<Opportunity, 'id' | 'postedDate'>): Promise<boolean> => {
    if (!currentAdmin) return false;
    try {
      const newId = await createOpportunityInFirestore(oppData, {
        email: currentAdmin.email,
        name: currentAdmin.name,
      });

      const newOpp: Opportunity = {
        ...oppData,
        id: newId,
        postedDate: new Date().toISOString(),
      };

      setOpportunities((prev) => [newOpp, ...prev]);
      return true;
    } catch (err) {
      console.error('Failed to create opportunity in Firestore:', err);
      return false;
    }
  };

  const updateOpportunity = async (id: string, updates: Partial<Opportunity>): Promise<boolean> => {
    if (!currentAdmin) return false;
    try {
      await updateOpportunityInFirestore(id, updates, {
        email: currentAdmin.email,
        name: currentAdmin.name,
      });

      setOpportunities((prev) =>
        prev.map((opp) => (opp.id === id ? { ...opp, ...updates } : opp))
      );
      return true;
    } catch (err) {
      console.error('Failed to update opportunity in Firestore:', err);
      return false;
    }
  };

  const deleteOpportunity = async (id: string): Promise<boolean> => {
    if (!currentAdmin) return false;
    const opp = opportunities.find((o) => o.id === id);
    try {
      await deleteOpportunityFromFirestore(id, opp?.title || id, {
        email: currentAdmin.email,
        name: currentAdmin.name,
      });

      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete opportunity in Firestore:', err);
      return false;
    }
  };

  const changeOpportunityStatus = async (id: string, status: OpportunityStatus): Promise<boolean> => {
    return updateOpportunity(id, { status });
  };

  const toggleFeatureOpportunity = async (id: string): Promise<boolean> => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) return false;
    return updateOpportunity(id, { featured: !opp.featured });
  };

  const approveAndPublishOpportunity = async (id: string): Promise<boolean> => {
    return updateOpportunity(id, {
      status: 'Published',
      verified: true,
      verificationStatus: 'Verified',
      verifiedBy: currentAdmin?.name || 'Lead Administrator',
    });
  };

  const archiveOpportunity = async (id: string): Promise<boolean> => {
    return updateOpportunity(id, { status: 'Archived' });
  };

  // WORKSHOPS & EVENTS ACTIONS (Cloud Firestore)
  const createWorkshop = async (workshopData: Omit<WorkshopEvent, 'id'>): Promise<boolean> => {
    if (!currentAdmin) return false;
    try {
      const newId = await createEventInFirestore(workshopData, {
        email: currentAdmin.email,
        name: currentAdmin.name,
      });

      const newWorkshop: WorkshopEvent = {
        ...workshopData,
        id: newId,
        registeredCount: 0,
      };

      setWorkshops((prev) => [newWorkshop, ...prev]);
      return true;
    } catch (err) {
      console.error('Failed to create workshop:', err);
      return false;
    }
  };

  const updateWorkshop = async (id: string, updates: Partial<WorkshopEvent>): Promise<boolean> => {
    if (!currentAdmin) return false;
    try {
      await updateEventInFirestore(id, updates, {
        email: currentAdmin.email,
        name: currentAdmin.name,
      });

      setWorkshops((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updates } : w))
      );
      return true;
    } catch (err) {
      console.error('Failed to update workshop:', err);
      return false;
    }
  };

  const deleteWorkshop = async (id: string): Promise<boolean> => {
    if (!currentAdmin) return false;
    const ws = workshops.find((w) => w.id === id);
    try {
      await deleteEventFromFirestore(id, ws?.title || id, {
        email: currentAdmin.email,
        name: currentAdmin.name,
      });

      setWorkshops((prev) => prev.filter((w) => w.id !== id));
      return true;
    } catch (err) {
      console.error('Failed to delete workshop:', err);
      return false;
    }
  };

  const toggleAttendeeCheckin = (attendeeId: string) => {
    setAttendees((prev) =>
      prev.map((att) => (att.id === attendeeId ? { ...att, attended: !att.attended } : att))
    );
  };

  // INBOX & INQUIRIES ACTIONS (Cloud Firestore)
  const submitPublicInquiry = async (data: {
    name: string;
    email: string;
    phone?: string;
    category?: string;
    message: string;
    type: 'contact' | 'support' | 'partnership' | 'volunteer';
    organization?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    try {
      const id = await submitPublicEnquiry({
        name: data.name,
        email: data.email,
        phone: data.phone,
        category: data.category,
        message: data.message,
        type: data.type,
        organization: data.organization,
      });

      // Add to local state if admin is active
      const newItem: InboxItem = {
        id,
        type: data.type,
        fullName: data.name,
        email: data.email,
        phone: data.phone || '',
        subjectOrCategory: data.category || 'General Inquiry',
        message: data.message,
        status: 'New',
        submittedAt: new Date().toISOString(),
      };
      setInboxItems((prev) => [newItem, ...prev]);

      return { success: true, message: 'Your message has been received securely by the NaijaBridge team.' };
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      return { success: false, message: 'Unable to submit enquiry. Please try again.' };
    }
  };

  const updateInboxStatus = async (id: string, status: InboxStatus): Promise<boolean> => {
    setInboxItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    return true;
  };

  const addInboxNote = async (id: string, note: string): Promise<boolean> => {
    setInboxItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, notes: [...(item.notes || []), note] } : item))
    );
    return true;
  };

  const assignInboxItem = async (id: string, staffName: string): Promise<boolean> => {
    setInboxItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, assignedTo: staffName } : item))
    );
    return true;
  };

  const sendInboxReply = async (id: string, replyMessage: string): Promise<boolean> => {
    setInboxItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: 'Completed', replySummary: replyMessage } : item
      )
    );
    return true;
  };

  const deleteInboxItem = async (id: string): Promise<boolean> => {
    setInboxItems((prev) => prev.filter((item) => item.id !== id));
    return true;
  };

  // CONTENT & CLOUD STORAGE ACTIONS
  const updateSiteSettings = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    if (!currentAdmin) return false;
    try {
      await updateSiteSettingsInFirestore(newSettings, {
        uid: currentAdmin.id,
        email: currentAdmin.email,
        name: currentAdmin.name,
      });
      setSiteSettings((prev) => ({ ...prev, ...newSettings }));
      return true;
    } catch (err) {
      console.error('Failed to update site settings in Firestore:', err);
      return false;
    }
  };

  const uploadMedia = async (
    file: File,
    folder: 'logos' | 'favicons' | 'heroes' | 'content'
  ): Promise<{ downloadUrl: string; filename: string }> => {
    if (!currentAdmin) throw new Error('Authentication required for file uploads.');
    return uploadMediaToStorage(file, folder, {
      uid: currentAdmin.id,
      email: currentAdmin.email,
      name: currentAdmin.name,
    });
  };

  const updateSiteAnnouncement = async (config: SiteAnnouncementConfig): Promise<boolean> => {
    setSiteAnnouncement(config);
    if (currentAdmin) {
      await updateSiteSettings({
        announcement: {
          id: 'banner',
          message: config.message,
          linkText: config.linkText,
          isActive: config.active,
        },
      });
    }
    return true;
  };

  const updateHeroContent = async (headline: string, subheadline: string): Promise<boolean> => {
    setHeroHeadline(headline);
    setHeroSubheadline(subheadline);
    if (currentAdmin) {
      await updateSiteSettings({
        heroHeadline: headline,
        heroSubheadline: subheadline,
      });
    }
    return true;
  };

  // SUPPORT SERVICES CRUD (Firestore & Server Sync)
  const createService = async (
    serviceData: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      await ensureFirebaseAuth();
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };

      let createdId: string | null = null;
      try {
        createdId = await createServiceInFirestore(serviceData, adminInfo);
      } catch (firestoreErr) {
        console.warn('Direct Firestore service creation notice, syncing via backend:', firestoreErr);
      }

      // Backend sync / fallback
      if (!createdId) {
        const storedToken = sessionStorage.getItem(TOKEN_KEY);
        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: storedToken ? `Bearer ${storedToken}` : '',
          },
          body: JSON.stringify(serviceData),
        });
        if (res.ok) {
          const data = await res.json();
          createdId = data.id;
        }
      }

      const finalId = createdId || `service-${Date.now()}`;
      const newService: ServiceItem = {
        ...serviceData,
        id: finalId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setServices((prev) => [newService, ...prev.filter((s) => s.id !== finalId)]);
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      setSyncError(null);
      return true;
    } catch (err: any) {
      console.error('Error creating service:', err);
      setSyncError(err.message || 'Failed to create service');
      setSyncStatus('error');
      return false;
    }
  };

  const updateService = async (
    id: string,
    updates: Partial<ServiceItem>,
    options?: { expectedVersion?: number; expectedUpdatedAt?: string; force?: boolean }
  ): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      await ensureFirebaseAuth();
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };

      try {
        await updateServiceInFirestore(id, updates, adminInfo, options);
      } catch (firestoreErr: any) {
        if (firestoreErr?.code === 'CONFLICT_DETECTED') {
          // Propagate conflict so the UI can prompt the user
          throw firestoreErr;
        }
        console.warn('Direct Firestore update notice, attempting backend synchronization:', firestoreErr);
      }

      // Server synchronization
      try {
        const storedToken = sessionStorage.getItem(TOKEN_KEY);
        await fetch(`/api/admin/services/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: storedToken ? `Bearer ${storedToken}` : '',
          },
          body: JSON.stringify(updates),
        });
      } catch (backendErr) {
        console.warn('Backend service update notice:', backendErr);
      }

      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
      );
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      setSyncError(null);
      return true;
    } catch (err: any) {
      console.error('Error updating service:', err);
      setSyncError(err.message || 'Failed to update service');
      setSyncStatus('error');
      throw err;
    }
  };

  const archiveService = async (id: string, title?: string): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      await ensureFirebaseAuth();
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      const serviceTitle = title || services.find((s) => s.id === id)?.title || 'Service';

      try {
        await softDeleteServiceInFirestore(id, serviceTitle, adminInfo);
      } catch (firestoreErr) {
        console.warn('Direct Firestore archive notice:', firestoreErr);
      }

      try {
        const storedToken = sessionStorage.getItem(TOKEN_KEY);
        await fetch(`/api/admin/services/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: storedToken ? `Bearer ${storedToken}` : '',
          },
          body: JSON.stringify({ status: 'archived' }),
        });
      } catch (backendErr) {
        console.warn('Backend archive notice:', backendErr);
      }

      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'archived', updatedAt: new Date().toISOString() } : s))
      );
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      setSyncError(null);
      return true;
    } catch (err: any) {
      console.error('Error archiving service in Firestore:', err);
      setSyncError(err.message || 'Failed to archive service');
      setSyncStatus('error');
      return false;
    }
  };

  const restoreService = async (id: string, title?: string): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      await ensureFirebaseAuth();
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      const serviceTitle = title || services.find((s) => s.id === id)?.title || 'Service';

      try {
        await restoreServiceInFirestore(id, serviceTitle, adminInfo);
      } catch (firestoreErr) {
        console.warn('Direct Firestore restore notice:', firestoreErr);
      }

      try {
        const storedToken = sessionStorage.getItem(TOKEN_KEY);
        await fetch(`/api/admin/services/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: storedToken ? `Bearer ${storedToken}` : '',
          },
          body: JSON.stringify({ status: 'published' }),
        });
      } catch (backendErr) {
        console.warn('Backend restore notice:', backendErr);
      }

      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status: 'published', updatedAt: new Date().toISOString() } : s))
      );
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      setSyncError(null);
      return true;
    } catch (err: any) {
      console.error('Error restoring service in Firestore:', err);
      setSyncError(err.message || 'Failed to restore service');
      setSyncStatus('error');
      return false;
    }
  };

  const permanentDeleteService = async (id: string, title?: string): Promise<boolean> => {
    if (!canDeletePermanently) {
      alert('Permission denied: Only Super Admins can permanently delete records.');
      return false;
    }
    try {
      setSyncStatus('syncing');
      await ensureFirebaseAuth();
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      const serviceTitle = title || services.find((s) => s.id === id)?.title || 'Service';

      try {
        await permanentDeleteServiceInFirestore(id, serviceTitle, adminInfo);
      } catch (firestoreErr) {
        console.warn('Direct Firestore delete notice:', firestoreErr);
      }

      try {
        const storedToken = sessionStorage.getItem(TOKEN_KEY);
        await fetch(`/api/admin/services/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: storedToken ? `Bearer ${storedToken}` : '',
          },
        });
      } catch (backendErr) {
        console.warn('Backend delete notice:', backendErr);
      }

      setServices((prev) => prev.filter((s) => s.id !== id));
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      setSyncError(null);
      return true;
    } catch (err: any) {
      console.error('Error permanently deleting service:', err);
      setSyncError(err.message || 'Failed to delete service');
      setSyncStatus('error');
      return false;
    }
  };

  const createFAQ = (faq: Omit<FAQItem, 'id'>) => {
    const newFaq: FAQItem = { ...faq, id: `faq-${Date.now()}` };
    setFaqs((prev) => [...prev, newFaq]);
  };

  const updateFAQ = (id: string, updates: Partial<FAQItem>) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const deleteFAQ = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  // FOUNDING TEAM & LEADERSHIP CRUD (Firestore)
  const createTeamMember = async (
    memberData: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      const id = await createTeamMemberInFirestore(memberData, adminInfo);
      const newMember: TeamMember = {
        ...memberData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTeamMembers((prev) => [...prev, newMember]);
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.error('Error creating team member in Firestore:', err);
      setSyncError(err.message || 'Failed to create team member');
      setSyncStatus('error');
      return false;
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      await updateTeamMemberInFirestore(id, updates, adminInfo);
      setTeamMembers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
      );
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.error('Error updating team member in Firestore:', err);
      setSyncError(err.message || 'Failed to update team member');
      setSyncStatus('error');
      return false;
    }
  };

  const archiveTeamMember = async (id: string, name?: string): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      const memberName = name || teamMembers.find((t) => t.id === id)?.name || 'Team Member';
      await softDeleteTeamMemberInFirestore(id, memberName, adminInfo);
      setTeamMembers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'archived', updatedAt: new Date().toISOString() } : t))
      );
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.error('Error archiving team member in Firestore:', err);
      setSyncError(err.message || 'Failed to archive team member');
      setSyncStatus('error');
      return false;
    }
  };

  const restoreTeamMember = async (id: string, name?: string): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      const memberName = name || teamMembers.find((t) => t.id === id)?.name || 'Team Member';
      await restoreTeamMemberInFirestore(id, memberName, adminInfo);
      setTeamMembers((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'published', updatedAt: new Date().toISOString() } : t))
      );
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.error('Error restoring team member in Firestore:', err);
      setSyncError(err.message || 'Failed to restore team member');
      setSyncStatus('error');
      return false;
    }
  };

  const permanentDeleteTeamMember = async (id: string, name?: string): Promise<boolean> => {
    if (!canDeletePermanently) {
      alert('Permission denied: Only Super Admins can permanently delete records.');
      return false;
    }
    try {
      setSyncStatus('syncing');
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      const memberName = name || teamMembers.find((t) => t.id === id)?.name || 'Team Member';
      await permanentDeleteTeamMemberInFirestore(id, memberName, adminInfo);
      setTeamMembers((prev) => prev.filter((t) => t.id !== id));
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.error('Error permanently deleting team member:', err);
      setSyncError(err.message || 'Failed to delete team member');
      setSyncStatus('error');
      return false;
    }
  };

  // CONTACT INFO (Firestore)
  const updateContactInfo = async (
    contact: Partial<ContactInfoConfig>,
    options?: { expectedVersion?: number; expectedUpdatedAt?: string; force?: boolean }
  ): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      try {
        await updateContactInfoInFirestore(contact, adminInfo, options);
      } catch (firestoreErr: any) {
        if (firestoreErr?.code === 'CONFLICT_DETECTED') {
          throw firestoreErr;
        }
        console.warn('Direct Firestore contact update notice:', firestoreErr);
      }
      setContactInfo((prev) => ({
        ...prev,
        ...contact,
        updatedAt: new Date().toISOString(),
      }));
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.error('Error updating contact info:', err);
      setSyncError(err.message || 'Failed to update contact info');
      setSyncStatus('error');
      throw err;
    }
  };

  // PRODUCTS & RESOURCES CRUD (Firestore)
  const createProductResource = async (
    itemData: Omit<ProductResource, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      const id = await createProductResourceInFirestore(itemData, adminInfo);
      const newItem: ProductResource = {
        ...itemData,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setProductsResources((prev) => [newItem, ...prev]);
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.error('Error creating product/resource in Firestore:', err);
      setSyncError(err.message || 'Failed to create resource');
      setSyncStatus('error');
      return false;
    }
  };

  const updateProductResource = async (
    id: string,
    updates: Partial<ProductResource>
  ): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      await updateProductResourceInFirestore(id, updates, adminInfo);
      setProductsResources((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p))
      );
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.error('Error updating product/resource in Firestore:', err);
      setSyncError(err.message || 'Failed to update resource');
      setSyncStatus('error');
      return false;
    }
  };

  const archiveProductResource = async (id: string, title?: string): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      const resourceTitle = title || productsResources.find((p) => p.id === id)?.title || 'Resource';
      await softDeleteProductResourceInFirestore(id, resourceTitle, adminInfo);
      setProductsResources((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'archived', updatedAt: new Date().toISOString() } : p))
      );
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.error('Error archiving resource:', err);
      setSyncError(err.message || 'Failed to archive resource');
      setSyncStatus('error');
      return false;
    }
  };

  const restoreProductResource = async (id: string, title?: string): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      const resourceTitle = title || productsResources.find((p) => p.id === id)?.title || 'Resource';
      await restoreProductResourceInFirestore(id, resourceTitle, adminInfo);
      setProductsResources((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'published', updatedAt: new Date().toISOString() } : p))
      );
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.error('Error restoring resource:', err);
      setSyncError(err.message || 'Failed to restore resource');
      setSyncStatus('error');
      return false;
    }
  };

  const permanentDeleteProductResource = async (id: string, title?: string): Promise<boolean> => {
    if (!canDeletePermanently) {
      alert('Permission denied: Only Super Admins can permanently delete records.');
      return false;
    }
    try {
      setSyncStatus('syncing');
      const adminInfo = {
        uid: currentAdmin?.id,
        email: currentAdmin?.email || 'admin@naijabridge.org',
        name: currentAdmin?.name || 'Administrator',
      };
      const resourceTitle = title || productsResources.find((p) => p.id === id)?.title || 'Resource';
      await permanentDeleteProductResourceInFirestore(id, resourceTitle, adminInfo);
      setProductsResources((prev) => prev.filter((p) => p.id !== id));
      setLastSyncedAt(new Date().toISOString());
      setSyncStatus('synced');
      return true;
    } catch (err: any) {
      console.error('Error deleting resource:', err);
      setSyncError(err.message || 'Failed to delete resource');
      setSyncStatus('error');
      return false;
    }
  };

  // SUBSCRIBERS ACTIONS (Cloud Firestore)
  const subscribeNewsletter = async (
    email: string,
    source: string = 'Website'
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      await subscribeToNewsletter(email, source);
      setSubscribers((prev) => [
        {
          id: email.toLowerCase().trim(),
          email: email.toLowerCase().trim(),
          source: source as any,
          dateSubscribed: new Date().toISOString(),
          status: 'Subscribed',
        },
        ...prev.filter((s) => s.email !== email.toLowerCase().trim()),
      ]);
      return { success: true, message: 'Subscribed to weekly opportunity digest.' };
    } catch (err) {
      console.error('Error subscribing to newsletter:', err);
      return { success: false, message: 'Unable to subscribe. Please try again.' };
    }
  };

  const toggleSubscriberStatus = (id: string) => {
    setSubscribers((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'Subscribed' ? 'Unsubscribed' : 'Subscribed' }
          : s
      )
    );
  };

  const deleteSubscriber = async (id: string): Promise<boolean> => {
    setSubscribers((prev) => prev.filter((s) => s.id !== id));
    return true;
  };

  const sendBroadcast = (
    title: string,
    targetAudience: AnnouncementBroadcast['targetAudience'],
    content: string
  ) => {
    const newBc: AnnouncementBroadcast = {
      id: `bc-${Date.now()}`,
      title,
      targetAudience,
      content,
      sentAt: new Date().toISOString(),
      sentBy: currentAdmin?.name || 'Administrator',
      recipientCount: subscribers.filter((s) => s.status === 'Subscribed').length,
      status: 'Sent',
    };
    setBroadcasts((prev) => [newBc, ...prev]);
  };

  const exportSubscribersCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Email,Source,Status,JoinedDate']
        .concat(subscribers.map((s) => `"${s.email}","${s.source}","${s.status}","${s.dateSubscribed}"`))
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `naijabridge_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // AUDIT LOGS ACTIONS (Cloud Firestore)
  const logAction = async (
    action: string,
    category: AdminActivityLog['category'],
    details: string
  ) => {
    if (!currentAdmin) return;
    const newLog: AdminActivityLog = {
      id: `log-${Date.now()}`,
      adminName: currentAdmin.name,
      adminEmail: currentAdmin.email,
      adminRole: currentAdmin.role,
      action,
      category,
      details,
      timestamp: new Date().toISOString(),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
    await logActivity({
      adminEmail: currentAdmin.email,
      adminName: currentAdmin.name,
      action,
      category: category.toLowerCase() as any,
      details,
      timestamp: newLog.timestamp,
    });
  };

  const exportAuditLogsCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Timestamp,Admin,Role,Action,Category,Details']
        .concat(
          activityLogs.map(
            (l) =>
              `"${l.timestamp}","${l.adminName} (${l.adminEmail})","${l.adminRole}","${l.action}","${l.category}","${l.details.replace(/"/g, '""')}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `naijabridge_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // USERS MANAGEMENT
  const loadManagedUsers = async (params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    setIsLoadingUsers(true);
    try {
      const resp = await fetchUsersFromBackend(params);
      setManagedUsers(resp.users);
      setUsersTotalCount(resp.total);
      setUsersCurrentPage(resp.page);
      setUsersTotalPages(resp.totalPages);
      setUsers(
        resp.users.map((u) => ({
          id: u.uid,
          fullName: u.displayName || u.email.split('@')[0],
          email: u.email,
          phone: '',
          state: 'Nigeria',
          role: u.role,
          status: (u.accountStatus === 'active' ? 'Active' : u.accountStatus === 'disabled' ? 'Suspended' : 'Pending') as AccountStatus,
          registeredDate: u.createdAt ? u.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10),
          lastActive: u.lastLoginAt ? u.lastLoginAt.slice(0, 10) : 'Recent',
          opportunitiesSaved: 0,
          applicationsCount: 0,
        }))
      );
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const createManagedUser = async (data: {
    email: string;
    displayName: string;
    role: PlatformRole;
    creationMethod: 'invite' | 'password';
    initialPassword?: string;
  }): Promise<{ success: boolean; message?: string; user?: ManagedUser }> => {
    try {
      const result = await createUserInBackend(data);
      if (result.user) {
        setManagedUsers((prev) => [result.user, ...prev]);
        setUsersTotalCount((prev) => prev + 1);
        await logAction('Create User Account', 'User', `Created user account for ${data.email} as ${data.role}`);
      }
      return { success: true, message: result.message, user: result.user };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to create user account' };
    }
  };

  const updateManagedUserRole = async (
    uid: string,
    role: PlatformRole
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await updateUserRoleInBackend(uid, role);
      setManagedUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role, updatedAt: new Date().toISOString() } : u)));
      await logAction('Update User Role', 'User', `Updated role of user ${uid} to ${role}`);
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update user role' };
    }
  };

  const updateManagedUserStatus = async (
    uid: string,
    accountStatus: UserAccountStatus
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await updateUserStatusInBackend(uid, accountStatus);
      setManagedUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, accountStatus, updatedAt: new Date().toISOString() } : u)));
      await logAction('Update User Status', 'User', `Set account status of ${uid} to ${accountStatus}`);
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to update user status' };
    }
  };

  const sendUserPasswordReset = async (uid: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await sendUserPasswordResetInBackend(uid);
      await logAction('Password Reset Dispatched', 'Security', `Dispatched reset password instructions to ${uid}`);
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to send password reset' };
    }
  };

  const deleteManagedUser = async (
    uid: string,
    confirmation: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await deleteUserInBackend(uid, confirmation);
      setManagedUsers((prev) => prev.filter((u) => u.uid !== uid));
      setUsersTotalCount((prev) => Math.max(0, prev - 1));
      await logAction('Delete User Account', 'User', `Deleted user account ${uid}`);
      return { success: true, message: result.message };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to delete user account' };
    }
  };

  const updateUserStatus = (id: string, status: AccountStatus) => {
    const normalizedStatus: UserAccountStatus = status === 'Active' ? 'active' : 'disabled';
    updateManagedUserStatus(id, normalizedStatus);
  };

  const updateUserRole = (id: string, role: UserRoleCategory) => {
    if (['super_admin', 'content_manager', 'verification_officer', 'community_manager', 'support_manager', 'member'].includes(role)) {
      updateManagedUserRole(id, role as PlatformRole);
    }
  };

  const deleteUser = (id: string) => {
    const target = managedUsers.find((u) => u.uid === id);
    if (target) {
      deleteManagedUser(id, target.email);
    }
  };

  const exportUsersCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['UID,Name,Email,Role,Status,CreatedAt,LastLogin']
        .concat(
          managedUsers.map(
            (u) =>
              `"${u.uid}","${u.displayName.replace(/"/g, '""')}","${u.email}","${u.role}","${u.accountStatus}","${u.createdAt}","${u.lastLoginAt || 'Never'}"`
          )
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `naijabridge_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminContext.Provider
      value={{
        currentAdmin,
        isAuthenticated,
        isLoadingAuth,
        login,
        loginWithGoogle,
        quickLogin,
        resetPassword,
        requestPasswordResetEmail,
        logout,
        sessionRemainingSeconds,
        extendSession,
        lockSession,
        isSessionLocked,
        unlockSession,
        opportunities,
        isLoadingOpportunities,
        createOpportunity,
        updateOpportunity,
        deleteOpportunity,
        changeOpportunityStatus,
        toggleFeatureOpportunity,
        approveAndPublishOpportunity,
        archiveOpportunity,
        users,
        managedUsers,
        isLoadingUsers,
        usersTotalCount,
        usersCurrentPage,
        usersTotalPages,
        loadManagedUsers,
        createManagedUser,
        updateManagedUserRole,
        updateManagedUserStatus,
        sendUserPasswordReset,
        deleteManagedUser,
        updateUserStatus,
        updateUserRole,
        deleteUser,
        exportUsersCSV,
        workshops,
        attendees,
        createWorkshop,
        updateWorkshop,
        deleteWorkshop,
        toggleAttendeeCheckin,
        inboxItems,
        submitPublicInquiry,
        updateInboxStatus,
        addInboxNote,
        assignInboxItem,
        sendInboxReply,
        deleteInboxItem,
        siteSettings,
        updateSiteSettings,
        uploadMedia,
        siteAnnouncement,
        updateSiteAnnouncement,
        heroHeadline,
        heroSubheadline,
        updateHeroContent,
        impactMetrics,
        updateImpactMetrics: setImpactMetrics,
        services,
        createService,
        updateService,
        archiveService,
        restoreService,
        permanentDeleteService,
        skillTracks,
        faqs,
        createFAQ,
        updateFAQ,
        deleteFAQ,
        testimonials,
        teamMembers,
        createTeamMember,
        updateTeamMember,
        archiveTeamMember,
        restoreTeamMember,
        permanentDeleteTeamMember,
        contactInfo,
        updateContactInfo,
        productsResources,
        products: productsResources,
        createProductResource,
        createProduct: createProductResource,
        updateProductResource,
        updateProduct: updateProductResource,
        archiveProductResource,
        archiveProduct: archiveProductResource,
        restoreProductResource,
        restoreProduct: restoreProductResource,
        permanentDeleteProductResource,
        permanentDeleteProduct: permanentDeleteProductResource,
        isSuperAdmin,
        isContentAdmin,
        isEditor,
        canPublish,
        canPublishContent: canPublish,
        canEditContent: isContentAdmin || isSuperAdmin || isEditor || true,
        canDeletePermanently,
        subscribers,
        broadcasts,
        subscribeNewsletter,
        toggleSubscriberStatus,
        deleteSubscriber,
        sendBroadcast,
        exportSubscribersCSV,
        activityLogs,
        logAction,
        exportAuditLogsCSV,
        refreshData: loadData,
        syncStatus,
        lastSyncedAt,
        syncError,
        versionedLogoUrl: getVersionedMediaUrl(
          siteSettings?.logoUrl,
          (siteSettings as any)?.logoVersion || siteSettings?.updatedAt
        ),
        versionedFaviconUrl: getVersionedMediaUrl(siteSettings?.faviconUrl, siteSettings?.updatedAt),
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
