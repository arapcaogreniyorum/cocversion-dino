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
let gameSpeed = 50; // Başlangıç hızı (büyük değer = daha yavaş)
let obstacleIntervals = []; 
let obstacleGenerationTimeout; 

// Barbar'ın boyutları (30x30)
const BARBARIAN_WIDTH = 30;
const BARBARIAN_HEIGHT = 30;

// Engel'in boyutları (28x28)
const OBSTACLE_WIDTH = 28;
const OBSTACLE_HEIGHT = 28;

// Zıplama Parametreleri (Dino dinamikleri için kısaltıldı)
const JUMP_HEIGHT = '80px';
const JUMP_DURATION_MS = 120; // Yükselme süresi
const FALL_DURATION_MS = 120; // Düşme süresi
const BARBARIAN_LEFT_POSITION = 50;
const GAME_CONTAINER_WIDTH = 600; 


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
    barbarian.style.bottom = '0px'; 
    
    // YENİ: Oyuna başlarken Barbar'ın yanma sınıfını kaldır
    barbarian.classList.remove('barbarian-burned');
    
    // Başlatma ekranını gizler ve arka plan animasyonunu başlatır
    gameContainer.classList.add('is-running');
    
    generateObstacles(); 
}


// 1. Zıplama Mantığı (Dino Dinamikleri)
function jump() {
    if (!isGameRunning || isJumping) return; 
    
    isJumping = true;
    
    // YÜKSELME (Dinamik zıplama için)
    barbarian.style.transition = `bottom ${JUMP_DURATION_MS}ms ease-out`;
    barbarian.style.bottom = JUMP_HEIGHT; 

    // DÜŞME
    setTimeout(() => {
        barbarian.style.transition = `bottom ${FALL_DURATION_MS}ms ease-in`; 
        barbarian.style.bottom = '0px'; 
        
        // Zıplama Bitti
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


        // 3. Çarpışma Kontrolü (KESİN ÇÖZÜM: Atlansa bile yanma sorunu giderildi)
        // ----------------------------------------
        
        // Engelin Sol Pozisyonunu Hesaplama (Oyun alanının Sol kenarından uzaklığı)
        const cssRightValue = GAME_CONTAINER_WIDTH - obstaclePosition;
        const obstacleLeftPosition = GAME_CONTAINER_WIDTH - cssRightValue - OBSTACLE_WIDTH;

        // Barbar'ın zeminden yüksekliği
        const barbarianBottom = parseInt(window.getComputedStyle(barbarian).getPropertyValue('bottom'));

        // X Ekseni Çakışması: Yatayda kesişim var mı?
        const x_collision = (BARBARIAN_LEFT_POSITION + BARBARIAN_WIDTH > obstacleLeftPosition && 
                            BARBARIAN_LEFT_POSITION < obstacleLeftPosition + OBSTACLE_WIDTH);

        // Y Ekseni Çakışması: Barbar'ın ayağı engelin yüksekliğinden küçük mü? (Yerde mi, yoksa engel hizasında mı?)
        const y_collision = (barbarianBottom < OBSTACLE_HEIGHT);

        // ÇARPIŞMA! (Yatayda kesişim VAR ve Dikeyde YETERİNCE YÜKSEK DEĞİL)
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

// 4. Oyun Bitti Fonksiyonu (YENİ: Barbar'ın resmini değiştir)
function gameOver() {
    isGameOver = true;
    isGameRunning = false;
    
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
    score += 10; // İSTEK: Puan 10 10 artsın
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
function handleInput() {
    // Başlatma ve Tekrar Başlatma
    if (!isGameRunning && isGameOver) {
        startGame(); 
    } 
    // Zıplama
    else if (isGameRunning) {
        jump(); 
    }
}


// --- KODUN UYGULANMASI ---

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
