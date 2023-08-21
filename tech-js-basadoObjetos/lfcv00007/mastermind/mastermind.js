const { Console } = require('console-mpds');
const console = new Console();

startMastermind();

function startMastermind() {
    const mastermind = {
        ALLOWED_COLORS: 'rgbycm',
        MAX_ATTEMPTS: 10,
        COMBINATION_LENGTH: 4,
        secretCombination: '',
        proposedCombination: '',
        attempt: 0,
        blacks: 0,
        whites: 0,
        previousResultsMessages: [],
        endOfgame: false
    };

    do {
        mastermind.secretCombination = generateRandomCombination(mastermind);
        playMastermind(mastermind);
    } while (isResumed() === true);

    function generateRandomCombination(mastermind) {
        const secretCombination = [];
        let i = 0;
        while (i <= mastermind.COMBINATION_LENGTH - 1) {
            let randomColor = mastermind.ALLOWED_COLORS[Math.round(Math.random() * (mastermind.ALLOWED_COLORS.length - 1))];
            if (isDuplicatedColor(secretCombination, randomColor) === false) {
                secretCombination[i] = randomColor;
                i++
            }
        }
        return secretCombination;

        function isDuplicatedColor(secretCombination, color) {
            for (let i = 0; i < secretCombination.length; i++) {
                if (secretCombination[i] === color) {
                    return true;
                }
            }
            return false;
        }
    }

    function playMastermind(mastermind) {
        do {
            printBoardMessages(mastermind);
            if (isEndOfGame(mastermind) === true) {
                mastermind.endOfgame = true;
            } else {
                mastermind = playNextAttempt(mastermind);
            }
        } while (mastermind.endOfgame === false);
        printEndOfGameMessage(mastermind);

        function printBoardMessages(mastermind) {
            if (mastermind.attempt === 0) {
                console.writeln(` ----- MASTERMIND ----- `);
            }        
            console.writeln(`\n ${mastermind.attempt + 1} attempt(s): \n****`);
            for (let i = 0; i < mastermind.previousResultsMessages.length; i++) {
                console.writeln(mastermind.previousResultsMessages[i]);
            }
        }

        function isEndOfGame(mastermind) {
            if (mastermind.blacks === mastermind.COMBINATION_LENGTH) return true;
            if (mastermind.attempt === mastermind.MAX_ATTEMPTS - 1) return true;
            return false;
        }

        function playNextAttempt(mastermind) {
            mastermind.proposedCombination = proposeSecretCombination(mastermind.ALLOWED_COLORS, mastermind.COMBINATION_LENGTH);
            countBlacksAndWhites(mastermind);
            mastermind.attempt++;
            return mastermind;

            function proposeSecretCombination(ALLOWED_COLORS, COMBINATION_LENGTH) {
                let isValid = false;
                let proposedCombination = '';
                do {
                    proposedCombination = console.readString(`Propose a combination: `);
                    if (isValidCombination(proposedCombination, ALLOWED_COLORS, COMBINATION_LENGTH) === true) {
                        isValid = true;
                    }
                } while (isValid === false);
                return proposedCombination;

                function isValidCombination(proposedCombination, ALLOWED_COLORS, COMBINATION_LENGTH) {
                    if (isValidLength(proposedCombination, COMBINATION_LENGTH) === false) {
                        console.writeln(`Wrong proposed combination length`);
                        return false;
                    }

                    if (hasValidColors(proposedCombination, ALLOWED_COLORS) === false) {
                        console.writeln(`Wrong colors, they must be: rgybmc`)
                        return false;
                    }

                    if (hasRepeatedColors(proposedCombination) === true) {
                        console.writeln(`Wrong colors, they must be: rgybmc without repeated`)
                        return false;
                    }
                    return true;

                    function isValidLength(proposedCombination, COMBINATION_LENGTH) {
                        return proposedCombination.length === COMBINATION_LENGTH ? true : false;
                    }

                    function hasValidColors(proposedCombination, ALLOWED_COLORS) {
                        for (let i = 0; i < proposedCombination.length; i++) {
                            if (isValidColor(ALLOWED_COLORS, proposedCombination[i]) === false) {
                                return false;
                            }
                        }
                        return true;

                        function isValidColor(ALLOWED_COLORS, color) {
                            let isValid = false;
                            for (let j = 0; isValid === false && j < ALLOWED_COLORS.length; j++) {
                                if (ALLOWED_COLORS[j] === color) {
                                    isValid = true;
                                }
                            }
                            return isValid;
                        }
                    }

                    function hasRepeatedColors(proposedCombination) {
                        let repeatedColorCount = [];
                        for (let i = 0; i < proposedCombination.length; i++) {
                            let count = 0;
                            for (let j = 0; j < proposedCombination.length; j++) {
                                if (proposedCombination[i] === proposedCombination[j]) {
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
                }
            }

            function countBlacksAndWhites(mastermind) {
                let blacks = 0;
                let whites = 0;
                for (let i = 0; i < mastermind.secretCombination.length; i++) {
                    for (let j = 0; j < mastermind.proposedCombination.length; j++) {
                        if (j === i && mastermind.secretCombination[i] === mastermind.proposedCombination[j]) {
                            blacks++;
                        } else if (mastermind.secretCombination[i] === mastermind.proposedCombination[j]) {
                            whites++;
                        }
                    }
                }
                mastermind.previousResultsMessages[mastermind.attempt] = `${mastermind.proposedCombination} --> ${blacks} blacks and ${whites} whites`;
                mastermind.blacks = blacks;
                mastermind.whites = whites;
            }
        }

        function printEndOfGameMessage(mastermind) {
            const secretCombinationMsg = `Secret combination:\n * * * *\n ${mastermind.secretCombination}`;
            if (mastermind.blacks === mastermind.COMBINATION_LENGTH) {
                console.writeln(`You've won!!! ;-) \n ${secretCombinationMsg}`);
            } else {
                console.writeln(`You've lost!!! :-( \n ${secretCombinationMsg}`);
            }
        }
    }

    function isResumed() {
        let userInput = '';
        do {
            userInput = console.readString(`Do you want to continue? (y/n)?`);
        } while (userInput !== 'y' && userInput !== 'n');
        return userInput === 'y' ? true : false;
    }
}