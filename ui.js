const colors = {
    'A': '#ADD8E6', 'B': '#87CEEB', 'C': '#4682B4', 'D': '#4169E1',
    'E': '#0000FF', 'F': '#0000CD', 'G': '#00008B', 'H': '#000080',
    'I': '#191970', 'J': '#1E90FF', 'K': '#00BFFF', 'L': '#00CED1',
    'M': '#20B2AA', 'N': '#3CB371', 'O': '#2E8B57', 'P': '#008000',
    'Q': '#006400', 'R': '#B8860B', 'S': '#FFD700', 'T': '#FFA500',
    'U': '#FF8C00', 'V': '#FF4500', 'W': '#FF0000', 'X': '#B22222',
    'Y': '#A52A2A', 'Z': '#8B0000',
};

// Render the grid to the DOM
function renderGrid() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    const grid = getGrid();
    grid.forEach((row) => {
        row.forEach((cell) => {
            const tile = createTile(cell);
            board.appendChild(tile);
        });
    });
    updateScoreDisplay();
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
        move(direction);
        renderGrid();
    }
}

// Event listener for key presses
window.addEventListener('keydown', handleKeyPress);

// Initialize the game on page load
window.onload = () => {
    initializeGrid();
    renderGrid();
};