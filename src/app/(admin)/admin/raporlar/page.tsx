'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  PieChart,
  Calendar,
} from 'lucide-react'

interface ReportStats {
  totalClaims: number
  totalCompensation: number
  totalCommission: number
  approvalRate: number
  averageProcessingDays: number
  claimsByStatus: Record<string, number>
  claimsByMonth: Array<{ month: string; count: number; amount: number }>
  topAirlines: Array<{ name: string; count: number }>
}

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('last30days')
  const [stats, setStats] = useState<ReportStats>({
    totalClaims: 0,
    totalCompensation: 0,
    totalCommission: 0,
    approvalRate: 0,
    averageProcessingDays: 0,
    claimsByStatus: {},
    claimsByMonth: [],
    topAirlines: [],
  })

  const fetchReports = async () => {
    setLoading(true)
    try {
      // Simulated data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500))

      // Mock data
      setStats({
        totalClaims: 156,
        totalCompensation: 48750,
        totalCommission: 12187.50,
        approvalRate: 73.5,
        averageProcessingDays: 14,
        claimsByStatus: {
          DRAFT: 12,
          SUBMITTED: 28,
          UNDER_REVIEW: 34,
          AIRLINE_CONTACTED: 18,
          APPROVED: 42,
          REJECTED: 15,
          PAID: 7,
        },
        claimsByMonth: [
          { month: 'Ağu', count: 18, amount: 5400 },
          { month: 'Eyl', count: 24, amount: 7800 },
          { month: 'Eki', count: 32, amount: 11200 },
          { month: 'Kas', count: 28, amount: 9600 },
          { month: 'Ara', count: 22, amount: 6400 },
          { month: 'Oca', count: 32, amount: 8350 },
        ],
        topAirlines: [
          { name: 'Turkish Airlines', count: 45 },
          { name: 'Pegasus', count: 32 },
          { name: 'SunExpress', count: 18 },
          { name: 'AnadoluJet', count: 15 },
          { name: 'Lufthansa', count: 12 },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [period])

  const exportReport = (format: 'csv' | 'pdf') => {
    // Export logic
    alert(`Rapor ${format.toUpperCase()} formatında indiriliyor...`)
  }

  const statusLabels: Record<string, string> = {
    DRAFT: 'Taslak',
    SUBMITTED: 'Gönderildi',
    UNDER_REVIEW: 'İnceleniyor',
    DOCUMENTS_REQUESTED: 'Belge Bekleniyor',
    AIRLINE_CONTACTED: 'Havayoluna İletildi',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    PAID: 'Ödendi',
  }

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-400',
    SUBMITTED: 'bg-blue-500',
    UNDER_REVIEW: 'bg-yellow-500',
    DOCUMENTS_REQUESTED: 'bg-orange-500',
    AIRLINE_CONTACTED: 'bg-indigo-500',
    APPROVED: 'bg-green-500',
    REJECTED: 'bg-red-500',
    PAID: 'bg-purple-500',
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Raporlar</h1>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Raporlar</h1>
          <p className="text-muted-foreground">
            Performans ve finansal raporlar
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Son 7 Gün</SelectItem>
              <SelectItem value="last30days">Son 30 Gün</SelectItem>
              <SelectItem value="last90days">Son 90 Gün</SelectItem>
              <SelectItem value="thisYear">Bu Yıl</SelectItem>
              <SelectItem value="allTime">Tüm Zamanlar</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => fetchReports()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
          <Button variant="outline" onClick={() => exportReport('csv')}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button onClick={() => exportReport('pdf')}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Talep</p>
                <p className="text-2xl font-bold">{stats.totalClaims}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +12% önceki döneme göre
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toplam Tazminat</p>
                <p className="text-2xl font-bold">€{stats.totalCompensation.toLocaleString('tr-TR')}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +8% önceki döneme göre
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Kazanılan Komisyon</p>
                <p className="text-2xl font-bold">€{stats.totalCommission.toLocaleString('tr-TR')}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
              %25 komisyon oranı
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Onay Oranı</p>
                <p className="text-2xl font-bold">%{stats.approvalRate}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <TrendingUp className="h-4 w-4" />
              +3% önceki döneme göre
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Claims by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Duruma Göre Talepler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.claimsByStatus).map(([status, count]) => {
                const total = Object.values(stats.claimsByStatus).reduce((a, b) => a + b, 0)
                const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : 0
                return (
                  <div key={status} className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${statusColors[status] || 'bg-gray-400'}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm">
                        <span>{statusLabels[status] || status}</span>
                        <span className="text-muted-foreground">{count} (%{percentage})</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full mt-1">
                        <div
                          className={`h-full rounded-full ${statusColors[status] || 'bg-gray-400'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Airlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              En Çok Talep Alan Havayolları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topAirlines.map((airline, index) => {
                const maxCount = stats.topAirlines[0]?.count || 1
                const percentage = (airline.count / maxCount) * 100
                return (
                  <div key={airline.name} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-6">{index + 1}.</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>{airline.name}</span>
                        <span className="text-muted-foreground">{airline.count} talep</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Aylık Trend
            </CardTitle>
            <CardDescription>
              Son 6 ayın talep ve tazminat verileri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Simple bar chart representation */}
              <div className="flex items-end justify-between gap-2 h-40">
                {stats.claimsByMonth.map((month) => {
                  const maxAmount = Math.max(...stats.claimsByMonth.map(m => m.amount))
                  const height = (month.amount / maxAmount) * 100
                  return (
                    <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-muted rounded-t relative" style={{ height: `${height}%` }}>
                        <div className="absolute inset-0 bg-primary rounded-t opacity-80" />
                      </div>
                      <span className="text-xs text-muted-foreground">{month.month}</span>
                    </div>
                  )
                })}
              </div>
              <div className="grid grid-cols-6 gap-2 text-center text-xs">
                {stats.claimsByMonth.map((month) => (
                  <div key={month.month}>
                    <p className="font-medium">{month.count} talep</p>
                    <p className="text-muted-foreground">€{month.amount.toLocaleString('tr-TR')}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Ortalama İşlem Süresi</p>
            <p className="text-2xl font-bold">{stats.averageProcessingDays} gün</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
            <p className="text-sm text-muted-foreground">Onaylanan Talepler</p>
            <p className="text-2xl font-bold">
              {(stats.claimsByStatus['APPROVED'] || 0) + (stats.claimsByStatus['PAID'] || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <p className="text-sm text-muted-foreground">Reddedilen Talepler</p>
            <p className="text-2xl font-bold">{stats.claimsByStatus['REJECTED'] || 0}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
