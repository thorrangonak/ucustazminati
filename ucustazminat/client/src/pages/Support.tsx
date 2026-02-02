import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Plus, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Send,
  Loader2
} from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

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

export default function Support() {
  const { isAuthenticated, loading } = useAuth();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  
  // Form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<string>("general");
  
  const { data: tickets, isLoading, refetch } = trpc.tickets.myList.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: ticketDetail } = trpc.tickets.get.useQuery(
    { id: selectedTicket! },
    { enabled: !!selectedTicket }
  );
  
  const createMutation = trpc.tickets.create.useMutation({
    onSuccess: () => {
      toast.success("Destek talebiniz oluşturuldu");
      setShowNewTicket(false);
      setSubject("");
      setMessage("");
      setCategory("general");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Bir hata oluştu");
    },
  });
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }
  
  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      toast.error("Lütfen tüm alanları doldurun");
      return;
    }
    createMutation.mutate({
      subject,
      message,
      category: category as any,
    });
  };
  
  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Destek Talepleri"
        description="Destek taleplerinizi görüntüleyin ve yeni talep oluşturun"
        noindex={true}
      />
      
      {/* Header */}
      <header className="border-b border-foreground/10 bg-card">
        <div className="container py-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            <span>Dashboard'a Dön</span>
          </Link>
        </div>
      </header>
      
      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Destek Talepleri</h1>
              <p className="text-muted-foreground">Sorularınız için bize ulaşın</p>
            </div>
            <Button onClick={() => setShowNewTicket(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Talep
            </Button>
          </div>
          
          {/* Tickets List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tickets && tickets.length > 0 ? (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card 
                  key={ticket.id} 
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedTicket(ticket.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-muted-foreground font-mono">
                            {ticket.ticketNumber}
                          </span>
                          <Badge className={statusColors[ticket.status]}>
                            {statusLabels[ticket.status]}
                          </Badge>
                          <Badge variant="outline">
                            {categoryLabels[ticket.category]}
                          </Badge>
                        </div>
                        <h3 className="font-medium">{ticket.subject}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                          {ticket.message}
                        </p>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{new Date(ticket.createdAt).toLocaleDateString('tr-TR')}</div>
                        {ticket.adminResponse && (
                          <div className="flex items-center gap-1 text-green-600 mt-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>Yanıtlandı</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Henüz destek talebiniz yok</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sorularınız için yeni bir destek talebi oluşturabilirsiniz
                </p>
                <Button onClick={() => setShowNewTicket(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Talep Oluştur
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Destek Talebi</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label>Kategori</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">Genel</SelectItem>
                  <SelectItem value="claim">Talep Hakkında</SelectItem>
                  <SelectItem value="payment">Ödeme</SelectItem>
                  <SelectItem value="technical">Teknik</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Konu</Label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Kısaca sorununuzu belirtin"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label>Mesajınız</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Detaylı açıklama yazın..."
                rows={5}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewTicket(false)}>
              İptal
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Gönder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Ticket Detail Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-lg">
          {ticketDetail && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-muted-foreground font-mono">
                    {ticketDetail.ticketNumber}
                  </span>
                  <Badge className={statusColors[ticketDetail.status]}>
                    {statusLabels[ticketDetail.status]}
                  </Badge>
                </div>
                <DialogTitle>{ticketDetail.subject}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                {/* Original Message */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(ticketDetail.createdAt).toLocaleString('tr-TR')}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{ticketDetail.message}</p>
                </div>
                
                {/* Admin Response */}
                {ticketDetail.adminResponse && (
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-primary mb-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Yanıt - {ticketDetail.respondedAt && new Date(ticketDetail.respondedAt).toLocaleString('tr-TR')}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{ticketDetail.adminResponse}</p>
                  </div>
                )}
                
                {!ticketDetail.adminResponse && ticketDetail.status === 'open' && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">Yanıt Bekleniyor</p>
                      <p className="text-sm text-yellow-700">
                        Talebiniz en kısa sürede incelenecek ve e-posta ile bilgilendirileceksiniz.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedTicket(null)}>
                  Kapat
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
