import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { UserRole } from '@prisma/client'

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
    const role = searchParams.get('role') || ''
    const sortBy = searchParams.get('sortBy') || 'newest'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role && role !== 'all') {
      where.role = role as UserRole
    }

    // Build orderBy
    let orderBy: any = { createdAt: 'desc' }
    switch (sortBy) {
      case 'oldest':
        orderBy = { createdAt: 'asc' }
        break
      case 'name':
        orderBy = { name: 'asc' }
        break
    }

    const [users, total, totalVerified, totalAdmins, monthlyNew] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { claims: true },
          },
          claims: {
            where: { status: { in: ['APPROVED', 'PAID'] } },
            select: { compensationAmount: true },
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.count({ where: { emailVerified: { not: null } } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ])

    return NextResponse.json({
      users: users.map((user) => ({
        id: user.id,
        name: user.name || 'İsimsiz',
        email: user.email,
        phone: user.phone,
        role: user.role,
        emailVerified: !!user.emailVerified,
        claimsCount: user._count.claims,
        totalAmount: user.claims.reduce(
          (sum, claim) => sum + Number(claim.compensationAmount),
          0
        ),
        createdAt: user.createdAt.toISOString(),
        lastLogin: user.updatedAt.toISOString(),
      })),
      stats: {
        total,
        verified: totalVerified,
        admins: totalAdmins,
        monthlyNew,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Kullanıcılar alınırken hata oluştu' },
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
    const { userId, action } = body

    if (!userId) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 })
    }

    switch (action) {
      case 'make_admin':
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'ADMIN' },
        })
        break
      case 'remove_admin':
        await prisma.user.update({
          where: { id: userId },
          data: { role: 'USER' },
        })
        break
      case 'verify_email':
        await prisma.user.update({
          where: { id: userId },
          data: { emailVerified: new Date() },
        })
        break
      default:
        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin user update error:', error)
    return NextResponse.json(
      { error: 'Kullanıcı güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}
