import prisma from '@/lib/prisma'

// Cache for settings to avoid frequent database calls
let settingsCache: Map<string, string> | null = null
let cacheTimestamp: number = 0
const CACHE_TTL = 60 * 1000 // 1 minute cache

export type SettingGroup =
  | 'email'
  | 'analytics'
  | 'storage'
  | 'general'
  | 'social'
  | 'seo'
  | 'payment'
  | 'api'

export interface SettingDefinition {
  key: string
  label: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'json' | 'password'
  group: SettingGroup
  defaultValue?: string
  required?: boolean
}

// Define all available settings
export const SETTING_DEFINITIONS: SettingDefinition[] = [
  // Email Settings
  {
    key: 'RESEND_API_KEY',
    label: 'Resend API Key',
    description: 'Resend email servisi API anahtarı',
    type: 'password',
    group: 'email',
    required: true,
  },
  {
    key: 'EMAIL_FROM',
    label: 'Gönderen Email',
    description: 'Email gönderimlerinde kullanılacak adres (örn: UçuşTazminat <noreply@ucustazminat.com>)',
    type: 'string',
    group: 'email',
    defaultValue: 'UçuşTazminat <noreply@ucustazminat.com>',
  },
  {
    key: 'EMAIL_REPLY_TO',
    label: 'Yanıt Adresi',
    description: 'Yanıtların gönderileceği email adresi',
    type: 'string',
    group: 'email',
  },

  // Analytics Settings
  {
    key: 'GA_MEASUREMENT_ID',
    label: 'Google Analytics ID',
    description: 'Google Analytics 4 Measurement ID (örn: G-XXXXXXXXXX)',
    type: 'string',
    group: 'analytics',
  },
  {
    key: 'GTM_ID',
    label: 'Google Tag Manager ID',
    description: 'Google Tag Manager Container ID (örn: GTM-XXXXXXX)',
    type: 'string',
    group: 'analytics',
  },
  {
    key: 'FB_PIXEL_ID',
    label: 'Facebook Pixel ID',
    description: 'Facebook Pixel takip kodu',
    type: 'string',
    group: 'analytics',
  },
  {
    key: 'HOTJAR_ID',
    label: 'Hotjar Site ID',
    description: 'Hotjar analitik site ID',
    type: 'string',
    group: 'analytics',
  },

  // Storage Settings (AWS S3)
  {
    key: 'AWS_ACCESS_KEY_ID',
    label: 'AWS Access Key ID',
    description: 'AWS S3 erişim anahtarı',
    type: 'password',
    group: 'storage',
  },
  {
    key: 'AWS_SECRET_ACCESS_KEY',
    label: 'AWS Secret Access Key',
    description: 'AWS S3 gizli anahtar',
    type: 'password',
    group: 'storage',
  },
  {
    key: 'AWS_REGION',
    label: 'AWS Region',
    description: 'AWS bölgesi (örn: eu-central-1)',
    type: 'string',
    group: 'storage',
    defaultValue: 'eu-central-1',
  },
  {
    key: 'AWS_S3_BUCKET',
    label: 'S3 Bucket Adı',
    description: 'Dosyaların yükleneceği S3 bucket adı',
    type: 'string',
    group: 'storage',
  },

  // General Settings
  {
    key: 'SITE_NAME',
    label: 'Site Adı',
    description: 'Web sitesinin adı',
    type: 'string',
    group: 'general',
    defaultValue: 'UçuşTazminat',
  },
  {
    key: 'SITE_URL',
    label: 'Site URL',
    description: 'Web sitesinin tam URL adresi',
    type: 'string',
    group: 'general',
    defaultValue: 'https://ucustazminat.com',
  },
  {
    key: 'CONTACT_EMAIL',
    label: 'İletişim Email',
    description: 'İletişim formu için email adresi',
    type: 'string',
    group: 'general',
  },
  {
    key: 'CONTACT_PHONE',
    label: 'İletişim Telefon',
    description: 'İletişim telefon numarası',
    type: 'string',
    group: 'general',
  },
  {
    key: 'COMMISSION_RATE',
    label: 'Komisyon Oranı (%)',
    description: 'Başarılı tazminat taleplerinden alınacak komisyon oranı',
    type: 'number',
    group: 'general',
    defaultValue: '25',
  },

  // Social Media Settings
  {
    key: 'SOCIAL_FACEBOOK',
    label: 'Facebook URL',
    description: 'Facebook sayfa linki',
    type: 'string',
    group: 'social',
  },
  {
    key: 'SOCIAL_TWITTER',
    label: 'Twitter/X URL',
    description: 'Twitter/X profil linki',
    type: 'string',
    group: 'social',
  },
  {
    key: 'SOCIAL_INSTAGRAM',
    label: 'Instagram URL',
    description: 'Instagram profil linki',
    type: 'string',
    group: 'social',
  },
  {
    key: 'SOCIAL_LINKEDIN',
    label: 'LinkedIn URL',
    description: 'LinkedIn şirket sayfası linki',
    type: 'string',
    group: 'social',
  },

  // SEO Settings
  {
    key: 'SEO_TITLE',
    label: 'Varsayılan Sayfa Başlığı',
    description: 'Ana sayfa ve varsayılan SEO başlığı',
    type: 'string',
    group: 'seo',
    defaultValue: 'UçuşTazminat - Uçuş Gecikme ve İptal Tazminatı',
  },
  {
    key: 'SEO_DESCRIPTION',
    label: 'Varsayılan Meta Açıklama',
    description: 'Ana sayfa ve varsayılan meta description',
    type: 'string',
    group: 'seo',
    defaultValue: 'Uçuşunuz gecikti veya iptal mi edildi? 600€\'ya kadar tazminat alın. Başarı garantili, risk yok.',
  },
  {
    key: 'SEO_KEYWORDS',
    label: 'Anahtar Kelimeler',
    description: 'Virgülle ayrılmış anahtar kelimeler',
    type: 'string',
    group: 'seo',
  },

  // Payment Settings
  {
    key: 'PAYMENT_IBAN',
    label: 'Şirket IBAN',
    description: 'Ödemelerin yapılacağı IBAN numarası',
    type: 'string',
    group: 'payment',
  },
  {
    key: 'PAYMENT_BANK_NAME',
    label: 'Banka Adı',
    description: 'Şirket banka hesabı banka adı',
    type: 'string',
    group: 'payment',
  },
  {
    key: 'PAYMENT_ACCOUNT_HOLDER',
    label: 'Hesap Sahibi',
    description: 'Banka hesabı sahibi adı',
    type: 'string',
    group: 'payment',
  },

  // External API Settings
  {
    key: 'AVIATIONSTACK_API_KEY',
    label: 'AviationStack API Key',
    description: 'Uçuş bilgisi sorgulama için AviationStack API anahtarı',
    type: 'password',
    group: 'api',
  },
  {
    key: 'SCANBOT_LICENSE_KEY',
    label: 'Scanbot License Key',
    description: 'Barkod tarama için Scanbot SDK lisans anahtarı',
    type: 'password',
    group: 'api',
  },
]

