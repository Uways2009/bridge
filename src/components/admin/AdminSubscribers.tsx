import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { AnnouncementBroadcast, NewsletterSubscriber } from '../../types';
import {
  Mail,
  Send,
  Download,
  Search,
  CheckCircle2,
  Trash2,
  Plus,
  Users,
  Clock,
  Radio,
  X,
  Sparkles,
} from 'lucide-react';

interface AdminSubscribersProps {
  isBroadcastModalOpen: boolean;
  onCloseBroadcastModal: () => void;
  onOpenBroadcastModal: () => void;
}

export const AdminSubscribers: React.FC<AdminSubscribersProps> = ({
  isBroadcastModalOpen,
  onCloseBroadcastModal,
  onOpenBroadcastModal,
}) => {
  const {
    subscribers,
    broadcasts,
    toggleSubscriberStatus,
    deleteSubscriber,
    sendBroadcast,
    exportSubscribersCSV,
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'subscribers' | 'broadcasts'>('subscribers');

  // Broadcast modal form state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastAudience, setBroadcastAudience] =
    useState<AnnouncementBroadcast['targetAudience']>('All Subscribers');
  const [broadcastContent, setBroadcastContent] = useState('');
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastContent) return;

    sendBroadcast(broadcastTitle, broadcastAudience, broadcastContent);
    setDispatchSuccess(true);
    setTimeout(() => {
      setDispatchSuccess(false);
      onCloseBroadcastModal();
      setBroadcastTitle('');
      setBroadcastContent('');
    }, 1800);
  };

  const activeCount = subscribers.filter((s) => s.status === 'Subscribed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#0B1F33]">
            Subscribers & Community Broadcasts
          </h1>
          <p className="text-xs text-[#1F2933]/70 mt-1">
            Dispatch weekly opportunity digests, notify users of deadline updates, and manage email distribution lists.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportSubscribersCSV}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#E4E1D8] text-xs font-semibold text-[#0B1F33] hover:bg-[#EAE7DC] flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#087F5B]" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenBroadcastModal}
            className="px-4 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Compose Broadcast</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E4E1D8] pb-1">
        <button
          onClick={() => setActiveTab('subscribers')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'subscribers'
              ? 'bg-[#0B1F33] text-white'
              : 'text-[#1F2933]/70 hover:bg-[#EAE7DC]'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Subscribers Directory ({subscribers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('broadcasts')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all ${
            activeTab === 'broadcasts'
              ? 'bg-[#0B1F33] text-white'
              : 'text-[#1F2933]/70 hover:bg-[#EAE7DC]'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Broadcast Log ({broadcasts.length})</span>
        </button>
      </div>

      {/* VIEW 1: Subscribers Directory */}
      {activeTab === 'subscribers' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#1F2933]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subscriber email..."
              className="w-full bg-white border border-[#E4E1D8] rounded-xl pl-10 pr-4 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
            />
          </div>

          <div className="bg-white rounded-3xl border border-[#E4E1D8] shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F7F2] border-b border-[#E4E1D8] text-[#1F2933]/70 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Subscriber Email</th>
                  <th className="py-3.5 px-4">Acquisition Source</th>
                  <th className="py-3.5 px-4">Date Joined</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E1D8]">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-sm text-[#1F2933]/60">
                      <div className="max-w-sm mx-auto space-y-2">
                        <p className="font-semibold text-base text-[#0B1F33]">
                          {subscribers.length === 0 ? 'No newsletter subscribers yet.' : 'No subscribers match your search.'}
                        </p>
                        <p className="text-xs text-stone-500">
                          {subscribers.length === 0
                            ? 'Emails captured from the footer signup form and event registrations will be listed here.'
                            : 'Try adjusting your search criteria.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="hover:bg-[#F8F7F2]/50">
                      <td className="py-3.5 px-4 font-semibold text-[#0B1F33]">
                        {sub.email}
                      </td>
                      <td className="py-3.5 px-4 text-[#1F2933]/70">{sub.source}</td>
                      <td className="py-3.5 px-4 text-[#1F2933]/70">{sub.dateSubscribed}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            sub.status === 'Subscribed'
                              ? 'bg-[#087F5B]/10 text-[#087F5B] border-[#087F5B]/30'
                              : 'bg-gray-100 text-gray-500 border-gray-200'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggleSubscriberStatus(sub.id)}
                            className="text-[11px] font-medium text-[#0F766E] hover:underline cursor-pointer"
                          >
                            {sub.status === 'Subscribed' ? 'Unsubscribe' : 'Resubscribe'}
                          </button>
                          <button
                            onClick={() => deleteSubscriber(sub.id)}
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Broadcast Log */}
      {activeTab === 'broadcasts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {broadcasts.map((bc) => (
              <div
                key={bc.id}
                className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#087F5B]/10 text-[#087F5B] text-[10px] font-bold">
                    {bc.status}
                  </span>
                  <span className="text-xs text-[#1F2933]/60">{bc.sentAt}</span>
                </div>

                <h3 className="font-bold text-sm text-[#0B1F33]">{bc.title}</h3>

                <p className="text-xs text-[#1F2933]/80 leading-relaxed whitespace-pre-line bg-[#F8F7F2] p-3 rounded-xl border border-[#E4E1D8]">
                  {bc.content}
                </p>

                <div className="pt-2 border-t border-[#E4E1D8] flex items-center justify-between text-[11px] text-[#1F2933]/70">
                  <span>Audience: <strong>{bc.targetAudience}</strong></span>
                  <span>Recipients: <strong>{bc.recipientCount.toLocaleString()}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Compose Broadcast */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-[#E4E1D8] shadow-2xl">
            <div className="flex items-start justify-between pb-3 border-b border-[#E4E1D8]">
              <div>
                <h3 className="font-bold text-base font-display text-[#0B1F33]">
                  Dispatch Announcement Digest
                </h3>
                <p className="text-xs text-[#1F2933]/60 mt-0.5">
                  Broadcasts will reach active community subscribers across email and WhatsApp feeds.
                </p>
              </div>
              <button
                onClick={onCloseBroadcastModal}
                className="p-1.5 rounded-xl text-[#1F2933]/50 hover:bg-[#EAE7DC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {dispatchSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-[#087F5B] mx-auto animate-bounce" />
                <h4 className="text-base font-bold text-[#0B1F33]">Broadcast Dispatched!</h4>
                <p className="text-xs text-[#1F2933]/70">
                  Sent to {activeCount} active community members and logged to audit records.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Audience Segment *
                  </label>
                  <select
                    value={broadcastAudience}
                    onChange={(e) => setBroadcastAudience(e.target.value as any)}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2"
                  >
                    <option value="All Subscribers">All Subscribers ({activeCount} active)</option>
                    <option value="Students & Graduates">Students & Graduates</option>
                    <option value="SMEs & Freelancers">SMEs & Freelancers</option>
                    <option value="Campus Ambassadors">Campus Ambassadors</option>
                    <option value="Registered Partners">Registered Partners</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Announcement Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    placeholder="e.g. Urgent Notice: 15 New Fully Remote Tech Cohorts Open"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Broadcast Message Body *
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={broadcastContent}
                    onChange={(e) => setBroadcastContent(e.target.value)}
                    placeholder="Write announcement body, links to opportunities, deadlines, or tips..."
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl p-3 leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onCloseBroadcastModal}
                    className="px-4 py-2 border rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#087F5B] hover:bg-[#066548] text-white rounded-xl font-semibold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Announcement</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
