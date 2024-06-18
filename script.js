const gameContainer = document.getElementById('game');
const dino = document.getElementById('dino');
let backgroundPosition = 0;
const backgroundSpeed = 2;
let isJumping = false;
let isAttacking = false;
let score = 0;
let obstacleSpeed = 5;
let obstacleCount = 0;
let gameInterval;
let gameRunning = false;
let buttonHighlighted = false;
let firstRedObstacle = true;
let firstBlueObstacle = true;
let jumpButtonPressed = false; // Variable para seguimiento del botón de salto
let attackButtonPressed = false; // Variable para seguimiento del botón de ataque
let nextObstacleIsBlue = true; // Control de secuencia de colores
let nextObstacleIsRed = false;

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('startSound').play();
    gameRunning = true;
    gameInterval = setInterval(() => {
        if (!buttonHighlighted) {
            createObstacle();
        }
    }, 2000);
}

function jump() {
    if (!isJumping && !isAttacking) {
        const jumpButton = document.getElementById('jump-button');
        if (jumpButton.classList.contains('highlight') || jumpButtonPressed) {
            isJumping = true;
            dino.style.transform = 'translateY(-90px)';
            setTimeout(() => {
                dino.style.transform = 'translateY(0)';
                isJumping = false;
            }, 350);

            document.getElementById('jumpSound').play();
            if (buttonHighlighted && !jumpButtonPressed) {
                removeHighlight();
                continueObstacleMovement();
            }
            jumpButtonPressed = true;
        }
    }
}

function attack() {
    if (!isAttacking && !isJumping) {
        const attackButton = document.getElementById('attack-button');
        if (attackButton.classList.contains('highlight') || attackButtonPressed) {
            isAttacking = true;
            dino.src = 'img/reaperattack.gif';
            setTimeout(() => {
                dino.src = 'img/reapermove.gif';
                isAttacking = false;
            }, 500);

            document.getElementById('attackSound').play();
            if (buttonHighlighted && !attackButtonPressed) {
                removeHighlight();
                continueObstacleMovement();
            }
            attackButtonPressed = true;
        }
    }
}


function createObstacle() {
    if (gameRunning && obstacleCount < 3 && !buttonHighlighted) {
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        let color;

        if (nextObstacleIsBlue) {
            color = 'blue';
            nextObstacleIsBlue = false;
            nextObstacleIsRed = true;
        } else if (nextObstacleIsRed) {
            color = 'red';
            nextObstacleIsBlue = true;
            nextObstacleIsRed = false;
        } else {
            color = Math.random() < 0.5 ? 'red' : 'blue';
        }

        obstacle.classList.add(color);
        obstacle.setAttribute('data-color', color);

        if (color === 'red') {
            obstacle.style.backgroundImage = 'url("img/red_obstacle_animation.gif")';
        } else {
            obstacle.style.backgroundImage = 'url("img/tumba1.png")';
        }

        gameContainer.appendChild(obstacle);

        const gameWidth = gameContainer.offsetWidth;
        const obstacleWidth = obstacle.offsetWidth;

        obstacle.style.right = -(obstacleWidth) + 'px';

        const randomGap = Math.random() * 500 + 100;
        setTimeout(() => {
            const obstacleMoveInterval = setInterval(() => {
                const obstaclePosition = parseInt(obstacle.style.right);
                if (obstaclePosition >= gameWidth) {
                    obstacle.remove();
                    clearInterval(obstacleMoveInterval);
                    obstacleCount--;
                } else {
                    obstacle.style.right = obstaclePosition + obstacleSpeed + 'px';
                    if (checkCollision(obstacle)) {
                        if ((color === 'red' && firstRedObstacle) || (color === 'blue' && firstBlueObstacle)) {
                            if (color === 'red') {
                                highlightButton('attack-button');
                                firstRedObstacle = false;
                            } else {
                                highlightButton('jump-button');
                                firstBlueObstacle = false;
                            }
                            clearInterval(obstacleMoveInterval);
                            stopObstacleMovement(obstacle);
                        } else {
                            if (color === 'red' && isAttacking) {
                                const destroyObstacle = document.createElement('div');
                                destroyObstacle.classList.add('obstacle');
                                destroyObstacle.style.backgroundImage = 'url("img/red_obstacle_destroy.gif")';
                                destroyObstacle.style.position = 'absolute';
                                destroyObstacle.style.width = obstacleWidth + 'px';
                                destroyObstacle.style.height = obstacle.offsetHeight + 'px';
                                destroyObstacle.style.top = obstacle.style.top;
                                destroyObstacle.style.right = obstacle.style.right;
                                destroyObstacle.style.zIndex = '10';
                                gameContainer.appendChild(destroyObstacle);

                                setTimeout(() => {
                                    destroyObstacle.remove();
                                }, 500);

                                obstacle.remove();
                                clearInterval(obstacleMoveInterval);
                                obstacleCount--;
                                score += 1;
                                updateScore();
                            } else {
                                gameOver();
                            }
                        }
                    }
                }
            }, 20);
        }, randomGap);

        obstacleCount++;

        if (score > 0 && score % 5 === 0) {
            obstacleSpeed += 0.5;
        }
    }
}

