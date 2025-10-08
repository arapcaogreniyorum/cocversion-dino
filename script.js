// --- TEMEL DEĞİŞKENLER VE DOM ELEMANLARI ---
const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');

let isJumping = false;
let isGameOver = false;
let score = 0;
let gameSpeed = 20; 

// Barbar'ın yeni boyutları
const BARBARIAN_WIDTH = 32;
const BARBARIAN_HEIGHT = 32;

// Engel'in yeni boyutları
const OBSTACLE_WIDTH = 30;
const OBSTACLE_HEIGHT = 30;

// Zıplama Parametreleri (Aynı kaldı)
const JUMP_HEIGHT = '80px';
const JUMP_DURATION_MS = 150; 
const FALL_DURATION_MS = 150; 
const BARBARIAN_LEFT_POSITION = 50;


// --- FONKSİYONLAR ---

// 1. Zıplama Mantığı (Aynı kaldı)
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

    // Başlangıç Konumu: Oyun alanının en sağı (600px genişlik varsayımı)
    let obstaclePosition = 600; 
    const obstacleInterval = setInterval(moveObstacle, gameSpeed); 
    
    // Engel hareket ettirme ve çarpışma kontrolü
    function moveObstacle() {
        if (isGameOver) {
            clearInterval(obstacleInterval);
            return;
        }

        obstaclePosition -= 10; // 10 birim sola hareket ettir.
        obstacle.style.right = (600 - obstaclePosition) + 'px';


        // 3. Çarpışma Kontrolü (Sağdan Sola Hareket, Yeni Boyutlarla)
        // ----------------------------------------
        
        // Engelin sağdan uzaklığı
        const obstacleRightOffset = parseInt(obstacle.style.right);
        
        // Barbar'ın zeminden yüksekliği
        const barbarianBottom = parseInt(window.getComputedStyle(barbarian).getPropertyValue('bottom'));

        // X Ekseni Çakışması: Engelin sol kenarı Barbar'ın sağ kenarını geçmiş VE 
        //                    Engelin sağ kenarı Barbar'ın sol kenarını geçmemiş olmalı.
        const x_collision = (obstacleRightOffset > BARBARIAN_LEFT_POSITION && 
                            obstacleRightOffset < BARBARIAN_LEFT_POSITION + BARBARIAN_WIDTH);
        
        // Y Ekseni Çakışması: Barbar'ın alt kenarı engelin yüksekliğinden küçük olmalı.
        const y_collision = (barbarianBottom < OBSTACLE_HEIGHT);

        // ÇARPIŞMA!
        if (x_collision && y_collision) {
            clearInterval(obstacleInterval);
            gameOver();
        } 
        // Engel Başarıyla Geçildi (Ekranın sol kenarının dışına çıktı)
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
    gameContainer.style.borderBottom = '3px solid red';
    // Artık resim kullandığımız için Barbar'ı kırmızı yapmak yerine sadece durduruyoruz.
    alert(`Oyun Bitti! Barbar'ın Puanı: ${score}`);
}

// 5. Puan Güncelleme (Aynı kaldı)
function updateScore() {
    score++;
    scoreDisplay.innerHTML = `Puan: ${score}`;
    if (score % 5 === 0 && gameSpeed > 5) {
        gameSpeed -= 1; 
    }
}

// 6. Engel Döngüsünü Başlatma (Aynı kaldı)
function generateObstacles() {
    let randomTime = Math.random() * 2000 + 1000; 
    createObstacle();
    
    if (!isGameOver) {
        setTimeout(generateObstacles, randomTime);
    }
}


// --- KODUN UYGULANMASI (BAŞLATMA) ---

// Zıplama Olay Dinleyicileri (Klavye ve Mobil)
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        jump();
        event.preventDefault(); 
    }
});

gameContainer.addEventListener('click', jump);
gameContainer.addEventListener('touchstart', jump); 

// Oyunu Başlat
generateObstacles();
