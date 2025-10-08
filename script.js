const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
let isJumping = false;
// Zıplama yüksekliği ve süresini ayarlayabilirsin
const JUMP_HEIGHT = '80px';
const JUMP_DURATION_MS = 150; 
const FALL_DURATION_MS = 150; 


function jump() {
    if (isJumping) return;
    
    isJumping = true;
    
    // Barbar'ı yukarı hareket ettir.
    barbarian.style.bottom = JUMP_HEIGHT; 

    // Kısa bir gecikmeden sonra (Havada Kalma) Barbar'ı aşağı indir.
    setTimeout(() => {
        barbarian.style.bottom = '0px'; 
        
        // Yere indiğinde isJumping durumunu sıfırla.
        setTimeout(() => {
            isJumping = false;
        }, FALL_DURATION_MS); 

    }, JUMP_DURATION_MS); 
}

// 1. Klavye Desteği: Sadece Space tuşunu dinler.
document.addEventListener('keydown', (event) => {
    // Gerekçe: event.code === 'Space' sadece Space (Boşluk) tuşunu algılar.
    if (event.code === 'Space') {
        jump();
        event.preventDefault(); // Sayfanın kaymasını engeller.
    }
});

// 2. Mobil Dokunma Desteği: Ekranın herhangi bir yerine dokunulduğunda zıplar.
// 'click' olayını kullanmak, hem fare tıklaması hem de dokunmayı kapsar.
gameContainer.addEventListener('click', jump);
gameContainer.addEventListener('touchstart', jump); 
