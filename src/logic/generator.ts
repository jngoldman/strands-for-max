export interface ThemeWord {
  text: string;
  path: [number, number][];
}

export interface Puzzle {
  grid: string[][];
  themeWords: ThemeWord[];
  spangram: ThemeWord;
  clue: string;
  theme: string;
}

export type GridCoord = [number, number];

/**
 * STRANDS GENERATOR - VERSION 16 (HIGH SOLVABILITY)
 * Prioritizes speed and visual clarity.
 */
export function generatePuzzle(
  rows: number,
  cols: number,
  theme: string,
  clue: string,
  allWords: string[],
  spangram: string
): Puzzle | null {
  const targetChars = rows * cols;

  let grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(""));
  let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const diagConnections = new Set<string>();

  const getConnKey = (r1: number, c1: number, r2: number, c2: number) => {
    const coords = [[r1, c1], [r2, c2]].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return `${coords[0][0]},${coords[0][1]}|${coords[1][0]},${coords[1][1]}`;
  };

  const isCrossing = (r1: number, c1: number, r2: number, c2: number) => {
    if (Math.abs(r1 - r2) !== 1 || Math.abs(c1 - c2) !== 1) return false;
    const midR = Math.min(r1, r2), midC = Math.min(c1, c2);
    const isD1 = (r1 === midR && c1 === midC) || (r1 === Math.max(r1,r2) && c1 === Math.max(c1,c2));
    return isD1 ? diagConnections.has(getConnKey(midR, midC + 1, midR + 1, midC)) : diagConnections.has(getConnKey(midR, midC, midR + 1, midC + 1));
  };

  function getNeighbors(r: number, c: number, v: boolean[][]) {
    const res: GridCoord[] = [];
    const drs = [-1, -1, -1, 0, 0, 1, 1, 1], dcs = [-1, 0, 1, -1, 1, -1, 0, 1];
    for (let i = 0; i < 8; i++) {
      const nr = r + drs[i], nc = c + dcs[i];
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !v[nr][nc]) {
        if (!isCrossing(r, c, nr, nc)) res.push([nr, nc]);
      }
    }
    return res;
  }

  function findPath(word: string, r: number, c: number, path: GridCoord[]): GridCoord[] | null {
    visited[r][c] = true; grid[r][c] = word[path.length]; path.push([r, c]);
    let ck: string | null = null;
    if (path.length > 1 && Math.abs(path[path.length-2][0]-r)===1 && Math.abs(path[path.length-2][1]-c)===1) {
      ck = getConnKey(path[path.length-2][0], path[path.length-2][1], r, c);
      diagConnections.add(ck);
    }
    if (path.length === word.length) return [...path];
    const neighbors = getNeighbors(r, c, visited).sort(() => Math.random() - 0.5);
    for (const [nr, nc] of neighbors) {
      const res = findPath(word, nr, nc, path); if (res) return res;
    }
    if (ck) diagConnections.delete(ck);
    visited[r][c] = false; grid[r][c] = ""; path.pop();
    return null;
  }

  // 1. Pick a flexible subset of words
  const sortedWords = [...allWords].sort(() => Math.random() - 0.5);

  function solve(wordIdx: number, placed: ThemeWord[], spangramObj: ThemeWord): Puzzle | null {
    if (visited.every(row => row.every(v => v))) {
      return { grid: grid.map(r => [...r]), themeWords: placed, spangram: spangramObj, clue, theme };
    }
    if (wordIdx >= sortedWords.length) return null;

    const word = sortedWords[wordIdx];
    // Find first available cell
    let sr = -1, sc = -1;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) if (!visited[r][c]) { sr = r; sc = c; break; }
      if (sr !== -1) break;
    }

    if (sr !== -1) {
      // Try placing this word
      const path = findPath(word, sr, sc, []);
      if (path) {
        const res = solve(wordIdx + 1, [...placed, { text: word, path }], spangramObj);
        if (res) return res;
        for (let j = 1; j < path.length; j++) diagConnections.delete(getConnKey(path[j-1][0], path[j-1][1], path[j][0], path[j][1]));
        for (const [pr, pc] of path) { visited[pr][pc] = false; grid[pr][pc] = ""; }
      }
      // If word didn't fit or lead to solution, SKIP IT and try next word at same starting spot
      return solve(wordIdx + 1, placed, spangramObj);
    }
    return null;
  }

  // Main attempt loop
  for (let attempt = 0; attempt < 50; attempt++) {
    const isVert = Math.random() > 0.5;
    const starts = isVert ? Array.from({length: cols}, (_, j) => [0, j] as GridCoord) : Array.from({length: rows}, (_, j) => [j, 0] as GridCoord);
    for (const [sr, sc] of starts.sort(() => Math.random() - 0.5)) {
      grid = Array.from({ length: rows }, () => Array(cols).fill(""));
      visited = Array.from({ length: rows }, () => Array(cols).fill(false));
      diagConnections.clear();
      const sPath = (function walk(idx: number, r: number, c: number, p: GridCoord[]): GridCoord[] | null {
        visited[r][c] = true; grid[r][c] = spangram[idx]; p.push([r, c]);
        let ck: string | null = null;
        if (p.length > 1 && Math.abs(p[p.length-2][0]-r)===1 && Math.abs(p[p.length-2][1]-c)===1) {
          ck = getConnKey(p[p.length-2][0], p[p.length-2][1], r, c); diagConnections.add(ck);
        }
        if (idx === spangram.length - 1) { if (isVert ? r === rows - 1 : c === cols - 1) return [...p]; if (ck) diagConnections.delete(ck); visited[r][c] = false; grid[r][c] = ""; p.pop(); return null; }
        for (const [nr, nc] of getNeighbors(r, c, visited).sort(() => Math.random() - 0.5)) {
          const res = walk(idx + 1, nr, nc, p); if (res) return res;
        }
        if (ck) diagConnections.delete(ck); visited[r][c] = false; grid[r][c] = ""; p.pop(); return null;
      })(0, sr, sc, []);

      if (sPath) {
        const res = solve(0, [], { text: spangram, path: sPath });
        if (res) return res;
      }
    }
  }
  return null;
}
