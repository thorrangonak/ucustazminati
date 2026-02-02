'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Plane,
  Calendar,
  Users,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Banknote,
} from 'lucide-react'
import type { ClaimFormData } from '../ClaimWizard'

interface StepConfirmationProps {
  formData: ClaimFormData
}

export function StepConfirmation({ formData }: StepConfirmationProps) {
  // Calculate estimated compensation
  const getCompensationAmount = () => {
    // Simplified calculation - in real app would use distance API
    const isDomestic =
      formData.departureAirport.includes('TR') || formData.arrivalAirport.includes('TR')

    // Mock calculation based on typical distances
    if (isDomestic) return 100
    // Default to medium distance
    return 400
  }

  const compensationAmount = formData.compensationAmount || getCompensationAmount()
  const commission = compensationAmount * 0.25
  const netPayout = compensationAmount - commission

  const getDisruptionLabel = (type: string) => {
    switch (type) {
      case 'DELAY':
        return 'Uçuş Gecikmesi'
      case 'CANCELLATION':
        return 'Uçuş İptali'
      case 'DENIED_BOARDING':
        return 'Uçağa Alınmama'
      case 'DOWNGRADE':
        return 'Alt Sınıf'
      default:
        return type
    }
  }

  const getFlightTypeLabel = (type: string) => {
    switch (type) {
      case 'ONE_WAY':
        return 'Tek Yön'
      case 'ROUND_TRIP':
        return 'Gidiş-Dönüş'
      case 'MULTI_CITY':
        return 'Çoklu Şehir'
      default:
        return type
    }
  }

  const hasAllRequiredInfo = () => {
    return (
      formData.departureAirport &&
      formData.arrivalAirport &&
      formData.flightNumber &&
      formData.flightDate &&
      formData.passengers[0]?.firstName &&
      formData.passengers[0]?.lastName &&
      formData.passengers[0]?.email &&
      formData.iban &&
      formData.signature
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Başvuru Özeti</h3>
        <p className="mt-2 text-muted-foreground">
          Bilgilerinizi kontrol edin ve talebinizi gönderin
        </p>
      </div>

      {/* Compensation Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700">Tahmini Tazminat</p>
              <p className="text-3xl font-bold text-green-800">€{compensationAmount}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-green-700">Size Kalacak</p>
              <p className="text-2xl font-bold text-green-800">€{netPayout}</p>
              <p className="text-xs text-green-600">(Komisyon: €{commission})</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flight Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plane className="h-5 w-5" />
            Uçuş Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rota</span>
            <span className="font-medium">
              {formData.departureAirport} → {formData.arrivalAirport}
            </span>
          </div>
          {formData.hasConnection && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Aktarma</span>
              <span className="font-medium">{formData.connectionAirport}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Uçuş No</span>
            <span className="font-medium">{formData.flightNumber || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tarih</span>
            <span className="font-medium">
              {formData.flightDate
                ? new Date(formData.flightDate).toLocaleDateString('tr-TR')
                : '-'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Havayolu</span>
            <span className="font-medium">{formData.airline || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Uçuş Tipi</span>
            <Badge variant="outline">{getFlightTypeLabel(formData.flightType)}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Disruption Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5" />
            Aksama Detayı
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sorun Tipi</span>
            <Badge>{getDisruptionLabel(formData.disruptionType)}</Badge>
          </div>
          {formData.disruptionType === 'DELAY' && formData.delayDuration && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gecikme Süresi</span>
              <span className="font-medium">{formData.delayDuration} saat</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passengers */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5" />
            Yolcular ({formData.passengers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {formData.passengers.map((passenger, index) => (
            <div key={index} className="flex justify-between rounded-lg bg-muted/50 p-2">
              <span>
                {passenger.firstName} {passenger.lastName}
                {passenger.isPrimary && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    Ana
                  </Badge>
                )}
              </span>
              <span className="text-muted-foreground">{passenger.email || '-'}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Documents & Signature */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Belgeler & İmza
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Yüklenen Belge</span>
            <span className="font-medium">{formData.documents.length} adet</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">E-İmza</span>
            <span className="flex items-center gap-1">
              {formData.signature ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">Tamamlandı</span>
                </>
              ) : (
                <span className="text-yellow-600">Eksik</span>
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">IBAN</span>
            <span className="font-mono text-sm">{formData.iban || '-'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Validation Status */}
      {hasAllRequiredInfo() ? (
        <div className="flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          <div>
            <p className="font-medium">Başvurunuz Hazır</p>
            <p className="text-sm">Tüm bilgiler tamamlandı. Talebinizi gönderebilirsiniz.</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-yellow-50 p-4 text-yellow-800">
          <AlertTriangle className="h-5 w-5" />
          <div>
            <p className="font-medium">Eksik Bilgiler Var</p>
            <p className="text-sm">
              Lütfen önceki adımlara dönüp eksik bilgileri tamamlayın.
            </p>
          </div>
        </div>
      )}

      <Separator />

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground">
        &quot;Talebi Gönder&quot; butonuna tıklayarak{' '}
        <a href="/kullanim-kosullari" className="text-primary hover:underline">
          Kullanım Koşulları
        </a>
        &apos;nı ve{' '}
        <a href="/gizlilik-politikasi" className="text-primary hover:underline">
          Gizlilik Politikası
        </a>
        &apos;nı kabul etmiş olursunuz.
      </p>
    </div>
  )
}
