import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { 
  LayoutDashboard, 
  FileText, 
  Plane as PlaneIcon, 
  BarChart3,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Globe,
  Mail,
  Phone,
  BookOpen,
  HeadphonesIcon
} from "lucide-react";

export default function AdminAirlines() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAirline, setEditingAirline] = useState<any>(null);
  
  // Form state
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [isActive, setIsActive] = useState(true);
  
  const { data: airlines, isLoading, refetch } = trpc.airlines.listAll.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === 'admin',
  });
  
  const createMutation = trpc.airlines.create.useMutation({
    onSuccess: () => {
      toast.success("Havayolu eklendi");
      refetch();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Ekleme başarısız");
    },
  });
  
  const updateMutation = trpc.airlines.update.useMutation({
    onSuccess: () => {
      toast.success("Havayolu güncellendi");
      refetch();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error.message || "Güncelleme başarısız");
    },
  });
  
  const deleteMutation = trpc.airlines.delete.useMutation({
    onSuccess: () => {
      toast.success("Havayolu silindi");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Silme başarısız");
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
  
  const resetForm = () => {
    setCode("");
    setName("");
    setCountry("");
    setContactEmail("");
    setContactPhone("");
    setWebsite("");
    setIsActive(true);
    setEditingAirline(null);
  };
  
  const handleEdit = (airline: any) => {
    setEditingAirline(airline);
    setCode(airline.code);
    setName(airline.name);
    setCountry(airline.country || "");
    setContactEmail(airline.contactEmail || "");
    setContactPhone(airline.contactPhone || "");
    setWebsite(airline.website || "");
    setIsActive(airline.isActive);
    setIsDialogOpen(true);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      code: code.toUpperCase(),
      name,
      country: country || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      website: website || undefined,
      isActive,
    };
    
    if (editingAirline) {
      updateMutation.mutate({ id: editingAirline.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };
  
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
            <div className="flex items-center gap-3 px-3 py-2 bg-sidebar-accent text-sidebar-accent-foreground">
              <PlaneIcon className="w-5 h-5" />
              <span>Havayolları</span>
            </div>
          </Link>
          <Link href="/admin/stats">
            <div className="flex items-center gap-3 px-3 py-2 hover:bg-sidebar-accent transition-colors">
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
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Havayolları</h1>
              <p className="text-muted-foreground">Havayolu şirketlerini ve iletişim bilgilerini yönetin.</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Havayolu Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingAirline ? "Havayolu Düzenle" : "Yeni Havayolu"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="code">IATA Kodu *</Label>
                      <Input
                        id="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        maxLength={3}
                        placeholder="TK"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Ülke</Label>
                      <Input
                        id="country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Türkiye"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Havayolu Adı *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Turkish Airlines"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">İletişim E-posta</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="claims@airline.com"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">İletişim Telefon</Label>
                    <Input
                      id="phone"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+90 212 XXX XX XX"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://www.airline.com"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="active">Aktif</Label>
                    <Switch
                      id="active"
                      checked={isActive}
                      onCheckedChange={setIsActive}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={createMutation.isPending || updateMutation.isPending}
                  >
                    {createMutation.isPending || updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Airlines Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">Yükleniyor...</div>
          ) : airlines && airlines.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {airlines.map((airline) => (
                <Card key={airline.id} className={`border-2 ${airline.isActive ? 'border-foreground/10' : 'border-muted opacity-60'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-2xl font-bold">{airline.code}</span>
                          {!airline.isActive && (
                            <Badge variant="secondary">Pasif</Badge>
                          )}
                        </div>
                        <div className="font-medium">{airline.name}</div>
                        {airline.country && (
                          <div className="text-sm text-muted-foreground">{airline.country}</div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(airline)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => {
                            if (confirm("Bu havayolunu silmek istediğinize emin misiniz?")) {
                              deleteMutation.mutate({ id: airline.id });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      {airline.contactEmail && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span>{airline.contactEmail}</span>
                        </div>
                      )}
                      {airline.contactPhone && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4" />
                          <span>{airline.contactPhone}</span>
                        </div>
                      )}
                      {airline.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe className="w-4 h-4" />
                          <a href={airline.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                            {airline.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-2 border-dashed border-foreground/20">
              <CardContent className="p-12 text-center">
                <PlaneIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-bold mb-2">Henüz havayolu eklenmedi</h3>
                <p className="text-muted-foreground mb-4">
                  İlk havayolunu ekleyerek başlayın.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
