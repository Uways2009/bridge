import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import {
  AcademyCourse,
  CourseApplication,
  CourseEnrollment,
  CourseSchedule,
  CourseMaterial,
  CourseAttendance,
  CourseAssignment,
  CourseCertificate,
  CourseModuleItem,
  CourseTuitionStatus,
  CoursePublishedStatus,
  CourseSkillLevel,
  CourseDeliveryFormat,
  AttendanceRecordItem,
} from '../../types';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  FileText,
  Video,
  Award,
  BookOpen,
  UserCheck,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Trash2,
  Edit3,
  Users,
  Eye,
  Check,
  X,
  FileCheck2,
  Send,
  Link as LinkIcon,
  RefreshCw,
} from 'lucide-react';
import {
  fetchAllAcademyCoursesAdmin,
  createAcademyCourseInFirestore,
  updateAcademyCourseInFirestore,
  deleteAcademyCourseInFirestore,
  fetchAllAcademyApplicationsAdmin,
  updateAcademyApplicationStatusInFirestore,
} from '../../lib/firebaseService';

export const AdminAcademy: React.FC = () => {
  const { currentAdmin } = useAdmin();

  // Active sub-tab
  const [subTab, setSubTab] = useState<
    'courses' | 'applications' | 'schedules' | 'materials' | 'attendance' | 'assignments' | 'certificates'
  >('courses');

  // Courses state
  const [courses, setCourses] = useState<AcademyCourse[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [courseSearch, setCourseSearch] = useState('');

  // Course Create/Edit Modal
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<AcademyCourse | null>(null);

  // Applications state
  const [applications, setApplications] = useState<CourseApplication[]>([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [appStatusFilter, setAppStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<CourseApplication | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');

  // Enrollments
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);

  // Schedules state
  const [schedules, setSchedules] = useState<CourseSchedule[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    courseId: '',
    title: '',
    sessionDate: '',
    sessionTime: '10:00 AM WAT',
    meetingLink: '',
    instructorName: '',
    topic: '',
  });

  // Materials state
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materialForm, setMaterialForm] = useState({
    courseId: '',
    title: '',
    moduleName: 'Module 1: Foundations',
    type: 'document' as 'video' | 'slides' | 'document' | 'code' | 'guide',
    url: '',
    description: '',
  });

  // Attendance state
  const [attendanceRecords, setAttendanceRecords] = useState<CourseAttendance[]>([]);
  const [attendanceCourseId, setAttendanceCourseId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceTitle, setAttendanceTitle] = useState('Lecture Session');
  const [studentAttendanceMap, setStudentAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'excused'>>({});

  // Assignments & Grading
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    courseId: '',
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100,
  });
  const [gradingAssignment, setGradingAssignment] = useState<CourseAssignment | null>(null);
  const [gradingStudentEmail, setGradingStudentEmail] = useState('');
  const [gradingScore, setGradingScore] = useState<number>(85);
  const [gradingFeedback, setGradingFeedback] = useState('');

  // Certificates
  const [certificates, setCertificates] = useState<CourseCertificate[]>([]);
  const [issueCertModalOpen, setIssueCertModalOpen] = useState(false);
  const [certCourseId, setCertCourseId] = useState('');
  const [certStudentEmail, setCertStudentEmail] = useState('');
  const [certCapstoneApproved, setCertCapstoneApproved] = useState(true);
  const [certError, setCertError] = useState<string | null>(null);
  const [certSuccess, setCertSuccess] = useState<string | null>(null);

  // Status message
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setActionNotice({ type, text });
    setTimeout(() => setActionNotice(null), 5000);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('nb_admin_token') || sessionStorage.getItem('nb_admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Load Courses (Firestore single source of truth + API fallback)
  const loadCourses = async () => {
    setIsLoadingCourses(true);
    try {
      const firestoreCourses = await fetchAllAcademyCoursesAdmin();
      if (firestoreCourses && firestoreCourses.length > 0) {
        setCourses(firestoreCourses);
        setIsLoadingCourses(false);
        return;
      }

      const res = await fetch('/api/academy/courses', {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setCourses(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Courses load fallback notice:', err);
      try {
        const res = await fetch('/api/academy/courses', {
          headers: getAuthHeader(),
        });
        if (res.ok) {
          const data = await res.json();
          setCourses(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        // ignored
      }
    } finally {
      setIsLoadingCourses(false);
    }
  };

  // Load Applications (Firestore single source of truth + API fallback)
  const loadApplications = async () => {
    setIsLoadingApps(true);
    try {
      const firestoreApps = await fetchAllAcademyApplicationsAdmin();
      if (firestoreApps && firestoreApps.length > 0) {
        setApplications(firestoreApps);
        setIsLoadingApps(false);
        return;
      }

      const res = await fetch('/api/academy/applications', {
        headers: getAuthHeader(),
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.warn('Applications load fallback notice:', err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  // Load Schedules
  const loadSchedules = async () => {
    try {
      const res = await fetch('/api/academy/schedules');
      if (res.ok) {
        const data = await res.json();
        setSchedules(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load schedules', err);
    }
  };

  // Load Materials
  const loadMaterials = async () => {
    try {
      const res = await fetch('/api/academy/materials');
      if (res.ok) {
        const data = await res.json();
        setMaterials(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load materials', err);
    }
  };

  // Load Enrollments
  const loadEnrollments = async () => {
    try {
      const res = await fetch('/api/academy/enrollments');
      if (res.ok) {
        const data = await res.json();
        setEnrollments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load enrollments', err);
    }
  };

  // Load Attendance
  const loadAttendance = async () => {
    try {
      const res = await fetch('/api/academy/attendance');
      if (res.ok) {
        const data = await res.json();
        setAttendanceRecords(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load attendance', err);
    }
  };

  // Load Assignments
  const loadAssignments = async () => {
    try {
      const res = await fetch('/api/academy/assignments');
      if (res.ok) {
        const data = await res.json();
        setAssignments(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load assignments', err);
    }
  };

  useEffect(() => {
    loadCourses();
    loadApplications();
    loadSchedules();
    loadMaterials();
    loadEnrollments();
    loadAttendance();
    loadAssignments();
  }, []);

  // Course Form State
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    category: 'Software Engineering',
    instructorName: '',
    duration: '8 Weeks',
    skillLevel: 'Beginner' as CourseSkillLevel,
    deliveryFormat: 'Online Live' as CourseDeliveryFormat,
    tuitionStatus: 'tuition-free' as CourseTuitionStatus,
    priceNaira: 0,
    publishedStatus: 'published' as CoursePublishedStatus,
    startDate: '',
    applicationDeadline: '',
    minAttendancePercent: 75,
    minAssignmentScorePercent: 60,
    capstoneRequired: true,
    modules: [
      {
        id: 'm1',
        title: 'Module 1: Foundations & Environment Setup',
        overview: 'Introduction to tooling, version control, and workspace standards.',
        topics: ['Git & GitHub Workflow', 'Development Environment Setup', 'Core Syntax & Architecture'],
      },
      {
        id: 'm2',
        title: 'Module 2: Practical Projects & Real-World Building',
        overview: 'Hands-on development of production-grade tasks.',
        topics: ['Component Design', 'Data Flow & Integration', 'Error Handling & Performance'],
      },
    ] as CourseModuleItem[],
  });

  const openCreateCourseModal = () => {
    setEditingCourse(null);
    setCourseFormData({
      title: '',
      description: '',
      category: 'Software Engineering',
      instructorName: currentAdmin?.name || 'Academy Lead',
      duration: '8 Weeks',
      skillLevel: 'Beginner',
      deliveryFormat: 'Online Live',
      tuitionStatus: 'tuition-free',
      priceNaira: 0,
      publishedStatus: 'published',
      startDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      applicationDeadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      minAttendancePercent: 75,
      minAssignmentScorePercent: 60,
      capstoneRequired: true,
      modules: [
        {
          id: 'm1',
          title: 'Module 1: Foundations & Architecture',
          overview: 'Fundamental concepts, tools, and best practices.',
          topics: ['Development Environment Setup', 'Core Principles', 'Practical Exercises'],
        },
      ],
    });
    setIsCourseModalOpen(true);
  };

  const openEditCourseModal = (course: AcademyCourse) => {
    setEditingCourse(course);
    setCourseFormData({
      title: course.title,
      description: course.description,
      category: course.category,
      instructorName: course.instructorName,
      duration: course.duration,
      skillLevel: course.skillLevel,
      deliveryFormat: course.deliveryFormat,
      tuitionStatus: course.tuitionStatus,
      priceNaira: course.priceNaira || 0,
      publishedStatus: course.publishedStatus,
      startDate: course.startDate,
      applicationDeadline: course.applicationDeadline,
      minAttendancePercent: course.completionCriteria?.minAttendancePercent || 75,
      minAssignmentScorePercent: course.completionCriteria?.minAssignmentScorePercent || 60,
      capstoneRequired: course.completionCriteria?.capstoneRequired ?? true,
      modules: course.modules && course.modules.length > 0 ? course.modules : [],
    });
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseFormData.title.trim()) {
      showNotice('error', 'Course title is required.');
      return;
    }

    const generatedSlug = courseFormData.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const payload = {
      title: courseFormData.title,
      slug: editingCourse?.slug || generatedSlug,
      description: courseFormData.description,
      category: courseFormData.category,
      instructorName: courseFormData.instructorName,
      duration: courseFormData.duration,
      skillLevel: courseFormData.skillLevel,
      deliveryFormat: courseFormData.deliveryFormat,
      tuitionStatus: courseFormData.tuitionStatus,
      priceNaira: courseFormData.priceNaira,
      publishedStatus: courseFormData.publishedStatus,
      startDate: courseFormData.startDate,
      applicationDeadline: courseFormData.applicationDeadline,
      modules: courseFormData.modules,
      completionCriteria: {
        minAttendancePercent: courseFormData.minAttendancePercent,
        minAssignmentScorePercent: courseFormData.minAssignmentScorePercent,
        capstoneRequired: courseFormData.capstoneRequired,
        requiresReview: true,
      },
    };

    const adminUser = currentAdmin
      ? { uid: currentAdmin.id, email: currentAdmin.email, name: currentAdmin.name }
      : undefined;

    try {
      // 1. Direct write to Firestore single source of truth
      if (editingCourse) {
        await updateAcademyCourseInFirestore(editingCourse.id, payload, adminUser);
      } else {
        await createAcademyCourseInFirestore(payload, adminUser);
      }

      // 2. Mirror to API
      try {
        const url = editingCourse ? `/api/academy/courses/${editingCourse.id}` : '/api/academy/courses';
        const method = editingCourse ? 'PUT' : 'POST';
        await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify(payload),
        });
      } catch (apiErr) {
        console.warn('API mirror note:', apiErr);
      }

      showNotice('success', editingCourse ? 'Course updated and synchronized in Firestore!' : 'Course created and saved to Firestore!');
      setIsCourseModalOpen(false);
      loadCourses();
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to save course to Firebase.');
    }
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete course "${title}"?`)) {
      return;
    }

    const adminUser = currentAdmin
      ? { uid: currentAdmin.id, email: currentAdmin.email, name: currentAdmin.name }
      : undefined;

    try {
      // 1. Delete from Firestore
      await deleteAcademyCourseInFirestore(id, title, adminUser);

      // 2. Mirror to API
      try {
        await fetch(`/api/academy/courses/${id}`, {
          method: 'DELETE',
          headers: getAuthHeader(),
        });
      } catch (e) {
        // ignored
      }

      showNotice('success', `Course "${title}" removed from Cloud Firestore.`);
      loadCourses();
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to delete course.');
    }
  };

  // Update Application Status
  const handleUpdateAppStatus = async (appId: string, status: string) => {
    const adminUser = currentAdmin
      ? { uid: currentAdmin.id, email: currentAdmin.email, name: currentAdmin.name }
      : undefined;

    try {
      // 1. Update in Firestore
      await updateAcademyApplicationStatusInFirestore(appId, status as any, adminUser, reviewerNotes);

      // 2. Mirror to API
      try {
        await fetch(`/api/academy/applications/${appId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            status,
            reviewerNotes,
          }),
        });
      } catch (e) {
        // ignored
      }

      showNotice('success', `Application marked as ${status} in Firestore.`);
      setSelectedApp(null);
      setReviewerNotes('');
      loadApplications();
      loadEnrollments();
    } catch (err: any) {
      showNotice('error', err?.message || 'Failed to update application.');
    }
  };

  // Create Schedule
  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.courseId || !scheduleForm.title || !scheduleForm.sessionDate) {
      showNotice('error', 'Please complete all required schedule fields.');
      return;
    }

    try {
      const res = await fetch('/api/academy/schedules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(scheduleForm),
      });

      if (res.ok) {
        showNotice('success', 'Class session scheduled successfully!');
        setIsScheduleModalOpen(false);
        setScheduleForm({
          courseId: '',
          title: '',
          sessionDate: '',
          sessionTime: '10:00 AM WAT',
          meetingLink: '',
          instructorName: '',
          topic: '',
        });
        loadSchedules();
      }
    } catch {
      showNotice('error', 'Failed to schedule class session.');
    }
  };

  // Create Material
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!materialForm.courseId || !materialForm.title || !materialForm.url) {
      showNotice('error', 'Please provide course, title, and link.');
      return;
    }

    try {
      const res = await fetch('/api/academy/materials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(materialForm),
      });

      if (res.ok) {
        showNotice('success', 'Learning material published!');
        setIsMaterialModalOpen(false);
        setMaterialForm({
          courseId: '',
          title: '',
          moduleName: 'Module 1: Foundations',
          type: 'document',
          url: '',
          description: '',
        });
        loadMaterials();
      }
    } catch {
      showNotice('error', 'Failed to save material.');
    }
  };

  // Record Attendance
  const handleRecordAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attendanceCourseId) {
      showNotice('error', 'Please select a course to record attendance.');
      return;
    }

    const courseEnrollments = enrollments.filter((e) => e.courseId === attendanceCourseId);
    if (courseEnrollments.length === 0) {
      showNotice('error', 'No enrolled students found for this course.');
      return;
    }

    const records: AttendanceRecordItem[] = courseEnrollments.map((enr) => ({
      studentEmail: enr.studentEmail,
      studentName: enr.studentName,
      status: studentAttendanceMap[enr.studentEmail] || 'present',
    }));

    try {
      const res = await fetch('/api/academy/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          courseId: attendanceCourseId,
          sessionDate: attendanceDate,
          sessionTitle: attendanceTitle,
          records,
        }),
      });

      if (res.ok) {
        showNotice('success', `Attendance recorded for ${records.length} students!`);
        loadAttendance();
        loadEnrollments();
      } else {
        const data = await res.json();
        showNotice('error', data.error || 'Failed to record attendance.');
      }
    } catch {
      showNotice('error', 'Network error recording attendance.');
    }
  };

  // Create Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentForm.courseId || !assignmentForm.title || !assignmentForm.dueDate) {
      showNotice('error', 'Please fill in all required assignment details.');
      return;
    }

    try {
      const res = await fetch('/api/academy/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(assignmentForm),
      });

      if (res.ok) {
        showNotice('success', 'Assignment created for students!');
        setIsAssignmentModalOpen(false);
        setAssignmentForm({
          courseId: '',
          title: '',
          description: '',
          dueDate: '',
          maxScore: 100,
        });
        loadAssignments();
      }
    } catch {
      showNotice('error', 'Failed to create assignment.');
    }
  };

  // Submit Grade
  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingAssignment || !gradingStudentEmail) return;

    try {
      const res = await fetch(`/api/academy/assignments/${gradingAssignment.id}/grade`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          studentEmail: gradingStudentEmail,
          score: gradingScore,
          feedback: gradingFeedback,
        }),
      });

      if (res.ok) {
        showNotice('success', 'Submission graded successfully!');
        setGradingAssignment(null);
        loadAssignments();
        loadEnrollments();
      }
    } catch {
      showNotice('error', 'Failed to grade submission.');
    }
  };

  // Issue Certificate
  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCertError(null);
    setCertSuccess(null);

    if (!certCourseId || !certStudentEmail) {
      setCertError('Please select both a course and student email.');
      return;
    }

    try {
      const res = await fetch('/api/academy/certificates/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({
          courseId: certCourseId,
          studentEmail: certStudentEmail,
          capstoneApproved: certCapstoneApproved,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setCertSuccess(`Certificate ${data.certificate.certificateId} successfully issued!`);
        showNotice('success', `Certificate issued to ${data.certificate.studentName}`);
        loadEnrollments();
        setTimeout(() => {
          setIssueCertModalOpen(false);
          setCertSuccess(null);
        }, 2000);
      } else {
        setCertError(data.error + (data.details ? `: ${data.details.join(' ')}` : ''));
      }
    } catch {
      setCertError('Network error issuing certificate.');
    }
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesFilter =
      selectedCourseFilter === 'all' ||
      c.tuitionStatus === selectedCourseFilter ||
      c.publishedStatus === selectedCourseFilter;
    const matchesSearch =
      c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.instructorName.toLowerCase().includes(courseSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered applications
  const filteredApps = applications.filter((a) => {
    if (appStatusFilter === 'all') return true;
    return a.status === appStatusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E4E1D8] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#087F5B]/10 text-[#087F5B]">
              <GraduationCap className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-[#0B1F33]">NaijaBridge Tech Academy</h1>
          </div>
          <p className="text-sm text-[#1F2933]/70 mt-1">
            Curate practical technical cohorts, manage applicant admissions, track student completion, and issue accredited certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateCourseModal}
            className="px-4 py-2.5 rounded-xl bg-[#087F5B] hover:bg-[#076c4d] text-white text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionNotice.text}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto border-b border-[#E4E1D8] gap-1 bg-white px-4 pt-2 rounded-t-2xl">
        {[
          { id: 'courses', label: 'Courses', icon: BookOpen, count: courses.length },
          { id: 'applications', label: 'Admissions', icon: UserCheck, count: applications.filter(a => a.status === 'received').length },
          { id: 'schedules', label: 'Class Schedules', icon: Calendar, count: schedules.length },
          { id: 'materials', label: 'Materials', icon: FileText, count: materials.length },
          { id: 'attendance', label: 'Attendance', icon: Clock },
          { id: 'assignments', label: 'Assignments', icon: Edit3, count: assignments.length },
          { id: 'certificates', label: 'Certificates & Completion', icon: Award, count: enrollments.filter(e => e.certificateIssued).length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-semibold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#087F5B] text-[#087F5B] bg-[#087F5B]/5'
                  : 'border-transparent text-[#1F2933]/60 hover:text-[#0B1F33] hover:bg-stone-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#087F5B]/15 text-[#087F5B] font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SUB-TAB 1: COURSES MANAGEMENT */}
      {subTab === 'courses' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-[#E4E1D8]">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-[#1F2933]/40" />
              <input
                type="text"
                placeholder="Search courses by title, category, or instructor..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-[#E4E1D8] focus:outline-none focus:border-[#087F5B]"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#1F2933]/40" />
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="text-xs py-2 px-3 rounded-xl border border-[#E4E1D8] bg-white text-[#1F2933]"
              >
                <option value="all">All Courses & Formats</option>
                <option value="tuition-free">Tuition-Free</option>
                <option value="paid">Paid</option>
                <option value="sponsored">Sponsored</option>
                <option value="closed">Closed</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          </div>

          {/* Courses List */}
          {isLoadingCourses ? (
            <div className="p-12 text-center text-sm text-[#1F2933]/60 bg-white rounded-2xl border border-[#E4E1D8]">
              Loading academy courses...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E4E1D8] space-y-3">
              <GraduationCap className="w-12 h-12 text-[#1F2933]/30 mx-auto" />
              <h3 className="text-base font-bold text-[#0B1F33]">No courses currently found</h3>
              <p className="text-xs text-[#1F2933]/70 max-w-md mx-auto">
                No courses are currently open for registration or created. Click "Create Course" to add the first real curriculum cohort.
              </p>
              <button
                onClick={openCreateCourseModal}
                className="px-4 py-2 rounded-xl bg-[#087F5B] text-white text-xs font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Course</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white p-5 rounded-2xl border border-[#E4E1D8] shadow-2xs hover:border-[#087F5B]/50 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-semibold text-[#087F5B] uppercase tracking-wide">
                          {course.category}
                        </span>
                        <h3 className="text-base font-bold text-[#0B1F33] leading-snug mt-0.5">
                          {course.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            course.tuitionStatus === 'tuition-free'
                              ? 'bg-emerald-100 text-emerald-800'
                              : course.tuitionStatus === 'paid'
                              ? 'bg-amber-100 text-amber-900'
                              : course.tuitionStatus === 'sponsored'
                              ? 'bg-purple-100 text-purple-900'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {course.tuitionStatus}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            course.publishedStatus === 'published'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-stone-100 text-stone-600'
                          }`}
                        >
                          {course.publishedStatus}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#1F2933]/70 line-clamp-2">
                      {course.description || 'Comprehensive digital skills and hands-on portfolio training.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#1F2933]/80 bg-[#F8F7F2] p-3 rounded-xl">
                      <div>
                        <span className="text-[#1F2933]/50 block">Instructor:</span>
                        <span className="font-semibold">{course.instructorName}</span>
                      </div>
                      <div>
                        <span className="text-[#1F2933]/50 block">Duration:</span>
                        <span className="font-semibold">{course.duration} ({course.deliveryFormat})</span>
                      </div>
                      <div>
                        <span className="text-[#1F2933]/50 block">Start Date:</span>
                        <span className="font-semibold">{course.startDate || 'TBA'}</span>
                      </div>
                      <div>
                        <span className="text-[#1F2933]/50 block">Deadline:</span>
                        <span className="font-semibold text-red-700">{course.applicationDeadline || 'Open'}</span>
                      </div>
                    </div>

                    {course.completionCriteria && (
                      <div className="text-[11px] text-[#1F2933]/60 flex items-center gap-3">
                        <span>Attendance Req: <strong>{course.completionCriteria.minAttendancePercent}%</strong></span>
                        <span>Min Grade: <strong>{course.completionCriteria.minAssignmentScorePercent}%</strong></span>
                        {course.completionCriteria.capstoneRequired && (
                          <span className="text-[#087F5B] font-semibold">Capstone Required</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[#E4E1D8]">
                    <span className="text-xs text-[#1F2933]/60 font-medium">
                      Enrolled: {course.enrolledCount || 0} students
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditCourseModal(course)}
                        className="p-1.5 rounded-lg text-[#0B1F33] hover:bg-[#F8F7F2] transition-colors cursor-pointer"
                        title="Edit course"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: APPLICATIONS & ADMISSIONS */}
      {subTab === 'applications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-[#E4E1D8]">
            <span className="text-xs text-[#1F2933]/70 font-medium">
              Filter by Review Status:
            </span>
            <div className="flex items-center gap-2">
              {['all', 'received', 'under_review', 'accepted', 'waitlisted', 'rejected', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setAppStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    appStatusFilter === st
                      ? 'bg-[#087F5B] text-white'
                      : 'bg-stone-100 text-[#1F2933]/70 hover:bg-stone-200'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filteredApps.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E4E1D8] space-y-2">
              <UserCheck className="w-10 h-10 text-[#1F2933]/30 mx-auto" />
              <h3 className="text-sm font-bold text-[#0B1F33]">No student applications in this status</h3>
              <p className="text-xs text-[#1F2933]/60">
                Applications submitted by students through public course pages will appear here for admissions review.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E4E1D8] overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F8F7F2] border-b border-[#E4E1D8] text-[#1F2933]/70 font-bold">
                    <th className="p-3.5">Applicant Name</th>
                    <th className="p-3.5">Course Cohort</th>
                    <th className="p-3.5">Contact Details</th>
                    <th className="p-3.5">State / Education</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E1D8]">
                  {filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="p-3.5 font-bold text-[#0B1F33]">{app.applicantName}</td>
                      <td className="p-3.5 font-medium text-[#087F5B]">{app.courseTitle}</td>
                      <td className="p-3.5">
                        <div>{app.applicantEmail}</div>
                        <div className="text-[11px] text-[#1F2933]/60">{app.applicantPhone}</div>
                      </td>
                      <td className="p-3.5">
                        <div>{app.applicantState}</div>
                        <div className="text-[11px] text-[#1F2933]/60">{app.education}</div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            app.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : app.status === 'under_review'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setReviewerNotes(app.reviewerNotes || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#0B1F33]/5 hover:bg-[#0B1F33] text-[#0B1F33] hover:text-white font-semibold transition-colors cursor-pointer"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: SCHEDULES */}
      {subTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E4E1D8]">
            <span className="text-xs text-[#1F2933]/70 font-medium">
              Live Interactive Classes, Mentorship Hours & Virtual Lectures
            </span>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#087F5B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule Session</span>
            </button>
          </div>

          {schedules.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E4E1D8] space-y-2">
              <Calendar className="w-10 h-10 text-[#1F2933]/30 mx-auto" />
              <h3 className="text-sm font-bold text-[#0B1F33]">No class sessions scheduled yet</h3>
              <p className="text-xs text-[#1F2933]/60">Click "Schedule Session" to plan live cohort lectures and meetings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {schedules.map((s) => (
                <div key={s.id} className="bg-white p-4 rounded-xl border border-[#E4E1D8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#087F5B]">{s.sessionDate}</span>
                    <span className="text-[11px] text-[#1F2933]/60">{s.sessionTime}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#0B1F33]">{s.title}</h4>
                  <p className="text-xs text-[#1F2933]/70">{s.topic || 'Class curriculum lecture'}</p>
                  <div className="text-xs text-[#1F2933]/60">Instructor: {s.instructorName}</div>
                  {s.meetingLink && (
                    <a
                      href={s.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#087F5B] font-semibold hover:underline"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>Join Live Session</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 4: MATERIALS */}
      {subTab === 'materials' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E4E1D8]">
            <span className="text-xs text-[#1F2933]/70 font-medium">
              Course Repositories, Lecture Slides, and Documentation
            </span>
            <button
              onClick={() => setIsMaterialModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#087F5B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Material</span>
            </button>
          </div>

          {materials.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E4E1D8] space-y-2">
              <FileText className="w-10 h-10 text-[#1F2933]/30 mx-auto" />
              <h3 className="text-sm font-bold text-[#0B1F33]">No learning materials published yet</h3>
              <p className="text-xs text-[#1F2933]/60">Add GitHub repos, slide decks, and reference guides for enrolled students.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((m) => (
                <div key={m.id} className="bg-white p-4 rounded-xl border border-[#E4E1D8] flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-[#087F5B]/10 text-[#087F5B] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase text-[#087F5B]">{m.moduleName}</span>
                    <h4 className="text-sm font-bold text-[#0B1F33] truncate">{m.title}</h4>
                    <p className="text-xs text-[#1F2933]/70">{m.description}</p>
                    <a
                      href={m.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#087F5B] font-semibold mt-2 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Access Material</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: ATTENDANCE RECORDING */}
      {subTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#E4E1D8] space-y-4">
            <h3 className="text-sm font-bold text-[#0B1F33]">Record Class Attendance</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#1F2933]/80 block mb-1">Select Course</label>
                <select
                  value={attendanceCourseId}
                  onChange={(e) => setAttendanceCourseId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                >
                  <option value="">-- Choose Course Cohort --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F2933]/80 block mb-1">Session Date</label>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#1F2933]/80 block mb-1">Session Title</label>
                <input
                  type="text"
                  value={attendanceTitle}
                  onChange={(e) => setAttendanceTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-[#E4E1D8]"
                  placeholder="e.g. Week 2 Lecture: Backend API"
                />
              </div>
            </div>

            {/* Enrolled Students Roster */}
            {attendanceCourseId ? (
              <div className="pt-4 border-t border-[#E4E1D8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0B1F33]">
                    Enrolled Students Roster ({enrollments.filter((e) => e.courseId === attendanceCourseId).length})
                  </span>
                  <span className="text-[11px] text-[#1F2933]/60">
                    Attendance automatically updates student completion rates.
                  </span>
                </div>

                {enrollments.filter((e) => e.courseId === attendanceCourseId).length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#1F2933]/60 bg-[#F8F7F2] rounded-xl">
                    No accepted students enrolled in this course cohort yet. Accept student applications under the Admissions tab to populate roster.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {enrollments
                      .filter((e) => e.courseId === attendanceCourseId)
                      .map((enr) => {
                        const currentStatus = studentAttendanceMap[enr.studentEmail] || 'present';
                        return (
                          <div
                            key={enr.id}
                            className="flex items-center justify-between p-3 rounded-xl border border-[#E4E1D8] bg-[#F8F7F2]"
                          >
                            <div>
                              <span className="font-bold text-xs text-[#0B1F33] block">{enr.studentName}</span>
                              <span className="text-[11px] text-[#1F2933]/60">{enr.studentEmail}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              {(['present', 'absent', 'excused'] as const).map((st) => (
                                <button
                                  type="button"
                                  key={st}
                                  onClick={() =>
                                    setStudentAttendanceMap((prev) => ({
                                      ...prev,
                                      [enr.studentEmail]: st,
                                    }))
                                  }
                                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize cursor-pointer transition-colors ${
                                    currentStatus === st
                                      ? st === 'present'
                                        ? 'bg-emerald-600 text-white'
                                        : st === 'absent'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-amber-600 text-white'
                                      : 'bg-white text-[#1F2933]/70 border border-[#E4E1D8]'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}

                    <button
                      onClick={handleRecordAttendance}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-[#087F5B] text-white font-semibold text-xs cursor-pointer shadow-xs"
                    >
                      Save Session Attendance
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* SUB-TAB 6: ASSIGNMENTS & GRADING */}
      {subTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E4E1D8]">
            <span className="text-xs text-[#1F2933]/70 font-medium">
              Practical Homework, Code Challenges, and Capstones
            </span>
            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-[#087F5B] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Assignment</span>
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#E4E1D8] space-y-2">
              <Edit3 className="w-10 h-10 text-[#1F2933]/30 mx-auto" />
              <h3 className="text-sm font-bold text-[#0B1F33]">No assignments published yet</h3>
              <p className="text-xs text-[#1F2933]/60">Create assignments with due dates and grading rubrics.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((asg) => (
                <div key={asg.id} className="bg-white p-5 rounded-2xl border border-[#E4E1D8] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0B1F33]">{asg.title}</h4>
                      <p className="text-xs text-[#1F2933]/70">{asg.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-red-700 block">Due: {asg.dueDate}</span>
                      <span className="text-[11px] text-[#1F2933]/60">Max Score: {asg.maxScore} pts</span>
                    </div>
                  </div>

                  {/* Submissions Section */}
                  <div className="pt-3 border-t border-[#E4E1D8] space-y-2">
                    <span className="text-xs font-bold text-[#1F2933]">
                      Student Submissions ({asg.submissions?.length || 0})
                    </span>

                    {(!asg.submissions || asg.submissions.length === 0) ? (
                      <p className="text-xs text-[#1F2933]/50 italic">No submissions received yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {asg.submissions.map((sub, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#F8F7F2] text-xs"
                          >
                            <div>
                              <span className="font-bold text-[#0B1F33]">{sub.studentName}</span>
                              <span className="text-[#1F2933]/60 ml-2">({sub.studentEmail})</span>
                              <div className="mt-1">
                                <a
                                  href={sub.submissionUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#087F5B] hover:underline inline-flex items-center gap-1 font-medium"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                  <span>View Student Work</span>
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {sub.status === 'graded' ? (
                                <span className="px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                                  Score: {sub.score}/{asg.maxScore}
                                </span>
                              ) : (
                                <button
                                  onClick={() => {
                                    setGradingAssignment(asg);
                                    setGradingStudentEmail(sub.studentEmail);
                                    setGradingScore(sub.score || 85);
                                    setGradingFeedback(sub.feedback || '');
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-[#087F5B] text-white font-semibold cursor-pointer"
                                >
                                  Grade Submission
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 7: CERTIFICATES & COMPLETION TRACKER */}
      {subTab === 'certificates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-[#E4E1D8]">
            <div>
              <h3 className="text-sm font-bold text-[#0B1F33]">Course Completion & Accredited Certification</h3>
              <p className="text-xs text-[#1F2933]/60">
                Certificates are ONLY issued to students who strictly satisfy published completion criteria.
              </p>
            </div>
            <button
              onClick={() => setIssueCertModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#087F5B] text-white text-xs font-semibold flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>Issue Certificate</span>
            </button>
          </div>

          {/* Enrolled Students Completion Matrix */}
          <div className="bg-white rounded-2xl border border-[#E4E1D8] overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F7F2] border-b border-[#E4E1D8] text-[#1F2933]/70 font-bold">
                  <th className="p-3.5">Student</th>
                  <th className="p-3.5">Course</th>
                  <th className="p-3.5">Attendance Rate</th>
                  <th className="p-3.5">Assignments Completed</th>
                  <th className="p-3.5">Certificate Status</th>
                  <th className="p-3.5 text-right">Certificate ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E4E1D8]">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-[#1F2933]/50 italic">
                      No enrolled students found.
                    </td>
                  </tr>
                ) : (
                  enrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-stone-50/70">
                      <td className="p-3.5">
                        <span className="font-bold text-[#0B1F33] block">{enr.studentName}</span>
                        <span className="text-[11px] text-[#1F2933]/60">{enr.studentEmail}</span>
                      </td>
                      <td className="p-3.5 font-medium text-[#087F5B]">{enr.courseTitle}</td>
                      <td className="p-3.5 font-semibold">
                        <span
                          className={`${
                            (enr.attendanceRate || 0) >= 75 ? 'text-emerald-700' : 'text-amber-700'
                          }`}
                        >
                          {enr.attendanceRate || 0}%
                        </span>
                      </td>
                      <td className="p-3.5">{enr.assignmentsCompleted || 0} completed</td>
                      <td className="p-3.5">
                        {enr.certificateIssued ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Issued</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700">
                            In Progress
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right font-mono text-[11px] font-bold text-[#0B1F33]">
                        {enr.certificateId || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT COURSE */}
      {isCourseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E4E1D8] pb-3">
              <h3 className="font-bold text-base text-[#0B1F33]">
                {editingCourse ? 'Edit Course Cohort' : 'Create Tech Academy Course'}
              </h3>
              <button
                onClick={() => setIsCourseModalOpen(false)}
                className="p-1 text-[#1F2933]/60 hover:text-[#0B1F33] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-[#0B1F33] block mb-1">Course Title *</label>
                  <input
                    type="text"
                    required
                    value={courseFormData.title}
                    onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                    placeholder="e.g. Full-Stack Web Engineering with React & Node.js"
                    className="w-full p-2.5 rounded-xl border border-[#E4E1D8] focus:border-[#087F5B]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Category</label>
                  <select
                    value={courseFormData.category}
                    onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                  >
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Product Design (UI/UX)">Product Design (UI/UX)</option>
                    <option value="Data Analytics & AI">Data Analytics & AI</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Cloud Computing & DevOps">Cloud Computing & DevOps</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Lead Instructor Name</label>
                  <input
                    type="text"
                    required
                    value={courseFormData.instructorName}
                    onChange={(e) => setCourseFormData({ ...courseFormData, instructorName: e.target.value })}
                    placeholder="e.g. Tunde Adeyemi"
                    className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Duration</label>
                  <input
                    type="text"
                    value={courseFormData.duration}
                    onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                    placeholder="e.g. 10 Weeks"
                    className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Skill Level</label>
                  <select
                    value={courseFormData.skillLevel}
                    onChange={(e) => setCourseFormData({ ...courseFormData, skillLevel: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Delivery Format</label>
                  <select
                    value={courseFormData.deliveryFormat}
                    onChange={(e) => setCourseFormData({ ...courseFormData, deliveryFormat: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                  >
                    <option value="Online Live">Online Live (WAT Timezone)</option>
                    <option value="Self-Paced">Self-Paced with Mentorship</option>
                    <option value="Hybrid (Lagos/Remote)">Hybrid (Lagos Hub / Remote)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Tuition Status</label>
                  <select
                    value={courseFormData.tuitionStatus}
                    onChange={(e) => setCourseFormData({ ...courseFormData, tuitionStatus: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                  >
                    <option value="tuition-free">Tuition-Free</option>
                    <option value="paid">Paid</option>
                    <option value="sponsored">Sponsored (Full Scholarship)</option>
                    <option value="closed">Closed / In-Session</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={courseFormData.startDate}
                    onChange={(e) => setCourseFormData({ ...courseFormData, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={courseFormData.applicationDeadline}
                    onChange={(e) => setCourseFormData({ ...courseFormData, applicationDeadline: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Course Description</label>
                <textarea
                  rows={3}
                  value={courseFormData.description}
                  onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                  placeholder="Outline the cohort objectives, practical outcomes, and career pathways..."
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              {/* Completion Criteria Rules */}
              <div className="bg-[#F8F7F2] p-4 rounded-xl space-y-2 border border-[#E4E1D8]">
                <h4 className="font-bold text-xs text-[#0B1F33]">Accreditation & Certificate Completion Rules</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#1F2933]/70 block mb-1">
                      Min Attendance Percentage Required
                    </label>
                    <input
                      type="number"
                      min={50}
                      max={100}
                      value={courseFormData.minAttendancePercent}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, minAttendancePercent: Number(e.target.value) })
                      }
                      className="w-full p-2 rounded-lg border border-[#E4E1D8] bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#1F2933]/70 block mb-1">
                      Min Assignment Score Average (%)
                    </label>
                    <input
                      type="number"
                      min={40}
                      max={100}
                      value={courseFormData.minAssignmentScorePercent}
                      onChange={(e) =>
                        setCourseFormData({ ...courseFormData, minAssignmentScorePercent: Number(e.target.value) })
                      }
                      className="w-full p-2 rounded-lg border border-[#E4E1D8] bg-white"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-xs text-[#1F2933] cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={courseFormData.capstoneRequired}
                    onChange={(e) =>
                      setCourseFormData({ ...courseFormData, capstoneRequired: e.target.checked })
                    }
                    className="rounded text-[#087F5B]"
                  />
                  <span>Require verified Capstone Project completion for certificate</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E4E1D8]">
                <button
                  type="button"
                  onClick={() => setIsCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E1D8] text-[#1F2933]/70 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#087F5B] text-white font-semibold cursor-pointer shadow-xs"
                >
                  {editingCourse ? 'Update Course' : 'Save & Publish Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REVIEW APPLICATION */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E1D8] pb-3">
              <h3 className="font-bold text-base text-[#0B1F33]">Review Admissions Application</h3>
              <button onClick={() => setSelectedApp(null)} className="cursor-pointer">
                <X className="w-5 h-5 text-[#1F2933]/50" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#F8F7F2] p-3 rounded-xl space-y-1.5">
                <div className="text-sm font-bold text-[#0B1F33]">{selectedApp.applicantName}</div>
                <div className="text-[#1F2933]/70">{selectedApp.applicantEmail} • {selectedApp.applicantPhone}</div>
                <div className="text-[#1F2933]/70">Location: {selectedApp.applicantState} | Education: {selectedApp.education}</div>
                <div className="text-[#087F5B] font-semibold pt-1">Applying for: {selectedApp.courseTitle}</div>
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Motivation & Career Statement:</label>
                <div className="p-3 bg-stone-50 rounded-xl border border-[#E4E1D8] text-[#1F2933]/80 italic">
                  "{selectedApp.motivation || 'Dedicated to advancing digital skills and contributing to Nigeria’s tech ecosystem.'}"
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Reviewer Feedback Notes:</label>
                <textarea
                  rows={2}
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                  placeholder="Optional internal comments or requirements..."
                  className="w-full p-2 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              <div className="pt-3 border-t border-[#E4E1D8] flex flex-wrap gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(selectedApp.id, 'rejected')}
                  className="px-3 py-1.5 rounded-lg bg-red-100 text-red-800 font-semibold cursor-pointer"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(selectedApp.id, 'waitlisted')}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-semibold cursor-pointer"
                >
                  Waitlist
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(selectedApp.id, 'under_review')}
                  className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800 font-semibold cursor-pointer"
                >
                  Mark Under Review
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateAppStatus(selectedApp.id, 'accepted')}
                  className="px-4 py-1.5 rounded-lg bg-[#087F5B] text-white font-bold cursor-pointer"
                >
                  Accept & Enroll Student
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCHEDULE SESSION */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E1D8] pb-3">
              <h3 className="font-bold text-sm text-[#0B1F33]">Schedule Class Session</h3>
              <button onClick={() => setIsScheduleModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-[#1F2933]/50" />
              </button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Course *</label>
                <select
                  required
                  value={scheduleForm.courseId}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, courseId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  placeholder="e.g. Masterclass: REST APIs and Database Architecture"
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.sessionDate}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, sessionDate: e.target.value })}
                    className="w-full p-2 rounded-xl border border-[#E4E1D8]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Time (WAT)</label>
                  <input
                    type="text"
                    value={scheduleForm.sessionTime}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, sessionTime: e.target.value })}
                    placeholder="10:00 AM WAT"
                    className="w-full p-2 rounded-xl border border-[#E4E1D8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Virtual Meeting Link (Google Meet / Zoom)</label>
                <input
                  type="url"
                  value={scheduleForm.meetingLink}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Instructor / Host</label>
                <input
                  type="text"
                  value={scheduleForm.instructorName}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, instructorName: e.target.value })}
                  placeholder="Instructor Name"
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E1D8] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#087F5B] text-white font-semibold cursor-pointer"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD MATERIAL */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E1D8] pb-3">
              <h3 className="font-bold text-sm text-[#0B1F33]">Add Learning Material</h3>
              <button onClick={() => setIsMaterialModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-[#1F2933]/50" />
              </button>
            </div>

            <form onSubmit={handleCreateMaterial} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Course *</label>
                <select
                  required
                  value={materialForm.courseId}
                  onChange={(e) => setMaterialForm({ ...materialForm, courseId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Material Title *</label>
                <input
                  type="text"
                  required
                  value={materialForm.title}
                  onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
                  placeholder="e.g. Week 1 Slides & Code Sandbox"
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Material Resource URL *</label>
                <input
                  type="url"
                  required
                  value={materialForm.url}
                  onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
                  placeholder="https://github.com/... or Google Drive URL"
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E1D8] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#087F5B] text-white font-semibold cursor-pointer"
                >
                  Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ASSIGNMENT */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E1D8] pb-3">
              <h3 className="font-bold text-sm text-[#0B1F33]">Create Assignment</h3>
              <button onClick={() => setIsAssignmentModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-[#1F2933]/50" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Course *</label>
                <select
                  required
                  value={assignmentForm.courseId}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, courseId: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  placeholder="e.g. Build an Authenticated CRUD API"
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Description & Requirements</label>
                <textarea
                  rows={2}
                  value={assignmentForm.description}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                  placeholder="Specify submission criteria and git guidelines..."
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="w-full p-2 rounded-xl border border-[#E4E1D8]"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#0B1F33] block mb-1">Max Score</label>
                  <input
                    type="number"
                    value={assignmentForm.maxScore}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, maxScore: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-[#E4E1D8]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E1D8] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#087F5B] text-white font-semibold cursor-pointer"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: GRADE SUBMISSION */}
      {gradingAssignment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E1D8] pb-3">
              <h3 className="font-bold text-sm text-[#0B1F33]">Grade Student Submission</h3>
              <button onClick={() => setGradingAssignment(null)} className="cursor-pointer">
                <X className="w-4 h-4 text-[#1F2933]/50" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-3 text-xs">
              <div className="p-3 bg-[#F8F7F2] rounded-xl">
                <span className="font-bold text-[#0B1F33] block">{gradingAssignment.title}</span>
                <span className="text-[11px] text-[#1F2933]/70">Student: {gradingStudentEmail}</span>
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Score (out of {gradingAssignment.maxScore})</label>
                <input
                  type="number"
                  min={0}
                  max={gradingAssignment.maxScore}
                  value={gradingScore}
                  onChange={(e) => setGradingScore(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Feedback & Recommendations</label>
                <textarea
                  rows={3}
                  value={gradingFeedback}
                  onChange={(e) => setGradingFeedback(e.target.value)}
                  placeholder="Praise strengths, point out edge cases, provide code suggestions..."
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingAssignment(null)}
                  className="px-4 py-2 rounded-xl border border-[#E4E1D8] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#087F5B] text-white font-semibold cursor-pointer"
                >
                  Submit Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ISSUE CERTIFICATE */}
      {issueCertModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E4E1D8] pb-3">
              <h3 className="font-bold text-sm text-[#0B1F33]">Issue Completion Certificate</h3>
              <button onClick={() => setIssueCertModalOpen(false)} className="cursor-pointer">
                <X className="w-4 h-4 text-[#1F2933]/50" />
              </button>
            </div>

            {certError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{certError}</span>
              </div>
            )}

            {certSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{certSuccess}</span>
              </div>
            )}

            <form onSubmit={handleIssueCertificate} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Course Cohort *</label>
                <select
                  required
                  value={certCourseId}
                  onChange={(e) => setCertCourseId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#0B1F33] block mb-1">Student Candidate *</label>
                <select
                  required
                  value={certStudentEmail}
                  onChange={(e) => setCertStudentEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E4E1D8] bg-white"
                >
                  <option value="">-- Select Enrolled Student --</option>
                  {enrollments
                    .filter((e) => !certCourseId || e.courseId === certCourseId)
                    .map((enr) => (
                      <option key={enr.id} value={enr.studentEmail}>
                        {enr.studentName} ({enr.studentEmail}) - Attendance: {enr.attendanceRate || 0}%
                      </option>
                    ))}
                </select>
              </div>

              <div className="bg-[#F8F7F2] p-3 rounded-xl border border-[#E4E1D8]">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-[#0B1F33]">
                  <input
                    type="checkbox"
                    checked={certCapstoneApproved}
                    onChange={(e) => setCertCapstoneApproved(e.target.checked)}
                    className="rounded text-[#087F5B]"
                  />
                  <span>Instructor Confirms Capstone Project Approval</span>
                </label>
                <p className="text-[11px] text-[#1F2933]/60 mt-1">
                  System server validates that attendance % and assignment scores meet the published course completion criteria before issuing.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIssueCertModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E4E1D8] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#087F5B] text-white font-semibold cursor-pointer"
                >
                  Verify & Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
