import { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  Banknote,
  ArrowRight,
  AlertCircle,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Dashboard - UçuşTazminat',
  description: 'Taleplerinizi yönetin',
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="secondary">Taslak</Badge>
    case 'SUBMITTED':
      return <Badge className="bg-blue-500">Gönderildi</Badge>
    case 'UNDER_REVIEW':
      return <Badge className="bg-yellow-500">İnceleniyor</Badge>
    case 'APPROVED':
      return <Badge className="bg-green-500">Onaylandı</Badge>
    case 'REJECTED':
      return <Badge variant="destructive">Reddedildi</Badge>
    case 'PAID':
      return <Badge className="bg-purple-500">Ödendi</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/giris')
  }

  // Get user's claims with related data
  const claims = await prisma.claim.findMany({
    where: { userId: session.user.id },
    include: {
      departureAirport: true,
      arrivalAirport: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5, // Only get last 5 for dashboard
  })

  // Calculate stats
  const totalClaims = claims.length
  const pendingClaims = claims.filter(c =>
    ['SUBMITTED', 'UNDER_REVIEW', 'DOCUMENTS_REQUESTED', 'AIRLINE_CONTACTED'].includes(c.status)
  ).length
  const approvedClaims = claims.filter(c => ['APPROVED', 'PAID'].includes(c.status)).length
  const totalAmount = claims.reduce((sum, c) => sum + Number(c.compensationAmount || 0), 0)

  const stats = [
    {
      title: 'Toplam Talep',
      value: totalClaims.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'İşlem Bekleyen',
      value: pendingClaims.toString(),
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Onaylanan',
      value: approvedClaims.toString(),
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Toplam Tutar',
      value: `€${totalAmount}`,
      icon: Banknote,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ]

  const hasClaims = claims.length > 0

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Hoş Geldiniz{session.user.name ? `, ${session.user.name.split(' ')[0]}` : ''}!
          </h1>
          <p className="text-muted-foreground">
            Taleplerinizi buradan takip edebilirsiniz.
          </p>
        </div>
        <Link href="/yeni-talep">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Talep
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Claims */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Son Talepler</CardTitle>
          {hasClaims && (
            <Link href="/taleplerim">
              <Button variant="ghost" size="sm">
                Tümünü Gör
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardContent>
          {hasClaims ? (
            <div className="space-y-4">
              {claims.map((claim) => (
                <Link
                  key={claim.id}
                  href={`/taleplerim/${claim.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{claim.claimNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {claim.flightNumber} • {claim.departureAirport?.iataCode} → {claim.arrivalAirport?.iataCode} •{' '}
                        {new Date(claim.flightDate).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">€{Number(claim.compensationAmount || 0)}</p>
                      {getStatusBadge(claim.status)}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <AlertCircle className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 font-medium">Henüz talebiniz yok</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Yeni bir tazminat talebi oluşturmak için başlayın.
              </p>
              <Link href="/yeni-talep" className="mt-4">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Yeni Talep Oluştur
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-start gap-4 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-blue-900">İpucu</h3>
            <p className="mt-1 text-sm text-blue-800">
              Talebinizin hızlı işlenmesi için biniş kartı ve bilet belgelerinizi
              yüklemeyi unutmayın. Eksik belgeler işlem süresini uzatabilir.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
