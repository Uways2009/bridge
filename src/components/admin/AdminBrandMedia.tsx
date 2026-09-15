import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  RefreshCw,
  Eye,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  Sparkles,
  Info,
  Copy,
  Check,
  FolderOpen,
  Filter,
  FileText,
  X,
} from 'lucide-react';
import {
  validateUploadFile,
  optimizeImageBeforeUpload,
  getVersionedMediaUrl,
  readImageDimensions,
  OptimizationResult,
} from '../../lib/imageOptimizer';
import {
  uploadMediaToStorage,
  uploadBrandingLogo,
  fetchMediaAssetsAdmin,
  deleteMediaAssetFromFirestore,
  MediaAssetRecord,
} from '../../lib/firebaseService';

export const AdminBrandMedia: React.FC = () => {
  const { currentAdmin, siteSettings, updateSiteSettings, logAction } = useAdmin();

  // Active view tab
  const [activeTab, setActiveTab] = useState<'brand' | 'uploader' | 'library'>('brand');

  // Primary Logo State
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    siteSettings?.logoUrl ? getVersionedMediaUrl(siteSettings.logoUrl, siteSettings.updatedAt) : null
  );
  const [logoAlt, setLogoAlt] = useState<string>(siteSettings?.logoAlt || 'NaijaBridge - Digital Pathways & Impact');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const [logoCancelFn, setLogoCancelFn] = useState<(() => void) | null>(null);
  const [logoOptInfo, setLogoOptInfo] = useState<OptimizationResult | null>(null);
  const [logoSuccessMsg, setLogoSuccessMsg] = useState('');
  const [logoErrorMsg, setLogoErrorMsg] = useState('');
  const [uploadStatusPhase, setUploadStatusPhase] = useState('');
  const [lastFailedFile, setLastFailedFile] = useState<File | null>(null);

  // Dark Logo Variant State
  const [darkLogoFile, setDarkLogoFile] = useState<File | null>(null);
  const [darkLogoPreview, setDarkLogoPreview] = useState<string | null>(
    siteSettings?.logoDarkUrl ? getVersionedMediaUrl(siteSettings.logoDarkUrl, siteSettings.updatedAt) : null
  );
  const [isUploadingDarkLogo, setIsUploadingDarkLogo] = useState(false);
  const [darkLogoProgress, setDarkLogoProgress] = useState(0);
  const [darkLogoSuccessMsg, setDarkLogoSuccessMsg] = useState('');
  const [darkLogoErrorMsg, setDarkLogoErrorMsg] = useState('');

  // Favicon State
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(
    siteSettings?.faviconUrl ? getVersionedMediaUrl(siteSettings.faviconUrl, siteSettings.updatedAt) : null
  );
  const [isUploadingFavicon, setIsUploadingFavicon] = useState(false);
  const [faviconProgress, setFaviconProgress] = useState(0);
  const [faviconSuccessMsg, setFaviconSuccessMsg] = useState('');
  const [faviconErrorMsg, setFaviconErrorMsg] = useState('');

  // Content Media Uploader State
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [contentFolder, setContentFolder] = useState<
    'heroes' | 'courses' | 'opportunities' | 'events' | 'documents' | 'content'
  >('content');
  const [contentAlt, setContentAlt] = useState('');
  const [contentPreview, setContentPreview] = useState<string | null>(null);
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [contentProgress, setContentProgress] = useState(0);
  const [contentCancelFn, setContentCancelFn] = useState<(() => void) | null>(null);
  const [contentOptInfo, setContentOptInfo] = useState<OptimizationResult | null>(null);
  const [contentUploadedUrl, setContentUploadedUrl] = useState<string | null>(null);
  const [contentSuccessMsg, setContentSuccessMsg] = useState('');
  const [contentErrorMsg, setContentErrorMsg] = useState('');

  // Cloud Media Library State
  const [libraryAssets, setLibraryAssets] = useState<MediaAssetRecord[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [libraryFolderFilter, setLibraryFolderFilter] = useState<string>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [previewModalAsset, setPreviewModalAsset] = useState<MediaAssetRecord | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const darkLogoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const contentInputRef = useRef<HTMLInputElement>(null);

  // Load Cloud Media Library from Firestore
  const loadLibrary = async () => {
    setIsLoadingLibrary(true);
    try {
      const folderParam = libraryFolderFilter === 'all' ? undefined : libraryFolderFilter;
      const assets = await fetchMediaAssetsAdmin(folderParam);
      setLibraryAssets(assets);
    } catch (err) {
      console.warn('Could not load library assets:', err);
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'library') {
      loadLibrary();
    }
  }, [activeTab, libraryFolderFilter]);

  // Keep logo preview in sync with siteSettings
  useEffect(() => {
    if (siteSettings?.logoUrl) {
      setLogoPreview(getVersionedMediaUrl(siteSettings.logoUrl, siteSettings.updatedAt));
    }
    if (siteSettings?.logoDarkUrl) {
      setDarkLogoPreview(getVersionedMediaUrl(siteSettings.logoDarkUrl, siteSettings.updatedAt));
    }
    if (siteSettings?.faviconUrl) {
      setFaviconPreview(getVersionedMediaUrl(siteSettings.faviconUrl, siteSettings.updatedAt));
    }
    if (siteSettings?.logoAlt) {
      setLogoAlt(siteSettings.logoAlt);
    }
  }, [siteSettings]);

  // Copy URL to clipboard
  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  // 1. PRIMARY LOGO HANDLERS
  const handleSelectLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoErrorMsg('');
    setLogoSuccessMsg('');
    setUploadStatusPhase('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file, 'logos');
    if (!validation.valid) {
      setLogoErrorMsg(validation.error || 'Invalid logo file.');
      return;
    }

    try {
      const dims = await readImageDimensions(file);
      if (dims.width < 60 || dims.height < 20) {
        setLogoErrorMsg(`Image resolution too small (${dims.width}x${dims.height}px). Minimum recommended is 120x40px.`);
        return;
      }
      if (dims.width > 2400 || dims.height > 2400) {
        setLogoErrorMsg(`Image resolution too large (${dims.width}x${dims.height}px). Maximum dimension is 2400px.`);
        return;
      }
    } catch {
      // SVGs or vector images
    }

    setLogoFile(file);
    setLastFailedFile(null);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);

    // Calculate compression metrics preview
    const opt = await optimizeImageBeforeUpload(file, { folder: 'logos' });
    setLogoOptInfo(opt);
  };

  const handleSaveLogo = async () => {
    const fileToUpload = logoFile || lastFailedFile;
    if (!fileToUpload && !siteSettings?.logoUrl) {
      setLogoErrorMsg('Please select an image file to upload.');
      return;
    }

    if (!currentAdmin) {
      setLogoErrorMsg('Authentication required.');
      return;
    }

    setIsUploadingLogo(true);
    setLogoProgress(0);
    setLogoErrorMsg('');
    setLogoSuccessMsg('');
    setUploadStatusPhase('Uploading logo: 0%');

    try {
      if (fileToUpload) {
        setUploadStatusPhase('Uploading logo: 1%');
        const uploadResult = await uploadBrandingLogo(
          fileToUpload,
          {
            uid: currentAdmin.id,
            email: currentAdmin.email,
            name: currentAdmin.name,
          },
          {
            altText: logoAlt.trim() || 'NaijaBridge',
            onProgress: (p) => {
              setLogoProgress(p);
              if (p < 100) {
                setUploadStatusPhase(`Uploading logo: ${p}%`);
              } else {
                setUploadStatusPhase('Finalizing upload…');
              }
            },
            onCancelReady: (cancel) => setLogoCancelFn(() => cancel),
          }
        );

        setUploadStatusPhase('Saving image reference…');
        // Update local context
        await updateSiteSettings({
          logoUrl: uploadResult.logoUrl,
          logoAlt: uploadResult.logoAltText,
          logoVersion: uploadResult.logoVersion,
          logoStoragePath: uploadResult.logoStoragePath,
        });

        // Set versioned preview with cache-busting
        setLogoPreview(uploadResult.versionedUrl);
        setLogoSuccessMsg('Published and synced');
        setUploadStatusPhase('Published and synced');
        setLogoFile(null);
        setLastFailedFile(null);
        setLogoOptInfo(null);
        logAction(
          'Upload Brand Logo',
          'Content',
          `Uploaded new primary logo (v${uploadResult.logoVersion}) to Cloud Storage with synchronized versioning.`
        );
        setTimeout(() => {
          setLogoSuccessMsg('');
          setUploadStatusPhase('');
        }, 5000);
      } else {
        // Just updating alt text
        setUploadStatusPhase('Saving image reference…');
        await updateSiteSettings({
          logoAlt: logoAlt.trim() || 'NaijaBridge',
        });
        setLogoSuccessMsg('Published and synced');
        setUploadStatusPhase('Published and synced');
        setTimeout(() => {
          setLogoSuccessMsg('');
          setUploadStatusPhase('');
        }, 4000);
      }
    } catch (err: any) {
      // Revert preview to previous saved logo
      if (siteSettings?.logoUrl) {
        setLogoPreview(getVersionedMediaUrl(siteSettings.logoUrl, siteSettings.updatedAt));
      } else {
        setLogoPreview(null);
      }
      setLastFailedFile(fileToUpload);
      setLogoErrorMsg(err.message || 'Unable to save. Retry');
      setUploadStatusPhase('Unable to save. Retry');
    } finally {
      setIsUploadingLogo(false);
      setLogoCancelFn(null);
    }
  };

  const handleRemoveLogo = async () => {
    if (!window.confirm('Reset primary logo to default system badge?')) return;
    setIsUploadingLogo(true);
    try {
      await updateSiteSettings({
        logoUrl: '',
        logoAlt: '',
      });
      setLogoPreview(null);
      setLogoFile(null);
      setLogoOptInfo(null);
      logAction('Remove Brand Logo', 'Content', 'Reset primary brand logo to default SVG badge.');
      setLogoSuccessMsg('Primary logo removed. Default system SVG badge restored.');
      setTimeout(() => setLogoSuccessMsg(''), 4000);
    } catch (err: any) {
      setLogoErrorMsg(err.message || 'Failed to remove logo.');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // 2. DARK LOGO VARIANT HANDLERS
  const handleSelectDarkLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDarkLogoErrorMsg('');
    setDarkLogoSuccessMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file, 'logos');
    if (!validation.valid) {
      setDarkLogoErrorMsg(validation.error || 'Invalid logo file.');
      return;
    }

    setDarkLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setDarkLogoPreview(objectUrl);
  };

  const handleSaveDarkLogo = async () => {
    if (!darkLogoFile || !currentAdmin) return;
    setIsUploadingDarkLogo(true);
    setDarkLogoProgress(0);
    setDarkLogoErrorMsg('');
    setDarkLogoSuccessMsg('');

    try {
      const result = await uploadMediaToStorage(
        darkLogoFile,
        'logos',
        {
          uid: currentAdmin.id,
          email: currentAdmin.email,
          name: currentAdmin.name,
        },
        {
          altText: `${logoAlt} (Dark Backdrop Variant)`,
          onProgress: (p) => setDarkLogoProgress(p),
        }
      );

      await updateSiteSettings({
        logoDarkUrl: result.downloadUrl,
      });

      logAction('Upload Dark Logo Variant', 'Content', 'Uploaded white/light logo variant for dark backgrounds.');
      setDarkLogoSuccessMsg('Dark backdrop logo variant saved and deployed.');
      setDarkLogoFile(null);
      setTimeout(() => setDarkLogoSuccessMsg(''), 4000);
    } catch (err: any) {
      setDarkLogoErrorMsg(err.message || 'Failed to upload dark logo variant.');
    } finally {
      setIsUploadingDarkLogo(false);
    }
  };

  const handleRemoveDarkLogo = async () => {
    if (!window.confirm('Remove dark background logo variant?')) return;
    setIsUploadingDarkLogo(true);
    try {
      await updateSiteSettings({
        logoDarkUrl: '',
      });
      setDarkLogoPreview(null);
      setDarkLogoFile(null);
      logAction('Remove Dark Logo Variant', 'Content', 'Removed dark logo variant.');
      setDarkLogoSuccessMsg('Dark background logo variant removed.');
      setTimeout(() => setDarkLogoSuccessMsg(''), 4000);
    } catch (err: any) {
      setDarkLogoErrorMsg(err.message || 'Failed to remove variant.');
    } finally {
      setIsUploadingDarkLogo(false);
    }
  };

  // 3. FAVICON HANDLERS
  const handleSelectFavicon = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFaviconErrorMsg('');
    setFaviconSuccessMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file, 'favicons');
    if (!validation.valid) {
      setFaviconErrorMsg(validation.error || 'Invalid favicon file.');
      return;
    }

    setFaviconFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFaviconPreview(objectUrl);
  };

  const handleSaveFavicon = async () => {
    if (!faviconFile || !currentAdmin) return;
    setIsUploadingFavicon(true);
    setFaviconProgress(0);
    setFaviconErrorMsg('');
    setFaviconSuccessMsg('');

    try {
      const result = await uploadMediaToStorage(
        faviconFile,
        'favicons',
        {
          uid: currentAdmin.id,
          email: currentAdmin.email,
          name: currentAdmin.name,
        },
        {
          altText: 'NaijaBridge Browser Favicon',
          onProgress: (p) => setFaviconProgress(p),
        }
      );

      await updateSiteSettings({
        faviconUrl: result.downloadUrl,
      });

      // Synchronize in current DOM head immediately
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = getVersionedMediaUrl(result.downloadUrl, Date.now());

      logAction('Upload Favicon', 'Content', 'Uploaded browser tab favicon.');
      setFaviconSuccessMsg('Browser favicon updated and synchronized.');
      setFaviconFile(null);
      setTimeout(() => setFaviconSuccessMsg(''), 4000);
    } catch (err: any) {
      setFaviconErrorMsg(err.message || 'Failed to upload favicon.');
    } finally {
      setIsUploadingFavicon(false);
    }
  };

  // 4. CONTENT MEDIA UPLOADER HANDLERS
  const handleSelectContentFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setContentErrorMsg('');
    setContentSuccessMsg('');
    setContentUploadedUrl(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateUploadFile(file, contentFolder);
    if (!validation.valid) {
      setContentErrorMsg(validation.error || 'Invalid file.');
      return;
    }

    setContentFile(file);
    if (file.type.startsWith('image/')) {
      const objectUrl = URL.createObjectURL(file);
      setContentPreview(objectUrl);
      const opt = await optimizeImageBeforeUpload(file, { folder: contentFolder });
      setContentOptInfo(opt);
    } else {
      setContentPreview(null);
      setContentOptInfo(null);
    }
  };

  const handleUploadContentMedia = async () => {
    if (!contentFile || !currentAdmin) return;
    setIsUploadingContent(true);
    setContentProgress(0);
    setContentErrorMsg('');
    setContentSuccessMsg('');

    try {
      const result = await uploadMediaToStorage(
        contentFile,
        contentFolder,
        {
          uid: currentAdmin.id,
          email: currentAdmin.email,
          name: currentAdmin.name,
        },
        {
          altText: contentAlt.trim() || contentFile.name,
          onProgress: (p) => setContentProgress(p),
          onCancelReady: (cancel) => setContentCancelFn(() => cancel),
        }
      );

      setContentUploadedUrl(result.downloadUrl);
      setContentSuccessMsg(`File uploaded successfully to Firebase Storage [${contentFolder}]!`);
      setContentFile(null);
      setContentOptInfo(null);
      setContentAlt('');
      if (activeTab === 'library') {
        loadLibrary();
      }
    } catch (err: any) {
      setContentErrorMsg(err.message || 'Upload failed.');
    } finally {
      setIsUploadingContent(false);
      setContentCancelFn(null);
    }
  };

  // 5. MEDIA LIBRARY HANDLERS
  const handleDeleteLibraryAsset = async (asset: MediaAssetRecord) => {
    if (!currentAdmin) return;
    if (!window.confirm(`Permanently delete media asset "${asset.originalName || asset.filename}"?`)) {
      return;
    }

    try {
      await deleteMediaAssetFromFirestore(asset.id, asset.storagePath, {
        uid: currentAdmin.id,
        email: currentAdmin.email,
        name: currentAdmin.name,
      });
      setLibraryAssets((prev) => prev.filter((a) => a.id !== asset.id));
      if (previewModalAsset?.id === asset.id) {
        setPreviewModalAsset(null);
      }
    } catch (err: any) {
      alert(`Failed to delete media asset: ${err.message || 'Server error'}`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#087F5B]/10 text-[#087F5B] text-xs font-semibold mb-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Production Media & Cloud Storage</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0B1F33] font-display">
              Brand Identity & Media Management
            </h2>
            <p className="text-xs sm:text-sm text-[#1F2933]/70 mt-1 max-w-2xl">
              All branding and content files are verified, compressed, and stored in Firebase Cloud Storage as the single production source of truth.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Firebase Synchronized</span>
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#E4E1D8] mt-6 pt-2">
          <button
            onClick={() => setActiveTab('brand')}
            className={`pb-3 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
              activeTab === 'brand'
                ? 'border-[#087F5B] text-[#087F5B]'
                : 'border-transparent text-[#1F2933]/60 hover:text-[#0B1F33]'
            }`}
          >
            Brand Identity (Logos & Favicon)
          </button>
          <button
            onClick={() => setActiveTab('uploader')}
            className={`pb-3 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
              activeTab === 'uploader'
                ? 'border-[#087F5B] text-[#087F5B]'
                : 'border-transparent text-[#1F2933]/60 hover:text-[#0B1F33]'
            }`}
          >
            Upload Content Media
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`pb-3 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'border-[#087F5B] text-[#087F5B]'
                : 'border-transparent text-[#1F2933]/60 hover:text-[#0B1F33]'
            }`}
          >
            <span>Cloud Media Library</span>
            {libraryAssets.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#087F5B]/10 text-[#087F5B] text-[10px]">
                {libraryAssets.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* TAB 1: BRAND IDENTITY */}
      {activeTab === 'brand' && (
        <div className="space-y-6">
          {/* PRIMARY BRAND LOGO */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#0B1F33] font-display flex items-center gap-2">
                  <span>Primary Brand Logo</span>
                  <span className="text-[11px] font-mono text-[#087F5B] bg-[#087F5B]/10 px-2 py-0.5 rounded-full">
                    Main Header & Light Surfaces
                  </span>
                </h3>
                <p className="text-xs text-[#1F2933]/60 mt-0.5">
                  Appears in the top navigation header and public pages. Supports SVG, PNG, WebP, and JPEG (max 2 MB).
                </p>
              </div>

              {siteSettings?.logoUrl && (
                <button
                  onClick={handleRemoveLogo}
                  disabled={isUploadingLogo}
                  className="text-xs text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset to Default Badge</span>
                </button>
              )}
            </div>

            {uploadStatusPhase && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center justify-between gap-2 border ${
                  uploadStatusPhase.includes('Unable to save')
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : uploadStatusPhase.includes('Published and synced')
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-teal-50 border-teal-200 text-teal-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {uploadStatusPhase.includes('Unable to save') ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  ) : uploadStatusPhase.includes('Published and synced') ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <RefreshCw className="w-4 h-4 text-teal-600 animate-spin shrink-0" />
                  )}
                  <span className="font-semibold">{uploadStatusPhase}</span>
                </div>

                {lastFailedFile && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSaveLogo}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setLastFailedFile(null);
                        setLogoErrorMsg('');
                        setUploadStatusPhase('');
                      }}
                      className="text-[11px] text-rose-700 hover:underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            )}

            {logoSuccessMsg && !uploadStatusPhase && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{logoSuccessMsg}</span>
              </div>
            )}

            {logoErrorMsg && !uploadStatusPhase && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{logoErrorMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Upload Controls */}
              <div className="space-y-4">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp,image/jpeg"
                  onChange={handleSelectLogo}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="w-full py-8 px-4 rounded-2xl border-2 border-dashed border-[#E4E1D8] hover:border-[#087F5B] bg-[#F8F7F2]/50 hover:bg-[#F8F7F2] transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-center group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 group-hover:bg-[#087F5B]/20 text-[#087F5B] flex items-center justify-center transition-colors">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-[#0B1F33] block">
                      {logoFile ? logoFile.name : 'Click to Browse or Drag New Logo File'}
                    </span>
                    <span className="text-[11px] text-[#1F2933]/50 block mt-0.5">
                      Vector SVG or high-resolution PNG recommended (transparent background)
                    </span>
                  </div>
                </button>

                {/* Compression Metrics Preview */}
                {logoOptInfo && (
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-1">
                    <div className="flex justify-between font-medium text-emerald-900">
                      <span>Automatic WebP Compression:</span>
                      <span className="font-bold">
                        {logoOptInfo.savingsPercentage > 0
                          ? `Saved ${logoOptInfo.savingsPercentage}%`
                          : 'Optimal Size'}
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-800 flex justify-between">
                      <span>Original: {(logoOptInfo.originalSizeBytes / 1024).toFixed(1)} KB</span>
                      <span>Optimized: {(logoOptInfo.optimizedSizeBytes / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                )}

                {/* Alt Text Accessibility Input */}
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F33] mb-1">
                    Logo Alt Text (Accessibility & SEO)
                  </label>
                  <input
                    type="text"
                    value={logoAlt}
                    onChange={(e) => setLogoAlt(e.target.value)}
                    placeholder="e.g. NaijaBridge - Connecting Nigerian Talent"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#E4E1D8] focus:border-[#087F5B] focus:ring-1 focus:ring-[#087F5B] text-xs outline-none bg-white"
                  />
                </div>

                {/* Upload Progress Bar */}
                {isUploadingLogo && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium text-[#0B1F33]">
                      <span>Uploading to Firebase Cloud Storage...</span>
                      <span>{logoProgress}%</span>
                    </div>
                    <div className="w-full bg-[#E4E1D8] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#087F5B] h-full transition-all duration-200"
                        style={{ width: `${logoProgress}%` }}
                      />
                    </div>
                    {logoCancelFn && (
                      <button
                        type="button"
                        onClick={logoCancelFn}
                        className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                      >
                        Cancel Upload
                      </button>
                    )}
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={handleSaveLogo}
                  disabled={isUploadingLogo || (!logoFile && logoAlt === siteSettings?.logoAlt)}
                  className="w-full py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066549] disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  {isUploadingLogo ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving & Synchronizing...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Save & Synchronize Logo</span>
                    </>
                  )}
                </button>
              </div>

              {/* Live Preview Display */}
              <div className="space-y-3 bg-[#F8F7F2] p-5 rounded-2xl border border-[#E4E1D8]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#0B1F33] flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#087F5B]" />
                    <span>Header Render Preview</span>
                  </span>
                  <span className="text-[10px] text-[#1F2933]/50 font-mono">Live Cache-Busting</span>
                </div>

                {/* Mock Header Bar */}
                <div className="bg-white p-4 rounded-xl border border-[#E4E1D8] shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt={logoAlt || 'Logo'}
                        className="h-10 max-h-12 w-auto object-contain"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-[#0B1F33] text-white flex items-center justify-center text-xs font-bold font-mono">
                        NB
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-bold text-[#0B1F33] font-display">
                        Naija<span className="text-[#087F5B]">Bridge</span>
                      </div>
                      <div className="text-[10px] text-[#1F2933]/60">Digital Pathways</div>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center gap-2 text-[10px] text-[#1F2933]/50 font-medium">
                    <span>Explore</span>
                    <span>•</span>
                    <span>Academy</span>
                    <span>•</span>
                    <span>Events</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#1F2933]/60 bg-white p-3 rounded-xl border border-[#E4E1D8] space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-[#1F2933]/40">Status:</span>
                    <span className="text-emerald-700 font-semibold">
                      {siteSettings?.logoUrl ? 'Cloud Deployed' : 'Default Badge'}
                    </span>
                  </div>
                  {siteSettings?.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-[#1F2933]/40">Last Synchronized:</span>
                      <span className="text-[#1F2933]">
                        {new Date(siteSettings.updatedAt).toLocaleDateString()} {new Date(siteSettings.updatedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  {siteSettings?.logoUrl && (
                    <div className="truncate flex items-center justify-between pt-1">
                      <a
                        href={siteSettings.logoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#087F5B] hover:underline flex items-center gap-1"
                      >
                        <span>Open Cloud Asset</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopy(siteSettings.logoUrl || '')}
                        className="text-[10px] text-[#087F5B] hover:underline cursor-pointer"
                      >
                        {copiedUrl === siteSettings.logoUrl ? 'Copied!' : 'Copy URL'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* DARK LOGO VARIANT & FAVICON ROW */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* DARK LOGO VARIANT */}
            <div className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#0B1F33] font-display">Dark Background Logo Variant</h3>
                  <p className="text-[11px] text-[#1F2933]/60">Used in navy footers and dark surfaces.</p>
                </div>
                {siteSettings?.logoDarkUrl && (
                  <button
                    onClick={handleRemoveDarkLogo}
                    className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>

              {darkLogoSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                  {darkLogoSuccessMsg}
                </div>
              )}
              {darkLogoErrorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                  {darkLogoErrorMsg}
                </div>
              )}

              <input
                ref={darkLogoInputRef}
                type="file"
                accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp,image/jpeg"
                onChange={handleSelectDarkLogo}
                className="hidden"
              />

              <div
                onClick={() => darkLogoInputRef.current?.click()}
                className="p-4 rounded-xl border border-dashed border-[#E4E1D8] hover:border-[#087F5B] bg-[#F8F7F2] text-center cursor-pointer"
              >
                <span className="text-xs font-medium text-[#0B1F33] block">
                  {darkLogoFile ? darkLogoFile.name : 'Click to select light/white logo'}
                </span>
                <span className="text-[10px] text-[#1F2933]/50">Transparent SVG or white PNG</span>
              </div>

              {/* Dark canvas preview */}
              <div className="bg-[#0B1F33] p-4 rounded-xl flex items-center justify-center min-h-[64px]">
                {darkLogoPreview ? (
                  <img src={darkLogoPreview} alt="Dark variant" className="h-8 max-h-10 w-auto object-contain" />
                ) : (
                  <span className="text-[11px] text-white/50">No dark variant configured</span>
                )}
              </div>

              <button
                onClick={handleSaveDarkLogo}
                disabled={isUploadingDarkLogo || !darkLogoFile}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0B1F33] hover:bg-[#12283E] disabled:opacity-40 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                {isUploadingDarkLogo ? 'Uploading...' : 'Save Dark Logo Variant'}
              </button>
            </div>

            {/* BROWSER FAVICON */}
            <div className="bg-white rounded-3xl p-6 border border-[#E4E1D8] shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#0B1F33] font-display">Browser Tab Favicon</h3>
                <p className="text-[11px] text-[#1F2933]/60">Displayed in browser tabs and bookmarks (ICO or PNG).</p>
              </div>

              {faviconSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                  {faviconSuccessMsg}
                </div>
              )}
              {faviconErrorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                  {faviconErrorMsg}
                </div>
              )}

              <input
                ref={faviconInputRef}
                type="file"
                accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
                onChange={handleSelectFavicon}
                className="hidden"
              />

              <div
                onClick={() => faviconInputRef.current?.click()}
                className="p-4 rounded-xl border border-dashed border-[#E4E1D8] hover:border-[#087F5B] bg-[#F8F7F2] text-center cursor-pointer"
              >
                <span className="text-xs font-medium text-[#0B1F33] block">
                  {faviconFile ? faviconFile.name : 'Click to select favicon (ICO/PNG)'}
                </span>
                <span className="text-[10px] text-[#1F2933]/50">Recommended: 32x32 or 256x256 square</span>
              </div>

              {/* Browser tab simulation */}
              <div className="bg-[#E4E1D8]/40 p-3 rounded-xl flex items-center gap-2 text-xs">
                <div className="bg-white px-3 py-1.5 rounded-t-lg border border-[#E4E1D8] flex items-center gap-2 shadow-xs">
                  {faviconPreview ? (
                    <img src={faviconPreview} alt="Favicon" className="w-4 h-4 object-contain" />
                  ) : (
                    <div className="w-4 h-4 rounded-sm bg-[#087F5B] text-white text-[8px] flex items-center justify-center font-bold">
                      N
                    </div>
                  )}
                  <span className="text-[11px] font-medium text-[#0B1F33]">NaijaBridge | Nigerian...</span>
                </div>
              </div>

              <button
                onClick={handleSaveFavicon}
                disabled={isUploadingFavicon || !faviconFile}
                className="w-full py-2.5 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066549] disabled:opacity-40 text-white text-xs font-semibold cursor-pointer transition-colors"
              >
                {isUploadingFavicon ? 'Uploading Favicon...' : 'Deploy Favicon to Cloud'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONTENT MEDIA UPLOADER */}
      {activeTab === 'uploader' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#0B1F33] font-display">
              Upload Content Media to Firebase Cloud Storage
            </h3>
            <p className="text-xs text-[#1F2933]/70 mt-1">
              Upload promotional banners, course illustrations, opportunity logos, event flyers, or approved PDF documents.
              Images are automatically optimized and served via Firebase CDN.
            </p>
          </div>

          {contentSuccessMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{contentSuccessMsg}</span>
              </div>
              {contentUploadedUrl && (
                <button
                  type="button"
                  onClick={() => handleCopy(contentUploadedUrl)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 cursor-pointer flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedUrl === contentUploadedUrl ? 'Copied!' : 'Copy CDN URL'}</span>
                </button>
              )}
            </div>
          )}

          {contentErrorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{contentErrorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Target Media Category</label>
              <select
                value={contentFolder}
                onChange={(e: any) => setContentFolder(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1D8] text-xs font-medium text-[#0B1F33] bg-white outline-none focus:border-[#087F5B]"
              >
                <option value="content">General Content & Articles (media/content)</option>
                <option value="heroes">Hero Banners & Visuals (media/heroes)</option>
                <option value="courses">Academy Course Graphics (media/courses)</option>
                <option value="opportunities">Opportunity Brand Logos (media/opportunities)</option>
                <option value="events">Workshop & Event Flyers (media/events)</option>
                <option value="documents">Curriculum Briefs & PDFs (media/documents)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Alt Text / Description</label>
              <input
                type="text"
                value={contentAlt}
                onChange={(e) => setContentAlt(e.target.value)}
                placeholder="Descriptive label for screen readers"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E1D8] text-xs text-[#0B1F33] bg-white outline-none focus:border-[#087F5B]"
              />
            </div>
          </div>

          {/* File Picker Zone */}
          <input
            ref={contentInputRef}
            type="file"
            accept={
              contentFolder === 'documents'
                ? '.pdf,application/pdf'
                : '.svg,.png,.webp,.jpg,.jpeg,.pdf,image/svg+xml,image/png,image/webp,image/jpeg,application/pdf'
            }
            onChange={handleSelectContentFile}
            className="hidden"
          />

          <div
            onClick={() => contentInputRef.current?.click()}
            className="w-full py-10 px-4 rounded-2xl border-2 border-dashed border-[#E4E1D8] hover:border-[#087F5B] bg-[#F8F7F2]/60 hover:bg-[#F8F7F2] transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer text-center"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#087F5B]/10 text-[#087F5B] flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-[#0B1F33] block">
                {contentFile ? contentFile.name : 'Click to browse or drag content file'}
              </span>
              <span className="text-[11px] text-[#1F2933]/50 block mt-0.5">
                {contentFolder === 'documents'
                  ? 'PDF documents up to 10 MB'
                  : 'WebP, PNG, SVG, or JPEG up to 5 MB'}
              </span>
            </div>
          </div>

          {/* Image optimization summary */}
          {contentOptInfo && (
            <div className="p-3.5 rounded-xl bg-[#F8F7F2] border border-[#E4E1D8] text-xs flex items-center justify-between">
              <div>
                <span className="font-semibold text-[#0B1F33]">Optimized WebP File: </span>
                <span className="text-[#1F2933]/70">
                  {(contentOptInfo.optimizedSizeBytes / 1024).toFixed(1)} KB (downscaled from{' '}
                  {(contentOptInfo.originalSizeBytes / 1024).toFixed(1)} KB)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                {contentOptInfo.savingsPercentage}% savings
              </span>
            </div>
          )}

          {/* Progress bar */}
          {isUploadingContent && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-[#0B1F33]">
                <span>Uploading to Firebase Cloud Storage...</span>
                <span>{contentProgress}%</span>
              </div>
              <div className="w-full bg-[#E4E1D8] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#087F5B] h-full transition-all duration-200"
                  style={{ width: `${contentProgress}%` }}
                />
              </div>
              {contentCancelFn && (
                <button
                  type="button"
                  onClick={contentCancelFn}
                  className="text-[11px] text-rose-600 hover:underline cursor-pointer"
                >
                  Cancel Upload
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleUploadContentMedia}
            disabled={isUploadingContent || !contentFile}
            className="w-full py-3 px-4 rounded-xl bg-[#087F5B] hover:bg-[#066549] disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            {isUploadingContent ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Uploading Media...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Upload to Firebase Cloud Storage</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* TAB 3: CLOUD MEDIA LIBRARY */}
      {activeTab === 'library' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E4E1D8] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#0B1F33] font-display">Cloud Media Assets</h3>
              <p className="text-xs text-[#1F2933]/70 mt-0.5">
                Central library of all media assets uploaded and stored in production Firebase Storage.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={libraryFolderFilter}
                onChange={(e) => setLibraryFolderFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-[#E4E1D8] text-xs font-medium text-[#0B1F33] bg-white outline-none"
              >
                <option value="all">All Folders</option>
                <option value="logos">Logos</option>
                <option value="favicons">Favicons</option>
                <option value="heroes">Heroes</option>
                <option value="courses">Courses</option>
                <option value="opportunities">Opportunities</option>
                <option value="events">Events</option>
                <option value="documents">Documents</option>
                <option value="content">Content</option>
              </select>

              <button
                onClick={loadLibrary}
                disabled={isLoadingLibrary}
                className="p-2 rounded-xl border border-[#E4E1D8] hover:bg-[#F8F7F2] text-[#0B1F33] cursor-pointer"
                title="Refresh Library"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingLibrary ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {isLoadingLibrary ? (
            <div className="py-12 text-center text-xs text-[#1F2933]/60 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-[#087F5B]" />
              <span>Loading assets from Cloud Storage...</span>
            </div>
          ) : libraryAssets.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#1F2933]/60 bg-[#F8F7F2] rounded-2xl border border-dashed border-[#E4E1D8] p-8">
              <FolderOpen className="w-8 h-8 text-[#1F2933]/30 mx-auto mb-2" />
              <p className="font-semibold text-[#0B1F33]">No media assets found in this folder</p>
              <p className="mt-1">Upload brand logos or content media in the tabs above to populate the library.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {libraryAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="bg-[#F8F7F2]/50 border border-[#E4E1D8] rounded-2xl p-4 flex flex-col justify-between gap-3 hover:border-[#087F5B]/50 transition-colors"
                >
                  <div className="space-y-2">
                    {/* Thumbnail */}
                    <div className="w-full h-36 bg-white rounded-xl border border-[#E4E1D8] flex items-center justify-center overflow-hidden relative">
                      {asset.contentType?.startsWith('image/') || asset.downloadUrl?.includes('image') ? (
                        <img
                          src={asset.downloadUrl}
                          alt={asset.altText || asset.filename}
                          className="max-h-full max-w-full object-contain p-2"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-[#1F2933]/60">
                          <FileText className="w-8 h-8 text-[#087F5B]" />
                          <span className="text-[10px] font-mono uppercase">PDF Document</span>
                        </div>
                      )}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#0B1F33]/80 text-white text-[9px] font-mono">
                        {asset.folder}
                      </span>
                    </div>

                    {/* Metadata */}
                    <div>
                      <h4 className="text-xs font-bold text-[#0B1F33] truncate" title={asset.originalName || asset.filename}>
                        {asset.originalName || asset.filename}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-[#1F2933]/60 mt-0.5">
                        <span>{(asset.size / 1024).toFixed(1)} KB</span>
                        <span>{asset.uploadedAt ? new Date(asset.uploadedAt).toLocaleDateString() : 'Recent'}</span>
                      </div>
                      {asset.altText && (
                        <p className="text-[10px] text-[#1F2933]/70 line-clamp-1 italic mt-1">
                          "{asset.altText}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-[#E4E1D8]">
                    <button
                      type="button"
                      onClick={() => handleCopy(asset.downloadUrl)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white border border-[#E4E1D8] hover:border-[#087F5B] text-[11px] font-medium text-[#0B1F33] flex items-center justify-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedUrl === asset.downloadUrl ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-[#1F2933]/60" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <a
                      href={asset.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-white border border-[#E4E1D8] hover:border-[#087F5B] text-[#0B1F33] cursor-pointer"
                      title="Open full size"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleDeleteLibraryAsset(asset)}
                      className="p-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 cursor-pointer"
                      title="Delete asset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
