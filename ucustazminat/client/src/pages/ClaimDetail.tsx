import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ClaimProgressBar } from "@/components/ClaimProgressBar";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Plane, 
  FileText, 
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Trash2,
  Eye,
  User,
  Users,
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

const disruptionTypeLabels: Record<string, string> = {
  delay: "Gecikme",
  cancellation: "İptal",
  denied_boarding: "Uçuşa Alınmama",
  downgrade: "Sınıf Düşürme",
};

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDocType, setSelectedDocType] = useState<string>("boarding_pass");
  const [uploading, setUploading] = useState(false);
  
  const { data, isLoading, refetch } = trpc.claims.myClaimDetail.useQuery(
    { id: parseInt(id || "0") },
    { enabled: isAuthenticated && !!id }
  );
  
  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success("Belge yüklendi");
      refetch();
      setUploading(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setUploading(false);
    },
  });
  
  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Belge silindi");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !data?.claim) return;
    
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır");
      return;
    }
    
    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      uploadMutation.mutate({
        claimId: data.claim.id,
        type: selectedDocType as any,
        fileName: file.name,
        fileData: base64,
        mimeType: file.type,
      });
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }
  
  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Talep bulunamadı</p>
      </div>
    );
  }
  
  const { claim, documents, payments, passengers } = data;
  
  // Reddedilen belgeleri kontrol et
  const rejectedDocs = documents?.filter(d => d.isRejected) || [];
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-foreground/10 bg-card">
        <div className="container py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary" />
            <span className="font-bold text-lg">UçuşTazminat</span>
          </Link>
        </div>
      </header>
      
      <main className="container py-4 sm:py-6 md:py-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 sm:mb-6 text-sm sm:text-base">
          <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Taleplerime Dön</span>
        </Link>
        
        {/* Reddedilen belgeler uyarısı */}
        {rejectedDocs.length > 0 && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2 sm:gap-3">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-red-800 text-sm sm:text-base">Dikkat: Reddedilen Belgeler</h3>
                <p className="text-xs sm:text-sm text-red-600 mt-1">
                  {rejectedDocs.length} belgeniz reddedildi. Lütfen aşağıdaki açıklamaları inceleyin ve yeni belgeler yükleyin.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{claim.claimNumber}</h1>
                <Badge className={`${statusColors[claim.status]} text-xs`}>
                  {statusLabels[claim.status]}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {claim.flightNumber} • {claim.departureAirport} → {claim.isConnecting && claim.connectionAirport ? `${claim.connectionAirport} → ` : ''}{claim.arrivalAirport}
                {claim.isConnecting && claim.flight2Number && <span className="ml-1">({claim.flight2Number})</span>}
                {' '}• {new Date(claim.flightDate).toLocaleDateString('tr-TR')}
              </p>
              {/* İlerleme Çubuğu */}
              <div className="mt-4">
                <ClaimProgressBar status={claim.status} variant="full" />
              </div>
            </div>
            
            <div className="sm:text-right">
              <div className="text-xs sm:text-sm text-muted-foreground">Tazminat Miktarı</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold">{claim.compensationAmount} €</div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Size ödenecek: <span className="text-primary font-medium">{claim.netPayoutAmount} €</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">
            {/* Flight Details */}
            <Card className="border-2 border-foreground/10">
              <CardHeader className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  Uçuş Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 md:p-6 pt-0">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Uçuş Numarası</div>
                    <div className="font-medium text-sm sm:text-base">{claim.flightNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Uçuş Tarihi</div>
                    <div className="font-medium text-sm sm:text-base">{new Date(claim.flightDate).toLocaleDateString('tr-TR')}</div>
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Kalkış</div>
                    <div className="font-medium text-sm sm:text-base">{claim.departureAirport}</div>
                  </div>
                  {claim.isConnecting && claim.connectionAirport && (
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Aktarma</div>
                      <div className="font-medium text-sm sm:text-base">{claim.connectionAirport}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Varış</div>
                    <div className="font-medium text-sm sm:text-base">{claim.arrivalAirport}</div>
                  </div>
                  {claim.isConnecting && claim.flight2Number && (
                    <>
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground">2. Uçuş Numarası</div>
                        <div className="font-medium text-sm sm:text-base">{claim.flight2Number}</div>
                      </div>
                      {claim.flight2Date && (
                        <div>
                          <div className="text-xs sm:text-sm text-muted-foreground">2. Uçuş Tarihi</div>
                          <div className="font-medium text-sm sm:text-base">{new Date(claim.flight2Date).toLocaleDateString('tr-TR')}</div>
                        </div>
                      )}
                    </>
                  )}
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Sorun Türü</div>
                    <div className="font-medium text-sm sm:text-base">{disruptionTypeLabels[claim.disruptionType]}</div>
                  </div>
                  {claim.delayDuration && (
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Gecikme Süresi</div>
                      <div className="font-medium text-sm sm:text-base">{Math.round(claim.delayDuration / 60)} saat</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs sm:text-sm text-muted-foreground">Mesafe</div>
                    <div className="font-medium text-sm sm:text-base">{claim.flightDistance} km</div>
                  </div>
                  {claim.bookingReference && (
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Rezervasyon Kodu</div>
                      <div className="font-medium text-sm sm:text-base">{claim.bookingReference}</div>
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
                  Belgeler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Upload Section */}
                <div className="mb-6 p-4 border border-dashed border-foreground/20 bg-secondary/50">
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
                    <div className="flex-1 space-y-2">
                      <label className="text-sm font-medium">Belge Türü</label>
                      <Select value={selectedDocType} onValueChange={setSelectedDocType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="boarding_pass">Biniş Kartı</SelectItem>
                          <SelectItem value="ticket">Bilet</SelectItem>
                          <SelectItem value="id_document">Kimlik Belgesi</SelectItem>
                          <SelectItem value="booking_confirmation">Rezervasyon Onayı</SelectItem>
                          <SelectItem value="delay_certificate">Gecikme Belgesi</SelectItem>
                          <SelectItem value="expense_receipt">Masraf Makbuzu</SelectItem>
                          <SelectItem value="correspondence">Yazışma</SelectItem>
                          <SelectItem value="other">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploading ? "Yükleniyor..." : "Belge Yükle"}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Desteklenen formatlar: JPG, PNG, PDF. Maksimum boyut: 10MB
                  </p>
                </div>
                
                {/* Documents List */}
                {documents && documents.length > 0 ? (
                  <div className="space-y-3">
                    {documents.map((doc) => (
                      <div 
                        key={doc.id} 
                        className={`p-3 border rounded-lg ${
                          doc.isRejected 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-foreground/10 bg-background'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className={`w-5 h-5 ${doc.isRejected ? 'text-red-500' : 'text-muted-foreground'}`} />
                            <div>
                              <div className="font-medium text-sm">{doc.fileName}</div>
                              <div className="text-xs text-muted-foreground">
                                {documentTypeLabels[doc.type]} • {new Date(doc.createdAt).toLocaleDateString('tr-TR')}
                                {doc.isVerified && (
                                  <span className="ml-2 text-green-600">
                                    <CheckCircle className="w-3 h-3 inline mr-1" />
                                    Doğrulandı
                                  </span>
                                )}
                                {doc.isRejected && (
                                  <span className="ml-2 text-red-600">
                                    <XCircle className="w-3 h-3 inline mr-1" />
                                    Reddedildi
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </a>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteMutation.mutate({ id: doc.id })}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
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
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Henüz belge yüklenmedi</p>
                    <p className="text-sm">Talebinizin hızlı işlenmesi için gerekli belgeleri yükleyin</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Alacak Temlik Sözleşmesi */}
            {claim.consentSignature && (
              <Card className="border-2 border-foreground/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Alacak Temlik Sözleşmesi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Alacak Temlik Sözleşmesi İmzalandı</span>
                      </div>
                      {claim.consentSignedAt && (
                        <p className="text-sm text-green-600 mt-1">
                          {new Date(claim.consentSignedAt).toLocaleString('tr-TR')}
                        </p>
                      )}
                    </div>
                    
                    {/* İmza Görseli */}
                    <div className="border border-foreground/10 rounded-lg p-4 bg-white">
                      <p className="text-sm text-muted-foreground mb-2">Elektronik İmza:</p>
                      <img 
                        src={claim.consentSignature} 
                        alt="İmza" 
                        className="max-h-20 border border-foreground/10 rounded bg-white"
                      />
                    </div>
                    
                    {/* İmzalı Alacak Temlik Sözleşmesi PDF İndirme */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={async () => {
                        // Server-side'da dönüştürülmüş base64 imza verisini kullan (CORS sorunu yok)
                        const signatureData = (claim as any).consentSignatureBase64 || claim.consentSignature;
                        
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
                              airline: '', // Kullanıcı panelinde havayolu bilgisi yok
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
                            airline: '', // Kullanıcı panelinde havayolu bilgisi yok
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
                </CardContent>
              </Card>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Timeline */}
            <Card className="border-2 border-foreground/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Durum Geçmişi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {claim.statusHistory && claim.statusHistory.length > 0 ? (
                  <div className="space-y-4">
                    {claim.statusHistory.slice().reverse().map((item: any, index: number) => (
                      <div key={index} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-primary' : 'bg-muted'}`} />
                          {index < claim.statusHistory!.length - 1 && (
                            <div className="w-0.5 h-full bg-muted mt-1" />
                          )}
                        </div>
                        <div className="pb-4">
                          <div className="font-medium text-sm">{statusLabels[item.status]}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(item.timestamp).toLocaleString('tr-TR')}
                          </div>
                          {item.note && (
                            <div className="text-sm mt-1 text-muted-foreground">{item.note}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">Henüz durum güncellemesi yok</p>
                )}
              </CardContent>
            </Card>
            
            {/* Payment Info */}
            <Card className="border-2 border-foreground/10">
              <CardHeader>
                <CardTitle>Ödeme Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tazminat</span>
                  <span>{claim.compensationAmount} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Komisyon (%{claim.commissionRate})</span>
                  <span className="text-red-600">-{claim.commissionAmount} €</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-medium">
                  <span>Size Ödenecek</span>
                  <span className="text-green-600">{claim.netPayoutAmount} €</span>
                </div>
                
                {/* IBAN Bilgileri */}
                {(claim.passengerIban || claim.passengerBankName) && (
                  <div className="border-t pt-3 mt-3 space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Banka Bilgileri</div>
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
            
            {/* Contact */}
            <Card className="border-2 border-foreground/10">
              <CardHeader>
                <CardTitle>Yardım mı Lazım?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Talebinizle ilgili sorularınız için destek talebi oluşturabilirsiniz.
                </p>
                <Link href="/dashboard/support">
                  <Button variant="outline" className="w-full">
                    Destek Talebi Oluştur
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
