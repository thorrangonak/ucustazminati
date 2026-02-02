import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  FileText, 
  Plane as PlaneIcon, 
  BarChart3,
  LogOut,
  Search,
  Menu,
  X,
  BookOpen,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Loader2,
  User,
  Users,
  Calendar,
  HeadphonesIcon
} from "lucide-react";

const statusLabels: Record<string, string> = {
  open: "Açık",
  in_progress: "İşleniyor",
  waiting_response: "Yanıt Bekleniyor",
  resolved: "Çözüldü",
  closed: "Kapatıldı",
};

const statusColors: Record<string, string> = {
  open: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  waiting_response: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
  closed: "bg-gray-100 text-gray-800",
};

const categoryLabels: Record<string, string> = {
  general: "Genel",
  claim: "Talep Hakkında",
  payment: "Ödeme",
  technical: "Teknik",
  other: "Diğer",
};

const priorityLabels: Record<string, string> = {
  low: "Düşük",
  medium: "Normal",
  high: "Yüksek",
  urgent: "Acil",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

export default function AdminSupport() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState("");
  
  const { data: tickets, isLoading, refetch } = trpc.tickets.adminList.useQuery(
    {
      status: statusFilter !== "all" ? statusFilter : undefined,
      category: categoryFilter !== "all" ? categoryFilter : undefined,
    },
    { enabled: isAuthenticated && user?.role === 'admin' }
  );
  
  const { data: ticketDetail, refetch: refetchDetail } = trpc.tickets.get.useQuery(
    { id: selectedTicket! },
    { enabled: !!selectedTicket }
  );
  
  const respondMutation = trpc.tickets.respond.useMutation({
    onSuccess: () => {
      toast.success("Yanıt gönderildi");
      setResponse("");
      refetch();
      refetchDetail();
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu");
    },
  });
  
  const updateStatusMutation = trpc.tickets.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Durum güncellendi");
      setNewStatus("");
      refetch();
      refetchDetail();
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu");
    },
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
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard", active: false },
    { href: "/admin/claims", icon: FileText, label: "Talepler", active: false },
    { href: "/admin/users", icon: Users, label: "Kullanıcılar", active: false },
    { href: "/admin/airlines", icon: PlaneIcon, label: "Havayolları", active: false },
    { href: "/admin/stats", icon: BarChart3, label: "İstatistikler", active: false },
    { href: "/admin/blog", icon: BookOpen, label: "Blog", active: false },
    { href: "/admin/support", icon: HeadphonesIcon, label: "Destek", active: true },
  ];
  
  const filteredTickets = tickets?.filter(ticket => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      ticket.ticketNumber?.toLowerCase().includes(search) ||
      ticket.subject?.toLowerCase().includes(search)
    );
  });
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
      case 'closed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };
  
  const handleRespond = () => {
    if (!selectedTicket || !response.trim()) {
      toast.error("Lütfen bir yanıt yazın");
      return;
    }
    respondMutation.mutate({ id: selectedTicket, response: response.trim() });
  };
  
  const handleStatusChange = (status: string) => {
    if (!selectedTicket) return;
    updateStatusMutation.mutate({ 
      id: selectedTicket, 
      status: status as 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed'
    });
  };
  
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
          <div className="text-xs text-sidebar-foreground/60 mt-1">Admin Panel</div>
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
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Destek Talepleri</h1>
            <p className="text-muted-foreground mt-1">Kullanıcı destek taleplerini yönetin</p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Ticket no, konu veya kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Durum" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {Object.entries(statusLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{tickets?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Toplam</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {tickets?.filter(t => t.status === 'open').length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Açık</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {tickets?.filter(t => t.status === 'in_progress').length || 0}
                </div>
                <div className="text-sm text-muted-foreground">İşleniyor</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {tickets?.filter(t => t.status === 'waiting_response').length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Yanıt Bekliyor</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  {tickets?.filter(t => t.status === 'resolved' || t.status === 'closed').length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Çözüldü</div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tickets List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredTickets && filteredTickets.length > 0 ? (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedTicket(ticket.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-mono text-sm text-muted-foreground">
                            {ticket.ticketNumber}
                          </span>
                          <Badge className={statusColors[ticket.status || 'open']}>
                            {getStatusIcon(ticket.status || 'open')}
                            <span className="ml-1">{statusLabels[ticket.status || 'open']}</span>
                          </Badge>
                          <Badge variant="outline">
                            {categoryLabels[ticket.category || 'general']}
                          </Badge>
                          {ticket.priority && ticket.priority !== 'medium' && (
                            <Badge className={priorityColors[ticket.priority]}>
                              {priorityLabels[ticket.priority]}
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {ticket.message}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{(ticket as any).userName || 'Kullanıcı #' + ticket.userId}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('tr-TR') : '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Destek talebi bulunamadı</h3>
                <p className="text-muted-foreground">
                  Henüz destek talebi oluşturulmamış veya filtrelere uygun talep yok.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {ticketDetail ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-muted-foreground">
                    {ticketDetail.ticketNumber}
                  </span>
                  <Badge className={statusColors[ticketDetail.status || 'open']}>
                    {statusLabels[ticketDetail.status || 'open']}
                  </Badge>
                </div>
                <DialogTitle className="text-xl">{ticketDetail.subject}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Ticket Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Kategori:</span>
                    <span className="ml-2 font-medium">{categoryLabels[ticketDetail.category || 'general']}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kullanıcı:</span>
                    <span className="ml-2 font-medium">Kullanıcı #{ticketDetail.userId}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Oluşturulma:</span>
                    <span className="ml-2 font-medium">
                      {ticketDetail.createdAt ? new Date(ticketDetail.createdAt).toLocaleString('tr-TR') : '-'}
                    </span>
                  </div>
                  {ticketDetail.claimId && (
                    <div>
                      <span className="text-muted-foreground">İlişkili Talep:</span>
                      <Link href={`/admin/claims/${ticketDetail.claimId}`} className="ml-2 text-primary hover:underline">
                        #{ticketDetail.claimId}
                      </Link>
                    </div>
                  )}
                </div>
                
                {/* Original Message */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">Mesaj:</div>
                  <p className="whitespace-pre-wrap">{ticketDetail.message}</p>
                </div>
                
                {/* Admin Response */}
                {ticketDetail.adminResponse && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Admin Yanıtı:</div>
                    <div className="p-4 rounded-lg bg-primary/10 border-l-4 border-primary">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Admin</span>
                        <span className="text-xs text-muted-foreground">
                          {ticketDetail.respondedAt ? new Date(ticketDetail.respondedAt).toLocaleString('tr-TR') : '-'}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap">{ticketDetail.adminResponse}</p>
                    </div>
                  </div>
                )}
                
                {/* Status Update */}
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Durum Güncelle:</span>
                  <Select 
                    value={ticketDetail.status || 'open'} 
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Response Form */}
                {ticketDetail.status !== 'closed' && ticketDetail.status !== 'resolved' && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Yanıt Yaz:</div>
                    <Textarea
                      placeholder="Yanıtınızı yazın..."
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      rows={4}
                    />
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Kapat
                </Button>
                {ticketDetail.status !== 'closed' && ticketDetail.status !== 'resolved' && (
                  <Button 
                    onClick={handleRespond} 
                    disabled={respondMutation.isPending || !response.trim()}
                  >
                    {respondMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Yanıt Gönder
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
