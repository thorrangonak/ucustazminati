import { NextRequest, NextResponse } from 'next/server'
import { getFlightDelayInfo, getEffectiveDelay } from '@/lib/aviationstack'

/**
 * Flight Lookup API
 *
 * Queries AviationStack API for flight information
 *
 * GET /api/flight-lookup?flightNumber=TK123&date=2024-01-15
 * POST /api/flight-lookup
 *   { flightNumber: "TK123", date: "2024-01-15", departureAirport: "IST", arrivalAirport: "AYT" }
 */

interface FlightLookupResponse {
  success: boolean
  flight: {
    flightNumber: string
    flightDate: string
    departureAirport: string
    arrivalAirport: string
    airline: string
    status: string
    scheduledDeparture: string | null
    actualDeparture: string | null
    scheduledArrival: string | null
    actualArrival: string | null
    delayMinutes: number
    isCancelled: boolean
    isDiverted: boolean
  } | null
  dataSource: 'aviationstack' | 'mock'
  error?: string
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const flightNumber = searchParams.get('flightNumber')
  const date = searchParams.get('date')
  const departureAirport = searchParams.get('departure') || 'XXX'
  const arrivalAirport = searchParams.get('arrival') || 'XXX'

  if (!flightNumber) {
    return NextResponse.json<FlightLookupResponse>(
      {
        success: false,
        flight: null,
        dataSource: 'mock',
        error: 'flightNumber parametresi gerekli'
      },
      { status: 400 }
    )
  }

  const flightDate = date || new Date().toISOString().split('T')[0]

  try {
    const flightInfo = await getFlightDelayInfo(
      flightNumber,
      departureAirport,
      arrivalAirport,
      flightDate
    )

    const delayMinutes = getEffectiveDelay(flightInfo)

    return NextResponse.json<FlightLookupResponse>({
      success: true,
      flight: {
        flightNumber: flightInfo.flightNumber,
        flightDate: flightInfo.flightDate,
        departureAirport: flightInfo.departureAirport,
        arrivalAirport: flightInfo.arrivalAirport,
        airline: flightInfo.airline,
        status: flightInfo.status,
        scheduledDeparture: flightInfo.scheduledDeparture,
        actualDeparture: flightInfo.actualDeparture,
        scheduledArrival: flightInfo.scheduledArrival,
        actualArrival: flightInfo.actualArrival,
        delayMinutes,
        isCancelled: flightInfo.isCancelled,
        isDiverted: flightInfo.isDiverted,
      },
      dataSource: flightInfo.source,
    })
  } catch (error) {
    console.error('Flight lookup error:', error)
    return NextResponse.json<FlightLookupResponse>(
      {
        success: false,
        flight: null,
        dataSource: 'mock',
        error: 'Uçuş bilgisi alınırken bir hata oluştu'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flightNumber, date, departureAirport, arrivalAirport } = body

    if (!flightNumber) {
      return NextResponse.json<FlightLookupResponse>(
        {
          success: false,
          flight: null,
          dataSource: 'mock',
          error: 'flightNumber parametresi gerekli'
        },
        { status: 400 }
      )
    }

    const flightDate = date || new Date().toISOString().split('T')[0]

    const flightInfo = await getFlightDelayInfo(
      flightNumber,
      departureAirport || 'XXX',
      arrivalAirport || 'XXX',
      flightDate
    )

    const delayMinutes = getEffectiveDelay(flightInfo)

    return NextResponse.json<FlightLookupResponse>({
      success: true,
      flight: {
        flightNumber: flightInfo.flightNumber,
        flightDate: flightInfo.flightDate,
        departureAirport: flightInfo.departureAirport,
        arrivalAirport: flightInfo.arrivalAirport,
        airline: flightInfo.airline,
        status: flightInfo.status,
        scheduledDeparture: flightInfo.scheduledDeparture,
        actualDeparture: flightInfo.actualDeparture,
        scheduledArrival: flightInfo.scheduledArrival,
        actualArrival: flightInfo.actualArrival,
        delayMinutes,
        isCancelled: flightInfo.isCancelled,
        isDiverted: flightInfo.isDiverted,
      },
      dataSource: flightInfo.source,
    })
  } catch (error) {
    console.error('Flight lookup error:', error)
    return NextResponse.json<FlightLookupResponse>(
      {
        success: false,
        flight: null,
        dataSource: 'mock',
        error: 'Uçuş bilgisi alınırken bir hata oluştu'
      },
      { status: 500 }
    )
  }
}
