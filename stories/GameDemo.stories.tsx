import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { AchievementProvider, AchievementEngine, StorageType, BuiltInModal, useAchievementEngine } from '../src/index';
import type { SimpleAchievementConfig, EventMapping } from '../src/index';

/**
 * LearnQuest Game Demo
 * 
 * A comprehensive learning game that demonstrates react-achievements in a real-world scenario.
 * This story showcases:
 * - Event-based achievement tracking
 * - Multiple achievement types (lessons, courses, quizzes, notes, profile)
 * - Progress tracking and stats
 * - Achievement modal integration
 * - Complex achievement conditions
 * 
 * This is based on the game structure in the /game directory.
 */
const meta: Meta<typeof AchievementProvider> = {
  title: 'Game Demo/LearnQuest',
  component: AchievementProvider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A complete learning game demo showcasing react-achievements with event-based tracking, multiple achievement types, and real-world usage patterns.'
      }
    }
  },
  tags: ['autodocs'],
};

export default meta;

// Course data (same structure as game/src/data/courses.js)
const courses = [
  {
    id: 'js',
    title: 'JavaScript Basics',
    topic: 'Programming',
    icon: '🟨',
    color: '#fbbf24',
    lessons: [
      { id: 'js1', title: 'Variables' },
      { id: 'js2', title: 'Functions' },
      { id: 'js3', title: 'Arrays' }
    ],
    quiz: [
      { q: 'const creates a constant?', a: ['Yes', 'No'], c: 0 }
    ],
  },
  {
    id: 'ui',
    title: 'UI Design',
    topic: 'Design',
    icon: '🎨',
    color: '#ec4899',
    lessons: [
      { id: 'ui1', title: 'Color Theory' },
      { id: 'ui2', title: 'Typography' }
    ],
    quiz: [
      { q: 'RGB stands for?', a: ['Red Green Blue', 'Really Good Branding'], c: 0 }
    ],
  },
  {
    id: 'prod',
    title: 'Productivity',
    topic: 'Growth',
    icon: '⚡',
    color: '#8b5cf6',
    lessons: [
      { id: 'p1', title: 'Time Blocking' },
      { id: 'p2', title: 'Pomodoro' }
    ],
    quiz: [
      { q: 'Pomodoro is how long?', a: ['15min', '25min', '45min'], c: 1 }
    ],
  },
];

// Achievement configuration (same structure as game/src/achievementConfig.js)
const achievementConfig: SimpleAchievementConfig = {
  // Lessons achievements
  lessons: {
    1: { title: "First Steps", description: "Complete a lesson", icon: "📖" },
    5: { title: "On a Roll", description: "Complete 5 lessons", icon: "📚" }
  },
  // Course achievement
  courses: {
    1: { title: "Graduate", description: "Complete a course", icon: "🎓" }
  },
  // Perfect quiz achievement
  perfectQuizzes: {
    1: { title: "Perfectionist", description: "100% on a quiz", icon: "💯" }
  },
  // Notes achievement
  notes: {
    1: { title: "Note Taker", description: "Take a note", icon: "📝" }
  },
  // Profile completion - boolean achievement
  profileDone: {
    true: { title: "Ready to Learn", description: "Complete profile", icon: "✅" }
  },
  // Topics achievement
  topics: {
    2: { title: "Explorer", description: "Study 2 topics", icon: "🗺️" }
  },
  // Complex achievement using custom condition
  engaged_learner: {
    custom: {
      title: "Engaged Learner",
      description: "Lesson + Note combo",
      icon: "🧠",
      condition: (metrics) => {
        const lessonsValue = typeof metrics.lessons === 'number' ? metrics.lessons : 0;
        const notesValue = typeof metrics.notes === 'number' ? metrics.notes : 0;
        return lessonsValue >= 1 && notesValue >= 1;
      }
    }
  }
};

