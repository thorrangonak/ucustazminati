'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  Plane,
  Clock,
  User,
  FileText,
  Download,
  CheckCircle2,
  Circle,
  AlertCircle,
  MessageSquare,
  PartyPopper,
  Eye,
  FileSignature,
  Loader2,
  Image as ImageIcon,
  File,
} from 'lucide-react'

interface Claim {
  id: string
  claimNumber: string
  flightNumber: string
  flightDate: string
  status: string
  disruptionType: string
  delayDuration?: number
  compensationAmount: number
  consentSignature?: string
  consentSignedAt?: string
  passengerIban?: string
  departureAirport?: {
    iataCode: string
    city: string
    cityLocal?: string
  }
  arrivalAirport?: {
    iataCode: string
    city: string
    cityLocal?: string
  }
  airline?: {
    name: string
  }
  passengers: {
    id: string
    firstName: string
    lastName: string
    email?: string
    isPrimary: boolean
  }[]
  documents: {
    id: string
    fileName: string
    fileType: string
    fileUrl?: string
    uploadedAt: string
  }[]
  statusHistory: {
    id: string
    toStatus: string
    note?: string
    createdAt: string
  }[]
}

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-200',
    SUBMITTED: 'bg-blue-100 text-blue-700 border-blue-200',
    UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    DOCUMENTS_REQUESTED: 'bg-orange-100 text-orange-700 border-orange-200',
    AIRLINE_CONTACTED: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    APPROVED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    PAID: 'bg-purple-100 text-purple-700 border-purple-200',
  }
  const labels: Record<string, string> = {
    DRAFT: 'Taslak',
    SUBMITTED: 'Gonderildi',
    UNDER_REVIEW: 'Inceleniyor',
    DOCUMENTS_REQUESTED: 'Belge Bekleniyor',
    AIRLINE_CONTACTED: 'Havayoluna Iletildi',
    APPROVED: 'Onaylandi',
    REJECTED: 'Reddedildi',
    PAID: 'Odendi',
  }
  return (
    <Badge className={`${styles[status] || 'bg-gray-100'} border`}>
      {labels[status] || status}
    </Badge>
  )
}

const getDisruptionLabel = (type: string) => {
  const labels: Record<string, string> = {
    DELAY: 'Gecikme',
    CANCELLATION: 'Iptal',
    DENIED_BOARDING: 'Ucusa Alinmama',
    DOWNGRADE: 'Alt Sinif',
  }
  return labels[type] || type
}

const timelineSteps = [
  { status: 'SUBMITTED', label: 'Gonderildi' },
  { status: 'UNDER_REVIEW', label: 'Inceleniyor' },
  { status: 'AIRLINE_CONTACTED', label: 'Havayoluna Iletildi' },
  { status: 'APPROVED', label: 'Onaylandi' },
  { status: 'PAID', label: 'Odendi' },
]

