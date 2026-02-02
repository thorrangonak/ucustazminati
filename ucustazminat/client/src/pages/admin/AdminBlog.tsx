import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { SEOHead, SEO_CONFIG } from "@/components/SEOHead";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Eye, 
  Search,
  FileText,
  Calendar,
  User,
  Users,
  BarChart3,
  LayoutDashboard,
  Plane as PlaneIcon,
  LogOut,
  Menu,
  X,
  BookOpen,
  HeadphonesIcon
} from "lucide-react";

export default function AdminBlog() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  
  const utils = trpc.useUtils();
  
  const { data, isLoading } = trpc.blog.adminList.useQuery({
    search: search || undefined,
    status: statusFilter !== "all" ? statusFilter as any : undefined,
    limit: 50,
  }, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const createMutation = trpc.blog.create.useMutation({
    onSuccess: () => {
      toast.success("Blog yazısı oluşturuldu");
      setIsCreateOpen(false);
      utils.blog.adminList.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.blog.update.useMutation({
    onSuccess: () => {
      toast.success("Blog yazısı güncellendi");
      setEditingPost(null);
      utils.blog.adminList.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.blog.delete.useMutation({
    onSuccess: () => {
      toast.success("Blog yazısı silindi");
      utils.blog.adminList.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
    if (!loading && isAuthenticated && user?.role !== 'admin') {
      setLocation('/dashboard');
    }
  }, [loading, isAuthenticated, user]);
  
  if (loading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary animate-pulse" />
          <span className="text-lg font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard", active: false },
    { href: "/admin/claims", icon: FileText, label: "Talepler", active: false },
    { href: "/admin/users", icon: Users, label: "Kullanıcılar", active: false },
    { href: "/admin/airlines", icon: PlaneIcon, label: "Havayolları", active: false },
    { href: "/admin/stats", icon: BarChart3, label: "İstatistikler", active: false },
    { href: "/admin/blog", icon: BookOpen, label: "Blog", active: true },
    { href: "/admin/support", icon: HeadphonesIcon, label: "Destek", active: false },
  ];
  
  const handleDelete = (id: number) => {
    if (confirm("Bu yazıyı silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate({ id });
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Yayında</Badge>;
      case "draft":
        return <Badge variant="secondary">Taslak</Badge>;
      case "archived":
        return <Badge variant="outline">Arşivlenmiş</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="min-h-screen bg-background flex">
      <SEOHead {...SEO_CONFIG.admin} />
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-foreground/10">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary" />
            <span className="font-bold text-lg tracking-tight">UçuşTazminat</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-foreground/10 shadow-lg">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant={item.active ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => logout()}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </Button>
            </nav>
          </div>
        )}
      </div>
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-foreground/10 flex-col fixed h-screen">
        <div className="p-6 border-b border-foreground/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary" />
            <span className="font-bold text-xl tracking-tight">UçuşTazminat</span>
          </Link>
          <p className="text-xs text-muted-foreground mt-1">Admin Panel</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={item.active ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-foreground/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-destructive" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">Blog Yönetimi</h1>
                <p className="text-muted-foreground">Blog yazılarını ekleyin, düzenleyin ve yönetin</p>
              </div>
              
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Yazı
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Yeni Blog Yazısı</DialogTitle>
                  </DialogHeader>
                  <BlogPostForm 
                    onSubmit={(data) => createMutation.mutate(data)}
                    isLoading={createMutation.isPending}
                  />
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Filters */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Yazı ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Durum" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tümü</SelectItem>
                      <SelectItem value="published">Yayında</SelectItem>
                      <SelectItem value="draft">Taslak</SelectItem>
                      <SelectItem value="archived">Arşivlenmiş</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            {/* Posts List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Blog Yazıları ({data?.posts?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                ) : data?.posts && data.posts.length > 0 ? (
                  <div className="space-y-4">
                    {data.posts.map((post) => (
                      <div key={post.id} className="flex items-start justify-between p-4 border rounded-lg hover:bg-secondary/50 transition-colors">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium truncate">{post.title}</h3>
                            {getStatusBadge(post.status)}
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{post.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {post.viewCount} görüntüleme
                            </span>
                            {post.category && (
                              <Badge variant="outline" className="text-xs">{post.category}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Button variant="ghost" size="icon">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Dialog open={editingPost?.id === post.id} onOpenChange={(open) => !open && setEditingPost(null)}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setEditingPost(post)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Blog Yazısını Düzenle</DialogTitle>
                              </DialogHeader>
                              <BlogPostForm 
                                initialData={editingPost}
                                onSubmit={(data) => updateMutation.mutate({ id: post.id, ...data })}
                                isLoading={updateMutation.isPending}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(post.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Henüz blog yazısı yok</p>
                    <p className="text-sm">Yeni bir yazı ekleyerek başlayın</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Blog Post Form Component
function BlogPostForm({ 
  initialData, 
  onSubmit, 
  isLoading 
}: { 
  initialData?: any; 
  onSubmit: (data: any) => void; 
  isLoading: boolean;
}) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [status, setStatus] = useState(initialData?.status || "draft");
  const [metaTitle, setMetaTitle] = useState(initialData?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(initialData?.metaDescription || "");
  
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  
  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!initialData) {
      setSlug(generateSlug(value));
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      slug,
      excerpt,
      content,
      category: category || undefined,
      status,
      metaTitle: metaTitle || undefined,
      metaDescription: metaDescription || undefined,
    });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Başlık *</Label>
          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Yazı başlığı"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>URL Slug *</Label>
          <Input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="yazi-basligi"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>Özet *</Label>
        <Textarea
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Kısa özet (liste görünümünde gösterilir)"
          rows={2}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label>İçerik (Markdown) *</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Yazı içeriği (Markdown formatında)"
          rows={15}
          className="font-mono text-sm"
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Kategori</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Kategori seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tazminat-rehberi">Tazminat Rehberi</SelectItem>
              <SelectItem value="yolcu-haklari">Yolcu Hakları</SelectItem>
              <SelectItem value="hukuki-bilgi">Hukuki Bilgi</SelectItem>
              <SelectItem value="haberler">Haberler</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Durum</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Taslak</SelectItem>
              <SelectItem value="published">Yayında</SelectItem>
              <SelectItem value="archived">Arşivlenmiş</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="border-t pt-4 mt-4">
        <h4 className="font-medium mb-4">SEO Ayarları</h4>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Meta Başlık</Label>
            <Input
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="SEO için özel başlık (boş bırakılırsa yazı başlığı kullanılır)"
            />
          </div>
          <div className="space-y-2">
            <Label>Meta Açıklama</Label>
            <Textarea
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
              placeholder="SEO için açıklama (boş bırakılırsa özet kullanılır)"
              rows={2}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Kaydediliyor..." : initialData ? "Güncelle" : "Oluştur"}
        </Button>
      </div>
    </form>
  );
}
