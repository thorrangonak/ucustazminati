import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getUploadPresignedUrl, isAllowedFileType } from '@/lib/services/storage'

// POST - Get presigned URL for direct upload
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { claimId, fileName, mimeType, fileSize, documentType } = body

    if (!claimId || !fileName || !mimeType) {
      return NextResponse.json(
        { error: 'claimId, fileName ve mimeType gerekli' },
        { status: 400 }
      )
    }

    // Verify claim belongs to user
    const claim = await prisma.claim.findFirst({
      where: {
        id: claimId,
        userId: session.user.id,
      },
    })

    if (!claim) {
      return NextResponse.json(
        { error: 'Talep bulunamadı' },
        { status: 404 }
      )
    }

    // Validate file type
    if (!isAllowedFileType(mimeType)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya tipi' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    if (fileSize && fileSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük. Maksimum 10MB.' },
        { status: 400 }
      )
    }

    // Get presigned URL
    const { uploadUrl, fileKey } = await getUploadPresignedUrl(claimId, fileName, mimeType)

    // Create pending document record
    const document = await prisma.document.create({
      data: {
        claimId,
        type: documentType || 'OTHER',
        fileName,
        fileKey,
        fileUrl: '', // Will be updated after upload
        fileSize: fileSize || 0,
        mimeType,
        isVerified: false,
      },
    })

    return NextResponse.json({
      uploadUrl,
      fileKey,
      documentId: document.id,
    })
  } catch (error) {
    console.error('Presign URL error:', error)
    return NextResponse.json(
      { error: 'Presigned URL oluşturma hatası' },
      { status: 500 }
    )
  }
}
