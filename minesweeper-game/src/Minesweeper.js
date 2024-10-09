import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Bomb } from 'lucide-react';

const DIFFICULTIES = {
  EASY: { size: 9, mines: 10 },
  MEDIUM: { size: 16, mines: 40 },
  HARD: { size: 24, mines: 99 },
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f0f0',
    fontFamily: "'Roboto', sans-serif",
  },
  header: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginBottom: '1.5rem',
    color: '#333',
    textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
  },
  controls: {
    marginBottom: '1.5rem',
    display: 'flex',
    gap: '1rem',
  },
  select: {
    padding: '0.75rem 1rem',
    fontSize: '1rem',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    transition: 'all 0.3s ease',
  },
  grid: {
    display: 'grid',
    gap: '4px',
    padding: '16px',
    backgroundColor: '#bdbdbd',
    borderRadius: '16px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  cell: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.3s, visibility 0.3s',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '3rem',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    transform: 'scale(0.9)',
    transition: 'transform 0.3s',
  },
  cheatButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '5px',
    fontSize: '0.8rem',
    backgroundColor: 'transparent',
    color: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'color 0.3s',
  },
};

const Cell = ({ value, revealed, flagged, exploded, cheating, onClick, onContextMenu, style }) => {
  const cellStyle = {
    ...style,
    backgroundColor: revealed 
      ? (value === 'X' ? '#ff4444' : '#fff') 
      : (flagged ? '#ffd700' : '#ddd'),
    color: revealed 
      ? (typeof value === 'number' 
        ? ['#0000FF', '#008000', '#FF0000', '#000080', '#800000', '#008080', '#000000', '#808080'][value - 1] || 'black'
        : 'black')
      : 'black',
    boxShadow: revealed ? 'inset 0 2px 4px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.1)',
    animation: exploded ? 'explode 0.5s' : (revealed ? 'reveal 0.3s' : 'none'),
  };

  return (
    <button
      style={cellStyle}
      onClick={onClick}
      onContextMenu={onContextMenu}
      aria-label={`Case ${revealed ? 'révélée' : 'cachée'}${flagged ? ', marquée d\'un drapeau' : ''}`}
    >
      {(revealed || cheating) && value === 'X' && <Bomb size={24} />}
      {revealed && value !== 0 && value !== 'X' && value}
      {!revealed && flagged && <Flag size={24} color="#ff0000" />}
    </button>
  );
};

const createBoard = (size, mineCount) => {
  const board = Array(size).fill().map(() => Array(size).fill(0));
  let minesPlaced = 0;

  while (minesPlaced < mineCount) {
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    if (board[row][col] !== 'X') {
      board[row][col] = 'X';
      minesPlaced++;
    }
  }

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (board[row][col] !== 'X') {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (row + i >= 0 && row + i < size && col + j >= 0 && col + j < size) {
              if (board[row + i][col + j] === 'X') count++;
            }
          }
        }
        board[row][col] = count;
      }
    }
  }

  return board;
};

