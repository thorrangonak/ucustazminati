'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowRight, Calculator, Plane, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

type DisruptionType = 'delay' | 'cancellation' | 'denied_boarding' | 'downgrade'
type FlightType = 'domestic' | 'international'

interface CalculationResult {
  eligible: boolean
  amount: number
  commission: number
  netPayout: number
  reason: string
  distanceCategory: string
}

const distanceExamples = [
  { route: 'İstanbul - Ankara', distance: 350, domestic: true },
  { route: 'İstanbul - Atina', distance: 550, domestic: false },
  { route: 'İstanbul - Londra', distance: 2500, domestic: false },
  { route: 'İstanbul - New York', distance: 8100, domestic: false },
]

export default function CompensationCalculatorPage() {
  const [formData, setFormData] = useState({
    flightType: '' as FlightType | '',
    distance: '',
    disruptionType: '' as DisruptionType | '',
    delayHours: '',
  })
  const [result, setResult] = useState<CalculationResult | null>(null)

  const calculateCompensation = () => {
    const isDomestic = formData.flightType === 'domestic'
    const distanceKm = parseInt(formData.distance) || 0
    const delayMinutes = parseInt(formData.delayHours) * 60 || 0

    // Check delay eligibility
    if (formData.disruptionType === 'delay' && delayMinutes < 180) {
      setResult({
        eligible: false,
        amount: 0,
        commission: 0,
        netPayout: 0,
        reason: 'Gecikme süresi 3 saatten az olduğu için tazminat hakkı bulunmamaktadır.',
        distanceCategory: '',
      })
      return
    }

    // Calculate amount based on distance
    let amount: number
    let distanceCategory: string

    if (isDomestic) {
      amount = 100
      distanceCategory = 'İç hat'
    } else if (distanceKm <= 1500) {
      amount = 250
      distanceCategory = '1500 km ve altı'
    } else if (distanceKm <= 3500) {
      amount = 400
      distanceCategory = '1500-3500 km arası'
    } else {
      amount = 600
      distanceCategory = '3500 km üzeri'
    }

    const commission = amount * 0.25
    const netPayout = amount - commission

    let reason: string
    switch (formData.disruptionType) {
      case 'delay':
        reason = `Uçuşunuz ${formData.delayHours} saat gecikti.`
        break
      case 'cancellation':
        reason = 'Uçuşunuz iptal edildi.'
        break
      case 'denied_boarding':
        reason = 'Uçuşa kabul edilmediniz (overbooking).'
        break
      case 'downgrade':
        reason = 'Daha düşük bir sınıfa alındınız.'
        break
      default:
        reason = ''
    }

    setResult({
      eligible: true,
      amount,
      commission,
      netPayout,
      reason: `${reason} ${distanceCategory} kategorisinde tazminat hakkınız bulunmaktadır.`,
      distanceCategory,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    calculateCompensation()
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-white to-blue-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Calculator className="h-8 w-8 text-primary" />
          </div>
          <h1 className="mt-6 text-4xl font-bold text-gray-900 sm:text-5xl">
            Tazminat Hesaplayıcı
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Uçuş bilgilerinizi girin, ne kadar tazminat alabileceğinizi hemen
            öğrenin. Hesaplama SHY-YOLCU yönetmeliğine göre yapılmaktadır.
          </p>
        </div>
      </section>

      {/* Calculator Section */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Calculator Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  Uçuş Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Flight Type */}
                  <div>
                    <Label>Uçuş Tipi</Label>
                    <RadioGroup
                      value={formData.flightType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, flightType: value as FlightType })
                      }
                      className="mt-2 grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 rounded-lg border p-4">
                        <RadioGroupItem value="domestic" id="domestic" />
                        <Label htmlFor="domestic" className="cursor-pointer">
                          İç Hat (Türkiye)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg border p-4">
                        <RadioGroupItem value="international" id="international" />
                        <Label htmlFor="international" className="cursor-pointer">
                          Dış Hat
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Distance (for international) */}
                  {formData.flightType === 'international' && (
                    <div>
                      <Label htmlFor="distance">Uçuş Mesafesi (km)</Label>
                      <Input
                        id="distance"
                        type="number"
                        placeholder="Örn: 2500"
                        value={formData.distance}
                        onChange={(e) =>
                          setFormData({ ...formData, distance: e.target.value })
                        }
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {distanceExamples
                          .filter((ex) => !ex.domestic)
                          .map((example) => (
                            <Button
                              key={example.route}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  distance: example.distance.toString(),
                                })
                              }
                            >
                              {example.route} ({example.distance} km)
                            </Button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Disruption Type */}
                  <div>
                    <Label htmlFor="disruptionType">Ne Oldu?</Label>
                    <Select
                      value={formData.disruptionType}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          disruptionType: value as DisruptionType,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seçiniz" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="delay">Uçuş Gecikti</SelectItem>
                        <SelectItem value="cancellation">Uçuş İptal Oldu</SelectItem>
                        <SelectItem value="denied_boarding">
                          Uçuşa Alınmadım (Overbooking)
                        </SelectItem>
                        <SelectItem value="downgrade">Alt Sınıfa Alındım</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Delay Duration */}
                  {formData.disruptionType === 'delay' && (
                    <div>
                      <Label htmlFor="delayHours">
                        <Clock className="mr-1 inline h-4 w-4" />
                        Gecikme Süresi (saat)
                      </Label>
                      <Input
                        id="delayHours"
                        type="number"
                        placeholder="Örn: 4"
                        value={formData.delayHours}
                        onChange={(e) =>
                          setFormData({ ...formData, delayHours: e.target.value })
                        }
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Tazminat hakkı için en az 3 saat gecikme gereklidir.
                      </p>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={
                      !formData.flightType ||
                      !formData.disruptionType ||
                      (formData.flightType === 'international' && !formData.distance) ||
                      (formData.disruptionType === 'delay' && !formData.delayHours)
                    }
                  >
                    <Calculator className="mr-2 h-4 w-4" />
                    Tazminatı Hesapla
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Result */}
            <div className="space-y-6">
              {result ? (
                <Card
                  className={
                    result.eligible
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {result.eligible ? (
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-red-600" />
                      )}
                      <div className="flex-1">
                        <h3
                          className={`text-xl font-bold ${
                            result.eligible ? 'text-green-800' : 'text-red-800'
                          }`}
                        >
                          {result.eligible
                            ? 'Tazminat Hakkınız Var!'
                            : 'Tazminat Hakkınız Yok'}
                        </h3>
                        <p
                          className={`mt-2 ${
                            result.eligible ? 'text-green-700' : 'text-red-700'
                          }`}
                        >
                          {result.reason}
                        </p>
                      </div>
                    </div>

                    {result.eligible && (
                      <>
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                          <div className="rounded-lg bg-white p-4 text-center">
                            <p className="text-sm text-gray-600">Tazminat Tutarı</p>
                            <p className="text-2xl font-bold text-gray-900">
                              €{result.amount}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white p-4 text-center">
                            <p className="text-sm text-gray-600">Komisyon (%25)</p>
                            <p className="text-2xl font-bold text-gray-900">
                              €{result.commission}
                            </p>
                          </div>
                          <div className="rounded-lg bg-white p-4 text-center">
                            <p className="text-sm text-gray-600">Size Kalan</p>
                            <p className="text-2xl font-bold text-green-600">
                              €{result.netPayout}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6">
                          <Link href="/yeni-talep">
                            <Button className="w-full">
                              Hemen Başvur
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                          <p className="mt-2 text-center text-sm text-green-700">
                            Başarısız olursak hiçbir ücret ödemezsiniz.
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                    <Calculator className="h-12 w-12 text-gray-300" />
                    <h3 className="mt-4 font-medium text-gray-600">
                      Hesaplama Sonucu
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Formu doldurup hesapla butonuna tıklayın.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Compensation Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tazminat Tablosu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden rounded-lg border">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left">Mesafe</th>
                          <th className="px-4 py-2 text-right">Tazminat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        <tr>
                          <td className="px-4 py-2">İç Hat (Türkiye)</td>
                          <td className="px-4 py-2 text-right font-semibold text-primary">
                            €100
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">1500 km&apos;ye kadar</td>
                          <td className="px-4 py-2 text-right font-semibold text-primary">
                            €250
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">1500 - 3500 km</td>
                          <td className="px-4 py-2 text-right font-semibold text-primary">
                            €400
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2">3500 km üzeri</td>
                          <td className="px-4 py-2 text-right font-semibold text-primary">
                            €600
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    * 3 saat ve üzeri gecikmeler, iptaller ve overbooking durumları
                    için geçerlidir.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
