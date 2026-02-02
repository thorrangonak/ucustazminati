import { Link, useParams } from "wouter";
import { SEOHead } from "@/components/SEOHead";
import { trpc } from "@/lib/trpc";
import { getBlogPostBySlug as getStaticBlogPost, getAllBlogPosts as getStaticBlogPosts } from "@/data/blogPosts";
import { Calendar, Clock, ArrowLeft, ArrowRight, ChevronRight, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

export default function BlogPost() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  
  // Veritabanından blog yazısını çek
  const { data: dbPost, isLoading, error } = trpc.blog.getBySlug.useQuery(
    { slug },
    { 
      enabled: !!slug,
      retry: false // Hata durumunda statik içeriğe düşmek için
    }
  );
  
  // Statik blog yazısı (fallback)
  const staticPost = getStaticBlogPost(slug);
  const allStaticPosts = getStaticBlogPosts();
  
  // Veritabanından gelen yazı varsa onu, yoksa statik yazıyı kullan
  const post = dbPost ? {
    id: dbPost.id.toString(),
    slug: dbPost.slug,
    title: dbPost.title,
    excerpt: dbPost.excerpt || '',
    content: dbPost.content,
    category: dbPost.category || 'Rehber',
    author: dbPost.authorName || 'UçuşTazminat Ekibi',
    publishedAt: dbPost.publishedAt ? new Date(dbPost.publishedAt).toISOString() : new Date().toISOString(),
    readTime: dbPost.readingTime || 5,
    tags: dbPost.tags || [],
  } : staticPost;
  
  // Get related posts (same category, excluding current)
  const relatedPosts = allStaticPosts
    .filter(p => p.id !== post?.id && p.category === post?.category)
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary animate-pulse" />
          <span className="text-lg font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Makale Bulunamadı</h1>
          <p className="text-muted-foreground mb-8">Aradığınız makale mevcut değil veya kaldırılmış olabilir.</p>
          <Link href="/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Blog'a Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEOHead 
        title={post.title}
        description={post.excerpt}
        canonical={`/blog/${post.slug}`}
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

      {/* Breadcrumb */}
      <div className="border-b border-foreground/10">
        <div className="container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>
      </div>

      {/* Article */}
      <article className="py-12 sm:py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            {/* Category */}
            <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-6">
              {post.category}
            </span>
            
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              {post.title}
            </h1>
            
            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-muted-foreground mb-8 pb-8 border-b border-foreground/10">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{new Date(post.publishedAt).toLocaleDateString('tr-TR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.readTime} dakika okuma</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-ul:text-muted-foreground prose-ol:text-muted-foreground prose-li:marker:text-primary prose-table:border prose-th:bg-secondary prose-th:p-3 prose-td:p-3 prose-td:border prose-th:border">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
            
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-foreground/10">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  {post.tags.map((tag: string) => (
                    <span 
                      key={tag}
                      className="px-3 py-1 text-xs bg-secondary text-muted-foreground rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* CTA */}
            <div className="mt-12 p-6 sm:p-8 bg-primary/5 border border-primary/20 rounded-lg">
              <h3 className="text-xl font-bold mb-3">Tazminat Hakkınızı Öğrenin</h3>
              <p className="text-muted-foreground mb-6">
                Uçuşunuz gecikti veya iptal mi edildi? Hemen kontrol edin ve hak ettiğiniz tazminatı alın. 
                Kazanamazsak ücret yok!
              </p>
              <Link href="/#hesapla">
                <Button className="bg-primary hover:bg-primary/90">
                  Tazminatımı Hesapla
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-12 sm:py-16 bg-secondary/30 border-t border-foreground/10">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">İlgili Makaleler</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link 
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="group bg-background border border-border rounded-lg p-6 hover:shadow-lg transition-all"
                >
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full mb-4">
                    {relatedPost.category}
                  </span>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                    {relatedPost.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {relatedPost.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Blog */}
      <div className="py-8 border-t border-foreground/10">
        <div className="container">
          <Link 
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Tüm Makalelere Dön
          </Link>
        </div>
      </div>

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
