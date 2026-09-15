import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Users,
  Briefcase,
  Clock,
  Calendar,
  LifeBuoy,
  Mail,
  ShieldCheck,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Plus,
  Inbox,
  FileText,
} from 'lucide-react';

interface AdminOverviewProps {
  onNavigateTab: (tabId: string) => void;
  onOpenCreateOpportunity: () => void;
  onOpenCreateWorkshop: () => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  onNavigateTab,
  onOpenCreateOpportunity,
  onOpenCreateWorkshop,
}) => {
  const {
    currentAdmin,
    opportunities,
    workshops,
    inboxItems,
    subscribers,
    activityLogs,
    approveAndPublishOpportunity,
  } = useAdmin();

  // Real Database Metrics (No fake numbers or simulated additions)
  const publishedOpportunitiesCount = opportunities.filter((o) => o.status === 'Published').length;
  const pendingReviewsCount = opportunities.filter(
    (o) => o.status === 'Pending' || o.status === 'In Review' || !o.verified
  ).length;
  const upcomingEventsCount = workshops.filter((w) => w.status === 'Upcoming').length;
  const newInquiriesCount = inboxItems.filter((i) => i.status === 'New').length;
  const subscriberCount = subscribers.filter((s) => s.status === 'Subscribed').length;

  const pendingOpportunities = opportunities.filter(
    (o) => o.status === 'Pending' || o.status === 'In Review' || !o.verified
  );

  const statCards = [
    {
      id: 'stat-published',
      title: 'Published Opportunities',
      value: publishedOpportunitiesCount,
      subtitle: publishedOpportunitiesCount === 0 ? 'No listings live' : 'Active on directory',
      icon: <Briefcase className="w-5 h-5 text-[#087F5B]" />,
      bg: 'bg-[#087F5B]/10',
      border: 'border-[#087F5B]/20',
      tab: 'opportunities',
    },
    {
      id: 'stat-pending',
      title: 'Pending Vetting Queue',
      value: pendingReviewsCount,
      subtitle: pendingReviewsCount === 0 ? 'Queue is clear' : 'Awaiting review',
      icon: <Clock className="w-5 h-5 text-[#D99A28]" />,
      bg: 'bg-[#D99A28]/10',
      border: 'border-[#D99A28]/20',
      highlight: pendingReviewsCount > 0,
      tab: 'opportunities',
    },
    {
      id: 'stat-events',
      title: 'Upcoming Events',
      value: upcomingEventsCount,
      subtitle: upcomingEventsCount === 0 ? 'No events scheduled' : 'Scheduled sessions',
      icon: <Calendar className="w-5 h-5 text-[#0B1F33]" />,
      bg: 'bg-[#0B1F33]/10',
      border: 'border-[#0B1F33]/20',
      tab: 'workshops',
    },
    {
      id: 'stat-inbox',
      title: 'Inbound Submissions',
      value: newInquiriesCount,
      subtitle: newInquiriesCount === 0 ? 'No pending requests' : 'New messages to review',
      icon: <Inbox className="w-5 h-5 text-purple-600" />,
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      highlight: newInquiriesCount > 0,
      tab: 'inbox',
    },
    {
      id: 'stat-subscribers',
      title: 'Newsletter Subscribers',
      value: subscriberCount,
      subtitle: 'Real opted-in emails',
      icon: <Mail className="w-5 h-5 text-blue-600" />,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      tab: 'subscribers',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#087F5B]/10 text-[#087F5B]">
              {currentAdmin?.role || 'Administrator'}
            </span>
            <span className="text-xs text-stone-500">•</span>
            <span className="text-xs text-stone-500">Live Management Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#0B1F33]">
            Welcome back, {currentAdmin?.name || 'Admin'}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Real-time overview of verified opportunities, submissions, scheduled sessions, and security logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenCreateOpportunity}
            className="px-4 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Opportunity</span>
          </button>
          <button
            onClick={onOpenCreateWorkshop}
            className="px-4 py-2.5 rounded-xl bg-[#0B1F33] hover:bg-[#12283E] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.id}
            onClick={() => onNavigateTab(stat.tab)}
            className={`p-5 rounded-2xl bg-white border ${stat.border} shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-stone-600 line-clamp-1">{stat.title}</span>
              <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold font-display text-[#0B1F33]">{stat.value}</div>
              <div className="text-[11px] text-stone-500 mt-0.5">{stat.subtitle}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-Column Working Panels: Pending Verification Queue & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pending Opportunities Review */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#E4E1D8] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D99A28]" />
              <h3 className="font-bold font-display text-base text-[#0B1F33]">
                Pending Verification Queue
              </h3>
              {pendingReviewsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#D99A28]/15 text-[#D99A28] text-xs font-bold">
                  {pendingReviewsCount}
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigateTab('opportunities')}
              className="text-xs text-[#087F5B] font-semibold hover:underline cursor-pointer"
            >
              View Directory →
            </button>
          </div>

          {pendingOpportunities.length === 0 ? (
            <div className="py-12 text-center space-y-3 bg-[#F8F7F2] rounded-2xl border border-dashed border-[#E4E1D8]">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-sm text-[#0B1F33]">No pending opportunities</p>
                <p className="text-xs text-stone-500 mt-0.5 max-w-xs mx-auto">
                  All submitted opportunities have been reviewed and published, or none have been added yet.
                </p>
              </div>
              <button
                onClick={onOpenCreateOpportunity}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#087F5B] text-white text-xs font-semibold hover:bg-[#066548] cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Opportunity</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingOpportunities.slice(0, 5).map((opp) => (
                <div
                  key={opp.id}
                  className="p-4 rounded-2xl border border-[#E4E1D8] hover:border-[#087F5B]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-semibold">
                        {opp.category}
                      </span>
                      <span className="text-[11px] text-stone-500">{opp.organization}</span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#0B1F33]">{opp.title}</h4>
                    <p className="text-[11px] text-stone-500">
                      Mode: {opp.remoteType} • Deadline: {opp.deadline}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => approveAndPublishOpportunity(opp.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Verify & Publish
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Real Activity Audit Stream */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#E4E1D8] shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#087F5B]" />
              <h3 className="font-bold font-display text-base text-[#0B1F33]">
                Recent Administrative Activity
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('audit')}
              className="text-xs text-[#087F5B] font-semibold hover:underline cursor-pointer"
            >
              All Logs →
            </button>
          </div>

          {activityLogs.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-[#F8F7F2] rounded-2xl border border-dashed border-[#E4E1D8]">
              <FileText className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="font-bold text-sm text-[#0B1F33]">No administrative activity recorded yet</p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Actions like creating opportunities, approving listings, or updating settings will be logged here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activityLogs.slice(0, 6).map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E4E1D8] text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#0B1F33]">{log.action}</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{log.details}</p>
                  <div className="text-[10px] text-stone-500 pt-0.5">By: {log.adminName}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
