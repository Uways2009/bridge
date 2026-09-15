import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { WorkshopEvent, EventAttendee } from '../../types';
import {
  Calendar,
  Clock,
  Video,
  Users,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Search,
  UserCheck,
} from 'lucide-react';

interface AdminWorkshopsProps {
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
  onOpenCreateModal: () => void;
}

export const AdminWorkshops: React.FC<AdminWorkshopsProps> = ({
  isCreateModalOpen,
  onCloseCreateModal,
  onOpenCreateModal,
}) => {
  const {
    workshops,
    attendees,
    createWorkshop,
    updateWorkshop,
    deleteWorkshop,
    toggleAttendeeCheckin,
  } = useAdmin();

  const [editingWorkshop, setEditingWorkshop] = useState<WorkshopEvent | null>(null);
  const [selectedWorkshopForAttendees, setSelectedWorkshopForAttendees] = useState<WorkshopEvent | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [attendeeSearch, setAttendeeSearch] = useState('');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSpeaker, setFormSpeaker] = useState('');
  const [formSpeakerRole, setFormSpeakerRole] = useState('');
  const [formDate, setFormDate] = useState('2026-10-15');
  const [formTimeWAT, setFormTimeWAT] = useState('4:00 PM – 5:30 PM WAT');
  const [formPlatform, setFormPlatform] = useState<WorkshopEvent['platform']>('Google Meet');
  const [formMaxCapacity, setFormMaxCapacity] = useState(500);
  const [formFee, setFormFee] = useState<WorkshopEvent['fee']>('Free');
  const [formDescription, setFormDescription] = useState('');
  const [formTakeaways, setFormTakeaways] = useState<string[]>(['']);

  const handleOpenEdit = (ws: WorkshopEvent) => {
    setEditingWorkshop(ws);
    setFormTitle(ws.title);
    setFormSpeaker(ws.speaker || ws.facilitator || '');
    setFormSpeakerRole(ws.facilitatorRole || '');
    setFormDate(ws.date);
    setFormTimeWAT(ws.timeWAT);
    setFormPlatform(ws.platform);
    setFormMaxCapacity(ws.maxCapacity || 500);
    setFormFee(ws.fee);
    setFormDescription(ws.description);
    setFormTakeaways(ws.takeaways && ws.takeaways.length > 0 ? ws.takeaways : ['']);
  };

  const handleCloseModal = () => {
    setEditingWorkshop(null);
    onCloseCreateModal();
    resetForm();
  };

  const resetForm = () => {
    setFormTitle('');
    setFormSpeaker('');
    setFormSpeakerRole('');
    setFormDate('2026-10-15');
    setFormTimeWAT('4:00 PM – 5:30 PM WAT');
    setFormPlatform('Google Meet');
    setFormMaxCapacity(500);
    setFormFee('Free');
    setFormDescription('');
    setFormTakeaways(['']);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTakeaways = formTakeaways.filter((t) => t.trim().length > 0);

    if (editingWorkshop) {
      updateWorkshop(editingWorkshop.id, {
        title: formTitle,
        speaker: formSpeaker,
        facilitator: formSpeaker,
        facilitatorRole: formSpeakerRole,
        date: formDate,
        timeWAT: formTimeWAT,
        platform: formPlatform,
        maxCapacity: Number(formMaxCapacity),
        fee: formFee,
        description: formDescription,
        takeaways: cleanTakeaways,
      });
    } else {
      createWorkshop({
        title: formTitle,
        speaker: formSpeaker,
        facilitator: formSpeaker,
        facilitatorRole: formSpeakerRole,
        date: formDate,
        timeWAT: formTimeWAT,
        platform: formPlatform,
        maxCapacity: Number(formMaxCapacity),
        capacity: `${formMaxCapacity} Virtual Seats`,
        fee: formFee,
        description: formDescription,
        takeaways: cleanTakeaways,
      });
    }

    handleCloseModal();
  };

  const isModalOpen = isCreateModalOpen || editingWorkshop !== null;

  // Attendees for the selected workshop
  const currentAttendees = selectedWorkshopForAttendees
    ? attendees.filter((a) => {
        const matchesWs = a.workshopId === selectedWorkshopForAttendees.id || a.workshopId === 'ws-1';
        const matchesSearch =
          a.fullName.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
          a.email.toLowerCase().includes(attendeeSearch.toLowerCase()) ||
          a.state.toLowerCase().includes(attendeeSearch.toLowerCase());
        return matchesWs && matchesSearch;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-[#0B1F33]">
            Workshops & Live Events
          </h1>
          <p className="text-xs text-[#1F2933]/70 mt-1">
            Schedule virtual masterclasses, manage registration caps, view attendee check-ins, and assign speakers.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Workshop</span>
        </button>
      </div>

      {/* Workshop Grid Cards */}
      {workshops.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-dashed border-[#E4E1D8] text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <div className="max-w-sm mx-auto space-y-1">
            <h3 className="text-base font-bold text-[#0B1F33]">No events created yet.</h3>
            <p className="text-xs text-stone-500">
              No upcoming events are available. Schedule your first virtual workshop or community masterclass above.
            </p>
          </div>
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#087F5B] text-white text-xs font-semibold hover:bg-[#066548] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule Workshop</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {workshops.map((ws) => {
            const registered = ws.registeredAttendeesCount ?? 0;
            const maxCap = ws.maxCapacity || 250;
            const percentage = maxCap > 0 ? Math.min(100, Math.round((registered / maxCap) * 100)) : 0;

          return (
            <div
              key={ws.id}
              className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Micro badges */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#087F5B]/10 text-[#087F5B] font-bold text-[10px] uppercase tracking-wider">
                    {ws.status || 'Upcoming'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-[#0B1F33]/5 text-[#0B1F33] text-[11px] font-semibold">
                    {ws.fee}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#0B1F33] font-display leading-snug">
                  {ws.title}
                </h3>

                <p className="text-xs text-[#1F2933]/70 line-clamp-2 leading-relaxed">
                  {ws.description}
                </p>

                {/* Speaker & Date Info */}
                <div className="pt-2 border-t border-[#E4E1D8] space-y-2 text-xs text-[#1F2933]/80">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#087F5B] shrink-0" />
                    <span className="font-medium">{ws.date}</span>
                    <span className="text-[#1F2933]/40">•</span>
                    <Clock className="w-4 h-4 text-[#D99A28] shrink-0" />
                    <span>{ws.timeWAT}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[#0F766E] shrink-0" />
                    <span>Platform: <strong>{ws.platform}</strong></span>
                  </div>

                  {ws.speaker || ws.facilitator ? (
                    <div className="flex items-center gap-2 text-[11px] text-[#1F2933]/70">
                      <span>Speaker: <strong>{ws.speaker || ws.facilitator}</strong> ({ws.facilitatorRole || 'Industry Specialist'})</span>
                    </div>
                  ) : null}
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#1F2933]/70 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-[#087F5B]" />
                      <span>Registration Capacity</span>
                    </span>
                    <span className="font-bold text-[#0B1F33]">
                      {registered} / {maxCap} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EAE7DC] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#087F5B] h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-[#E4E1D8]">
                <button
                  onClick={() => setSelectedWorkshopForAttendees(ws)}
                  className="text-xs font-semibold text-[#087F5B] hover:text-[#066548] flex items-center gap-1 cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>View Attendee List ({registered})</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(ws)}
                    className="p-2 rounded-xl hover:bg-[#EAE7DC] text-[#0B1F33] transition-colors cursor-pointer"
                    title="Edit event"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingId(ws.id)}
                    className="p-2 rounded-xl hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                    title="Delete event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Attendees Drawer / Modal */}
      {selectedWorkshopForAttendees && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-[#E4E1D8] space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-4 border-b border-[#E4E1D8]">
              <div>
                <h3 className="text-lg font-bold font-display text-[#0B1F33]">
                  Event Attendee Registry
                </h3>
                <p className="text-xs text-[#1F2933]/60 mt-0.5">
                  {selectedWorkshopForAttendees.title} • {selectedWorkshopForAttendees.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkshopForAttendees(null)}
                className="p-1.5 rounded-xl text-[#1F2933]/50 hover:bg-[#EAE7DC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#1F2933]/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={attendeeSearch}
                onChange={(e) => setAttendeeSearch(e.target.value)}
                placeholder="Search attendees by name, email, or state..."
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl pl-9 pr-4 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-[#E4E1D8] pr-1">
              {currentAttendees.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#1F2933]/60">
                  No registered attendees match the filter.
                </div>
              ) : (
                currentAttendees.map((att) => (
                  <div
                    key={att.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#0B1F33]">{att.fullName}</p>
                      <p className="text-[11px] text-[#1F2933]/60">{att.email} • {att.phone}</p>
                      <p className="text-[10px] text-[#1F2933]/50">
                        {att.state} • Registered: {att.registeredAt}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleAttendeeCheckin(att.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        att.attended
                          ? 'bg-[#087F5B] text-white'
                          : 'bg-[#F8F7F2] border border-[#E4E1D8] text-[#1F2933] hover:bg-[#EAE7DC]'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{att.attended ? 'Attended' : 'Check In'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#E4E1D8] text-xs text-[#1F2933]/60">
              <span>Total Showing: {currentAttendees.length} Attendees</span>
              <button
                onClick={() => setSelectedWorkshopForAttendees(null)}
                className="px-4 py-2 rounded-xl bg-[#0B1F33] text-white font-semibold cursor-pointer"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Workshop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl border border-[#E4E1D8]">
            <div className="flex items-center justify-between pb-4 border-b border-[#E4E1D8] mb-6">
              <div>
                <h2 className="text-xl font-bold font-display text-[#0B1F33]">
                  {editingWorkshop ? 'Edit Workshop' : 'Schedule New Workshop & Masterclass'}
                </h2>
                <p className="text-xs text-[#1F2933]/60 mt-0.5">
                  Provide event details, facilitator background, time in West Africa Time, and capacity limit.
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-xl text-[#1F2933]/50 hover:bg-[#EAE7DC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0B1F33] mb-1">
                  Workshop Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Breaking into Global Remote Freelancing from Nigeria"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Speaker / Facilitator Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formSpeaker}
                    onChange={(e) => setFormSpeaker(e.target.value)}
                    placeholder="e.g. Chinedu Okafor"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Facilitator Role / Affiliation
                  </label>
                  <input
                    type="text"
                    value={formSpeakerRole}
                    onChange={(e) => setFormSpeakerRole(e.target.value)}
                    placeholder="e.g. Lead Technical Recruiter @ Andela"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Time (WAT) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTimeWAT}
                    onChange={(e) => setFormTimeWAT(e.target.value)}
                    placeholder="e.g. 5:00 PM – 6:30 PM WAT"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Virtual Platform *
                  </label>
                  <select
                    value={formPlatform}
                    onChange={(e) => setFormPlatform(e.target.value as WorkshopEvent['platform'])}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom</option>
                    <option value="YouTube Live">YouTube Live</option>
                    <option value="WhatsApp Audio">WhatsApp Audio</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Max Virtual Capacity (Seats)
                  </label>
                  <input
                    type="number"
                    value={formMaxCapacity}
                    onChange={(e) => setFormMaxCapacity(Number(e.target.value))}
                    min={10}
                    max={2000}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#0B1F33] mb-1">
                    Access Fee
                  </label>
                  <select
                    value={formFee}
                    onChange={(e) => setFormFee(e.target.value)}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="Free">Free (Sponsored)</option>
                    <option value="₦2,500 Material Fee">₦2,500 Material Fee</option>
                    <option value="₦5,000 Masterclass">₦5,000 Masterclass</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0B1F33] mb-1">
                  Workshop Description & Curriculum Overview *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Outline what attendees will learn, interactive teardowns, and Q&A schedule..."
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl p-3 text-xs text-[#0B1F33] focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E4E1D8]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-[#E4E1D8] text-xs font-semibold text-[#1F2933] hover:bg-[#EAE7DC] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold shadow-md cursor-pointer"
                >
                  {editingWorkshop ? 'Save Changes' : 'Schedule Event'}
                </button>
              </div>
            </form>
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
              <h3 className="text-base font-bold text-[#0B1F33]">Cancel & Remove Event</h3>
              <p className="text-xs text-[#1F2933]/70 mt-1">
                Are you sure you want to remove this workshop event? Registered attendees will be notified.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-[#E4E1D8] text-xs font-semibold text-[#1F2933] hover:bg-[#EAE7DC] cursor-pointer"
              >
                Keep Event
              </button>
              <button
                onClick={() => {
                  deleteWorkshop(deletingId);
                  setDeletingId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
