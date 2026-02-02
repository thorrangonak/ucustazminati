'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar, Plane, Building } from 'lucide-react'
import type { ClaimFormData } from '../ClaimWizard'

interface StepFlightInfoProps {
  formData: ClaimFormData
  updateFormData: (data: Partial<ClaimFormData>) => void
}

const popularAirlines = [
  { code: 'TK', name: 'Türk Hava Yolları' },
  { code: 'PC', name: 'Pegasus' },
  { code: 'XQ', name: 'SunExpress' },
  { code: 'XC', name: 'Corendon Airlines' },
  { code: 'TK', name: 'AnadoluJet' },
  { code: 'LH', name: 'Lufthansa' },
  { code: 'BA', name: 'British Airways' },
  { code: 'AF', name: 'Air France' },
  { code: 'EK', name: 'Emirates' },
  { code: 'QR', name: 'Qatar Airways' },
]

export function StepFlightInfo({ formData, updateFormData }: StepFlightInfoProps) {
  // Get today's date for max date validation
  const today = new Date().toISOString().split('T')[0]
  // Get date 3 years ago for min date
  const threeYearsAgo = new Date()
  threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3)
  const minDate = threeYearsAgo.toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Uçuş Bilgilerini Girin</h3>
        <p className="mt-2 text-muted-foreground">
          Gecikme/iptal yaşadığınız uçuşun detayları
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="flightNumber" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Uçuş Numarası
          </Label>
          <Input
            id="flightNumber"
            placeholder="Örn: TK1234"
            value={formData.flightNumber}
            onChange={(e) => updateFormData({ flightNumber: e.target.value.toUpperCase() })}
          />
          <p className="text-xs text-muted-foreground">
            Biletinizde veya biniş kartınızda yazılı olan uçuş numarası
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flightDate" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Uçuş Tarihi
          </Label>
          <Input
            id="flightDate"
            type="date"
            min={minDate}
            max={today}
            value={formData.flightDate}
            onChange={(e) => updateFormData({ flightDate: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            Son 3 yıl içindeki uçuşlar için tazminat talep edilebilir
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="airline" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Havayolu Şirketi
          </Label>
          <Select
            value={formData.airline}
            onValueChange={(value) => updateFormData({ airline: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Havayolu seçin" />
            </SelectTrigger>
            <SelectContent>
              {popularAirlines.map((airline) => (
                <SelectItem key={airline.code + airline.name} value={airline.name}>
                  {airline.name}
                </SelectItem>
              ))}
              <SelectItem value="other">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.airline === 'other' && (
          <div className="space-y-2">
            <Label htmlFor="otherAirline">Havayolu Adı</Label>
            <Input
              id="otherAirline"
              placeholder="Havayolu şirketinin adını yazın"
              onChange={(e) => updateFormData({ airline: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <strong>İpucu:</strong> Uçuş numaranızı bilmiyorsanız, biletinize veya
        email onayınıza bakabilirsiniz. Uçuş numarası genellikle 2 harf ve 3-4
        rakamdan oluşur (örn: TK1234).
      </div>
    </div>
  )
}
