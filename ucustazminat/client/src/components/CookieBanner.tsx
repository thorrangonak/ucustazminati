import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { X, Cookie } from "lucide-react";

const COOKIE_CONSENT_KEY = "ucustazminat_cookie_consent";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay to prevent flash on page load
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: false,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6">
      <div className="container">
        <div className="bg-background border border-border rounded-lg shadow-lg p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 flex-shrink-0">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-base md:text-lg">Çerez Kullanımı</h3>
                <button
                  onClick={handleAcceptNecessary}
                  className="sm:hidden p-1 hover:bg-muted rounded"
                  aria-label="Kapat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                Web sitemizde deneyiminizi geliştirmek için çerezler kullanıyoruz. 
                Zorunlu çerezler sitenin çalışması için gereklidir. Analitik çerezler 
                ise sitemizi nasıl kullandığınızı anlamamıza yardımcı olur.{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Gizlilik Politikamızı
                </Link>{" "}
                inceleyebilirsiniz.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button
                  onClick={handleAcceptAll}
                  className="w-full sm:w-auto"
                >
                  Tümünü Kabul Et
                </Button>
                <Button
                  variant="outline"
                  onClick={handleAcceptNecessary}
                  className="w-full sm:w-auto"
                >
                  Sadece Zorunlu Çerezler
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
