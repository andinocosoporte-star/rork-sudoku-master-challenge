import React, { memo, useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { Colors } from '@/constants/colors';

type Coord = { row: number; col: number };

interface SudokuGridProps {
  grid: number[][];                       // matriz 9x9, 0 = vacío
  onCellPress?: (row: number, col: number) => void;
  selected?: Coord | null;                // celda seleccionada
  fixedCells?: boolean[][];               // true si es valor original (no editable)
  sameNumber?: Set<string>;               // coords "r,c" con mismo número que la seleccionada
  conflicts?: Set<string>;                // coords "r,c" en conflicto
  disabled?: boolean;
}

const COLS = 9;
const GAP = 2; // espacio entre celdas; si cambias, también calza exacto

const key = (r: number, c: number) => `${r},${c}`;

const SudokuGrid = memo(function SudokuGrid({
  grid,
  onCellPress,
  selected = null,
  fixedCells,
  sameNumber,
  conflicts,
  disabled,
}: SudokuGridProps) {
  const [containerWidth, setContainerWidth] = useState<number>(320);

  const cellSize = useMemo(() => {
    const gapsWidth = GAP * (COLS - 1);
    return Math.floor((containerWidth - gapsWidth) / COLS);
  }, [containerWidth]);

  const handleLayout = useCallback((e: any) => {
    setContainerWidth(e.nativeEvent.layout.width);
  }, []);

  const renderCell = useCallback(
    (row: number, col: number) => {
      const value = grid[row]?.[col] ?? 0;
      const isSelected = selected && selected.row === row && selected.col === col;
      const isFixed = fixedCells?.[row]?.[col] ?? false;
      const isSame = sameNumber?.has(key(row, col));
      const isConflict = conflicts?.has(key(row, col));

      // Bordes gruesos para subcuadros 3x3
      const thickRight = (col === 2 || col === 5) ? styles.thickRight : null;
      const thickBottom = (row === 2 || row === 5) ? styles.thickBottom : null;

      return (
        <TouchableOpacity
          key={key(row, col)}
          disabled={disabled || isFixed}
          activeOpacity={0.7}
          onPress={() => onCellPress?.(row, col)}
          testID={`cell-${row}-${col}`}
        >
          <View
            style={[
              styles.cell,
              { width: cellSize, height: cellSize },
              isSelected && styles.selectedCell,
              isSame && styles.sameNumberCell,
              isConflict && styles.conflictCell,
              thickRight,
              thickBottom,
            ]}
          >
            {value !== 0 && (
              <Text
                style={[
                  styles.cellText,
                  isFixed && styles.fixedText,
                  isSelected && styles.selectedText,
                  isConflict && styles.conflictText,
                ]}
              >
                {value}
              </Text>
            )}
          </View>
        </TouchableOpacity>
      );
    },
    [cellSize, grid, selected, fixedCells, sameNumber, conflicts, onCellPress, disabled]
  );

  return (
    <View
      style={styles.wrapper}
      onLayout={handleLayout}
    >
      {/* 9 filas */}
      {Array.from({ length: 9 }, (_, r) => (
        <View key={`row-${r}`} style={styles.row}>
          {Array.from({ length: 9 }, (_, c) => renderCell(r, c))}
        </View>
      ))}
    </View>
  );
});

export default SudokuGrid;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.boardContainer,
    padding: 8,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    gap: GAP,
    marginBottom: GAP,
  },
  cell: {
    backgroundColor: Colors.cellBackground,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.gridLineThin,
  },
  selectedCell: {
    backgroundColor: Colors.cellSelected,
  },
  sameNumberCell: {
    backgroundColor: Colors.numberSameAsSelected,
  },
  conflictCell: {
    backgroundColor: Colors.cellError,
  },
  cellText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.numberNormal,
  },

  // Estados
  fixedText: {
    color: Colors.numberFixed,
    fontWeight: '500',
  },
  selectedText: {
    color: Colors.numberSelected,
    fontWeight: '700',
  },
  conflictText: {
    color: Colors.error,
    fontWeight: '700',
  },

  // Bordes gruesos para cajas 3x3
  thickRight: {
    borderRightWidth: 2,
    borderRightColor: Colors.gridLineThick,
  },
  thickBottom: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.gridLineThick,
  },
});
