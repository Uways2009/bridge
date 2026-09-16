import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  User as FirebaseUser,
} from 'firebase/auth';
import { handleFirestoreError, OperationType } from './firebaseErrors';
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { auth, db, storage } from './firebase';
import {
  Opportunity,
  WorkshopEvent,
  ServiceItem,
  SupportService,
  TeamMember,
  ContactInfoConfig,
  ProductResource,
  FAQItem,
  Testimonial,
  ContactInquiry,
  ManagedUser,
  PlatformRole,
  UserAccountStatus,
  AcademyCourse,
  CourseApplication,
} from '../types';
import {
  validateUploadFile,
  optimizeImageBeforeUpload,
  generateSafeFilename,
  getVersionedMediaUrl,
} from './imageOptimizer';

export interface AdminProfile {
  uid: string;
  email: string;
  name: string;
  role: 'super_admin' | 'content_manager' | 'verification_officer' | 'community_manager' | 'support_manager';
  title: string;
  status: 'active' | 'suspended';
  lastLogin?: string;
  createdAt: string;
}

export interface SiteSettings {
  logoUrl?: string;
  logoLightUrl?: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  logoAlt?: string;
  logoVersion?: number;
  logoStoragePath?: string;
  logoFilename?: string;
  logoDimensions?: { width: number; height: number };
  faviconDimensions?: { width: number; height: number };
  faviconStoragePath?: string;
  heroHeadline?: string;
  heroSubheadline?: string;
  siteName?: string;
  announcement?: {
    id: string;
    message: string;
    linkText?: string;
    linkUrl?: string;
    isActive: boolean;
  };
  updatedAt?: string;
  updatedBy?: string;
  updatedByUid?: string;
}

export interface MediaAssetRecord {
  id: string;
  downloadUrl: string;
  storagePath: string;
  folder: 'logos' | 'favicons' | 'heroes' | 'courses' | 'opportunities' | 'events' | 'documents' | 'content';
  filename: string;
  originalName: string;
  size: number;
  originalSize?: number;
  savingsPercentage?: number;
  contentType: string;
  altText: string;
  uploadedAt: string;
  uploadedBy: string;
  uploadedByUid: string;
}

export interface ActivityLog {
  id?: string;
  adminEmail: string;
  adminName: string;
  action: string;
  category: 'auth' | 'opportunities' | 'events' | 'cms' | 'media' | 'settings' | 'users';
  details: string;
  timestamp: string;
}

// Default super admin accounts
export const MASTER_ADMIN_EMAILS = [
  'abuunaysah74@gmail.com',
  'admin@naijabridge.org',
  'support@naijabridge.org',
  'director@naijabridge.org',
];

/**
 * Utility to recursively remove undefined fields so Firestore addDoc/updateDoc never fails
 */
export const cleanFirestoreObject = <T = any>(obj: T): T => {
  if (obj === null || obj === undefined) return null as unknown as T;
  if (typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanFirestoreObject).filter((item) => item !== undefined) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = cleanFirestoreObject(value);
    }
  }
  return result as T;
};

/**
 * SHA-256 Web Crypto hashing for cross-domain password verification
 */
export const hashPasswordClient = async (password: string, salt: string): Promise<string> => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const enc = new TextEncoder();
    const data = enc.encode(salt + ':' + password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return 'sha256:' + hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback simple hash for non-browser or older environments
  let hash = 0;
  const str = salt + ':' + password;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'sha256:' + Math.abs(hash).toString(16).padStart(16, '0');
};

/**
 * Verify whether an email address is recognized as an authorized administrator.
 * Strictly checks MASTER_ADMIN_EMAILS and active records in the Firestore 'admins' collection.
 */
export const isRecognizedAdminEmail = async (email: string): Promise<boolean> => {
  const cleanEmail = email.toLowerCase().trim();
  if (MASTER_ADMIN_EMAILS.includes(cleanEmail)) return true;
  try {
    const adminDoc = await getDoc(doc(db, 'admins', cleanEmail));
    if (adminDoc.exists()) {
      const data = adminDoc.data();
      if (data.status === 'active' || !data.status) return true;
    }

    const q = query(collection(db, 'admins'), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const anyActive = snap.docs.some((d) => d.data().status === 'active' || !d.data().status);
      if (anyActive) return true;
    }
  } catch (e) {
    console.warn('Notice checking admin email recognition in Firestore:', e);
  }
  return false;
};

/**
 * Cross-domain administrator credential verification.
 * Directly queries Firestore so credentials work identically on this domain,
 * Vercel (https://bridge-gamma-rust.vercel.app), and any external host.
 */
export const verifyAdminCredentialsInFirestore = async (
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; profile?: AdminProfile }> => {
  const cleanEmail = email.toLowerCase().trim();

  // 1. Must be recognized admin
  const isRecognized = await isRecognizedAdminEmail(cleanEmail);
  if (!isRecognized) {
    return {
      success: false,
      error: 'Invalid administrator email or password. Please verify your credentials or use Password Reset.',
    };
  }

  // 2. Query admin document
  let adminData: any = null;
  let adminDocId = cleanEmail;

  try {
    const adminDoc = await getDoc(doc(db, 'admins', cleanEmail));
    if (adminDoc.exists()) {
      adminData = adminDoc.data();
    } else {
      const q = query(collection(db, 'admins'), where('email', '==', cleanEmail));
      const snap = await getDocs(q);
      if (!snap.empty) {
        adminDocId = snap.docs[0].id;
        adminData = snap.docs[0].data();
      }
    }
  } catch (err) {
    console.warn('Direct Firestore admin lookup note:', err);
  }

  // If passwordHash and salt are stored, verify
  if (adminData && adminData.passwordHash && adminData.salt) {
    const computed = await hashPasswordClient(password, adminData.salt);
    if (computed === adminData.passwordHash) {
      const profile: AdminProfile = {
        uid: adminData.uid || adminDocId,
        email: cleanEmail,
        name: adminData.name || (cleanEmail.includes('abuunaysah') ? 'Platform Owner' : 'Administrator'),
        role: adminData.role || 'super_admin',
        title: adminData.title || (cleanEmail.includes('abuunaysah') ? 'Platform Owner & Lead Administrator' : 'Administrator'),
        status: 'active',
        createdAt: adminData.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      try {
        await updateDoc(doc(db, 'admins', adminDocId), { lastLogin: new Date().toISOString() });
      } catch {}
      return { success: true, profile };
    }
  }

  // Fallback for Master Admin initial bootstrap with default system password
  const defaultAdminPassword = 'NaijaBridge2026#Admin';
  if (MASTER_ADMIN_EMAILS.includes(cleanEmail)) {
    if (password === defaultAdminPassword) {
      const salt = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      const passwordHash = await hashPasswordClient(password, salt);
      const profile: AdminProfile = {
        uid: adminData?.uid || `admin-${cleanEmail.replace(/[^a-z0-9]/g, '-')}`,
        email: cleanEmail,
        name: adminData?.name || (cleanEmail.includes('abuunaysah') ? 'Platform Owner' : 'Administrator'),
        role: 'super_admin',
        title: cleanEmail.includes('abuunaysah') ? 'Platform Owner & Lead Administrator' : 'System Administrator',
        status: 'active',
        createdAt: adminData?.createdAt || new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, 'admins', cleanEmail), {
          ...profile,
          passwordHash,
          salt,
        }, { merge: true });
      } catch (e) {
        console.warn('Notice bootstrapping admin doc in Firestore:', e);
      }

      return { success: true, profile };
    }
  }

  return {
    success: false,
    error: 'Invalid administrator email or password. Please verify your credentials or use Password Reset.',
  };
};

/**
 * Secure cross-domain password reset for authorized administrators.
 * Explicitly rejects any account not recognized as an administrator.
 */
export const resetAdminPasswordInFirestore = async (
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  const cleanEmail = email.toLowerCase().trim();

  // Strict check: Only pre-recognized administrators can reset passwords
  const isRecognized = await isRecognizedAdminEmail(cleanEmail);
  if (!isRecognized) {
    return {
      success: false,
      error: 'Access denied: This email address is not recognized as an authorized administrator account.',
    };
  }

  if (!newPassword || newPassword.trim().length < 4) {
    return {
      success: false,
      error: 'New password must be at least 4 characters long.',
    };
  }

  const salt = Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
  const passwordHash = await hashPasswordClient(newPassword.trim(), salt);
  const now = new Date().toISOString();

  const adminPayload = {
    email: cleanEmail,
    passwordHash,
    salt,
    status: 'active',
    role: 'super_admin',
    name: cleanEmail.includes('abuunaysah') ? 'Platform Owner' : 'Administrator',
    title: cleanEmail.includes('abuunaysah') ? 'Platform Owner & Lead Administrator' : 'System Administrator',
    updatedAt: now,
    lastLogin: now,
  };

  try {
    await setDoc(doc(db, 'admins', cleanEmail), adminPayload, { merge: true });
  } catch (err: any) {
    console.warn('Firestore password reset write warning:', err);
  }

  // Also dispatch audit log
  await logActivity({
    adminEmail: cleanEmail,
    adminName: cleanEmail.includes('abuunaysah') ? 'Platform Owner' : 'Administrator',
    action: 'Administrator Password Reset',
    category: 'auth',
    details: 'Password successfully updated and synchronized across all authorized domains.',
    timestamp: now,
  });

  return { success: true };
};

/**
 * ------------------------------------------------------------------
 * AUTHENTICATION & ROLE MANAGEMENT
 * ------------------------------------------------------------------
 */

export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const getAdminProfile = async (uid: string, email: string): Promise<AdminProfile | null> => {
  try {
    // Check by UID
    const adminDocRef = doc(db, 'admins', uid);
    const snap = await getDoc(adminDocRef);

    if (snap.exists()) {
      return snap.data() as AdminProfile;
    }

    // Check if indexed by email doc
    const emailDocRef = doc(db, 'admins', email.toLowerCase().trim());
    const emailSnap = await getDoc(emailDocRef);
    if (emailSnap.exists()) {
      return emailSnap.data() as AdminProfile;
    }

    // If master admin email and doc doesn't exist yet, auto-provision
    const isMaster = MASTER_ADMIN_EMAILS.includes(email.toLowerCase().trim());
    if (isMaster) {
      const newAdmin: AdminProfile = {
        uid,
        email: email.toLowerCase().trim(),
        name: email.includes('abuunaysah') ? 'Platform Owner' : 'Administrator',
        role: 'super_admin',
        title: email.includes('abuunaysah') ? 'Platform Owner & Lead Administrator' : 'System Administrator',
        status: 'active',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };
      await setDoc(adminDocRef, newAdmin);
      return newAdmin;
    }

    return null;
  } catch (err) {
    console.warn('Error fetching admin profile from Firestore:', err);
    // Fallback if master admin email
    if (MASTER_ADMIN_EMAILS.includes(email.toLowerCase().trim())) {
      return {
        uid,
        email,
        name: email.includes('abuunaysah') ? 'Platform Owner' : 'Administrator',
        role: 'super_admin',
        title: 'Platform Owner & Lead Administrator',
        status: 'active',
        createdAt: new Date().toISOString(),
      };
    }
    return null;
  }
};

export const ensureFirebaseAuth = async (): Promise<FirebaseUser | null> => {
  if (auth.currentUser) return auth.currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (e) {
    console.warn('Anonymous auth notice:', e);
    return null;
  }
};

