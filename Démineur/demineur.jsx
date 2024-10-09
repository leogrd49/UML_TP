import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Bomb } from 'lucide-react';

const GRID_SIZE = 10;
const MINE_COUNT = 15;

const Cell = ({ value, revealed, flagged, onClick, onContextMenu }) => {
  const baseClasses = "w-8 h-8 border border-gray-300 rounded flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const revealedClasses = revealed ? "bg-white" : "bg-gray-200 hover:bg-gray-300";
  const valueColors = {
    1: 'text-blue-500',
    2: 'text-green-500',
    3: 'text-red-500',
    4: 'text-purple-500',
    5: 'text-yellow-600',
    6: 'text-pink-500',
    7: 'text-teal-500',
    8: 'text-gray-700',
  };

  return (
    <button
      className={`${baseClasses} ${revealedClasses}`}
      onClick={onClick}
      onContextMenu={onContextMenu}
      aria-label={`Case ${revealed ? 'révélée' : 'cachée'}${flagged ? ', marquée d\'un drapeau' : ''}`}
    >
      {revealed && value !== 0 && value !== 'X' && (
        <span className={valueColors[value]}>{value}</span>
      )}
      {revealed && value === 'X' && <Bomb className="text-red-500" size={20} />}
      {!revealed && flagged && <Flag className="text-red-500" size={20} />}
    </button>
  );
};

const createBoard = () => {
  const board = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0));
  let minesPlaced = 0;

  while (minesPlaced < MINE_COUNT) {
    const row = Math.floor(Math.random() * GRID_SIZE);
    const col = Math.floor(Math.random() * GRID_SIZE);
    if (board[row][col] !== 'X') {
      board[row][col] = 'X';
      minesPlaced++;
    }
  }

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (board[row][col] !== 'X') {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (row + i >= 0 && row + i < GRID_SIZE && col + j >= 0 && col + j < GRID_SIZE) {
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
  const [board, setBoard] = useState(createBoard());
  const [revealed, setRevealed] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false)));
  const [flagged, setFlagged] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false)));
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);

  const revealCell = useCallback((row, col) => {
    if (revealed[row][col] || flagged[row][col] || gameOver) return;

    const newRevealed = [...revealed];
    newRevealed[row][col] = true;
    setRevealed(newRevealed);

    if (board[row][col] === 'X') {
      setGameOver(true);
    } else if (board[row][col] === 0) {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (row + i >= 0 && row + i < GRID_SIZE && col + j >= 0 && col + j < GRID_SIZE) {
            revealCell(row + i, col + j);
          }
        }
      }
    }
  }, [board, revealed, flagged, gameOver]);

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
    setBoard(createBoard());
    setRevealed(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false)));
    setFlagged(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(false)));
    setGameOver(false);
    setWin(false);
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Démineur</h1>
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
          {board.map((row, rowIndex) => (
            row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                value={cell}
                revealed={revealed[rowIndex][colIndex]}
                flagged={flagged[rowIndex][colIndex]}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => handleCellRightClick(e, rowIndex, colIndex)}
              />
            ))
          ))}
        </div>
      </div>
      <button
        className="mt-8 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
        onClick={resetGame}
      >
        Nouvelle partie
      </button>
      {(gameOver || win) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">{win ? 'Félicitations !' : 'Partie terminée'}</h2>
            <p className="mb-4">{win ? 'Vous avez gagné !' : 'Vous avez perdu. Essayez encore !'}</p>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors duration-300"
              onClick={resetGame}
            >
              Rejouer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Minesweeper;