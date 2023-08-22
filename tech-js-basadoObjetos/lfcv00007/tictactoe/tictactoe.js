const { Console } = require('console-mpds');
const console = new Console();

startTicTacToe();

function startTicTacToe() {
    let ticTacToe = initTicTacToe();
    do {
        selectPlayersGameMode(ticTacToe);
        playTicTacToe(ticTacToe);
    } while (isResumed() === true);

    function initTicTacToe() {
        let coordinate = {
            x: undefined,
            y: undefined,
        };
        let game = {
            MAX_TOKENS: 3,
            TOKENS: ['X', 'Y'],
            EMPTY_TOKEN: ` `,
            playersGameMode: [],
            turn: {
                nTurn: 0,
                originCoordinate: coordinate,
                destinationCoordinate: coordinate,
            },
            board: [],
        };
        for (let i = 0; i < game.MAX_TOKENS; i++) {
            game.board[i] = [];
            for (let j = 0; j < game.MAX_TOKENS; j++) {
               game.board[i][j] = game.EMPTY_TOKEN;
            }
        }
        return game;
    }

    function selectPlayersGameMode(ticTacToe) {
        const modeCombinations = [
            [playAsHuman, playAsHuman],
            [playAsHuman, playAsComputer],
            [playAsComputer, playAsComputer],
        ];
        let userInput;
        do {
            userInput = console.readNumber(`Selecciona el modo de juego:\n 1 - Jugador VS Jugador\n 2 - Jugador VS Ordenador\n 3 - Ordenador VS Ordenador\n`);
        } while (userInput !== 1 && userInput !== 2 && userInput !== 3);
        console.writeln(`--- TIC TAC TOE ---`);
        ticTacToe.playersGameMode = modeCombinations[userInput - 1];

        function playAsHuman(message) {
            const row = console.readNumber(`Fila ${message}:  `);
            const column = console.readNumber(`Columna ${message}:  `);
            return {
                x: row - 1,
                y: column - 1,
            };
        }

        function playAsComputer(message, MAX_TOKENS) {
            return {
                x: parseInt(Math.random() * MAX_TOKENS),
                y: parseInt(Math.random() * MAX_TOKENS),
            };
        }
    }

    function playTicTacToe(ticTacToe) {
        let winner = false;
        do {
            printBoard(ticTacToe.board);
            placeToken(ticTacToe, ticTacToe.playersGameMode[getActivePlayer(ticTacToe.turn.nTurn)]);
            if (isTicTacToe(ticTacToe)) {
                winner = true;
            } else {
                ticTacToe.turn.nTurn++;
            }
        } while (winner === false);
        printBoard(ticTacToe.board);
        console.writeln(`Victoria para el jugador ${getActiveToken(ticTacToe)}!`)

        function printBoard(board) {
            console.writeln(`-------------`);
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    console.write(`| ${board[i][j]} `);
                }
                console.write(`|\n-------------\n`);
            }
        }

        function getActivePlayer(turn) {
            return turn % 2 === 0 ? 0 : 1;
        }

        function placeToken(ticTacToe, playerPlaceToken) {
            let activeToken = getActiveToken(ticTacToe);
            console.writeln(`Turno ${ticTacToe.turn.nTurn + 1} para: ${activeToken}`);
            let validInput = false;
            if (isAllPlayerTokensUsed(ticTacToe.board, activeToken) === true) {
                while (validInput == false) {
                    ticTacToe.turn.originCoordinate = playerPlaceToken('origen', ticTacToe.MAX_TOKENS);
                    if (isValidPosition(ticTacToe, ticTacToe.turn.originCoordinate) && isValidToken(ticTacToe, ticTacToe.turn.originCoordinate, activeToken)) {
                        validInput = true;
                    }
                }
                setToken(ticTacToe, ticTacToe.turn.originCoordinate, ticTacToe.EMPTY_TOKEN);
            }
            validInput = false;
            while (validInput === false) {
                ticTacToe.turn.destinationCoordinate = playerPlaceToken('destino', ticTacToe.MAX_TOKENS);
                if (isValidPosition(ticTacToe, ticTacToe.turn.destinationCoordinate) && isPositionEmpty(ticTacToe, ticTacToe.turn.destinationCoordinate)) {
                    validInput = true;
                }
            }
            setToken(ticTacToe, ticTacToe.turn.destinationCoordinate, activeToken);

            function isValidPosition(ticTacToe, coordinate) {
                console.writeln(coordinate.y);
                if (coordinate.x < 0 || coordinate.x > ticTacToe.MAX_TOKENS - 1) return false;
                if (coordinate.y < 0 || coordinate.y > ticTacToe.MAX_TOKENS - 1) return false;
                return true;
            }

            function isValidToken(ticTacToe, coordinate, token) {
                return ticTacToe.board[coordinate.x][coordinate.y] === token ? true : false;
            }

            function isPositionEmpty(ticTacToe, coordinate) {
                return ticTacToe.board[coordinate.x][coordinate.y] === ticTacToe.EMPTY_TOKEN ? true : false;
            }

            function setToken(ticTacToe, coordinate, token) {
                ticTacToe.board[coordinate.x][coordinate.y] = token;
            }
        }

        function isTicTacToe(ticTacToe) {
            let countRows = [0, 0, 0];
            let countColumns = [0, 0, 0];
            let countDiagonal = 0;
            let countInverse = 0;
            for (let i = 0; i < ticTacToe.board.length; i++) {
                for (let j = 0; j < ticTacToe.board[i].length; j++) {
                    if (ticTacToe.board[i][j] === getActiveToken(ticTacToe)) {
                        countRows[i]++;
                        countColumns[j]++;
                        if (i - j === 0) {
                            countDiagonal++;
                        }
                        if (i + j === ticTacToe.MAX_TOKENS - 1) {
                            countInverse++;
                        }
                    }
                }
            }
            if (countDiagonal === ticTacToe.MAX_TOKENS || countInverse === ticTacToe.MAX_TOKENS) {
                return true;
            }
            for (let i = 0; i < countRows.length; i++) {
                if (countRows[i] === ticTacToe.MAX_TOKENS) {
                    return true;
                }
                if (countColumns[i] === ticTacToe.MAX_TOKENS) {
                    return true;
                }
            }
            return false;
        }

        function getActiveToken(ticTacToe) {
            return (ticTacToe.turn.nTurn % 2 === 0) ? ticTacToe.TOKENS[0] : ticTacToe.TOKENS[1];
        }
    }

    function isAllPlayerTokensUsed(board, token) {
        let counter = 0;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[i].length; j++) {
                if (board[i][j] === token) {
                    counter++;
                }
            }
        }
        return counter === 3 ? true : false;
    }

    function isResumed() {
        const userInput = console.readString(`¿Quieres jugar otra partida? (s/n) `);
        return userInput !== 's' && userInput !== 'n' ? true : userInput === 'n' ? false : true;
    }
}