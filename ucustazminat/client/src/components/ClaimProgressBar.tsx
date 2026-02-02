import { CheckCircle, Circle, Clock, XCircle, AlertCircle, Send, FileSearch, Plane, Gavel, CreditCard, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

// Talep durumları ve sıralaması
const statusSteps = [
  { key: "submitted", label: "Gönderildi", icon: Send },
  { key: "under_review", label: "İnceleniyor", icon: FileSearch },
  { key: "sent_to_airline", label: "Havayoluna Gönderildi", icon: Plane },
  { key: "approved", label: "Onaylandı", icon: CheckCircle },
  { key: "paid", label: "Ödendi", icon: CreditCard },
];

// Özel durumlar (ana akışın dışında)
const specialStatuses: Record<string, { label: string; icon: typeof Circle; color: string }> = {
  draft: { label: "Taslak", icon: Circle, color: "text-muted-foreground" },
  documents_needed: { label: "Belge Bekleniyor", icon: AlertCircle, color: "text-orange-500" },
  airline_response: { label: "Havayolu Yanıtı", icon: Clock, color: "text-indigo-500" },
  legal_action: { label: "Hukuki Süreç", icon: Gavel, color: "text-red-500" },
  payment_pending: { label: "Ödeme Bekleniyor", icon: Clock, color: "text-emerald-500" },
  rejected: { label: "Reddedildi", icon: XCircle, color: "text-red-500" },
  closed: { label: "Kapatıldı", icon: Ban, color: "text-gray-500" },
};

// Durumun hangi adımda olduğunu belirle
function getStepIndex(status: string): number {
  const index = statusSteps.findIndex(step => step.key === status);
  if (index !== -1) return index;
  
  // Özel durumlar için yaklaşık adım
  if (status === "draft") return -1;
  if (status === "documents_needed") return 1; // İnceleniyor ile aynı seviye
  if (status === "airline_response") return 2; // Havayoluna gönderildi ile aynı seviye
  if (status === "legal_action") return 2; // Havayoluna gönderildi ile aynı seviye
  if (status === "payment_pending") return 3; // Onaylandı ile aynı seviye
  if (status === "rejected" || status === "closed") return -2; // Sonlandırılmış
  
  return 0;
}

interface ClaimProgressBarProps {
  status: string;
  variant?: "compact" | "full";
  className?: string;
}

export function ClaimProgressBar({ status, variant = "compact", className }: ClaimProgressBarProps) {
  const currentStepIndex = getStepIndex(status);
  const isSpecialStatus = status in specialStatuses;
  const isRejectedOrClosed = status === "rejected" || status === "closed";
  
  if (variant === "compact") {
    // Kompakt versiyon - sadece ilerleme çubuğu
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center gap-1">
          {statusSteps.map((step, index) => {
            const isCompleted = currentStepIndex >= index;
            const isCurrent = currentStepIndex === index;
            const isRejected = isRejectedOrClosed && index > 0;
            
            return (
              <div key={step.key} className="flex-1 flex items-center">
                <div
                  className={cn(
                    "h-1.5 w-full rounded-full transition-colors",
                    isRejected ? "bg-red-200" :
                    isCompleted ? "bg-primary" :
                    isCurrent ? "bg-primary/50" :
                    "bg-muted"
                  )}
                />
              </div>
            );
          })}
        </div>
        {isSpecialStatus && (
          <div className="flex items-center gap-1 mt-1">
            {(() => {
              const special = specialStatuses[status];
              const Icon = special.icon;
              return (
                <>
                  <Icon className={cn("w-3 h-3", special.color)} />
                  <span className={cn("text-xs", special.color)}>{special.label}</span>
                </>
              );
            })()}
          </div>
        )}
      </div>
    );
  }
  
  // Tam versiyon - adımlarla birlikte
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between relative">
        {/* Arka plan çizgisi */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted" />
        
        {statusSteps.map((step, index) => {
          const isCompleted = currentStepIndex > index;
          const isCurrent = currentStepIndex === index;
          const isRejected = isRejectedOrClosed;
          const Icon = step.icon;
          
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                  isRejected && index > 0 ? "bg-red-100 border-red-300 text-red-500" :
                  isCompleted ? "bg-primary border-primary text-primary-foreground" :
                  isCurrent ? "bg-primary/20 border-primary text-primary" :
                  "bg-background border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1 text-center max-w-[60px] sm:max-w-[80px]",
                  isCompleted || isCurrent ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      
      {/* Özel durum göstergesi */}
      {isSpecialStatus && (
        <div className="flex items-center justify-center gap-2 mt-4 p-2 rounded-lg bg-muted/50">
          {(() => {
            const special = specialStatuses[status];
            const Icon = special.icon;
            return (
              <>
                <Icon className={cn("w-4 h-4", special.color)} />
                <span className={cn("text-sm font-medium", special.color)}>
                  Mevcut Durum: {special.label}
                </span>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export default ClaimProgressBar;
