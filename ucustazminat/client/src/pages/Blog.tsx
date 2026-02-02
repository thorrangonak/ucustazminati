import { Link } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { getAllBlogPosts as getStaticBlogPosts } from "@/data/blogPosts";
import { Calendar, Clock, ArrowRight, ChevronRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Blog() {
  // Veritabanından blog yazılarını çek
  const { data: dbPosts, isLoading } = trpc.blog.list.useQuery({ limit: 50 });
  
  // Statik blog yazıları (fallback)
  const staticPosts = getStaticBlogPosts();
  
  // Veritabanından gelen yazıları format'la
  const formattedDbPosts = (dbPosts || []).map(post => ({
    id: `db-${post.id}`,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || '',
    category: post.category || 'Rehber',
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : new Date().toISOString(),
    readTime: post.readingTime || 5,
    isFromDb: true,
  }));
  
  // Statik yazıları format'la
  const formattedStaticPosts = staticPosts.map(post => ({
    ...post,
    isFromDb: false,
  }));
  
  // Veritabanı ve statik içerikleri birleştir (veritabanı önce)
  // Aynı slug'a sahip yazılar varsa veritabanındakini tercih et
  const dbSlugs = new Set(formattedDbPosts.map(p => p.slug));
  const uniqueStaticPosts = formattedStaticPosts.filter(p => !dbSlugs.has(p.slug));
  const posts = [...formattedDbPosts, ...uniqueStaticPosts];

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title="Blog | Uçuş Tazminatı Rehberleri ve Bilgiler"
        description="Uçuş tazminatı, yolcu hakları, SHY-YOLCU yönetmeliği ve daha fazlası hakkında bilgilendirici makaleler."
        canonical="/blog"
      />
      
      {/* Header */}
      <header className="border-b border-foreground/10 bg-background sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary" />
            <span className="font-bold text-lg sm:text-xl tracking-tight">UçuşTazminat</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            <Link href="/#hesapla" className="text-sm font-medium hover:text-primary transition-colors">
              Tazminat Hesapla
            </Link>
            <Link href="/#nasil-calisir" className="text-sm font-medium hover:text-primary transition-colors">
              Nasıl Çalışır
            </Link>
            <Link href="/#tazminat" className="text-sm font-medium hover:text-primary transition-colors">
              Tazminat Miktarları
            </Link>
            <Link href="/#sss" className="text-sm font-medium hover:text-primary transition-colors">
              SSS
            </Link>
            <Link href="/blog" className="text-sm font-medium text-primary">
              Blog
            </Link>
          </nav>
          
          <Link href="/dashboard">
            <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-xs sm:text-sm">
              Panelim
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 md:py-20 border-b border-foreground/10">
        <div className="container">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <div className="w-2 h-2 bg-primary" />
              <span className="text-xs sm:text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Blog
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Uçuş Tazminatı
              <br />
              <span className="relative inline-block">
                Rehberleri
                <span className="absolute -bottom-1 sm:-bottom-2 left-0 w-full h-0.5 sm:h-1 bg-primary" />
              </span>
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              Yolcu haklarınız, tazminat süreçleri ve SHY-YOLCU yönetmeliği hakkında 
              bilmeniz gereken her şey.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="container">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-background border border-border rounded-lg overflow-hidden animate-pulse">
                  <div className="p-6">
                    <div className="h-6 w-20 bg-muted rounded-full mb-4" />
                    <div className="h-6 w-full bg-muted rounded mb-3" />
                    <div className="h-4 w-3/4 bg-muted rounded mb-4" />
                    <div className="h-4 w-1/2 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {posts.map((post) => (
                <article 
                  key={post.id}
                  className="group bg-background border border-border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Category Badge */}
                  <div className="p-4 sm:p-6 pb-0">
                    <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                      {post.category}
                    </span>
                  </div>
                  
                  {/* Content */}
                  <div className="p-4 sm:p-6">
                    <Link href={`/blog/${post.slug}`}>
                      <h2 className="text-lg sm:text-xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h2>
                    </Link>
                    
                    <p className="text-muted-foreground text-sm sm:text-base mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.publishedAt).toLocaleDateString('tr-TR', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime} dk okuma</span>
                      </div>
                    </div>
                    
                    {/* Read More Link */}
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                    >
                      Devamını Oku
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-foreground text-background">
        <div className="container text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-6 text-primary" />
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-background mb-4">
            Tazminat Hakkınızı Öğrenin
          </h2>
          <p className="text-background/70 mb-8 max-w-lg mx-auto">
            Uçuşunuz gecikti veya iptal mi edildi? Hemen kontrol edin ve hak ettiğiniz tazminatı alın.
          </p>
          <Link href="/#hesapla">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Tazminatımı Hesapla
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 border-t border-foreground/10">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary" />
              <span className="font-bold">UçuşTazminat</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
              <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
              <Link href="/terms" className="hover:text-foreground transition-colors">Kullanım Koşulları</Link>
              <Link href="/privacy" className="hover:text-foreground transition-colors">Gizlilik</Link>
            </div>
          </div>
          <div className="text-center text-xs text-muted-foreground mt-6">
            © 2026 UçuşTazminat. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  );
}
