
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Supabase Initialization
const getEnv = (key) => {
    try {
        // Try Vite's import.meta.env
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
            return import.meta.env[key];
        }
        // Fallback to process.env (for some builders)
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
    } catch (e) {}
    return '';
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || 'https://kohlegvunumiwxbhfbwb.supabase.co';
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtvaGxlZ3Z1bnVtaXd4YmhmYndiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODEyOTcsImV4cCI6MjA5MzA1NzI5N30.1A-ykiNp6KVZ9lfo0kd1xW157KJtukiTe7DUAE6uVf0';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State Management
let state = {
    user: null,
    profile: null,
    course: null,
    units: [],
    currentLesson: null,
    progress: [],
    notes: {},
    quiz: {
        currentQuestionIndex: 0,
        questions: [],
        answers: {},
        score: 0
    }
};

// DOM Elements
const elements = {
    player: document.getElementById('main-video-player'),
    lessonTitle: document.getElementById('header-lesson-title'),
    unitTitle: document.getElementById('header-unit-title'),
    curriculumContainer: document.getElementById('curriculum-container'),
    completeBtn: document.getElementById('mark-complete-btn'),
    description: document.getElementById('lesson-description'),
    progressPercent: document.getElementById('progress-percent'),
    progressBar: document.getElementById('progress-bar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    sidebarToggleDesktop: document.getElementById('sidebarToggleDesktop'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    portalLayout: document.getElementById('portalLayout'),
    notesTextarea: document.getElementById('notes-textarea'),

    // Views
    videoView: document.getElementById('video-view'),
    youtubeContainer: document.getElementById('youtube-player-container'),
    youtubePlayer: document.getElementById('youtube-player'),
    quizView: document.getElementById('quiz-view'),
    assignmentView: document.getElementById('assignment-view'),

    // Quiz Elements
    quizIntro: document.getElementById('quiz-intro'),
    quizQuestions: document.getElementById('quiz-questions'),
    quizResults: document.getElementById('quiz-results'),
    quizTitle: document.getElementById('quiz-title'),
    quizDescription: document.getElementById('quiz-description'),
    quizQCount: document.getElementById('quiz-q-count'),
    startQuizBtn: document.getElementById('start-quiz-btn'),
    questionNumber: document.getElementById('question-number'),
    quizProgressBar: document.getElementById('quiz-progress-bar'),
    currentQuestionContainer: document.getElementById('current-question-container'),
    nextQBtn: document.getElementById('next-q-btn'),
    quizScoreCircle: document.getElementById('quiz-score-circle'),
    quizStatus: document.getElementById('quiz-status'),
    quizFeedback: document.getElementById('quiz-feedback'),
    retakeQuizBtn: document.getElementById('retake-quiz-btn'),
    finishQuizBtn: document.getElementById('finish-quiz-btn'),

    // Assignment Elements
    assignmentTitle: document.getElementById('assignment-title'),
    assignmentDescription: document.getElementById('assignment-description'),
    submitAssignmentBtn: document.getElementById('submit-assignment-btn'),
    assignmentStatus: document.getElementById('assignment-status'),
    assignmentSubmissionText: document.getElementById('assignment-submission-text')
};

// Security Helper: Escape HTML
function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Initialize Portal
async function init() {
    try {
        // 1. Check Auth (Mocked or Real)
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.warn('User not authenticated, redirecting to login');
            // window.location.href = '/login.html';
            // return;
        }
        state.user = user || { id: 'mock-user-id' };

        // 2. Fetch Course Data
        await fetchCourseData();
        
        // 3. Setup Listeners
        setupEventListeners();
        
        // 4. Initial Render
        renderCurriculum();
        updateOverallProgress();
        
        // 5. Load Initial Lesson
        loadInitialLesson();

    } catch (error) {
        console.error('Initialization error:', error);
    }
}

