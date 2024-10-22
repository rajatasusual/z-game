import { initializeGrid, move, isGameOver, getScore, getGrid, getBoardSize, getPreviousGrid, getWordIndices, cleanTile, resetGame, updateWordScore } from './game.js';

// Render the grid to the DOM
function renderGrid(isNew) {
    // Clear the board
    const board = document.getElementById('board');
    if (isNew) {
        board.style.gridTemplateColumns = `repeat(${getBoardSize()}, 1fr)`;
        board.style.gridTemplateRows = `repeat(${getBoardSize()}, 1fr)`;
    }

    const grid = getGrid();

    board.innerHTML = ''; // Clear the board

    grid.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
            const tile = createTile(cell);
            board.appendChild(tile);

            // Add animation class if tile moved
            if (isNew || tileHasMoved(rIdx, cIdx) && settings.animations) {
                tile.classList.add('moved');
                tile.classList.add('merged');
                setTimeout(() => {
                    tile.classList.remove('moved');
                    tile.classList.remove('merged');
                }, 300); // Remove the animation after it's played
            }
        });
    });

    !isNew && glowCells(grid);

    updateScoreDisplay();
    updateTimerDisplay();

    if (isGameOver()) {
        showGameOver();
    }

    // Add click event listeners to the tiles in the wordIndices
    const wordIndices = getWordIndices();
    wordIndices.forEach(({ r, c }) => {
        const tile = board.children[r * getBoardSize() + c];
        tile.addEventListener('touchend', function (event) {
            const rect = event.target.getBoundingClientRect();
            const x = event.changedTouches[0].pageX - rect.left - rect.width / 2;
            const y = event.changedTouches[0].pageY - rect.top - rect.height / 2;
            const distance = Math.sqrt(x * x + y * y);

            if (distance < 30) {
                handleTileClick();
            }
        });

    });

}

// Handle tile click
function handleTileClick() {
    executeWordDeletion();
}

function executeWordDeletion() {
    const wordIndices = getWordIndices();

    if (!wordIndices.length) return;

    updateWordScore();
    updateScoreDisplay();

    // Clear the tiles
    wordIndices.forEach(({ r, c }) => {
        cleanTile(r, c);

        const tile = board.children[r * getBoardSize() + c];
        tile.textContent = '';
        tile.style.backgroundColor = '#f0f0f0';
    });

    // Move the tiles down
    move("down", true);

    setTimeout(renderGrid, 500);

    // Cleanup: remove event listeners after execution
    removeEventListeners();
}

// Remove event listeners after deletion
function removeEventListeners() {
    // Remove tile click listeners
    const wordIndices = getWordIndices();
    wordIndices.forEach(({ r, c }) => {
        const tile = board.children[r * getBoardSize() + c];
        tile.removeEventListener('click', handleTileClick);
    });
}

function startTimer() {
    timer = setInterval(() => {
        if (timeRemaining > 0) {
            timeRemaining--;
            localStorage.setItem('time', timeRemaining);
            updateTimerDisplay(); // Update the timer display
        } else {
            clearInterval(timer);
            showGameOver();
        }
    }, 1000); // Countdown every second
}

function showGameOver() {
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
    message.style.width = `${board.offsetWidth}px`;
    message.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    board.appendChild(message);
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
                }, 1000); // Remove the animation after it's played
            }
        });
    });
}

function tileHasMoved(rIdx, cIdx) {
    const previousGrid = getPreviousGrid();
    return previousGrid.length && previousGrid[rIdx][cIdx] !== getGrid()[rIdx][cIdx];
}

