        let attemptCount = 0;
        let maxNumber = 10;
        let targetNumber;
        let bestScores = JSON.parse(localStorage.getItem('guessTheNumberBestScores')) || {};

        const guessInput = document.getElementById("guessInput");
        const outputMessage = document.getElementById("output");
        const outputAttempts = document.getElementById("output2");
        const checkButton = document.getElementById("checkButton");
        const restartButton = document.getElementById("restartButton");
        const difficultySelect = document.getElementById("difficulty");
        const startGameButton = document.getElementById("startGame");
        const rangeDisplay = document.getElementById("rangeDisplay");
        const bestScoreDisplay = document.getElementById("bestScore");
        const themeToggle = document.getElementById("themeToggle");
        const body = document.body;

        function initializeGame() {
            attemptCount = 0;
            maxNumber = parseInt(difficultySelect.value);
            targetNumber = Math.floor(Math.random() * maxNumber) + 1;

            guessInput.value = "";
            outputMessage.textContent = "";
            outputAttempts.textContent = "";
            checkButton.disabled = false;
            guessInput.disabled = false;
            guessInput.placeholder = `Enter your guess (1-${maxNumber})`;
            guessInput.setAttribute("max", maxNumber);
            rangeDisplay.textContent = `Guess between 1 and ${maxNumber}`;

            guessInput.classList.remove('correct', 'incorrect');
            updateBestScoreDisplay();
            removeConfetti();
        }

        function updateBestScoreDisplay() {
            const currentDifficulty = difficultySelect.value;
            if (bestScores[currentDifficulty]) {
                bestScoreDisplay.textContent = `Best Score (${currentDifficulty}): ${bestScores[currentDifficulty]} attempts`;
            } else {
                bestScoreDisplay.textContent = `Best Score (${currentDifficulty}): N/A`;
            }
        }

        function saveBestScore() {
            const currentDifficulty = difficultySelect.value;
            if (!bestScores[currentDifficulty] || attemptCount < bestScores[currentDifficulty]) {
                bestScores[currentDifficulty] = attemptCount;
                localStorage.setItem('guessTheNumberBestScores', JSON.stringify(bestScores));
                updateBestScoreDisplay();
            }
        }

        function triggerConfetti() {
            const confettiContainer = document.createElement('div');
            confettiContainer.classList.add('confetti-container');
            document.body.appendChild(confettiContainer);

            for (let i = 0; i < 100; i++) {
                const confetti = document.createElement('div');
                confetti.classList.add('confetti');
                confetti.style.left = `${Math.random() * 100}vw`;
                confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
                confetti.style.setProperty('--x', `${(Math.random() - 0.5) * 500}px`);
                confetti.style.setProperty('--y', `${window.innerHeight + 100}px`);
                confettiContainer.appendChild(confetti);
            }

            setTimeout(() => {
                removeConfetti();
            }, 3000);
        }

        function removeConfetti() {
            const existingConfetti = document.querySelector('.confetti-container');
            if (existingConfetti) {
                existingConfetti.remove();
            }
        }

        checkButton.addEventListener("click", function () {
            const guessedNumber = parseInt(guessInput.value);

            guessInput.classList.remove('correct', 'incorrect');

            if (isNaN(guessedNumber)) {
                outputMessage.textContent = "Oops! Please enter a valid number.";
                outputAttempts.textContent = "";
                guessInput.classList.add('incorrect');
                return;
            }

            attemptCount++;

            if (guessedNumber < 1 || guessedNumber > maxNumber) {
                outputMessage.textContent = `Whoops! Please enter a number within the range 1-${maxNumber}.`;
                outputAttempts.textContent = "";
                guessInput.classList.add('incorrect');
            } else if (guessedNumber > targetNumber) {
                outputMessage.textContent = "Too high! Guess lower. ⬇️";
                outputAttempts.textContent = `Attempts: ${attemptCount}`;
                guessInput.classList.add('incorrect');
            } else if (guessedNumber < targetNumber) {
                outputMessage.textContent = "Too low! Guess higher. ⬆️";
                outputAttempts.textContent = `Attempts: ${attemptCount}`;
                guessInput.classList.add('incorrect');
            } else {
                outputMessage.textContent = "🎉 Congratulations! You nailed it!";
                outputAttempts.textContent = `You took ${attemptCount} attempt${attemptCount === 1 ? '' : 's'}.`;
                checkButton.disabled = true;
                guessInput.disabled = true;
                guessInput.classList.add('correct');
                saveBestScore();
                triggerConfetti();
            }

            guessInput.value = "";
            guessInput.focus();
        });

        startGameButton.addEventListener("click", initializeGame);
        restartButton.addEventListener("click", initializeGame);

        themeToggle.addEventListener("click", () => {
            body.classList.toggle("dark-mode");
            if (body.classList.contains("dark-mode")) {
                themeToggle.textContent = "💡";
            } else {
                themeToggle.textContent = "🌙";
            }
        });

        initializeGame();
