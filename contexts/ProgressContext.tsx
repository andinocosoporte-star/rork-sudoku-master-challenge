import React, { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { trpc } from '@/lib/trpc';

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

export const [ProgressProvider, useProgress] = createContextHook(() => {
  const [progress, setProgress] = useState<ProgressData>({
    completedLevels: [],
    totalCompleted: 0,
    highestLevel: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const utils = trpc.useUtils();

  const backendQuery = trpc.game.getProgress.useQuery(
    { userId: 'guest' },
    {
      enabled: false,
      retry: false,
    }
  );

  const saveProgressMutation = trpc.game.saveProgress.useMutation({
    onSuccess: () => {
      console.log('✅ Progress synced to backend');
    },
    onError: (error) => {
      console.log('⚠️ Backend sync failed (using local storage):', error.message);
    },
  });

  const loadProgress = useCallback(async () => {
    try {
      console.log('[Progress] Loading from AsyncStorage...');
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ProgressData;
        console.log('[Progress] Loaded from storage:', parsed.totalCompleted, 'levels');
        setProgress(parsed);
      } else {
        console.log('[Progress] No stored progress found');
      }
    } catch (error) {
      console.error('[Progress] Error loading:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveToStorage = useCallback(async (data: ProgressData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      console.log('[Progress] Saved to AsyncStorage');
    } catch (error) {
      console.error('[Progress] Error saving to storage:', error);
    }
  }, []);

  const addCompletedLevel = useCallback(async (level: number, time: number, hintsUsed: number) => {
    console.log('[Progress] Adding completed level:', level);
    
    const newLevel: CompletedLevel = {
      level,
      completedAt: new Date().toISOString(),
      time,
      hintsUsed,
    };

    setProgress((prev) => {
      const alreadyCompleted = prev.completedLevels.some(l => l.level === level);
      if (alreadyCompleted) {
        console.log('[Progress] Level already completed, updating time');
        const updated = {
          ...prev,
          completedLevels: prev.completedLevels.map(l => 
            l.level === level ? newLevel : l
          ),
        };
        saveToStorage(updated);
        return updated;
      }

      const newCompletedLevels = [...prev.completedLevels, newLevel];
      const updated: ProgressData = {
        completedLevels: newCompletedLevels,
        totalCompleted: newCompletedLevels.length,
        highestLevel: Math.max(prev.highestLevel, level),
      };
      
      saveToStorage(updated);
      return updated;
    });

    try {
      saveProgressMutation.mutate({
        userId: 'guest',
        level,
        time,
        hintsUsed,
      });
    } catch (error) {
      console.log('[Progress] Backend save attempted (may fail silently)');
    }
  }, [saveToStorage, saveProgressMutation]);

  const refreshProgress = useCallback(async () => {
    setIsSyncing(true);
    await loadProgress();
    setIsSyncing(false);
  }, [loadProgress]);

  const isLevelCompleted = useCallback((level: number) => {
    return progress.completedLevels.some(l => l.level === level);
  }, [progress.completedLevels]);

  const getLevelTime = useCallback((level: number) => {
    const completed = progress.completedLevels.find(l => l.level === level);
    return completed?.time || null;
  }, [progress.completedLevels]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    isLoading,
    isSyncing,
    addCompletedLevel,
    refreshProgress,
    isLevelCompleted,
    getLevelTime,
  };
});
