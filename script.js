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

let bossFightActive = false;
let boss1Health = 5;
let boss1 = null;
let bossMoveInterval;
let bossMessageVisible = false;

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('startSound').play();
    gameRunning = true;
    gameInterval = setInterval(createObstacle, 2000);
    if (score >= 2) {
        startBossFight();
    }
}

function jump() {
    if (!isJumping && !isAttacking) {
        isJumping = true;
        dino.style.transform = 'translateY(-90px)';
        setTimeout(() => {
            dino.style.transform = 'translateY(0)';
            isJumping = false;
        }, 350);
        document.getElementById('jumpSound').play();
    }
}

function attack() {
    if (!isAttacking && !isJumping) {
        isAttacking = true;
        dino.src = 'img/reaperattack.gif';
        setTimeout(() => {
            dino.src = 'img/reapermove.gif';
            isAttacking = false;
        }, 500);
        document.getElementById('attackSound').play();
    }
}

function createObstacle() {
    if (gameRunning && obstacleCount < 3 && (!boss1 || boss1.style.left === '30px')) {
        const obstacle = document.createElement('div');
        obstacle.classList.add('obstacle');
        const color = Math.random() < 0.5 ? 'red' : 'blue';
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
                        if (isAttacking && obstacle.getAttribute('data-color') === 'red') {
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
                            if (score >= 2) {
                                startBossFight();
                            }
                        } else {
                            gameOver();
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
    
    // No detectar colisiones si el mensaje del jefe está visible
    if (bossMessageVisible) {
        return false;
    }

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

function resetBoss1() {
    clearInterval(bossMoveInterval); // Limpiar el intervalo de movimiento del boss1 si existe
    if (boss1) {
        boss1.remove(); // Eliminar el boss1 del DOM si existe
        boss1 = null;
    }
    boss1Health = 3; // Reiniciar la vida del boss1
    bossFightActive = false;
    bossMessageVisible = false;
}

function restartGame() {
    const deadSound = document.getElementById('deadSound');
    deadSound.pause();
    deadSound.currentTime = 0;
    score = 0;
    updateScore();
    obstacleSpeed = 5;
    obstacleCount = 0;
    gameContainer.innerHTML = '';
    resetBoss1(); // Reiniciar todas las variables relacionadas con el boss1
    document.getElementById('game-over-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
}


function updateScore() {
    document.getElementById('score').innerText = score;
}

function moveBackground() {
    backgroundPosition -= backgroundSpeed;
    gameContainer.style.backgroundPositionX = backgroundPosition + 'px';
    if (backgroundPosition <= -gameContainer.offsetWidth) {
        backgroundPosition = 0;
    }
}

setInterval(moveBackground, 20);

function startBossFight() {
    if (!boss1 && score == 5) {
        boss1 = document.createElement('div');
        boss1.classList.add('boss1');
        boss1.dataset.health = boss1Health;
        boss1.style.left = 'calc(100% - 120px)';
        boss1.style.bottom = '30px';
        boss1.style.backgroundImage = 'url("img/raphael.gif")';
        gameContainer.appendChild(boss1);

        boss1.style.transition = 'left 1s linear'; // Establecer la transición para el movimiento

        bossMoveInterval = setInterval(() => { // Iniciar intervalo para movimiento continuo
            if (!bossFightActive) {
                clearInterval(bossMoveInterval);
                return;
            }

            // Mover boss1 hacia adelante solo si no se está mostrando el mensaje
            if (!bossMessageVisible) {
                boss1.style.left = '30px';
                setTimeout(() => {
                    if (checkCollision(boss1)) {
                        if (isAttacking) {
                            boss1.style.backgroundImage = 'url("img/raphael_dmg.gif")'; // Cambia a la imagen de daño
                            boss1Health--;
                            boss1.dataset.health = boss1Health;
                            setTimeout(() => {
                                boss1.style.backgroundImage = 'url("img/raphael.gif")'; // Cambia de vuelta al fondo normal después de un tiempo
                            }, 300);
                        } else {
                            boss1.style.backgroundImage = 'url("img/raphael_dmg.gif")'
                            setTimeout(() => {
                                boss1.style.backgroundImage = 'url("img/raphael.gif")';
                            }, 300);
                            gameOver();
                        }
                    } else {
                        boss1.style.backgroundImage = 'url("img/raphael.gif")'; // Restablecer color si no hay colisión
                    }
                }, 1000);
            }

            // Mover boss1 hacia atrás después de 1 segundo
            setTimeout(() => {
                if (boss1Health <= 0) {
                    clearInterval(bossMoveInterval);
                    boss1.remove();
                    boss1 = null;
                    bossFightActive = false;
                } else {
                    boss1.style.left = 'calc(100% - 120px)';
                }
            }, 1000);
        }, 3000); // aca manejas el retraso para que vuelva a iniciar el loop

        // Mostrar el mensaje del boss1
        bossFightActive = true;
        bossMessageVisible = true;
        const bossMessage = document.getElementById('boss-message');
        bossMessage.style.display = 'block';

        // Detener el juego
        gameRunning = false;
    }
}

document.getElementById('continue-button').addEventListener('click', function() {
    const bossMessage = document.getElementById('boss-message');
    bossMessage.style.display = 'none';
    bossMessageVisible = false;
    gameRunning = true;
});

