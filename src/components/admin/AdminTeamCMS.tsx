import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { TeamMember } from '../../types';
import {
  uploadMediaToStorage,
  saveDraftToFirestore,
  getDraftFromFirestore,
  deleteDraftFromFirestore,
} from '../../lib/firebaseService';
import {
  Users,
  Plus,
  Edit2,
  Archive,
  RotateCcw,
  Trash2,
  CheckCircle2,
  ShieldAlert,
  X,
  Search,
  Linkedin,
  Twitter,
  Globe,
  Upload,
  Image as ImageIcon,
  AlertTriangle,
  RefreshCw,
  History,
} from 'lucide-react';

export const AdminTeamCMS: React.FC = () => {
  const {
    teamMembers,
    createTeamMember,
    updateTeamMember,
    archiveTeamMember,
    restoreTeamMember,
    permanentDeleteTeamMember,
    canEditContent,
    canPublishContent,
    canDeletePermanently,
    isSuperAdmin,
    currentAdmin,
  } = useAdmin();

  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [location, setLocation] = useState('Lagos, Nigeria');
  const [editableNote, setEditableNote] = useState('Founding Steward');
  const [linkedin, setLinkedin] = useState('');
  const [twitter, setTwitter] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [displayOrder, setDisplayOrder] = useState(1);
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
      const draftKey = 'team_' + (editingMember ? editingMember.id : 'new');
      const formData = {
        name,
        role,
        bio,
        photoUrl,
        location,
        editableNote,
        linkedin,
        twitter,
        portfolio,
        displayOrder,
        status,
        lastSavedAt: new Date().toISOString(),
      };

      if (!navigator.onLine) {
        setSavingStatus('Offline');
        try {
          localStorage.setItem('nb_draft_team_' + draftKey, JSON.stringify(formData));
        } catch {}
        return;
      }

      setSavingStatus('Saving draft...');
      try {
        const adminObj = currentAdmin || { uid: 'admin', email: 'admin@naijabridge.org', name: 'Admin' };
        await saveDraftToFirestore(draftKey, formData, adminObj);
        try {
          localStorage.setItem('nb_draft_team_' + draftKey, JSON.stringify(formData));
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
    editingMember,
    name,
    role,
    bio,
    photoUrl,
    location,
    editableNote,
    linkedin,
    twitter,
    portfolio,
    displayOrder,
    status,
    currentAdmin,
  ]);

  const openCreateModal = async () => {
    setEditingMember(null);
    setName('');
    setRole('');
    setBio('');
    setPhotoUrl('');
    setLocation('Lagos, Nigeria');
    setEditableNote('Founding Steward');
    setLinkedin('');
    setTwitter('');
    setPortfolio('');
    setDisplayOrder((teamMembers.length || 0) + 1);
    setStatus('published');
    setFormError(null);
    setSavingStatus('');
    isFirstRender.current = true;

    const draftKey = 'team_new';
    try {
      const fsDraft = await getDraftFromFirestore(draftKey);
      if (fsDraft && fsDraft.formData) {
        setDraftNotice({
          date: new Date(fsDraft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: fsDraft.formData,
        });
      } else {
        const localSaved = localStorage.getItem('nb_draft_team_' + draftKey);
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

  const openEditModal = async (m: TeamMember) => {
    setEditingMember(m);
    setName(m.name);
    setRole(m.role);
    setBio(m.bio);
    setPhotoUrl(m.photoUrl || '');
    setLocation(m.location || 'Nigeria');
    setEditableNote(m.editableNote || 'Founding Steward');
    setLinkedin(m.linkedin || '');
    setTwitter(m.twitter || '');
    setPortfolio(m.portfolio || '');
    setDisplayOrder(m.displayOrder || 1);
    setStatus(m.status || 'published');
    setFormError(null);
    setSavingStatus('');
    isFirstRender.current = true;

    const draftKey = 'team_' + m.id;
    try {
      const fsDraft = await getDraftFromFirestore(draftKey);
      if (fsDraft && fsDraft.formData) {
        setDraftNotice({
          date: new Date(fsDraft.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: fsDraft.formData,
        });
      } else {
        const localSaved = localStorage.getItem('nb_draft_team_' + draftKey);
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
    if (d.name !== undefined) setName(d.name);
    if (d.role !== undefined) setRole(d.role);
    if (d.bio !== undefined) setBio(d.bio);
    if (d.photoUrl !== undefined) setPhotoUrl(d.photoUrl);
    if (d.location !== undefined) setLocation(d.location);
    if (d.editableNote !== undefined) setEditableNote(d.editableNote);
    if (d.linkedin !== undefined) setLinkedin(d.linkedin);
    if (d.twitter !== undefined) setTwitter(d.twitter);
    if (d.portfolio !== undefined) setPortfolio(d.portfolio);
    if (d.displayOrder !== undefined) setDisplayOrder(d.displayOrder);
    if (d.status !== undefined) setStatus(d.status);
    setDraftNotice(null);
    showToast('Saved draft restored.');
  };

  const discardDraft = async () => {
    const draftKey = 'team_' + (editingMember ? editingMember.id : 'new');
    try {
      await deleteDraftFromFirestore(draftKey);
      localStorage.removeItem('nb_draft_team_' + draftKey);
    } catch {}
    setDraftNotice(null);
    showToast('Draft discarded.');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError('Image file size must be less than 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    setSavingStatus('Uploading');
    setFormError(null);
    try {
      const adminObj = currentAdmin || { uid: 'admin', email: 'admin@naijabridge.org', name: 'Admin' };
      const res = await uploadMediaToStorage(file, 'content', adminObj);
      setPhotoUrl(res.downloadUrl);
      setSavingStatus('Draft saved');
      showToast('Photo uploaded to Firebase Storage.');
    } catch (err: any) {
      setSavingStatus('Upload failed');
      setFormError(err?.message || 'Failed to upload photo.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      setFormError('Name and official role are required.');
      return;
    }

    setIsProcessing(true);
    setSavingStatus('Saving to Firebase');
    setFormError(null);

    const draftKey = 'team_' + (editingMember ? editingMember.id : 'new');

    try {
      if (editingMember) {
        await updateTeamMember(editingMember.id, {
          name: name.trim(),
          role: role.trim(),
          bio: bio.trim(),
          photoUrl: photoUrl.trim(),
          location: location.trim(),
          editableNote: editableNote.trim(),
          linkedin: linkedin.trim(),
          twitter: twitter.trim(),
          portfolio: portfolio.trim(),
          displayOrder: Number(displayOrder),
          status,
        });
        try {
          await deleteDraftFromFirestore(draftKey);
          localStorage.removeItem('nb_draft_team_' + draftKey);
        } catch {}
        setDraftNotice(null);
        setSavingStatus('Published and synced');
        showToast(`Team profile for "${name}" updated.`);
      } else {
        await createTeamMember({
          name: name.trim(),
          role: role.trim(),
          bio: bio.trim(),
          photoUrl: photoUrl.trim(),
          location: location.trim(),
          editableNote: editableNote.trim(),
          linkedin: linkedin.trim(),
          twitter: twitter.trim(),
          portfolio: portfolio.trim(),
          displayOrder: Number(displayOrder),
          status,
        });
        try {
          await deleteDraftFromFirestore(draftKey);
          localStorage.removeItem('nb_draft_team_' + draftKey);
        } catch {}
        setDraftNotice(null);
        setSavingStatus('Published and synced');
        showToast(`Team profile for "${name}" published.`);
      }
      setTimeout(() => {
        setModalOpen(false);
      }, 500);
    } catch (err: any) {
      setSavingStatus('Save failed');
      setFormError(err?.message || 'Failed to save team member.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleArchive = async (id: string, memberName: string) => {
    if (!canPublishContent) {
      alert('Your role lacks permission to archive team members.');
      return;
    }
    try {
      await archiveTeamMember(id);
      showToast(`Profile for "${memberName}" archived.`);
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Failed to archive'}`);
    }
  };

  const handleRestore = async (id: string, memberName: string) => {
    try {
      await restoreTeamMember(id);
      showToast(`Profile for "${memberName}" restored to active status.`);
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Failed to restore'}`);
    }
  };

  const handlePermanentDelete = async (id: string, memberName: string) => {
    if (!canDeletePermanently) {
      alert('Only Super Administrators can permanently delete team profiles.');
      return;
    }
    try {
      await permanentDeleteTeamMember(id);
      setConfirmDeleteId(null);
      showToast(`Profile for "${memberName}" permanently deleted.`);
    } catch (err: any) {
      alert(`Error: ${err?.message || 'Failed to delete'}`);
    }
  };

  const filteredMembers = teamMembers.filter((m) => {
    if (statusFilter !== 'all') {
      const currentStatus = m.status || 'published';
      if (currentStatus !== statusFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        (m.bio && m.bio.toLowerCase().includes(q))
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
            <Users className="w-5 h-5 text-[#087F5B]" />
            <span>Founding & Advisory Team Profiles</span>
          </h3>
          <p className="text-xs text-stone-600 mt-0.5">
            Manage profiles displayed on the public About page. Published changes sync in real-time.
          </p>
        </div>

        {canEditContent && (
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#066548] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member</span>
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
              {tab === 'all' ? `All (${teamMembers.length})` : tab}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, role, or bio..."
            className="w-full sm:w-64 pl-8 pr-3 py-1.5 rounded-xl bg-[#F8F7F2] border border-[#E4E1D8] text-xs focus:outline-none focus:border-[#087F5B]"
          />
        </div>
      </div>

      {/* Grid */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#E4E1D8] text-center space-y-3">
          <Users className="w-10 h-10 text-stone-300 mx-auto" />
          <h4 className="font-bold text-sm text-[#0B1F33]">No team profiles found</h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No team member matched your query.'
              : 'No team members in this filter. Click "Add Team Member" to create a new profile.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMembers.map((m) => {
            const isArchived = m.status === 'archived';
            const isDraft = m.status === 'draft';
            return (
              <div
                key={m.id}
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
                    <div className="flex items-center gap-3">
                      {m.photoUrl && m.photoUrl.trim() !== '' ? (
                        <img
                          src={m.photoUrl}
                          alt={m.name}
                          className="w-12 h-12 rounded-2xl object-cover border border-[#E4E1D8]"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-[#0B1F33] text-white flex items-center justify-center font-bold text-sm">
                          {m.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-[#0B1F33]">{m.name}</h4>
                        <p className="text-xs text-[#087F5B] font-semibold">{m.role}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isArchived
                          ? 'bg-stone-200 text-stone-700'
                          : isDraft
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-[#087F5B]/10 text-[#087F5B]'
                      }`}
                    >
                      {m.status || 'published'}
                    </span>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                    {m.bio}
                  </p>

                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>{m.location || 'Nigeria'}</span>
                    <div className="flex items-center gap-2">
                      {m.twitter && <Twitter className="w-3 h-3 text-stone-400" />}
                      {m.linkedin && <Linkedin className="w-3 h-3 text-[#087F5B]" />}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E4E1D8] flex items-center justify-between gap-2">
                  <span className="text-[11px] text-stone-400">Order: #{m.displayOrder || 1}</span>

                  <div className="flex items-center gap-1">
                    {canEditContent && (
                      <button
                        onClick={() => openEditModal(m)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-700 cursor-pointer"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {isArchived ? (
                      <>
                        <button
                          onClick={() => handleRestore(m.id, m.name)}
                          className="p-1.5 rounded-lg hover:bg-emerald-50 text-[#087F5B] cursor-pointer"
                          title="Restore Member to Published"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        {canDeletePermanently && (
                          <button
                            onClick={() => setConfirmDeleteId(m.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 cursor-pointer"
                            title="Permanently Delete Profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      canPublishContent && (
                        <button
                          onClick={() => handleArchive(m.id, m.name)}
                          className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 cursor-pointer"
                          title="Archive Profile"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Confirm Permanent Delete */}
                {confirmDeleteId === m.id && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2 mt-2">
                    <p className="text-xs text-red-800 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Permanently delete this team member?</span>
                    </p>
                    <div className="flex items-center gap-2 justify-end pt-1">
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-1 text-[11px] bg-white border border-stone-200 rounded-lg text-stone-700 font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(m.id, m.name)}
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

      {/* Modal: Create or Edit Team Member */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 border border-[#E4E1D8] shadow-xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#E4E1D8]">
              <h3 className="font-bold text-lg font-display text-[#0B1F33]">
                {editingMember ? `Edit Profile: ${editingMember.name}` : 'Add Founding / Advisory Team Member'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Ngozi Adeleke"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Official Role / Title *</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Lead Technical Architect"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              {/* Photo Upload or URL */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  Profile Photo (Firebase Storage or URL)
                </label>
                <div className="flex items-center gap-3">
                  {photoUrl && photoUrl.trim() !== '' ? (
                    <img
                      src={photoUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-[#E4E1D8]"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                  )}

                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="url"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://... or click Upload Image"
                      className="flex-1 bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#087F5B]"
                    />

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={isUploadingPhoto}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingPhoto ? 'Uploading...' : 'Upload'}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lagos, Nigeria or Remote"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Stewardship Note</label>
                  <input
                    type="text"
                    value={editableNote}
                    onChange={(e) => setEditableNote(e.target.value)}
                    placeholder="e.g. Founding Steward, Advisory Chair"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Biography *</label>
                <textarea
                  rows={3}
                  required
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Professional background, expertise, and dedication to Nigerian empowerment."
                  className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl p-3 focus:outline-none focus:border-[#087F5B] leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">LinkedIn Profile or Handle</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="e.g. https://linkedin.com/in/... or username"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Twitter / X Handle</label>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="e.g. @handle"
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Publishing Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full bg-[#F8F7F2] border border-[#E4E1D8] rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-[#087F5B]"
                  >
                    <option value="published">Published (Visible on About Page)</option>
                    <option value="draft">Draft (Admin eyes only)</option>
                    <option value="archived">Archived (Hidden)</option>
                  </select>
                </div>
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
                    {isProcessing ? 'Saving to Firebase...' : editingMember ? 'Save Updates' : 'Publish Member'}
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
