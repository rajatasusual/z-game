const boardSize = 5;
const TEST = false;
const SIMULATE_GAMEOVER = false;
const URL = TEST ? 'http://localhost:5500' : 'https://rajatasusual.github.io/z-game';

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

let grid = [];
let previousGrid = [];
let wordIndices = [];
let score = 0;
let lastDirection = '';
let dict = new Set();

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

    const vowelStartColor = "#FFF2DF";
    const vowelEndColor = "#FFBA64";

    const consonantStartColor = "#68BBE3";
    const consonantEndColor = "#003060";

    const colors = {};

    // Vowels interpolation (5 vowels)
    vowels.forEach((letter, index) => {
        const color = interpolateColor(vowelStartColor, vowelEndColor, vowels.length - 1, index);
        colors[letter] = color;
    });

    // Consonants interpolation (21 consonants)
    consonants.forEach((letter, index) => {
        const color = interpolateColor(consonantStartColor, consonantEndColor, consonants.length - 1, index);
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

function simulateGameOver () {
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

const colors = generateAlphabetColors();