async function fetchCourseData() {
    // Mock units if Supabase fails or is empty for testing
    const mockUnits = [
        {
            id: 'unit-1',
            title: 'UNIT 1: INTRODUCTION',
            lessons: [
                { id: 'l1', type: 'video', title: '1.1 What is User Experience?', duration: '15 mins', youtube_id: '3c9E6D0YvVk', description: 'An introduction to the fundamental concepts of User Experience design.' },
                { id: 'l2', type: 'video', title: '1.2 Design Thinking Process', duration: '22 mins', youtube_id: 'O64_60_D6YQ', description: 'Understanding the 5 stages of design thinking: Empathize, Define, Ideate, Prototype, Test.' },
                { id: 'l3', type: 'video', title: '1.3 Wireframing Basics', duration: '18 mins', youtube_id: '9mN410r66vE', description: 'How to sketch out your digital interfaces quickly and effectively.' },
                {
                    id: 'l-quiz-1',
                    type: 'quiz',
                    title: '1.4 UI/UX Fundamentals Quiz',
                    duration: '5 Questions',
                    description: 'Test your knowledge on the basics of design thinking and user experience.',
                    quiz: {
                        id: 'q1',
                        title: 'UI/UX Fundamentals',
                        questions: [
                            {
                                id: 'q1-1',
                                text: 'What does UX stand for?',
                                options: ['User Experience', 'User Experiment', 'Universal Experience', 'User Extension'],
                                correct: 0
                            },
                            {
                                id: 'q1-2',
                                text: 'Which of these is NOT a primary design principle?',
                                options: ['Contrast', 'Repetition', 'Entropy', 'Proximity'],
                                correct: 2
                            },
                            {
                                id: 'q1-3',
                                text: 'What is the first stage of the Design Thinking process?',
                                options: ['Ideate', 'Define', 'Prototype', 'Empathize'],
                                correct: 3
                            },
                            {
                                id: 'q1-4',
                                text: 'What is a "Wireframe" in UI design?',
                                options: ['A high-fidelity mockup', 'A low-fidelity structural sketch', 'A final coded version', 'A user testing report'],
                                correct: 1
                            },
                            {
                                id: 'q1-5',
                                text: 'Which tool is most commonly used for collaborative UI design?',
                                options: ['Adobe Photoshop', 'Figma', 'Microsoft Word', 'Notepad++'],
                                correct: 1
                            }
                        ]
                    }
                }
            ]
        },
        {
            id: 'unit-2',
            title: 'UNIT 2: ADVANCED PROTOTYPING',
            lessons: [
                { id: 'l4', type: 'video', title: '2.1 Interactive Components', duration: '22 mins', youtube_id: '4X_T88Kz_9o', description: 'Learn how to create reusable interactive components in Figma.' },
                {
                    id: 'l-asgn-1',
                    type: 'assignment',
                    title: '2.2 Figma Prototype Submission',
                    duration: 'Assignment',
                    description: 'Create a high-fidelity prototype of a mobile login screen and submit the Figma link for review.'
                }
            ]
        }
    ];

    try {
        const { data: units, error: unitsError } = await supabase
            .from('units')
            .select('*, lessons(*)')
            .order('order_index');

        if (!unitsError && units && units.length > 0) {
            // Fetch quizzes and assignments for each lesson if they exist
            state.units = units;
        } else {
            state.units = mockUnits;
        }

        const { data: progress, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', state.user.id);

        state.progress = progress || [];
    } catch (e) {
        state.units = mockUnits;
        state.progress = [];
    }
}

function setupEventListeners() {
    // Mobile Sidebar Toggle
    elements.sidebarToggle?.addEventListener('click', () => {
        elements.portalLayout.classList.add('mobile-sidebar-open');
        elements.sidebarOverlay.classList.add('active');
    });

    elements.sidebarOverlay?.addEventListener('click', () => {
        elements.portalLayout.classList.remove('mobile-sidebar-open');
        elements.sidebarOverlay.classList.remove('active');
    });

    // Desktop Sidebar Toggle
    elements.sidebarToggleDesktop?.addEventListener('click', () => {
        elements.portalLayout.classList.toggle('collapsed');
    });

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.target);
            if (target) target.classList.add('active');
        });
    });

    // Mark Complete
    elements.completeBtn?.addEventListener('click', toggleLessonCompletion);

    // Notes Auto-save
    let debounceTimer;
    elements.notesTextarea?.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            console.log('Notes auto-saved locally');
        }, 1000);
    });

    // Quiz Events
    elements.startQuizBtn?.addEventListener('click', startQuiz);
    elements.nextQBtn?.addEventListener('click', nextQuestion);
    elements.retakeQuizBtn?.addEventListener('click', startQuiz);
    elements.finishQuizBtn?.addEventListener('click', () => toggleLessonCompletion(true));

    // Assignment Events
    elements.submitAssignmentBtn?.addEventListener('click', submitAssignment);
}

