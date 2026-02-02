'use client'

import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Input } from '@/components/ui/input'
import { Clock, XCircle, UserX, ArrowDownCircle } from 'lucide-react'
import type { ClaimFormData } from '../ClaimWizard'

interface StepDisruptionProps {
  formData: ClaimFormData
  updateFormData: (data: Partial<ClaimFormData>) => void
}

const disruptionTypes = [
  {
    value: 'DELAY',
    label: 'Uçuş Gecikmesi',
    description: '3 saat veya daha fazla gecikme',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    value: 'CANCELLATION',
    label: 'Uçuş İptali',
    description: 'Uçuş tamamen iptal edildi',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    value: 'DENIED_BOARDING',
    label: 'Uçağa Alınmama',
    description: 'Overbooking nedeniyle giriş reddedildi',
    icon: UserX,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    value: 'DOWNGRADE',
    label: 'Alt Sınıf',
    description: 'İzniniz olmadan daha düşük sınıfa alındınız',
    icon: ArrowDownCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
]

export function StepDisruption({ formData, updateFormData }: StepDisruptionProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Ne Yaşadınız?</h3>
        <p className="mt-2 text-muted-foreground">
          Uçuşunuzda yaşadığınız sorunu seçin
        </p>
      </div>

      <RadioGroup
        value={formData.disruptionType}
        onValueChange={(value) =>
          updateFormData({ disruptionType: value as ClaimFormData['disruptionType'] })
        }
        className="grid gap-3 sm:grid-cols-2"
      >
        {disruptionTypes.map((type) => (
          <div key={type.value}>
            <RadioGroupItem
              value={type.value}
              id={type.value}
              className="peer sr-only"
            />
            <Label
              htmlFor={type.value}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 p-4 text-center transition-colors hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${type.bgColor}`}>
                <type.icon className={`h-6 w-6 ${type.color}`} />
              </div>
              <div>
                <p className="font-medium">{type.label}</p>
                <p className="text-xs text-muted-foreground">{type.description}</p>
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>

      {formData.disruptionType === 'DELAY' && (
        <div className="space-y-2">
          <Label htmlFor="delayDuration" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Gecikme Süresi (saat)
          </Label>
          <Input
            id="delayDuration"
            type="number"
            min="0"
            max="48"
            placeholder="Örn: 4"
            value={formData.delayDuration || ''}
            onChange={(e) =>
              updateFormData({ delayDuration: parseInt(e.target.value) || undefined })
            }
          />
          <p className="text-xs text-muted-foreground">
            Varış noktasına planlanan saatten kaç saat geç ulaştınız?
          </p>

          {formData.delayDuration !== undefined && formData.delayDuration < 3 && (
            <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
              <strong>Dikkat:</strong> 3 saatten az gecikmelerde genellikle
              tazminat hakkı doğmamaktadır.
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg bg-gray-50 p-4 text-sm">
        <p className="font-medium">Tazminat Hakkı Koşulları:</p>
        <ul className="mt-2 space-y-1 text-muted-foreground">
          <li>• Gecikme: Varış noktasına 3+ saat geç ulaşma</li>
          <li>• İptal: 14 günden az süre önce haber verilmesi</li>
          <li>• Overbooking: Fazla bilet satışı nedeniyle uçuşa alınmama</li>
          <li>• Alt sınıf: Business&apos;tan economy&apos;ye düşürülme gibi</li>
        </ul>
      </div>
    </div>
  )
}
