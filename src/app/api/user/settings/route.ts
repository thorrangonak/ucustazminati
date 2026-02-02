import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  phone: z.string().optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z.string().min(8, 'Yeni şifre en az 8 karakter olmalı'),
})

// GET - Get user settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        preferredLanguage: true,
        preferredCurrency: true,
        createdAt: true,
        emailVerified: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user settings error:', error)
    return NextResponse.json(
      { error: 'Ayarlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// PATCH - Update user settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'update_profile': {
        const validated = profileSchema.parse(body)
        const user = await prisma.user.update({
          where: { id: session.user.id },
          data: {
            name: validated.name,
            phone: validated.phone,
          },
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        })
        return NextResponse.json({ success: true, user })
      }

      case 'change_password': {
        const validated = passwordSchema.parse(body)

        // Get current user
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { passwordHash: true },
        })

        if (!user?.passwordHash) {
          return NextResponse.json(
            { error: 'Şifre değiştirme mümkün değil' },
            { status: 400 }
          )
        }

        // Verify current password
        const isValid = await bcrypt.compare(validated.currentPassword, user.passwordHash)
        if (!isValid) {
          return NextResponse.json(
            { error: 'Mevcut şifre yanlış' },
            { status: 400 }
          )
        }

        // Hash new password
        const newPasswordHash = await bcrypt.hash(validated.newPassword, 12)

        // Update password
        await prisma.user.update({
          where: { id: session.user.id },
          data: { passwordHash: newPasswordHash },
        })

        return NextResponse.json({ success: true, message: 'Şifre güncellendi' })
      }

      case 'update_preferences': {
        const { language, currency } = body
        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            preferredLanguage: language,
            preferredCurrency: currency,
          },
        })
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    console.error('Update user settings error:', error)
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Delete user account
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has active claims
    const activeClaims = await prisma.claim.count({
      where: {
        userId: session.user.id,
        status: {
          notIn: ['PAID', 'REJECTED', 'CLOSED'],
        },
      },
    })

    if (activeClaims > 0) {
      return NextResponse.json(
        { error: 'Aktif talepleriniz varken hesabınızı silemezsiniz' },
        { status: 400 }
      )
    }

    // Delete user (cascade will handle related records)
    await prisma.user.delete({
      where: { id: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: 'Hesap silinirken hata oluştu' },
      { status: 500 }
    )
  }
}
