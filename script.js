// --- TEMEL DEĞİŞKENLER VE DOM ELEMANLARI ---
const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const messageDisplay = document.getElementById('message');

let isJumping = false;
let isGameOver = true; // Oyun başlangıçta BİTTİ durumda olmalı (başlatma ekranını göstermek için)
let isGameRunning = false; // Oyunun çalışıp çalışmadığını kontrol eder
let score = 0;
let gameSpeed = 30; // HIZ DÜZELTİLDİ: Başlangıçta daha yavaş (eski 20 idi, şimdi 30 daha yavaş) 
let obstacleIntervals = []; // Tüm engel döngülerini tutmak için DİZİ

// Barbar'ın YENİ boyutları
const BARBARIAN_WIDTH = 30;
const BARBARIAN_HEIGHT = 30;

// Engel'in YENİ boyutları
const OBSTACLE_WIDTH = 28;
const OBSTACLE_HEIGHT = 28;

// Zıplama ve Konum Parametreleri
const JUMP_HEIGHT = '80px';
const JUMP_DURATION_MS = 150; 
const FALL_DURATION_MS = 150; 
const BARBARIAN_LEFT_POSITION = 50;
const GAME_CONTAINER_WIDTH = 600; 


// --- FONKSİYONLAR ---

// Yeni: Oyunu sıfırlar ve başlatır
function startGame() {
    // Tüm engel döngülerini temizle
    obstacleIntervals.forEach(clearInterval);
    obstacleIntervals = []; 
    
    // Oyun alanındaki tüm engelleri kaldır
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());

    isGameOver = false;
    isGameRunning = true;
    score = 0;
    gameSpeed = 30; // Hızı sıfırla
    scoreDisplay.innerHTML = `Puan: 0`;
    gameContainer.style.borderBottom = '3px solid #663300';
    barbarian.style.bottom = '0px'; // Barbar'ı zemine indir
    
    // CSS sınıfını ekleyerek Başlangıç ekranını gizle ve animasyonu başlat
    gameContainer.classList.add('is-running');
    
    generateObstacles(); // Engel döngüsünü başlat
}


// 1. Zıplama Mantığı
function jump() {
    if (!isGameRunning || isJumping) return; // Sadece oyun çalışırken zıpla
    
    isJumping = true;
    barbarian.classList.add('is-jumping'); 

    barbarian.style.bottom = JUMP_HEIGHT; 

    setTimeout(() => {
        barbarian.style.bottom = '0px'; 
        
        setTimeout(() => {
            isJumping = false;
            barbarian.classList.remove('is-jumping'); 
            
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
    const obstacleInterval = setInterval(moveObstacle, gameSpeed); 
    obstacleIntervals.push(obstacleInterval); // Döngüyü diziye kaydet
    
    function moveObstacle() {
        if (!isGameRunning) {
            clearInterval(obstacleInterval);
            return;
        }

        obstaclePosition -= 10; 
        obstacle.style.right = (GAME_CONTAINER_WIDTH - obstaclePosition) + 'px';


        // 3. Çarpışma Kontrolü (Aynı, doğru mantık korunuyor)
        // ----------------------------------------
        const cssRightValue = GAME_CONTAINER_WIDTH - obstaclePosition;
        const obstacleLeftPosition = GAME_CONTAINER_WIDTH - cssRightValue - OBSTACLE_WIDTH;
        const barbarianBottom = parseInt(window.getComputedStyle(barbarian).getPropertyValue('bottom'));

        const x_collision = (BARBARIAN_LEFT_POSITION + BARBARIAN_WIDTH > obstacleLeftPosition && 
                            BARBARIAN_LEFT_POSITION < obstacleLeftPosition + OBSTACLE_WIDTH);
        const y_collision = (barbarianBottom < OBSTACLE_HEIGHT);

        // ÇARPIŞMA!
        if (x_collision && y_collision) {
            clearInterval(obstacleInterval);
            gameOver();
        } 
        // Engel Başarıyla Geçildi
        else if (obstaclePosition < -OBSTACLE_WIDTH) { 
            clearInterval(obstacleInterval);
            obstacle.remove();
            updateScore();
        }
    }
}

// 4. Oyun Bitti Fonksiyonu (YENİ: Tekrar Başlatma mesajı)
function gameOver() {
    isGameOver = true;
    isGameRunning = false;
    
    // Tüm engel döngülerini durdur
    obstacleIntervals.forEach(clearInterval);
    
    gameContainer.style.borderBottom = '3px solid red';
    gameContainer.classList.remove('is-running'); // Başlangıç ekranını göster
    
    messageDisplay.innerHTML = `OYUN BİTTİ! Puanınız: ${score}. Tekrar denemek için dokunun/Space.`;
    
    // Ekranı göster
    startScreen.style.display = 'flex';
}

// 5. Puan Güncelleme
function updateScore() {
    score++;
    scoreDisplay.innerHTML = `Puan: ${score}`;
    if (score % 5 === 0 && gameSpeed > 5) {
        // Hızlanma, setInterval'ı etkilemez. Sadece yeni engelleri etkiler.
        gameSpeed -= 1; 
    }
}

// 6. Engel Döngüsünü Başlatma
function generateObstacles() {
    let randomTime = Math.random() * 2000 + 1000; 
    createObstacle();
    
    if (isGameRunning) {
        setTimeout(generateObstacles, randomTime);
    }
}

// YENİ: Klavye ve Mobil Giriş Yönetimi
function handleInput() {
    if (!isGameRunning && isGameOver) {
        startGame(); // Oyun bittiyse veya başlamadıysa başlat
    } else if (isGameRunning) {
        jump(); // Oyun çalışıyorsa zıpla
    }
}


// --- KODUN UYGULANMASI (BAŞLATMA) ---

// Zıplama/Başlatma Olay Dinleyicileri (Klavye ve Mobil)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        handleInput();
        event.preventDefault(); 
    }
});

// Ekran tıklandığında veya dokunulduğunda
startScreen.addEventListener('click', handleInput);
startScreen.addEventListener('touchstart', handleInput);

gameContainer.addEventListener('click', handleInput); 
gameContainer.addEventListener('touchstart', handleInput); 
