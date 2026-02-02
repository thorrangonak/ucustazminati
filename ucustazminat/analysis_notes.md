# Belge Yükleme Analizi - Güncellenmiş

## Kod İncelemesi Sonuçları

### ClaimWizard.tsx
- `handlePassengerCountChange` fonksiyonu yolcu sayısına göre `passengers` array'ini doğru oluşturuyor (satır 329-334)
- `handleNext` fonksiyonu son adımda `onComplete` callback'ini çağırıyor ve `data.passengers` array'ini gönderiyor (satır 382-388)
- `data.passengers` array'i wizard state'inde doğru tutuluyor

### Home.tsx
- `handleWizardComplete` fonksiyonu tüm wizard verisini `sessionStorage.setItem("claimWizardData", JSON.stringify(data))` ile kaydediyor (satır 158)
- Bu veri `passengers` array'ini de içeriyor

### NewClaim.tsx
- `useEffect` hook'u `sessionStorage.getItem("claimWizardData")` ile veriyi okuyor (satır 141)
- `parsed.passengers.map()` ile her yolcu için boş belge dizisi oluşturuluyor (satır 148-152)
- Belge yükleme bölümünde `wizardData.passengers.map()` ile her yolcu için tab oluşturuluyor (satır 768, 790)

## Sonuç

Kod yapısı doğru görünüyor. Her yolcu için ayrı tab'lar ve belge yükleme alanları zaten mevcut. Sorun muhtemelen:

1. **Kullanıcı testi sırasında:** Wizard'da yolcu sayısı doğru seçilmemiş olabilir
2. **SessionStorage sorunu:** Veri doğru kaydedilmemiş veya okunmamış olabilir
3. **UI render sorunu:** Tab'lar görünmüyor olabilir (CSS veya conditional render)

## Test Edilecek

Wizard'dan 4 yolcu ile geçip NewClaim sayfasında tab'ların görünüp görünmediğini kontrol etmek gerekiyor.