export default function ClaimDetailPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const success = searchParams.get('success')
  const [claim, setClaim] = useState<Claim | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [contractPreviewOpen, setContractPreviewOpen] = useState(false)

  useEffect(() => {
    async function fetchClaim() {
      try {
        const res = await fetch(`/api/claims/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setClaim(data.claim)
        }
      } catch (error) {
        console.error('Error fetching claim:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchClaim()
  }, [params.id])

  const downloadContractPDF = async () => {
    setPdfLoading(true)
    try {
      const res = await fetch(`/api/claims/${params.id}/contract-pdf`)
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `sozlesme_${claim?.claimNumber || 'contract'}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error downloading PDF:', error)
    } finally {
      setPdfLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-medium">Talep bulunamadi</h2>
        <Link href="/taleplerim" className="mt-4">
          <Button>Taleplerime Don</Button>
        </Link>
      </div>
    )
  }

  const currentStepIndex = timelineSteps.findIndex((s) => s.status === claim.status)
  const compensationNum = Number(claim.compensationAmount || 0)
  const commission = compensationNum * 0.25
  const netPayout = compensationNum * 0.75

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Success Message */}
      {success === 'true' && (
        <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/20">
              <PartyPopper className="h-7 w-7 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">
                Talebiniz Basariyla Olusturuldu!
              </h3>
              <p className="text-muted-foreground">
                Talep numaraniz: <strong className="text-foreground">{claim.claimNumber}</strong>.
                Ekibimiz en kisa surede talebinizi inceleyecek.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/taleplerim">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{claim.claimNumber}</h1>
              {getStatusBadge(claim.status)}
            </div>
            <p className="text-muted-foreground mt-1">
              {claim.flightNumber} - {claim.airline?.name || 'Havayolu belirtilmedi'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Mesaj Gonder
          </Button>

          {/* Contract Preview Dialog */}
          <Dialog open={contractPreviewOpen} onOpenChange={setContractPreviewOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Eye className="h-4 w-4" />
                Sozlesme Onizle
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5 text-primary" />
                  Alacak Temlik Sozlesmesi
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-800">ONEMLI / IMPORTANT</p>
                  <p className="text-yellow-700 mt-1">
                    Bu sozlesme ile tazminat alacaginizin TAM MULKIYETINI Sirkete devrediyorsunuz.
                  </p>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">1. TARAFLAR</h4>
                  <p><strong>Musteri:</strong> {claim.passengers[0]?.firstName} {claim.passengers[0]?.lastName}</p>
                  <p><strong>Sirket:</strong> UcusTazminat</p>
                </div>

                <div className="border rounded-lg p-4 space-y-3">
                  <h4 className="font-semibold">2. UCUS BILGILERI</h4>
                  <p><strong>Ucus No:</strong> {claim.flightNumber}</p>
                  <p><strong>Guzergah:</strong> {claim.departureAirport?.iataCode} → {claim.arrivalAirport?.iataCode}</p>
                  <p><strong>Tarih:</strong> {new Date(claim.flightDate).toLocaleDateString('tr-TR')}</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <p className="font-bold text-green-800 text-lg">NO WIN = NO FEE</p>
                  <p className="text-green-700">Basarili: %25 Komisyon | Basarisiz: 0 TL</p>
                </div>

                {claim.consentSignature && (
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Imza</h4>
                    <div className="bg-gray-50 rounded p-2 inline-block">
                      <img
                        src={claim.consentSignature}
                        alt="Imza"
                        className="max-h-20"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Imza Tarihi: {claim.consentSignedAt
                        ? new Date(claim.consentSignedAt).toLocaleString('tr-TR')
                        : '-'}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setContractPreviewOpen(false)}>
                  Kapat
                </Button>
                <Button onClick={downloadContractPDF} disabled={pdfLoading} className="gap-2">
                  {pdfLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  PDF Indir
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button onClick={downloadContractPDF} disabled={pdfLoading} className="gap-2">
            {pdfLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            PDF Indir
          </Button>
        </div>
      </div>

      {/* Progress Timeline */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            Ilerleme Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {timelineSteps.map((step, index) => (
              <div key={step.status} className="flex items-center">
                <div className="flex flex-col items-center min-w-[80px]">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full transition-all ${
                      index <= currentStepIndex
                        ? 'bg-primary text-white shadow-lg shadow-primary/30'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < currentStepIndex ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <Circle className="h-6 w-6" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium text-center ${
                      index <= currentStepIndex ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < timelineSteps.length - 1 && (
                  <div
                    className={`h-1 w-12 sm:w-16 lg:w-24 rounded transition-colors ${
                      index < currentStepIndex ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Flight Details */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Plane className="h-4 w-4 text-primary" />
                </div>
                Ucus Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Kalkis</p>
                  <p className="font-semibold mt-1">
                    {claim.departureAirport?.cityLocal || claim.departureAirport?.city}
                  </p>
                  <p className="text-sm text-muted-foreground">{claim.departureAirport?.iataCode}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Varis</p>
                  <p className="font-semibold mt-1">
                    {claim.arrivalAirport?.cityLocal || claim.arrivalAirport?.city}
                  </p>
                  <p className="text-sm text-muted-foreground">{claim.arrivalAirport?.iataCode}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Tarih</p>
                  <p className="font-semibold mt-1">
                    {new Date(claim.flightDate).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Havayolu</p>
                  <p className="font-semibold mt-1">{claim.airline?.name || '-'}</p>
                </div>
              </div>
              <Separator />
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Sorun Tipi</p>
                  <Badge variant="outline" className="mt-1">
                    {getDisruptionLabel(claim.disruptionType)}
                  </Badge>
                </div>
                {claim.delayDuration && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Gecikme Suresi</p>
                    <p className="font-semibold mt-1">{claim.delayDuration} saat</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Passengers */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                Yolcular ({claim.passengers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {claim.passengers.map((passenger) => (
                  <div
                    key={passenger.id}
                    className="flex items-center justify-between rounded-xl bg-muted/50 p-4 transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <span className="font-semibold text-primary">
                          {passenger.firstName[0]}
                          {passenger.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {passenger.firstName} {passenger.lastName}
                          {passenger.isPrimary && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Ana Yolcu
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{passenger.email || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                Belgeler ({claim.documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {claim.documents.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {claim.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 rounded-xl border p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        {doc.fileType?.startsWith('image') ? (
                          <ImageIcon className="h-6 w-6 text-primary" />
                        ) : (
                          <File className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(doc.uploadedAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">Henuz belge yuklenmedi.</p>
                </div>
              )}
              <Button variant="outline" className="mt-4 w-full">
                Belge Ekle
              </Button>
            </CardContent>
          </Card>

          {/* Signed Contract Section */}
          {claim.consentSignature && (
            <Card className="card-hover border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <FileSignature className="h-4 w-4 text-primary" />
                  </div>
                  Imzali Sozlesme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">Alacak Temlik Sozlesmesi</p>
                    <p className="text-sm text-muted-foreground">
                      Imza Tarihi: {claim.consentSignedAt
                        ? new Date(claim.consentSignedAt).toLocaleString('tr-TR')
                        : '-'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setContractPreviewOpen(true)} className="gap-2">
                      <Eye className="h-4 w-4" />
                      Onizle
                    </Button>
                    <Button onClick={downloadContractPDF} disabled={pdfLoading} className="gap-2">
                      {pdfLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      PDF Indir
                    </Button>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-2">Imzaniz:</p>
                  <img
                    src={claim.consentSignature}
                    alt="Imza"
                    className="max-h-16 border rounded p-1 bg-gray-50"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Activity Log */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                Islem Gecmisi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {claim.statusHistory.map((item, index) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                      {index < claim.statusHistory.length - 1 && (
                        <div className="flex-1 w-0.5 bg-border my-2" />
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className="font-medium">{item.note || `Durum: ${item.toStatus}`}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.createdAt).toLocaleString('tr-TR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Compensation Summary */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 card-hover">
            <CardContent className="p-6">
              <p className="text-sm font-medium text-primary">Tahmini Tazminat</p>
              <p className="text-4xl font-bold text-primary mt-1">
                EUR{compensationNum}
              </p>
              <Separator className="my-4 bg-primary/20" />
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Komisyon (%25)</span>
                  <span className="font-medium">EUR{commission.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-primary">Size Kalacak</span>
                  <span className="text-primary">EUR{netPayout.toFixed(0)}</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/80 rounded-lg text-center">
                <p className="text-xs font-semibold text-primary">NO WIN = NO FEE</p>
                <p className="text-xs text-muted-foreground">Basarisiz olursak ucret yok</p>
              </div>
            </CardContent>
          </Card>

          {/* IBAN Info */}
          {claim.passengerIban && (
            <Card className="card-hover">
              <CardContent className="p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">Odeme IBAN</p>
                <p className="font-mono text-sm bg-muted p-2 rounded break-all">{claim.passengerIban}</p>
              </CardContent>
            </Card>
          )}

          {/* Need Help */}
          <Card className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Yardima mi ihtiyaciniz var?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Sorulariniz icin bize ulasabilirsiniz.
                  </p>
                  <Button variant="link" className="mt-2 h-auto p-0 text-primary">
                    Destek Ekibine Ulas →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
