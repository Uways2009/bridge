import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ManagedUser, PlatformRole, UserAccountStatus } from '../../types';
import {
  Search,
  Filter,
  Download,
  UserPlus,
  RefreshCw,
  Key,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  X,
  Mail,
  Calendar,
  UserCheck,
  UserX,
  Copy,
  Check,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Clock,
  Send,
  Sparkles,
} from 'lucide-react';

export const ROLE_DEFINITIONS: Partial<Record<
  PlatformRole,
  { label: string; badgeColor: string; description: string; tier: string }
>> = {
  owner: {
    label: 'Platform Owner',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    description: 'Supreme executive authority across the entire platform, infrastructure, and governance.',
    tier: 'Executive Governance',
  },
  super_admin: {
    label: 'Super Admin',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-200',
    description: 'Full access to user administration, CMS, security settings, and data exports.',
    tier: 'Full System Control',
  },
  content_manager: {
    label: 'Content Manager',
    badgeColor: 'bg-blue-100 text-blue-900 border-blue-200',
    description: 'Publish and manage opportunities, events, articles, and public site copy.',
    tier: 'Editorial & Content',
  },
  verification_officer: {
    label: 'Verification Officer',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    description: 'Verify and approve employer opportunities, credentials, and partner listings.',
    tier: 'Compliance & Verification',
  },
  community_manager: {
    label: 'Community Manager',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    description: 'Coordinate workshops, manage attendees, and broadcast community alerts.',
    tier: 'Community & Events',
  },
  support_manager: {
    label: 'Support Manager',
    badgeColor: 'bg-teal-100 text-teal-900 border-teal-200',
    description: 'Handle incoming inquiries, resolve user assistance tickets, and draft replies.',
    tier: 'Support & Helpdesk',
  },
  academy_manager: {
    label: 'Academy Manager',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    description: 'Oversee Tech Academy cohorts, approve courses, and manage instructor appointments.',
    tier: 'Academy Leadership',
  },
  instructor: {
    label: 'Course Instructor',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-200',
    description: 'Teach cohorts, manage modules, host live sessions, and grade student submissions.',
    tier: 'Academic Faculty',
  },
  teaching_assistant: {
    label: 'Teaching Assistant',
    badgeColor: 'bg-cyan-100 text-cyan-900 border-cyan-200',
    description: 'Take student attendance, assist with assignments, and support instructors.',
    tier: 'Academic Faculty',
  },
  student: {
    label: 'Enrolled Student',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    description: 'Enrolled learner accessing coursework, assignments, and certificates.',
    tier: 'Academy Learner',
  },
  member: {
    label: 'Platform Member',
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
    description: 'Standard authenticated member with access to save opportunities and apply.',
    tier: 'Standard User',
  },
};

