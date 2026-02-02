import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  getAllSettings,
  updateSettings,
  SETTING_DEFINITIONS,
  SETTING_GROUP_LABELS,
  clearSettingsCache,
} from '@/lib/services/settings'

// GET - Get all settings
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const settings = await getAllSettings()

    // Mask password fields for security
    const maskedSettings: Record<string, string | null> = {}
    for (const [key, value] of Object.entries(settings)) {
      const definition = SETTING_DEFINITIONS.find(d => d.key === key)
      if (definition?.type === 'password' && value) {
        // Show only last 4 characters for password fields
        maskedSettings[key] = value.length > 4
          ? '•'.repeat(value.length - 4) + value.slice(-4)
          : '•'.repeat(value.length)
      } else {
        maskedSettings[key] = value
      }
    }

    return NextResponse.json({
      settings: maskedSettings,
      definitions: SETTING_DEFINITIONS,
      groupLabels: SETTING_GROUP_LABELS,
    })
  } catch (error) {
    console.error('Admin settings get error:', error)
    return NextResponse.json(
      { error: 'Ayarlar yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// POST - Update settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json(
        { error: 'Geçersiz ayarlar formatı' },
        { status: 400 }
      )
    }

    // Filter out empty values and masked passwords (unchanged)
    const validSettings: Record<string, string> = {}
    for (const [key, value] of Object.entries(settings)) {
      if (typeof value === 'string' && value.trim() !== '') {
        // Skip if it's a masked password (contains bullet characters)
        if (value.includes('•')) {
          continue
        }
        validSettings[key] = value.trim()
      }
    }

    if (Object.keys(validSettings).length > 0) {
      await updateSettings(validSettings)
    }

    return NextResponse.json({
      success: true,
      message: 'Ayarlar başarıyla güncellendi',
    })
  } catch (error) {
    console.error('Admin settings update error:', error)
    return NextResponse.json(
      { error: 'Ayarlar güncellenirken hata oluştu' },
      { status: 500 }
    )
  }
}

// DELETE - Clear settings cache (for debugging/refresh)
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    clearSettingsCache()

    return NextResponse.json({
      success: true,
      message: 'Ayar önbelleği temizlendi',
    })
  } catch (error) {
    console.error('Admin settings cache clear error:', error)
    return NextResponse.json(
      { error: 'Önbellek temizlenirken hata oluştu' },
      { status: 500 }
    )
  }
}
