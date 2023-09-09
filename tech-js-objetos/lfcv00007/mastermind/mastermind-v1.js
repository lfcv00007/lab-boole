const { Console } = require('console-mpds');
const console = new Console();

const mastermind = initMastermind();

mastermind.start(initContinueDialog());

function initMastermind() {
    const mastermind = {
        secretCombination: initSecretCombination(initCombination()),
        proposedCombination: initProposedCombination(initCombination()),
        attempt: {
            MAX_ATTEMPTS: 10,
            previousAttempts: [],
            playAttempt: function (proposedCombination, secretCombination) {
                this.previousAttempts[this.getNumberOfAttempts()] = proposedCombination.countBlacksAndWhites(secretCombination);
                return this.isCodeBroken(secretCombination);
            },
            isCodeBroken: function (secretCombination) {
                if (this.previousAttempts[this.getNumberOfAttempts() - 1].blacks === secretCombination.length) return true;
                return false;
            },
            getNumberOfAttempts: function () {
                return this.previousAttempts.length;
            }
        },

        playMastermind: function () {
            this.attempt.previousAttempts = [];
            let isEndOfGame = false;
            do {
                this.printBoardMessages();
                this.proposedCombination.proposeCombination();
                let isCodeBroken = this.attempt.playAttempt(this.proposedCombination, this.secretCombination.getSecretCombination()); 
                isEndOfGame = isCodeBroken || this.attempt.getNumberOfAttempts() > this.attempt.MAX_ATTEMPTS - 1;
            } while (isEndOfGame === false);
        },

        printBoardMessages: function () {
            if (this.attempt.getNumberOfAttempts() === 0) {
                console.writeln(` ----- MASTERMIND ----- `);
            }
            console.writeln(`\n ${this.attempt.getNumberOfAttempts() + 1} attempt(s): \n****`);
            for (let i = 0; i < this.attempt.getNumberOfAttempts(); i++) {
                console.writeln(this.attempt.previousAttempts[i].proposedCombinationMessage);
            }
        },

        printEndOfGameMessage: function () {
            const secretCombinationMsg = `Secret combination:\n * * * *\n ${this.secretCombination.getSecretCombination()}`;
            if (this.attempt.isCodeBroken(this.secretCombination.getSecretCombination())) {
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
        isValidLength: function (proposedCombination) {
            return proposedCombination.length === this.COMBINATION_LENGTH ? true : false;
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

function initSecretCombination(combination) {
    const that = {
        secretCombination: [],
        isDuplicatedColor: function (color) {
            for (let i = 0; i < this.secretCombination.length; i++) {
                if (this.secretCombination[i] === color) {
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
                    this.secretCombination[i] = randomColor;
                    i++
                }
            }
        },
    };
    that.generateRandomCombination();
    console.write(that.secretCombination);
    return {
        getSecretCombination: function () {
            return that.secretCombination;
        },
        getCombinationLength: function () {
            return that.secretCombination.length;
        }
    };
}

function initProposedCombination(combination) {
    let proposedCombination;
    return {
        proposeCombination: () => {
            do {
                proposedCombination = console.readString(`Propose a combination: `);
            } while (combination.isValidCombination(proposedCombination) === false);
            return proposedCombination;
        },
        countBlacksAndWhites: (secretCombination) => {
            const result = {
                proposedCombinationMessage: `${proposedCombination} --> ${blacks} blacks and ${whites} whites`,
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

