'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText,
  Users,
  Banknote,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Eye,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'

interface DashboardStats {
  stats: {
    totalClaims: number
    totalUsers: number
    totalCompensation: number
    successRate: number
    monthlyNewClaims: number
  }
  statusCounts: {
    draft: number
    submitted: number
    underReview: number
    documentsRequested: number
    airlineContacted: number
    approved: number
    rejected: number
    paid: number
  }
  recentClaims: Array<{
    id: string
    claimNumber: string
    userName: string
    route: string
    amount: number
    status: string
    createdAt: string
  }>
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="secondary">Taslak</Badge>
    case 'SUBMITTED':
      return <Badge className="bg-blue-500">Gönderildi</Badge>
    case 'UNDER_REVIEW':
      return <Badge className="bg-yellow-500">İnceleniyor</Badge>
    case 'DOCUMENTS_REQUESTED':
      return <Badge className="bg-orange-500">Belge Bekleniyor</Badge>
    case 'AIRLINE_CONTACTED':
      return <Badge className="bg-indigo-500">Havayoluna İletildi</Badge>
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) {
        throw new Error('İstatistikler alınamadı')
      }
      const result = await response.json()
      setData(result)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-600" />
            <div className="flex-1">
              <p className="font-medium text-red-800">Hata oluştu</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <Button onClick={fetchStats} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const stats = [
    {
      title: 'Toplam Talep',
      value: data?.stats.totalClaims.toLocaleString('tr-TR') || '0',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Aktif Kullanıcı',
      value: data?.stats.totalUsers.toLocaleString('tr-TR') || '0',
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Toplam Tazminat',
      value: `€${(data?.stats.totalCompensation || 0).toLocaleString('tr-TR')}`,
      icon: Banknote,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Başarı Oranı',
      value: `%${data?.stats.successRate || 0}`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  const claimStats = [
    { status: 'Bekleyen', count: (data?.statusCounts.submitted || 0) + (data?.statusCounts.draft || 0), icon: Clock, color: 'text-yellow-600' },
    { status: 'İncelenen', count: (data?.statusCounts.underReview || 0) + (data?.statusCounts.airlineContacted || 0), icon: FileText, color: 'text-blue-600' },
    { status: 'Onaylanan', count: (data?.statusCounts.approved || 0) + (data?.statusCounts.paid || 0), icon: CheckCircle2, color: 'text-green-600' },
    { status: 'Reddedilen', count: data?.statusCounts.rejected || 0, icon: XCircle, color: 'text-red-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Hoş geldiniz. İşte güncel istatistikler.
          </p>
        </div>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  {data?.stats.monthlyNewClaims || 0} bu ay
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Claim Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {claimStats.map((stat) => (
          <Card key={stat.status}>
            <CardContent className="flex items-center gap-4 p-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold">{stat.count}</p>
                <p className="text-sm text-muted-foreground">{stat.status}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Claims */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Son Talepler</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/talepler">
              Tümünü Gör
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {data?.recentClaims && data.recentClaims.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="pb-3 font-medium">Talep No</th>
                    <th className="pb-3 font-medium">Kullanıcı</th>
                    <th className="pb-3 font-medium">Rota</th>
                    <th className="pb-3 font-medium">Tutar</th>
                    <th className="pb-3 font-medium">Durum</th>
                    <th className="pb-3 font-medium">Tarih</th>
                    <th className="pb-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentClaims.map((claim) => (
                    <tr key={claim.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{claim.claimNumber}</td>
                      <td className="py-3">{claim.userName}</td>
                      <td className="py-3">{claim.route}</td>
                      <td className="py-3 font-semibold">€{claim.amount}</td>
                      <td className="py-3">{getStatusBadge(claim.status)}</td>
                      <td className="py-3 text-muted-foreground">
                        {new Date(claim.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/admin/talepler/${claim.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Henüz talep bulunmuyor</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
