const boardSize = 4;
let grid = [];
let wordIndices = [];
let score = 0;
let lastDirection = '';

const TEST = false;

let points = {
    A: 1,
    B: 3,
    C: 3,
    D: 2,
    E: 1,
    F: 4,
    G: 2,
    H: 4,
    I: 1,
    J: 8,
    K: 5,
    L: 1,
    M: 3,
    N: 1,
    O: 1,
    P: 3,
    Q: 10,
    R: 1,
    S: 1,
    T: 1,
    U: 1,
    V: 4,
    W: 4,
    X: 8,
    Y: 4,
    Z: 10
};

let dict = new Set();

function generateCombinations(letters, length, current = '', results = []) {
    // Base case: if the current combination reaches the desired length
    if (current.length === length) {
        results.push(current);
        return;
    }

    // Iterate through each letter and append it to the current combination
    for (let letter of letters) {
        generateCombinations(letters, length, current + letter, results);
    }

    return results;
}

fetch("dict")
    .then((res) => res.text())
    .then((text) => {
        if (TEST) {

            const letters = ['A', 'B', 'C', 'D', 'E'];
            const combinations = generateCombinations(letters, 4);

            dict = new Set(combinations);

        } else {
            dict = new Set(text.split('\n'));
        }
    })
    .catch((e) => console.error(e));

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
        // Assign a random letter from A,B,C to the empty cell
        grid[r][c] = Math.random() > 0.25 ? 'A' : Math.random() > 0.25 ? 'B' : 'C';
    }
}

function checkWordsAndScore(grid) {
    let totalWordScore = 0;

    // Check for horizontal words
    for (let r = 0; r < boardSize; r++) {
        let horizontalWord = grid[r].join('');
        if (horizontalWord.length === 4 && dict.has(horizontalWord)) {
            totalWordScore += calculateWordScore(horizontalWord);

            for (let c = 0; c < boardSize; c++) {
                wordIndices.push({ r, c });
            }

        }
    }

    // Check for vertical words
    for (let c = 0; c < boardSize; c++) {
        let verticalWord = '';
        for (let r = 0; r < boardSize; r++) {
            verticalWord += grid[r][c];
        }
        if (verticalWord.length === 4 && dict.has(verticalWord)) {
            totalWordScore += calculateWordScore(verticalWord);

            for (let r = 0; r < boardSize; r++) {
                wordIndices.push({ r, c });
            }

        }
    }

    return totalWordScore; // You can return it to display points earned from words formed.
}

function calculateWordScore(word) {
    return word.split('').reduce((acc, letter) => acc + (points[letter] || 0), 0);
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

function cleanTile(r, c) {
    grid[r][c] = '';
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
        lastDirection = direction;
        const wordPoints = checkWordsAndScore(grid); // Check and score formed words
        if (wordPoints > 0) {
            console.log(`Points earned from words: ${wordPoints}`);
            score += wordPoints;
        } else {
            wordIndices = []; // Reset wordIndices
        }

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

function getBoardSize() {
    return boardSize;
}

function getPreviousGrid() {
    return previousGrid;
}

function getWordIndices() {
    return wordIndices;
}

function getLastDirection() {
    return lastDirection;
}

function resetGame() {
    score = 0;
    initializeGrid();
}

export { initializeGrid, addRandomLetter, move, getLastDirection, cleanTile, getScore, getGrid, getBoardSize, resetGame, getPreviousGrid, getWordIndices, copyGrid };