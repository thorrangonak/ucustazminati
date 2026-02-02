/**
 * AviationStack API Integration
 * https://aviationstack.com/documentation
 */

import { getSettingOrEnv } from '@/lib/services/settings'

const AVIATIONSTACK_BASE_URL = 'http://api.aviationstack.com/v1'

export interface AviationStackFlight {
  flight_date: string
  flight_status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'incident' | 'diverted'
  departure: {
    airport: string
    timezone: string
    iata: string
    icao: string
    terminal: string | null
    gate: string | null
    delay: number | null
    scheduled: string
    estimated: string | null
    actual: string | null
    estimated_runway: string | null
    actual_runway: string | null
  }
  arrival: {
    airport: string
    timezone: string
    iata: string
    icao: string
    terminal: string | null
    gate: string | null
    baggage: string | null
    delay: number | null
    scheduled: string
    estimated: string | null
    actual: string | null
    estimated_runway: string | null
    actual_runway: string | null
  }
  airline: {
    name: string
    iata: string
    icao: string
  }
  flight: {
    number: string
    iata: string
    icao: string
    codeshared: {
      airline_name: string
      airline_iata: string
      airline_icao: string
      flight_number: string
      flight_iata: string
      flight_icao: string
    } | null
  }
  aircraft: {
    registration: string
    iata: string
    icao: string
    icao24: string
  } | null
  live: {
    updated: string
    latitude: number
    longitude: number
    altitude: number
    direction: number
    speed_horizontal: number
    speed_vertical: number
    is_ground: boolean
  } | null
}

interface AviationStackResponse {
  pagination: {
    limit: number
    offset: number
    count: number
    total: number
  }
  data: AviationStackFlight[]
}

interface AviationStackError {
  error: {
    code: string
    message: string
    context?: Record<string, unknown>
  }
}

export interface FlightDelayInfo {
  flightNumber: string
  flightDate: string
  departureAirport: string
  arrivalAirport: string
  airline: string
  status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'incident' | 'diverted' | 'unknown'
  scheduledDeparture: string | null
  actualDeparture: string | null
  scheduledArrival: string | null
  actualArrival: string | null
  departureDelay: number | null // in minutes
  arrivalDelay: number | null // in minutes
  isCancelled: boolean
  isDiverted: boolean
  source: 'aviationstack' | 'mock'
}

// Simple in-memory cache
const flightCache = new Map<string, { data: FlightDelayInfo; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(flightNumber: string, flightDate: string): string {
  return `${flightNumber.toUpperCase()}-${flightDate}`
}

function getFromCache(flightNumber: string, flightDate: string): FlightDelayInfo | null {
  const key = getCacheKey(flightNumber, flightDate)
  const cached = flightCache.get(key)

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  flightCache.delete(key)
  return null
}

function setCache(flightNumber: string, flightDate: string, data: FlightDelayInfo): void {
  const key = getCacheKey(flightNumber, flightDate)
  flightCache.set(key, { data, timestamp: Date.now() })
}

/**
 * Fetch flight information from AviationStack API
 */
export async function getFlightFromAviationStack(
  flightNumber: string,
  flightDate?: string
): Promise<FlightDelayInfo | null> {
  // Get API key from settings or environment variable
  const apiKey = await getSettingOrEnv('AVIATIONSTACK_API_KEY')

  if (!apiKey || apiKey === 'demo') {
    console.log('AviationStack API key not configured, using mock data')
    return null
  }

  // Check cache first
  const dateStr = flightDate || new Date().toISOString().split('T')[0]
  const cached = getFromCache(flightNumber, dateStr)
  if (cached) {
    return cached
  }

  try {
    // Parse flight number (e.g., TK1234 -> airline: TK, flight_number: 1234)
    const airlineCode = flightNumber.substring(0, 2).toUpperCase()
    const flightNum = flightNumber.substring(2).replace(/^0+/, '') // Remove leading zeros

    // Build query parameters
    const params = new URLSearchParams({
      access_key: apiKey,
      airline_iata: airlineCode,
      flight_number: flightNum,
    })

    // Add date filter if provided
    if (flightDate) {
      params.append('flight_date', flightDate)
    }

    const url = `${AVIATIONSTACK_BASE_URL}/flights?${params.toString()}`
    console.log('Fetching flight data from AviationStack:', url.replace(apiKey, '***'))

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('AviationStack API error:', response.status, response.statusText)
      return null
    }

    const data = await response.json() as AviationStackResponse | AviationStackError

    // Check for API error
    if ('error' in data) {
      console.error('AviationStack API error:', data.error.message)
      return null
    }

    // Check if we got results
    if (!data.data || data.data.length === 0) {
      console.log('No flight data found for', flightNumber)
      return null
    }

    // Get the most relevant flight (first one if date matches)
    const flight = data.data.find(f => f.flight_date === flightDate) || data.data[0]

    const result: FlightDelayInfo = {
      flightNumber: flight.flight.iata || flightNumber,
      flightDate: flight.flight_date,
      departureAirport: flight.departure.iata,
      arrivalAirport: flight.arrival.iata,
      airline: flight.airline.name,
      status: flight.flight_status || 'unknown',
      scheduledDeparture: flight.departure.scheduled,
      actualDeparture: flight.departure.actual,
      scheduledArrival: flight.arrival.scheduled,
      actualArrival: flight.arrival.actual,
      departureDelay: flight.departure.delay,
      arrivalDelay: flight.arrival.delay,
      isCancelled: flight.flight_status === 'cancelled',
      isDiverted: flight.flight_status === 'diverted',
      source: 'aviationstack',
    }

    // Cache the result
    setCache(flightNumber, dateStr, result)

    return result
  } catch (error) {
    console.error('Error fetching flight data from AviationStack:', error)
    return null
  }
}