// Event mapping (same structure as game/src/achievementConfig.js)
const eventMapping: EventMapping = {
  'lessonCompleted': (data, currentMetrics) => {
    const completedLessons = currentMetrics.completedLessons || [];
    const updatedLessons = [...completedLessons, data.lessonId];
    return {
      completedLessons: updatedLessons,
      lessons: updatedLessons.length
    };
  },
  'courseCompleted': (data, currentMetrics) => {
    const completedCourses = currentMetrics.completedCourses || [];
    const updatedCourses = [...completedCourses, data.courseId];
    return {
      completedCourses: updatedCourses,
      courses: updatedCourses.length
    };
  },
  'topicStudied': (data, currentMetrics) => {
    const studiedTopics = currentMetrics.studiedTopics || [];
    const updatedTopics = [...studiedTopics, data.topic];
    return {
      studiedTopics: updatedTopics,
      topics: updatedTopics.length
    };
  },
  'perfectQuiz': (data, currentMetrics) => ({
    perfectQuizzes: (currentMetrics.perfectQuizzes || 0) + 1
  }),
  'noteAdded': (data, currentMetrics) => ({
    notes: (currentMetrics.notes || 0) + 1
  }),
  'profileCompleted': () => ({
    profileDone: true
  })
};

// Create the engine instance
const achievementEngine = new AchievementEngine({
  achievements: achievementConfig,
  eventMapping,
  storage: StorageType.Memory, // Use Memory for storybook demo
});

// Achievements Drawer Component
const AchievementsDrawer = ({ open, onClose, unlockedCount, onViewAchievements }: {
  open: boolean;
  onClose: () => void;
  unlockedCount: number;
  onViewAchievements: () => void;
}) => {
  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            zIndex: 9998
          }}
        />
      )}

      {/* Drawer */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: open ? 0 : '-350px',
        width: '300px',
        height: '100vh',
        background: '#1e1b4b',
        borderLeft: '2px solid #6366f1',
        transition: 'right 0.3s ease',
        zIndex: 9999,
        padding: '20px',
        boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.3)',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#a5b4fc', margin: 0 }}>Menu</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >×</button>
        </div>

        {/* Achievement info */}
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={() => {
              onViewAchievements();
              onClose();
            }}
            style={{
              width: '100%',
              padding: '16px',
              background: 'rgba(99, 102, 241, 0.2)',
              border: '2px solid #6366f1',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'; }}
          >
            <div style={{ fontSize: '48px', marginBottom: '8px' }}>🏆</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff' }}>{unlockedCount}</div>
            <div style={{ fontSize: '14px', color: '#a5b4fc', marginTop: '4px' }}>Achievements Unlocked</div>
          </button>
          <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af', textAlign: 'center' }}>
            Click to view all achievements!
          </div>
        </div>
      </div>
    </>
  );
};

