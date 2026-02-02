import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { SEOHead, SEO_CONFIG } from "@/components/SEOHead";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import ConsentSignature from "@/components/ConsentSignature";
import { 
  ArrowLeft, 
  Plane, 
  User, 
  CheckCircle,
  AlertCircle,
  MapPin,
  Users,
  FileText,
  PenTool,
  Upload,
  ArrowRight,
  Ticket,
  CreditCard,
  Mail,
  BookOpen,
  Trash2,
  Eye,
  Info,
  Download
} from "lucide-react";
import { getCompensationByDistance } from "@shared/airports";
import { downloadPowerOfAttorneyPDF } from "@/lib/pdfGenerator";

// Haversine mesafe hesaplama fonksiyonu
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

interface WizardData {
  departureAirport: { code: string; city: string; name: string; lat: number; lon: number } | null;
  arrivalAirport: { code: string; city: string; name: string; lat: number; lon: number } | null;
  isConnecting: boolean;
  connectionAirport: { code: string; city: string; name: string; lat: number; lon: number } | null;
  flight1: { flightNumber: string; flightDate: string };
  flight2: { flightNumber: string; flightDate: string };
  passengerCount: number;
  passengers: { firstName: string; lastName: string; email: string }[];
  distance?: number;
  compensation?: number;
  compensationPerPassenger?: number;
  compensationCategory?: string;
  minDelay?: number;
}

interface PassengerDocument {
  type: string;
  fileName: string;
  file: File;
}

interface PassengerDocuments {
  flightDocs: PassengerDocument[];
  idDocs: PassengerDocument[];
  consentDocs: PassengerDocument[]; // Tali başvurucuların fiziki imzalı vekaletname belgeleri
}

// Belge türleri
const FLIGHT_DOC_TYPES = [
  { type: "boarding_pass", label: "Biniş Kartı", icon: Ticket },
  { type: "booking_confirmation", label: "Konfirmasyon Mektubu", icon: Mail },
  { type: "ticket", label: "Bilet", icon: FileText },
];

const ID_DOC_TYPES = [
  { type: "id_card", label: "Kimlik Kartı", icon: CreditCard },
  { type: "passport", label: "Pasaport", icon: BookOpen },
];

// Vekaletname belge türü (tali başvurucular için)
const CONSENT_DOC_TYPE = { type: "signed_consent", label: "İmzalı Vekaletname", icon: PenTool };

// Adımlar
type Step = "details" | "documents" | "consent";

