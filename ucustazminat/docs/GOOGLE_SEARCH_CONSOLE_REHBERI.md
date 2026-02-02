# Google Search Console Kurulum Rehberi

**Site:** www.ucustazminat.com  
**Tarih:** Ocak 2026

---

## Giriş

Google Search Console, web sitenizin Google arama sonuçlarındaki performansını izlemenize ve optimize etmenize olanak tanıyan ücretsiz bir araçtır. Bu rehber, UçuşTazminat sitesini Google Search Console'a ekleme ve yapılandırma adımlarını içermektedir.

---

## Adım 1: Google Search Console'a Giriş

1. [Google Search Console](https://search.google.com/search-console) adresine gidin
2. Google hesabınızla giriş yapın (tercihen şirket e-postası)
3. Sol menüden **"Mülk Ekle"** butonuna tıklayın

---

## Adım 2: Mülk Türü Seçimi

Google Search Console iki tür mülk sunmaktadır:

| Mülk Türü | Açıklama | Önerilen |
|-----------|----------|----------|
| **Domain** | Tüm alt alan adlarını ve protokolleri kapsar (www, non-www, http, https) | ✅ Önerilen |
| **URL Prefix** | Sadece belirtilen URL önekini kapsar | Alternatif |

**Önerilen:** `ucustazminat.com` domain mülkü olarak ekleyin. Bu sayede hem `www.ucustazminat.com` hem de `ucustazminat.com` tek bir mülk altında izlenebilir.

---

## Adım 3: Site Doğrulama

### Yöntem A: DNS Kaydı ile Doğrulama (Domain Mülkü için)

Domain mülkü seçtiyseniz, DNS kaydı eklemeniz gerekecektir:

1. Google'ın verdiği TXT kaydını kopyalayın
2. GoDaddy DNS yönetimine gidin
3. Yeni bir TXT kaydı ekleyin:
   - **Tür:** TXT
   - **Host:** @
   - **Değer:** Google'dan aldığınız doğrulama kodu
   - **TTL:** 1 saat
4. DNS yayılması için 24-48 saat bekleyin
5. Google Search Console'da "Doğrula" butonuna tıklayın

### Yöntem B: HTML Meta Tag ile Doğrulama (URL Prefix için)

URL Prefix mülkü seçtiyseniz:

1. Google'ın verdiği meta tag'ı kopyalayın
2. `client/index.html` dosyasında şu satırı bulun:
   ```html
   <!-- <meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" /> -->
   ```
3. Yorum işaretlerini kaldırın ve `YOUR_VERIFICATION_CODE` yerine Google'dan aldığınız kodu yapıştırın:
   ```html
   <meta name="google-site-verification" content="GERCEK_KOD_BURAYA" />
   ```
4. Değişikliği yayınlayın
5. Google Search Console'da "Doğrula" butonuna tıklayın

---

## Adım 4: Sitemap Gönderimi

Site doğrulandıktan sonra sitemap'i gönderin:

1. Sol menüden **"Site Haritaları"** seçeneğine tıklayın
2. **"Yeni site haritası ekle"** alanına şunu yazın:
   ```
   https://www.ucustazminat.com/sitemap.xml
   ```
3. **"Gönder"** butonuna tıklayın

Sitemap durumu "Başarılı" olarak görünmelidir. Sitemap şu sayfaları içermektedir:

| Sayfa | Öncelik | Güncelleme Sıklığı |
|-------|---------|-------------------|
| Ana Sayfa (/) | 1.0 | Haftalık |
| Kullanım Koşulları (/terms) | 0.5 | Aylık |
| Gizlilik Politikası (/privacy) | 0.5 | Aylık |
| KVKK (/kvkk) | 0.5 | Aylık |

---

## Adım 5: Temel Ayarlar

### Tercih Edilen Domain

1. **Ayarlar** > **Site Ayarları**'na gidin
2. Tercih edilen domain olarak `www.ucustazminat.com` seçin

### Coğrafi Hedefleme

1. **Ayarlar** > **Uluslararası Hedefleme**'ye gidin
2. Ülke olarak **Türkiye** seçin

### Kullanıcı Ekleme (Opsiyonel)

Ekip üyelerine erişim vermek için:

1. **Ayarlar** > **Kullanıcılar ve İzinler**'e gidin
2. **"Kullanıcı Ekle"** butonuna tıklayın
3. E-posta adresi ve izin seviyesi belirleyin

---

## İzlenmesi Gereken Metrikler

Google Search Console'da düzenli olarak kontrol edilmesi gereken metrikler:

| Metrik | Açıklama | Hedef |
|--------|----------|-------|
| **Toplam Tıklama** | Arama sonuçlarından siteye yapılan tıklamalar | Artış trendi |
| **Toplam Gösterim** | Sitenin arama sonuçlarında görünme sayısı | Artış trendi |
| **Ortalama CTR** | Tıklama oranı (Tıklama/Gösterim) | %3-5+ |
| **Ortalama Konum** | Arama sonuçlarındaki ortalama sıralama | 1-10 arası |

---

## Yaygın Sorunlar ve Çözümleri

### Sayfa İndekslenmedi

1. **URL Denetimi** aracını kullanın
2. Sayfanın robots.txt tarafından engellenip engellenmediğini kontrol edin
3. Gerekirse "İndeksleme İste" butonuna tıklayın

### Mobil Kullanılabilirlik Sorunları

1. **Mobil Kullanılabilirlik** raporunu kontrol edin
2. Tespit edilen sorunları düzeltin
3. Düzeltme sonrası "Doğrulama İste" butonuna tıklayın

### Core Web Vitals Sorunları

1. **Core Web Vitals** raporunu kontrol edin
2. LCP, FID, CLS metriklerini iyileştirin
3. Değişiklikler sonrası yeniden test edin

---

## Sonuç

Google Search Console entegrasyonu tamamlandığında, sitenizin arama performansını detaylı şekilde izleyebilir ve SEO stratejinizi buna göre optimize edebilirsiniz. Düzenli olarak (haftada en az bir kez) Search Console'u kontrol etmeniz önerilir.

---

**Yardımcı Kaynaklar:**
- [Google Search Console Yardım Merkezi](https://support.google.com/webmasters)
- [Google SEO Başlangıç Kılavuzu](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
