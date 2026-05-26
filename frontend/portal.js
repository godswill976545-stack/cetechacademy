// Convex Client Initialization
const getEnv = (key) => {
    try {
        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
            return import.meta.env[key];
        }
        if (typeof process !== 'undefined' && process.env && process.env[key]) {
            return process.env[key];
        }
    } catch (e) {}
    return '';
};

const CONVEX_URL = getEnv('VITE_CONVEX_URL') || '';

let convexClient = null;

async function getConvex() {
    if (convexClient) return convexClient;
    if (!CONVEX_URL) {
        console.error('VITE_CONVEX_URL not configured');
        return null;
    }
    const { ConvexClient } = await import('convex/browser');
    convexClient = new ConvexClient(CONVEX_URL);
    return convexClient;
}

let currentUser = null;

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
    youtubeContainer: document.getElementById('youtube-player'),
    youtubePlaceholder: document.getElementById('youtube-placeholder'),
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

// Security Helper: Sanitize Input
function sanitizeInput(str) {
    if (!str) return '';
    return str.trim().replace(/[<>]/g, '');
}

// Initialize Portal
async function init() {
    try {
        // 1. Security Guard: Check for OTP Verification
        if (localStorage.getItem('user_verified') !== 'true') {
            console.warn('User not verified, redirecting to verification page');
            window.location.href = '../verify.html';
            return;
        }

        // 2. Get Convex client
        const client = await getConvex();
        if (!client) {
            console.warn('Convex not configured, loading mock data');
            loadMockData();
            return;
        }

        // 3. Get stored user
        const storedUser = localStorage.getItem('cetech_user');
        if (!storedUser) {
            console.warn('User not authenticated, redirecting to login');
            window.location.href = '../login.html';
            return;
        }

        currentUser = JSON.parse(storedUser);
        state.user = currentUser;

        // 4. Fetch Course Data from Convex
        await fetchCourseData(client);

        // 5. Setup Listeners
        setupEventListeners();

        // 6. Initial Render
        renderCurriculum();
        updateOverallProgress();

        // 7. Load Initial Lesson
        loadInitialLesson();

    } catch (error) {
        console.error('Initialization error:', error);
        loadMockData();
    }
}

function loadMockData() {
    state.units = getMockUnits();
    setupEventListeners();
    renderCurriculum();
    updateOverallProgress();
    loadInitialLesson();
}

