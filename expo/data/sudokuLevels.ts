export interface SudokuLevel {
  level: number;
  difficulty: number;
  puzzle: number[][];
  solution: number[][];
}

// Base valid Sudoku solutions to use as templates
const baseSolutions = [
  [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
  ],
  [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 1, 4, 3, 6, 5, 8, 9, 7],
    [3, 6, 5, 8, 9, 7, 2, 1, 4],
    [8, 9, 7, 2, 1, 4, 3, 6, 5],
    [5, 3, 1, 6, 4, 2, 9, 7, 8],
    [6, 4, 2, 9, 7, 8, 5, 3, 1],
    [9, 7, 8, 5, 3, 1, 6, 4, 2]
  ],
  [
    [9, 8, 7, 6, 5, 4, 3, 2, 1],
    [2, 4, 6, 1, 7, 3, 9, 8, 5],
    [3, 5, 1, 9, 2, 8, 7, 4, 6],
    [1, 2, 8, 5, 3, 7, 6, 9, 4],
    [6, 3, 4, 8, 9, 2, 1, 5, 7],
    [7, 9, 5, 4, 6, 1, 8, 3, 2],
    [5, 1, 9, 2, 8, 6, 4, 7, 3],
    [4, 7, 2, 3, 1, 9, 5, 6, 8],
    [8, 6, 3, 7, 4, 5, 2, 1, 9]
  ]
];

export const sudokuLevels: SudokuLevel[] = [];

// Lazy loading helper for better performance
export const getSudokuLevel = (levelNumber: number): SudokuLevel | null => {
  return sudokuLevels.find(level => level.level === levelNumber) || null;
};

// Get levels in a range for pagination
export const getSudokuLevelsRange = (start: number, end: number): SudokuLevel[] => {
  return sudokuLevels.filter(level => level.level >= start && level.level <= end);
};

// Shuffle array utility
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Transform a base solution to create variety
const transformSolution = (baseSolution: number[][], level: number): number[][] => {
  let solution = baseSolution.map(row => [...row]);
  
  // Apply transformations based on level for variety
  const transformations = level % 6;
  
  // Rotate 90 degrees
  if (transformations >= 1) {
    const rotated = Array(9).fill(null).map(() => Array(9).fill(0));
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        rotated[j][8 - i] = solution[i][j];
      }
    }
    solution = rotated;
  }
  
  // Swap rows within same 3x3 block
  if (transformations >= 2) {
    const blockIndex = level % 3;
    const startRow = blockIndex * 3;
    const rows = [0, 1, 2];
    const shuffledRows = shuffleArray(rows);
    
    const tempSolution = solution.map(row => [...row]);
    for (let i = 0; i < 3; i++) {
      solution[startRow + i] = tempSolution[startRow + shuffledRows[i]];
    }
  }
  
  // Swap columns within same 3x3 block
  if (transformations >= 3) {
    const blockIndex = (level + 1) % 3;
    const startCol = blockIndex * 3;
    const cols = [0, 1, 2];
    const shuffledCols = shuffleArray(cols);
    
    for (let i = 0; i < 9; i++) {
      const tempRow = [...solution[i]];
      for (let j = 0; j < 3; j++) {
        solution[i][startCol + j] = tempRow[startCol + shuffledCols[j]];
      }
    }
  }
  
  return solution;
};

// Generate level with better difficulty progression
const generateLevel = (level: number): SudokuLevel => {
  // More granular difficulty progression
  const difficulty = Math.min(10, Math.max(1, Math.ceil(level / 10)));
  
  // Use different base solutions and transformations for variety
  const baseIndex = level % baseSolutions.length;
  const baseSolution = baseSolutions[baseIndex];
  const solution = transformSolution(baseSolution, level);
  
  // Create puzzle by strategically removing numbers
  const puzzle = solution.map(row => [...row]);
  
  // Progressive difficulty: fewer given numbers for higher levels
  const minGiven = Math.max(17, 45 - (difficulty * 3)); // 17-42 given numbers
  const maxGiven = Math.max(25, 50 - (difficulty * 2)); // 25-48 given numbers
  const givenNumbers = Math.floor(minGiven + Math.random() * (maxGiven - minGiven));
  const cellsToRemove = 81 - givenNumbers;
  
  // Create list of all cell positions
  const allCells: {row: number, col: number}[] = [];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      allCells.push({row: i, col: j});
    }
  }
  
  // Shuffle and remove cells
  const shuffledCells = shuffleArray(allCells);
  for (let i = 0; i < cellsToRemove; i++) {
    const {row, col} = shuffledCells[i];
    puzzle[row][col] = 0;
  }

  return {
    level,
    difficulty,
    puzzle,
    solution
  };
};

// Generate all 100 levels with consistent seed for reproducibility
const generateAllLevels = () => {
  // Set a consistent seed for reproducible puzzles
  let seed = 12345;
  const seededRandom = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  
  // Override Math.random temporarily
  const originalRandom = Math.random;
  Math.random = seededRandom;
  
  const levels: SudokuLevel[] = [];
  for (let i = 1; i <= 100; i++) {
    levels.push(generateLevel(i));
  }
  
  // Restore original Math.random
  Math.random = originalRandom;
  
  return levels;
};

// Generate all levels
sudokuLevels.push(...generateAllLevels());