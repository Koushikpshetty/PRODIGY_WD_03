class TicTacToe {
    constructor() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.gameMode = 'pvp';
        this.scores = {
            x: 0,
            o: 0,
            draws: 0
        };
        this.winningCombinations = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        this.initializeGame();
    }

    initializeGame() {
        this.cells = document.querySelectorAll('.cell');
        this.statusDisplay = document.getElementById('status');
        this.resetBtn = document.getElementById('resetBtn');
        this.resetScoresBtn = document.getElementById('resetScoresBtn');
        this.modeSelect = document.getElementById('mode');
        this.xWinsDisplay = document.getElementById('xWins');
        this.oWinsDisplay = document.getElementById('oWins');
        this.drawsDisplay = document.getElementById('draws');

        this.cells.forEach(cell => {
            cell.addEventListener('click', (e) => this.handleCellClick(e));
        });
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.resetScoresBtn.addEventListener('click', () => this.clearScores());
        this.modeSelect.addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.resetGame();
        });

        this.updateStatus();
        this.loadScores();
    }

    handleCellClick(event) {
        const cell = event.target;
        const index = cell.dataset.index;

        if (this.board[index] !== null || this.gameOver) {
            return;
        }

        this.board[index] = this.currentPlayer;
        cell.textContent = this.currentPlayer;
        cell.classList.add(this.currentPlayer.toLowerCase());

        if (this.checkWinner(this.currentPlayer)) {
            this.scores[this.currentPlayer.toLowerCase()]++;
            this.endGame(`Player ${this.currentPlayer} wins!`);
            return;
        }

        if (this.isBoardFull()) {
            this.scores.draws++;
            this.endGame('It\'s a draw!');
            return;
        }

        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

        if (this.gameMode === 'pvc' && this.currentPlayer === 'O' && !this.gameOver) {
            this.statusDisplay.textContent = 'Computer is thinking...';
            setTimeout(() => this.makeAIMove(), 500);
        } else {
            this.updateStatus();
        }
    }

    makeAIMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === null ? index : null)
            .filter(val => val !== null);

        if (availableMoves.length === 0) return;

        const bestMove = this.minimax(this.board, 'O', -Infinity, Infinity).index;
        this.board[bestMove] = 'O';
        const cell = document.querySelector(`[data-index="${bestMove}"]`);
        cell.textContent = 'O';
        cell.classList.add('o');

        if (this.checkWinner('O')) {
            this.scores.o++;
            this.endGame('Computer wins!');
            return;
        }

        if (this.isBoardFull()) {
            this.scores.draws++;
            this.endGame('It\'s a draw!');
            return;
        }

        this.currentPlayer = 'X';
        this.updateStatus();
    }

    minimax(board, player, alpha, beta, depth = 0) {
        const opponent = player === 'O' ? 'X' : 'O';

        if (this.checkWinner('O', board)) {
            return { score: 10 - depth, index: -1 };
        }
        if (this.checkWinner('X', board)) {
            return { score: depth - 10, index: -1 };
        }
        if (this.isBoardFull(board)) {
            return { score: 0, index: -1 };
        }

        const availableMoves = board
            .map((cell, index) => cell === null ? index : null)
            .filter(val => val !== null);

        let bestMove = null;

        if (player === 'O') {
            let maxScore = -Infinity;
            for (const move of availableMoves) {
                const newBoard = [...board];
                newBoard[move] = 'O';
                const result = this.minimax(newBoard, opponent, alpha, beta, depth + 1);
                if (result.score > maxScore) {
                    maxScore = result.score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, result.score);
                if (beta <= alpha) break;
            }
            return { score: maxScore, index: bestMove };
        } else {
            let minScore = Infinity;
            for (const move of availableMoves) {
                const newBoard = [...board];
                newBoard[move] = 'X';
                const result = this.minimax(newBoard, opponent, alpha, beta, depth + 1);
                if (result.score < minScore) {
                    minScore = result.score;
                    bestMove = move;
                }
                beta = Math.min(beta, result.score);
                if (beta <= alpha) break;
            }
            return { score: minScore, index: bestMove };
        }
    }

    checkWinner(player, board = this.board) {
        return this.winningCombinations.some(combination =>
            combination.every(index => board[index] === player)
        );
    }

    isBoardFull(board = this.board) {
        return board.every(cell => cell !== null);
    }

    endGame(message) {
        this.gameOver = true;
        this.statusDisplay.textContent = message;
        this.statusDisplay.classList.add('winner-animation');
        this.saveScores();
        this.updateScores();
    }

    updateStatus() {
        this.statusDisplay.textContent = `Player ${this.currentPlayer}'s turn`;
        this.statusDisplay.classList.remove('winner-animation');
    }

    resetGame() {
        this.board = Array(9).fill(null);
        this.currentPlayer = 'X';
        this.gameOver = false;

        this.cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o');
        });

        this.updateStatus();
    }

    updateScores() {
        this.xWinsDisplay.textContent = this.scores.x;
        this.oWinsDisplay.textContent = this.scores.o;
        this.drawsDisplay.textContent = this.scores.draws;
        this.saveScores();
    }

    saveScores() {
        localStorage.setItem('ticTacToeScores', JSON.stringify(this.scores));
    }

    loadScores() {
        const saved = localStorage.getItem('ticTacToeScores');
        if (saved) {
            this.scores = JSON.parse(saved);
            this.updateScores();
        }
    }

    clearScores() {
        this.scores = { x: 0, o: 0, draws: 0 };
        this.updateScores();
        this.resetGame();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});
