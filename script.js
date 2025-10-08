// --- TEMEL DEĞİŞKENLER VE DOM ELEMANLARI ---
const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen'); 

let isJumping = false;
let isGameOver = true; 
let isGameRunning = false; 
let score = 0;
let gameSpeed = 10; // Engel hareket hızı (ms)
let obstacleIntervals = []; 
let obstacleGenerationTimeout; 
let collisionCheckInterval; // YENİ: Çarpışmayı kontrol edecek ana döngü

// Boyutları koruyoruz
const BARBARIAN_WIDTH = 30;
const BARBARIAN_HEIGHT = 30;
const OBSTACLE_WIDTH = 28;
const OBSTACLE_HEIGHT = 28;

// Tolerans Ayarları (Önceki sorunları çözmek için koruyoruz)
const BARBARIAN_HITBOX_ADJUSTMENT = 5; // Yatayda 5 piksel tolerans
const OBSTACLE_TOLERANCE_PX = 5; // Dikeyde 5 piksel tolerans

// Zıplama Parametreleri
const JUMP_HEIGHT = '100px'; 
const JUMP_DURATION_MS = 100; 
const FALL_DURATION_MS = 100; 
const BARBARIAN_LEFT_POSITION = 50;
const GAME_CONTAINER_WIDTH = 600; 
const GROUND_POSITION_PX = 0; 


// --- FONKSİYONLAR ---

function startGame() {
    // Tüm önceki döngüleri temizle
    obstacleIntervals.forEach(clearInterval);
    obstacleIntervals = []; 
    clearTimeout(obstacleGenerationTimeout);
    clearInterval(collisionCheckInterval); // Önceki çarpışma kontrolünü temizle
    
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
    startCollisionCheck(); // YENİ: Çarpışma kontrolünü başlat
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

// 2. Engel Oluşturma ve Hareket Mantığı (SADECE HAREKET)
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

        // Engel başarıyla geçildi (Puan Sistemi)
        if (obstaclePosition < -OBSTACLE_WIDTH) { 
            clearInterval(obstacleInterval);
            obstacle.remove();
            updateScore(); 
        }
        // NOT: Çarpışma kontrolü buradan kaldırıldı!
    }
}

// 3. YENİ ANA ÇARPIŞMA KONTROL DÖNGÜSÜ
function startCollisionCheck() {
    // Saniyede 50 kez (her 20ms'de bir) çarpışmayı kontrol et
    collisionCheckInterval = setInterval(() => {
        if (!isGameRunning) {
            clearInterval(collisionCheckInterval);
            return;
        }

        const currentObstacles = document.querySelectorAll('.obstacle');
        
        currentObstacles.forEach(obstacle => {
            // Çarpışma mantığı buraya taşındı.
            const obstacleRect = obstacle.getBoundingClientRect();
            const gameRect = gameContainer.getBoundingClientRect();

            // Engelin göreceli sol pozisyonu
            const obstacleLeftPosition = obstacleRect.left - gameRect.left;
            
            // Barbar pozisyonları
            const barbarianBottom = parseInt(window.getComputedStyle(barbarian).getPropertyValue('bottom'));
            
            // Barbar'ın hitbox'ı
            const effectiveBarbarianLeft = BARBARIAN_LEFT_POSITION + BARBARIAN_HITBOX_ADJUSTMENT;
            const effectiveBarbarianWidth = BARBARIAN_WIDTH - BARBARIAN_HITBOX_ADJUSTMENT;

            // X Çarpışması: Yatayda temas var mı?
            const x_collision = (effectiveBarbarianLeft + effectiveBarbarianWidth > obstacleLeftPosition && 
                                effectiveBarbarianLeft < obstacleLeftPosition + OBSTACLE_WIDTH);

            // Y Çarpışması: Barbar yeterince yüksekte değil mi?
            // (OBSTACLE_HEIGHT - TOLERANCE) = 28 - 5 = 23. Barbar'ın altı 23px'ten düşükse çarpışma var.
            const y_collision = (barbarianBottom < (OBSTACLE_HEIGHT - OBSTACLE_TOLERANCE_PX));


            // KESİN ÇARPIŞMA!
            if (x_collision && y_collision) {
                // Tüm engel hareketlerini durdur ve oyunu bitir
                obstacleIntervals.forEach(clearInterval);
                gameOver();
            }
        });
    }, 20); // 20ms = Saniyede 50 kontrol
}


// 4. Oyun Bitti Fonksiyonu
function gameOver() {
    isGameOver = true;
    isGameRunning = false;
    
    obstacleIntervals.forEach(clearInterval);
    clearTimeout(obstacleGenerationTimeout);
    clearInterval(collisionCheckInterval); // Çarpışma döngüsünü durdur
    
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
