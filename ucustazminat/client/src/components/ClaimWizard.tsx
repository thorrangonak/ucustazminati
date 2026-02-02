import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plane, MapPin, Users, ArrowRight, ArrowLeft, Check, 
  Calendar, AlertCircle, AlertTriangle, XCircle, Info
} from "lucide-react";
import { 
  airports, 
  searchAirports, 
  calculateFlightDistance, 
  getCompensationByDistance,
  type Airport 
} from "@shared/airports";

interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
}

interface FlightInfo {
  flightNumber: string;
  flightDate: string;
}

// Sorun türleri
type DisruptionType = 
  | "delay" 
  | "cancellation" 
  | "denied_boarding" 
  | "missed_connection" 
  | "other";

// Gecikme süreleri
type DelayDuration = 
  | "less_than_2" 
  | "2_to_3" 
  | "3_to_4" 
  | "more_than_4" 
  | "never_arrived" 
  | "dont_remember";

// İptal bilgilendirme zamanı
type CancellationNotice = 
  | "14_days_before" 
  | "7_to_14_days" 
  | "less_than_7_days" 
  | "same_day" 
  | "dont_remember";

// Biniş reddi türü
type DeniedBoardingType = "voluntary" | "involuntary";

// Aynı PNR durumu
type SamePnr = "yes" | "no_self_transfer";

// Havayolu gerekçeleri
type AirlineReason = 
  | "technical_issue"
  | "crew_shortage"
  | "operational_issue"
  | "weather"
  | "atc_issue"
  | "security_concern"
  | "previous_flight_delay"
  | "bird_strike"
  | "airport_technical"
  | "no_reason_given"
  | "other"
  | "dont_know";

// Olağanüstü haller (tazminat yok)
const EXTRAORDINARY_CIRCUMSTANCES: AirlineReason[] = [
  "weather",
  "atc_issue",
  "security_concern",
  "bird_strike"
];

interface WizardData {
  // Adım 1: Havalimanları
  departureAirport: Airport | null;
  arrivalAirport: Airport | null;
  
  // Adım 2: Uçuş tipi
  isConnecting: boolean;
  connectionAirport: Airport | null;
  
  // Adım 3: Sorun türü
  disruptionType: DisruptionType | null;
  otherDisruptionDescription: string;
  
  // Adım 4: Sorun detayları
  delayDuration: DelayDuration | null;
  cancellationNotice: CancellationNotice | null;
  deniedBoardingType: DeniedBoardingType | null;
  missedConnectionDelay: DelayDuration | null;
  samePnr: SamePnr | null;
  
  // Adım 5: Havayolu gerekçesi
  airlineReason: AirlineReason | null;
  otherReasonDescription: string;
  
  // Adım 6: Uçuş bilgileri
  flight1: FlightInfo;
  flight2: FlightInfo;
  
  // Adım 7: Yolcu bilgileri
  passengerCount: number;
  passengers: PassengerInfo[];
  
  // Hesaplanan değerler
  distance?: number;
  compensation?: number;
  compensationPerPassenger?: number;
  compensationCategory?: string;
  minDelay?: number;
  
  // Uygunluk durumu
  isEligible: boolean;
  ineligibilityReason: string | null;
}

const initialData: WizardData = {
  departureAirport: null,
  arrivalAirport: null,
  isConnecting: false,
  connectionAirport: null,
  disruptionType: null,
  otherDisruptionDescription: "",
  delayDuration: null,
  cancellationNotice: null,
  deniedBoardingType: null,
  missedConnectionDelay: null,
  samePnr: null,
  airlineReason: null,
  otherReasonDescription: "",
  flight1: { flightNumber: "", flightDate: "" },
  flight2: { flightNumber: "", flightDate: "" },
  passengerCount: 1,
  passengers: [{ firstName: "", lastName: "", email: "" }],
  isEligible: true,
  ineligibilityReason: null,
};

