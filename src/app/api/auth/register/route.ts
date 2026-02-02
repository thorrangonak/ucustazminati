import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { sendVerificationEmail } from '@/lib/services/email'
import { withRateLimit, rateLimitResponse } from '@/lib/rate-limit'

const registerSchema = z.object({
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  phone: z.string().optional(),
})

export async function POST(request: NextRequest) {
  // Rate limit: 5 registrations per IP per minute
  const rateLimitResult = await withRateLimit(request, { limit: 5, type: 'auth' })
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult)
  }

  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kayıtlı' },
        { status: 400 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12)

    // Generate verification token
    const emailVerificationToken = uuidv4()

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email.toLowerCase(),
        passwordHash,
        name: validatedData.name,
        phone: validatedData.phone,
        emailVerificationToken,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    // Send verification email
    try {
      await sendVerificationEmail(user.email, user.name || 'Kullanıcı', emailVerificationToken)
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError)
      // Don't fail registration if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Kayıt başarılı. Email adresinize doğrulama bağlantısı gönderildi.',
      user,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}
