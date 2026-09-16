/**
 * NaijaBridge Central Role-Based Access Control (RBAC) & Permission Matrix
 * Production authorization engine shared across client, admin views, and routing.
 */

export type StaffRole =
  | 'owner'
  | 'super_admin'
  | 'opportunities_manager'
  | 'academy_manager'
  | 'support_services_manager'
  | 'community_manager'
  | 'content_editor'
  | 'reviewer'
  | 'support_agent'
  | 'analyst'
  | 'user';

export type Permission =
  | 'users.read'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'roles.read'
  | 'roles.assign'
  | 'branding.read'
  | 'branding.update'
  | 'opportunities.read'
  | 'opportunities.create'
  | 'opportunities.update'
  | 'opportunities.publish'
  | 'opportunities.delete'
  | 'academy.read'
  | 'academy.create'
  | 'academy.update'
  | 'academy.delete'
  | 'services.read'
  | 'services.create'
  | 'services.update'
  | 'services.delete'
  | 'community.read'
  | 'community.create'
  | 'community.update'
  | 'community.delete'
  | 'verification.review'
  | 'support.read'
  | 'support.reply'
  | 'analytics.read'
  | 'settings.update'
  | 'audit.read';

/**
 * Standard Role Definitions & Visual Metadata
 */
export interface RoleDefinition {
  id: StaffRole;
  label: string;
  badgeLabel: string;
  badgeColor: string;
  dashboardPath: string;
  dashboardTitle: string;
  description: string;
  permissions: Permission[];
}

export const ROLE_DEFINITIONS: Record<StaffRole, RoleDefinition> = {
  owner: {
    id: 'owner',
    label: 'Platform Owner',
    badgeLabel: 'Owner & Governance',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    dashboardPath: '/dashboard/owner',
    dashboardTitle: 'Platform Governance & Ownership Command',
    description: 'Full platform governance. Manages users, roles, platform branding, security policies, and audit trails.',
    permissions: [
      'users.read',
      'users.create',
      'users.update',
      'users.delete',
      'roles.read',
      'roles.assign',
      'branding.read',
      'branding.update',
      'opportunities.read',
      'opportunities.create',
      'opportunities.update',
      'opportunities.publish',
      'opportunities.delete',
      'academy.read',
      'academy.create',
      'academy.update',
      'academy.delete',
      'services.read',
      'services.create',
      'services.update',
      'services.delete',
      'community.read',
      'community.create',
      'community.update',
      'community.delete',
      'verification.review',
      'support.read',
      'support.reply',
      'analytics.read',
      'settings.update',
      'audit.read',
    ],
  },
  super_admin: {
    id: 'super_admin',
    label: 'Super Admin',
    badgeLabel: 'Super Administrator',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dashboardPath: '/dashboard/super-admin',
    dashboardTitle: 'Super Admin Operations Center',
    description: 'Manages operational content, talent directories, and cross-functional staff activity without owner privilege.',
    permissions: [
      'users.read',
      'users.create',
      'users.update',
      'roles.read',
      'branding.read',
      'opportunities.read',
      'opportunities.create',
      'opportunities.update',
      'opportunities.publish',
      'opportunities.delete',
      'academy.read',
      'academy.create',
      'academy.update',
      'academy.delete',
      'services.read',
      'services.create',
      'services.update',
      'services.delete',
      'community.read',
      'community.create',
      'community.update',
      'community.delete',
      'verification.review',
      'support.read',
      'support.reply',
      'analytics.read',
      'settings.update',
      'audit.read',
    ],
  },
  opportunities_manager: {
    id: 'opportunities_manager',
    label: 'Opportunities Manager',
    badgeLabel: 'Opportunities Lead',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    dashboardPath: '/dashboard/opportunities',
    dashboardTitle: 'Opportunities Directory Management',
    description: 'Creates, edits, publishes, archives, and organizes scholarships, grants, jobs, internships, and fellowships.',
    permissions: [
      'opportunities.read',
      'opportunities.create',
      'opportunities.update',
      'opportunities.publish',
      'opportunities.delete',
      'verification.review',
      'analytics.read',
    ],
  },
  academy_manager: {
    id: 'academy_manager',
    label: 'Academy Manager',
    badgeLabel: 'Tech Academy Director',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    dashboardPath: '/dashboard/academy',
    dashboardTitle: 'Academy & Learning Cohorts Hub',
    description: 'Oversees tech courses, learning pathways, workshops, lessons, syllabus materials, and student cohorts.',
    permissions: [
      'academy.read',
      'academy.create',
      'academy.update',
      'academy.delete',
      'community.read',
      'analytics.read',
    ],
  },
  support_services_manager: {
    id: 'support_services_manager',
    label: 'Support Services Manager',
    badgeLabel: 'Services & SME Lead',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    dashboardPath: '/dashboard/services',
    dashboardTitle: 'Career Support Services & SME Catalog',
    description: 'Manages CV reviews, LinkedIn optimization, portfolio clinics, SME consulting packages, delivery SLAs, and pricing.',
    permissions: [
      'services.read',
      'services.create',
      'services.update',
      'services.delete',
      'support.read',
      'support.reply',
      'analytics.read',
    ],
  },
  community_manager: {
    id: 'community_manager',
    label: 'Community Manager',
    badgeLabel: 'Ecosystem & Community',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    dashboardPath: '/dashboard/community',
    dashboardTitle: 'Community & Ecosystem Relations',
    description: 'Manages community communication links, WhatsApp groups, live masterclasses, testimonials, mentors, and partner programs.',
    permissions: [
      'community.read',
      'community.create',
      'community.update',
      'community.delete',
      'analytics.read',
    ],
  },
  content_editor: {
    id: 'content_editor',
    label: 'Content Editor',
    badgeLabel: 'Editorial & Copy',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
    dashboardPath: '/dashboard/content',
    dashboardTitle: 'Content & Editorial Studio',
    description: 'Edits approved public marketing copy, announcements, team member profiles, FAQs, and informational pages.',
    permissions: [
      'branding.read',
      'opportunities.read',
      'services.read',
      'community.read',
      'settings.update',
    ],
  },
  reviewer: {
    id: 'reviewer',
    label: 'Reviewer & Verifier',
    badgeLabel: 'Opportunity Verifier',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    dashboardPath: '/dashboard/reviewer',
    dashboardTitle: 'Opportunity Verification & Moderation Desk',
    description: 'Reviews incoming opportunity submissions, validates official source links, adds verification flags, and approves listings.',
    permissions: [
      'opportunities.read',
      'verification.review',
      'opportunities.update',
    ],
  },
  support_agent: {
    id: 'support_agent',
    label: 'Support Agent',
    badgeLabel: 'Help Desk Agent',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    dashboardPath: '/dashboard/support',
    dashboardTitle: 'User Inquiries & Help Desk',
    description: 'Handles incoming user questions, ticket triage, and applicant support inquiries under strict privacy controls.',
    permissions: [
      'support.read',
      'support.reply',
    ],
  },
  analyst: {
    id: 'analyst',
    label: 'Analyst / Viewer',
    badgeLabel: 'Analytics & Reporting',
    badgeColor: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    dashboardPath: '/dashboard/analytics',
    dashboardTitle: 'Platform Analytics & Operational Insights',
    description: 'Read-only access to aggregated platform performance metrics, opportunity reach, and cohort enrollment statistics.',
    permissions: [
      'analytics.read',
      'opportunities.read',
      'academy.read',
      'services.read',
      'community.read',
    ],
  },
  user: {
    id: 'user',
    label: 'Community Member',
    badgeLabel: 'Member',
    badgeColor: 'bg-gray-500/20 text-gray-300 border-gray-500/40',
    dashboardPath: '/',
    dashboardTitle: 'Public Portal',
    description: 'Standard community user with access to public opportunity search and self-service account management.',
    permissions: [],
  },
};

