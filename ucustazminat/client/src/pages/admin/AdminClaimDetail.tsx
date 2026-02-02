import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  ArrowLeft,
  User,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Euro,
  AlertTriangle
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

const documentTypeLabels: Record<string, string> = {
  boarding_pass: "Biniş Kartı",
  ticket: "Bilet",
  id_document: "Kimlik Belgesi",
  id_card: "TC Kimlik Kartı",
  passport: "Pasaport",
  booking_confirmation: "Rezervasyon Onayı",
  delay_certificate: "Gecikme Belgesi",
  expense_receipt: "Masraf Makbuzu",
  correspondence: "Yazışma",
  other: "Diğer",
};

export default function AdminClaimDetail() {
  const { user, loading: authLoading, logout } = useAuth();
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const claimId = parseInt(params.id || "0");
  
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [internalNote, setInternalNote] = useState("");
  
  // Belge reddetme için state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingDocId, setRejectingDocId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  
  const { data, isLoading, refetch } = trpc.claims.getDetail.useQuery(
    { id: claimId },
    { enabled: claimId > 0 }
  );
  
  const updateStatusMutation = trpc.claims.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Durum güncellendi");
      refetch();
      setNewStatus("");
      setStatusNote("");
      setInternalNote("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const verifyDocMutation = trpc.documents.verify.useMutation({
    onSuccess: () => {
      toast.success("Belge doğrulandı");
      refetch();
    },
  });
  
  const rejectDocMutation = trpc.documents.reject.useMutation({
    onSuccess: () => {
      toast.success("Belge reddedildi");
      setRejectDialogOpen(false);
      setRejectingDocId(null);
      setRejectReason("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const clearRejectionMutation = trpc.documents.clearRejection.useMutation({
    onSuccess: () => {
      toast.success("Red kaldırıldı");
      refetch();
    },
  });
  
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }
  
  if (user.role !== "admin") {
    navigate("/");
    return null;
  }
  
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Talep bulunamadı</p>
      </div>
    );
  }
  
  const { claim, documents, payments, passengers, airline } = data;
  
  const handleRejectDocument = (docId: number) => {
    setRejectingDocId(docId);
    setRejectDialogOpen(true);
  };
  
  const submitReject = () => {
    if (rejectingDocId && rejectReason.trim().length >= 5) {
      rejectDocMutation.mutate({ id: rejectingDocId, reason: rejectReason });
    }
  };
  
  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-foreground/10 flex flex-col">
        <div className="p-6 border-b border-foreground/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary" />
            <span className="font-bold text-lg">UçuşTazminat</span>
          </Link>
          <Badge className="mt-2 bg-primary/10 text-primary">Admin Panel</Badge>
        </div>
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/claims" className="flex items-center gap-3 px-4 py-2.5 bg-primary/10 text-primary font-medium">
                <FileText className="w-5 h-5" />
                <span>Talepler</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/airlines" className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <PlaneIcon className="w-5 h-5" />
                <span>Havayolları</span>
              </Link>
            </li>
            <li>
              <Link href="/admin/stats" className="flex items-center gap-3 px-4 py-2.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                <BarChart3 className="w-5 h-5" />
                <span>İstatistikler</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-foreground/10">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground">Admin</div>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start" onClick={() => logout()}>
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link href="/admin/claims" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
              <ArrowLeft className="w-5 h-5" />
              <span>Taleplere Dön</span>
            </Link>
            
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{claim.claimNumber}</h1>
                  <Badge className={statusColors[claim.status]}>
                    {statusLabels[claim.status]}
                  </Badge>
                </div>
                <p className="text-muted-foreground">
                  {claim.flightNumber} • {claim.departureAirport} → {claim.arrivalAirport}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Tazminat</div>
                <div className="text-3xl font-bold">{claim.compensationAmount} €</div>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Flight Details */}
              <Card className="border-2 border-foreground/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlaneIcon className="w-5 h-5 text-primary" />
                    Uçuş Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Uçuş Numarası</div>
                      <div className="font-medium">{claim.flightNumber}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Tarih</div>
                      <div className="font-medium">{new Date(claim.flightDate).toLocaleDateString('tr-TR')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Havayolu</div>
                      <div className="font-medium">{airline?.name || '-'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Kalkış</div>
                      <div className="font-medium">{claim.departureAirport}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Varış</div>
                      <div className="font-medium">{claim.arrivalAirport}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Mesafe</div>
                      <div className="font-medium">{claim.flightDistance} km</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Sorun Türü</div>
                      <div className="font-medium capitalize">{claim.disruptionType.replace('_', ' ')}</div>
                    </div>
                    {claim.delayDuration && (
                      <div>
                        <div className="text-sm text-muted-foreground">Gecikme</div>
                        <div className="font-medium">{Math.round(claim.delayDuration / 60)} saat</div>
                      </div>
                    )}
                    {claim.bookingReference && (
                      <div>
                        <div className="text-sm text-muted-foreground">PNR</div>
                        <div className="font-medium font-mono">{claim.bookingReference}</div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Passengers */}
              <Card className="border-2 border-foreground/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Yolcular ({passengers?.length || 1})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {passengers && passengers.length > 0 ? (
                    <div className="space-y-3">
                      {passengers.map((passenger, index) => (
                        <div key={passenger.id} className="flex items-center justify-between p-3 border border-foreground/10 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {passenger.firstName} {passenger.lastName}
                                {passenger.isPrimary && (
                                  <Badge className="ml-2 bg-primary/10 text-primary text-xs">Birincil</Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {passenger.email && <span>{passenger.email}</span>}
                                {passenger.phone && <span> • {passenger.phone}</span>}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Yolcu #{index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Fallback to old passengerName if no passengers
                    <div className="p-3 border border-foreground/10 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{claim.passengerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {claim.passengerEmail}
                            {claim.passengerPhone && <span> • {claim.passengerPhone}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Documents */}
              <Card className="border-2 border-foreground/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Belgeler ({documents?.length || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {documents && documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className={`p-3 border rounded-lg ${doc.isRejected ? 'border-red-300 bg-red-50' : 'border-foreground/10'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className={`w-5 h-5 ${doc.isRejected ? 'text-red-500' : 'text-muted-foreground'}`} />
                              <div>
                                <div className="font-medium text-sm">{doc.fileName}</div>
                                <div className="text-xs text-muted-foreground">
                                  {documentTypeLabels[doc.type]} • {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                                  {doc.passengerId && passengers && (
                                    <span className="ml-2">
                                      • Yolcu: {passengers.find(p => p.id === doc.passengerId)?.firstName || 'Bilinmiyor'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {doc.isRejected ? (
                                <>
                                  <Badge className="bg-red-100 text-red-800">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Reddedildi
                                  </Badge>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => clearRejectionMutation.mutate({ id: doc.id })}
                                  >
                                    Reddi Kaldır
                                  </Button>
                                </>
                              ) : doc.isVerified ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Doğrulandı
                                </Badge>
                              ) : (
                                <>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => verifyDocMutation.mutate({ id: doc.id })}
                                  >
                                    Doğrula
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={() => handleRejectDocument(doc.id)}
                                  >
                                    Reddet
                                  </Button>
                                </>
                              )}
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="icon">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </a>
                            </div>
                          </div>
                          
                          {/* Red açıklaması */}
                          {doc.isRejected && doc.rejectionReason && (
                            <div className="mt-2 p-2 bg-red-100 rounded text-sm text-red-800">
                              <strong>Red Sebebi:</strong> {doc.rejectionReason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Henüz belge yüklenmedi</p>
                  )}
                </CardContent>
              </Card>
              
              {/* Vekaletname */}
              {claim.consentSignature && (
                <Card className="border-2 border-green-200 bg-green-50/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="w-5 h-5" />
                      Vekaletname İmzası
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">İmza Tarihi</div>
                          <div className="font-medium">
                            {claim.consentSignedAt 
                              ? new Date(claim.consentSignedAt).toLocaleString('tr-TR')
                              : 'Belirtilmemiş'
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">IP Adresi</div>
                          <div className="font-medium font-mono text-xs">
                            {claim.consentIpAddress || 'Belirtilmemiş'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-green-200 pt-4">
                        <div className="text-sm text-muted-foreground mb-2">İmza Görseli</div>
                        <div className="bg-white border border-green-200 rounded-lg p-4 flex justify-center">
                          <img 
                            src={claim.consentSignature} 
                            alt="Vekaletname İmzası" 
                            className="max-h-32 object-contain"
                          />
                        </div>
                      </div>
                      
                      {/* PDF İndirme Butonu */}
                      <div className="border-t border-green-200 pt-4">
                        <Button
                          variant="outline"
                          className="w-full border-green-300 text-green-700 hover:bg-green-100"
                          onClick={async () => {
                            // Server-side'da dönüştürülmüş base64 imza verisini kullan (CORS sorunu yok)
                            const signatureData = (claim as any).consentSignatureBase64 || claim.consentSignature;
                            console.log('İmza verisi mevcut:', !!signatureData);
                            
                            // Kullanıcının imzaladığı aynı PDF formatını kullan (Alacak Temlik Sözleşmesi)
                            const { downloadAssignmentAgreementPDF } = await import('@/lib/assignmentAgreementPdf');
                            
                            // Aksakılık türünü çevir
                            const getIssueType = (): 'cancellation' | 'delay' | 'overbooking' => {
                              if (claim.disruptionType === 'cancellation') return 'cancellation';
                              if (claim.disruptionType === 'denied_boarding') return 'overbooking';
                              return 'delay';
                            };
                            
                            // Kayıtlı sözleşme metni varsa onu kullan, yoksa mevcut verilerden oluştur
                            let pdfData;
                            if ((claim as any).signedAgreementContent) {
                              try {
                                const savedAgreement = JSON.parse((claim as any).signedAgreementContent);
                                console.log('İmza atıldığı andaki sözleşme verisi kullanılıyor:', savedAgreement.version);
                                
                                // Kayıtlı sözleşme verisinden PDF oluştur
                                pdfData = {
                                  referenceNo: claim.claimNumber,
                                  clientName: savedAgreement.client?.name || claim.passengerName,
                                  clientEmail: savedAgreement.client?.email || claim.passengerEmail || '',
                                  clientPhone: savedAgreement.client?.phone || claim.passengerPhone || '',
                                  clientIdNumber: savedAgreement.client?.idNumber || '',
                                  bookingRef: savedAgreement.bookingReference || claim.bookingReference || '',
                                  airline: airline?.name || 'Bilinmiyor',
                                  flightNumber: savedAgreement.flight?.number || claim.flightNumber,
                                  route: savedAgreement.flight?.route || `${claim.departureAirport} → ${claim.arrivalAirport}`,
                                  flightDate: savedAgreement.flight?.date 
                                    ? new Date(savedAgreement.flight.date).toLocaleDateString('tr-TR')
                                    : (claim.flightDate ? new Date(claim.flightDate).toLocaleDateString('tr-TR') : ''),
                                  issueType: getIssueType(),
                                  isConnecting: savedAgreement.flight?.isConnecting || false,
                                  connectingFlightNumber: savedAgreement.flight?.flight2Number || undefined,
                                  connectingRoute: savedAgreement.flight?.connectionAirport 
                                    ? `${savedAgreement.flight.departure} → ${savedAgreement.flight.connectionAirport} → ${savedAgreement.flight.arrival}`
                                    : undefined,
                                  compensationAmount: savedAgreement.compensation?.amount || Number(claim.compensationAmount) || 0,
                                  regulation: savedAgreement.compensation?.regulation || 'SHY-YOLCU',
                                  signatureData: signatureData || undefined,
                                  signedAt: claim.consentSignedAt 
                                    ? new Date(claim.consentSignedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                                    : new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                                };
                              } catch (e) {
                                console.warn('Kayıtlı sözleşme verisi okunamadı, mevcut veriler kullanılıyor:', e);
                                pdfData = null;
                              }
                            }
                            
                            // Kayıtlı veri yoksa veya okunamadıysa mevcut claim verilerinden oluştur
                            if (!pdfData) {
                              const route = `${claim.departureAirport} → ${claim.arrivalAirport}`;
                              pdfData = {
                                referenceNo: claim.claimNumber,
                                clientName: claim.passengerName,
                                clientEmail: claim.passengerEmail || '',
                                clientPhone: claim.passengerPhone || '',
                                clientIdNumber: '',
                                bookingRef: claim.bookingReference || '',
                                airline: airline?.name || 'Bilinmiyor',
                                flightNumber: claim.flightNumber,
                                route: route,
                                flightDate: claim.flightDate ? new Date(claim.flightDate).toLocaleDateString('tr-TR') : '',
                                issueType: getIssueType(),
                                compensationAmount: Number(claim.compensationAmount) || 0,
                                regulation: 'SHY-YOLCU' as const,
                                signatureData: signatureData || undefined,
                                signedAt: claim.consentSignedAt 
                                  ? new Date(claim.consentSignedAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                                  : new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                              };
                            }
                            
                            await downloadAssignmentAgreementPDF(pdfData, `alacak_temlik_sozlesmesi_${claim.claimNumber}.pdf`);
                            toast.success('İmzalı Alacak Temlik Sözleşmesi PDF olarak indirildi');
                          }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          İmzalı Alacak Temlik Sözleşmesi PDF İndir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Payments */}
              <Card className="border-2 border-foreground/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Euro className="w-5 h-5 text-primary" />
                    Ödemeler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {payments && payments.length > 0 ? (
                    <div className="space-y-3">
                      {payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-3 border border-foreground/10">
                          <div>
                            <div className="font-medium">{payment.amount} {payment.currency}</div>
                            <div className="text-xs text-muted-foreground">
                              {payment.type} • {new Date(payment.createdAt).toLocaleDateString('tr-TR')}
                            </div>
                          </div>
                          <Badge>{payment.status}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">Henüz ödeme kaydı yok</p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Status Update */}
              <Card className="border-2 border-foreground/10">
                <CardHeader>
                  <CardTitle>Durum Güncelle</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Yeni Durum</Label>
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Kullanıcıya Not (Opsiyonel)</Label>
                    <Textarea 
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="Kullanıcının göreceği not..."
                      rows={2}
                    />
                  </div>
                  
                  <div>
                    <Label>Dahili Not (Opsiyonel)</Label>
                    <Textarea 
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Sadece admin görebilir..."
                      rows={2}
                    />
                  </div>
                  
                  <Button 
                    className="w-full"
                    disabled={!newStatus || updateStatusMutation.isPending}
                    onClick={() => updateStatusMutation.mutate({
                      id: claimId,
                      status: newStatus as any,
                      note: statusNote || undefined,
                      internalNote: internalNote || undefined,
                    })}
                  >
                    {updateStatusMutation.isPending ? "Güncelleniyor..." : "Durumu Güncelle"}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Financial Summary */}
              <Card className="border-2 border-foreground/10">
                <CardHeader>
                  <CardTitle>Finansal Özet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tazminat</span>
                    <span className="font-medium">{claim.compensationAmount} €</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Komisyon (%{claim.commissionRate})</span>
                    <span className="font-medium text-red-600">-{claim.commissionAmount} €</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-medium">Net Ödeme</span>
                    <span className="font-bold text-green-600">{claim.netPayoutAmount} €</span>
                  </div>
                  
                  {/* IBAN Bilgileri */}
                  {(claim.passengerIban || claim.passengerBankName) && (
                    <div className="border-t pt-3 mt-3 space-y-2">
                      <div className="text-sm font-medium">Banka Bilgileri</div>
                      {claim.passengerBankName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Banka</span>
                          <span>{claim.passengerBankName}</span>
                        </div>
                      )}
                      {claim.passengerIban && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">IBAN</span>
                          <span className="font-mono text-xs">{claim.passengerIban}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Timeline */}
              <Card className="border-2 border-foreground/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Zaman Çizelgesi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Oluşturulma</span>
                      <span>{new Date(claim.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    {claim.submittedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gönderilme</span>
                        <span>{new Date(claim.submittedAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                    {claim.resolvedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sonuçlanma</span>
                        <span>{new Date(claim.resolvedAt).toLocaleDateString('tr-TR')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      {/* Reject Document Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Belgeyi Reddet
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Bu belgeyi reddetmek istediğinizden emin misiniz? Red sebebi kullanıcıya bildirilecektir.
            </p>
            <div>
              <Label>Red Sebebi *</Label>
              <Textarea 
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Belgenin neden reddedildiğini açıklayın..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">En az 5 karakter giriniz</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              İptal
            </Button>
            <Button 
              variant="destructive"
              disabled={rejectReason.trim().length < 5 || rejectDocMutation.isPending}
              onClick={submitReject}
            >
              {rejectDocMutation.isPending ? "Reddediliyor..." : "Reddet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
