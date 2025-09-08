import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { Play, Trophy, Clock } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const difficultyColors = {
  1: '#10B981', // Easy - Green
  2: '#10B981',
  3: '#3B82F6', // Medium - Blue
  4: '#3B82F6',
  5: '#F59E0B', // Hard - Orange
  6: '#F59E0B',
  7: '#EF4444', // Expert - Red
  8: '#EF4444',
  9: '#8B5CF6', // Master - Purple
  10: '#6366F1', // Extreme - Indigo
};

const difficultyNames = {
  1: 'Beginner', 2: 'Easy', 3: 'Medium', 4: 'Medium+',
  5: 'Hard', 6: 'Hard+', 7: 'Expert', 8: 'Expert+',
  9: 'Master', 10: 'Extreme'
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const levels = Array.from({ length: 100 }, (_, i) => {
    const level = i + 1;
    const difficulty = Math.min(10, Math.ceil(level / 10));
    return { level, difficulty };
  });

  const renderLevelCard = (item: { level: number; difficulty: number }) => {
    const colors = difficultyColors[item.difficulty as keyof typeof difficultyColors];
    
    return (
      <TouchableOpacity
        key={item.level}
        style={styles.levelCard}
        onPress={() => router.push(`/game?level=${item.level}`)}
        activeOpacity={0.8}
      >
        <View style={[styles.cardGradient, { backgroundColor: colors }]}>
          <View style={styles.cardContent}>
            <Text style={styles.levelNumber}>{item.level}</Text>
            <Text style={styles.difficultyText}>
              {difficultyNames[item.difficulty as keyof typeof difficultyNames]}
            </Text>
            <View style={styles.cardFooter}>
              <Play size={16} color="white" />
              <Text style={styles.playText}>Play</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Sudoku Master!!</Text>
        <Text style={styles.subtitle}>100 Challenging Levels</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Trophy size={20} color="white" />
            <Text style={styles.statText}>0/100</Text>
          </View>
          <View style={styles.statItem}>
            <Clock size={20} color="white" />
            <Text style={styles.statText}>00:00</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.levelsContainer}
        contentContainerStyle={styles.levelsContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Choose Your Challenge</Text>
        
        <View style={styles.levelsGrid}>
          {levels.map(renderLevelCard)}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.appBackground,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textWhite,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  statText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  levelsContainer: {
    flex: 1,
  },
  levelsContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  levelCard: {
    width: CARD_WIDTH,
    height: 130,
    marginBottom: 15,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  levelNumber: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  difficultyText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  playText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
});