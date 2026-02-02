export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string;
  readTime: number;
  category: string;
  tags: string[];
  image?: string;
}

const post1Content = `## Uçuş Tazminatı Nedir?

Uçuş tazminatı, havayolu şirketlerinin yolculara karşı yükümlülüklerini yerine getirememesi durumunda ödenmesi gereken maddi tazminattır. Türkiye'de bu haklar **SHY-YOLCU Yönetmeliği** ile düzenlenmektedir.

## Hangi Durumlarda Tazminat Alabilirsiniz?

### 1. Uçuş Gecikmesi
Uçuşunuz planlanan kalkış saatinden **3 saat veya daha fazla** geciktiyse tazminat hakkınız doğar. Gecikme süresi, uçağın varış noktasına inişinden itibaren hesaplanır.

### 2. Uçuş İptali
Uçuşunuz iptal edildiyse ve havayolu şirketi size en az **14 gün önceden** bildirim yapmadıysa tazminat talep edebilirsiniz.

### 3. Uçuşa Alınmama (Overbooking)
Fazla bilet satışı nedeniyle uçuşa alınmadıysanız, gecikme süresi şartı aranmaksızın tazminat hakkınız vardır.

## Tazminat Miktarları

Tazminat miktarı uçuş mesafesine göre belirlenir:

| Mesafe | Tazminat Miktarı |
|--------|------------------|
| 1500 km'ye kadar | 250 EUR |
| 1500 - 3500 km | 400 EUR |
| 3500 km üzeri | 600 EUR |

## Adım Adım Tazminat Alma Süreci

### Adım 1: Belgeleri Toplayın
- Biniş kartı veya e-bilet
- Kimlik belgesi fotokopisi
- Gecikme/iptal bildirimi (varsa)
- Havayolunun verdiği tüm yazılı belgeler

### Adım 2: Gecikme Süresini Belgeleyin
Uçuşunuzun gerçek kalkış ve varış saatlerini not edin. FlightRadar24 gibi sitelerden uçuş geçmişini kontrol edebilirsiniz.

### Adım 3: Havayoluna Başvurun
İlk olarak havayolu şirketine doğrudan başvurabilirsiniz. Ancak havayolları genellikle bu talepleri reddeder veya geciktirir.

### Adım 4: Profesyonel Destek Alın
UçuşTazminat gibi uzman platformlar, havayolu ile tüm iletişimi sizin adınıza yürütür ve gerekirse hukuki süreç başlatır.

## Tazminat Alamayacağınız Durumlar

Aşağıdaki **olağanüstü koşullarda** havayolu tazminat ödemekle yükümlü değildir:

- Şiddetli hava koşulları (fırtına, sis, kar)
- Güvenlik tehditleri
- Havaalanı veya hava trafik kontrol grevleri
- Politik istikrarsızlık

**Önemli:** Teknik arızalar olağanüstü koşul sayılmaz ve tazminat hakkınızı ortadan kaldırmaz.

## Zaman Aşımı Süresi

Türkiye'de uçuş tazminatı talepleri için **3 yıllık** zaman aşımı süresi vardır. Bu süre içinde başvurmadığınız takdirde hakkınızı kaybedersiniz.

## Neden UçuşTazminat?

- **Başarı garantisi:** Kazanamazsak ücret yok
- **Profesyonel takip:** Havayolu ile tüm iletişimi biz yürütürüz
- **Hukuki destek:** Gerekirse mahkeme sürecini başlatırız
- **Şeffaf komisyon:** Sadece %25 komisyon, gizli ücret yok`;

