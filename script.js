// --- TEMEL DEĞİŞKENLER VE DOM ELEMANLARI ---
const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');

let isJumping = false;
let isGameOver = false;
let score = 0;
let gameSpeed = 20; // Engellerin hareket hızı (ms cinsinden aralık)

// Zıplama Parametreleri
const JUMP_HEIGHT = '80px';
const JUMP_DURATION_MS = 150; 
const FALL_DURATION_MS = 150; 


// --- FONKSİYONLAR ---

// 1. Zıplama Mantığı
function jump() {
    if (isJumping || isGameOver) return;
    
    isJumping = true;
    
    barbarian.style.bottom = JUMP_HEIGHT; 

    setTimeout(() => {
        barbarian.style.bottom = '0px'; 
        
        setTimeout(() => {
            isJumping = false;
        }, FALL_DURATION_MS); 

    }, JUMP_DURATION_MS); 
}

// 2. Engel Oluşturma ve Hareket Mantığı
function createObstacle() {
    if (isGameOver) return;

    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    gameContainer.appendChild(obstacle);

    // Başlangıç Konumu: Sol kenarın hemen dışı
    let obstaclePosition = -15; 
    const obstacleInterval = setInterval(moveObstacle, gameSpeed); 
    
    // Engel hareket ettirme ve çarpışma kontrolü
    function moveObstacle() {
        if (isGameOver) {
            clearInterval(obstacleInterval);
            return;
        }

        obstaclePosition += 10; // 10 birim sağa hareket ettir.
        obstacle.style.left = obstaclePosition + 'px';

        // 3. Çarpışma Kontrolü (Soldan Sağa Hareket İçin)
        // ----------------------------------------
        
        // Barbar'ın konumu ve boyutları
        const barbarianLeft = 50;
        const barbarianRight = barbarianLeft + 20; // Barbar'ın sağ kenarı (70px)
        const barbarianBottom = parseInt(window.getComputedStyle(barbarian).getPropertyValue('bottom'));
        const barbarianHeight = 30; 

        // Engelin konumu ve boyutları
        const obstacleLeft = obstaclePosition;
        const obstacleRight = obstaclePosition + 15; // Engelin sağ kenarı
        const obstacleHeight = 25;

        // X Ekseni Çakışması: Engelin sağ kenarı Barbar'ın solunu geçmiş VE Engelin sol kenarı Barbar'ın sağını geçmemiş olmalı.
        const x_collision = (obstacleRight > barbarianLeft && 
                            obstacleLeft < barbarianRight);
        
        // Y Ekseni Çakışması: Barbar zeminde (Y=0) veya zıplıyor VE Barbar'ın alt kenarı engelin üst kenarından aşağıda olmalı.
        const y_collision = (barbarianBottom < obstacleHeight);

        // ÇARPIŞMA!
        if (x_collision && y_collision) {
            clearInterval(obstacleInterval);
            gameOver();
        } 
        // Engel Başarıyla Geçildi
        else if (obstaclePosition >= gameContainer.offsetWidth) { // Engel ekranın sağından dışarı çıktığında
            clearInterval(obstacleInterval);
            obstacle.remove();
            updateScore();
        }
    }
}

// 4. Oyun Bitti Fonksiyonu
function gameOver() {
    isGameOver = true;
    gameContainer.style.borderBottom = '3px solid red';
    barbarian.style.backgroundColor = 'red';
    alert(`Oyun Bitti! Barbar'ın Puanı: ${score}`);
}

// 5. Puan Güncelleme
function updateScore() {
    score++;
    scoreDisplay.innerHTML = `Puan: ${score}`;
    // Hızlandırma
    if (score % 5 === 0 && gameSpeed > 5) {
        gameSpeed -= 1; 
    }
}

// 6. Engel Döngüsünü Başlatma
function generateObstacles() {
    // Engellerin rastgele aralıklarla (1000ms ile 3000ms arası) oluşmasını sağlar.
    let randomTime = Math.random() * 2000 + 1000; 
    createObstacle();
    
    if (!isGameOver) {
        setTimeout(generateObstacles, randomTime);
    }
}


// --- KODUN UYGULANMASI (BAŞLATMA) ---

// Zıplama Olay Dinleyicileri (Klavye ve Mobil)
document.addEventListener('keydown', (event) => {
    // Sadece Space tuşunu dinler
    if (event.code === 'Space') {
        jump();
        event.preventDefault(); 
    }
});

gameContainer.addEventListener('click', jump);
gameContainer.addEventListener('touchstart', jump); 

// Oyunu Başlat
generateObstacles();
