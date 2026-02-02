'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Cookie, X, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CookiePreferences {
  necessary: boolean // Always true
  functional: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = 'cookie_consent'
const COOKIE_PREFERENCES_KEY = 'cookie_preferences'

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already given consent
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Small delay before showing banner
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences))
      }
    }
  }, [])

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true')
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs))
    setPreferences(prefs)
    setIsVisible(false)

    // Trigger analytics if accepted
    if (prefs.analytics && typeof window !== 'undefined') {
      // Enable Google Analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted',
      })
    }

    // Trigger marketing if accepted
    if (prefs.marketing && typeof window !== 'undefined') {
      window.gtag?.('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
      })
    }
  }

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    })
  }

  const acceptNecessary = () => {
    saveConsent({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    })
  }

  const savePreferences = () => {
    saveConsent(preferences)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6">
      <Card className="max-w-4xl mx-auto shadow-2xl border-2">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Cookie className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Çerez Kullanımı</h3>
                  <p className="text-sm text-muted-foreground">
                    Size daha iyi bir deneyim sunmak için çerezleri kullanıyoruz.
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground">
              Web sitemizi kullanarak, zorunlu çerezlerin kullanımını kabul etmiş olursunuz.
              Diğer çerezler için tercihlerinizi aşağıdan yönetebilirsiniz.{' '}
              <Link href="/cerez-politikasi" className="text-primary hover:underline">
                Çerez Politikası
              </Link>{' '}
              ve{' '}
              <Link href="/gizlilik-politikasi" className="text-primary hover:underline">
                Gizlilik Politikası
              </Link>{' '}
              hakkında detaylı bilgi alabilirsiniz.
            </p>

            {/* Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              <Settings className="h-4 w-4" />
              Çerez Tercihlerini Yönet
              {showSettings ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {/* Cookie Settings */}
            {showSettings && (
              <div className="border rounded-lg p-4 space-y-4 bg-muted/30">
                {/* Necessary */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Zorunlu Çerezler</p>
                    <p className="text-xs text-muted-foreground">
                      Site işlevselliği için gerekli, devre dışı bırakılamaz
                    </p>
                  </div>
                  <Switch checked disabled />
                </div>

                {/* Functional */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">İşlevsel Çerezler</p>
                    <p className="text-xs text-muted-foreground">
                      Dil ve tema tercihlerinizi hatırlar
                    </p>
                  </div>
                  <Switch
                    checked={preferences.functional}
                    onCheckedChange={(checked) =>
                      setPreferences((p) => ({ ...p, functional: checked }))
                    }
                  />
                </div>

                {/* Analytics */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Analitik Çerezler</p>
                    <p className="text-xs text-muted-foreground">
                      Site kullanımını anlamamıza yardımcı olur (Google Analytics)
                    </p>
                  </div>
                  <Switch
                    checked={preferences.analytics}
                    onCheckedChange={(checked) =>
                      setPreferences((p) => ({ ...p, analytics: checked }))
                    }
                  />
                </div>

                {/* Marketing */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pazarlama Çerezleri</p>
                    <p className="text-xs text-muted-foreground">
                      Kişiselleştirilmiş reklamlar göstermek için kullanılır
                    </p>
                  </div>
                  <Switch
                    checked={preferences.marketing}
                    onCheckedChange={(checked) =>
                      setPreferences((p) => ({ ...p, marketing: checked }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className={cn(
              "flex flex-col sm:flex-row gap-3",
              showSettings ? "justify-end" : "justify-between"
            )}>
              {!showSettings && (
                <Button variant="outline" onClick={acceptNecessary}>
                  Sadece Zorunlu
                </Button>
              )}
              <div className="flex gap-3">
                {showSettings && (
                  <Button variant="outline" onClick={savePreferences}>
                    Tercihleri Kaydet
                  </Button>
                )}
                <Button onClick={acceptAll}>Tümünü Kabul Et</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Type declaration for gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      action: string,
      params?: Record<string, string>
    ) => void
  }
}