const post2Content = `## SHY-YOLCU Yönetmeliği Nedir?

**SHY-YOLCU Yönetmeliği** (Sivil Havacılık Genel Müdürlüğü Yolcu Hakları Yönetmeliği), Türkiye'de hava yolu taşımacılığında yolcu haklarını düzenleyen temel mevzuattır. Bu yönetmelik, Avrupa Birliği'nin EC 261/2004 sayılı tüzüğünden uyarlanmıştır.

## Yönetmeliğin Kapsamı

SHY-YOLCU Yönetmeliği aşağıdaki uçuşları kapsar:

### Kapsama Dahil Uçuşlar
- Türkiye'deki bir havalimanından kalkan tüm uçuşlar
- Türkiye'ye inen ve Türk havayolu tarafından gerçekleştirilen uçuşlar
- AB ülkelerinden kalkan ve Türkiye'ye inen uçuşlar

### Kapsam Dışı Uçuşlar
- Ücretsiz veya indirimli biletler (çalışan indirimi, sadakat programı vb.)
- Helikopter seferleri
- Paket tur kapsamında iptal edilen uçuşlar (tur operatörüne başvurulmalı)

## Yolcu Hakları

### 1. Uçuş Gecikmesinde Haklar

**2-4 saat arası gecikme:**
- Ücretsiz yiyecek ve içecek
- İki adet ücretsiz telefon görüşmesi, faks veya e-posta

**4 saat ve üzeri gecikme:**
- Yukarıdaki haklar
- Gerekirse ücretsiz konaklama
- Havalimanı-otel transferi

**5 saat ve üzeri gecikme:**
- Bilet ücretinin iadesi
- Alternatif uçuş hakkı

### 2. Uçuş İptalinde Haklar

Uçuş iptal edildiğinde yolcuya iki seçenek sunulmalıdır:

**Seçenek A:** Bilet ücretinin tam iadesi
**Seçenek B:** Alternatif uçuşla varış noktasına ulaşım

Ek olarak, iptal 14 günden az süre önce bildirilmişse tazminat hakkı doğar.

### 3. Uçuşa Alınmamada Haklar

Fazla bilet satışı (overbooking) nedeniyle uçuşa alınmayan yolcular:
- Tam bilet iadesi veya alternatif uçuş
- Tazminat (mesafeye göre 250-600 EUR)
- Yiyecek, içecek ve gerekirse konaklama

## Tazminat Miktarları

| Uçuş Mesafesi | Gecikme/İptal Tazminatı |
|---------------|-------------------------|
| 1500 km'ye kadar | 250 EUR |
| 1500 - 3500 km | 400 EUR |
| 3500 km üzeri | 600 EUR |

## Olağanüstü Koşullar İstisnası

Havayolu şirketleri aşağıdaki durumlarda tazminat ödemekten muaf tutulur:

- **Meteorolojik koşullar:** Şiddetli fırtına, yoğun sis, kar yağışı
- **Güvenlik riskleri:** Terör tehdidi, siyasi istikrarsızlık
- **Grev:** Havalimanı çalışanları veya hava trafik kontrolörleri grevi
- **Kuş çarpması:** Uçağa kuş çarpması sonucu oluşan hasar

**Dikkat:** Teknik arızalar olağanüstü koşul sayılmaz!

## Şikayet ve Başvuru Süreci

### 1. Havayoluna Başvuru
İlk olarak havayolu şirketinin müşteri hizmetlerine yazılı başvuru yapın.

### 2. SHGM'ye Şikayet
Havayolundan 30 gün içinde yanıt alamazsanız veya yanıt olumsuzsa, Sivil Havacılık Genel Müdürlüğü'ne (SHGM) şikayet edebilirsiniz.

### 3. Tüketici Hakem Heyeti
10.000 TL'ye kadar olan talepler için Tüketici Hakem Heyeti'ne başvurabilirsiniz.

### 4. Tüketici Mahkemesi
10.000 TL üzeri talepler için Tüketici Mahkemesi'ne dava açabilirsiniz.

## Zaman Aşımı

Tazminat talepleri için **3 yıllık** zaman aşımı süresi vardır. Bu süre, uçuş tarihinden itibaren başlar.`;

