class Player {
    constructor(name) {
        this.name = name;
        this.points = 0;
    }
    addPoints(value) { this.points += value; }
}

class Board {
    constructor(phraseList) {
        // Picks a random phrase from the provided list 
        this.phrase = phraseList[Math.floor(Math.random() * phraseList.length)];
        this.solvedPhrase = "";
        this.initSolved();
    }

    initSolved() {
        for (let char of this.phrase) {
            // Replicates Java logic: spaces become double spaces, letters become underscores
            this.solvedPhrase += (char === " ") ? "  " : "_ ";
        }
    }

    isSolved(guess) {
        return this.phrase.toLowerCase() === guess.trim().toLowerCase();
    }

    revealLetters(guess) {
        const g = guess.trim().toLowerCase();
        let occurrences = 0;
        let newSolved = "";
        for (let i = 0; i < this.phrase.length; i++) {
            let originalChar = this.phrase[i];
            if (originalChar === " ") {
                newSolved += "  ";
            } else if (g.includes(originalChar.toLowerCase())) {
                newSolved += originalChar + " ";
                occurrences++;
            } else {
                newSolved += this.solvedPhrase[i * 2] + " ";
            }
        }
        this.solvedPhrase = newSolved;
        return occurrences;
    }

    allLettersExist(guess) {
        const lowerPhrase = this.phrase.toLowerCase();
        for (let letter of guess.toLowerCase()) {
            if (!lowerPhrase.includes(letter)) return false;
        }
        return true;
    }
}

let player1, player2, board, currentPlayer;
let gameSolved = false;

// New function to load the actual phrases.txt file from your GitHub 
async function loadPhrases() {
    try {
        const response = await fetch('phrases.txt');
        const text = await response.text();
        // Splits by line and removes empty lines
        return text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    } catch (e) {
        console.error("Could not load phrases.txt, using fallback.");
        return ["curiosity killed the cat"]; 
    }
}

async function startGame() {
    const phraseList = await loadPhrases();
    const n1 = document.getElementById('p1Name').value || "Player 1";
    const n2 = document.getElementById('p2Name').value || "Player 2";
    
    player1 = new Player(n1);
    player2 = new Player(n2);
    board = new Board(phraseList);
    currentPlayer = player1;

    document.getElementById('setup').style.display = 'none';
    document.getElementById('gameplay').style.display = 'block';
    updateUI();
}

function updateUI() {
    document.getElementById('p1Label').innerText = player1.name;
    document.getElementById('p2Label').innerText = player2.name;
    document.getElementById('p1Points').innerText = player1.points;
    document.getElementById('p2Points').innerText = player2.points;
    document.getElementById('phraseDisplay').innerText = board.solvedPhrase;
    document.getElementById('turnDisplay').innerText = `${currentPlayer.name}'s Turn`;
}

function handleGuess() {
    if (gameSolved) return;
    const input = document.getElementById('guessInput');
    const guess = input.value.trim();
    const msg = document.getElementById('message');
    if (!guess) return;

    // Full phrase guess: +500
    if (board.isSolved(guess)) {
        currentPlayer.addPoints(500);
        board.solvedPhrase = board.phrase;
        msg.innerText = `${currentPlayer.name} solved it! +500 pts`;
        gameSolved = true;
    } else if (guess.includes(" ")) {
        // Word guess: +150 or -75
        if (board.phrase.toLowerCase().includes(guess.toLowerCase())) {
            board.revealLetters(guess);
            currentPlayer.addPoints(150);
            msg.innerText = "Correct word! +150 pts";
        } else {
            currentPlayer.addPoints(-75);
            msg.innerText = "Wrong word! -75 pts";
        }
    } else {
        // Letter guess: +100 per or -50
        if (board.allLettersExist(guess)) {
            let count = board.revealLetters(guess);
            currentPlayer.addPoints(count * 100);
            msg.innerText = `Correct! Found ${count} letters.`;
        } else {
            currentPlayer.addPoints(guess.length * -50);
            msg.innerText = "Incorrect guess! Points deducted.";
        }
    }

    if (!board.solvedPhrase.includes("_")) gameSolved = true;

    if (!gameSolved) {
        currentPlayer = (currentPlayer === player1) ? player2 : player1;
    } else {
        msg.innerText += " - GAME OVER!";
    }

    input.value = "";
    updateUI();
}
