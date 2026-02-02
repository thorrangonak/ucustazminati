'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Search,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Send,
  Download,
  RefreshCw,
  AlertCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileQuestion,
} from 'lucide-react'

interface Claim {
  id: string
  claimNumber: string
  userName: string
  userEmail: string
  userId: string
  flightNumber: string
  route: string
  flightDate: string
  disruptionType: string
  amount: number
  status: string
  assignedTo: string | null
  airline: string | null
  createdAt: string
}

interface ClaimsResponse {
  claims: Claim[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="secondary">Taslak</Badge>
    case 'SUBMITTED':
      return <Badge className="bg-blue-500 hover:bg-blue-600">Gönderildi</Badge>
    case 'UNDER_REVIEW':
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">İnceleniyor</Badge>
    case 'DOCUMENTS_REQUESTED':
      return <Badge className="bg-orange-500 hover:bg-orange-600">Belge Bekleniyor</Badge>
    case 'AIRLINE_CONTACTED':
      return <Badge className="bg-indigo-500 hover:bg-indigo-600">Havayoluna İletildi</Badge>
    case 'APPROVED':
      return <Badge className="bg-green-500 hover:bg-green-600">Onaylandı</Badge>
    case 'REJECTED':
      return <Badge variant="destructive">Reddedildi</Badge>
    case 'PAID':
      return <Badge className="bg-purple-500 hover:bg-purple-600">Ödendi</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

const getDisruptionLabel = (type: string) => {
  switch (type) {
    case 'DELAY':
      return 'Gecikme'
    case 'CANCELLATION':
      return 'İptal'
    case 'DENIED_BOARDING':
      return 'Uçağa Alınmama'
    case 'DOWNGRADE':
      return 'Alt Sınıf'
    default:
      return type
  }
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<Claim[]>([])
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedClaims, setSelectedClaims] = useState<string[]>([])

  // Filters
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  // Action dialog
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    action: string
    title: string
    description: string
    claimIds: string[]
  }>({ open: false, action: '', title: '', description: '', claimIds: [] })
  const [actionNote, setActionNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchClaims = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search,
        status,
        sortBy,
      })
      const response = await fetch(`/api/admin/claims?${params}`)
      if (!response.ok) throw new Error('Talepler alınamadı')
      const data: ClaimsResponse = await response.json()
      setClaims(data.claims)
      setPagination(data.pagination)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, pagination.limit, search, status, sortBy])

  useEffect(() => {
    fetchClaims()
  }, [fetchClaims])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const toggleClaimSelection = (claimId: string) => {
    setSelectedClaims((prev) =>
      prev.includes(claimId)
        ? prev.filter((id) => id !== claimId)
        : [...prev, claimId]
    )
  }

  const toggleAllClaims = () => {
    if (selectedClaims.length === claims.length) {
      setSelectedClaims([])
    } else {
      setSelectedClaims(claims.map((c) => c.id))
    }
  }

  const openActionDialog = (action: string, claimIds: string[]) => {
    const titles: Record<string, string> = {
      approve: 'Talepleri Onayla',
      reject: 'Talepleri Reddet',
      review: 'İncelemeye Al',
      contact_airline: 'Havayoluna İlet',
      request_documents: 'Belge Talep Et',
    }
    const descriptions: Record<string, string> = {
      approve: `${claimIds.length} talep onaylanacak. Bu işlem geri alınamaz.`,
      reject: `${claimIds.length} talep reddedilecek. Bu işlem geri alınamaz.`,
      review: `${claimIds.length} talep incelemeye alınacak.`,
      contact_airline: `${claimIds.length} talep için havayoluna iletişim başlatılacak.`,
      request_documents: `${claimIds.length} talep için ek belge talep edilecek.`,
    }
    setActionDialog({
      open: true,
      action,
      title: titles[action] || 'İşlem',
      description: descriptions[action] || '',
      claimIds,
    })
    setActionNote('')
  }

  const executeAction = async () => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/admin/claims', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimIds: actionDialog.claimIds,
          action: actionDialog.action,
          note: actionNote,
        }),
      })
      if (!response.ok) throw new Error('İşlem başarısız')
      setActionDialog({ open: false, action: '', title: '', description: '', claimIds: [] })
      setSelectedClaims([])
      fetchClaims()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const exportClaims = () => {
    // Create CSV from claims
    const headers = ['Talep No', 'Kullanıcı', 'Email', 'Uçuş No', 'Rota', 'Tutar', 'Durum', 'Tarih']
    const rows = claims.map(c => [
      c.claimNumber,
      c.userName,
      c.userEmail,
      c.flightNumber,
      c.route,
      `€${c.amount}`,
      c.status,
      new Date(c.createdAt).toLocaleDateString('tr-TR'),
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `talepler-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  if (loading && claims.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Talepler</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && claims.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Talepler</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Hata oluştu</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <Button onClick={fetchClaims} variant="outline">
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
          <h1 className="text-2xl font-bold">Talepler</h1>
          <p className="text-muted-foreground">
            Toplam {pagination.total} talep
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchClaims} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Button onClick={exportClaims}>
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Talep no, kullanıcı veya email ara..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPagination(p => ({ ...p, page: 1 })) }}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="DRAFT">Taslak</SelectItem>
              <SelectItem value="SUBMITTED">Gönderildi</SelectItem>
              <SelectItem value="UNDER_REVIEW">İnceleniyor</SelectItem>
              <SelectItem value="DOCUMENTS_REQUESTED">Belge Bekleniyor</SelectItem>
              <SelectItem value="AIRLINE_CONTACTED">Havayoluna İletildi</SelectItem>
              <SelectItem value="APPROVED">Onaylandı</SelectItem>
              <SelectItem value="REJECTED">Reddedildi</SelectItem>
              <SelectItem value="PAID">Ödendi</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setPagination(p => ({ ...p, page: 1 })) }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="oldest">En Eski</SelectItem>
              <SelectItem value="amount_high">Tutar (Yüksek)</SelectItem>
              <SelectItem value="amount_low">Tutar (Düşük)</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedClaims.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4">
            <span className="text-sm font-medium">
              {selectedClaims.length} talep seçildi
            </span>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => openActionDialog('review', selectedClaims)}>
                <Clock className="mr-2 h-4 w-4" />
                İncele
              </Button>
              <Button size="sm" variant="outline" onClick={() => openActionDialog('request_documents', selectedClaims)}>
                <FileQuestion className="mr-2 h-4 w-4" />
                Belge İste
              </Button>
              <Button size="sm" variant="outline" onClick={() => openActionDialog('contact_airline', selectedClaims)}>
                <Send className="mr-2 h-4 w-4" />
                Havayoluna İlet
              </Button>
              <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700" onClick={() => openActionDialog('approve', selectedClaims)}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Onayla
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => openActionDialog('reject', selectedClaims)}>
                <XCircle className="mr-2 h-4 w-4" />
                Reddet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Claims Table */}
      <Card>
        <CardContent className="p-0">
          {claims.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Talep bulunamadı</p>
              <p className="text-sm">Arama kriterlerinize uygun talep yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4">
                      <Checkbox
                        checked={selectedClaims.length === claims.length && claims.length > 0}
                        onCheckedChange={toggleAllClaims}
                      />
                    </th>
                    <th className="p-4 font-medium">Talep No</th>
                    <th className="p-4 font-medium">Kullanıcı</th>
                    <th className="p-4 font-medium">Uçuş</th>
                    <th className="p-4 font-medium">Tip</th>
                    <th className="p-4 font-medium">Tutar</th>
                    <th className="p-4 font-medium">Durum</th>
                    <th className="p-4 font-medium">Tarih</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4">
                        <Checkbox
                          checked={selectedClaims.includes(claim.id)}
                          onCheckedChange={() => toggleClaimSelection(claim.id)}
                        />
                      </td>
                      <td className="p-4">
                        <Link
                          href={`/admin/talepler/${claim.id}`}
                          className="font-medium hover:text-primary hover:underline"
                        >
                          {claim.claimNumber}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{claim.userName}</p>
                          <p className="text-sm text-muted-foreground">{claim.userEmail}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">{claim.flightNumber}</p>
                          <p className="text-sm text-muted-foreground">{claim.route}</p>
                        </div>
                      </td>
                      <td className="p-4 text-sm">
                        {getDisruptionLabel(claim.disruptionType)}
                      </td>
                      <td className="p-4 font-semibold">€{claim.amount}</td>
                      <td className="p-4">{getStatusBadge(claim.status)}</td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {new Date(claim.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/talepler/${claim.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Görüntüle
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openActionDialog('review', [claim.id])}>
                              <Clock className="mr-2 h-4 w-4" />
                              İncelemeye Al
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openActionDialog('request_documents', [claim.id])}>
                              <FileQuestion className="mr-2 h-4 w-4" />
                              Belge Talep Et
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openActionDialog('contact_airline', [claim.id])}>
                              <Send className="mr-2 h-4 w-4" />
                              Havayoluna İlet
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-green-600"
                              onClick={() => openActionDialog('approve', [claim.id])}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Onayla
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => openActionDialog('reject', [claim.id])}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reddet
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
            <DialogTitle>{actionDialog.title}</DialogTitle>
            <DialogDescription>{actionDialog.description}</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium">Not (Opsiyonel)</label>
            <Textarea
              placeholder="İşlem hakkında not ekleyin..."
              value={actionNote}
              onChange={(e) => setActionNote(e.target.value)}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(d => ({ ...d, open: false }))}>
              İptal
            </Button>
            <Button
              onClick={executeAction}
              disabled={actionLoading}
              variant={actionDialog.action === 'reject' ? 'destructive' : 'default'}
            >
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
