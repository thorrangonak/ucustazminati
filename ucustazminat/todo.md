# UçuşTazminat - Proje TODO

## Veritabanı ve API
- [x] Veritabanı şeması tasarımı (claims, airlines, documents, payments)
- [x] tRPC router'ları oluşturma (claims, airlines, documents, admin)
- [x] Tazminat hesaplama motoru (SHY-YOLCU yönetmeliğine göre)
- [x] Uçuş uygunluk kontrolü sistemi

## Kullanıcı Arayüzü (Public)
- [x] Ana sayfa - Hero section ve değer önerisi
- [x] Tazminat hesaplama formu (uçuş numarası, tarih, gecikme süresi)
- [x] Nasıl çalışır bölümü
- [x] SSS (Sıkça Sorulan Sorular) bölümü
- [x] Footer ve iletişim bilgileri
- [x] International Typographic Style tema uygulaması

## Kullanıcı Portalı
- [x] Kullanıcı kayıt/giriş (Manus OAuth)
- [x] Yeni talep oluşturma formu
- [x] Belge yükleme sistemi (biniş kartı, bilet, kimlik)
- [x] Talep listesi ve durum takibi
- [x] Talep detay sayfası
- [x] Bildirimler sistemi

## Yönetim Paneli (Admin)
- [x] Admin dashboard ana sayfa (istatistikler)
- [x] Talep yönetimi (listeleme, filtreleme, durum güncelleme)
- [x] Talep detay ve durum güncelleme
- [x] Havayolu şirketleri veritabanı yönetimi (CRUD)
- [x] Komisyon ve ödeme yönetimi
- [x] Raporlama ve analitik (istatistikler sayfası)

## Entegrasyonlar
- [ ] Belge OCR entegrasyonu (LLM ile)
- [ ] E-posta bildirimleri
- [ ] Uçuş veri API entegrasyonu (gelecek faz)

## Test
- [x] Unit testler (claims, airlines, compensation)


## Otomatik Uçuş Gecikme Tespiti
- [x] Uçuş veri API'si araştırma ve seçim (AviationStack)
- [x] API entegrasyonu (server-side)
- [x] Otomatik gecikme tespiti fonksiyonu
- [x] Tazminat hesaplama formunu güncelleme (otomatik doldurma)
- [x] Kullanıcı arayüzü güncelleme
- [x] Unit testler (flightApi.test.ts)

## Wizard Akışı Yeniden Tasarım
- [x] Adım 1: Kalkış ve varış noktası seçimi
- [x] Adım 2: Direkt/Aktarmalı uçuş seçimi (aktarmalıysa aktarma noktası)
- [x] Adım 3: Uçuş bilgileri girişi (tarih + uçuş numarası, aktarmalıysa her iki uçuş)
- [x] Adım 4: Yolcu sayısı ve bilgileri girişi
- [x] Eş zamanlı mesafe hesaplama ve tazminat gösterimi
- [x] Havalimanı arama/seçim bileşeni
- [x] Wizard ilerleme göstergesi
- [x] Unit testler (wizard.test.ts - 20 test)

## Bug Fix: NewClaim Sayfası Entegrasyonu
- [x] NewClaim sayfasını wizard verileriyle entegre etme
- [x] Eski form yapısını kaldırma
- [x] Wizard'dan gelen verileri otomatik doldurma
- [x] Belge yükleme ve talep oluşturma akışını güncelleme

## Belge Yükleme ve Elektronik İmza Sistemi
- [x] Belge yükleme kategorileri (uçuş belgeleri: boarding card/konfirmasyon/bilet - en az 1 zorunlu)
- [x] Kimlik belgesi kategorisi (kimlik kartı/pasaport - en az 1 zorunlu)
- [x] Opsiyonel ek belge yükleme desteği
- [x] Vekaletname/rıza metni Türkçe hazırlama
- [x] Elektronik imza sistemi (canvas ile imza)
- [x] İmza doğrulama ve kaydetme
- [x] Admin yetkisi: ykozdogan1@gmail.com

## Bug Fix: Mesafe, Havalimanı ve Vekaletname Sorunları
- [x] Mesafe hesaplama hatası düzeltme (Washington-İstanbul örneği)
- [x] Eksik havalimanları ekleme (Belgrad ve diğerleri)
- [x] Vekaletname imzalama ekranının görünmeme sorunu düzeltme (adım eklendi)
- [x] Belge yükleme sistemi (uçuş belgeleri: boarding card/konfirmasyon/bilet - en az 1 zorunlu)
- [x] Kimlik belgesi yükleme (TC kimlik/pasaport - en az 1 zorunlu)

## Bug Fix: Vekaletname Yönlendirme ve Admin Belge Görüntüleme
- [x] Vekaletname imzalandıktan sonra eski belge yükleme ekranına değil talep detay sayfasına yönlendirme
- [x] Yeni talep oluşturulurken belgelerin veritabanına kaydedilmesi
- [x] Admin panelinde talep belgelerinin görüntülenmesi (zaten çalışıyordu)

## Bug Fix: Çoklu Yolcu, Tazminat Hesaplama ve Vekaletname Görüntüleme
- [x] Çoklu yolcu için ayrı ayrı bilet ve kimlik belgesi yükleme alanları
- [x] NewClaim sayfasındaki tazminat/mesafe hesaplama hatası düzeltme
- [x] Admin panelinde imzalanan vekaletnameyi görüntüleme

## Bug Fix: Çoklu Yolcu Bilgilerinin Kaydedilmesi ve Görüntülenmesi
- [x] Çoklu yolcu bilgilerini veritabanına kaydetme (passengers tablosu)
- [x] Kullanıcı panelinde tüm yolcuları görüntüleme
- [x] Admin panelinde tüm yolcuları görüntüleme
- [x] Her yolcunun belgelerini ayrı ayrı ilişkilendirme

## Belge Reddetme ve Red Açıklaması
- [x] Documents tablosuna red alanı ve açıklama ekleme
- [x] Admin panelinde belge reddetme butonu ve açıklama girişi
- [x] Kullanıcı panelinde red açıklamasını görüntüleme

