import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { calculateCompensation } from '@/lib/services/compensation'

const calculateSchema = z.object({
  departureAirport: z.string().min(1),
  arrivalAirport: z.string().min(1),
  disruptionType: z.enum(['DELAY', 'CANCELLATION', 'DENIED_BOARDING', 'DOWNGRADE']),
  delayDuration: z.number().optional(),
  isDomestic: z.boolean().optional(),
  distanceKm: z.number().optional(),
})

// Simplified airport coordinates for distance calculation
const airportCoordinates: Record<string, { lat: number; lon: number; country: string }> = {
  IST: { lat: 41.2608, lon: 28.7418, country: 'TR' },
  SAW: { lat: 40.8986, lon: 29.3092, country: 'TR' },
  ESB: { lat: 40.1281, lon: 32.9951, country: 'TR' },
  AYT: { lat: 36.8987, lon: 30.8005, country: 'TR' },
  ADB: { lat: 38.2924, lon: 27.1570, country: 'TR' },
  LHR: { lat: 51.4700, lon: -0.4543, country: 'GB' },
  CDG: { lat: 49.0097, lon: 2.5479, country: 'FR' },
  FRA: { lat: 50.0379, lon: 8.5622, country: 'DE' },
  AMS: { lat: 52.3105, lon: 4.7683, country: 'NL' },
  JFK: { lat: 40.6413, lon: -73.7781, country: 'US' },
  DXB: { lat: 25.2532, lon: 55.3657, country: 'AE' },
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = calculateSchema.parse(body)

    const depCode = validatedData.departureAirport.toUpperCase()
    const arrCode = validatedData.arrivalAirport.toUpperCase()

    const departure = airportCoordinates[depCode]
    const arrival = airportCoordinates[arrCode]

    let distanceKm = validatedData.distanceKm || 0
    let isDomestic = validatedData.isDomestic ?? false

    // Calculate distance if we have coordinates
    if (departure && arrival) {
      distanceKm = calculateDistance(
        departure.lat,
        departure.lon,
        arrival.lat,
        arrival.lon
      )
      isDomestic = departure.country === 'TR' && arrival.country === 'TR'
    }

    const result = calculateCompensation({
      distanceKm,
      isDomestic,
      disruptionType: validatedData.disruptionType,
      delayDuration: validatedData.delayDuration,
    })

    return NextResponse.json({
      ...result,
      distanceKm,
      isDomestic,
      departureAirport: depCode,
      arrivalAirport: arrCode,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error calculating compensation:', error)
    return NextResponse.json(
      { error: 'Tazminat hesaplanamadı' },
      { status: 500 }
    )
  }
}
