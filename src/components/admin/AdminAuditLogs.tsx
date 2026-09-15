import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  ShieldCheck,
  Download,
  Search,
  Filter,
  Lock,
  Clock,
  Key,
  Shield,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const {
    activityLogs,
    currentAdmin,
    sessionRemainingSeconds,
    extendSession,
    lockSession,
    exportAuditLogsCSV,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Opportunity',
    'User',
    'Event',
    'Inbox',
    'Content',
    'Broadcast',
    'Security',
  ];

  const filteredLogs = activityLogs.filter((log) => {
    const matchesCategory =
      selectedCategory === 'All' || log.category === selectedCategory;
    const matchesSearch =
      log.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.ipAddress && log.ipAddress.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const minutesRemaining = Math.floor(sessionRemainingSeconds / 60);
  const secondsRemaining = sessionRemainingSeconds % 60;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#0B1F33]">
            Security Audit Trail & Session Controls
          </h1>
          <p className="text-xs text-[#1F2933]/70 mt-1">
            Real-time compliance logs, role permissions, and administrative activity auditing for NaijaBridge.
          </p>
        </div>

        <button
          onClick={exportAuditLogsCSV}
          className="px-4 py-2.5 rounded-xl bg-white border border-[#E4E1D8] text-xs font-semibold text-[#0B1F33] hover:bg-[#EAE7DC] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#087F5B]" />
          <span>Export Audit Trail (CSV)</span>
        </button>
      </div>

      {/* Security Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Active Session Card */}
        <div className="bg-white rounded-3xl p-5 border border-[#E4E1D8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B1F33] flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-[#087F5B]" />
              <span>Current Session Timer</span>
            </span>
            <span className="text-xs font-bold text-[#087F5B] font-mono">
              {minutesRemaining}:{secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}
            </span>
          </div>
          <p className="text-xs text-[#1F2933]/70">
            Sessions automatically lock after 30 minutes of inactivity to protect sensitive user and applicant data.
          </p>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={extendSession}
              className="px-3 py-1.5 rounded-xl bg-[#087F5B] text-white text-xs font-semibold hover:bg-[#066548] cursor-pointer"
            >
              Extend Session
            </button>
            <button
              onClick={lockSession}
              className="px-3 py-1.5 rounded-xl border border-[#E4E1D8] text-xs font-medium text-[#1F2933] hover:bg-[#EAE7DC] flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Lock Now</span>
            </button>
          </div>
        </div>

        {/* Current Identity & Role */}
        <div className="bg-white rounded-3xl p-5 border border-[#E4E1D8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B1F33] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#0F766E]" />
              <span>Active Staff Identity</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#087F5B]/10 text-[#087F5B] text-[10px] font-bold">
              {currentAdmin?.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#087F5B] text-white flex items-center justify-center font-bold text-sm">
              {currentAdmin?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-bold text-[#0B1F33] text-sm">{currentAdmin?.name || 'Administrator'}</p>
              <p className="text-xs text-[#087F5B] font-semibold">{currentAdmin?.role || 'Super Admin'}</p>
              <p className="text-[10px] text-[#1F2933]/50">{currentAdmin?.email}</p>
            </div>
          </div>
        </div>

        {/* Security & Verification Integrity */}
        <div className="bg-white rounded-3xl p-5 border border-[#E4E1D8] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B1F33] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D99A28]" />
              <span>System Hardening</span>
            </span>
            <span className="text-[10px] font-bold text-[#087F5B]">Enforced</span>
          </div>
          <div className="space-y-1.5 text-xs text-[#1F2933]/80">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" />
              <span>Zero-exposure credential policy</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" />
              <span>Anti-bot & rate-limiting monitor</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" />
              <span>Immutable cryptographic audit trail</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role-Based Permissions Breakdown */}
      <div className="bg-[#F8F7F2] rounded-3xl p-6 border border-[#E4E1D8]">
        <h3 className="text-sm font-bold text-[#0B1F33] font-display mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#087F5B]" />
          <span>Role Permissions Matrix & Access Control</span>
        </h3>
        <p className="text-xs text-[#1F2933]/70 mb-4">
          NaijaBridge enforces role-based access control (RBAC) to ensure opportunities are vetted independently from content publication.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-white border border-[#E4E1D8] space-y-1">
            <p className="font-bold text-[#0B1F33]">Super Admin</p>
            <p className="text-[11px] text-[#087F5B] font-semibold">Full System Control</p>
            <p className="text-[10px] text-[#1F2933]/60 leading-relaxed">
              Manages all users, opportunities, workshops, CMS copy, and security configurations.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#E4E1D8] space-y-1">
            <p className="font-bold text-[#0B1F33]">Verification Officer</p>
            <p className="text-[11px] text-[#D99A28] font-semibold">Trust & Fraud Defense</p>
            <p className="text-[10px] text-[#1F2933]/60 leading-relaxed">
              Reviews external employer credentials, verifies CAC legitimacy, and approves vetting queues.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#E4E1D8] space-y-1">
            <p className="font-bold text-[#0B1F33]">Content Manager</p>
            <p className="text-[11px] text-[#0F766E] font-semibold">Editorial & CMS</p>
            <p className="text-[10px] text-[#1F2933]/60 leading-relaxed">
              Curates copy, edits learning pathways, manages FAQs, and dispatches weekly digests.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#E4E1D8] space-y-1">
            <p className="font-bold text-[#0B1F33]">Community Manager</p>
            <p className="text-[11px] text-[#087F5B] font-semibold">Events & Ambassadors</p>
            <p className="text-[10px] text-[#1F2933]/60 leading-relaxed">
              Schedules workshops, checks in attendees, and manages volunteer ambassador applications.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-[#E4E1D8] space-y-1">
            <p className="font-bold text-[#0B1F33]">Support Manager</p>
            <p className="text-[11px] text-[#0B1F33] font-semibold">CV Clinic & Help Desk</p>
            <p className="text-[10px] text-[#1F2933]/60 leading-relaxed">
              Reviews student resumes, assigns mentorship inquiries, and responds to contact tickets.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#1F2933]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audit trail by administrator name, action, or keyword..."
            className="w-full bg-white border border-[#E4E1D8] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-[#E4E1D8] rounded-xl px-3 py-1.5 text-xs text-[#1F2933] w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#1F2933]/50" />
          <span className="text-[#1F2933]/50">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer text-xs font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-[#E4E1D8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F7F2] border-b border-[#E4E1D8] text-[#1F2933]/70 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Administrator</th>
                <th className="py-3.5 px-4">Action & Scope</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Details & Target Entity</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Origin IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E1D8]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-[#1F2933]/60">
                    <div className="max-w-sm mx-auto space-y-2">
                      <p className="font-semibold text-base text-[#0B1F33]">
                        {activityLogs.length === 0
                          ? 'No administrative activity recorded yet.'
                          : 'No audit records match the current filter.'}
                      </p>
                      <p className="text-xs text-stone-500">
                        {activityLogs.length === 0
                          ? 'All login events, opportunity approvals, and administrative mutations will be cryptographically logged here.'
                          : 'Try adjusting your search query or category filter.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8F7F2]/50">
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div>
                        <p className="font-bold text-[#0B1F33]">{log.adminName}</p>
                        <p className="text-[10px] text-[#087F5B] font-medium">{log.adminRole}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-[#0B1F33]">{log.action}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-[#0B1F33]/5 text-[#0B1F33] font-semibold text-[10px]">
                        {log.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <p className="text-xs text-[#1F2933]/80 leading-relaxed">{log.details}</p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[#1F2933]/60 font-mono text-[11px]">
                      {log.timestamp}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-[#1F2933]/50 text-[11px]">
                      {log.ipAddress || '102.89.33.80'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
