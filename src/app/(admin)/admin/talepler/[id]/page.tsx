'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  Plane,
  User,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  Download,
  ExternalLink,
  Calendar,
  MapPin,
  Banknote,
  FileQuestion,
} from 'lucide-react'

interface ClaimDetail {
  id: string
  claimNumber: string
  status: string
  flightNumber: string
  flightDate: string
  departureAirport: {
    iataCode: string
    name: string
    city: string
  }
  arrivalAirport: {
    iataCode: string
    name: string
    city: string
  }
  airline: {
    name: string
    iataCode: string
  } | null
  disruptionType: string
  delayDuration: number | null
  flightDistance: number | null
  compensationAmount: number
  commissionRate: number
  netPayoutAmount: number
  passengerIban: string | null
  consentSignedAt: string | null
  assignedTo: string | null
  resolvedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
    phone: string | null
    createdAt: string
  }
  passengers: Array<{
    id: string
    firstName: string
    lastName: string
    email: string | null
    isPrimary: boolean
  }>
  documents: Array<{
    id: string
    type: string
    fileName: string
    fileUrl: string
    isVerified: boolean
    createdAt: string
  }>
  statusHistory: Array<{
    id: string
    fromStatus: string | null
    toStatus: string
    note: string | null
    changedBy: string
    createdAt: string
  }>
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="secondary" className="text-base px-3 py-1">Taslak</Badge>
    case 'SUBMITTED':
      return <Badge className="bg-blue-500 text-base px-3 py-1">Gönderildi</Badge>
    case 'UNDER_REVIEW':
      return <Badge className="bg-yellow-500 text-base px-3 py-1">İnceleniyor</Badge>
    case 'DOCUMENTS_REQUESTED':
      return <Badge className="bg-orange-500 text-base px-3 py-1">Belge Bekleniyor</Badge>
    case 'AIRLINE_CONTACTED':
      return <Badge className="bg-indigo-500 text-base px-3 py-1">Havayoluna İletildi</Badge>
    case 'APPROVED':
      return <Badge className="bg-green-500 text-base px-3 py-1">Onaylandı</Badge>
    case 'REJECTED':
      return <Badge variant="destructive" className="text-base px-3 py-1">Reddedildi</Badge>
    case 'PAID':
      return <Badge className="bg-purple-500 text-base px-3 py-1">Ödendi</Badge>
    default:
      return <Badge variant="outline" className="text-base px-3 py-1">{status}</Badge>
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    DRAFT: 'Taslak',
    SUBMITTED: 'Gönderildi',
    UNDER_REVIEW: 'İnceleniyor',
    DOCUMENTS_REQUESTED: 'Belge Bekleniyor',
    AIRLINE_CONTACTED: 'Havayoluna İletildi',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    PAID: 'Ödendi',
  }
  return labels[status] || status
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

const getDocTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    BOARDING_PASS: 'Biniş Kartı',
    TICKET: 'Bilet',
    ID_CARD: 'Kimlik',
    PASSPORT: 'Pasaport',
    DELAY_CONFIRMATION: 'Gecikme Belgesi',
    OTHER: 'Diğer',
  }
  return labels[type] || type
}

