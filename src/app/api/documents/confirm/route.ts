import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getFileUrl } from '@/lib/services/storage'

// POST - Confirm upload completion
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, fileKey } = body

    if (!documentId || !fileKey) {
      return NextResponse.json(
        { error: 'documentId ve fileKey gerekli' },
        { status: 400 }
      )
    }

    // Verify document exists and belongs to user's claim
    const document = await prisma.document.findFirst({
      where: { id: documentId },
      include: {
        claim: {
          select: { userId: true },
        },
      },
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Belge bulunamadı' },
        { status: 404 }
      )
    }

    if (document.claim.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Bu belgeye erişim yetkiniz yok' },
        { status: 403 }
      )
    }

    // Verify fileKey matches
    if (document.fileKey !== fileKey) {
      return NextResponse.json(
        { error: 'Geçersiz fileKey' },
        { status: 400 }
      )
    }

    // Update document with final URL
    const fileUrl = await getFileUrl(fileKey)
    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: {
        fileUrl,
        uploadedAt: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        id: updatedDocument.id,
        fileName: updatedDocument.fileName,
        fileUrl: updatedDocument.fileUrl,
        type: updatedDocument.type,
      },
    })
  } catch (error) {
    console.error('Confirm upload error:', error)
    return NextResponse.json(
      { error: 'Yükleme onaylama hatası' },
      { status: 500 }
    )
  }
}
