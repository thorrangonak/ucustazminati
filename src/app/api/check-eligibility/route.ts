import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getFlightDelayInfo, getEffectiveDelay, FlightDelayInfo } from '@/lib/aviationstack'

interface EligibilityResult {
  isEligible: boolean
  compensationAmount: number
  currency: string
  flightDistance: number | null
  delayMinutes: number | null
  regulation: 'SHY-YOLCU' | 'EC261' | null
  reason: string
  flightInfo: {
    flightNumber: string
    flightDate: string
    departureAirport: {
      code: string
      name: string
      city: string
    } | null
    arrivalAirport: {
      code: string
      name: string
      city: string
    } | null
    airline: string | null
    status: string
    scheduledDeparture: string | null
    actualDeparture: string | null
    scheduledArrival: string | null
    actualArrival: string | null
    isCancelled: boolean
  }
  dataSource: 'aviationstack' | 'mock'
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function calculateCompensation(
  distanceKm: number,
  isDomestic: boolean,
  delayMinutes: number,
  isCancelled: boolean
): { amount: number; regulation: 'SHY-YOLCU' | 'EC261' } {
  // Cancellation always eligible for compensation
  if (isCancelled) {
    if (isDomestic) {
      return { amount: 100, regulation: 'SHY-YOLCU' }
    }
    if (distanceKm <= 1500) {
      return { amount: 250, regulation: 'SHY-YOLCU' }
    } else if (distanceKm <= 3500) {
      return { amount: 400, regulation: 'SHY-YOLCU' }
    } else {
      return { amount: 600, regulation: 'SHY-YOLCU' }
    }
  }

  // Minimum 3 hours delay required for compensation
  if (delayMinutes < 180) {
    return { amount: 0, regulation: 'SHY-YOLCU' }
  }

  // Turkish domestic flights (SHY-YOLCU)
  if (isDomestic) {
    return { amount: 100, regulation: 'SHY-YOLCU' }
  }

  // International flights from/to Turkey (EC 261/2004 equivalent in SHY-YOLCU)
  if (distanceKm <= 1500) {
    return { amount: 250, regulation: 'SHY-YOLCU' }
  } else if (distanceKm <= 3500) {
    return { amount: 400, regulation: 'SHY-YOLCU' }
  } else {
    return { amount: 600, regulation: 'SHY-YOLCU' }
  }
}

function formatDelayMessage(delayMinutes: number, isCancelled: boolean, amount: number): string {
  if (isCancelled) {
    return `Uçuşunuz iptal edilmiş. ${amount}€ tazminat almaya hak kazandınız!`
  }

  const hours = Math.floor(delayMinutes / 60)
  const mins = delayMinutes % 60

  let delayStr = ''
  if (hours > 0) {
    delayStr = mins > 0 ? `${hours} saat ${mins} dakika` : `${hours} saat`
  } else {
    delayStr = `${mins} dakika`
  }

  if (delayMinutes < 180) {
    return `Uçuşunuz ${delayStr} gecikmiş. Tazminat için en az 3 saat (180 dakika) gecikme gereklidir.`
  }

  return `Uçuşunuz ${delayStr} gecikmiş ve ${amount}€ tazminat almaya hak kazandınız!`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flightNumber, departureAirport, arrivalAirport, flightDate } = body

    if (!flightNumber || !departureAirport || !arrivalAirport) {
      return NextResponse.json(
        { error: 'Uçuş numarası ve havalimanları gerekli' },
        { status: 400 }
      )
    }

    // Validate flight date
    const dateStr = flightDate || new Date().toISOString().split('T')[0]

    // Look up airports in database
    const [departure, arrival] = await Promise.all([
      prisma.airport.findFirst({
        where: { iataCode: departureAirport.toUpperCase() },
      }),
      prisma.airport.findFirst({
        where: { iataCode: arrivalAirport.toUpperCase() },
      }),
    ])

    // Calculate distance if both airports found
    let distance: number | null = null
    let isDomestic = false

    if (departure && arrival) {
      distance = calculateDistance(
        Number(departure.latitude),
        Number(departure.longitude),
        Number(arrival.latitude),
        Number(arrival.longitude)
      )
      isDomestic = departure.country === 'Türkiye' && arrival.country === 'Türkiye'
    } else {
      // Estimate based on common routes
      const turkishAirports = /^(IST|SAW|ESB|AYT|ADB|DLM|BJV|GZT|TZX|VAN|ERZ|DIY|EZS|KYS|SZF|HTY|ASR|KCM|NAV|MQM|VAS|IGD|KSY|ONQ|YEI|TEQ|AOE|BZI|MLX|GNY|SXZ|CKZ|EDO|OGU|DNZ|NOP|KFS|BAL|ISL|MSR|USQ|KZR|AFY|NKT|SIC|BGG|TJK)$/
      isDomestic = turkishAirports.test(departureAirport.toUpperCase()) &&
                   turkishAirports.test(arrivalAirport.toUpperCase())
      distance = isDomestic ? 800 : 2000 // Estimated
    }

    // Get flight delay information from AviationStack API
    const flightDelayInfo: FlightDelayInfo = await getFlightDelayInfo(
      flightNumber,
      departureAirport,
      arrivalAirport,
      dateStr
    )

    const delayMinutes = getEffectiveDelay(flightDelayInfo)
    const isCancelled = flightDelayInfo.isCancelled

    // Calculate compensation
    const { amount, regulation } = calculateCompensation(
      distance || 2000,
      isDomestic,
      delayMinutes,
      isCancelled
    )

    const isEligible = amount > 0
    const reason = formatDelayMessage(delayMinutes, isCancelled, amount)

    const result: EligibilityResult = {
      isEligible,
      compensationAmount: amount,
      currency: 'EUR',
      flightDistance: distance ? Math.round(distance) : null,
      delayMinutes: isCancelled ? null : delayMinutes,
      regulation: isEligible ? regulation : null,
      reason,
      flightInfo: {
        flightNumber: flightDelayInfo.flightNumber,
        flightDate: flightDelayInfo.flightDate,
        departureAirport: departure ? {
          code: departure.iataCode,
          name: departure.name,
          city: departure.city,
        } : {
          code: flightDelayInfo.departureAirport,
          name: flightDelayInfo.departureAirport,
          city: '',
        },
        arrivalAirport: arrival ? {
          code: arrival.iataCode,
          name: arrival.name,
          city: arrival.city,
        } : {
          code: flightDelayInfo.arrivalAirport,
          name: flightDelayInfo.arrivalAirport,
          city: '',
        },
        airline: flightDelayInfo.airline,
        status: flightDelayInfo.status,
        scheduledDeparture: flightDelayInfo.scheduledDeparture,
        actualDeparture: flightDelayInfo.actualDeparture,
        scheduledArrival: flightDelayInfo.scheduledArrival,
        actualArrival: flightDelayInfo.actualArrival,
        isCancelled: flightDelayInfo.isCancelled,
      },
      dataSource: flightDelayInfo.source,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Eligibility check error:', error)
    return NextResponse.json(
      { error: 'Uygunluk kontrolü yapılırken bir hata oluştu' },
      { status: 500 }
    )
  }
}
