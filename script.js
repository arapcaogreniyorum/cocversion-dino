const barbarian = document.getElementById('barbarian');
const gameContainer = document.getElementById('game-container');
let isJumping = false;

// Kapsamlı Dokümantasyon: Bu fonksiyon, karakterin zıplamasını yönetir.
function jump() {
    // Gerekçe: Eğer karakter zaten zıplıyorsa, tekrar zıplamasını engellemek için.
    if (isJumping) return;
    
    isJumping = true;
    
    // Zıplama Animasyonu: Barbar'ın bottom CSS özelliğini değiştiriyoruz.
    // 1. Yukarı Zıpla
    barbarian.style.bottom = '80px'; 

    // 2. Aşağı İn (Kısa bir gecikmeden sonra)
    // Tercih Gerekçesi: setTimeout, belirli bir süre sonra bir kodu çalıştırmamızı sağlar.
    setTimeout(() => {
        barbarian.style.bottom = '0px'; 
        
        // Gecikmeden sonra zıplama bitti olarak işaretlenir.
        setTimeout(() => {
            isJumping = false;
        }, 200); // 200ms sonra (CSS transition süresi kadar) isJumping sıfırlanır.

    }, 500); // 500ms havada kalma süresi

}

// Kodun Uygulanması: Klavyeden herhangi bir tuşa basıldığında zıplama fonksiyonunu çağırırız.
document.addEventListener('keydown', jump);


// NOT: Çarpışma ve Engel oluşturma mantığı bir sonraki adımımız olacaktır!