// Havalimanı Arama Bileşeni
function AirportSearch({ 
  label, 
  value, 
  onChange, 
  placeholder,
  excludeCode
}: { 
  label: string; 
  value: Airport | null; 
  onChange: (airport: Airport | null) => void;
  placeholder: string;
  excludeCode?: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Airport[]>([]);

  useEffect(() => {
    if (query.length >= 2) {
      let filtered = searchAirports(query);
      if (excludeCode) {
        filtered = filtered.filter(a => a.code !== excludeCode);
      }
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query, excludeCode]);

  const handleSelect = (airport: Airport) => {
    onChange(airport);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery("");
  };

  return (
    <div className="space-y-1 sm:space-y-2">
      <Label className="text-xs sm:text-sm">{label}</Label>
      {value ? (
        <div className="flex items-center justify-between p-2 sm:p-3 border border-primary rounded-lg bg-primary/5">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-primary">{value.code}</span>
            </div>
            <div>
              <div className="font-medium text-sm sm:text-base">{value.city}</div>
              <div className="text-xs text-muted-foreground">{value.name}</div>
            </div>
          </div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={handleClear}
            className="text-xs sm:text-sm"
          >
            Değiştir
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-foreground/20 text-sm sm:text-base"
          />
          {isOpen && results.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-foreground/20 rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
              {results.map((airport) => (
                <button
                  key={airport.code}
                  type="button"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-secondary flex items-center gap-2 sm:gap-3"
                  onClick={() => handleSelect(airport)}
                >
                  <span className="font-bold text-primary text-xs sm:text-sm">{airport.code}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{airport.city}</div>
                    <div className="text-xs text-muted-foreground truncate">{airport.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Adım Göstergesi
function StepIndicator({ currentStep, totalSteps, steps }: { currentStep: number; totalSteps: number; steps: { num: number; title: string }[] }) {
  return (
    <div className="flex items-center justify-between mb-6 sm:mb-8 overflow-x-auto pb-2">
      {steps.slice(0, totalSteps).map((step, index) => (
        <div key={step.num} className="flex items-center flex-shrink-0">
          <div className="flex flex-col items-center">
            <div 
              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base transition-colors ${
                currentStep > step.num 
                  ? "bg-primary text-white" 
                  : currentStep === step.num 
                    ? "bg-primary text-white" 
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {currentStep > step.num ? <Check className="w-4 h-4 sm:w-5 sm:h-5" /> : step.num}
            </div>
            <span className={`text-[10px] sm:text-xs mt-1 sm:mt-2 whitespace-nowrap ${currentStep >= step.num ? "text-foreground font-medium" : "text-muted-foreground"}`}>
              {step.title}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div className={`w-6 sm:w-12 md:w-16 h-0.5 mx-1 sm:mx-2 ${currentStep > step.num ? "bg-primary" : "bg-secondary"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// Uyarı Kutusu Bileşeni
function WarningBox({ 
  type, 
  title, 
  message 
}: { 
  type: "warning" | "error" | "info"; 
  title: string; 
  message: string;
}) {
  const styles = {
    warning: {
      bg: "bg-yellow-50 border-yellow-200",
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      titleColor: "text-yellow-800",
      textColor: "text-yellow-700"
    },
    error: {
      bg: "bg-red-50 border-red-200",
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      titleColor: "text-red-800",
      textColor: "text-red-700"
    },
    info: {
      bg: "bg-blue-50 border-blue-200",
      icon: <Info className="w-5 h-5 text-blue-600" />,
      titleColor: "text-blue-800",
      textColor: "text-blue-700"
    }
  };

  const style = styles[type];

  return (
    <div className={`p-4 rounded-lg border ${style.bg}`}>
      <div className="flex gap-3">
        <div className="flex-shrink-0">{style.icon}</div>
        <div>
          <h4 className={`font-semibold ${style.titleColor}`}>{title}</h4>
          <p className={`text-sm mt-1 ${style.textColor}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}

// Seçenek Kartı Bileşeni
function OptionCard({
  value,
  currentValue,
  onChange,
  title,
  description,
  disabled = false
}: {
  value: string;
  currentValue: string | null;
  onChange: (value: string) => void;
  title: string;
  description?: string;
  disabled?: boolean;
}) {
  const isSelected = currentValue === value;
  
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(value)}
      disabled={disabled}
      className={`w-full text-left p-3 sm:p-4 border rounded-lg transition-colors ${
        isSelected 
          ? "border-primary bg-primary/5" 
          : disabled 
            ? "border-foreground/10 bg-muted/50 opacity-50 cursor-not-allowed"
            : "border-foreground/20 hover:border-foreground/40"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
          isSelected ? "border-primary bg-primary" : "border-foreground/30"
        }`}>
          {isSelected && <Check className="w-3 h-3 text-white" />}
        </div>
        <div>
          <div className="font-medium text-sm sm:text-base">{title}</div>
          {description && (
            <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">{description}</div>
          )}
        </div>
      </div>
    </button>
  );
}

// Tazminat Özet Kartı
function CompensationSummary({ 
  departureAirport, 
  arrivalAirport, 
  connectionAirport,
  isConnecting,
  passengerCount,
  isEligible,
  ineligibilityReason
}: { 
  departureAirport: Airport | null; 
  arrivalAirport: Airport | null;
  connectionAirport: Airport | null;
  isConnecting: boolean;
  passengerCount: number;
  isEligible: boolean;
  ineligibilityReason: string | null;
}) {
  const calculation = useMemo(() => {
    if (!departureAirport || !arrivalAirport) return null;

    let totalDistance = 0;
    
    if (isConnecting && connectionAirport) {
      const dist1 = calculateFlightDistance(departureAirport.code, connectionAirport.code);
      const dist2 = calculateFlightDistance(connectionAirport.code, arrivalAirport.code);
      if (dist1 && dist2) {
        totalDistance = dist1 + dist2;
      }
    } else {
      const dist = calculateFlightDistance(departureAirport.code, arrivalAirport.code);
      if (dist) {
        totalDistance = dist;
      }
    }

    if (totalDistance === 0) return null;

    const compensation = getCompensationByDistance(totalDistance, departureAirport.code, arrivalAirport.code);
    const totalAmount = compensation.amount * passengerCount;
    const commission = totalAmount * 0.25;
    const netAmount = totalAmount - commission;

    return {
      distance: totalDistance,
      ...compensation,
      totalAmount,
      commission,
      netAmount,
      passengerCount,
    };
  }, [departureAirport, arrivalAirport, connectionAirport, isConnecting, passengerCount]);

  if (!calculation) {
    return (
      <div className="bg-secondary p-4 sm:p-6 rounded-lg border border-foreground/10">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm sm:text-base">Güzergah bilgilerini girin</p>
          <p className="text-xs sm:text-sm">Tazminat miktarı otomatik hesaplanacak</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-4 sm:p-6 rounded-lg border ${isEligible ? "bg-primary/5 border-primary/20" : "bg-red-50 border-red-200"}`}>
      <h4 className="font-bold text-base sm:text-lg mb-3 sm:mb-4">
        {isEligible ? "Tahmini Tazminat" : "Tazminat Durumu"}
      </h4>
      
      {/* Güzergah Görselleştirmesi */}
      <div className="mb-4 p-3 bg-background rounded-lg border border-foreground/10">
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className="text-center">
            <div className="font-bold text-primary">{departureAirport?.code}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[80px]">{departureAirport?.city}</div>
          </div>
          {isConnecting && connectionAirport ? (
            <>
              <div className="flex items-center gap-1">
                <div className="w-6 h-px bg-foreground/30"></div>
                <Plane className="w-3 h-3 text-primary" />
                <div className="w-6 h-px bg-foreground/30"></div>
              </div>
              <div className="text-center">
                <div className="font-bold text-orange-600">{connectionAirport.code}</div>
                <div className="text-xs text-muted-foreground truncate max-w-[80px]">{connectionAirport.city}</div>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-6 h-px bg-foreground/30"></div>
                <Plane className="w-3 h-3 text-primary" />
                <div className="w-6 h-px bg-foreground/30"></div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <div className="w-8 h-px bg-foreground/30"></div>
              <Plane className="w-4 h-4 text-primary" />
              <div className="w-8 h-px bg-foreground/30"></div>
            </div>
          )}
          <div className="text-center">
            <div className="font-bold text-primary">{arrivalAirport?.code}</div>
            <div className="text-xs text-muted-foreground truncate max-w-[80px]">{arrivalAirport?.city}</div>
          </div>
        </div>
      </div>

      {!isEligible && ineligibilityReason ? (
        <div className="text-center py-4">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-medium">{ineligibilityReason}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 sm:space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mesafe</span>
              <span className="font-medium">{calculation.distance.toLocaleString()} km</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kişi başı tazminat</span>
              <span className="font-medium">{calculation.amount}€</span>
            </div>
            {calculation.passengerCount > 1 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Yolcu sayısı</span>
                <span className="font-medium">{calculation.passengerCount} kişi</span>
              </div>
            )}
            <div className="border-t border-foreground/10 pt-2 sm:pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Toplam tazminat</span>
                <span className="font-bold text-primary">{calculation.totalAmount}€</span>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Komisyon (%25)</span>
              <span>-{calculation.commission}€</span>
            </div>
            <div className="flex justify-between font-bold text-base sm:text-lg border-t border-foreground/10 pt-2">
              <span>Size ödenecek</span>
              <span className="text-green-600">{calculation.netAmount}€</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface ClaimWizardProps {
  onComplete?: (data: WizardData) => void;
}

export default function ClaimWizard({ onComplete }: ClaimWizardProps) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dinamik adım sayısı hesaplama
  const totalSteps = 7;
  
  const steps = [
    { num: 1, title: "Güzergah" },
    { num: 2, title: "Uçuş Tipi" },
    { num: 3, title: "Sorun" },
    { num: 4, title: "Detaylar" },
    { num: 5, title: "Gerekçe" },
    { num: 6, title: "Uçuş" },
    { num: 7, title: "Yolcu" },
  ];

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  // Uygunluk kontrolü
  useEffect(() => {
    let isEligible = true;
    let reason: string | null = null;

    // Gönüllü biniş reddi kontrolü
    if (data.disruptionType === "denied_boarding" && data.deniedBoardingType === "voluntary") {
      isEligible = false;
      reason = "Gönüllü olarak binişten vazgeçtiğiniz için tazminat hakkınız bulunmamaktadır.";
    }

    // Olağanüstü hal kontrolü
    if (data.airlineReason && EXTRAORDINARY_CIRCUMSTANCES.includes(data.airlineReason)) {
      isEligible = false;
      const reasonTexts: Record<string, string> = {
        weather: "Hava koşulları",
        atc_issue: "Hava trafik kontrol sorunları / ATC grevi",
        security_concern: "Güvenlik endişesi",
        bird_strike: "Kuş çarpması"
      };
      reason = `"${reasonTexts[data.airlineReason]}" olağanüstü bir durum olduğundan tazminat hakkınız bulunmamaktadır. Bu tür durumlar havayolunun kontrolü dışındadır.`;
    }

    // Self-transfer kontrolü
    if (data.disruptionType === "missed_connection" && data.samePnr === "no_self_transfer") {
      isEligible = false;
      reason = "Aktarma uçuşlarınız aynı rezervasyona (PNR) dahil olmadığı için tazminat hakkınız bulunmamaktadır. Self-transfer durumlarında her uçuş ayrı değerlendirilir.";
    }

    updateData({ isEligible, ineligibilityReason: reason });
  }, [data.disruptionType, data.deniedBoardingType, data.airlineReason, data.samePnr]);

  // Adım geçiş kontrolü
  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return data.departureAirport && data.arrivalAirport;
      case 2:
        return !data.isConnecting || (data.isConnecting && data.connectionAirport);
      case 3:
        if (!data.disruptionType) return false;
        if (data.disruptionType === "other" && !data.otherDisruptionDescription.trim()) return false;
        // Aktarma kaçırma sadece aktarmalı uçuşlarda seçilebilir
        if (data.disruptionType === "missed_connection" && !data.isConnecting) return false;
        return true;
      case 4:
        if (data.disruptionType === "delay" && !data.delayDuration) return false;
        if (data.disruptionType === "cancellation" && !data.cancellationNotice) return false;
        if (data.disruptionType === "denied_boarding" && !data.deniedBoardingType) return false;
        if (data.disruptionType === "missed_connection") {
          if (!data.missedConnectionDelay || !data.samePnr) return false;
        }
        return true;
      case 5:
        if (!data.airlineReason) return false;
        if (data.airlineReason === "other" && !data.otherReasonDescription.trim()) return false;
        return true;
      case 6:
        if (!data.flight1.flightNumber || !data.flight1.flightDate) return false;
        if (data.isConnecting && (!data.flight2.flightNumber || !data.flight2.flightDate)) return false;
        return true;
      case 7:
        return data.passengers.every(p => p.firstName && p.lastName && p.email);
      default:
        return false;
    }
  }, [step, data]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else if (onComplete) {
      setIsSubmitting(true);
      onComplete(data);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handlePassengerCountChange = (count: number) => {
    const currentPassengers = [...data.passengers];
    while (currentPassengers.length < count) {
      currentPassengers.push({ firstName: "", lastName: "", email: "" });
    }
    while (currentPassengers.length > count) {
      currentPassengers.pop();
    }
    updateData({ passengerCount: count, passengers: currentPassengers });
  };

  const updatePassenger = (index: number, field: keyof PassengerInfo, value: string) => {
    const newPassengers = [...data.passengers];
    newPassengers[index] = { ...newPassengers[index], [field]: value };
    updateData({ passengers: newPassengers });
  };

  const renderStepContent = () => {
    // Adım 1: Havalimanları
    if (step === 1) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Uçuş Güzergahı</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Kalkış ve varış havalimanlarını seçin.
            </p>
          </div>

          <AirportSearch
            label="Kalkış Havalimanı"
            value={data.departureAirport}
            onChange={(airport) => updateData({ departureAirport: airport })}
            placeholder="Şehir veya havalimanı kodu yazın..."
          />

          <AirportSearch
            label="Varış Havalimanı"
            value={data.arrivalAirport}
            onChange={(airport) => updateData({ arrivalAirport: airport })}
            placeholder="Şehir veya havalimanı kodu yazın..."
            excludeCode={data.departureAirport?.code}
          />
        </div>
      );
    }

    // Adım 2: Uçuş Tipi
    if (step === 2) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Uçuş Tipi</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Uçuşunuz direkt mi yoksa aktarmalı mı?
            </p>
          </div>

          <RadioGroup
            value={data.isConnecting ? "connecting" : "direct"}
            onValueChange={(value) => updateData({ 
              isConnecting: value === "connecting",
              connectionAirport: value === "direct" ? null : data.connectionAirport,
              // Aktarma kaçırma seçeneğini sıfırla
              disruptionType: data.disruptionType === "missed_connection" && value === "direct" ? null : data.disruptionType
            })}
            className="space-y-3"
          >
            <div className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${!data.isConnecting ? "border-primary bg-primary/5" : "border-foreground/20 hover:border-foreground/40"}`}>
              <RadioGroupItem value="direct" id="direct" />
              <Label htmlFor="direct" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm sm:text-base">Direkt Uçuş</div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {data.departureAirport?.code} → {data.arrivalAirport?.code}
                </div>
              </Label>
            </div>
            <div className={`flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border rounded-lg cursor-pointer transition-colors ${data.isConnecting ? "border-primary bg-primary/5" : "border-foreground/20 hover:border-foreground/40"}`}>
              <RadioGroupItem value="connecting" id="connecting" />
              <Label htmlFor="connecting" className="flex-1 cursor-pointer">
                <div className="font-medium text-sm sm:text-base">Aktarmalı Uçuş</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Bir veya daha fazla aktarma noktası var</div>
              </Label>
            </div>
          </RadioGroup>

          {data.isConnecting && (
            <div className="mt-4 sm:mt-6 p-4 bg-secondary rounded-lg">
              <AirportSearch
                label="Aktarma Havalimanı"
                value={data.connectionAirport}
                onChange={(airport) => updateData({ connectionAirport: airport })}
                placeholder="Aktarma yaptığınız havalimanı seçin..."
                excludeCode={data.departureAirport?.code}
              />
            </div>
          )}
        </div>
      );
    }

    // Adım 3: Sorun Türü
    if (step === 3) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Karşılaşılan Sorun</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Uçuşunuzda ne tür bir sorun yaşadınız?
            </p>
          </div>

          <div className="space-y-3">
            <OptionCard
              value="delay"
              currentValue={data.disruptionType}
              onChange={(v) => updateData({ disruptionType: v as DisruptionType })}
              title="Uçuşum rötar yaptı"
              description="Uçuş planlanandan geç kalktı veya varış noktasına geç ulaştı"
            />
            
            <OptionCard
              value="cancellation"
              currentValue={data.disruptionType}
              onChange={(v) => updateData({ disruptionType: v as DisruptionType })}
              title="Uçuşum iptal edildi"
              description="Havayolu uçuşu tamamen iptal etti"
            />
            
            <OptionCard
              value="denied_boarding"
              currentValue={data.disruptionType}
              onChange={(v) => updateData({ disruptionType: v as DisruptionType })}
              title="Binişe izin verilmedi (Bumped/Overbooked)"
              description="Fazla satış nedeniyle uçağa alınmadınız"
            />
            
            {data.isConnecting && (
              <OptionCard
                value="missed_connection"
                currentValue={data.disruptionType}
                onChange={(v) => updateData({ disruptionType: v as DisruptionType })}
                title="Aktarma uçuşunu kaçırdım"
                description="İlk uçuşun gecikmesi nedeniyle aktarma uçuşunu kaçırdınız"
              />
            )}
            
            <OptionCard
              value="other"
              currentValue={data.disruptionType}
              onChange={(v) => updateData({ disruptionType: v as DisruptionType })}
              title="Diğer / Lütfen belirtiniz"
              description="Yukarıdakilerden farklı bir sorun"
            />
          </div>

          {data.disruptionType === "other" && (
            <div className="mt-4">
              <Label className="text-sm">Sorununuzu açıklayın</Label>
              <Textarea
                placeholder="Yaşadığınız sorunu detaylı olarak açıklayın..."
                value={data.otherDisruptionDescription}
                onChange={(e) => updateData({ otherDisruptionDescription: e.target.value })}
                className="mt-2 min-h-[100px]"
              />
            </div>
          )}
        </div>
      );
    }

    // Adım 4: Sorun Detayları
    if (step === 4) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Sorun Detayları</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              {data.disruptionType === "delay" && "Varış noktasına ne kadar geç kaldınız?"}
              {data.disruptionType === "cancellation" && "İptal hakkında ne zaman bilgilendirildiniz?"}
              {data.disruptionType === "denied_boarding" && "Binişten nasıl vazgeçtiniz?"}
              {data.disruptionType === "missed_connection" && "Aktarma kaçırma detayları"}
              {data.disruptionType === "other" && "Ek bilgiler"}
            </p>
          </div>

          {/* Rötar - Gecikme süresi */}
          {data.disruptionType === "delay" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Varış noktasına kaç saat geç kaldınız?</Label>
              <OptionCard value="less_than_2" currentValue={data.delayDuration} onChange={(v) => updateData({ delayDuration: v as DelayDuration })} title="2 saatten az" />
              <OptionCard value="2_to_3" currentValue={data.delayDuration} onChange={(v) => updateData({ delayDuration: v as DelayDuration })} title="2-3 saat arası" />
              <OptionCard value="3_to_4" currentValue={data.delayDuration} onChange={(v) => updateData({ delayDuration: v as DelayDuration })} title="3-4 saat arası" />
              <OptionCard value="more_than_4" currentValue={data.delayDuration} onChange={(v) => updateData({ delayDuration: v as DelayDuration })} title="4 saatten fazla" />
              <OptionCard value="never_arrived" currentValue={data.delayDuration} onChange={(v) => updateData({ delayDuration: v as DelayDuration })} title="Ulaşamadım" />
              <OptionCard value="dont_remember" currentValue={data.delayDuration} onChange={(v) => updateData({ delayDuration: v as DelayDuration })} title="Hatırlamıyorum" />
            </div>
          )}

          {/* İptal - Bilgilendirme zamanı */}
          {data.disruptionType === "cancellation" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">İptal hakkında ne zaman bilgilendirildiniz?</Label>
              <OptionCard value="14_days_before" currentValue={data.cancellationNotice} onChange={(v) => updateData({ cancellationNotice: v as CancellationNotice })} title="Kalkıştan 14 gün önce" />
              <OptionCard value="7_to_14_days" currentValue={data.cancellationNotice} onChange={(v) => updateData({ cancellationNotice: v as CancellationNotice })} title="Kalkıştan 7-14 gün arası kala" />
              <OptionCard value="less_than_7_days" currentValue={data.cancellationNotice} onChange={(v) => updateData({ cancellationNotice: v as CancellationNotice })} title="Kalkışa 7 günden daha az bir süre kala" />
              <OptionCard value="same_day" currentValue={data.cancellationNotice} onChange={(v) => updateData({ cancellationNotice: v as CancellationNotice })} title="Kalkış günü / Havalimanında" />
              <OptionCard value="dont_remember" currentValue={data.cancellationNotice} onChange={(v) => updateData({ cancellationNotice: v as CancellationNotice })} title="Hatırlamıyorum" />
            </div>
          )}

          {/* Biniş reddi - Gönüllü/Zorunlu */}
          {data.disruptionType === "denied_boarding" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Binişten gönüllü olarak mı vazgeçtiniz?</Label>
              <OptionCard 
                value="voluntary" 
                currentValue={data.deniedBoardingType} 
                onChange={(v) => updateData({ deniedBoardingType: v as DeniedBoardingType })} 
                title="Evet, gönüllü olarak binmekten vazgeçtim"
                description="Havayolunun teklifi karşılığında kendi isteğimle vazgeçtim"
              />
              <OptionCard 
                value="involuntary" 
                currentValue={data.deniedBoardingType} 
                onChange={(v) => updateData({ deniedBoardingType: v as DeniedBoardingType })} 
                title="Hayır, zorunlu olarak binmekten vazgeçtim"
                description="Havayolu beni uçağa almadı, kendi isteğim değildi"
              />
              
              {data.deniedBoardingType === "voluntary" && (
                <WarningBox
                  type="warning"
                  title="Tazminat Hakkı Yok"
                  message="Gönüllü olarak binişten vazgeçtiğiniz için tazminat hakkınız bulunmamaktadır. Ancak havayolunun size sunduğu teklifi kabul etmiş olmalısınız."
                />
              )}
            </div>
          )}

          {/* Aktarma kaçırma */}
          {data.disruptionType === "missed_connection" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">Son varış noktasına ne kadar süre geç vardınız?</Label>
                <OptionCard value="less_than_2" currentValue={data.missedConnectionDelay} onChange={(v) => updateData({ missedConnectionDelay: v as DelayDuration })} title="2 saatten az" />
                <OptionCard value="2_to_3" currentValue={data.missedConnectionDelay} onChange={(v) => updateData({ missedConnectionDelay: v as DelayDuration })} title="2-3 saat arası" />
                <OptionCard value="3_to_4" currentValue={data.missedConnectionDelay} onChange={(v) => updateData({ missedConnectionDelay: v as DelayDuration })} title="3-4 saat arası" />
                <OptionCard value="more_than_4" currentValue={data.missedConnectionDelay} onChange={(v) => updateData({ missedConnectionDelay: v as DelayDuration })} title="4 saatten fazla" />
                <OptionCard value="never_arrived" currentValue={data.missedConnectionDelay} onChange={(v) => updateData({ missedConnectionDelay: v as DelayDuration })} title="Ulaşamadım" />
                <OptionCard value="dont_remember" currentValue={data.missedConnectionDelay} onChange={(v) => updateData({ missedConnectionDelay: v as DelayDuration })} title="Hatırlamıyorum" />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Aktarma uçuşlarınız aynı rezervasyona (PNR) dahil miydi?</Label>
                <OptionCard 
                  value="yes" 
                  currentValue={data.samePnr} 
                  onChange={(v) => updateData({ samePnr: v as SamePnr })} 
                  title="Evet"
                  description="Tüm uçuşlar tek bir rezervasyon numarası altındaydı"
                />
                <OptionCard 
                  value="no_self_transfer" 
                  currentValue={data.samePnr} 
                  onChange={(v) => updateData({ samePnr: v as SamePnr })} 
                  title="Hayır - Self Transfer"
                  description="Uçuşları ayrı ayrı satın aldım"
                />
                
                {data.samePnr === "no_self_transfer" && (
                  <WarningBox
                    type="warning"
                    title="Tazminat Hakkı Yok"
                    message="Aktarma uçuşlarınız aynı rezervasyona dahil olmadığı için tazminat hakkınız bulunmamaktadır. Self-transfer durumlarında her uçuş ayrı değerlendirilir."
                  />
                )}
              </div>
            </div>
          )}

          {/* Diğer */}
          {data.disruptionType === "other" && (
            <WarningBox
              type="info"
              title="Bilgi"
              message="Sorununuz incelendikten sonra tazminat hakkınız olup olmadığı değerlendirilecektir."
            />
          )}
        </div>
      );
    }

    // Adım 5: Havayolu Gerekçesi
    if (step === 5) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Havayolu Gerekçesi</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Havayolu size hangi gerekçeyi sundu?
            </p>
          </div>

          <div className="space-y-3">
            <OptionCard value="technical_issue" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Teknik sorun" description="Uçakta teknik arıza" />
            <OptionCard value="crew_shortage" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Mürettebat eksikliği / Personel grevi" description="Pilot veya kabin ekibi sorunu" />
            <OptionCard value="operational_issue" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Operasyonel aksaklık" description="Havayolunun iç operasyon sorunları" />
            <OptionCard value="weather" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Hava koşulları" description="Kötü hava şartları" />
            <OptionCard value="atc_issue" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Hava trafik kontrol sorunları / ATC grevi" description="Hava sahası kısıtlamaları" />
            <OptionCard value="security_concern" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Güvenlik endişesi" description="Güvenlik tehdidi veya kontrolü" />
            <OptionCard value="previous_flight_delay" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Önceki uçuş gecikmesi (zincirleme etki)" description="Uçağın önceki seferinden kaynaklı gecikme" />
            <OptionCard value="bird_strike" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Kuş çarpması" description="Uçağa kuş çarpması" />
            <OptionCard value="airport_technical" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Havalimanında meydana gelen teknik sorun" description="Havalimanı altyapı sorunu" />
            <OptionCard value="no_reason_given" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Sebep bildirilmedi" description="Havayolu herhangi bir açıklama yapmadı" />
            <OptionCard value="other" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Diğer / Lütfen yazarak açıklayınız" />
            <OptionCard value="dont_know" currentValue={data.airlineReason} onChange={(v) => updateData({ airlineReason: v as AirlineReason })} title="Bilmiyorum / Hatırlamıyorum" />
          </div>

          {data.airlineReason === "other" && (
            <div className="mt-4">
              <Label className="text-sm">Gerekçeyi açıklayın</Label>
              <Textarea
                placeholder="Havayolunun sunduğu gerekçeyi yazın..."
                value={data.otherReasonDescription}
                onChange={(e) => updateData({ otherReasonDescription: e.target.value })}
                className="mt-2 min-h-[100px]"
              />
            </div>
          )}

          {data.airlineReason && EXTRAORDINARY_CIRCUMSTANCES.includes(data.airlineReason) && (
            <WarningBox
              type="error"
              title="Olağanüstü Durum"
              message={`Bu gerekçe (${
                data.airlineReason === "weather" ? "hava koşulları" :
                data.airlineReason === "atc_issue" ? "hava trafik kontrol sorunları" :
                data.airlineReason === "security_concern" ? "güvenlik endişesi" :
                "kuş çarpması"
              }) olağanüstü bir durum olarak kabul edilmektedir. Bu tür durumlar havayolunun kontrolü dışında olduğundan tazminat hakkı doğmamaktadır.`}
            />
          )}
        </div>
      );
    }

    // Adım 6: Uçuş Bilgileri
    if (step === 6) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Uçuş Bilgileri</h3>
            <p className="text-sm sm:text-base text-muted-foreground">
              Rezervasyonunuzdaki uçuş numaralarını ve tarihlerini girin.
            </p>
          </div>

          {/* 1. Uçuş */}
          <div className="p-4 sm:p-6 border border-foreground/20 rounded-lg space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Plane className="w-4 h-4 text-primary" />
              <span>
                {data.isConnecting ? "1. Uçuş" : "Uçuş"}: {data.departureAirport?.code} → {data.isConnecting ? data.connectionAirport?.code : data.arrivalAirport?.code}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Uçuş Numarası</Label>
                <Input
                  placeholder="TK1234"
                  value={data.flight1.flightNumber}
                  onChange={(e) => updateData({ flight1: { ...data.flight1, flightNumber: e.target.value.toUpperCase() }})}
                  className="border-foreground/20 uppercase text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs sm:text-sm">Uçuş Tarihi</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={data.flight1.flightDate}
                    onChange={(e) => updateData({ flight1: { ...data.flight1, flightDate: e.target.value }})}
                    className="border-foreground/20 text-sm sm:text-base"
                  />
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* 2. Uçuş (Aktarmalı ise) */}
          {data.isConnecting && (
            <div className="p-4 sm:p-6 border border-foreground/20 rounded-lg space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Plane className="w-4 h-4 text-primary" />
                <span>2. Uçuş: {data.connectionAirport?.code} → {data.arrivalAirport?.code}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Uçuş Numarası</Label>
                  <Input
                    placeholder="TK5678"
                    value={data.flight2.flightNumber}
                    onChange={(e) => updateData({ flight2: { ...data.flight2, flightNumber: e.target.value.toUpperCase() }})}
                    className="border-foreground/20 uppercase text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs sm:text-sm">Uçuş Tarihi</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={data.flight2.flightDate}
                      onChange={(e) => updateData({ flight2: { ...data.flight2, flightDate: e.target.value }})}
                      className="border-foreground/20 text-sm sm:text-base"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Adım 7: Yolcu Bilgileri
    if (step === 7) {
      return (
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Yolcu Bilgileri</h3>
            <p className="text-sm sm:text-base text-muted-foreground">Tazminat talep edecek yolcuların bilgilerini girin.</p>
          </div>

          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Yolcu Sayısı</Label>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <Button
                  key={num}
                  type="button"
                  variant={data.passengerCount === num ? "default" : "outline"}
                  size="sm"
                  className={`w-9 h-9 sm:w-10 sm:h-10 ${data.passengerCount === num ? "bg-primary" : ""}`}
                  onClick={() => handlePassengerCountChange(num)}
                >
                  {num}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {data.passengers.map((passenger, index) => (
              <div key={index} className="p-3 sm:p-4 border border-foreground/20 rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Yolcu {index + 1}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Ad</Label>
                    <Input
                      placeholder="Ad"
                      value={passenger.firstName}
                      onChange={(e) => updatePassenger(index, "firstName", e.target.value)}
                      className="border-foreground/20 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Soyad</Label>
                    <Input
                      placeholder="Soyad"
                      value={passenger.lastName}
                      onChange={(e) => updatePassenger(index, "lastName", e.target.value)}
                      className="border-foreground/20 text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">E-posta</Label>
                  <Input
                    type="email"
                    placeholder="ornek@email.com"
                    value={passenger.email}
                    onChange={(e) => updatePassenger(index, "email", e.target.value)}
                    className="border-foreground/20 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Uygunluk Uyarısı */}
          {!data.isEligible && data.ineligibilityReason && (
            <WarningBox
              type="error"
              title="Tazminat Hakkı Yok"
              message={data.ineligibilityReason}
            />
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8">
      {/* Mobilde Tazminat Özeti Üstte */}
      <div className="lg:hidden order-first">
        <CompensationSummary
          departureAirport={data.departureAirport}
          arrivalAirport={data.arrivalAirport}
          connectionAirport={data.connectionAirport}
          isConnecting={data.isConnecting}
          passengerCount={data.passengerCount}
          isEligible={data.isEligible}
          ineligibilityReason={data.ineligibilityReason}
        />
      </div>

      {/* Sol Taraf - Form */}
      <div className="lg:col-span-2">
        <StepIndicator currentStep={step} totalSteps={totalSteps} steps={steps} />

        {renderStepContent()}

        {/* Navigasyon Butonları */}
        <div className="flex justify-between mt-6 sm:mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Geri</span>
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="gap-1 sm:gap-2 text-sm sm:text-base"
          >
            {isSubmitting ? (
              <><span className="animate-spin">⏳</span> Gönderiliyor...</>
            ) : step === totalSteps ? (
              <><Check className="w-3 h-3 sm:w-4 sm:h-4" /> Tamamla</>
            ) : (
              <><span className="hidden sm:inline">İleri</span> <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" /></>
            )}
          </Button>
        </div>
      </div>

      {/* Sağ Taraf - Tazminat Özeti (Desktop) */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <CompensationSummary
            departureAirport={data.departureAirport}
            arrivalAirport={data.arrivalAirport}
            connectionAirport={data.connectionAirport}
            isConnecting={data.isConnecting}
            passengerCount={data.passengerCount}
            isEligible={data.isEligible}
            ineligibilityReason={data.ineligibilityReason}
          />
        </div>
      </div>
    </div>
  );
}