const Minesweeper = () => {
  const [difficulty, setDifficulty] = useState(DIFFICULTIES.EASY);
  const [board, setBoard] = useState(createBoard(difficulty.size, difficulty.mines));
  const [revealed, setRevealed] = useState(Array(difficulty.size).fill().map(() => Array(difficulty.size).fill(false)));
  const [flagged, setFlagged] = useState(Array(difficulty.size).fill().map(() => Array(difficulty.size).fill(false)));
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [explodedMine, setExplodedMine] = useState(null);
  const [cheating, setCheating] = useState(false);

  const toggleCheat = () => {
    setCheating(!cheating);
  };

  const revealCell = useCallback((row, col) => {
    if (revealed[row][col] || flagged[row][col] || gameOver) return;

    const newRevealed = [...revealed];
    newRevealed[row][col] = true;
    setRevealed(newRevealed);

    if (board[row][col] === 'X') {
      setGameOver(true);
      setExplodedMine({ row, col });
    } else if (board[row][col] === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (row + i >= 0 && row + i < difficulty.size && col + j >= 0 && col + j < difficulty.size) {
            revealCell(row + i, col + j);
          }
        }
      }
    }
  }, [board, revealed, flagged, gameOver, difficulty.size]);

  const toggleFlag = useCallback((row, col) => {
    if (revealed[row][col] || gameOver) return;
    const newFlagged = [...flagged];
    newFlagged[row][col] = !newFlagged[row][col];
    setFlagged(newFlagged);
  }, [revealed, flagged, gameOver]);

  const handleCellClick = useCallback((row, col) => {
    revealCell(row, col);
  }, [revealCell]);

  const handleCellRightClick = useCallback((e, row, col) => {
    e.preventDefault();
    toggleFlag(row, col);
  }, [toggleFlag]);

  const resetGame = useCallback(() => {
    setBoard(createBoard(difficulty.size, difficulty.mines));
    setRevealed(Array(difficulty.size).fill().map(() => Array(difficulty.size).fill(false)));
    setFlagged(Array(difficulty.size).fill().map(() => Array(difficulty.size).fill(false)));
    setGameOver(false);
    setWin(false);
    setExplodedMine(null);
  }, [difficulty]);

  const changeDifficulty = useCallback((newDifficulty) => {
    setDifficulty(DIFFICULTIES[newDifficulty]);
    setBoard(createBoard(DIFFICULTIES[newDifficulty].size, DIFFICULTIES[newDifficulty].mines));
    setRevealed(Array(DIFFICULTIES[newDifficulty].size).fill().map(() => Array(DIFFICULTIES[newDifficulty].size).fill(false)));
    setFlagged(Array(DIFFICULTIES[newDifficulty].size).fill().map(() => Array(DIFFICULTIES[newDifficulty].size).fill(false)));
    setGameOver(false);
    setWin(false);
    setExplodedMine(null);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        resetGame();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [resetGame]);

  useEffect(() => {
    if (!gameOver) {
      const allNonMinesRevealed = board.every((row, rowIndex) =>
        row.every((cell, colIndex) =>
          cell === 'X' || revealed[rowIndex][colIndex]
        )
      );
      if (allNonMinesRevealed) {
        setWin(true);
        setGameOver(true);
      }
    }
  }, [board, revealed, gameOver]);

  return (
    <div style={styles.container}>
      <h1 style={styles.header}>Démineur</h1>
      <button 
        style={styles.cheatButton} 
        onClick={toggleCheat}
        onMouseEnter={(e) => e.target.style.color = '#f0f0f0'}
        onMouseLeave={(e) => e.target.style.color = 'transparent'}
      >
        Triche
      </button>
      <div style={styles.controls}>
        <select
          style={styles.select}
          onChange={(e) => changeDifficulty(e.target.value)}
          value={Object.keys(DIFFICULTIES).find(key => DIFFICULTIES[key] === difficulty)}
        >
          <option value="EASY">Facile</option>
          <option value="MEDIUM">Moyen</option>
          <option value="HARD">Difficile</option>
        </select>
        <button style={styles.button} onClick={resetGame}>
          Nouvelle partie
        </button>
      </div>
      <div style={{...styles.grid, gridTemplateColumns: `repeat(${difficulty.size}, 40px)`}}>
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              revealed={revealed[rowIndex][colIndex]}
              flagged={flagged[rowIndex][colIndex]}
              exploded={explodedMine && explodedMine.row === rowIndex && explodedMine.col === colIndex}
              cheating={cheating}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
              style={styles.cell}
            />
          ))
        ))}
      </div>
      {(gameOver || win) && (
        <div style={{...styles.modal, opacity: 1, visibility: 'visible'}}>
          <div style={{...styles.modalContent, transform: 'scale(1)'}}>
            <h2>{win ? 'Félicitations !' : 'Partie terminée'}</h2>
            <p>{win ? 'Vous avez gagné !' : 'Vous avez perdu. Essayez encore !'}</p>
            <button style={styles.button} onClick={resetGame}>
              Rejouer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Minesweeper;