export default function AdminClaimDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [claim, setClaim] = useState<ClaimDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Action dialog
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    status: string
    title: string
  }>({ open: false, status: '', title: '' })
  const [actionNote, setActionNote] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const fetchClaim = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/admin/claims/${params.id}`)
      if (!response.ok) throw new Error('Talep alınamadı')
      const data = await response.json()
      setClaim(data.claim)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchClaim()
  }, [params.id])

  const openActionDialog = (status: string, title: string) => {
    setActionDialog({ open: true, status, title })
    setActionNote('')
  }

  const executeAction = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/admin/claims/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionDialog.status,
          note: actionNote,
        }),
      })
      if (!response.ok) throw new Error('İşlem başarısız')
      setActionDialog({ open: false, status: '', title: '' })
      fetchClaim()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error || !claim) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Hata oluştu</p>
              <p className="text-sm text-red-600">{error || 'Talep bulunamadı'}</p>
            </div>
            <Button onClick={fetchClaim} variant="outline">
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{claim.claimNumber}</h1>
              {getStatusBadge(claim.status)}
            </div>
            <p className="text-muted-foreground">
              {new Date(claim.createdAt).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={fetchClaim}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => openActionDialog('UNDER_REVIEW', 'İncelemeye Al')}
              disabled={claim.status === 'UNDER_REVIEW'}
            >
              <Clock className="mr-2 h-4 w-4" />
              İncelemeye Al
            </Button>
            <Button
              variant="outline"
              onClick={() => openActionDialog('DOCUMENTS_REQUESTED', 'Belge Talep Et')}
              disabled={claim.status === 'DOCUMENTS_REQUESTED'}
            >
              <FileQuestion className="mr-2 h-4 w-4" />
              Belge Talep Et
            </Button>
            <Button
              variant="outline"
              onClick={() => openActionDialog('AIRLINE_CONTACTED', 'Havayoluna İlet')}
              disabled={claim.status === 'AIRLINE_CONTACTED'}
            >
              <Send className="mr-2 h-4 w-4" />
              Havayoluna İlet
            </Button>
            <Button
              variant="outline"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              onClick={() => openActionDialog('APPROVED', 'Onayla')}
              disabled={claim.status === 'APPROVED' || claim.status === 'PAID'}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Onayla
            </Button>
            <Button
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => openActionDialog('REJECTED', 'Reddet')}
              disabled={claim.status === 'REJECTED'}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reddet
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flight Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Uçuş Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold">{claim.departureAirport.iataCode}</p>
                  <p className="text-sm text-muted-foreground">{claim.departureAirport.city}</p>
                </div>
                <div className="flex-1 flex items-center justify-center px-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-8 bg-border" />
                    <Plane className="h-5 w-5 text-muted-foreground" />
                    <div className="h-px w-8 bg-border" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{claim.arrivalAirport.iataCode}</p>
                  <p className="text-sm text-muted-foreground">{claim.arrivalAirport.city}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Uçuş Tarihi</p>
                    <p className="font-medium">
                      {new Date(claim.flightDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Uçuş Numarası</p>
                    <p className="font-medium">{claim.flightNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Plane className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Havayolu</p>
                    <p className="font-medium">{claim.airline?.name || '-'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Aksama Tipi</p>
                    <p className="font-medium">{getDisruptionLabel(claim.disruptionType)}</p>
                  </div>
                </div>
                {claim.delayDuration && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Gecikme Süresi</p>
                      <p className="font-medium">{claim.delayDuration} saat</p>
                    </div>
                  </div>
                )}
                {claim.flightDistance && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Uçuş Mesafesi</p>
                      <p className="font-medium">{claim.flightDistance.toLocaleString('tr-TR')} km</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Passengers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Yolcular ({claim.passengers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {claim.passengers.map((passenger) => (
                  <div
                    key={passenger.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        {passenger.firstName} {passenger.lastName}
                        {passenger.isPrimary && (
                          <Badge variant="secondary" className="ml-2">Ana Yolcu</Badge>
                        )}
                      </p>
                      {passenger.email && (
                        <p className="text-sm text-muted-foreground">{passenger.email}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Belgeler ({claim.documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {claim.documents.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Henüz belge yüklenmemiş</p>
              ) : (
                <div className="space-y-3">
                  {claim.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {getDocTypeLabel(doc.type)} - {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.isVerified ? (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Doğrulandı
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                            Bekliyor
                          </Badge>
                        )}
                        <Button variant="ghost" size="icon" asChild>
                          <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Durum Geçmişi
              </CardTitle>
            </CardHeader>
            <CardContent>
              {claim.statusHistory.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Henüz durum değişikliği yok</p>
              ) : (
                <div className="space-y-4">
                  {claim.statusHistory.map((history, index) => (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="h-3 w-3 rounded-full bg-primary" />
                        {index < claim.statusHistory.length - 1 && (
                          <div className="w-px h-full bg-border" />
                        )}
                      </div>
                      <div className="pb-4">
                        <div className="flex items-center gap-2">
                          {history.fromStatus && (
                            <>
                              <Badge variant="outline" className="text-xs">
                                {getStatusLabel(history.fromStatus)}
                              </Badge>
                              <span className="text-muted-foreground">→</span>
                            </>
                          )}
                          <Badge className="text-xs">{getStatusLabel(history.toStatus)}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {history.changedBy} - {new Date(history.createdAt).toLocaleString('tr-TR')}
                        </p>
                        {history.note && (
                          <p className="text-sm mt-1 p-2 bg-muted rounded">{history.note}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Compensation Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                Tazminat Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-sm text-green-600">Toplam Tazminat</p>
                <p className="text-3xl font-bold text-green-700">€{claim.compensationAmount}</p>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Komisyon Oranı</span>
                  <span className="font-medium">%{claim.commissionRate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Komisyon</span>
                  <span className="font-medium">
                    €{((claim.compensationAmount * claim.commissionRate) / 100).toFixed(2)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg">
                  <span className="font-medium">Net Ödeme</span>
                  <span className="font-bold text-primary">€{claim.netPayoutAmount}</span>
                </div>
              </div>
              {claim.passengerIban && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">IBAN</p>
                    <p className="font-mono text-sm">{claim.passengerIban}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Kullanıcı Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">İsim</p>
                <p className="font-medium">{claim.user.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{claim.user.email}</p>
              </div>
              {claim.user.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Telefon</p>
                  <p className="font-medium">{claim.user.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">Kayıt Tarihi</p>
                <p className="font-medium">
                  {new Date(claim.user.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>
              <Separator />
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/admin/kullanicilar?search=${claim.user.email}`}>
                  Kullanıcıyı Görüntüle
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Consent Info */}
          {claim.consentSignedAt && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  E-İmza
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">İmzalandı</p>
                <p className="font-medium">
                  {new Date(claim.consentSignedAt).toLocaleString('tr-TR')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => !open && setActionDialog(d => ({ ...d, open: false }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionDialog.title}</DialogTitle>
            <DialogDescription>
              Bu işlem talep durumunu değiştirecek ve kaydedilecektir.
            </DialogDescription>
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
              variant={actionDialog.status === 'REJECTED' ? 'destructive' : 'default'}
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
