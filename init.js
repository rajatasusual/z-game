const boardSize = 6;
const TEST = false;
const SIMULATE_GAMEOVER = false;
const URL = TEST ? 'http://localhost:5500' : 'https://rajatasusual.github.io/z-game';
const DEFAULT_TIME = 60;

const points = {
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

const contrastColors = {
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

let grid = [];
let usedWords = [];
let previousGrid = [];
let wordIndices = [];
let score = 0;
let dict = new Set();

let colors = [];
let settings = {};

let timeRemaining = DEFAULT_TIME; // Time in seconds
let timer;
let multiplier = 1;

function interpolateColor(startColor, endColor, steps, step) {
    const start = parseInt(startColor.slice(1), 16);
    const end = parseInt(endColor.slice(1), 16);

    const r1 = (start >> 16) & 0xff,
        g1 = (start >> 8) & 0xff,
        b1 = start & 0xff;

    const r2 = (end >> 16) & 0xff,
        g2 = (end >> 8) & 0xff,
        b2 = end & 0xff;

    const r = Math.round(r1 + ((r2 - r1) * step / steps));
    const g = Math.round(g1 + ((g2 - g1) * step / steps));
    const b = Math.round(b1 + ((b2 - b1) * step / steps));

    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
}

function generateAlphabetColors() {
    const vowels = ['A', 'E', 'I', 'O', 'U'];
    const consonants = 'BCDFGHJKLMNPQRSTVWXYZ'.split('');

    const colors = {};

    // Colors for consonants
    const consonantStartColor1 = "#68BBE3";
    const consonantEndColor1 = "#055C9D";
    const consonantStartColor2 = "#055C9D";
    const consonantEndColor2 = "#003060";

    // Colors for vowels
    const vowelStartColor1 = "#fff2df";
    const vowelEndColor1 = "#ffd197";
    const vowelStartColor2 = "#ffd197";
    const vowelEndColor2 = "#ffba64";

    // First 10 consonants - 75% of spectrum
    const firstConsonantGroup = consonants.slice(0, 10);
    firstConsonantGroup.forEach((letter, index) => {
        const color = interpolateColor(consonantStartColor1, consonantEndColor1, 9, index); // More distinguishable steps
        colors[letter] = color;
    });

    // Remaining consonants - 25% of spectrum
    const secondConsonantGroup = consonants.slice(10);
    secondConsonantGroup.forEach((letter, index) => {
        const color = interpolateColor(consonantStartColor2, consonantEndColor2, secondConsonantGroup.length - 1, index); // Smaller steps
        colors[letter] = color;
    });

    // First 3 vowels - 75% of spectrum
    const firstVowelGroup = vowels.slice(0, 3);
    firstVowelGroup.forEach((letter, index) => {
        const color = interpolateColor(vowelStartColor1, vowelEndColor1, 2, index); // More distinguishable steps
        colors[letter] = color;
    });

    // Remaining 2 vowels - 25% of spectrum
    const secondVowelGroup = vowels.slice(3);
    secondVowelGroup.forEach((letter, index) => {
        const color = interpolateColor(vowelStartColor2, vowelEndColor2, secondVowelGroup.length - 1, index); // Smaller steps
        colors[letter] = color;
    });

    return colors;
}

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

function initSettings() {
    localStorage.getItem('settings') ? settings = JSON.parse(localStorage.getItem('settings')) : settings = {
        darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
        animations: true,
        contrast: true
    };

    document.getElementById('dark-mode-toggle').checked = settings.darkMode;
    document.getElementById('animations-toggle').checked = settings.animations;
    document.getElementById('contrast-toggle').checked = settings.contrast;
}

function simulateGameOver() {
    if (SIMULATE_GAMEOVER) {
        grid = [
            ['A', 'B', 'C', 'D', 'E'],
            ['F', 'G', 'H', 'I', 'J'],
            ['K', 'L', 'M', 'N', 'O'],
            ['P', 'Q', 'R', 'S', 'T'],
            ['U', 'V', 'W', 'X', 'Y']
        ];
    }
}


/*******************************************
                SETUP GAME
*******************************************/

function init() {
    if (TEST) {
        if (SIMULATE_GAMEOVER) {
            simulateGameOver();
        } else {
            const letters = ['A', 'B', 'C', 'D', 'E'];
            const combinations = generateCombinations(letters, 4);
            dict = new Set(combinations);
        }

    } else {
        fetch("dict")
            .then((res) => res.text())
            .then((text) => {
                dict = new Set(text.split('\n'));
            })
            .catch((e) => console.error(e));
    }

    initSettings();
    colors = settings.contrast ? contrastColors: generateAlphabetColors();
    settings.darkMode ? document.body.classList.add('dark-mode') : document.body.classList.remove('dark-mode');
}

init();




