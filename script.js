// --- TEMEL DEĞİŞKENLER VE DOM ELEMANLARI ---
const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen'); 

let isJumping = false;
let isGameOver = true; 
let isGameRunning = false; 
let score = 0;
let gameSpeed = 50; // Stabil başlangıç hızı
let obstacleIntervals = []; 
let obstacleGenerationTimeout; 

// Barbar'ın ve Engelin boyutlarını koruyoruz
const BARBARIAN_WIDTH = 30;
const BARBARIAN_HEIGHT = 30;
const OBSTACLE_WIDTH = 28;
const OBSTACLE_HEIGHT = 28;

// Zıplama Parametreleri (Dino Dinamikleri)
const JUMP_HEIGHT = '80px';
const JUMP_DURATION_MS = 120; 
const FALL_DURATION_MS = 120; 
const GAME_CONTAINER_WIDTH = 600; 
const GROUND_POSITION_PX = 0; 


// --- FONKSİYONLAR ---

function startGame() {
    // Tüm döngüleri ve zamanlayıcıları temizle
    obstacleIntervals.forEach(clearInterval);
    obstacleIntervals = []; 
    clearTimeout(obstacleGenerationTimeout);
    
    // Oyun alanındaki engelleri kaldır
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());

    isGameOver = false;
    isGameRunning = true;
    score = 0;
    gameSpeed = 50; 
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
    
    // YÜKSELME (Dinamik zıplama)
    barbarian.style.transition = `bottom ${JUMP_DURATION_MS}ms ease-out`;
    barbarian.style.bottom = JUMP_HEIGHT; 

    // DÜŞME
    setTimeout(() => {
        barbarian.style.transition = `bottom ${FALL_DURATION_MS}ms ease-in`; 
        barbarian.style.bottom = GROUND_POSITION_PX + 'px'; 
        
        setTimeout(() => {
            isJumping = false;
            // Varsayılan geçişi geri yükle
            barbarian.style.transition = 'bottom 0.12s ease-out'; 
            
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
    const moveStep = 10; 
    
    const obstacleInterval = setInterval(moveObstacle, gameSpeed); 
    obstacleIntervals.push(obstacleInterval); 
    
    function moveObstacle() {
        if (!isGameRunning) {
            clearInterval(obstacleInterval);
            return;
        }
        
        obstaclePosition -= moveStep; 
        obstacle.style.right = (GAME_CONTAINER_WIDTH - obstaclePosition) + 'px';


        // 3. Çarpışma Kontrolü (NİHAİ ÇÖZÜM: getBoundingClientRect ile en güvenilir kontrol)
        // ----------------------------------------
        
        // Barbar'ın ve Engelin anlık pozisyon ve boyutlarını al
        const barbarianRect = barbarian.getBoundingClientRect();
        const obstacleRect = obstacle.getBoundingClientRect();

        // Çarpışma Kontrolü (Dört kenarın çakışıp çakışmadığını kontrol eder)
        const isCollision = !(
            // Barbar'ın sağ kenarı, Engelin sol kenarından küçük MÜ? (Yatayda ayrık)
            barbarianRect.right < obstacleRect.left ||
            // Barbar'ın sol kenarı, Engelin sağ kenarından büyük MÜ? (Yatayda ayrık)
            barbarianRect.left > obstacleRect.right ||
            // Barbar'ın alt kenarı, Engelin üst kenarından küçük MÜ? (Dikeyde ayrık, Barbar üstte)
            barbarianRect.bottom < obstacleRect.top ||
            // Barbar'ın üst kenarı, Engelin alt kenarından büyük MÜ? (Dikeyde ayrık, Barbar altta)
            barbarianRect.top > obstacleRect.bottom
        );


        // ÇARPIŞMA!
        if (isCollision) {
            // EK KONTROL: Eğer Barbar zıplıyor ve engelin yüksekliğinden (top) daha yukarıda ise çarpmaması gerekir.
            // Bounding box kontrolü bunu otomatik olarak çözmelidir.
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
    
    if (score % 50 === 0 && gameSpeed > 10) { 
        gameSpeed -= 2; 
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

// --- GİRİŞ YÖNETİMİ (Zıplama Tüm Ekranda Aktif) ---

// 1. KLAVYE (Space tuşu)
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

// 2. MOBİL/EKRAN (Tüm ekrana dokunma - Sadece Zıplama)
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


// 3. TEKRAR BAŞLATMA (Sadece startScreen üzerine tıklama/dokunma)
startScreen.addEventListener('click', startGame);
startScreen.addEventListener('touchstart', startGame);
