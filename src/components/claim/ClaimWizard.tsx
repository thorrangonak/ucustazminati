'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react'
import { StepAirports } from './steps/StepAirports'
import { StepFlightType } from './steps/StepFlightType'
import { StepDisruption } from './steps/StepDisruption'
import { StepFlightInfo } from './steps/StepFlightInfo'
import { StepPassengers } from './steps/StepPassengers'
import { StepDocuments } from './steps/StepDocuments'
import { StepSignature } from './steps/StepSignature'
import { StepConfirmation } from './steps/StepConfirmation'
import { toast } from 'sonner'

export interface ClaimFormData {
  // Step 1: Airports
  departureAirport: string
  arrivalAirport: string
  hasConnection: boolean
  connectionAirport?: string

  // Step 2: Flight Type
  flightType: 'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY'

  // Step 3: Disruption
  disruptionType: 'DELAY' | 'CANCELLATION' | 'DENIED_BOARDING' | 'DOWNGRADE'
  delayDuration?: number

  // Step 4: Flight Info
  flightNumber: string
  flightDate: string
  airline: string

  // Step 5: Passengers
  passengers: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    isPrimary: boolean
  }[]
  iban: string

  // Step 6: Documents
  documents: File[]

  // Step 7: Signature
  signature?: string

  // Calculated
  compensationAmount?: number
  flightDistance?: number
}

const steps = [
  { id: 1, title: 'Havalimanları', description: 'Kalkış ve varış' },
  { id: 2, title: 'Uçuş Tipi', description: 'Tek yön veya gidiş-dönüş' },
  { id: 3, title: 'Aksama', description: 'Gecikme veya iptal' },
  { id: 4, title: 'Uçuş Bilgileri', description: 'Tarih ve havayolu' },
  { id: 5, title: 'Yolcular', description: 'Yolcu bilgileri' },
  { id: 6, title: 'Belgeler', description: 'Doküman yükleme' },
  { id: 7, title: 'E-İmza', description: 'Yetkilendirme' },
  { id: 8, title: 'Onay', description: 'Son kontrol' },
]

export function ClaimWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<ClaimFormData>({
    departureAirport: '',
    arrivalAirport: '',
    hasConnection: false,
    flightType: 'ONE_WAY',
    disruptionType: 'DELAY',
    flightNumber: '',
    flightDate: '',
    airline: '',
    passengers: [
      {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        isPrimary: true,
      },
    ],
    iban: '',
    documents: [],
  })

  const updateFormData = (data: Partial<ClaimFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
    setError(null)
  }

  const validateStep = (step: number): string | null => {
    switch (step) {
      case 1:
        if (!formData.departureAirport) return 'Kalkış havalimanı seçin'
        if (!formData.arrivalAirport) return 'Varış havalimanı seçin'
        if (formData.hasConnection && !formData.connectionAirport) return 'Aktarma havalimanı seçin'
        break
      case 2:
        if (!formData.flightType) return 'Uçuş tipini seçin'
        break
      case 3:
        if (!formData.disruptionType) return 'Aksama tipini seçin'
        if (formData.disruptionType === 'DELAY' && !formData.delayDuration) return 'Gecikme süresini belirtin'
        break
      case 4:
        if (!formData.flightNumber) return 'Uçuş numarasını girin'
        if (!formData.flightDate) return 'Uçuş tarihini seçin'
        break
      case 5:
        const primaryPassenger = formData.passengers.find(p => p.isPrimary)
        if (!primaryPassenger) return 'En az bir yolcu ekleyin'
        if (!primaryPassenger.firstName || !primaryPassenger.lastName) return 'Yolcu ad ve soyadını girin'
        break
      case 6:
        // Documents are optional
        break
      case 7:
        if (!formData.signature) return 'Lütfen imzanızı atın'
        break
    }
    return null
  }

  const handleNext = () => {
    const validationError = validateStep(currentStep)
    if (validationError) {
      setError(validationError)
      toast.error(validationError)
      return
    }

    if (currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1)
      setError(null)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      setError(null)
    }
  }

  const handleSubmit = async () => {
    // Validate all steps
    for (let i = 1; i <= 7; i++) {
      const validationError = validateStep(i)
      if (validationError) {
        setError(validationError)
        toast.error(`Adım ${i}: ${validationError}`)
        return
      }
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Filter out empty passenger fields
          passengers: formData.passengers.filter(p => p.firstName && p.lastName),
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('Talebiniz başarıyla oluşturuldu!')
        router.push(`/taleplerim/${result.claim.id}?success=true`)
      } else {
        setError(result.error || 'Talep oluşturulamadı')
        toast.error(result.error || 'Talep oluşturulamadı')
      }
    } catch (err) {
      console.error('Error submitting claim:', err)
      setError('Bir hata oluştu. Lütfen tekrar deneyin.')
      toast.error('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepAirports formData={formData} updateFormData={updateFormData} />
      case 2:
        return <StepFlightType formData={formData} updateFormData={updateFormData} />
      case 3:
        return <StepDisruption formData={formData} updateFormData={updateFormData} />
      case 4:
        return <StepFlightInfo formData={formData} updateFormData={updateFormData} />
      case 5:
        return <StepPassengers formData={formData} updateFormData={updateFormData} />
      case 6:
        return <StepDocuments formData={formData} updateFormData={updateFormData} />
      case 7:
        return <StepSignature formData={formData} updateFormData={updateFormData} />
      case 8:
        return <StepConfirmation formData={formData} />
      default:
        return null
    }
  }

  const isStepValid = !validateStep(currentStep)

  return (
    <div className="mx-auto max-w-3xl">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold">
            Adım {currentStep}: {steps[currentStep - 1].title}
          </h2>
          <span className="text-sm text-muted-foreground">
            {currentStep} / {steps.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <p className="mt-2 text-sm text-muted-foreground">
          {steps[currentStep - 1].description}
        </p>
      </div>

      {/* Mobile Step Indicators */}
      <div className="flex lg:hidden overflow-x-auto gap-1 mb-6 pb-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex-shrink-0 h-1.5 w-8 rounded-full transition-colors ${
              currentStep > step.id
                ? 'bg-green-500'
                : currentStep === step.id
                ? 'bg-primary'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Desktop Step Indicators */}
      <div className="hidden lg:flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                currentStep > step.id
                  ? 'bg-green-500 text-white'
                  : currentStep === step.id
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {currentStep > step.id ? (
                <Check className="h-4 w-4" />
              ) : (
                step.id
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-8 transition-colors ${
                  currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Content */}
      <Card>
        <CardContent className="p-6">{renderStep()}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>

        {currentStep < steps.length ? (
          <Button onClick={handleNext} disabled={!isStepValid && currentStep !== 6}>
            İleri
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Talebi Gönder
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
