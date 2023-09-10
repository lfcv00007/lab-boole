const { Console } = require('console-mpds');
const console = new Console();

const mastermind = initMastermind();

mastermind.start(initContinueDialog());

function initMastermind() {
    const mastermind = {
        secretCombination: initSecretCombination(),
        proposedCombination: initProposedCombination(),
        board: {
            results: [],
            printBoardMessages: function () {
                if (this.getNumberOfAttempts() === 0) {
                    console.writeln(` ----- MASTERMIND ----- `);
                }
                console.writeln(`\n ${this.getNumberOfAttempts() + 1} attempt(s): \n****`);
                for (let i = 0; i < this.results.length; i++) {
                    console.writeln(this.results[i].proposedCombinationMessage);
                }
            },
            playAttempt: function (proposedCombination, secretCombination) {
                proposedCombination.proposeCombination();
                this.results[this.getNumberOfAttempts()] = this.getResult(proposedCombination.getColors(), secretCombination);
                return this.isCodeBroken(secretCombination);
            },
            isCodeBroken: function (secretCombination) {
                if (this.results[this.getNumberOfAttempts() - 1].blacks === secretCombination.length) return true;
                return false;
            },
            getNumberOfAttempts: function () {
                return this.results.length;
            },
            getResult: function (proposedCombination, secretCombination) {
                const result = {
                    proposedCombinationMessage: ``,
                    blacks: 0,
                    whites: 0,
                }
                for (let i = 0; i < secretCombination.length; i++) {
                    for (let j = 0; j < proposedCombination.length; j++) {
                        if (j === i && secretCombination[i] === proposedCombination[j]) {
                            result.blacks++;
                        } else if (secretCombination[i] === proposedCombination[j]) {
                            result.whites++;
                        }
                    }
                }
                result.proposedCombinationMessage = `${proposedCombination} --> ${result.blacks} blacks and ${result.whites} whites`;
                return result;
            },
            isEndOfGame: function(secretCombination) {
                const MAX_ATTEMPTS = 10;
                return this.isCodeBroken(secretCombination) || this.results.length > MAX_ATTEMPTS - 1 ? true : false;
            }
        },

        playMastermind: function () {
            this.board.results = [];
            do {
                this.board.printBoardMessages();
                this.board.playAttempt(this.proposedCombination, this.secretCombination.getColors()); 
            } while (this.board.isEndOfGame(this.secretCombination.getColors()) === false);
        },

        printEndOfGameMessage: function () {
            const secretCombinationMsg = `Secret combination:\n * * * *\n ${this.secretCombination.getColors()}`;
            if (this.board.isCodeBroken(this.secretCombination.getColors())) {
                console.writeln(`You've won!!! ;-) \n ${secretCombinationMsg}`);
            } else {
                console.writeln(`You've lost!!! :-( \n ${secretCombinationMsg}`);
            }
        }
    };

    return {
        start: (continueDialog) => {
            do {
                mastermind.playMastermind();
                mastermind.printEndOfGameMessage();
            } while (continueDialog.isResumed() === true);
        },
    }
};

function initCombination() {
    const ALLOWED_COLORS = 'rgbycm';
    return {
        COMBINATION_LENGTH: 4,
        getRandomColor: function () {
            return ALLOWED_COLORS[Math.round(Math.random() * (ALLOWED_COLORS.length - 1))];
        },
        isValidCombination: function (combination) {
            if (this.isValidLength(combination) === false) {
                console.writeln(`Wrong proposed combination length`);
                return false;
            }

            if (this.hasValidColors(combination) === false) {
                console.writeln(`Wrong colors, they must be: rgybmc`)
                return false;
            }

            if (this.hasRepeatedColors(combination) === true) {
                console.writeln(`Wrong colors, they must be: rgybmc without repeated`)
                return false;
            }
            return true;
        },
        isValidLength: function (combination) {
            return combination.length === this.COMBINATION_LENGTH ? true : false;
        },
        hasValidColors: function (combination) {
            for (let i = 0; i < combination.length; i++) {
                if (this.isValidColor(combination[i]) === false) {
                    return false;
                }
            }
            return true;
        },
        isValidColor: function (color) {
            let isValid = false;
            for (let j = 0; isValid === false && j < ALLOWED_COLORS.length; j++) {
                if (ALLOWED_COLORS[j] === color) {
                    isValid = true;
                }
            }
            return isValid;
        },
        hasRepeatedColors: function (combination) {
            let repeatedColorCount = [];
            for (let i = 0; i < combination.length; i++) {
                let count = 0;
                for (let j = 0; j < combination.length; j++) {
                    if (combination[i] === combination[j]) {
                        count++;
                        repeatedColorCount[i] = count;
                    }
                }
                if (repeatedColorCount.length > 0) {
                    if (repeatedColorCount[i] > 1) {
                        return true;
                    }
                }
            }
            return false;
        }
    };
}

function initSecretCombination() {
    const combination = initCombination();
    const that = {
        colors: [],
        isDuplicatedColor: function (color) {
            for (let i = 0; i < this.colors.length; i++) {
                if (this.colors[i] === color) {
                    return true;
                }
            }
            return false;
        },
        generateRandomCombination: function () {
            let i = 0;
            while (i <= combination.COMBINATION_LENGTH - 1) {
                let randomColor = combination.getRandomColor();
                if (this.isDuplicatedColor(randomColor) === false) {
                    this.colors[i] = randomColor;
                    i++
                }
            }
        },
    };
    that.generateRandomCombination();
    return {
        getColors: function () {
            return that.colors;
        },
    };
}

function initProposedCombination() {
    const combination = initCombination();
    let colors;
    return {
        proposeCombination: () => {
            do {
                colors = console.readString(`Propose a combination: `);
            } while (combination.isValidCombination(colors) === false);
            return colors;
        },
        getColors: function () {
            return colors;
        }
    };
}

function initContinueDialog() {
    return {
        isResumed: () => {
            let userInput;
            do {
                userInput = console.readString(`Do you want to continue? (y/n)?`);
            } while (userInput !== 'y' && userInput !== 'n');
            return userInput === 'y' ? true : false;
        }
    }
}

