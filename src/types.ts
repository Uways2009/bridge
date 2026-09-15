export type PageId =
  | 'home'
  | 'opportunities'
  | 'academy'
  | 'skills'
  | 'services'
  | 'community'
  | 'partners'
  | 'about'
  | 'contact'
  | 'admin';

export type OpportunityCategory =
  | 'Jobs'
  | 'Internships'
  | 'Scholarships'
  | 'Grants'
  | 'Fellowships'
  | 'Training'
  | 'Freelance projects'
  | 'Volunteer opportunities';

export type OpportunityStatus =
  | 'New'
  | 'Pending'
  | 'In Review'
  | 'Verified'
  | 'Published'
  | 'Archived'
  | 'Closed'
  | 'Draft';

export interface Opportunity {
  id: string;
  title: string;
  organization: string;
  category: OpportunityCategory;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Fellowship' | 'Grant' | 'Program';
  location: string;
  isRemote: boolean;
  remoteType: 'Fully Remote' | 'Hybrid (Nigeria)' | 'On-site';
  educationLevel: 'All Levels' | 'Undergraduate' | 'Graduate' | 'Mid-Level' | 'Open to Everyone';
  stipendOrSalary?: string;
  deadline: string; // ISO date string or human readable
  daysRemaining: number;
  featured: boolean;
  verified: boolean;
  status?: OpportunityStatus;
  description: string;
  requirements: string[];
  benefits: string[];
  applicationUrl: string;
  officialSourceLink?: string;
  officialLink?: string;
  verificationStatus?: string;
  verifiedBy?: string;
  slug?: string;
  tags?: string[];
  postedDate: string;
  submittedBy?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export type ContactInquiry = InboxItem;

export interface ServiceItem {
  id: string;
  title: string;
  slug?: string;
  tagline: string;
  description: string;
  fullDescription?: string;
  category?: string;
  targetAudience?: string;
  expectedOutcome?: string;
  deliveryTime: string;
  priceLabel?: string;
  priceNaira: number; // 0 if free
  isFree: boolean;
  popular?: boolean;
  badge?: string;
  featuredImageUrl?: string;
  galleryImageUrls?: string[];
  features?: string[];
  ctaText?: string;
  eligibility?: string;
  requirements?: string[];
  howToApply?: string;
  whatsAppLink?: string;
  emailLink?: string;
  externalApplyLink?: string;
  faqs?: { question: string; answer: string }[];
  seoTitle?: string;
  seoDescription?: string;
  status?: 'draft' | 'published' | 'archived';
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  updatedByUid?: string;
}

export type SupportService = ServiceItem;

export interface WorkshopEvent {
  id: string;
  title: string;
  speaker?: string;
  facilitator?: string;
  facilitatorRole?: string;
  facilitatorCompany?: string;
  date: string;
  timeWAT: string; // West Africa Time (Lagos)
  time?: string;
  category?: string;
  speakerRole?: string;
  registrationLimit?: number;
  registeredCount?: number;
  meetingLink?: string;
  platform: 'Google Meet' | 'Zoom' | 'YouTube Live' | 'WhatsApp Audio';
  capacity?: string;
  maxCapacity?: number;
  registeredAttendeesCount?: number;
  status?: 'Upcoming' | 'Live' | 'Completed' | 'Cancelled';
  fee: 'Free' | string;
  description: string;
  takeaways?: string[];
}

export interface SkillTrack {
  id: string;
  title: string;
  level: 'Beginner' | 'Beginner to Intermediate' | 'Intermediate';
  duration: string;
  overview: string;
  skillsGained: string[];
  recommendedTools: string[];
  careerRoles: string[];
  resourceCount: number;
}

export interface SkillPathway {
  id: string;
  title: string;
  description: string;
  targetAudience: string;
  toolsTaught: string[];
  learningMode: string;
  progression: string;
}

export interface LearningResource {
  id: string;
  title: string;
  trackId: string;
  type: 'Video' | 'Article' | 'Interactive' | 'Guide';
  duration: string;
  provider: string;
  isFree: boolean;
  url: string;
  description: string;
}

export type TeamMemberCategory = 'founder' | 'co-founder' | 'director' | 'advisor' | 'team_member' | 'volunteer';

export interface TeamMember {
  id: string;
  name: string;
  role: string; // Public Title
  category?: TeamMemberCategory;
  photoUrl?: string;
  placeholderName?: string;
  bio: string; // Short bio
  fullBio?: string;
  responsibilities?: string;
  skills?: string[];
  location: string;
  focusArea?: string;
  editableNote?: string;
  socialLinkedIn?: string;
  socialTwitter?: string;
  socialInstagram?: string;
  personalWebsite?: string;
  linkedin?: string;
  twitter?: string;
  portfolio?: string;
  displayOrder?: number;
  status?: 'draft' | 'published' | 'archived';
  consentApproved?: boolean;
  showOnHomepage?: boolean;
  showOnAbout?: boolean;
  showOnTeam?: boolean;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ContactInfoConfig {
  id: string;
  primaryEmail: string;
  supportEmail: string;
  partnershipsEmail: string;
  whatsAppNumber: string;
  whatsAppLink: string;
  telephoneNumber: string;
  officeAddress: string;
  workingHours: string;
  responseCommitment: string;
  emergencyContact?: string;
  recipientEmail: string;
  googleMapsUrl?: string;
  officialEmail?: string;
  verificationEmail?: string;
  pressEmail?: string;
  phone?: string;
  phoneSecondary?: string;
  whatsappNumber?: string;
  whatsappGroupLink?: string;
  telegramChannelLink?: string;
  physicalAddress?: string;
  operatingHours?: string;
  responseTimeNotice?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  facebookUrl?: string;
  instagramHandle?: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    facebook?: string;
    github?: string;
  };
  showOnHeader: boolean;
  showOnFooter: boolean;
  showOnHomepage: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ProductResource {
  id: string;
  title: string;
  slug?: string;
  category: 'Guide & Kit' | 'Template' | 'Digital Asset' | 'Report' | 'Tool' | 'Career Guide' | 'Resume Template' | 'Funding & Grant' | 'Tech Toolkit' | 'SME Resource' | 'Other';
  description: string;
  downloadUrl?: string;
  fileUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string;
  coverImageUrl?: string;
  fileType?: string;
  format?: 'PDF' | 'DOCX' | 'ZIP' | 'Link' | 'Spreadsheet';
  fileSize?: string;
  priceNaira: number;
  isFree: boolean;
  downloadCount?: number;
  downloadsCount?: number;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  location: string;
  quote: string;
  impactMetric: string;
  avatarSeed: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: 'General' | 'Opportunities' | 'Services' | 'Community' | 'Partners';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  source?: 'gemini' | 'fallback';
}

export interface PartnerPlaceholder {
  id: string;
  name: string;
  type: string;
}

// ----------------------------------------------------
// ADMINISTRATIVE & SECURITY DASHBOARD TYPES
// ----------------------------------------------------

export type AdminRole =
  | 'Super Admin'
  | 'super_admin'
  | 'Content Manager'
  | 'content_manager'
  | 'Verification Officer'
  | 'verification_officer'
  | 'Community Manager'
  | 'community_manager'
  | 'Support Manager'
  | 'support_manager';

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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar: string;
  title: string;
  lastLogin: string;
  status: 'Active' | 'Inactive';
  permissions: AdminPermission[];
}

export type AdminPermission =
  | 'manage_all'
  | 'view_metrics'
  | 'manage_opportunities'
  | 'verify_opportunities'
  | 'manage_users'
  | 'manage_academy'
  | 'manage_workshops'
  | 'manage_inbox'
  | 'manage_cms'
  | 'manage_broadcasts'
  | 'view_audit_logs';

export type PlatformRole =
  | 'super_admin'
  | 'academy_manager'
  | 'instructor'
  | 'teaching_assistant'
  | 'student'
  | 'content_manager'
  | 'verification_officer'
  | 'community_manager'
  | 'support_manager'
  | 'member';

export type UserAccountStatus = 'active' | 'disabled' | 'pending_activation';

export interface ManagedUser {
  uid: string;
  displayName: string;
  email: string;
  role: PlatformRole;
  accountStatus: UserAccountStatus;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  createdBy?: string;
  updatedBy?: string;
  requiresPasswordChange?: boolean;
}

export type AccountStatus = 'Active' | 'Pending' | 'Suspended' | 'active' | 'disabled' | 'pending_activation';
export type UserRoleCategory = 'User' | 'Student' | 'Graduate' | 'Freelancer' | 'Ambassador' | 'Partner Employer' | PlatformRole;

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  state: string;
  role: UserRoleCategory;
  status: AccountStatus;
  registeredDate: string;
  lastActive: string;
  opportunitiesSaved: number;
  applicationsCount: number;
  bio: string;
  verifiedEmail: boolean;
}

