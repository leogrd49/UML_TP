// Paramètres du jeu
const rows = 10;
const cols = 10;
const totalMines = 10;
let board = [];
let revealed = [];
let gameOver = false;

// Réinitialiser le jeu
function resetGame() {
    board = [];
    revealed = [];
    gameOver = false;
    document.getElementById('board').innerHTML = '';
    createBoard();
    placeMines();
    calculateAdjacentMines();
}

// Créer le plateau
function createBoard() {
    const boardContainer = document.getElementById('board');
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        revealed[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i][j] = 0; // Initialiser les cases avec 0 (pas de mine)
            revealed[i][j] = false; // Les cases sont toutes cachées au début

            const cell = document.createElement('div');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.classList.add('w-12', 'h-12', 'bg-gray-300', 'flex', 'items-center', 'justify-center', 'cursor-pointer', 'border', 'border-gray-400', 'hover:bg-gray-400', 'transition-colors', 'duration-300', 'cell');
            cell.addEventListener('click', handleClick);
            boardContainer.appendChild(cell);
        }
    }
}

// Placer les mines aléatoirement
function placeMines() {
    let minesPlaced = 0;
    while (minesPlaced < totalMines) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (board[row][col] !== 'M') {
            board[row][col] = 'M';
            minesPlaced++;
        }
    }
}

// Calculer les nombres de mines adjacentes
function calculateAdjacentMines() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j] === 'M') continue;
            let count = 0;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (i + x >= 0 && i + x < rows && j + y >= 0 && j + y < cols) {
                        if (board[i + x][j + y] === 'M') {
                            count++;
                        }
                    }
                }
            }
            board[i][j] = count;
        }
    }
}

// Révéler une case
function revealCell(row, col) {
    if (gameOver || revealed[row][col]) return;
    revealed[row][col] = true;
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    const value = board[row][col];

    if (value === 'M') {
        cell.classList.add('bg-red-500', 'text-white');
        cell.textContent = '💣';
        gameOver = true;
        alert('Game Over! Une mine a explosé!');
        return;
    }

    cell.classList.add('bg-gray-200', 'cursor-default');
    if (value > 0) {
        cell.textContent = value;
        cell.classList.add('text-black');
    } else {
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (row + x >= 0 && row + x < rows && col + y >= 0 && col + y < cols) {
                    if (!revealed[row + x][col + y]) {
                        revealCell(row + x, col + y);
                    }
                }
            }
        }
    }
}

// Gestion du clic sur une case
function handleClick(event) {
    if (gameOver) return;
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;
    revealCell(row, col);
}

// Lancer une nouvelle partie
document.getElementById('reset').addEventListener('click', resetGame);

// Démarrer le jeu au chargement de la page
resetGame();
