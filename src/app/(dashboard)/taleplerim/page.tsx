import { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PlusCircle,
  Search,
  ArrowRight,
  Plane,
  Calendar,
  AlertCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Taleplerim - UçuşTazminat',
  description: 'Tazminat taleplerinizi görüntüleyin ve yönetin',
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

export default async function ClaimsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/giris')
  }

  const claims = await prisma.claim.findMany({
    where: { userId: session.user.id },
    include: {
      departureAirport: true,
      arrivalAirport: true,
      airline: true,
      passengers: {
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const hasClaims = claims.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Taleplerim</h1>
          <p className="text-muted-foreground">
            {hasClaims
              ? `Toplam ${claims.length} talep`
              : 'Tüm tazminat taleplerinizi buradan görüntüleyin'}
          </p>
        </div>
        <Link href="/yeni-talep">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Talep
          </Button>
        </Link>
      </div>

      {/* Filters */}
      {hasClaims && (
        <Card>
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Talep numarası veya uçuş ara..."
                className="pl-9"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="SUBMITTED">Gönderildi</SelectItem>
                <SelectItem value="UNDER_REVIEW">İnceleniyor</SelectItem>
                <SelectItem value="APPROVED">Onaylandı</SelectItem>
                <SelectItem value="REJECTED">Reddedildi</SelectItem>
                <SelectItem value="PAID">Ödendi</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest">
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
      )}

      {/* Claims List */}
      {hasClaims ? (
        <div className="space-y-4">
          {claims.map((claim) => (
            <Link key={claim.id} href={`/taleplerim/${claim.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    {/* Left Side - Claim Info */}
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Plane className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{claim.claimNumber}</p>
                          {getStatusBadge(claim.status)}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {claim.flightNumber} • {claim.airline?.name || 'Havayolu belirtilmedi'}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                          <span className="flex items-center gap-1">
                            <Plane className="h-3 w-3" />
                            {claim.departureAirport?.iataCode} → {claim.arrivalAirport?.iataCode}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(claim.flightDate).toLocaleDateString('tr-TR')}
                          </span>
                          <Badge variant="outline">
                            {getDisruptionLabel(claim.disruptionType)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Amount */}
                    <div className="flex items-center gap-4 sm:text-right">
                      <div>
                        <p className="text-sm text-muted-foreground">Tazminat</p>
                        <p className="text-2xl font-bold text-primary">
                          €{Number(claim.compensationAmount || 0)}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">Henüz talebiniz yok</h3>
            <p className="mt-1 text-muted-foreground">
              İlk tazminat talebinizi oluşturmak için başlayın.
            </p>
            <Link href="/yeni-talep" className="mt-6">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Yeni Talep Oluştur
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
