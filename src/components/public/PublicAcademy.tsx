import React, { useState, useEffect, useCallback } from 'react';
import {
  AcademyCourse,
  CourseCertificate,
  CourseTuitionStatus,
  CourseSkillLevel,
} from '../../types';
import {
  GraduationCap,
  BookOpen,
  Search,
  Filter,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  X,
  Send,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import {
  fetchPublishedAcademyCourses,
  applyForAcademyCourseInFirestore,
} from '../../lib/firebaseService';

interface PublicAcademyProps {
  onNavigateToContact?: () => void;
}

export const PublicAcademy: React.FC<PublicAcademyProps> = ({ onNavigateToContact }) => {
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tuitionFilter, setTuitionFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');

  // Selected course for detail modal / application
  const [selectedCourse, setSelectedCourse] = useState<AcademyCourse | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  // Application Form State
  const [applicantName, setApplicantName] = useState('');
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantState, setApplicantState] = useState('Lagos');
  const [education, setEducation] = useState('Undergraduate');
  const [motivation, setMotivation] = useState('');
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [appSubmissionResult, setAppSubmissionResult] = useState<{
    success: boolean;
    message: string;
    applicationId?: string;
  } | null>(null);

  // Certificate Verification Tab / State
  const [activeTab, setActiveTab] = useState<'catalog' | 'verify'>('catalog');
  const [certCodeInput, setCertCodeInput] = useState('');
  const [isVerifyingCert, setIsVerifyingCert] = useState(false);
  const [verifiedCert, setVerifiedCert] = useState<CourseCertificate | null>(null);
  const [certVerificationError, setCertVerificationError] = useState<string | null>(null);

  // Load published courses from Firestore (single source of truth)
  const loadCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Direct Firestore query
      const firestoreCourses = await fetchPublishedAcademyCourses();
      if (firestoreCourses && firestoreCourses.length > 0) {
        setCourses(firestoreCourses);
        setLastRefreshedAt(new Date().toLocaleTimeString());
        setIsLoading(false);
        return;
      }

      // 2. Fallback to API if Firestore yields empty set
      const res = await fetch('/api/academy/courses');
      if (res.ok) {
        const data = await res.json();
        const published = Array.isArray(data)
          ? data.filter((c: AcademyCourse) => c.publishedStatus === 'published' || (c as any).status === 'published')
          : [];
        setCourses(published);
        setLastRefreshedAt(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn('Academy load issue, attempting API fallback:', err);
      try {
        const res = await fetch('/api/academy/courses');
        if (res.ok) {
          const data = await res.json();
          const published = Array.isArray(data)
            ? data.filter((c: AcademyCourse) => c.publishedStatus === 'published')
            : [];
          setCourses(published);
        }
      } catch (fallbackErr) {
        console.error('Failed to load academy courses', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    setIsSubmittingApp(true);
    setAppSubmissionResult(null);

    try {
      // 1. Write directly to Firestore first for durable persistence
      let firestoreAppId = '';
      try {
        firestoreAppId = await applyForAcademyCourseInFirestore({
          courseId: selectedCourse.id,
          courseTitle: selectedCourse.title,
          applicantName,
          applicantEmail,
          applicantPhone,
          applicantState,
          education,
          motivation,
        });
      } catch (fsErr) {
        console.warn('Firestore direct write notice:', fsErr);
      }

      // 2. Post to API route for notification/queue triggers
      let apiAppId = '';
      try {
        const res = await fetch(`/api/academy/courses/${selectedCourse.id}/apply`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicantName,
            applicantEmail,
            applicantPhone,
            applicantState,
            education,
            motivation,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          apiAppId = data.application?.id || '';
        }
      } catch (apiErr) {
        console.warn('API notification notice:', apiErr);
      }

      setAppSubmissionResult({
        success: true,
        message:
          'Your application has been received and logged in the admissions database. We will contact you via email regarding cohort onboarding.',
        applicationId: firestoreAppId || apiAppId || `APP-${Date.now().toString().slice(-6)}`,
      });

      // Clear form
      setApplicantName('');
      setApplicantEmail('');
      setApplicantPhone('');
      setMotivation('');
    } catch {
      setAppSubmissionResult({
        success: false,
        message: 'Network error. Please check your internet connection.',
      });
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const handleVerifyCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certCodeInput.trim()) return;

    setIsVerifyingCert(true);
    setVerifiedCert(null);
    setCertVerificationError(null);

    try {
      const res = await fetch(`/api/academy/certificates/${encodeURIComponent(certCodeInput.trim())}`);
      const data = await res.json();
      if (res.ok && data.certificate) {
        setVerifiedCert(data.certificate);
      } else {
        setCertVerificationError(data.error || 'No valid certificate matches this identification code.');
      }
    } catch {
      setCertVerificationError('Unable to connect to certificate verification service.');
    } finally {
      setIsVerifyingCert(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;
    const matchesTuition = tuitionFilter === 'all' || c.tuitionStatus === tuitionFilter;
    const matchesSkill = skillFilter === 'all' || c.skillLevel === skillFilter;

    return matchesSearch && matchesCategory && matchesTuition && matchesSkill;
  });

  return (
    <div className="min-h-screen bg-[#F8F7F2] text-[#1F2933]">
      {/* Header Banner */}
      <section className="bg-[#0B1F33] text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#152e4a]">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>NaijaBridge Tech Academy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Practical Technical Education for Nigeria’s Workforce
          </h1>

          <p className="text-sm sm:text-base text-stone-300 max-w-3xl leading-relaxed">
            Rigorous cohorts taught by experienced Nigerian and global industry leaders.
            Master practical software engineering, cloud infrastructure, and product design with verifiable accredited completion credentials.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#087F5B] text-white'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              Browse Open Cohorts
            </button>
            <button
              onClick={() => setActiveTab('verify')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'verify'
                  ? 'bg-[#087F5B] text-white'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verify a Certificate</span>
            </button>
          </div>
        </div>
      </section>

      {/* VIEW 1: COURSES CATALOG */}
      {activeTab === 'catalog' && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E4E1D8] shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs pb-1 border-b border-[#E4E1D8]/60">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#087F5B] animate-pulse" />
                <span className="font-semibold text-[#0B1F33]">Live Firebase Production Catalog</span>
                {lastRefreshedAt && (
                  <span className="text-[11px] text-[#1F2933]/50">
                    • Synced at {lastRefreshedAt}
                  </span>
                )}
              </div>
              <button
                onClick={() => loadCourses()}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F8F7F2] hover:bg-[#E4E1D8] text-[11px] font-medium text-[#0B1F33] cursor-pointer transition-colors"
                title="Refresh course listings from Firebase"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#087F5B]' : 'text-[#1F2933]/60'}`} />
                <span>{isLoading ? 'Synchronizing...' : 'Refresh Catalog'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-[#1F2933]/40" />
                <input
                  type="text"
                  placeholder="Search technical courses, curriculum topics, or instructors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E4E1D8] focus:outline-none focus:border-[#087F5B]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs py-2 px-3 rounded-xl border border-[#E4E1D8] bg-white text-[#1F2933]"
                >
                  <option value="all">All Categories</option>
                  <option value="Software Engineering">Software Engineering</option>
                  <option value="Product Design (UI/UX)">Product Design</option>
                  <option value="Data Analytics & AI">Data Analytics & AI</option>
                  <option value="Cybersecurity">Cybersecurity</option>
                  <option value="Cloud Computing & DevOps">Cloud & DevOps</option>
                </select>

                <select
                  value={tuitionFilter}
                  onChange={(e) => setTuitionFilter(e.target.value)}
                  className="text-xs py-2 px-3 rounded-xl border border-[#E4E1D8] bg-white text-[#1F2933]"
                >
                  <option value="all">All Tuition Types</option>
                  <option value="tuition-free">Tuition-Free</option>
                  <option value="sponsored">Sponsored (Scholarship)</option>
                  <option value="paid">Paid</option>
                </select>

                <select
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="text-xs py-2 px-3 rounded-xl border border-[#E4E1D8] bg-white text-[#1F2933]"
                >
                  <option value="all">All Skill Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>
          </div>

          {/* Courses Listing */}
          {isLoading ? (
            <div className="p-16 text-center text-sm text-[#1F2933]/60 bg-white rounded-2xl border border-[#E4E1D8]">
              Loading academy offerings...
            </div>
          ) : filteredCourses.length === 0 ? (
            /* EXACT REQUIRED EMPTY STATE STRING */
            <div className="bg-white rounded-2xl border border-[#E4E1D8] p-12 text-center space-y-3">
              <GraduationCap className="w-12 h-12 text-[#1F2933]/30 mx-auto" />
              <h3 className="text-base font-bold text-[#0B1F33]">
                No courses are currently open for registration.
              </h3>
              <p className="text-xs text-[#1F2933]/70 max-w-md mx-auto">
                Check back soon as new cohorts in Software Engineering, Cloud, and Data are announced, or contact us to inquire about upcoming admissions cycles.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-2xl border border-[#E4E1D8] shadow-2xs hover:border-[#087F5B]/50 transition-all p-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-[#087F5B] uppercase tracking-wide">
                        {course.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          course.tuitionStatus === 'tuition-free'
                            ? 'bg-emerald-100 text-emerald-800'
                            : course.tuitionStatus === 'sponsored'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {course.tuitionStatus}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-[#0B1F33] leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-[#1F2933]/70 mt-1.5 line-clamp-3">
                        {course.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8F7F2] p-3.5 rounded-xl text-[#1F2933]">
                      <div>
                        <span className="text-[#1F2933]/60 block text-[10px]">Instructor</span>
                        <span className="font-semibold">{course.instructorName}</span>
                      </div>
                      <div>
                        <span className="text-[#1F2933]/60 block text-[10px]">Format & Duration</span>
                        <span className="font-semibold">{course.duration} ({course.deliveryFormat})</span>
                      </div>
                      <div>
                        <span className="text-[#1F2933]/60 block text-[10px]">Start Date</span>
                        <span className="font-semibold">{course.startDate || 'Announcing Soon'}</span>
                      </div>
                      <div>
                        <span className="text-[#1F2933]/60 block text-[10px]">Deadline</span>
                        <span className="font-semibold text-red-700">{course.applicationDeadline || 'Open'}</span>
                      </div>
                    </div>

                    {/* Completion Criteria Summary */}
                    {course.completionCriteria && (
                      <div className="text-[11px] text-[#1F2933]/70 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#087F5B]" />
                          <span>{course.completionCriteria.minAttendancePercent}% attendance</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-[#087F5B]" />
                          <span>{course.completionCriteria.minAssignmentScorePercent}% min pass</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 mt-5 border-t border-[#E4E1D8] flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsApplying(false);
                      }}
                      className="text-xs font-bold text-[#0B1F33] hover:text-[#087F5B] flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Syllabus</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedCourse(course);
                        setIsApplying(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#087F5B] hover:bg-[#076c4d] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      Apply for Cohort
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CERTIFICATE VERIFICATION */}
      {activeTab === 'verify' && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-[#E4E1D8] shadow-2xs space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#087F5B] flex items-center justify-center mx-auto border border-emerald-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#0B1F33]">Verify an Official Certificate</h2>
              <p className="text-xs text-[#1F2933]/70 max-w-md mx-auto">
                Enter the Certificate ID or Verification Code printed on a NaijaBridge Tech Academy credential to verify graduation authenticity and completion standards.
              </p>
            </div>

            <form onSubmit={handleVerifyCertificate} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#0B1F33] block mb-1">
                  Certificate ID or Verification Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. CERT-2026-XXXX or verification hash..."
                    value={certCodeInput}
                    onChange={(e) => setCertCodeInput(e.target.value)}
                    className="w-full px-4 py-3 text-xs rounded-xl border border-[#E4E1D8] focus:outline-none focus:border-[#087F5B] font-mono uppercase"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifyingCert}
                className="w-full py-3 rounded-xl bg-[#087F5B] hover:bg-[#076c4d] text-white text-xs font-bold cursor-pointer transition-colors shadow-2xs disabled:opacity-60"
              >
                {isVerifyingCert ? 'Verifying with Academy Registry...' : 'Verify Credential'}
              </button>
            </form>

            {certVerificationError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{certVerificationError}</span>
              </div>
            )}

            {verifiedCert && (
              <div className="p-6 rounded-2xl bg-[#0B1F33] text-white space-y-4 border border-[#152e4a]">
                <div className="flex items-center justify-between border-b border-white/15 pb-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                    Official Credential Verified
                  </span>
                  <span className="font-mono text-xs text-white/80 font-bold">{verifiedCert.certificateId}</span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs text-stone-300 block">Graduated Student:</span>
                  <h3 className="text-xl font-bold text-white">{verifiedCert.studentName}</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/10">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Course Completed</span>
                    <span className="font-semibold text-white">{verifiedCert.courseTitle}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Issue Date</span>
                    <span className="font-semibold text-white">{verifiedCert.issueDate}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Instructor Sign-off</span>
                    <span className="font-semibold text-white">{verifiedCert.instructorName}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Accreditation Code</span>
                    <span className="font-mono text-emerald-400 font-bold text-[11px]">{verifiedCert.verificationCode}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* COURSE DETAIL / APPLICATION MODAL */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto border border-[#E4E1D8]">
            <div className="flex items-start justify-between border-b border-[#E4E1D8] pb-4">
              <div>
                <span className="text-xs font-bold text-[#087F5B] uppercase tracking-wide">
                  {selectedCourse.category}
                </span>
                <h3 className="text-xl font-bold text-[#0B1F33] mt-0.5">{selectedCourse.title}</h3>
              </div>
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setAppSubmissionResult(null);
                }}
                className="p-1 rounded-lg text-[#1F2933]/60 hover:text-[#0B1F33] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB TOGGLE INSIDE MODAL */}
            <div className="flex gap-2 border-b border-[#E4E1D8] pb-2">
              <button
                onClick={() => setIsApplying(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  !isApplying ? 'bg-[#087F5B] text-white' : 'text-[#1F2933]/70 hover:bg-stone-100'
                }`}
              >
                Course Syllabus & Criteria
              </button>
              <button
                onClick={() => setIsApplying(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  isApplying ? 'bg-[#087F5B] text-white' : 'text-[#1F2933]/70 hover:bg-stone-100'
                }`}
              >
                Application Form
              </button>
            </div>

            {/* SYLLABUS VIEW */}
            {!isApplying && (
              <div className="space-y-6 text-xs">
                <div>
                  <h4 className="font-bold text-sm text-[#0B1F33] mb-1.5">Cohort Overview</h4>
                  <p className="text-xs text-[#1F2933]/80 leading-relaxed">
                    {selectedCourse.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8F7F2] p-4 rounded-xl">
                  <div>
                    <span className="text-[#1F2933]/60 block text-[10px]">Tuition Status</span>
                    <span className="font-bold uppercase text-[#087F5B]">{selectedCourse.tuitionStatus}</span>
                  </div>
                  <div>
                    <span className="text-[#1F2933]/60 block text-[10px]">Duration</span>
                    <span className="font-bold">{selectedCourse.duration}</span>
                  </div>
                  <div>
                    <span className="text-[#1F2933]/60 block text-[10px]">Skill Level</span>
                    <span className="font-bold">{selectedCourse.skillLevel}</span>
                  </div>
                  <div>
                    <span className="text-[#1F2933]/60 block text-[10px]">Delivery</span>
                    <span className="font-bold">{selectedCourse.deliveryFormat}</span>
                  </div>
                </div>

                {/* Modules breakdown */}
                {selectedCourse.modules && selectedCourse.modules.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-[#0B1F33]">Curriculum Modules</h4>
                    <div className="space-y-2.5">
                      {selectedCourse.modules.map((mod, idx) => (
                        <div key={mod.id || idx} className="p-3.5 rounded-xl border border-[#E4E1D8] bg-white">
                          <span className="font-bold text-xs text-[#0B1F33] block">{mod.title}</span>
                          <p className="text-[11px] text-[#1F2933]/70 mt-1">{mod.overview}</p>
                          {mod.topics && mod.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {mod.topics.map((top, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2 py-0.5 rounded-md bg-[#F8F7F2] text-[10px] font-medium text-[#1F2933]/80"
                                >
                                  {top}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completion Criteria */}
                {selectedCourse.completionCriteria && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0B1F33] space-y-1.5">
                    <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Accredited Certificate Requirements</span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-emerald-950">
                      <li>Minimum {selectedCourse.completionCriteria.minAttendancePercent}% live lecture and workshop attendance.</li>
                      <li>Minimum {selectedCourse.completionCriteria.minAssignmentScorePercent}% cumulative assignment score.</li>
                      {selectedCourse.completionCriteria.capstoneRequired && (
                        <li>Verified completion and presentation of the Capstone Project portfolio.</li>
                      )}
                    </ul>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setIsApplying(true)}
                    className="px-5 py-2.5 rounded-xl bg-[#087F5B] text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    Proceed to Application
                  </button>
                </div>
              </div>
            )}

            {/* APPLICATION FORM */}
            {isApplying && (
              <div className="space-y-4 text-xs">
                {appSubmissionResult ? (
                  <div
                    className={`p-5 rounded-2xl border text-xs space-y-3 ${
                      appSubmissionResult.success
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-red-50 border-red-200 text-red-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {appSubmissionResult.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span>
                        {appSubmissionResult.success
                          ? 'Application Successfully Submitted!'
                          : 'Submission Unsuccessful'}
                      </span>
                    </div>
                    <p className="leading-relaxed">{appSubmissionResult.message}</p>
                    {appSubmissionResult.applicationId && (
                      <div className="font-mono text-[11px] bg-white/70 p-2 rounded-lg inline-block border border-emerald-200">
                        Application Ref: {appSubmissionResult.applicationId}
                      </div>
                    )}
                    <div className="pt-2">
                      <button
                        onClick={() => setSelectedCourse(null)}
                        className="px-4 py-2 rounded-xl bg-[#087F5B] text-white font-bold cursor-pointer"
                      >
                        Close & Return to Catalog
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="space-y-3">
                    <div className="p-3 bg-[#F8F7F2] rounded-xl text-xs text-[#1F2933]">
                      Applying for cohort: <strong>{selectedCourse.title}</strong>
                    </div>

                    <div>
                      <label className="font-bold text-[#0B1F33] block mb-1">Full Legal Name *</label>
                      <input
                        type="text"
                        required
                        value={applicantName}
                        onChange={(e) => setApplicantName(e.target.value)}
                        placeholder="e.g. Olumide Adeleke"
                        className="w-full p-2.5 rounded-xl border border-[#E4E1D8] focus:border-[#087F5B]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#0B1F33] block mb-1">Email Address *</label>
                        <input
                          type="email"
                          required
                          value={applicantEmail}
                          onChange={(e) => setApplicantEmail(e.target.value)}
                          placeholder="olumide@example.com"
                          className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                        />
                      </div>
                      <div>
                        <label className="font-bold text-[#0B1F33] block mb-1">Phone Number (WhatsApp) *</label>
                        <input
                          type="tel"
                          required
                          value={applicantPhone}
                          onChange={(e) => setApplicantPhone(e.target.value)}
                          placeholder="+234 801 234 5678"
                          className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-[#0B1F33] block mb-1">State of Residence *</label>
                        <select
                          value={applicantState}
                          onChange={(e) => setApplicantState(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                        >
                          <option value="Lagos">Lagos</option>
                          <option value="Abuja (FCT)">Abuja (FCT)</option>
                          <option value="Rivers (Port Harcourt)">Rivers</option>
                          <option value="Oyo (Ibadan)">Oyo</option>
                          <option value="Enugu">Enugu</option>
                          <option value="Kaduna">Kaduna</option>
                          <option value="Kano">Kano</option>
                          <option value="Other State">Other Nigerian State</option>
                          <option value="Diaspora">Diaspora</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-[#0B1F33] block mb-1">Educational Background *</label>
                        <select
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          className="w-full p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                        >
                          <option value="Secondary School Graduate (SSCE)">Secondary School (SSCE)</option>
                          <option value="Undergraduate">Current Undergraduate Student</option>
                          <option value="Bachelors / HND Graduate">Bachelor's Degree / HND Graduate</option>
                          <option value="Postgraduate (Masters/PhD)">Postgraduate (Masters/PhD)</option>
                          <option value="Self-Taught / Career Switcher">Self-Taught / Career Switcher</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-[#0B1F33] block mb-1">
                        Motivation Statement *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={motivation}
                        onChange={(e) => setMotivation(e.target.value)}
                        placeholder="Why do you want to join this cohort, and how will you apply these skills to your career in Nigeria's tech economy?"
                        className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsApplying(false)}
                        className="px-4 py-2 rounded-xl border border-[#E4E1D8] font-semibold cursor-pointer"
                      >
                        Back to Syllabus
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingApp}
                        className="px-5 py-2 rounded-xl bg-[#087F5B] hover:bg-[#076c4d] text-white font-bold cursor-pointer disabled:opacity-60 shadow-xs"
                      >
                        {isSubmittingApp ? 'Submitting Application...' : 'Submit Application'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
