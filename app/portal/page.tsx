'use client';

import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  HelpCircle,
  FileEdit,
  CheckCircle,
  Menu,
  Sidebar as SidebarIcon,
  User,
  Download,
  FileText,
  Code,
  Lock,
  Send,
  Award,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/client';
import Aurora from '@/components/Aurora';

type LessonType = 'video' | 'quiz' | 'assignment';

interface Question {
  _id: string;
  text: string;
  options: string[];
}

interface Quiz {
  _id: string;
  title: string;
  questions: Question[];
}

interface Lesson {
  _id: string;
  title: string;
  type: LessonType;
  duration?: string;
  youtube_id?: string;
  description?: string;
  quiz?: Quiz;
}

interface Unit {
  _id: string;
  title: string;
  lessons: Lesson[];
}

export default function PortalPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [courses, setCourses] = useState<any[]>([]);
  const [course, setCourse] = useState<any>(null);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);

  const [quizState, setQuizState] = useState({
    active: false,
    currentQuestionIndex: 0,
    answers: {} as Record<number, number>,
    finished: false,
    score: 0
  });

  const [assignmentSubmission, setAssignmentSubmission] = useState('');
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);

  const { user, isSignedIn } = useUser();
  const supabase = createClient();

  // Resolve Clerk user to Supabase user ID
  useEffect(() => {
    if (!isSignedIn) return;

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.supabaseUserId) {
          setSupabaseUserId(data.supabaseUserId);
        }
      })
      .catch(err => console.error('Failed to resolve user:', err));
  }, [isSignedIn]);

  // Fetch courses
  useEffect(() => {
    supabase.from('courses').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setCourses(data);
    });
  }, []);

  const courseId = courses?.[0]?.id;

  // Fetch course with units and lessons
  useEffect(() => {
    if (!courseId) return;
    supabase.from('courses').select(`
      *,
      units (
        *,
        lessons (*)
      )
    `).eq('id', courseId).order('order_index', { referencedTable: 'units', ascending: true }).single().then(({ data }) => {
      if (data) {
        setCourse({
          ...data,
          _id: data.id,
          units: (data.units || []).map((u: any) => ({
            ...u,
            _id: u.id,
            lessons: (u.lessons || []).map((l: any) => ({
              ...l,
              _id: l.id,
              quiz: undefined,
            })),
          })),
        });
      }
    });
  }, [courseId]);

  // Fetch user progress
  useEffect(() => {
    if (!supabaseUserId) return;
    supabase.from('user_progress').select('*').eq('user_id', supabaseUserId).then(({ data }) => {
      if (data) setProgress(data);
    });
  }, [supabaseUserId]);

  const mockUnits = [
    {
      _id: 'unit-1',
      title: 'UNIT 1: INTRODUCTION TO UI/UX',
      lessons: [
        { _id: 'l1', type: 'video' as const, title: '1.1 What is User Experience?', duration: '15 mins', youtube_id: 'SRec6L7TbRE', description: 'An introduction to the fundamental concepts of User Experience design.' },
        { _id: 'l2', type: 'video' as const, title: '1.2 Design Thinking Process', duration: '22 mins', youtube_id: 'UBVVV0GvK18', description: 'Understanding the 5 stages of design thinking.' },
        {
          _id: 'l-quiz-1',
          type: 'quiz' as const,
          title: '1.4 UI/UX Fundamentals Quiz',
          duration: '5 Questions',
          quiz: {
            _id: 'q1',
            title: 'UI/UX Fundamentals',
            questions: [
              { _id: 'q1-1', text: 'What does UX stand for?', options: ['User Experience', 'User Experiment', 'Universal Experience', 'User Extension'], correct: 0 },
              { _id: 'q1-2', text: 'Which of these is NOT a primary design principle?', options: ['Contrast', 'Repetition', 'Entropy', 'Proximity'], correct: 2 },
              { _id: 'q1-3', text: 'What is the first stage of the Design Thinking process?', options: ['Ideate', 'Define', 'Prototype', 'Empathize'], correct: 3 },
              { _id: 'q1-4', text: 'What is a "Wireframe" in UI design?', options: ['A high-fidelity mockup', 'A low-fidelity structural sketch', 'A final coded version', 'A user testing report'], correct: 1 },
              { _id: 'q1-5', text: 'Which tool is most commonly used for collaborative UI design?', options: ['Adobe Photoshop', 'Figma', 'Microsoft Word', 'Notepad++'], correct: 1 }
            ]
          }
        }
      ]
    }
  ];

  const units = (course?.units as Unit[]) || mockUnits;

  useEffect(() => {
    if (units.length > 0 && !currentLesson) {
      setCurrentLesson(units[0].lessons[0]);
      setCurrentUnit(units[0]);
      setExpandedUnits({ [units[0]._id]: true });
    }
  }, [units, currentLesson]);

  const isCompleted = (lessonId: string) => {
    return (progress as any)?.some((p: any) => (p.lessonId === lessonId || p.lesson_id === lessonId) && p.completed) || false;
  };

  const handleToggleComplete = async () => {
    if (!currentLesson || !supabaseUserId) return;
    const newStatus = !isCompleted(currentLesson._id);
    const sb = createClient();
    await sb.from('user_progress').upsert({
      user_id: supabaseUserId,
      lesson_id: currentLesson._id,
      completed: newStatus,
      completed_at: newStatus ? new Date().toISOString() : null,
    }, { onConflict: 'user_id, lesson_id' });
    setProgress((prev: any[]) => {
      const idx = prev.findIndex((p: any) => p.lesson_id === currentLesson._id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], completed: newStatus };
        return updated;
      }
      return [...prev, { user_id: supabaseUserId, lesson_id: currentLesson._id, completed: newStatus }];
    });
  };

  const handleLessonSelect = (unit: Unit, lesson: Lesson) => {
    setCurrentLesson(lesson);
    setCurrentUnit(unit);
    setQuizState({
      active: false,
      currentQuestionIndex: 0,
      answers: {},
      finished: false,
      score: 0
    });
    setAssignmentSubmitted(false);
    setAssignmentSubmission('');
    setMobileSidebarOpen(false);
  };

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const calculateProgress = () => {
    const total = units.reduce((acc, u) => acc + u.lessons.length, 0);
    const completed = (progress as any)?.filter((p: any) => p.completed).length || 0;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const startQuiz = () => {
    setQuizState(prev => ({ ...prev, active: true }));
  };

  const handleAnswerSelect = (qIdx: number, aIdx: number) => {
    setQuizState(prev => ({
      ...prev,
      answers: { ...prev.answers, [qIdx]: aIdx }
    }));
  };

  const nextQuestion = () => {
    if (currentLesson?.quiz && quizState.currentQuestionIndex < currentLesson.quiz.questions.length - 1) {
      setQuizState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (!currentLesson?.quiz) return;

    setLoading(true);
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: currentLesson._id,
          answers: quizState.answers,
        }),
      });

      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit quiz');
      }

      setQuizState((prev) => ({
        ...prev,
        finished: true,
        score: result.score,
      }));

      if (result.passed && supabaseUserId) {
        setProgress((prev: any[]) => {
          const exists = prev.some((p: any) => p.lesson_id === currentLesson._id);
          if (exists) {
            return prev.map((p: any) =>
              p.lesson_id === currentLesson._id ? { ...p, completed: true } : p
            );
          }
          return [...prev, { user_id: supabaseUserId, lesson_id: currentLesson._id, completed: true }];
        });
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentSubmit = async () => {
    if (!assignmentSubmission.trim()) return;
    setAssignmentSubmitted(true);
    if (supabaseUserId && currentLesson) {
      const sb = createClient();
      await sb.from('user_progress').upsert({
        user_id: supabaseUserId,
        lesson_id: currentLesson._id,
        completed: true,
        completed_at: new Date().toISOString(),
      }, { onConflict: 'user_id, lesson_id' });
      setProgress((prev: any[]) => [...prev, { user_id: supabaseUserId, lesson_id: currentLesson._id, completed: true }]);
    }
  };

  return (
    <div className={`portal-layout antialiased bg-brand-950 text-slate-200 selection:bg-accent-400/30 selection:text-white ${!sidebarOpen ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-sidebar-open' : ''}`}>
      {/* Backgrounds */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <Aurora colorStops={['#020617', '#007bff', '#00d2ff']} amplitude={1.0} blend={0.5} />
      </div>
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="ambient-orb bg-brand-400/20 w-[600px] h-[600px] -top-48 -left-24 animate-pulse-glow"></div>
      </div>

      <div className={`mobile-sidebar-overlay ${mobileSidebarOpen ? 'active' : ''}`} onClick={() => setMobileSidebarOpen(false)}></div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link href="/" className="logo">
            <Image src="/assets/logo.png" alt="CeTech" width={32} height={32} className="grayscale invert brightness-200" />
            <span><strong>CETECH</strong> ACADEMY</span>
          </Link>

          <div className="course-progress-container">
            <div className="progress-text">
              <span>Overall Progress</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="progress-bar-bg">
              <div className="progress-bar-fill" style={{ width: `${calculateProgress()}%` }}></div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {units.map((unit) => (
            <div key={unit._id} className="unit-container">
              <div className="unit-header" onClick={() => toggleUnit(unit._id)}>
                <div className="unit-title-area">
                  <h3>{unit.title}</h3>
                  <div className="unit-meta">
                    {unit.lessons.filter(l => isCompleted(l._id)).length}/{unit.lessons.length} Items
                  </div>
                </div>
                {expandedUnits[unit._id] ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
              </div>
              <div className={`unit-lessons ${expandedUnits[unit._id] ? 'expanded' : ''}`}>
                {unit.lessons.map((lesson) => (
                  <div
                    key={lesson._id}
                    className={`lesson-item ${currentLesson?._id === lesson._id ? 'active' : ''} ${isCompleted(lesson._id) ? 'completed' : ''}`}
                    onClick={() => handleLessonSelect(unit, lesson)}
                  >
                    {isCompleted(lesson._id) ? (
                      <CheckCircle className="w-4 h-4 lesson-icon text-emerald-500" />
                    ) : lesson.type === 'quiz' ? (
                      <HelpCircle className="w-4 h-4 lesson-icon" />
                    ) : lesson.type === 'assignment' ? (
                      <FileEdit className="w-4 h-4 lesson-icon" />
                    ) : (
                      <PlayCircle className="w-4 h-4 lesson-icon" />
                    )}
                    <div className="lesson-details">
                      <h4>{lesson.title}</h4>
                      <p>{lesson.duration || (lesson.type === 'video' ? 'Video' : lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1))}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="portal-content">
        <header className="video-header">
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/5 rounded-lg lg:hidden" onClick={() => setMobileSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-white/5 rounded-lg hidden lg:block" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <SidebarIcon className="w-5 h-5" />
            </button>
            <div>
              <div className="header-meta">{currentUnit?.title}</div>
              <h1>{currentLesson?.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentLesson?.type === 'video' && (
              <button
                onClick={handleToggleComplete}
                className={`duo-btn duo-btn-primary flex items-center gap-2 ${isCompleted(currentLesson._id) ? 'completed-btn' : ''}`}
                style={isCompleted(currentLesson._id) ? { backgroundColor: '#10b981', borderColor: '#059669', opacity: 0.8 } : {}}
              >
                {isCompleted(currentLesson._id) ? 'COMPLETED ✓' : 'MARK COMPLETE'}
              </button>
            )}
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center overflow-hidden">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt={user.firstName || 'User'} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-blue-400" />
              )}
            </div>
          </div>
        </header>

        <section className="main-content-section">
          {/* Video View */}
          {currentLesson?.type === 'video' && (
            <div className="video-player-container">
              <iframe
                src={`https://www.youtube.com/embed/${currentLesson.youtube_id}?rel=0&modestbranding=1`}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={currentLesson.title}
              ></iframe>
            </div>
          )}

          {/* Quiz View */}
          {currentLesson?.type === 'quiz' && (
            <div className="quiz-container">
              <div className="card bg-slate-900/50 backdrop-blur-xl border-slate-800">
                {!quizState.active && !quizState.finished ? (
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <HelpCircle className="w-8 h-8 text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{currentLesson.quiz?.title || 'Knowledge Check'}</h2>
                    <p className="text-slate-400 mb-8">{currentLesson.description || 'Test your understanding of the concepts covered in this module.'}</p>
                    <div className="flex justify-center gap-4 mb-8">
                      <div className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-semibold">
                        <span className="text-slate-500">QUESTIONS:</span> {currentLesson.quiz?.questions.length}
                      </div>
                      <div className="px-4 py-2 bg-slate-800 rounded-lg text-xs font-semibold">
                        <span className="text-slate-500">PASSING SCORE:</span> 70%
                      </div>
                    </div>
                    <button className="duo-btn duo-btn-primary" onClick={startQuiz}>Start Assessment</button>
                  </div>
                ) : quizState.active && !quizState.finished ? (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                        Question {quizState.currentQuestionIndex + 1} of {currentLesson.quiz?.questions.length}
                      </span>
                      <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${((quizState.currentQuestionIndex + 1) / (currentLesson.quiz?.questions.length || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-6">{currentLesson.quiz?.questions[quizState.currentQuestionIndex].text}</h3>
                      <div className="space-y-3">
                        {currentLesson.quiz?.questions[quizState.currentQuestionIndex].options.map((opt, idx) => (
                          <div
                            key={idx}
                            className={`option-item ${quizState.answers[quizState.currentQuestionIndex] === idx ? 'selected' : ''}`}
                            onClick={() => handleAnswerSelect(quizState.currentQuestionIndex, idx)}
                          >
                            <div className="option-radio"></div>
                            <span className="text-sm">{opt}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end mt-8">
                      <button
                        className="duo-btn duo-btn-primary"
                        onClick={nextQuestion}
                        disabled={quizState.answers[quizState.currentQuestionIndex] === undefined}
                      >
                        {quizState.currentQuestionIndex === (currentLesson.quiz?.questions.length || 0) - 1 ? 'Finish Quiz' : 'Next Question'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div
                      className="w-24 h-24 rounded-full border-4 flex items-center justify-center text-2xl font-bold mx-auto mb-4"
                      style={{
                        borderColor: quizState.score >= 70 ? '#10b981' : '#ef4444',
                        color: quizState.score >= 70 ? '#10b981' : '#ef4444',
                        boxShadow: `0 0 20px ${quizState.score >= 70 ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                      }}
                    >
                      {quizState.score}%
                    </div>
                    <h3 className="text-xl font-bold mb-2">{quizState.score >= 70 ? 'Assessment Passed!' : 'Assessment Failed'}</h3>
                    <p className="text-slate-400 mb-8">
                      {quizState.score >= 70
                        ? "Excellent work! You've mastered the concepts in this module."
                        : "You didn't reach the passing score of 70%. We recommend reviewing the content and trying again."}
                    </p>
                    <div className="flex justify-center gap-4">
                      <button className="duo-btn duo-btn-secondary" onClick={startQuiz}>Retake Quiz</button>
                      {quizState.score >= 70 && <button className="duo-btn duo-btn-primary" onClick={() => handleLessonSelect(currentUnit!, units[units.indexOf(currentUnit!)].lessons[units[units.indexOf(currentUnit!)].lessons.indexOf(currentLesson) + 1] || currentLesson)}>Continue</button>}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignment View */}
          {currentLesson?.type === 'assignment' && (
            <div className="quiz-container">
              <div className="card bg-slate-900/50 backdrop-blur-xl border-slate-800">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                    <FileEdit className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{currentLesson.title}</h2>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Submit your project for review</p>
                  </div>
                </div>

                <div className="prose prose-invert mb-8 max-w-none text-slate-300 text-sm leading-relaxed">
                  <p>{currentLesson.description || 'Apply the concepts you\'ve learned in this module to a real-world scenario.'}</p>
                </div>

                {!assignmentSubmitted ? (
                  <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50 mb-8">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">Submission Details</h4>
                    <textarea
                      value={assignmentSubmission}
                      onChange={(e) => setAssignmentSubmission(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-4 text-sm mb-4 min-h-[120px] focus:border-blue-500 focus:outline-none transition-colors"
                      placeholder="Enter your response, repository link, or project URL..."
                    ></textarea>
                    <div className="flex justify-end">
                      <button className="duo-btn duo-btn-primary" onClick={handleAssignmentSubmit}>
                        <Send className="w-4 h-4 mr-2" />
                        Submit Work
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-3">
                     <CheckCircle className="w-5 h-5 text-emerald-400" />
                     <span className="text-sm font-medium text-emerald-400">Assignment submitted successfully!</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        <div className="content-area">
          <nav className="tabs">
            {['overview', 'resources', 'discussions', 'certificate'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`}>
            <div className="prose max-w-none">
              <h3>Lesson Description</h3>
              <p>{currentLesson?.description || 'Welcome to this lesson!'}</p>

              <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-4">What you'll learn</h4>
                  <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex gap-3"><CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Industry standard best practices</li>
                    <li className="flex gap-3"><CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Practical implementation strategies</li>
                    <li className="flex gap-3"><CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Common pitfalls and how to avoid them</li>
                  </ul>
                </div>
                <div className="card">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-4">Lesson Notes</h4>
                  <textarea className="w-full h-32 bg-transparent border-none resize-none text-sm text-slate-300 focus:outline-none" placeholder="Add your personal notes here..."></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'resources' ? 'active' : ''}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Course Guide.pdf</h4>
                    <p className="text-xs text-slate-500">2.4 MB • PDF Document</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-full text-blue-400">
                  <Download className="w-5 h-5" />
                </button>
              </div>
              <div className="card flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Code className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">Source Code Template</h4>
                    <p className="text-xs text-slate-500">1.1 MB • ZIP Archive</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-full text-blue-400">
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'discussions' ? 'active' : ''}`}>
            <div className="card mb-8">
              <h4 className="font-semibold mb-6">Join the Discussion</h4>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0"></div>
                <div className="flex-grow">
                  <textarea className="w-full bg-slate-800 border border-slate-700 rounded-lg p-4 text-sm focus:border-blue-500 focus:outline-none min-h-[100px]" placeholder="Ask a question or share your thoughts..."></textarea>
                  <div className="mt-4 flex justify-end">
                    <button className="duo-btn duo-btn-primary">Post Comment</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-blue-400">JD</span>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold">John Doe</span>
                    <span className="text-xs text-slate-500">2 hours ago</span>
                  </div>
                  <p className="text-sm text-slate-400">Great lesson! The part about WebGL optimization was particularly helpful for my current project.</p>
                </div>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'certificate' ? 'active' : ''}`}>
            <div className="card text-center py-16">
              <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-8">
                <Award className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Course Completion Certificate</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-12">
                Complete all lessons in the course to unlock your professional certificate of completion.
              </p>
              <div className="relative max-w-lg mx-auto grayscale opacity-50">
                <div className="aspect-[1.414/1] bg-slate-800 rounded-lg border-2 border-dashed border-slate-700 flex items-center justify-center">
                  <span className="text-slate-600 font-bold uppercase tracking-widest">Locked</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                   <div className="px-6 py-3 bg-slate-900 border border-slate-700 rounded-full text-sm font-bold flex items-center gap-2">
                     <Lock className="w-4 h-4" />
                     {100 - calculateProgress()}% Remaining
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .portal-layout {
          display: grid;
          grid-template-columns: 320px 1fr;
          height: 100vh;
          transition: grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .portal-layout.collapsed {
          grid-template-columns: 0px 1fr;
        }

        .sidebar {
          background-color: #070b14;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          z-index: 50;
          height: 100vh;
        }

        .sidebar-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          position: sticky;
          top: 0;
          background-color: #0f172a;
          z-index: 10;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #f8fafc;
          text-decoration: none;
          margin-bottom: 32px;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
        }

        .course-progress-container {
          background: rgba(255, 255, 255, 0.05);
          padding: 16px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 20px;
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          font-size: 0.65rem;
          color: #94a3b8;
          margin-bottom: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .progress-bar-bg {
          width: 100%;
          height: 12px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #007bff, #00d2ff);
          border-radius: 3px;
          transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 10px rgba(0, 123, 255, 0.4);
        }

        .unit-container {
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.2);
        }

        .unit-header {
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .unit-header:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .unit-title-area h3 {
          font-size: 0.9rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          margin: 0;
          color: #ffffff;
        }

        .unit-meta {
          font-size: 0.7rem;
          color: #475569;
          margin-top: 2px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .unit-lessons {
          max-height: 0;
          overflow: hidden;
          background: transparent;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .unit-lessons.expanded {
          max-height: 2000px;
        }

        .lesson-item {
          padding: 12px 24px;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
          background: transparent;
        }

        .lesson-item:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .lesson-item.active {
          background: #111827;
          border-left: 3px solid #00d2ff;
          padding-left: 21px;
        }

        .lesson-icon {
          color: #334155;
          flex-shrink: 0;
        }

        .lesson-item.active .lesson-icon {
          color: #00d2ff;
        }

        .lesson-details h4 {
          margin: 0;
          font-size: 0.8rem;
          color: #475569;
          font-weight: 600;
        }

        .lesson-item.active .lesson-details h4 {
          color: #e2e8f0;
        }

        .lesson-details p {
          margin: 4px 0 0 0;
          font-size: 0.7rem;
          color: #334155;
          font-weight: 500;
        }

        .portal-content {
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          height: 100vh;
          background-color: #020617;
        }

        .video-header {
          height: 80px;
          padding: 0 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          background: #000000;
          position: sticky;
          top: 0;
          z-index: 40;
        }

        .video-header h1 {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #ffffff;
        }

        .header-meta {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.02em;
          color: #00d2ff;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .main-content-section {
          background: #000;
          width: 100%;
          position: relative;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          min-height: 400px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .video-player-container {
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
          aspect-ratio: 16/9;
          position: relative;
        }

        .quiz-container {
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
          padding: 40px 20px;
        }

        .card {
          background: #0f172a;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 32px;
        }

        .option-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .option-item:hover {
          background: rgba(0, 123, 255, 0.05);
          border-color: rgba(0, 123, 255, 0.3);
        }

        .option-item.selected {
          background: rgba(0, 123, 255, 0.1);
          border-color: #007bff;
        }

        .option-radio {
          width: 20px;
          height: 20px;
          border: 2px solid #94a3b8;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .option-item.selected .option-radio {
          border-color: #007bff;
          background: #007bff;
        }

        .option-item.selected .option-radio::after {
          content: '';
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        }

        .content-area {
          padding: 48px 32px;
          max-width: 1000px;
          margin: 0 auto;
          width: 100%;
        }

        .tabs {
          display: flex;
          gap: 40px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          margin-bottom: 40px;
        }

        .tab-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 16px 0;
          cursor: pointer;
          position: relative;
          transition: color 0.3s;
        }

        .tab-btn.active {
          color: #007bff;
        }

        .tab-btn.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 3px;
          background: #007bff;
          border-radius: 3px 3px 0 0;
          box-shadow: 0 -4px 12px rgba(0, 123, 255, 0.5);
        }

        .tab-content {
          display: none;
        }

        .tab-content.active {
          display: block;
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .mobile-sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 45;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 1024px) {
          .portal-layout {
            grid-template-columns: 0px 1fr;
          }
          .sidebar {
            position: fixed;
            left: -320px;
            width: 320px;
            transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .portal-layout.mobile-sidebar-open .sidebar {
            left: 0;
          }
          .mobile-sidebar-overlay.active {
            display: block;
          }
          .video-header {
            padding: 0 16px;
          }
          .content-area {
            padding: 32px 16px;
          }
          .tabs {
            gap: 20px;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