function getMockUnits() {
    return [
        {
            _id: 'unit-1',
            title: 'UNIT 1: INTRODUCTION TO UI/UX',
            lessons: [
                { _id: 'l1', type: 'video', title: '1.1 What is User Experience?', duration: '15 mins', youtube_id: 'SRec6L7TbRE', description: 'An introduction to the fundamental concepts of User Experience design. Learn what UX means and why it matters.' },
                { _id: 'l2', type: 'video', title: '1.2 Design Thinking Process', duration: '22 mins', youtube_id: 'UBVVV0GvK18', description: 'Understanding the 5 stages of design thinking: Empathize, Define, Ideate, Prototype, Test.' },
                { _id: 'l3', type: 'video', title: '1.3 Wireframing Basics', duration: '18 mins', youtube_id: 's3BjaX3xrOA', description: 'How to sketch out your digital interfaces quickly and effectively using wireframes.' },
                {
                    _id: 'l-quiz-1',
                    type: 'quiz',
                    title: '1.4 UI/UX Fundamentals Quiz',
                    duration: '5 Questions',
                    description: 'Test your knowledge on the basics of design thinking and user experience.',
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
        },
        {
            _id: 'unit-2',
            title: 'UNIT 2: DESIGN TOOLS & PROTOTYPING',
            lessons: [
                { _id: 'l4', type: 'video', title: '2.1 Getting Started with Figma', duration: '25 mins', youtube_id: 'FTFaQWZBqQ8', description: 'A complete beginner guide to Figma — the industry standard tool for UI design and prototyping.' },
                { _id: 'l5', type: 'video', title: '2.2 Building Interactive Prototypes', duration: '20 mins', youtube_id: 'dTb5uFPxwE0', description: 'Learn how to create clickable, interactive prototypes in Figma to test your designs.' },
                {
                    _id: 'l-asgn-1',
                    type: 'assignment',
                    title: '2.3 Figma Prototype Submission',
                    duration: 'Assignment',
                    description: 'Create a high-fidelity prototype of a mobile login screen and submit the Figma link for review.'
                }
            ]
        },
        {
            _id: 'unit-3',
            title: 'UNIT 3: UI DESIGN PRINCIPLES',
            lessons: [
                { _id: 'l6', type: 'video', title: '3.1 Color Theory for UI', duration: '18 mins', youtube_id: 'KkMH0wLhMIQ', description: 'Master color theory and learn how to create beautiful, accessible color palettes for your interfaces.' },
                { _id: 'l7', type: 'video', title: '3.2 Typography in Digital Design', duration: '16 mins', youtube_id: 'hnCmSXCZEpU', description: 'Understanding typefaces, font pairing, and how typography impacts user readability and experience.' },
                { _id: 'l8', type: 'video', title: '3.3 Layout & Spacing Systems', duration: '14 mins', youtube_id: '2xTbLYsFoGg', description: 'Learn about grids, spacing, and visual hierarchy to create clean, balanced layouts.' },
                {
                    _id: 'l-quiz-2',
                    type: 'quiz',
                    title: '3.4 Design Principles Quiz',
                    duration: '5 Questions',
                    description: 'Test your understanding of color theory, typography, and layout systems.',
                    quiz: {
                        _id: 'q2',
                        title: 'UI Design Principles',
                        questions: [
                            { _id: 'q2-1', text: 'What is the 60-30-10 rule in color theory?', options: ['A font sizing rule', 'A color distribution guideline', 'A spacing system', 'A grid layout rule'], correct: 1 },
                            { _id: 'q2-2', text: 'What is "leading" in typography?', options: ['Font weight', 'Space between characters', 'Space between lines of text', 'Font size'], correct: 2 },
                            { _id: 'q2-3', text: 'Which grid system is most commonly used in web design?', options: ['3-column', '5-column', '12-column', '16-column'], correct: 2 },
                            { _id: 'q2-4', text: 'What is "white space" in design?', options: ['Empty background color', 'Negative space between elements', 'A white UI theme', 'Blank pages'], correct: 1 },
                            { _id: 'q2-5', text: 'Which font pairing principle creates the best visual contrast?', options: ['Two serif fonts', 'Two sans-serif fonts', 'Serif + Sans-serif', 'Script + Display'], correct: 2 }
                        ]
                    }
                }
            ]
        }
    ];
}

async function fetchCourseData(client) {
    const mockUnits = getMockUnits();

    try {
        const courseData = await client.query('courses/queries:listCourses');
        if (courseData && courseData.length > 0) {
            const courseId = courseData[0]._id;
            const course = await client.query('courses/queries:getCourse', { courseId });

            if (course && course.units && course.units.length > 0) {
                state.units = course.units.map(unit => ({
                    ...unit,
                    lessons: unit.lessons.map(lesson => ({
                        ...lesson,
                        quiz: null,
                    })),
                }));

                const progress = await client.query('progress/queries:getUserProgress', { userId: currentUser._id });
                state.progress = progress || [];
                return;
            }
        }

        state.units = mockUnits;
        state.progress = [];
    } catch (e) {
        console.warn('Failed to fetch from Convex, using mock data:', e);
        state.units = mockUnits;
        state.progress = [];
    }
}

function setupEventListeners() {
    elements.sidebarToggle?.addEventListener('click', () => {
        elements.portalLayout.classList.add('mobile-sidebar-open');
        elements.sidebarOverlay.classList.add('active');
    });

    elements.sidebarOverlay?.addEventListener('click', () => {
        elements.portalLayout.classList.remove('mobile-sidebar-open');
        elements.sidebarOverlay.classList.remove('active');
    });

    elements.sidebarToggleDesktop?.addEventListener('click', () => {
        elements.portalLayout.classList.toggle('collapsed');
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const target = document.getElementById(btn.dataset.target);
            if (target) target.classList.add('active');
        });
    });

    elements.completeBtn?.addEventListener('click', toggleLessonCompletion);

    let debounceTimer;
    elements.notesTextarea?.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            console.log('Notes auto-saved locally');
        }, 1000);
    });

    elements.startQuizBtn?.addEventListener('click', startQuiz);
    elements.nextQBtn?.addEventListener('click', nextQuestion);
    elements.retakeQuizBtn?.addEventListener('click', startQuiz);
    elements.finishQuizBtn?.addEventListener('click', () => toggleLessonCompletion(true));

    elements.submitAssignmentBtn?.addEventListener('click', submitAssignment);
}

