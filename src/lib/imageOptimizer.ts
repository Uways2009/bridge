/**
 * Client-Side Media Optimizer & Validator for NaijaBridge
 * Performs validation, dimension scaling, EXIF stripping, and WebP compression
 * to ensure fast uploads on Nigerian networks and responsive image delivery.
 */

export interface OptimizeImageOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  folder?: 'logos' | 'favicons' | 'heroes' | 'courses' | 'opportunities' | 'events' | 'documents' | 'content';
}

export interface OptimizationResult {
  file: File;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  savingsPercentage: number;
  width: number;
  height: number;
  format: string;
}

const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.sh', '.php', '.phtml', '.py', '.rb', '.pl',
  '.js', '.ts', '.vbs', '.msi', '.com', '.scr', '.dll', '.so', '.app',
  '.bin', '.jar', '.apk'
];

const ALLOWED_MIME_TYPES = [
  // Images
  'image/svg+xml',
  'image/png',
  'image/webp',
  'image/jpeg',
  'image/x-icon',
  'image/vnd.microsoft.icon',
  // Approved Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Validate an upload file before staging or uploading
 */
export const validateUploadFile = (
  file: File,
  folder: 'logos' | 'favicons' | 'heroes' | 'courses' | 'opportunities' | 'events' | 'documents' | 'content' = 'content'
): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: 'No file selected.' };
  }

  // 1. Check for dangerous extensions
  const lowerName = file.name.toLowerCase();
  for (const ext of DANGEROUS_EXTENSIONS) {
    if (lowerName.endsWith(ext)) {
      return { valid: false, error: `Executable or script files (${ext}) are strictly prohibited.` };
    }
  }

  // 2. Check allowed mime types
  const fileType = file.type || '';
  if (fileType && !ALLOWED_MIME_TYPES.includes(fileType)) {
    // If mime type is blank, check extension
    const isKnownExt = ['.svg', '.png', '.webp', '.jpg', '.jpeg', '.ico', '.pdf'].some((ext) =>
      lowerName.endsWith(ext)
    );
    if (!isKnownExt) {
      return {
        valid: false,
        error: `Unsupported format (${fileType || 'unknown'}). Supported formats are SVG, PNG, WebP, JPEG, and PDF.`,
      };
    }
  }

  // 3. Folder-specific format checks
  if (folder === 'documents' && fileType !== 'application/pdf') {
    if (!lowerName.endsWith('.pdf')) {
      return { valid: false, error: 'Only PDF documents are allowed for curriculum briefs and reports.' };
    }
  }

  // 4. Folder-specific size limits
  let maxBytes = 5 * 1024 * 1024; // 5 MB default
  if (folder === 'logos' || folder === 'favicons') {
    maxBytes = 2 * 1024 * 1024; // 2 MB
  } else if (folder === 'documents') {
    maxBytes = 10 * 1024 * 1024; // 10 MB
  }

  if (file.size > maxBytes) {
    const maxMb = (maxBytes / (1024 * 1024)).toFixed(0);
    const fileMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File size (${fileMb} MB) exceeds the maximum allowed limit of ${maxMb} MB for ${folder}.`,
    };
  }

  return { valid: true };
};

/**
 * Generate a clean, URL-safe unique filename
 */
export const generateSafeFilename = (originalName: string, targetExtension?: string): string => {
  const parts = originalName.split('.');
  const ext = targetExtension || (parts.length > 1 ? parts.pop()?.toLowerCase() : 'webp');
  const baseName = parts.join('_').toLowerCase().replace(/[^a-z0-9_-]/g, '_').replace(/_+/g, '_').slice(0, 40);
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${timestamp}_${baseName}_${randomSuffix}.${ext}`;
};

/**
 * Client-side photographic image compression and resizing
 * Scales down large images, converts to WebP, and strips heavy EXIF metadata
 */
export const optimizeImageBeforeUpload = async (
  file: File,
  options: OptimizeImageOptions = {}
): Promise<OptimizationResult> => {
  const {
    folder = 'content',
    quality = 0.82,
  } = options;

  // Determine ideal dimensions based on asset folder
  let maxWidth = options.maxWidth || 1920;
  let maxHeight = options.maxHeight || 1920;

  if (folder === 'logos') {
    maxWidth = 1600;
    maxHeight = 1600;
  } else if (folder === 'favicons') {
    maxWidth = 256;
    maxHeight = 256;
  } else if (folder === 'courses' || folder === 'opportunities' || folder === 'events') {
    maxWidth = 1400;
    maxHeight = 1050;
  }

  // Non-raster or documents: return directly
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const isIco = file.type === 'image/x-icon' || file.name.toLowerCase().endsWith('.ico');

  if (isSvg || isPdf || isIco) {
    return {
      file,
      originalSizeBytes: file.size,
      optimizedSizeBytes: file.size,
      savingsPercentage: 0,
      width: 0,
      height: 0,
      format: file.type || 'application/octet-stream',
    };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.naturalWidth || img.width;
      let targetHeight = img.naturalHeight || img.height;

      // Calculate proportional downscale if exceeding bounds
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }

      // Render to offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        // Fallback if canvas context fails
        resolve({
          file,
          originalSizeBytes: file.size,
          optimizedSizeBytes: file.size,
          savingsPercentage: 0,
          width: targetWidth,
          height: targetHeight,
          format: file.type,
        });
        return;
      }

      // Smooth bicubic resampling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Attempt WebP export, falling back to original mime type
      const targetMime = 'image/webp';
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve({
              file,
              originalSizeBytes: file.size,
              optimizedSizeBytes: file.size,
              savingsPercentage: 0,
              width: targetWidth,
              height: targetHeight,
              format: file.type,
            });
            return;
          }

          // If blob is unexpectedly larger than original, keep original
          const useOptimized = blob.size < file.size;
          const finalBlob = useOptimized ? blob : file;
          const safeName = generateSafeFilename(file.name, useOptimized ? 'webp' : undefined);

          const optimizedFile = new File([finalBlob], safeName, {
            type: useOptimized ? targetMime : file.type,
            lastModified: Date.now(),
          });

          const savings = file.size > 0 ? Math.max(0, Math.round(((file.size - optimizedFile.size) / file.size) * 100)) : 0;

          resolve({
            file: optimizedFile,
            originalSizeBytes: file.size,
            optimizedSizeBytes: optimizedFile.size,
            savingsPercentage: savings,
            width: targetWidth,
            height: targetHeight,
            format: optimizedFile.type,
          });
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // On load failure, return original
      resolve({
        file,
        originalSizeBytes: file.size,
        optimizedSizeBytes: file.size,
        savingsPercentage: 0,
        width: 0,
        height: 0,
        format: file.type,
      });
    };

    img.src = objectUrl;
  });
};

/**
 * Cache-busting URL builder for versioned media assets
 * Guarantees that when an asset is replaced in Firebase, all browsers (Chrome, Firefox, Safari, Edge, Mobile)
 * immediately fetch the latest asset instead of displaying an outdated cached copy.
 */
export const getVersionedMediaUrl = (url?: string, versionToken?: string | number): string => {
  if (!url) return '';
  if (!versionToken) return url;

  const token = typeof versionToken === 'string' ? new Date(versionToken).getTime() || versionToken : versionToken;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${encodeURIComponent(token)}`;
};

/**
 * Read image dimensions from a File in the browser
 */
export const readImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg') || file.type === 'application/pdf') {
      resolve({ width: 0, height: 0 });
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
};

