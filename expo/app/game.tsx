import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, useWindowDimensions, ScrollView } from 'react-native';
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
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
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
    numberCounts,
    shouldShowHints,
    setSelectedCell,
    updateCell,
    resetGame,
    useHint,
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



  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const iconSize = isLandscape ? 18 : 24;
  const fontSize = isLandscape ? 16 : 24;
  const padding = Math.min(width, height) * 0.02;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + (isLandscape ? 5 : 10), paddingBottom: isLandscape ? 8 : 24 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { padding: isLandscape ? 6 : 12 }]}>
            <ArrowLeft size={iconSize} color="white" />
          </TouchableOpacity>
          
          <View style={styles.levelInfo}>
            <Text style={[styles.levelText, { fontSize }]}>Level {levelNumber}</Text>
            <Text style={[styles.difficultyText, { fontSize: fontSize * 0.67 }]}>Difficulty: {currentLevel?.difficulty || 1}/10</Text>
          </View>
          
          <View style={[styles.timerContainer, { paddingHorizontal: isLandscape ? 8 : 12, paddingVertical: isLandscape ? 4 : 8 }]}>
            <Clock size={iconSize * 0.83} color="white" />
            <Text style={[styles.timerText, { fontSize: fontSize * 0.75 }]}>{formatTime(timer)}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { padding }]}
        showsVerticalScrollIndicator={false}
      >
        {isLandscape ? (
          <View style={styles.landscapeContainer}>
            <View style={styles.landscapeLeft}>
              <SudokuGrid
                grid={grid}
                selected={selectedCell}
                fixedCells={currentLevel ? currentLevel.puzzle.map(row => row.map(cell => cell !== 0)) : undefined}
                conflicts={new Set(errors.flatMap((row, i) => row.map((hasError, j) => hasError ? `${i},${j}` : '').filter(Boolean)))}
                onCellPress={(row, col) => setSelectedCell({ row, col })}
              />
            </View>
            
            <View style={styles.landscapeRight}>
              <View style={[styles.controls, { marginVertical: 12 }]}>
                <TouchableOpacity onPress={resetGame}>
                  <View style={[styles.controlButton, styles.resetButton, { paddingHorizontal: 12, paddingVertical: 8 }]}>
                    <RotateCcw size={16} color={Colors.textWhite} />
                    <Text style={[styles.controlText, { fontSize: 14 }]}>Reset</Text>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  onPress={useHint}
                  disabled={!selectedCell || hintsUsed >= 3}
                >
                  <View style={[
                    styles.controlButton,
                    styles.hintButton,
                    { paddingHorizontal: 12, paddingVertical: 8 },
                    (!selectedCell || hintsUsed >= 3) && styles.disabledControlButton
                  ]}>
                    <Lightbulb size={16} color={(selectedCell && hintsUsed < 3) ? Colors.textWhite : Colors.textLight} />
                    <Text style={[
                      styles.controlText,
                      { fontSize: 14 },
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
                numberCounts={numberCounts}
                shouldShowHints={shouldShowHints}
              />
            </View>
          </View>
        ) : (
          <View style={styles.portraitContainer}>
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
                onPress={useHint}
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
              numberCounts={numberCounts}
              shouldShowHints={shouldShowHints}
            />
          </View>
        )}
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
  scrollContent: {
    flexGrow: 1,
  },
  portraitContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  landscapeContainer: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  landscapeLeft: {
    flex: 1,
    maxWidth: '55%',
  },
  landscapeRight: {
    flex: 1,
    maxWidth: '40%',
    justifyContent: 'center',
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