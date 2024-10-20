const boardSize = 5;
const TEST = false;
const SIMULATE_GAMEOVER = false;
const URL = TEST ? 'http://localhost:5500' : 'https://rajatasusual.github.io/z-game'

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