export const loginAdmin = async (email: string, password: string): Promise<{ user: FirebaseUser; profile: AdminProfile }> => {
  const cleanEmail = email.toLowerCase().trim();

  // 1. Strict check: Must be a recognized admin account
  const isRecognized = await isRecognizedAdminEmail(cleanEmail);
  if (!isRecognized) {
    throw new Error('Access restricted: This email is not recognized as an authorized administrator account.');
  }

  // 2. Direct Firestore Cross-Domain Credential Verification
  const firestoreVerification = await verifyAdminCredentialsInFirestore(cleanEmail, password);
  if (firestoreVerification.success && firestoreVerification.profile) {
    const profile = firestoreVerification.profile;

    // Opportunistically sync Firebase Auth client if available
    try {
      if (auth.currentUser?.email !== cleanEmail) {
        await signInWithEmailAndPassword(auth, cleanEmail, password).catch(() => {});
      }
    } catch {}

    return {
      user: {
        uid: profile.uid,
        email: profile.email,
        displayName: profile.name,
      } as unknown as FirebaseUser,
      profile,
    };
  }

  // 3. Fallback to Firebase Email/Password Auth if configured
  try {
    const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
    const profile = await getAdminProfile(userCredential.user.uid, cleanEmail);
    if (!profile || profile.status !== 'active') {
      await signOut(auth);
      throw new Error('Access restricted: This account is not authorized as an active NaijaBridge administrator.');
    }
    return { user: userCredential.user, profile };
  } catch (err: any) {
    if (firestoreVerification.error) {
      throw new Error(firestoreVerification.error);
    }
    throw err;
  }
};

export const loginWithGoogleAdmin = async (): Promise<{ user: FirebaseUser; profile: AdminProfile }> => {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;
  const cleanEmail = (user.email || '').toLowerCase().trim();

  // Check if recognized
  const isRecognized = await isRecognizedAdminEmail(cleanEmail);
  if (!isRecognized) {
    await signOut(auth);
    throw new Error('Access restricted: Google account is not recognized as an authorized administrator.');
  }

  let profile = await getAdminProfile(user.uid, cleanEmail);
  if (!profile) {
    profile = {
      uid: user.uid,
      email: cleanEmail,
      name: user.displayName || (cleanEmail.includes('abuunaysah') ? 'Platform Owner' : 'Administrator'),
      role: 'super_admin',
      title: cleanEmail.includes('abuunaysah') ? 'Platform Owner & Lead Administrator' : 'Administrator',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'admins', user.uid), profile);
      await setDoc(doc(db, 'admins', cleanEmail), profile, { merge: true });
    } catch (e) {
      console.warn('Notice setting admin profile:', e);
    }
  }

  try {
    await logActivity({
      adminEmail: cleanEmail,
      adminName: profile.name,
      action: 'Admin Google Login',
      category: 'auth',
      details: 'Signed in via Firebase Google Authentication.',
      timestamp: new Date().toISOString(),
    });
  } catch {
    // silent catch
  }

  return { user, profile };
};

export const logoutAdmin = async (): Promise<void> => {
  await signOut(auth);
};

export const requestPasswordReset = async (email: string): Promise<void> => {
  const cleanEmail = email.toLowerCase().trim();
  const isRecognized = await isRecognizedAdminEmail(cleanEmail);
  if (!isRecognized) {
    throw new Error('Access denied: This email address is not recognized as an authorized administrator account.');
  }
  await sendPasswordResetEmail(auth, cleanEmail);
};

/**
 * ------------------------------------------------------------------
 * CLOUD FIRESTORE: OPPORTUNITIES
 * ------------------------------------------------------------------
 */

export const fetchPublishedOpportunities = async (): Promise<Opportunity[]> => {
  try {
    const oppsRef = collection(db, 'opportunities');
    const q = query(oppsRef, where('status', '==', 'published'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        slug: data.slug || d.id,
        organization: data.organization || 'NaijaBridge Partner',
        category: data.category || 'Jobs',
        type: data.type || 'Full-time',
        location: data.location || 'Nationwide, Nigeria',
        isRemote: !!data.isRemote,
        remoteType: data.remoteType || (data.isRemote ? 'Fully Remote' : 'On-site'),
        educationLevel: data.educationLevel || 'Open to Everyone',
        deadline: data.deadline || 'Ongoing',
        daysRemaining: data.daysRemaining || 14,
        description: data.description || '',
        applicationUrl: data.applicationUrl || data.officialLink || '',
        officialLink: data.officialLink || data.applicationUrl || '',
        officialSourceLink: data.officialSourceLink || data.officialLink || '',
        verificationStatus: data.verificationStatus || 'Verified',
        verifiedBy: data.verifiedBy || 'NaijaBridge Verification Team',
        status: 'Published',
        featured: !!data.featured,
        verified: true,
        postedDate: data.publishedAt || data.createdAt || new Date().toISOString(),
        tags: data.tags || [],
        requirements: data.requirements || [],
        benefits: data.benefits || [],
      } as unknown as Opportunity;
    });
  } catch (err) {
    console.error('Failed to fetch published opportunities:', err);
    return [];
  }
};

/**
 * Real-time listener for opportunities with support for published filter
 */
export const subscribeToOpportunities = (
  callback: (opportunities: Opportunity[]) => void,
  onError?: (error: Error) => void,
  onlyPublished: boolean = true
): (() => void) => {
  try {
    const oppsRef = collection(db, 'opportunities');
    const q = onlyPublished
      ? query(oppsRef, where('status', 'in', ['published', 'Published']))
      : oppsRef;

    return onSnapshot(
      q,
      (snapshot) => {
        const opps: Opportunity[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || '',
            slug: data.slug || d.id,
            organization: data.organization || 'NaijaBridge Partner',
            category: data.category || 'Jobs',
            type: data.type || 'Full-time',
            location: data.location || 'Nationwide, Nigeria',
            isRemote: !!data.isRemote,
            remoteType: data.remoteType || (data.isRemote ? 'Fully Remote' : 'On-site'),
            educationLevel: data.educationLevel || 'Open to Everyone',
            deadline: data.deadline || 'Ongoing',
            daysRemaining: data.daysRemaining || 14,
            description: data.description || '',
            applicationUrl: data.applicationUrl || data.officialLink || '',
            officialLink: data.officialLink || data.applicationUrl || '',
            officialSourceLink: data.officialSourceLink || data.officialLink || '',
            verificationStatus: data.verificationStatus || 'Verified',
            verifiedBy: data.verifiedBy || 'NaijaBridge Verification Team',
            status: (data.status || 'Published') as any,
            featured: !!data.featured,
            verified: true,
            postedDate: data.publishedAt || data.createdAt || new Date().toISOString(),
            tags: data.tags || [],
            requirements: data.requirements || [],
            benefits: data.benefits || [],
          } as unknown as Opportunity;
        });
        callback(opps);
      },
      (err) => {
        console.warn('Real-time opportunities subscription notice:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Failed to subscribe to opportunities:', err);
    return () => {};
  }
};

export const fetchAllOpportunitiesAdmin = async (): Promise<Opportunity[]> => {
  try {
    const oppsRef = collection(db, 'opportunities');
    const snapshot = await getDocs(oppsRef);

    if (!snapshot.empty) {
      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          slug: data.slug || d.id,
          organization: data.organization || 'NaijaBridge Partner',
          category: data.category || 'Jobs',
          type: data.type || 'Full-time',
          location: data.location || 'Nationwide, Nigeria',
          isRemote: !!data.isRemote,
          remoteType: data.remoteType || (data.isRemote ? 'Fully Remote' : 'On-site'),
          educationLevel: data.educationLevel || 'Open to Everyone',
          deadline: data.deadline || 'Ongoing',
          daysRemaining: data.daysRemaining || 14,
          description: data.description || '',
          applicationUrl: data.applicationUrl || data.officialLink || '',
          officialLink: data.officialLink || data.applicationUrl || '',
          officialSourceLink: data.officialSourceLink || data.officialLink || '',
          verificationStatus: data.verificationStatus || 'Verified',
          verifiedBy: data.verifiedBy || 'NaijaBridge Verification Team',
          status: data.status === 'published' ? 'Published' : data.status === 'archived' ? 'Archived' : 'Pending',
          featured: !!data.featured,
          verified: data.verified !== undefined ? !!data.verified : true,
          postedDate: data.publishedAt || data.createdAt || new Date().toISOString(),
          tags: data.tags || [],
          requirements: data.requirements || [],
          benefits: data.benefits || [],
        } as unknown as Opportunity;
      });
    }
  } catch (err) {
    console.warn('Firestore opportunities read notice:', err);
  }

  // Fallback to server API if server session token is active
  try {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('nb_admin_token_v1') : null;
    if (token) {
      const res = await fetch('/api/admin/opportunities', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {
    // Non-blocking fallback
  }

  return [];
};

export const createOpportunityInFirestore = async (
  opp: Omit<Opportunity, 'id' | 'postedDate'>,
  adminUser?: { uid?: string; email?: string; name?: string }
): Promise<string> => {
  const oppsRef = collection(db, 'opportunities');
  const now = new Date().toISOString();
  const slug = opp.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const adminEmail = adminUser?.email || 'admin@naijabridge.org';
  const adminName = adminUser?.name || 'Administrator';
  const userUid = adminUser?.uid || auth.currentUser?.uid || '';

  const docData = cleanFirestoreObject({
    title: opp.title,
    organization: opp.organization || 'NaijaBridge Partner',
    slug: slug || `opp-${Date.now()}`,
    category: opp.category,
    type: opp.type,
    description: opp.description,
    location: opp.location,
    isRemote: opp.isRemote,
    remoteType: opp.remoteType || (opp.isRemote ? 'Fully Remote' : 'On-site'),
    educationLevel: opp.educationLevel || 'Open to Everyone',
    deadline: opp.deadline,
    daysRemaining: opp.daysRemaining || 14,
    applicationUrl: opp.applicationUrl || opp.officialLink || '',
    officialLink: opp.officialLink || opp.applicationUrl || '',
    officialSourceLink: opp.officialSourceLink || opp.officialLink || '',
    verificationStatus: opp.verificationStatus || 'Verified',
    verifiedBy: opp.verifiedBy || adminName,
    status: (opp.status || 'draft').toLowerCase(),
    featured: !!opp.featured,
    verified: true,
    tags: opp.tags || [],
    requirements: opp.requirements || [],
    benefits: opp.benefits || [],
    createdAt: now,
    updatedAt: now,
    publishedAt: opp.status === 'Published' || (opp.status as string) === 'published' ? now : null,
    createdBy: adminEmail,
    createdByUid: userUid,
    updatedBy: adminEmail,
    updatedByUid: userUid,
  });

  const docRef = await addDoc(oppsRef, docData);

  await logActivity({
    adminEmail,
    adminName,
    action: 'Create Opportunity',
    category: 'opportunities',
    details: `Created opportunity "${opp.title}" [${docData.status}]`,
    timestamp: now,
  });

  return docRef.id;
};

export const updateOpportunityInFirestore = async (
  id: string,
  updates: Partial<Opportunity>,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'opportunities', id);
  const now = new Date().toISOString();
  const userUid = adminUser.uid || auth.currentUser?.uid || '';

  const firestoreUpdates: any = {
    ...updates,
    updatedAt: now,
    updatedBy: adminUser.email,
    updatedByUid: userUid,
  };

  if (updates.status) {
    firestoreUpdates.status = updates.status.toLowerCase().replace(' ', '_');
    if (firestoreUpdates.status === 'published' && !updates.postedDate) {
      firestoreUpdates.publishedAt = now;
    }
  }

  await updateDoc(docRef, firestoreUpdates);

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Update Opportunity',
    category: 'opportunities',
    details: `Updated opportunity ID "${id}"`,
    timestamp: now,
  });
};

