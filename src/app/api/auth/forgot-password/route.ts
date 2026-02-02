import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { sendPasswordResetEmail } from '@/lib/services/email'
import { withRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const forgotPasswordSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
})

export async function POST(request: NextRequest) {
  // Rate limit: 3 password reset requests per IP per minute
  const rateLimitResult = await withRateLimit(request, { limit: 3, type: 'auth' })
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Eğer bu email adresi kayıtlıysa, şifre sıfırlama bağlantısı gönderildi.',
      })
    }

    // Generate reset token
    const passwordResetToken = uuidv4()
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken,
        passwordResetExpires,
      },
    })

    // Send password reset email
    try {
      await sendPasswordResetEmail(user.email, user.name || 'Kullanıcı', passwordResetToken)
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError)
      // Still return success to prevent email enumeration
    }

    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}