function renderCurriculum() {
    elements.curriculumContainer.innerHTML = '';

    state.units.forEach((unit, uIdx) => {
        const isExpanded = state.currentLesson ? unit.lessons.some(l => l._id === state.currentLesson._id) : uIdx === 0;
        const unitEl = document.createElement('div');
        unitEl.className = 'unit-container';

        const completedCount = unit.lessons.filter(l =>
            state.progress.find(p => p.lessonId === l._id && p.completed)
        ).length;

        unitEl.innerHTML = `
            <div class="unit-header" data-unit-id="${unit._id}">
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
                    if (isLessonCompleted(lesson._id)) icon = 'check-circle';

                    return `
                    <div class="lesson-item ${state.currentLesson?._id === lesson._id ? 'active' : ''} ${isLessonCompleted(lesson._id) ? 'completed' : ''}" data-lesson-id="${lesson._id}">
                        <i data-lucide="${icon}" class="w-4 h-4 lesson-icon"></i>
                        <div class="lesson-details">
                            <h4>${escapeHTML(lesson.title)}</h4>
                            <p>${escapeHTML(lesson.duration) || 'Video'}</p>
                        </div>
                    </div>
                `}).join('')}
            </div>
        `;

        unitEl.querySelectorAll('.lesson-item').forEach(item => {
            item.addEventListener('click', () => {
                const lessonId = item.dataset.lessonId;
                const lesson = unit.lessons.find(l => l._id === lessonId);
                loadLesson(unit, lesson);

                elements.portalLayout.classList.remove('mobile-sidebar-open');
                elements.sidebarOverlay.classList.remove('active');
            });
        });

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
    if (state.currentLesson?._id === lesson._id) return;

    state.currentLesson = lesson;

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

    document.querySelectorAll('.lesson-item').forEach(el => {
        el.classList.toggle('active', el.dataset.lessonId === lesson._id);
    });

    const completed = isLessonCompleted(lesson._id);
    updateCompleteBtnUI(completed);
}

function showVideoView(lesson) {
    elements.videoView.classList.remove('hidden');

    if (lesson.youtube_id) {
        if (elements.youtubePlaceholder) {
            elements.youtubePlaceholder.style.display = 'none';
        }

        const existingIframe = elements.youtubeContainer.querySelector('iframe');
        if (existingIframe) existingIframe.remove();

        const iframe = document.createElement('iframe');
        iframe.src = `https://www.youtube.com/embed/${lesson.youtube_id}?rel=0&modestbranding=1`;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.allowFullscreen = true;
        iframe.title = lesson.title;
        elements.youtubeContainer.appendChild(iframe);
    } else {
        if (elements.youtubePlaceholder) {
            elements.youtubePlaceholder.style.display = 'flex';
        }
        const existingIframe = elements.youtubeContainer.querySelector('iframe');
        if (existingIframe) existingIframe.remove();
    }

    if (window.lucide) window.lucide.createIcons();
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

    elements.currentQuestionContainer.querySelectorAll('.option-item').forEach(item => {
        item.addEventListener('click', () => {
            const index = parseInt(item.dataset.index);
            state.quiz.answers[state.quiz.currentQuestionIndex] = index;
            renderQuestion();
        });
    });

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

    if (score >= 70) {
        await toggleLessonCompletion(true);
    }

    if (window.lucide) window.lucide.createIcons();
}

async function submitAssignment() {
    const content = sanitizeInput(elements.assignmentSubmissionText.value);
    if (!content) {
        alert('Please enter your submission before sending.');
        return;
    }

    elements.submitAssignmentBtn.disabled = true;
    elements.submitAssignmentBtn.textContent = 'Submitting...';

    await new Promise(resolve => setTimeout(resolve, 1500));

    elements.assignmentStatus.classList.remove('hidden');
    elements.submitAssignmentBtn.classList.add('hidden');

    await toggleLessonCompletion(true);
}

function loadInitialLesson() {
    if (state.units.length > 0 && state.units[0].lessons.length > 0) {
        loadLesson(state.units[0], state.units[0].lessons[0]);
    }
}

async function toggleLessonCompletion(forceStatus = null) {
    if (!state.currentLesson) return;

    const isCurrentlyCompleted = isLessonCompleted(state.currentLesson._id);
    const newStatus = forceStatus !== null ? forceStatus : !isCurrentlyCompleted;

    if (forceStatus === true && isCurrentlyCompleted) return;

    try {
        const client = await getConvex();
        if (client && currentUser) {
            await client.mutation('progress/mutations:updateProgress', {
                userId: currentUser._id,
                lessonId: state.currentLesson._id,
                completed: newStatus,
            });
        }

        const progIdx = state.progress.findIndex(p => p.lessonId === state.currentLesson._id);
        if (progIdx > -1) {
            state.progress[progIdx].completed = newStatus;
        } else {
            state.progress.push({ lessonId: state.currentLesson._id, completed: newStatus });
        }

        updateCompleteBtnUI(newStatus);
        renderCurriculum();
        updateOverallProgress();

    } catch (error) {
        console.error('Error updating progress:', error);
        const progIdx = state.progress.findIndex(p => p.lessonId === state.currentLesson._id);
        if (progIdx > -1) {
            state.progress[progIdx].completed = newStatus;
        } else {
            state.progress.push({ lessonId: state.currentLesson._id, completed: newStatus });
        }
        updateCompleteBtnUI(newStatus);
        renderCurriculum();
        updateOverallProgress();
    }
}

function updateCompleteBtnUI(completed) {
    if (!elements.completeBtn) return;

    if (completed) {
        elements.completeBtn.textContent = 'Completed ✓';
        elements.completeBtn.style.opacity = '0.7';
        elements.completeBtn.style.setProperty('--btn-face', '#10b981');
    } else {
        elements.completeBtn.textContent = 'Mark Complete';
        elements.completeBtn.style.opacity = '1';
        elements.completeBtn.style.setProperty('--btn-face', 'var(--color-primary)');
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
    return state.progress.some(p => p.lessonId === id && p.completed);
}

// Start
document.addEventListener('DOMContentLoaded', init);