export const deleteOpportunityFromFirestore = async (
  id: string,
  title: string,
  adminUser: { email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'opportunities', id);
  await deleteDoc(docRef);

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Delete Opportunity',
    category: 'opportunities',
    details: `Deleted opportunity "${title}" (${id})`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * ------------------------------------------------------------------
 * CLOUD FIRESTORE: EVENTS & WORKSHOPS
 * ------------------------------------------------------------------
 */

export const fetchPublishedEvents = async (): Promise<WorkshopEvent[]> => {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('status', '==', 'published'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        title: data.title || '',
        category: data.category || 'Skills',
        date: data.date || '',
        timeWAT: data.timeWAT || data.time || '6:00 PM WAT',
        time: data.time || '6:00 PM',
        platform: data.platform || 'Google Meet',
        fee: data.fee || 'Free',
        speaker: data.speaker || data.facilitator || '',
        facilitator: data.facilitator || data.speaker || '',
        speakerRole: data.speakerRole || data.facilitatorRole || '',
        facilitatorRole: data.facilitatorRole || data.speakerRole || '',
        registrationLimit: data.registrationLimit || 100,
        registeredCount: data.registeredCount || 0,
        registeredAttendeesCount: data.registeredAttendeesCount || data.registeredCount || 0,
        meetingLink: data.meetingLink || '',
        status: 'Upcoming',
        description: data.description || '',
      } as unknown as WorkshopEvent;
    });
  } catch (err) {
    console.error('Failed to fetch events:', err);
    return [];
  }
};

/**
 * Real-time listener for events & workshops with support for published filter
 */
export const subscribeToEvents = (
  callback: (events: WorkshopEvent[]) => void,
  onError?: (error: Error) => void,
  onlyPublished: boolean = true
): (() => void) => {
  try {
    const eventsRef = collection(db, 'events');
    const q = onlyPublished
      ? query(eventsRef, where('status', 'in', ['published', 'Published']))
      : eventsRef;

    return onSnapshot(
      q,
      (snapshot) => {
        const events: WorkshopEvent[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || '',
            category: data.category || 'Skills',
            date: data.date || '',
            timeWAT: data.timeWAT || data.time || '6:00 PM WAT',
            time: data.time || '6:00 PM',
            platform: data.platform || 'Google Meet',
            fee: data.fee || 'Free',
            speaker: data.speaker || data.facilitator || '',
            facilitator: data.facilitator || data.speaker || '',
            speakerRole: data.speakerRole || data.facilitatorRole || '',
            facilitatorRole: data.facilitatorRole || data.speakerRole || '',
            registrationLimit: data.registrationLimit || 100,
            registeredCount: data.registeredCount || 0,
            registeredAttendeesCount: data.registeredAttendeesCount || data.registeredCount || 0,
            meetingLink: data.meetingLink || '',
            status: data.status || 'Upcoming',
            description: data.description || '',
          } as unknown as WorkshopEvent;
        });
        callback(events);
      },
      (err) => {
        console.warn('Real-time events subscription notice:', err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Failed to subscribe to events:', err);
    return () => {};
  }
};

export const fetchAllEventsAdmin = async (): Promise<WorkshopEvent[]> => {
  try {
    const eventsRef = collection(db, 'events');
    const snapshot = await getDocs(eventsRef);

    if (!snapshot.empty) {
      return snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title || '',
          category: data.category || 'Skills',
          date: data.date || '',
          timeWAT: data.timeWAT || data.time || '6:00 PM WAT',
          time: data.time || '6:00 PM',
          platform: data.platform || 'Google Meet',
          fee: data.fee || 'Free',
          speaker: data.speaker || data.facilitator || '',
          facilitator: data.facilitator || data.speaker || '',
          speakerRole: data.speakerRole || data.facilitatorRole || '',
          facilitatorRole: data.facilitatorRole || data.speakerRole || '',
          registrationLimit: data.registrationLimit || 100,
          registeredCount: data.registeredCount || 0,
          registeredAttendeesCount: data.registeredAttendeesCount || data.registeredCount || 0,
          meetingLink: data.meetingLink || '',
          status: data.status === 'published' ? 'Upcoming' : 'Draft',
          description: data.description || '',
        } as unknown as WorkshopEvent;
      });
    }
  } catch (err) {
    console.warn('Firestore events read notice:', err);
  }

  // Fallback to server API if server session token is active
  try {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('nb_admin_token_v1') : null;
    if (token) {
      const res = await fetch('/api/admin/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {
    // Non-blocking fallback
  }

  return [];
};

export const createEventInFirestore = async (
  eventData: Omit<WorkshopEvent, 'id' | 'registeredCount'>,
  adminUser?: { uid?: string; email?: string; name?: string }
): Promise<string> => {
  const eventsRef = collection(db, 'events');
  const now = new Date().toISOString();
  const adminEmail = adminUser?.email || 'admin@naijabridge.org';
  const adminName = adminUser?.name || 'Administrator';
  const userUid = adminUser?.uid || auth.currentUser?.uid || '';

  const docData = cleanFirestoreObject({
    ...eventData,
    status: (eventData.status || 'draft').toLowerCase(),
    registeredCount: 0,
    createdAt: now,
    updatedAt: now,
    publishedAt: (eventData as any).status === 'Published' || (eventData as any).status === 'published' ? now : null,
    createdBy: adminEmail,
    createdByUid: userUid,
    updatedBy: adminEmail,
    updatedByUid: userUid,
  });

  const docRef = await addDoc(eventsRef, docData);

  await logActivity({
    adminEmail,
    adminName,
    action: 'Create Event',
    category: 'events',
    details: `Created workshop "${eventData.title}"`,
    timestamp: now,
  });

  return docRef.id;
};

export const updateEventInFirestore = async (
  id: string,
  updates: Partial<WorkshopEvent>,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'events', id);
  const now = new Date().toISOString();
  const userUid = adminUser.uid || auth.currentUser?.uid || '';

  const firestoreUpdates: any = {
    ...updates,
    updatedAt: now,
    updatedBy: adminUser.email,
    updatedByUid: userUid,
  };
  if (updates.status) {
    firestoreUpdates.status = updates.status.toLowerCase();
  }

  await updateDoc(docRef, firestoreUpdates);

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Update Event',
    category: 'events',
    details: `Updated event ID "${id}"`,
    timestamp: now,
  });
};

export const deleteEventFromFirestore = async (
  id: string,
  title: string,
  adminUser: { email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'events', id);
  await deleteDoc(docRef);

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Delete Event',
    category: 'events',
    details: `Deleted event "${title}" (${id})`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * ------------------------------------------------------------------
 * CLOUD FIRESTORE: PUBLIC ENQUIRIES & NEWSLETTER
 * ------------------------------------------------------------------
 */

export const submitPublicEnquiry = async (enquiry: {
  name?: string;
  fullName?: string;
  email: string;
  phone?: string;
  category?: string;
  subjectOrCategory?: string;
  message: string;
  type: string;
  organization?: string;
}): Promise<string> => {
  const enquiriesRef = collection(db, 'enquiries');
  const now = new Date().toISOString();

  const docRef = await addDoc(enquiriesRef, {
    fullName: enquiry.fullName || enquiry.name || 'Anonymous User',
    name: enquiry.fullName || enquiry.name || 'Anonymous User',
    email: enquiry.email,
    phone: enquiry.phone || '',
    category: enquiry.category || enquiry.subjectOrCategory || 'General',
    subjectOrCategory: enquiry.category || enquiry.subjectOrCategory || 'General',
    message: enquiry.message,
    type: enquiry.type,
    organization: enquiry.organization || '',
    status: 'New',
    submittedAt: now,
  });

  return docRef.id;
};

export const fetchAllEnquiriesAdmin = async (): Promise<ContactInquiry[]> => {
  try {
    const ref = collection(db, 'enquiries');
    const snapshot = await getDocs(ref);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ContactInquiry[];
    }
  } catch (err) {
    console.warn('Firestore enquiries read notice:', err);
  }

  try {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('nb_admin_token_v1') : null;
    if (token) {
      const res = await fetch('/api/admin/inquiries', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {
    // Non-blocking fallback
  }

  return [];
};

export const subscribeToNewsletter = async (email: string, source: string = 'Website'): Promise<string> => {
  const cleanEmail = email.toLowerCase().trim();
  const subRef = doc(db, 'newsletter_subscribers', cleanEmail);
  const now = new Date().toISOString();

  await setDoc(subRef, {
    email: cleanEmail,
    source,
    status: 'Active',
    joinedDate: now,
  }, { merge: true });

  return cleanEmail;
};

export const fetchNewsletterSubscribersAdmin = async (): Promise<any[]> => {
  try {
    const ref = collection(db, 'newsletter_subscribers');
    const snapshot = await getDocs(ref);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
    }
  } catch (err) {
    console.warn('Firestore newsletter subscribers read notice:', err);
  }

  try {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('nb_admin_token_v1') : null;
    if (token) {
      const res = await fetch('/api/admin/subscribers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {
    // Non-blocking fallback
  }

  return [];
};

/**
 * ------------------------------------------------------------------
 * CLOUD FIRESTORE: SITE SETTINGS & CMS
 * ------------------------------------------------------------------
 */

export const fetchSiteSettings = async (): Promise<SiteSettings> => {
  let settings: SiteSettings = {
    siteName: 'NaijaBridge',
    heroHeadline: 'Connecting Nigerian Talent to Global and Local Impact',
    heroSubheadline: 'Empowering Nigerian youth, innovators, and professionals with verified opportunities, skills, and community.',
  };

  try {
    // 0. Fetch primary settings/branding
    try {
      const primaryBrandingSnap = await getDoc(doc(db, 'settings', 'branding'));
      if (primaryBrandingSnap.exists()) {
        const pData = primaryBrandingSnap.data();
        settings = {
          ...settings,
          logoUrl: pData.logoUrl || settings.logoUrl,
          logoStoragePath: pData.logoStoragePath,
          logoVersion: pData.logoVersion || 1,
          logoAlt: pData.logoAltText || pData.logoAlt || settings.logoAlt,
          faviconUrl: pData.faviconUrl || settings.faviconUrl,
          updatedAt: pData.updatedAt?.toDate ? pData.updatedAt.toDate().toISOString() : (pData.updatedAt || settings.updatedAt),
          updatedBy: pData.updatedBy || settings.updatedBy,
        };
      }
    } catch (brandingErr) {
      console.warn('Could not read settings/branding, falling back to site_settings/branding:', brandingErr);
    }

    // 1. Fetch general settings
    const generalRef = doc(db, 'site_settings', 'general');
    const generalSnap = await getDoc(generalRef);
    if (generalSnap.exists()) {
      settings = { ...settings, ...(generalSnap.data() as SiteSettings) };
    }

    // 2. Fetch legacy branding settings (Production logo, light/dark variants, favicon)
    const brandingRef = doc(db, 'site_settings', 'branding');
    const brandingSnap = await getDoc(brandingRef);
    if (brandingSnap.exists()) {
      const bData = brandingSnap.data();
      settings = {
        ...settings,
        logoUrl: settings.logoUrl || bData.logoUrl,
        logoLightUrl: bData.logoLightUrl !== undefined ? bData.logoLightUrl : settings.logoLightUrl,
        logoDarkUrl: bData.logoDarkUrl !== undefined ? bData.logoDarkUrl : settings.logoDarkUrl,
        faviconUrl: bData.faviconUrl !== undefined ? bData.faviconUrl : settings.faviconUrl,
        logoAlt: settings.logoAlt || bData.logoAlt || 'NaijaBridge',
        updatedAt: settings.updatedAt || bData.updatedAt,
        updatedBy: settings.updatedBy || bData.updatedBy,
        updatedByUid: bData.updatedByUid || settings.updatedByUid,
      };
    }
  } catch (err) {
    console.warn('Unable to load site settings from Firestore:', err);
  }

  return settings;
};

/**
 * Real-time listener for brand settings in settings/branding
 */
export const subscribeToBranding = (
  callback: (branding: {
    logoUrl?: string;
    logoStoragePath?: string;
    logoAltText?: string;
    logoVersion?: number;
    faviconUrl?: string;
    updatedAt?: string;
  }) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const docRef = doc(db, 'settings', 'branding');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          callback({
            logoUrl: data.logoUrl,
            logoStoragePath: data.logoStoragePath,
            logoAltText: data.logoAltText || data.logoAlt,
            logoVersion: data.logoVersion || 1,
            faviconUrl: data.faviconUrl,
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : (data.updatedAtClient || data.updatedAt),
          });
        }
      },
      (err) => {
        console.warn('subscribeToBranding notice:', err);
        onError?.(err);
      }
    );
  } catch (err: any) {
    console.warn('Failed to attach branding onSnapshot listener:', err);
    onError?.(err);
    return () => {};
  }
};

