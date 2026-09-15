import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { InboxItem, InboxType, InboxStatus } from '../../types';
import { MOCK_ADMIN_ACCOUNTS } from '../../data/adminMockData';
import {
  Mail,
  LifeBuoy,
  Handshake,
  HeartHandshake,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  Send,
  MessageSquare,
  FileText,
  AlertCircle,
  Phone,
} from 'lucide-react';

export const AdminInbox: React.FC = () => {
  const {
    inboxItems,
    updateInboxStatus,
    addInboxNote,
    assignInboxItem,
    sendInboxReply,
    deleteInboxItem,
  } = useAdmin();

  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeItem, setActiveItem] = useState<InboxItem | null>(null);
  const [newNote, setNewNote] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const typeTabs: { id: string; label: string; icon: React.ReactNode }[] = [
    { id: 'All', label: 'All Inquiries', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'support', label: 'CV & Support Desk', icon: <LifeBuoy className="w-3.5 h-3.5" /> },
    { id: 'partnership', label: 'Partnerships', icon: <Handshake className="w-3.5 h-3.5" /> },
    { id: 'volunteer', label: 'Campus Ambassadors', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
    { id: 'mentorship', label: 'Mentorship', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'contact', label: 'General / Scam Reports', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  ];

  const statusOptions: ('All' | InboxStatus)[] = [
    'All',
    'New',
    'In Review',
    'Completed',
    'Archived',
    'Closed',
  ];

  const filteredItems = inboxItems.filter((item) => {
    const matchesType =
      selectedTypeFilter === 'All' || item.type === selectedTypeFilter;

    const matchesStatus =
      selectedStatusFilter === 'All' || item.status === selectedStatusFilter;

    const matchesSearch =
      item.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subjectOrCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !newNote.trim()) return;
    addInboxNote(activeItem.id, newNote.trim());
    // Update local modal state
    setActiveItem({
      ...activeItem,
      notes: [...(activeItem.notes || []), `[You]: ${newNote.trim()}`],
    });
    setNewNote('');
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeItem || !replyMessage.trim()) return;
    sendInboxReply(activeItem.id, replyMessage.trim());
    setReplySuccess(true);
    setActiveItem({
      ...activeItem,
      status: 'Completed',
      replySummary: replyMessage.trim(),
    });
    setTimeout(() => {
      setReplySuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-[#0B1F33]">
          Inquiries, Support & Community Inbox
        </h1>
        <p className="text-xs text-[#1F2933]/70 mt-1">
          Review submissions from students, campus ambassador applicants, partnership proposals, and support requests.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-[#E4E1D8]">
        {typeTabs.map((tab) => {
          const count =
            tab.id === 'All'
              ? inboxItems.length
              : inboxItems.filter((i) => i.type === tab.id).length;

          const isActive = selectedTypeFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTypeFilter(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-[#0B1F33] text-white shadow-xs'
                  : 'text-[#1F2933]/70 hover:bg-[#EAE7DC]/60 hover:text-[#0B1F33]'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-[#EAE7DC] text-[#1F2933]/80'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Status Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#1F2933]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by sender name, email, subject, or message keyword..."
            className="w-full bg-white border border-[#E4E1D8] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-white border border-[#E4E1D8] rounded-xl px-3 py-1.5 text-xs text-[#1F2933] w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#1F2933]/50" />
          <span className="text-[#1F2933]/50">Status:</span>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer text-xs font-medium"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Inbox List */}
      <div className="bg-white rounded-3xl border border-[#E4E1D8] shadow-xs overflow-hidden divide-y divide-[#E4E1D8]">
        {filteredItems.length === 0 ? (
          <div className="py-16 text-center text-sm text-[#1F2933]/60">
            <div className="max-w-sm mx-auto space-y-2">
              <p className="font-semibold text-base text-[#0B1F33]">
                {inboxItems.length === 0
                  ? 'No enquiries have been received.'
                  : 'No inquiries match the current filter.'}
              </p>
              <p className="text-xs text-stone-500">
                {inboxItems.length === 0
                  ? 'Submissions from the public contact desk, partnership proposals, and support requests will appear here.'
                  : 'Try selecting a different status or category filter.'}
              </p>
            </div>
          </div>
        ) : (
          filteredItems.map((item) => {
            let statusBadge = 'bg-[#D99A28]/15 text-[#D99A28] border-[#D99A28]/30';
            if (item.status === 'Completed') {
              statusBadge = 'bg-[#087F5B]/10 text-[#087F5B] border-[#087F5B]/30';
            } else if (item.status === 'In Review') {
              statusBadge = 'bg-[#0F766E]/15 text-[#0F766E] border-[#0F766E]/30';
            } else if (item.status === 'Archived' || item.status === 'Closed') {
              statusBadge = 'bg-gray-100 text-gray-500 border-gray-200';
            }

            return (
              <div
                key={item.id}
                onClick={() => setActiveItem(item)}
                className="p-4 sm:p-5 hover:bg-[#F8F7F2]/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge}`}
                    >
                      {item.status}
                    </span>
                    <span className="text-[11px] font-semibold text-[#087F5B] uppercase tracking-wider">
                      {item.type}
                    </span>
                    <span className="text-xs text-[#1F2933]/40">•</span>
                    <span className="text-xs text-[#1F2933]/60">{item.submittedAt}</span>
                    {item.assignedTo && (
                      <>
                        <span className="text-xs text-[#1F2933]/40">•</span>
                        <span className="text-[11px] text-[#0F766E] font-medium">
                          Assigned: {item.assignedTo}
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-[#0B1F33] truncate">
                    {item.subjectOrCategory}
                  </h3>

                  <p className="text-xs text-[#1F2933]/70 line-clamp-1">
                    <strong className="text-[#0B1F33] font-semibold">{item.fullName}</strong> ({item.email}):{' '}
                    {item.message}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveItem(item);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#087F5B]/10 hover:bg-[#087F5B] text-[#087F5B] hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Open & Reply
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(item.id);
                    }}
                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal / Reply Drawer */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-[#E4E1D8] space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E4E1D8]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#087F5B]/10 text-[#087F5B] uppercase">
                    {activeItem.type}
                  </span>
                  <span className="text-xs text-[#1F2933]/60">{activeItem.submittedAt}</span>
                </div>
                <h2 className="text-lg font-bold font-display text-[#0B1F33]">
                  {activeItem.subjectOrCategory}
                </h2>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-2 rounded-xl text-[#1F2933]/50 hover:bg-[#EAE7DC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sender Overview */}
            <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[11px] text-[#1F2933]/60 block">Applicant / Contact</span>
                <span className="font-bold text-[#0B1F33] text-sm">{activeItem.fullName}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#1F2933]/60 block">Email Address</span>
                <span className="font-medium text-[#087F5B]">{activeItem.email}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#1F2933]/60 block">Phone Number</span>
                <span className="font-medium text-[#0B1F33]">{activeItem.phone}</span>
              </div>
              <div>
                <span className="text-[11px] text-[#1F2933]/60 block">Current Status</span>
                <span className="font-bold text-[#D99A28]">{activeItem.status}</span>
              </div>

              {activeItem.metaDetails &&
                Object.entries(activeItem.metaDetails).map(([key, value]) => (
                  <div key={key} className="sm:col-span-2 pt-1 border-t border-[#E4E1D8]/60">
                    <span className="text-[11px] text-[#1F2933]/60 block">{key}</span>
                    <span className="font-semibold text-[#0B1F33]">{value}</span>
                  </div>
                ))}
            </div>

            {/* Message Body */}
            <div>
              <span className="font-semibold text-xs text-[#0B1F33] block mb-1">
                Full Message & Pitch
              </span>
              <div className="p-4 rounded-2xl bg-white border border-[#E4E1D8] text-xs text-[#1F2933] leading-relaxed whitespace-pre-line">
                {activeItem.message}
              </div>
            </div>

            {/* Workflow Controls: Assign Staff & Change Status */}
            <div className="p-4 rounded-2xl bg-[#F8F7F2] border border-[#E4E1D8] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0B1F33] mb-1">
                  Assign Staff Specialist
                </label>
                <select
                  value={activeItem.assignedTo || ''}
                  onChange={(e) => {
                    assignInboxItem(activeItem.id, e.target.value);
                    setActiveItem({ ...activeItem, assignedTo: e.target.value });
                  }}
                  className="w-full bg-white border border-[#E4E1D8] rounded-xl px-3 py-1.5 text-xs text-[#0B1F33]"
                >
                  <option value="">Unassigned</option>
                  {MOCK_ADMIN_ACCOUNTS.map((adm) => (
                    <option key={adm.id} value={adm.name}>
                      {adm.name} ({adm.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#0B1F33] mb-1">
                  Update Workflow Status
                </label>
                <select
                  value={activeItem.status}
                  onChange={(e) => {
                    const next = e.target.value as InboxStatus;
                    updateInboxStatus(activeItem.id, next);
                    setActiveItem({ ...activeItem, status: next });
                  }}
                  className="w-full bg-white border border-[#E4E1D8] rounded-xl px-3 py-1.5 text-xs text-[#0B1F33]"
                >
                  <option value="New">New</option>
                  <option value="In Review">In Review</option>
                  <option value="Completed">Completed</option>
                  <option value="Archived">Archived</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Internal Staff Notes */}
            <div className="space-y-3">
              <span className="font-semibold text-xs text-[#0B1F33] block">
                Internal Administrative Notes (Private)
              </span>

              {activeItem.notes && activeItem.notes.length > 0 && (
                <div className="space-y-1.5">
                  {activeItem.notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-yellow-50/70 border border-yellow-200/60 text-xs text-[#0B1F33]"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              )}

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add private note or next action..."
                  className="flex-1 bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#0B1F33] text-white text-xs font-semibold cursor-pointer hover:bg-[#1F2933]"
                >
                  Save Note
                </button>
              </form>
            </div>

            {/* Simulated Response & Notification Dispatch */}
            <div className="pt-4 border-t border-[#E4E1D8] space-y-3">
              <span className="font-semibold text-xs text-[#0B1F33] flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-[#087F5B]" />
                <span>Send Official Response to Applicant</span>
              </span>

              {replySuccess && (
                <div className="p-3 rounded-xl bg-[#087F5B]/10 border border-[#087F5B]/30 flex items-center gap-2 text-xs text-[#087F5B]">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Response dispatched to {activeItem.email}! Status updated to Completed.</span>
                </div>
              )}

              {activeItem.replySummary ? (
                <div className="p-3 rounded-xl bg-[#087F5B]/5 border border-[#087F5B]/20 text-xs text-[#0B1F33]">
                  <p className="font-semibold text-[#087F5B] mb-1">Previous Response Sent:</p>
                  <p className="italic">{activeItem.replySummary}</p>
                </div>
              ) : (
                <form onSubmit={handleSendReply} className="space-y-3">
                  <textarea
                    rows={3}
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder={`Write response to ${activeItem.fullName} (e.g. CV feedback, interview invite, or onboarding brief)...`}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl p-3 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Response & Mark Resolved</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-[#E4E1D8]">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1F33]">Delete Inquiry</h3>
              <p className="text-xs text-[#1F2933]/70 mt-1">
                Are you sure you want to permanently delete this inquiry record?
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-[#E4E1D8] text-xs font-semibold text-[#1F2933] hover:bg-[#EAE7DC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteInboxItem(deletingId);
                  setDeletingId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
