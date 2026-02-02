import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LayoutDashboard, 
  FileText, 
  Plane as PlaneIcon, 
  BarChart3,
  LogOut,
  Search,
  ChevronRight,
  Filter,
  Menu,
  X,
  BookOpen,
  HeadphonesIcon,
  Users
} from "lucide-react";

const statusLabels: Record<string, string> = {
  draft: "Taslak",
  submitted: "Gönderildi",
  under_review: "İnceleniyor",
  documents_needed: "Belge Bekleniyor",
  sent_to_airline: "Havayoluna Gönderildi",
  airline_response: "Havayolu Yanıtı",
  legal_action: "Hukuki Süreç",
  approved: "Onaylandı",
  payment_pending: "Ödeme Bekleniyor",
  paid: "Ödendi",
  rejected: "Reddedildi",
  closed: "Kapatıldı",
};

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-blue-100 text-blue-800",
  under_review: "bg-yellow-100 text-yellow-800",
  documents_needed: "bg-orange-100 text-orange-800",
  sent_to_airline: "bg-purple-100 text-purple-800",
  airline_response: "bg-indigo-100 text-indigo-800",
  legal_action: "bg-red-100 text-red-800",
  approved: "bg-green-100 text-green-800",
  payment_pending: "bg-emerald-100 text-emerald-800",
  paid: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white",
  closed: "bg-gray-500 text-white",
};

export default function AdminClaims() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(params.get("status") || "all");
  const [page, setPage] = useState(1);
  
  const { data, isLoading, refetch } = trpc.admin.claims.list.useQuery(
    { 
      status: statusFilter !== "all" ? statusFilter : undefined,
      search: searchTerm || undefined,
      page,
      limit: 20
    },
    { enabled: isAuthenticated && user?.role === 'admin' }
  );
  
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
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard", active: false },
    { href: "/admin/claims", icon: FileText, label: "Talepler", active: true },
    { href: "/admin/users", icon: Users, label: "Kullanıcılar", active: false },
    { href: "/admin/airlines", icon: PlaneIcon, label: "Havayolları", active: false },
    { href: "/admin/stats", icon: BarChart3, label: "İstatistikler", active: false },
    { href: "/admin/blog", icon: BookOpen, label: "Blog", active: false },
    { href: "/admin/support", icon: HeadphonesIcon, label: "Destek", active: false },
  ];
  
  return (
    <div className="min-h-screen bg-background flex">
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
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">Talepler</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Tüm tazminat taleplerini yönetin.</p>
          </div>
          
          {/* Filters */}
          <Card className="border-2 border-foreground/10 mb-4 sm:mb-6">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col gap-3 sm:gap-4 md:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Talep no, uçuş no veya yolcu adı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 text-sm"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Durum filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Claims - Mobile Card View */}
          <div className="md:hidden space-y-3">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
            ) : data?.claims && data.claims.length > 0 ? (
              data.claims.map((claim) => (
                <Link key={claim.id} href={`/admin/claims/${claim.id}`}>
                  <Card className="border border-foreground/10 hover:border-primary/50 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-medium text-sm">{claim.claimNumber}</span>
                          <div className="text-xs text-muted-foreground">{claim.passengerName}</div>
                        </div>
                        <Badge className={`${statusColors[claim.status]} text-xs`}>
                          {statusLabels[claim.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-medium">{claim.flightNumber}</span>
                          <span className="text-muted-foreground ml-1">
                            {claim.departureAirport} → {claim.arrivalAirport}
                          </span>
                        </div>
                        <span className="font-medium">{claim.compensationAmount} €</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(claim.flightDate).toLocaleDateString('tr-TR')}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                Talep bulunamadı
              </div>
            )}
          </div>
          
          {/* Claims Table - Desktop */}
          <Card className="border-2 border-foreground/10 hidden md:block">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Yükleniyor...</div>
              ) : data?.claims && data.claims.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-foreground/10 bg-secondary">
                      <tr>
                        <th className="text-left p-4 font-medium text-sm">Talep No</th>
                        <th className="text-left p-4 font-medium text-sm">Yolcu</th>
                        <th className="text-left p-4 font-medium text-sm">Uçuş</th>
                        <th className="text-left p-4 font-medium text-sm">Tarih</th>
                        <th className="text-left p-4 font-medium text-sm">Tazminat</th>
                        <th className="text-left p-4 font-medium text-sm">Durum</th>
                        <th className="text-left p-4 font-medium text-sm"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.claims.map((claim) => (
                        <tr key={claim.id} className="border-b border-foreground/5 hover:bg-secondary/50">
                          <td className="p-4">
                            <span className="font-medium text-sm">{claim.claimNumber}</span>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">{claim.passengerName}</div>
                            <div className="text-xs text-muted-foreground">{claim.passengerEmail}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm font-medium">{claim.flightNumber}</div>
                            <div className="text-xs text-muted-foreground">
                              {claim.departureAirport} → {claim.arrivalAirport}
                            </div>
                          </td>
                          <td className="p-4 text-sm">
                            {new Date(claim.flightDate).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="p-4 font-medium text-sm">
                            {claim.compensationAmount} €
                          </td>
                          <td className="p-4">
                            <Badge className={statusColors[claim.status]}>
                              {statusLabels[claim.status]}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Link href={`/admin/claims/${claim.id}`}>
                              <Button variant="ghost" size="sm">
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  Talep bulunamadı
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Pagination */}
          {data && data.total > 20 && (
            <div className="flex justify-center gap-2 mt-4 sm:mt-6">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Önceki
              </Button>
              <span className="flex items-center px-2 sm:px-4 text-xs sm:text-sm">
                Sayfa {page} / {Math.ceil(data.total / 20)}
              </span>
              <Button
                variant="outline"
                disabled={page >= Math.ceil(data.total / 20)}
                onClick={() => setPage(p => p + 1)}
                size="sm"
                className="text-xs sm:text-sm"
              >
                Sonraki
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
