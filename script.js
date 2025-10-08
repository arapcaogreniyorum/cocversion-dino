// --- TEMEL DEĞİŞKENLER VE DOM ELEMANLARI ---
const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');
const startScreen = document.getElementById('start-screen'); // Başlangıç/Bitiş ekranı elementi

let isJumping = false;
let isGameOver = true; 
let isGameRunning = false; 
let score = 0;
// HIZ DÜZELTİLDİ: Stabil başlangıç hızı
let gameSpeed = 50; 
let obstacleIntervals = []; 
let obstacleGenerationTimeout; 

// Barbar'ın boyutları (30x30'u koruyoruz)
const BARBARIAN_WIDTH = 30;
const BARBARIAN_HEIGHT = 30;

// Engel'in boyutları (28x28'i koruyoruz)
const OBSTACLE_WIDTH = 28;
const OBSTACLE_HEIGHT = 28;

// Zıplama Parametreleri
const JUMP_HEIGHT = '80px';
const JUMP_DURATION_MS = 120; 
const FALL_DURATION_MS = 120; 
const BARBARIAN_LEFT_POSITION = 50;
const GAME_CONTAINER_WIDTH = 600; 
// ZEMİN KONUMU: Barbar'ın bottom 0px'deyken zeminin yüksekliği (bu genellikle 0'dır, ancak CSS'ten emin olmak için)
const GROUND_POSITION_PX = 0; 


// --- FONKSİYONLAR ---

function startGame() {
    // Önceki döngüleri ve zamanlayıcıları temizle
    obstacleIntervals.forEach(clearInterval);
    obstacleIntervals = []; 
    clearTimeout(obstacleGenerationTimeout);
    
    // Oyun alanındaki engelleri kaldır
    document.querySelectorAll('.obstacle').forEach(obs => obs.remove());

    isGameOver = false;
    isGameRunning = true;
    score = 0;
    gameSpeed = 50; // Hızı sıfırla
    scoreDisplay.innerHTML = `Puan: 0`;
    gameContainer.style.borderBottom = '3px solid #663300';
    barbarian.style.bottom = GROUND_POSITION_PX + 'px'; 
    
    // Barbar'ın yanma sınıfını kaldır
    barbarian.classList.remove('barbarian-burned');
    
    // Başlatma ekranını gizler ve arka plan animasyonunu başlatır
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


        // 3. Çarpışma Kontrolü (KESİN ÇÖZÜM)
        // ----------------------------------------
        
        // Engelin Sol Pozisyonunu Hesaplama
        const cssRightValue = GAME_CONTAINER_WIDTH - obstaclePosition;
        const obstacleLeftPosition = GAME_CONTAINER_WIDTH - cssRightValue - OBSTACLE_WIDTH;

        // Barbar'ın zeminden yüksekliği (Bu değer anlık olarak okunmalıdır)
        const barbarianBottom = parseInt(window.getComputedStyle(barbarian).getPropertyValue('bottom'));

        // X Ekseni Çakışması: Yatayda kesişim var mı?
        const x_collision = (BARBARIAN_LEFT_POSITION + BARBARIAN_WIDTH > obstacleLeftPosition && 
                            BARBARIAN_LEFT_POSITION < obstacleLeftPosition + OBSTACLE_WIDTH);

        // Y Ekseni Çakışması: Barbar'ın tabanı engelin yüksekliğinden küçük MÜ?
        // NOT: Normalde Barbar'ın tabanı 0'dır, Engel yüksekliği 28'dir. 
        // Çarpışma: Barbar'ın tabanı (barbarianBottom) ile Engelin üstü (OBSTACLE_HEIGHT) arasındaki boşlukta olmalı.
        const y_collision = (barbarianBottom < OBSTACLE_HEIGHT);


        // ÇARPIŞMA!
        if (x_collision && y_collision) {
            clearInterval(obstacleInterval);
            gameOver();
        } 
        // Engel Başarıyla Geçildi (Puan Sistemi ve Engel Silme)
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
    
    // Tüm hareketleri durdur
    obstacleIntervals.forEach(clearInterval);
    clearTimeout(obstacleGenerationTimeout);
    
    gameContainer.style.borderBottom = '3px solid red';
    
    // Barbar'ın yanmış resmini göster
    barbarian.classList.add('barbarian-burned');
    
    // Tekrar başlatma ekranını göster
    gameContainer.classList.remove('is-running'); 
    
    messageDisplay.innerHTML = `OYUN BİTTİ! Puanınız: ${score}. Tekrar denemek için dokunun/Space.`;
}

// 5. Puan Güncelleme
function updateScore() {
    score += 10; // Puan 10 10 artsın
    scoreDisplay.innerHTML = `Puan: ${score}`;
    
    // Hız artışı
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

// Klavye ve Mobil Giriş Yönetimi
function handleInput(event) {
    // Tekrar başlatma, sadece start/game over ekranına dokunulduğunda çalışır
    if (!isGameRunning && isGameOver) {
        // Bu fonksiyon, sadece startScreen event listener'ları tarafından çağrılmalıdır.
        startGame(); 
        return; 
    } 
    
    // Zıplama: Oyun çalışıyorsa ve klavye/dokunma olayı ise zıpla
    if (isGameRunning) {
        jump(); 
    }
}


// --- KODUN UYGULANMASI ---

// Zıplama/Başlatma Olay Dinleyicileri

// 1. KLAVYE (Space tuşu)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        // Klavye ile hem başlatma hem zıplama
        if (!isGameRunning && isGameOver) {
            startGame();
        } else if (isGameRunning) {
            jump();
        }
        event.preventDefault(); 
    }
});

// 2. MOBİL/EKRAN (Her yere dokunma - SADECE ZIPLAMA İÇİN)
// NOT: Bu dinleyici, "startScreen" dışındaki her yerde zıplamayı sağlar.
document.addEventListener('click', (event) => {
    // Tıklanan element startScreen ise, handleInput'un başlatma kısmını engellemek için geri dönüyoruz.
    if (!isGameRunning && isGameOver) {
        // Eğer oyun bitmişse, başlatma işini sadece alttaki event listener'lara bırakıyoruz.
        return;
    }
    
    // Oyun çalışıyorsa, nereye tıklanırsa tıklansın zıpla
    if (isGameRunning) {
        jump();
    }
});

document.addEventListener('touchstart', (event) => {
    if (!isGameRunning && isGameOver) {
        return;
    }
    if (isGameRunning) {
        jump();
    }
});


// 3. TEKRAR BAŞLATMA (Sadece startScreen üzerine tıklama/dokunma)
// NOT: Bu dinleyici sadece start/game over ekranı üzerindeyken çalışır.
startScreen.addEventListener('click', startGame);
startScreen.addEventListener('touchstart', startGame);
