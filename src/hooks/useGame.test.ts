import { renderHook, act } from '@testing-library/react';
import { useGame } from './useGame';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the static puzzles data
vi.mock('../data/puzzles.json', () => ({
  default: {
    kindergarten: [
      {
        grid: [
          ['C', 'A', 'T', 'X', 'X', 'X'],
          ['D', 'O', 'G', 'X', 'X', 'X'],
          ['A', 'N', 'I', 'M', 'A', 'L'],
          ['X', 'X', 'X', 'X', 'X', 'S'],
          ['X', 'X', 'X', 'X', 'X', 'X'],
          ['X', 'X', 'X', 'X', 'X', 'X'],
          ['X', 'X', 'X', 'X', 'X', 'X'],
          ['X', 'X', 'X', 'X', 'X', 'X']
        ],
        themeWords: [
          { text: "CAT", path: [[0, 0], [0, 1], [0, 2]] },
          { text: "DOG", path: [[1, 0], [1, 1], [1, 2]] }
        ],
        spangram: { text: "ANIMALS", path: [[2, 0], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [3, 5]] },
        clue: "Test Clue",
        theme: "Test Theme"
      }
    ]
  }
}));

describe('useGame', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize a puzzle from static library', () => {
    const { result } = renderHook(() => useGame('kindergarten'));
    expect(result.current.puzzle).not.toBeNull();
    expect(result.current.puzzle?.theme).toBe('Test Theme');
    expect(result.current.isWon).toBe(false);
  });

  it('should not be won until ALL words are found', () => {
    const { result } = renderHook(() => useGame('kindergarten'));
    
    // 1. Find CAT
    act(() => { result.current.handleSelection(0, 0); });
    act(() => { result.current.handleSelection(0, 1); });
    act(() => { result.current.handleSelection(0, 2); });
    act(() => { result.current.endSelection(true); });
    
    expect(result.current.foundWords.length).toBe(1);
    expect(result.current.isWon).toBe(false);

    // 2. Find DOG
    act(() => { result.current.handleSelection(1, 0); });
    act(() => { result.current.handleSelection(1, 1); });
    act(() => { result.current.handleSelection(1, 2); });
    act(() => { result.current.endSelection(true); });
    
    expect(result.current.foundWords.length).toBe(2);
    expect(result.current.isWon).toBe(false);

    // 3. Find ANIMALS (Spangram)
    act(() => { result.current.handleSelection(2, 0); });
    act(() => { result.current.handleSelection(2, 1); });
    act(() => { result.current.handleSelection(2, 2); });
    act(() => { result.current.handleSelection(2, 3); });
    act(() => { result.current.handleSelection(2, 4); });
    act(() => { result.current.handleSelection(2, 5); });
    act(() => { result.current.handleSelection(3, 5); });
    act(() => { result.current.endSelection(true); });
    
    expect(result.current.foundWords.length).toBe(3);
    expect(result.current.isWon).toBe(true);
  });

  it('should earn hint progress from non-theme words', () => {
    const { result } = renderHook(() => useGame('kindergarten'));
    
    // DOT is in commonWords: (1,0)=D, (1,1)=O, (0,2)=T
    act(() => { result.current.handleSelection(1, 0); });
    act(() => { result.current.handleSelection(1, 1); });
    act(() => { result.current.handleSelection(0, 2); });
    act(() => { result.current.endSelection(true); });
    
    expect(result.current.hintProgress).toBe(1);
  });

  it('should not earn hint progress if the word is actually a theme word', () => {
    const { result } = renderHook(() => useGame('kindergarten'));
    
    act(() => { result.current.handleSelection(0, 0); });
    act(() => { result.current.handleSelection(0, 1); });
    act(() => { result.current.handleSelection(0, 2); });
    act(() => { result.current.endSelection(true); });
    
    expect(result.current.hintProgress).toBe(0);
    expect(result.current.foundWords.some(w => w.text === 'CAT')).toBe(true);
  });
});
