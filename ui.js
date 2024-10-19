import { initializeGrid, move, isGameOver, getScore, getGrid, getBoardSize, getPreviousGrid, getWordIndices, cleanTile, resetGame, getLastDirection } from './game.js';

const colors = {
    'A': '#FFA500', // Orange
    'B': '#87CEEB', // Sky blue
    'C': '#4682B4', // Steel blue
    'D': '#4169E1', // Royal blue
    'E': '#FF8C00', // Dark orange
    'F': '#0000CD', // Medium blue
    'G': '#00008B', // Dark blue
    'H': '#000080', // Navy
    'I': '#FF4500', // Orange red
    'J': '#1E90FF', // Dodger blue
    'K': '#00BFFF', // Deep sky blue
    'L': '#00CED1', // Dark turquoise
    'M': '#20B2AA', // Light sea green
    'N': '#3CB371', // Medium sea green
    'O': '#FF7F50', // Coral
    'P': '#008000', // Green
    'Q': '#006400', // Dark green
    'R': '#B8860B', // Dark goldenrod
    'S': '#FFD700', // Gold
    'T': '#FFA500', // Orange
    'U': '#FF6347', // Tomato
    'V': '#FF4500', // Orange red
    'W': '#FF0000', // Red
    'X': '#B22222', // Firebrick
    'Y': '#A52A2A', // Brown
    'Z': '#8B0000', // Dark red
};

// Render the grid to the DOM
function renderGrid(isNew) {
    // Clear the board
    const board = document.getElementById('board');
    const grid = getGrid();

    board.innerHTML = ''; // Clear the board

    grid.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            const tile = createTile(cell);
            board.appendChild(tile);

            // Add animation class if tile moved
            if (isNew || tileHasMoved(rIdx, cIdx)) {
                tile.classList.add('moved');
                setTimeout(() => {
                    tile.classList.remove('moved');
                }, 300); // Remove the animation after it's played
            }
        });
    });

    !isNew && glowCells(grid);

    updateScoreDisplay();

    if (isGameOver()) {
        //show game over message
        const message = document.createElement('div');
        message.textContent = 'Game Over';
        message.id = 'game-over';
        message.style.position = 'absolute';
        message.style.top = '50%';
        message.style.left = '50%';
        message.style.transform = 'translate(-50%, -50%)';
        message.style.fontSize = '2rem';
        message.style.color = 'white';
        message.style.fontWeight = 'bold';
        message.style.textAlign = 'center';
        // add a gray background the size of the grid
        message.style.width = `${getBoardSize()}00%`;
        message.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        board.appendChild(message);
    }

    setTimeout(() => {
        //clear the tiles that are in indices
        const wordIndices = getWordIndices();
        if (!wordIndices.length) return;

        wordIndices.forEach(({ r, c }) => {
            cleanTile(r, c);

            const tile = board.children[r * getBoardSize() + c];
            tile.textContent = '';
            tile.style.backgroundColor = '#f0f0f0';
        });

        // move the tiles
        move(getLastDirection());

        setTimeout(renderGrid, 500);
    }, 500);
}

function glowCells(grid) {
    const indices = getWordIndices();
    const board = document.getElementById('board');
    const boardSize = getBoardSize();

    grid.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            if (indices.some(({ r, c }) => r === rIdx && c === cIdx)) {
                const tile = board.children[rIdx * boardSize + cIdx];
                tile.classList.add('glow');
                setTimeout(() => {
                    tile.classList.remove('glow');
                }, 300); // Remove the animation after it's played
            }
        });
    });
}

function tileHasMoved(rIdx, cIdx) {
    const previousGrid = getPreviousGrid();
    return previousGrid[rIdx][cIdx] !== getGrid()[rIdx][cIdx];
}

// Create a tile element
function createTile(value) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.textContent = value || '';
    tile.style.backgroundColor = value ? colors[value] : '#f0f0f0'; // Default background for empty tiles
    tile.style.color = isDark(colors[value] || '#f0f0f0') ? 'white' : 'black'; // Set text color based on tile color
    return tile;
}

// Determine if a color is dark
function isDark(color) {
    const { r, g, b } = hexToRgb(color || '#f0f0f0');
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    return brightness < 186; // Threshold for darkness
}

// Convert hex color to RGB
function hexToRgb(hex) {
    if (!hex) return { r: 0, g: 0, b: 0 };
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
}

// Update score display
function updateScoreDisplay() {
    document.getElementById('score').textContent = `Score: ${getScore()}`;
}

// Handle key presses
function handleKeyPress(event) {
    const directionMap = {
        'ArrowUp': 'up',
        'ArrowDown': 'down',
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
    };
    const direction = directionMap[event.key];
    if (direction) {
        event.preventDefault();
        move(direction);
        renderGrid();
    }
}

// Event listener for key presses
window.addEventListener('keydown', handleKeyPress);


let startX, startY, endX, endY;
const threshold = 30; // Minimum swipe distance to detect a valid swipe

// Function to handle touch start event
function handleTouchStart(event) {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
}

// Function to handle touch move event and prevent default scrolling
function handleTouchMove(event) {
    event.preventDefault(); // Prevent the page from scrolling
    endX = event.touches[0].clientX;
    endY = event.touches[0].clientY;
}

// Function to handle the touch end event and determine swipe direction
function handleTouchEnd() {
    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Check if the swipe distance is greater than the threshold to be considered a valid swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        // Horizontal swipe
        if (deltaX > 0) {
            move('right'); // Swipe right
        } else {
            move('left'); // Swipe left
        }
    } else if (Math.abs(deltaY) > threshold) {
        // Vertical swipe
        if (deltaY > 0) {
            move('down') // Swipe down
        } else {
            move('up'); // Swipe up
        }
    }

    renderGrid();
}

// Add event listeners for touch gestures to the board element
const board = document.getElementById('board');
board.addEventListener('touchstart', handleTouchStart, false);
board.addEventListener('touchmove', handleTouchMove, false);
board.addEventListener('touchend', handleTouchEnd, false);

const resetGameButton = document.getElementById('reset-game');
resetGameButton.addEventListener('click', () => {
    resetGame();
    renderGrid(true);
});

// Initialize the game on page load
window.onload = () => {
    initializeGrid();
    renderGrid(true);
};