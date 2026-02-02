import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createClaimSchema = z.object({
  flightNumber: z.string().min(1, 'Uçuş numarası gerekli'),
  flightDate: z.string().transform(val => new Date(val)),
  departureAirportId: z.string().min(1, 'Kalkış havalimanı gerekli'),
  arrivalAirportId: z.string().min(1, 'Varış havalimanı gerekli'),
  airlineId: z.string().optional(),
  flightType: z.enum(['ONE_WAY', 'ROUND_TRIP', 'MULTI_CITY']).default('ONE_WAY'),
  hasConnection: z.boolean().default(false),
  connectionAirportId: z.string().optional(),
  disruptionType: z.enum(['DELAY', 'CANCELLATION', 'DENIED_BOARDING', 'DOWNGRADE']),
  delayDuration: z.number().optional(),
  flightDistance: z.number().optional(),
  isDomestic: z.boolean().default(false),
  compensationAmount: z.number().min(0),
  description: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createClaimSchema.parse(body)

    // Generate claim number
    const year = new Date().getFullYear()
    const count = await prisma.claim.count()
    const claimNumber = `UCT-${year}-${String(count + 1).padStart(6, '0')}`

    const claim = await prisma.claim.create({
      data: {
        claimNumber,
        userId: session.user.id,
        flightNumber: validatedData.flightNumber,
        flightDate: validatedData.flightDate,
        departureAirportId: validatedData.departureAirportId,
        arrivalAirportId: validatedData.arrivalAirportId,
        airlineId: validatedData.airlineId,
        flightType: validatedData.flightType,
        hasConnection: validatedData.hasConnection,
        connectionAirportId: validatedData.connectionAirportId,
        disruptionType: validatedData.disruptionType,
        delayDuration: validatedData.delayDuration,
        flightDistance: validatedData.flightDistance,
        isDomestic: validatedData.isDomestic,
        compensationAmount: validatedData.compensationAmount,
        description: validatedData.description,
        status: 'DRAFT',
      },
      include: {
        departureAirport: true,
        arrivalAirport: true,
        airline: true,
      },
    })

    return NextResponse.json({
      success: true,
      claim,
      message: 'Talep taslağı oluşturuldu',
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creating claim:', error)
    return NextResponse.json(
      { error: 'Talep oluşturulamadı' },
      { status: 500 }
    )
  }
}