export const updateSiteSettingsInFirestore = async (
  settings: Partial<SiteSettings>,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const now = new Date().toISOString();
  const userEmail = adminUser.email;
  const userUid = adminUser.uid || auth.currentUser?.uid || '';

  // Write to primary settings/branding if logo or branding attributes exist
  if (
    settings.logoUrl !== undefined ||
    settings.faviconUrl !== undefined ||
    settings.logoAlt !== undefined ||
    (settings as any).logoStoragePath !== undefined ||
    (settings as any).logoVersion !== undefined
  ) {
    try {
      const primaryBrandingRef = doc(db, 'settings', 'branding');
      const primaryData: any = {
        updatedAt: serverTimestamp(),
        updatedAtClient: now,
        updatedBy: userUid || userEmail,
        updatedByName: adminUser.name,
      };
      if (settings.logoUrl !== undefined) primaryData.logoUrl = settings.logoUrl;
      if (settings.faviconUrl !== undefined) primaryData.faviconUrl = settings.faviconUrl;
      if (settings.logoAlt !== undefined) {
        primaryData.logoAltText = settings.logoAlt;
        primaryData.logoAlt = settings.logoAlt;
      }
      if ((settings as any).logoStoragePath !== undefined) primaryData.logoStoragePath = (settings as any).logoStoragePath;
      if ((settings as any).logoVersion !== undefined) primaryData.logoVersion = (settings as any).logoVersion;

      await setDoc(primaryBrandingRef, primaryData, { merge: true });
    } catch (pErr) {
      console.warn('Failed to write settings/branding directly:', pErr);
    }
  }

  // Write to site_settings/general
  const generalRef = doc(db, 'site_settings', 'general');
  await setDoc(
    generalRef,
    {
      ...settings,
      updatedAt: now,
      updatedBy: userEmail,
      updatedByUid: userUid,
    },
    { merge: true }
  );

  // If branding properties are present, also sync to site_settings/branding
  if (
    settings.logoUrl !== undefined ||
    settings.logoLightUrl !== undefined ||
    settings.logoDarkUrl !== undefined ||
    settings.faviconUrl !== undefined ||
    settings.logoAlt !== undefined
  ) {
    const brandingRef = doc(db, 'site_settings', 'branding');
    const brandingData: any = {
      updatedAt: now,
      updatedBy: userEmail,
      updatedByUid: userUid,
    };
    if (settings.logoUrl !== undefined) brandingData.logoUrl = settings.logoUrl;
    if (settings.logoLightUrl !== undefined) brandingData.logoLightUrl = settings.logoLightUrl;
    if (settings.logoDarkUrl !== undefined) brandingData.logoDarkUrl = settings.logoDarkUrl;
    if (settings.faviconUrl !== undefined) brandingData.faviconUrl = settings.faviconUrl;
    if (settings.logoAlt !== undefined) brandingData.logoAlt = settings.logoAlt;

    await setDoc(brandingRef, brandingData, { merge: true });
  }

  await logActivity({
    adminEmail: userEmail,
    adminName: adminUser.name,
    action: 'Update Site Settings',
    category: 'settings',
    details: `Updated site settings and branding.`,
    timestamp: now,
  });
};

/**
 * ------------------------------------------------------------------
 * CLOUD STORAGE FOR FIREBASE: LOGO & MEDIA UPLOADS
 * ------------------------------------------------------------------
 */

export interface UploadResult {
  downloadUrl: string;
  filename: string;
  size: number;
  contentType: string;
  originalSize?: number;
  savingsPercentage?: number;
  storagePath?: string;
  altText?: string;
}

export const uploadMediaToStorage = async (
  file: File,
  folder: 'logos' | 'favicons' | 'heroes' | 'courses' | 'opportunities' | 'events' | 'documents' | 'content',
  adminUser: { uid?: string; email: string; name: string },
  options?: {
    altText?: string;
    onProgress?: (percent: number) => void;
    onCancelReady?: (cancelFn: () => void) => void;
  }
): Promise<UploadResult> => {
  // 1. Validation
  const validation = validateUploadFile(file, folder);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file.');
  }

  // 2. Client-side Image Optimization (Resize, WebP, EXIF stripping)
  const optimization = await optimizeImageBeforeUpload(file, { folder });
  const fileToUpload = optimization.file;

  const userEmail = adminUser.email;
  const userUid = adminUser.uid || auth.currentUser?.uid || '';
  const cleanFilename = generateSafeFilename(file.name, fileToUpload.type.includes('webp') ? 'webp' : undefined);
  const storagePath = `media/${folder}/${cleanFilename}`;
  const storageRef = ref(storage, storagePath);

  try {
    // 3. Upload with resumable task and progress tracking
    const uploadTask = uploadBytesResumable(storageRef, fileToUpload, {
      contentType: fileToUpload.type,
      customMetadata: {
        uploadedBy: userEmail,
        uploadedByUid: userUid,
        uploadedAt: new Date().toISOString(),
        altText: options?.altText || '',
        originalName: file.name,
      },
    });

    if (options?.onCancelReady) {
      options.onCancelReady(() => uploadTask.cancel());
    }

    if (options?.onProgress) {
      uploadTask.on('state_changed', (snapshot) => {
        const progress =
          snapshot.totalBytes > 0
            ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            : 0;
        options.onProgress?.(progress);
      });
    }

    const snapshot = await uploadTask;
    const downloadUrl = await getDownloadURL(snapshot.ref);

    // 4. Save metadata to Firestore collection `media_assets`
    const now = new Date().toISOString();
    const assetDocId = `${folder}_${cleanFilename.replace(/[^a-z0-9_-]/g, '_')}`;
    const assetRef = doc(db, 'media_assets', assetDocId);

    const assetData: MediaAssetRecord = {
      id: assetDocId,
      downloadUrl,
      storagePath,
      folder,
      filename: cleanFilename,
      originalName: file.name,
      size: fileToUpload.size,
      originalSize: file.size,
      savingsPercentage: optimization.savingsPercentage,
      contentType: fileToUpload.type,
      altText: options?.altText || '',
      uploadedAt: now,
      uploadedBy: userEmail,
      uploadedByUid: userUid,
    };

    try {
      await setDoc(assetRef, assetData);
    } catch (dbErr) {
      console.warn('Could not write media asset metadata to Firestore:', dbErr);
    }

    await logActivity({
      adminEmail: userEmail,
      adminName: adminUser.name,
      action: 'Upload Media',
      category: 'media',
      details: `Uploaded ${folder} file "${file.name}" (${(fileToUpload.size / 1024).toFixed(1)} KB${
        optimization.savingsPercentage > 0 ? `, saved ${optimization.savingsPercentage}%` : ''
      })`,
      timestamp: now,
    });

    return {
      downloadUrl,
      filename: cleanFilename,
      size: fileToUpload.size,
      originalSize: file.size,
      savingsPercentage: optimization.savingsPercentage,
      contentType: fileToUpload.type,
      storagePath,
      altText: options?.altText || '',
    };
  } catch (storageErr: any) {
    console.error('Firebase Storage upload error:', storageErr);
    if (storageErr?.code === 'storage/canceled') {
      throw new Error('Upload was cancelled.');
    }
    const message = storageErr?.message || 'Storage upload failed. Please verify your connection and permissions, then retry.';
    const err: any = new Error(message);
    err.originalError = storageErr;
    throw err;
  }
};

/**
 * Resumable brand logo upload with cache-busting versioning and Firestore sync
 */
