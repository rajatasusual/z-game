const boardSize = 4;
let grid = [];
let score = 0;

// Store the current grid state before any move
let previousGrid = [];

// Function to copy the current grid state
function copyGrid(grid) {
    return grid.map(row => [...row]);
}

// Initialize the game grid
function initializeGrid() {
    grid = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));
    addRandomLetter();
}

// Add a random letter to an empty cell
function addRandomLetter() {
    const emptyCells = [];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (!grid[r][c]) {
                emptyCells.push({ r, c });
            }
        }
    }
    if (emptyCells.length) {
        const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        grid[r][c] = 'A'; // Start with 'A' or other letters as needed
    }
}

// Combine letters in the direction of movement
function combine(line) {
    const newLine = [];
    let lastValue = null;
    let lastIndex = -1;

    line.forEach(value => {
        if (value) {
            if (lastValue === value) {
                newLine[lastIndex] = getCombinedValue(value);
                lastValue = null; // Reset lastValue
            } else {
                newLine.push(value);
                lastValue = value;
                lastIndex++;
            }
        }
    });

    while (newLine.length < boardSize) {
        newLine.push('');
    }

    return newLine;
}

// Get combined value and update the score
function getCombinedValue(value) {
    const isVowelCombination = 'AEIOU'.includes(value);
    score += isVowelCombination ? 2 : -1; // Award points for vowels, penalty for consonants
    return String.fromCharCode(value.charCodeAt(0) + 1); // Move to next letter
}

// Game move logic
function move(direction) {
    let moved = false; // Flag to track if any tiles have moved

    const movements = {
        up: () => {
            for (let c = 0; c < boardSize; c++) {
                const column = [];
                for (let r = 0; r < boardSize; r++) {
                    column.push(grid[r][c]);
                }
                const newColumn = combine(column);
                for (let r = 0; r < boardSize; r++) {
                    if (grid[r][c] !== newColumn[r]) moved = true; // Check if a tile moved
                    grid[r][c] = newColumn[r];
                }
            }
        },
        down: () => {
            for (let c = 0; c < boardSize; c++) {
                const column = [];
                for (let r = 0; r < boardSize; r++) {
                    column.push(grid[r][c]);
                }
                const newColumn = combine(column.reverse());
                for (let r = 0; r < boardSize; r++) {
                    if (grid[r][c] !== newColumn[boardSize - 1 - r]) moved = true; // Check if a tile moved
                    grid[r][c] = newColumn[boardSize - 1 - r];
                }
            }
        },
        left: () => {
            for (let r = 0; r < boardSize; r++) {
                const newRow = combine(grid[r]);
                if (grid[r].join() !== newRow.join()) moved = true; // Check if a tile moved
                grid[r] = newRow;
            }
        },
        right: () => {
            for (let r = 0; r < boardSize; r++) {
                const newRow = combine(grid[r].reverse()).reverse();
                if (grid[r].join() !== newRow.join()) moved = true; // Check if a tile moved
                grid[r] = newRow;
            }
        },
    };

    previousGrid = copyGrid(getGrid()); // Copy the current grid to previousGrid before moving

    movements[direction]();
    if (moved) {
        addRandomLetter();
    } else {
        score -= 1; // Apply penalty if no tiles were moved
    }
}

function getScore() {
    return score;
}

function getGrid() {
    return grid;
}

function getPreviousGrid() {
    return previousGrid;
}

function resetGame() {
    score = 0;
    initializeGrid();
}

export { initializeGrid, addRandomLetter, move, getScore, getGrid, resetGame , getPreviousGrid, copyGrid};