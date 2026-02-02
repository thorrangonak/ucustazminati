import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { uploadFile, isAllowedFileType, isAllowedFileSize } from '@/lib/services/storage'

// POST - Upload document
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const claimId = formData.get('claimId') as string | null
    const documentType = formData.get('type') as string | null

    if (!file || !claimId) {
      return NextResponse.json(
        { error: 'Dosya ve talep ID gerekli' },
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
    if (!isAllowedFileType(file.type)) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya tipi. Sadece JPG, PNG, HEIC ve PDF kabul edilir.' },
        { status: 400 }
      )
    }

    // Validate file size
    if (!isAllowedFileSize(file.size)) {
      return NextResponse.json(
        { error: 'Dosya boyutu çok büyük. Maksimum 10MB yüklenebilir.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to S3
    const uploadResult = await uploadFile(buffer, file.name, file.type, claimId)

    // Save to database
    const document = await prisma.document.create({
      data: {
        claimId,
        type: (documentType as 'BOARDING_PASS' | 'TICKET' | 'BOOKING_CONFIRMATION' | 'ID_CARD' | 'PASSPORT' | 'DELAY_CERTIFICATE' | 'CANCELLATION_NOTICE' | 'EXPENSE_RECEIPT' | 'OTHER') || 'OTHER',
        fileName: uploadResult.fileName,
        fileKey: uploadResult.fileKey,
        fileUrl: uploadResult.fileUrl,
        fileSize: uploadResult.fileSize,
        mimeType: uploadResult.mimeType,
      },
    })

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        fileName: document.fileName,
        fileUrl: document.fileUrl,
        type: document.type,
      },
    })
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Dosya yükleme sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}

// GET - Get document download URL
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json(
        { error: 'Belge ID gerekli' },
        { status: 400 }
      )
    }

    // Get document and verify ownership
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

    // Check if user owns the claim or is admin
    const isAdmin = session.user.role === 'ADMIN'
    if (document.claim.userId !== session.user.id && !isAdmin) {
      return NextResponse.json(
        { error: 'Bu belgeye erişim yetkiniz yok' },
        { status: 403 }
      )
    }

    // Return the file URL (use presigned URL for security)
    const { getPresignedUrl } = await import('@/lib/services/storage')
    const downloadUrl = await getPresignedUrl(document.fileKey, 3600) // 1 hour

    return NextResponse.json({
      downloadUrl,
      fileName: document.fileName,
      mimeType: document.mimeType,
    })
  } catch (error) {
    console.error('Document download error:', error)
    return NextResponse.json(
      { error: 'Belge indirme sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}