export const AdminUsers: React.FC = () => {
  const {
    currentAdmin,
    managedUsers,
    isLoadingUsers,
    loadManagedUsers,
    createManagedUser,
    updateManagedUserRole,
    updateManagedUserStatus,
    sendUserPasswordReset,
    deleteManagedUser,
    exportUsersCSV,
  } = useAdmin();

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingRoleUser, setEditingRoleUser] = useState<ManagedUser | null>(null);
  const [newSelectedRole, setNewSelectedRole] = useState<PlatformRole>('member');
  const [deletingUser, setDeletingUser] = useState<ManagedUser | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [statusConfirmUser, setStatusConfirmUser] = useState<ManagedUser | null>(null);

  // Form states for user creation
  const [createEmail, setCreateEmail] = useState('');
  const [createDisplayName, setCreateDisplayName] = useState('');
  const [createRole, setCreateRole] = useState<PlatformRole>('member');
  const [creationMethod, setCreationMethod] = useState<'invite' | 'password'>('password');
  const [initialPassword, setInitialPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  // Status feedback notification
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(
    null
  );

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotice({ type, message });
    setTimeout(() => {
      setNotice(null);
    }, 6000);
  };

  // Initial load
  useEffect(() => {
    loadManagedUsers();
  }, []);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return managedUsers.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        u.displayName?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q);

      const matchesRole = selectedRoleFilter === 'All' || u.role === selectedRoleFilter;
      const matchesStatus =
        selectedStatusFilter === 'All' || u.accountStatus === selectedStatusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [managedUsers, searchQuery, selectedRoleFilter, selectedStatusFilter]);

  // Statistics
  const totalUsersCount = managedUsers.length;
  const superAdminCount = managedUsers.filter((u) => u.role === 'super_admin').length;
  const staffCount = managedUsers.filter((u) => u.role !== 'member').length;
  const activeCount = managedUsers.filter((u) => u.accountStatus === 'active').length;
  const disabledCount = managedUsers.filter((u) => u.accountStatus === 'disabled').length;

  // Check current admin permissions
  const isSuperAdmin =
    currentAdmin?.role === 'Super Admin' ||
    managedUsers.some((u) => u.email === currentAdmin?.email && u.role === 'super_admin');

  // Password Generator
  const generateStrongPassword = () => {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lowercase = 'abcdefghijkmnopqrstuvwxyz';
    const numbers = '23456789';
    const symbols = '!@#$%^&*()_+-=';
    const all = uppercase + lowercase + numbers + symbols;

    let pwd = '';
    pwd += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    pwd += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    pwd += numbers.charAt(Math.floor(Math.random() * numbers.length));
    pwd += symbols.charAt(Math.floor(Math.random() * symbols.length));

    for (let i = 4; i < 14; i++) {
      pwd += all.charAt(Math.floor(Math.random() * all.length));
    }
    // Shuffle
    const shuffled = pwd
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
    setInitialPassword(shuffled);
    setShowPassword(true);
  };

  const handleCopyPassword = () => {
    if (!initialPassword) return;
    navigator.clipboard.writeText(initialPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  // Password strength assessment
  const passwordStrength = useMemo(() => {
    if (!initialPassword) return { score: 0, text: 'Empty', color: 'bg-stone-200' };
    let score = 0;
    if (initialPassword.length >= 8) score++;
    if (initialPassword.length >= 12) score++;
    if (/[A-Z]/.test(initialPassword)) score++;
    if (/[a-z]/.test(initialPassword)) score++;
    if (/[0-9]/.test(initialPassword)) score++;
    if (/[^A-Za-z0-9]/.test(initialPassword)) score++;

    if (score <= 2) return { score: 1, text: 'Weak', color: 'bg-red-500' };
    if (score <= 4) return { score: 2, text: 'Moderate', color: 'bg-amber-500' };
    return { score: 3, text: 'Strong', color: 'bg-[#087F5B]' };
  }, [initialPassword]);

  // Create User Handler
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim()) {
      showNotification('error', 'Email address is required.');
      return;
    }
    if (creationMethod === 'password') {
      if (!initialPassword || initialPassword.length < 8) {
        showNotification('error', 'Password must be at least 8 characters long.');
        return;
      }
    }

    setIsSubmitting(true);
    const result = await createManagedUser({
      email: createEmail.trim(),
      displayName: createDisplayName.trim(),
      role: createRole,
      creationMethod,
      initialPassword: creationMethod === 'password' ? initialPassword : undefined,
    });
    setIsSubmitting(false);

    if (result.success) {
      showNotification(
        'success',
        `User account ${createEmail} created successfully as ${ROLE_DEFINITIONS[createRole].label}.`
      );
      setIsCreateModalOpen(false);
      setCreateEmail('');
      setCreateDisplayName('');
      setCreateRole('member');
      setInitialPassword('');
    } else {
      showNotification('error', result.message || 'Failed to create user account.');
    }
  };

  // Edit Role Handler
  const handleSaveRole = async () => {
    if (!editingRoleUser) return;
    const isOwnerTarget =
      editingRoleUser.email.toLowerCase() === 'abuunaysah74@gmail.com' ||
      editingRoleUser.role === 'owner';
    if (isOwnerTarget) {
      showNotification(
        'error',
        'Security constraint: The Platform Owner role is protected and cannot be modified.'
      );
      return;
    }
    if (editingRoleUser.role === 'super_admin' && newSelectedRole !== 'super_admin') {
      if (superAdminCount <= 1) {
        showNotification(
          'error',
          'Operation prohibited: You cannot demote the final Super Administrator of the platform.'
        );
        return;
      }
    }

    setIsSubmitting(true);
    const result = await updateManagedUserRole(editingRoleUser.uid, newSelectedRole);
    setIsSubmitting(false);

    if (result.success) {
      showNotification(
        'success',
        `Updated role for ${editingRoleUser.email} to ${ROLE_DEFINITIONS[newSelectedRole].label}.`
      );
      setEditingRoleUser(null);
    } else {
      showNotification('error', result.message || 'Failed to update user role.');
    }
  };

  // Toggle Status Handler
  const handleToggleStatus = async (user: ManagedUser) => {
    const isOwnerTarget =
      user.email.toLowerCase() === 'abuunaysah74@gmail.com' ||
      user.role === 'owner';
    if (isOwnerTarget) {
      showNotification('error', 'Security constraint: The Platform Owner account cannot be disabled.');
      return;
    }

    const targetStatus: UserAccountStatus =
      user.accountStatus === 'active' ? 'disabled' : 'active';

    // Guard: Prevent disabling own account
    if (currentAdmin?.email === user.email && targetStatus === 'disabled') {
      showNotification('error', 'Security constraint: You cannot disable your own active account.');
      return;
    }

    // Guard: Prevent disabling last super admin
    if (user.role === 'super_admin' && targetStatus === 'disabled' && superAdminCount <= 1) {
      showNotification(
        'error',
        'Security constraint: Cannot disable the final active Super Administrator.'
      );
      return;
    }

    setIsSubmitting(true);
    const result = await updateManagedUserStatus(user.uid, targetStatus);
    setIsSubmitting(false);

    if (result.success) {
      showNotification(
        'success',
        `Account for ${user.email} is now ${targetStatus === 'active' ? 'Reactivated' : 'Disabled'}.`
      );
      setStatusConfirmUser(null);
    } else {
      showNotification('error', result.message || 'Failed to update account status.');
    }
  };

  // Send Password Reset
  const handleSendPasswordReset = async (user: ManagedUser) => {
    setIsSubmitting(true);
    const result = await sendUserPasswordReset(user.uid);
    setIsSubmitting(false);

    if (result.success) {
      showNotification(
        'success',
        `Password reset instructions dispatched to ${user.email}.`
      );
    } else {
      showNotification('error', result.message || 'Failed to dispatch password reset.');
    }
  };

  // Delete User Handler
  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    // Strict validation
    if (
      deleteConfirmationText.trim().toLowerCase() !== deletingUser.email.toLowerCase() &&
      deleteConfirmationText.trim().toUpperCase() !== 'CONFIRM DELETE'
    ) {
      showNotification(
        'error',
        `Please type either "${deletingUser.email}" or "CONFIRM DELETE" to verify.`
      );
      return;
    }

    // Safeguards
    const isOwnerTarget =
      deletingUser.email.toLowerCase() === 'abuunaysah74@gmail.com' ||
      deletingUser.role === 'owner';
    if (isOwnerTarget) {
      showNotification('error', 'Security constraint: The Platform Owner account cannot be deleted.');
      return;
    }
    if (currentAdmin?.email === deletingUser.email) {
      showNotification('error', 'Security constraint: You cannot delete your own account.');
      return;
    }
    if (deletingUser.role === 'super_admin' && superAdminCount <= 1) {
      showNotification(
        'error',
        'Security constraint: You cannot delete the final Super Administrator.'
      );
      return;
    }

    setIsSubmitting(true);
    const result = await deleteManagedUser(deletingUser.uid, deleteConfirmationText);
    setIsSubmitting(false);

    if (result.success) {
      showNotification('success', `User account ${deletingUser.email} was permanently deleted.`);
      setDeletingUser(null);
      setDeleteConfirmationText('');
    } else {
      showNotification('error', result.message || 'Failed to delete user account.');
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Never';
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return 'Never';
      return d.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div id="admin-user-management-section" className="space-y-6">
      {/* Toast Alert Banner */}
      {notice && (
        <div
          id="admin-user-notice"
          className={`p-4 rounded-2xl border flex items-start justify-between gap-3 text-xs transition-all shadow-xs ${
            notice.type === 'success'
              ? 'bg-[#087F5B]/10 border-[#087F5B]/30 text-[#087F5B]'
              : notice.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-blue-50 border-blue-200 text-blue-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === 'success' && <CheckCircle2 className="w-4 h-4 shrink-0" />}
            {notice.type === 'error' && <AlertTriangle className="w-4 h-4 shrink-0" />}
            {notice.type === 'info' && <ShieldCheck className="w-4 h-4 shrink-0" />}
            <span className="font-semibold">{notice.message}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="p-1 hover:opacity-75 transition-opacity"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold font-display text-[#0B1F33]">
              User & Account Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#087F5B]/10 text-[#087F5B] border border-[#087F5B]/20">
              RBAC Protected
            </span>
          </div>
          <p className="text-xs text-[#1F2933]/70 mt-1">
            Provision staff roles, manage authentication credentials, reset passwords, and audit account statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            id="refresh-users-button"
            onClick={() => loadManagedUsers()}
            disabled={isLoadingUsers}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E4E1D8] text-xs font-semibold text-[#0B1F33] hover:bg-[#EAE7DC] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh user directory"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#087F5B] ${isLoadingUsers ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            id="export-users-csv-button"
            onClick={exportUsersCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#E4E1D8] text-xs font-semibold text-[#0B1F33] hover:bg-[#EAE7DC] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#087F5B]" />
            <span>Export CSV</span>
          </button>

          <button
            id="create-user-modal-trigger"
            onClick={() => {
              setInitialPassword('');
              generateStrongPassword();
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>
      </div>

      {/* Quick Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-[#E4E1D8] shadow-xs">
          <span className="text-[11px] font-semibold text-[#1F2933]/60 uppercase tracking-wider block">
            Total Accounts
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-[#0B1F33]">
              {totalUsersCount}
            </span>
            <span className="text-[11px] text-[#087F5B] font-medium">Registered</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E4E1D8] shadow-xs">
          <span className="text-[11px] font-semibold text-[#1F2933]/60 uppercase tracking-wider block">
            Super Administrators
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-purple-900">
              {superAdminCount}
            </span>
            <span className="text-[11px] text-purple-700 font-medium">Full Authority</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E4E1D8] shadow-xs">
          <span className="text-[11px] font-semibold text-[#1F2933]/60 uppercase tracking-wider block">
            Operational Staff
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-[#0B1F33]">
              {staffCount}
            </span>
            <span className="text-[11px] text-blue-700 font-medium">Roles Assigned</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#E4E1D8] shadow-xs">
          <span className="text-[11px] font-semibold text-[#1F2933]/60 uppercase tracking-wider block">
            Account Status
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-display text-[#087F5B]">
              {activeCount}
            </span>
            <span className="text-[11px] text-[#1F2933]/60">
              active • {disabledCount} disabled
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-3.5 bg-white border border-[#E4E1D8] rounded-2xl shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#1F2933]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="search-users-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search accounts by name, email address, or UID..."
            className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl pl-9 pr-8 py-2 text-xs text-[#0B1F33] placeholder:text-[#1F2933]/40 focus:outline-none focus:border-[#087F5B]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#1F2933]/40 hover:text-[#1F2933]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role & Status Filters */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-1.5 text-xs text-[#1F2933] w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-[#1F2933]/50" />
            <span className="text-[#1F2933]/50">Role:</span>
            <select
              id="filter-role-select"
              value={selectedRoleFilter}
              onChange={(e) => setSelectedRoleFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold"
            >
              <option value="All">All Roles ({managedUsers.length})</option>
              <option value="super_admin">Super Admin</option>
              <option value="content_manager">Content Manager</option>
              <option value="verification_officer">Verification Officer</option>
              <option value="community_manager">Community Manager</option>
              <option value="support_manager">Support Manager</option>
              <option value="member">Platform Member</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-1.5 text-xs text-[#1F2933] w-full sm:w-auto">
            <span className="text-[#1F2933]/50">Status:</span>
            <select
              id="filter-status-select"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="pending_activation">Pending Activation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-3xl border border-[#E4E1D8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F2] border-b border-[#E4E1D8] text-[#1F2933]/70 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">User Account</th>
                <th className="py-3.5 px-4">Assigned Role</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4">Last Activity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E1D8]">
              {isLoadingUsers && managedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs text-[#1F2933]/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 text-[#087F5B] animate-spin" />
                      <p className="font-semibold text-sm text-[#0B1F33]">
                        Loading registered user accounts...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-xs text-[#1F2933]/60">
                    <div className="max-w-sm mx-auto space-y-2">
                      <ShieldAlert className="w-8 h-8 text-[#1F2933]/40 mx-auto" />
                      <p className="font-bold text-base text-[#0B1F33]">
                        {managedUsers.length === 0
                          ? 'No user accounts found'
                          : 'No matching user accounts'}
                      </p>
                      <p className="text-xs text-[#1F2933]/60">
                        {managedUsers.length === 0
                          ? 'Create your first staff or member account using the "Create New User" button.'
                          : 'Try modifying your search term or clearing the role/status filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleMeta = ROLE_DEFINITIONS[user.role] || {
                    label: user.role,
                    badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
                    description: '',
                    tier: 'Custom',
                  };

                  const isCurrentUser = currentAdmin?.email === user.email;
                  const isLastSuperAdmin = user.role === 'super_admin' && superAdminCount <= 1;

                  return (
                    <tr
                      key={user.uid}
                      id={`user-row-${user.uid}`}
                      className="hover:bg-[#F8F7F2]/50 transition-colors"
                    >
                      {/* User Account Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-[#0B1F33] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                            {(user.displayName || user.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#0B1F33] text-sm">
                                {user.displayName || 'No Name Provided'}
                              </span>
                              {isCurrentUser && (
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#087F5B] text-white">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#1F2933]/70 font-mono">{user.email}</p>
                            <span className="text-[10px] text-[#1F2933]/40">UID: {user.uid}</span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border ${roleMeta.badgeColor}`}
                          title={roleMeta.description}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{roleMeta.label}</span>
                        </span>
                      </td>

                      {/* Account Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {user.accountStatus === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#087F5B]/10 text-[#087F5B] border border-[#087F5B]/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#087F5B]" />
                            Active
                          </span>
                        ) : user.accountStatus === 'disabled' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                            Disabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                            Pending Activation
                          </span>
                        )}
                      </td>

                      {/* Creation Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#1F2933]/70 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#087F5B]" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      {/* Last Activity */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-[#1F2933]/70 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#1F2933]/40" />
                          <span>{formatDate(user.lastLoginAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send Password Reset Email */}
                          <button
                            onClick={() => handleSendPasswordReset(user)}
                            className="p-1.5 rounded-xl bg-white border border-[#E4E1D8] hover:bg-stone-100 text-[#1F2933] transition-colors cursor-pointer"
                            title="Dispatch password-reset email"
                          >
                            <Key className="w-3.5 h-3.5 text-blue-600" />
                          </button>

                          {/* Edit Role Button */}
                          <button
                            onClick={() => {
                              setEditingRoleUser(user);
                              setNewSelectedRole(user.role);
                            }}
                            className="p-1.5 rounded-xl bg-white border border-[#E4E1D8] hover:bg-stone-100 text-[#1F2933] transition-colors cursor-pointer"
                            title="Edit assigned role"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                          </button>

                          {/* Toggle Active / Disabled */}
                          {user.accountStatus === 'active' ? (
                            <button
                              onClick={() => setStatusConfirmUser(user)}
                              disabled={isCurrentUser || isLastSuperAdmin}
                              className={`p-1.5 rounded-xl bg-white border border-[#E4E1D8] transition-colors cursor-pointer ${
                                isCurrentUser || isLastSuperAdmin
                                  ? 'opacity-30 cursor-not-allowed text-stone-400'
                                  : 'hover:bg-amber-50 text-amber-700 hover:border-amber-200'
                              }`}
                              title={
                                isCurrentUser
                                  ? 'Cannot disable your own account'
                                  : isLastSuperAdmin
                                  ? 'Cannot disable the final Super Administrator'
                                  : 'Disable account'
                              }
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className="p-1.5 rounded-xl bg-white border border-[#E4E1D8] hover:bg-[#087F5B]/10 text-[#087F5B] hover:border-[#087F5B]/30 transition-colors cursor-pointer"
                              title="Reactivate account"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete Account Button */}
                          <button
                            onClick={() => {
                              setDeletingUser(user);
                              setDeleteConfirmationText('');
                            }}
                            disabled={isCurrentUser || isLastSuperAdmin}
                            className={`p-1.5 rounded-xl bg-white border border-[#E4E1D8] transition-colors cursor-pointer ${
                              isCurrentUser || isLastSuperAdmin
                                ? 'opacity-30 cursor-not-allowed text-stone-400'
                                : 'hover:bg-red-50 text-red-600 hover:border-red-200'
                            }`}
                            title={
                              isCurrentUser
                                ? 'Cannot delete your own account'
                                : isLastSuperAdmin
                                ? 'Cannot delete the final Super Administrator'
                                : 'Delete user account'
                            }
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

      {/* ========================================================= */}
      {/* MODAL 1: CREATE NEW USER ACCOUNT                          */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-[#E4E1D8] space-y-6 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-[#E4E1D8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-[#0B1F33]">
                    Create User Account
                  </h3>
                  <p className="text-xs text-[#1F2933]/60">
                    Provision a secure user with server-side authentication and approved permissions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-[#1F2933]/50 hover:bg-[#EAE7DC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              {/* Email */}
              <div>
                <label className="block font-bold text-[#0B1F33] mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="e.g. adewale@naijabridge.org"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              {/* Display Name */}
              <div>
                <label className="block font-bold text-[#0B1F33] mb-1">
                  Full Name / Display Name
                </label>
                <input
                  type="text"
                  value={createDisplayName}
                  onChange={(e) => setCreateDisplayName(e.target.value)}
                  placeholder="e.g. Adewale Bakare"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              {/* Platform Role Selection */}
              <div>
                <label className="block font-bold text-[#0B1F33] mb-1">
                  Assign Platform Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as PlatformRole)}
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B] font-semibold"
                >
                  <option value="super_admin">Super Admin (Full Administrative Authority)</option>
                  <option value="content_manager">Content Manager (Publish Opportunities & CMS)</option>
                  <option value="verification_officer">Verification Officer (Approve Listings)</option>
                  <option value="community_manager">Community Manager (Events & Broadcasts)</option>
                  <option value="support_manager">Support Manager (Helpdesk & Inquiries)</option>
                  <option value="member">Platform Member (Standard User Access)</option>
                </select>
                <p className="text-[11px] text-[#1F2933]/60 mt-1">
                  {ROLE_DEFINITIONS[createRole].description}
                </p>
              </div>

              {/* Creation Method Toggle */}
              <div>
                <label className="block font-bold text-[#0B1F33] mb-1.5">
                  Initial Credential Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreationMethod('password')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                      creationMethod === 'password'
                        ? 'border-[#087F5B] bg-[#087F5B]/10 text-[#087F5B] font-bold'
                        : 'border-[#E4E1D8] text-[#1F2933]/70 hover:bg-[#F8F7F2]'
                    }`}
                  >
                    <Key className="w-4 h-4" />
                    <span>Set Initial Password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreationMethod('invite')}
                    className={`p-2.5 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-colors ${
                      creationMethod === 'invite'
                        ? 'border-[#087F5B] bg-[#087F5B]/10 text-[#087F5B] font-bold'
                        : 'border-[#E4E1D8] text-[#1F2933]/70 hover:bg-[#F8F7F2]'
                    }`}
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Setup Invite</span>
                  </button>
                </div>
              </div>

              {/* Password Generator Block */}
              {creationMethod === 'password' && (
                <div className="p-3.5 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B1F33]">Initial Secure Password</span>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="text-[11px] font-bold text-[#087F5B] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Strong</span>
                    </button>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={initialPassword}
                      onChange={(e) => setInitialPassword(e.target.value)}
                      placeholder="Minimum 8 characters..."
                      className="w-full bg-white border border-[#E4E1D8] rounded-xl pl-3.5 pr-20 py-2 text-xs font-mono text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-[#1F2933]/50 hover:text-[#1F2933]"
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? (
                          <EyeOff className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="p-1 text-[#1F2933]/50 hover:text-[#087F5B]"
                        title="Copy password"
                      >
                        {copiedPassword ? (
                          <Check className="w-3.5 h-3.5 text-[#087F5B]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength Indicator */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[#1F2933]/60">Strength</span>
                      <span className="font-bold text-[#0B1F33]">{passwordStrength.text}</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${passwordStrength.color} transition-all`}
                        style={{
                          width: `${(passwordStrength.score / 3) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-[10px] text-[#1F2933]/60">
                    Security notice: For staff safety, please copy and share this temporary password securely. The account will require password update on first login.
                  </p>
                </div>
              )}

              {creationMethod === 'invite' && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs">
                  <p className="font-semibold">Automated Setup Invitation</p>
                  <p className="text-[11px] text-blue-800 mt-0.5">
                    An email invitation will be dispatched to <strong>{createEmail || 'the user'}</strong> containing a verified one-time link to configure their account password.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E1D8]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#1F2933]/70 hover:bg-[#EAE7DC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create User Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: EDIT USER ROLE                                   */}
      {/* ========================================================= */}
      {editingRoleUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-[#E4E1D8] space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-[#E4E1D8]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-[#0B1F33]">Edit User Role</h3>
                  <p className="text-xs text-[#1F2933]/60">{editingRoleUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingRoleUser(null)}
                className="p-1.5 rounded-xl text-[#1F2933]/50 hover:bg-[#EAE7DC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-[#0B1F33]">Select Approved Platform Role</label>
              {(Object.keys(ROLE_DEFINITIONS) as PlatformRole[]).map((roleKey) => {
                const meta = ROLE_DEFINITIONS[roleKey];
                const isSelected = newSelectedRole === roleKey;
                return (
                  <div
                    key={roleKey}
                    onClick={() => setNewSelectedRole(roleKey)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/50'
                        : 'border-[#E4E1D8] hover:bg-[#F8F7F2]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0B1F33]">{meta.label}</span>
                      <span className="text-[10px] uppercase font-bold text-[#1F2933]/50">
                        {meta.tier}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#1F2933]/60 mt-1">{meta.description}</p>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E1D8]">
              <button
                type="button"
                onClick={() => setEditingRoleUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#1F2933]/70 hover:bg-[#EAE7DC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Updating Role...' : 'Save Role Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: DISABLE ACCOUNT CONFIRMATION                     */}
      {/* ========================================================= */}
      {statusConfirmUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#E4E1D8] space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold font-display text-[#0B1F33]">
                Disable Account Access?
              </h3>
              <p className="text-xs text-[#1F2933]/70">
                Are you sure you want to disable account access for <strong>{statusConfirmUser.email}</strong>? The user will be blocked from logging into administrative tools or member portals until reactivated.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                onClick={() => setStatusConfirmUser(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#1F2933]/70 hover:bg-[#EAE7DC] cursor-pointer"
              >
                Keep Active
              </button>
              <button
                onClick={() => handleToggleStatus(statusConfirmUser)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer"
              >
                {isSubmitting ? 'Disabling...' : 'Confirm Disable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: DELETE ACCOUNT WITH STRICT CONFIRMATION          */}
      {/* ========================================================= */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-red-200 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold font-display text-[#0B1F33]">
                Confirm Permanent Account Deletion
              </h3>
              <p className="text-xs text-[#1F2933]/70">
                This will permanently delete the user account for <strong>{deletingUser.email}</strong>. This operation is irreversible and cannot be undone.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs space-y-2">
              <p className="text-[11px] font-semibold text-red-900">
                To confirm deletion, please type the user's email address below:
              </p>
              <p className="text-[11px] font-mono font-bold text-red-700 select-all">
                {deletingUser.email}
              </p>
              <input
                type="text"
                value={deleteConfirmationText}
                onChange={(e) => setDeleteConfirmationText(e.target.value)}
                placeholder="Type email address or CONFIRM DELETE"
                className="w-full bg-white border border-red-300 rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-red-600 font-mono"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setDeletingUser(null);
                  setDeleteConfirmationText('');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#1F2933]/70 hover:bg-[#EAE7DC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={
                  isSubmitting ||
                  (deleteConfirmationText.trim().toLowerCase() !==
                    deletingUser.email.toLowerCase() &&
                    deleteConfirmationText.trim().toUpperCase() !== 'CONFIRM DELETE')
                }
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Deleting Account...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
