// Game variables
let score = 0;
let lives = 3;
let difficulty = 1;
let spawnInterval = 2000; // Initial spawn time in ms
let circleLifespan = 1500; // Initial lifespan in ms
let gameRunning = false;
let soundEnabled = false;
let spawnTimer;
let difficultyTimer;

// DOM elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const gameArea = document.getElementById('game-area');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const soundToggle = document.getElementById('sound-toggle');
const finalScore = document.getElementById('final-score');

// Audio context for simple sounds (muted by default)
let audioContext;
function initAudio() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(frequency, duration) {
    if (!soundEnabled || !audioContext) return;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Event listeners
startBtn.addEventListener('touchstart', startGame);
restartBtn.addEventListener('touchstart', restartGame);
soundToggle.addEventListener('touchstart', toggleSound);

// Start game
function startGame() {
    initAudio();
    score = 0;
    lives = 3;
    difficulty = 1;
    spawnInterval = 2000;
    circleLifespan = 1500;
    updateHUD();
    switchScreen(gameScreen);
    gameRunning = true;
    startSpawning();
    startDifficultyIncrease();
}

// Restart game
function restartGame() {
    clearTimers();
    startGame();
}

// Toggle sound
function toggleSound() {
    soundEnabled = !soundEnabled;
    soundToggle.textContent = `Sound: ${soundEnabled ? 'On' : 'Off'}`;
}

// Switch screens
function switchScreen(newScreen) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    newScreen.classList.add('active');
}

// Update HUD
function updateHUD() {
    scoreDisplay.textContent = `Score: ${score}`;
    livesDisplay.textContent = `Lives: ${lives}`;
}

// Spawn circles
function startSpawning() {
    spawnTimer = setInterval(() => {
        if (!gameRunning) return;
        const circle = document.createElement('div');
        circle.classList.add('circle');
        circle.style.left = Math.random() * (gameArea.clientWidth - 60) + 'px';
        circle.style.top = Math.random() * (gameArea.clientHeight - 60) + 'px';
        circle.addEventListener('touchstart', (e) => {
            e.preventDefault();
            tapCircle(circle);
        });
        gameArea.appendChild(circle);
        setTimeout(() => {
            if (circle.parentNode) {
                missCircle(circle);
            }
        }, circleLifespan);
    }, spawnInterval);
}

// Increase difficulty
function startDifficultyIncrease() {
    difficultyTimer = setInterval(() => {
        if (!gameRunning) return;
        difficulty += 0.1;
        spawnInterval = Math.max(500, 2000 / difficulty);
        circleLifespan = Math.max(500, 1500 / difficulty);
        clearInterval(spawnTimer);
        startSpawning();
    }, 5000); // Increase every 5 seconds
}

// Tap circle
function tapCircle(circle) {
    score++;
    updateHUD();
    playSound(800, 0.1); // High pitch for tap
    if (navigator.vibrate) navigator.vibrate(50);
    circle.remove();
}

// Miss circle
function missCircle(circle) {
    lives--;
    updateHUD();
    playSound(200, 0.3); // Low pitch for miss
    circle.remove();
    if (lives <= 0) {
        gameOver();
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    clearTimers();
    finalScore.textContent = `Final Score: ${score}`;
    switchScreen(gameOverScreen);
}

// Clear timers
function clearTimers() {
    clearInterval(spawnTimer);
    clearInterval(difficultyTimer);
    // Remove all circles
    document.querySelectorAll('.circle').forEach(circle => circle.remove());
}
