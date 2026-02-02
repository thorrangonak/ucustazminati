import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

interface ClaimParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: ClaimParams) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz erisim' }, { status: 401 })
    }

    const { id } = await params

    const claim = await prisma.claim.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        passengers: true,
        documents: true,
        departureAirport: true,
        arrivalAirport: true,
        airline: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Talep bulunamadi' }, { status: 404 })
    }

    // Convert Decimal fields to numbers for JSON serialization
    const serializedClaim = {
      ...claim,
      compensationAmount: claim.compensationAmount ? Number(claim.compensationAmount) : null,
      netPayoutAmount: claim.netPayoutAmount ? Number(claim.netPayoutAmount) : null,
      commissionRate: claim.commissionRate ? Number(claim.commissionRate) : null,
    }

    return NextResponse.json({ claim: serializedClaim })
  } catch (error) {
    console.error('Error fetching claim:', error)
    return NextResponse.json(
      { error: 'Talep getirilemedi' },
      { status: 500 }
    )
  }
}
