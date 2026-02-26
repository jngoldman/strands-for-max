import { describe, it, expect } from 'vitest';
import { generatePuzzle } from './generator';

describe('Puzzle Generator', () => {
  const mockWords = ["LION", "TIGER", "BEAR", "ZEBRA", "SNAKE", "WOLF", "FOX", "DEER", "MONKEY", "PANDA"];
  const mockSpangram = "ANIMALS";

  it('should NEVER generate crossing lines (Diagonal Intersection)', () => {
    // Test 50 puzzles to be absolutely sure
    for (let i = 0; i < 50; i++) {
      const puzzle = generatePuzzle(8, 6, "Theme", "Clue", mockWords, mockSpangram);
      if (!puzzle) continue;

      const diagConnections = new Set<string>();
      const getConnKey = (r1: number, c1: number, r2: number, c2: number) => {
        const coords = [[r1, c1], [r2, c2]].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        return `${coords[0][0]},${coords[0][1]}|${coords[1][0]},${coords[1][1]}`;
      };

      const allWords = [puzzle.spangram, ...puzzle.themeWords];
      
      for (const word of allWords) {
        for (let j = 1; j < word.path.length; j++) {
          const [r1, c1] = word.path[j - 1];
          const [r2, c2] = word.path[j];
          
          // If it's a diagonal connection
          if (Math.abs(r1 - r2) === 1 && Math.abs(c1 - c2) === 1) {
            const midR = Math.min(r1, r2);
            const midC = Math.min(c1, c2);
            
            // The intersection diagonal would be the other two corners of this 2x2
            const crossKey = getConnKey(midR, midC + 1, midR + 1, midC);
            
            // Check if that cross exists in ANY previously processed word connection
            expect(diagConnections.has(crossKey), 
              `Crossing detected in puzzle ${i} at cell (${midR}, ${midC}) for word ${word.text}`
            ).toBe(false);
            
            // Add current connection to the set for future checks
            diagConnections.add(getConnKey(r1, c1, r2, c2));
          }
        }
      }
    }
  });

  it('should fill every single cell', () => {
    const puzzle = generatePuzzle(8, 6, "Theme", "Clue", mockWords, mockSpangram);
    if (puzzle) {
      puzzle.grid.forEach((row, r) => {
        row.forEach((cell, c) => {
          expect(cell, `Empty cell found at (${r}, ${c})`).not.toBe("");
        });
      });
    }
  });
});
