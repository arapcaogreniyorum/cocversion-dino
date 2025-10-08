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

// 1. Zıplama Mantığı (Önceki Adımdan)
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

// 2. Engel Oluşturma Mantığı
function createObstacle() {
    if (isGameOver) return;

    // Gerekçe: Yeni bir Top (engel) oluştururuz.
    const obstacle = document.createElement('div');
    obstacle.classList.add('obstacle');
    gameContainer.appendChild(obstacle);

    let obstaclePosition = 600; // Oyun alanının en sağından başlar (600px genişlik)
    const obstacleInterval = setInterval(moveObstacle, gameSpeed); 
    
    // Engel hareket ettirme ve çarpışma kontrolü
    function moveObstacle() {
        if (isGameOver) {
            clearInterval(obstacleInterval);
            return;
        }

        obstaclePosition -= 10; // 10 birim sola hareket ettir.
        obstacle.style.right = obstaclePosition + 'px';

        // 3. Çarpışma Kontrolü (En Kritik Mantık)
        // ----------------------------------------
        
        // Barbar'ın konumu (X=50px, Y=30px, Boyut=20px)
        const barbarianLeft = 50;
        const barbarianWidth = 20;
        const barbarianBottom = parseInt(window.getComputedStyle(barbarian).getPropertyValue('bottom'));
        const barbarianHeight = 30; // Barbar'ın yüksekliği

        // Engelin konumu ve boyutları (X, Y=0, Boyut=15px, Yükseklik=25px)
        const obstacleRight = obstaclePosition;
        const obstacleWidth = 15;
        const obstacleHeight = 25;

        // Gerekçe: Çarpışma, iki koşulun aynı anda doğru olmasıyla gerçekleşir:
        // A) X Ekseni Çakışması: Barbar'ın sağ kenarı engelin sol kenarını geçmiş VE 
        //    Barbar'ın sol kenarı engelin sağ kenarını geçmemiş olmalı.
        // B) Y Ekseni Çakışması: Barbar zeminde değil (zıplıyor) VE 
        //    Barbar'ın alt kenarı engelin üst kenarından aşağıda olmalı.

        const x_collision = (obstacleRight > (gameContainer.offsetWidth - barbarianLeft - barbarianWidth) && 
                            obstacleRight < gameContainer.offsetWidth - barbarianLeft);
        
        const y_collision = (barbarianBottom < obstacleHeight);

        // A ve B koşulları sağlanıyorsa, ÇARPIŞMA!
        if (x_collision && y_collision) {
            clearInterval(obstacleInterval);
            gameOver();
        } 
        // Engel Başarıyla Geçildi
        else if (obstaclePosition <= -15) { // Engel ekran dışına çıktığında
            clearInterval(obstacleInterval);
            obstacle.remove(); // Engeli DOM'dan kaldır
            updateScore(); // Puanı arttır
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
    // Oyun hızını kademeli olarak arttırarak zorlaştırma
    if (score % 5 === 0 && gameSpeed > 5) {
        gameSpeed -= 1; // Hızı arttır
    }
}

// 6. Engel Döngüsünü Başlatma
function generateObstacles() {
    // Gerekçe: Engellerin rastgele aralıklarla (1000ms ile 3000ms arası) oluşmasını sağlar.
    // Bu, T-Rex Dino oyunundaki rastgelelik mantığıdır.
    let randomTime = Math.random() * 2000 + 1000; 
    createObstacle();
    
    if (!isGameOver) {
        // Tekrar etme döngüsünü kurar
        setTimeout(generateObstacles, randomTime);
    }
}


// --- KODUN UYGULANMASI (BAŞLATMA) ---

// Zıplama Olay Dinleyicileri (Önceki Adım)
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
