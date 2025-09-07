import { useState, useEffect, useCallback, useMemo } from 'react';

interface SudokuLevel {
  level: number;
  difficulty: number;
  puzzle: number[][];
  solution: number[][];
}

interface SelectedCell {
  row: number;
  col: number;
}

export function useSudokuGame(level: SudokuLevel | null) {
  // Memoize initial grid to prevent unnecessary re-renders
  const initialGrid = useMemo(() => {
    if (!level) {
      return Array(9).fill(null).map(() => Array(9).fill(0));
    }
    return level.puzzle.map(row => [...row]);
  }, [level]);

  const [grid, setGrid] = useState<number[][]>(initialGrid);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [errors, setErrors] = useState<boolean[][]>(() => 
    Array(9).fill(null).map(() => Array(9).fill(false))
  );
  const [timer, setTimer] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const resetGame = useCallback(() => {
    if (!level) return;
    setGrid(level.puzzle.map(row => [...row]));
    setErrors(Array(9).fill(null).map(() => Array(9).fill(false)));
    setSelectedCell(null);
    setTimer(0);
    setIsComplete(false);
    setHintsUsed(0);
  }, [level]);

  // Initialize game when level changes
  useEffect(() => {
    if (level) {
      setGrid(level.puzzle.map(row => [...row]));
      setErrors(Array(9).fill(null).map(() => Array(9).fill(false)));
      setSelectedCell(null);
      setTimer(0);
      setIsComplete(false);
      setHintsUsed(0);
    }
  }, [level]);

  // Timer
  useEffect(() => {
    if (isComplete) return;
    
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isComplete]);

  // Memoize validation function for better performance
  const isValidMove = useCallback((grid: number[][], row: number, col: number, num: number): boolean => {
    if (num === 0) return true; // Empty cell is always valid
    
    // Check row
    for (let i = 0; i < 9; i++) {
      if (i !== col && grid[row][i] === num) return false;
    }

    // Check column
    for (let i = 0; i < 9; i++) {
      if (i !== row && grid[i][col] === num) return false;
    }

    // Check 3x3 box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = boxRow; i < boxRow + 3; i++) {
      for (let j = boxCol; j < boxCol + 3; j++) {
        if ((i !== row || j !== col) && grid[i][j] === num) return false;
      }
    }

    return true;
  }, []);

  const updateCell = useCallback((row: number, col: number, value: number) => {
    // Don't allow editing original cells
    if (!level || level.puzzle[row][col] !== 0) return;

    setGrid(prevGrid => {
      const newGrid = prevGrid.map(r => [...r]);
      newGrid[row][col] = value;
      return newGrid;
    });
  }, [level]);

  // Separate effect for error checking to optimize performance
  useEffect(() => {
    const newErrors = Array(9).fill(null).map(() => Array(9).fill(false));
    
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (grid[i][j] !== 0 && !isValidMove(grid, i, j, grid[i][j])) {
          newErrors[i][j] = true;
        }
      }
    }
    
    setErrors(newErrors);

    // Check if puzzle is complete
    const isFull = grid.every(row => row.every(cell => cell !== 0));
    const hasNoErrors = newErrors.every(row => row.every(cell => !cell));
    
    if (isFull && hasNoErrors && !isComplete) {
      setIsComplete(true);
    }
  }, [grid, isValidMove, isComplete]);

  const checkSolution = useCallback(() => {
    if (!level) return false;
    return grid.every((row, i) =>
      row.every((cell, j) => cell === level.solution[i][j])
    );
  }, [grid, level]);

  const useHint = useCallback(() => {
    if (!selectedCell || !level || hintsUsed >= 3) return;
    
    const { row, col } = selectedCell;
    if (level.puzzle[row][col] !== 0) return; // Can't hint on original cells
    
    const solution = level.solution[row][col];
    updateCell(row, col, solution);
    setHintsUsed(prev => prev + 1);
  }, [selectedCell, level, hintsUsed, updateCell]);

  // Get available numbers for selected cell
  const availableNumbers = useMemo(() => {
    if (!selectedCell) return [];
    
    const { row, col } = selectedCell;
    const available: number[] = [];
    
    for (let num = 1; num <= 9; num++) {
      if (isValidMove(grid, row, col, num)) {
        available.push(num);
      }
    }
    
    return available;
  }, [selectedCell, grid, isValidMove]);

  return {
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
    checkSolution,
    useHint,
  };
}