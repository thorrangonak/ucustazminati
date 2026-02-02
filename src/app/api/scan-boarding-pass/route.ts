import { NextRequest, NextResponse } from 'next/server'
import Tesseract from 'tesseract.js'

interface ScannedFlightData {
  flightNumber: string | null
  departureAirport: string | null
  arrivalAirport: string | null
  flightDate: string | null
  passengerName: string | null
  airline: string | null
  rawText: string
  confidence: number
}

// Known Turkish airlines prefixes
const AIRLINE_PREFIXES: Record<string, string> = {
  'TK': 'Turkish Airlines',
  'PC': 'Pegasus Airlines',
  'XQ': 'SunExpress',
  'XC': 'Corendon Airlines',
  'AJ': 'AnadoluJet',
  'VF': 'AnadoluJet',
  'KK': 'AtlasGlobal',
  'YK': 'Freebird Airlines',
  'BZ': 'BlueBird Airways',
  'LH': 'Lufthansa',
  'BA': 'British Airways',
  'AF': 'Air France',
  'KL': 'KLM',
  'EK': 'Emirates',
  'QR': 'Qatar Airways',
  'EY': 'Etihad Airways',
}

// Known airport codes
const AIRPORT_CODES = [
  'IST', 'SAW', 'ESB', 'AYT', 'ADB', 'DLM', 'BJV', 'GZT', 'TZX', 'VAN',
  'ERZ', 'DIY', 'EZS', 'KYS', 'SZF', 'HTY', 'ASR', 'KCM', 'NAV', 'MQM',
  'VAS', 'IGD', 'KSY', 'ONQ', 'YEI', 'TEQ', 'AOE', 'BZI', 'MLX', 'GNY',
  'SXZ', 'CKZ', 'EDO', 'OGU', 'DNZ', 'NOP', 'KFS', 'BAL', 'ISL', 'MSR',
  'USQ', 'KZR', 'AFY', 'NKT', 'SIC', 'BGG', 'TJK', 'RIY', 'ADY', 'BDM',
  // Major international airports
  'LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'BCN', 'FCO', 'MUC', 'ZRH', 'VIE',
  'BRU', 'DUB', 'LIS', 'ATH', 'OSL', 'CPH', 'ARN', 'HEL', 'WAW', 'PRG',
  'BUD', 'SVO', 'DME', 'LED', 'DXB', 'DOH', 'AUH', 'JFK', 'LAX', 'ORD',
  'JED', 'RUH', 'CAI', 'CMN', 'TUN', 'ALG', 'KWI', 'BAH', 'MCT', 'AMM'
]

