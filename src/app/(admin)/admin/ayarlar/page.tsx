'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  RefreshCw,
  Save,
  Settings,
  Mail,
  BarChart3,
  Cloud,
  Globe,
  Share2,
  Search,
  CreditCard,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  Key,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SettingDefinition {
  key: string
  label: string
  description: string
  type: 'string' | 'number' | 'boolean' | 'json' | 'password'
  group: string
  defaultValue?: string
  required?: boolean
}

const GROUP_ICONS: Record<string, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  analytics: <BarChart3 className="h-4 w-4" />,
  storage: <Cloud className="h-4 w-4" />,
  general: <Settings className="h-4 w-4" />,
  social: <Share2 className="h-4 w-4" />,
  seo: <Search className="h-4 w-4" />,
  payment: <CreditCard className="h-4 w-4" />,
  api: <Key className="h-4 w-4" />,
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [definitions, setDefinitions] = useState<SettingDefinition[]>([])
  const [groupLabels, setGroupLabels] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('general')
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({})

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      if (!res.ok) throw new Error('Failed to fetch settings')
      const data = await res.json()
      setSettings(data.settings || {})
      setDefinitions(data.definitions || [])
      setGroupLabels(data.groupLabels || {})
    } catch (err) {
      setError('Ayarlar yüklenirken hata oluştu')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError(null)
      setSaved(false)

      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save settings')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)

      // Refresh to get updated masked values
      await fetchSettings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydetme hatası')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({ ...prev, [key]: !prev[key] }))
  }

  // Group definitions by group
  const groupedDefinitions = definitions.reduce((acc, def) => {
    if (!acc[def.group]) acc[def.group] = []
    acc[def.group].push(def)
    return acc
  }, {} as Record<string, SettingDefinition[]>)

  const groups = Object.keys(groupedDefinitions)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sistem Ayarları</h1>
          <p className="text-muted-foreground">
            API anahtarları, analitik ve diğer sistem ayarlarını yönetin
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <Check className="h-4 w-4" />
              Kaydedildi
            </div>
          )}
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {groups.map(group => (
            <TabsTrigger
              key={group}
              value={group}
              className="flex items-center gap-2"
            >
              {GROUP_ICONS[group]}
              <span className="hidden sm:inline">{groupLabels[group] || group}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {groups.map(group => (
          <TabsContent key={group} value={group} className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {GROUP_ICONS[group]}
                  {groupLabels[group] || group}
                </CardTitle>
                <CardDescription>
                  {group === 'email' && 'Email gönderimi için Resend API yapılandırması'}
                  {group === 'analytics' && 'Google Analytics, Tag Manager ve diğer takip araçları'}
                  {group === 'storage' && 'AWS S3 dosya depolama yapılandırması'}
                  {group === 'general' && 'Site adı, URL ve iletişim bilgileri'}
                  {group === 'social' && 'Sosyal medya profil linkleri'}
                  {group === 'seo' && 'Arama motoru optimizasyonu ayarları'}
                  {group === 'payment' && 'Ödeme ve banka bilgileri'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {groupedDefinitions[group]?.map((def, index) => (
                  <div key={def.key}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={def.key} className="text-sm font-medium">
                          {def.label}
                          {def.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        {def.type === 'password' && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => togglePasswordVisibility(def.key)}
                          >
                            {showPasswords[def.key] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {def.description}
                      </p>
                      {def.key === 'SEO_DESCRIPTION' ? (
                        <Textarea
                          id={def.key}
                          value={settings[def.key] || ''}
                          onChange={(e) => updateSetting(def.key, e.target.value)}
                          placeholder={def.defaultValue}
                          rows={3}
                        />
                      ) : (
                        <Input
                          id={def.key}
                          type={
                            def.type === 'password' && !showPasswords[def.key]
                              ? 'password'
                              : def.type === 'number'
                              ? 'number'
                              : 'text'
                          }
                          value={settings[def.key] || ''}
                          onChange={(e) => updateSetting(def.key, e.target.value)}
                          placeholder={def.defaultValue || `${def.label} girin...`}
                          className={cn(
                            def.type === 'password' && 'font-mono'
                          )}
                        />
                      )}
                      {def.defaultValue && !settings[def.key] && (
                        <p className="text-xs text-muted-foreground">
                          Varsayılan: {def.defaultValue}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Additional info cards */}
            {group === 'email' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Mail className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Resend Hakkında</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Resend, modern email gönderim servisidir. API anahtarı almak için{' '}
                        <a
                          href="https://resend.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline"
                        >
                          resend.com
                        </a>
                        {' '}adresini ziyaret edin.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {group === 'analytics' && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <BarChart3 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-900">KVKK/GDPR Uyumluluğu</p>
                      <p className="text-sm text-green-700 mt-1">
                        Analitik takip kodları, kullanıcı çerez onayı verdikten sonra aktif olur.
                        Varsayılan olarak takip devre dışıdır.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {group === 'storage' && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="pt-6">
                  <div className="flex gap-3">
                    <Cloud className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-orange-900">AWS S3 Kurulumu</p>
                      <p className="text-sm text-orange-700 mt-1">
                        S3 bucket oluştururken CORS ayarlarını yapılandırmayı unutmayın.
                        Presigned URL'ler için bucket public erişime kapalı olabilir.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={async () => {
              await fetch('/api/admin/settings', { method: 'DELETE' })
              await fetchSettings()
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Önbelleği Temizle
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'settings-backup.json'
              a.click()
            }}
          >
            <Save className="mr-2 h-4 w-4" />
            Ayarları Dışa Aktar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
