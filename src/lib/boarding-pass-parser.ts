import { decode } from 'bcbp'

export interface ParsedBoardingPass {
  passengerName: string | null
  pnr: string | null
  departureAirport: string | null
  arrivalAirport: string | null
  airline: string | null
  flightNumber: string | null
  flightDate: string | null // ISO date string
  seatNumber: string | null
  compartment: string | null
  sequenceNumber: string | null
  rawData: string
}

// Airline code to name mapping
const AIRLINE_NAMES: Record<string, string> = {
  'TK': 'Turkish Airlines',
  'PC': 'Pegasus Airlines',
  'XQ': 'SunExpress',
  'XC': 'Corendon Airlines',
  'AJ': 'AnadoluJet',
  'VF': 'AnadoluJet',
  'LH': 'Lufthansa',
  'BA': 'British Airways',
  'AF': 'Air France',
  'KL': 'KLM',
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'EY': 'Etihad Airways',
  'AC': 'Air Canada',
  'UA': 'United Airlines',
  'AA': 'American Airlines',
  'DL': 'Delta Air Lines',
}

export function parseBoardingPassBarcode(barcodeData: string): ParsedBoardingPass {
  try {
    const decoded = decode(barcodeData)

    if (!decoded || !decoded.data) {
      throw new Error('Invalid BCBP data')
    }

    const data = decoded.data
    const firstLeg = data.legs?.[0]

    // Get airline code and flight number
    const airlineCode = firstLeg?.operatingCarrierDesignator || firstLeg?.marketingCarrierDesignator || null
    const flightNum = firstLeg?.flightNumber || null

    // Parse date - bcbp returns Date object
    let flightDate: string | null = null
    if (firstLeg?.flightDate) {
      // flightDate is a Date object
      const date = firstLeg.flightDate
      if (date instanceof Date && !isNaN(date.getTime())) {
        flightDate = date.toISOString().split('T')[0]
      }
    }

    return {
      passengerName: data.passengerName || null,
      pnr: firstLeg?.operatingCarrierPNR || null,
      departureAirport: firstLeg?.departureAirport || null,
      arrivalAirport: firstLeg?.arrivalAirport || null,
      airline: airlineCode ? (AIRLINE_NAMES[airlineCode] || airlineCode) : null,
      flightNumber: airlineCode && flightNum ? `${airlineCode}${flightNum}` : null,
      flightDate,
      seatNumber: firstLeg?.seatNumber || null,
      compartment: firstLeg?.compartmentCode || null,
      sequenceNumber: firstLeg?.checkInSequenceNumber || null,
      rawData: barcodeData,
    }
  } catch (error) {
    console.error('Error parsing boarding pass:', error)

    // Return empty result with raw data for debugging
    return {
      passengerName: null,
      pnr: null,
      departureAirport: null,
      arrivalAirport: null,
      airline: null,
      flightNumber: null,
      flightDate: null,
      seatNumber: null,
      compartment: null,
      sequenceNumber: null,
      rawData: barcodeData,
    }
  }
}

// Validate if string looks like BCBP data
export function isBCBPData(data: string): boolean {
  // BCBP data typically starts with 'M1' (single leg) or 'M2', 'M3', etc.
  return /^M\d/.test(data) && data.length >= 60
}
