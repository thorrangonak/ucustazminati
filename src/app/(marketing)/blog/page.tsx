import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight, User, Search } from 'lucide-react'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Blog | Uçuş Tazminat Rehberi | UçuşTazminat',
  description: 'Uçuş gecikmeleri, iptaller ve yolcu hakları hakkında bilgilendirici makaleler. EC 261/2004 ve SHY-YOLCU düzenlemeleri ile tazminat haklarınızı öğrenin.',
  keywords: ['uçuş tazminat', 'yolcu hakları', 'uçuş gecikme', 'uçuş iptal', 'EC 261', 'SHY-YOLCU', 'havayolu tazminat'],
  openGraph: {
    title: 'Blog | Uçuş Tazminat Rehberi | UçuşTazminat',
    description: 'Uçuş gecikmeleri, iptaller ve yolcu hakları hakkında bilgilendirici makaleler.',
    type: 'website',
    locale: 'tr_TR',
    url: 'https://ucustazminat.com/blog',
  },
  alternates: {
    canonical: 'https://ucustazminat.com/blog',
  },
}

async function getBlogPosts() {
  try {
    const posts = await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    })
    return posts
  } catch (error) {
    return []
  }
}

// Static blog posts for initial content
const staticPosts = [
  {
    id: '1',
    slug: 'ucus-gecikme-tazminati-nasil-alinir',
    title: 'Uçuş Gecikme Tazminatı Nasıl Alınır? Adım Adım Rehber',
    excerpt: 'Uçuşunuz gecikti mi? 3 saatten fazla gecikmelerde 250€ ile 600€ arasında tazminat hakkınız olabilir. Bu rehberde tazminat alma sürecini adım adım anlatıyoruz.',
    coverImage: '/images/blog/delay-compensation.jpg',
    category: 'Yolcu Hakları',
    authorName: 'UçuşTazminat Ekibi',
    publishedAt: '2026-01-15',
    readTime: 8,
  },
  {
    id: '2',
    slug: 'ec-261-2004-yonetmeligi-nedir',
    title: 'EC 261/2004 Yönetmeliği Nedir? Yolcu Haklarınızı Bilin',
    excerpt: 'Avrupa Birliği\'nin EC 261/2004 yönetmeliği, uçuş aksaklıklarında yolcuları koruyan en kapsamlı düzenlemedir. Bu makalede haklarınızı detaylı açıklıyoruz.',
    coverImage: '/images/blog/ec261.jpg',
    category: 'Mevzuat',
    authorName: 'UçuşTazminat Ekibi',
    publishedAt: '2026-01-10',
    readTime: 12,
  },
  {
    id: '3',
    slug: 'ucus-iptal-edildiginde-ne-yapilmali',
    title: 'Uçuşunuz İptal Edildiğinde Ne Yapmalısınız?',
    excerpt: 'Uçuş iptali durumunda panik yapmayın! Bu rehberde iptal durumunda haklarınızı ve yapmanız gerekenleri adım adım anlatıyoruz.',
    coverImage: '/images/blog/cancellation.jpg',
    category: 'Yolcu Hakları',
    authorName: 'UçuşTazminat Ekibi',
    publishedAt: '2026-01-05',
    readTime: 6,
  },
  {
    id: '4',
    slug: 'shy-yolcu-turkiye-hava-yolcu-haklari',
    title: 'SHY-YOLCU: Türkiye\'de Hava Yolcu Hakları Rehberi',
    excerpt: 'Türkiye\'deki uçuşlarınız için geçerli olan SHY-YOLCU düzenlemesini ve tazminat haklarınızı bu kapsamlı rehberde öğrenin.',
    coverImage: '/images/blog/shy-yolcu.jpg',
    category: 'Mevzuat',
    authorName: 'UçuşTazminat Ekibi',
    publishedAt: '2025-12-28',
    readTime: 10,
  },
  {
    id: '5',
    slug: 'havayolu-tazminat-basvurusu-reddedilirse',
    title: 'Havayolu Tazminat Başvurunuzu Reddederse Ne Yapmalısınız?',
    excerpt: 'Havayolu şirketi tazminat talebinizi reddetti mi? Pes etmeyin! Bu makalede itiraz sürecini ve alternatif çözüm yollarını anlatıyoruz.',
    coverImage: '/images/blog/rejected-claim.jpg',
    category: 'Hukuki Süreç',
    authorName: 'UçuşTazminat Ekibi',
    publishedAt: '2025-12-20',
    readTime: 7,
  },
  {
    id: '6',
    slug: 'olaganustu-kosullar-tazminat-engeller-mi',
    title: 'Olağanüstü Koşullar Tazminat Hakkınızı Engeller mi?',
    excerpt: 'Havayolları sıklıkla "olağanüstü koşullar" bahanesiyle tazminat ödemekten kaçınır. Hangi durumlar gerçekten olağanüstü sayılır?',
    coverImage: '/images/blog/extraordinary.jpg',
    category: 'Yolcu Hakları',
    authorName: 'UçuşTazminat Ekibi',
    publishedAt: '2025-12-15',
    readTime: 9,
  },
]

