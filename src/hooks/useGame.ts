import { useState, useCallback, useEffect } from 'react';
import type { Puzzle, ThemeWord } from '../logic/generator';
import staticPuzzles from '../data/puzzles.json';
import { commonWords } from '../data/dictionary';

export interface HintState {
  [word: string]: 1 | 2; 
}

const isPathMatch = (path1: [number, number][], path2: [number, number][]) => {
  if (path1.length !== path2.length) return false;
  const normal = path1.every(([r, c], i) => r === path2[i][0] && c === path2[i][1]);
  const reversed = path1.every(([r, c], i) => {
    const revIdx = path2.length - 1 - i;
    return r === path2[revIdx][0] && c === path2[revIdx][1];
  });
  return normal || reversed;
};

export function useGame(grade: string) {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [foundWords, setFoundWords] = useState<ThemeWord[]>([]);
  const [selection, setSelection] = useState<[number, number][]>([]);
  const [isSpangramFound, setIsSpangramFound] = useState(false);
  const [hintState, setHintState] = useState<HintState>({});
  const [hintProgress, setHintProgress] = useState(0); 
  const [hintCount, setHintCount] = useState(0);
  const [nonThemeWordsFound, setNonThemeWordsFound] = useState<string[]>([]);

  const startNewGame = useCallback(() => {
    const gradePuzzles = (staticPuzzles as any)[grade] || staticPuzzles.kindergarten;
    
    // Pick a random puzzle from the pre-generated set
    if (gradePuzzles.length > 0) {
      const p = gradePuzzles[Math.floor(Math.random() * gradePuzzles.length)];
      setPuzzle(p);
      setFoundWords([]);
      setSelection([]);
      setIsSpangramFound(false);
      setHintState({});
      setHintProgress(0);
      setHintCount(0);
      setNonThemeWordsFound([]);
    }
  }, [grade]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  const handleSelection = (r: number, c: number, isMove: boolean = false) => {
    setSelection(prev => {
      if (prev.length > 1) {
        const [pr, pc] = prev[prev.length - 2];
        if (pr === r && pc === c) return prev.slice(0, -1);
      }
      const existingIdx = prev.findIndex(([sr, sc]) => sr === r && sc === c);
      if (existingIdx !== -1 && !isMove) {
        if (existingIdx === prev.length - 1) return prev;
        return prev.slice(0, existingIdx + 1);
      }
      if (prev.some(([sr, sc]) => sr === r && sc === c)) return prev;
      if (prev.length > 0) {
        const [lr, lc] = prev[prev.length - 1];
        const isAdjacent = Math.abs(lr - r) <= 1 && Math.abs(lc - c) <= 1;
        if (!isAdjacent) {
          if (isMove) return prev;
          return [[r, c]];
        }
      }
      return [...prev, [r, c]];
    });
  };

  const endSelection = (isExplicitSubmit: boolean = false) => {
    if (!puzzle || selection.length === 0) return;
    if (!isExplicitSubmit && selection.length > 0) return;
    if (selection.length < 3) { setSelection([]); return; }

    const selectedPath = selection;
    const selectedWordText = selection.map(([r, c]) => puzzle.grid[r][c]).join("").toUpperCase();
    const selectedWordRevText = [...selectedWordText].reverse().join("");

    const match = [...puzzle.themeWords, puzzle.spangram].find(
      w => isPathMatch(selectedPath, w.path)
    );

    if (match) {
      setFoundWords(prev => {
        const alreadyFound = prev.some(fw => isPathMatch(selectedPath, fw.path));
        if (alreadyFound) return prev;
        if (match.text === puzzle.spangram.text) setIsSpangramFound(true);
        setHintState(hints => {
          const newHints = { ...hints };
          delete newHints[match.text];
          return newHints;
        });
        return [...prev, match];
      });
    } else {
      const isInPuzzleStrings = [...puzzle.themeWords, puzzle.spangram].some(
        w => w.text === selectedWordText || w.text === selectedWordRevText
      );
      if (!isInPuzzleStrings && (commonWords.has(selectedWordText) || commonWords.has(selectedWordRevText))) {
        const wordToStore = commonWords.has(selectedWordText) ? selectedWordText : selectedWordRevText;
        setNonThemeWordsFound(prev => {
          if (prev.includes(wordToStore)) return prev;
          setHintProgress(prog => {
            const next = prog + 1;
            if (next >= 3) { setHintCount(c => c + 1); return 0; }
            return next;
          });
          return [...prev, wordToStore];
        });
      }
    }
    setSelection([]);
  };

  const getHint = () => {
    if (!puzzle || hintCount <= 0) return;
    setHintState(prev => {
      const activeLevel1 = Object.entries(prev).find(([_, level]) => level === 1);
      if (activeLevel1) {
        const [wordText] = activeLevel1;
        setHintCount(c => c - 1);
        return { ...prev, [wordText]: 2 };
      } else {
        const remaining = [...puzzle.themeWords, puzzle.spangram].filter(
          w => !foundWords.some(fw => isPathMatch(w.path, fw.path)) && !prev[w.text]
        );
        if (remaining.length > 0) {
          const randomWord = remaining[Math.floor(Math.random() * remaining.length)];
          setHintCount(c => c - 1);
          return { ...prev, [randomWord.text]: 1 };
        }
      }
      return prev;
    });
  };

  const isWon = puzzle ? 
    [...puzzle.themeWords, puzzle.spangram].every(tw => 
      foundWords.some(fw => isPathMatch(tw.path, fw.path))
    ) : false;

  return {
    puzzle,
    foundWords,
    selection,
    isSpangramFound,
    hintState,
    hintProgress,
    hintCount,
    isWon,
    nonThemeWordsFound,
    handleSelection,
    endSelection,
    startNewGame,
    getHint
  };
}
