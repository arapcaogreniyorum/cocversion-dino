// --- TEMEL DEĞİŞKENLER VE DOM ELEMANLARI ---
const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen'); 

let isJumping = false;
let isGameOver = true; 
let isGameRunning = false; 
let score = 0;
let gameSpeed = 10; // Çarpışma hassasiyeti için düşük değer (hızlı döngü)
let obstacleIntervals = []; 
let obstacleGenerationTimeout; 

// Boyutları koruyoruz
const BARBARIAN_WIDTH = 30;
const BARBARIAN_HEIGHT = 30;
const OBSTACLE_WIDTH = 28;
const OBSTACLE_HEIGHT = 28;

// YENİ TOLERANS AYARI: Barbar'ın Hitbox'ını (Vuruş Alanını) küçültüyoruz
const BARBARIAN_HITBOX_ADJUSTMENT = 5; // Yatayda 5 piksel tolerans
const OBSTACLE_TOLERANCE_PX = 5; // Dikeyde 5 piksel tolerans (önceki adımdan kaldı)

// Zıplama Parametreleri
const JUMP_HEIGHT = '100px'; 
const JUMP_DURATION_MS = 100; 
const FALL_DURATION_MS = 100; 
const BARBARIAN_LEFT_POSITION = 50;
const GAME_CONTAINER_WIDTH = 600; 
const GROUND_POSITION_PX = 0; 


// --- FONKSİYONLAR ---

function startGame() {
    obstacleIntervals.forEach(clearInterval);
    obstacleIntervals = []; 
    clearTimeout(obstacleGenerationTimeout);
    
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());

    isGameOver = false;
    isGameRunning = true;
    score = 0;
    gameSpeed = 10; 
    scoreDisplay.innerHTML = `Puan: 0`;
    gameContainer.style.borderBottom = '3px solid #663300';
    barbarian.style.bottom = GROUND_POSITION_PX + 'px'; 
    
    barbarian.classList.remove('barbarian-burned');
    
    gameContainer.classList.add('is-running');
    
    generateObstacles(); 
}


// 1. Zıplama Mantığı
function jump() {
    if (!isGameRunning || isJumping) return; 
    
    isJumping = true;
    
    barbarian.style.transition = `bottom ${JUMP_DURATION_MS}ms ease-out`;
    barbarian.style.bottom = JUMP_HEIGHT; 

    setTimeout(() => {
        barbarian.style.transition = `bottom ${FALL_DURATION_MS}ms ease-in`; 
        barbarian.style.bottom = GROUND_POSITION_PX + 'px'; 
        
        setTimeout(() => {
            isJumping = false;
            barbarian.style.transition = 'bottom 0.1s ease-out'; 
            
        }, FALL_DURATION_MS); 

    }, JUMP_DURATION_MS); 
}

// 2. Engel Oluşturma ve Hareket Mantığı
function createObstacle() {
    if (!isGameRunning) return;

    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    gameContainer.appendChild(obstacle);

    let obstaclePosition = GAME_CONTAINER_WIDTH; 
    const moveStep = 2; 
    
    const obstacleInterval = setInterval(moveObstacle, gameSpeed); 
    obstacleIntervals.push(obstacleInterval); 
    
    function moveObstacle() {
        if (!isGameRunning) {
            clearInterval(obstacleInterval);
            return;
        }
        
        obstaclePosition -= moveStep; 
        obstacle.style.right = (GAME_CONTAINER_WIDTH - obstaclePosition) + 'px';


        // 3. Çarpışma Kontrolü (Yatayda Tolerans Eklendi)
        const cssRightValue = GAME_CONTAINER_WIDTH - obstaclePosition;
        const obstacleLeftPosition = GAME_CONTAINER_WIDTH - cssRightValue - OBSTACLE_WIDTH;

        const barbarianBottom = parseInt(window.getComputedStyle(barbarian).getPropertyValue('bottom'));

        // X GÜNCELLENDİ: Barbar'ın sol başlangıç noktasına 5px tolerans eklendi.
        const effectiveBarbarianLeft = BARBARIAN_LEFT_POSITION + BARBARIAN_HITBOX_ADJUSTMENT;
        const effectiveBarbarianWidth = BARBARIAN_WIDTH - BARBARIAN_HITBOX_ADJUSTMENT;

        // Yatayda Çarpışma Kontrolü
        const x_collision = (effectiveBarbarianLeft + effectiveBarbarianWidth > obstacleLeftPosition && 
                            effectiveBarbarianLeft < obstacleLeftPosition + OBSTACLE_WIDTH);

        // Dikeyde Çarpışma Kontrolü (Toleranslı)
        const y_collision = (barbarianBottom < (OBSTACLE_HEIGHT - OBSTACLE_TOLERANCE_PX));


        // ÇARPIŞMA!
        if (x_collision && y_collision) {
            clearInterval(obstacleInterval);
            gameOver();
        } 
        // Engel Başarıyla Geçildi (Puan Sistemi)
        else if (obstaclePosition < -OBSTACLE_WIDTH) { 
            clearInterval(obstacleInterval);
            obstacle.remove();
            updateScore(); 
        }
    }
}

// 4. Oyun Bitti Fonksiyonu
function gameOver() {
    isGameOver = true;
    isGameRunning = false;
    
    obstacleIntervals.forEach(clearInterval);
    clearTimeout(obstacleGenerationTimeout);
    
    gameContainer.style.borderBottom = '3px solid red';
    
    barbarian.classList.add('barbarian-burned');
    
    gameContainer.classList.remove('is-running'); 
    
    messageDisplay.innerHTML = `OYUN BİTTİ! Puanınız: ${score}. Tekrar denemek için dokunun/Space.`;
}

// 5. Puan Güncelleme
function updateScore() {
    score += 10; 
    scoreDisplay.innerHTML = `Puan: ${score}`;
    
    if (score % 50 === 0 && gameSpeed > 1) { 
        gameSpeed -= 1; 
    }
}

// 6. Engel Döngüsünü Başlatma
function generateObstacles() {
    let randomTime = Math.random() * 2000 + 1000; 
    createObstacle();
    
    if (isGameRunning) {
        obstacleGenerationTimeout = setTimeout(generateObstacles, randomTime);
    }
}

// --- GİRİŞ YÖNETİMİ ---

document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        if (!isGameRunning && isGameOver) {
            startGame();
        } else if (isGameRunning) {
            jump();
        }
        event.preventDefault(); 
    }
});

document.addEventListener('click', (event) => {
    if (isGameRunning) {
        jump();
    }
});

document.addEventListener('touchstart', (event) => {
    if (isGameRunning) {
        jump();
    }
});


startScreen.addEventListener('click', startGame);
startScreen.addEventListener('touchstart', startGame);
