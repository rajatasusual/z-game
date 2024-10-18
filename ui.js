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