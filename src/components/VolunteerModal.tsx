import React, { useState } from 'react';
import { X, Users, CheckCircle2, Send, Heart } from 'lucide-react';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VolunteerModal: React.FC<VolunteerModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [rolePreference, setRolePreference] = useState('Campus Ambassador (Tertiary Student)');
  const [stateLoc, setStateLoc] = useState('Lagos');
  const [motivation, setMotivation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 700);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setPhone('');
    setMotivation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E4E1D8] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#0B1F33] text-white p-6 relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#087F5B] text-white mb-2 inline-block">
            Community Volunteer Team
          </span>
          <h2 className="text-xl font-bold font-display text-white pr-8">
            Volunteer with NaijaBridge
          </h2>
          <p className="text-xs text-white/70 mt-1">
            Help us verify opportunities, coordinate campus watch parties, or mentor peers.
          </p>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#087F5B]/10 text-[#087F5B] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-display text-[#0B1F33]">
                Application Submitted!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{name}</strong>! Our Community Lead reviews new volunteer applications every Friday. We will reach out via WhatsApp at <strong>{phone}</strong>.
              </p>
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 rounded-xl bg-[#0B1F33] hover:bg-[#087F5B] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ibrahim Sani"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 809 123 4567"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ibrahim@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    State of Residence
                  </label>
                  <input
                    type="text"
                    value={stateLoc}
                    onChange={(e) => setStateLoc(e.target.value)}
                    placeholder="e.g. Kano, Enugu, Oyo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  How would you like to contribute?
                </label>
                <select
                  value={rolePreference}
                  onChange={(e) => setRolePreference(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B] bg-white"
                >
                  <option value="Campus Ambassador (Tertiary Student)">Campus Ambassador on My Tertiary Campus</option>
                  <option value="Opportunity Researcher (Vetting Grants/Jobs)">Opportunity Researcher (Vetting Grants/Jobs)</option>
                  <option value="Peer Mentor / CV Reviewer">Peer Mentor / Volunteer CV Reviewer</option>
                  <option value="Community Moderator (WhatsApp/Telegram)">Community Moderator (WhatsApp/Telegram)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Why do you want to volunteer with NaijaBridge?
                </label>
                <textarea
                  rows={3}
                  required
                  value={motivation}
                  onChange={(e) => setMotivation(e.target.value)}
                  placeholder="Tell us briefly about your passion for Nigerian youth development..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? <span>Submitting...</span> : <span>Apply to Volunteer</span>}
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