// Main App Component (same structure as game/src/App.jsx)
const LearnQuestApp = () => {
  // Get engine from context using hook
  const engine = useAchievementEngine();

  // UI state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState<'home' | 'course' | 'lesson' | 'quiz' | 'profile'>('home');
  const [course, setCourse] = useState<typeof courses[0] | null>(null);
  const [lesson, setLesson] = useState<typeof courses[0]['lessons'][0] | null>(null);
  const [quiz, setQuiz] = useState<{ i: number; ans: number | null; score: number | null }>({ i: 0, ans: null, score: null });
  const [profile, setProfile] = useState({ name: '', goal: '' });

  // Achievement data
  const unlocked = engine.getUnlocked();
  const allAchievements = engine.getAllAchievements();
  const unlockedCount = unlocked.length;
  const metrics = engine.getMetrics();

  // Get completion data from engine metrics
  const completedLessons = (metrics.completedLessons as string[]) || [];
  const completedCourses = (metrics.completedCourses as string[]) || [];
  const studiedTopics = (metrics.studiedTopics as string[]) || [];

  const finishLesson = () => {
    if (!lesson) return;
    
    if (completedLessons.includes(lesson.id)) {
      setPage('course');
      return;
    }

    // Emit lesson completed event with lesson ID
    engine.emit('lessonCompleted', { lessonId: lesson.id });

    // Check if this is a new topic
    if (course && !studiedTopics.includes(course.topic)) {
      engine.emit('topicStudied', { topic: course.topic });
    }

    // Check if all lessons in course are done
    if (course) {
      const allLessonsCompleted = course.lessons.every(l =>
        completedLessons.includes(l.id) || l.id === lesson.id
      );
      if (allLessonsCompleted && !completedCourses.includes(course.id)) {
        engine.emit('courseCompleted', { courseId: course.id });
      }
    }

    setPage('course');
  };

  const submitQuiz = () => {
    if (!course) return;
    const correct = quiz.ans === course.quiz[0].c;
    setQuiz(q => ({ ...q, score: correct ? 100 : 0 }));
    if (correct) {
      engine.emit('perfectQuiz');
    }
  };

  const addNote = () => {
    const n = prompt('Enter note:');
    if (n?.trim()) {
      engine.emit('noteAdded');
    }
  };

  const saveProfile = () => {
    if (profile.name && profile.goal) {
      engine.emit('profileCompleted');
      setPage('home');
    }
  };

  const progress = (c: typeof courses[0]) => {
    const completed = c.lessons.filter(l => completedLessons.includes(l.id)).length;
    return Math.round((completed / c.lessons.length) * 100);
  };

  return (
    <div style={{ background: '#0f172a', color: '#fff', fontFamily: 'system-ui', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ padding: 16, background: '#1e1b4b', display: 'flex', justifyContent: 'space-between' }}>
        <div onClick={() => setPage('home')} style={{ cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 24 }}>📚</span>
          <span style={{ fontWeight: 700 }}>LearnQuest</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setPage('home')} style={{ padding: '6px 12px', background: page === 'home' ? '#6366f1' : 'transparent', border: '1px solid #6366f1', borderRadius: 6, color: '#fff', cursor: 'pointer' }}>Home</button>
          <button onClick={() => setPage('profile')} style={{ padding: '6px 12px', background: page === 'profile' ? '#6366f1' : 'transparent', border: '1px solid #6366f1', borderRadius: 6, color: '#fff', cursor: 'pointer' }}>Profile</button>

          {/* Header achievement button */}
          <button
            onClick={() => setModalOpen(true)}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #6366f1',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}
            title="View Achievements"
          >
            🏆 {unlockedCount}
          </button>

          {/* Drawer toggle */}
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid #6366f1',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: '18px'
            }}
            title="Open Menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* Stats */}
      <div style={{ padding: '10px 16px', background: 'rgba(99,102,241,0.1)', display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 14 }}>
        <span>📖 {metrics.lessons || 0} lessons</span>
        <span>📝 {metrics.notes || 0} notes</span>
        <span>🏆 {unlockedCount} badges</span>
      </div>

      {/* Content */}
      <main style={{ padding: 20, margin: '0 auto', height: 'calc(100vh - 120px)', overflowY: 'auto' }}>

        {page === 'home' && (
          <>
            <h2 style={{ color: '#a5b4fc' }}>Courses</h2>
            {courses.map(c => (
              <div key={c.id} onClick={() => { setCourse(c); setPage('course'); }} style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 10, padding: 16, marginBottom: 12, cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{c.title}</div>
                    <div style={{ color: '#9ca3af', fontSize: 13 }}>{c.topic}</div>
                  </div>
                  {progress(c) === 100 && <span>✅</span>}
                </div>
                <div style={{ marginTop: 12, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                  <div style={{ width: `${progress(c)}%`, height: '100%', background: c.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
            <button onClick={addNote} style={{ marginTop: 20, padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>📝 Add Note</button>
          </>
        )}

        {page === 'course' && course && (
          <>
            <button onClick={() => setPage('home')} style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', marginBottom: 16 }}>← Back</button>
            <h2><span style={{ marginRight: 8 }}>{course.icon}</span>{course.title}</h2>
            {course.lessons.map((l, i) => (
              <div key={l.id} onClick={() => { setLesson(l); setPage('lesson'); }} style={{
                background: completedLessons.includes(l.id) ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${completedLessons.includes(l.id) ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 8, padding: 14, marginBottom: 8, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: completedLessons.includes(l.id) ? '#4ade80' : '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                  {completedLessons.includes(l.id) ? '✓' : i + 1}
                </div>
                <div>{l.title}</div>
              </div>
            ))}
            {progress(course) === 100 && (
              <button onClick={() => { setQuiz({ i: 0, ans: null, score: null }); setPage('quiz'); }} style={{
                marginTop: 16, width: '100%', padding: 14, background: course.color,
                border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer',
              }}>Take Quiz</button>
            )}
          </>
        )}

        {page === 'lesson' && lesson && (
          <>
            <button onClick={() => setPage('course')} style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', marginBottom: 16 }}>← Back</button>
            <h2>{lesson.title}</h2>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 20, marginBottom: 20 }}>
              <p>Lesson content for {lesson.title} would go here.</p>
            </div>
            <button onClick={finishLesson} style={{
              width: '100%', padding: 14, background: completedLessons.includes(lesson.id) ? '#4ade80' : '#6366f1',
              border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer',
            }}>{completedLessons.includes(lesson.id) ? '✓ Done' : 'Complete'}</button>
          </>
        )}

        {page === 'quiz' && course && (
          <>
            <button onClick={() => setPage('course')} style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer', marginBottom: 16 }}>← Back</button>
            <h2>Quiz</h2>
            {quiz.score === null ? (
              <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 20 }}>
                <p style={{ fontSize: 18, marginBottom: 16 }}>{course.quiz[0].q}</p>
                {course.quiz[0].a.map((opt, i) => (
                  <button key={i} onClick={() => setQuiz(q => ({ ...q, ans: i }))} style={{
                    display: 'block', width: '100%', padding: 12, marginBottom: 8, textAlign: 'left',
                    background: quiz.ans === i ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${quiz.ans === i ? '#6366f1' : 'transparent'}`,
                    borderRadius: 6, color: '#fff', cursor: 'pointer',
                  }}>{opt}</button>
                ))}
                <button onClick={submitQuiz} disabled={quiz.ans === null} style={{
                  marginTop: 16, padding: '12px 24px', background: '#4ade80',
                  border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer',
                  opacity: quiz.ans === null ? 0.5 : 1,
                }}>Submit</button>
              </div>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 60 }}>{quiz.score === 100 ? '🎉' : '📚'}</div>
                <div style={{ fontSize: 40, fontWeight: 700, color: quiz.score === 100 ? '#4ade80' : '#fbbf24' }}>{quiz.score}%</div>
                <button onClick={() => setPage('course')} style={{ marginTop: 20, padding: '10px 20px', background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>Back</button>
              </div>
            )}
          </>
        )}

        {page === 'profile' && (
          <>
            <h2>Profile</h2>
            <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: 20 }}>
              <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your name" style={{ width: '100%', padding: 12, marginBottom: 12, background: '#1e1b4b', border: '1px solid #333', borderRadius: 6, color: '#fff', boxSizing: 'border-box' }} />
              <input value={profile.goal} onChange={e => setProfile(p => ({ ...p, goal: e.target.value }))} placeholder="Learning goal" style={{ width: '100%', padding: 12, marginBottom: 12, background: '#1e1b4b', border: '1px solid #333', borderRadius: 6, color: '#fff', boxSizing: 'border-box' }} />
              <button onClick={saveProfile} style={{ width: '100%', padding: 12, background: '#6366f1', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>
                {metrics.profileDone ? '✓ Saved' : 'Save'}
              </button>
            </div>
          </>
        )}
      </main>

      {/* Bottom-right floating achievement button (icon-only) */}
      <button
        onClick={() => setModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#1e1b4b',
          border: '2px solid #6366f1',
          color: '#fff',
          fontSize: '28px',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={`${unlockedCount} achievements unlocked`}
      >
        🏆
      </button>

      {/* Achievements Drawer */}
      <AchievementsDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        unlockedCount={unlockedCount}
        onViewAchievements={() => setModalOpen(true)}
      />

      {/* Achievements Modal - Built-in from react-achievements with gamified theme */}
      <BuiltInModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        achievements={allAchievements}
        theme="gamified"
      />
    </div>
  );
};

type Story = StoryObj<typeof meta>;

export const LearnQuestGame: Story = {
  render: () => (
    <AchievementProvider engine={achievementEngine} useBuiltInUI={true}>
      <LearnQuestApp />
    </AchievementProvider>
  )
};