export const uploadBrandingLogo = async (
  file: File,
  adminUser: { uid?: string; email: string; name: string },
  options?: {
    altText?: string;
    isFavicon?: boolean;
    onProgress?: (percent: number) => void;
    onCancelReady?: (cancel: () => void) => void;
  }
): Promise<{
  logoUrl: string;
  logoStoragePath: string;
  logoVersion: number;
  versionedUrl: string;
  logoAltText: string;
}> => {
  const folder = options?.isFavicon ? 'favicons' : 'logos';
  const userEmail = adminUser.email;
  const userUid = adminUser.uid || auth.currentUser?.uid || '';

  // 1. Validate file type and size
  const validation = validateUploadFile(file, folder);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file format or size for branding logo.');
  }

  // 2. Browser-side optimization preserving PNG transparency and SVG
  const optimization = await optimizeImageBeforeUpload(file, {
    folder,
    maxWidth: options?.isFavicon ? 256 : 1600,
    maxHeight: options?.isFavicon ? 256 : 1600,
    quality: 0.88,
  });
  const fileToUpload = optimization.file;

  // 3. Unique storage path with timestamp so caching never conflicts
  const isSvg = fileToUpload.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const isPng = fileToUpload.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
  const ext = isSvg ? 'svg' : isPng ? 'png' : fileToUpload.type === 'image/webp' ? 'webp' : 'png';
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const cleanBase = file.name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9_-]/g, '_').slice(0, 30);
  const storagePath = `settings/branding/${timestamp}_${cleanBase}_${randomSuffix}.${ext}`;
  const storageRef = ref(storage, storagePath);

  // 4. Resumable Storage Upload with progress tracking
  const uploadTask = uploadBytesResumable(storageRef, fileToUpload, {
    contentType: fileToUpload.type,
    customMetadata: {
      uploadedBy: userEmail,
      uploadedByUid: userUid,
      uploadedAt: new Date().toISOString(),
      altText: options?.altText || 'NaijaBridge logo',
      originalName: file.name,
    },
  });

  if (options?.onCancelReady) {
    options.onCancelReady(() => uploadTask.cancel());
  }

  if (options?.onProgress) {
    uploadTask.on('state_changed', (snapshot) => {
      const progress = snapshot.totalBytes > 0
        ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        : 0;
      options.onProgress?.(progress);
    });
  }

  // Step A: Confirm Storage Upload
  const snapshot = await uploadTask;
  const downloadUrl = await getDownloadURL(snapshot.ref);

  // Step B: Calculate next logo version
  let nextVersion = 1;
  try {
    const existingSnap = await getDoc(doc(db, 'settings', 'branding'));
    if (existingSnap.exists()) {
      const currentVer = existingSnap.data()?.logoVersion;
      if (typeof currentVer === 'number') {
        nextVersion = currentVer + 1;
      }
    }
  } catch (e) {
    nextVersion = Date.now();
  }

  // Step C: Save to settings/branding
  const now = new Date().toISOString();
  const logoAlt = options?.altText || 'NaijaBridge logo';
  const brandingPayload = {
    logoUrl: downloadUrl,
    logoStoragePath: storagePath,
    logoAltText: logoAlt,
    logoVersion: nextVersion,
    updatedAt: serverTimestamp(),
    updatedAtClient: now,
    updatedBy: userUid || userEmail,
    updatedByName: adminUser.name,
  };

  // Step D: Confirm Firestore update
  await setDoc(doc(db, 'settings', 'branding'), brandingPayload, { merge: true });

  // Sync to site_settings/branding and site_settings/general
  try {
    await setDoc(doc(db, 'site_settings', 'branding'), {
      ...brandingPayload,
      updatedAt: now,
    }, { merge: true });

    await setDoc(doc(db, 'site_settings', 'general'), {
      logoUrl: downloadUrl,
      logoVersion: nextVersion,
      logoAlt,
      updatedAt: now,
      updatedBy: userEmail,
    }, { merge: true });
  } catch (syncErr) {
    console.warn('Sync to site_settings notice:', syncErr);
  }

  // Activity log
  await logActivity({
    adminEmail: userEmail,
    adminName: adminUser.name,
    action: 'Upload Brand Logo',
    category: 'settings',
    details: `Uploaded new brand logo (Version ${nextVersion}) to ${storagePath}`,
    timestamp: now,
  });

  const versionedUrl = `${downloadUrl}${downloadUrl.includes('?') ? '&' : '?'}v=${nextVersion}`;

  return {
    logoUrl: downloadUrl,
    logoStoragePath: storagePath,
    logoVersion: nextVersion,
    versionedUrl,
    logoAltText: logoAlt,
  };
};

export const fetchMediaAssetsAdmin = async (
  folder?: string
): Promise<MediaAssetRecord[]> => {
  try {
    const assetsRef = collection(db, 'media_assets');
    const q = folder
      ? query(assetsRef, where('folder', '==', folder))
      : query(assetsRef, orderBy('uploadedAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(
      (d) =>
        ({
          id: d.id,
          ...d.data(),
        } as MediaAssetRecord)
    );
  } catch (err) {
    console.warn('Failed to load media assets from Firestore:', err);
    return [];
  }
};

export const deleteMediaAssetFromFirestore = async (
  id: string,
  storagePath: string,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  try {
    if (storagePath) {
      const sRef = ref(storage, storagePath);
      await deleteObject(sRef).catch(() => {});
    }
    const docRef = doc(db, 'media_assets', id);
    await deleteDoc(docRef);

    await logActivity({
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'Delete Media',
      category: 'media',
      details: `Deleted media asset ID "${id}"`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Failed to delete media asset:', err);
    throw err;
  }
};

/**
 * ------------------------------------------------------------------
 * CLOUD FIRESTORE: ACADEMY COURSES & APPLICATIONS
 * ------------------------------------------------------------------
 */

export const fetchPublishedAcademyCourses = async (): Promise<AcademyCourse[]> => {
  try {
    const coursesRef = collection(db, 'academy_courses');
    const snap = await getDocs(coursesRef);
    if (!snap.empty) {
      const items = snap.docs
        .map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || 'Untitled Course',
            slug: data.slug || d.id,
            description: data.description || '',
            category: data.category || 'Tech & Development',
            instructorName: data.instructorName || 'Lead Instructor',
            duration: data.duration || '6 Weeks',
            skillLevel: data.skillLevel || 'Beginner',
            deliveryFormat: data.deliveryFormat || 'Hybrid',
            tuitionStatus: data.tuitionStatus || 'Free',
            priceNaira: typeof data.priceNaira === 'number' ? data.priceNaira : (data.tuitionStatus === 'Paid' ? 50000 : 0),
            publishedStatus: data.publishedStatus || data.status || 'published',
            startDate: data.startDate || '',
            applicationDeadline: data.applicationDeadline || '',
            modules: Array.isArray(data.modules) ? data.modules : [],
            completionCriteria: data.completionCriteria || {
              minAttendancePercent: 80,
              minAssignmentScorePercent: 70,
              capstoneRequired: true,
              requiresReview: true,
            },
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
            createdBy: data.createdBy || 'Admin',
          } as AcademyCourse;
        })
        .filter((c) => {
          const pub = (c.publishedStatus || '').toLowerCase();
          return pub === 'published' || pub === '';
        });

      if (items.length > 0) {
        return items.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
      }
    }
  } catch (err) {
    console.warn('Firestore published courses read notice:', err);
  }

  // Fallback to server API if firestore collection is newly created or empty
  try {
    const res = await fetch('/api/academy/courses');
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data)
        ? data.filter((c: any) => {
            const pub = (c.publishedStatus || c.status || '').toLowerCase();
            return pub === 'published' || pub === '';
          })
        : [];
    }
  } catch {
    // Non-blocking fallback
  }

  return [];
};

export const subscribeToAcademyCourses = (
  callback: (courses: AcademyCourse[]) => void
): (() => void) => {
  try {
    const coursesRef = collection(db, 'academy_courses');
    return onSnapshot(
      coursesRef,
      (snap) => {
        const items = snap.docs.map((d) => {
          const data = d.data();
          const rawTuition = String(data.tuitionStatus || '').toLowerCase();
          const tuitionStatus: any =
            rawTuition === 'paid'
              ? 'paid'
              : rawTuition === 'sponsored'
              ? 'sponsored'
              : rawTuition === 'closed'
              ? 'closed'
              : 'tuition-free';

          return {
            id: d.id,
            title: data.title || 'Untitled Course',
            slug: data.slug || d.id,
            description: data.description || '',
            category: data.category || 'Tech & Development',
            instructorName: data.instructorName || 'Lead Instructor',
            duration: data.duration || '6 Weeks',
            skillLevel: data.skillLevel || 'Beginner',
            deliveryFormat: data.deliveryFormat || 'Hybrid',
            tuitionStatus,
            priceNaira: typeof data.priceNaira === 'number' ? data.priceNaira : (tuitionStatus === 'paid' ? 50000 : 0),
            publishedStatus: data.publishedStatus || data.status || 'published',
            startDate: data.startDate || '',
            applicationDeadline: data.applicationDeadline || '',
            modules: Array.isArray(data.modules) ? data.modules : [],
            completionCriteria: data.completionCriteria || {
              minAttendancePercent: 80,
              minAssignmentScorePercent: 70,
              capstoneRequired: true,
              requiresReview: true,
            },
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
            createdBy: data.createdBy || 'Admin',
          } as AcademyCourse;
        });

        items.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });

        callback(items);
      },
      (err) => {
        console.warn('Real-time academy courses subscription notice:', err);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to academy courses:', err);
    return () => {};
  }
};

export const fetchAllAcademyCoursesAdmin = async (): Promise<AcademyCourse[]> => {
  try {
    const coursesRef = collection(db, 'academy_courses');
    const snap = await getDocs(coursesRef);
    if (!snap.empty) {
      const items = snap.docs.map((d) => {
        const data = d.data();
        const rawTuition = String(data.tuitionStatus || '').toLowerCase();
        const tuitionStatus: any =
          rawTuition === 'paid'
            ? 'paid'
            : rawTuition === 'sponsored'
            ? 'sponsored'
            : rawTuition === 'closed'
            ? 'closed'
            : 'tuition-free';

        return {
          id: d.id,
          title: data.title || 'Untitled Course',
          slug: data.slug || d.id,
          description: data.description || '',
          category: data.category || 'Tech & Development',
          instructorName: data.instructorName || 'Lead Instructor',
          duration: data.duration || '6 Weeks',
          skillLevel: data.skillLevel || 'Beginner',
          deliveryFormat: data.deliveryFormat || 'Hybrid',
          tuitionStatus,
          priceNaira: typeof data.priceNaira === 'number' ? data.priceNaira : (tuitionStatus === 'paid' ? 50000 : 0),
          publishedStatus: data.publishedStatus || data.status || 'published',
          startDate: data.startDate || '',
          applicationDeadline: data.applicationDeadline || '',
          modules: Array.isArray(data.modules) ? data.modules : [],
          completionCriteria: data.completionCriteria || {
            minAttendancePercent: 80,
            minAssignmentScorePercent: 70,
            capstoneRequired: true,
            requiresReview: true,
          },
          createdAt: data.createdAt || '',
          updatedAt: data.updatedAt || '',
          createdBy: data.createdBy || 'Admin',
        } as AcademyCourse;
      });

      return items.sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      });
    }
  } catch (err) {
    console.warn('Firestore all courses read notice:', err);
  }

  try {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('nb_admin_token_v1') : null;
    if (token) {
      const res = await fetch('/api/academy/courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {
    // Fallback
  }

  return [];
};

export const createAcademyCourseInFirestore = async (
  course: Omit<AcademyCourse, 'id' | 'createdAt' | 'updatedAt'>,
  adminUser?: { uid?: string; email?: string; name?: string }
): Promise<string> => {
  const coursesRef = collection(db, 'academy_courses');
  const now = new Date().toISOString();
  const slug = (course.title || 'course').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const adminEmail = adminUser?.email || 'admin@naijabridge.org';
  const adminName = adminUser?.name || 'Administrator';

  const docData = cleanFirestoreObject({
    ...course,
    title: course.title || 'Untitled Course',
    slug: slug || `course-${Date.now()}`,
    description: course.description || '',
    category: course.category || 'Tech & Development',
    instructorName: course.instructorName || 'Lead Instructor',
    duration: course.duration || '6 Weeks',
    skillLevel: course.skillLevel || 'Beginner',
    deliveryFormat: course.deliveryFormat || 'Hybrid',
    tuitionStatus: course.tuitionStatus || 'tuition-free',
    priceNaira: typeof course.priceNaira === 'number' ? course.priceNaira : (course.tuitionStatus === 'paid' ? 50000 : 0),
    publishedStatus: course.publishedStatus || 'published',
    startDate: course.startDate || '',
    applicationDeadline: course.applicationDeadline || '',
    modules: Array.isArray(course.modules) ? course.modules : [],
    completionCriteria: course.completionCriteria || {
      minAttendancePercent: 80,
      minAssignmentScorePercent: 70,
      capstoneRequired: true,
      requiresReview: true,
    },
    createdAt: now,
    updatedAt: now,
    createdBy: adminEmail,
    createdByUid: adminUser?.uid || auth.currentUser?.uid || '',
  });

  const docRef = await addDoc(coursesRef, docData);

  await logActivity({
    adminEmail,
    adminName,
    action: 'Create Academy Course',
    category: 'cms',
    details: `Created course "${course.title}" [${docData.publishedStatus}]`,
    timestamp: now,
  });

  return docRef.id;
};

export const updateAcademyCourseInFirestore = async (
  id: string,
  updates: Partial<AcademyCourse>,
  adminUser?: { uid?: string; email?: string; name?: string }
): Promise<void> => {
  const docRef = doc(db, 'academy_courses', id);
  const now = new Date().toISOString();
  const adminEmail = adminUser?.email || 'admin@naijabridge.org';
  const adminName = adminUser?.name || 'Administrator';

  const cleanUpdates = cleanFirestoreObject({
    ...updates,
    id,
    updatedAt: now,
    updatedBy: adminEmail,
    updatedByUid: adminUser?.uid || auth.currentUser?.uid || '',
  });

  // Use setDoc with merge: true so existing documents are updated and pre-seeded/new IDs are cleanly created without "No document to update" errors
  await setDoc(docRef, cleanUpdates, { merge: true });

  await logActivity({
    adminEmail,
    adminName,
    action: 'Update Academy Course',
    category: 'cms',
    details: `Updated course "${updates.title || id}"`,
    timestamp: now,
  }).catch(() => {});
};

export const deleteAcademyCourseInFirestore = async (
  id: string,
  title: string,
  adminUser?: { uid?: string; email?: string; name?: string }
): Promise<void> => {
  try {
    const docRef = doc(db, 'academy_courses', id);
    await deleteDoc(docRef);
  } catch (deleteErr) {
    console.warn('Direct Firestore delete notice (may not exist as Firestore doc):', deleteErr);
  }

  const adminEmail = adminUser?.email || 'admin@naijabridge.org';
  const adminName = adminUser?.name || 'Administrator';

  await logActivity({
    adminEmail,
    adminName,
    action: 'Delete Academy Course',
    category: 'cms',
    details: `Deleted course "${title}" (${id})`,
    timestamp: new Date().toISOString(),
  }).catch(() => {});
};

// ---------------------------------------------------------------------------
// ACADEMY SUB-ENTITIES: MATERIALS, SCHEDULES, ASSIGNMENTS, ATTENDANCE, CERTIFICATES
// ---------------------------------------------------------------------------

export const fetchAcademyMaterialsFromFirestore = async (courseId?: string): Promise<any[]> => {
  try {
    const ref = collection(db, 'academy_materials');
    const snap = await getDocs(ref);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (courseId) {
      return list.filter((m: any) => m.courseId === courseId);
    }
    return list;
  } catch (err) {
    console.warn('Firestore materials read note:', err);
    return [];
  }
};

export const saveAcademyMaterialInFirestore = async (material: any): Promise<string> => {
  const ref = collection(db, 'academy_materials');
  const now = new Date().toISOString();
  const data = cleanFirestoreObject({
    ...material,
    publishedAt: material.publishedAt || now,
    createdAt: material.createdAt || now,
    updatedAt: now,
  });
  if (material.id) {
    await setDoc(doc(db, 'academy_materials', material.id), data, { merge: true });
    return material.id;
  }
  const docRef = await addDoc(ref, data);
  return docRef.id;
};

export const deleteAcademyMaterialFromFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'academy_materials', id));
};

