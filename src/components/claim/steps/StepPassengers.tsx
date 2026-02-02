'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { User, Mail, Phone, CreditCard, Plus, Trash2 } from 'lucide-react'
import type { ClaimFormData } from '../ClaimWizard'

interface StepPassengersProps {
  formData: ClaimFormData
  updateFormData: (data: Partial<ClaimFormData>) => void
}

export function StepPassengers({ formData, updateFormData }: StepPassengersProps) {
  const updatePassenger = (index: number, field: string, value: string) => {
    const newPassengers = [...formData.passengers]
    newPassengers[index] = { ...newPassengers[index], [field]: value }
    updateFormData({ passengers: newPassengers })
  }

  const addPassenger = () => {
    updateFormData({
      passengers: [
        ...formData.passengers,
        { firstName: '', lastName: '', email: '', phone: '', isPrimary: false },
      ],
    })
  }

  const removePassenger = (index: number) => {
    if (formData.passengers.length > 1) {
      const newPassengers = formData.passengers.filter((_, i) => i !== index)
      // Ensure there's always a primary passenger
      if (formData.passengers[index].isPrimary && newPassengers.length > 0) {
        newPassengers[0].isPrimary = true
      }
      updateFormData({ passengers: newPassengers })
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold">Yolcu Bilgileri</h3>
        <p className="mt-2 text-muted-foreground">
          Tazminat talep eden yolcuların bilgilerini girin
        </p>
      </div>

      <div className="space-y-4">
        {formData.passengers.map((passenger, index) => (
          <Card key={index} className={passenger.isPrimary ? 'border-primary' : ''}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">
                    Yolcu {index + 1}
                    {passenger.isPrimary && (
                      <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        Ana Yolcu
                      </span>
                    )}
                  </span>
                </div>
                {!passenger.isPrimary && formData.passengers.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePassenger(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`firstName-${index}`}>Ad</Label>
                  <Input
                    id={`firstName-${index}`}
                    placeholder="Ad"
                    value={passenger.firstName}
                    onChange={(e) => updatePassenger(index, 'firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`lastName-${index}`}>Soyad</Label>
                  <Input
                    id={`lastName-${index}`}
                    placeholder="Soyad"
                    value={passenger.lastName}
                    onChange={(e) => updatePassenger(index, 'lastName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`email-${index}`} className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    E-posta
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    placeholder="ornek@email.com"
                    value={passenger.email}
                    onChange={(e) => updatePassenger(index, 'email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`phone-${index}`} className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    Telefon (Opsiyonel)
                  </Label>
                  <Input
                    id={`phone-${index}`}
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    value={passenger.phone || ''}
                    onChange={(e) => updatePassenger(index, 'phone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={addPassenger}
        >
          <Plus className="mr-2 h-4 w-4" />
          Yolcu Ekle
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Ödeme Bilgileri
        </h4>
        <div className="space-y-2">
          <Label htmlFor="iban">IBAN</Label>
          <Input
            id="iban"
            placeholder="TR00 0000 0000 0000 0000 0000 00"
            value={formData.iban}
            onChange={(e) => {
              // Format IBAN with spaces
              const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
              const formatted = value.replace(/(.{4})/g, '$1 ').trim()
              updateFormData({ iban: formatted })
            }}
            maxLength={32}
          />
          <p className="text-xs text-muted-foreground">
            Tazminat tutarı bu hesaba yatırılacaktır
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
        <strong>Bilgi:</strong> Her yolcu için ayrı tazminat hesaplanır. Aynı
        rezervasyondaki tüm yolcuları ekleyebilirsiniz.
      </div>
    </div>
  )
}