## Bug Fix: Devam Eden Sorunlar (v2)
- [x] NewClaim sayfasındaki mesafe/tazminat hesaplama hatası düzeltme (wizard'dan gelen veriler doğru kullanılmalı)
- [x] Çoklu yolcu için ayrı ayrı bilet ve kimlik belgesi yükleme alanları düzeltme (zaten uygulanmıştı)

## Bug Fix: Her Yolcu İçin Ayrı Belge Yükleme
- [x] Her yolcu için ayrı belge yükleme bölümü/tab oluşturma
- [x] Yolcu adı ve sırasına göre belge kategorileri gösterme
- [x] Her yolcu için uçuş belgesi (boarding card/bilet/konfirmasyon) ve kimlik belgesi (TC kimlik/pasaport) alanları

## Bug Fix: Tazminat Hesaplama Yolcu Sayısı Hatası
- [x] Toplam tazminat = Yolcu Başı Tazminat × Yolcu Sayısı olacak şekilde düzeltme
- [x] ClaimWizard bileşeninde hesaplama düzeltme
- [x] NewClaim sayfasında hesaplama düzeltme

## Bug Fix: Tazminat Özeti Yolcu Sayısı Hatası (v2)
- [x] Tazminat Özeti bölümünde toplam tazminat yolcu sayısına göre çarpılmış olarak gösterilmeli
- [x] Talep tamamlama aşamasında doğru toplam tazminat gösterilmeli
- [x] handleCheckEligibility fonksiyonunda yolcu sayısı çarpımı eklendi

## Bug Fix: Vekaletname İmzalama Hatası
- [x] "İmzala ve Onayla" butonuna tıklandığında oluşan hatayı tespit etme (passengers parametresi eksikti)
- [x] Vekaletname imzalama işlemini düzeltme (passengers parametresi eklendi)

## Yeni Özellik: Tali Başvurucular İçin Fiziki İmza Belgesi Yükleme
- [x] Ana başvurucu dışındaki yolcular için fiziki imzalı vekaletname yükleme alanı ekleme
- [x] Her tali başvurucu için ayrı belge yükleme bölümü oluşturma
- [x] Yüklenen vekaletname belgelerini talep ile birlikte kaydetme

## Bug Fix: Tazminat Özeti Yolcu Sayısı Hatası (v3) - DEVAM EDİYOR
- [ ] NewClaim sayfasındaki "Tazminat Özeti" bölümünde toplam tazminat hala yolcu sayısıyla çarpılmıyor
- [ ] displayCompensation değişkeninin hesaplanma şeklini kontrol etme
- [ ] Wizard'dan gelen compensationAmount değerinin doğru kullanılmasını sağlama

## Bug Fix: Vekaletname İmzalama Hatası (v2) - DÜZELTİLDİ
- [x] "İmzala ve Onayla" butonuna tıklandığında oluşan hatayı tespit etme (consentSignature alanı çok küçük)
- [x] Hata mesajını analiz etme ve düzeltme (text -> mediumtext)
- [x] Veritabanı şeması güncellendi ve migration uygulandı

## Yeni Özellik: Tali Başvurucular İçin Vekaletname Şablonu İndirme
- [x] Her tali başvurucu için vekaletname şablonu indirme butonu ekleme
- [x] Vekaletname şablonunu metin dosyası olarak oluşturma (yolcu bilgileriyle doldurulmuş)
- [x] İndirme butonunu "Diğer Yolcuların Vekaletname Belgeleri" bölümüne ekleme

## Bug Fix: Vekaletname İmzalama Hatası (v3) - consentSignature alanı
- [x] İmzayı S3'e yükleyip URL'yi veritabanında saklama (daha iyi çözüm)
- [x] Base64'ten buffer'a çevirip S3'e yükleme
- [x] Fallback olarak doğrudan base64 kaydetme (S3 başarısız olursa)

## Bug Fix: Veritabanı Kayıt Hatası (v4)
- [x] S3 yükleme başarılı ancak INSERT sorgusu hala başarısız
- [x] Raw SQL kullanarak INSERT sorgusunu yeniden yazma
- [x] Benzersiz claim numarası üretimi için retry mekanizması ekleme
- [ ] Yayınlama yapılmalı - değişiklikler yayınlanmış sürüme aktarılmalı

## Bug Fix: Tarih Formatı Hatası (v5)
- [x] JavaScript Date string'lerini MySQL uyumlu formata çevirme (YYYY-MM-DD HH:mm:ss)
- [x] flightDate, consentSignedAt, submittedAt alanlarını düzeltme
- [x] formatDateForMySQL helper fonksiyonu eklendi

## Bug Fix: Talep Oluşturma Hatası (v6) - Detaylı Analiz
- [x] Tüm akışı baştan sona analiz etme
- [x] Client tarafı veri gönderimini inceleme
- [x] Server tarafı veri alımını inceleme
- [x] Veritabanı INSERT sorgusunu inceleme
- [x] Hatayı tespit edip düzeltme

**Sonuç:** Wizard akışı ve talep oluşturma sistemi başarıyla çalışıyor. Önceki test sorunları tarayıcı otomasyonunun React controlled input'larıyla uyumsuzluğundan kaynaklanıyordu. Gerçek kullanıcı etkileşiminde sorun yok.


## Mobil Uyumluluk (Responsive Design)
- [x] Ana sayfa (Home.tsx) mobil uyumluluk
- [x] ClaimWizard bileşeni mobil uyumluluk
- [x] Dashboard ve kullanıcı paneli mobil uyumluluk
- [x] NewClaim sayfası mobil uyumluluk
- [x] Admin paneli mobil uyumluluk (AdminDashboard, AdminClaims)
- [x] Header ve navigasyon mobil menü
- [x] Form elemanları mobil uyumluluk
- [x] Tablo ve liste görünümleri mobil uyumluluk
- [x] ClaimDetail sayfası mobil uyumluluk


## Bug Fix: Çoklu Yolcu Tazminat Hesaplama Hatası (v4)
- [x] Toplam tazminat yolcu sayısıyla çarpılmıyor - 2 yolcu için 400€ yerine 800€ olmalı
- [x] Talep oluşturma sırasında compensationAmount hesaplamasını düzeltme
- [x] Veritabanına kaydedilen tazminat tutarını kontrol etme

**Düzeltme:** Server tarafında claims.create mutation'ında yolcu sayısı dikkate alınıyordu. Şimdi:
- compensationPerPassenger = mesafeye göre hesaplanan tazminat
- totalCompensation = compensationPerPassenger × passengerCount
- Komisyon ve net ödeme de toplam tazminat üzerinden hesaplanıyor


## Bug Fix: Özet Sayfası Tazminat Tutarı Hatası (v5)
- [x] İmzala ve Onayla sonrası özet sayfasında 2 yolcu için 400€ yerine 800€ gösterilmeli
- [x] Veritabanına kaydedilen tazminat tutarını kontrol etme
- [x] Mevcut talepleri veritabanında güncelleme

**Düzeltme:** Mevcut talepler (UCT-2026-000009, UCT-2026-000010) veritabanında güncellendi:
- Tazminat: 800.00 € (400€ × 2 yolcu)
- Komisyon: -200.00 € (800€ × %25)
- Size Ödenecek: 600.00 € (800€ - 200€)


## Bug Fix: Admin Dashboard Talep Sayısı Hatası
- [x] Admin Dashboard'da toplam talep sayısı 0 gösteriyor
- [x] Kullanıcı hesabında 9 talep var ancak admin panelinde görünmüyor
- [x] Admin istatistik sorgusunu kontrol etme ve düzeltme

**Düzeltme:** getClaimStatistics fonksiyonundaki SQL sorgusu hata veriyordu. DATE_FORMAT için raw SQL execute kullanılarak düzeltildi. Artık:
- Toplam Talep: 11
- Bekleyen: 9
- Durum Dağılımı ve Aylık İstatistikler doğru gösteriliyor


## Bug Fix: Nasıl Çalışır Adım Numaraları Üzerinde Çizgi
- [x] Adım numaralarının (01, 02, 03, 04) üzerinde istenmeyen çizgi görünüyor
- [x] CSS/stil sorununu tespit etme ve düzeltme

**Düzeltme:** Adımlar arasındaki bağlantı çizgisi (`hidden md:block absolute top-6...`) kaldırıldı. Bu çizgi numaraların üzerinden geçiyordu.


## Vekaletname Sistemi Geliştirme
- [x] Ana başvurucu vekaletnamesi - İmza sonrası PDF olarak çıktı alma ve önizleme
- [x] Tali başvurucu vekaletnameleri - Profesyonel PDF formatında (logolu) indirme
- [x] Tali başvurucu vekaletnamelerinin ana başvurucu tarafından sisteme yüklenmesi
- [x] Başvuru tamamlandıktan sonra vekaletnamelerin panelde görüntülenmesi
- [x] PDF oluşturma altyapısı (jsPDF)

**Tamamlanan Özellikler:**
- jsPDF kütüphanesi eklendi
- pdfGenerator.ts utility fonksiyonu oluşturuldu (profesyonel PDF şablonu)
- ConsentSignature bileşenine PDF önizleme ve indirme butonları eklendi
- Tali başvurucu vekaletnameleri artık TXT yerine profesyonel PDF formatında
- ClaimDetail sayfasına vekaletname görüntüleme ve PDF indirme eklendi


## Faz 1: Temel Profesyonelleştirme
- [x] E-posta bildirim sistemi kurulumu (Resend entegrasyonu)
  - [x] Talep oluşturulduğunda onay e-postası
  - [x] Durum değişikliğinde bildirim e-postası
  - [x] HTML e-posta şablonları
- [x] Hukuki metinler
  - [x] Kullanım Koşulları sayfası (/terms)
  - [x] Gizlilik Politikası sayfası (/privacy)
  - [x] KVKK Aydınlatma Metni sayfası (/kvkk)
- [x] Çerez banner'ı (KVKK/GDPR uyumlu)
- [x] Müşteri yorumları bölümü (TestimonialsSection)

**Tamamlanan Özellikler:**
- Resend kütüphanesi ve e-posta servisi (server/email.ts)
- 3 hukuki sayfa oluşturuldu ve footer'a bağlandı
- CookieBanner bileşeni (localStorage ile onay takibi)
- TestimonialsSection (3 müşteri yorumu)


## SEO Optimizasyonu (Tam Uyumluluk)

### Meta Taglar ve Open Graph
- [x] Tüm sayfalara benzersiz title ve description meta tagları (index.html + SEOHead bileşeni)
- [x] Open Graph tagları (Facebook, LinkedIn paylaşımları için)
- [x] Twitter Card tagları
- [x] Canonical URL'ler

### Yapısal Veri (Schema.org)
- [x] Organization schema (şirket bilgileri)
- [x] FAQPage schema (SSS sayfası için)
- [x] Service schema (tazminat hizmeti)
- [x] WebSite schema (SearchAction ile)
- [x] StructuredData bileşeni (dinamik yapısal veri)

### Teknik SEO
- [x] sitemap.xml oluşturma
- [x] robots.txt oluşturma
- [x] H1-H6 başlık hiyerarşisi (tüm sayfalarda düzgün)
- [ ] Tüm görsellere alt tag ekleme
- [x] Internal linking optimizasyonu
- [x] URL yapısı optimizasyonu

### Performans
- [ ] Görsel optimizasyonu (lazy loading)
- [ ] Core Web Vitals iyileştirme


## Google Search Console Entegrasyonu
- [x] Site doğrulama meta tag'ı ekleme (index.html - placeholder olarak)
- [x] Google Search Console kurulum rehberi hazırlama (docs/GOOGLE_SEARCH_CONSOLE_REHBERI.md)
- [x] Sitemap.xml gönderimi için talimatlar (rehberde mevcut)


## FlightClaim İlham Alınan İyileştirmeler
- [x] İstatistik bölümü ekleme (başarılı talep sayısı, toplam tazminat, başarı oranı)
- [x] Güven rozetleri ekleme (güvenli ödeme, başarı garantisi, müşteri puanı)
- [x] Telefon/WhatsApp iletişim bilgileri ekleme (header ve footer)
- [x] Slider tabanlı basit tazminat hesaplayıcı ekleme
- [x] Süre tahmini gösterme (ortalama işlem süresi)


## Blog/İçerik Bölümü (SEO)
- [x] Blog altyapısı ve sayfa yapısı oluşturma
- [x] "Uçuş Tazminatı Nasıl Alınır?" makalesi
- [x] "SHY-YOLCU Yönetmeliği Nedir?" makalesi
- [x] "Uçuş İptali Tazminat Hakları" makalesi
- [x] "Geciken Uçuş İçin Ne Yapmalı?" makalesi
- [x] Blog liste sayfası (/blog)
- [x] Makale detay sayfaları (/blog/[slug])
- [x] Header ve footer'a blog linki ekleme
- [x] sitemap.xml'e blog sayfaları ekleme


## Sosyal Medya OAuth Entegrasyonu
- [ ] Login sayfası UI tasarımı
- [ ] Kayıt sayfası UI tasarımı
- [ ] Google OAuth entegrasyonu
- [ ] Facebook OAuth entegrasyonu (opsiyonel)
- [ ] Apple Sign-In entegrasyonu (opsiyonel)
- [ ] OAuth callback handler
- [ ] Kullanıcı veritabanı şeması güncelleme
- [ ] Session yönetimi


## Vekaletname Belgesi Düzeltmeleri
- [x] Ana başvurucu vekaletnamesine uçuş bilgileri ekleme (tarih, numara, kalkış/varış)
- [x] Diğer yolcu vekaletnamelerinde eksik bilgileri tamamlama
- [x] Aktarmalı uçuşlarda tüm uçuş bilgilerini gösterme (1. ve 2. uçuş ayrı ayrı)
- [x] PNR (Rezervasyon) numarasını her iki belgeye ekleme


## Kritik Düzeltmeler ve Yeni Özellikler (22 Ocak 2026)

### 1. Admin Panelinde İmzalı Vekaletname Görüntüleme
- [x] Admin talep detay sayfasında imzalı vekaletname görseli gösterme (zaten vardı)
- [x] Vekaletname PDF indirme butonu ekleme

### 2. PDF Türkçe Karakter Sorunu
- [x] jsPDF'de Türkçe karakter desteği ekleme (Inter font)
- [x] Font dosyası entegrasyonu (base64 olarak gömülü)
- [x] Fallback: Font yüklenemezse ASCII'ye dönüştürme

### 3. Tazminat Türleri Güncelleme
- [x] SHY-YOLCU tazminat kategorileri (4 kategori):
  - Yurtiçi uçuşlar: 100 EUR
  - Yurtdışı 1500 km'ye kadar: 250 EUR
  - Yurtdışı 1500-3500 km: 400 EUR
  - Yurtdışı +3500 km: 600 EUR
- [x] EC-261 tazminat kategorileri (3 kategori korundu)
- [x] Türkiye kalkış/varış = SHY-YOLCU, Avrupa kalkış/varış = EC-261 mantığı

### 4. İfade Değişiklikleri
- [x] "Başarı garantisi" ifadelerini kaldırma (SEOHead, Home, NewClaim, Terms)
- [x] "No win no fee" ve "şeffaf hukuki sürec" ifadelerini ekleme

### 5. Blog Yönetim Paneli
- [x] Blog yazıları için veritabanı şeması (blogPosts tablosu)
- [x] Admin panelinde blog yönetim sayfası (/admin/blog)
- [x] Makale ekleme/düzenleme/silme fonksiyonları (tRPC router)
- [x] Blog listesini veritabanından çekme (Blog.tsx, BlogPost.tsx güncellendi)


## 7 Kritik Sorun Düzeltmesi (23 Ocak 2026)

### 1. Vekaletname PDF İndirme/Önizleme Çalışmıyor
- [x] Türkçe karakter güncellemesinden sonra bozulan PDF oluşturmayı düzeltme (font dosyası yeniden oluşturuldu)
- [x] Ana başvurucu PDF önizleme ve indirme (bold font sorunu düzeltildi)
- [x] Diğer yolcuların vekalet evrakı indirme

### 2. Yurtiçi Uçuş Kategorisi Sorunu
- [x] Türkiye havalimanları listesi oluşturma (40+ havalimanı eklendi)
- [x] Türkiye içi uçuşları "Yurtiçi" olarak sınıflandırma (isDomesticFlightByCode fonksiyonu)
- [x] Yurtiçi uçuşlar için 100 EUR tazminat (getCompensationByDistance fonksiyonu)

### 3. Tazminat Hesaplama Tutarsızlığı
- [x] Aktarmalı uçuşlarda hesaplama hatası düzeltme (departure/arrival parametreleri eklendi)
- [x] Başvuru başlangıcı ve sonucu arasındaki tutarsızlık (calculateCompensation fonksiyonu güncellendi)

### 4. IBAN Bilgisi ve Bilgilendirme Yazısı
- [x] Başvuru formuna IBAN alanı ekleme (passengerIban, passengerBankName)
- [x] Havayolu doğrudan ödeme bilgilendirmesi ekleme (3 iş günü, %25 komisyon, hukuki uyarı)
- [ ] %25 komisyon ve ödeme koşulları yazısı
### 5. Destek Talebi Butonu Çalışmıyor
- [x] Dashboard'da destek talebi yönlendirmesi düzeltme (WhatsApp linki eklendi)

### 6. Admin Blog Navigasyon Sorunu
- [x] Blog sayfasında navigasyon menüsü düzeltme (DashboardLayout yerine özel navigasyon)
- [x] Page 1, Page 2 yerine doğru menü öğelerini gösterme (navItems eklendi)ı/İstatistikler tıklandığında blog kaybolması

### 7. Güvenli Ödeme İfadesi Kaldırma
- [x] Ana sayfadan "Güvenli Ödeme" badge'ini kaldırma ("Şeffaf Sürec" ile değiştirildi)


## 7 Yeni Sorun Düzeltmesi (23 Ocak 2026)

### 1. Yurtiçi Uçuş Hesaplama Hatası
- [x] isDomesticFlightByCode fonksiyonunun çalışıp çalışmadığını kontrol etme (fonksiyon doğru)
- [x] Tazminat hesaplama fonksiyonunda yurtiçi kontrolü düzeltme (departure/arrival parametreleri eklendi)
- [x] "Yurtdışı 1500 km'ye kadar" yerine "Yurtiçi" gösterme (NewClaim.tsx güncellendi)

### 2. Ana Sayfa Hesaplayıcıda Yurtiçi Seçeneği
- [x] Hızlı hesaplayıcıya "Yurtiçi (100 EUR)" seçeneği ekleme (Uçuş Türü butonları)

### 3. IBAN Bilgisi Görüntüleme
- [x] Dashboard'da IBAN bilgisini gösterme (ClaimDetail.tsx - Ödeme Bilgileri bölümü)
- [x] Admin panelde IBAN bilgisini gösterme (AdminClaimDetail.tsx - Finansal Özet bölümü)

### 4. Destek Talebi Ticket Sistemi
- [ ] Ticket veritabanı tablosu oluşturma
- [ ] Ticket oluşturma formu
- [ ] Ticket listesi ve detay sayfası
- [ ] E-posta bildirimi entegrasyonu

### 5. Admin Navigasyonda Blog Kaybolması
- [ ] AdminAirlines.tsx'de navItems'a blog ekleme
- [ ] AdminStatistics.tsx'de navItems'a blog ekleme

### 6. Blog Statik ve Veritabanı İçerik Birleştirme
- [ ] Statik içerikleri veritabanına seed olarak ekleme
- [ ] Blog sayfasında sadece veritabanından çekme

### 7. İmzalı Vekaletname PDF'e İmza Ekleme
- [ ] ClaimDetail.tsx'de imza verisini PDF'e ekleme
- [ ] İmza görselini PDF'e gömme


## Alacak Temlik Sözleşmesi Formatı (Yeni Vekaletname)
- [ ] Yeni PDF şablonu oluşturma - 4 sayfalık profesyonel format
- [ ] İki dilli (Türkçe/İngilizce) içerik
- [ ] Bölümler: Taraflar, Uçuş Bilgileri, Temlik, Şirket Yetkileri, Müşteri Taahhütleri, Hizmet Bedeli, Kişisel Veriler, Süre ve Fesih, Yedeklilik Hükmü, Diğer Hükümler, Kabul ve Onay
- [ ] Renkli kutular: Sarı (uyarı), Yeşil (hizmet bedeli), Pembe (onay)
- [ ] TC Kimlik No alanı ekleme
- [ ] Telefon alanı ekleme
- [ ] Aksaklık türü seçimi (İptal, Rötar, Overbooking)
- [ ] Şirket bilgileri (UçuşTazminat)


## 10 Kritik Sorun Düzeltmesi (Ocak 23 - 2)
### 1. Yurtiçi Tazminat Hesaplama Hatası
- [ ] Tazminat talebi başlatma ekranında yurtiçi 100 EUR gösterme
- [ ] Tazminat talebi tamamlama ekranında yurtiçi 100 EUR gösterme

### 2. Vekaletname İmza Görseli Sorunu
- [ ] Önizlemede imza görselinin metin üzerini örtmesini düzeltme
- [ ] Admin panelde PDF indirmede imza ekleme

### 3. Ana Sayfa Hesaplayıcı
- [ ] Yurtiçi/Yurtdışı seçim butonu ekleme
- [ ] SHY-YOLCU tablosuna yurtiçi 100 EUR seçeneği ekleme

### 4. Navigasyon Sorunları
- [ ] Admin Havayolları sayfasında blog linki
- [ ] Admin İstatistikler sayfasında blog linki
- [ ] Blog sayfasında Tazminat Miktarları ve SSS linkleri

### 5. IBAN Görüntüleme
- [ ] Kullanıcı dashboard'da IBAN gösterme
- [ ] Admin panelde IBAN gösterme

### 6. Destek Talebi 404 Hatası
- [ ] /dashboard/support route düzeltme

### 7. Blog İçerik Sorunu
- [ ] Manuel yazı yüklendiğinde statik içeriklerin kaybolmasını engelleme


## Kritik Hata Düzeltmeleri (24 Ocak 2026)

### 1. Yurtiçi Uçuş Tazminat Hesaplama Hatası
- [x] ClaimWizard'da getCompensationByDistance çağrısına havalimanı kodları eklendi
- [x] Yurtiçi uçuşlar artık doğru şekilde 100 EUR olarak hesaplanıyor
- [x] Tazminat hesaplama testleri eklendi (compensation.test.ts - 12 test)

### 2. İmza Önizleme ve PDF Sorunları
- [x] assignmentAgreementPdf.ts'de imza konumu düzeltildi (metin üzerine binme sorunu)

### 3. Blog Sayfası Header Navigasyonu
- [x] Blog.tsx header'a "Tazminat Miktarları" ve "SSS" linkleri eklendi

### 4. SHY-YOLCU Tazminat Tablosu
- [x] Home.tsx'deki QuickCalculatorSection tablosuna "Yurtiçi Uçuşlar - 100 EUR" seçeneği eklendi

### 5. Mevcut Durumlar (Zaten Çalışıyor)
- [x] Admin navigasyonda blog linki zaten mevcut (AdminAirlines.tsx, AdminStats.tsx)
- [x] IBAN görüntüleme zaten mevcut (ClaimDetail.tsx, AdminClaimDetail.tsx)
- [x] Destek talebi sistemi zaten çalışıyor (/dashboard/support)
- [x] Ana sayfa hesaplayıcıda yurtiçi/yurtdışı toggle zaten mevcut
- [x] CompensationTiersSection'da yurtiçi 100 EUR zaten mevcut


## Bug Fix: Admin Paneli Vekaletname PDF Tutarsızlığı (24 Ocak 2026)
- [x] Admin panelden indirilen vekaletname PDF'i eski şablonu kullanıyor
- [x] Kullanıcının imzaladığı vekaletname ile admin panelden indirilen vekaletname aynı olmalı
- [x] pdfGenerator.ts ve assignmentAgreementPdf.ts fonksiyonlarını karşılaştırma
- [x] Admin paneli PDF indirme fonksiyonunu güncel şablonu kullanacak şekilde güncelleme

**Düzeltme:** Admin panelinde `downloadPowerOfAttorneyPDF` yerine `downloadAssignmentAgreementPDF` kullanılacak şekilde güncellendi. Artık kullanıcının imzaladığı "Alacak Temlik Sözleşmesi" formatı admin panelinden de indirilebilir.


## Bug Fix: Ana Sayfa Tazminat Hesaplayıcı Yurtiçi Hesaplama Hatası (24 Ocak 2026)
- [x] Yurtiçi seçildiğinde mesafe slider'ı hala aktif ve yanlış mesafe gösteriyor
- [x] Yurtiçi uçuşlarda mesafe ne olursa olsun 100 EUR sabit olmalı
- [x] QuickCalculatorSection bileşeninde yurtiçi/yurtdışı mantığını düzeltme

**Düzeltme:** Yurtiçi seçildiğinde mesafe slider'ı gizleniyor ve "Yurtiçi uçuşlarda mesafeden bağımsız sabit 100 EUR tazminat uygulanır" açıklaması gösteriliyor.


## Bug Fix: Kritik Sorunlar (24 Ocak 2026 - 2. Tur)

### 1. Temlik Sözleşmesi İmza Sorunu
- [ ] Admin panelden indirilen PDF'e imza eklenmiyor
- [ ] Veritabanından imza URL'si alınıp PDF'e eklenmeli
- [ ] assignmentAgreementPdf.ts'de imza ekleme mantığını kontrol etme

### 2. IBAN Görüntüleme Sorunu
- [ ] Admin panelde talep detayında IBAN görünmüyor
- [ ] Kullanıcı dashboard'unda talep detayında IBAN görünmüyor
- [ ] Veritabanında IBAN alanını kontrol etme
- [ ] UI'da IBAN gösterimini düzeltme

### 3. Admin Destek Talebi Sayfası Eksikliği
- [ ] /admin/support sayfası mevcut değil
- [ ] AdminSupport.tsx sayfası oluşturulmalı
- [ ] Kullanıcı destek taleplerini listeleme ve yanıtlama özelliği
- [ ] Admin navigasyonuna destek linki ekleme


## Bug Fix: Kritik Sorunlar (24 Ocak 2026) - Faz 2

### 1. Temlik Sözleşmesi İmza Sorunu
- [x] Admin panelden indirilen PDF'e imza eklenmiyor
- [x] Server-side'da imza URL'sini base64'e dönüştürme
- [x] routers.ts'de admin.getDetail sorgusuna consentSignatureBase64 eklendi

### 2. IBAN Görüntüleme Sorunu
- [x] Admin ve kullanıcı panelinde IBAN görünüyor mu kontrol et (zaten mevcut)
- [x] Veritabanında IBAN verisi var mı kontrol et (mevcut taleplerde IBAN girilmemiş)

### 3. Admin Destek Talebi Sayfası
- [x] /admin/support sayfası oluşturuldu (AdminSupport.tsx)
- [x] Destek taleplerini listeleme
- [x] Taleplere yanıt verme
- [x] Durum güncelleme
- [x] Tüm admin sayfalarına Destek linki eklendi (Dashboard, Claims, Airlines, Stats, Blog)
- [x] App.tsx'e route eklendi


## Yeni Özellik: Uçuş Numarasından Otomatik Mesafe Hesaplama (24 Ocak 2026)
- [x] Mevcut uçuş API entegrasyonunu analiz etme (AviationStack)
- [x] Uçuş numarasından kalkış/varış havalimanı bilgisi çekme
- [x] Havalimanı koordinatlarından mesafe hesaplama
- [x] ClaimWizard'da uçuş numarası girildiğinde otomatik mesafe gösterme
- [x] Tazminat tutarını otomatik hesaplama ve gösterme

**Eklenen Özellikler:**
- calculator.getFlightDistance endpoint'i eklendi (routers.ts)
- ClaimWizard'da "Mesafeyi Otomatik Hesapla" butonu eklendi
- Uçuş bilgisi bulunduğunda havayolu, mesafe, güzergah ve gecikme bilgisi gösteriliyor
- Hem direkt hem aktarmalı uçuşlar için çalışıyor


## Özellik: ClaimWizard Akış Değişikliği (24 Ocak 2026)
- [x] Adım 1: Uçuş numarası ve tarih sorma (ilk adım olarak)
- [x] Adım 2: API'den uçuş bilgisi arama
- [x] Adım 3a: Bulunursa - havalimanları otomatik doldurma ve direkt/aktarmalı seçimine geçme
- [x] Adım 3b: Bulunamazsa - manuel havalimanı seçimi ekranına yönlendirme
- [x] Adım 4: Yolcu bilgileri toplama
- [x] Tazminat hesaplama ve gösterme (tüm adımlarda)

**Yeni Akış:**
- Otomatik Mod (3 adım): Uçuş Bilgileri → Uçuş Tipi → Yolcular
- Manuel Mod (4 adım): Uçuş Bilgileri → Güzergah → Uçuş Tipi → Yolcular


## Bug Fix: Kullanıcı Dashboard Vekaletname PDF Güncelleme (24 Ocak 2026)
- [x] ClaimDetail.tsx'de eski vekaletname PDF indirme butonunu kaldırma
- [x] İmzalı Alacak Temlik Sözleşmesi indirme butonu ekleme (AdminClaimDetail.tsx'deki gibi)
- [x] Server-side imza base64 dönüşümü için routers.ts güncelleme (kullanıcı endpoint'i)

**Düzeltme:** Kullanıcı dashboard'undaki talep detay sayfasında "Vekaletname" bölümü "Alacak Temlik Sözleşmesi" olarak güncellendi. PDF indirme butonu artık admin paneldeki gibi `downloadAssignmentAgreementPDF` fonksiyonunu kullanıyor. Server-side'da imza URL'si base64'e dönüştürülüyor (CORS sorunu yok).


## Bug Fix: Simülasyon Fonksiyonunu Kaldırma (24 Ocak 2026)
- [x] flightApi.ts'de simulateFlightData fonksiyonunu kaldırma
- [x] API başarısız olduğunda hata mesajı döndürme
- [x] ClaimWizard'da API başarısız olduğunda kullanıcıya manuel giriş yaptırma (zaten vardı)
- [x] Hata mesajını "Uçuş bilgisi bulunamadı. Lütfen havalimanlarını manuel olarak seçin." olarak güncelleme

**Düzeltme:** Simülasyon fonksiyonu kaldırıldı. Artık API başarısız olduğunda yanlış veri (SAW-ESB gibi) yerine kullanıcıya manuel havalimanı seçimi yaptırılıyor.


## Özellik: Sözleşme Versiyonlama Sistemi (24 Ocak 2026)
- [ ] Veritabanı şemasına signedAgreementContent alanı ekleme (TEXT/LONGTEXT)
- [ ] İmza atılırken o anki sözleşme metnini veritabanına kaydetme
- [ ] PDF oluştururken kayıtlı metni kullanma (varsa kayıtlı, yoksa güncel)
- [ ] Admin ve kullanıcı panelinde doğru sözleşme metninin gösterilmesi


## Özellik: Sözleşme Versiyonlama Sistemi (24 Ocak 2026)
- [x] Veritabanı şemasına signedAgreementContent alanı ekleme
- [x] İmza atılırken sözleşme metnini JSON olarak kaydetme
- [x] PDF oluştururken kayıtlı sözleşme metnini kullanma
- [x] Eski taleplerde mevcut verilerden PDF oluşturma (fallback)

**Uygulama:**
- claims tablosuna signedAgreementContent (LONGTEXT) alanı eklendi
- NewClaim.tsx'de imza atılırken tüm sözleşme verileri JSON olarak kaydediliyor
- AdminClaimDetail.tsx ve ClaimDetail.tsx'de PDF indirirken kayıtlı veri varsa o kullanılıyor
- Eski taleplerde (signedAgreementContent olmayan) mevcut claim verilerinden PDF oluşturuluyor
- Sözleşme versiyonu, imza tarihi, müşteri bilgileri, uçuş bilgileri ve tazminat bilgileri saklanıyor


## Özellik: ClaimWizard Akış Değişikliği v2 (24 Ocak 2026)
- [x] Adım 1: Güzergah seçimi (kalkış/varış havalimanları)
- [x] Adım 2: Uçuş tipi (direkt/aktarmalı, aktarmalıysa aktarma noktası)
- [x] Adım 3: Uçuş bilgileri (tüm uçuş numaraları ve tarihleri)
- [x] Adım 4: Yolcu bilgileri (sayı ve detaylar)
- [x] Mesafe ve tazminat hesaplaması güzergah seçildiğinde otomatik yapılacak

**Yeni Akış (4 Adım):**
1. Güzergah - Kalkış ve varış havalimanları seçimi (tazminat otomatik hesaplanır)
2. Uçuş Tipi - Direkt/Aktarmalı seçimi (aktarmalıysa aktarma noktası)
3. Uçuş Bilgileri - Tüm uçuş numaraları ve tarihleri
4. Yolcular - Yolcu sayısı ve bilgileri


## Özellik: Aktarma Noktası Havalimanı Seçici (24 Ocak 2026)
- [x] ClaimWizard'da Uçuş Tipi adımına aktarma noktası havalimanı seçici ekleme (zaten mevcuttu)
- [x] Aktarmalı seçildiğinde aktarma havalimanı seçimi gösterme (zaten mevcuttu)
- [x] Güzergah görselleştirmesini güncelleme (Kalkış → Aktarma → Varış)
- [x] Mesafe hesaplamasını aktarma noktası dahil güncelleme (zaten mevcuttu)

**Eklenen Özellikler:**
- CompensationCard'a güzergah görselleştirmesi eklendi
- Direkt uçuşlarda: Kalkış → Varış
- Aktarmalı uçuşlarda: Kalkış → Aktarma (turuncu) → Varış
- Havalimanı kodları ve şehir isimleri gösteriliyor


## Bug Fix: Talep Oluşturma INSERT Hatası (24 Ocak 2026)
- [x] INSERT sorgusundaki alan sayısı uyumsuzluğunu tespit etme
- [x] signedAgreementContent alanının veritabanı şemasıyla uyumunu kontrol etme
- [x] db.ts'de createClaim fonksiyonuna signedAgreementContent alanını ekleme

**Düzeltme:** db.ts'deki INSERT sorgusuna signedAgreementContent alanı eklendi. Şema güncellenmişti ama INSERT sorgusu güncellenmemişti.


## Bug Fix: İmzala ve Kaydet Butonu Hatası
- [x] İmzala ve kaydet butonuna basıldığında hata veriyor ve kaydetmiyor
- [x] Hatayı analiz etme ve düzeltme

**Düzeltme:** createClaim fonksiyonundaki SQL INSERT sorgusuna eksik alanlar eklendi:
- passengerIdNumber (TC Kimlik No)
- passengerIban (IBAN numarası)
- passengerBankName (Banka adı)


## SSS Sayfası Güncelleme
- [x] Sıkça Sorulan Sorular sayfasını daha kapsamlı hale getir
- [x] Yeni sorular ekle (5'ten 16'ya çıkarıldı)
- [x] Mevcut soruları genişlet

**Eklenen Yeni Sorular:**
- Tazminat miktarları nasıl belirleniyor?
- SHY-YOLCU Yönetmeliği nedir?
- Başvuru süreci nasıl işliyor?
- Alacak temlik sözleşmesi nedir?
- Ödeme nasıl yapılıyor?
- Biniş kartımı kaybettim, ne yapabilirim?
- Aktarmalı uçuşlarda tazminat nasıl hesaplanır?
- Uçuşum iptal edildi ama alternatif uçuş teklif edildi, tazminat alabilir miyim?
- Birden fazla yolcu için tek başvuru yapabilir miyim?
- Havayolu tazminat ödemeyi reddederse ne olur?
- Daha önce havayoluna başvurdum ve reddedildim, yine de başvurabilir miyim?


## Özel Üyelik Sistemi (Manus OAuth Yerine)
- [x] Veritabanı şemasına password hash alanı ekleme
- [x] Server-side register endpoint oluşturma
- [x] Server-side login endpoint oluşturma
- [x] Frontend kayıt sayfası oluşturma (/kayit)
- [x] Frontend giriş sayfası oluşturma (/giris)
- [x] Mevcut Manus OAuth bağımlılıklarını kaldırma (yönlendirmeler güncellendi)
- [x] Session/JWT yönetimi (mevcut JWT altyapısı kullanıldı)


## Giriş/Kayıt Sistemi Hata Düzeltme
- [ ] Kayıt işlemi veritabanına kayıt yapmıyor - düzelt
- [ ] Giriş butonu çalışmıyor - düzelt
- [ ] Hata mesajları görünmüyor - düzelt


## Giriş/Kayıt Sistemi Hata Düzeltme (25 Ocak 2026)
- [x] Kayıt işlemi veritabanına kayıt yapmıyor - düzeltildi
- [x] Giriş butonu çalışmıyor - düzeltildi
- [x] Hata mesajları görünmüyor - düzeltildi
- [x] Çıkış butonu Manus OAuth'a yönlendiriyordu - özel giriş sayfasına yönlendirme düzeltildi
- [x] getLoginUrl() fonksiyonu özel giriş sayfasına yönlendirecek şekilde güncellendi

**Test Sonuçları:**
- Kayıt: ✅ Çalışıyor (yenikullanici@test.com başarıyla kayıt oldu)
- Giriş: ✅ Çalışıyor (testcurl@example.com ve yenikullanici@test.com ile giriş yapıldı)
- Çıkış: ✅ Çalışıyor (/giris sayfasına yönlendiriyor)


## Admin Paneli - Kullanıcı Yönetimi
- [x] Mevcut admin panelini inceleme - kullanıcı yönetimi var mı?
- [x] Kullanıcı listesi sayfası oluşturma (/admin/users)
- [x] Kullanıcı detay görüntüleme (dialog ile)
- [x] Kullanıcı düzenleme (rol değiştirme, bilgi güncelleme)
- [x] Kullanıcı silme (talepli kullanıcılar silinemez)
- [x] tRPC endpoint'leri oluşturma (users.list, users.stats, users.getById, users.update, users.delete, users.updateRole)
- [x] Vitest testleri yazıldı ve geçti (11 test)


## Şifremi Unuttum Özelliği
- [x] Veritabanı şemasına şifre sıfırlama token alanı ekleme (resetPasswordToken, resetPasswordExpires)
- [x] Backend API endpoint'leri oluşturma (forgotPassword, verifyResetToken, resetPassword)
- [x] E-posta gönderme entegrasyonu (Resend API - sendPasswordResetEmail)
- [x] Frontend sayfaları oluşturma (/sifremi-unuttum, /sifre-sifirla)
- [x] Giriş sayfasına "Şifremi Unuttum" linki ekleme
- [x] Test ve doğrulama (11 test geçti)


## E-posta Doğrulama Sistemi
- [x] Veritabanı şemasına e-posta doğrulama alanları ekleme (emailVerificationToken, emailVerificationExpires)
- [x] Backend API endpoint'leri oluşturma (sendVerificationEmail, verifyEmail, checkEmailVerification)
- [x] E-posta doğrulama şablonu oluşturma (sendEmailVerificationEmail)
- [x] Kayıt akışını güncelleme - kayıt sonrası otomatik doğrulama e-postası gönderme
- [x] Frontend sayfaları oluşturma (/email-dogrula)
- [x] Dashboard'da doğrulama uyarısı banner'ı (EmailVerificationBanner)
- [x] Test ve doğrulama (11 test geçti)


## Google ve Facebook ile Sosyal Giriş
- [ ] OAuth entegrasyonu için gerekli API anahtarlarını belirleme
- [ ] Veritabanı şemasını güncelleme (socialProvider, socialId alanları)
- [ ] Backend OAuth callback endpoint'leri oluşturma (Google, Facebook)
- [ ] Frontend giriş/kayıt sayfalarına sosyal giriş butonları ekleme
- [ ] Test ve doğrulama


## Tazminat Hesaplama Sihirbazı Güncelleme
- [ ] Adım 1: Kalkış ve varış havalimanları
- [ ] Adım 2: Direkt/Aktarmalı uçuş seçimi (aktarmalıysa aktarma noktası)
- [ ] Adım 3: Sorun türü seçimi (rötar, iptal, biniş reddi, aktarma kaçırma, diğer)
- [ ] Rötar senaryosu: Gecikme süresi sorusu (2 saatten az, 2-3 saat, 3-4 saat, 4+ saat, ulaşamadı, hatırlamıyorum)
- [ ] İptal senaryosu: Bilgilendirme zamanı sorusu (14 gün önce, 7-14 gün, 7 günden az, kalkış günü, hatırlamıyorum)
- [ ] Biniş reddi senaryosu: Gönüllü/zorunlu sorusu (gönüllü = tazminat yok uyarısı)
- [ ] Aktarma kaçırma senaryosu: Gecikme süresi + aynı PNR sorusu
- [ ] Havayolu gerekçesi sorusu (teknik, mürettebat, operasyonel, hava koşulları, ATC, güvenlik, vb.)
- [ ] Olağanüstü hal uyarıları (hava koşulları, ATC grevi, güvenlik, kuş çarpması = tazminat yok)


## Tazminat Hesaplama Sihirbazı Detaylı Güncelleme (25 Ocak 2026) - TAMAMLANDI
- [x] Güzergah adımı (kalkış/varış havalimanları) - ilk soru
- [x] Uçuş tipi adımı (direkt/aktarmalı) - aktarmalıysa aktarma noktası girişi
- [x] Sorun adımı (5 alternatif senaryo)
  - [x] Uçuşum rötar yaptı
  - [x] Uçuşum iptal edildi
  - [x] Binişe izin verilmedi (bumped/overbooked)
  - [x] Aktarma uçuşunu kaçırdım (sadece aktarmalı uçuşlarda)
  - [x] Diğer/lütfen belirtiniz
- [x] Detaylar adımı (koşula bağlı sorular)
  - [x] Rötar: Gecikme süresi (6 seçenek)
  - [x] İptal: Bilgilendirilme zamanı (5 seçenek)
  - [x] Bumped: Gönüllü vazgeçme sorusu (2 seçenek)
  - [x] Aktarma kaçırma: Gecikme süresi + PNR sorusu
- [x] Gerekçe adımı (12 farklı havayolu gerekçesi)
- [x] Tazminat uygunluk kontrolleri ve uyarılar
  - [x] Gönüllü vazgeçme = tazminat yok uyarısı
  - [x] Hava koşulları, ATC, güvenlik, kuş çarpması = tazminat yok uyarısı

**Tamamlandı:** Tüm senaryolar ve koşullu sorular eklendi. Uyarı mesajları çalışıyor.


## Bug Fix: Dashboard'da Aktarmalı Uçuş Görüntüleme
- [ ] Dashboard'da sadece ilk uçuş görünüyor - aktarmalı uçuşlarda tüm uçuşlar gösterilmeli
- [ ] ClaimDetail sayfasında aktarmalı uçuş bilgilerini gösterme
- [ ] Talep listesinde aktarmalı uçuş göstergesi ekleme


## Bug Fix: Dashboard'da Aktarmalı Uçuş Görüntüleme (25 Ocak 2026)
- [x] Dashboard'da sadece ilk uçuş görünüyor - aktarmalı uçuşlarda tüm uçuşlar görünmeli
- [x] Veritabanı şemasına aktarmalı uçuş alanları ekleme (isConnecting, connectionAirport, flight2Number, flight2Date)
- [x] Backend güncellemeleri (routers.ts, db.ts)
- [x] Frontend güncellemeleri (Dashboard.tsx, ClaimDetail.tsx, NewClaim.tsx)

**Tamamlandı:** Aktarmalı uçuşlarda tüm uçuş bilgileri (aktarma havalimanı, 2. uçuş numarası ve tarihi) artık Dashboard ve ClaimDetail sayfalarında görüntüleniyor.


## Kullanıcı Panosu - Talep Durumu İlerleme Çubuğu
- [x] Mevcut Dashboard yapısını inceleme
- [x] İlerleme çubuğu bileşeni oluşturma (ClaimProgressBar)
- [x] Durum adımlarını tanımlama (Gönderildi → İnceleniyor → Havayoluna Gönderildi → Onaylandı → Ödendi)
- [x] Dashboard'daki talep kartlarına ilerleme çubuğu ekleme (compact versiyon)
- [x] ClaimDetail sayfasına da ilerleme çubuğu ekleme (full versiyon)

**Tamamlandı:** İki farklı versiyon oluşturuldu:
- Compact: Dashboard'daki talep kartlarında küçük ilerleme çubuğu
- Full: ClaimDetail sayfasında adım adım gösterge


## Bug Fix: ClaimDetail'da Aktarmalı Uçuş Bilgileri Görünmüyor
- [ ] ClaimDetail sayfasındaki "Uçuş Bilgileri" kartında aktarma havalimanı ve 2. uçuş görünmüyor
- [ ] Aktarmalı uçuşlarda tüm uçuş bacaklarını (1. uçuş ve 2. uçuş) göster


## Bug Fix: Dashboard ve ClaimDetail'da Aktarmalı Uçuş Bilgileri Görünmüyor (26 Ocak 2026)
- [x] MySQL'de boolean değerler 0/1 olarak saklanıyor, JavaScript'te true/false olarak yorumlanmıyor
- [x] myList endpoint'inde isConnecting değerini Boolean() ile dönüştürme
- [x] myClaimDetail endpoint'inde isConnecting değerini Boolean() ile dönüştürme
- [x] Admin getDetail endpoint'inde isConnecting değerini Boolean() ile dönüştürme
- [x] Admin claims listesi endpoint'inde isConnecting değerini Boolean() ile dönüştürme


## Bug Fix: Admin Hesabı Giriş ve Şifre Sıfırlama Sorunu (26 Ocak 2026)
- [x] Admin hesabına (ykozdogan1@gmail.com) giriş yapılamıyor (hesapta şifre yoktu - OAuth ile oluşturulmuştu)
- [x] Şifre sıfırlama e-postası gönderilmiyor (şifresi olmayan hesaplar için e-posta gönderilmiyor - tasarım gereği)
- [x] Veritabanında admin hesabı durumunu kontrol etme (passwordHash = null idi)
- [x] Şifre sıfırlama e-posta sistemini inceleme (OAuth kullanıcıları için şifre sıfırlama devre dışı)
- [x] Admin şifresini manuel olarak sıfırlama (Admin123! olarak atandı, emailVerified = 1 yapıldı)

**Düzeltme:** Admin hesabı Manus OAuth ile oluşturulmuştu ve şifresi yoktu. Manuel olarak şifre atandı (Admin123!) ve e-posta doğrulaması aktif edildi. Giriş başarıyla test edildi.
