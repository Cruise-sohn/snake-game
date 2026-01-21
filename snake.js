const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake, direction, food, gameOver, score, speed, movePending, loopTimeout;

// 랭킹 관련 상수 및 함수
const RANKING_KEY = 'snake_ranking';
const MAX_RANKING = 5;

function getRanking() {
    return JSON.parse(localStorage.getItem(RANKING_KEY) || '[]');
}

function saveRanking(ranking) {
    localStorage.setItem(RANKING_KEY, JSON.stringify(ranking));
}

function updateRanking(newScore) {
    let ranking = getRanking();
    ranking.push(newScore);
    ranking.sort((a, b) => b - a);
    ranking = ranking.slice(0, MAX_RANKING);
    saveRanking(ranking);
    renderRanking();
}

function renderRanking() {
    const ranking = getRanking();
    const rankingList = document.getElementById('rankingList');
    if (!rankingList) return;
    rankingList.innerHTML = '';
    ranking.forEach((score, idx) => {
        const li = document.createElement('li');
        li.textContent = `${score} 점`;
        rankingList.appendChild(li);
    });
}

function initGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    food = { x: 15, y: 15 };
    gameOver = false;
    score = 0;
    speed = speed || 5; // 기본 속도 5
    movePending = false;
    draw();
    renderRanking();
} 

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw snake
    ctx.fillStyle = '#4caf50';
    snake.forEach(part => {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize - 2, gridSize - 2);
    });
    // Draw food
    ctx.fillStyle = '#ff5252';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '18px Arial';
    ctx.fillText('Score: ' + score, 10, 20);
    // Draw game over
    if (gameOver) {
        ctx.fillStyle = '#fff';
        ctx.font = '36px Arial';
        ctx.fillText('Game Over', 100, 200);
        ctx.font = '24px Arial';
        ctx.fillText('Score: ' + score, 150, 240);
        updateRanking(score); // 게임 오버 시 랭킹 업데이트
    }
}

function moveSnake() {
    if (direction.x === 0 && direction.y === 0) return; // 움직이지 않으면 진행 X
    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
    // Check wall collision
    if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) {
        gameOver = true;
        return;
    }
    // Check self collision
    for (let part of snake) {
        if (head.x === part.x && head.y === part.y) {
            gameOver = true;
            return;
        }
    }
    snake.unshift(head);
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        placeFood();
    } else {
        snake.pop();
    }
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
    // Make sure food doesn't spawn on the snake
    for (let part of snake) {
        if (food.x === part.x && food.y === part.y) {
            placeFood();
            return;
        }
    }
}

function gameLoop() {
    clearTimeout(loopTimeout);
    if (!gameOver) {
        moveSnake();
        draw();
        movePending = false;
        loopTimeout = setTimeout(gameLoop, 1000 / speed);
    } else {
        draw();
    }
}

document.addEventListener('keydown', e => {
    if (movePending) return;
    switch (e.key) {
        case 'ArrowUp': if (direction.y !== 1) direction = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (direction.y !== -1) direction = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (direction.x !== 1) direction = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (direction.x !== -1) direction = { x: 1, y: 0 }; break;
    }
    movePending = true;
});

// Restart button
const restartBtn = document.getElementById('restartBtn');
restartBtn.addEventListener('click', () => {
    clearTimeout(loopTimeout);
    initGame();
    gameLoop();
});

// Speed control
const slowerBtn = document.getElementById('slowerBtn');
const fasterBtn = document.getElementById('fasterBtn');
const speedValue = document.getElementById('speedValue');

function updateSpeedDisplay() {
    speedValue.textContent = speed;
}
slowerBtn.addEventListener('click', () => {
    if (speed > 1) speed--;
    updateSpeedDisplay();
});
fasterBtn.addEventListener('click', () => {
    if (speed < 20) speed++;
    updateSpeedDisplay();
});

// 속도 조절이 바로 적용되도록 gameLoop에서 1000/speed로 동작

// 최초 실행
initGame();
gameLoop();
updateSpeedDisplay();
