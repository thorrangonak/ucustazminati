import { NextResponse } from 'next/server'
import { getSettings } from '@/lib/services/settings'

// GET - Get public analytics settings (no auth required)
export async function GET() {
  try {
    const settings = await getSettings([
      'GA_MEASUREMENT_ID',
      'GTM_ID',
      'FB_PIXEL_ID',
      'HOTJAR_ID',
    ])

    return NextResponse.json({
      gaId: settings.GA_MEASUREMENT_ID || null,
      gtmId: settings.GTM_ID || null,
      fbPixelId: settings.FB_PIXEL_ID || null,
      hotjarId: settings.HOTJAR_ID || null,
    })
  } catch (error) {
    console.error('Analytics settings error:', error)
    return NextResponse.json({
      gaId: null,
      gtmId: null,
      fbPixelId: null,
      hotjarId: null,
    })
  }
}
