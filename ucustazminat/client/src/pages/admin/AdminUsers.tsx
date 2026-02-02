import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { SEOHead, SEO_CONFIG } from "@/components/SEOHead";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  LayoutDashboard, 
  FileText, 
  Plane as PlaneIcon, 
  BarChart3,
  LogOut,
  Users,
  Menu,
  X,
  BookOpen,
  HeadphonesIcon,
  Search,
  UserPlus,
  Shield,
  ShieldCheck,
  Trash2,
  Edit,
  Eye,
  Mail,
  Phone,
  Calendar,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  
  const utils = trpc.useUtils();
  
  const { data: usersData, isLoading } = trpc.users.list.useQuery({
    search: search || undefined,
    role: roleFilter !== "all" ? (roleFilter as 'user' | 'admin') : undefined,
    page,
    limit: 20,
  }, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: stats } = trpc.users.stats.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const { data: userDetail, isLoading: detailLoading } = trpc.users.getById.useQuery(
    { id: selectedUser?.id },
    { enabled: !!selectedUser?.id && detailDialogOpen }
  );
  
  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı güncellendi");
      utils.users.list.invalidate();
      utils.users.stats.invalidate();
      setEditDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı silindi");
      utils.users.list.invalidate();
      utils.users.stats.invalidate();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateRoleMutation = trpc.users.updateRole.useMutation({
    onSuccess: () => {
      toast.success("Kullanıcı rolü güncellendi");
      utils.users.list.invalidate();
      utils.users.stats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  if (loading || !isAuthenticated || user?.role !== 'admin') {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
    if (!loading && isAuthenticated && user?.role !== 'admin') {
      setLocation('/dashboard');
    }
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
    { href: "/admin/users", icon: Users, label: "Kullanıcılar", active: true },
    { href: "/admin/airlines", icon: PlaneIcon, label: "Havayolları", active: false },
    { href: "/admin/stats", icon: BarChart3, label: "İstatistikler", active: false },
    { href: "/admin/blog", icon: BookOpen, label: "Blog", active: false },
    { href: "/admin/support", icon: HeadphonesIcon, label: "Destek", active: false },
  ];
  
  const totalPages = Math.ceil((usersData?.total || 0) / 20);
  
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    const formData = new FormData(e.target as HTMLFormElement);
    updateMutation.mutate({
      id: selectedUser.id,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string || undefined,
      role: formData.get("role") as 'user' | 'admin',
    });
  };
  
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
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">Kullanıcı Yönetimi</h1>
            <p className="text-muted-foreground">Sistemdeki kullanıcıları görüntüleyin ve yönetin.</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-2 border-foreground/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">{stats?.total || 0}</div>
                    <div className="text-sm text-muted-foreground">Toplam</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-foreground/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-green-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats?.admins || 0}</div>
                    <div className="text-sm text-muted-foreground">Admin</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-foreground/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats?.users || 0}</div>
                    <div className="text-sm text-muted-foreground">Kullanıcı</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-foreground/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-8 h-8 text-yellow-500" />
                  <div>
                    <div className="text-2xl font-bold">{stats?.thisMonth || 0}</div>
                    <div className="text-sm text-muted-foreground">Bu Ay</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <Card className="border-2 border-foreground/10 mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="İsim, e-posta veya telefon ara..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="pl-10"
                  />
                </div>
                <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Rol Filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="user">Kullanıcı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          
          {/* Users Table */}
          <Card className="border-2 border-foreground/10">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="w-3 h-3 bg-primary animate-pulse mx-auto mb-2" />
                  <span className="text-muted-foreground">Yükleniyor...</span>
                </div>
              ) : usersData?.users.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  Kullanıcı bulunamadı
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kullanıcı</TableHead>
                          <TableHead>E-posta</TableHead>
                          <TableHead>Telefon</TableHead>
                          <TableHead>Rol</TableHead>
                          <TableHead>Kayıt Tarihi</TableHead>
                          <TableHead className="text-right">İşlemler</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {usersData?.users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>
                              <div className="font-medium">{u.name || "İsimsiz"}</div>
                              <div className="text-xs text-muted-foreground">ID: {u.id}</div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                {u.email || "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {u.phone || "-"}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                {u.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="w-3 h-3 text-muted-foreground" />
                                {new Date(u.createdAt).toLocaleDateString('tr-TR')}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setDetailDialogOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setEditDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive"
                                  onClick={() => {
                                    setSelectedUser(u);
                                    setDeleteDialogOpen(true);
                                  }}
                                  disabled={u.id === user?.id}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        Toplam {usersData?.total} kullanıcı
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">
                          {page} / {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            <DialogDescription>
              Kullanıcı bilgilerini güncelleyin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={selectedUser?.name || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={selectedUser?.email || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  name="phone"
                  defaultValue={selectedUser?.phone || ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select name="role" defaultValue={selectedUser?.role || "user"}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Kullanıcı</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                İptal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Sil</DialogTitle>
            <DialogDescription>
              <strong>{selectedUser?.name || selectedUser?.email}</strong> kullanıcısını silmek istediğinizden emin misiniz?
              Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedUser && deleteMutation.mutate({ id: selectedUser.id })}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kullanıcı Detayları</DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="p-8 text-center">
              <div className="w-3 h-3 bg-primary animate-pulse mx-auto mb-2" />
              <span className="text-muted-foreground">Yükleniyor...</span>
            </div>
          ) : userDetail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Ad Soyad</Label>
                  <div className="font-medium">{userDetail.name || "-"}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">E-posta</Label>
                  <div className="font-medium">{userDetail.email || "-"}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefon</Label>
                  <div className="font-medium">{userDetail.phone || "-"}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rol</Label>
                  <div>
                    <Badge variant={userDetail.role === 'admin' ? 'default' : 'secondary'}>
                      {userDetail.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kayıt Tarihi</Label>
                  <div className="font-medium">
                    {new Date(userDetail.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Son Giriş</Label>
                  <div className="font-medium">
                    {new Date(userDetail.lastSignedIn).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
              
              {/* User Claims */}
              <div>
                <Label className="text-muted-foreground mb-2 block">
                  Talepler ({userDetail.claimCount})
                </Label>
                {userDetail.claims.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Henüz talep yok</div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {userDetail.claims.map((claim: any) => (
                      <div key={claim.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <div className="font-medium text-sm">{claim.claimNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            {claim.departureAirport} → {claim.arrivalAirport}
                          </div>
                        </div>
                        <Badge variant="outline">{claim.status}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
