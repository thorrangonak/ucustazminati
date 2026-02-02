import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const airlineSchema = z.object({
  name: z.string().min(1, 'Havayolu adı gerekli'),
  iataCode: z.string().length(2, 'IATA kodu 2 karakter olmalı'),
  icaoCode: z.string().length(3, 'ICAO kodu 3 karakter olmalı').optional(),
  country: z.string().optional(),
  logoUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
})

// GET - List all airlines
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const active = searchParams.get('active')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { iataCode: { contains: search, mode: 'insensitive' } },
        { country: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (active === 'true') {
      where.isActive = true
    } else if (active === 'false') {
      where.isActive = false
    }

    const [airlines, total] = await Promise.all([
      prisma.airline.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        include: {
          _count: {
            select: { claims: true },
          },
        },
      }),
      prisma.airline.count({ where }),
    ])

    return NextResponse.json({
      airlines: airlines.map((airline) => ({
        id: airline.id,
        name: airline.name,
        iataCode: airline.iataCode,
        icaoCode: airline.icaoCode,
        country: airline.country,
        logo: airline.logoUrl,
        isActive: airline.isActive,
        claimsCount: airline._count.claims,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Admin airlines list error:', error)
    return NextResponse.json(
      { error: 'Havayolları yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Create new airline
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = airlineSchema.parse(body)

    // Check if IATA code already exists
    const existingAirline = await prisma.airline.findUnique({
      where: { iataCode: validatedData.iataCode.toUpperCase() },
    })

    if (existingAirline) {
      return NextResponse.json(
        { error: 'Bu IATA kodu zaten kullanılıyor' },
        { status: 400 }
      )
    }

    const airline = await prisma.airline.create({
      data: {
        name: validatedData.name,
        iataCode: validatedData.iataCode.toUpperCase(),
        icaoCode: validatedData.icaoCode?.toUpperCase(),
        country: validatedData.country,
        logoUrl: validatedData.logoUrl,
        isActive: validatedData.isActive ?? true,
      },
    })

    return NextResponse.json({ success: true, airline })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Admin airline create error:', error)
    return NextResponse.json(
      { error: 'Havayolu oluşturulurken hata oluştu' },
      { status: 500 }
    )
  }
}

// PATCH - Update airline
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json({ error: 'Havayolu ID gerekli' }, { status: 400 })
    }

    // Check if IATA code is unique (if being changed)
    if (data.iataCode) {
      const existingAirline = await prisma.airline.findFirst({
        where: {
          iataCode: data.iataCode.toUpperCase(),
          NOT: { id },
        },
      })

      if (existingAirline) {
        return NextResponse.json(
          { error: 'Bu IATA kodu zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    const airline = await prisma.airline.update({
      where: { id },
      data: {
        name: data.name,
        iataCode: data.iataCode?.toUpperCase(),
        icaoCode: data.icaoCode?.toUpperCase(),
        country: data.country,
        logoUrl: data.logoUrl,
        isActive: data.isActive,
      },
    })

    return NextResponse.json({ success: true, airline })
  } catch (error) {
    console.error('Admin airline update error:', error)
    return NextResponse.json(
      { error: 'Havayolu güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Delete airline
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Havayolu ID gerekli' }, { status: 400 })
    }

    // Check if airline has claims
    const airline = await prisma.airline.findUnique({
      where: { id },
      include: { _count: { select: { claims: true } } },
    })

    if (!airline) {
      return NextResponse.json({ error: 'Havayolu bulunamadı' }, { status: 404 })
    }

    if (airline._count.claims > 0) {
      return NextResponse.json(
        { error: 'Talepleri olan havayolu silinemez. Önce pasif yapabilirsiniz.' },
        { status: 400 }
      )
    }

    await prisma.airline.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin airline delete error:', error)
    return NextResponse.json(
      { error: 'Havayolu silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
