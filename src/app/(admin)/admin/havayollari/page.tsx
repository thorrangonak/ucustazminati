'use client'

import { useEffect, useState, useCallback } from 'react'
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Search,
  Plus,
  Pencil,
  RefreshCw,
  AlertCircle,
  Plane,
  ChevronLeft,
  ChevronRight,
  Globe,
  Check,
  X,
} from 'lucide-react'

interface Airline {
  id: string
  iataCode: string
  icaoCode: string | null
  name: string
  nameLocal: string | null
  country: string | null
  isActive: boolean
  logoUrl: string | null
  contactEmail: string | null
  website: string | null
}

export default function AdminAirlinesPage() {
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Edit dialog
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    airline: Airline | null
  }>({ open: false, airline: null })
  const [editForm, setEditForm] = useState({
    name: '',
    nameLocal: '',
    iataCode: '',
    icaoCode: '',
    country: '',
    contactEmail: '',
    website: '',
    isActive: true,
  })
  const [saving, setSaving] = useState(false)

  const fetchAirlines = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        search,
        page: page.toString(),
        limit: '20',
      })
      const response = await fetch(`/api/airlines?${params}`)
      if (!response.ok) throw new Error('Havayolları alınamadı')
      const data = await response.json()

      let filtered = data.airlines || data
      if (statusFilter !== 'all') {
        filtered = filtered.filter((a: Airline) =>
          statusFilter === 'active' ? a.isActive : !a.isActive
        )
      }

      setAirlines(Array.isArray(filtered) ? filtered : [])
      setTotalPages(Math.ceil((data.total || filtered.length) / 20))
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchAirlines()
  }, [fetchAirlines])

  const openEditDialog = (airline?: Airline) => {
    if (airline) {
      setEditForm({
        name: airline.name,
        nameLocal: airline.nameLocal || '',
        iataCode: airline.iataCode,
        icaoCode: airline.icaoCode || '',
        country: airline.country || '',
        contactEmail: airline.contactEmail || '',
        website: airline.website || '',
        isActive: airline.isActive,
      })
      setEditDialog({ open: true, airline })
    } else {
      setEditForm({
        name: '',
        nameLocal: '',
        iataCode: '',
        icaoCode: '',
        country: '',
        contactEmail: '',
        website: '',
        isActive: true,
      })
      setEditDialog({ open: true, airline: null })
    }
  }

  const saveAirline = async () => {
    setSaving(true)
    try {
      const method = editDialog.airline ? 'PATCH' : 'POST'
      const url = editDialog.airline
        ? `/api/admin/airlines/${editDialog.airline.id}`
        : '/api/admin/airlines'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) throw new Error('Kaydetme başarısız')

      setEditDialog({ open: false, airline: null })
      fetchAirlines()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading && airlines.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Havayolları</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
        <Card>
          <CardContent className="p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
                <Skeleton className="h-10 w-10 rounded" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error && airlines.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Havayolları</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Hata oluştu</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <Button onClick={fetchAirlines} variant="outline">
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
          <h1 className="text-2xl font-bold">Havayolları</h1>
          <p className="text-muted-foreground">
            Toplam {airlines.length} havayolu
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchAirlines} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
          <Button onClick={() => openEditDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Ekle
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Havayolu adı veya IATA kodu ara..."
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
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Airlines Table */}
      <Card>
        <CardContent className="p-0">
          {airlines.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Havayolu bulunamadı</p>
              <p className="text-sm">Arama kriterlerinize uygun havayolu yok</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="p-4 font-medium">Havayolu</th>
                    <th className="p-4 font-medium">IATA</th>
                    <th className="p-4 font-medium">ICAO</th>
                    <th className="p-4 font-medium">Ülke</th>
                    <th className="p-4 font-medium">Durum</th>
                    <th className="p-4 font-medium">Website</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {airlines.map((airline) => (
                    <tr key={airline.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {airline.logoUrl ? (
                            <img
                              src={airline.logoUrl}
                              alt={airline.name}
                              className="h-8 w-8 object-contain"
                            />
                          ) : (
                            <div className="h-8 w-8 bg-primary/10 rounded flex items-center justify-center">
                              <Plane className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{airline.name}</p>
                            {airline.nameLocal && (
                              <p className="text-sm text-muted-foreground">{airline.nameLocal}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{airline.iataCode}</Badge>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {airline.icaoCode || '-'}
                      </td>
                      <td className="p-4">{airline.country || '-'}</td>
                      <td className="p-4">
                        {airline.isActive ? (
                          <Badge className="bg-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <X className="h-3 w-3 mr-1" />
                            Pasif
                          </Badge>
                        )}
                      </td>
                      <td className="p-4">
                        {airline.website ? (
                          <a
                            href={airline.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                          >
                            <Globe className="h-4 w-4" />
                            <span className="text-sm">Ziyaret</span>
                          </a>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(airline)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
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
      <Dialog open={editDialog.open} onOpenChange={(open) => !open && setEditDialog({ open: false, airline: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editDialog.airline ? 'Havayolu Düzenle' : 'Yeni Havayolu'}
            </DialogTitle>
            <DialogDescription>
              Havayolu bilgilerini girin
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="iataCode">IATA Kodu</Label>
                <Input
                  id="iataCode"
                  value={editForm.iataCode}
                  onChange={(e) => setEditForm(f => ({ ...f, iataCode: e.target.value.toUpperCase() }))}
                  maxLength={2}
                  placeholder="TK"
                />
              </div>
              <div>
                <Label htmlFor="icaoCode">ICAO Kodu</Label>
                <Input
                  id="icaoCode"
                  value={editForm.icaoCode}
                  onChange={(e) => setEditForm(f => ({ ...f, icaoCode: e.target.value.toUpperCase() }))}
                  maxLength={3}
                  placeholder="THY"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="name">İsim (İngilizce)</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Turkish Airlines"
              />
            </div>
            <div>
              <Label htmlFor="nameLocal">İsim (Türkçe)</Label>
              <Input
                id="nameLocal"
                value={editForm.nameLocal}
                onChange={(e) => setEditForm(f => ({ ...f, nameLocal: e.target.value }))}
                placeholder="Türk Hava Yolları"
              />
            </div>
            <div>
              <Label htmlFor="country">Ülke</Label>
              <Input
                id="country"
                value={editForm.country}
                onChange={(e) => setEditForm(f => ({ ...f, country: e.target.value }))}
                placeholder="Türkiye"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">İletişim Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={editForm.contactEmail}
                onChange={(e) => setEditForm(f => ({ ...f, contactEmail: e.target.value }))}
                placeholder="contact@airline.com"
              />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={editForm.website}
                onChange={(e) => setEditForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://www.airline.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, airline: null })}>
              İptal
            </Button>
            <Button onClick={saveAirline} disabled={saving}>
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
