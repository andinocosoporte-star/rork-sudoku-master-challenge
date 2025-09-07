import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, RotateCcw, Lightbulb, Clock } from 'lucide-react-native';
import { useSudokuGame } from '@/hooks/useSudokuGame';
import SudokuGrid from '@/components/SudokuGrid';
import NumberPad from '@/components/NumberPad';
import { sudokuLevels } from '@/data/sudokuLevels';
import { Colors } from '@/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GameScreen() {
  const insets = useSafeAreaInsets();
  const { level } = useLocalSearchParams();
  const levelNumber = parseInt(level as string) || 1;
  const currentLevel = sudokuLevels.find(l => l.level === levelNumber) || null;
  
  const {
    grid,
    selectedCell,
    isComplete,
    errors,
    timer,
    hintsUsed,
    availableNumbers,
    setSelectedCell,
    updateCell,
    resetGame,

  } = useSudokuGame(currentLevel);



  useEffect(() => {
    if (isComplete) {
      Alert.alert(
        'Congratulations! 🎉',
        `You completed Level ${levelNumber} in ${Math.floor(timer / 60)}:${(timer % 60).toString().padStart(2, '0')}!`,
        [
          { text: 'Next Level', onPress: () => router.push(`/game?level=${levelNumber + 1}`) },
          { text: 'Back to Menu', onPress: () => router.back() }
        ]
      );
    }
  }, [isComplete, levelNumber, timer]);

  const handleNumberSelect = (number: number) => {
    if (selectedCell) {
      updateCell(selectedCell.row, selectedCell.col, number);
    }
  };

  const handleHint = () => {
    if (!selectedCell || !currentLevel || hintsUsed >= 3) return;
    
    const { row, col } = selectedCell;
    if (currentLevel.puzzle[row][col] !== 0) return;
    
    const solution = currentLevel.solution[row][col];
    updateCell(row, col, solution);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          
          <View style={styles.levelInfo}>
            <Text style={styles.levelText}>Level {levelNumber}</Text>
            <Text style={styles.difficultyText}>Difficulty: {currentLevel?.difficulty || 1}/10</Text>
          </View>
          
          <View style={styles.timerContainer}>
            <Clock size={20} color="white" />
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.gameContainer}>
        <SudokuGrid
          grid={grid}
          selected={selectedCell}
          fixedCells={currentLevel ? currentLevel.puzzle.map(row => row.map(cell => cell !== 0)) : undefined}
          conflicts={new Set(errors.flatMap((row, i) => row.map((hasError, j) => hasError ? `${i},${j}` : '').filter(Boolean)))}
          onCellPress={(row, col) => setSelectedCell({ row, col })}
        />

        <View style={styles.controls}>
          <TouchableOpacity onPress={resetGame}>
            <View style={[styles.controlButton, styles.resetButton]}>
              <RotateCcw size={20} color={Colors.textWhite} />
              <Text style={styles.controlText}>Reset</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleHint}
            disabled={!selectedCell || hintsUsed >= 3}
          >
            <View style={[
              styles.controlButton,
              styles.hintButton,
              (!selectedCell || hintsUsed >= 3) && styles.disabledControlButton
            ]}>
              <Lightbulb size={20} color={(selectedCell && hintsUsed < 3) ? Colors.textWhite : Colors.textLight} />
              <Text style={[
                styles.controlText, 
                (!selectedCell || hintsUsed >= 3) && styles.controlTextDisabled
              ]}>
                Hint ({3 - hintsUsed})
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <NumberPad
          onNumberSelect={handleNumberSelect}
          selectedNumber={selectedCell ? grid[selectedCell.row][selectedCell.col] : 0}
          disabled={!selectedCell}
          availableNumbers={availableNumbers}
        />
      </View>
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
    paddingBottom: 24,
    paddingHorizontal: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  levelInfo: {
    alignItems: 'center',
  },
  levelText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textWhite,
  },
  difficultyText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  gameContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    marginVertical: 24,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButton: {
    backgroundColor: Colors.primary,
  },
  hintButton: {
    backgroundColor: Colors.primaryLight,
  },
  disabledControlButton: {
    backgroundColor: Colors.gray300,
  },
  controlText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  controlTextDisabled: {
    color: Colors.textLight,
  },
});