function renderCurriculum() {
    elements.curriculumContainer.innerHTML = '';
    
    state.units.forEach((unit, uIdx) => {
        const isExpanded = state.currentLesson ? unit.lessons.some(l => l.id === state.currentLesson.id) : uIdx === 0;
        const unitEl = document.createElement('div');
        unitEl.className = 'unit-container';
        
        const completedCount = unit.lessons.filter(l => 
            state.progress.find(p => p.lesson_id === l.id && p.completed)
        ).length;

        unitEl.innerHTML = `
            <div class="unit-header" data-unit-id="${unit.id}">
                <div class="unit-title-area">
                    <h3>${escapeHTML(unit.title)}</h3>
                    <div class="unit-meta">${completedCount}/${unit.lessons.length} Items</div>
                </div>
                <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4 text-muted"></i>
            </div>
            <div class="unit-lessons ${isExpanded ? 'expanded' : ''}">
                ${unit.lessons.map(lesson => {
                    let icon = 'play-circle';
                    if (lesson.type === 'quiz') icon = 'help-circle';
                    if (lesson.type === 'assignment') icon = 'file-edit';
                    if (isLessonCompleted(lesson.id)) icon = 'check-circle';

                    return `
                    <div class="lesson-item ${state.currentLesson?.id === lesson.id ? 'active' : ''} ${isLessonCompleted(lesson.id) ? 'completed' : ''}" data-lesson-id="${lesson.id}">
                        <i data-lucide="${icon}" class="w-4 h-4 lesson-icon"></i>
                        <div class="lesson-details">
                            <h4>${escapeHTML(lesson.title)}</h4>
                            <p>${escapeHTML(lesson.duration) || 'Video'}</p>
                        </div>
                    </div>
                `}).join('')}
            </div>
        `;

        // Lesson Click
        unitEl.querySelectorAll('.lesson-item').forEach(item => {
            item.addEventListener('click', () => {
                const lessonId = item.dataset.lessonId;
                const lesson = unit.lessons.find(l => l.id === lessonId);
                loadLesson(unit, lesson);
                
                // Close mobile sidebar after selection
                elements.portalLayout.classList.remove('mobile-sidebar-open');
                elements.sidebarOverlay.classList.remove('active');
            });
        });

        // Unit Toggle
        unitEl.querySelector('.unit-header').addEventListener('click', () => {
            const lessonsDiv = unitEl.querySelector('.unit-lessons');
            const icon = unitEl.querySelector('[data-lucide]');
            const isExpanding = !lessonsDiv.classList.contains('expanded');
            
            lessonsDiv.classList.toggle('expanded');
            icon.setAttribute('data-lucide', isExpanding ? 'chevron-up' : 'chevron-down');
            if (window.lucide) window.lucide.createIcons();
        });

        elements.curriculumContainer.appendChild(unitEl);
    });

    if (window.lucide) window.lucide.createIcons();
}

function loadLesson(unit, lesson) {
    if (state.currentLesson?.id === lesson.id) return;
    
    state.currentLesson = lesson;
    
    // UI Transitions
    elements.videoView.classList.add('hidden');
    elements.quizView.classList.add('hidden');
    elements.assignmentView.classList.add('hidden');
    elements.completeBtn.classList.remove('hidden');

    if (lesson.type === 'quiz') {
        showQuizView(lesson);
    } else if (lesson.type === 'assignment') {
        showAssignmentView(lesson);
    } else {
        showVideoView(lesson);
    }

    elements.lessonTitle.textContent = lesson.title;
    elements.unitTitle.textContent = unit.title;
    elements.description.textContent = lesson.description || 'Welcome to this lesson! In this session, we\'ll dive deep into the core concepts.';
    
    // Update active class
    document.querySelectorAll('.lesson-item').forEach(el => {
        el.classList.toggle('active', el.dataset.lessonId === lesson.id);
    });

    // Check if completed
    const completed = isLessonCompleted(lesson.id);
    updateCompleteBtnUI(completed);
}

