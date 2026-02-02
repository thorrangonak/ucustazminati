import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    const airports = await prisma.airport.findMany({
      where: search ? {
        OR: [
          { iataCode: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
        ],
        isActive: true,
      } : {
        isActive: true,
      },
      orderBy: { city: 'asc' },
      take: 50,
    })

    return NextResponse.json({ airports })
  } catch (error) {
    console.error('Error fetching airports:', error)
    return NextResponse.json(
      { error: 'Havalimanları getirilemedi' },
      { status: 500 }
    )
  }
}
