import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

export interface CompletedLevel {
  level: number;
  completedAt: string;
  time: number;
  hintsUsed: number;
}

export interface ProgressData {
  completedLevels: CompletedLevel[];
  totalCompleted: number;
  highestLevel: number;
}

const STORAGE_KEY = '@sudoku_progress';
const EMPTY_PROGRESS: ProgressData = {
  completedLevels: [],
  totalCompleted: 0,
  highestLevel: 0,
};

export const [ProgressProvider, useProgress] = createContextHook(() => {
  const [progress, setProgress] = useState<ProgressData>(EMPTY_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const progressRef = useRef<ProgressData>(EMPTY_PROGRESS);


  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  const persistProgress = useCallback(async (data: ProgressData) => {
    try {
      const json = JSON.stringify(data);
      await AsyncStorage.setItem(STORAGE_KEY, json);
      console.log('[Progress] ✅ Persisted to AsyncStorage:', data.totalCompleted, 'levels');
    } catch (error) {
      console.error('[Progress] ❌ Error persisting:', error);
    }
  }, []);

  const loadProgress = useCallback(async () => {
    try {
      console.log('[Progress] Loading from AsyncStorage...');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProgressData;
        if (parsed.completedLevels && Array.isArray(parsed.completedLevels)) {
          console.log('[Progress] ✅ Loaded:', parsed.totalCompleted, 'completed levels');
          setProgress(parsed);
          progressRef.current = parsed;
        } else {
          console.log('[Progress] ⚠️ Invalid stored data, resetting');
          setProgress(EMPTY_PROGRESS);
          progressRef.current = EMPTY_PROGRESS;
        }
      } else {
        console.log('[Progress] No stored progress found, starting fresh');
      }
    } catch (error) {
      console.error('[Progress] ❌ Error loading:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const addCompletedLevel = useCallback(async (level: number, time: number, hintsUsed: number) => {
    console.log('[Progress] 🎮 Adding completed level:', level, 'time:', time, 'hints:', hintsUsed);

    const current = progressRef.current;

    const newLevel: CompletedLevel = {
      level,
      completedAt: new Date().toISOString(),
      time,
      hintsUsed,
    };

    const alreadyCompleted = current.completedLevels.some(l => l.level === level);

    let updatedLevels: CompletedLevel[];
    if (alreadyCompleted) {
      console.log('[Progress] Level already completed, updating record');
      updatedLevels = current.completedLevels.map(l =>
        l.level === level ? newLevel : l
      );
    } else {
      updatedLevels = [...current.completedLevels, newLevel];
    }

    const updated: ProgressData = {
      completedLevels: updatedLevels,
      totalCompleted: updatedLevels.length,
      highestLevel: Math.max(current.highestLevel, level),
    };

    console.log('[Progress] ✅ Updated progress:', updated.totalCompleted, 'levels, highest:', updated.highestLevel);

    setProgress(updated);
    progressRef.current = updated;

    void persistProgress(updated);
  }, [persistProgress]);

  const refreshProgress = useCallback(async () => {
    setIsSyncing(true);
    await loadProgress();
    setIsSyncing(false);
  }, [loadProgress]);

  const isLevelCompleted = useCallback((level: number) => {
    return progressRef.current.completedLevels.some(l => l.level === level);
  }, []);

  const getLevelTime = useCallback((level: number) => {
    const completed = progressRef.current.completedLevels.find(l => l.level === level);
    return completed?.time ?? null;
  }, []);

  useEffect(() => {
    void loadProgress();
  }, [loadProgress]);

  return useMemo(() => ({
    progress,
    isLoading,
    isSyncing,
    addCompletedLevel,
    refreshProgress,
    isLevelCompleted,
    getLevelTime,
  }), [progress, isLoading, isSyncing, addCompletedLevel, refreshProgress, isLevelCompleted, getLevelTime]);
});
