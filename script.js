class Player {
    constructor(name) {
        this.name = name;
        this.points = 0;
    }
    addPoints(value) { this.points += value; }
}

class Board {
    constructor() {
        // Instead of reading a file, we use the phrases from your text file here
        this.phrases = [
            "curiosity killed the cat", "world is your oyster", "you need money to make money",
            "all good things come to those who wait", "two heads are better than one",
            "dont judge a book by its cover", "piece of cake", "barking up the wrong tree"
        ];
        this.phrase = this.phrases[Math.floor(Math.random() * this.phrases.length)];
        this.solvedPhrase = "";
        this.initSolved();
    }

    initSolved() {
        for (let char of this.phrase) {
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

function startGame() {
    const n1 = document.getElementById('p1Name').value || "Player 1";
    const n2 = document.getElementById('p2Name').value || "Player 2";
    player1 = new Player(n1);
    player2 = new Player(n2);
    board = new Board();
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
    const guess = input.value.trim().toLowerCase();
    const msg = document.getElementById('message');
    if (!guess) return;

    if (board.isSolved(guess)) {
        currentPlayer.addPoints(500); [cite: 4]
        board.solvedPhrase = board.phrase;
        msg.innerText = `${currentPlayer.name} solved it! +500 pts`;
        gameSolved = true;
    } else if (guess.includes(" ")) {
        // Word guess logic [cite: 4]
        if (board.phrase.toLowerCase().includes(guess)) {
            board.revealLetters(guess);
            currentPlayer.addPoints(150);
            msg.innerText = "Correct word! +150 pts";
        } else {
            currentPlayer.addPoints(-75);
            msg.innerText = "Wrong word! -75 pts";
        }
    } else {
        // Letter guess logic [cite: 4]
        if (board.allLettersExist(guess)) {
            let count = board.revealLetters(guess);
            currentPlayer.addPoints(count * 100);
            msg.innerText = `Correct! Found ${count} letters.`;
        } else {
            currentPlayer.addPoints(guess.length * -50);
            msg.innerText = "Incorrect letter! Points deducted.";
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
