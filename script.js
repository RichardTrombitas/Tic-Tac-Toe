let board = [[null, null, null], [null, null, null], [null, null, null]]

const playAsX_btn = document.getElementById("playAsX");
const playAs0_btn = document.getElementById("playAs0");
const resetBtn = document.getElementById("reset");
const okBtn = document.getElementById("ok");
const box = document.getElementById("messageBox");
let playerPiece = "";
let computerPiece = "";
let gameRunning = false;
okBtn.onclick = closeMsgBox;
resetBtn.onclick = resetGame;
resetGame();

async function startGameAs(p) {
    gameRunning = true;

    playerPiece = p;
    if(p === "X") {
        computerPiece = "0"
    } else if(p ==="0") {
        computerPiece = "X"       
    }

    disablePlayButtons();

    if(playerPiece === "X") { //the player goes first
        setPlayerTurn();
        enableBoard();
    } else if(playerPiece ==="0") { //the computer goes first
        disableBoard();
        setComputerTurn();  
        computerPlayTurn().then(() => { 
            if(gameRunning) {
                refreshBoard();
                switchTurn();
                enableBoard();
            }
        });
    }
}

async function placePiece(i, j, piece) {
    //Places the piece where the player pointed to and then if the game is not
    //finished tells the computer to play its turn and waits for the result.
    //If the game is finished after one of these actions a corresponding
    //message will be shown. Otherwise, the game continues and it is again the 
    //player's turn.

    board[i][j] = piece;
    refreshBoard();
    disableCell(i, j);
    if(isVictory(i, j)) {
        disableBoard();
        messageBox("Congratulations! You won!");
        return;
    }
    if(boardFull()) {
        disableBoard();
        messageBox("It's a draw!");
        return;
    }
    switchTurn();
    disableBoard();
    let computerMove = await computerPlayTurn();
    if(!gameRunning){
        return;
    }
    refreshBoard();
    if(isVictory(computerMove[0], computerMove[1])) {
        disableBoard();
        messageBox("You lost!");
        return;
    }
    if(boardFull()) {
        disableBoard();
        messageBox("It's a draw!");
        return;
    }
    switchTurn();
    enableBoard();
}

function computerPlayTurn() {
    //The computer practically does "ala bala portocala" on the free cells -
    //it chooses the n'th free cell, where n is a random number between 1
    //and 10. The computer is "thinking" for a random amount of time (between
    //350 and 2825 miliseconds).

    let computerThinkTime =  Math.random()*10000/4 + 350;

    return new Promise((resolve, reject) => {
        let i, j;
        let n = Math.round(Math.random() * 10) + 1;
        let freeCellExists = false;
        while(n > 0) {
            for(i=0; i<=2; i++) {
                for(j=0; j<=2; j++) {
                    if(!board[i][j]) {
                        n--;
                        freeCellExists = true;
                        if(!gameRunning) {
                            reject("Game is not running!");
                        }
                        if(n === 0) {
                            board[i][j] = computerPiece;
                            disableCell(i, j);
                            const i_final = i, j_final = j;
                            setTimeout(() => { resolve([i_final, j_final]) },
                                computerThinkTime);
                        }
                    }
                }
            }
            if(!freeCellExists){ reject(); }
        }
    });    
}


function isVictory(i, j) {
    //verifies if a victory occurred after placing a piece on a given cell
    //i.e. if there is a full line or diagonal with the same piece

    piece = board[i][j];

    if(!piece) {
        return false; //wrong check
    }

    victory = true;

    //checking the main diagonal (if the piece is on it)
    if(i === j) {
        for(i1=0; i1<=2; i1++) {
            j1 = i1;
            if(board[i1][j1] !== piece) {
                victory = false;
                break;
            }
        }
        if(victory) { 
            return true; 
        }
        victory = true;
    }

    //checking the secondary diagonal (if the piece is on it)
    if(i+j === 2) {
        for(i1=0; i1<=2; i1++) {
            j1 = 2 - i1;
            if(board[i1][j1] !== piece) {
                victory = false;
                break;
            }
        }

        if(victory) { 
            return true; 
        }
        victory = true;
    }

    //checking the vertical line
    for(i1=0; i1<=2; i1++) {
        if(board[i1][j] !== piece) {
            victory = false;
        }
    }

    if(victory) { 
        return true; 
    }
 
    //checking the horizontal line
    for(j1=0; j1<=2; j1++) {
        if(board[i][j1] !== piece) {
            return false;
        }
    }

    return true;
}