/**
 * Fetch historical flight data (for past dates)
 * Note: Historical data requires a paid AviationStack plan
 */
export async function getHistoricalFlight(
  flightNumber: string,
  flightDate: string
): Promise<FlightDelayInfo | null> {
  const apiKey = await getSettingOrEnv('AVIATIONSTACK_API_KEY')

  if (!apiKey || apiKey === 'demo') {
    return null
  }

  // Check cache first
  const cached = getFromCache(flightNumber, flightDate)
  if (cached) {
    return cached
  }

  try {
    const airlineCode = flightNumber.substring(0, 2).toUpperCase()
    const flightNum = flightNumber.substring(2).replace(/^0+/, '')

    const params = new URLSearchParams({
      access_key: apiKey,
      airline_iata: airlineCode,
      flight_number: flightNum,
      flight_date: flightDate,
    })

    // Historical endpoint (may require paid plan)
    const url = `${AVIATIONSTACK_BASE_URL}/flights?${params.toString()}`

    const response = await fetch(url)

    if (!response.ok) {
      return null
    }

    const data = await response.json() as AviationStackResponse | AviationStackError

    if ('error' in data || !data.data || data.data.length === 0) {
      return null
    }

    const flight = data.data[0]

    const result: FlightDelayInfo = {
      flightNumber: flight.flight.iata || flightNumber,
      flightDate: flight.flight_date,
      departureAirport: flight.departure.iata,
      arrivalAirport: flight.arrival.iata,
      airline: flight.airline.name,
      status: flight.flight_status || 'unknown',
      scheduledDeparture: flight.departure.scheduled,
      actualDeparture: flight.departure.actual,
      scheduledArrival: flight.arrival.scheduled,
      actualArrival: flight.arrival.actual,
      departureDelay: flight.departure.delay,
      arrivalDelay: flight.arrival.delay,
      isCancelled: flight.flight_status === 'cancelled',
      isDiverted: flight.flight_status === 'diverted',
      source: 'aviationstack',
    }

    setCache(flightNumber, flightDate, result)

    return result
  } catch (error) {
    console.error('Error fetching historical flight data:', error)
    return null
  }
}

/**
 * Calculate delay in minutes between scheduled and actual times
 */
export function calculateDelayMinutes(
  scheduledTime: string | null,
  actualTime: string | null
): number | null {
  if (!scheduledTime || !actualTime) {
    return null
  }

  try {
    const scheduled = new Date(scheduledTime)
    const actual = new Date(actualTime)
    const diffMs = actual.getTime() - scheduled.getTime()
    return Math.round(diffMs / (1000 * 60))
  } catch {
    return null
  }
}

/**
 * Get the effective delay (prefer arrival delay, fallback to departure delay)
 */
export function getEffectiveDelay(flightInfo: FlightDelayInfo): number {
  // If cancelled, treat as maximum delay
  if (flightInfo.isCancelled) {
    return 999 // Indicates cancellation
  }

  // Prefer arrival delay as it's what matters for compensation
  if (flightInfo.arrivalDelay !== null && flightInfo.arrivalDelay > 0) {
    return flightInfo.arrivalDelay
  }

  // Fallback to departure delay
  if (flightInfo.departureDelay !== null && flightInfo.departureDelay > 0) {
    return flightInfo.departureDelay
  }

  // Calculate from actual times if API didn't provide delay
  const calculatedArrivalDelay = calculateDelayMinutes(
    flightInfo.scheduledArrival,
    flightInfo.actualArrival
  )

  if (calculatedArrivalDelay !== null && calculatedArrivalDelay > 0) {
    return calculatedArrivalDelay
  }

  const calculatedDepartureDelay = calculateDelayMinutes(
    flightInfo.scheduledDeparture,
    flightInfo.actualDeparture
  )

  if (calculatedDepartureDelay !== null && calculatedDepartureDelay > 0) {
    return calculatedDepartureDelay
  }

  return 0
}

