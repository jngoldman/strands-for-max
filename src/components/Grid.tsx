import React, { useState, useRef } from 'react';
import styles from './Grid.module.css';

interface GridProps {
  grid: string[][];
  selection: [number, number][];
  onSelectionStart: (r: number, c: number, isMove?: boolean) => void;
  onSelectionMove: (r: number, c: number, isMove?: boolean) => void;
  onSelectionEnd: (isExplicitSubmit?: boolean) => void;
  foundWords: { text: string; path: [number, number][] }[];
  spangram: { text: string; path: [number, number][] };
  hintState: { [word: string]: 1 | 2 };
  themeWords: { text: string; path: [number, number][] }[];
}

const Grid: React.FC<GridProps> = ({
  grid,
  selection,
  onSelectionStart,
  onSelectionMove,
  onSelectionEnd,
  foundWords,
  spangram,
  hintState,
  themeWords
}) => {
  const [isPointerDown, setIsPointerDown] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const lastTapRef = useRef<{time: number, r: number, c: number} | null>(null);

  // Helper to convert grid coord to SVG percentage
  const getCoord = (r: number, c: number) => {
    const x = (c * 100 / 6) + (100 / 12);
    const y = (r * 100 / 8) + (100 / 16);
    return `${x},${y}`;
  };

  const getPoints = (path: [number, number][]) => {
    return path.map(([r, c]) => getCoord(r, c)).join(" ");
  };

  const handlePointerDown = (e: React.PointerEvent, r: number, c: number) => {
    if (e.pointerType === 'touch') {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    
    setIsPointerDown(true);
    setHasMoved(false);
    
    const now = Date.now();
    const lastTap = lastTapRef.current;
    
    if (lastTap && lastTap.r === r && lastTap.c === c && now - lastTap.time < 300) {
      if (selection.length > 1) {
        onSelectionEnd(true);
        setIsPointerDown(false);
        lastTapRef.current = null;
        return;
      }
    }

    lastTapRef.current = { time: now, r, c };

    const last = selection[selection.length - 1];
    if (!last || (last[0] !== r || last[1] !== c)) {
      onSelectionStart(r, c, false);
    }
  };

  const handlePointerEnter = (r: number, c: number) => {
    if (isPointerDown) {
      setHasMoved(true);
      onSelectionMove(r, c, true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDown) return;
    
    if (e.pointerType === 'touch') {
      const element = document.elementFromPoint(e.clientX, e.clientY);
      if (element) {
        const cell = element.closest('[data-r]') as HTMLElement;
        if (cell) {
          const dataset = cell.dataset;
          if (dataset.r && dataset.c) {
            const row = parseInt(dataset.r);
            const col = parseInt(dataset.c);
            const last = selection[selection.length - 1];
            if (last && (last[0] !== row || last[1] !== col)) {
              setHasMoved(true);
              onSelectionMove(row, col, true);
            }
          }
        }
      }
    }
  };

  const handlePointerUp = () => {
    if (hasMoved && selection.length > 1) {
      onSelectionEnd(true);
    }
    setIsPointerDown(false);
    setHasMoved(false);
  };

  const isFound = (r: number, c: number) => {
    return foundWords.some(w => w.path.some(([pr, pc]) => pr === r && pc === c));
  };

  const isSpangram = (r: number, c: number) => {
    return spangram.path.some(([pr, pc]) => pr === r && pc === c) && 
           foundWords.some(w => w.text === spangram.text);
  };

  const isSelected = (r: number, c: number) => {
    return selection.some(([sr, sc]) => sr === r && sc === c);
  };

  const isHintedLevel1 = (r: number, c: number) => {
    return Object.keys(hintState).some((text) => {
      const word = [...themeWords, spangram].find(w => w.text === text);
      return word?.path.some(([pr, pc]) => pr === r && pc === c);
    });
  };

  return (
    <div 
      className={styles.gridContainer} 
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setIsPointerDown(false);
        setHasMoved(false);
      }}
      style={{ touchAction: 'none' }}
    >
      <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Draw Level 2 Hint Paths (Dotted) */}
        {Object.entries(hintState).map(([text, level]) => {
          if (level !== 2) return null;
          const word = [...themeWords, spangram].find(w => w.text === text);
          if (!word) return null;
          return (
            <polyline
              key={`hint-path-${text}`}
              points={getPoints(word.path)}
              className={styles.hintLine}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}

        {/* Draw found words */}
        {foundWords.map((word, wi) => (
          <polyline
            key={`found-${wi}`}
            points={getPoints(word.path)}
            className={word.text === spangram.text ? styles.spangramLine : styles.foundLine}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {/* Draw active selection */}
        {selection.length > 1 && (
          <polyline
            points={getPoints(selection)}
            className={styles.selectionLine}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
      {grid.map((row, r) => (
        <div key={r} className={styles.row}>
          {row.map((char, c) => (
            <div
              key={`${r}-${c}`}
              data-r={r}
              data-c={c}
              className={`${styles.cell} ${isSelected(r, c) ? styles.selected : ""} ${isFound(r, c) ? styles.found : ""} ${isSpangram(r, c) ? styles.spangram : ""} ${isHintedLevel1(r, c) ? styles.hinted : ""}`}
              onPointerDown={(e) => handlePointerDown(e, r, c)}
              onPointerEnter={() => handlePointerEnter(r, c)}
              onPointerUp={handlePointerUp}
            >
              {char}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Grid;
