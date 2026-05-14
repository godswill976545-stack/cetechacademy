
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
const SUPABASE_ANON_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// State Management
let state = {
    user: null,
    profile: null,
    course: null,
    units: [],
    currentLesson: null,
    progress: [],
    notes: {}
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
    notesTextarea: document.getElementById('notes-textarea')
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
            title: 'Foundations of Design',
            lessons: [
                { id: 'l1', title: 'Introduction to UI/UX', duration: '12:45', mux_playback_id: 'rR8P8mSaKDzz02TsftugTUdI00cQPJX00oy', description: 'In this introductory lesson, we explore the fundamental differences between User Interface (UI) and User Experience (UX) design.' },
                { id: 'l2', title: 'Design Principles', duration: '15:20', mux_playback_id: 'rR8P8mSaKDzz02TsftugTUdI00cQPJX00oy', description: 'Deep dive into typography, color theory, and layout grids.' }
            ]
        },
        {
            id: 'unit-2',
            title: 'Advanced Prototyping',
            lessons: [
                { id: 'l3', title: 'Interactive Components', duration: '22:10', mux_playback_id: 'rR8P8mSaKDzz02TsftugTUdI00cQPJX00oy', description: 'Learn how to create reusable interactive components in Figma.' }
            ]
        }
    ];

    try {
        const { data: units, error: unitsError } = await supabase
            .from('units')
            .select('*, lessons(*)')
            .order('order_index');

        if (!unitsError && units && units.length > 0) {
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
}

function renderCurriculum() {
    elements.curriculumContainer.innerHTML = '';
    
    state.units.forEach((unit, uIdx) => {
        const isExpanded = uIdx === 0;
        const unitEl = document.createElement('div');
        unitEl.className = 'unit-container';
        
        const completedCount = unit.lessons.filter(l => 
            state.progress.find(p => p.lesson_id === l.id && p.completed)
        ).length;

        unitEl.innerHTML = `
            <div class="unit-header" data-unit-id="${unit.id}">
                <div class="unit-title-area">
                    <h3>${escapeHTML(unit.title)}</h3>
                    <div class="unit-meta">${completedCount}/${unit.lessons.length} Lessons</div>
                </div>
                <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4 text-muted"></i>
            </div>
            <div class="unit-lessons ${isExpanded ? 'expanded' : ''}">
                ${unit.lessons.map(lesson => `
                    <div class="lesson-item ${state.currentLesson?.id === lesson.id ? 'active' : ''} ${isLessonCompleted(lesson.id) ? 'completed' : ''}" data-lesson-id="${lesson.id}">
                        <i data-lucide="${isLessonCompleted(lesson.id) ? 'check-circle' : 'play-circle'}" class="w-4 h-4 lesson-icon"></i>
                        <div class="lesson-details">
                            <h4>${escapeHTML(lesson.title)}</h4>
                            <p>${escapeHTML(lesson.duration) || 'Video'}</p>
                        </div>
                    </div>
                `).join('')}
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
    
    // Mux Player Logic
    if (lesson.mux_playback_id) {
        elements.player.playbackId = lesson.mux_playback_id;
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

    elements.player.play().catch(() => {});
}

function loadInitialLesson() {
    if (state.units.length > 0 && state.units[0].lessons.length > 0) {
        loadLesson(state.units[0], state.units[0].lessons[0]);
    }
}

async function toggleLessonCompletion() {
    if (!state.currentLesson) return;
    
    const isCurrentlyCompleted = isLessonCompleted(state.currentLesson.id);
    const newStatus = !isCurrentlyCompleted;

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
    return state.progress.some(p => p.lesson_id === id && p.completed);
}

// Start
document.addEventListener('DOMContentLoaded', init);
