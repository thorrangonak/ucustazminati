import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { SEOHead, SEO_CONFIG } from "@/components/SEOHead";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import { ClaimProgressBar } from "@/components/ClaimProgressBar";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Bell,
  LogOut,
  ChevronRight,
  Settings,
  Menu,
  X,
  Home
} from "lucide-react";
import { useEffect, useState } from "react";

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

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const { data: claims, isLoading: claimsLoading } = trpc.claims.myList.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: notifications } = trpc.notifications.myList.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);
  
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-primary animate-pulse" />
          <span className="text-base sm:text-lg font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }
  
  const activeClaims = claims?.filter(c => !['paid', 'rejected', 'closed'].includes(c.status)) || [];
  const completedClaims = claims?.filter(c => ['paid', 'rejected', 'closed'].includes(c.status)) || [];
  
  const totalCompensation = claims?.reduce((sum, c) => {
    if (c.status === 'paid' && c.netPayoutAmount) {
      return sum + parseFloat(c.netPayoutAmount);
    }
    return sum;
  }, 0) || 0;
  
  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.dashboard} />
      {/* E-posta Doğrulama Uyarısı */}
      <EmailVerificationBanner />
      {/* Header */}
      <header className="border-b border-foreground/10 bg-background sticky top-0 z-50">
        <div className="container flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary" />
            <span className="font-bold text-lg sm:text-xl tracking-tight">UçuşTazminat</span>
          </Link>
          
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2 sm:gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4 mr-2" />
                Ana Sayfa
              </Button>
            </Link>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount && unreadCount.count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {unreadCount.count}
                </span>
              )}
            </Button>
            
            {user?.role === 'admin' && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              </Link>
            )}
            
            <Button variant="ghost" size="sm" onClick={() => logout()}>
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış
            </Button>
          </div>
          
          {/* Mobile Actions */}
          <div className="flex sm:hidden items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount && unreadCount.count > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  {unreadCount.count}
                </span>
              )}
            </Button>
            
            <button 
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="sm:hidden border-t border-foreground/10 bg-background">
            <div className="container py-3 space-y-2">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="w-4 h-4 mr-2" />
                  Ana Sayfa
                </Button>
              </Link>
              
              {user?.role === 'admin' && (
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              
              <Button variant="ghost" className="w-full justify-start" onClick={() => { logout(); setMobileMenuOpen(false); }}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış Yap
              </Button>
            </div>
          </nav>
        )}
      </header>
      
      <main className="container py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">
              Hoş Geldiniz, {user?.name?.split(' ')[0] || 'Kullanıcı'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Tazminat taleplerinizi buradan takip edebilirsiniz.
            </p>
          </div>
          <Link href="/dashboard/new-claim" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Talep Oluştur
            </Button>
          </Link>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="border-2 border-foreground/10">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground truncate">Toplam Talep</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{claims?.length || 0}</div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-foreground/10">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">Aktif</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{activeClaims.length}</div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-foreground/10">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">Tamamlanan</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{completedClaims.length}</div>
            </CardContent>
          </Card>
          
          <Card className="border-2 border-foreground/10">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <span className="text-xs sm:text-sm text-muted-foreground">Toplam Kazanç</span>
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{totalCompensation.toFixed(0)} €</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Claims List */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold">Taleplerim</h2>
          </div>
          
          {claimsLoading ? (
            <div className="text-center py-8 sm:py-12 text-muted-foreground text-sm sm:text-base">Yükleniyor...</div>
          ) : claims && claims.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {claims.map((claim) => (
                <Link key={claim.id} href={`/dashboard/claims/${claim.id}`}>
                  <Card className="border-2 border-foreground/10 hover:border-primary transition-colors cursor-pointer">
                    <CardContent className="p-3 sm:p-4 md:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-secondary flex items-center justify-center flex-shrink-0">
                            <Plane className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-bold text-sm sm:text-base">{claim.claimNumber}</span>
                              <Badge className={`${statusColors[claim.status]} text-xs`}>
                                {statusLabels[claim.status]}
                              </Badge>
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {claim.flightNumber} • {claim.departureAirport} → {claim.isConnecting && claim.connectionAirport ? `${claim.connectionAirport} → ` : ''}{claim.arrivalAirport}
                              {claim.isConnecting && claim.flight2Number && (
                                <span className="ml-1 text-muted-foreground/70">({claim.flight2Number})</span>
                              )}
                            </div>
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {new Date(claim.flightDate).toLocaleDateString('tr-TR')}
                            </div>
                            {/* İlerleme Çubuğu */}
                            <div className="mt-2">
                              <ClaimProgressBar status={claim.status} variant="compact" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-foreground/10">
                          <div className="text-left sm:text-right">
                            <div className="text-xs sm:text-sm text-muted-foreground">Tazminat</div>
                            <div className="font-bold text-sm sm:text-base">{claim.compensationAmount} €</div>
                          </div>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-foreground/20">
              <CardContent className="p-6 sm:p-8 md:p-12 text-center">
                <Plane className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
                <h3 className="text-base sm:text-lg font-bold mb-1 sm:mb-2">Henüz talebiniz yok</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  İlk tazminat talebinizi oluşturarak başlayın.
                </p>
                <Link href="/dashboard/new-claim">
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Talep Oluştur
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