function checkCollision(obstacle) {
    const dinoRect = dino.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    return (
        dinoRect.bottom >= obstacleRect.top &&
        dinoRect.top <= obstacleRect.bottom &&
        dinoRect.right >= obstacleRect.left &&
        dinoRect.left <= obstacleRect.right
    );
}

function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;

    const gameOverScreen = document.getElementById('game-over-screen');
    const gameOverScoreDisplay = document.getElementById('game-over-score');
    gameOverScoreDisplay.textContent = score;
    gameOverScreen.style.display = 'flex';

    const deadSound = document.getElementById('deadSound');
    deadSound.play();

    const startSound = document.getElementById('startSound');
    startSound.onplay = function() {
        if (!startSound.paused) {
            deadSound.pause();
            deadSound.currentTime = 0;
        }
    };
}

function restartGame() {
    const deadSound = document.getElementById('deadSound');
    deadSound.pause();
    deadSound.currentTime = 0;
    score = 0;
    updateScore();
    obstacleSpeed = 5;
    obstacleCount = 0;
    firstRedObstacle = true;
    firstBlueObstacle = true;
    gameContainer.innerHTML = '';
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    jumpButtonPressed = false;
    attackButtonPressed = false;
    nextObstacleIsBlue = true; // Restablecer la secuencia de colores
    nextObstacleIsRed = false;
}

function updateScore() {
    document.getElementById('score').innerText = score;
}

function moveBackground() {
    if (!buttonHighlighted) {
        backgroundPosition -= backgroundSpeed;
        gameContainer.style.backgroundPositionX = backgroundPosition + 'px';

        if (backgroundPosition <= -gameContainer.offsetWidth) {
            backgroundPosition = 0;
        }
    }
}

setInterval(moveBackground, 20);

function highlightButton(buttonId) {
    document.getElementById(buttonId).classList.add('highlight');
    buttonHighlighted = true;

    // Mostrar el popup con el mensaje adecuado
    const popup = document.getElementById('popup');
    const popupMessage = document.getElementById('popup-message');
    if (buttonId === 'jump-button') {
        popupMessage.textContent = 'You must jump the graves';
    } else if (buttonId === 'attack-button') {
        popupMessage.textContent = 'Attack the ghost to reap his soul';
    }
    popup.style.display = 'block';
}

function removeHighlight() {
    document.querySelectorAll('.action-button').forEach(button => {
        button.classList.remove('highlight');
    });
    buttonHighlighted = false;

    // Ocultar el popup
    const popup = document.getElementById('popup');
    popup.style.display = 'none';
}

function stopObstacleMovement(obstacle) {
    const stopPosition = parseInt(obstacle.style.right) + 5;
    obstacle.style.right = stopPosition + 'px';
    obstacle.style.animationPlayState = 'paused';
}

function continueObstacleMovement() {
    const obstacles = document.querySelectorAll('.obstacle');
    obstacles.forEach(obstacle => {
        if (parseInt(obstacle.style.right) >= 5) {
            obstacle.remove();
        }
    });
}
