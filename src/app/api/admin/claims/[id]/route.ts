import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { ClaimStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { id } = await params

    const claim = await prisma.claim.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
        passengers: true,
        documents: {
          orderBy: { uploadedAt: 'desc' },
        },
        departureAirport: true,
        arrivalAirport: true,
        airline: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({
      claim: {
        id: claim.id,
        claimNumber: claim.claimNumber,
        status: claim.status,
        flightNumber: claim.flightNumber,
        flightDate: claim.flightDate.toISOString(),
        departureAirport: claim.departureAirport,
        arrivalAirport: claim.arrivalAirport,
        airline: claim.airline,
        disruptionType: claim.disruptionType,
        delayDuration: claim.delayDuration,
        flightDistance: claim.flightDistance,
        compensationAmount: Number(claim.compensationAmount),
        commissionRate: Number(claim.commissionRate),
        netPayoutAmount: Number(claim.netPayoutAmount),
        passengerIban: claim.passengerIban,
        consentSignedAt: claim.consentSignedAt?.toISOString(),
        assignedTo: claim.assignedTo,
        resolvedAt: claim.resolvedAt?.toISOString(),
        createdAt: claim.createdAt.toISOString(),
        updatedAt: claim.updatedAt.toISOString(),
        user: claim.user,
        passengers: claim.passengers,
        documents: claim.documents.map((doc) => ({
          id: doc.id,
          type: doc.type,
          fileName: doc.fileName,
          fileUrl: doc.fileUrl,
          isVerified: doc.isVerified,
          createdAt: doc.uploadedAt.toISOString(),
        })),
        statusHistory: claim.statusHistory.map((h) => ({
          id: h.id,
          fromStatus: h.fromStatus,
          toStatus: h.toStatus,
          note: h.note,
          changedBy: h.changedBy || 'Sistem',
          createdAt: h.createdAt.toISOString(),
        })),
      },
    })
  } catch (error) {
    console.error('Admin claim detail error:', error)
    return NextResponse.json(
      { error: 'Talep detayı alınırken hata oluştu' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, note } = body

    const claim = await prisma.claim.findUnique({
      where: { id },
      select: { status: true },
    })

    if (!claim) {
      return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })
    }

    // Update claim
    const updateData: any = {
      status: status as ClaimStatus,
      assignedTo: session.user?.id,
    }

    if (status === 'APPROVED' || status === 'REJECTED') {
      updateData.resolvedAt = new Date()
    }

    await prisma.$transaction([
      prisma.claim.update({
        where: { id },
        data: updateData,
      }),
      prisma.statusHistory.create({
        data: {
          claimId: id,
          fromStatus: claim.status,
          toStatus: status as ClaimStatus,
          changedBy: session.user?.id,
          note: note || null,
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin claim update error:', error)
    return NextResponse.json(
      { error: 'Talep güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