/**
 * Normalizes input role string to canonical StaffRole.
 * Supports backward-compatible strings and legacy database formats.
 */
export function normalizeRole(rawRole?: string | null): StaffRole {
  if (!rawRole) return 'user';
  const clean = rawRole.toLowerCase().trim().replace(/[\s-]+/g, '_');

  switch (clean) {
    case 'owner':
    case 'platform_owner':
      return 'owner';

    case 'super_admin':
    case 'superadmin':
    case 'lead_administrator':
    case 'administrator':
      return 'super_admin';

    case 'opportunities_manager':
    case 'opportunity_manager':
    case 'opportunities_lead':
      return 'opportunities_manager';

    case 'academy_manager':
    case 'academy_director':
    case 'instructor':
    case 'teaching_assistant':
      return 'academy_manager';

    case 'support_services_manager':
    case 'services_manager':
    case 'support_manager':
      return 'support_services_manager';

    case 'community_manager':
    case 'ecosystem_manager':
      return 'community_manager';

    case 'content_editor':
    case 'content_manager':
    case 'editor':
      return 'content_editor';

    case 'reviewer':
    case 'verifier':
    case 'verification_officer':
      return 'reviewer';

    case 'support_agent':
    case 'helpdesk_agent':
    case 'customer_support':
      return 'support_agent';

    case 'analyst':
    case 'viewer':
    case 'data_analyst':
      return 'analyst';

    case 'user':
    case 'member':
    case 'student':
    case 'graduate':
    case 'freelancer':
    case 'ambassador':
      return 'user';

    default:
      return 'user';
  }
}

/**
 * Central authorization helper.
 * Determines if a role possesses the requested permission.
 */
