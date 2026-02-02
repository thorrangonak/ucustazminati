import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { generateClaimNumber } from '@/lib/utils'
import { withRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const createClaimSchema = z.object({
  departureAirport: z.string().min(1),
  arrivalAirport: z.string().min(1),
  hasConnection: z.boolean().default(false),
  connectionAirport: z.string().optional(),
  flightType: z.enum(['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY']),
  disruptionType: z.enum(['DELAY', 'CANCELLATION', 'DENIED_BOARDING', 'DOWNGRADE']),
  delayDuration: z.number().optional(),
  flightNumber: z.string().min(1),
  flightDate: z.string(),
  airline: z.string().optional(),
  passengers: z.array(z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    isPrimary: z.boolean(),
  })).min(1),
  iban: z.string().optional(),
  signature: z.string().optional(),
  compensationAmount: z.number().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const claims = await prisma.claim.findMany({
      where: { userId: session.user.id },
      include: {
        passengers: true,
        documents: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ claims })
  } catch (error) {
    console.error('Error fetching claims:', error)
    return NextResponse.json(
      { error: 'Talepler getirilemedi' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  // Rate limit: 10 claims per IP per minute
  const rateLimitResult = await withRateLimit(request, { limit: 10, type: 'api' })
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = createClaimSchema.parse(body)

    // Look up airports by IATA code
    const departureAirport = await prisma.airport.findFirst({
      where: {
        OR: [
          { id: validatedData.departureAirport },
          { iataCode: validatedData.departureAirport.toUpperCase() }
        ]
      }
    })

    const arrivalAirport = await prisma.airport.findFirst({
      where: {
        OR: [
          { id: validatedData.arrivalAirport },
          { iataCode: validatedData.arrivalAirport.toUpperCase() }
        ]
      }
    })

    if (!departureAirport || !arrivalAirport) {
      return NextResponse.json(
        { error: 'Havalimanı bulunamadı' },
        { status: 400 }
      )
    }

    // Look up connection airport if provided
    let connectionAirportId = null
    if (validatedData.connectionAirport) {
      const connectionAirport = await prisma.airport.findFirst({
        where: {
          OR: [
            { id: validatedData.connectionAirport },
            { iataCode: validatedData.connectionAirport.toUpperCase() }
          ]
        }
      })
      connectionAirportId = connectionAirport?.id || null
    }

    // Look up airline if provided
    let airlineId = null
    if (validatedData.airline) {
      const airline = await prisma.airline.findFirst({
        where: {
          OR: [
            { id: validatedData.airline },
            { iataCode: validatedData.airline.toUpperCase() }
          ]
        }
      })
      airlineId = airline?.id || null
    }

    // Calculate compensation based on distance (simplified)
    let compensationAmount = validatedData.compensationAmount || 400 // Default

    // Create claim with passengers
    const claim = await prisma.claim.create({
      data: {
        claimNumber: generateClaimNumber(),
        userId: session.user.id,
        flightNumber: validatedData.flightNumber,
        flightDate: new Date(validatedData.flightDate),
        departureAirportId: departureAirport.id,
        arrivalAirportId: arrivalAirport.id,
        airlineId: airlineId,
        flightType: validatedData.flightType,
        hasConnection: validatedData.hasConnection,
        connectionAirportId: connectionAirportId,
        disruptionType: validatedData.disruptionType,
        delayDuration: validatedData.delayDuration,
        compensationAmount: compensationAmount,
        netPayoutAmount: compensationAmount * 0.75, // After 25% commission
        status: 'SUBMITTED',
        consentSignature: validatedData.signature,
        consentSignedAt: validatedData.signature ? new Date() : null,
        passengerIban: validatedData.iban,
        submittedAt: new Date(),
        passengers: {
          create: validatedData.passengers.map((p) => ({
            firstName: p.firstName,
            lastName: p.lastName,
            email: p.email,
            phone: p.phone,
            isPrimary: p.isPrimary,
          })),
        },
        statusHistory: {
          create: {
            fromStatus: null,
            toStatus: 'SUBMITTED',
            changedBy: session.user.id,
            note: 'Talep oluşturuldu',
          },
        },
      },
      include: {
        passengers: true,
        departureAirport: true,
        arrivalAirport: true,
        airline: true,
      },
    })

    return NextResponse.json({
      success: true,
      claim,
      message: 'Talebiniz başarıyla oluşturuldu'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      console.error('Validation error:', fieldErrors)
      return NextResponse.json(
        { error: `Eksik veya hatalı bilgi: ${error.errors[0].message}`, details: fieldErrors },
        { status: 400 }
      )
    }

    console.error('Error creating claim:', error)
    return NextResponse.json(
      { error: 'Talep oluşturulamadı. Lütfen tüm alanları kontrol edin.' },
      { status: 500 }
    )
  }
}
