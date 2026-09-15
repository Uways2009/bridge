import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  saveDraftToFirestore,
  getDraftFromFirestore,
  deleteDraftFromFirestore,
} from '../../lib/firebaseService';
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ShieldCheck,
  Save,
  Globe,
  Share2,
  AlertTriangle,
  RefreshCw,
  History,
} from 'lucide-react';

export const AdminContactInfoCMS: React.FC = () => {
  const { contactInfo, updateContactInfo, canEditContent, syncStatus, currentAdmin } = useAdmin();

  const [formData, setFormData] = useState({
    officialEmail: contactInfo.officialEmail || 'hello@naijabridge.org',
    supportEmail: contactInfo.supportEmail || 'support@naijabridge.org',
    verificationEmail: contactInfo.verificationEmail || 'verify@naijabridge.org',
    pressEmail: contactInfo.pressEmail || 'press@naijabridge.org',
    phone: contactInfo.phone || '+234 800 62452 274',
    phoneSecondary: contactInfo.phoneSecondary || '',
    whatsappNumber: contactInfo.whatsappNumber || '+234 800 62452 274',
    whatsappGroupLink: contactInfo.whatsappGroupLink || '',
    telegramChannelLink: contactInfo.telegramChannelLink || '',
    physicalAddress: contactInfo.physicalAddress || 'Remote Secretariat across Lagos, Abuja, and Enugu, Nigeria',
    operatingHours: contactInfo.operatingHours || 'Monday - Friday: 9:00 AM - 5:00 PM WAT (UTC+1)',
    responseTimeNotice: contactInfo.responseTimeNotice || 'Within 24 to 48 business hours',
    twitterHandle: contactInfo.twitterHandle || '@NaijaBridge',
    linkedinUrl: contactInfo.linkedinUrl || 'https://linkedin.com/company/naijabridge',
    facebookUrl: contactInfo.facebookUrl || '',
    instagramHandle: contactInfo.instagramHandle || '@naijabridge_org',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [savingStatus, setSavingStatus] = useState<string>('');
  const [draftNotice, setDraftNotice] = useState<{ date: string; data: any } | null>(null);
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    serverData: any;
  } | null>(null);

  const isInitialMount = useRef(true);
  const hasUserEdited = useRef(false);

  // Sync initial contactInfo when loaded from Firestore
  useEffect(() => {
    if (!hasUserEdited.current && contactInfo?.officialEmail) {
      setFormData({
        officialEmail: contactInfo.officialEmail || 'hello@naijabridge.org',
        supportEmail: contactInfo.supportEmail || 'support@naijabridge.org',
        verificationEmail: contactInfo.verificationEmail || 'verify@naijabridge.org',
        pressEmail: contactInfo.pressEmail || 'press@naijabridge.org',
        phone: contactInfo.phone || '+234 800 62452 274',
        phoneSecondary: contactInfo.phoneSecondary || '',
        whatsappNumber: contactInfo.whatsappNumber || '+234 800 62452 274',
        whatsappGroupLink: contactInfo.whatsappGroupLink || '',
        telegramChannelLink: contactInfo.telegramChannelLink || '',
        physicalAddress: contactInfo.physicalAddress || 'Remote Secretariat across Lagos, Abuja, and Enugu, Nigeria',
        operatingHours: contactInfo.operatingHours || 'Monday - Friday: 9:00 AM - 5:00 PM WAT (UTC+1)',
        responseTimeNotice: contactInfo.responseTimeNotice || 'Within 24 to 48 business hours',
        twitterHandle: contactInfo.twitterHandle || '@NaijaBridge',
        linkedinUrl: contactInfo.linkedinUrl || 'https://linkedin.com/company/naijabridge',
        facebookUrl: contactInfo.facebookUrl || '',
        instagramHandle: contactInfo.instagramHandle || '@naijabridge_org',
      });
    }
  }, [contactInfo]);

  // Check for saved draft in Firestore and localStorage on mount
  useEffect(() => {
    const checkDraft = async () => {
      try {
        const fsDraft = await getDraftFromFirestore('contact_info');
        if (fsDraft && fsDraft.formData) {
          setDraftNotice({
            date: new Date(fsDraft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            data: fsDraft.formData,
          });
          return;
        }

        const saved = localStorage.getItem('nb_draft_contact_info');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.formData && parsed?.lastSavedAt) {
            setDraftNotice({
              date: new Date(parsed.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              data: parsed.formData,
            });
          }
        }
      } catch (e) {
        console.warn('Draft check notice:', e);
      }
    };
    checkDraft();
  }, []);

  // 800ms debounced Firestore draft autosave
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    hasUserEdited.current = true;
    setSavingStatus('Editing');

    const timer = setTimeout(async () => {
      if (!navigator.onLine) {
        setSavingStatus('Offline');
        try {
          localStorage.setItem(
            'nb_draft_contact_info',
            JSON.stringify({
              formData,
              lastSavedAt: new Date().toISOString(),
            })
          );
        } catch {}
        return;
      }

      setSavingStatus('Saving draft...');
      try {
        const adminObj = currentAdmin || { uid: 'admin', email: 'admin@naijabridge.org', name: 'Admin' };
        await saveDraftToFirestore('contact_info', formData, adminObj);
        try {
          localStorage.setItem(
            'nb_draft_contact_info',
            JSON.stringify({
              formData,
              lastSavedAt: new Date().toISOString(),
            })
          );
        } catch {}
        setSavingStatus(`Draft saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } catch (e) {
        console.warn('Draft autosave notice:', e);
        setSavingStatus('Save failed — Retry');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData, currentAdmin]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const restoreDraft = () => {
    if (draftNotice?.data) {
      setFormData(draftNotice.data);
      setDraftNotice(null);
      showToast('Saved draft restored.');
    }
  };

  const discardDraft = async () => {
    try {
      await deleteDraftFromFirestore('contact_info');
      localStorage.removeItem('nb_draft_contact_info');
    } catch {}
    setDraftNotice(null);
    showToast('Draft discarded.');
  };

  const handleSubmit = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    if (!canEditContent) {
      alert('Your admin account role does not have permission to modify contact settings.');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSavingStatus('Saving to Firebase');

    try {
      await updateContactInfo(formData, {
        expectedVersion: (contactInfo as any)?.version,
        expectedUpdatedAt: contactInfo?.updatedAt,
        force,
      });
      try {
        await deleteDraftFromFirestore('contact_info');
        localStorage.removeItem('nb_draft_contact_info');
      } catch {}
      setDraftNotice(null);
      setSavingStatus('Published and synced');
      setConflictModal(null);
      showToast('Contact channels and public inquiries configuration saved successfully to Firebase.');
    } catch (err: any) {
      if (err?.code === 'CONFLICT_DETECTED') {
        setSavingStatus('Conflict detected');
        setConflictModal({
          isOpen: true,
          serverData: err.serverData,
        });
      } else {
        setSavingStatus('Save failed');
        setErrorMessage(err?.message || 'Failed to update contact info');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast banner */}
      {toastMessage && (
        <div className="p-3 bg-[#087F5B]/10 border border-[#087F5B]/30 rounded-xl flex items-center gap-2 text-xs text-[#087F5B] font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <h3 className="text-lg font-bold font-display text-[#0B1F33] flex items-center gap-2">
          <Mail className="w-5 h-5 text-[#087F5B]" />
          <span>Public Contact Information & Communication Desk</span>
        </h3>
        <p className="text-xs text-stone-600 mt-0.5">
          These details are displayed on the public Contact page, site footer, opportunity verification disclaimers, and automated response receipts.
        </p>
      </div>

      {/* Draft recovery notice */}
      {draftNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Unsaved edits from {draftNotice.date} were recovered on this device.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreDraft}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold text-[11px] cursor-pointer"
            >
              Restore
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="px-2.5 py-1 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 rounded-lg text-[11px] cursor-pointer"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Official Inquiries & Email Desks */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs space-y-5">
          <h4 className="font-bold text-sm text-[#0B1F33] flex items-center gap-2 border-b border-stone-100 pb-3">
            <Mail className="w-4 h-4 text-[#087F5B]" />
            <span>Official Email Desks</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Official / General Inquiries Email *
              </label>
              <input
                type="email"
                required
                value={formData.officialEmail}
                onChange={(e) => handleChange('officialEmail', e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
              <span className="text-[11px] text-stone-500 mt-0.5 block">
                Displayed in the main Contact page and footer.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Fraud & Scam Verification Desk Email *
              </label>
              <input
                type="email"
                required
                value={formData.verificationEmail}
                onChange={(e) => handleChange('verificationEmail', e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
              <span className="text-[11px] text-stone-500 mt-0.5 block">
                Where citizens report fake recruitment links and predatory recruiters.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Support & Admissions Email
              </label>
              <input
                type="email"
                value={formData.supportEmail}
                onChange={(e) => handleChange('supportEmail', e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Press & Partnership Email
              </label>
              <input
                type="email"
                value={formData.pressEmail}
                onChange={(e) => handleChange('pressEmail', e.target.value)}
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Phone & Instant Messaging Desk */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs space-y-5">
          <h4 className="font-bold text-sm text-[#0B1F33] flex items-center gap-2 border-b border-stone-100 pb-3">
            <MessageCircle className="w-4 h-4 text-[#0F766E]" />
            <span>Telephone & Instant WhatsApp Desk</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Official WhatsApp Desk Number *
              </label>
              <input
                type="text"
                required
                value={formData.whatsappNumber}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="+234 (0) 800-NAIJA-BRG"
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
              <span className="text-[11px] text-stone-500 mt-0.5 block">
                Used for instant 1-click WhatsApp chat launch.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Community WhatsApp Group or Announcement Channel Link
              </label>
              <input
                type="url"
                value={formData.whatsappGroupLink}
                onChange={(e) => handleChange('whatsappGroupLink', e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Direct Helpline Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+234 800 000 0000"
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Secondary Helpline Phone Number
              </label>
              <input
                type="text"
                value={formData.phoneSecondary}
                onChange={(e) => handleChange('phoneSecondary', e.target.value)}
                placeholder="+234 900 000 0000"
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Location, Hours & Service Level Agreement (SLA) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs space-y-5">
          <h4 className="font-bold text-sm text-[#0B1F33] flex items-center gap-2 border-b border-stone-100 pb-3">
            <Clock className="w-4 h-4 text-[#D99A28]" />
            <span>Operating Hours & Public Notice</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Operating Hours (West Africa Time - WAT)
              </label>
              <input
                type="text"
                value={formData.operatingHours}
                onChange={(e) => handleChange('operatingHours', e.target.value)}
                placeholder="Monday - Friday: 9:00 AM - 5:00 PM WAT"
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Expected Response Time Notice
              </label>
              <input
                type="text"
                value={formData.responseTimeNotice}
                onChange={(e) => handleChange('responseTimeNotice', e.target.value)}
                placeholder="Within 24 to 48 business hours"
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-stone-700 mb-1">
                Physical Address / Operating Regional Hubs
              </label>
              <textarea
                rows={2}
                value={formData.physicalAddress}
                onChange={(e) => handleChange('physicalAddress', e.target.value)}
                placeholder="e.g. Remote Secretariat across Lagos, Abuja, and Enugu, Nigeria"
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl p-3 focus:outline-none focus:border-[#087F5B]"
              />
            </div>
          </div>
        </div>

        {/* Card 4: Official Social Presence */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs space-y-5">
          <h4 className="font-bold text-sm text-[#0B1F33] flex items-center gap-2 border-b border-stone-100 pb-3">
            <Share2 className="w-4 h-4 text-purple-600" />
            <span>Social Handles & Profiles</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                LinkedIn Company Page URL
              </label>
              <input
                type="text"
                value={formData.linkedinUrl}
                onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                placeholder="https://linkedin.com/company/naijabridge"
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Twitter / X Handle or Profile URL
              </label>
              <input
                type="text"
                value={formData.twitterHandle}
                onChange={(e) => handleChange('twitterHandle', e.target.value)}
                placeholder="@NaijaBridge"
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Instagram Handle
              </label>
              <input
                type="text"
                value={formData.instagramHandle}
                onChange={(e) => handleChange('instagramHandle', e.target.value)}
                placeholder="@naijabridge_org"
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Telegram Channel Link
              </label>
              <input
                type="text"
                value={formData.telegramChannelLink}
                onChange={(e) => handleChange('telegramChannelLink', e.target.value)}
                placeholder="https://t.me/naijabridge"
                className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
              />
            </div>
          </div>
        </div>

        {/* Action Button & Status */}
        {canEditContent && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
            <div className="text-xs text-stone-500 flex items-center gap-1.5 min-h-[24px]">
              {savingStatus && (
                <>
                  {savingStatus.includes('Unable') || savingStatus.includes('failed') || savingStatus.includes('Conflict') ? (
                    <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  ) : savingStatus.includes('Published') ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-stone-400 animate-spin shrink-0" />
                  )}
                  <span
                    className={
                      savingStatus.includes('Unable') || savingStatus.includes('failed') || savingStatus.includes('Conflict')
                        ? 'text-red-600 font-semibold'
                        : savingStatus.includes('Published')
                        ? 'text-emerald-700 font-semibold'
                        : ''
                    }
                  >
                    {savingStatus}
                  </span>
                </>
              )}
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Syncing to Firebase...' : 'Save Public Contact Info'}</span>
            </button>
          </div>
        )}
      </form>

      {/* Conflict Warning Modal */}
      {conflictModal?.isOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-4 border border-amber-300 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-800">
              <div className="p-2.5 bg-amber-100 rounded-2xl shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h4 className="text-base font-bold font-display text-[#0B1F33]">Simultaneous Edit Conflict</h4>
                <p className="text-xs text-stone-600">Another administrator has updated contact info while you were editing.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#F8F7F2] rounded-2xl border border-[#E4E1D8] text-xs space-y-2 text-stone-700">
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="font-semibold text-stone-500">Document Version</span>
                <span>Your session: <b>v{(contactInfo as any)?.version || 1}</b> → Server: <b>v{conflictModal.serverData?.version || 2}</b></span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="font-semibold text-stone-500">Server Official Email</span>
                <span className="font-medium text-[#0B1F33]">{conflictModal.serverData?.officialEmail || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-stone-500">Last Modified</span>
                <span>{conflictModal.serverData?.updatedAt ? new Date(conflictModal.serverData.updatedAt).toLocaleTimeString() : 'Recently'} by {conflictModal.serverData?.updatedBy?.name || 'Another Admin'}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600">
              To prevent silently overwriting changes made by your colleague, you can reload the server version or force overwrite with your changes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  const s = conflictModal.serverData;
                  if (s) {
                    setFormData((prev) => ({ ...prev, ...s }));
                  }
                  setConflictModal(null);
                  showToast('Loaded latest server version into form.');
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-50 cursor-pointer"
              >
                Reload Server Version
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(undefined, true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Overwrite with My Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