export type InboxType =
  | 'contact'
  | 'support'
  | 'partnership'
  | 'volunteer'
  | 'mentorship';

export type InboxStatus =
  | 'New'
  | 'Pending'
  | 'In Review'
  | 'Completed'
  | 'Archived'
  | 'Closed';

export interface InboxItem {
  id: string;
  type: InboxType;
  fullName: string;
  email: string;
  phone: string;
  subjectOrCategory: string;
  message: string;
  status: InboxStatus;
  submittedAt: string;
  assignedTo?: string;
  notes?: string[];
  replySummary?: string;
  metaDetails?: Record<string, string>;
}

export interface EventAttendee {
  id: string;
  workshopId: string;
  fullName: string;
  email: string;
  phone: string;
  state: string;
  registeredAt: string;
  attended: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  source: 'Website Footer' | 'Opportunities Page' | 'Webinar Registration' | 'Partner Portal';
  dateSubscribed: string;
  status: 'Subscribed' | 'Unsubscribed';
}

export interface AnnouncementBroadcast {
  id: string;
  title: string;
  targetAudience: 'All Subscribers' | 'Students & Graduates' | 'SMEs & Freelancers' | 'Campus Ambassadors' | 'Registered Partners';
  content: string;
  sentAt: string;
  sentBy: string;
  recipientCount: number;
  status: 'Sent' | 'Draft' | 'Scheduled';
}

