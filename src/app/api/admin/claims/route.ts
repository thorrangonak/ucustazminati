import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ClaimStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortBy = searchParams.get('sortBy') || 'newest'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { claimNumber: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { flightNumber: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status && status !== 'all') {
      where.status = status as ClaimStatus
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'amount_high':
        orderBy = { compensationAmount: 'desc' }
        break
      case 'amount_low':
        orderBy = { compensationAmount: 'asc' }
        break
    }

    const [claims, total] = await Promise.all([
      prisma.claim.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          user: { select: { id: true, name: true, email: true } },
          departureAirport: { select: { iataCode: true, city: true } },
          arrivalAirport: { select: { iataCode: true, city: true } },
          airline: { select: { name: true, iataCode: true } },
        },
      }),
      prisma.claim.count({ where }),
    ])

    return NextResponse.json({
      claims: claims.map((claim) => ({
        id: claim.id,
        claimNumber: claim.claimNumber,
        userName: claim.user.name || 'İsimsiz',
        userEmail: claim.user.email,
        userId: claim.user.id,
        flightNumber: claim.flightNumber,
        route: `${claim.departureAirport.iataCode} → ${claim.arrivalAirport.iataCode}`,
        flightDate: claim.flightDate.toISOString(),
        disruptionType: claim.disruptionType,
        amount: Number(claim.compensationAmount),
        status: claim.status,
        assignedTo: claim.assignedTo,
        airline: claim.airline?.name || null,
        createdAt: claim.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin claims error:', error)
    return NextResponse.json(
      { error: 'Talepler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const { claimIds, action, note } = body

    if (!claimIds || !Array.isArray(claimIds) || claimIds.length === 0) {
      return NextResponse.json({ error: 'Talep ID gerekli' }, { status: 400 })
    }

    let newStatus: ClaimStatus | null = null

    switch (action) {
      case 'approve':
        newStatus = 'APPROVED'
        break
      case 'reject':
        newStatus = 'REJECTED'
        break
      case 'review':
        newStatus = 'UNDER_REVIEW'
        break
      case 'contact_airline':
        newStatus = 'AIRLINE_CONTACTED'
        break
      case 'request_documents':
        newStatus = 'DOCUMENTS_REQUESTED'
        break
      default:
        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    }

    // Update claims and create status history
    const updatePromises = claimIds.map(async (claimId: string) => {
      const claim = await prisma.claim.findUnique({
        where: { id: claimId },
        select: { status: true },
      })

      if (!claim) return null

      return prisma.$transaction([
        prisma.claim.update({
          where: { id: claimId },
          data: {
            status: newStatus!,
            assignedTo: session.user?.id,
            ...(newStatus === 'APPROVED' || newStatus === 'REJECTED'
              ? { resolvedAt: new Date() }
              : {}),
          },
        }),
        prisma.statusHistory.create({
          data: {
            claimId,
            fromStatus: claim.status,
            toStatus: newStatus!,
            changedBy: session.user?.id,
            note: note || null,
          },
        }),
      ])
    })

    await Promise.all(updatePromises)

    return NextResponse.json({
      success: true,
      message: `${claimIds.length} talep güncellendi`,
    })
  } catch (error) {
    console.error('Admin claims update error:', error)
    return NextResponse.json(
      { error: 'Talepler güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
