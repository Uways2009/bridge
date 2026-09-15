import {
  AdminUser,
  Opportunity,
  UserAccount,
  InboxItem,
  EventAttendee,
  NewsletterSubscriber,
  AnnouncementBroadcast,
  AdminActivityLog,
  SiteAnnouncementConfig,
} from '../types';

/**
 * Clean data structures - Real data is managed by the secure server
 */
export const MOCK_ADMIN_ACCOUNTS: AdminUser[] = [];

export const INITIAL_ADMIN_OPPORTUNITIES: Opportunity[] = [];

export const MOCK_USERS: UserAccount[] = [];

export const MOCK_INBOX_ITEMS: InboxItem[] = [];

export const MOCK_EVENT_ATTENDEES: EventAttendee[] = [];

export const MOCK_SUBSCRIBERS: NewsletterSubscriber[] = [];

export const MOCK_BROADCASTS: AnnouncementBroadcast[] = [];

export const MOCK_ACTIVITY_LOGS: AdminActivityLog[] = [];

export const DEFAULT_SITE_ANNOUNCEMENT: SiteAnnouncementConfig = {
  active: false,
  message: '',
  linkText: '',
  linkPage: 'opportunities',
  type: 'info',
};
