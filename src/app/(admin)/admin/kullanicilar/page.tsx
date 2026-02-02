'use client'

import { useEffect, useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Shield,
  ShieldOff,
  Download,
  RefreshCw,
  AlertCircle,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  role: string
  emailVerified: boolean
  claimsCount: number
  totalAmount: number
  createdAt: string
  lastLogin: string
}

interface UsersResponse {
  users: User[]
  stats: {
    total: number
    verified: number
    admins: number
    monthlyNew: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState({ total: 0, verified: 0, admins: 0, monthlyNew: 0 })
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Action dialog
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    action: string
    userId: string
    userName: string
  }>({ open: false, action: '', userId: '', userName: '' })
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        role,
        sortBy,
      })
      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) throw new Error('Kullanıcılar alınamadı')
      const data: UsersResponse = await response.json()
      setUsers(data.users)
      setStats(data.stats)
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, role, sortBy])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const openActionDialog = (action: string, userId: string, userName: string) => {
    setActionDialog({ open: true, action, userId, userName })
  }

  const executeAction = async () => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: actionDialog.userId,
          action: actionDialog.action,
        }),
      })
      if (!response.ok) throw new Error('İşlem başarısız')
      setActionDialog({ open: false, action: '', userId: '', userName: '' })
      fetchUsers()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const getActionInfo = (action: string, userName: string) => {
    switch (action) {
      case 'make_admin':
        return {
          title: 'Admin Yap',
          description: `${userName} kullanıcısını admin yapmak istediğinize emin misiniz?`,
        }
      case 'remove_admin':
        return {
          title: 'Admin Yetkisini Kaldır',
          description: `${userName} kullanıcısının admin yetkisini kaldırmak istediğinize emin misiniz?`,
        }
      case 'verify_email':
        return {
          title: 'Email Doğrula',
          description: `${userName} kullanıcısının email adresini manuel olarak doğrulamak istediğinize emin misiniz?`,
        }
      default:
        return { title: 'İşlem', description: '' }
    }
  }

  const exportUsers = () => {
    const headers = ['İsim', 'Email', 'Telefon', 'Rol', 'Talep Sayısı', 'Toplam Tutar', 'Durum', 'Kayıt Tarihi']
    const rows = users.map(u => [
      u.name,
      u.email,
      u.phone || '-',
      u.role === 'ADMIN' ? 'Admin' : 'Kullanıcı',
      u.claimsCount.toString(),
      `€${u.totalAmount}`,
      u.emailVerified ? 'Doğrulanmış' : 'Bekliyor',
      new Date(u.createdAt).toLocaleDateString('tr-TR'),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kullanicilar-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading && users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Kullanıcılar</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && users.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Kullanıcılar</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Hata oluştu</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <Button onClick={fetchUsers} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
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
          <h1 className="text-2xl font-bold">Kullanıcılar</h1>
          <p className="text-muted-foreground">
            Toplam {stats.total} kullanıcı
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Button onClick={exportUsers}>
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Toplam Kullanıcı</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Doğrulanmış</p>
            <p className="text-2xl font-bold">{stats.verified}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Admin</p>
            <p className="text-2xl font-bold">{stats.admins}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Bu Ay Yeni</p>
            <p className="text-2xl font-bold">{stats.monthlyNew}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="İsim veya email ara..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={role} onValueChange={(v) => { setRole(v); setPagination(p => ({ ...p, page: 1 })) }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Roller</SelectItem>
              <SelectItem value="USER">Kullanıcı</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPagination(p => ({ ...p, page: 1 })) }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="oldest">En Eski</SelectItem>
              <SelectItem value="name">İsim (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {users.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Kullanıcı bulunamadı</p>
              <p className="text-sm">Arama kriterlerinize uygun kullanıcı yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4 font-medium">Kullanıcı</th>
                    <th className="p-4 font-medium">Rol</th>
                    <th className="p-4 font-medium">Talepler</th>
                    <th className="p-4 font-medium">Toplam Tutar</th>
                    <th className="p-4 font-medium">Durum</th>
                    <th className="p-4 font-medium">Kayıt</th>
                    <th className="p-4 font-medium">Son Giriş</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {user.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={user.role === 'ADMIN' ? 'default' : 'secondary'}
                        >
                          {user.role === 'ADMIN' ? 'Admin' : 'Kullanıcı'}
                        </Badge>
                      </td>
                      <td className="p-4">{user.claimsCount}</td>
                      <td className="p-4 font-semibold">
                        {user.totalAmount > 0 ? `€${user.totalAmount.toLocaleString('tr-TR')}` : '-'}
                      </td>
                      <td className="p-4">
                        {user.emailVerified ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Doğrulanmış
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Bekliyor
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {new Date(user.lastLogin).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Profili Görüntüle
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="mr-2 h-4 w-4" />
                              Email Gönder
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {!user.emailVerified && (
                              <DropdownMenuItem onClick={() => openActionDialog('verify_email', user.id, user.name)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Email Doğrula
                              </DropdownMenuItem>
                            )}
                            {user.role === 'USER' ? (
                              <DropdownMenuItem onClick={() => openActionDialog('make_admin', user.id, user.name)}>
                                <Shield className="mr-2 h-4 w-4" />
                                Admin Yap
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => openActionDialog('remove_admin', user.id, user.name)}>
                                <ShieldOff className="mr-2 h-4 w-4" />
                                Admin Yetkisini Kaldır
                              </DropdownMenuItem>
                            )}
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
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Sayfa {pagination.page} / {pagination.totalPages} ({pagination.total} sonuç)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Önceki
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
            >
              Sonraki
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog(d => ({ ...d, open: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{getActionInfo(actionDialog.action, actionDialog.userName).title}</DialogTitle>
            <DialogDescription>{getActionInfo(actionDialog.action, actionDialog.userName).description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(d => ({ ...d, open: false }))}>
              İptal
            </Button>
            <Button onClick={executeAction} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : (
                'Onayla'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
