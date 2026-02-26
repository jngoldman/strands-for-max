import React, { useEffect, useState } from 'react';
import styles from './WinModal.module.css';

interface WinModalProps {
  isVisible: boolean;
  theme: string;
  onNewGame: () => void;
}

const WinModal: React.FC<WinModalProps> = ({ isVisible, theme, onNewGame }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => setShow(true), 500); // Slight delay for effect
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [isVisible]);

  if (!show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.confetti}>🎉</div>
        <h2>Great Job!</h2>
        <p>You found all the words for:</p>
        <h3 className={styles.themeName}>{theme}</h3>
        <button onClick={onNewGame}>Play Again</button>
      </div>
    </div>
  );
};

export default WinModal;
