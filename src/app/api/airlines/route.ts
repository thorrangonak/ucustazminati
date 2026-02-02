import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const airlines = await prisma.airline.findMany({
      where: search ? {
        OR: [
          { iataCode: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ],
        isActive: true,
      } : {
        isActive: true,
      },
      orderBy: { name: 'asc' },
      take: 50,
    })

    return NextResponse.json({ airlines })
  } catch (error) {
    console.error('Error fetching airlines:', error)
    return NextResponse.json(
      { error: 'Havayolları getirilemedi' },
      { status: 500 }
    )
  }
}
