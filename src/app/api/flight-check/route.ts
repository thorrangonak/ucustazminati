import { NextRequest, NextResponse } from 'next/server'
import { getFlightStatus, calculateCompensationEU261 } from '@/lib/flightApi'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { flightNumber, departureAirport, arrivalAirport, flightDate, issueType, email } = body

    if (!flightNumber || !departureAirport || !arrivalAirport || !flightDate || !issueType || !email) {
      return NextResponse.json(
        { error: 'Tüm alanlar zorunludur' },
        { status: 400 }
      )
    }

    const flightInfo = await getFlightStatus(
      flightNumber,
      departureAirport,
      arrivalAirport,
      flightDate
    )

    if (!flightInfo) {
      return NextResponse.json(
        { error: 'Uçuş bilgileri bulunamadı' },
        { status: 404 }
      )
    }

    const compensationResult = calculateCompensationEU261(flightInfo, issueType)

    const response = {
      eligible: compensationResult.eligible,
      estimatedCompensation: compensationResult.amount,
      reason: compensationResult.reason,
      flightDetails: {
        flightNumber: flightInfo.flightNumber,
        departureAirport: flightInfo.departureAirport,
        arrivalAirport: flightInfo.arrivalAirport,
        date: flightInfo.date,
        airline: flightInfo.airline,
        status: flightInfo.status.status,
        delayMinutes: flightInfo.status.delayMinutes
      },
      nextSteps: compensationResult.eligible ? [
        'Uçuş bilgileriniz doğrulandı',
        'Havayolu ile iletişime geçilecek',
        'Tazminat talebi oluşturulacak'
      ] : ['Bu uçuş için tazminat hakkınız bulunmamaktadır.']
    }

    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
