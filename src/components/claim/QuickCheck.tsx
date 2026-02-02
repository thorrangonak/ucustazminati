'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Check,
  X,
  Plane,
  ArrowRight,
  AlertCircle,
  Clock,
  MapPin,
  Scan,
  RefreshCw,
  Camera,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface EligibilityResult {
  isEligible: boolean
  compensationAmount: number
  currency: string
  flightDistance: number | null
  delayMinutes: number | null
  regulation: string | null
  reason: string
  flightInfo: {
    flightNumber: string
    flightDate: string
    departureAirport: {
      code: string
      name: string
      city: string
    } | null
    arrivalAirport: {
      code: string
      name: string
      city: string
    } | null
    airline: string | null
    status: string
    scheduledDeparture: string | null
    actualDeparture: string | null
    scheduledArrival: string | null
    actualArrival: string | null
    isCancelled: boolean
  }
  dataSource: 'aviationstack' | 'mock'
}

interface ScanResult {
  passengerName: string | null
  flightNumber: string | null
  departureAirport: string | null
  arrivalAirport: string | null
  flightDate: string | null
  airline: string | null
  seatNumber: string | null
}

type Step = 'form' | 'scanning' | 'scanned' | 'checking' | 'result'

export function QuickCheck() {
  const [step, setStep] = useState<Step>('form')
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatus, setScanStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form state
  const [flightNumber, setFlightNumber] = useState('')
  const [departureAirport, setDepartureAirport] = useState('')
  const [arrivalAirport, setArrivalAirport] = useState('')
  const [flightDate, setFlightDate] = useState('')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setStep('scanning')
    setScanProgress(0)
    setScanStatus('Scanbot SDK yükleniyor...')

    // Progress animation
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => Math.min(prev + 5, 85))
    }, 150)

    try {
      // Load and use Scanbot SDK
      setScanStatus('Barkod taranıyor...')

      const { scanBarcodeFromImage } = await import('@/lib/scanbot')
      const barcodeData = await scanBarcodeFromImage(file)

      clearInterval(progressInterval)

      if (barcodeData) {
        setScanProgress(100)
        setScanStatus('Bilgiler çıkarılıyor...')

        console.log('Scanbot barcode data:', barcodeData)

        // Parse BCBP data
        const { parseBoardingPassBarcode, isBCBPData } = await import('@/lib/boarding-pass-parser')

        if (isBCBPData(barcodeData)) {
          const parsed = parseBoardingPassBarcode(barcodeData)
          console.log('Parsed boarding pass:', parsed)

          setScanResult(parsed)
          if (parsed.flightNumber) setFlightNumber(parsed.flightNumber)
          if (parsed.departureAirport) setDepartureAirport(parsed.departureAirport)
          if (parsed.arrivalAirport) setArrivalAirport(parsed.arrivalAirport)
          if (parsed.flightDate) setFlightDate(parsed.flightDate)

          setStep('scanned')
        } else {
          console.log('Not BCBP format:', barcodeData)
          setError('Barkod okundu ancak biniş kartı formatında değil. Lütfen manuel giriş yapın.')
          setStep('form')
        }
      } else {
        setScanProgress(100)
        setError('Görüntüde barkod bulunamadı. Barkodun net ve tam görünür olduğundan emin olun.')
        setStep('form')
      }
    } catch (err: any) {
      clearInterval(progressInterval)
      console.error('Scan error:', err)
      setError(`Tarama hatası: ${err?.message || 'Bilinmeyen hata'}. Lütfen manuel giriş yapın.`)
      setStep('form')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const checkEligibility = async () => {
    if (!flightNumber || !departureAirport || !arrivalAirport) {
      setError('Lütfen tüm alanları doldurun')
      return
    }

    setError(null)
    setStep('checking')

    try {
      const response = await fetch('/api/check-eligibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flightNumber,
          departureAirport,
          arrivalAirport,
          flightDate,
        }),
      })

      const result = await response.json()

      if (result.error) {
        setError(result.error)
        setStep('form')
      } else {
        setEligibility(result)
        setStep('result')
      }
    } catch (err) {
      console.error(err)
      setError('Kontrol sırasında bir hata oluştu')
      setStep('form')
    }
  }

  const reset = () => {
    setStep('form')
    setEligibility(null)
    setError(null)
    setScanResult(null)
    setFlightNumber('')
    setDepartureAirport('')
    setArrivalAirport('')
    setFlightDate('')
    setScanProgress(0)
    setScanStatus('')
  }

  // Scanning Step
  if (step === 'scanning') {
    return (
      <Card className="shadow-2xl border-0 bg-white">
        <CardContent className="p-8">
          <div className="text-center py-6">
            <div className="relative mx-auto w-24 h-24 mb-6">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-primary transition-all duration-300"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - scanProgress / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Scan className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Biniş Kartı Taranıyor</h3>
            <p className="mt-2 text-gray-500">{scanStatus}</p>
            <p className="mt-4 text-2xl font-bold text-primary">{scanProgress}%</p>

            <Button variant="outline" onClick={reset} className="mt-6">
              İptal
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Scanned Step
  if (step === 'scanned' && scanResult) {
    return (
      <Card className="shadow-2xl border-0 bg-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 rounded-xl">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-green-800">Biniş Kartı Okundu!</h3>
              <p className="text-sm text-green-600">Bilgiler otomatik dolduruldu</p>
            </div>
          </div>

          {scanResult.passengerName && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Yolcu</p>
                <p className="font-semibold">{scanResult.passengerName}</p>
              </div>
              {scanResult.seatNumber && (
                <div className="ml-auto text-right">
                  <p className="text-xs text-gray-500">Koltuk</p>
                  <p className="font-semibold">{scanResult.seatNumber}</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Uçuş Numarası</Label>
              <Input
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="mt-1 h-11 font-mono text-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium text-gray-700">Kalkış</Label>
                <Input
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value.toUpperCase())}
                  className="mt-1 h-11 font-mono text-center text-lg"
                  maxLength={3}
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Varış</Label>
                <Input
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value.toUpperCase())}
                  className="mt-1 h-11 font-mono text-center text-lg"
                  maxLength={3}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Uçuş Tarihi</Label>
              <Input
                type="date"
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={reset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Yeniden
            </Button>
            <Button
              onClick={checkEligibility}
              disabled={!flightNumber || !departureAirport || !arrivalAirport}
              className="flex-1 gap-2"
            >
              Tazminat Kontrolü Yap
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Form Step
  if (step === 'form') {
    return (
      <Card className="shadow-2xl border-0 bg-white">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Plane className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Hızlı Tazminat Kontrolü</h2>
            <p className="text-sm text-gray-500 mt-1">30 saniyede tazminat hakkınızı öğrenin</p>
          </div>

          <div className="mb-5">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-primary/30 rounded-xl transition-all hover:border-primary hover:bg-primary/5 flex items-center justify-center gap-3"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Camera className="h-5 w-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Biniş Kartı Tara</p>
                <p className="text-xs text-gray-500">PDF417/QR barkoddan otomatik oku</p>
              </div>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-2 text-gray-400">veya manuel girin</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="flightNumber" className="text-sm font-medium text-gray-700">
                Uçuş Numarası
              </Label>
              <Input
                id="flightNumber"
                placeholder="Örn: TK1234"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                className="mt-1 h-11 font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="departure" className="text-sm font-medium text-gray-700">
                  Kalkış
                </Label>
                <Input
                  id="departure"
                  placeholder="IST"
                  value={departureAirport}
                  onChange={(e) => setDepartureAirport(e.target.value.toUpperCase())}
                  className="mt-1 h-11 font-mono text-center"
                  maxLength={3}
                />
              </div>
              <div>
                <Label htmlFor="arrival" className="text-sm font-medium text-gray-700">
                  Varış
                </Label>
                <Input
                  id="arrival"
                  placeholder="LHR"
                  value={arrivalAirport}
                  onChange={(e) => setArrivalAirport(e.target.value.toUpperCase())}
                  className="mt-1 h-11 font-mono text-center"
                  maxLength={3}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Uçuş Tarihi (Opsiyonel)
              </Label>
              <Input
                id="date"
                type="date"
                value={flightDate}
                onChange={(e) => setFlightDate(e.target.value)}
                className="mt-1 h-11"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <Button
            onClick={checkEligibility}
            disabled={!flightNumber || !departureAirport || !arrivalAirport}
            className="w-full mt-5 h-12 text-base font-semibold"
          >
            Tazminat Hakkımı Kontrol Et
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <p className="mt-4 text-center text-xs text-gray-400">
            Ücretsiz kontrol • Sadece başarıda %25 komisyon
          </p>
        </CardContent>
      </Card>
    )
  }

  // Checking Step
  if (step === 'checking') {
    return (
      <Card className="shadow-2xl border-0 bg-white">
        <CardContent className="p-8">
          <div className="text-center py-8">
            <div className="relative mx-auto w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
              <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Plane className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900">Uçuş Kontrol Ediliyor</h3>
            <p className="mt-2 text-gray-500">
              {flightNumber} • {departureAirport} → {arrivalAirport}
            </p>
            <div className="mt-4 flex justify-center gap-1">
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Result Step
  if (step === 'result' && eligibility) {
    const isEligible = eligibility.isEligible
    const isCancelled = eligibility.flightInfo.isCancelled

    // Format time for display
    const formatTime = (dateStr: string | null) => {
      if (!dateStr) return '-'
      try {
        const date = new Date(dateStr)
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      } catch {
        return '-'
      }
    }

    // Status badge color
    const getStatusColor = (status: string) => {
      switch (status) {
        case 'landed': return 'bg-green-100 text-green-700'
        case 'cancelled': return 'bg-red-100 text-red-700'
        case 'diverted': return 'bg-orange-100 text-orange-700'
        case 'active': return 'bg-blue-100 text-blue-700'
        case 'scheduled': return 'bg-gray-100 text-gray-700'
        default: return 'bg-gray-100 text-gray-700'
      }
    }

    const statusLabels: Record<string, string> = {
      landed: 'Tamamlandı',
      cancelled: 'İptal',
      diverted: 'Yönlendirildi',
      active: 'Havada',
      scheduled: 'Planlandı',
      unknown: 'Bilinmiyor',
    }

    return (
      <Card className={cn('shadow-2xl border-0 overflow-hidden', isEligible ? 'bg-gradient-to-b from-green-50 to-white' : 'bg-white')}>
        <CardContent className="p-0">
          <div className={cn('p-6 text-center', isCancelled ? 'bg-red-600 text-white' : isEligible ? 'bg-green-600 text-white' : 'bg-gray-600 text-white')}>
            <div className={cn('mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4', isEligible ? 'bg-white/20' : 'bg-white/10')}>
              {isEligible ? <Check className="h-8 w-8" /> : <X className="h-8 w-8" />}
            </div>
            <h3 className="text-2xl font-bold">
              {isCancelled ? 'Uçuş İptal Edilmiş!' : isEligible ? 'Tazminat Hakkınız Var!' : 'Tazminat Hakkı Yok'}
            </h3>
            <p className="mt-1 opacity-90 text-sm">
              {eligibility.flightInfo.flightNumber} • {eligibility.flightInfo.airline || 'Havayolu'}
            </p>
            <span className={cn('inline-block mt-2 px-2 py-1 rounded text-xs font-medium', getStatusColor(eligibility.flightInfo.status))}>
              {statusLabels[eligibility.flightInfo.status] || eligibility.flightInfo.status}
            </span>
          </div>

          <div className="p-6 space-y-5">
            {isEligible && (
              <div className="text-center p-5 bg-green-50 rounded-xl border border-green-100">
                <p className="text-sm text-green-700 font-medium">Tahmini Tazminat</p>
                <p className="text-4xl font-bold text-green-700 mt-1">€{eligibility.compensationAmount}</p>
                <p className="text-xs text-green-600 mt-1">{eligibility.regulation} kapsamında</p>
              </div>
            )}

            {/* Flight Details */}
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {eligibility.flightInfo.departureAirport?.code || departureAirport}
                  </p>
                  <p className="text-xs text-gray-500">
                    {eligibility.flightInfo.departureAirport?.city || 'Kalkış'}
                  </p>
                </div>
                <div className="flex-1 px-4">
                  <div className="flex items-center justify-center">
                    <div className="h-0.5 flex-1 bg-gray-300" />
                    <Plane className="h-5 w-5 text-primary mx-2" />
                    <div className="h-0.5 flex-1 bg-gray-300" />
                  </div>
                  {eligibility.flightDistance && (
                    <p className="text-xs text-gray-400 text-center mt-1">
                      {eligibility.flightDistance.toLocaleString()} km
                    </p>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {eligibility.flightInfo.arrivalAirport?.code || arrivalAirport}
                  </p>
                  <p className="text-xs text-gray-500">
                    {eligibility.flightInfo.arrivalAirport?.city || 'Varış'}
                  </p>
                </div>
              </div>

              {/* Time Details */}
              {!isCancelled && (eligibility.flightInfo.scheduledDeparture || eligibility.flightInfo.actualDeparture) && (
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Planlanan Kalkış</p>
                    <p className="font-mono text-sm">{formatTime(eligibility.flightInfo.scheduledDeparture)}</p>
                    {eligibility.flightInfo.actualDeparture && eligibility.flightInfo.actualDeparture !== eligibility.flightInfo.scheduledDeparture && (
                      <p className="font-mono text-sm text-red-600">
                        Gerçek: {formatTime(eligibility.flightInfo.actualDeparture)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Planlanan Varış</p>
                    <p className="font-mono text-sm">{formatTime(eligibility.flightInfo.scheduledArrival)}</p>
                    {eligibility.flightInfo.actualArrival && eligibility.flightInfo.actualArrival !== eligibility.flightInfo.scheduledArrival && (
                      <p className="font-mono text-sm text-red-600">
                        Gerçek: {formatTime(eligibility.flightInfo.actualArrival)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Delay Info */}
            {!isCancelled && eligibility.delayMinutes !== null && eligibility.delayMinutes > 0 && (
              <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    {eligibility.delayMinutes >= 60
                      ? `${Math.floor(eligibility.delayMinutes / 60)} saat ${eligibility.delayMinutes % 60} dakika gecikme`
                      : `${eligibility.delayMinutes} dakika gecikme`}
                  </p>
                  {eligibility.delayMinutes < 180 && (
                    <p className="text-xs text-orange-600">Tazminat için en az 3 saat gecikme gerekli</p>
                  )}
                </div>
              </div>
            )}

            <p className={cn('text-sm p-3 rounded-lg', isEligible ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-600')}>
              {eligibility.reason}
            </p>

            {/* Data Source Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className={cn('w-2 h-2 rounded-full', eligibility.dataSource === 'aviationstack' ? 'bg-green-500' : 'bg-yellow-500')} />
              {eligibility.dataSource === 'aviationstack' ? 'AviationStack API ile doğrulandı' : 'Tahmini veri (Demo)'}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={reset} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Yeni Kontrol
              </Button>
              {isEligible && (
                <Button asChild className="flex-1 gap-2">
                  <Link href="/yeni-talep">
                    Talebimi Başlat
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>

            {isEligible && <p className="text-center text-xs text-gray-400">Başarısız olursak ücret yok</p>}
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
