const { Console } = require('console-mpds');
const console = new Console();

const tictactoe = createTicTacToe();
tictactoe.start();

function createTicTacToe() {
    const ticTacToe = {
        turn: createTurn(),
        board: createBoard(),
        players: [],
        playTicTacToe: function () {
            let lastToken;
            do {
                this.board.printBoard();
                lastToken = this.turn.playTurn(this.board, this.players);
            } while (this.board.isTicTacToe(lastToken) === false);
            this.board.printBoard();
            console.writeln(`Victoria para el jugador ${lastToken}!`)
        },
        isResumed() {
            const userInput = console.readString(`¿Quieres jugar otra partida? (s/n) `);
            return userInput !== 's' && userInput !== 'n' ? true : userInput === 'n' ? false : true;
        },
    };
    return {
        start: function () {
            do {
                const gameMode = createGameMode(ticTacToe);
                ticTacToe.players = gameMode.selectPlayersGameMode();
                console.writeln(`--- TIC TAC TOE ---`);
                ticTacToe.playTicTacToe();
            } while (ticTacToe.isResumed() === true);
        }
    };
}

function createTurn() {
    return {
        turnCount: 0,
        playTurn: function (board, players) {
            let player = this.getActivePlayer(players);
            console.writeln(`Turno ${this.turnCount + 1} para: ${player.TOKEN}`);
            if (board.isAllPlayerTokensUsed(player.TOKEN) === true) {
                player.move(board);
            } else {
                player.put(board);
            }
            this.turnCount++;
            return player.TOKEN;
        },
        getActivePlayer: function (players) {
            return this.turnCount % 2 === 0 ? players[0] : players[1];
        },

    }
}

function createBoard() {
    const board = {
        MAX_TOKENS: 3,
        EMPTY_TOKEN: ` `,
        panel: [],
        initPanel: function () {
            for (let i = 0; i < this.MAX_TOKENS; i++) {
                this.panel[i] = [];
                for (let j = 0; j < this.MAX_TOKENS; j++) {
                    this.panel[i][j] = this.EMPTY_TOKEN;
                }
            }
        },
        isValidPosition: function (coordinate) {
            if (coordinate.x < 0 || coordinate.x > this.MAX_TOKENS - 1) return false;
            if (coordinate.y < 0 || coordinate.y > this.MAX_TOKENS - 1) return false;
            return true;
        },
        isTokenFromPlayer: function (coordinate, token) {
            return this.panel[coordinate.x][coordinate.y] === token ? true : false;
        },
        isPositionEmpty: function (coordinate) {
            return this.panel[coordinate.x][coordinate.y] === this.EMPTY_TOKEN ? true : false;
        },
        isAllPlayerTokensUsed: function (token) {
            let counter = 0;
            for (let i = 0; i < this.panel.length; i++) {
                for (let j = 0; j < this.panel[i].length; j++) {
                    if (this.panel[i][j] === token) {
                        counter++;
                    }
                }
            }
            return counter === this.MAX_TOKENS ? true : false;
        },
        printBoard: function () {
            console.writeln(`-------------`);
            for (let i = 0; i < this.panel.length; i++) {
                for (let j = 0; j < this.panel[i].length; j++) {
                    console.write(`| ${this.panel[i][j]} `);
                }
                console.write(`|\n-------------\n`);
            }
        },
        isTicTacToe: function (token) {
            let countRows = [0, 0, 0];
            let countColumns = [0, 0, 0];
            let countDiagonal = 0;
            let countInverse = 0;
            for (let i = 0; i < this.panel.length; i++) {
                for (let j = 0; j < this.panel[i].length; j++) {
                    if (this.panel[i][j] === token) {
                        countRows[i]++;
                        countColumns[j]++;
                        if (i - j === 0) {
                            countDiagonal++;
                        }
                        if (i + j === this.MAX_TOKENS - 1) {
                            countInverse++;
                        }
                    }
                }
            }
            if (countDiagonal === this.MAX_TOKENS || countInverse === this.MAX_TOKENS) {
                return true;
            }
            for (let i = 0; i < countRows.length; i++) {
                if (countRows[i] === this.MAX_TOKENS) {
                    return true;
                }
                if (countColumns[i] === this.MAX_TOKENS) {
                    return true;
                }
            }
            return false;
        },
    }
    board.initPanel()
    return board;
}

function createGameMode(tictactoe) {
    const that = {
        TOKEN_X: `X`,
        TOKEN_O: `O`,
        gameModes: [],
        playAsHuman: function (message) {
            const row = console.readNumber(`Fila ${message}:  `);
            const column = console.readNumber(`Columna ${message}:  `);
            return {
                x: row - 1,
                y: column - 1,
            };
        },
        playAsComputer: function (message) {
            return {
                x: parseInt(Math.random() * tictactoe.board.MAX_TOKENS),
                y: parseInt(Math.random() * tictactoe.board.MAX_TOKENS),
            };
        },
        createPlayer: function (playerMode, TOKEN) {
            return {
                TOKEN: TOKEN,
                play: playerMode,
                put: function (board) {
                    let coordinate;
                    do {
                        coordinate = this.play('destino');
                    } while (board.isValidPosition(coordinate) === false || board.isPositionEmpty(coordinate) === false);
                    board.panel[coordinate.x][coordinate.y] = this.TOKEN;
                },
                move: function (board) {
                    let coordinate;
                    do {
                        coordinate = this.play('origen');
                    } while (board.isValidPosition(coordinate) === false || board.isTokenFromPlayer(coordinate, this.TOKEN) === false);
                    board.panel[coordinate.x][coordinate.y] = board.EMPTY_TOKEN;
                    this.put(board);
                },
            }
        }

    };
    that.gameModes = [
        [that.playAsHuman, that.playAsHuman],
        [that.playAsHuman, that.playAsComputer],
        [that.playAsComputer, that.playAsComputer],
    ];
    return {
        selectPlayersGameMode: function () {
            let userInput;
            do {
                userInput = console.readNumber(`Selecciona el modo de juego:\n 1 - Jugador VS Jugador\n 2 - Jugador VS Ordenador\n 3 - Ordenador VS Ordenador\n`);
            } while (userInput !== 1 && userInput !== 2 && userInput !== 3);
            return [that.createPlayer(that.gameModes[userInput - 1][0], that.TOKEN_X), that.createPlayer(that.gameModes[userInput - 1][1], that.TOKEN_O)];
        },

    };
}