export default async function BlogPage() {
  const dbPosts = await getBlogPosts()
  const posts = dbPosts.length > 0 ? dbPosts : staticPosts

  const categories = [...new Set(staticPosts.map(p => p.category))]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Uçuş Tazminat <span className="text-primary">Rehberi</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Yolcu hakları, uçuş gecikmeleri ve tazminat süreçleri hakkında
              bilmeniz gereken her şey
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map(cat => (
                <Badge key={cat} variant="secondary" className="px-4 py-2">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-8 md:p-12 flex items-center">
                <div className="w-full h-48 md:h-full bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-6xl">✈️</span>
                </div>
              </div>
              <CardContent className="p-8 md:p-12">
                <Badge className="mb-4">{staticPosts[0].category}</Badge>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  <Link href={`/blog/${staticPosts[0].slug}`} className="hover:text-primary transition-colors">
                    {staticPosts[0].title}
                  </Link>
                </h2>
                <p className="text-muted-foreground mb-6">
                  {staticPosts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {staticPosts[0].authorName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(staticPosts[0].publishedAt).toLocaleDateString('tr-TR')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {staticPosts[0].readTime} dk okuma
                  </span>
                </div>
                <Button asChild>
                  <Link href={`/blog/${staticPosts[0].slug}`}>
                    Devamını Oku
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </div>
          </Card>
        </div>
      </section>

      {/* All Posts */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-8">Tüm Yazılar</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staticPosts.slice(1).map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <span className="text-4xl">📄</span>
                </div>
                <CardContent className="p-6">
                  <Badge variant="outline" className="mb-3">{post.category}</Badge>
                  <h3 className="font-bold mb-2 line-clamp-2">
                    <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime} dk
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Uçuşunuzda Sorun mu Yaşadınız?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Gecikme veya iptal durumunda 600€'ya kadar tazminat alabilirsiniz.
            Hemen ücretsiz kontrol edin!
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/tazminat-hesapla">
              Tazminat Hesapla
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto prose prose-lg">
            <h2>Uçuş Tazminatı Hakkında Sık Sorulan Sorular</h2>
            <p>
              Uçuş gecikmeleri ve iptalleri her yıl milyonlarca yolcuyu etkiliyor.
              Avrupa Birliği'nin EC 261/2004 yönetmeliği ve Türkiye'nin SHY-YOLCU
              düzenlemesi sayesinde, bu aksaklıklardan etkilenen yolcular tazminat
              talep edebilir.
            </p>
            <h3>Hangi Durumlarda Tazminat Alabilirsiniz?</h3>
            <ul>
              <li>Uçuşunuz 3 saatten fazla geciktiyse</li>
              <li>Uçuşunuz iptal edildiyse (14 günden az süre kala bildirilmişse)</li>
              <li>Overbooking nedeniyle uçağa alınmadıysanız</li>
              <li>Bağlantılı uçuşunuzu kaçırdıysanız</li>
            </ul>
            <h3>Ne Kadar Tazminat Alabilirsiniz?</h3>
            <p>
              Tazminat miktarı uçuş mesafesine göre belirlenir: İç hat uçuşlarında 100€,
              1500 km'ye kadar 250€, 1500-3500 km arası 400€ ve 3500 km üzeri
              uçuşlarda 600€'ya kadar tazminat alabilirsiniz.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