function resetGame() {
    gameRunning = false;
    board = board.map(row => [null, null, null]);
    refreshBoard();

    enablePlayButtons();

    disableBoard();
    
    playAsX_btn.onclick = () => { startGameAs("X"); };
    playAs0_btn.onclick = () => { startGameAs("0"); };

    for(let i=0; i<=2; i++) {
        for(let j=0; j<=2; j++) {
            document.querySelector(`td[data-cell="${i}${j}"]`).classList
                .remove("occupied");
        }
    }

    document.getElementById("turn").innerHTML="";
}

function setPlayerTurn() {
    let turn = document.getElementById("turn");
    turn.classList.remove("computer");
    turn.innerHTML = "Your turn 😀";
    playersTurn = true;
}

function setComputerTurn() {
    let turn = document.getElementById("turn");
    turn.classList.add("computer");
    turn.innerHTML = "Computer's turn 💻";
    playersTurn = false;
}

function switchTurn() {
    let turn = document.getElementById("turn");
    if(turn.classList.contains("computer")) {
        setPlayerTurn();
    } else {
        setComputerTurn();
    }
}

function disablePlayButtons(b) {
    playAs0_btn.classList.remove("button");
    playAs0_btn.classList.add("disabled-button");
    playAs0_btn.onclick = null;

    playAsX_btn.classList.remove("button");
    playAsX_btn.classList.add("disabled-button");
    playAsX_btn.onclick = null;
}

function enablePlayButtons(b) {
    playAs0_btn.onclick = startGameAs;
    playAs0_btn.classList.remove("disabled-button");
    playAs0_btn.classList.add("button");

    playAsX_btn.onclick = startGameAs;
    playAsX_btn.classList.remove("disabled-button");
    playAsX_btn.classList.add("button");
}

function disableCell(i, j) {
    c = document.querySelector(`td[data-cell="${i}${j}"]`);
    c.onclick = null;
    c.classList.remove("clickable");
    c.classList.add("occupied");
}

function disableBoard() {
    document.querySelectorAll(".cell")
        .forEach(c => {
            c.onclick = null;
            c.classList.remove("clickable");});
}

function enableBoard() {
    for(let i=0; i<=2; i++) {
        for(let j=0; j<=2; j++) {
            c = document.querySelector(`td[data-cell="${i}${j}"]`);
            if(!c.classList.contains("occupied")) {
                c.onclick = () => { placePiece(i, j, playerPiece); };
                c.classList.add("clickable");    
            }    
        }
    }
}

function closeMsgBox() {
    box.style.opacity = "0%";
    setTimeout(() => { box.style.display = "none"; }, 250);
    resetBtn.onclick = resetGame;
    resetGame();
}

function messageBox(msg) {
    box.style.display = "inline";
    setTimeout(() => { box.style.opacity = "100%"; }, 1);
    document.getElementById("message").innerHTML = msg;
    resetBtn.onclick = null;
}

function refreshBoard() {
    for(i=0; i<=2; i++) {
        for(j=0; j<=2; j++) {
            document.querySelector(`td[data-cell="${i}${j}"]`).innerHTML =
                board[i][j];
        }
    }
}

function boardFull() {
    return board.reduce((total, row) =>
         total + row.reduce((subtotal, cell) => 
         subtotal + ((cell != null) ? 1 : 0), 0), 0) === 9;
}