export default function NewClaim() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Wizard'dan gelen veriler
  const [wizardData, setWizardData] = useState<WizardData | null>(null);
  
  // Mevcut adım
  const [currentStep, setCurrentStep] = useState<Step>("details");
  
  // Ek form alanları
  const [disruptionType, setDisruptionType] = useState<string>("delay");
  const [delayDuration, setDelayDuration] = useState("");
  const [bookingReference, setBookingReference] = useState("");
  
  // Ödeme bilgileri
  const [passengerIban, setPassengerIban] = useState("");
  const [passengerBankName, setPassengerBankName] = useState("");
  
  // Ek yolcu bilgileri (Temlik Sözleşmesi için)
  const [passengerIdNumber, setPassengerIdNumber] = useState(""); // TC Kimlik No
  const [passengerPhone, setPassengerPhone] = useState(""); // Telefon
  
  // Her yolcu için ayrı belgeler
  const [passengerDocuments, setPassengerDocuments] = useState<PassengerDocuments[]>([]);
  const [activePassengerTab, setActivePassengerTab] = useState("0");
  
  // İmza verisi
  const [signatureData, setSignatureData] = useState<string>("");
  
  // Eligibility check
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  
  // Mesafe ve tazminat hesaplama (wizard'dan bağımsız)
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [calculatedCompensation, setCalculatedCompensation] = useState<number | null>(null);
  
  const checkMutation = trpc.calculator.check.useMutation({
    onSuccess: (data) => {
      setEligibilityResult(data);
      setEligibilityChecked(true);
    },
  });
  
  const createClaimMutation = trpc.claims.create.useMutation({
    onSuccess: (data) => {
      toast.success("Talebiniz başarıyla oluşturuldu!");
      sessionStorage.removeItem("claimWizardData");
      setLocation(`/dashboard/claims/${data.id}`);
    },
    onError: (error) => {
      toast.error(error.message || "Talep oluşturulurken bir hata oluştu");
    },
  });
  
  // Wizard verisini yükle
  useEffect(() => {
    const savedData = sessionStorage.getItem("claimWizardData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setWizardData(parsed);
        
        // Her yolcu için boş belge dizisi oluştur
        const initialDocs: PassengerDocuments[] = parsed.passengers.map(() => ({
          flightDocs: [],
          idDocs: [],
          consentDocs: [], // Tali başvurucuların fiziki imzalı vekaletname belgeleri
        }));
        setPassengerDocuments(initialDocs);
        
        // Wizard'dan gelen mesafe ve tazminat değerlerini kullan (varsa)
        const passengerCount = parsed.passengerCount || parsed.passengers?.length || 1;
        
        if (parsed.distance && parsed.distance > 0) {
          setCalculatedDistance(parsed.distance);
          // Wizard'dan gelen compensation zaten toplam (yolcu başı × yolcu sayısı)
          if (parsed.compensation) {
            setCalculatedCompensation(parsed.compensation);
          } else {
            // Eğer compensation yoksa hesapla
            const comp = getCompensationByDistance(
              parsed.distance,
              parsed.departureAirport?.code,
              parsed.arrivalAirport?.code
            );
            setCalculatedCompensation(comp.amount * passengerCount);
          }
        } else if (parsed.departureAirport && parsed.arrivalAirport) {
          // Wizard'dan gelmemişse yeniden hesapla
          let distance = 0;
          if (parsed.isConnecting && parsed.connectionAirport) {
            distance = haversineDistance(
              parsed.departureAirport.lat, parsed.departureAirport.lon,
              parsed.connectionAirport.lat, parsed.connectionAirport.lon
            ) + haversineDistance(
              parsed.connectionAirport.lat, parsed.connectionAirport.lon,
              parsed.arrivalAirport.lat, parsed.arrivalAirport.lon
            );
          } else {
            distance = haversineDistance(
              parsed.departureAirport.lat, parsed.departureAirport.lon,
              parsed.arrivalAirport.lat, parsed.arrivalAirport.lon
            );
          }
          setCalculatedDistance(Math.round(distance));
          const comp = getCompensationByDistance(
            distance,
            parsed.departureAirport?.code,
            parsed.arrivalAirport?.code
          );
          // Toplam tazminat = yolcu başı × yolcu sayısı
          setCalculatedCompensation(comp.amount * passengerCount);
        }
      } catch (e) {
        console.error("Wizard verisi okunamadı:", e);
      }
    }
  }, []);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  // Auth check
  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }
  
  // Wizard verisi yoksa
  if (!wizardData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-foreground/10">
          <div className="container py-4 flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <span className="w-3 h-3 bg-primary" />
              UçuşTazminat
            </Link>
          </div>
        </header>
        
        <main className="container py-16 max-w-2xl text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-4">Talep Verisi Bulunamadı</h1>
          <p className="text-muted-foreground mb-8">
            Lütfen ana sayfadaki tazminat hesaplama formunu kullanarak başlayın.
          </p>
          <Button asChild>
            <Link href="/#hesapla">Tazminat Hesapla</Link>
          </Button>
        </main>
      </div>
    );
  }
  
  const handleCheckEligibility = () => {
    if (!wizardData.departureAirport || !wizardData.arrivalAirport) return;
    
    // Mesafe hesapla - önce wizard'dan gelen değeri kullan
    let distance = wizardData.distance || calculatedDistance;
    if (!distance && wizardData.departureAirport && wizardData.arrivalAirport) {
      if (wizardData.isConnecting && wizardData.connectionAirport) {
        distance = Math.round(
          haversineDistance(
            wizardData.departureAirport.lat, wizardData.departureAirport.lon,
            wizardData.connectionAirport.lat, wizardData.connectionAirport.lon
          ) + haversineDistance(
            wizardData.connectionAirport.lat, wizardData.connectionAirport.lon,
            wizardData.arrivalAirport.lat, wizardData.arrivalAirport.lon
          )
        );
      } else {
        distance = Math.round(haversineDistance(
          wizardData.departureAirport.lat, wizardData.departureAirport.lon,
          wizardData.arrivalAirport.lat, wizardData.arrivalAirport.lon
        ));
      }
    }
    
    if (distance) {
      setCalculatedDistance(distance);
      const comp = getCompensationByDistance(
        distance,
        wizardData.departureAirport?.code,
        wizardData.arrivalAirport?.code
      );
      // Toplam tazminat = yolcu başı × yolcu sayısı
      const passengerCount = wizardData.passengerCount || wizardData.passengers?.length || 1;
      setCalculatedCompensation(comp.amount * passengerCount);
    }
    
    checkMutation.mutate({
      flightNumber: wizardData.flight1.flightNumber,
      flightDate: wizardData.flight1.flightDate,
      departureAirport: wizardData.departureAirport.code,
      arrivalAirport: wizardData.arrivalAirport.code,
      disruptionType: disruptionType as any,
      delayDuration: delayDuration ? parseInt(delayDuration) * 60 : undefined,
    });
  };
  
  const handleProceedToDocuments = () => {
    if (!eligibilityResult?.eligible) {
      toast.error("Önce uygunluk kontrolü yapmanız gerekiyor");
      return;
    }
    setCurrentStep("documents");
  };
  
  // Belge yükleme fonksiyonları
  const handleFileSelect = (passengerIndex: number, category: 'flight' | 'id' | 'consent', type: string, file: File) => {
    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır");
      return;
    }
    
    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Sadece JPG, PNG, WebP ve PDF dosyaları yüklenebilir");
      return;
    }
    
    const newDoc: PassengerDocument = {
      type,
      fileName: file.name,
      file,
    };
    
    setPassengerDocuments(prev => {
      const updated = [...prev];
      if (category === 'flight') {
        updated[passengerIndex] = {
          ...updated[passengerIndex],
          flightDocs: [...updated[passengerIndex].flightDocs, newDoc],
        };
      } else if (category === 'id') {
        updated[passengerIndex] = {
          ...updated[passengerIndex],
          idDocs: [...updated[passengerIndex].idDocs, newDoc],
        };
      } else if (category === 'consent') {
        updated[passengerIndex] = {
          ...updated[passengerIndex],
          consentDocs: [...updated[passengerIndex].consentDocs, newDoc],
        };
      }
      return updated;
    });
    
    toast.success("Belge eklendi");
  };
  
  const handleDeleteDocument = (passengerIndex: number, category: 'flight' | 'id' | 'consent', docIndex: number) => {
    setPassengerDocuments(prev => {
      const updated = [...prev];
      if (category === 'flight') {
        updated[passengerIndex] = {
          ...updated[passengerIndex],
          flightDocs: updated[passengerIndex].flightDocs.filter((_, i) => i !== docIndex),
        };
      } else if (category === 'id') {
        updated[passengerIndex] = {
          ...updated[passengerIndex],
          idDocs: updated[passengerIndex].idDocs.filter((_, i) => i !== docIndex),
        };
      } else if (category === 'consent') {
        updated[passengerIndex] = {
          ...updated[passengerIndex],
          consentDocs: updated[passengerIndex].consentDocs.filter((_, i) => i !== docIndex),
        };
      }
      return updated;
    });
    toast.success("Belge kaldırıldı");
  };
  
  // Tüm yolcuların belgelerinin geçerli olup olmadığını kontrol et
  const areAllDocumentsValid = () => {
    return passengerDocuments.every(pd => 
      pd.flightDocs.length > 0 && pd.idDocs.length > 0
    );
  };
  
  const handleProceedToConsent = () => {
    if (!areAllDocumentsValid()) {
      toast.error("Lütfen tüm yolcular için gerekli belgeleri yükleyin");
      return;
    }
    setCurrentStep("consent");
  };
  
  const handleSignatureComplete = async (signature: string) => {
    if (!wizardData || !eligibilityResult) return;
    
    setSignatureData(signature);
    
    // Tüm belgeleri base64'e çevir
    const allDocuments: { type: string; fileName: string; fileData: string; mimeType: string; passengerIndex: number }[] = [];
    
    for (let i = 0; i < passengerDocuments.length; i++) {
      const pd = passengerDocuments[i];
      
      for (const doc of pd.flightDocs) {
        const base64 = await fileToBase64(doc.file);
        const base64Data = base64.split(',')[1] || base64;
        allDocuments.push({
          type: doc.type,
          fileName: `yolcu${i + 1}_${doc.fileName}`,
          fileData: base64Data,
          mimeType: doc.file.type,
          passengerIndex: i,
        });
      }
      
      for (const doc of pd.idDocs) {
        const base64 = await fileToBase64(doc.file);
        const base64Data = base64.split(',')[1] || base64;
        allDocuments.push({
          type: doc.type,
          fileName: `yolcu${i + 1}_${doc.fileName}`,
          fileData: base64Data,
          mimeType: doc.file.type,
          passengerIndex: i,
        });
      }
      
      // Tali başvurucuların fiziki imzalı vekaletname belgeleri
      for (const doc of pd.consentDocs) {
        const base64 = await fileToBase64(doc.file);
        const base64Data = base64.split(',')[1] || base64;
        allDocuments.push({
          type: doc.type,
          fileName: `yolcu${i + 1}_vekaletname_${doc.fileName}`,
          fileData: base64Data,
          mimeType: doc.file.type,
          passengerIndex: i,
        });
      }
    }
    
    // İmza atıldığı andaki sözleşme metnini oluştur (versiyonlama için)
    const signedAgreementContent = JSON.stringify({
      version: '2.0', // Sözleşme versiyonu
      signedAt: new Date().toISOString(),
      agreementType: 'ALACAK_TEMLIK_SOZLESMESI',
      client: {
        name: `${wizardData.passengers[0].firstName} ${wizardData.passengers[0].lastName}`,
        email: wizardData.passengers[0].email,
        phone: passengerPhone || null,
        idNumber: passengerIdNumber || null,
      },
      flight: {
        number: wizardData.flight1.flightNumber,
        date: wizardData.flight1.flightDate,
        departure: wizardData.departureAirport!.code,
        arrival: wizardData.arrivalAirport!.code,
        route: `${wizardData.departureAirport!.code} - ${wizardData.arrivalAirport!.code}`,
        isConnecting: wizardData.isConnecting,
        connectionAirport: wizardData.connectionAirport?.code || null,
        flight2Number: wizardData.isConnecting ? wizardData.flight2.flightNumber : null,
      },
      compensation: {
        amount: calculatedCompensation || eligibilityResult?.compensation || 0,
        distance: calculatedDistance || wizardData.distance || 0,
        regulation: 'SHY-YOLCU',
      },
      disruptionType: disruptionType,
      bookingReference: bookingReference || null,
      passengerCount: wizardData.passengers.length,
      // Sözleşme metni hash'i (değişiklik takibi için)
      agreementTextHash: 'v2.0-2026-01-24',
    });
    
    // Talep oluştur
    createClaimMutation.mutate({
      flightNumber: wizardData.flight1.flightNumber,
      flightDate: wizardData.flight1.flightDate,
      departureAirport: wizardData.departureAirport!.code,
      arrivalAirport: wizardData.arrivalAirport!.code,
      // Aktarmalı uçuş bilgileri
      isConnecting: wizardData.isConnecting,
      connectionAirport: wizardData.connectionAirport?.code,
      flight2Number: wizardData.isConnecting ? wizardData.flight2.flightNumber : undefined,
      flight2Date: wizardData.isConnecting ? wizardData.flight2.flightDate : undefined,
      // Sorun bilgileri
      disruptionType: disruptionType as any,
      delayDuration: delayDuration ? parseInt(delayDuration) * 60 : undefined,
      passengerName: `${wizardData.passengers[0].firstName} ${wizardData.passengers[0].lastName}`,
        passengerEmail: wizardData.passengers[0].email,
        passengerPhone: passengerPhone || undefined,
        passengerIdNumber: passengerIdNumber || undefined,
        bookingReference: bookingReference || undefined,
        passengerIban: passengerIban || undefined,
        passengerBankName: passengerBankName || undefined,
      // Yolcu bilgilerini ekle
      passengers: wizardData.passengers.map(p => ({
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email || undefined,
      })),
      consentSignature: signature,
      signedAgreementContent: signedAgreementContent, // İmza atıldığı andaki sözleşme metni
      documents: allDocuments,
    });
  };
  
  // File to base64 helper
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };
  
  // Adım göstergesi
  const steps = [
    { id: "details", label: "Sorun Detayları", icon: AlertCircle },
    { id: "documents", label: "Belgeler", icon: FileText },
    { id: "consent", label: "Vekaletname", icon: PenTool },
  ];
  
  // Tazminat değeri (hesaplanmış veya wizard'dan)
  const displayCompensation = calculatedCompensation || wizardData.compensation || eligibilityResult?.compensationAmount;
  const displayDistance = calculatedDistance || wizardData.distance || eligibilityResult?.distance;
  
  return (
    <div className="min-h-screen bg-background">
      <SEOHead {...SEO_CONFIG.newClaim} />
      {/* Header */}
      <header className="border-b border-foreground/10 sticky top-0 bg-background z-50">
        <div className="container py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg sm:text-xl">
            <span className="w-3 h-3 bg-primary" />
            UçuşTazminat
          </Link>
          
          {/* Adım Göstergesi - Desktop */}
          <div className="hidden md:flex items-center gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : isPast 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-secondary text-muted-foreground'
                  }`}>
                    {isPast ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="font-medium">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-1 ${isPast ? 'bg-green-300' : 'bg-secondary'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Adım Göstergesi - Mobil */}
        <div className="md:hidden border-t border-foreground/10 py-2 px-4 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = steps.findIndex(s => s.id === currentStep) > index;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-colors ${
                    isActive 
                      ? 'bg-primary text-white' 
                      : isPast 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-secondary text-muted-foreground'
                  }`}>
                    {isPast ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                    <span className="font-medium">{step.label}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-4 h-0.5 mx-0.5 ${isPast ? 'bg-green-300' : 'bg-secondary'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>
      
      <main className="container py-4 sm:py-6 md:py-8">
        {/* Adım 1: Sorun Detayları */}
        {currentStep === "details" && (
          <>
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Tazminat Talebinizi Tamamlayın</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Uçuş bilgilerinizi doğrulayın ve sorun detaylarını girin.
              </p>
            </div>
            
            <div className="flex flex-col-reverse md:grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Sol Taraf - Formlar */}
              <div className="md:col-span-2 space-y-4 sm:space-y-6">
                {/* Güzergah Özeti */}
                <Card className="border-2 border-foreground/10">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Güzergah Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="flex items-center gap-2 sm:gap-4">
                      <div className="flex-1 text-center p-2 sm:p-4 bg-secondary/50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold">{wizardData.departureAirport?.code}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground truncate">{wizardData.departureAirport?.city}</div>
                      </div>
                      
                      {wizardData.isConnecting && wizardData.connectionAirport && (
                        <>
                          <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 text-center p-2 sm:p-4 bg-secondary/50 rounded-lg">
                            <div className="text-lg sm:text-2xl font-bold">{wizardData.connectionAirport.code}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">{wizardData.connectionAirport.city}</div>
                          </div>
                        </>
                      )}
                      
                      <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                      
                      <div className="flex-1 text-center p-2 sm:p-4 bg-secondary/50 rounded-lg">
                        <div className="text-lg sm:text-2xl font-bold">{wizardData.arrivalAirport?.code}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground truncate">{wizardData.arrivalAirport?.city}</div>
                      </div>
                    </div>
                    
                    {displayDistance && (
                      <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-muted-foreground">
                        Toplam Mesafe: <span className="font-bold text-foreground">{displayDistance} km</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Uçuş Bilgileri */}
                <Card className="border-2 border-foreground/10">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Plane className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Uçuş Bilgileri
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Uçuş Numarası</div>
                        <div className="font-bold text-sm sm:text-base">{wizardData.flight1.flightNumber}</div>
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm text-muted-foreground">Uçuş Tarihi</div>
                        <div className="font-bold text-sm sm:text-base">{wizardData.flight1.flightDate}</div>
                      </div>
                      {wizardData.isConnecting && wizardData.flight2.flightNumber && (
                        <>
                          <div>
                            <div className="text-xs sm:text-sm text-muted-foreground">2. Uçuş Numarası</div>
                            <div className="font-bold text-sm sm:text-base">{wizardData.flight2.flightNumber}</div>
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm text-muted-foreground">2. Uçuş Tarihi</div>
                            <div className="font-bold text-sm sm:text-base">{wizardData.flight2.flightDate}</div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Yolcu Bilgileri */}
                <Card className="border-2 border-foreground/10">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Yolcu Bilgileri ({wizardData.passengerCount} kişi)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      {wizardData.passengers.map((passenger, index) => (
                        <div key={index} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-secondary/50 rounded-lg">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm sm:text-base truncate">{passenger.firstName} {passenger.lastName}</div>
                            <div className="text-xs sm:text-sm text-muted-foreground truncate">{passenger.email}</div>
                          </div>
                          {index === 0 && (
                            <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded flex-shrink-0">
                              Ana Başvuran
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Sorun Detayları */}
                <Card className="border-2 border-foreground/10">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      Sorun Detayları
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                    <div className="space-y-2">
                      <Label>Sorun Türü</Label>
                      <Select value={disruptionType} onValueChange={setDisruptionType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sorun türünü seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="delay">Gecikme</SelectItem>
                          <SelectItem value="cancellation">İptal</SelectItem>
                          <SelectItem value="denied_boarding">Uçağa Alınmama</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {disruptionType === "delay" && (
                      <div className="space-y-2">
                        <Label>Gecikme Süresi (saat)</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Örn: 3"
                          value={delayDuration}
                          onChange={(e) => setDelayDuration(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">
                          Varış noktasına kaç saat geç ulaştınız?
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label>Rezervasyon Referansı (Opsiyonel)</Label>
                      <Input
                        placeholder="Örn: ABC123"
                        value={bookingReference}
                        onChange={(e) => setBookingReference(e.target.value)}
                      />
                    </div>
                    
                    {/* TC Kimlik ve Telefon Bilgileri */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>TC Kimlik No <span className="text-destructive">*</span></Label>
                        <Input
                          placeholder="12345678901"
                          value={passengerIdNumber}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setPassengerIdNumber(value);
                          }}
                          maxLength={11}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Temlik sözleşmesi için gereklidir</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Telefon Numarası <span className="text-destructive">*</span></Label>
                        <Input
                          placeholder="05XX XXX XX XX"
                          value={passengerPhone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9]/g, '');
                            setPassengerPhone(value);
                          }}
                          maxLength={11}
                          required
                        />
                        <p className="text-xs text-muted-foreground">Size ulaşabilmemiz için gereklidir</p>
                      </div>
                    </div>
                    
                    {/* IBAN Bilgileri */}
                    <div className="space-y-4 p-4 border border-blue-200 bg-blue-50/50 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium mb-1">Doğrudan Ödeme Seçeneği</p>
                          <p className="text-xs text-blue-700">
                            Havayolu şirketi tazminatı doğrudan size ödeyebilir. Bu durumda, ödemeyi aldıktan sonra <strong>3 iş günü içinde</strong> tazminat tutarının KDV dahil <strong>%25'lik komisyon kısmını</strong> UçuşTazminat'a ait banka hesabına göndermeniz gerekmektedir. Aksi halde ihtar veya ihbara gerek bulunmaksızın alacak muaccel olacak ve dava ile takip yolu saklı tutulacaktır.
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>IBAN Numarası (Opsiyonel)</Label>
                          <Input
                            placeholder="TR00 0000 0000 0000 0000 0000 00"
                            value={passengerIban}
                            onChange={(e) => {
                              // IBAN formatı: sadece harf ve rakam, boşluklar otomatik
                              const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                              setPassengerIban(value);
                            }}
                            maxLength={34}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Banka Adı (Opsiyonel)</Label>
                          <Input
                            placeholder="Örn: Garanti Bankası"
                            value={passengerBankName}
                            onChange={(e) => setPassengerBankName(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {!eligibilityChecked && (
                      <Button 
                        onClick={handleCheckEligibility}
                        className="w-full"
                        disabled={checkMutation.isPending || (disruptionType === "delay" && !delayDuration)}
                      >
                        {checkMutation.isPending ? "Kontrol Ediliyor..." : "Uygunluğu Kontrol Et"}
                      </Button>
                    )}
                    
                    {eligibilityResult && !eligibilityResult.eligible && (
                      <div className="p-4 border-2 border-destructive/20 bg-destructive/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                          <span className="font-bold">Tazminat Hakkı Bulunamadı</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{eligibilityResult.reason}</p>
                      </div>
                    )}
                    
                    {eligibilityResult?.eligible && (
                      <div className="p-4 border-2 border-primary/20 bg-primary/5 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          <span className="font-bold">Tazminat Hakkınız Var!</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                          <div>
                            <div className="text-muted-foreground">Tazminat Miktarı</div>
                            <div className="font-bold text-lg">{displayCompensation} €</div>
                          </div>
                          <div>
                            <div className="text-muted-foreground">Size Ödenecek (%75)</div>
                            <div className="font-bold text-lg text-primary">{Math.round((displayCompensation || 0) * 0.75)} €</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Sağ Taraf - Tazminat Özeti */}
              <div className="space-y-4 sm:space-y-6">
                <Card className="border-2 border-primary/20 bg-primary/5 md:sticky md:top-24">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Tazminat Özeti</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 space-y-3 sm:space-y-4">
                    <div>
                      <div className="text-xs sm:text-sm text-muted-foreground">Toplam Tazminat</div>
                      <div className="text-2xl sm:text-3xl md:text-4xl font-bold">
                        {displayCompensation || "---"} €
                      </div>
                    </div>
                    
                    {displayDistance && (
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        Mesafe: {displayDistance} km
                      </div>
                    )}
                    
                    {wizardData.passengerCount > 1 && (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Yolcu Başı</span>
                          <span>{wizardData.compensationPerPassenger || (displayCompensation ? Math.round(displayCompensation / wizardData.passengerCount) : 0)} €</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Yolcu Sayısı</span>
                          <span>× {wizardData.passengerCount}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="border-t border-foreground/10 pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Komisyon (%25)</span>
                        <span>
                          {displayCompensation 
                            ? Math.round(displayCompensation * 0.25) 
                            : "---"} €
                        </span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Size Ödenecek</span>
                        <span className="text-primary">
                          {displayCompensation 
                            ? Math.round(displayCompensation * 0.75) 
                            : "---"} €
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t border-foreground/10 pt-4 text-xs text-muted-foreground">
                      <p>* No Win No Fee - Tazminat alamazsak ücret ödemezsiniz. Şeffaf hukuki sürec.</p>
                    </div>
                    
                    <Button 
                      onClick={handleProceedToDocuments}
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={!eligibilityResult?.eligible}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Belgeleri Yükle
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    
                    {!eligibilityResult?.eligible && (
                      <p className="text-xs text-center text-muted-foreground">
                        Önce uygunluk kontrolü yapmanız gerekiyor
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
        
        {/* Adım 2: Belge Yükleme */}
        {currentStep === "documents" && (
          <>
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Belge Yükleme</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Her yolcu için gerekli belgeleri yükleyin. Her yolcu için en az bir uçuş belgesi ve bir kimlik belgesi gereklidir.
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              {/* Bilgi Kutusu */}
              <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4 sm:mb-6">
                <div className="flex items-start gap-2 sm:gap-3">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-blue-800 text-sm sm:text-base">Belge Gereksinimleri</div>
                    <p className="text-xs sm:text-sm text-blue-700 mt-1">
                      Her yolcu için <strong>en az bir uçuş belgesi</strong> (biniş kartı, konfirmasyon veya bilet) ve 
                      <strong> en az bir kimlik belgesi</strong> (kimlik kartı veya pasaport) yüklemeniz gerekmektedir.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Yolcu Tabları */}
              <Tabs value={activePassengerTab} onValueChange={setActivePassengerTab}>
                <TabsList className="w-full justify-start mb-4 sm:mb-6 flex-wrap h-auto gap-1 sm:gap-2">
                  {wizardData.passengers.map((passenger, index) => {
                    const pd = passengerDocuments[index];
                    const isValid = pd && pd.flightDocs.length > 0 && pd.idDocs.length > 0;
                    
                    return (
                      <TabsTrigger 
                        key={index} 
                        value={index.toString()}
                        className="flex items-center gap-2"
                      >
                        {isValid ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        {passenger.firstName} {passenger.lastName}
                        {index === 0 && <Badge variant="secondary" className="ml-1 text-xs">Ana</Badge>}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
                
                {wizardData.passengers.map((passenger, passengerIndex) => (
                  <TabsContent key={passengerIndex} value={passengerIndex.toString()} className="space-y-6">
                    <div className="p-4 bg-secondary/50 rounded-lg mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-bold">{passenger.firstName} {passenger.lastName}</div>
                          <div className="text-sm text-muted-foreground">{passenger.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Uçuş Belgeleri */}
                    <Card className={`border-2 ${
                      passengerDocuments[passengerIndex]?.flightDocs.length > 0 
                        ? 'border-green-500/50 bg-green-50/30' 
                        : 'border-foreground/10'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Ticket className="w-5 h-5 text-primary" />
                            Uçuş Belgeleri
                            {passengerDocuments[passengerIndex]?.flightDocs.length > 0 && (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Yüklendi
                              </Badge>
                            )}
                          </CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Aşağıdaki belgelerden <strong>en az birini</strong> yükleyin
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {FLIGHT_DOC_TYPES.map((docType) => {
                            const Icon = docType.icon;
                            const uploadedDocs = passengerDocuments[passengerIndex]?.flightDocs.filter(d => d.type === docType.type) || [];
                            
                            return (
                              <div 
                                key={docType.type}
                                className={`p-4 border rounded-lg ${
                                  uploadedDocs.length > 0 
                                    ? 'border-green-300 bg-green-50' 
                                    : 'border-foreground/10'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      uploadedDocs.length > 0 ? 'bg-green-100' : 'bg-secondary'
                                    }`}>
                                      <Icon className={`w-5 h-5 ${uploadedDocs.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div>
                                      <div className="font-medium">{docType.label}</div>
                                    </div>
                                  </div>
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*,.pdf"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleFileSelect(passengerIndex, 'flight', docType.type, file);
                                          e.target.value = '';
                                        }
                                      }}
                                    />
                                    <Button variant="outline" size="sm" asChild>
                                      <span>
                                        <Upload className="w-4 h-4 mr-1" />
                                        {uploadedDocs.length > 0 ? 'Ekle' : 'Yükle'}
                                      </span>
                                    </Button>
                                  </label>
                                </div>
                                
                                {uploadedDocs.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {uploadedDocs.map((doc, docIndex) => (
                                      <div 
                                        key={docIndex}
                                        className="flex items-center justify-between p-2 bg-white rounded border border-green-200"
                                      >
                                        <div className="flex items-center gap-2 text-sm">
                                          <FileText className="w-4 h-4 text-green-600" />
                                          <span className="truncate max-w-[200px]">{doc.fileName}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                          onClick={() => {
                                            const actualIndex = passengerDocuments[passengerIndex].flightDocs.findIndex(
                                              (d, i) => d.type === docType.type && passengerDocuments[passengerIndex].flightDocs.slice(0, i + 1).filter(x => x.type === docType.type).length === docIndex + 1
                                            );
                                            handleDeleteDocument(passengerIndex, 'flight', actualIndex);
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Kimlik Belgeleri */}
                    <Card className={`border-2 ${
                      passengerDocuments[passengerIndex]?.idDocs.length > 0 
                        ? 'border-green-500/50 bg-green-50/30' 
                        : 'border-foreground/10'
                    }`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <User className="w-5 h-5 text-primary" />
                            Kimlik Belgeleri
                            {passengerDocuments[passengerIndex]?.idDocs.length > 0 && (
                              <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Yüklendi
                              </Badge>
                            )}
                          </CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Aşağıdaki belgelerden <strong>en az birini</strong> yükleyin
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {ID_DOC_TYPES.map((docType) => {
                            const Icon = docType.icon;
                            const uploadedDocs = passengerDocuments[passengerIndex]?.idDocs.filter(d => d.type === docType.type) || [];
                            
                            return (
                              <div 
                                key={docType.type}
                                className={`p-4 border rounded-lg ${
                                  uploadedDocs.length > 0 
                                    ? 'border-green-300 bg-green-50' 
                                    : 'border-foreground/10'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                      uploadedDocs.length > 0 ? 'bg-green-100' : 'bg-secondary'
                                    }`}>
                                      <Icon className={`w-5 h-5 ${uploadedDocs.length > 0 ? 'text-green-600' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div>
                                      <div className="font-medium">{docType.label}</div>
                                    </div>
                                  </div>
                                  <label className="cursor-pointer">
                                    <input
                                      type="file"
                                      className="hidden"
                                      accept="image/*,.pdf"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleFileSelect(passengerIndex, 'id', docType.type, file);
                                          e.target.value = '';
                                        }
                                      }}
                                    />
                                    <Button variant="outline" size="sm" asChild>
                                      <span>
                                        <Upload className="w-4 h-4 mr-1" />
                                        {uploadedDocs.length > 0 ? 'Ekle' : 'Yükle'}
                                      </span>
                                    </Button>
                                  </label>
                                </div>
                                
                                {uploadedDocs.length > 0 && (
                                  <div className="mt-3 space-y-2">
                                    {uploadedDocs.map((doc, docIndex) => (
                                      <div 
                                        key={docIndex}
                                        className="flex items-center justify-between p-2 bg-white rounded border border-green-200"
                                      >
                                        <div className="flex items-center gap-2 text-sm">
                                          <FileText className="w-4 h-4 text-green-600" />
                                          <span className="truncate max-w-[200px]">{doc.fileName}</span>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                          onClick={() => {
                                            const actualIndex = passengerDocuments[passengerIndex].idDocs.findIndex(
                                              (d, i) => d.type === docType.type && passengerDocuments[passengerIndex].idDocs.slice(0, i + 1).filter(x => x.type === docType.type).length === docIndex + 1
                                            );
                                            handleDeleteDocument(passengerIndex, 'id', actualIndex);
                                          }}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
              
              {/* Yolcu Belge Durumu Özeti */}
              <Card className="border-2 border-foreground/10 mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Belge Durumu Özeti</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {wizardData.passengers.map((passenger, index) => {
                      const pd = passengerDocuments[index];
                      const hasFlightDoc = pd && pd.flightDocs.length > 0;
                      const hasIdDoc = pd && pd.idDocs.length > 0;
                      const isComplete = hasFlightDoc && hasIdDoc;
                      
                      return (
                        <div 
                          key={index} 
                          className={`flex items-center justify-between p-3 rounded-lg ${
                            isComplete ? 'bg-green-50 border border-green-200' : 'bg-secondary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isComplete ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-orange-500" />
                            )}
                            <span className="font-medium">{passenger.firstName} {passenger.lastName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant={hasFlightDoc ? "default" : "secondary"} className={hasFlightDoc ? "bg-green-600" : ""}>
                              Uçuş: {hasFlightDoc ? "✓" : "Eksik"}
                            </Badge>
                            <Badge variant={hasIdDoc ? "default" : "secondary"} className={hasIdDoc ? "bg-green-600" : ""}>
                              Kimlik: {hasIdDoc ? "✓" : "Eksik"}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              
              <div className="flex gap-4 mt-8">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep("details")}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Geri
                </Button>
                <Button 
                  onClick={handleProceedToConsent}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={!areAllDocumentsValid()}
                >
                  Vekaletname İmzala
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              {!areAllDocumentsValid() && (
                <p className="text-sm text-center text-muted-foreground mt-4">
                  Tüm yolcular için en az bir uçuş belgesi ve bir kimlik belgesi yüklemeniz gerekiyor
                </p>
              )}
            </div>
          </>
        )}
        
        {/* Adım 3: Vekaletname ve İmza */}
        {currentStep === "consent" && (
          <>
            <div className="mb-4 sm:mb-6 md:mb-8">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2">Vekaletname Onayı</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Tazminat talebinizin işleme alınabilmesi için vekaletname metnini okuyup imzalamanız gerekmektedir.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
              {/* Tali Başvurucuların Fiziki İmzalı Vekaletname Belgeleri */}
              {wizardData.passengers.length > 1 && (
                <Card className="border-2 border-amber-200 bg-amber-50/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="w-5 h-5 text-amber-600" />
                      Diğer Yolcuların Vekaletname Belgeleri
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Ana başvurucu dışındaki yolcular için fiziki olarak imzalanmış vekaletname belgelerini tarayıp yükleyin.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-amber-100 rounded-lg text-sm text-amber-800">
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <strong>Not:</strong> Her tali başvurucu için aşağıdaki "İndir" butonuna tıklayarak vekaletname şablonunu indirin, yazdırıp imzalattıktan sonra tarayıp "Yükle" butonuyla buraya yükleyin.
                        </div>
                      </div>
                    </div>
                    
                    {wizardData.passengers.slice(1).map((passenger, index) => {
                      const passengerIndex = index + 1; // İlk yolcu (index 0) ana başvurucu
                      const uploadedDocs = passengerDocuments[passengerIndex]?.consentDocs || [];
                      
                      return (
                        <div 
                          key={passengerIndex}
                          className={`p-4 border rounded-lg ${
                            uploadedDocs.length > 0 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-foreground/10 bg-background'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                uploadedDocs.length > 0 ? 'bg-green-100' : 'bg-secondary'
                              }`}>
                                <User className={`w-5 h-5 ${
                                  uploadedDocs.length > 0 ? 'text-green-600' : 'text-muted-foreground'
                                }`} />
                              </div>
                              <div>
                                <div className="font-medium">{passenger.firstName} {passenger.lastName}</div>
                                <div className="text-sm text-muted-foreground">
                                  {uploadedDocs.length > 0 
                                    ? `${uploadedDocs.length} belge yüklendi`
                                    : 'İmzalı vekaletname bekleniyor'
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  // Vekaletname PDF olarak indir
                                  const primaryPassenger = wizardData.passengers[0];
                                  downloadPowerOfAttorneyPDF({
                                    passengerName: `${passenger.firstName} ${passenger.lastName}`,
                                    passengerEmail: passenger.email,
                                    mainApplicantName: `${primaryPassenger.firstName} ${primaryPassenger.lastName}`,
                                    flightNumber: wizardData.flight1?.flightNumber,
                                    flightDate: wizardData.flight1?.flightDate,
                                    departureAirport: wizardData.departureAirport?.code,
                                    arrivalAirport: wizardData.arrivalAirport?.code,
                                    // Aktarmalı uçuş bilgileri
                                    isConnecting: wizardData.isConnecting,
                                    connectionAirport: wizardData.connectionAirport?.code,
                                    flight1: wizardData.flight1,
                                    flight2: wizardData.isConnecting ? wizardData.flight2 : undefined,
                                    // PNR
                                    bookingReference: bookingReference || undefined,
                                    date: new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }),
                                    isMainApplicant: false
                                  }, `vekaletname_${passenger.firstName}_${passenger.lastName}.pdf`);
                                  toast.success('Vekaletname PDF olarak indirildi. Lütfen yazdırıp imzalattıktan sonra tarayıp yükleyin.');
                                }}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                PDF İndir
                              </Button>
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*,.pdf"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleFileSelect(passengerIndex, 'consent', CONSENT_DOC_TYPE.type, file);
                                      e.target.value = '';
                                    }
                                  }}
                                />
                                <Button variant={uploadedDocs.length > 0 ? "outline" : "default"} size="sm" asChild>
                                  <span>
                                    <Upload className="w-4 h-4 mr-1" />
                                    {uploadedDocs.length > 0 ? 'Ekle' : 'Yükle'}
                                  </span>
                                </Button>
                              </label>
                            </div>
                          </div>
                          
                          {/* Yüklenen belgeler */}
                          {uploadedDocs.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {uploadedDocs.map((doc, docIndex) => (
                                <div 
                                  key={docIndex}
                                  className="flex items-center justify-between p-2 bg-white rounded border border-green-200"
                                >
                                  <div className="flex items-center gap-2 text-sm">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="truncate max-w-[200px]">{doc.fileName}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => handleDeleteDocument(passengerIndex, 'consent', docIndex)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
              
              {/* Ana Başvurucu Elektronik İmza */}
              <div>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-800">
                    <User className="w-4 h-4" />
                    <span className="font-medium">Ana Başvurucu:</span>
                    <span>{wizardData.passengers[0].firstName} {wizardData.passengers[0].lastName}</span>
                  </div>
                </div>
                
                <ConsentSignature
                  passengerName={`${wizardData.passengers[0].firstName} ${wizardData.passengers[0].lastName}`}
                  passengerEmail={wizardData.passengers[0].email}
                  passengerPhone={passengerPhone || undefined}
                  passengerIdNumber={passengerIdNumber || undefined}
                  flightNumber={wizardData.flight1?.flightNumber}
                  flightDate={wizardData.flight1?.flightDate}
                  departureAirport={wizardData.departureAirport?.code}
                  arrivalAirport={wizardData.arrivalAirport?.code}
                  airline={wizardData.flight1?.flightNumber?.substring(0, 2)}
                  isConnecting={wizardData.isConnecting}
                  connectionAirport={wizardData.connectionAirport?.code}
                  flight1={wizardData.flight1}
                  flight2={wizardData.isConnecting ? wizardData.flight2 : undefined}
                  bookingReference={bookingReference || undefined}
                  compensationAmount={eligibilityResult?.compensation}
                  disruptionType={disruptionType as any}
                  onSignatureComplete={handleSignatureComplete}
                  onCancel={() => setCurrentStep("documents")}
                />
              </div>
              
              {createClaimMutation.isPending && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-blue-800">Talebiniz oluşturuluyor...</span>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
