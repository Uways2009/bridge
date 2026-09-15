import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { ProductResource } from '../../types';
import {
  uploadMediaToStorage,
  saveDraftToFirestore,
  getDraftFromFirestore,
  deleteDraftFromFirestore,
} from '../../lib/firebaseService';
import {
  FileText,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Download,
  ExternalLink,
  ShieldAlert,
  X,
  Search,
  Upload,
  Sparkles,
  Tag,
  AlertTriangle,
  RefreshCw,
  History,
} from 'lucide-react';

export const AdminProductsCMS: React.FC = () => {
  const {
    products,
    createProduct,
    updateProduct,
    archiveProduct,
    restoreProduct,
    permanentDeleteProduct,
    canEditContent,
    canPublishContent,
    canDeletePermanently,
    isSuperAdmin,
    currentAdmin,
  } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResource | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProductResource['category']>('Career Guide');
  const [format, setFormat] = useState<ProductResource['format']>('PDF');
  const [fileUrl, setFileUrl] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [priceNaira, setPriceNaira] = useState(0);
  const [tagsInput, setTagsInput] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');
  const [formError, setFormError] = useState<string | null>(null);
  const [draftNotice, setDraftNotice] = useState<{ date: string; data: any } | null>(null);
  const [savingStatus, setSavingStatus] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
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

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setSavingStatus('Editing');

    const timer = setTimeout(async () => {
      const draftKey = 'product_' + (editingProduct ? editingProduct.id : 'new');
      const formData = {
        title,
        slug,
        description,
        category,
        format,
        fileUrl,
        externalUrl,
        thumbnailUrl,
        isFree,
        priceNaira,
        tagsInput,
        status,
        lastSavedAt: new Date().toISOString(),
      };

      if (!navigator.onLine) {
        setSavingStatus('Offline');
        try {
          localStorage.setItem('nb_draft_prod_' + draftKey, JSON.stringify(formData));
        } catch {}
        return;
      }

      setSavingStatus('Saving draft...');
      try {
        const adminObj = currentAdmin || { uid: 'admin', email: 'admin@naijabridge.org', name: 'Admin' };
        await saveDraftToFirestore(draftKey, formData, adminObj);
        try {
          localStorage.setItem('nb_draft_prod_' + draftKey, JSON.stringify(formData));
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
    editingProduct,
    title,
    slug,
    description,
    category,
    format,
    fileUrl,
    externalUrl,
    thumbnailUrl,
    isFree,
    priceNaira,
    tagsInput,
    status,
    currentAdmin,
  ]);

  const openCreateModal = async () => {
    setEditingProduct(null);
    setTitle('');
    setSlug('');
    setDescription('');
    setCategory('Career Guide');
    setFormat('PDF');
    setFileUrl('');
    setExternalUrl('');
    setThumbnailUrl('');
    setIsFree(true);
    setPriceNaira(0);
    setTagsInput('Career, CV, Nigeria, ATS');
    setStatus('published');
    setFormError(null);
    setSavingStatus('');
    isFirstRender.current = true;

    const draftKey = 'product_new';
    try {
      const fsDraft = await getDraftFromFirestore(draftKey);
      if (fsDraft && fsDraft.formData) {
        setDraftNotice({
          date: new Date(fsDraft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: fsDraft.formData,
        });
      } else {
        const localSaved = localStorage.getItem('nb_draft_prod_' + draftKey);
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

  const openEditModal = async (p: ProductResource) => {
    setEditingProduct(p);
    setTitle(p.title);
    setSlug(p.slug || '');
    setDescription(p.description || '');
    setCategory(p.category || 'Career Guide');
    setFormat(p.format || 'PDF');
    setFileUrl(p.fileUrl || '');
    setExternalUrl(p.externalUrl || '');
    setThumbnailUrl(p.thumbnailUrl || '');
    setIsFree(p.isFree);
    setPriceNaira(p.priceNaira || 0);
    setTagsInput((p.tags || []).join(', '));
    setStatus(p.status || 'published');
    setFormError(null);
    setSavingStatus('');
    isFirstRender.current = true;

    const draftKey = 'product_' + p.id;
    try {
      const fsDraft = await getDraftFromFirestore(draftKey);
      if (fsDraft && fsDraft.formData) {
        setDraftNotice({
          date: new Date(fsDraft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: fsDraft.formData,
        });
      } else {
        const localSaved = localStorage.getItem('nb_draft_prod_' + draftKey);
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
    if (d.slug !== undefined) setSlug(d.slug);
    if (d.description !== undefined) setDescription(d.description);
    if (d.category !== undefined) setCategory(d.category);
    if (d.format !== undefined) setFormat(d.format);
    if (d.fileUrl !== undefined) setFileUrl(d.fileUrl);
    if (d.externalUrl !== undefined) setExternalUrl(d.externalUrl);
    if (d.thumbnailUrl !== undefined) setThumbnailUrl(d.thumbnailUrl);
    if (d.isFree !== undefined) setIsFree(d.isFree);
    if (d.priceNaira !== undefined) setPriceNaira(d.priceNaira);
    if (d.tagsInput !== undefined) setTagsInput(d.tagsInput);
    if (d.status !== undefined) setStatus(d.status);
    setDraftNotice(null);
    showToast('Saved draft restored.');
  };

  const discardDraft = async () => {
    const draftKey = 'product_' + (editingProduct ? editingProduct.id : 'new');
    try {
      await deleteDraftFromFirestore(draftKey);
      localStorage.removeItem('nb_draft_prod_' + draftKey);
    } catch {}
    setDraftNotice(null);
    showToast('Draft discarded.');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setFormError('File size must be under 20MB.');
      return;
    }

    setIsUploadingFile(true);
    setFormError(null);
    try {
      const adminObj = currentAdmin || { uid: 'admin', email: 'admin@naijabridge.org', name: 'Admin' };
      const res = await uploadMediaToStorage(file, 'documents', adminObj);
      setFileUrl(res.downloadUrl);
      showToast('File uploaded to Firebase Storage.');
    } catch (err: any) {
      setFormError(err?.message || 'Failed to upload resource file.');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Product / Resource title is required.');
      return;
    }

    const generatedSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    setIsProcessing(true);
    setSavingStatus('Saving to Firebase');
    setFormError(null);

    const draftKey = 'product_' + (editingProduct ? editingProduct.id : 'new');

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          title: title.trim(),
          slug: generatedSlug,
          description: description.trim(),
          category,
          format,
          fileUrl: fileUrl.trim(),
          externalUrl: externalUrl.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
          isFree,
          priceNaira: isFree ? 0 : Number(priceNaira),
          tags: parsedTags,
          status,
        });
        try {
          await deleteDraftFromFirestore(draftKey);
          localStorage.removeItem('nb_draft_prod_' + draftKey);
        } catch {}
        setDraftNotice(null);
        setSavingStatus('Published and synced');
        showToast(`Resource "${title}" updated.`);
      } else {
        await createProduct({
          title: title.trim(),
          slug: generatedSlug,
          description: description.trim(),
          category,
          format,
          fileUrl: fileUrl.trim(),
          externalUrl: externalUrl.trim(),
          thumbnailUrl: thumbnailUrl.trim(),
          isFree,
          priceNaira: isFree ? 0 : Number(priceNaira),
          downloadsCount: 0,
          tags: parsedTags,
          status,
        });
        try {
          await deleteDraftFromFirestore(draftKey);
          localStorage.removeItem('nb_draft_prod_' + draftKey);
        } catch {}
        setDraftNotice(null);
        setSavingStatus('Published and synced');
        showToast(`Resource "${title}" published.`);
      }
      setTimeout(() => {
        setModalOpen(false);
      }, 500);
    } catch (err: any) {
      setSavingStatus('Save failed');
      setFormError(err?.message || 'Failed to save product/resource.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async (id: string, resName: string) => {
    if (!canPublishContent) {
      alert('Your role lacks permission to archive resources.');
      return;
    }
    try {
      await archiveProduct(id);
      showToast(`Resource "${resName}" archived.`);
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Failed to archive'}`);
    }
  };

  const handleRestore = async (id: string, resName: string) => {
    try {
      await restoreProduct(id);
      showToast(`Resource "${resName}" restored to published.`);
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Failed to restore'}`);
    }
  };

  const handlePermanentDelete = async (id: string, resName: string) => {
    if (!canDeletePermanently) {
      alert('Only Super Administrators can permanently delete resources.');
      return;
    }
    try {
      await permanentDeleteProduct(id);
      setConfirmDeleteId(null);
      showToast(`Resource "${resName}" permanently deleted.`);
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Failed to delete'}`);
    }
  };

  const filteredProducts = products.filter((p) => {
    if (statusFilter !== 'all') {
      const currentStatus = p.status || 'published';
      if (currentStatus !== statusFilter) return false;
    }
    if (categoryFilter !== 'all') {
      if (p.category !== categoryFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
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
            <FileText className="w-5 h-5 text-[#087F5B]" />
            <span>Digital Products & Downloadable Resources</span>
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            Manage ATS CV templates, scholarship proposal roadmaps, and SME digital toolkits.
          </p>
        </div>

        {canEditContent && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Resource</span>
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
              {tab === 'all' ? `All (${products.length})` : tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources, templates, tags..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl bg-[#F8F7F2] border border-[#E4E1D8] text-xs focus:outline-none focus:border-[#087F5B]"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E4E1D8] text-center space-y-3">
          <FileText className="w-10 h-10 text-stone-300 mx-auto" />
          <h4 className="font-bold text-sm text-[#0B1F33]">No products or resources found</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No item matched your search filter.'
              : 'No resources created yet. Click "Add New Resource" to upload or link materials.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => {
            const isArchived = p.status === 'archived';
            const isDraft = p.status === 'draft';
            return (
              <div
                key={p.id}
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
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700">
                      {p.format} • {p.category}
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.isFree
                          ? 'bg-[#087F5B]/10 text-[#087F5B]'
                          : 'bg-[#D99A28]/20 text-[#885A09]'
                      }`}
                    >
                      {p.isFree ? 'Free Download' : `₦${Number(p.priceNaira || 0).toLocaleString()}`}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-base text-[#0B1F33] leading-snug">{p.title}</h4>
                    <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  {p.tags && p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-stone-100 text-[10px] text-stone-600 font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E4E1D8] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {p.fileUrl && (
                      <a
                        href={p.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg hover:bg-emerald-50 text-[#087F5B] transition-colors"
                        title="Download or View File"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    {p.externalUrl && (
                      <a
                        href={p.externalUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
                        title="Open External Resource"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isArchived
                          ? 'bg-stone-200 text-stone-700'
                          : isDraft
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.status || 'published'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {canEditContent && (
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 cursor-pointer"
                        title="Edit Resource"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {isArchived ? (
                      <>
                        <button
                          onClick={() => handleRestore(p.id, p.title)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-[#087F5B] cursor-pointer"
                          title="Restore Resource to Published"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        {canDeletePermanently && (
                          <button
                            onClick={() => setConfirmDeleteId(p.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                            title="Permanently Delete Resource"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      canPublishContent && (
                        <button
                          onClick={() => handleArchive(p.id, p.title)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
                          title="Archive Resource"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Confirm Permanent Delete */}
                {confirmDeleteId === p.id && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 mt-2">
                    <p className="text-xs text-red-800 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Permanently delete this resource?</span>
                    </p>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 text-[11px] bg-white border border-stone-200 rounded-lg text-stone-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(p.id, p.title)}
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

      {/* Modal: Create or Edit Resource */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-[#E4E1D8] shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D8]">
              <h3 className="font-bold text-lg font-display text-[#0B1F33]">
                {editingProduct ? `Edit Resource: ${editingProduct.title}` : 'Add Product / Resource'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Draft Notice Banner */}
            {draftNotice && (
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Saved draft found from <b>{draftNotice.date}</b>.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={restoreDraft}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer text-[11px]"
                  >
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={discardDraft}
                    className="px-2 py-1 text-stone-500 hover:text-stone-800 font-medium cursor-pointer text-[11px]"
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
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Master ATS Resume Pack for Nigerian Tech Talent"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="Career Guide">Career Guide</option>
                    <option value="Resume Template">Resume Template</option>
                    <option value="Funding & Grant">Funding & Grant</option>
                    <option value="Tech Toolkit">Tech Toolkit</option>
                    <option value="SME Resource">SME Resource</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="PDF">PDF Document</option>
                    <option value="DOCX">Microsoft Word (DOCX)</option>
                    <option value="Spreadsheet">Spreadsheet (Excel / Sheets)</option>
                    <option value="ZIP">ZIP Bundle</option>
                    <option value="Link">External Link / Web Tool</option>
                  </select>
                </div>
              </div>

              {/* Upload or File URL */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Resource File (Firebase Storage or URL)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://... or click Upload File"
                    className="flex-1 bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#087F5B]"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploadingFile}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingFile ? 'Uploading...' : 'Upload'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">External Resource URL (Optional)</label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is contained in this resource and who is it designed for?"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl p-3 focus:outline-none focus:border-[#087F5B] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Pricing Model</label>
                  <select
                    value={isFree ? 'free' : 'paid'}
                    onChange={(e) => {
                      const free = e.target.value === 'free';
                      setIsFree(free);
                      if (free) setPriceNaira(0);
                    }}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="free">100% Free</option>
                    <option value="paid">Subsidized Price (₦)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Price in Naira (₦)</label>
                  <input
                    type="number"
                    disabled={isFree}
                    value={priceNaira}
                    onChange={(e) => setPriceNaira(Number(e.target.value))}
                    className={`w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B] ${
                      isFree ? 'opacity-40 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Publishing Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="e.g. ATS, Resume, CV, Remote, Scholarship"
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#E4E1D8]">
                <div className="text-xs text-stone-500 flex items-center gap-1.5 min-h-[24px]">
                  {savingStatus && (
                    <>
                      {savingStatus.includes('failed') ? (
                        <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      ) : savingStatus.includes('Published') || savingStatus.includes('saved') ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <RefreshCw className="w-4 h-4 text-stone-400 animate-spin shrink-0" />
                      )}
                      <span
                        className={
                          savingStatus.includes('failed')
                            ? 'text-red-600 font-semibold'
                            : savingStatus.includes('Published') || savingStatus.includes('saved')
                            ? 'text-emerald-700 font-semibold'
                            : 'text-stone-500'
                        }
                      >
                        {savingStatus}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3">
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
                    {isProcessing ? 'Saving to Firebase...' : editingProduct ? 'Save Updates' : 'Publish Resource'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
