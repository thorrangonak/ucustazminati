import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Mail, X, Loader2 } from "lucide-react";

export default function EmailVerificationBanner() {
  const [dismissed, setDismissed] = useState(false);
  
  const { data: verificationStatus, isLoading } = trpc.auth.checkEmailVerification.useQuery();
  
  const sendVerificationMutation = trpc.auth.sendVerificationEmail.useMutation({
    onSuccess: (data) => {
      toast.success("E-posta gönderildi", {
        description: data.message,
      });
    },
    onError: (error) => {
      toast.error("Hata", {
        description: error.message || "E-posta gönderilemedi",
      });
    },
  });

  // Yükleniyor veya doğrulanmış veya kapatılmış
  if (isLoading || verificationStatus?.verified || dismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
      <div className="container flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Mail className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="text-sm">
            <p className="font-medium text-yellow-800">
              E-posta adresinizi doğrulayın
            </p>
            <p className="text-yellow-700">
              {verificationStatus?.email} adresine gönderilen doğrulama linkine tıklayın.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-white border-yellow-300 text-yellow-800 hover:bg-yellow-100"
            onClick={() => sendVerificationMutation.mutate()}
            disabled={sendVerificationMutation.isPending}
          >
            {sendVerificationMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              "Tekrar Gönder"
            )}
          </Button>
          <button
            onClick={() => setDismissed(true)}
            className="text-yellow-600 hover:text-yellow-800 p-1"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