function showVideoView(lesson) {
    elements.videoView.classList.remove('hidden');

    // Hide both players initially
    elements.player.classList.add('hidden');
    elements.youtubeContainer.classList.add('hidden');
    elements.youtubePlayer.src = '';

    if (lesson.mux_playback_id) {
        elements.player.classList.remove('hidden');
        elements.player.playbackId = lesson.mux_playback_id;
        elements.player.play().catch(() => {});
    } else if (lesson.youtube_id) {
        elements.youtubeContainer.classList.remove('hidden');
        elements.youtubePlayer.src = `https://www.youtube.com/embed/${lesson.youtube_id}?autoplay=1&mute=1&rel=0`;
    } else if (lesson.youtube_url) {
        const id = extractYouTubeId(lesson.youtube_url);
        if (id) {
            elements.youtubeContainer.classList.remove('hidden');
            elements.youtubePlayer.src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0`;
        }
    }

    if (window.lucide) window.lucide.createIcons();
}

function extractYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

function showQuizView(lesson) {
    elements.quizView.classList.remove('hidden');
    elements.completeBtn.classList.add('hidden');
    elements.quizIntro.classList.remove('hidden');
    elements.quizQuestions.classList.add('hidden');
    elements.quizResults.classList.add('hidden');

    elements.quizTitle.textContent = lesson.quiz?.title || lesson.title;
    elements.quizDescription.textContent = lesson.description || 'Test your understanding of the concepts covered in this module.';
    elements.quizQCount.textContent = lesson.quiz?.questions?.length || 0;

    if (window.lucide) window.lucide.createIcons();
}

function showAssignmentView(lesson) {
    elements.assignmentView.classList.remove('hidden');
    elements.assignmentTitle.textContent = lesson.title;
    elements.assignmentDescription.textContent = lesson.description || 'Apply the concepts you\'ve learned in this module to a real-world scenario.';
    elements.assignmentStatus.classList.add('hidden');
    elements.assignmentSubmissionText.value = '';

    if (window.lucide) window.lucide.createIcons();
}

// Quiz Logic
function startQuiz() {
    if (!state.currentLesson || !state.currentLesson.quiz) return;

    state.quiz.questions = state.currentLesson.quiz.questions;
    state.quiz.currentQuestionIndex = 0;
    state.quiz.answers = {};

    elements.quizIntro.classList.add('hidden');
    elements.quizResults.classList.add('hidden');
    elements.quizQuestions.classList.remove('hidden');

    renderQuestion();
}

function renderQuestion() {
    const question = state.quiz.questions[state.quiz.currentQuestionIndex];
    elements.questionNumber.textContent = `Question ${state.quiz.currentQuestionIndex + 1} of ${state.quiz.questions.length}`;

    const progress = ((state.quiz.currentQuestionIndex + 1) / state.quiz.questions.length) * 100;
    elements.quizProgressBar.style.width = `${progress}%`;

    elements.currentQuestionContainer.innerHTML = `
        <h3 class="text-lg font-semibold mb-6">${escapeHTML(question.text)}</h3>
        <div class="space-y-3">
            ${question.options.map((opt, idx) => `
                <div class="option-item ${state.quiz.answers[state.quiz.currentQuestionIndex] === idx ? 'selected' : ''}" data-index="${idx}">
                    <div class="option-radio"></div>
                    <span class="text-sm">${escapeHTML(opt)}</span>
                </div>
            `).join('')}
        </div>
    `;

    // Add click listeners to options
    elements.currentQuestionContainer.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            state.quiz.answers[state.quiz.currentQuestionIndex] = index;
            renderQuestion();
        });
    });

    // Update button text
    elements.nextQBtn.textContent = state.quiz.currentQuestionIndex === state.quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question';
}

function nextQuestion() {
    if (state.quiz.answers[state.quiz.currentQuestionIndex] === undefined) {
        alert('Please select an answer before continuing.');
        return;
    }

    if (state.quiz.currentQuestionIndex < state.quiz.questions.length - 1) {
        state.quiz.currentQuestionIndex++;
        renderQuestion();
    } else {
        finishQuiz();
    }
}

async function finishQuiz() {
    let correctCount = 0;
    state.quiz.questions.forEach((q, idx) => {
        if (state.quiz.answers[idx] === q.correct) correctCount++;
    });

    const score = Math.round((correctCount / state.quiz.questions.length) * 100);
    state.quiz.score = score;

    elements.quizQuestions.classList.add('hidden');
    elements.quizResults.classList.remove('hidden');

    elements.quizScoreCircle.textContent = `${score}%`;
    elements.quizScoreCircle.style.borderColor = score >= 70 ? '#10b981' : '#ef4444';
    elements.quizScoreCircle.style.color = score >= 70 ? '#10b981' : '#ef4444';

    elements.quizStatus.textContent = score >= 70 ? 'Assessment Passed!' : 'Assessment Failed';
    elements.quizFeedback.textContent = score >= 70
        ? "Excellent work! You've mastered the concepts in this module."
        : "You didn't reach the passing score of 70%. We recommend reviewing the content and trying again.";

    // Automatically mark as complete if passed
    if (score >= 70) {
        await toggleLessonCompletion(true);
    }

    if (window.lucide) window.lucide.createIcons();
}

async function submitAssignment() {
    const content = elements.assignmentSubmissionText.value;
    if (!content.trim()) {
        alert('Please enter your submission before sending.');
        return;
    }

    elements.submitAssignmentBtn.disabled = true;
    elements.submitAssignmentBtn.textContent = 'Submitting...';

    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    elements.assignmentStatus.classList.remove('hidden');
    elements.submitAssignmentBtn.classList.add('hidden');

    // Also mark as complete
    await toggleLessonCompletion(true);
}

function loadInitialLesson() {
    if (state.units.length > 0 && state.units[0].lessons.length > 0) {
        loadLesson(state.units[0], state.units[0].lessons[0]);
    }
}

async function toggleLessonCompletion(forceStatus = null) {
    if (!state.currentLesson) return;
    
    const isCurrentlyCompleted = isLessonCompleted(state.currentLesson.id);
    const newStatus = forceStatus !== null ? forceStatus : !isCurrentlyCompleted;

    // If it's already completed and we are trying to mark it complete again (e.g. quiz pass), skip
    if (forceStatus === true && isCurrentlyCompleted) return;

    try {
        await supabase
            .from('user_progress')
            .upsert({
                user_id: state.user.id,
                lesson_id: state.currentLesson.id,
                completed: newStatus
            }, { onConflict: 'user_id,lesson_id' });

        // Update local state
        const progIdx = state.progress.findIndex(p => p.lesson_id === state.currentLesson.id);
        if (progIdx > -1) {
            state.progress[progIdx].completed = newStatus;
        } else {
            state.progress.push({ lesson_id: state.currentLesson.id, completed: newStatus });
        }

        updateCompleteBtnUI(newStatus);
        renderCurriculum();
        updateOverallProgress();
        
    } catch (error) {
        console.error('Error updating progress:', error);
        // Fallback for local testing if Supabase isn't configured
        const progIdx = state.progress.findIndex(p => p.lesson_id === state.currentLesson.id);
        if (progIdx > -1) {
            state.progress[progIdx].completed = newStatus;
        } else {
            state.progress.push({ lesson_id: state.currentLesson.id, completed: newStatus });
        }
        updateCompleteBtnUI(newStatus);
        renderCurriculum();
        updateOverallProgress();
    }
}

function updateCompleteBtnUI(completed) {
    if (!elements.completeBtn) return;
    
    if (completed) {
        elements.completeBtn.textContent = 'COMPLETED ✓';
        elements.completeBtn.style.opacity = '1';
        elements.completeBtn.style.setProperty('--btn-face', '#10b981');
    } else {
        elements.completeBtn.textContent = 'MARK COMPLETE';
        elements.completeBtn.style.opacity = '1';
        elements.completeBtn.style.setProperty('--btn-face', '#007bff');
    }
}

function updateOverallProgress() {
    const totalLessons = state.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
    const completedLessons = state.progress.filter(p => p.completed).length;
    const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    
    elements.progressPercent.textContent = `${percent}%`;
    elements.progressBar.style.width = `${percent}%`;
}

function isLessonCompleted(id) {
    return state.progress.some(p => p.lesson_id === id && p.completed);
}

// Start
document.addEventListener('DOMContentLoaded', init);
