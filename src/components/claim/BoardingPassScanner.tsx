'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Upload, X, Check, Plane, Scan, RefreshCw, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ScannedData {
  flightNumber?: string
  departureAirport?: string
  arrivalAirport?: string
  flightDate?: string
  passengerName?: string
  airline?: string
  seatNumber?: string
}

interface BoardingPassScannerProps {
  onScanComplete: (data: ScannedData) => void
}

type ScanStep = 'idle' | 'scanning' | 'scanned' | 'camera'

export function BoardingPassScanner({ onScanComplete }: BoardingPassScannerProps) {
  const [step, setStep] = useState<ScanStep>('idle')
  const [scannedData, setScannedData] = useState<ScannedData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [scanProgress, setScanProgress] = useState(0)
  const [scanStatus, setScanStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)
    setStep('scanning')
    setScanProgress(0)
    setScanStatus('Tarayıcı hazırlanıyor...')

    // Progress animation
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => Math.min(prev + 5, 85))
    }, 150)

    try {
      // Use html5-qrcode for barcode scanning (license-free)
      setScanStatus('Barkod taranıyor...')

      const { scanBarcodeFromImage } = await import('@/lib/barcode-scanner')
      const barcodeData = await scanBarcodeFromImage(file)

      clearInterval(progressInterval)

      if (barcodeData) {
        setScanProgress(100)
        setScanStatus('Bilgiler çıkarılıyor...')

        // Parse BCBP data
        const { parseBoardingPassBarcode, isBCBPData } = await import('@/lib/boarding-pass-parser')

        if (isBCBPData(barcodeData)) {
          const parsed = parseBoardingPassBarcode(barcodeData)

          const data: ScannedData = {
            flightNumber: parsed.flightNumber || undefined,
            departureAirport: parsed.departureAirport || undefined,
            arrivalAirport: parsed.arrivalAirport || undefined,
            flightDate: parsed.flightDate || undefined,
            passengerName: parsed.passengerName || undefined,
            airline: parsed.airline || undefined,
            seatNumber: parsed.seatNumber || undefined,
          }

          setScannedData(data)
          setStep('scanned')

          // Pass data to parent
          if (Object.keys(data).some(k => data[k as keyof ScannedData])) {
            onScanComplete(data)
          }
        } else {
          setError('Barkod okundu ancak biniş kartı formatında değil. Lütfen manuel giriş yapın.')
          setStep('idle')
        }
      } else {
        setScanProgress(100)
        setError('Görüntüde barkod bulunamadı. Barkodun net ve tam görünür olduğundan emin olun.')
        setStep('idle')
      }
    } catch (err: unknown) {
      clearInterval(progressInterval)
      console.error('Scan error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setError(`Tarama hatası: ${errorMessage}. Lütfen manuel giriş yapın.`)
      setStep('idle')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const startCamera = async () => {
    try {
      setStep('camera')
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch {
      setError('Kamera erişimi sağlanamadı. Lütfen tarayıcı izinlerini kontrol edin.')
      setStep('idle')
    }
  }

  const capturePhoto = async () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const ctx = canvas.getContext('2d')
    ctx?.drawImage(videoRef.current, 0, 0)

    // Stop camera
    const stream = videoRef.current.srcObject as MediaStream
    stream?.getTracks().forEach(track => track.stop())

    // Convert to blob and process
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' })

        // Create fake event to reuse upload handler
        const fakeEvent = {
          target: {
            files: [file]
          }
        } as unknown as React.ChangeEvent<HTMLInputElement>

        await handleFileUpload(fakeEvent)
      }
    }, 'image/jpeg', 0.9)
  }

  const stopCamera = () => {
    if (videoRef.current) {
      const stream = videoRef.current.srcObject as MediaStream
      stream?.getTracks().forEach(track => track.stop())
    }
    setStep('idle')
  }

  const reset = () => {
    setStep('idle')
    setScannedData(null)
    setError(null)
    setScanProgress(0)
    setScanStatus('')
  }

  // Scanning Step
  if (step === 'scanning') {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
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

  // Camera Step
  if (step === 'camera') {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/50 m-8 rounded-lg pointer-events-none" />
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <p className="text-white text-sm bg-black/50 inline-block px-3 py-1 rounded-full">
                  Biniş kartınızı çerçeveye yerleştirin
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button type="button" variant="outline" onClick={stopCamera}>
                <X className="mr-2 h-4 w-4" />
                İptal
              </Button>
              <Button type="button" onClick={capturePhoto}>
                <Camera className="mr-2 h-4 w-4" />
                Fotoğraf Çek
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Scanned Step
  if (step === 'scanned' && scannedData) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 rounded-xl">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold text-green-800">Biniş Kartı Okundu!</h3>
              <p className="text-sm text-green-600">Bilgiler formlara aktarıldı</p>
            </div>
          </div>

          {scannedData.passengerName && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Yolcu</p>
                <p className="font-semibold">{scannedData.passengerName}</p>
              </div>
              {scannedData.seatNumber && (
                <div className="ml-auto text-right">
                  <p className="text-xs text-gray-500">Koltuk</p>
                  <p className="font-semibold">{scannedData.seatNumber}</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            {scannedData.flightNumber && (
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Uçuş No</span>
                <span className="font-mono font-semibold">{scannedData.flightNumber}</span>
              </div>
            )}
            {(scannedData.departureAirport || scannedData.arrivalAirport) && (
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Rota</span>
                <span className="font-mono font-semibold">
                  {scannedData.departureAirport} → {scannedData.arrivalAirport}
                </span>
              </div>
            )}
            {scannedData.flightDate && (
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Tarih</span>
                <span className="font-mono font-semibold">{scannedData.flightDate}</span>
              </div>
            )}
            {scannedData.airline && (
              <div className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="text-gray-600">Havayolu</span>
                <span className="font-semibold">{scannedData.airline}</span>
              </div>
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-4"
            onClick={reset}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Yeniden Tara
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Idle Step (default)
  return (
    <Card className={cn("border-dashed", error && "border-destructive")}>
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Plane className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold">Biniş Kartını Tara</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Barkodu tarayarak uçuş bilgilerinizi otomatik doldurun
            </p>
          </div>

          {error && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Fotoğraf Yükle
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={startCamera}
            >
              <Camera className="mr-2 h-4 w-4" />
              Kamera ile Tara
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />

          <p className="text-xs text-muted-foreground">
            PDF417/QR barkod desteklenir • JPG, PNG, HEIC
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
