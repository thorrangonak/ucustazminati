import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, ArrowLeft, ArrowRight, User, Share2, Facebook, Twitter, Linkedin } from 'lucide-react'
import prisma from '@/lib/prisma'

// Static blog content
const blogContent: Record<string, {
  title: string
  excerpt: string
  content: string
  category: string
  authorName: string
  publishedAt: string
  readTime: number
  tags: string[]
}> = {
  'ucus-gecikme-tazminati-nasil-alinir': {
    title: 'Uçuş Gecikme Tazminatı Nasıl Alınır? Adım Adım Rehber',
    excerpt: 'Uçuşunuz gecikti mi? 3 saatten fazla gecikmelerde 250€ ile 600€ arasında tazminat hakkınız olabilir.',
    content: `
## Uçuş Gecikme Tazminatı Nedir?

Uçuş gecikme tazminatı, AB EC 261/2004 yönetmeliği kapsamında, uçuşları önemli ölçüde geciken yolculara ödenen bir tazminattır. Bu tazminat, bilet fiyatından bağımsız olarak belirlenir ve uçuş mesafesine göre 250€ ile 600€ arasında değişir.

## Kimler Tazminat Alabilir?

Aşağıdaki koşulları sağlayan yolcular tazminat talep edebilir:

- **3 saatten fazla gecikme**: Varış noktasına planlanan saatten en az 3 saat sonra ulaşılması
- **AB kalkışlı veya AB havayolu**: Uçuş AB'den kalkıyor veya AB kayıtlı bir havayolu tarafından gerçekleştiriliyor olmalı
- **Havayolu kusuru**: Gecikme "olağanüstü koşullar" dışında bir nedenle meydana gelmiş olmalı
- **Son 6 yıl içinde**: Talep, gecikme tarihinden itibaren 6 yıl içinde yapılmalı

## Tazminat Miktarları

| Uçuş Mesafesi | Tazminat Miktarı |
|---------------|------------------|
| 1500 km'ye kadar | 250€ |
| 1500-3500 km arası | 400€ |
| 3500 km üzeri | 600€ |

## Adım Adım Tazminat Başvurusu

### 1. Belgeleri Toplayın
- Biniş kartınız
- Bilet/rezervasyon onayı
- Gecikme süresini gösteren kanıtlar

### 2. Gecikmeyi Belgeleyin
- Havalimanı ekranlarının fotoğrafını çekin
- Uçuşun gerçek kalkış ve iniş saatlerini not edin

### 3. Başvuru Yapın
UçuşTazminat üzerinden ücretsiz başvuru yapabilirsiniz. Biz sizin adınıza havayolu ile iletişime geçer, gerekirse yasal süreç başlatırız.

## Olağanüstü Koşullar Nelerdir?

Havayolları aşağıdaki durumlarda tazminat ödemekten muaf tutulabilir:
- Hava koşulları (fırtına, sis vb.)
- Havalimanı grevleri
- Güvenlik tehditleri
- Politik istikrarsızlık

**Önemli**: Teknik arızalar genellikle olağanüstü koşul sayılmaz!

## Başvurunuz Reddedilirse?

Havayolu başvurunuzu reddederse:
1. Ret gerekçesini yazılı isteyin
2. Bize başvurun, yasal süreç başlatalım
3. Hakkınız varsa mutlaka alırsınız

---

*Bu makale genel bilgi amaçlıdır. Spesifik durumunuz için ücretsiz değerlendirme talep edin.*
    `,
    category: 'Yolcu Hakları',
    authorName: 'UçuşTazminat Ekibi',
    publishedAt: '2026-01-15',
    readTime: 8,
    tags: ['tazminat', 'gecikme', 'yolcu hakları', 'EC 261'],
  },
  'ec-261-2004-yonetmeligi-nedir': {
    title: 'EC 261/2004 Yönetmeliği Nedir? Yolcu Haklarınızı Bilin',
    excerpt: 'Avrupa Birliği\'nin EC 261/2004 yönetmeliği, uçuş aksaklıklarında yolcuları koruyan en kapsamlı düzenlemedir.',
    content: `
## EC 261/2004 Yönetmeliği Hakkında

EC 261/2004, Avrupa Birliği tarafından 2004 yılında yürürlüğe giren ve hava yolcu haklarını düzenleyen yönetmeliktir. Bu yönetmelik, uçuş iptalleri, gecikmeler ve uçağa alınmama durumlarında yolcuların haklarını güvence altına alır.

## Yönetmelik Kimlere Uygulanır?

EC 261/2004 şu durumlarda geçerlidir:

1. **AB'den kalkan tüm uçuşlar** (havayolunun kayıtlı olduğu ülkeden bağımsız)
2. **AB'ye inen uçuşlar** (sadece AB kayıtlı havayolları için)

## Temel Haklar

### 1. Bilgilendirilme Hakkı
Havayolları, gecikme veya iptal durumunda yolcuları haklarıyla ilgili yazılı olarak bilgilendirmek zorundadır.

### 2. Bakım Hakkı
Uzun gecikmelerde:
- 2+ saat (kısa mesafe): Yiyecek ve içecek
- 3+ saat: Ücretsiz telefon görüşmesi
- Gecelik bekleme: Otel konaklaması ve ulaşım

### 3. Tazminat Hakkı
- 3+ saat gecikme
- 14 günden az süre kala bildirilen iptaller
- Overbooking nedeniyle uçağa alınmama

## Tazminat Tablosu

| Mesafe | Tazminat |
|--------|----------|
| ≤1500 km | 250€ |
| 1500-3500 km | 400€ |
| >3500 km | 600€ |

## İstisnalar

Havayolu şu durumlarda tazminat ödemekten muaf olabilir:
- Olağanüstü koşullar (hava durumu, grev, güvenlik)
- 14+ gün önceden bildirilen iptaller
- Alternatif uçuş sunulan ve belirli kriterleri karşılayan durumlar

---

*Haklarınız konusunda sorularınız mı var? Ücretsiz danışın.*
    `,
    category: 'Mevzuat',
    authorName: 'UçuşTazminat Ekibi',
    publishedAt: '2026-01-10',
    readTime: 12,
    tags: ['EC 261', 'mevzuat', 'yolcu hakları', 'Avrupa Birliği'],
  },
  'ucus-iptal-edildiginde-ne-yapilmali': {
    title: 'Uçuşunuz İptal Edildiğinde Ne Yapmalısınız?',
    excerpt: 'Uçuş iptali durumunda panik yapmayın! Bu rehberde iptal durumunda haklarınızı ve yapmanız gerekenleri adım adım anlatıyoruz.',
    content: `
## Uçuş İptali Durumunda İlk Adımlar

Uçuşunuzun iptal edildiğini öğrendiğinizde sakin olun ve şu adımları izleyin:

### 1. Havayolu Temsilcisine Ulaşın
- İptal nedenini yazılı olarak isteyin
- Alternatif uçuş seçeneklerini sorun
- Bakım haklarınızı (yemek, konaklama) talep edin

### 2. Belgelerinizi Saklayın
- Tüm uçuş belgelerinizi
- İptal bildirimi ve yazışmaları
- Ekstra harcama fişlerini

## Haklarınız Nelerdir?

### Yeniden Yönlendirme veya İade
Uçuşunuz iptal edildiğinde şunlardan birini seçebilirsiniz:
- En kısa sürede alternatif uçuş
- Daha sonraki bir tarihte uçuş
- Bilet ücretinin tam iadesi

### Bakım Hakkı
Bekleme süresinde:
- Yiyecek ve içecek
- Otel konaklaması (gerekirse)
- Havalimanı-otel transferi
- İletişim imkanı

### Para Tazminatı
14 günden az süre kala bildirilen iptallerde:
- 250€ - 600€ arası tazminat

## Ne Zaman Tazminat Alamazsınız?

- İptal 14+ gün önce bildirilmişse
- Olağanüstü koşullar nedeniyle iptal olduysa
- Uygun alternatif uçuş sunulduysa

## Pratik İpuçları

1. **Fotoğraf çekin**: Havalimanı panolarını, kuyrukları
2. **Zaman notları tutun**: Her şeyi saatiyle kaydedin
3. **İletişimi yazılı yapın**: SMS, email tercih edin
4. **Masrafları belgeleyin**: Fişleri saklayın

---

*İptal edilen uçuşunuz için tazminat hakkınızı kontrol edin.*
    `,
    category: 'Yolcu Hakları',
    authorName: 'UçuşTazminat Ekibi',
    publishedAt: '2026-01-05',
    readTime: 6,
    tags: ['iptal', 'uçuş iptali', 'yolcu hakları', 'tazminat'],
  },
}

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = blogContent[slug]

  if (!post) {
    return {
      title: 'Yazı Bulunamadı | UçuşTazminat',
    }
  }

  return {
    title: `${post.title} | UçuşTazminat Blog`,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.authorName }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: 'tr_TR',
      url: `https://ucustazminat.com/blog/${slug}`,
      publishedTime: post.publishedAt,
      authors: [post.authorName],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
    },
    alternates: {
      canonical: `https://ucustazminat.com/blog/${slug}`,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = blogContent[slug]

  if (!post) {
    notFound()
  }

  const relatedPosts = Object.entries(blogContent)
    .filter(([key]) => key !== slug)
    .slice(0, 3)
    .map(([key, value]) => ({ slug: key, ...value }))

  return (
    <article className="min-h-screen">
      {/* Hero */}
      <header className="bg-gradient-to-b from-primary/5 to-white py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Button variant="ghost" asChild className="mb-6">
              <Link href="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Tüm Yazılar
              </Link>
            </Button>

            <Badge className="mb-4">{post.category}</Badge>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground mb-6">
              {post.excerpt}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.authorName}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readTime} dakika okuma
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div
              className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
              dangerouslySetInnerHTML={{
                __html: post.content
                  .split('\n\n')
                  .map(block => {
                    if (block.startsWith('## ')) return `<h2>${block.slice(3)}</h2>`
                    if (block.startsWith('### ')) return `<h3>${block.slice(4)}</h3>`
                    if (block.includes('| ')) return `<div class="overflow-x-auto">${block}</div>`
                    if (block.startsWith('- ')) {
                      const items = block.split('\n').map(line =>
                        line.startsWith('- ') ? `<li>${line.slice(2)}</li>` : line
                      ).join('')
                      return `<ul>${items}</ul>`
                    }
                    return `<p>${block
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    }</p>`
                  })
                  .join('')
              }}
            />

            {/* Tags */}
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm font-medium mb-2">Etiketler:</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="mt-8 pt-8 border-t">
              <p className="text-sm font-medium mb-4">Bu yazıyı paylaşın:</p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=https://ucustazminat.com/blog/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook'ta paylaş"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                    </svg>
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://twitter.com/intent/tweet?url=https://ucustazminat.com/blog/${slug}&text=${encodeURIComponent(post.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter'da paylaş"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.44 4.83c-.8.37-1.5.38-2.22.02.93-.56.98-.96 1.32-2.02-.88.52-1.86.9-2.9 1.1-.82-.88-2-1.43-3.3-1.43-2.5 0-4.55 2.04-4.55 4.54 0 .36.03.7.1 1.04-3.77-.2-7.12-2-9.36-4.75-.4.67-.6 1.45-.6 2.3 0 1.56.8 2.95 2 3.77-.74-.03-1.44-.23-2.05-.57v.06c0 2.2 1.56 4.03 3.64 4.44-.67.2-1.37.2-2.06.08.58 1.8 2.26 3.12 4.25 3.16C5.78 18.1 3.37 18.74 1 18.46c2 1.3 4.4 2.04 6.97 2.04 8.35 0 12.92-6.92 12.92-12.93 0-.2 0-.4-.02-.6.9-.63 1.96-1.22 2.56-2.14z"/>
                    </svg>
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a
                    href={`https://www.linkedin.com/shareArticle?mini=true&url=https://ucustazminat.com/blog/${slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn'de paylaş"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">
                Uçuşunuzda Sorun mu Yaşadınız?
              </h2>
              <p className="text-muted-foreground mb-6">
                Gecikme veya iptal durumunda 600€'ya kadar tazminat alabilirsiniz.
                Ücretsiz kontrol edin!
              </p>
              <Button size="lg" asChild>
                <Link href="/tazminat-hesapla">
                  Tazminat Hesapla
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Related Posts */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">İlgili Yazılar</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {relatedPosts.map((related) => (
              <Card key={related.slug} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3">{related.category}</Badge>
                  <h3 className="font-bold mb-2 line-clamp-2">
                    <Link href={`/blog/${related.slug}`} className="hover:text-primary transition-colors">
                      {related.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {related.excerpt}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            author: {
              '@type': 'Organization',
              name: post.authorName,
            },
            publisher: {
              '@type': 'Organization',
              name: 'UçuşTazminat',
              logo: {
                '@type': 'ImageObject',
                url: 'https://ucustazminat.com/logo.png',
              },
            },
            datePublished: post.publishedAt,
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://ucustazminat.com/blog/${slug}`,
            },
          }),
        }}
      />
    </article>
  )
}

export async function generateStaticParams() {
  return Object.keys(blogContent).map((slug) => ({ slug }))
}