export function hasPermission(roleOrUser: StaffRole | { role?: string } | null | undefined, permission: Permission): boolean {
  if (!roleOrUser) return false;
  const roleString = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser.role;
  const canonicalRole = normalizeRole(roleString);
  const def = ROLE_DEFINITIONS[canonicalRole];
  if (!def) return false;
  return def.permissions.includes(permission);
}

/**
 * Check if a role has access to any staff dashboard.
 */
export function isStaffRole(roleOrUser: StaffRole | { role?: string } | null | undefined): boolean {
  if (!roleOrUser) return false;
  const roleString = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser.role;
  const canonicalRole = normalizeRole(roleString);
  return canonicalRole !== 'user';
}

/**
 * Returns the designated dedicated dashboard URL for a role.
 */
export function getRoleDashboardPath(roleOrUser: StaffRole | { role?: string } | null | undefined): string {
  const roleString = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser?.role;
  const canonicalRole = normalizeRole(roleString);
  return ROLE_DEFINITIONS[canonicalRole]?.dashboardPath || '/';
}

/**
 * Checks if a role is authorized to view a specific dashboard path.
 */
export function canAccessDashboard(roleOrUser: StaffRole | { role?: string } | null | undefined, path: string): boolean {
  if (!roleOrUser) return false;
  const roleString = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser.role;
  const role = normalizeRole(roleString);

  if (role === 'user') return false;
  if (role === 'owner') return true; // Owner can inspect any dashboard

  const cleanPath = path.toLowerCase().replace(/\/$/, '');

  // Route specific authorization
  if (cleanPath === '/dashboard/owner') return (role as string) === 'owner';
  if (cleanPath === '/dashboard/super-admin') return role === 'super_admin';
  if (cleanPath === '/dashboard/opportunities') {
    return hasPermission(role, 'opportunities.read');
  }
  if (cleanPath === '/dashboard/academy') {
    return hasPermission(role, 'academy.read');
  }
  if (cleanPath === '/dashboard/services') {
    return hasPermission(role, 'services.read');
  }
  if (cleanPath === '/dashboard/community') {
    return hasPermission(role, 'community.read');
  }
  if (cleanPath === '/dashboard/content') {
    return hasPermission(role, 'branding.read') || hasPermission(role, 'settings.update');
  }
  if (cleanPath === '/dashboard/reviewer') {
    return hasPermission(role, 'verification.review');
  }
  if (cleanPath === '/dashboard/support') {
    return hasPermission(role, 'support.read');
  }
  if (cleanPath === '/dashboard/analytics') {
    return hasPermission(role, 'analytics.read');
  }

  // Legacy /admin routes
  if (cleanPath === '/admin' || cleanPath === '/admin/overview') {
    return isStaffRole(role);
  }
  if (cleanPath === '/admin/users') return hasPermission(role, 'users.read');
  if (cleanPath === '/admin/opportunities') return hasPermission(role, 'opportunities.read');
  if (cleanPath === '/admin/academy') return hasPermission(role, 'academy.read');
  if (cleanPath === '/admin/workshops') return hasPermission(role, 'community.read') || hasPermission(role, 'academy.read');
  if (cleanPath === '/admin/inbox') return hasPermission(role, 'support.read');
  if (cleanPath === '/admin/cms') return hasPermission(role, 'branding.update') || hasPermission(role, 'settings.update');
  if (cleanPath === '/admin/subscribers') return hasPermission(role, 'community.read');
  if (cleanPath === '/admin/audit') return hasPermission(role, 'audit.read');

  return false;
}

/**
 * Returns permissible tabs for the AdminLayout navigation.
 */
export function getPermittedTabs(roleOrUser: StaffRole | { role?: string } | null | undefined): string[] {
  const roleString = typeof roleOrUser === 'string' ? roleOrUser : roleOrUser?.role;
  const role = normalizeRole(roleString);

  if (role === 'user') return [];
  if (role === 'owner') {
    return ['overview', 'opportunities', 'academy', 'users', 'workshops', 'inbox', 'cms', 'subscribers', 'audit'];
  }
  if (role === 'super_admin') {
    return ['overview', 'opportunities', 'academy', 'users', 'workshops', 'inbox', 'cms', 'subscribers', 'audit'];
  }
  if (role === 'opportunities_manager') {
    return ['overview', 'opportunities'];
  }
  if (role === 'academy_manager') {
    return ['overview', 'academy', 'workshops'];
  }
  if (role === 'support_services_manager') {
    return ['overview', 'cms', 'inbox'];
  }
  if (role === 'community_manager') {
    return ['overview', 'workshops', 'subscribers'];
  }
  if (role === 'content_editor') {
    return ['overview', 'cms'];
  }
  if (role === 'reviewer') {
    return ['overview', 'opportunities'];
  }
  if (role === 'support_agent') {
    return ['overview', 'inbox'];
  }
  if (role === 'analyst') {
    return ['overview'];
  }

  return ['overview'];
}