const post3Content = `## Uçuş İptali Durumunda Haklarınız

Uçuşunuzun iptal edilmesi sinir bozucu bir deneyim olabilir, ancak yasal haklarınızı bilmek bu durumu avantaja çevirebilir. SHY-YOLCU Yönetmeliği kapsamında önemli haklara sahipsiniz.

## İptal Durumunda Temel Haklarınız

### 1. Bilet İadesi veya Alternatif Uçuş

Uçuşunuz iptal edildiğinde havayolu size iki seçenek sunmak zorundadır:

**Seçenek 1: Tam İade**
- Bilet ücretinin 7 gün içinde iadesi
- Kullanılmayan uçuş segmentleri için tam iade
- Ödeme yaptığınız yöntemle iade

**Seçenek 2: Alternatif Uçuş**
- En kısa sürede varış noktasına ulaşım
- Farklı bir tarihte uçuş (tercihinize göre)
- Gerekirse farklı havayolu ile uçuş

### 2. Bakım ve İkram

İptal sonrası beklerken:
- Ücretsiz yiyecek ve içecek
- İki adet ücretsiz iletişim (telefon, e-posta)
- Gerekirse otel konaklaması
- Havalimanı-otel transferi

### 3. Maddi Tazminat

İptal **14 günden az süre önce** bildirilmişse tazminat hakkınız doğar:

| Mesafe | Tazminat |
|--------|----------|
| 1500 km'ye kadar | 250 EUR |
| 1500 - 3500 km | 400 EUR |
| 3500 km üzeri | 600 EUR |

## Tazminat Alamayacağınız Durumlar

### Olağanüstü Koşullar
- Şiddetli hava koşulları
- Güvenlik tehditleri
- Havalimanı grevleri
- Doğal afetler

### Erken Bildirim
Havayolu size **14 gün veya daha önce** iptal bildirimi yaptıysa tazminat hakkınız düşer.

### Alternatif Uçuş Koşulları
Havayolu size alternatif uçuş sunmuş ve bu uçuş:
- Orijinal kalkıştan en fazla 2 saat önce kalktıysa
- Orijinal varıştan en fazla 4 saat sonra indiyse

Bu durumda tazminat %50 oranında azaltılabilir.

## İptal Durumunda Yapmanız Gerekenler

### 1. Belgeleri Saklayın
- İptal bildirimi
- Yeni bilet/biniş kartı
- Harcama makbuzları
- Havayolu ile yazışmalar

### 2. Harcamalarınızı Belgeleyin
İptal nedeniyle yaptığınız ek harcamaları (yemek, konaklama, ulaşım) makbuzlarıyla belgeleyin.

### 3. Havayolundan Yazılı Açıklama İsteyin
İptal nedenini yazılı olarak isteyin. Bu, tazminat talebinizde önemli bir delil olacaktır.

### 4. Profesyonel Destek Alın
Havayolları genellikle tazminat taleplerini reddetmeye çalışır. UçuşTazminat gibi uzman platformlar, haklarınızı almanızda size yardımcı olur.`;