export const fetchAcademySchedulesFromFirestore = async (courseId?: string): Promise<any[]> => {
  try {
    const ref = collection(db, 'academy_schedules');
    const snap = await getDocs(ref);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (courseId) {
      return list.filter((s: any) => s.courseId === courseId);
    }
    return list;
  } catch (err) {
    console.warn('Firestore schedules read note:', err);
    return [];
  }
};

export const saveAcademyScheduleInFirestore = async (schedule: any): Promise<string> => {
  const ref = collection(db, 'academy_schedules');
  const now = new Date().toISOString();
  const data = cleanFirestoreObject({
    ...schedule,
    createdAt: schedule.createdAt || now,
    updatedAt: now,
  });
  if (schedule.id) {
    await setDoc(doc(db, 'academy_schedules', schedule.id), data, { merge: true });
    return schedule.id;
  }
  const docRef = await addDoc(ref, data);
  return docRef.id;
};

export const deleteAcademyScheduleFromFirestore = async (id: string): Promise<void> => {
  await deleteDoc(doc(db, 'academy_schedules', id));
};

export const fetchAcademyAssignmentsFromFirestore = async (courseId?: string): Promise<any[]> => {
  try {
    const ref = collection(db, 'academy_assignments');
    const snap = await getDocs(ref);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (courseId) {
      return list.filter((a: any) => a.courseId === courseId);
    }
    return list;
  } catch (err) {
    console.warn('Firestore assignments read note:', err);
    return [];
  }
};

export const saveAcademyAssignmentInFirestore = async (assignment: any): Promise<string> => {
  const ref = collection(db, 'academy_assignments');
  const now = new Date().toISOString();
  const data = cleanFirestoreObject({
    ...assignment,
    submissions: assignment.submissions || [],
    createdAt: assignment.createdAt || now,
    updatedAt: now,
  });
  if (assignment.id) {
    await setDoc(doc(db, 'academy_assignments', assignment.id), data, { merge: true });
    return assignment.id;
  }
  const docRef = await addDoc(ref, data);
  return docRef.id;
};

export const fetchAcademyAttendanceFromFirestore = async (courseId?: string): Promise<any[]> => {
  try {
    const ref = collection(db, 'academy_attendance');
    const snap = await getDocs(ref);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (courseId) {
      return list.filter((att: any) => att.courseId === courseId);
    }
    return list;
  } catch (err) {
    console.warn('Firestore attendance read note:', err);
    return [];
  }
};

export const saveAcademyAttendanceInFirestore = async (record: any): Promise<string> => {
  const ref = collection(db, 'academy_attendance');
  const now = new Date().toISOString();
  const data = cleanFirestoreObject({
    ...record,
    timestamp: record.timestamp || now,
  });
  if (record.id) {
    await setDoc(doc(db, 'academy_attendance', record.id), data, { merge: true });
    return record.id;
  }
  const docRef = await addDoc(ref, data);
  return docRef.id;
};

export const fetchAcademyEnrollmentsFromFirestore = async (courseId?: string): Promise<any[]> => {
  try {
    const ref = collection(db, 'academy_enrollments');
    const snap = await getDocs(ref);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (courseId) {
      return list.filter((e: any) => e.courseId === courseId);
    }
    return list;
  } catch (err) {
    console.warn('Firestore enrollments read note:', err);
    return [];
  }
};

export const fetchAcademyCertificatesFromFirestore = async (courseId?: string): Promise<any[]> => {
  try {
    const ref = collection(db, 'academy_certificates');
    const snap = await getDocs(ref);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (courseId) {
      return list.filter((c: any) => c.courseId === courseId);
    }
    return list;
  } catch (err) {
    console.warn('Firestore certificates read note:', err);
    return [];
  }
};

export const saveAcademyCertificateInFirestore = async (cert: any): Promise<string> => {
  const ref = collection(db, 'academy_certificates');
  const now = new Date().toISOString();
  const data = cleanFirestoreObject({
    ...cert,
    issueDate: cert.issueDate || now,
  });
  if (cert.id) {
    await setDoc(doc(db, 'academy_certificates', cert.id), data, { merge: true });
    return cert.id;
  }
  const docRef = await addDoc(ref, data);
  return docRef.id;
};

export const applyForAcademyCourseInFirestore = async (
  application: Omit<CourseApplication, 'id' | 'submittedAt' | 'status'>
): Promise<string> => {
  const appsRef = collection(db, 'academy_applications');
  const now = new Date().toISOString();

  const docData = cleanFirestoreObject({
    ...application,
    status: 'received',
    submittedAt: now,
  });

  const docRef = await addDoc(appsRef, docData);
  return docRef.id;
};

export const fetchAllAcademyApplicationsAdmin = async (): Promise<CourseApplication[]> => {
  try {
    const appsRef = collection(db, 'academy_applications');
    const snap = await getDocs(appsRef);
    if (!snap.empty) {
      return snap.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
          } as CourseApplication)
      );
    }
  } catch (err) {
    console.warn('Firestore applications read notice:', err);
  }

  try {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('nb_admin_token_v1') : null;
    if (token) {
      const res = await fetch('/api/academy/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {
    // Fallback
  }

  return [];
};

export const updateAcademyApplicationStatusInFirestore = async (
  id: string,
  status: CourseApplication['status'],
  reviewerUser: { uid?: string; email: string; name: string },
  notes?: string
): Promise<void> => {
  const docRef = doc(db, 'academy_applications', id);
  const now = new Date().toISOString();

  await updateDoc(docRef, {
    status,
    reviewedAt: now,
    reviewedBy: reviewerUser.email,
    reviewerNotes: notes || '',
  });

  await logActivity({
    adminEmail: reviewerUser.email,
    adminName: reviewerUser.name,
    action: 'Review Course Application',
    category: 'cms',
    details: `Updated application ${id} status to ${status}`,
    timestamp: now,
  });
};

/**
 * ------------------------------------------------------------------
 * CLOUD FIRESTORE: AUDIT & ACTIVITY LOGS
 * ------------------------------------------------------------------
 */

export const logActivity = async (log: Omit<ActivityLog, 'id'>): Promise<void> => {
  try {
    const logsRef = collection(db, 'admin_activity_logs');
    await addDoc(logsRef, {
      ...log,
      timestamp: log.timestamp || new Date().toISOString(),
    });
  } catch (e) {
    console.warn('Failed to write activity log:', e);
  }
};

export const fetchActivityLogsAdmin = async (maxCount = 50): Promise<ActivityLog[]> => {
  try {
    const logsRef = collection(db, 'admin_activity_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(maxCount));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ActivityLog[];
    }
  } catch (err) {
    // If index doesn't exist yet, fallback to unordered query
    try {
      const logsRef = collection(db, 'admin_activity_logs');
      const snapshot = await getDocs(logsRef);
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ActivityLog[];
      return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, maxCount);
    } catch {
      // Fallback to server API below
    }
  }

  try {
    const token = typeof window !== 'undefined' ? sessionStorage.getItem('nb_admin_token_v1') : null;
    if (token) {
      const res = await fetch('/api/admin/activity-logs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        return await res.json();
      }
    }
  } catch {
    // Non-blocking fallback
  }

  return [];
};

/**
 * ------------------------------------------------------------------
 * SECURE USER MANAGEMENT (SERVER-SIDE FIREBASE BACKEND INTEGRATION)
 * ------------------------------------------------------------------
 */

export const getAdminAuthHeader = async (): Promise<string> => {
  if (auth.currentUser) {
    try {
      const idToken = await auth.currentUser.getIdToken();
      return `Bearer ${idToken}`;
    } catch {
      // Fallback
    }
  }
  const sessionToken = sessionStorage.getItem('nb_admin_token_v1');
  return sessionToken ? `Bearer ${sessionToken}` : '';
};

