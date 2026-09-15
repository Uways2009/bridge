import React, { useState, useEffect, useRef } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { SupportService } from '../../types';
import {
  saveDraftToFirestore,
  getDraftFromFirestore,
  deleteDraftFromFirestore,
} from '../../lib/firebaseService';
import {
  Briefcase,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Clock,
  ShieldAlert,
  X,
  Search,
  Check,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  History,
} from 'lucide-react';

export const AdminServicesCMS: React.FC = () => {
  const {
    services,
    createService,
    updateService,
    archiveService,
    restoreService,
    permanentDeleteService,
    canEditContent,
    canPublishContent,
    canDeletePermanently,
    isSuperAdmin,
    syncStatus,
    currentAdmin,
  } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<SupportService | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<SupportService['category']>('Career Support');
  const [isFree, setIsFree] = useState(true);
  const [priceNaira, setPriceNaira] = useState(0);
  const [deliveryTime, setDeliveryTime] = useState('48-72 hours');
  const [description, setDescription] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [ctaText, setCtaText] = useState('Request Service');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [formError, setFormError] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<{ date: string; data: any } | null>(null);
  const [savingStatus, setSavingStatus] = useState<string>('');
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    serverData: any;
    ourUpdates: any;
  } | null>(null);

  const isFirstRender = useRef(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 800ms debounced Firestore draft autosave
  useEffect(() => {
    if (!modalOpen) {
      isFirstRender.current = true;
      return;
    }

    // Skip autosave on initial load of modal
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSavingStatus('Editing');

    const timer = setTimeout(async () => {
      const draftKey = 'service_' + (editingService ? editingService.id : 'new');
      const formData = {
        title,
        tagline,
        category,
        isFree,
        priceNaira,
        deliveryTime,
        description,
        featuresText,
        ctaText,
        status,
        lastSavedAt: new Date().toISOString(),
      };

      if (!navigator.onLine) {
        setSavingStatus('Offline');
        try {
          localStorage.setItem('nb_draft_service_' + draftKey, JSON.stringify(formData));
        } catch {}
        return;
      }

      setSavingStatus('Saving draft...');
      try {
        const adminObj = currentAdmin || { uid: 'admin', email: 'admin@naijabridge.org', name: 'Admin' };
        await saveDraftToFirestore(draftKey, formData, adminObj);
        try {
          localStorage.setItem('nb_draft_service_' + draftKey, JSON.stringify(formData));
        } catch {}
        setSavingStatus(`Draft saved at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      } catch (err) {
        console.warn('Draft save notice:', err);
        setSavingStatus('Save failed — Retry');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    modalOpen,
    editingService,
    title,
    tagline,
    category,
    isFree,
    priceNaira,
    deliveryTime,
    description,
    featuresText,
    ctaText,
    status,
    currentAdmin,
  ]);

  const openCreateModal = async () => {
    setEditingService(null);
    setTitle('');
    setTagline('');
    setCategory('Career Support');
    setIsFree(true);
    setPriceNaira(0);
    setDeliveryTime('48-72 hours');
    setDescription('');
    setFeaturesText('ATS-optimized format\nDirect WhatsApp feedback\n7-day revision period');
    setCtaText('Request Free Consultation');
    setStatus('published');
    setFormError(null);
    setSavingStatus('');
    isFirstRender.current = true;

    // Check for existing unsaved draft in Firestore and localStorage
    const draftKey = 'service_new';
    try {
      const fsDraft = await getDraftFromFirestore(draftKey);
      if (fsDraft && fsDraft.formData) {
        setDraftNotice({
          date: new Date(fsDraft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: fsDraft.formData,
        });
      } else {
        const localSaved = localStorage.getItem('nb_draft_service_' + draftKey);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          setDraftNotice({
            date: new Date(parsed.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            data: parsed,
          });
        } else {
          setDraftNotice(null);
        }
      }
    } catch {
      setDraftNotice(null);
    }

    setModalOpen(true);
  };

  const openEditModal = async (svc: SupportService) => {
    setEditingService(svc);
    setTitle(svc.title);
    setTagline(svc.tagline || '');
    setCategory(svc.category || 'Career Support');
    setIsFree(svc.isFree);
    setPriceNaira(svc.priceNaira || 0);
    setDeliveryTime(svc.deliveryTime || '48-72 hours');
    setDescription(svc.description || '');
    setFeaturesText((svc.features || []).join('\n'));
    setCtaText(svc.ctaText || 'Request Service');
    setStatus(svc.status || 'published');
    setFormError(null);
    setSavingStatus('');
    isFirstRender.current = true;

    // Check for existing unsaved draft in Firestore and localStorage
    const draftKey = 'service_' + svc.id;
    try {
      const fsDraft = await getDraftFromFirestore(draftKey);
      if (fsDraft && fsDraft.formData) {
        setDraftNotice({
          date: new Date(fsDraft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: fsDraft.formData,
        });
      } else {
        const localSaved = localStorage.getItem('nb_draft_service_' + draftKey);
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          setDraftNotice({
            date: new Date(parsed.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            data: parsed,
          });
        } else {
          setDraftNotice(null);
        }
      }
    } catch {
      setDraftNotice(null);
    }

    setModalOpen(true);
  };

  const restoreDraft = () => {
    if (!draftNotice?.data) return;
    const d = draftNotice.data;
    if (d.title !== undefined) setTitle(d.title);
    if (d.tagline !== undefined) setTagline(d.tagline);
    if (d.category !== undefined) setCategory(d.category);
    if (d.isFree !== undefined) setIsFree(d.isFree);
    if (d.priceNaira !== undefined) setPriceNaira(d.priceNaira);
    if (d.deliveryTime !== undefined) setDeliveryTime(d.deliveryTime);
    if (d.description !== undefined) setDescription(d.description);
    if (d.featuresText !== undefined) setFeaturesText(d.featuresText);
    if (d.ctaText !== undefined) setCtaText(d.ctaText);
    if (d.status !== undefined) setStatus(d.status);
    setDraftNotice(null);
    showToast('Saved draft restored.');
  };

  const discardDraft = async () => {
    const draftKey = 'service_' + (editingService ? editingService.id : 'new');
    try {
      await deleteDraftFromFirestore(draftKey);
      localStorage.removeItem('nb_draft_service_' + draftKey);
    } catch {}
    setDraftNotice(null);
    showToast('Draft discarded.');
  };

  const handleSubmit = async (e?: React.FormEvent, force: boolean = false) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setFormError('Service title is required.');
      return;
    }

    const parsedFeatures = featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    setIsProcessing(true);
    setSavingStatus('Saving to Firebase');
    setFormError(null);

    const draftKey = 'service_' + (editingService ? editingService.id : 'new');

    try {
      if (editingService) {
        await updateService(
          editingService.id,
          {
            title: title.trim(),
            tagline: tagline.trim(),
            category,
            isFree,
            priceNaira: isFree ? 0 : Number(priceNaira),
            deliveryTime: deliveryTime.trim(),
            description: description.trim(),
            features: parsedFeatures,
            ctaText: ctaText.trim(),
            status,
          },
          {
            expectedVersion: (editingService as any).version,
            expectedUpdatedAt: editingService.updatedAt,
            force,
          }
        );
        try {
          await deleteDraftFromFirestore(draftKey);
          localStorage.removeItem('nb_draft_service_' + draftKey);
        } catch {}
        setDraftNotice(null);
        setSavingStatus('Published and synced');
        showToast(`Service "${title}" published and synced.`);
      } else {
        const ok = await createService({
          title: title.trim(),
          tagline: tagline.trim(),
          category,
          isFree,
          priceNaira: isFree ? 0 : Number(priceNaira),
          deliveryTime: deliveryTime.trim(),
          description: description.trim(),
          features: parsedFeatures,
          ctaText: ctaText.trim(),
          status,
        });
        if (!ok) {
          throw new Error('Failed to create service. Please verify administrator permissions.');
        }
        try {
          await deleteDraftFromFirestore(draftKey);
          localStorage.removeItem('nb_draft_service_' + draftKey);
        } catch {}
        setDraftNotice(null);
        setSavingStatus('Published and synced');
        showToast(`New service "${title}" created and saved.`);
      }
      setTimeout(() => {
        setModalOpen(false);
        setConflictModal(null);
      }, 500);
    } catch (err: any) {
      if (err?.code === 'CONFLICT_DETECTED') {
        setSavingStatus('Conflict detected');
        setConflictModal({
          isOpen: true,
          serverData: err.serverData,
          ourUpdates: {
            title: title.trim(),
            tagline: tagline.trim(),
            category,
            isFree,
            priceNaira: isFree ? 0 : Number(priceNaira),
            deliveryTime: deliveryTime.trim(),
            description: description.trim(),
            features: parsedFeatures,
            ctaText: ctaText.trim(),
            status,
          },
        });
      } else {
        setSavingStatus('Unable to save. Retry');
        setFormError(err?.message || 'Failed to save service changes.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!canPublishContent) {
      alert('Your account role does not have permission to archive services.');
      return;
    }
    try {
      await archiveService(id);
      showToast(`Service "${name}" moved to archives.`);
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Failed to archive'}`);
    }
  };

  const handleRestore = async (id: string, name: string) => {
    try {
      await restoreService(id);
      showToast(`Service "${name}" restored to published status.`);
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Failed to restore'}`);
    }
  };

  const handlePermanentDelete = async (id: string, name: string) => {
    if (!canDeletePermanently) {
      alert('Only Super Administrators can permanently delete services.');
      return;
    }
    try {
      await permanentDeleteService(id);
      setConfirmDeleteId(null);
      showToast(`Service "${name}" permanently deleted from database.`);
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Failed to delete'}`);
    }
  };

  const filteredServices = services.filter((svc) => {
    if (statusFilter !== 'all') {
      const currentStatus = svc.status || 'published';
      if (currentStatus !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        svc.title.toLowerCase().includes(q) ||
        (svc.description && svc.description.toLowerCase().includes(q)) ||
        (svc.tagline && svc.tagline.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast banner */}
      {toastMessage && (
        <div className="p-3 bg-[#087F5B]/10 border border-[#087F5B]/30 rounded-xl flex items-center gap-2 text-xs text-[#087F5B] font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold font-display text-[#0B1F33] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#087F5B]" />
            <span>Support Services & Pricing Packages</span>
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            Manage public career reviews, SME portfolios, and application clinics. Approved updates sync in real-time.
          </p>
        </div>

        {canEditContent && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Service</span>
          </button>
        )}
      </div>

      {/* Filter and search row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#E4E1D8]">
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['all', 'published', 'draft', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                statusFilter === tab
                  ? 'bg-[#0B1F33] text-white'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              {tab === 'all' ? `All (${services.length})` : tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search service title or terms..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl bg-[#F8F7F2] border border-[#E4E1D8] text-xs focus:outline-none focus:border-[#087F5B]"
          />
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E4E1D8] text-center space-y-3">
          <Briefcase className="w-10 h-10 text-stone-300 mx-auto" />
          <h4 className="font-bold text-sm text-[#0B1F33]">No services found</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No service matches your search criteria. Try a different query.'
              : 'No services in this category yet. Click "Add New Service" to create one.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((svc) => {
            const isArchived = svc.status === 'archived';
            const isDraft = svc.status === 'draft';
            return (
              <div
                key={svc.id}
                className={`p-5 rounded-3xl bg-white border transition-all flex flex-col justify-between space-y-4 ${
                  isArchived
                    ? 'border-stone-300 bg-stone-50/70 opacity-75'
                    : isDraft
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-[#E4E1D8] shadow-xs hover:border-[#087F5B]/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isArchived
                          ? 'bg-stone-200 text-stone-700'
                          : isDraft
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#087F5B]/10 text-[#087F5B]'
                      }`}
                    >
                      {svc.status || 'published'}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        svc.isFree
                          ? 'bg-[#087F5B] text-white'
                          : 'bg-[#D99A28]/20 text-[#885A09]'
                      }`}
                    >
                      {svc.isFree
                        ? '100% Free'
                        : `₦${Number(svc.priceNaira || 0).toLocaleString()}`}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-[#0B1F33] leading-snug">{svc.title}</h4>
                    {svc.tagline && (
                      <p className="text-xs text-[#087F5B] font-medium mt-0.5">{svc.tagline}</p>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {svc.description}
                  </p>

                  {svc.features && svc.features.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                        Included Deliverables
                      </span>
                      <ul className="space-y-1">
                        {svc.features.slice(0, 3).map((feat, i) => (
                          <li key={i} className="text-xs text-stone-600 flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-[#087F5B] shrink-0" />
                            <span className="truncate">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E4E1D8] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-stone-500">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{svc.deliveryTime || '48h delivery'}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    {canEditContent && (
                      <button
                        onClick={() => openEditModal(svc)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 cursor-pointer"
                        title="Edit Service Details"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {isArchived ? (
                      <>
                        <button
                          onClick={() => handleRestore(svc.id, svc.title)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-[#087F5B] cursor-pointer"
                          title="Restore Service to Published"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        {canDeletePermanently && (
                          <button
                            onClick={() => setConfirmDeleteId(svc.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                            title="Permanently Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      canPublishContent && (
                        <button
                          onClick={() => handleArchive(svc.id, svc.title)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
                          title="Archive (Soft Delete)"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Permanent Delete Confirmation Dialog */}
                {confirmDeleteId === svc.id && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 mt-2">
                    <p className="text-xs text-red-800 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Permanently delete this service?</span>
                    </p>
                    <p className="text-[11px] text-red-700">
                      This action cannot be undone. It will be removed from Firestore immediately.
                    </p>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 text-[11px] bg-white border border-stone-200 rounded-lg text-stone-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(svc.id, svc.title)}
                        className="px-2.5 py-1 text-[11px] bg-red-600 text-white rounded-lg font-bold"
                      >
                        Yes, Delete Forever
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create or Edit Service */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-[#E4E1D8] shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D8]">
              <h3 className="font-bold text-lg font-display text-[#0B1F33]">
                {editingService ? `Edit Service: ${editingService.title}` : 'Add New Support Service'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Unsaved Local Draft Recovery Banner */}
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

            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Service Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. ATS Resume & CV Redesign"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Tagline / Subtitle</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Modernized for international recruiters"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="Career Support">Career Support</option>
                    <option value="Business & SME">Business & SME</option>
                    <option value="Scholarship & Academic">Scholarship & Academic</option>
                    <option value="Technical Mentorship">Technical Mentorship</option>
                    <option value="Digital Assets">Digital Assets</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pricing Model</label>
                  <select
                    value={isFree ? 'free' : 'paid'}
                    onChange={(e) => {
                      const free = e.target.value === 'free';
                      setIsFree(free);
                      if (free) setPriceNaira(0);
                    }}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="free">100% Free (Community)</option>
                    <option value="paid">Subsidized Paid (₦)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    Price in Naira (₦)
                  </label>
                  <input
                    type="number"
                    disabled={isFree}
                    value={priceNaira}
                    onChange={(e) => setPriceNaira(Number(e.target.value))}
                    className={`w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#087F5B] ${
                      isFree ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Delivery Timeline</label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    placeholder="e.g. 48-72 hours or 3-5 business days"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">CTA Button Text</label>
                  <input
                    type="text"
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. Request Review or Schedule Call"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Service Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what this service provides and how it assists Nigerian applicants or business owners."
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl p-3 text-xs focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Features / Deliverables (One per line)
                </label>
                <textarea
                  rows={3}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="ATS keyword check&#10;Grammar and impact phrasing&#10;WhatsApp consultation"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl p-3 text-xs focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Publishing Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#087F5B]"
                >
                  <option value="published">Published (Visible on Public Website)</option>
                  <option value="draft">Draft (Admin eyes only)</option>
                  <option value="archived">Archived (Hidden from public)</option>
                </select>
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#E4E1D8]">
                <div className="text-[11px] text-stone-500 flex items-center gap-1.5 min-h-[20px]">
                  {savingStatus && (
                    <>
                      {savingStatus.includes('Unable') ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      ) : savingStatus.includes('Published') ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      ) : (
                        <RefreshCw className="w-3.5 h-3.5 text-stone-400 animate-spin shrink-0" />
                      )}
                      <span
                        className={
                          savingStatus.includes('Unable')
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
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 font-semibold cursor-pointer hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white font-semibold cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isProcessing ? 'Saving to Firebase...' : editingService ? 'Save Updates' : 'Publish Service'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

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
                <p className="text-xs text-stone-600">Another administrator has updated this service while you were editing.</p>
              </div>
            </div>

            <div className="p-3.5 bg-[#F8F7F2] rounded-2xl border border-[#E4E1D8] text-xs space-y-2 text-stone-700">
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="font-semibold text-stone-500">Document Version</span>
                <span>Your session: <b>v{(editingService as any)?.version || 1}</b> → Server: <b>v{conflictModal.serverData?.version || 2}</b></span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-1.5">
                <span className="font-semibold text-stone-500">Current Server Title</span>
                <span className="font-medium text-[#0B1F33]">{conflictModal.serverData?.title || 'Unknown'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-stone-500">Last Modified</span>
                <span>{conflictModal.serverData?.updatedAt ? new Date(conflictModal.serverData.updatedAt).toLocaleTimeString() : 'Recently'} by {conflictModal.serverData?.updatedBy?.name || 'Another Admin'}</span>
              </div>
            </div>

            <p className="text-xs text-stone-600">
              To prevent silently overwriting work by another admin, choose whether to reload the latest server data or overwrite it with your edits.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  const s = conflictModal.serverData;
                  if (s) {
                    setTitle(s.title || '');
                    setTagline(s.tagline || '');
                    setCategory(s.category || 'Career Support');
                    setIsFree(s.isFree ?? true);
                    setPriceNaira(s.priceNaira || 0);
                    setDeliveryTime(s.deliveryTime || '48-72 hours');
                    setDescription(s.description || '');
                    setFeaturesText((s.features || []).join('\n'));
                    setCtaText(s.ctaText || 'Request Service');
                    setStatus(s.status || 'published');
                    if (editingService) {
                      setEditingService({ ...editingService, ...s });
                    }
                  }
                  setConflictModal(null);
                  showToast('Loaded latest server version into editor.');
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