function extractFlightNumber(text: string): string | null {
  // Match patterns like: TK1234, TK 1234, PC123, LH456
  const patterns = [
    /\b([A-Z]{2})\s*(\d{1,4})\b/g,
    /\bFLIGHT\s*[:#]?\s*([A-Z]{2})\s*(\d{1,4})\b/gi,
    /\bUCUS\s*[:#]?\s*([A-Z]{2})\s*(\d{1,4})\b/gi,
    /\bFLT\s*[:#]?\s*([A-Z]{2})\s*(\d{1,4})\b/gi,
  ]

  for (const pattern of patterns) {
    const matches = text.matchAll(pattern)
    for (const match of matches) {
      const code = match[1].toUpperCase()
      const number = match[2]
      if (AIRLINE_PREFIXES[code] || code.length === 2) {
        return `${code}${number}`
      }
    }
  }

  return null
}

function extractAirports(text: string): { departure: string | null; arrival: string | null } {
  const foundAirports: string[] = []
  const upperText = text.toUpperCase()

  for (const code of AIRPORT_CODES) {
    const pattern = new RegExp(`\\b${code}\\b`, 'g')
    if (pattern.test(upperText)) {
      if (!foundAirports.includes(code)) {
        foundAirports.push(code)
      }
    }
  }

  // Try to detect departure/arrival from context
  let departure: string | null = null
  let arrival: string | null = null

  // Look for FROM/TO patterns
  const fromMatch = upperText.match(/(?:FROM|KALKIS|DEP|DEPARTURE)[:\s]*([A-Z]{3})\b/)
  const toMatch = upperText.match(/(?:TO|VARIS|ARR|ARRIVAL|DEST)[:\s]*([A-Z]{3})\b/)

  if (fromMatch && AIRPORT_CODES.includes(fromMatch[1])) {
    departure = fromMatch[1]
  }
  if (toMatch && AIRPORT_CODES.includes(toMatch[1])) {
    arrival = toMatch[1]
  }

  // If not found, use first two airports in order
  if (!departure && foundAirports.length > 0) {
    departure = foundAirports[0]
  }
  if (!arrival && foundAirports.length > 1) {
    arrival = foundAirports[1]
  }

  return { departure, arrival }
}

function extractDate(text: string): string | null {
  // Common date patterns
  const patterns = [
    // DD/MM/YYYY or DD-MM-YYYY
    /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](20\d{2})\b/,
    // YYYY-MM-DD
    /\b(20\d{2})[\/\-](\d{1,2})[\/\-](\d{1,2})\b/,
    // DD MON YYYY (e.g., 15 JAN 2024)
    /\b(\d{1,2})\s*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*\s*(20\d{2})\b/i,
    // DDMONYYY (e.g., 15JAN24)
    /\b(\d{2})(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)(\d{2})\b/i,
  ]

  const monthMap: Record<string, string> = {
    'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
    'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
    'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12',
  }

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      // Try to normalize to YYYY-MM-DD format
      if (pattern === patterns[1]) {
        // YYYY-MM-DD
        return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
      } else if (pattern === patterns[2]) {
        // DD MON YYYY
        const month = monthMap[match[2].toUpperCase()]
        return `${match[3]}-${month}-${match[1].padStart(2, '0')}`
      } else if (pattern === patterns[3]) {
        // DDMONYY
        const month = monthMap[match[2].toUpperCase()]
        const year = `20${match[3]}`
        return `${year}-${month}-${match[1]}`
      } else {
        // DD/MM/YYYY
        return `${match[3]}-${match[2].padStart(2, '0')}-${match[1].padStart(2, '0')}`
      }
    }
  }

  return null
}

function extractPassengerName(text: string): string | null {
  // Look for name patterns
  const patterns = [
    /(?:NAME|PASSENGER|YOLCU|NAME OF PASSENGER)[:\s]*([A-Z]+[\s\/]+[A-Z]+)/i,
    /(?:MR|MRS|MS|MISS)[.\s]+([A-Z]+[\s\/]+[A-Z]+)/i,
    // Pattern for uppercase names separated by /
    /\b([A-Z]{2,})\s*\/\s*([A-Z]{2,})\b/,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      if (match[2]) {
        return `${match[1]} ${match[2]}`.replace('/', ' ').trim()
      }
      return match[1].replace('/', ' ').trim()
    }
  }

  return null
}

function detectAirline(flightNumber: string | null): string | null {
  if (!flightNumber) return null

  const prefix = flightNumber.substring(0, 2).toUpperCase()
  return AIRLINE_PREFIXES[prefix] || null
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Görüntü dosyası gerekli' },
        { status: 400 }
      )
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Process with Tesseract OCR
    const result = await Tesseract.recognize(
      dataUrl,
      'eng+tur', // English and Turkish
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        },
      }
    )

    const rawText = result.data.text
    const confidence = result.data.confidence

    console.log('OCR Raw Text:', rawText)
    console.log('OCR Confidence:', confidence)

    // Extract flight information
    const flightNumber = extractFlightNumber(rawText)
    const { departure, arrival } = extractAirports(rawText)
    const flightDate = extractDate(rawText)
    const passengerName = extractPassengerName(rawText)
    const airline = detectAirline(flightNumber)

    const scannedData: ScannedFlightData = {
      flightNumber,
      departureAirport: departure,
      arrivalAirport: arrival,
      flightDate,
      passengerName,
      airline,
      rawText: rawText.substring(0, 500), // Limit raw text length
      confidence,
    }

    return NextResponse.json({
      success: true,
      data: scannedData,
    })
  } catch (error) {
    console.error('OCR Error:', error)
    return NextResponse.json(
      { error: 'Görüntü işlenirken bir hata oluştu' },
      { status: 500 }
    )
  }
}