export const fetchUsersFromBackend = async (params?: {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{ users: ManagedUser[]; total: number; page: number; totalPages: number }> => {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.role && params.role !== 'All') query.set('role', params.role);
  if (params?.status && params.status !== 'All') query.set('status', params.status);
  if (params?.page) query.set('page', String(params.page));
  if (params?.limit) query.set('limit', String(params.limit));

  const authHeader = await getAdminAuthHeader();
  const res = await fetch(`/api/admin/users?${query.toString()}`, {
    headers: {
      Authorization: authHeader,
    },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to fetch user accounts');
  }
  return res.json();
};

export const createUserInBackend = async (data: {
  email: string;
  displayName: string;
  role: PlatformRole;
  creationMethod: 'invite' | 'password';
  initialPassword?: string;
}): Promise<{ success: boolean; message: string; user: ManagedUser }> => {
  const authHeader = await getAdminAuthHeader();
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify(data),
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Failed to create user account');
  }
  return resData;
};

export const updateUserRoleInBackend = async (
  uid: string,
  role: PlatformRole
): Promise<{ success: boolean; message: string; user: ManagedUser }> => {
  const authHeader = await getAdminAuthHeader();
  const res = await fetch(`/api/admin/users/${encodeURIComponent(uid)}/role`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({ role }),
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Failed to update user role');
  }
  return resData;
};

export const updateUserStatusInBackend = async (
  uid: string,
  accountStatus: UserAccountStatus
): Promise<{ success: boolean; message: string; user: ManagedUser }> => {
  const authHeader = await getAdminAuthHeader();
  const res = await fetch(`/api/admin/users/${encodeURIComponent(uid)}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({ accountStatus }),
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Failed to update user status');
  }
  return resData;
};

export const sendUserPasswordResetInBackend = async (
  uid: string
): Promise<{ success: boolean; message: string }> => {
  const authHeader = await getAdminAuthHeader();
  const res = await fetch(`/api/admin/users/${encodeURIComponent(uid)}/reset-password`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
    },
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Failed to dispatch password reset instructions');
  }
  return resData;
};

export const deleteUserInBackend = async (
  uid: string,
  confirmation: string
): Promise<{ success: boolean; message: string }> => {
  const authHeader = await getAdminAuthHeader();
  const res = await fetch(`/api/admin/users/${encodeURIComponent(uid)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    body: JSON.stringify({ confirmation }),
  });
  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.error || 'Failed to delete user account');
  }
  return resData;
};

/**
 * ------------------------------------------------------------------
 * REAL-TIME CMS: SUPPORT SERVICES
 * ------------------------------------------------------------------
 */

export const subscribeToServices = (
  callback: (services: ServiceItem[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const colRef = collection(db, 'services');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ServiceItem[];
        // Sort by displayOrder ascending, then title
        items.sort((a, b) => {
          const orderA = a.displayOrder ?? 999;
          const orderB = b.displayOrder ?? 999;
          return orderA - orderB;
        });
        callback(items);
      },
      (error) => {
        console.warn('Real-time services listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to services collection:', err);
    return () => {};
  }
};

export const fetchPublishedServices = async (): Promise<ServiceItem[]> => {
  try {
    const colRef = collection(db, 'services');
    const q = query(colRef, where('status', '==', 'published'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ServiceItem[];
      return items.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    }
  } catch (err) {
    console.warn('Firestore published services read notice:', err);
  }
  return [];
};

export const fetchAllServicesAdmin = async (): Promise<ServiceItem[]> => {
  try {
    const colRef = collection(db, 'services');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ServiceItem[];
      return items.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    }
  } catch (err) {
    console.warn('Firestore all services read notice:', err);
  }
  return [];
};

export const createServiceInFirestore = async (
  service: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>,
  adminUser: { uid?: string; email: string; name: string }
): Promise<string> => {
  const colRef = collection(db, 'services');
  const now = new Date().toISOString();
  const slug =
    service.slug ||
    service.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const docData: any = {
    ...service,
    slug: slug || `service-${Date.now()}`,
    status: service.status || 'published',
    displayOrder: service.displayOrder ?? 1,
    createdAt: now,
    updatedAt: now,
    createdBy: adminUser.email,
    updatedBy: adminUser.email,
    updatedByUid: adminUser.uid || auth.currentUser?.uid || '',
  };

  try {
    const docRef = await addDoc(colRef, docData);

    await logActivity({
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'Create Support Service',
      category: 'cms',
      details: `Created service "${service.title}" [status: ${docData.status}]`,
      timestamp: now,
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'services');
  }
};

export const updateServiceInFirestore = async (
  id: string,
  updates: Partial<ServiceItem>,
  adminUser: { uid?: string; email: string; name: string },
  options?: {
    expectedVersion?: number;
    expectedUpdatedAt?: string;
    force?: boolean;
  }
): Promise<{ version: number; data?: ServiceItem }> => {
  const docRef = doc(db, 'services', id);
  const now = new Date().toISOString();

  try {
    const currentSnap = await getDoc(docRef);
    let nextVersion = 1;
    if (currentSnap.exists()) {
      const currentData = currentSnap.data();
      const serverVersion = (currentData.version as number) || 1;
      nextVersion = serverVersion + 1;

      // Check conflict if not forced
      if (
        !options?.force &&
        ((options?.expectedVersion !== undefined && serverVersion > options.expectedVersion) ||
          (options?.expectedUpdatedAt &&
            currentData.updatedAt &&
            currentData.updatedAt > options.expectedUpdatedAt &&
            currentData.updatedBy !== adminUser.email))
      ) {
        const conflictErr: any = new Error(
          'This content was changed by another administrator. Review before saving.'
        );
        conflictErr.code = 'CONFLICT_DETECTED';
        conflictErr.serverData = currentData;
        conflictErr.serverVersion = serverVersion;
        throw conflictErr;
      }
    }

    // Use setDoc with merge: true to cleanly handle both existing and freshly seeded services
    await setDoc(
      docRef,
      {
        ...updates,
        id,
        version: nextVersion,
        updatedAt: now,
        updatedBy: adminUser.email,
        updatedByUid: adminUser.uid || auth.currentUser?.uid || '',
      },
      { merge: true }
    );

    // Read back to confirm save
    const savedSnapshot = await getDoc(docRef);
    if (!savedSnapshot.exists()) {
      throw new Error('The service was not saved to Firestore.');
    }
    const savedContent = savedSnapshot.data() as ServiceItem;

    await logActivity({
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'Update Support Service',
      category: 'cms',
      details: `Updated service ID "${id}" (v${nextVersion})`,
      timestamp: now,
    });

    return { version: nextVersion, data: savedContent };
  } catch (error: any) {
    if (error?.code === 'CONFLICT_DETECTED') {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, `services/${id}`);
    throw error;
  }
};

export const softDeleteServiceInFirestore = async (
  id: string,
  title: string,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'services', id);
  const now = new Date().toISOString();

  try {
    await setDoc(
      docRef,
      {
        status: 'archived',
        updatedAt: now,
        updatedBy: adminUser.email,
        updatedByUid: adminUser.uid || auth.currentUser?.uid || '',
      },
      { merge: true }
    );

    const savedSnapshot = await getDoc(docRef);
    if (!savedSnapshot.exists() || savedSnapshot.data()?.status !== 'archived') {
      throw new Error('Failed to verify archive status in Firestore.');
    }

    await logActivity({
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'Archive Support Service',
      category: 'cms',
      details: `Moved service "${title}" (${id}) to archives`,
      timestamp: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `services/${id}`);
  }
};

export const restoreServiceInFirestore = async (
  id: string,
  title: string,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'services', id);
  const now = new Date().toISOString();

  try {
    await setDoc(
      docRef,
      {
        status: 'published',
        updatedAt: now,
        updatedBy: adminUser.email,
        updatedByUid: adminUser.uid || auth.currentUser?.uid || '',
      },
      { merge: true }
    );

    const savedSnapshot = await getDoc(docRef);
    if (!savedSnapshot.exists() || savedSnapshot.data()?.status !== 'published') {
      throw new Error('Failed to verify restore status in Firestore.');
    }

    await logActivity({
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'Restore Support Service',
      category: 'cms',
      details: `Restored service "${title}" (${id}) to published status`,
      timestamp: now,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `services/${id}`);
  }
};

export const permanentDeleteServiceInFirestore = async (
  id: string,
  title: string,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'services', id);
  try {
    await deleteDoc(docRef);

    await logActivity({
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'Permanently Delete Service',
      category: 'cms',
      details: `Permanently deleted service "${title}" (${id})`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
  }
};

/**
 * ------------------------------------------------------------------
 * REAL-TIME CMS: FOUNDING TEAM & LEADERSHIP
 * ------------------------------------------------------------------
 */

export const subscribeToTeamMembers = (
  callback: (members: TeamMember[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const colRef = collection(db, 'team_members');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as TeamMember[];
        items.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
        callback(items);
      },
      (error) => {
        console.warn('Real-time team members listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to team members collection:', err);
    return () => {};
  }
};

export const fetchPublishedTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const colRef = collection(db, 'team_members');
    const q = query(colRef, where('status', '==', 'published'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TeamMember[];
      return items.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    }
  } catch (err) {
    console.warn('Firestore published team members read notice:', err);
  }
  return [];
};

export const fetchAllTeamMembersAdmin = async (): Promise<TeamMember[]> => {
  try {
    const colRef = collection(db, 'team_members');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TeamMember[];
      return items.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    }
  } catch (err) {
    console.warn('Firestore all team members read notice:', err);
  }
  return [];
};

export const createTeamMemberInFirestore = async (
  member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>,
  adminUser: { uid?: string; email: string; name: string }
): Promise<string> => {
  const colRef = collection(db, 'team_members');
  const now = new Date().toISOString();

  const docData: any = {
    ...member,
    status: member.status || 'published',
    displayOrder: member.displayOrder ?? 1,
    createdAt: now,
    updatedAt: now,
    updatedBy: adminUser.email,
  };

  const docRef = await addDoc(colRef, docData);

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Add Team Member',
    category: 'cms',
    details: `Added team member "${member.name}" (${member.role})`,
    timestamp: now,
  });

  return docRef.id;
};

export const updateTeamMemberInFirestore = async (
  id: string,
  updates: Partial<TeamMember>,
  adminUser: { uid?: string; email: string; name: string }
): Promise<{ data: TeamMember }> => {
  const docRef = doc(db, 'team_members', id);
  const now = new Date().toISOString();

  await setDoc(
    docRef,
    {
      ...updates,
      id,
      updatedAt: now,
      updatedBy: adminUser.email,
    },
    { merge: true }
  );

  const savedSnapshot = await getDoc(docRef);
  if (!savedSnapshot.exists()) {
    throw new Error('The team member was not saved to Firestore.');
  }
  const savedContent = savedSnapshot.data() as TeamMember;

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Update Team Member',
    category: 'cms',
    details: `Updated team profile for "${updates.name || id}"`,
    timestamp: now,
  });

  return { data: savedContent };
};

export const softDeleteTeamMemberInFirestore = async (
  id: string,
  name: string,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'team_members', id);
  const now = new Date().toISOString();

  await setDoc(
    docRef,
    {
      status: 'archived',
      updatedAt: now,
      updatedBy: adminUser.email,
    },
    { merge: true }
  );

  const savedSnapshot = await getDoc(docRef);
  if (!savedSnapshot.exists() || savedSnapshot.data()?.status !== 'archived') {
    throw new Error('Failed to verify archive status in Firestore.');
  }

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Archive Team Member',
    category: 'cms',
    details: `Archived team member "${name}" (${id})`,
    timestamp: now,
  });
};