export interface AdminActivityLog {
  id: string;
  adminName: string;
  adminEmail: string;
  adminRole: AdminRole;
  action: string;
  category: 'Opportunity' | 'User' | 'Event' | 'Inbox' | 'Content' | 'Broadcast' | 'Security';
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SiteAnnouncementConfig {
  active: boolean;
  message: string;
  linkText: string;
  linkPage?: PageId;
  linkUrl?: string;
  type?: 'info' | 'highlight' | 'urgent';
}

// ----------------------------------------------------
// NAIJABRIDGE TECH ACADEMY TYPES
// ----------------------------------------------------

export type CourseSkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type CourseDeliveryFormat = 'Online Live' | 'Self-Paced' | 'Hybrid (Lagos/Remote)';
export type CourseTuitionStatus = 'tuition-free' | 'paid' | 'sponsored' | 'closed';
export type CoursePublishedStatus = 'draft' | 'published' | 'archived';

export interface CourseCompletionCriteria {
  minAttendancePercent: number;
  minAssignmentScorePercent: number;
  capstoneRequired: boolean;
  requiresReview: boolean;
}

export interface CourseModuleItem {
  id: string;
  title: string;
  overview: string;
  topics: string[];
}

export interface AcademyCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  instructorId?: string;
  instructorName: string;
  duration: string;
  skillLevel: CourseSkillLevel;
  deliveryFormat: CourseDeliveryFormat;
  tuitionStatus: CourseTuitionStatus;
  priceNaira?: number;
  publishedStatus: CoursePublishedStatus;
  startDate: string;
  applicationDeadline: string;
  modules: CourseModuleItem[];
  completionCriteria: CourseCompletionCriteria;
  enrolledCount?: number;
  createdAt: string;
  updatedAt: string;
}

export type CourseApplicationStatus =
  | 'received'
  | 'under_review'
  | 'accepted'
  | 'waitlisted'
  | 'rejected'
  | 'completed';

export interface CourseApplication {
  id: string;
  courseId: string;
  courseTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantState: string;
  education: string;
  motivation: string;
  status: CourseApplicationStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewerNotes?: string;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  studentId: string;
  studentEmail: string;
  studentName: string;
  status: 'enrolled' | 'in_progress' | 'completed' | 'dropped';
  progress: number;
  attendanceRate: number;
  assignmentsCompleted: number;
  certificateIssued: boolean;
  certificateId?: string;
  enrolledAt: string;
}

export interface CourseSchedule {
  id: string;
  courseId: string;
  title: string;
  sessionDate: string;
  sessionTime: string;
  meetingLink: string;
  instructorName: string;
  topic: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface CourseMaterial {
  id: string;
  courseId: string;
  title: string;
  moduleName: string;
  type: 'video' | 'slides' | 'document' | 'code' | 'guide';
  url: string;
  description: string;
  addedAt: string;
}

export interface AttendanceRecordItem {
  studentEmail: string;
  studentName: string;
  status: 'present' | 'absent' | 'excused';
}

export interface CourseAttendance {
  id: string;
  courseId: string;
  scheduleId?: string;
  sessionDate: string;
  sessionTitle: string;
  records: AttendanceRecordItem[];
  recordedBy: string;
  recordedAt: string;
}

export interface AssignmentSubmission {
  studentEmail: string;
  studentName: string;
  submissionUrl: string;
  submittedAt: string;
  score?: number;
  feedback?: string;
  status: 'submitted' | 'graded';
}

export interface CourseAssignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  submissions: AssignmentSubmission[];
}

export interface CourseAnnouncement {
  id: string;
  courseId: string;
  title: string;
  content: string;
  postedBy: string;
  postedAt: string;
  isPinned?: boolean;
}

export interface CourseCertificate {
  id: string;
  certificateId: string;
  courseId: string;
  courseTitle: string;
  studentEmail: string;
  studentName: string;
  issueDate: string;
  verificationCode: string;
  issuedBy: string;
  criteriaMet: {
    attendancePercent: number;
    assignmentScorePercent: number;
    capstoneApproved: boolean;
  };
}

// ----------------------------------------------------
// NIA CHATBOT ASSISTANT TYPES
// ----------------------------------------------------

export interface NiaGroundingResult {
  type: 'opportunity' | 'course' | 'workshop' | 'service' | 'faq';
  title: string;
  category?: string;
  description: string;
  link?: string;
  details?: string;
}

export interface NiaChatMessage {
  id: string;
  sender: 'user' | 'nia';
  text: string;
  timestamp: string;
  groundedResults?: NiaGroundingResult[];
  isSupportHandoff?: boolean;
}

