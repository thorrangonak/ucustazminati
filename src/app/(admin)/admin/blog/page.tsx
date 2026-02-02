'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  Pencil,
  RefreshCw,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  MoreHorizontal,
  Calendar,
  Image,
} from 'lucide-react'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content: string
  coverImage: string | null
  authorName: string | null
  category: string | null
  tags: string[]
  isPublished: boolean
  publishedAt: string | null
  viewCount: number
  createdAt: string
  updatedAt: string
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Edit dialog
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    post: BlogPost | null
  }>({ open: false, post: null })
  const [editForm, setEditForm] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    authorName: '',
    category: '',
    tags: '',
    isPublished: false,
  })
  const [saving, setSaving] = useState(false)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: '20',
        admin: 'true',
      })
      if (statusFilter !== 'all') {
        params.set('published', statusFilter === 'published' ? 'true' : 'false')
      }
      const response = await fetch(`/api/admin/blog?${params}`)
      if (!response.ok) throw new Error('Blog yazıları alınamadı')
      const data = await response.json()
      setPosts(data.posts || [])
      setTotalPages(data.totalPages || 1)
    } catch (err: any) {
      // For now, show empty state since API might not exist yet
      setPosts([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const openEditDialog = (post?: BlogPost) => {
    if (post) {
      setEditForm({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt || '',
        content: post.content,
        coverImage: post.coverImage || '',
        authorName: post.authorName || '',
        category: post.category || '',
        tags: post.tags.join(', '),
        isPublished: post.isPublished,
      })
      setEditDialog({ open: true, post })
    } else {
      setEditForm({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        coverImage: '',
        authorName: '',
        category: '',
        tags: '',
        isPublished: false,
      })
      setEditDialog({ open: true, post: null })
    }
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const savePost = async () => {
    setSaving(true)
    try {
      const method = editDialog.post ? 'PATCH' : 'POST'
      const url = editDialog.post
        ? `/api/admin/blog/${editDialog.post.id}`
        : '/api/admin/blog'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      })

      if (!response.ok) throw new Error('Kaydetme başarısız')

      setEditDialog({ open: false, post: null })
      fetchPosts()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const deletePost = async (postId: string) => {
    if (!confirm('Bu yazıyı silmek istediğinize emin misiniz?')) return

    try {
      const response = await fetch(`/api/admin/blog/${postId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Silme başarısız')
      fetchPosts()
    } catch (err: any) {
      setError(err.message)
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Blog Yönetimi</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
                <Skeleton className="h-16 w-24 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Blog Yönetimi</h1>
          <p className="text-muted-foreground">
            {posts.length} yazı
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPosts} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Button onClick={() => openEditDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Yazı
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Başlık ara..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="published">Yayında</SelectItem>
              <SelectItem value="draft">Taslak</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Posts Table */}
      <Card>
        <CardContent className="p-0">
          {posts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Blog yazısı bulunamadı</p>
              <p className="text-sm mb-4">İlk yazınızı oluşturmak için butona tıklayın</p>
              <Button onClick={() => openEditDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Yazı Oluştur
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4 font-medium">Yazı</th>
                    <th className="p-4 font-medium">Kategori</th>
                    <th className="p-4 font-medium">Durum</th>
                    <th className="p-4 font-medium">Görüntülenme</th>
                    <th className="p-4 font-medium">Tarih</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {post.coverImage ? (
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="h-12 w-20 object-cover rounded"
                            />
                          ) : (
                            <div className="h-12 w-20 bg-muted rounded flex items-center justify-center">
                              <Image className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium line-clamp-1">{post.title}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              /{post.slug}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {post.category ? (
                          <Badge variant="outline">{post.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {post.isPublished ? (
                          <Badge className="bg-green-500">Yayında</Badge>
                        ) : (
                          <Badge variant="secondary">Taslak</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          {post.viewCount}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(post.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(post)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                <Eye className="mr-2 h-4 w-4" />
                                Görüntüle
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => deletePost(post.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Sayfa {page} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Sonraki
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, post: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editDialog.post ? 'Yazı Düzenle' : 'Yeni Yazı'}
            </DialogTitle>
            <DialogDescription>
              Blog yazısı bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Başlık</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => {
                  setEditForm(f => ({
                    ...f,
                    title: e.target.value,
                    slug: f.slug || generateSlug(e.target.value),
                  }))
                }}
                placeholder="Yazı başlığı"
              />
            </div>
            <div>
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={editForm.slug}
                onChange={(e) => setEditForm(f => ({ ...f, slug: e.target.value }))}
                placeholder="yazi-basligi"
              />
            </div>
            <div>
              <Label htmlFor="excerpt">Özet</Label>
              <Textarea
                id="excerpt"
                value={editForm.excerpt}
                onChange={(e) => setEditForm(f => ({ ...f, excerpt: e.target.value }))}
                placeholder="Kısa açıklama..."
                rows={2}
              />
            </div>
            <div>
              <Label htmlFor="content">İçerik</Label>
              <Textarea
                id="content"
                value={editForm.content}
                onChange={(e) => setEditForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Yazı içeriği (Markdown desteklenir)..."
                rows={10}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Input
                  id="category"
                  value={editForm.category}
                  onChange={(e) => setEditForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="Yolcu Hakları"
                />
              </div>
              <div>
                <Label htmlFor="authorName">Yazar</Label>
                <Input
                  id="authorName"
                  value={editForm.authorName}
                  onChange={(e) => setEditForm(f => ({ ...f, authorName: e.target.value }))}
                  placeholder="Yazar adı"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="tags">Etiketler (virgülle ayırın)</Label>
              <Input
                id="tags"
                value={editForm.tags}
                onChange={(e) => setEditForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="tazminat, gecikme, iptal"
              />
            </div>
            <div>
              <Label htmlFor="coverImage">Kapak Görseli URL</Label>
              <Input
                id="coverImage"
                value={editForm.coverImage}
                onChange={(e) => setEditForm(f => ({ ...f, coverImage: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isPublished"
                checked={editForm.isPublished}
                onCheckedChange={(checked) => setEditForm(f => ({ ...f, isPublished: checked }))}
              />
              <Label htmlFor="isPublished">Yayınla</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, post: null })}>
              İptal
            </Button>
            <Button onClick={savePost} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
