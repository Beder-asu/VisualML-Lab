import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { isLessonId, lessonIds, type LessonId } from '../data/lessons';

const storageKey = 'visualml:lesson-progress';
type Progress = {
    lessons: Partial<Record<LessonId, 'visited' | 'complete'>>;
    lastLesson: LessonId | null;
};
const emptyProgress: Progress = { lessons: {}, lastLesson: null };

function readProgress(): Progress {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    if (saved?.version !== 1) return emptyProgress;
    const lessons: Progress['lessons'] = {};
    for (const id of lessonIds) {
        const status = saved.data?.lessons?.[id];
        if (status === 'visited' || status === 'complete') lessons[id] = status;
    }
    const lastLesson = saved.data?.lastLesson;
    return { lessons, lastLesson: isLessonId(lastLesson) && lessons[lastLesson] ? lastLesson : null };
}

const LessonProgressContext = createContext<{
    progress: Progress;
    persistent: boolean;
    visit: (id: LessonId) => void;
    setComplete: (id: LessonId, complete: boolean) => void;
    clear: () => void;
} | null>(null);

export function LessonProgressProvider({ children }: { children: ReactNode }) {
    const [initial] = useState(() => {
        try {
            return { progress: readProgress(), persistent: true };
        } catch (error) {
            return { progress: emptyProgress, persistent: error instanceof SyntaxError };
        }
    });
    const [progress, setProgress] = useState(initial.progress);
    const [persistent, setPersistent] = useState(initial.persistent);

    useEffect(() => {
        try {
            if (Object.keys(progress.lessons).length === 0) localStorage.removeItem(storageKey);
            else localStorage.setItem(storageKey, JSON.stringify({ version: 1, data: progress }));
            setPersistent(true);
        } catch {
            setPersistent(false);
        }
    }, [progress]);

    const visit = useCallback((id: LessonId) => setProgress(previous => {
        if (previous.lastLesson === id && previous.lessons[id]) return previous;
        return { lastLesson: id, lessons: { ...previous.lessons, [id]: previous.lessons[id] ?? 'visited' } };
    }), []);
    const setComplete = (id: LessonId, complete: boolean) => setProgress(previous => ({
        lastLesson: id, lessons: { ...previous.lessons, [id]: complete ? 'complete' : 'visited' },
    }));

    return (
        <LessonProgressContext.Provider value={{ progress, persistent, visit, setComplete, clear: () => setProgress(emptyProgress) }}>
            {children}
        </LessonProgressContext.Provider>
    );
}

export function useLessonProgress() {
    return useContext(LessonProgressContext);
}
