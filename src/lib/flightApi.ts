interface FlightStatus {
  scheduledDeparture: string
  actualDeparture?: string
  scheduledArrival: string
  actualArrival?: string
  status: 'ontime' | 'delayed' | 'cancelled' | 'diverted'
  delayMinutes?: number
}

interface FlightInfo {
  flightNumber: string
  departureAirport: string
  arrivalAirport: string
  date: string
  airline: string
  status: FlightStatus
}

export async function getFlightStatus(
  flightNumber: string,
  departureAirport: string,
  arrivalAirport: string,
  date: string
): Promise<FlightInfo | null> {
  try {
    const apiKey = process.env.AVIATIONSTACK_API_KEY || 'demo'
    
    const response = await fetch(
      `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_number=${flightNumber}&dep_iata=${departureAirport}&arr_iata=${arrivalAirport}&flight_date=${date}`
    )

    if (!response.ok) {
      return mockFlightStatus(flightNumber, departureAirport, arrivalAirport, date)
    }

    const data = await response.json()
    
    if (!data.data || data.data.length === 0) {
      return mockFlightStatus(flightNumber, departureAirport, arrivalAirport, date)
    }

    const flight = data.data[0]
    
    return {
      flightNumber: flight.flight.number,
      departureAirport: flight.departure.iata,
      arrivalAirport: flight.arrival.iata,
      date: flight.flight_date,
      airline: flight.airline.name,
      status: {
        scheduledDeparture: flight.departure.scheduled,
        actualDeparture: flight.departure.actual,
        scheduledArrival: flight.arrival.scheduled,
        actualArrival: flight.arrival.actual,
        status: flight.flight_status as any,
        delayMinutes: flight.departure.delay || flight.arrival.delay
      }
    }
  } catch (error) {
    return mockFlightStatus(flightNumber, departureAirport, arrivalAirport, date)
  }
}

function mockFlightStatus(
  flightNumber: string,
  departureAirport: string,
  arrivalAirport: string,
  date: string
): FlightInfo {
  const statuses: Array<'ontime' | 'delayed' | 'cancelled'> = ['ontime', 'delayed', 'cancelled']
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
  const randomDelay = randomStatus === 'delayed' ? Math.floor(Math.random() * 240) + 60 : 0

  return {
    flightNumber,
    departureAirport,
    arrivalAirport,
    date,
    airline: 'Demo Airlines',
    status: {
      scheduledDeparture: '14:00',
      actualDeparture: randomStatus === 'cancelled' ? undefined : '15:30',
      scheduledArrival: '16:30',
      actualArrival: randomStatus === 'cancelled' ? undefined : '18:00',
      status: randomStatus,
      delayMinutes: randomDelay
    }
  }
}

export function calculateCompensationEU261(
  flightInfo: FlightInfo,
  issueType: string
): { eligible: boolean; amount: number; reason: string } {
  const { status } = flightInfo
  const { status: flightStatus, delayMinutes } = status

  if (flightStatus === 'cancelled') {
    return {
      eligible: true,
      amount: 600,
      reason: 'Uçuş iptal edildiği için tazminat hakkınız bulunmaktadır.'
    }
  }

  if (flightStatus === 'delayed' && delayMinutes) {
    if (delayMinutes >= 180) {
      return {
        eligible: true,
        amount: 600,
        reason: '3 saatten fazla gecikme yaşandığı için tazminat hakkınız bulunmaktadır.'
      }
    }
  }

  return {
    eligible: false,
    amount: 0,
    reason: 'Tazminat haklarınız için yaşanan gecikme süresi yetersizdir.'
  }
}
