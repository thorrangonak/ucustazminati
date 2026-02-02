import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { 
  FileText, 
  PenTool, 
  RotateCcw, 
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  AlertTriangle,
  Shield,
  Scale
} from "lucide-react";
import { generateAssignmentAgreementPDF, downloadAssignmentAgreementPDF } from "@/lib/assignmentAgreementPdf";

interface FlightInfo {
  flightNumber: string;
  flightDate: string;
}

interface ConsentSignatureProps {
  passengerName: string;
  passengerEmail?: string;
  passengerPhone?: string;
  passengerIdNumber?: string; // TC Kimlik No
  flightNumber?: string;
  flightDate?: string;
  departureAirport?: string;
  arrivalAirport?: string;
  airline?: string;
  // Aktarmalı uçuş bilgileri
  isConnecting?: boolean;
  connectionAirport?: string;
  flight1?: FlightInfo;
  flight2?: FlightInfo;
  // PNR ve tazminat
  bookingReference?: string;
  compensationAmount?: number;
  disruptionType?: 'delay' | 'cancellation' | 'denied_boarding' | 'downgrade';
  referenceNo?: string;
  onSignatureComplete: (signatureData: string) => void;
  onCancel?: () => void;
}

export default function ConsentSignature({ 
  passengerName, 
  passengerEmail,
  passengerPhone,
  passengerIdNumber,
  flightNumber,
  flightDate,
  departureAirport,
  arrivalAirport,
  airline,
  isConnecting,
  connectionAirport,
  flight1,
  flight2,
  bookingReference,
  compensationAmount,
  disruptionType,
  referenceNo,
  onSignatureComplete,
  onCancel 
}: ConsentSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [hasReadConsent, setHasReadConsent] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [hasAcceptedAssignment, setHasAcceptedAssignment] = useState(false);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [pdfDataUrl, setPdfDataUrl] = useState<string>("");
  
  const currentDate = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Aksaklık türü çevirisi
  const getIssueType = (): 'cancellation' | 'delay' | 'overbooking' => {
    if (disruptionType === 'cancellation') return 'cancellation';
    if (disruptionType === 'denied_boarding') return 'overbooking';
    return 'delay';
  };

  // Güzergah oluşturma
  const getRoute = () => {
    if (isConnecting && connectionAirport) {
      return `${departureAirport} → ${connectionAirport} → ${arrivalAirport}`;
    }
    return `${departureAirport} → ${arrivalAirport}`;
  };
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Canvas boyutunu ayarla
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    
    // Arka plan
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    // Çizgi stili
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);
  
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };
  
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;
    
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasSignature(true);
  };
  
  const stopDrawing = () => {
    setIsDrawing(false);
  };
  
  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasSignature(false);
  };
  
  const getSignatureData = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return "";
    return canvas.toDataURL('image/png');
  };
  
  const getPdfData = () => ({
    referenceNo: referenceNo || `UCT-${Date.now()}`,
    clientName: passengerName,
    clientEmail: passengerEmail || '',
    clientPhone: passengerPhone || '',
    clientIdNumber: passengerIdNumber || '',
    bookingRef: bookingReference || '',
    airline: airline || 'Bilinmiyor',
    flightNumber: flightNumber || '',
    route: getRoute(),
    flightDate: flightDate || '',
    issueType: getIssueType(),
    isConnecting,
    connectingFlightNumber: flight2?.flightNumber,
    connectingRoute: connectionAirport ? `${connectionAirport} → ${arrivalAirport}` : undefined,
    compensationAmount: compensationAmount || 0,
    regulation: 'SHY-YOLCU' as const,
    signatureData: hasSignature ? getSignatureData() : undefined,
    signedAt: currentDate
  });
  
  const handlePreviewPdf = async () => {
    if (!hasSignature) {
      toast.error("Lütfen önce imzanızı atın");
      return;
    }
    
    try {
      const doc = await generateAssignmentAgreementPDF(getPdfData());
      const dataUrl = doc.output('datauristring');
      setPdfDataUrl(dataUrl);
      setShowPdfPreview(true);
    } catch (error) {
      toast.error("PDF oluşturulurken hata oluştu");
      console.error(error);
    }
  };
  
  const handleDownloadPdf = async () => {
    if (!hasSignature) {
      toast.error("Lütfen önce imzanızı atın");
      return;
    }
    
    try {
      await downloadAssignmentAgreementPDF(getPdfData());
      toast.success("Alacak Temlik Sözleşmesi PDF olarak indirildi");
    } catch (error) {
      toast.error("PDF indirilirken hata oluştu");
      console.error(error);
    }
  };
  
  const handleSubmit = () => {
    if (!hasReadConsent) {
      toast.error("Lütfen sözleşme metnini okuyup onaylayın");
      return;
    }
    
    if (!hasAcceptedTerms) {
      toast.error("Lütfen hizmet şartlarını kabul edin");
      return;
    }

    if (!hasAcceptedAssignment) {
      toast.error("Lütfen alacak temlikini kabul edin");
      return;
    }
    
    if (!hasSignature) {
      toast.error("Lütfen imzanızı atın");
      return;
    }
    
    const signatureData = getSignatureData();
    onSignatureComplete(signatureData);
  };
  
  return (
    <div className="space-y-6">
      {/* Önemli Uyarı Kutusu */}
      <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-bold text-amber-800 text-lg">⚠ ÖNEMLİ / IMPORTANT</div>
            <p className="text-sm text-amber-700 mt-2">
              Bu sözleşme ile tazminat alacağınızın <strong>TAM MÜLKİYETİNİ</strong> UçuşTazminat'a devrediyorsunuz.
            </p>
            <p className="text-sm text-amber-700 mt-1">
              By signing this agreement, you transfer <strong>FULL OWNERSHIP</strong> of your compensation claim to the Company.
            </p>
            <div className="mt-3 space-y-1">
              <p className="text-sm text-amber-800">• Temlik sonrası havayolu ile doğrudan iletişime geçemezsiniz</p>
              <p className="text-sm text-green-700 font-medium">✓ Başarısız olursa hiçbir ücret ödemezsiniz (No Win = No Fee)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sözleşme Özeti */}
      <Card className="border-2 border-foreground/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            Alacak Temlik Sözleşmesi Özeti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[350px] rounded-lg border border-foreground/10 p-4 bg-secondary/30">
            <div className="prose prose-sm max-w-none space-y-6">
              {/* Taraflar */}
              <div>
                <h4 className="font-bold text-primary mb-2">1. TARAFLAR / PARTIES</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p><strong>Müşteri (Temlik Eden):</strong> {passengerName}</p>
                  {passengerEmail && <p><strong>E-posta:</strong> {passengerEmail}</p>}
                  {passengerPhone && <p><strong>Telefon:</strong> {passengerPhone}</p>}
                  {passengerIdNumber && <p><strong>TC Kimlik No:</strong> {passengerIdNumber}</p>}
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm mt-2">
                  <p><strong>Şirket (Temlik Alan):</strong> UçuşTazminat</p>
                  <p><strong>Web:</strong> www.ucustazminat.com</p>
                </div>
              </div>

              {/* Uçuş Bilgileri */}
              <div>
                <h4 className="font-bold text-primary mb-2">2. UÇUŞ BİLGİLERİ / FLIGHT DETAILS</h4>
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  {bookingReference && <p><strong>Rezervasyon No:</strong> {bookingReference}</p>}
                  {airline && <p><strong>Havayolu:</strong> {airline}</p>}
                  <p><strong>Uçuş No:</strong> {flightNumber || '-'}</p>
                  <p><strong>Güzergah:</strong> {getRoute()}</p>
                  <p><strong>Tarih:</strong> {flightDate || '-'}</p>
                  <p><strong>Aksaklık:</strong> {disruptionType === 'delay' ? 'Rötar' : disruptionType === 'cancellation' ? 'İptal' : 'Overbooking'}</p>
                  {isConnecting && flight2 && (
                    <>
                      <p className="mt-2 font-medium">2. Uçuş:</p>
                      <p><strong>Uçuş No:</strong> {flight2.flightNumber}</p>
                    </>
                  )}
                </div>
              </div>

              {/* Temlik */}
              <div>
                <h4 className="font-bold text-primary mb-2">3. TEMLİK / ASSIGNMENT</h4>
                <p className="text-sm">
                  Müşteri, yukarıda belirtilen uçuş aksaklığından kaynaklanan tazminat alacağının tam mülkiyetini ve yasal hakkını Şirkete devretmektedir.
                </p>
                <p className="text-sm mt-1">
                  The Client hereby assigns to the Company full ownership and legal title to the compensation claim.
                </p>
                <ul className="text-sm mt-2 list-disc list-inside">
                  <li>SHY-YOLCU Yönetmeliği (100-600 EUR)</li>
                  <li>EC 261/2004 Yönetmeliği (250-600 EUR)</li>
                  <li>Tüm ek haklar ve faizler</li>
                </ul>
              </div>

              {/* Şirket Yetkileri */}
              <div>
                <h4 className="font-bold text-primary mb-2">4. ŞİRKET YETKİLERİ / COMPANY RIGHTS</h4>
                <ul className="text-sm list-disc list-inside">
                  <li>Havayoluna doğrudan başvurma</li>
                  <li>SHGM'ye başvurma</li>
                  <li>Müzakere yapma ve uzlaşma tekliflerini kabul/red etme</li>
                  <li>Gerekirse dava açma</li>
                  <li>Tazminat ödemesini tahsil etme</li>
                </ul>
              </div>

              {/* Müşteri Taahhütleri */}
              <div>
                <h4 className="font-bold text-primary mb-2">5. MÜŞTERİ TAAHHÜTLERİ / CLIENT UNDERTAKINGS</h4>
                <p className="text-sm font-medium text-red-600">
                  ⚠ İLETİŞİM YASAĞI: Temlik sonrası havayolu veya SHGM ile doğrudan iletişime geçmeyeceğinizi ve doğrudan ödeme kabul etmeyeceğinizi taahhüt ediyorsunuz.
                </p>
              </div>

              {/* Hizmet Bedeli */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-bold text-green-700 mb-2">6. HİZMET BEDELİ / SERVICE FEE</h4>
                <p className="text-lg font-bold text-green-600 text-center">✓ NO WIN = NO FEE</p>
                <div className="text-sm mt-2 text-center">
                  <p><strong>Başarılı Olursak:</strong> %25 Hizmet Bedeli</p>
                  <p className="text-green-600 font-medium"><strong>Başarısız Olursak:</strong> 0 EUR (HİÇBİR ÜCRET YOK)</p>
                </div>
                <p className="text-xs mt-2 text-gray-600">
                  Tahsil edilen tutarın %25'i hizmet bedeli olarak alınır. Kalan %75 en geç 14 iş günü içinde ödenir.
                </p>
              </div>

              {/* KVKK */}
              <div>
                <h4 className="font-bold text-primary mb-2">7. KİŞİSEL VERİLER / DATA PROTECTION</h4>
                <p className="text-sm">
                  Kişisel verilerinizin havayoluna, SHGM'ye iletilmesini ve hukuki süreçlerde kullanılmasını 6698 sayılı KVKK kapsamında kabul ediyorsunuz.
                </p>
              </div>

              {/* Diğer Hükümler */}
              <div>
                <h4 className="font-bold text-primary mb-2">8. DİĞER HÜKÜMLER</h4>
                <ul className="text-sm list-disc list-inside">
                  <li>Bu sözleşme Türk hukukuna tabidir</li>
                  <li>İhtilaflar İstanbul mahkemelerinde çözülür</li>
                  <li>Elektronik imza, ıslak imza ile eşdeğerdir</li>
                  <li>Bu sözleşme noter tasdiki gerektirmez (TBK m.183)</li>
                </ul>
              </div>

              {/* Tarih ve İmza Bilgisi */}
              <div className="mt-6 pt-4 border-t border-foreground/10">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Temlik Eden (Müşteri)</div>
                    <div className="font-bold">{passengerName}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Tarih</div>
                    <div className="font-bold">{currentDate}</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
          
          {/* Onay Kutuları */}
          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <Checkbox 
                id="readConsent" 
                checked={hasReadConsent}
                onCheckedChange={(checked) => setHasReadConsent(checked === true)}
              />
              <label htmlFor="readConsent" className="text-sm cursor-pointer">
                Yukarıdaki <strong>Alacak Temlik Sözleşmesi</strong> metnini okudum ve anladım.
              </label>
            </div>
            
            <div className="flex items-start gap-3">
              <Checkbox 
                id="acceptTerms" 
                checked={hasAcceptedTerms}
                onCheckedChange={(checked) => setHasAcceptedTerms(checked === true)}
              />
              <label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                UçuşTazminat'ın benim adıma havayolu şirketiyle iletişime geçmesine, tazminat talebinde bulunmasına ve gerekirse hukuki süreç başlatmasına yetki veriyorum. <strong>%25 hizmet bedeli</strong> oranını kabul ediyorum.
              </label>
            </div>

            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Checkbox 
                id="acceptAssignment" 
                checked={hasAcceptedAssignment}
                onCheckedChange={(checked) => setHasAcceptedAssignment(checked === true)}
              />
              <label htmlFor="acceptAssignment" className="text-sm cursor-pointer">
                <strong className="text-amber-800">Tazminat alacağımın TAM MÜLKİYETİNİ</strong> UçuşTazminat'a devrettiğimi ve temlik sonrası havayolu ile doğrudan iletişime geçmeyeceğimi kabul ve taahhüt ediyorum.
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* İmza Alanı */}
      <Card className="border-2 border-foreground/10">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <PenTool className="w-5 h-5 text-primary" />
              Elektronik İmza
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSignature}
              disabled={!hasSignature}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Temizle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Lütfen aşağıdaki alana imzanızı atın (fare veya parmağınızla çizin):
            </p>
            
            <div className="border-2 border-dashed border-foreground/20 rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                className="w-full h-[150px] cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            
            {hasSignature && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle className="w-4 h-4" />
                İmza alındı
              </div>
            )}
            
            {!hasSignature && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="w-4 h-4" />
                İmza bekleniyor
              </div>
            )}
            
            {/* PDF Önizleme ve İndirme Butonları */}
            {hasSignature && (
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviewPdf}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  PDF Önizle
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPdf}
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF İndir
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Butonlar */}
      <div className="flex gap-3">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1">
            İptal
          </Button>
        )}
        <Button 
          onClick={handleSubmit}
          className="flex-1 bg-primary hover:bg-primary/90"
          disabled={!hasReadConsent || !hasAcceptedTerms || !hasAcceptedAssignment || !hasSignature}
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          İmzala ve Onayla
        </Button>
      </div>
      
      {/* PDF Önizleme Dialog */}
      <Dialog open={showPdfPreview} onOpenChange={setShowPdfPreview}>
        <DialogContent className="max-w-4xl h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Alacak Temlik Sözleşmesi Önizleme
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 h-full">
            {pdfDataUrl && (
              <iframe
                src={pdfDataUrl}
                className="w-full h-[calc(90vh-100px)] border rounded-lg"
                title="Alacak Temlik Sözleşmesi PDF Önizleme"
              />
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setShowPdfPreview(false)}>
              Kapat
            </Button>
            <Button onClick={handleDownloadPdf}>
              <Download className="w-4 h-4 mr-2" />
              PDF İndir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
