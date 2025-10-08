// --- TEMEL DEĞİŞKENLER VE DOM ELEMANLARI ---
const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen');
const messageDisplay = document.getElementById('message');

let isJumping = false;
let isGameOver = true;
let isGameRunning = false;
let score = 0;
let gameSpeed = 40; // DÜZELTİLDİ: Başlangıç hızı yavaşlatıldı (Dino hissiyatı için daha büyük değer = daha yavaş)
let obstacleIntervals = []; 
let obstacleGenerationTimeout; // Engel döngüsü için timeout değişkeni

// Barbar ve Engel Boyutları (30x30 ve 28x28)
const BARBARIAN_WIDTH = 30;
const BARBARIAN_HEIGHT = 30;
const OBSTACLE_WIDTH = 28;
const OBSTACLE_HEIGHT = 28;

// Zıplama Parametreleri
const JUMP_HEIGHT = '80px';
// DÜZELTİLDİ: Zıplamayı daha dinamik yapmak için süreler kısaltıldı (Dino gibi)
const JUMP_DURATION_MS = 120; // Yükselme süresi
const FALL_DURATION_MS = 120; // Düşme süresi
const BARBARIAN_LEFT_POSITION = 50;
const GAME_CONTAINER_WIDTH = 600; 


// --- FONKSİYONLAR ---

// Oyunu sıfırlar ve başlatır
function startGame() {
    // Tüm önceki döngüleri ve zamanlayıcıları temizle
    obstacleIntervals.forEach(clearInterval);
    obstacleIntervals = []; 
    clearTimeout(obstacleGenerationTimeout);
    
    // Oyun alanındaki tüm engelleri kaldır
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());

    isGameOver = false;
    isGameRunning = true;
    score = 0;
    gameSpeed = 40; // Hızı sıfırla
    scoreDisplay.innerHTML = `Puan: 0`;
    gameContainer.style.borderBottom = '3px solid #663300';
    barbarian.style.bottom = '0px'; 
    
    // BAŞLANGIÇ EKRANI BUG DÜZELTİLDİ:
    // is-running sınıfını eklemek, style.css'teki kural sayesinde #start-screen'i gizler.
    gameContainer.classList.add('is-running');
    
    generateObstacles(); // Engel döngüsünü başlat
}


// 1. Zıplama Mantığı
function jump() {
    if (!isGameRunning || isJumping) return;
    
    isJumping = true;
    barbarian.classList.add('is-jumping'); 

    // YÜKSELME
    barbarian.style.transition = `bottom ${JUMP_DURATION_MS}ms ease-out`;
    barbarian.style.bottom = JUMP_HEIGHT; 

    // DÜŞME
    setTimeout(() => {
        barbarian.style.transition = `bottom ${FALL_DURATION_MS}ms ease-in`; // Dinamik düşüş için ease-in kullanıldı
        barbarian.style.bottom = '0px'; 
        
        // Zıplama Bitti
        setTimeout(() => {
            isJumping = false;
            barbarian.classList.remove('is-jumping'); 
            barbarian.style.transition = 'bottom 0.15s ease-out'; // Varsayılan geçişi geri yükle
            
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
    
    // Hızlandırmayı her engelde değil, tek bir döngüde yapmalıyız
    const moveStep = 10; // Her adımda 10 birim kaydır
    const obstacleInterval = setInterval(moveObstacle, gameSpeed); 
    obstacleIntervals.push(obstacleInterval); 
    
    function moveObstacle() {
        if (!isGameRunning) {
            clearInterval(obstacleInterval);
            return;
        }

        obstaclePosition -= moveStep; 
        obstacle.style.right = (GAME_CONTAINER_WIDTH - obstaclePosition) + 'px';

        // 3. Çarpışma Kontrolü
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

// 4. Oyun Bitti Fonksiyonu
function gameOver() {
    isGameOver = true;
    isGameRunning = false;
    
    obstacleIntervals.forEach(clearInterval);
    clearTimeout(obstacleGenerationTimeout);
    
    gameContainer.style.borderBottom = '3px solid red';
    
    // is-running sınıfını kaldırmak, style.css'teki kural sayesinde #start-screen'i tekrar gösterir
    gameContainer.classList.remove('is-running'); 
    
    messageDisplay.innerHTML = `OYUN BİTTİ! Puanınız: ${score}. Tekrar denemek için dokunun/Space.`;
    
    // Tekrar Başlatma Bug'ı Çözümü: 
    // gameOver çağrıldığında mesaj gösterilir. Başlatma/zıplama işlevi artık handleInput() ile yönetiliyor.
}

// 5. Puan Güncelleme
function updateScore() {
    score += 10; // DÜZELTİLDİ: Puan 10 10 artsın
    scoreDisplay.innerHTML = `Puan: ${score}`;
    
    // Her 10 puanda bir (yani her engel geçildiğinde) hızı biraz artır.
    // Ancak interval değişkenleri sabit olduğu için, hız artışını şu an sadece 
    // bir sonraki engel döngüsünü etkileyecek şekilde ayarlıyoruz.
    if (score % 50 === 0 && gameSpeed > 10) { // Her 50 puanda bir hız artışı
        gameSpeed -= 2; 
    }
}

// 6. Engel Döngüsünü Başlatma
function generateObstacles() {
    let randomTime = Math.random() * 2000 + 1000; 
    createObstacle();
    
    if (isGameRunning) {
        // Timeout'u değişkene kaydet
        obstacleGenerationTimeout = setTimeout(generateObstacles, randomTime);
    }
}

// Klavye ve Mobil Giriş Yönetimi
function handleInput() {
    if (!isGameRunning && isGameOver) {
        startGame(); 
    } else if (isGameRunning) {
        jump(); 
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
