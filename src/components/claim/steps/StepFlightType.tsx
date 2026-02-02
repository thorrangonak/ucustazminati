'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ArrowRight, ArrowLeftRight, GitBranch } from 'lucide-react'
import type { ClaimFormData } from '../ClaimWizard'

interface StepFlightTypeProps {
  formData: ClaimFormData
  updateFormData: (data: Partial<ClaimFormData>) => void
}

const flightTypes = [
  {
    value: 'ONE_WAY',
    label: 'Tek Yön',
    description: 'Sadece gidiş uçuşu',
    icon: ArrowRight,
  },
  {
    value: 'ROUND_TRIP',
    label: 'Gidiş-Dönüş',
    description: 'Gidiş ve dönüş uçuşları',
    icon: ArrowLeftRight,
  },
  {
    value: 'MULTI_CITY',
    label: 'Çoklu Şehir',
    description: 'Birden fazla varış noktası',
    icon: GitBranch,
  },
]

export function StepFlightType({ formData, updateFormData }: StepFlightTypeProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Uçuş Tipinizi Seçin</h3>
        <p className="mt-2 text-muted-foreground">
          Rezervasyonunuzun tipini belirtin
        </p>
      </div>

      <RadioGroup
        value={formData.flightType}
        onValueChange={(value) =>
          updateFormData({ flightType: value as ClaimFormData['flightType'] })
        }
        className="space-y-3"
      >
        {flightTypes.map((type) => (
          <div key={type.value}>
            <RadioGroupItem
              value={type.value}
              id={type.value}
              className="peer sr-only"
            />
            <Label
              htmlFor={type.value}
              className="flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-colors hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <type.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">{type.label}</p>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <strong>İpucu:</strong> Gidiş-dönüş biletlerde hem gidiş hem dönüş
        uçuşunda sorun yaşadıysanız, her iki uçuş için ayrı tazminat
        alabilirsiniz.
      </div>
    </div>
  )
}
