import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Clock, Target, Zap } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { trpc } from '@/lib/trpc';

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  
  const progressQuery = trpc.game.getProgress.useQuery({ userId: 'guest' });
  
  const progress = progressQuery.data;
  
  const stats = useMemo(() => {
    if (!progress) {
      return [
        { icon: Trophy, label: 'Completed', value: '0/100', color: '#f59e0b' },
        { icon: Clock, label: 'Total Time', value: '00:00', color: '#3b82f6' },
        { icon: Target, label: 'Best Time', value: '--:--', color: '#10b981' },
        { icon: Zap, label: 'Streak', value: '0', color: '#8b5cf6' },
      ];
    }
    
    const totalTime = progress.completedLevels.reduce((sum, level) => sum + level.time, 0);
    const hours = Math.floor(totalTime / 3600);
    const minutes = Math.floor((totalTime % 3600) / 60);
    const totalTimeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    const bestTime = progress.completedLevels.length > 0 
      ? Math.min(...progress.completedLevels.map(l => l.time))
      : 0;
    const bestMinutes = Math.floor(bestTime / 60);
    const bestSeconds = bestTime % 60;
    const bestTimeStr = bestTime > 0 ? `${bestMinutes}:${bestSeconds.toString().padStart(2, '0')}` : '--:--';
    
    return [
      { icon: Trophy, label: 'Completed', value: `${progress.totalCompleted}/100`, color: '#f59e0b' },
      { icon: Clock, label: 'Total Time', value: totalTimeStr, color: '#3b82f6' },
      { icon: Target, label: 'Best Time', value: bestTimeStr, color: '#10b981' },
      { icon: Zap, label: 'Streak', value: '0', color: '#8b5cf6' },
    ];
  }, [progress]);

  const difficultyStats = useMemo(() => {
    if (!progress) {
      return [
        { name: 'Beginner', completed: 0, total: 20, color: '#22c55e' },
        { name: 'Easy', completed: 0, total: 20, color: '#3b82f6' },
        { name: 'Medium', completed: 0, total: 20, color: '#f59e0b' },
        { name: 'Hard', completed: 0, total: 20, color: '#ef4444' },
        { name: 'Expert', completed: 0, total: 20, color: '#8b5cf6' },
      ];
    }
    
    const levelsByDifficulty = {
      beginner: 0,
      easy: 0,
      medium: 0,
      hard: 0,
      expert: 0,
    };
    
    progress.completedLevels.forEach(level => {
      const levelNum = level.level;
      if (levelNum <= 20) levelsByDifficulty.beginner++;
      else if (levelNum <= 40) levelsByDifficulty.easy++;
      else if (levelNum <= 60) levelsByDifficulty.medium++;
      else if (levelNum <= 80) levelsByDifficulty.hard++;
      else levelsByDifficulty.expert++;
    });
    
    return [
      { name: 'Beginner', completed: levelsByDifficulty.beginner, total: 20, color: '#22c55e' },
      { name: 'Easy', completed: levelsByDifficulty.easy, total: 20, color: '#3b82f6' },
      { name: 'Medium', completed: levelsByDifficulty.medium, total: 20, color: '#f59e0b' },
      { name: 'Hard', completed: levelsByDifficulty.hard, total: 20, color: '#ef4444' },
      { name: 'Expert', completed: levelsByDifficulty.expert, total: 20, color: '#8b5cf6' },
    ];
  }, [progress]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.title}>Your Progress</Text>
        <Text style={styles.subtitle}>Track your Sudoku journey</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.color }]}>
                <stat.icon size={24} color="white" />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Progress</Text>
          {difficultyStats.map((difficulty, index) => (
            <View key={index} style={styles.difficultyCard}>
              <View style={styles.difficultyHeader}>
                <Text style={styles.difficultyName}>{difficulty.name}</Text>
                <Text style={styles.difficultyProgress}>
                  {difficulty.completed}/{difficulty.total}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(difficulty.completed / difficulty.total) * 100}%`,
                      backgroundColor: difficulty.color 
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementText}>🏆 Complete your first puzzle</Text>
            <Text style={styles.achievementSubtext}>Solve any Sudoku level</Text>
          </View>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementText}>⚡ Speed Solver</Text>
            <Text style={styles.achievementSubtext}>Complete a puzzle in under 5 minutes</Text>
          </View>
          <View style={styles.achievementCard}>
            <Text style={styles.achievementText}>🎯 Perfect Game</Text>
            <Text style={styles.achievementSubtext}>Complete a puzzle without errors</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  difficultyCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  difficultyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  difficultyProgress: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  achievementText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  achievementSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
});