// Group labels for UI
export const SETTING_GROUP_LABELS: Record<SettingGroup, string> = {
  email: 'Email Ayarları',
  analytics: 'Analitik & Takip',
  storage: 'Dosya Depolama (AWS S3)',
  general: 'Genel Ayarlar',
  social: 'Sosyal Medya',
  seo: 'SEO Ayarları',
  payment: 'Ödeme Ayarları',
  api: 'Harici API Anahtarları',
}

// Clear the cache
export function clearSettingsCache() {
  settingsCache = null
  cacheTimestamp = 0
}

// Load all settings from database
async function loadSettings(): Promise<Map<string, string>> {
  const now = Date.now()

  // Return cached settings if still valid
  if (settingsCache && (now - cacheTimestamp) < CACHE_TTL) {
    return settingsCache
  }

  try {
    const settings = await prisma.setting.findMany()
    const settingsMap = new Map<string, string>()

    // First, set default values
    for (const def of SETTING_DEFINITIONS) {
      if (def.defaultValue) {
        settingsMap.set(def.key, def.defaultValue)
      }
    }

    // Then override with database values
    for (const setting of settings) {
      settingsMap.set(setting.key, setting.value)
    }

    settingsCache = settingsMap
    cacheTimestamp = now

    return settingsMap
  } catch (error) {
    console.error('Failed to load settings:', error)
    // Return defaults on error
    const defaultMap = new Map<string, string>()
    for (const def of SETTING_DEFINITIONS) {
      if (def.defaultValue) {
        defaultMap.set(def.key, def.defaultValue)
      }
    }
    return defaultMap
  }
}

// Get a single setting value
export async function getSetting(key: string): Promise<string | null> {
  const settings = await loadSettings()
  return settings.get(key) || null
}

// Get multiple settings at once
export async function getSettings(keys: string[]): Promise<Record<string, string | null>> {
  const settings = await loadSettings()
  const result: Record<string, string | null> = {}

  for (const key of keys) {
    result[key] = settings.get(key) || null
  }

  return result
}

// Get all settings for a group
export async function getSettingsByGroup(group: SettingGroup): Promise<Record<string, string | null>> {
  const settings = await loadSettings()
  const groupKeys = SETTING_DEFINITIONS
    .filter(def => def.group === group)
    .map(def => def.key)

  const result: Record<string, string | null> = {}
  for (const key of groupKeys) {
    result[key] = settings.get(key) || null
  }

  return result
}

// Get all settings
export async function getAllSettings(): Promise<Record<string, string | null>> {
  const settings = await loadSettings()
  const result: Record<string, string | null> = {}

  for (const def of SETTING_DEFINITIONS) {
    result[def.key] = settings.get(def.key) || null
  }

  return result
}

// Update a single setting
export async function updateSetting(key: string, value: string): Promise<void> {
  const definition = SETTING_DEFINITIONS.find(d => d.key === key)

  await prisma.setting.upsert({
    where: { key },
    update: { value, updatedAt: new Date() },
    create: {
      key,
      value,
      type: definition?.type || 'string',
      group: definition?.group || 'general',
    },
  })

  // Clear cache after update
  clearSettingsCache()
}

// Update multiple settings at once
export async function updateSettings(settings: Record<string, string>): Promise<void> {
  const operations = Object.entries(settings).map(([key, value]) => {
    const definition = SETTING_DEFINITIONS.find(d => d.key === key)

    return prisma.setting.upsert({
      where: { key },
      update: { value, updatedAt: new Date() },
      create: {
        key,
        value,
        type: definition?.type || 'string',
        group: definition?.group || 'general',
      },
    })
  })

  await prisma.$transaction(operations)

  // Clear cache after update
  clearSettingsCache()
}

// Delete a setting
export async function deleteSetting(key: string): Promise<void> {
  await prisma.setting.delete({ where: { key } }).catch(() => {})
  clearSettingsCache()
}

// Helper function to get setting with fallback to env variable
export async function getSettingOrEnv(key: string, envKey?: string): Promise<string | null> {
  const dbValue = await getSetting(key)
  if (dbValue) return dbValue

  // Fallback to environment variable
  const envValue = process.env[envKey || key]
  return envValue || null
}
