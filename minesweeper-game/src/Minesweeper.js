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
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
    color: '#333',
  },
  controls: {
    marginBottom: '1rem',
  },
  select: {
    padding: '0.5rem',
    marginRight: '0.5rem',
    fontSize: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  grid: {
    display: 'grid',
    gap: '2px',
    padding: '10px',
    backgroundColor: '#bdbdbd',
    borderRadius: '8px',
  },
  cell: {
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '4px',
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
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
  },
};

const Cell = ({ value, revealed, flagged, exploded, onClick, onContextMenu, style }) => {
  const cellStyle = {
    ...style,
    backgroundColor: revealed ? (value === 'X' ? '#ff4444' : '#fff') : '#ddd',
    color: revealed 
      ? (typeof value === 'number' 
        ? ['#0000FF', '#008000', '#FF0000', '#000080', '#800000', '#008080', '#000000', '#808080'][value - 1] || 'black'
        : 'black')
      : 'black',
  };

  if (exploded) {
    cellStyle.backgroundColor = '#ff4444';
    cellStyle.animation = 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite';
  }

  return (
    <button
      style={cellStyle}
      onClick={onClick}
      onContextMenu={onContextMenu}
      aria-label={`Case ${revealed ? 'révélée' : 'cachée'}${flagged ? ', marquée d\'un drapeau' : ''}`}
    >
      {revealed && value !== 0 && value !== 'X' && value}
      {revealed && value === 'X' && <Bomb size={20} />}
      {!revealed && flagged && <Flag size={20} />}
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
      <div style={{...styles.grid, gridTemplateColumns: `repeat(${difficulty.size}, 30px)`}}>
        {board.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <Cell
              key={`${rowIndex}-${colIndex}`}
              value={cell}
              revealed={revealed[rowIndex][colIndex]}
              flagged={flagged[rowIndex][colIndex]}
              exploded={explodedMine && explodedMine.row === rowIndex && explodedMine.col === colIndex}
              onClick={() => handleCellClick(rowIndex, colIndex)}
              onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
              style={styles.cell}
            />
          ))
        ))}
      </div>
      {(gameOver || win) && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
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