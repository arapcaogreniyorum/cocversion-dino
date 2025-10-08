// --- TEMEL DEĞİŞKENLER VE DOM ELEMANLARI ---
const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
const scoreDisplay = document.getElementById('score');

let isJumping = false;
let isGameOver = false;
let score = 0;
let gameSpeed = 20; 

// Barbar'ın YENİ boyutları
const BARBARIAN_WIDTH = 30; // GÜNCELLENDİ
const BARBARIAN_HEIGHT = 30; // GÜNCELLENDİ

// Engel'in YENİ boyutları
const OBSTACLE_WIDTH = 28; // GÜNCELLENDİ
const OBSTACLE_HEIGHT = 28; // GÜNCELLENDİ

// Zıplama ve Konum Parametreleri (Aynı kaldı)
const JUMP_HEIGHT = '80px';
const JUMP_DURATION_MS = 150; 
const FALL_DURATION_MS = 150; 
const BARBARIAN_LEFT_POSITION = 50;
const GAME_CONTAINER_WIDTH = 600; 


// --- FONKSİYONLAR ---

// 1. Zıplama Mantığı (Animasyon Sınıfı Eklendi)
function jump() {
    if (isJumping || isGameOver) return;
    
    isJumping = true;
    
    // Zıplarken animasyonu durdur
    barbarian.classList.add('is-jumping'); 

    barbarian.style.bottom = JUMP_HEIGHT; 

    setTimeout(() => {
        barbarian.style.bottom = '0px'; 
        
        setTimeout(() => {
            isJumping = false;
            // Zıplama bittiğinde animasyonu devam ettir
            barbarian.classList.remove('is-jumping'); 
            
        }, FALL_DURATION_MS); 

    }, JUMP_DURATION_MS); 
}

// 2. Engel Oluşturma ve Hareket Mantığı
function createObstacle() {
    if (isGameOver) return;

    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    gameContainer.appendChild(obstacle);

    // Başlangıç Konumu: Oyun alanının en sağı
    let obstaclePosition = GAME_CONTAINER_WIDTH; 
    const obstacleInterval = setInterval(moveObstacle, gameSpeed); 
    
    // Engel hareket ettirme ve çarpışma kontrolü
    function moveObstacle() {
        if (isGameOver) {
            clearInterval(obstacleInterval);
            return;
        }

        obstaclePosition -= 10; 
        // CSS 'right' özelliğini ayarlıyoruz
        obstacle.style.right = (GAME_CONTAINER_WIDTH - obstaclePosition) + 'px';


        // 3. Çarpışma Kontrolü (GÜNCELLENMİŞ BOYUTLARLA)
        // ----------------------------------------

        // Engelin Sol Pozisyonunu Hesaplama (Oyun alanının Sol kenarından uzaklığı)
        const cssRightValue = GAME_CONTAINER_WIDTH - obstaclePosition;
        const obstacleLeftPosition = GAME_CONTAINER_WIDTH - cssRightValue - OBSTACLE_WIDTH;

        // Barbar'ın zeminden yüksekliği
        const barbarianBottom = parseInt(window.getComputedStyle(barbarian).getPropertyValue('bottom'));

        // X Ekseni Çakışması: 
        // Barbar'ın sağ kenarı Engelin sol kenarını geçmiş VE
        // Barbar'ın sol kenarı Engelin sağ kenarını geçmemiş olmalı.
        const x_collision = (BARBARIAN_LEFT_POSITION + BARBARIAN_WIDTH > obstacleLeftPosition && 
                            BARBARIAN_LEFT_POSITION < obstacleLeftPosition + OBSTACLE_WIDTH);

        // Y Ekseni Çakışması: 
        // Barbar'ın alt kenarı (zeminden yüksekliği) Engelin yüksekliğinden küçük olmalı.
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
    gameContainer.style.borderBottom = '3px solid red';
    alert(`Oyun Bitti! Barbar'ın Puanı: ${score}`);
}

// 5. Puan Güncelleme
function updateScore() {
    score++;
    scoreDisplay.innerHTML = `Puan: ${score}`;
    if (score % 5 === 0 && gameSpeed > 5) {
        gameSpeed -= 1; // Oyunu hızlandır
    }
}

// 6. Engel Döngüsünü Başlatma
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