export const restoreTeamMemberInFirestore = async (
  id: string,
  name: string,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'team_members', id);
  const now = new Date().toISOString();

  await setDoc(
    docRef,
    {
      status: 'published',
      updatedAt: now,
      updatedBy: adminUser.email,
    },
    { merge: true }
  );

  const savedSnapshot = await getDoc(docRef);
  if (!savedSnapshot.exists() || savedSnapshot.data()?.status !== 'published') {
    throw new Error('Failed to verify restore status in Firestore.');
  }

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Restore Team Member',
    category: 'cms',
    details: `Restored team member "${name}" (${id})`,
    timestamp: now,
  });
};

export const permanentDeleteTeamMemberInFirestore = async (
  id: string,
  name: string,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'team_members', id);
  await deleteDoc(docRef);

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Permanently Delete Team Member',
    category: 'cms',
    details: `Permanently removed team member "${name}" (${id})`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * ------------------------------------------------------------------
 * REAL-TIME CMS: CONTACT INFORMATION
 * ------------------------------------------------------------------
 */

export const DEFAULT_CONTACT_INFO: ContactInfoConfig = {
  id: 'primary',
  primaryEmail: 'hello@naijabridge.org',
  supportEmail: 'support@naijabridge.org',
  partnershipsEmail: 'partners@naijabridge.org',
  whatsAppNumber: '+234 800 000 0000',
  whatsAppLink: 'https://wa.me/2348000000000',
  telephoneNumber: '+234 1 234 5678',
  officeAddress: 'Co-Creation Innovation Hub, 294 Herbert Macaulay Way, Yaba, Lagos, Nigeria',
  workingHours: 'Monday – Friday: 9:00 AM – 5:00 PM WAT',
  responseCommitment: '24 to 48 business hours',
  emergencyContact: '+234 800 000 0001 (Priority Verification Desk)',
  recipientEmail: 'hello@naijabridge.org',
  googleMapsUrl: 'https://maps.google.com/?q=Yaba+Lagos+Nigeria',
  socialLinks: {
    linkedin: 'https://linkedin.com/company/naijabridge',
    twitter: 'https://twitter.com/naijabridge_org',
    instagram: 'https://instagram.com/naijabridge_org',
    youtube: 'https://youtube.com/@naijabridge',
    facebook: 'https://facebook.com/naijabridge',
    github: 'https://github.com/naijabridge',
  },
  showOnHeader: true,
  showOnFooter: true,
  showOnHomepage: true,
  updatedAt: new Date().toISOString(),
};

export const subscribeToContactInfo = (
  callback: (contact: ContactInfoConfig) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const docRef = doc(db, 'site_settings', 'contact_info');
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback({
            ...DEFAULT_CONTACT_INFO,
            ...(snapshot.data() as ContactInfoConfig),
          });
        } else {
          callback(DEFAULT_CONTACT_INFO);
        }
      },
      (error) => {
        console.warn('Real-time contact info listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to contact info:', err);
    return () => {};
  }
};

export const fetchContactInfo = async (): Promise<ContactInfoConfig> => {
  try {
    const docRef = doc(db, 'site_settings', 'contact_info');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return {
        ...DEFAULT_CONTACT_INFO,
        ...(snap.data() as ContactInfoConfig),
      };
    }
  } catch (err) {
    console.warn('Unable to load contact info from Firestore:', err);
  }
  return DEFAULT_CONTACT_INFO;
};

export const updateContactInfoInFirestore = async (
  contact: Partial<ContactInfoConfig>,
  adminUser: { uid?: string; email: string; name: string },
  options?: {
    expectedUpdatedAt?: string;
    force?: boolean;
  }
): Promise<void> => {
  const docRef = doc(db, 'site_settings', 'contact_info');
  const now = new Date().toISOString();

  try {
    const currentSnap = await getDoc(docRef);
    if (currentSnap.exists()) {
      const currentData = currentSnap.data();
      if (
        !options?.force &&
        options?.expectedUpdatedAt &&
        currentData.updatedAt &&
        currentData.updatedAt > options.expectedUpdatedAt &&
        currentData.updatedBy !== adminUser.email
      ) {
        const conflictErr: any = new Error(
          'This content was changed by another administrator. Review before saving.'
        );
        conflictErr.code = 'CONFLICT_DETECTED';
        conflictErr.serverData = currentData;
        throw conflictErr;
      }
    }

    await setDoc(
      docRef,
      {
        ...contact,
        updatedAt: now,
        updatedBy: adminUser.email,
      },
      { merge: true }
    );

    const savedSnapshot = await getDoc(docRef);
    if (!savedSnapshot.exists()) {
      throw new Error('The contact information was not saved to Firestore.');
    }

    await logActivity({
      adminEmail: adminUser.email,
      adminName: adminUser.name,
      action: 'Update Contact Information',
      category: 'settings',
      details: 'Updated official contact channels, office address, and social links',
      timestamp: now,
    });
  } catch (error: any) {
    if (error?.code === 'CONFLICT_DETECTED') {
      throw error;
    }
    handleFirestoreError(error, OperationType.UPDATE, 'site_settings/contact_info');
    throw error;
  }
};

/**
 * ------------------------------------------------------------------
 * REAL-TIME CMS: PRODUCTS & RESOURCES
 * ------------------------------------------------------------------
 */

export const subscribeToProductsResources = (
  callback: (resources: ProductResource[]) => void,
  onError?: (error: Error) => void
): (() => void) => {
  try {
    const colRef = collection(db, 'products_resources');
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as ProductResource[];
        items.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
        callback(items);
      },
      (error) => {
        console.warn('Real-time products/resources listener notice:', error);
        if (onError) onError(error);
      }
    );
  } catch (err) {
    console.warn('Failed to subscribe to products/resources:', err);
    return () => {};
  }
};

export const fetchPublishedProductsResources = async (): Promise<ProductResource[]> => {
  try {
    const colRef = collection(db, 'products_resources');
    const q = query(colRef, where('status', '==', 'published'));
    const snap = await getDocs(q);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ProductResource[];
      return items.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    }
  } catch (err) {
    console.warn('Firestore published products read notice:', err);
  }
  return [];
};

export const fetchAllProductsResourcesAdmin = async (): Promise<ProductResource[]> => {
  try {
    const colRef = collection(db, 'products_resources');
    const snap = await getDocs(colRef);
    if (!snap.empty) {
      const items = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ProductResource[];
      return items.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    }
  } catch (err) {
    console.warn('Firestore all products read notice:', err);
  }
  return [];
};

export const createProductResourceInFirestore = async (
  item: Omit<ProductResource, 'id' | 'createdAt' | 'updatedAt'>,
  adminUser: { uid?: string; email: string; name: string }
): Promise<string> => {
  const colRef = collection(db, 'products_resources');
  const now = new Date().toISOString();
  const slug =
    item.slug ||
    item.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

  const docData: any = {
    ...item,
    slug: slug || `resource-${Date.now()}`,
    status: item.status || 'published',
    displayOrder: item.displayOrder ?? 1,
    createdAt: now,
    updatedAt: now,
    updatedBy: adminUser.email,
  };

  const docRef = await addDoc(colRef, docData);

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Create Resource',
    category: 'cms',
    details: `Created digital resource "${item.title}" [${item.category}]`,
    timestamp: now,
  });

  return docRef.id;
};

export const updateProductResourceInFirestore = async (
  id: string,
  updates: Partial<ProductResource>,
  adminUser: { uid?: string; email: string; name: string }
): Promise<{ data: ProductResource }> => {
  const docRef = doc(db, 'products_resources', id);
  const now = new Date().toISOString();

  await setDoc(
    docRef,
    {
      ...updates,
      id,
      updatedAt: now,
      updatedBy: adminUser.email,
    },
    { merge: true }
  );

  const savedSnapshot = await getDoc(docRef);
  if (!savedSnapshot.exists()) {
    throw new Error('The resource was not saved to Firestore.');
  }
  const savedContent = savedSnapshot.data() as ProductResource;

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Update Resource',
    category: 'cms',
    details: `Updated resource ID "${id}"`,
    timestamp: now,
  });

  return { data: savedContent };
};

export const softDeleteProductResourceInFirestore = async (
  id: string,
  title: string,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'products_resources', id);
  const now = new Date().toISOString();

  await setDoc(
    docRef,
    {
      status: 'archived',
      updatedAt: now,
      updatedBy: adminUser.email,
    },
    { merge: true }
  );

  const savedSnapshot = await getDoc(docRef);
  if (!savedSnapshot.exists() || savedSnapshot.data()?.status !== 'archived') {
    throw new Error('Failed to verify archive status in Firestore.');
  }

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Archive Resource',
    category: 'cms',
    details: `Archived resource "${title}" (${id})`,
    timestamp: now,
  });
};

export const restoreProductResourceInFirestore = async (
  id: string,
  title: string,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'products_resources', id);
  const now = new Date().toISOString();

  await setDoc(
    docRef,
    {
      status: 'published',
      updatedAt: now,
      updatedBy: adminUser.email,
    },
    { merge: true }
  );

  const savedSnapshot = await getDoc(docRef);
  if (!savedSnapshot.exists() || savedSnapshot.data()?.status !== 'published') {
    throw new Error('Failed to verify restore status in Firestore.');
  }

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Restore Resource',
    category: 'cms',
    details: `Restored resource "${title}" (${id})`,
    timestamp: now,
  });
};

export const permanentDeleteProductResourceInFirestore = async (
  id: string,
  title: string,
  adminUser: { uid?: string; email: string; name: string }
): Promise<void> => {
  const docRef = doc(db, 'products_resources', id);
  await deleteDoc(docRef);

  await logActivity({
    adminEmail: adminUser.email,
    adminName: adminUser.name,
    action: 'Permanently Delete Resource',
    category: 'cms',
    details: `Permanently deleted resource "${title}" (${id})`,
    timestamp: new Date().toISOString(),
  });
};

/**
 * ------------------------------------------------------------------
 * DRAFT SAVING SYSTEM (FIRESTORE BACKED)
 * Debounced automatic draft saving for all admin edit forms
 * ------------------------------------------------------------------
 */

export interface AdminDraft<T = any> {
  draftKey: string;
  formData: T;
  updatedAt: string;
  updatedAtClient: string;
  updatedBy: string;
  updatedByUid: string;
}

export const saveDraftToFirestore = async <T = any>(
  draftKey: string,
  formData: T,
  adminUser: { uid?: string; email: string; name: string }
): Promise<{ updatedAt: string }> => {
  const docRef = doc(db, 'admin_drafts', draftKey);
  const now = new Date().toISOString();
  await setDoc(
    docRef,
    {
      draftKey,
      formData,
      updatedAt: now,
      updatedAtClient: now,
      updatedBy: adminUser.email,
      updatedByUid: adminUser.uid || auth.currentUser?.uid || '',
    },
    { merge: true }
  );
  return { updatedAt: now };
};

export const getDraftFromFirestore = async <T = any>(
  draftKey: string
): Promise<AdminDraft<T> | null> => {
  try {
    const docRef = doc(db, 'admin_drafts', draftKey);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AdminDraft<T>;
    }
  } catch (err) {
    console.warn(`Notice reading draft ${draftKey}:`, err);
  }
  return null;
};

export const deleteDraftFromFirestore = async (draftKey: string): Promise<void> => {
  try {
    const docRef = doc(db, 'admin_drafts', draftKey);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn(`Notice deleting draft ${draftKey}:`, err);
  }
};

