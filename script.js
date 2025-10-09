// --- TEMEL DEĞİŞKENLER VE DOM ELEMANLARI ---
const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen'); 
const messageDisplay = document.getElementById('message'); 

// --- OYUN AYARLARI ---
let gameLoopId; // requestAnimationFrame için döngü kimliği
let score = 0;
let gameSpeed = 8; // Başlangıç oyun hızı (Piksel/Kare)
let isGameOver = true; 
let isJumping = false;
let jumpVelocity = 0; // Anlık zıplama hızı
const GRAVITY = 1;      // Yerçekimi kuvveti
const JUMP_POWER = 18;  // Zıplama gücü (Yerden ayrılma hızı)
const GROUND_Y = 0;     // Zemin seviyesi (CSS bottom: 0)

// --- ÇARPIŞMA & BOYUT AYARLARI ---
const BARBARIAN_WIDTH = 30;
const BARBARIAN_HEIGHT = 30;
const BARBARIAN_X = 50; // Barbar'ın sabit X pozisyonu (left: 50px)
const OBSTACLE_WIDTH = 28;
const OBSTACLE_HEIGHT = 28;

// ÖNCEKİ AYARLARIMIZI KORUYORUZ: (Görünmez çarpışmayı önlemek için tolerans)
const OBSTACLE_TOLERANCE_Y = 15; // Dikey tolerans 
const BARBARIAN_TOLERANCE_X = 6; // Yatay hitbox küçültme

let obstacleTimer = 0; // Engel oluşumunu kontrol eden zamanlayıcı
let obstacleGenerationRate = 120; // Engel oluşum sıklığı (her 120 karede bir)
let obstacles = []; // Aktif engellerin tutulduğu dizi

// --- FONKSİYONLAR ---

// Yeni: Oyun Başlangıcı
function startGame() {
    isGameOver = false;
    score = 0;
    gameSpeed = 8;
    barbarian.style.bottom = GROUND_Y + 'px';
    barbarian.classList.remove('barbarian-burned');
    gameContainer.classList.add('is-running');
    obstacles.forEach(obs => obs.element.remove());
    obstacles = [];
    obstacleTimer = 0;
    scoreDisplay.innerHTML = `Puan: 0`;
    gameContainer.style.borderBottom = '3px solid #663300';
    
    // Eski interval'ler yerine tek döngü başlatılıyor
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Yeni: Engel Objeleri Oluşturma
function createObstacle() {
    const element = document.createElement('div');
    element.classList.add('obstacle');
    gameContainer.appendChild(element);
    
    // Obje olarak tutuluyor ki çarpışma ve hareket kolayca yönetilsin
    obstacles.push({
        element: element,
        x: 600, // Başlangıç pozisyonu (oyun alanı genişliği)
        y: GROUND_Y 
    });
}

// Yeni: Puan ve Hız Güncelleme
function updateScore() {
    score += 1; // Puanı her karede 0.1 artırmak yerine, her saniye yaklaşık 60 puan artar
    scoreDisplay.innerHTML = `Puan: ${Math.floor(score / 10)}`; // Puanı 10'a bölerek yavaşlatıyoruz

    // Her 300 puan (yaklaşık 30 skor) için hızlanma
    if (Math.floor(score / 10) % 30 === 0 && gameSpeed < 20) { 
        gameSpeed += 0.1; // Hızı yavaşça artır
    }
}

// Yeni: Zıplama
function jump() {
    if (isGameOver) {
        startGame();
    } else if (!isJumping) {
        isJumping = true;
        jumpVelocity = JUMP_POWER; // Zıplama gücü ile yukarı fırlat
        // CSS transition'u burada kapatıyoruz, çünkü pozisyonu JS yönetecek
        barbarian.style.transition = 'none'; 
    }
}

// Yeni: Çarpışma Kontrolü (Daha güvenilir)
function checkCollision() {
    const barbarianY = parseInt(barbarian.style.bottom);

    obstacles.forEach((obstacle, index) => {
        
        // 1. Yatay Çarpışma (Hitbox küçültülmüş)
        const effectiveBarbarianLeft = BARBARIAN_X + BARBARIAN_TOLERANCE_X;
        const effectiveBarbarianRight = BARBARIAN_X + BARBARIAN_WIDTH - BARBARIAN_TOLERANCE_X;
        
        const obstacleLeft = obstacle.x;
        const obstacleRight = obstacle.x + OBSTACLE_WIDTH;

        const x_collision = (effectiveBarbarianRight > obstacleLeft && effectiveBarbarianLeft < obstacleRight);

        // 2. Dikey Çarpışma (Tolerans dahil)
        // Eğer Barbar'ın yerden yüksekliği (barbarianY), engelin yüksekliğinden (tolerans çıkarılmış) az ise
        const y_collision = (barbarianY < OBSTACLE_HEIGHT - OBSTACLE_TOLERANCE_Y);

        // KESİN ÇARPIŞMA!
        if (x_collision && y_collision) {
            gameOver();
        }
        
        // Engel ekran dışına çıktıysa temizle
        if (obstacle.x < -OBSTACLE_WIDTH) {
            obstacle.element.remove();
            obstacles.splice(index, 1);
        }
    });
}

// YENİ: ANA OYUN DÖNGÜSÜ (Dino Oyunu Gibi Akıcı)
function gameLoop() {
    if (isGameOver) return;

    // 1. Barbar Hareketi (Zıplama)
    if (isJumping) {
        jumpVelocity -= GRAVITY;
        let newY = parseInt(barbarian.style.bottom) + jumpVelocity;
        
        if (newY <= GROUND_Y) {
            newY = GROUND_Y;
            isJumping = false;
            jumpVelocity = 0;
            // Zıplama bittiğinde tekrar CSS transition'ı açabiliriz (bu, dekoratiftir)
            barbarian.style.transition = 'bottom 0.1s ease-out';
        }
        barbarian.style.bottom = newY + 'px';
    }

    // 2. Engel Hareketi ve Oluşumu
    obstacleTimer++;
    if (obstacleTimer >= obstacleGenerationRate / (gameSpeed / 8)) { // Hıza göre engel sıklığı değişir
        createObstacle();
        obstacleTimer = 0;
    }

    // Aktif engelleri hareket ettir
    obstacles.forEach(obstacle => {
        obstacle.x -= gameSpeed;
        obstacle.element.style.right = (600 - obstacle.x) + 'px';
    });
    
    // 3. Çarpışma ve Puan Kontrolü
    checkCollision();
    updateScore(); 

    // Tekrar Döngü
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Oyun Bitti Fonksiyonu
function gameOver() {
    isGameOver = true;
    cancelAnimationFrame(gameLoopId);
    
    barbarian.classList.add('barbarian-burned');
    gameContainer.classList.remove('is-running');
    gameContainer.style.borderBottom = '3px solid red';
    
    messageDisplay.innerHTML = `OYUN BİTTİ! Puanınız: ${Math.floor(score / 10)}. Tekrar denemek için dokunun/Space.`;
}

// --- GİRİŞ YÖNETİMİ ---
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault(); 
        jump(); // Hem başlatma hem zıplama
    }
});

document.addEventListener('click', () => {
    jump();
});

document.addEventListener('touchstart', () => {
    jump();
});


startScreen.addEventListener('click', jump); 
startScreen.addEventListener('touchstart', jump); 
