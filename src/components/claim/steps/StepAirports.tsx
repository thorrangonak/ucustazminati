'use client'

import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Plane } from 'lucide-react'
import { AirportSelect } from '../AirportSelect'
import { BoardingPassScanner } from '../BoardingPassScanner'
import type { ClaimFormData } from '../ClaimWizard'

interface StepAirportsProps {
  formData: ClaimFormData
  updateFormData: (data: Partial<ClaimFormData>) => void
}

export function StepAirports({ formData, updateFormData }: StepAirportsProps) {
  const handleScanComplete = (data: {
    flightNumber?: string
    departureAirport?: string
    arrivalAirport?: string
    flightDate?: string
    airline?: string
  }) => {
    updateFormData({
      ...(data.departureAirport && { departureAirport: data.departureAirport }),
      ...(data.arrivalAirport && { arrivalAirport: data.arrivalAirport }),
      ...(data.flightNumber && { flightNumber: data.flightNumber }),
      ...(data.flightDate && { flightDate: data.flightDate }),
      ...(data.airline && { airline: data.airline }),
    })
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Plane className="h-8 w-8 text-primary" />
        </div>
        <h3 className="mt-4 text-xl font-semibold">Uçuş Rotanızı Belirleyin</h3>
        <p className="mt-2 text-muted-foreground">
          Biniş kartınızı tarayın veya havalimanlarını seçin
        </p>
      </div>

      {/* Boarding Pass Scanner */}
      <BoardingPassScanner onScanComplete={handleScanComplete} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            veya manuel giriş
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Kalkış Havalimanı</Label>
          <AirportSelect
            value={formData.departureAirport}
            onChange={(value) => updateFormData({ departureAirport: value })}
            placeholder="Örn: İstanbul, IST"
            type="departure"
          />
        </div>

        <div className="space-y-2">
          <Label>Varış Havalimanı</Label>
          <AirportSelect
            value={formData.arrivalAirport}
            onChange={(value) => updateFormData({ arrivalAirport: value })}
            placeholder="Örn: Londra, LHR"
            type="arrival"
          />
        </div>

        <div className="flex items-center space-x-2 rounded-lg border p-4">
          <Checkbox
            id="hasConnection"
            checked={formData.hasConnection}
            onCheckedChange={(checked) =>
              updateFormData({ hasConnection: checked as boolean })
            }
          />
          <Label htmlFor="hasConnection" className="cursor-pointer">
            Aktarmalı uçuş mu?
          </Label>
        </div>

        {formData.hasConnection && (
          <div className="space-y-2">
            <Label>Aktarma Havalimanı</Label>
            <AirportSelect
              value={formData.connectionAirport || ''}
              onChange={(value) => updateFormData({ connectionAirport: value })}
              placeholder="Örn: Frankfurt, FRA"
              type="connection"
            />
          </div>
        )}
      </div>

      {/* Validation Message */}
      {(!formData.departureAirport || !formData.arrivalAirport) && (
        <div className="rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
          Devam etmek için kalkış ve varış havalimanlarını seçin.
        </div>
      )}
    </div>
  )
}
