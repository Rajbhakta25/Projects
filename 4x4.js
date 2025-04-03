document.addEventListener("DOMContentLoaded",()=>{

    const switchButton = document.getElementById("switch");

    switchButton.addEventListener("click", () => {
        window.location.href = 'index.html';
    });

    const cells = [...document.querySelectorAll(".cell")];
    const puzzle = document.querySelector(".puzzle");
    const shuffleButton = document.getElementById("shuffle-button");
    const winMessage = document.getElementById("win-message");
    const timerDisplay = document.getElementById("timer");
    const bestTimeDisplay = document.getElementById("best-time");
    const bestMovesDisplay = document.getElementById("best-moves");

    let moveCount = 0;
    let startTime = null;
    let timerInterval;
    let bestTime = localStorage.getItem('bestTime') || null;
    let bestMoves = localStorage.getItem('bestMoves') || null;

    if (bestTime) {
        bestTimeDisplay.textContent = `${bestTime} seconds`;
    }

    if (bestMoves) {
        bestMovesDisplay.textContent = `${bestMoves}`;
    }

    const countInversions = (arr) => {
        let inversions = 0;
        for (let i = 0; i < arr.length - 1; i++) {
            for (let j = i + 1; j < arr.length; j++) {
                if (arr[i] > arr[j]) {
                    inversions++;
                }
            }
        }
        return inversions;
    };

    const getBlankTileRow = () => {
        const blankTileIndex = cells.findIndex(cell => cell.classList.contains("empty"));
        return Math.floor(blankTileIndex / 4);
    };

    const isSolvable = () => {
        const grid = cells.filter(cell => !cell.classList.contains("empty")).map(cell => parseInt(cell.innerText, 10));

        const inversions = countInversions(grid);
        const blankRow = getBlankTileRow();

        return (blankRow % 2 === 0 && inversions % 2 === 1) || (blankRow % 2 === 1 && inversions % 2 === 0);
    };

    const startTimer = () => {
        if (!startTime) {
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 1000)
        }
    };

    const updateTimer = () => {
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
        timerDisplay.textContent = `Time: ${elapsedTime}s`;
    };

    const resetTimer = () => {
        startTime = null;
        clearInterval(timerInterval);
        timerDisplay.textContent = "Time: 0s";
        startTimer();
    };

    const stopTimer = () => {
        clearInterval(timerInterval);
        const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

        if (!bestTime || elapsedTime < bestTime) {
            bestTime = elapsedTime;
            bestTimeDisplay.textContent = bestTime + "s";
            localStorage.setItem('bestTime4', bestTime);
        }

        if (!bestMoves || moveCount < bestMoves) {
            bestMoves = moveCount;
            bestMovesDisplay.textContent = bestMoves;
            localStorage.setItem('bestMoves4', bestMoves);
        }
    };

    const isAdjacent = (index1, index2)=>{
        if (index2 < 0 || index2 >= cells.length) return false;
        const [row1, col1] = [Math.floor(index1 / 4), index1 % 4];
        const [row2, col2] = [Math.floor(index2 / 4), index2 % 4];
        return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
    }

    const swapCells = (cell1, cell2)=>{
        [cell1.innerHTML, cell2.innerHTML] = [cell2.innerHTML, cell1.innerHTML];
        cell1.classList.toggle("empty");
        cell2.classList.toggle("empty");
    }

    const getAdjacentIndices = index =>{
        const [row, col] = [Math.floor(index / 4), index % 4];
        return [
            row > 0 ? index - 4 : null,
            row < 3 ? index + 4 : null,
            row > 0 ? index - 1 : null,
            row < 3 ? index + 1 : null,
        ].filter(n => n !== null);
    };

    const isSolved = () => cells.slice(0, -1).every((cell, i) => cell.innerHTML === (i + 1).toString());

    const shufflePuzzle = ()=>{
        moveCount = 0;
        updateMoveCount();
        resetTimer();
        winMessage.classList.add("hidden");

        let shuffled = false;

        while (!shuffled) {
            for (let i = 0; i < 100; i++) {
                const emptyCell = cells.find(cell => cell.classList.contains("empty"));
                const emptyIndex = cells.indexOf(emptyCell);
                const neighbors = getAdjacentIndices(emptyIndex);
                const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
                swapCells(cells[randomNeighbor], emptyCell);
            }

            if (isSolvable()) {
                shuffled = true;
            }
        }
        startTimer();
    };

    const moveTileWithArrowKey = (e) => {
        e.preventDefault();
        const emptyCell = cells.find(cell => cell.classList.contains("empty"));
        const emptyIndex = cells.indexOf(emptyCell);

        let targetIndex = -1;

        if (e.key === "ArrowUp") {
            targetIndex = emptyIndex - 4;
        } else if (e.key === "ArrowDown") {
            targetIndex = emptyIndex + 4;
        } else if (e.key === "ArrowLeft") {
            targetIndex = emptyIndex - 1;
        } else if (e.key === "ArrowRight") {
            targetIndex = emptyIndex + 1;
        }

        if (targetIndex >= 0 && targetIndex < cells.length && isAdjacent(emptyIndex, targetIndex)) {
            const targetCell = cells[targetIndex];
            const emptyCellRect = emptyCell.getBoundingClientRect();
            const targetCellRect = targetCell.getBoundingClientRect();
            targetCell.style.transition = "transform 0.8s ease";
            targetCell.style.transform = `translate(${emptyCellRect.left - targetCellRect.left}px, ${emptyCellRect.top - targetCellRect.top}px)`;

            setTimeout(() => {
                swapCells(cells[emptyIndex], cells[targetIndex]);
                targetCell.style.transition = "";
                targetCell.style.transform = "";

                moveCount++;
                updateMoveCount();

                if (isSolved()) {
                    stopTimer();
                    winMessage.classList.remove("hidden");
                    winMessage.classList.add("visible");
                    winMessage.textContent = `Congratulations! You solved the puzzle in ${moveCount} moves!`;

                    startConfetti();
                    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);

                    if (!bestTime || elapsedTime < bestTime) {
                        bestTime = elapsedTime;
                        localStorage.setItem('bestTime', bestTime);
                    }

                    if (!bestMoves || moveCount < bestMoves) {
                        bestMoves = moveCount;
                        localStorage.setItem('bestMoves', bestMoves);
                    }

                    bestTimeDisplay.textContent = `${bestTime}s`;
                    bestMovesDisplay.textContent = `${bestMoves}`;
                }
            }, 100);
        }
    };

    if (bestTime !== null) {
        bestTimeDisplay.textContent = `${bestTime}s`;
    }
    if (bestMoves !== null) {
        bestMovesDisplay.textContent = `${bestMoves}`;
    }

    window.addEventListener("keydown", moveTileWithArrowKey);

    puzzle.addEventListener("click", e=>{
        const cell = e.target;
        if (!cell.classList.contains("empty"))
        {
            const emptyCell = cells.find(cell => cell.classList.contains("empty"));
            const cellIndex = cells.indexOf(cell);
            const emptyIndex = cells.indexOf(emptyCell);

            if (isAdjacent(cellIndex, emptyIndex))
            {
                swapCells(cell, emptyCell);
                moveCount++;
                updateMoveCount();

                if(isSolved()) {
                    stopTimer();
                    winMessage.classList.remove("hidden");
                    winMessage.textContent = `Congratulations! You solved the puzzle in ${moveCount} moves!`;
                    startConfetti();
                    if (!bestMoves || moveCount < bestMoves) {
                        bestMoves = moveCount;
                        localStorage.setItem('bestMoves', bestMoves);
                    }

                    bestMovesDisplay.textContent = `${bestMoves}`;
                }
            }
        }
    });

    shuffleButton.addEventListener("click", shufflePuzzle);
    const updateMoveCount = () => {
        const moveCountElement = document.getElementById("move-count");
        moveCountElement.textContent = `Moves: ${moveCount}`;
    };

    updateMoveCount();

    const startConfetti = () => {
        const confettiContainer = document.getElementById("confetti-container");
        confettiContainer.style.display = "block";

        const shapes = ["circle", "square", "triangle", "star"];
        const colors = ["#ff6347", "#ff7f50", "#32cd32", "#1e90ff", "ff69b4", "#f39c12"];

        for (let i = 0; i < 300; i++) {
            const confetti = document.createElement("div");
            confetti.classList.add("confetti");

            const size = Math.random() * 15 + 10;
            confetti.style.width = `${size}px`;
            confetti.style.height = `${size}px`;

            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.backgroundColor = randomColor;

            const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
            confetti.style.borderRadius = randomShape === "circle" ? "50%" : randomShape === "square" ? "0%" : "20%";

            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDuration = `${Math.random() * 2 + 4}s`;
            confetti.style.animationDelay = `${Math.random() * 2}s`;
            confetti.style.animationTimingFunction = 'cubic-bezier(0.25, 0.1, 0.01, 2)';
            confettiContainer.appendChild(confetti);
        }

        setTimeout(() => {
            confettiContainer.style.display = "none";
        }, 10000);
    };
});
