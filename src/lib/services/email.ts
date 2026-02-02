import { Resend } from 'resend'
import { getSettingOrEnv } from '@/lib/services/settings'

// Lazy initialization of Resend client with dynamic API key
let resendClient: Resend | null = null
let lastApiKey: string | null = null

async function getResendClient(): Promise<Resend> {
  const apiKey = await getSettingOrEnv('RESEND_API_KEY')

  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured. Please set it in Admin Settings.')
  }

  // Reinitialize if API key changed
  if (!resendClient || lastApiKey !== apiKey) {
    resendClient = new Resend(apiKey)
    lastApiKey = apiKey
  }

  return resendClient
}

async function getFromEmail(): Promise<string> {
  const fromEmail = await getSettingOrEnv('EMAIL_FROM')
  return fromEmail || 'UçuşTazminat <noreply@ucustazminat.com>'
}

async function getBaseUrl(): Promise<string> {
  const siteUrl = await getSettingOrEnv('SITE_URL', 'NEXTAUTH_URL')
  return siteUrl || 'https://ucustazminat.com'
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  try {
    const resend = await getResendClient()
    const fromEmail = await getFromEmail()

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    })

    if (error) {
      console.error('Email send error:', error)
      throw new Error(error.message)
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Email service error:', error)
    throw error
  }
}

// Email Templates
export function getVerificationEmailTemplate(name: string, verificationUrl: string) {
  return {
    subject: 'E-posta Adresinizi Doğrulayın - UçuşTazminat',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>E-posta Doğrulama</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background-color: #0066FF;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">UçuşTazminat</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px;">Merhaba ${name},</h2>
        <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
          UçuşTazminat'a hoş geldiniz! Hesabınızı aktif hale getirmek için lütfen e-posta adresinizi doğrulayın.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0066FF; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            E-postamı Doğrula
          </a>
        </div>
        <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">
          Veya bu bağlantıyı tarayıcınıza kopyalayın:
        </p>
        <p style="margin: 0 0 20px; color: #0066FF; font-size: 14px; word-break: break-all;">
          ${verificationUrl}
        </p>
        <p style="margin: 0; color: #71717a; font-size: 14px;">
          Bu bağlantı 24 saat geçerlidir. Eğer bu hesabı siz oluşturmadıysanız, bu e-postayı görmezden gelebilirsiniz.
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; background-color: #f4f4f5; text-align: center;">
        <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">
          Bu e-posta UçuşTazminat tarafından gönderilmiştir.
        </p>
        <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
          © 2026 UçuşTazminat. Tüm hakları saklıdır.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }
}

export function getPasswordResetEmailTemplate(name: string, resetUrl: string) {
  return {
    subject: 'Şifre Sıfırlama Talebi - UçuşTazminat',
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Şifre Sıfırlama</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background-color: #0066FF;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">UçuşTazminat</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px;">Merhaba ${name},</h2>
        <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
          Hesabınız için şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 32px; background-color: #0066FF; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Şifremi Sıfırla
          </a>
        </div>
        <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">
          Veya bu bağlantıyı tarayıcınıza kopyalayın:
        </p>
        <p style="margin: 0 0 20px; color: #0066FF; font-size: 14px; word-break: break-all;">
          ${resetUrl}
        </p>
        <div style="padding: 15px; background-color: #fef3c7; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            Bu bağlantı 1 saat geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.
          </p>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; background-color: #f4f4f5; text-align: center;">
        <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">
          Bu e-posta UçuşTazminat tarafından gönderilmiştir.
        </p>
        <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
          © 2026 UçuşTazminat. Tüm hakları saklıdır.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }
}

export function getClaimSubmittedEmailTemplate(
  name: string,
  claimNumber: string,
  flightNumber: string,
  compensationAmount: number,
  baseUrl: string
) {
  return {
    subject: `Talebiniz Alındı - ${claimNumber} - UçuşTazminat`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Talep Onayı</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background-color: #0066FF;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">UçuşTazminat</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="display: inline-block; width: 60px; height: 60px; background-color: #dcfce7; border-radius: 50%; line-height: 60px;">
            <span style="font-size: 30px;">✓</span>
          </div>
        </div>
        <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px; text-align: center;">Talebiniz Başarıyla Alındı!</h2>
        <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
          Merhaba ${name}, tazminat talebiniz başarıyla oluşturuldu. Ekibimiz en kısa sürede talebinizi incelemeye başlayacak.
        </p>

        <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7;">
                <span style="color: #71717a; font-size: 14px;">Talep Numarası</span>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; text-align: right;">
                <strong style="color: #18181b; font-size: 14px;">${claimNumber}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7;">
                <span style="color: #71717a; font-size: 14px;">Uçuş Numarası</span>
              </td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e4e4e7; text-align: right;">
                <strong style="color: #18181b; font-size: 14px;">${flightNumber}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0;">
                <span style="color: #71717a; font-size: 14px;">Tahmini Tazminat</span>
              </td>
              <td style="padding: 10px 0; text-align: right;">
                <strong style="color: #16a34a; font-size: 18px;">€${compensationAmount}</strong>
              </td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/taleplerim" style="display: inline-block; padding: 14px 32px; background-color: #0066FF; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Talebimi Takip Et
          </a>
        </div>

        <h3 style="margin: 30px 0 15px; color: #18181b; font-size: 18px;">Sonraki Adımlar</h3>
        <ol style="margin: 0; padding-left: 20px; color: #52525b; font-size: 14px; line-height: 1.8;">
          <li>Talebiniz ekibimiz tarafından incelenecek</li>
          <li>Gerekli belgeler kontrol edilecek</li>
          <li>Havayolu şirketiyle iletişime geçilecek</li>
          <li>Tazminat tahsil edildiğinde size ödenecek</li>
        </ol>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; background-color: #f4f4f5; text-align: center;">
        <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">
          Sorularınız mı var? <a href="${baseUrl}/iletisim" style="color: #0066FF; text-decoration: none;">Bizimle iletişime geçin</a>
        </p>
        <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
          © 2026 UçuşTazminat. Tüm hakları saklıdır.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }
}