/**
 * Generate mock flight data for testing/demo purposes
 */
export function generateMockFlightData(
  flightNumber: string,
  departureAirport: string,
  arrivalAirport: string,
  flightDate: string
): FlightDelayInfo {
  // Airline names mapping
  const airlineNames: Record<string, string> = {
    'TK': 'Turkish Airlines',
    'PC': 'Pegasus Airlines',
    'XQ': 'SunExpress',
    'XC': 'Corendon Airlines',
    'AJ': 'AnadoluJet',
    'VF': 'AnadoluJet',
    'LH': 'Lufthansa',
    'BA': 'British Airways',
    'AF': 'Air France',
    'EK': 'Emirates',
  }

  const airlineCode = flightNumber.substring(0, 2).toUpperCase()
  const airline = airlineNames[airlineCode] || `${airlineCode} Airlines`

  // Generate realistic mock delays
  // 40% on-time, 35% minor delay, 20% significant delay, 5% cancelled
  const rand = Math.random()
  let delay = 0
  let status: FlightDelayInfo['status'] = 'landed'
  let isCancelled = false

  if (rand < 0.05) {
    // Cancelled
    status = 'cancelled'
    isCancelled = true
    delay = 999
  } else if (rand < 0.25) {
    // Significant delay (180+ minutes)
    delay = Math.floor(Math.random() * 180) + 180 // 180-360 minutes
  } else if (rand < 0.60) {
    // Minor delay (30-180 minutes)
    delay = Math.floor(Math.random() * 150) + 30 // 30-180 minutes
  } else {
    // On time or very minor delay (0-30 minutes)
    delay = Math.floor(Math.random() * 30)
  }

  // Generate scheduled times
  const baseHour = 8 + Math.floor(Math.random() * 12) // 8:00 - 20:00
  const scheduledDep = `${flightDate}T${baseHour.toString().padStart(2, '0')}:00:00+03:00`
  const flightDuration = 60 + Math.floor(Math.random() * 120) // 1-3 hours flight
  const scheduledArrHour = baseHour + Math.floor(flightDuration / 60)
  const scheduledArr = `${flightDate}T${scheduledArrHour.toString().padStart(2, '0')}:${(flightDuration % 60).toString().padStart(2, '0')}:00+03:00`

  // Calculate actual times based on delay
  const actualDep = isCancelled ? null : new Date(new Date(scheduledDep).getTime() + delay * 60000).toISOString()
  const actualArr = isCancelled ? null : new Date(new Date(scheduledArr).getTime() + delay * 60000).toISOString()

  return {
    flightNumber: flightNumber.toUpperCase(),
    flightDate,
    departureAirport: departureAirport.toUpperCase(),
    arrivalAirport: arrivalAirport.toUpperCase(),
    airline,
    status,
    scheduledDeparture: scheduledDep,
    actualDeparture: actualDep,
    scheduledArrival: scheduledArr,
    actualArrival: actualArr,
    departureDelay: isCancelled ? null : delay,
    arrivalDelay: isCancelled ? null : delay,
    isCancelled,
    isDiverted: false,
    source: 'mock',
  }
}

/**
 * Main function to get flight delay information
 * Tries AviationStack API first, falls back to mock data
 */
export async function getFlightDelayInfo(
  flightNumber: string,
  departureAirport: string,
  arrivalAirport: string,
  flightDate: string
): Promise<FlightDelayInfo> {
  // Try to get real data from AviationStack
  const apiData = await getFlightFromAviationStack(flightNumber, flightDate)

  if (apiData) {
    return apiData
  }

  // Try historical data for past dates
  const today = new Date().toISOString().split('T')[0]
  if (flightDate < today) {
    const historicalData = await getHistoricalFlight(flightNumber, flightDate)
    if (historicalData) {
      return historicalData
    }
  }

  // Fall back to mock data
  console.log('Using mock flight data for', flightNumber, flightDate)
  return generateMockFlightData(flightNumber, departureAirport, arrivalAirport, flightDate)
}