const post4Content = `## Uçuşunuz Geciktiğinde İlk Yapmanız Gerekenler

Uçuş gecikmesi stresli bir durum olabilir, ancak sakin kalıp doğru adımları atarsanız hem haklarınızı korur hem de tazminat alabilirsiniz.

## Havalimanında Yapmanız Gerekenler

### 1. Gecikme Süresini Takip Edin
- Planlanan kalkış saatini not edin
- Gerçek kalkış saatini kaydedin
- Varış saatini de mutlaka not edin (tazminat varış gecikmesine göre hesaplanır)

### 2. Havayolundan Bilgi Alın
- Gecikme nedenini sorun
- Yazılı açıklama isteyin
- Tahmini kalkış saatini öğrenin

### 3. Haklarınızı Kullanın

**2 saat ve üzeri gecikme:**
- Ücretsiz yiyecek ve içecek talep edin
- İki adet ücretsiz iletişim hakkınızı kullanın

**4 saat ve üzeri gecikme:**
- Otel konaklaması talep edin (gece gecikmelerinde)
- Transfer hizmeti isteyin

**5 saat ve üzeri gecikme:**
- Bilet iadesi isteyebilirsiniz
- Alternatif uçuş talep edebilirsiniz

### 4. Belgeleri Toplayın
- Biniş kartınızı saklayın
- Gecikme anonslarının fotoğrafını çekin
- Harcama makbuzlarını alın
- Havayolu personelinin isimlerini not edin

## Gecikme Tazminatı Hesaplama

Varış noktasına **3 saat veya daha fazla** gecikmeyle ulaştıysanız tazminat hakkınız doğar:

| Mesafe | Tazminat |
|--------|----------|
| 1500 km'ye kadar | 250 EUR |
| 1500 - 3500 km | 400 EUR |
| 3500 km üzeri | 600 EUR |

## Aktarmalı Uçuşlarda Gecikme

Aktarmalı uçuşlarda gecikme hesaplaması farklıdır:

- İlk uçuşun gecikmesi nedeniyle aktarmayı kaçırdıysanız
- Tüm yolculuk tek bilet üzerindeyse
- Final varış noktasına 3+ saat gecikmeyle ulaştıysanız

**Tazminat hakkınız vardır!**

## Tazminat Alamayacağınız Durumlar

### Olağanüstü Koşullar
- Şiddetli hava koşulları (fırtına, yoğun sis)
- Güvenlik tehditleri
- Grevler (havalimanı, hava trafik kontrolü)
- Kuş çarpması

### Dikkat!
**Teknik arıza** olağanüstü koşul sayılmaz. Havayolu "teknik arıza" dese bile tazminat hakkınız vardır.

## Uçuş Sonrası Yapmanız Gerekenler

### 1. Gecikmeyi Doğrulayın
FlightRadar24 veya FlightAware gibi sitelerden uçuşunuzun gerçek saatlerini kontrol edin.

### 2. Belgeleri Düzenleyin
- Tüm belgeleri bir dosyada toplayın
- Dijital kopyalarını alın
- Harcama makbuzlarını saklayın

### 3. Tazminat Başvurusu Yapın
- Havayoluna doğrudan başvurabilirsiniz (genellikle reddedilir)
- UçuşTazminat gibi uzman platformlara başvurabilirsiniz

## Neden Profesyonel Destek Almalısınız?

Havayolları tazminat taleplerini reddetme konusunda uzmanlaşmıştır:
- "Olağanüstü koşul" bahanesi
- Bürokratik engeller
- Yanıt vermeme taktiği

UçuşTazminat olarak:
- Havayolu ile tüm iletişimi biz yürütürüz
- Gerekirse hukuki süreç başlatırız
- **Kazanamazsak ücret almayız**

**Unutmayın:** 3 yıla kadar geriye dönük başvuru yapabilirsiniz.`;

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "ucus-tazminati-nasil-alinir",
    title: "Uçuş Tazminatı Nasıl Alınır? Adım Adım Rehber",
    excerpt: "Geciken veya iptal edilen uçuşunuz için tazminat alma sürecini detaylı olarak anlattığımız kapsamlı rehberimiz.",
    category: "Rehber",
    tags: ["tazminat", "uçuş gecikme", "yolcu hakları"],
    author: "UçuşTazminat Ekibi",
    publishedAt: "2026-01-15",
    readTime: 8,
    content: post1Content
  },
  {
    id: "2",
    slug: "shy-yolcu-yonetmeligi-nedir",
    title: "SHY-YOLCU Yönetmeliği Nedir? Yolcu Hakları Rehberi",
    excerpt: "Türkiye'de yolcu haklarını düzenleyen SHY-YOLCU Yönetmeliği hakkında bilmeniz gereken her şey.",
    category: "Yasal",
    tags: ["SHY-YOLCU", "yönetmelik", "yolcu hakları", "SHGM"],
    author: "UçuşTazminat Ekibi",
    publishedAt: "2026-01-10",
    readTime: 10,
    content: post2Content
  },
  {
    id: "3",
    slug: "ucus-iptali-tazminat-haklari",
    title: "Uçuş İptali Tazminat Hakları: Bilmeniz Gereken Her Şey",
    excerpt: "Uçuşunuz iptal mi edildi? Tazminat haklarınızı ve başvuru sürecini öğrenin.",
    category: "Rehber",
    tags: ["uçuş iptali", "tazminat", "yolcu hakları"],
    author: "UçuşTazminat Ekibi",
    publishedAt: "2026-01-05",
    readTime: 6,
    content: post3Content
  },
  {
    id: "4",
    slug: "geciken-ucus-icin-ne-yapmali",
    title: "Geciken Uçuş İçin Ne Yapmalı? Pratik Rehber",
    excerpt: "Uçuşunuz geciktiğinde yapmanız gerekenler ve haklarınız hakkında pratik bilgiler.",
    category: "Rehber",
    tags: ["uçuş gecikme", "yolcu hakları", "tazminat"],
    author: "UçuşTazminat Ekibi",
    publishedAt: "2026-01-01",
    readTime: 5,
    content: post4Content
  }
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find(post => post.slug === slug);
}

export function getAllBlogPosts(): BlogPost[] {
  return blogPosts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getBlogPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter(post => post.category === category);
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
  return blogPosts.filter(post => post.tags.includes(tag));
}