export function getClaimStatusUpdateEmailTemplate(
  name: string,
  claimNumber: string,
  oldStatus: string,
  newStatus: string,
  baseUrl: string,
  message?: string
) {
  const statusLabels: Record<string, string> = {
    SUBMITTED: 'Gönderildi',
    UNDER_REVIEW: 'İnceleniyor',
    DOCUMENTS_REQUIRED: 'Belge Bekleniyor',
    SENT_TO_AIRLINE: 'Havayoluna İletildi',
    AIRLINE_RESPONDED: 'Havayolu Yanıtladı',
    NEGOTIATING: 'Müzakere Ediliyor',
    LEGAL_ACTION: 'Hukuki Süreç',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    PAID: 'Ödendi',
    CLOSED: 'Kapatıldı',
  }

  const statusColors: Record<string, string> = {
    SUBMITTED: '#3b82f6',
    UNDER_REVIEW: '#f59e0b',
    DOCUMENTS_REQUIRED: '#ef4444',
    SENT_TO_AIRLINE: '#8b5cf6',
    AIRLINE_RESPONDED: '#06b6d4',
    NEGOTIATING: '#f97316',
    LEGAL_ACTION: '#dc2626',
    APPROVED: '#16a34a',
    REJECTED: '#dc2626',
    PAID: '#16a34a',
    CLOSED: '#6b7280',
  }

  return {
    subject: `Talep Durumu Güncellendi - ${claimNumber} - UçuşTazminat`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Talep Durumu Güncellendi</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <tr>
      <td style="padding: 40px 30px; text-align: center; background-color: #0066FF;">
        <h1 style="margin: 0; color: #ffffff; font-size: 28px;">UçuşTazminat</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 40px 30px;">
        <h2 style="margin: 0 0 20px; color: #18181b; font-size: 24px;">Merhaba ${name},</h2>
        <p style="margin: 0 0 20px; color: #52525b; font-size: 16px; line-height: 1.6;">
          <strong>${claimNumber}</strong> numaralı talebinizin durumu güncellendi.
        </p>

        <div style="background-color: #f4f4f5; border-radius: 8px; padding: 20px; margin-bottom: 20px; text-align: center;">
          <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">Durum Değişikliği</p>
          <div style="display: inline-block;">
            <span style="display: inline-block; padding: 8px 16px; background-color: #e4e4e7; border-radius: 6px; color: #52525b; font-size: 14px;">
              ${statusLabels[oldStatus] || oldStatus}
            </span>
            <span style="display: inline-block; margin: 0 10px; color: #71717a;">→</span>
            <span style="display: inline-block; padding: 8px 16px; background-color: ${statusColors[newStatus] || '#3b82f6'}; border-radius: 6px; color: #ffffff; font-size: 14px; font-weight: 600;">
              ${statusLabels[newStatus] || newStatus}
            </span>
          </div>
        </div>

        ${message ? `
        <div style="padding: 15px; background-color: #eff6ff; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 5px; color: #1e40af; font-size: 14px; font-weight: 600;">Mesaj:</p>
          <p style="margin: 0; color: #1e40af; font-size: 14px;">${message}</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/taleplerim" style="display: inline-block; padding: 14px 32px; background-color: #0066FF; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Talebimi Görüntüle
          </a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px; background-color: #f4f4f5; text-align: center;">
        <p style="margin: 0 0 10px; color: #71717a; font-size: 14px;">
          Sorularınız mı var? <a href="${baseUrl}/iletisim" style="color: #0066FF; text-decoration: none;">Bizimle iletişime geçin</a>
        </p>
        <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
          © 2026 UçuşTazminat. Tüm hakları saklıdır.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
  }
}

// Helper functions to send specific emails
export async function sendVerificationEmail(email: string, name: string, token: string) {
  const baseUrl = await getBaseUrl()
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`
  const template = getVerificationEmailTemplate(name, verificationUrl)
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  })
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const baseUrl = await getBaseUrl()
  const resetUrl = `${baseUrl}/sifremi-unuttum?token=${token}`
  const template = getPasswordResetEmailTemplate(name, resetUrl)
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  })
}

export async function sendClaimSubmittedEmail(
  email: string,
  name: string,
  claimNumber: string,
  flightNumber: string,
  compensationAmount: number
) {
  const baseUrl = await getBaseUrl()
  const template = getClaimSubmittedEmailTemplate(name, claimNumber, flightNumber, compensationAmount, baseUrl)
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  })
}

export async function sendClaimStatusUpdateEmail(
  email: string,
  name: string,
  claimNumber: string,
  oldStatus: string,
  newStatus: string,
  message?: string
) {
  const baseUrl = await getBaseUrl()
  const template = getClaimStatusUpdateEmailTemplate(name, claimNumber, oldStatus, newStatus, baseUrl, message)
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
  })
}
