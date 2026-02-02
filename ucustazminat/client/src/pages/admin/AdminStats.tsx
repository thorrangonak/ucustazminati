import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  FileText, 
  Plane as PlaneIcon, 
  BarChart3,
  LogOut,
  TrendingUp,
  TrendingDown,
  Euro,
  Users,
  Clock,
  CheckCircle,
  BookOpen,
  HeadphonesIcon
} from "lucide-react";

export default function AdminStats() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: overview, isLoading: overviewLoading } = trpc.stats.overview.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: airlineStats, isLoading: airlineLoading } = trpc.stats.byAirline.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
    if (!loading && isAuthenticated && user?.role !== 'admin') {
      setLocation('/dashboard');
    }
  }, [loading, isAuthenticated, user]);
  
  if (loading || !isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary animate-pulse" />
          <span className="text-lg font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  const successRate = overview?.totalClaims 
    ? ((overview.statusBreakdown?.paid || 0) / overview.totalClaims * 100).toFixed(1)
    : 0;
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:block">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary" />
            <span className="font-bold text-xl tracking-tight">UçuşTazminat</span>
          </Link>
        </div>
        
        <nav className="px-4 space-y-1">
          <Link href="/admin">
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent transition-colors">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </div>
          </Link>
          <Link href="/admin/claims">
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent transition-colors">
              <FileText className="w-5 h-5" />
              <span>Talepler</span>
            </div>
          </Link>
          <Link href="/admin/airlines">
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent transition-colors">
              <PlaneIcon className="w-5 h-5" />
              <span>Havayolları</span>
            </div>
          </Link>
          <Link href="/admin/stats">
            <div className="flex items-center gap-3 px-3 py-2 bg-sidebar-accent text-sidebar-accent-foreground">
              <BarChart3 className="w-5 h-5" />
              <span>İstatistikler</span>
            </div>
          </Link>
          <Link href="/admin/blog">
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent transition-colors">
              <BookOpen className="w-5 h-5" />
              <span>Blog</span>
            </div>
          </Link>
          <Link href="/admin/support">
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent transition-colors">
              <HeadphonesIcon className="w-5 h-5" />
              <span>Destek</span>
            </div>
          </Link>
        </nav>
        
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="font-medium">{user?.name}</div>
              <div className="text-sidebar-foreground/60">Admin</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => logout()} className="text-sidebar-foreground">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">İstatistikler</h1>
            <p className="text-muted-foreground">Platform performansını ve tazminat istatistiklerini görüntüleyin.</p>
          </div>
          
          {overviewLoading ? (
            <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
          ) : (
            <>
              {/* Overview Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="border-2 border-foreground/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <FileText className="w-8 h-8 text-primary" />
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{overview?.totalClaims || 0}</div>
                    <div className="text-sm text-muted-foreground">Toplam Talep</div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-foreground/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Euro className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {overview?.totalCompensation?.toLocaleString('tr-TR') || 0} €
                    </div>
                    <div className="text-sm text-muted-foreground">Toplam Tazminat</div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-foreground/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <div className="text-3xl font-bold mb-1">{successRate}%</div>
                    <div className="text-sm text-muted-foreground">Başarı Oranı</div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-foreground/10">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                    <div className="text-3xl font-bold mb-1">
                      {(overview?.statusBreakdown?.submitted || 0) + 
                       (overview?.statusBreakdown?.under_review || 0) +
                       (overview?.statusBreakdown?.sent_to_airline || 0)}
                    </div>
                    <div className="text-sm text-muted-foreground">Aktif Talepler</div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Status Distribution */}
              <div className="grid lg:grid-cols-2 gap-6 mb-8">
                <Card className="border-2 border-foreground/10">
                  <CardHeader>
                    <CardTitle>Durum Dağılımı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {overview?.statusBreakdown && Object.entries(overview.statusBreakdown)
                        .sort((a, b) => b[1] - a[1])
                        .map(([status, count]) => (
                          <div key={status} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                              <span className="font-medium">{count}</span>
                            </div>
                            <div className="w-full h-2 bg-muted overflow-hidden">
                              <div 
                                className="h-full bg-primary transition-all" 
                                style={{ width: `${(count / (overview.totalClaims || 1)) * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-2 border-foreground/10">
                  <CardHeader>
                    <CardTitle>Aylık Performans</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {overview?.monthlyStats?.slice(0, 6).map((month) => (
                        <div key={month.month} className="flex items-center justify-between p-3 bg-secondary">
                          <div>
                            <div className="font-medium">{month.month}</div>
                            <div className="text-sm text-muted-foreground">{month.count} talep</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{month.compensation.toLocaleString('tr-TR')} €</div>
                            <div className="text-sm text-muted-foreground">tazminat</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Airline Stats */}
              <Card className="border-2 border-foreground/10">
                <CardHeader>
                  <CardTitle>Havayolu Bazlı İstatistikler</CardTitle>
                </CardHeader>
                <CardContent>
                  {airlineLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Yükleniyor...</div>
                  ) : airlineStats && airlineStats.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="border-b border-foreground/10">
                          <tr>
                            <th className="text-left p-4 font-medium">Havayolu</th>
                            <th className="text-right p-4 font-medium">Talep Sayısı</th>
                            <th className="text-right p-4 font-medium">Toplam Tazminat</th>
                            <th className="text-right p-4 font-medium">Ödenen</th>
                            <th className="text-right p-4 font-medium">Başarı Oranı</th>
                          </tr>
                        </thead>
                        <tbody>
                          {airlineStats.map((stat) => {
                            const paidCount = stat.approvedClaims || 0;
                            const rate = stat.totalClaims > 0 
                              ? (paidCount / stat.totalClaims * 100).toFixed(1)
                              : 0;
                            return (
                              <tr key={stat.airlineId} className="border-b border-foreground/5">
                                <td className="p-4">
                                  <div className="font-medium">{stat.airline?.code || 'Bilinmiyor'}</div>
                                  <div className="text-sm text-muted-foreground">{stat.airline?.name}</div>
                                </td>
                                <td className="p-4 text-right">{stat.totalClaims}</td>
                                <td className="p-4 text-right font-medium">{stat.totalCompensation?.toLocaleString('tr-TR') || 0} €</td>
                                <td className="p-4 text-right">{stat.approvedClaims || 0}</td>
                                <td className="p-4 text-right">
                                  <span className={`font-medium ${Number(rate) >= 50 ? 'text-green-600' : 'text-orange-600'}`}>
                                    {rate}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Henüz havayolu istatistiği yok
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
