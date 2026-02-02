'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Eraser, Check, PenTool, AlertTriangle, FileText } from 'lucide-react'
import type { ClaimFormData } from '../ClaimWizard'

interface StepSignatureProps {
  formData: ClaimFormData
  updateFormData: (data: Partial<ClaimFormData>) => void
}

export function StepSignature({ formData, updateFormData }: StepSignatureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(!!formData.signature)
  const [consentAccepted, setConsentAccepted] = useState(!!formData.signature)
  const [canvasReady, setCanvasReady] = useState(false)

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.style.width = `${rect.width}px`
    canvas.style.height = '160px'
    canvas.width = rect.width * dpr
    canvas.height = 160 * dpr

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.scale(dpr, dpr)
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, rect.width, 160)

    if (formData.signature) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, 160)
      }
      img.src = formData.signature
    }

    setCanvasReady(true)
  }, [formData.signature])

  useEffect(() => {
    if (consentAccepted) {
      const timer = setTimeout(setupCanvas, 100)
      return () => clearTimeout(timer)
    }
  }, [consentAccepted, setupCanvas])

  useEffect(() => {
    const handleResize = () => {
      if (canvasReady && consentAccepted) {
        setupCanvas()
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [canvasReady, consentAccepted, setupCanvas])

  const getCoordinates = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0]
      return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    setIsDrawing(true)
    const { x, y } = getCoordinates(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return
    const { x, y } = getCoordinates(e)
    ctx.lineTo(x, y)
    ctx.stroke()
    if (!hasSignature) setHasSignature(true)
  }

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e?.preventDefault()
    if (!isDrawing) return
    setIsDrawing(false)
    if (canvasRef.current) {
      updateFormData({ signature: canvasRef.current.toDataURL('image/png') })
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!ctx || !canvas) return
    const dpr = window.devicePixelRatio || 1
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    setHasSignature(false)
    updateFormData({ signature: undefined })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-xl font-semibold">Alacak Temlik Sözleşmesi</h3>
        <p className="mt-2 text-muted-foreground">
          Claim Assignment Agreement
        </p>
      </div>

      {/* Important Warning */}
      <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-yellow-800">ÖNEMLİ / IMPORTANT</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Bu sözleşme ile tazminat alacağınızın <strong>TAM MÜLKİYETİNİ</strong> Şirkete devrediyorsunuz.
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              By signing this agreement, you transfer <strong>FULL OWNERSHIP</strong> of your compensation claim to the Company.
            </p>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• Temlik sonrası havayolu ile doğrudan iletişime geçemezsiniz</li>
              <li>• You cannot contact the airline directly after assignment</li>
            </ul>
            <p className="mt-2 text-sm font-semibold text-green-700">
              ✓ Başarısız olursa hiçbir ücret ödemezsiniz (No Win = No Fee)
            </p>
          </div>
        </div>
      </div>

      {/* Contract Text */}
      <Card>
        <CardContent className="p-0">
          <div className="h-80 overflow-y-auto p-4 bg-gray-50 rounded-lg text-sm">
            {/* Section 1 */}
            <h4 className="font-bold text-primary mb-2">1. TARAFLAR / PARTIES</h4>
            <p className="mb-1"><strong>1.1. MÜŞTERİ / CLIENT</strong> ("Temlik Eden" / "Assignor")</p>
            <p className="ml-4 text-gray-600 mb-3">
              Ad Soyad: {formData.passengers[0]?.firstName} {formData.passengers[0]?.lastName}<br />
              Email: {formData.passengers[0]?.email || '-'}
            </p>
            <p className="mb-1"><strong>1.2. ŞİRKET / COMPANY</strong> ("Temlik Alan" / "Assignee")</p>
            <p className="ml-4 text-gray-600 mb-4">
              Ticaret Unvanı: UçuşTazminat<br />
              Web: www.ucustazminat.com
            </p>

            {/* Section 2 */}
            <h4 className="font-bold text-primary mb-2">2. UÇUŞ BİLGİLERİ / FLIGHT DETAILS</h4>
            <p className="ml-4 text-gray-600 mb-4">
              Uçuş No: {formData.flightNumber}<br />
              Güzergah: {formData.departureAirport} → {formData.arrivalAirport}<br />
              Tarih: {formData.flightDate}<br />
              Aksaklık: {formData.disruptionType === 'DELAY' ? 'Rötar / Delay' :
                        formData.disruptionType === 'CANCELLATION' ? 'İptal / Cancellation' :
                        formData.disruptionType === 'DENIED_BOARDING' ? 'Uçuşa Alınmama / Denied Boarding' :
                        'Alt Sınıf / Downgrade'}
            </p>

            {/* Section 3 */}
            <h4 className="font-bold text-primary mb-2">3. TEMLİK / ASSIGNMENT</h4>
            <p className="mb-2"><strong>3.1. TAM MÜLKİYET DEVRİ</strong></p>
            <p className="text-gray-600 mb-2">
              Müşteri, yukarıda belirtilen uçuş aksaklığından kaynaklanan tazminat alacağının tam mülkiyetini ve yasal hakkını Şirkete devretmektedir.
            </p>
            <ul className="ml-4 text-gray-600 mb-2 list-disc">
              <li>Türkiye'de: SHY-YOLCU Yönetmeliği (100-600 EUR)</li>
              <li>AB'de: EC 261/2004 Yönetmeliği (250-600 EUR)</li>
              <li>Tüm ek haklar ve faizler</li>
            </ul>
            <p className="mb-4"><strong>3.2. YASAL DAYANAK:</strong> 6098 Sayılı Türk Borçlar Kanunu Madde 183</p>

            {/* Section 4 */}
            <h4 className="font-bold text-primary mb-2">4. ŞİRKET YETKİLERİ / COMPANY RIGHTS</h4>
            <ul className="ml-4 text-gray-600 mb-4 list-disc">
              <li>Havayoluna doğrudan başvurma</li>
              <li>SHGM'ye başvurma</li>
              <li>Müzakere yapma</li>
              <li>Uzlaşma tekliflerini kabul/red etme</li>
              <li>Gerekirse dava açma</li>
              <li>Tazminat ödemesini tahsil etme</li>
            </ul>

            {/* Section 5 */}
            <h4 className="font-bold text-primary mb-2">5. MÜŞTERİ TAAHHÜTLERİ / CLIENT UNDERTAKINGS</h4>
            <p className="text-gray-600 mb-4">
              <strong>5.1. İLETİŞİM YASAĞI:</strong> Müşteri, temlik sonrası havayolu veya SHGM ile DOĞRUDAN İLETİŞİME GEÇMEYECEĞİNİ taahhüt eder.<br /><br />
              <strong>5.2. BİLGİLENDİRME YÜKÜMLÜLÜĞÜ:</strong> Havayolu/SHGM'den doğrudan ödeme alırsa derhal Şirketi bilgilendirecektir.
            </p>

            {/* Section 6 */}
            <h4 className="font-bold text-primary mb-2">6. HİZMET BEDELİ / SERVICE FEE</h4>
            <div className="bg-green-50 border border-green-200 rounded p-3 mb-4 text-center">
              <p className="font-bold text-green-700">NO WIN = NO FEE</p>
              <p className="text-sm text-green-600">Başarılı Olursak: %25 Hizmet Bedeli</p>
              <p className="text-sm text-green-600">Başarısız Olursak: 0 TL (HİÇBİR ÜCRET YOK)</p>
            </div>
            <ul className="ml-4 text-gray-600 mb-4 list-disc">
              <li>Tahsil edilen tutarın %25'i Şirket hizmet bedeli olarak alınır</li>
              <li>Kalan %75 tutar, Müşteriye en geç 14 iş günü içinde ödenir</li>
              <li>Başarısız olunması halinde Müşteriden hiçbir ücret talep edilmez</li>
            </ul>

            {/* Section 7 */}
            <h4 className="font-bold text-primary mb-2">7. KİŞİSEL VERİLER / DATA PROTECTION</h4>
            <p className="text-gray-600 mb-4">
              Müşteri, kişisel verilerinin havayoluna, SHGM'ye iletilmesini ve tazminat takibi amacıyla işlenmesini 6698 sayılı KVKK kapsamında kabul eder.
            </p>

            {/* Section 8 */}
            <h4 className="font-bold text-primary mb-2">8. SÜRE VE FESİH / TERM & TERMINATION</h4>
            <ul className="ml-4 text-gray-600 mb-4 list-disc">
              <li>Bu sözleşme, alacak tahsil edilene veya tahsil edilemeyeceği kesinleşene kadar geçerlidir</li>
              <li>Müşteri, Şirket somut işleme başlamadan önce yazılı bildirimle feshedebilir</li>
              <li>Temlik yapıldıktan sonra tek taraflı fesih mümkün değildir</li>
            </ul>

            {/* Section 9 */}
            <h4 className="font-bold text-primary mb-2">9. YEDEKLİLİK HÜKMÜ / FALLBACK PROVISION</h4>
            <p className="text-gray-600 mb-4">
              Bu temlikin herhangi bir sebeple geçersiz sayılması halinde, bu sözleşme otomatik olarak VEKALETNAME'ye dönüşür.
            </p>

            {/* Section 10 */}
            <h4 className="font-bold text-primary mb-2">10. DİĞER HÜKÜMLER / OTHER PROVISIONS</h4>
            <ul className="ml-4 text-gray-600 mb-4 list-disc">
              <li>Bu sözleşme Türk hukukuna tabidir</li>
              <li>İhtilaflar İstanbul mahkemelerinde çözülür</li>
              <li>Elektronik imza, ıslak imza ile eşdeğerdir</li>
              <li>Bu sözleşme noter tasdiki gerektirmez</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Consent Checkbox */}
      <div className="flex items-start space-x-3 rounded-lg border-2 border-primary/20 bg-primary/5 p-4">
        <Checkbox
          id="consent"
          checked={consentAccepted}
          onCheckedChange={(checked) => setConsentAccepted(checked as boolean)}
          className="mt-0.5"
        />
        <Label htmlFor="consent" className="text-sm leading-relaxed cursor-pointer">
          <strong>ONAY / CONFIRMATION:</strong> Bu sözleşmeyi okudum, anladım ve kabul ediyorum.
          Tazminat alacağımın tam mülkiyetini UçuşTazminat'a devrettiğimi onaylıyorum.
          <br />
          <span className="text-muted-foreground">
            I have read, understood and accept this agreement. I confirm that I transfer full ownership of my compensation claim to the Company.
          </span>
        </Label>
      </div>

      {/* Signature Pad */}
      {consentAccepted && (
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            İmzanız / Your Signature
          </Label>
          <div
            ref={containerRef}
            className="relative rounded-lg border-2 border-dashed bg-white overflow-hidden"
          >
            <canvas
              ref={canvasRef}
              className="cursor-crosshair touch-none w-full"
              style={{ height: '160px' }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onTouchCancel={stopDrawing}
            />
            {!hasSignature && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-gray-400">
                <span className="bg-white/80 px-3 py-1 rounded">Buraya imza atın / Sign here</span>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Fare veya parmağınızla imza atın
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              disabled={!hasSignature}
            >
              <Eraser className="mr-2 h-4 w-4" />
              Temizle
            </Button>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {consentAccepted && hasSignature && (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-sm text-green-800">
          <Check className="h-5 w-5" />
          <span className="font-medium">İmzanız kaydedildi. Devam edebilirsiniz.</span>
        </div>
      )}

      {!consentAccepted && (
        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          <strong>Önemli:</strong> Devam edebilmek için sözleşmeyi kabul etmeniz gerekmektedir.
        </div>
      )}

      {consentAccepted && !hasSignature && (
        <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
          Devam etmek için lütfen imzanızı atın.
        </div>
      )}

      {/* Footer Note */}
      <p className="text-xs text-center text-muted-foreground">
        Bu sözleşme TBK m.183 uyarınca noter tasdiki gerektirmez ve elektronik ortamda imzalanabilir.
      </p>
    </div>
  )
}
