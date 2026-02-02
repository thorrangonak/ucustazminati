/**
 * Uçuş Veri API Entegrasyonu
 * AviationStack API kullanarak gerçek zamanlı ve geçmiş uçuş verilerini çeker
 */

import axios from 'axios';

// API yanıt tipleri
interface FlightDeparture {
  airport: string;
  timezone: string;
  iata: string;
  icao: string;
  terminal: string | null;
  gate: string | null;
  delay: number | null;
  scheduled: string;
  estimated: string | null;
  actual: string | null;
}

interface FlightArrival {
  airport: string;
  timezone: string;
  iata: string;
  icao: string;
  terminal: string | null;
  gate: string | null;
  baggage: string | null;
  delay: number | null;
  scheduled: string;
  estimated: string | null;
  actual: string | null;
}

interface FlightAirline {
  name: string;
  iata: string;
  icao: string;
}

interface FlightInfo {
  number: string;
  iata: string;
  icao: string;
}

export interface FlightData {
  flight_date: string;
  flight_status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'incident' | 'diverted';
  departure: FlightDeparture;
  arrival: FlightArrival;
  airline: FlightAirline;
  flight: FlightInfo;
}

interface AviationStackResponse {
  pagination: {
    limit: number;
    offset: number;
    count: number;
    total: number;
  };
  data: FlightData[];
  error?: {
    code: string;
    message: string;
  };
}

// API anahtarı environment variable'dan alınır
const getApiKey = (): string | null => {
  return process.env.AVIATIONSTACK_API_KEY || null;
};

/**
 * Uçuş bilgilerini AviationStack API'den çeker
 * @param flightIata - Uçuş IATA kodu (örn: TK1234)
 * @param flightDate - Uçuş tarihi (YYYY-MM-DD formatında)
 */
export async function getFlightInfo(flightIata: string, flightDate: string): Promise<{
  success: boolean;
  data?: FlightData;
  error?: string;
}> {
  const apiKey = getApiKey();
  
  if (!apiKey) {
    // API anahtarı yoksa hata döndür
    return {
      success: false,
      error: 'Uçuş API servisi şu anda kullanılamıyor. Lütfen havalimanlarını manuel olarak seçin.',
    };
  }
  
  try {
    const response = await axios.get<AviationStackResponse>('https://api.aviationstack.com/v1/flights', {
      params: {
        access_key: apiKey,
        flight_iata: flightIata.toUpperCase(),
        flight_date: flightDate,
      },
      timeout: 10000,
    });
    
    if (response.data.error) {
      return {
        success: false,
        error: response.data.error.message,
      };
    }
    
    if (response.data.data && response.data.data.length > 0) {
      return {
        success: true,
        data: response.data.data[0],
      };
    }
    
    return {
      success: false,
      error: 'Uçuş bulunamadı',
    };
  } catch (error: any) {
    console.error('AviationStack API error:', error.message);
    
    // API hatası durumunda hata mesajı döndür
    return {
      success: false,
      error: 'Uçuş bilgisi bulunamadı. Lütfen havalimanlarını manuel olarak seçin.',
    };
  }
}

/**
 * Uçuş gecikme bilgisini analiz eder ve tazminat uygunluğunu belirler
 */
export function analyzeFlightDelay(flightData: FlightData): {
  hasDelay: boolean;
  delayMinutes: number;
  isCancelled: boolean;
  departureAirport: string;
  arrivalAirport: string;
  airlineName: string;
  airlineCode: string;
  flightNumber: string;
  scheduledDeparture: string;
  actualDeparture: string | null;
  scheduledArrival: string;
  actualArrival: string | null;
} {
  const depDelay = flightData.departure.delay || 0;
  const arrDelay = flightData.arrival.delay || 0;
  const totalDelay = Math.max(depDelay, arrDelay);
  
  return {
    hasDelay: totalDelay > 0 || flightData.flight_status === 'cancelled',
    delayMinutes: totalDelay,
    isCancelled: flightData.flight_status === 'cancelled',
    departureAirport: flightData.departure.iata,
    arrivalAirport: flightData.arrival.iata,
    airlineName: flightData.airline.name,
    airlineCode: flightData.airline.iata,
    flightNumber: flightData.flight.iata,
    scheduledDeparture: flightData.departure.scheduled,
    actualDeparture: flightData.departure.actual,
    scheduledArrival: flightData.arrival.scheduled,
    actualArrival: flightData.arrival.actual,
  };
}
