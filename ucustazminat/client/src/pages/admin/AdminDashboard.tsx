import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { SEOHead, SEO_CONFIG } from "@/components/SEOHead";
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
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  Euro,
  Menu,
  X,
  BookOpen,
  HeadphonesIcon
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: stats, isLoading } = trpc.stats.overview.useQuery(undefined, {
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
  
  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard", active: true },
    { href: "/admin/claims", icon: FileText, label: "Talepler", active: false },
    { href: "/admin/users", icon: Users, label: "Kullanıcılar", active: false },
    { href: "/admin/airlines", icon: PlaneIcon, label: "Havayolları", active: false },
    { href: "/admin/stats", icon: BarChart3, label: "İstatistikler", active: false },
    { href: "/admin/blog", icon: BookOpen, label: "Blog", active: false },
    { href: "/admin/support", icon: HeadphonesIcon, label: "Destek", active: false },
  ];
  
  return (
    <div className="min-h-screen bg-background flex">
      <SEOHead {...SEO_CONFIG.admin} />
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-foreground/10">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary" />
            <span className="font-bold text-lg tracking-tight">UçuşTazminat</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-foreground/10 shadow-lg">
            <nav className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                    item.active ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                  }`}>
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t border-foreground/10">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-muted-foreground">Admin</div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => logout()}>
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border hidden md:block fixed h-full">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary" />
            <span className="font-bold text-xl tracking-tight">UçuşTazminat</span>
          </Link>
        </div>
        
        <nav className="px-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                item.active ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent transition-colors'
              }`}>
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
            </Link>
          ))}
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
      <main className="flex-1 p-4 sm:p-6 md:p-8 pt-20 md:pt-8 md:ml-64">
        <div className="max-w-7xl mx-auto">
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Tazminat taleplerini ve sistemin genel durumunu izleyin.</p>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
            <Card className="border-2 border-foreground/10">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1">{stats?.totalClaims || 0}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Toplam Talep</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-foreground/10">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1">
                  {(stats?.statusBreakdown?.submitted || 0) + (stats?.statusBreakdown?.under_review || 0)}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Bekleyen</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-foreground/10">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                </div>
                <div className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5 sm:mb-1">{stats?.statusBreakdown?.paid || 0}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Ödenen</div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-foreground/10">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <Euro className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                </div>
                <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold mb-0.5 sm:mb-1 truncate">
                  {stats?.totalCompensation?.toLocaleString('tr-TR') || 0} €
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Toplam Tazminat</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Status Breakdown */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 md:mb-8">
            <Card className="border-2 border-foreground/10">
              <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Durum Dağılımı</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {stats?.statusBreakdown && Object.entries(stats.statusBreakdown).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm capitalize truncate">{status.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-16 sm:w-24 md:w-32 h-2 bg-muted overflow-hidden rounded-full">
                          <div 
                            className="h-full bg-primary rounded-full" 
                            style={{ width: `${(count / (stats.totalClaims || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs sm:text-sm font-medium w-6 sm:w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-foreground/10">
              <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">Aylık Talepler</CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <div className="space-y-3 sm:space-y-4">
                  {stats?.monthlyStats?.slice(0, 6).map((month) => (
                    <div key={month.month} className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm truncate">{month.month}</span>
                      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <span className="text-xs sm:text-sm">{month.count} talep</span>
                        <span className="text-xs sm:text-sm font-medium">{month.compensation.toLocaleString('tr-TR')} €</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <Card className="border-2 border-foreground/10">
            <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Hızlı İşlemler</CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4">
                <Link href="/admin/claims?status=submitted">
                  <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Yeni Talepler ({stats?.statusBreakdown?.submitted || 0})
                  </Button>
                </Link>
                <Link href="/admin/claims?status=documents_needed">
                  <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                    <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Belge Bekleyenler ({stats?.statusBreakdown?.documents_needed || 0})
                  </Button>
                </Link>
                <Link href="/admin/claims?status=payment_pending">
                  <Button variant="outline" className="w-full sm:w-auto text-xs sm:text-sm">
                    <Euro className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Ödeme Bekleyenler ({stats?.statusBreakdown?.payment_pending || 0})
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
