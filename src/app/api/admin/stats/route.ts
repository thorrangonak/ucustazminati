import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    // Get all stats in parallel
    const [
      totalClaims,
      totalUsers,
      claimsByStatus,
      totalCompensation,
      recentClaims,
      monthlyStats,
    ] = await Promise.all([
      // Total claims
      prisma.claim.count(),

      // Total users
      prisma.user.count(),

      // Claims by status
      prisma.claim.groupBy({
        by: ['status'],
        _count: { id: true },
      }),

      // Total compensation (approved + paid claims)
      prisma.claim.aggregate({
        where: {
          status: { in: ['APPROVED', 'PAID'] },
        },
        _sum: { compensationAmount: true },
      }),

      // Recent claims
      prisma.claim.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          departureAirport: { select: { iataCode: true, city: true } },
          arrivalAirport: { select: { iataCode: true, city: true } },
        },
      }),

      // This month's new claims
      prisma.claim.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ])

    // Calculate status counts
    const statusCounts: Record<string, number> = {}
    claimsByStatus.forEach((s) => {
      statusCounts[s.status] = s._count.id
    })

    // Calculate success rate
    const approvedCount = (statusCounts['APPROVED'] || 0) + (statusCounts['PAID'] || 0)
    const rejectedCount = statusCounts['REJECTED'] || 0
    const resolvedTotal = approvedCount + rejectedCount
    const successRate = resolvedTotal > 0 ? ((approvedCount / resolvedTotal) * 100).toFixed(1) : 0

    return NextResponse.json({
      stats: {
        totalClaims,
        totalUsers,
        totalCompensation: totalCompensation._sum.compensationAmount || 0,
        successRate,
        monthlyNewClaims: monthlyStats,
      },
      statusCounts: {
        draft: statusCounts['DRAFT'] || 0,
        submitted: statusCounts['SUBMITTED'] || 0,
        underReview: statusCounts['UNDER_REVIEW'] || 0,
        documentsRequested: statusCounts['DOCUMENTS_REQUESTED'] || 0,
        airlineContacted: statusCounts['AIRLINE_CONTACTED'] || 0,
        approved: statusCounts['APPROVED'] || 0,
        rejected: statusCounts['REJECTED'] || 0,
        paid: statusCounts['PAID'] || 0,
      },
      recentClaims: recentClaims.map((claim) => ({
        id: claim.id,
        claimNumber: claim.claimNumber,
        userName: claim.user.name || claim.user.email,
        route: `${claim.departureAirport.iataCode} → ${claim.arrivalAirport.iataCode}`,
        amount: Number(claim.compensationAmount),
        status: claim.status,
        createdAt: claim.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'İstatistikler alınırken hata oluştu' },
      { status: 500 }
    )
  }
}
