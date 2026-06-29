// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 8;
const paddleSpeed = 6;
const ballSpeed = 5;

let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Paddle objects
const player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

const computer = {
    x: canvas.width - 30,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: ballSpeed,
    dy: ballSpeed
};

// Input handling
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
        if (gameRunning) {
            resetBall();
        }
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Mouse movement
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Move player paddle smoothly towards mouse position
    const playerCenter = player.y + player.height / 2;
    if (Math.abs(mouseY - playerCenter) > 5) {
        player.dy = mouseY > playerCenter ? paddleSpeed : -paddleSpeed;
    } else {
        player.dy = 0;
    }
});

// Update player position based on keyboard
function updatePlayerInput() {
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.dy = -paddleSpeed;
    } else if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.dy = paddleSpeed;
    } else if (!keys['ArrowUp'] && !keys['ArrowDown']) {
        player.dy = 0;
    }
}

// Update game state
function update() {
    if (!gameRunning) return;

    // Update player position
    updatePlayerInput();
    player.y += player.dy;

    // Keep player paddle in bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
    }

    // AI for computer paddle
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const aiSpeed = 4.5;

    if (computerCenter < ballCenter - 35) {
        computer.y += aiSpeed;
    } else if (computerCenter > ballCenter + 35) {
        computer.y -= aiSpeed;
    }

    // Keep computer paddle in bounds
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }

    // Update ball position
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.size, Math.min(canvas.height - ball.size, ball.y));
    }

    // Ball collision with player paddle
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on paddle movement
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 3;
    }

    // Ball collision with computer paddle
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        // Add spin based on paddle movement
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 3;
    }

    // Ball out of bounds - scoring
    if (ball.x < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }

    // Cap ball speed
    const maxSpeed = 8;
    if (Math.abs(ball.dx) > maxSpeed) ball.dx = maxSpeed * Math.sign(ball.dx);
    if (Math.abs(ball.dy) > maxSpeed) ball.dy = maxSpeed * Math.sign(ball.dy);
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.dy = (Math.random() - 0.5) * ballSpeed;
    gameRunning = false;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#00ff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawCenterLine();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();

    // Draw status text
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '16px Arial';
        ctx.fillText('Use Mouse or Arrow Keys to move', canvas.width / 2, canvas.height / 2 + 40);
    }
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop();
