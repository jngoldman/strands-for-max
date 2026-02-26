import React, { useState, useEffect } from 'react';
import Grid from './components/Grid';
import WinModal from './components/WinModal';
import { useGame } from './hooks/useGame';
import './App.css';

const App: React.FC = () => {
  const [grade, setGrade] = useState('grade1');
  const [loadingSeconds, setLoadingSeconds] = useState(0);
  const { 
    puzzle, 
    foundWords, 
    selection, 
    hintState,
    hintProgress,
    hintCount,
    isWon,
    handleSelection, 
    endSelection, 
    startNewGame,
    getHint
  } = useGame(grade);

  useEffect(() => {
    let interval: any;
    if (!puzzle) {
      interval = setInterval(() => {
        setLoadingSeconds(s => s + 1);
      }, 1000);
    } else {
      setLoadingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [puzzle]);

  if (!puzzle) return (
    <div className="loading">
      <div className="loading-content">
        <h2>Creating your puzzle...</h2>
        <div className="timer">{loadingSeconds}s</div>
        <p>Searching for a perfect layout!</p>
      </div>
    </div>
  );

  const wordsToFind = puzzle.themeWords.length + 1; // +1 for spangram
  const foundCount = foundWords.length;

  return (
    <div className="app">
      <WinModal 
        isVisible={isWon} 
        theme={puzzle.theme} 
        onNewGame={startNewGame} 
      />
      <header>
        <h1>Strands for Max</h1>
        <div className="controls">
          <select value={grade} onChange={(e) => setGrade(e.target.value)}>
            <option value="grade1">1st Grade</option>
            <option value="grade2">2nd Grade</option>
          </select>
          <button onClick={startNewGame}>New Game</button>
        </div>
      </header>

      <main>
        <div className="game-info">
          <div className="clue-box">
            <span className="clue-label">TODAY'S CLUE:</span>
            <h2 className="clue-text">"{puzzle.clue}"</h2>
          </div>
          
          <div className="hint-section">
            <div className="hint-progress-container">
              <div className="hint-label">HINT PROGRESS</div>
              <div className="hint-bar">
                <div className={`hint-segment ${hintProgress >= 1 ? 'filled' : ''}`}></div>
                <div className={`hint-segment ${hintProgress >= 2 ? 'filled' : ''}`}></div>
                <div className={`hint-segment ${hintProgress >= 3 ? 'filled' : ''}`}></div>
              </div>
            </div>
            <button 
              className="hint-button" 
              onClick={getHint} 
              disabled={hintCount === 0 || isWon}
            >
              HINT {hintCount > 0 ? `(${hintCount})` : ''}
            </button>
          </div>

          <div className="progress">
            Found {foundCount} of {wordsToFind} words
          </div>
        </div>

        <Grid 
          grid={puzzle.grid}
          selection={selection}
          onSelectionStart={handleSelection}
          onSelectionMove={handleSelection}
          onSelectionEnd={endSelection}
          foundWords={foundWords}
          spangram={puzzle.spangram}
          hintState={hintState}
          themeWords={puzzle.themeWords}
        />

        <div className="word-list">
          <h3>Words Found:</h3>
          <div className="chips">
            {foundWords.map((w, i) => (
              <span key={`${w.text}-${i}`} className={`chip ${w.text === puzzle.spangram.text ? 'spangram-chip' : ''}`}>
                {w.text}
              </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
