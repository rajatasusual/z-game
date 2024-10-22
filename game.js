// Function to copy the current grid state
function copyGrid(grid) {
    return grid.map(row => [...row]);
}

// Initialize the game grid
function initializeGrid(newGame = false) {
    if (TEST && SIMULATE_GAMEOVER) {
        simulateGameOver();
        return;
    }
    //check autosave
    if (localStorage.getItem('grid') && !newGame) {
        grid = JSON.parse(localStorage.getItem('grid'));
        score = parseInt(localStorage.getItem('score'));
        timeRemaining = parseInt(localStorage.getItem('time'));
        usedWords = JSON.parse(localStorage.getItem('usedWords'));
    } else {
        grid = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));
        timeRemaining = DEFAULT_TIME;
        usedWords = [];
        addRandomLetter();
    }
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

function checkWordsAndScore(grid, userPlayed = false) {
    let foundWords = 0;
    let totalWordScore = 0;

    const minWordLength = 3;
    const maxWordLength = 5;

    // Check for vertical words
    for (let c = 0; c < boardSize; c++) {
        for (let start = 0; start <= boardSize - minWordLength; start++) {
            for (let length = minWordLength; length <= maxWordLength; length++) {
                if (start + length <= boardSize) {
                    let verticalWord = '';
                    const tempIndices = [];

                    // Form the vertical word and collect its indices
                    for (let r = start; r < start + length; r++) {
                        if (grid[r][c] === '') {
                            verticalWord = ''; // Reset the word if a blank tile is encountered
                            break;
                        }
                        verticalWord += grid[r][c];
                        tempIndices.push({ r, c });
                    }

                    if (verticalWord && dict.has(verticalWord) && usedWords.indexOf(verticalWord) === -1) {
                        foundWords++;
                        totalWordScore += calculateWordScore(verticalWord);
                        userPlayed && console.log(verticalWord + ' ' + calculateWordScore(verticalWord));

                        wordIndices.push(...tempIndices); // Add valid indices
                        userPlayed && usedWords.push(verticalWord); // Mark word as used
                    }
                }
            }
        }
    }

    // Check for horizontal words
    for (let r = 0; r < boardSize; r++) {
        for (let start = 0; start <= boardSize - minWordLength; start++) {
            for (let length = minWordLength; length <= maxWordLength; length++) {
                if (start + length <= boardSize) {
                    let horizontalWord = '';
                    const tempIndices = [];

                    // Form the horizontal word and collect its indices
                    for (let c = start; c < start + length; c++) {
                        if (grid[r][c] === '') {
                            horizontalWord = ''; // Reset the word if a blank tile is encountered
                            break;
                        }
                        horizontalWord += grid[r][c];
                        tempIndices.push({ r, c });
                    }

                    if (horizontalWord && dict.has(horizontalWord) && usedWords.indexOf(horizontalWord) === -1) {
                        foundWords++;
                        totalWordScore += calculateWordScore(horizontalWord);
                        userPlayed && console.log(horizontalWord + ' ' + calculateWordScore(horizontalWord));

                        wordIndices.push(...tempIndices); // Add valid indices
                        userPlayed && usedWords.push(horizontalWord); // Mark word as used
                    }
                }
            }
        }
    }

    userPlayed && foundWords > 1 && console.log('Multiplier played: ' + foundWords);
    
    // Update the multiplier
    multiplier = foundWords;

    return totalWordScore * foundWords;
}

function updateWordScore(){
    score += checkWordsAndScore(grid, true);
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
    const newValue = String.fromCharCode(value.charCodeAt(0) + 1); // Move to next letter

    if (points[newValue]) {
        timeRemaining += points[newValue]; // Adds seconds based on points
    }

    return newValue;
}

// Check if the grid is full and no valid moves are possible
function isGameOver() {
    // Check if there are any empty cells
    if (hasEmptyCells()) return false;

    // Check if any adjacent letters can be combined
    if (canCombineTiles()) return false;

    // Check if any valid words can be formed in rows or columns
    if (canFormValidWords()) return false;

    // check if timer has run out
    if (timeRemaining > 0) return false;

    // If none of the conditions are true, the game is over
    return true;
}

// Function to check for any empty cells
function hasEmptyCells() {
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (grid[r][c] === '') {
                return true;
            }
        }
    }
    return false;
}

// Function to check if any tiles can be combined
function canCombineTiles() {
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            let currentTile = grid[r][c];

            // Skip if the tile is empty
            if (currentTile === '') continue;

            // Check for adjacent tiles that can combine in all directions (up, down, left, right)
            if (r > 0 && grid[r - 1][c] === currentTile) return true; // Up
            if (r < boardSize - 1 && grid[r + 1][c] === currentTile) return true; // Down
            if (c > 0 && grid[r][c - 1] === currentTile) return true; // Left
            if (c < boardSize - 1 && grid[r][c + 1] === currentTile) return true; // Right
        }
    }
    return false;
}

// Function to check if any valid words can be formed
function canFormValidWords() {
    // Check for horizontal words
    for (let r = 0; r < boardSize; r++) {
        let horizontalWord = grid[r].join('');
        if (dict.has(horizontalWord) && usedWords.indexOf(horizontalWord) === -1) {
            return true; // Valid word found
        }
    }

    // Check for vertical words
    for (let c = 0; c < boardSize; c++) {
        let verticalWord = '';
        for (let r = 0; r < boardSize; r++) {
            verticalWord += grid[r][c];
        }
        if (dict.has(verticalWord) && usedWords.indexOf(verticalWord) === -1) {
            return true; // Valid word found
        }
    }

    return false;
}

function cleanTile(r, c) {
    grid[r][c] = '';
}

// Game move logic
function move(direction, wordDeleted = false) {
    if (isGameOver()) return;

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
                if ((grid[r].reverse()).join() !== newRow.join()) moved = true; // Check if a tile moved
                grid[r] = newRow;
            }
        },
    };

    previousGrid = copyGrid(getGrid()); // Copy the current grid to previousGrid before moving

    movements[direction]();
    if (moved) {
        const wordPoints = checkWordsAndScore(grid, false);
        if(wordPoints === 0) {
            wordIndices = [];
        }
        addRandomLetter();
    } else {
        !wordDeleted && score--; // Apply penalty if no tiles were moved
    }

    autoSave();
}

function autoSave() {
    localStorage.setItem('grid', JSON.stringify(getGrid()));
    localStorage.setItem('score', getScore());
    localStorage.setItem('usedWords', JSON.stringify(usedWords));
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

function getMultiplier() {
    return multiplier;
}

function resetGame() {
    score = 0;
    clearInterval(timer);
    initializeGrid(true);
    timeRemaining = DEFAULT_TIME;
    usedWords = [];
}

export { initializeGrid, addRandomLetter, move, cleanTile, getScore, getMultiplier,getGrid, getBoardSize, resetGame, getPreviousGrid, getWordIndices, updateWordScore, copyGrid, isGameOver };