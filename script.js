const boardSize = 4;
let grid = [];
let score = 0;

// Initialize the game grid
function initializeGrid() {
    grid = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));
    addRandomLetter();
    addRandomLetter();
}

function updateScoreDisplay() {
    document.getElementById('score').textContent = `Score: ${score}`;
}

// Add a random letter to an empty cell
function addRandomLetter() {
    let emptyCells = [];
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

const colors = {
    'A': '#ADD8E6', // Light blue
    'B': '#87CEEB', // Sky blue
    'C': '#4682B4', // Steel blue
    'D': '#4169E1', // Royal blue
    'E': '#0000FF', // Blue
    'F': '#0000CD', // Medium blue
    'G': '#00008B', // Dark blue
    'H': '#000080', // Navy
    'I': '#191970', // Midnight blue
    'J': '#1E90FF', // Dodger blue
    'K': '#00BFFF', // Deep sky blue
    'L': '#00CED1', // Dark turquoise
    'M': '#20B2AA', // Light sea green
    'N': '#3CB371', // Medium sea green
    'O': '#2E8B57', // Sea green
    'P': '#008000', // Green
    'Q': '#006400', // Dark green
    'R': '#B8860B', // Dark goldenrod
    'S': '#FFD700', // Gold
    'T': '#FFA500', // Orange
    'U': '#FF8C00', // Dark orange
    'V': '#FF4500', // Orange red
    'W': '#FF0000', // Red
    'X': '#B22222', // Firebrick
    'Y': '#A52A2A', // Brown
    'Z': '#8B0000', // Dark red
};

function renderGrid() {
    board.innerHTML = '';
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.textContent = grid[r][c] || '';
            tile.style.backgroundColor = grid[r][c] ? colors[grid[r][c]] : '#f0f0f0'; // Default background for empty tiles
            tile.style.color = isDark(colors[grid[r][c]]) ? 'white' : 'black'; // Set text color based on tile color
            board.appendChild(tile);
        }
    }
}

// Function to determine if a color is dark
function isDark(color) {
    const rgb = hexToRgb(color);
    const brightness = (rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114);
    return brightness < 186; // Threshold for darkness
}

// Function to convert hex color to RGB
function hexToRgb(hex) {
    if (hex == undefined)
        return { r: 0, g: 0, b: 0 };
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255
    };
}

// Handle key presses
function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowUp':
            moveUp();
            break;
        case 'ArrowDown':
            moveDown();
            break;
        case 'ArrowLeft':
            moveLeft();
            break;
        case 'ArrowRight':
            moveRight();
            break;
    }
}

// Combine letters in the direction of movement
function combine(rowOrCol) {
    const newLine = [];
    let lastValue = null;
    let lastIndex = -1;

    rowOrCol.forEach((value, index) => {
        if (value) {
            if (lastValue === value) {
                newLine[lastIndex] = getCombinedValue(value); // Combine letters
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

function getCombinedValue(value) {
    // Combine the letters or handle points here
    const isVowelCombination = 'AEIOU'.includes(value);
    if (isVowelCombination) {
        score += 2; // Award points for vowel combination
    } else {
        score -= 1; // Penalty for consonant-vowel combination
    }
    
    updateScoreDisplay(); // Update score display whenever the score changes
    
    return String.fromCharCode(value.charCodeAt(0) + 1); // Move to next letter
}

// Move functions
function moveUp() {
    for (let c = 0; c < boardSize; c++) {
        let column = [];
        for (let r = 0; r < boardSize; r++) {
            column.push(grid[r][c]);
        }
        const newColumn = combine(column);
        for (let r = 0; r < boardSize; r++) {
            grid[r][c] = newColumn[r];
        }
    }
    addRandomLetter();
    renderGrid();
}

function moveDown() {
    for (let c = 0; c < boardSize; c++) {
        let column = [];
        for (let r = 0; r < boardSize; r++) {
            column.push(grid[r][c]);
        }
        column.reverse();
        const newColumn = combine(column);
        for (let r = 0; r < boardSize; r++) {
            grid[r][c] = newColumn[boardSize - 1 - r];
        }
    }
    addRandomLetter();
    renderGrid();
}

function moveLeft() {
    for (let r = 0; r < boardSize; r++) {
        const newRow = combine(grid[r]);
        grid[r] = newRow;
    }
    addRandomLetter();
    renderGrid();
}

function moveRight() {
    for (let r = 0; r < boardSize; r++) {
        const newRow = combine(grid[r].slice().reverse());
        grid[r] = newRow.reverse();
    }
    addRandomLetter();
    renderGrid();
}

// Event listener for key presses
window.addEventListener('keydown', handleKeyPress);

// Initialize the game on page load
window.onload = () => {
    initializeGrid();
    renderGrid();
};
