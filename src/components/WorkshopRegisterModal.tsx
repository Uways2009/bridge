import React, { useState } from 'react';
import { WorkshopEvent } from '../types';
import {
  X,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  Check,
  Send,
  MessageCircle,
} from 'lucide-react';

interface WorkshopRegisterModalProps {
  workshop: WorkshopEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WorkshopRegisterModal: React.FC<WorkshopRegisterModalProps> = ({
  workshop,
  isOpen,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [wantsWhatsAppReminder, setWantsWhatsAppReminder] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !workshop) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError('Please provide your name, email, and phone number.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setRegistered(true);
    }, 700);
  };

  const handleResetAndClose = () => {
    setRegistered(false);
    setName('');
    setEmail('');
    setPhone('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E4E1D8] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0B1F33] text-white p-6 relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#087F5B] text-white mb-2 inline-block">
            {workshop.fee} Masterclass
          </span>
          <h2 className="text-xl font-bold font-display text-white pr-8">
            {workshop.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-2">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#D99A28]" />
              {workshop.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#D99A28]" />
              {workshop.timeWAT}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {registered ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#087F5B]/10 text-[#087F5B] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display text-[#0B1F33]">
                You're Registered!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Welcome, <strong>{name}</strong>. We have reserved your virtual seat for <strong>{workshop.title}</strong> on <strong>{workshop.platform}</strong>.
              </p>

              <div className="bg-[#F8F7F2] p-4 rounded-2xl border border-[#E4E1D8] text-xs text-stone-700 text-left space-y-2">
                <p className="font-semibold text-stone-900 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-[#0F766E]" />
                  <span>Session Access Details</span>
                </p>
                <p>
                  A direct link will be sent to <strong>{email}</strong> and via WhatsApp to <strong>{phone}</strong> 2 hours prior to start time ({workshop.timeWAT}).
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                <a
                  href="https://chat.whatsapp.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 rounded-xl bg-[#087F5B] text-white text-xs font-semibold hover:bg-[#066548] transition-colors flex items-center justify-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Join Attendees WhatsApp Group</span>
                </a>
                <button
                  onClick={handleResetAndClose}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. David Eze"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  WhatsApp Number (For reminders & link) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 812 345 6789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="wa-reminder"
                  checked={wantsWhatsAppReminder}
                  onChange={(e) => setWantsWhatsAppReminder(e.target.checked)}
                  className="mt-0.5 rounded text-[#087F5B] focus:ring-[#087F5B]"
                />
                <label htmlFor="wa-reminder" className="text-xs text-stone-600">
                  Send me an SMS/WhatsApp reminder 2 hours before the session starts with the direct Google Meet link.
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Securing Seat...</span>
                  ) : (
                    <>
                      <span>Register for Free ({workshop.platform})</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-[11px] text-stone-500 text-center mt-2">
                  All sessions are recorded and shared with registered participants.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