// Create a tile element
function createTile(value) {
    const tile = document.createElement('div');
    tile.className = 'tile';
    tile.textContent = value || '';
    if (value) {
        tile.style.backgroundColor = colors[value]; // Default background for empty tiles
        tile.style.color = isDark(colors[value] || '#f0f0f0') ? 'white' : 'black'; // Set text color based on tile color
    }
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

function updateTimerDisplay() {
    const timerElement = document.getElementById('timer');
    timerElement.textContent = `Time: ${timeRemaining}s`;
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
    } else if (event.code === 'Space') {
        executeWordDeletion();
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
    event.preventDefault();
}

// Function to handle the touch end event and determine swipe direction
function handleTouchEnd(event) {
    endX = event.changedTouches[0].clientX;
    endY = event.changedTouches[0].clientY;

    const deltaX = endX - startX;
    const deltaY = endY - startY;

    // Calculate absolute distances
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Only consider swipes where the movement is greater than the threshold
    if (absDeltaX > threshold || absDeltaY > threshold) {
        if (absDeltaX > absDeltaY) {
            // Horizontal swipe
            if (deltaX > 0) {
                move('right'); // Swipe right
            } else {
                move('left'); // Swipe left
            }
        } else {
            // Vertical swipe
            if (deltaY > 0) {
                move('down'); // Swipe down
            } else {
                move('up'); // Swipe up
            }
        }
    }

    // Reset the touch positions
    startX = null;
    startY = null;
    endX = null;
    endY = null;

    renderGrid();
}

// Add event listeners for touch gestures to the board element
const board = document.getElementById('board');
board.addEventListener('touchstart', handleTouchStart, false);
board.addEventListener('touchmove', handleTouchMove, false);
board.addEventListener('touchend', handleTouchEnd, false);

document.getElementById('reset-game').addEventListener('click', function () {
    // Show confirmation box
    document.getElementById('confirmation-box').classList.remove('hidden');
    // Hide reset button
    this.classList.add('hidden');
});

document.getElementById('cancel-reset').addEventListener('click', function () {
    // Hide confirmation box and show reset button
    document.getElementById('confirmation-box').classList.add('hidden');
    document.getElementById('reset-game').classList.remove('hidden');
});

document.getElementById('confirm-reset').addEventListener('click', function () {
    resetGame();
    renderGrid(true);
    startTimer();

    // Hide confirmation box and show reset button again
    document.getElementById('confirmation-box').classList.add('hidden');
    document.getElementById('reset-game').classList.remove('hidden');
});

document.getElementById('settings-button').addEventListener('click', function () {
    const sidebar = document.querySelector('.md-sidebar');
    sidebar.classList.toggle('open');
});

document.getElementById('close-sidebar').addEventListener('click', function () {
    const sidebar = document.querySelector('.md-sidebar');
    sidebar.classList.remove('open');
});

// Optional: Close the sidebar when clicking outside of it
document.addEventListener('click', function (event) {
    const sidebar = document.querySelector('.md-sidebar');
    const settingsButton = document.getElementById('settings-button');

    if (!sidebar.contains(event.target) && !settingsButton.contains(event.target)) {
        sidebar.classList.remove('open');
    }
});

document.getElementById('contrast-toggle').addEventListener('change', function () {
    settings.contrast = !settings.contrast;
    localStorage.setItem('settings', JSON.stringify(settings));

    colors = settings.contrast ? contrastColors : generateAlphabetColors();
    renderGrid();
})

document.getElementById('animations-toggle').addEventListener('change', function () {
    settings.animations = !settings.animations;
    localStorage.setItem('settings', JSON.stringify(settings));
})

document.getElementById('dark-mode-toggle').addEventListener('change', function () {
    settings.darkMode = !settings.darkMode;
    localStorage.setItem('settings', JSON.stringify(settings));

    document.body.classList.toggle('dark-mode'); // Toggle the dark mode class
    const elements = document.querySelectorAll('.md-card, .md-rules-container, .md-button, .tile, .md-sidebar'); // Add all elements you want to change
    elements.forEach(element => {
        element.classList.toggle('dark-mode'); // Add dark mode class to each element
    });
})

// Initialize the game on page load
window.onload = () => {
    initializeGrid();
    renderGrid(true);
    startTimer();
};